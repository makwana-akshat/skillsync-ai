# normalizer.py
# This module will handle standardizing and normalizing skill names.

SKILL_MAPPING = {
    "ml": "machine learning",
    "react.js": "react",
    "reactjs": "react",
    "js": "javascript",
    "py": "python",
    "nodejs": "node.js",
    "mongodb": "mongo db",
    "expressjs": "express.js",
    "aws": "amazon web services",
    "gcp": "google cloud platform",
    "k8s": "kubernetes"
}

def normalize_skill(skill: str) -> str:
    """
    Normalize a skill using dictionary mapping (e.g., 'react.js' -> 'react').
    """
    skill_clean = skill.strip().lower()
    return SKILL_MAPPING.get(skill_clean, skill_clean)

def normalize_skills(skills: list) -> list:
    """
    Normalize a list of skill dictionaries or strings.
    """
    normalized_list = []
    for s in skills:
        if isinstance(s, dict) and "name" in s:
            new_s = s.copy()
            new_s["name"] = normalize_skill(s["name"])
            normalized_list.append(new_s)
        elif isinstance(s, str):
            normalized_list.append({"name": normalize_skill(s), "level": "Intermediate"})
    return normalized_list
