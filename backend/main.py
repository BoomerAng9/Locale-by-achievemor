"""
Locale by ACHIEVEMOR - Backend API Server
Cloud Run Deployment Ready

This backend handles:
- Storage event webhooks (Eventarc)
- AI Companion API integration
- Business harvester triggers
- Stripe webhook forwarding

Environment Variables:
- PORT: Cloud Run port (default 8080)
- GCP_PROJECT_ID: Google Cloud Project ID
- STORAGE_BUCKET: GCS bucket for file uploads
- GEMINI_API_KEY: For AI Companion integration
"""

import os
import json
import logging
from datetime import datetime
from flask import Flask, request, jsonify
from flask_cors import CORS

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

app = Flask(__name__)
CORS(app)

# ============================================
# CONFIGURATION
# ============================================

PORT = int(os.environ.get("PORT", 8080))
GCP_PROJECT_ID = os.environ.get("GCP_PROJECT_ID", "locale-by-achievemor")
STORAGE_BUCKET = os.environ.get("STORAGE_BUCKET", "locale-uploads")

# ============================================
# HEALTH CHECK
# ============================================

@app.route("/", methods=["GET"])
def health_check():
    """Health check endpoint for Cloud Run"""
    return jsonify({
        "status": "healthy",
        "service": "Locale Backend API",
        "version": "1.0.0",
        "timestamp": datetime.utcnow().isoformat(),
        "project": GCP_PROJECT_ID
    })

@app.route("/health", methods=["GET"])
def health():
    """Alias health endpoint"""
    return health_check()

# ============================================
# STORAGE EVENT WEBHOOK (Eventarc)
# ============================================

@app.route("/webhook/storage", methods=["POST"])
def storage_webhook():
    """
    Handle Cloud Storage events via Eventarc
    Triggers when files are uploaded to the bucket
    """
    try:
        # Parse CloudEvent
        ce_type = request.headers.get("Ce-Type", "")
        ce_source = request.headers.get("Ce-Source", "")
        ce_subject = request.headers.get("Ce-Subject", "")
        
        logger.info(f"Storage event received: {ce_type}")
        logger.info(f"Source: {ce_source}, Subject: {ce_subject}")
        
        # Parse the event data
        event_data = request.get_json(silent=True) or {}
        
        # Extract file information
        bucket = event_data.get("bucket", "")
        name = event_data.get("name", "")
        content_type = event_data.get("contentType", "")
        size = event_data.get("size", 0)
        
        logger.info(f"File uploaded: gs://{bucket}/{name}")
        logger.info(f"Content-Type: {content_type}, Size: {size} bytes")
        
        # Process based on file type
        if content_type.startswith("image/"):
            # Trigger image processing (e.g., profile photos)
            result = process_image_upload(bucket, name, event_data)
        elif content_type.startswith("application/pdf"):
            # Trigger document processing (e.g., verification docs)
            result = process_document_upload(bucket, name, event_data)
        elif content_type.startswith("video/"):
            # Trigger video processing (e.g., Kie.ai generation)
            result = process_video_upload(bucket, name, event_data)
        else:
            result = {"action": "stored", "file": name}
        
        return jsonify({
            "success": True,
            "event_type": ce_type,
            "file": f"gs://{bucket}/{name}",
            "result": result
        }), 200
        
    except Exception as e:
        logger.error(f"Storage webhook error: {str(e)}")
        return jsonify({"error": str(e)}), 500

def process_image_upload(bucket: str, name: str, data: dict) -> dict:
    """Process uploaded images (thumbnails, optimization)"""
    logger.info(f"Processing image: {name}")
    # TODO: Integrate with Cloud Vision API for moderation
    # TODO: Generate thumbnails via Cloud Functions
    return {"action": "image_processed", "file": name}

def process_document_upload(bucket: str, name: str, data: dict) -> dict:
    """Process uploaded documents (OCR, verification)"""
    logger.info(f"Processing document: {name}")
    # TODO: Integrate with Document AI for OCR
    # TODO: Trigger Ballerine verification flow
    return {"action": "document_queued", "file": name}

