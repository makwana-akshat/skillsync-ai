import os
import tempfile
from reportlab.lib.pagesizes import letter
from reportlab.pdfgen import canvas

def generate_pdf(data: dict) -> str:
    """
    Generate a PDF report including Match Score, Matched Skills, Missing Skills, and Explanation.
    Returns the file path to the generated PDF.
    """
    fd, temp_path = tempfile.mkstemp(suffix=".pdf")
    os.close(fd)
    
    c = canvas.Canvas(temp_path, pagesize=letter)
    width, height = letter
    
    c.setFont("Helvetica-Bold", 16)
    c.drawString(50, height - 50, "Resume Evaluation Report")
    
    c.setFont("Helvetica", 12)
    y_position = height - 100
    
    # Match Score
    c.drawString(50, y_position, f"Match Score: {data.get('score', 0)}%")
    y_position -= 30
    
    # Matched Required Skills
    c.setFont("Helvetica-Bold", 12)
    c.drawString(50, y_position, "Matched Required Skills:")
    c.setFont("Helvetica", 12)
    y_position -= 20
    matched_req = data.get("matched_required", [])
    if matched_req:
        for skill in matched_req:
            text = f"- {skill.get('name', 'N/A')} (Level: {skill.get('resume_level', 'N/A')})"
            c.drawString(70, y_position, text)
            y_position -= 20
    else:
        c.drawString(70, y_position, "- None")
        y_position -= 20
        
    y_position -= 10
    
    # Matched Optional Skills
    c.setFont("Helvetica-Bold", 12)
    c.drawString(50, y_position, "Matched Optional Skills:")
    c.setFont("Helvetica", 12)
    y_position -= 20
    matched_opt = data.get("matched_optional", [])
    if matched_opt:
        for skill in matched_opt:
            text = f"- {skill.get('name', 'N/A')} (Level: {skill.get('resume_level', 'N/A')})"
            c.drawString(70, y_position, text)
            y_position -= 20
    else:
        c.drawString(70, y_position, "- None")
        y_position -= 20
        
    y_position -= 10
    
    # Missing Required Skills (STRONGLY HIGHLIGHTED)
    c.setFont("Helvetica-Bold", 14)
    c.setFillColorRGB(0.9, 0.1, 0.1) # Red color for highlighting
    c.drawString(50, y_position, "MISSING REQUIRED SKILLS (CRITICAL):")
    c.setFont("Helvetica-Bold", 12)
    y_position -= 20
    missing_req = data.get("missing_required", [])
    if missing_req:
        for skill in missing_req:
            c.drawString(70, y_position, f"- {skill}")
            y_position -= 20
    else:
        c.drawString(70, y_position, "- None (Great!)")
        y_position -= 20
        
    c.setFillColorRGB(0, 0, 0) # Reset color
    y_position -= 10
    
    # Missing Optional Skills
    c.setFont("Helvetica-Bold", 12)
    c.drawString(50, y_position, "Missing Optional Skills:")
    c.setFont("Helvetica", 12)
    y_position -= 20
    missing_opt = data.get("missing_optional", [])
    if missing_opt:
        for skill in missing_opt:
            c.drawString(70, y_position, f"- {skill}")
            y_position -= 20
    else:
        c.drawString(70, y_position, "- None")
        y_position -= 20
        
    y_position -= 10
    
    # Explanation
    c.setFont("Helvetica-Bold", 12)
    c.drawString(50, y_position, "Explanation:")
    c.setFont("Helvetica", 12)
    y_position -= 20
    explanation = data.get("explanation", "No explanation available.")
    
    # Simple word wrap for explanation
    words = explanation.split()
    line = ""
    for word in words:
        if c.stringWidth(line + " " + word, "Helvetica", 12) < width - 120:
            line += " " + word if line else word
        else:
            c.drawString(70, y_position, line)
            y_position -= 20
            line = word
    if line:
        c.drawString(70, y_position, line)
        
    c.save()
    return temp_path
