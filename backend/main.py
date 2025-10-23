from fastapi import FastAPI, WebSocket, WebSocketDisconnect
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from contextlib import asynccontextmanager
import asyncio
import json
from typing import List, Dict, Any

from app.core.config import settings
from app.core.database import init_db, get_db
from app.routers import auth, chat, analytics, gamification, teacher
from app.services.chatbot_service import ChatbotService
from app.services.websocket_manager import ConnectionManager

# Global services
chatbot_service = None
websocket_manager = ConnectionManager()

@asynccontextmanager
async def lifespan(app: FastAPI):
    # Startup
    await init_db()
    global chatbot_service
    chatbot_service = ChatbotService()
    await chatbot_service.initialize()
    yield
    # Shutdown
    if chatbot_service:
        await chatbot_service.cleanup()

app = FastAPI(
    title="EduMind API",
    description="AI-powered educational chatbot for personalized tutoring",
    version="1.0.0",
    lifespan=lifespan
)

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://localhost:5173"],  # React dev servers
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include routers
app.include_router(auth.router, prefix="/api/auth", tags=["authentication"])
app.include_router(chat.router, prefix="/api/chat", tags=["chat"])
app.include_router(analytics.router, prefix="/api/analytics", tags=["analytics"])
app.include_router(gamification.router, prefix="/api/gamification", tags=["gamification"])
app.include_router(teacher.router, prefix="/api/teacher", tags=["teacher"])

@app.get("/")
async def root():
    return {"message": "EduMind API is running", "version": "1.0.0"}

@app.get("/health")
async def health_check():
    return {"status": "healthy", "timestamp": asyncio.get_event_loop().time()}

@app.websocket("/ws/chat/{user_id}")
async def websocket_endpoint(websocket: WebSocket, user_id: str):
    await websocket_manager.connect(user_id, websocket)
    try:
        while True:
            data = await websocket.receive_text()
            try:
                message_data = json.loads(data)
                response = await chatbot_service.process_message(
                    user_id=user_id,
                    message=message_data.get("message", ""),
                    message_type=message_data.get("type", "text"),
                    language=message_data.get("language", "en")
                )

                await websocket_manager.send_message(user_id, {
                    "type": "response",
                    "data": response
                })
            except json.JSONDecodeError:
                await websocket_manager.send_message(user_id, {
                    "type": "error",
                    "data": {"error": "Invalid JSON format"}
                })
    except WebSocketDisconnect:
        await websocket_manager.disconnect(user_id)

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
