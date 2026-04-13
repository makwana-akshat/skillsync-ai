# SkillSync AI

SkillSync AI is an advanced, AI-powered recruitment and applicant tracking platform. It leverages state-of-the-art Natural Language Processing (NLP), Generative AI, and Vector Search to seamlessly parse resumes, extract relevant skills, and intelligently match candidates against open job positions.

## 🚀 Key Features

- **Intelligent Resume Parsing**: Capable of extracting plain text, multi-column layouts, and tabular data from PDFs using `PyMuPDF` and `pdfplumber`, backed by an OCR fallback using `pytesseract` and `OpenCV`.
- **Skill Extraction & Normalization**: Automatically identifies key skills from candidate profiles and normalizes them against an internal skill registry.
- **Candidate Matching & Ranking**: Utilizes Vector Embeddings (`ChromaDB` & `Sentence Transformers`) to contextually map candidates to roles rather than relying purely on keyword matching.
- **Dynamic Dashboard**: Includes an Open Positions Management dashboard, featuring batch-matching and multi-job assignment using concurrent asynchronous processing.
- **Generative AI Insights**: Integrated with Groq and OpenAI APIs to generate natural-language candidate summaries and professional feedback.
- **Modern UI Edge**: A highly responsive, fast, and visually appealing React frontend created with Vite and styled using Tailwind CSS.

## 🛠️ Technology Stack

### Backend
- **Framework**: FastAPI (python-multipart, uvicorn)
- **Vector Database**: ChromaDB
- **Machine Learning / NLP**: Sentence Transformers
- **Document Processing**: pdfplumber, PyMuPDF, OpenCV, pytesseract, python-docx, reportlab
- **LLM APIs**: Groq, OpenAI

### Frontend
- **Core**: React 19, Vite
- **Styling**: Tailwind CSS
- **Routing**: React Router DOM
- **HTTP Client**: Axios
- **Iconography**: Lucide React

## 📦 Getting Started

### Prerequisites
- **Python 3.9+**
- **Node.js 18+**
- **Tesseract OCR**: Needs to be installed on your system to handle image-based resume formats.

### Local Development Setup

#### 1. Backend Server

1. Navigate to the backend directory:
   ```bash
   cd backend
   ```
2. Create and activate a Python virtual environment:
   ```bash
   python -m venv venv
   # On Windows: venv\Scripts\activate
   # On macOS/Linux: source venv/bin/activate
   ```
3. Install backend dependencies:
   ```bash
   pip install -r requirements.txt
   ```
4. Set up Environment Variables:
   Create a `.env` file inside the `backend` directory and add your API keys:
   ```env
   GROQ_API_KEY=your_groq_api_key_here
   # Include any additional required variables
   ```
5. Start the FastAPI development server:
   ```bash
   uvicorn main:app --reload
   ```

#### 2. Frontend Application

1. Navigate to the frontend directory:
   ```bash
   cd frontend
   ```
2. Install frontend dependencies:
   ```bash
   npm install
   ```
3. Run the development server:
   ```bash
   npm run dev
   ```

## 📂 Project Structure

```text
SkillSyncAI/
├── backend/                  # Python FastAPI Backend
│   ├── main.py               # Application entry point & API routes
│   ├── parser.py             # Logic for parsing resumes (PDF/DOCX)
│   ├── table_extractor.py    # Pipeline for tabular PDF extraction
│   ├── matcher.py            # Matching and ranking algorithms
│   ├── vector_store.py       # ChromaDB interactions
│   └── requirements.txt      # Backend Python dependencies
│
└── frontend/                 # React Frontend Interface
    ├── src/
    │   ├── components/       # Reusable UI components
    │   ├── pages/            # View-level components
    │   └── api.js            # Axios endpoint definitions
    ├── package.json          # Node dependencies
    └── vite.config.js        # Vite bundler configuration
```

## 🤝 Contributing
Contributions are more than welcome. Please make sure to branch out from the main branch, appropriately test your code, and maintain consistent styling standards across the frontend and backend.