def process_video_upload(bucket: str, name: str, data: dict) -> dict:
    """Process uploaded videos (transcoding, AI analysis)"""
    logger.info(f"Processing video: {name}")
    # TODO: Trigger transcoding via Cloud Video Transcoder
    return {"action": "video_queued", "file": name}

# ============================================
# AI COMPANION API (Gemini via Vertex AI)
# ============================================

@app.route("/api/ai/chat", methods=["POST"])
def ai_chat():
    """
    AI Chat endpoint using Gemini via Vertex AI
    Wired to II-Agent / ACHEEVY ecosystem
    """
    try:
        data = request.get_json()
        message = data.get("message", "")
        context = data.get("context", "general")
        history = data.get("history", [])
        
        if not message:
            return jsonify({"error": "Message required"}), 400
        
        # Try Vertex AI Gemini first
        try:
            import google.auth
            from google.cloud import aiplatform
            from google.protobuf import json_format
            from google.protobuf.struct_pb2 import Value
            
            # Initialize Vertex AI
            aiplatform.init(project=GCP_PROJECT_ID, location="us-central1")
            
            # Use Gemini model via Vertex AI
            from vertexai.generative_models import GenerativeModel, Part
            
            model = GenerativeModel("gemini-2.0-flash-exp")
            
            # Build prompt with context
            system_prompt = f"""You are ACHEEVY, an intelligent AI assistant for the Locale platform.
You help users with:
- Finding local professionals and services
- Managing tasks and projects
- Business intelligence and analytics
- Code generation and technical help

Context: {context}
User query: {message}

Respond helpfully and concisely."""
            
            response = model.generate_content(system_prompt)
            
            ai_response = response.text if response.text else "I'm processing your request..."
            
            return jsonify({
                "response": ai_response,
                "model": "gemini-2.0-flash-exp",
                "context": context,
                "agent": "ACHEEVY",
                "tokens": {
                    "input": len(message.split()),
                    "output": len(ai_response.split()),
                    "total": len(message.split()) + len(ai_response.split())
                }
            }), 200
            
        except Exception as vertex_error:
            logger.warning(f"Vertex AI unavailable, using fallback: {str(vertex_error)}")
            
            # Fallback response when Vertex AI is not configured
            response = {
                "response": f"[ACHEEVY] Processing: {message[:200]}{'...' if len(message) > 200 else ''}\n\nI'm currently in setup mode. Once Vertex AI credentials are configured, I'll provide intelligent responses powered by Gemini 2.0 Flash.",
                "model": "fallback",
                "context": context,
                "agent": "ACHEEVY",
                "tokens": {
                    "input": len(message.split()),
                    "output": 50,
                    "total": len(message.split()) + 50
                }
            }
            
            return jsonify(response), 200
        
    except Exception as e:
        logger.error(f"AI chat error: {str(e)}")
        return jsonify({"error": str(e)}), 500

# ============================================
# II-AGENT RESEARCH ENDPOINT
# ============================================

@app.route("/api/ai/research", methods=["POST"])
def ai_research():
    """
    Research endpoint using II-Researcher pattern
    """
    try:
        data = request.get_json()
        query = data.get("query", "")
        depth = data.get("depth", "shallow")
        
        if not query:
            return jsonify({"error": "Query required"}), 400
        
        # Mock research results for now
        return jsonify({
            "summary": f"Research results for: {query}",
            "sources": [
                {"url": "https://example.com", "title": "Source 1", "snippet": "Relevant information..."}
            ],
            "depth": depth
        }), 200
        
    except Exception as e:
        logger.error(f"Research error: {str(e)}")
        return jsonify({"error": str(e)}), 500

# ============================================
# II-AGENT CODE ENDPOINT
# ============================================

@app.route("/api/ai/code", methods=["POST"])
def ai_code():
    """
    Code generation endpoint
    """
    try:
        data = request.get_json()
        task = data.get("task", "")
        language = data.get("language", "python")
        
        if not task:
            return jsonify({"error": "Task required"}), 400
        
        # Mock code generation for now
        return jsonify({
            "code": f"# Generated code for: {task}\n# Language: {language}\nprint('Hello from ACHEEVY!')",
            "language": language,
            "output": None
        }), 200
        
    except Exception as e:
        logger.error(f"Code generation error: {str(e)}")
        return jsonify({"error": str(e)}), 500

