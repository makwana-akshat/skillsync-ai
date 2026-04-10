def match_skills(resume_skills: list, job_skills: dict, job_description: str = "") -> dict:
    """
    Match skills between a list of parsed resume skills and categorized job requirements.
    job_skills is expected to be a dict: {"required_skills": [...], "optional_skills": [...]}
    Both input lists contain dicts: [{"name": "skill", "level": "Advanced"}, ...]
    """
    import uuid
    from vector_store import store_resume_skills, semantic_match
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
    
    keyword_score = 0.0
    if total_possible > 0:
        matched_score_val = (len(matched_required) * 2) + len(matched_optional)
        keyword_score = (matched_score_val / total_possible) * 100
        
    # Semantic Matching Step
    resume_id = str(uuid.uuid4())
    store_resume_skills(norm_resume, resume_id)
    
    semantic_result = semantic_match(job_description, resume_id)
    semantic_score = semantic_result.get("semantic_score", 0.0)
    top_semantic_matches = semantic_result.get("top_matches", [])
    
    final_score = (keyword_score * 0.5) + (semantic_score * 0.5)
    
    explanation_text = f"The candidate matches {round(final_score, 2)}% overall. "
    explanation_text += f"(Keyword Score: {round(keyword_score, 2)}%, Semantic Score: {round(semantic_score, 2)}%) "
    explanation_text += f"Matched {len(matched_required)}/{len(processed_req)} required skills, and {len(matched_optional)}/{len(processed_opt)} optional skills."
    
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
        "explanation": explanation_text
    }
