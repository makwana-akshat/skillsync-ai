import pytest
import sys
import os
from unittest.mock import patch, MagicMock

sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))

from parser import parse_resume

@pytest.fixture
def mock_extract_skills():
    with patch("parser.extract_skills_from_text") as mock:
        mock.return_value = [{"name": "Python", "level": "Advanced"}]
        yield mock

def test_parse_single_column_pdf(mock_extract_skills):
    """Test PDF extraction when there is only a single column."""
    with patch("pdfplumber.open") as mock_open:
        mock_pdf = MagicMock()
        mock_page = MagicMock()
        mock_page.width = 100
        mock_page.height = 100
        
        # Words are only on the left side (< 50)
        mock_page.extract_words.return_value = [{"x0": 10}, {"x0": 20}]
        mock_page.extract_text.return_value = "Skill: Python"
        mock_page.extract_tables.return_value = []
        
        mock_pdf.pages = [mock_page]
        mock_open.return_value.__enter__.return_value = mock_pdf
        
        result = parse_resume(b"dummy pdf content", "resume.pdf")
        
        assert "raw_text" in result
        assert "Skill: Python" in result["raw_text"]

def test_parse_two_column_pdf(mock_extract_skills):
    """Test PDF extraction when columns are detected (left and right text)."""
    with patch("pdfplumber.open") as mock_open:
        mock_pdf = MagicMock()
        mock_page = MagicMock()
        mock_page.width = 100
        mock_page.height = 100
        
        # Words on left (10) and right (60)
        mock_page.extract_words.return_value = [{"x0": 10}, {"x0": 60}]
        
        # Mock crop.extract_text
        mock_crop_left = MagicMock()
        mock_crop_left.extract_text.return_value = "Left column content"
        mock_crop_right = MagicMock()
        mock_crop_right.extract_text.return_value = "Right column content"
        
        mock_page.crop.side_effect = [mock_crop_left, mock_crop_right]
        mock_page.extract_tables.return_value = []
        
        mock_pdf.pages = [mock_page]
        mock_open.return_value.__enter__.return_value = mock_pdf
        
        result = parse_resume(b"dummy two column", "resume.pdf")
        
        assert "Left column content" in result["raw_text"]
        assert "Right column content" in result["raw_text"]
        assert mock_page.crop.call_count == 2

def test_parse_scanned_image_pdf(mock_extract_skills):
    """Test OCR fallback is used if no text is extracted initially."""
    with patch("pdfplumber.open") as mock_open:
        mock_pdf = MagicMock()
        mock_page = MagicMock()
        
        # No text found normally
        mock_page.extract_words.return_value = []
        mock_page.extract_text.return_value = ""
        mock_page.extract_tables.return_value = []
        
        mock_pdf.pages = [mock_page]
        mock_open.return_value.__enter__.return_value = mock_pdf
        
        # Patch OCR modules in parser
        with patch("parser.convert_from_path") as mock_convert, \
             patch("parser.pytesseract") as mock_tesseract:
            
            # Ensure OCR is considered "available"
            mock_convert.return_value = ["img1"]
            mock_tesseract.image_to_string.return_value = "OCR Text Result"
            
            result = parse_resume(b"dummy scanned", "scan.pdf")
            
            assert "OCR Text Result" in result["raw_text"]
