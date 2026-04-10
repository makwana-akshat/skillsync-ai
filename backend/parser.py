import pdfplumber
import docx
import tempfile
import os
import json
import io
import hashlib
from openai import OpenAI
from dotenv import load_dotenv

load_dotenv()

# Global cache for resume parsing (keys: hash of text, values: dict of structured data)
PARSE_CACHE = {}

def extract_text_from_pdf(file_bytes: bytes) -> str:
    """Extract text from PDF using pdfplumber."""
    text = ""
    with tempfile.NamedTemporaryFile(suffix=".pdf", delete=False) as temp_pdf:
        temp_pdf.write(file_bytes)
        temp_path = temp_pdf.name
    
    try:
        with pdfplumber.open(temp_path) as pdf:
            for page in pdf.pages:
                page_text = page.extract_text()
                if page_text:
                    text += page_text + "\n"
    finally:
        if os.path.exists(temp_path):
            os.remove(temp_path)
    return text

def extract_text_from_docx(file_bytes: bytes) -> str:
    """Extract text from DOCX using python-docx."""
    doc = docx.Document(io.BytesIO(file_bytes))
    return "\n".join([para.text for para in doc.paragraphs])
    
def extract_text_from_txt(file_bytes: bytes) -> str:
    """Extract text from plain text file."""
    try:
        return file_bytes.decode("utf-8")
    except UnicodeDecodeError:
        return file_bytes.decode("latin-1")

def extract_structured_data(text: str) -> dict:
    """
    Use Groq LLM to extract structured resume data.
    """
    if not text.strip():
        return {}

    text_hash = hashlib.md5(text.strip().encode()).hexdigest()
    if text_hash in PARSE_CACHE:
        return PARSE_CACHE[text_hash]

    api_key = os.environ.get("GROQ_API_KEY")
    if not api_key:
        raise ValueError("GROQ_API_KEY is not set. Please check your .env file.")

    client = OpenAI(
        api_key=api_key,
        base_url="https://api.groq.com/openai/v1",
    )

    prompt = f"""you are a resume parsing assistant. I will provide raw resume text delimited below. Extract structured information and return ONLY one valid JSON object (no prose, no markdown, no explanations). If any field is not present, return an empty string or an empty array for that field. Do NOT invent or guess facts; if you are unsure, leave the field empty.

Output JSON schema (must match exactly): {{ "personal_info": {{ "name": "", "email": "", "phone": "", "location": "", "linkedin": "", "other": "" }}, "experience": [ {{ "role": "", "company": "", "start_date": "", "end_date": "", "location": "", "description": "", "bullets": [] }} ], "education": [ {{ "degree": "", "institution": "", "start_date": "", "end_date": "", "details": "" }} ], "skills": [ {{ "name": "", "canonical": "", "level": "", "source_context": "", "confidence": 0.0 }} ], "certifications": [ {{ "name": "", "issuer": "", "date": "" }} ], "projects": [ {{ "name": "", "description": "", "tech": [], "link": "" }} ], "publications": [ {{ "title": "", "venue": "", "year": "", "link": "" }} ], "raw_text_excerpt": "" }}

Normalization mapping (use these canonical forms; if a skill is not listed, set canonical to lowercase of the name):

ml -> machine learning
react.js, reactjs -> react
js -> javascript
py -> python
nodejs -> node.js`
mongodb -> mongo db
expressjs -> express.js
aws -> amazon web services
gcp -> google cloud platform
k8s -> kubernetes

Proficiency heuristics (use to choose level):
Advanced: explicit phrases like "expert", "senior", "lead", "5+ years", "years of experience", "built production", "architected".
Beginner: "familiar with", "exposure to", "learning", "introductory".
Intermediate: default if context is unclear.

Layout & table handling rules:
If the text appears to be from a multi-column layout, reorder content by grouping lines under headings and output sections in logical order.
If you detect table-like lines, treat each table cell in the skills column as a separate skill. If neighboring columns look like levels or years, include them in source_context or confidence hints.

Safety & hallucinaton rules:
Do not invent companies, dates, or publications.
Provide short source_context snippets (10-40 words) exactly as they appear in the resume.
Provide a confidence score between 0.0 and 1.0 for each skill. If you are unsure, use 0.6.

Text:
{text[:4000]}
"""

    try:
        response = client.chat.completions.create(
            model="llama-3.1-8b-instant",
            messages=[{"role": "user", "content": prompt}],
            temperature=0,
        )

        content = response.choices[0].message.content.strip()

        # 🔥 SAFE JSON PARSE
        try:
            data = json.loads(content)
        except:
            import re
            json_match = re.search(r"\{.*\}", content, re.DOTALL)
            if json_match:
                data = json.loads(json_match.group())
            else:
                data = {}

        # Default structure fallback
        default_data = {
            "personal_info": {}, "experience": [], "education": [], 
            "skills": [], "certifications": [], "projects": [], 
            "publications": [], "raw_text_excerpt": text[:2000]
        }
        
        if isinstance(data, dict):
            default_data.update(data)

        raw_skills = default_data.get("skills", [])
        
        # Structure cleaning logic
        processed_skills = []
        seen_names = set()
        for item in raw_skills:
            if isinstance(item, dict) and "name" in item:
                name = str(item["name"]).strip()
                level = str(item.get("level", "Intermediate")).strip().capitalize()
                if level not in ["Beginner", "Intermediate", "Advanced"]:
                    level = "Intermediate"
                
                if name.lower() not in seen_names:
                    item["level"] = level
                    processed_skills.append(item)
                    seen_names.add(name.lower())
            elif isinstance(item, str):
                # Fallback for simple strings
                name = item.strip()
                if name.lower() not in seen_names:
                    processed_skills.append({"name": name, "level": "Intermediate", "canonical": name.lower(), "source_context": "", "confidence": 0.6})
                    seen_names.add(name.lower())
        
        default_data["skills"] = processed_skills
        
        # Save to cache
        PARSE_CACHE[text_hash] = default_data
        return default_data

    except Exception as e:
        print(f"Error extracting data: {str(e)}")
        # Raise the error so it propagates to the frontend and isn't silently swallowed
        raise RuntimeError(f"Skill extraction failed: {str(e)}")

