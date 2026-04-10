import uuid
import chromadb
from sentence_transformers import SentenceTransformer

# 1. Load embedding model
model = SentenceTransformer("all-MiniLM-L6-v2")

# 3. Initialize ChromaDB (in-memory)
chroma_client = chromadb.Client()

# Create or get collection
collection = chroma_client.get_or_create_collection(name="resume_skills")

def get_embedding(text: str) -> list[float]:
    """
    Generate an embedding for the given text.
    Text is converted to lowercase to improve semantic similarity accuracy.
    """
    text_processed = str(text).lower().strip()
    # model.encode returns a numpy array, we convert to list of floats
    return model.encode(text_processed).tolist()

def store_resume_skills(skills: list, resume_id: str):
    """
    Stores a list of resume skills in the ChromaDB collection.
    Avoids storing duplicate skills for the same resume.
    """
    stored_skills = set()
    docs = []
    embeddings = []
    ids = []
    metadatas = []
    
    for i, skill in enumerate(skills):
        # Extract skill name (handle both dict and string formats)
        skill_name = skill.get("name", "") if isinstance(skill, dict) else str(skill)
        
        # Normalize skill text
        skill_name_processed = skill_name.lower().strip()
        
        if not skill_name_processed or skill_name_processed in stored_skills:
            continue
            
        stored_skills.add(skill_name_processed)
        
        # Get embedding
        vector = get_embedding(skill_name_processed)
        
        docs.append(skill_name_processed)
        embeddings.append(vector)
        # Use unique ID format as requested
        ids.append(f"{resume_id}_{i}")
        metadatas.append({"resume_id": resume_id})
        
    if docs:
        collection.add(
            documents=docs,
            embeddings=embeddings,
            ids=ids,
            metadatas=metadatas
        )

def semantic_match(job_description: str, resume_id: str = None) -> dict:
    """
    Matches the job description semantically with the stored resume skills.
    Calculates a semantic score based on relevant matches.
    """
    if not job_description or not job_description.strip():
        return {
            "semantic_score": 0.0,
            "top_matches": []
        }
        
    job_desc_processed = job_description.lower().strip()
    job_embedding = get_embedding(job_desc_processed)
    
    # Setup where clause if resume_id is provided, to avoid mixing different resumes
    where_clause = {"resume_id": resume_id} if resume_id else None
    
    # Calculate total skills. If filtered by resume_id, total skills is length of stored skills for that resume
    if resume_id:
        total_skills = len(collection.get(where=where_clause)["ids"])
    else:
        total_skills = collection.count()
        
    if total_skills == 0:
        return {
            "semantic_score": 0.0,
            "top_matches": []
        }
    
    # Query top 5 similar skills
    results = collection.query(
        query_embeddings=[job_embedding],
        n_results=min(5, total_skills), # Can't request more than what's stored
        where=where_clause,
        include=["documents", "distances"]
    )
    
    matched_docs = results.get("documents", [[]])[0]
    matched_distances = results.get("distances", [[]])[0]
    
    top_matches = []
    relevant_matches = 0
    
    # L2 distance or Cosine distance threshold. For all-MiniLM, similarity is better if distance is smaller.
    # We will use distance < 1.2 as a rough threshold for a "relevant" match.
    for doc, dist in zip(matched_docs, matched_distances):
        top_matches.append(doc)
        if dist < 1.2:
            relevant_matches += 1
            
    # Calculate semantic_score
    total_queried = len(matched_docs)
    if total_queried > 0:
        semantic_score = (relevant_matches / total_queried) * 100
    else:
        semantic_score = 0.0
        
    semantic_score = min(semantic_score, 100.0) # Cap at 100
    
    # Cleanup data for this resume_id after querying to prevent memory leaks
    if resume_id:
        collection.delete(where={"resume_id": resume_id})
        
    return {
        "semantic_score": round(semantic_score, 2),
        "top_matches": top_matches
    }
