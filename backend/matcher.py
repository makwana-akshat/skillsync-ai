def match_skills(resume_skills: list, job_skills: dict) -> dict:
    """
    Match skills between a list of parsed resume skills and categorized job requirements.
    job_skills is expected to be a dict: {"required_skills": [...], "optional_skills": [...]}
    Both input lists contain dicts: [{"name": "skill", "level": "Advanced"}, ...]
    """
    # Normalize inputs
    from normalizer import normalize_skills
    from hierarchy import infer_hierarchy
    
    norm_resume = normalize_skills(resume_skills)
    processed_resume = infer_hierarchy(norm_resume)
    resume_map = {s["name"]: s["level"] for s in processed_resume}
    
    req_skills_raw = job_skills.get("required_skills", [])
    opt_skills_raw = job_skills.get("optional_skills", [])
    
    req_normalized = normalize_skills(req_skills_raw)
    opt_normalized = normalize_skills(opt_skills_raw)
    
    processed_req = infer_hierarchy(req_normalized)
    processed_opt = infer_hierarchy(opt_normalized)
    
    matched_required = []
    missing_required = []
    
    for skill in processed_req:
        name = skill["name"]
        if name in resume_map:
            matched_required.append({
                "name": name,
                "resume_level": resume_map[name],
                "required_level": skill["level"]
            })
        else:
            missing_required.append(name)
            
    matched_optional = []
    missing_optional = []
    
    for skill in processed_opt:
        name = skill["name"]
        if name in resume_map:
            matched_optional.append({
                "name": name,
                "resume_level": resume_map[name],
                "required_level": skill["level"]
            })
        else:
            missing_optional.append(name)

    # Calculation
    total_possible = (len(processed_req) * 2) + len(processed_opt)
    
    if total_possible == 0:
        return {
            "score": 0.0,
            "matched_required": [],
            "matched_optional": [],
            "missing_required": [],
            "missing_optional": [],
            "explanation": "No specific skills identified in the job description."
        }
        
    matched_score = (len(matched_required) * 2) + len(matched_optional)
    score = (matched_score / total_possible) * 100
    
    explanation_text = f"The candidate matches {round(score, 2)}% based on weighted scoring. "
    explanation_text += f"Matched {len(matched_required)}/{len(processed_req)} required skills, and {len(matched_optional)}/{len(processed_opt)} optional skills."
    
    return {
        "score": round(score, 2),
        "matched_required": matched_required,
        "matched_optional": matched_optional,
        "missing_required": missing_required,
        "missing_optional": missing_optional,
        "explanation": explanation_text
    }
