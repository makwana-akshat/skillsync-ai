# hierarchy.py

# Define a mapping for skill hierarchy (Lower-level -> Higher-level)
SKILL_HIERARCHY = {
    # AI / Data
    "tensorflow": ["deep learning", "machine learning"],
    "pytorch": ["deep learning", "machine learning"],
    "keras": ["deep learning", "machine learning"],
    "scikit-learn": ["machine learning"],
    "deep learning": ["machine learning"],
    "pandas": ["data science", "data analysis"],
    "numpy": ["data science", "data analysis"],
    "matplotlib": ["data visualization", "data science"],
    "seaborn": ["data visualization", "data science"],
    "tableau": ["data visualization", "data analysis"],
    "power bi": ["data visualization", "data analysis"],
    "data science": ["machine learning"],
    "apache spark": ["big data", "data engineering"],
    "hadoop": ["big data", "data engineering"],
    "airflow": ["data engineering", "pipeline"],
    "llm": ["generative ai", "machine learning"],
    "langchain": ["generative ai", "llm"],
    "hugging face": ["generative ai", "machine learning"],
    "nlp": ["machine learning", "artificial intelligence"],
    "computer vision": ["machine learning", "artificial intelligence"],
    "opencv": ["computer vision"],

    # Frontend
    "react": ["frontend", "javascript components"],
    "vue.js": ["frontend", "javascript components"],
    "angular": ["frontend", "javascript components"],
    "svelte": ["frontend", "javascript components"],
    "next.js": ["frontend", "react", "fullstack"],
    "nuxt.js": ["frontend", "vue.js", "fullstack"],
    "html": ["frontend", "web development"],
    "css": ["frontend", "web development"],
    "tailwind css": ["frontend", "css framework", "css"],
    "bootstrap": ["frontend", "css framework", "css"],
    "sass": ["frontend", "css"],
    "javascript": ["frontend", "web development"],
    "typescript": ["frontend", "javascript", "web development"],
    "figma": ["ui/ux", "design"],

    # Backend
    "node.js": ["backend", "javascript"],
    "express.js": ["backend", "node.js", "api development"],
    "django": ["backend", "python", "web framework"],
    "flask": ["backend", "python", "api development", "web framework"],
    "fastapi": ["backend", "python", "api development"],
    "spring boot": ["backend", "java", "web framework"],
    "spring": ["backend", "java"],
    "asp.net": ["backend", "c#", "web framework"],
    "laravel": ["backend", "php", "web framework"],
    "ruby on rails": ["backend", "ruby", "web framework"],
    "graphql": ["api design", "backend"],
    "restful api": ["api design", "backend"],
    "rest api": ["api design", "backend"],
    "grpc": ["api design", "backend"],

    # Mobile
    "react native": ["mobile development", "cross-platform mobile"],
    "flutter": ["mobile development", "cross-platform mobile"],
    "swift": ["mobile development", "ios development"],
    "swiftui": ["mobile development", "ios development"],
    "kotlin": ["mobile development", "android development"],
    "android": ["mobile development"],
    "ios": ["mobile development"],

    # Cloud & DevOps
    "aws": ["cloud computing"],
    "amazon web services": ["cloud computing"],
    "azure": ["cloud computing"],
    "microsoft azure": ["cloud computing"],
    "gcp": ["cloud computing"],
    "google cloud platform": ["cloud computing"],
    "docker": ["containerization", "devops"],
    "kubernetes": ["container orchestration", "devops"],
    "terraform": ["infrastructure as code", "devops"],
    "ansible": ["infrastructure as code", "devops"],
    "jenkins": ["ci/cd", "devops"],
    "github actions": ["ci/cd", "devops"],
    "gitlab ci": ["ci/cd", "devops"],
    "linux": ["operating systems", "devops"],
    "nginx": ["web servers", "devops"],
    "apache": ["web servers", "devops"],
    
    # Databases
    "mongodb": ["databases", "nosql databases"],
    "redis": ["databases", "nosql databases", "caching"],
    "cassandra": ["databases", "nosql databases"],
    "dynamodb": ["databases", "nosql databases", "aws"],
    "postgresql": ["databases", "sql", "relational databases"],
    "mysql": ["databases", "sql", "relational databases"],
    "sqlite": ["databases", "sql", "relational databases"],
    "microsoft sql server": ["databases", "sql", "relational databases"],
    "oracle": ["databases", "sql", "relational databases"],
    "elasticsearch": ["search engines", "nosql databases"],

    # Testing
    "jest": ["testing", "unit testing"],
    "mocha": ["testing", "unit testing"],
    "cypress": ["testing", "e2e testing"],
    "selenium": ["testing", "e2e testing"],
    "pytest": ["testing", "unit testing", "python"],
    
    # Tools & Methodologies
    "git": ["version control"],
    "github": ["version control"],
    "gitlab": ["version control"],
    "jira": ["project management", "agile"],
    "scrum": ["agile", "project management"],
    "kanban": ["agile", "project management"],
    
    # Languages (linking to broad paradigms if useful)
    "java": ["object-oriented programming"],
    "c++": ["object-oriented programming"],
    "c#": ["object-oriented programming"]
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
