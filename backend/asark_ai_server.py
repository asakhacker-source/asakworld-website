"""Local ASARK AI proxy. The browser communicates only with this Flask server."""
import json
import logging
import re
import time
from urllib.parse import urlsplit

import requests
from flask import Flask, g, jsonify, request
from flask_cors import CORS
from site_context import PAGE_SECTIONS, PAGE_TITLES, SITE_CONTEXT

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger("asark-ai-server")
app = Flask(__name__)

CORS(app, resources={r"/api/asark-ai/*": {"origins": [
    "http://127.0.0.1:5500", "http://localhost:5500",
    "http://127.0.0.1:8000", "http://localhost:8000"
]}})

OLLAMA_URL = "http://127.0.0.1:11434/api/chat"
MODEL_NAME = "qwen3:8b"
MAX_REQUEST_SIZE = 1024 * 1024
MAX_MESSAGES = 20
MAX_MODEL_HISTORY = 10
MAX_CONTENT_LENGTH = 4000
OLLAMA_CONNECT_TIMEOUT = 5
OLLAMA_READ_TIMEOUT = 180
SYSTEM_PROMPT = """You are ASARK AI, the website and technology assistant for ASARK World.

Your job has two roles:
1. Help visitors understand and navigate ASARK World.
2. Answer educational questions about technology.

ASARK covers Artificial Intelligence, Machine Learning, Deep Learning, Generative AI, Large Language Models, Semiconductors, VLSI, Electronics, Programming, Space Technology, Market Technology, Computing, Robotics, and emerging technologies.

When users ask where something is on the website, guide them using only the verified ASARK page map below. Use the exact route shown by that map if you provide a page link. Never output a full URL or invent a hostname; use only the exact path from the map. Never invent a route or link. The current page context, when provided, identifies the public page the visitor is viewing now. When users ask technical questions, explain them clearly and accurately. Do not claim access to pages, live data, or information that has not been provided to you. Do not invent articles, statistics, citations or ASARK features. If you do not know whether ASARK contains something, say so rather than inventing it. Keep answers to a few sentences unless the visitor asks for more detail."""
COMPACT_SITE_CONTEXT = "\n".join(f"{title}: {path}" for title, path in SITE_CONTEXT.items())
FINAL_SYSTEM_PROMPT = SYSTEM_PROMPT + "\n\nVerified ASARK page context (label: exact path):\n" + COMPACT_SITE_CONTEXT
MODEL_URL_PATTERN = re.compile(r"https?://[^\s<>\]\)]+", re.IGNORECASE)

def normalize_model_links(content):
    def replace_url(match):
        value = match.group(0)
        suffix = ""
        while value and value[-1] in ".,!?:;":
            suffix = value[-1] + suffix
            value = value[:-1]
        path = urlsplit(value).path
        return (path if path in PAGE_TITLES else "[external link omitted]") + suffix

    return MODEL_URL_PATTERN.sub(replace_url, content)

@app.before_request
def start_request_timer():
    g.asark_request_started = time.perf_counter()
    if app.debug and request.path.startswith("/api/asark-ai/"):
        logger.info("Request received: %s %s", request.method, request.path)

@app.after_request
def log_request_duration(response):
    started = getattr(g, "asark_request_started", None)
    if app.debug and started is not None and request.path.startswith("/api/asark-ai/"):
        logger.info("Request completed: %s %s status=%s total_ms=%.1f",
                    request.method, request.path, response.status_code,
                    (time.perf_counter() - started) * 1000)
    return response

@app.before_request
def limit_request_size():
    if request.content_length is not None and request.content_length > MAX_REQUEST_SIZE:
        return jsonify({"error": "Request body too large"}), 413

@app.get("/api/asark-ai/health")
def health_check():
    try:
        response = requests.get("http://127.0.0.1:11434/", timeout=2)
        if response.ok:
            return jsonify({"status": "ok", "model": MODEL_NAME})
    except requests.RequestException as error:
        logger.error("Health check failed: %s", error)
    return jsonify({"status": "unavailable", "error": "Ollama not reachable"}), 503

@app.post("/api/asark-ai/chat")
def chat():
    data = request.get_json(silent=True)
    if not isinstance(data, dict) or not isinstance(data.get("messages"), list):
        return jsonify({"error": "Missing messages in request"}), 400
    user_messages = data["messages"]
    if len(user_messages) > MAX_MESSAGES:
        return jsonify({"error": "Too many messages in conversation history"}), 400
    messages = [{"role": "system", "content": FINAL_SYSTEM_PROMPT}]
    page_context = data.get("page_context")
    if isinstance(page_context, dict):
        page_path = page_context.get("path")
        verified_title = PAGE_TITLES.get(page_path) if isinstance(page_path, str) else None
        if verified_title:
            current_page = {"title": verified_title, "path": page_path}
            current_page["section"] = PAGE_SECTIONS.get(page_path, "ASARK")
            messages.append({
                "role": "system",
                "content": "The visitor is currently viewing this verified public ASARK page: " + json.dumps(current_page),
            })
    for message in user_messages[-MAX_MODEL_HISTORY:]:
        if not isinstance(message, dict) or message.get("role") not in {"user", "assistant"} or not isinstance(message.get("content"), str):
            continue
        messages.append({"role": message["role"], "content": message["content"][:MAX_CONTENT_LENGTH]})
    ollama_started = time.perf_counter()
    if app.debug:
        logger.info("Ollama request started: model=%s history_messages=%d prompt_chars=%d",
                    MODEL_NAME, len(messages) - 1,
                    sum(len(message["content"]) for message in messages))
    try:
        response = requests.post(
            OLLAMA_URL,
            json={
                "model": MODEL_NAME,
                "messages": messages,
                "stream": False,
                "think": False,
                "options": {"num_predict": 512},
            },
            timeout=(OLLAMA_CONNECT_TIMEOUT, OLLAMA_READ_TIMEOUT),
        )
        response.raise_for_status()
        content = response.json()["message"]["content"]
        if not isinstance(content, str):
            raise TypeError("Invalid model response")
        content = normalize_model_links(content)
        if app.debug:
            logger.info("Ollama response completed: duration_ms=%.1f",
                        (time.perf_counter() - ollama_started) * 1000)
        return jsonify({"content": content})
    except requests.Timeout:
        logger.error("Ollama request timed out after %.1fs",
                     time.perf_counter() - ollama_started)
        return jsonify({"error": "AI model timed out"}), 504
    except (requests.RequestException, KeyError, TypeError, ValueError) as error:
        logger.error("Ollama request error: %s", error)
        return jsonify({"error": "AI backend communication error"}), 502

if __name__ == "__main__":
    app.run(host="127.0.0.1", port=5000, debug=True)
