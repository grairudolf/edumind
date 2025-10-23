from sqlalchemy import Column, Integer, String, DateTime, Text, Boolean, Float, ForeignKey, JSON
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from app.core.database import Base

# Note: ChatSession and Message models are already defined in user.py
# This file contains additional session-related models

class SessionAnalytics(Base):
    __tablename__ = "session_analytics"

    id = Column(Integer, primary_key=True, index=True)
    session_id = Column(Integer, ForeignKey("chat_sessions.id"), nullable=False)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    total_messages = Column(Integer, default=0)
    total_response_time = Column(Float, default=0.0)
    average_sentiment = Column(String)
    topics_covered = Column(JSON)  # List of topics discussed
    difficulty_progression = Column(JSON)  # How difficulty changed over time
    learning_objectives_met = Column(Integer, default=0)
    total_learning_objectives = Column(Integer, default=0)
    engagement_score = Column(Float)  # 0-100 based on interaction patterns
    session_duration = Column(Float)  # in minutes
    completed_at = Column(DateTime(timezone=True))
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    # Relationships
    session = relationship("ChatSession")
    user = relationship("User")

class LearningPath(Base):
    __tablename__ = "learning_paths"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    subject = Column(String, nullable=False)
    current_topic = Column(String)
    next_topics = Column(JSON)  # Recommended next topics
    completed_topics = Column(JSON)  # Topics already mastered
    struggling_topics = Column(JSON)  # Topics needing more practice
    adaptive_difficulty = Column(String, default="medium")
    learning_pace = Column(String, default="normal")  # slow, normal, fast
    preferred_explanation_style = Column(String, default="detailed")
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())

    # Relationships
    user = relationship("User")
