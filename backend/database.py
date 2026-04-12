import sqlite3
import datetime
import os

DB_PATH = os.path.join(os.path.dirname(__file__), "skillsync.db")

def init_db():
    conn = sqlite3.connect(DB_PATH)
    cursor = conn.cursor()
    cursor.execute('''
        CREATE TABLE IF NOT EXISTS analysis_history (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            user_id INTEGER NOT NULL DEFAULT 1,
            candidate_name TEXT NOT NULL,
            score REAL NOT NULL,
            status TEXT NOT NULL,
            tier TEXT NOT NULL DEFAULT 'Low Tier',
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
    ''')
    cursor.execute('''
        CREATE TABLE IF NOT EXISTS users (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            company_name TEXT NOT NULL,
            email TEXT UNIQUE NOT NULL,
            hashed_password TEXT NOT NULL,
            open_positions INTEGER DEFAULT 0,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
    ''')
    conn.commit()
    conn.close()

def add_analysis_record(user_id: int, candidate_name: str, score: float, status: str, tier: str = "Low Tier"):
    conn = sqlite3.connect(DB_PATH)
    cursor = conn.cursor()
    cursor.execute('''
        INSERT INTO analysis_history (user_id, candidate_name, score, status, tier, created_at)
        VALUES (?, ?, ?, ?, ?, ?)
    ''', (user_id, candidate_name, score, status, tier, datetime.datetime.now()))
    conn.commit()
    conn.close()

def get_all_records(user_id: int, limit: int = 200, sort: str = "date", order: str = "desc", tier: str = None, status: str = None):
    """Retrieve analysis history records with sorting and filtering."""
    conn = sqlite3.connect(DB_PATH)
    conn.row_factory = sqlite3.Row
    cursor = conn.cursor()

    # Build query dynamically
    query = "SELECT id, candidate_name as name, score, status, tier, created_at FROM analysis_history"
    conditions = ["user_id = ?"]
    params = [user_id]

    if tier and tier != "all":
        conditions.append("tier = ?")
        params.append(tier)
    if status and status != "all":
        conditions.append("status = ?")
        params.append(status)

    if conditions:
        query += " WHERE " + " AND ".join(conditions)

    # Sorting
    sort_map = {
        "date": "created_at",
        "score": "score",
        "name": "candidate_name",
        "tier": "CASE tier WHEN 'Top Tier' THEN 1 WHEN 'Mid Tier' THEN 2 ELSE 3 END",
        "status": "CASE status WHEN 'ACCEPTED' THEN 1 ELSE 2 END",
    }
    sort_col = sort_map.get(sort, "created_at")
    order_dir = "ASC" if order == "asc" else "DESC"
    query += f" ORDER BY {sort_col} {order_dir}"
    query += " LIMIT ?"
    params.append(limit)

    cursor.execute(query, params)
    records = [dict(row) for row in cursor.fetchall()]
    conn.close()
    return records

def get_overview_stats(user_id: int):
    conn = sqlite3.connect(DB_PATH)
    conn.row_factory = sqlite3.Row
    cursor = conn.cursor()
    
    # Total Analyzed
    cursor.execute('SELECT COUNT(*) as count FROM analysis_history WHERE user_id = ?', (user_id,))
    total_analyzed = cursor.fetchone()['count']
    
    # Avg Match Rate
    cursor.execute('SELECT AVG(score) as avg_score FROM analysis_history WHERE user_id = ?', (user_id,))
    avg_row = cursor.fetchone()['avg_score']
    avg_score = round(avg_row, 1) if avg_row else 0.0
    
    # Processed Today
    today_str = datetime.datetime.now().strftime("%Y-%m-%d")
    cursor.execute('SELECT COUNT(*) as count FROM analysis_history WHERE user_id = ? AND DATE(created_at) = ?', (user_id, today_str))
    processed_today = cursor.fetchone()['count']
    
    # Recent Activity
    cursor.execute('''
        SELECT candidate_name as name, score, status, tier 
        FROM analysis_history 
        WHERE user_id = ?
        ORDER BY created_at DESC 
        LIMIT 5
    ''', (user_id,))
    recent_activity = [dict(row) for row in cursor.fetchall()]
    
    # Add dummy entries if empty to keep it beautiful at start
    if not recent_activity:
        recent_activity = [
            {"name": "No data yet", "score": 0, "status": "Waiting", "tier": "-"}
        ]
        
    # Open Positions
    cursor.execute('SELECT open_positions FROM users WHERE id = ?', (user_id,))
    user_row = cursor.fetchone()
    open_positions = user_row['open_positions'] if user_row else 0
    
    conn.close()
    
    return {
        "total_analyzed": total_analyzed,
        "avg_match_rate": avg_score,
        "open_positions": open_positions,
        "processed_today": processed_today,
        "recent_activity": recent_activity
    }

def update_open_positions(user_id: int, count: int):
    conn = sqlite3.connect(DB_PATH)
    cursor = conn.cursor()
    cursor.execute('UPDATE users SET open_positions = ? WHERE id = ?', (count, user_id))
    conn.commit()
    conn.close()
    return True

def create_user(company_name: str, email: str, hashed_password: str):
    conn = sqlite3.connect(DB_PATH)
    cursor = conn.cursor()
    try:
        cursor.execute('''
            INSERT INTO users (company_name, email, hashed_password, created_at)
            VALUES (?, ?, ?, ?)
        ''', (company_name, email, hashed_password, datetime.datetime.now()))
        conn.commit()
        return True
    except sqlite3.IntegrityError:
        return False
    finally:
        conn.close()

def get_user_by_email(email: str):
    conn = sqlite3.connect(DB_PATH)
    conn.row_factory = sqlite3.Row
    cursor = conn.cursor()
    cursor.execute('SELECT * FROM users WHERE email = ?', (email,))
    user = cursor.fetchone()
    conn.close()
    return dict(user) if user else None
