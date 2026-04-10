# hierarchy.py

# Define a mapping for skill hierarchy (Lower-level -> Higher-level)
SKILL_HIERARCHY = {
    "tensorflow": ["deep learning"],
    "pytorch": ["deep learning"],
    "deep learning": ["machine learning"],
    "react": ["frontend"],
    "node.js": ["backend"],
    "express.js": ["backend"],
    "django": ["backend"],
    "flask": ["backend"],
    "vue": ["frontend"],
    "angular": ["frontend"],
    "scikit-learn": ["machine learning"],
    "pandas": ["data science"],
    "numpy": ["data science"],
    "data science": ["machine learning"],
    "aws": ["cloud computing"],
    "azure": ["cloud computing"],
    "gcp": ["cloud computing"],
    "mongodb": ["databases"],
    "postgresql": ["databases"],
    "mysql": ["databases"],
    "javascript": ["frontend"] # Adding this for React -> Frontend flow if needed, though React is already frontend
}

def infer_hierarchy(skills: list) -> list:
    """
    Infer higher-level parent skills from a list of skill dictionaries.
    Example: {"name": "tensorflow", "level": "Advanced"} -> adds {"name": "deep learning", "level": "Advanced"}
    """
    # Map to track highest level for each skill name
    # Level priority: Advanced(3) > Intermediate(2) > Beginner(1)
    level_map = {"Beginner": 1, "Intermediate": 2, "Advanced": 3}
    rev_level_map = {1: "Beginner", 2: "Intermediate", 3: "Advanced"}
    
    # Store unique skills with their max level
    processed_skills = {} # {name: level_value}
    
    # helper to update/add skill
    def add_skill(name, level_str):
        name_clean = name.strip().lower()
        level_val = level_map.get(level_str, 2)
        if name_clean not in processed_skills or level_val > processed_skills[name_clean]:
            processed_skills[name_clean] = level_val
            return True # Added or updated
        return False

    # Initial load
    for s in skills:
        if isinstance(s, dict):
            add_skill(s.get("name", ""), s.get("level", "Intermediate"))
        elif isinstance(s, str):
            add_skill(s, "Intermediate")
    
    # Queue for processing parents recursively
    to_process = list(processed_skills.keys())
    
    while to_process:
        current_name = to_process.pop(0)
        current_level_val = processed_skills[current_name]
        
        parents = SKILL_HIERARCHY.get(current_name, [])
        for parent in parents:
            parent_clean = parent.strip().lower()
            # Add parent with the same level as current child
            was_updated = add_skill(parent_clean, rev_level_map[current_level_val])
            if was_updated:
                to_process.append(parent_clean)
                
    # Convert back to list of dicts
    result = []
    for name, level_val in processed_skills.items():
        result.append({
            "name": name,
            "level": rev_level_map[level_val]
        })
    
    return sorted(result, key=lambda x: x["name"])
