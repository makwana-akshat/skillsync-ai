import os
from dotenv import load_dotenv
load_dotenv()

from fastapi import FastAPI, UploadFile, File, Form
from fastapi.responses import FileResponse
from typing import List
from fastapi.middleware.cors import CORSMiddleware
from parser import parse_resume, extract_skills_from_text, extract_job_skills
from normalizer import normalize_skills
from hierarchy import infer_hierarchy
from matcher import match_skills
from report import generate_pdf

app = FastAPI(title="SkillSync AI", description="AI-based system for parsing and matching skills")

# Setup CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/")
def read_root():
    return {"message": "Welcome to SkillSync AI"}

@app.post("/test")
async def test_endpoint(
    file: UploadFile = File(...),
    job_description: str = Form(...)
):
    return {
        "filename": file.filename,
        "job_description": job_description,
        "message": "API working"
    }

@app.post("/parse")
async def parse_endpoint(file: UploadFile = File(...)):
    file_bytes = await file.read()
    extracted_data = parse_resume(file_bytes, file.filename)
    
    if "error" in extracted_data:
        return {"filename": file.filename, "error": extracted_data["error"], "extracted_skills": []}
    
    raw_skills = extracted_data.get("skills", [])
    
    # Process skills: Normalize -> Hierarchy
    normalized = normalize_skills(raw_skills)
    final_skills = infer_hierarchy(normalized)
    
    return {
        "filename": file.filename,
        "extracted_skills": final_skills,
        "raw_skills": raw_skills # Keeping raw for reference
    }

@app.post("/analyze")
async def analyze_endpoint(
    file: UploadFile = File(...),
    job_description: str = Form(...)
):
    # 1. Parse resume
    file_bytes = await file.read()
    extracted_data = parse_resume(file_bytes, file.filename)
    
    if "error" in extracted_data:
        return {"error": extracted_data["error"], "score": 0, "matched_skills": [], "missing_skills": []}
        
    resume_skills = extracted_data.get("skills", [])
    
    # 2. Extract job skills
    job_skills = extract_job_skills(job_description)
    
    # 3. Match skills
    match_result = match_skills(resume_skills, job_skills, job_description)
    
    # 3. Output score and relevant details
    return {
        "score": match_result["score"],
        "keyword_score": match_result.get("keyword_score", 0.0),
        "semantic_score": match_result.get("semantic_score", 0.0),
        "matched_skills": match_result.get("matched_skills", []),
        "top_semantic_matches": match_result.get("top_semantic_matches", []),
        "matched_required": match_result["matched_required"],
        "matched_optional": match_result["matched_optional"],
        "missing_required": match_result["missing_required"],
        "missing_optional": match_result["missing_optional"],
        "explanation": match_result["explanation"]
    }

@app.post("/rank")
async def rank_endpoint(
    files: List[UploadFile] = File(...),
    job_description: str = Form(...)
):
    # 1. Extract job skills once
    job_skills = extract_job_skills(job_description)
    
    results = []
    for file in files:
        file_bytes = await file.read()
        extracted_data = parse_resume(file_bytes, file.filename)
        resume_skills = extracted_data.get("skills", [])
        
        match_result = match_skills(resume_skills, job_skills, job_description)
        results.append({
            "name": file.filename,
            "score": match_result["score"]
        })
        
    results.sort(key=lambda x: x["score"], reverse=True)
    return {"ranked_candidates": results}

@app.post("/report")
async def report_endpoint(
    file: UploadFile = File(...),
    job_description: str = Form(...)
):
    file_bytes = await file.read()
    extracted_data = parse_resume(file_bytes, file.filename)
    resume_skills = extracted_data.get("skills", [])
    
    # 2. Extract job skills
    job_skills = extract_job_skills(job_description)
    
    # 3. Match skills
    match_result = match_skills(resume_skills, job_skills, job_description)
    
    pdf_path = generate_pdf(match_result)
    
    return FileResponse(
        path=pdf_path,
        filename=f"Report_{file.filename}.pdf",
        media_type="application/pdf"
    )
