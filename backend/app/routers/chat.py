from fastapi import APIRouter, Depends, HTTPException, WebSocket, WebSocketDisconnect
from sqlalchemy.ext.asyncio import AsyncSession
from typing import List, Dict, Any
import json
import asyncio

from app.core.database import get_db
from app.models.user import User, ChatSession, Message
from app.models.analytics import LearningAnalytics
from app.services.chatbot_service import ChatbotService
from app.services.websocket_manager import ConnectionManager
from app.core.config import get_settings

router = APIRouter()
settings = get_settings()
chatbot_service = ChatbotService()
websocket_manager = ConnectionManager()

@router.post("/send")
async def send_message(
    message_data: Dict[str, Any],
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """Send a message to the chatbot"""
    try:
        user_id = str(current_user.id)
        message = message_data.get("message", "")
        message_type = message_data.get("type", "text")
        language = message_data.get("language", "en")
        session_id = message_data.get("session_id")

        if not message.strip():
            raise HTTPException(status_code=400, detail="Message cannot be empty")

        # Process message with chatbot service
        response = await chatbot_service.process_message(
            user_id=user_id,
            message=message,
            message_type=message_type,
            language=language,
            session_id=session_id
        )

        # Save message to database
        await save_chat_message(db, current_user.id, message, message_type, language, session_id, is_user=True)

        # Save bot response to database
        bot_message = response.get("response", "")
        await save_chat_message(db, current_user.id, bot_message, "text", language, session_id, is_user=False)

        # Send response via websocket if user is connected
        await websocket_manager.send_message(user_id, {
            "type": "chat_response",
            "data": response
        })

        return response

    except Exception as e:
        logger.error(f"Error sending message: {e}")
        raise HTTPException(status_code=500, detail="Failed to process message")

@router.post("/sessions")
async def create_chat_session(
    session_data: Dict[str, Any],
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """Create a new chat session"""
    try:
        title = session_data.get("title", "New Chat Session")
        subject = session_data.get("subject")
        difficulty_level = session_data.get("difficulty_level", "beginner")
        language = session_data.get("language", "en")

        # Create new session
        new_session = ChatSession(
            user_id=current_user.id,
            title=title,
            subject=subject,
            difficulty_level=difficulty_level,
            language=language,
            is_active=True
        )

        db.add(new_session)
        await db.commit()
        await db.refresh(new_session)

        return {
            "id": new_session.id,
            "title": new_session.title,
            "subject": new_session.subject,
            "difficulty_level": new_session.difficulty_level,
            "language": new_session.language,
            "started_at": new_session.started_at.isoformat() if new_session.started_at else None
        }

    except Exception as e:
        logger.error(f"Error creating chat session: {e}")
        raise HTTPException(status_code=500, detail="Failed to create chat session")

@router.get("/sessions")
async def get_chat_sessions(
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """Get user's chat sessions"""
    try:
        sessions = await db.query(ChatSession).filter(
            ChatSession.user_id == current_user.id
        ).order_by(ChatSession.started_at.desc()).all()

        return [
            {
                "id": session.id,
                "title": session.title,
                "subject": session.subject,
                "difficulty_level": session.difficulty_level,
                "language": session.language,
                "is_active": session.is_active,
                "started_at": session.started_at.isoformat() if session.started_at else None,
                "ended_at": session.ended_at.isoformat() if session.ended_at else None
            }
            for session in sessions
        ]

    except Exception as e:
        logger.error(f"Error getting chat sessions: {e}")
        raise HTTPException(status_code=500, detail="Failed to get chat sessions")

@router.get("/sessions/{session_id}")
async def get_chat_session(
    session_id: int,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """Get a specific chat session with messages"""
    try:
        session = await db.query(ChatSession).filter(
            ChatSession.id == session_id,
            ChatSession.user_id == current_user.id
        ).first()

        if not session:
            raise HTTPException(status_code=404, detail="Chat session not found")

        # Get messages for this session
        messages = await db.query(Message).filter(
            Message.session_id == session_id
        ).order_by(Message.created_at.asc()).all()

        return {
            "id": session.id,
            "title": session.title,
            "subject": session.subject,
            "difficulty_level": session.difficulty_level,
            "language": session.language,
            "is_active": session.is_active,
            "started_at": session.started_at.isoformat() if session.started_at else None,
            "ended_at": session.ended_at.isoformat() if session.ended_at else None,
            "messages": [
                {
                    "id": msg.id,
                    "content": msg.content,
                    "message_type": msg.message_type,
                    "is_user": msg.is_user,
                    "sentiment": msg.sentiment,
                    "confidence": msg.confidence,
                    "language": msg.language,
                    "response_time": msg.response_time,
                    "created_at": msg.created_at.isoformat() if msg.created_at else None
                }
                for msg in messages
            ]
        }

    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error getting chat session: {e}")
        raise HTTPException(status_code=500, detail="Failed to get chat session")

@router.post("/sessions/{session_id}/end")
async def end_chat_session(
    session_id: int,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """End a chat session"""
    try:
        session = await db.query(ChatSession).filter(
            ChatSession.id == session_id,
            ChatSession.user_id == current_user.id
        ).first()

        if not session:
            raise HTTPException(status_code=404, detail="Chat session not found")

        session.is_active = False
        session.ended_at = datetime.utcnow()

        await db.commit()

        return {"message": "Chat session ended successfully"}

    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error ending chat session: {e}")
        raise HTTPException(status_code=500, detail="Failed to end chat session")

@router.post("/voice")
async def process_voice_message(
    voice_data: Dict[str, Any],
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """Process voice message (speech-to-text)"""
    try:
        # This would integrate with speech recognition service
        # For now, return placeholder response
        return {
            "transcribed_text": "Voice message transcribed",
            "confidence": 0.95,
            "language": "en"
        }

    except Exception as e:
        logger.error(f"Error processing voice message: {e}")
        raise HTTPException(status_code=500, detail="Failed to process voice message")

@router.get("/analytics")
async def get_chat_analytics(
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """Get chat analytics for the user"""
    try:
        # Get user's analytics
        analytics = await db.query(LearningAnalytics).filter(
            LearningAnalytics.user_id == current_user.id
        ).order_by(LearningAnalytics.created_at.desc()).limit(100).all()

        return {
            "total_interactions": len(analytics),
            "recent_analytics": [
                {
                    "event_type": analytic.event_type,
                    "subject": analytic.subject,
                    "topic": analytic.topic,
                    "response_time": analytic.response_time,
                    "accuracy": analytic.accuracy,
                    "sentiment": analytic.sentiment,
                    "created_at": analytic.created_at.isoformat() if analytic.created_at else None
                }
                for analytic in analytics
            ]
        }

    except Exception as e:
        logger.error(f"Error getting chat analytics: {e}")
        raise HTTPException(status_code=500, detail="Failed to get chat analytics")

async def save_chat_message(db: AsyncSession, user_id: int, content: str, message_type: str,
                          language: str, session_id: int = None, is_user: bool = True):
    """Save a chat message to the database"""
    try:
        message = Message(
            user_id=user_id,
            content=content,
            message_type=message_type,
            is_user=is_user,
            language=language,
            session_id=session_id
        )

        db.add(message)
        await db.commit()
        await db.refresh(message)

        return message

    except Exception as e:
        logger.error(f"Error saving chat message: {e}")
        await db.rollback()
        raise

# WebSocket endpoint for real-time chat
@router.websocket("/ws/{user_id}")
async def websocket_endpoint(websocket: WebSocket, user_id: str):
    """WebSocket endpoint for real-time chat"""
    await websocket_manager.connect(user_id, websocket)
    try:
        while True:
            data = await websocket.receive_text()
            try:
                message_data = json.loads(data)

                # Process message with chatbot service
                response = await chatbot_service.process_message(
                    user_id=user_id,
                    message=message_data.get("message", ""),
                    message_type=message_data.get("type", "text"),
                    language=message_data.get("language", "en")
                )

                # Send response back
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
    except Exception as e:
        logger.error(f"WebSocket error: {e}")
        await websocket_manager.send_message(user_id, {
            "type": "error",
            "data": {"error": "Internal server error"}
        })
