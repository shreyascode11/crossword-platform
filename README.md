# Crossword Platform

A full-stack academic web application where teachers create crossword
puzzles and students solve them interactively.

## Features

### Teacher Portal
- Create puzzles manually (word + clue entry)
- Upload PDF/DOCX documents and auto-generate puzzles using GenAI (Groq)
- Set difficulty, number of questions, and topic hints
- Preview puzzles with answers before publishing
- Manage students via CSV upload
- View leaderboard and analytics per puzzle
- Export puzzle data

### Student Portal
- Solve crossword puzzles interactively
- Cell-by-cell keyboard navigation
- Hint system (reveal letter / reveal word)
- Timer with pause on tab switch
- Submit and view leaderboard ranking
- View personal attempt history and stats

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React (Vite) + Tailwind CSS |
| Backend | Django + Django REST Framework |
| Database | SQLite |
| AI Generation | Groq API (llama-3.3-70b-versatile) |
| Document Parsing | pdfplumber + python-docx |

## Getting Started

### Prerequisites
- Python 3.10+
- Node.js 18+
- Groq API key from console.groq.com

### Backend Setup
```bash
cd backend
pip install -r requirements.txt
python manage.py migrate
python manage.py runserver
```

Set your Groq API key:
```bash
echo 'export GROQ_API_KEY=your_key_here' >> ~/.zshrc
source ~/.zshrc
```

### Frontend Setup
```bash
cd frontend-test
npm install
npm run dev
```

Frontend: http://localhost:5173
Backend: http://localhost:8000

## User Roles

- **Admin** → Creates teacher accounts via Django admin
- **Teacher** → Creates puzzles, manages students, views analytics
- **Student** → Solves puzzles, views leaderboard and personal stats

## Environment Variables

| Variable | Required | Description |
|----------|----------|-------------|
| GROQ_API_KEY | Yes | Groq API key for GenAI generation |