# ============================================
# BUSINESS HARVESTER TRIGGER
# ============================================

@app.route("/api/harvest/trigger", methods=["POST"])
def trigger_harvest():
    """
    Trigger business harvester for a specific city
    """
    try:
        data = request.get_json()
        city = data.get("city", "")
        state = data.get("state", "")
        industry = data.get("industry", "General Services")
        
        if not city or not state:
            return jsonify({"error": "City and state required"}), 400
        
        logger.info(f"Harvesting businesses in {city}, {state} - Industry: {industry}")
        
        # TODO: Trigger Cloud Function for actual harvesting
        # For now, return mock data
        return jsonify({
            "success": True,
            "city": city,
            "state": state,
            "industry": industry,
            "status": "harvest_queued",
            "estimated_leads": 50
        }), 200
        
    except Exception as e:
        logger.error(f"Harvest trigger error: {str(e)}")
        return jsonify({"error": str(e)}), 500

# ============================================
# STRIPE WEBHOOK PROXY
# ============================================

@app.route("/webhook/stripe", methods=["POST"])
def stripe_webhook_proxy():
    """
    Proxy Stripe webhooks to Firebase Functions
    This allows Cloud Run to handle initial validation
    """
    try:
        signature = request.headers.get("Stripe-Signature", "")
        payload = request.get_data(as_text=True)
        
        logger.info("Stripe webhook received")
        
        # TODO: Forward to Firebase Function or process directly
        # For now, acknowledge receipt
        return jsonify({"received": True}), 200
        
    except Exception as e:
        logger.error(f"Stripe webhook error: {str(e)}")
        return jsonify({"error": str(e)}), 500

# ============================================
# EVENTARC INTEGRATION ENDPOINT
# ============================================

@app.route("/eventarc/receive", methods=["POST"])
def eventarc_receive():
    """
    Generic Eventarc receiver for Cloud Events
    Handles events from various GCP services
    """
    try:
        # Parse CloudEvent headers
        headers = {
            "ce-id": request.headers.get("Ce-Id"),
            "ce-type": request.headers.get("Ce-Type"),
            "ce-source": request.headers.get("Ce-Source"),
            "ce-specversion": request.headers.get("Ce-Specversion"),
            "ce-time": request.headers.get("Ce-Time"),
            "ce-subject": request.headers.get("Ce-Subject"),
        }
        
        logger.info(f"Eventarc event: {headers['ce-type']}")
        
        data = request.get_json(silent=True) or {}
        
        # Route based on event type
        event_type = headers.get("ce-type", "")
        
        if "storage" in event_type.lower():
            return storage_webhook()
        elif "firestore" in event_type.lower():
            return handle_firestore_event(data, headers)
        elif "pubsub" in event_type.lower():
            return handle_pubsub_event(data, headers)
        else:
            logger.warning(f"Unhandled event type: {event_type}")
            return jsonify({"status": "acknowledged", "type": event_type}), 200
            
    except Exception as e:
        logger.error(f"Eventarc error: {str(e)}")
        return jsonify({"error": str(e)}), 500

def handle_firestore_event(data: dict, headers: dict) -> tuple:
    """Handle Firestore document events"""
    logger.info(f"Firestore event: {headers.get('ce-subject')}")
    return jsonify({"status": "firestore_processed"}), 200

def handle_pubsub_event(data: dict, headers: dict) -> tuple:
    """Handle Pub/Sub message events"""
    logger.info(f"Pub/Sub event received")
    return jsonify({"status": "pubsub_processed"}), 200

# ============================================
# MAIN ENTRY POINT
# ============================================

if __name__ == "__main__":
    logger.info(f"Starting Locale Backend API on port {PORT}")
    logger.info(f"Project: {GCP_PROJECT_ID}")
    logger.info(f"Storage Bucket: {STORAGE_BUCKET}")
    
    # Run the Flask app
    # Cloud Run sets PORT env var automatically
    app.run(host="0.0.0.0", port=PORT, debug=False)
