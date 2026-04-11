import uuid
import chromadb

# Lazy-loaded embedding model (avoids blocking on import)
_model = None

def _get_model():
    global _model
    if _model is None:
        from sentence_transformers import SentenceTransformer
        _model = SentenceTransformer("all-MiniLM-L6-v2")
    return _model

# Initialize ChromaDB (in-memory)
chroma_client = chromadb.Client()

# Create or get collection
collection = chroma_client.get_or_create_collection(name="resume_skills")

def get_embedding(text) -> list[float]:
    """
    Generate embedding(s) for the given text (str or list of str).
    Text is converted to lowercase to improve semantic similarity accuracy.
    """
    model = _get_model()
    if isinstance(text, list):
        processed = [str(t).lower().strip() for t in text]
        return model.encode(processed, batch_size=64, show_progress_bar=False).tolist()
    text_processed = str(text).lower().strip()
    return model.encode(text_processed, show_progress_bar=False).tolist()

def store_resume_skills(skills: list, resume_id: str):
    """
    Stores a list of resume skills in the ChromaDB collection.
    Avoids storing duplicate skills for the same resume.
    Uses batch embedding for performance.
    """
    stored_skills = set()
    docs = []
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
        docs.append(skill_name_processed)
        ids.append(f"{resume_id}_{i}")
        metadatas.append({"resume_id": resume_id})
        
    if docs:
        # Batch encode all skills at once instead of one-by-one
        embeddings = get_embedding(docs)
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
        n_results=min(10, total_skills), # Can't request more than what's stored
        where=where_clause,
        include=["documents", "distances"]
    )
    
    matched_docs = results.get("documents", [[]])[0]
    matched_distances = results.get("distances", [[]])[0]
    
    top_matches = []
    relevant_matches = 0
    
    # L2 distance threshold. For all-MiniLM, smaller distance = better match.
    # Threshold 1.5 captures reasonably related skills.
    for doc, dist in zip(matched_docs, matched_distances):
        top_matches.append(doc)
        if dist < 1.5:
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
