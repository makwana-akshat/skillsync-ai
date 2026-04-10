import json
from parser import extract_skills_from_text
from normalizer import normalize_skills
from hierarchy import infer_hierarchy
from matcher import match_skills

def test_pipeline():
    text = "John has 5 years of Python experience and is also familiar with React. He worked on TensorFlow for 3 years."
    
    print("--- PARSING ---")
    skills = extract_skills_from_text(text)
    print(json.dumps(skills, indent=2))
    
    print("\n--- NORMALIZING ---")
    normalized = normalize_skills(skills)
    print(json.dumps(normalized, indent=2))
    
    print("\n--- HIERARCHY ---")
    hierarchical = infer_hierarchy(normalized)
    print(json.dumps(hierarchical, indent=2))
    
    print("\n--- MATCHING ---")
    job_desc = "Required: Advanced Python, Deep Learning, and Frontend."
    job_skills = extract_skills_from_text(job_desc)
    result = match_skills(hierarchical, job_skills)
    print(json.dumps(result, indent=2))

if __name__ == "__main__":
    test_pipeline()
