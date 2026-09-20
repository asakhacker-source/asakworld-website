
# ASARK AI Assistant - Local Development Guide

This guide explains how to set up and run the ASARK AI Chatbot locally.

## Prerequisites
- [Ollama](https://ollama.com/) installed on Windows.
- Python 3.x installed.
- `flask`, `flask-cors`, and `requests` libraries installed.

## Step-by-Step Setup

### 1. Verify Ollama Installation
Open PowerShell or CMD and run:
```powershell
ollama list
```
Ensure `qwen3:8b` is in the list. If not, pull it:
```powershell
ollama pull qwen3:8b
```

### 2. Test Ollama API
Verify Ollama is responding:
```powershell
curl.exe http://localhost:11434
```
Expected response: `Ollama is running`

### 3. Start the Backend Server
Navigate to the project root and run:
```powershell
pip install flask flask-cors requests
python backend/asark_ai_server.py
```
The server will start at `http://127.0.0.1:5000`.

### 4. Start the Frontend
Use a local server (e.g., Python's built-in server) from the project root:
```powershell
python -m http.server 8000
```
Open the browser to: `http://localhost:8000/ai-technology.html`

## Architecture
- **Frontend**: `http://localhost:8000` $\rightarrow$ Calls `/api/asark-ai/...`
- **Backend**: `http://localhost:5000` $\rightarrow$ Proxies requests to Ollama
- **Ollama**: `http://localhost:11434` $\rightarrow$ Runs `qwen3:8b`

## Important Notes
- **Local Only**: This chatbot is configured for local development. Do NOT expose port 11434 or 5000 to the public internet.
- **CORS**: The backend is configured to only accept requests from `http://127.0.0.1:8000` and `http://localhost:8000`.
- **Production**: Production hosting will require a secure cloud-hosted LLM API or a dedicated GPU server with a secure gateway.
