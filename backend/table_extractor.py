"""
table_extractor.py — Fast PDF table-extraction assistant module.

Pipeline (executed in order):
  1. Vector/text-based extraction via pdfplumber (and optionally camelot).
  2. OCR fallback for image-only pages using PyMuPDF render → OpenCV grid
     detection → pytesseract per-cell OCR.

Returns a single JSON-compatible dict conforming to the output schema.
"""

import hashlib
import io
import json
import os
import tempfile
import time
from concurrent.futures import ThreadPoolExecutor
from typing import Any, Dict, List, Optional

import pdfplumber

# ---------------------------------------------------------------------------
# Optional dependency imports — gracefully degrade if missing
# ---------------------------------------------------------------------------
_MISSING: List[str] = []

try:
    import fitz  # PyMuPDF
except ImportError:
    fitz = None
    _MISSING.append("PyMuPDF (fitz)")

try:
    import cv2
    import numpy as np
except ImportError:
    cv2 = None
    np = None
    _MISSING.append("opencv-python (cv2)")

try:
    import pytesseract
    from PIL import Image
except ImportError:
    pytesseract = None
    Image = None
    _MISSING.append("pytesseract / Pillow")

try:
    import camelot
except ImportError:
    camelot = None
    # Only note if user explicitly requested it (handled in pipeline)


# ---------------------------------------------------------------------------
# Helpers
# ---------------------------------------------------------------------------

def _md5(data: bytes) -> str:
    return hashlib.md5(data).hexdigest()


def _clean_cell(text: str, from_ocr: bool = False) -> str:
    """Normalize a single cell string."""
    if text is None:
        return ""
    text = str(text)
    # Normalize newlines inside cell to single spaces
    text = text.replace("\r\n", " ").replace("\r", " ").replace("\n", " ")
    if from_ocr:
        text = text.strip()
    else:
        text = text.strip()
    return text


def _clean_rows(rows: List[List[Any]], from_ocr: bool = False) -> List[List[str]]:
    """Clean a 2D list of cell values."""
    cleaned = []
    for row in rows:
        cleaned.append([_clean_cell(cell, from_ocr=from_ocr) for cell in row])
    return cleaned


def _page_has_selectable_text(page) -> bool:
    """Check if a pdfplumber page has selectable text content."""
    text = page.extract_text() or ""
    # Consider page as having text if it has ≥ 30 non-whitespace chars
    return len(text.strip()) >= 30


# ---------------------------------------------------------------------------
# OpenCV grid-based table detector
# ---------------------------------------------------------------------------

