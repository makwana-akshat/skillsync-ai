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
    
    # Store ALL skills mapped by their canonical name (known and unknown)
    resume_map = {}
    for s in processed_resume:
        canonical = s.get("canonical", s.get("name", "").lower().strip())
        if canonical:
            resume_map[canonical] = s.get("level", "Intermediate")
            
    # 2. Process Job Skills
    req_skills_raw = job_skills.get("required_skills", [])
    opt_skills_raw = job_skills.get("optional_skills", [])
    
    req_norm = infer_hierarchy(normalize_skills(req_skills_raw))
    opt_norm = infer_hierarchy(normalize_skills(opt_skills_raw))
    
    req_registry = process_skills(req_norm)["processed_skills"]
    opt_registry = process_skills(opt_norm)["processed_skills"]
    
    # Include all skills for scoring (not just known ones)
    valid_req = [s for s in req_registry if s.get("canonical")]
    valid_opt = [s for s in opt_registry if s.get("canonical")]
    
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
    semantic_skills = [{"name": s.get("canonical", s["name"].lower()), "level": s["level"]} 
                       for s in processed_resume if s.get("canonical")]
    
    resume_id = str(uuid.uuid4())
    store_resume_skills(semantic_skills, resume_id)
    
    semantic_result = semantic_match(job_description, resume_id)
    semantic_score = semantic_result.get("semantic_score", 0.0)
    top_semantic_matches = semantic_result.get("top_matches", [])
    
    final_score = (keyword_score * 0.80) + (semantic_score * 0.20)
    
    explanation_lines = []
    explanation_lines.append(f"📊 The candidate achieves a {round(final_score, 2)}% overall match for this role.")
    explanation_lines.append("")
    explanation_lines.append(f"🎯 Keyword Match: {round(keyword_score, 2)}%")
    explanation_lines.append(f"🧠 Semantic Context Match: {round(semantic_score, 2)}%")
    explanation_lines.append("")
    explanation_lines.append(f"✅ Matched {len(matched_required)} out of {len(valid_req)} core required skills.")
    
    if len(missing_required) > 0:
        missing_count = len(missing_required)
        missing_list = ", ".join(missing_required[:3]) + ("..." if missing_count > 3 else "")
        explanation_lines.append(f"⚠️ Missing {missing_count} critical requirements (e.g., {missing_list}), which may impact their immediate readiness.")
    else:
        explanation_lines.append(f"🌟 Excellent! The candidate meets all {len(valid_req)} core requirements.")

    if len(matched_optional) > 0:
        explanation_lines.append(f"🚀 Bonus: They bring {len(matched_optional)} nice-to-have skills, giving them a competitive edge.")
        
    if semantic_score > keyword_score + 10:
        explanation_lines.append("💡 Note: While exact keyword matches were lower, their overall experience strongly aligns contextually with the job.")
    elif keyword_score > 60 and semantic_score < 40:
        explanation_lines.append("🔍 Note: The candidate has the keywords, but their broader contextual experience might not perfectly align with the specific job description.")

    explanation_text = "\n".join(explanation_lines)
    
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
