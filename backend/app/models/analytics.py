from sqlalchemy import Column, Integer, String, DateTime, Text, Boolean, Float, ForeignKey, JSON
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from app.core.database import Base

class AnalyticsEvent(Base):
    __tablename__ = "analytics_events"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    event_type = Column(String, nullable=False)  # login, chat_start, question_asked, etc.
    event_data = Column(JSON)  # Additional event-specific data
    timestamp = Column(DateTime(timezone=True), server_default=func.now())
    session_id = Column(String)  # Browser/device session
    ip_address = Column(String)
    user_agent = Column(String)

    # Relationships
    user = relationship("User")

class SubjectAnalytics(Base):
    __tablename__ = "subject_analytics"

    id = Column(Integer, primary_key=True, index=True)
    subject = Column(String, nullable=False)
    total_users = Column(Integer, default=0)
    total_sessions = Column(Integer, default=0)
    average_session_duration = Column(Float)
    most_asked_topics = Column(JSON)  # Top 10 most frequently asked topics
    difficulty_distribution = Column(JSON)  # Distribution of difficulty levels
    success_rate = Column(Float)  # Overall success rate for this subject
    common_mistakes = Column(JSON)  # Most common incorrect answers
    improvement_areas = Column(JSON)  # Areas where students struggle most
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())

class TeacherReport(Base):
    __tablename__ = "teacher_reports"

    id = Column(Integer, primary_key=True, index=True)
    teacher_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    report_type = Column(String, nullable=False)  # daily, weekly, monthly, custom
    date_range_start = Column(DateTime(timezone=True), nullable=False)
    date_range_end = Column(DateTime(timezone=True), nullable=False)
    total_students = Column(Integer, default=0)
    active_students = Column(Integer, default=0)
    total_sessions = Column(Integer, default=0)
    average_engagement = Column(Float)
    subject_performance = Column(JSON)  # Performance by subject
    learning_trends = Column(JSON)  # Learning patterns and trends
    recommendations = Column(JSON)  # AI-generated recommendations
    generated_at = Column(DateTime(timezone=True), server_default=func.now())

    # Relationships
    teacher = relationship("User")