def _detect_table_cells_opencv(gray_image) -> List[List[int]]:
    """
    Detect table cell bounding boxes from a grayscale image using
    morphological line detection.

    Returns list of [x, y, w, h] bounding boxes sorted top-to-bottom,
    left-to-right.
    """
    if cv2 is None or np is None:
        return []

    # Thresholding
    _, binary = cv2.threshold(gray_image, 200, 255, cv2.THRESH_BINARY_INV)

    img_h, img_w = binary.shape

    # Horizontal lines kernel
    h_kernel_len = max(img_w // 30, 10)
    h_kernel = cv2.getStructuringElement(cv2.MORPH_RECT, (h_kernel_len, 1))
    h_lines = cv2.morphologyEx(binary, cv2.MORPH_OPEN, h_kernel, iterations=2)

    # Vertical lines kernel
    v_kernel_len = max(img_h // 30, 10)
    v_kernel = cv2.getStructuringElement(cv2.MORPH_RECT, (1, v_kernel_len))
    v_lines = cv2.morphologyEx(binary, cv2.MORPH_OPEN, v_kernel, iterations=2)

    # Combine
    grid = cv2.add(h_lines, v_lines)

    # Find contours
    contours, _ = cv2.findContours(grid, cv2.RETR_TREE, cv2.CHAIN_APPROX_SIMPLE)

    # Filter contours — keep boxes that look like cells (area > threshold)
    min_area = (img_w * img_h) * 0.0005  # at least 0.05% of page area
    max_area = (img_w * img_h) * 0.95
    boxes = []
    for cnt in contours:
        x, y, w, h = cv2.boundingRect(cnt)
        area = w * h
        if min_area < area < max_area and w > 10 and h > 10:
            boxes.append([x, y, w, h])

    # Sort: top-to-bottom then left-to-right
    boxes.sort(key=lambda b: (b[1], b[0]))
    return boxes


def _group_boxes_into_rows(boxes: List[List[int]], y_tolerance: int = 10) -> List[List[List[int]]]:
    """Group cell bounding boxes into rows by similar y-coordinate."""
    if not boxes:
        return []

    rows: List[List[List[int]]] = []
    current_row: List[List[int]] = [boxes[0]]
    current_y = boxes[0][1]

    for box in boxes[1:]:
        if abs(box[1] - current_y) <= y_tolerance:
            current_row.append(box)
        else:
            # Sort current row left-to-right
            current_row.sort(key=lambda b: b[0])
            rows.append(current_row)
            current_row = [box]
            current_y = box[1]

    # Don't forget last row
    current_row.sort(key=lambda b: b[0])
    rows.append(current_row)
    return rows


# ---------------------------------------------------------------------------
# OCR helpers
# ---------------------------------------------------------------------------

def _ocr_cell(pil_image, box: List[int], psm: int = 6) -> str:
    """OCR a single cell crop from a PIL image."""
    if pytesseract is None or Image is None:
        return ""
    x, y, w, h = box
    crop = pil_image.crop((x, y, x + w, y + h))
    config = f"--oem 1 --psm {psm}"
    try:
        text = pytesseract.image_to_string(crop, config=config)
    except Exception:
        text = ""
    return _clean_cell(text, from_ocr=True)


def _ocr_cells_parallel(pil_image, boxes: List[List[int]], workers: int = 4) -> List[str]:
    """OCR all cell boxes in parallel."""
    results = [""] * len(boxes)
    with ThreadPoolExecutor(max_workers=workers) as pool:
        futures = {}
        for idx, box in enumerate(boxes):
            # Use PSM 7 for very small cells (likely single word)
            psm = 7 if (box[2] < 120 and box[3] < 40) else 6
            futures[pool.submit(_ocr_cell, pil_image, box, psm)] = idx
        for future in futures:
            idx = futures[future]
            try:
                results[idx] = future.result()
            except Exception:
                results[idx] = ""
    return results


# ---------------------------------------------------------------------------
# Main extraction pipeline
# ---------------------------------------------------------------------------

def extract_tables(
    input_type: str = "path",
    input_value: str = "",
    options: Optional[Dict[str, Any]] = None,
) -> Dict[str, Any]:
    """
    Run the full table extraction pipeline on a PDF.

    Parameters
    ----------
    input_type : str
        "path" for a filesystem path, "bytes_base64" for base64-encoded bytes.
    input_value : str
        The path or base64 string.
    options : dict, optional
        {
            "use_camelot": bool (default False),
            "render_dpi": int (default 120),
            "ocr_workers": int (default 4),
            "camelot_flavor": "lattice" | "stream" (default "lattice"),
        }

    Returns
    -------
    dict  — conforming to the output JSON schema.
    """
    start_time = time.time()
    opts = options or {}
    use_camelot_flag = opts.get("use_camelot", False)
    render_dpi = opts.get("render_dpi", 120)
    ocr_workers = opts.get("ocr_workers", 4)
    camelot_flavor = opts.get("camelot_flavor", "lattice")

    # ------------------------------------------------------------------
    # 1. Resolve PDF bytes
    # ------------------------------------------------------------------
    temp_path: Optional[str] = None
    if input_type == "bytes_base64":
        import base64
        pdf_bytes = base64.b64decode(input_value)
        tmp = tempfile.NamedTemporaryFile(suffix=".pdf", delete=False)
        tmp.write(pdf_bytes)
        tmp.flush()
        temp_path = tmp.name
        tmp.close()
        pdf_path = temp_path
    elif input_type == "path":
        pdf_path = input_value
        with open(pdf_path, "rb") as f:
            pdf_bytes = f.read()
    else:
        return {"error": f"Unknown input_type: {input_type}"}

    pdf_hash = _md5(pdf_bytes)

    tables_out: List[Dict[str, Any]] = []
    ocr_pages: List[int] = []
    vector_pages: List[int] = []
    num_pages = 0

    missing_deps = list(_MISSING)
    if use_camelot_flag and camelot is None:
        missing_deps.append("camelot-py")

    try:
        # ------------------------------------------------------------------
        # 2. pdfplumber pass (vector/text tables)
        # ------------------------------------------------------------------
        with pdfplumber.open(pdf_path) as pdf:
            num_pages = len(pdf.pages)
            pages_with_vector_tables = set()
            pages_needing_ocr: List[int] = []

            for page_idx, page in enumerate(pdf.pages):
                raw_tables = page.extract_tables() or []
                has_text = _page_has_selectable_text(page)

                if raw_tables:
                    pages_with_vector_tables.add(page_idx)
                    vector_pages.append(page_idx)
                    for tbl in raw_tables:
                        cleaned = _clean_rows(tbl, from_ocr=False)
                        # Skip completely empty tables
                        if any(any(cell for cell in row) for row in cleaned):
                            tables_out.append({
                                "page": page_idx,
                                "method": "pdfplumber",
                                "rows": cleaned,
                                "notes": "",
                            })
                elif not has_text:
                    # Image-only page — candidate for OCR
                    pages_needing_ocr.append(page_idx)
                # else: page has text but no tables → skip (vector-first rule)

        # ------------------------------------------------------------------
        # 2b. Optional camelot pass
        # ------------------------------------------------------------------
        if use_camelot_flag and camelot is not None:
            try:
                cam_tables = camelot.read_pdf(
                    pdf_path,
                    flavor=camelot_flavor,
                    pages="all",
                )
                for cam_tbl in cam_tables:
                    page_idx = cam_tbl.page - 1  # camelot is 1-based
                    if page_idx in pages_with_vector_tables:
                        continue  # already extracted by pdfplumber
                    df = cam_tbl.df
                    rows = df.values.tolist()
                    cleaned = _clean_rows(rows, from_ocr=False)
                    if any(any(cell for cell in row) for row in cleaned):
                        vector_pages.append(page_idx)
                        tables_out.append({
                            "page": page_idx,
                            "method": "camelot",
                            "rows": cleaned,
                            "notes": f"flavor={camelot_flavor}",
                        })
            except Exception as e:
                # Camelot can be finicky — don't fail the whole pipeline
                pass

        # ------------------------------------------------------------------
        # 3-4. OCR fallback for image-only pages
        # ------------------------------------------------------------------
        if pages_needing_ocr and fitz is not None and cv2 is not None and pytesseract is not None:
            doc = fitz.open(pdf_path)
            for page_idx in pages_needing_ocr:
                fitz_page = doc[page_idx]

                # Adaptive DPI: reduce for oversized pages
                rect = fitz_page.rect
                page_area = rect.width * rect.height
                effective_dpi = render_dpi
                if page_area > 1_000_000:  # very large page
                    effective_dpi = max(72, int(render_dpi * (1_000_000 / page_area) ** 0.5))

                zoom = effective_dpi / 72.0
                mat = fitz.Matrix(zoom, zoom)
                pix = fitz_page.get_pixmap(matrix=mat)
                img_bytes = pix.tobytes("png")
                pil_img = Image.open(io.BytesIO(img_bytes)).convert("RGB")

                # Convert to grayscale for OpenCV
                gray = cv2.cvtColor(np.array(pil_img), cv2.COLOR_RGB2GRAY)
                boxes = _detect_table_cells_opencv(gray)

                if not boxes:
                    # No grid detected — try full-page OCR as a single "table"
                    full_text = pytesseract.image_to_string(pil_img, config="--oem 1 --psm 6").strip()
                    if full_text:
                        # Return as single-cell table
                        tables_out.append({
                            "page": page_idx,
                            "method": "ocr",
                            "rows": [[_clean_cell(full_text, from_ocr=True)]],
                            "notes": "no grid detected; full-page OCR",
                        })
                        ocr_pages.append(page_idx)
                    continue

                # OCR each cell in parallel
                cell_texts = _ocr_cells_parallel(pil_img, boxes, workers=ocr_workers)

                # Group into rows
                grouped_rows = _group_boxes_into_rows(boxes, y_tolerance=max(10, gray.shape[0] // 80))
                row_data: List[List[str]] = []
                text_idx = 0
                box_to_text = {tuple(b): t for b, t in zip(boxes, cell_texts)}

                for row_boxes in grouped_rows:
                    row = [box_to_text.get(tuple(b), "") for b in row_boxes]
                    row_data.append(row)

                if any(any(cell for cell in row) for row in row_data):
                    # Compute overall bounding box
                    all_x = [b[0] for b in boxes]
                    all_y = [b[1] for b in boxes]
                    all_xw = [b[0] + b[2] for b in boxes]
                    all_yh = [b[1] + b[3] for b in boxes]
                    bbox = [min(all_x), min(all_y), max(all_xw) - min(all_x), max(all_yh) - min(all_y)]

                    tables_out.append({
                        "page": page_idx,
                        "method": "ocr",
                        "rows": row_data,
                        "bbox": bbox,
                        "notes": "",
                    })
                    ocr_pages.append(page_idx)

            doc.close()

        elif pages_needing_ocr:
            # Some pages need OCR but required deps are missing
            pass

        # ------------------------------------------------------------------
        # 5. Deduplicate adjacent identical tables
        # ------------------------------------------------------------------
        if len(tables_out) > 1:
            deduped = [tables_out[0]]
            for tbl in tables_out[1:]:
                prev = deduped[-1]
                if (
                    tbl["rows"] == prev["rows"]
                    and abs(tbl["page"] - prev["page"]) <= 1
                ):
                    prev["notes"] = (prev.get("notes", "") + " merged with adjacent duplicate").strip()
                else:
                    deduped.append(tbl)
            tables_out = deduped

        # ------------------------------------------------------------------
        # Sort tables by page number
        # ------------------------------------------------------------------
        tables_out.sort(key=lambda t: t["page"])

    finally:
        # Clean up temp file
        if temp_path and os.path.exists(temp_path):
            try:
                os.remove(temp_path)
            except OSError:
                pass

    elapsed = round(time.time() - start_time, 3)

    result: Dict[str, Any] = {
        "pdf_hash": pdf_hash,
        "tables": tables_out,
        "stats": {
            "num_pages": num_pages,
            "num_tables": len(tables_out),
            "ocr_pages": sorted(set(ocr_pages)),
            "vector_pages": sorted(set(vector_pages)),
            "elapsed_seconds": elapsed,
        },
    }

    if missing_deps:
        result["stats"]["notes_missing"] = missing_deps

    return result


# ---------------------------------------------------------------------------
# Convenience: extract from raw bytes (used by parser.py integration)
# ---------------------------------------------------------------------------

def extract_tables_from_bytes(pdf_bytes: bytes, options: Optional[Dict] = None) -> Dict[str, Any]:
    """
    Convenience wrapper: accept raw PDF bytes, write to temp file, run pipeline.
    """
    tmp = tempfile.NamedTemporaryFile(suffix=".pdf", delete=False)
    tmp.write(pdf_bytes)
    tmp.flush()
    tmp_path = tmp.name
    tmp.close()
    try:
        return extract_tables(input_type="path", input_value=tmp_path, options=options)
    finally:
        if os.path.exists(tmp_path):
            try:
                os.remove(tmp_path)
            except OSError:
                pass


# ---------------------------------------------------------------------------
# CLI entry point for standalone testing
# ---------------------------------------------------------------------------

if __name__ == "__main__":
    import sys

    if len(sys.argv) < 2:
        print("Usage: python table_extractor.py <path_to_pdf> [options_json]")
        sys.exit(1)

    pdf_path = sys.argv[1]
    cli_options = json.loads(sys.argv[2]) if len(sys.argv) > 2 else {}

    result = extract_tables(input_type="path", input_value=pdf_path, options=cli_options)
    print(json.dumps(result, indent=2, ensure_ascii=False))
