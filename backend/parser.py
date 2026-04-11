import pdfplumber
import docx
import tempfile
import os
import json
import io
import hashlib
from groq import Groq
from openai import OpenAI
from dotenv import load_dotenv

load_dotenv()

# Global cache for skill extraction (keys: hash of text, values: list of skills)
SKILL_CACHE = {}

def extract_text_from_pdf(file_bytes: bytes) -> str:
    """Extract text from PDF using pdfplumber."""
    text = ""
    with tempfile.NamedTemporaryFile(suffix=".pdf", delete=False) as temp_pdf:
        temp_pdf.write(file_bytes)
        temp_path = temp_pdf.name
    
    try:
        with pdfplumber.open(temp_path) as pdf:
            for page in pdf.pages:
                # Extract plain text
                page_text = page.extract_text()
                if page_text:
                    text += page_text + "\n"
                
                # Extract tables
                tables = page.extract_tables()
                for table in tables:
                    for row in table:
                        # Filter out None values and join row components
                        row_text = " ".join([str(cell) for cell in row if cell is not None])
                        if row_text:
                            text += row_text + "\n"
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

def extract_skills_from_text(text: str) -> list:
    """
    Use Groq LLM to extract a flat list of strings representing skills.
    Uses caching and temperature=0 for consistency.
    """
    if not text.strip():
        return []

    # Check cache first
    text_hash = hashlib.md5(text.strip().encode()).hexdigest()
    if text_hash in SKILL_CACHE:
        return SKILL_CACHE[text_hash]

    # 1. Get API key
    api_key = os.environ.get("GROQ_API_KEY")
    if not api_key:
        raise ValueError("GROQ_API_KEY is not set. Please check your .env file.")

    client = Groq(api_key=api_key)

    # 2. Hardened Prompt for Structured Skills with Proficiency
    prompt = f"""
    Extract a list of technical and soft skills from the following text and estimate the proficiency level for each skill based on the context (e.g., years of experience, depth of projects, specific mentions).
    
    Proficiency Levels: Beginner, Intermediate, Advanced.
    - If the context suggests high expertise or many years (ex: "5 years Python", "Expert in", "Lead developer"), use 'Advanced'.
    - If the context suggests basic knowledge or brief mentions (ex: "familiar with", "exposure to"), use 'Beginner'.
    - Use 'Intermediate' as the default if the context is unclear.
    
    Return ONLY a JSON object in this format:
    {{
      "skills": [
        {{"name": "Python", "level": "Advanced"}},
        {{"name": "React", "level": "Intermediate"}}
      ]
    }}

    Text:
    {text[:4000]}
    """

    try:
        completion = client.chat.completions.create(
            model="llama-3.1-8b-instant",
            messages=[{"role": "user", "content": prompt}],
            temperature=0,
            max_completion_tokens=1024,
            top_p=1,
            stream=False,
            stop=None
        )

        content = completion.choices[0].message.content.strip()

        # 🔥 SAFE JSON PARSE
        try:
            data = json.loads(content)
        except:
            import re
            json_match = re.search(r"\{.*\}", content, re.DOTALL)
            if json_match:
                data = json.loads(json_match.group())
            else:
                return []

        raw_skills = data.get("skills", [])
        
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
                    processed_skills.append({"name": name, "level": level})
                    seen_names.add(name.lower())
            elif isinstance(item, str):
                # Fallback for simple strings
                name = item.strip()
                if name.lower() not in seen_names:
                    processed_skills.append({"name": name, "level": "Intermediate"})
                    seen_names.add(name.lower())
        
        # Save to cache
        SKILL_CACHE[text_hash] = processed_skills
        return processed_skills

    except Exception as e:
        print(f"Error extracting skills: {str(e)}")
        # Raise the error so it propagates to the frontend and isn't silently swallowed
        raise RuntimeError(f"Skill extraction failed: {str(e)}")

def extract_job_skills(text: str) -> dict:
    """Extract skills and categorize them into required and optional based on simple keywords."""
    all_skills = extract_skills_from_text(text)
    
    required_skills = []
    optional_skills = []
    
    text_lower = text.lower()
    import re
    # Split text into sections based on newlines to guess optional/required context
    sections = re.split(r'\n+', text_lower)
    
    for skill in all_skills:
        skill_name = skill["name"].lower()
        is_optional = False
        is_required = False
        
        for section in sections:
            # If the skill name is in this line/section, check the phrasing
            if skill_name in section:
                if "preferred" in section or "nice to have" in section or "plus" in section or "optional" in section:
                    is_optional = True
                if "must" in section or "required" in section or "mandatory" in section or "need" in section or "essential" in section:
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
        skills = extract_skills_from_text(extracted_text)
        return {"skills": skills}

    except Exception as e:
        return {"error": f"Parsing error: {str(e)}", "skills": []}