def extract_skills_from_text(text: str) -> list:
    """Legacy function to maintain backwards compatibility where expecting a list of dicts."""
    data = extract_structured_data(text)
    return data.get("skills", [])

def extract_job_skills(text: str) -> dict:
    """Extract skills and categorize them into required and optional based on simple keywords."""
    all_skills = extract_skills_from_text(text)
    
    required_skills = []
    optional_skills = []
    
    text_lower = text.lower()
    import re
    sections = re.split(r'\n+', text_lower)
    
    for skill in all_skills:
        skill_name = skill["name"].lower()
        is_optional = False
        is_required = False
        
        for section in sections:
            if skill_name in section:
                if "preferred" in section or "nice to have" in section:
                    is_optional = True
                if "must" in section or "required" in section or "mandatory" in section:
                    is_required = True
                    
        # Rule: Default to required, unless marked explicitly as optional and NOT required
        if is_optional and not is_required:
            optional_skills.append(skill)
        else:
            required_skills.append(skill)
            
    return {
        "required_skills": required_skills,
        "optional_skills": optional_skills
    }

def parse_resume(file_bytes: bytes, filename: str) -> dict:
    """
    Unified function to extract text based on file extension, 
    then use Groq LLM to extract structured skills.
    """
    ext = filename.lower().split(".")[-1]
    
    try:
        if ext == "pdf":
            extracted_text = extract_text_from_pdf(file_bytes)
        elif ext == "docx":
            extracted_text = extract_text_from_docx(file_bytes)
        elif ext in ["txt", "text"]:
            extracted_text = extract_text_from_txt(file_bytes)
        else:
            return {"error": f"Unsupported file format: {ext}", "skills": []}

        if not extracted_text.strip():
            return {"error": "Could not extract any text from the file", "skills": []}

        # Use the general extractor
        parsed_data = extract_structured_data(extracted_text)
        return parsed_data

    except Exception as e:
        return {"error": f"Parsing error: {str(e)}", "skills": []}