import datetime

known_canonicals = [
  "python", "javascript", "react", "node.js",
  "tensorflow", "pytorch", "machine learning",
  "deep learning", "sql", "mongodb"
]

canonical_mapping = {
  "js": "javascript",
  "react.js": "react",
  "nodejs": "node.js",
  "scikit learn": "scikit-learn",
  "ml": "machine learning",
  "dl": "deep learning"
}

def process_skills(skills: list) -> dict:
    """
    Normalizes skills, maps aliases, and detects unknown/emerging skills.
    Returns categorized skills, emerging candidates, and updates for the store.
    """
    processed_skills = []
    emerging_candidates = []
    store_updates = []
    
    # Store unique processed names to avoid duplicate emerging candidates
    seen_unknowns = set()
    
    now_iso = datetime.datetime.utcnow().isoformat() + "Z"
    
    for skill in skills:
        if isinstance(skill, dict):
            name = str(skill.get("name", ""))
            level = skill.get("level", "Intermediate")
        else:
            name = str(skill)
            level = "Intermediate"
            
        lower_name = name.lower().strip()
        
        if not lower_name:
            continue
            
        # 1. Exact match in known canonicals
        if lower_name in known_canonicals:
            canonical = lower_name
            known = True
            confidence = 1.0
            action = "keep"
        # 2. Match in canonical mapping
        elif lower_name in canonical_mapping:
            canonical = canonical_mapping[lower_name]
            known = True
            confidence = 0.9
            action = f"map_to:{canonical}"
        # 3. Unknown skill
        else:
            canonical = ""
            known = False
            confidence = 0.3
            action = "flag_for_review"
            
            # Avoid duplicate registrations per parse
            if lower_name not in seen_unknowns:
                seen_unknowns.add(lower_name)
                # Create emerging candidate
                emerging_candidates.append({
                    "key": lower_name,
                    "display_name": name,
                    "example_contexts": [],
                    "suggested_canonical": "",
                    "suggested_confidence": 0.3,
                    "reason": "not in registry",
                    "priority": "normal"
                })
                
                # Create store update
                store_updates.append({
                    "key": lower_name,
                    "count": 1,
                    "first_seen": now_iso,
                    "last_seen": now_iso,
                    "examples": [],
                    "flagged": True,
                    "reviewed": False
                })
            
        processed_skills.append({
            "name": name,
            "canonical": canonical,
            "known": known,
            "confidence": confidence,
            "level": level,
            "action": action
        })
        
    return {
        "processed_skills": processed_skills,
        "emerging_candidates": emerging_candidates,
        "store_updates": store_updates
    }
