import datetime

known_canonicals = [
  # Programming Languages
  "python", "javascript", "java", "c", "c++", "c#", "go", "rust", "ruby",
  "php", "swift", "kotlin", "typescript", "scala", "r", "perl", "lua",
  "dart", "elixir", "haskell", "matlab", "objective-c", "shell", "bash",
  
  # Web Frameworks & Libraries
  "react", "angular", "vue.js", "vue", "next.js", "nuxt.js", "svelte",
  "node.js", "express.js", "django", "flask", "fastapi", "spring",
  "spring boot", "rails", "laravel", "asp.net", "jquery", "bootstrap",
  "tailwind css", "tailwindcss",
  
  # Mobile
  "react native", "flutter", "swiftui", "android", "ios",
  
  # Databases
  "sql", "mysql", "postgresql", "postgres", "mongodb", "mongo db",
  "redis", "elasticsearch", "cassandra", "dynamodb", "sqlite",
  "oracle", "microsoft sql server", "neo4j", "firebase",
  
  # Cloud & DevOps
  "amazon web services", "aws", "google cloud platform", "gcp",
  "microsoft azure", "azure", "docker", "kubernetes", "terraform",
  "ansible", "jenkins", "github actions", "gitlab ci", "circleci",
  "ci/cd", "linux", "nginx", "apache",
  
  # AI / ML / Data Science
  "machine learning", "deep learning", "tensorflow", "pytorch",
  "scikit-learn", "keras", "opencv", "nlp", "natural language processing",
  "computer vision", "data science", "data analysis", "data engineering",
  "pandas", "numpy", "scipy", "matplotlib", "spark", "apache spark",
  "hadoop", "airflow", "tableau", "power bi", "jupyter",
  "hugging face", "langchain", "llm", "generative ai",
  
  # Tools & Platforms
  "git", "github", "gitlab", "bitbucket", "jira", "confluence",
  "figma", "postman", "swagger", "graphql", "rest api", "restful api",
  "grpc", "rabbitmq", "kafka", "apache kafka", "celery",
  
  # Testing
  "jest", "mocha", "pytest", "selenium", "cypress", "playwright",
  "unit testing", "integration testing",
  
  # Soft Skills
  "communication", "leadership", "teamwork", "problem solving",
  "project management", "agile", "scrum", "kanban",
  "critical thinking", "time management",
  
  # Other
  "html", "css", "sass", "webpack", "vite", "npm", "yarn",
  "api design", "microservices", "system design", "blockchain",
  "cybersecurity", "networking", "embedded systems",
]

canonical_mapping = {
  # JavaScript ecosystem
  "js": "javascript",
  "ts": "typescript",
  "react.js": "react",
  "reactjs": "react",
  "react js": "react",
  "vue js": "vue.js",
  "vuejs": "vue.js",
  "next js": "next.js",
  "nextjs": "next.js",
  "nuxt js": "nuxt.js",
  "nuxtjs": "nuxt.js",
  "nodejs": "node.js",
  "node js": "node.js",
  "expressjs": "express.js",
  "express js": "express.js",
  
  # Python ecosystem
  "py": "python",
  "scikit learn": "scikit-learn",
  "sklearn": "scikit-learn",
  "tf": "tensorflow",
  
  # AI/ML
  "ml": "machine learning",
  "dl": "deep learning",
  "artificial intelligence": "machine learning",
  "ai": "machine learning",
  "gen ai": "generative ai",
  "genai": "generative ai",
  "large language models": "llm",
  "large language model": "llm",
  
  # Cloud
  "aws": "amazon web services",
  "gcp": "google cloud platform",
  "google cloud": "google cloud platform",
  "k8s": "kubernetes",
  "ms azure": "microsoft azure",
  
  # Databases
  "mongo": "mongodb",
  "postgres": "postgresql",
  "pg": "postgresql",
  "mssql": "microsoft sql server",
  "sql server": "microsoft sql server",
  
  # Other
  "ci cd": "ci/cd",
  "cicd": "ci/cd",
  "rest": "rest api",
  "restful": "restful api",
  "tailwind": "tailwind css",
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
        # 3. Unknown skill — still assign canonical as lowercase name for matching
        else:
            canonical = lower_name
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
