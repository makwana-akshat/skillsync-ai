import uuid
from vector_store import store_resume_skills, semantic_match
from normalizer import normalize_skills
from hierarchy import infer_hierarchy
from skill_registry import process_skills

def match_skills(resume_skills: list, job_skills: dict, job_description: str = "") -> dict:
    """
    Match skills between a list of parsed resume skills and categorized job requirements.
    Uses Skill Registry to enforce canonical names and ignores unknown skills in scoring.
    """
    # 1. Process Resume Skills
    norm_resume = normalize_skills(resume_skills)
    hier_resume = infer_hierarchy(norm_resume)
    resume_registry = process_skills(hier_resume)
    
    processed_resume = resume_registry["processed_skills"]
    emerging_skills = resume_registry["emerging_candidates"]
    
    # Store ONLY known skills mapped by their canonical name
    resume_map = {}
    for s in processed_resume:
        if s.get("known") and s.get("canonical"):
            # If multiple occur, keep highest level or first. Here we just take last/first
            resume_map[s["canonical"]] = s.get("level", "Intermediate")
            
    # 2. Process Job Skills
    req_skills_raw = job_skills.get("required_skills", [])
    opt_skills_raw = job_skills.get("optional_skills", [])
    
    req_norm = infer_hierarchy(normalize_skills(req_skills_raw))
    opt_norm = infer_hierarchy(normalize_skills(opt_skills_raw))
    
    req_registry = process_skills(req_norm)["processed_skills"]
    opt_registry = process_skills(opt_norm)["processed_skills"]
    
    # Keep only known skills for scoring
    valid_req = [s for s in req_registry if s.get("known") and s.get("canonical")]
    valid_opt = [s for s in opt_registry if s.get("known") and s.get("canonical")]
    
    # 3. Keyword Matching logic
    matched_required = []
    missing_required = []
    
    for skill in valid_req:
        c_name = skill["canonical"]
        if c_name in resume_map:
            matched_required.append({
                "name": skill["name"],
                "canonical": c_name,
                "resume_level": resume_map[c_name],
                "required_level": skill["level"]
            })
        else:
            missing_required.append(skill["name"])
            
    matched_optional = []
    missing_optional = []
    
    for skill in valid_opt:
        c_name = skill["canonical"]
        if c_name in resume_map:
            matched_optional.append({
                "name": skill["name"],
                "canonical": c_name,
                "resume_level": resume_map[c_name],
                "required_level": skill["level"]
            })
        else:
            missing_optional.append(skill["name"])

    # 4. Calculation
    total_possible = (len(valid_req) * 2) + len(valid_opt)
    
    keyword_score = 0.0
    if total_possible > 0:
        matched_score_val = (len(matched_required) * 2) + len(matched_optional)
        keyword_score = (matched_score_val / total_possible) * 100
        
    # 5. Semantic Matching Step
    # We pass the processed resume items (which have 'name' and 'canonical') to the vector DB
    # We could send Canonical names to make it cleaner
    semantic_skills = [{"name": s["canonical"], "level": s["level"]} 
                       for s in processed_resume if s.get("known") and s.get("canonical")]
    
    resume_id = str(uuid.uuid4())
    store_resume_skills(semantic_skills, resume_id)
    
    semantic_result = semantic_match(job_description, resume_id)
    semantic_score = semantic_result.get("semantic_score", 0.0)
    top_semantic_matches = semantic_result.get("top_matches", [])
    
    final_score = (keyword_score * 0.5) + (semantic_score * 0.5)
    
    explanation_text = f"The candidate matches {round(final_score, 2)}% overall. "
    explanation_text += f"(Keyword Score: {round(keyword_score, 2)}%, Semantic Score: {round(semantic_score, 2)}%) "
    explanation_text += f"Matched {len(matched_required)}/{len(valid_req)} known required skills, and {len(matched_optional)}/{len(valid_opt)} known optional skills."
    
    # Safely extract skill names
    matched_skills = []
    for s in matched_required:
        matched_skills.append(s.get("name") if isinstance(s, dict) else str(s))
    for s in matched_optional:
        matched_skills.append(s.get("name") if isinstance(s, dict) else str(s))
    
    return {
        "score": round(final_score, 2),
        "keyword_score": round(keyword_score, 2),
        "semantic_score": round(semantic_score, 2),
        "matched_skills": matched_skills,
        "top_semantic_matches": top_semantic_matches,
        "matched_required": matched_required,
        "matched_optional": matched_optional,
        "missing_required": missing_required,
        "missing_optional": missing_optional,
        "explanation": explanation_text,
        "processed_skills": processed_resume,
        "emerging_skills": emerging_skills
    }
