from datetime import datetime

from sqlalchemy import Boolean, DateTime, ForeignKey, Integer, Numeric, String, Text, UniqueConstraint
from sqlalchemy.dialects.postgresql import JSONB
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.database import Base


class DecisionSession(Base):
    __tablename__ = "decision_sessions"

    id: Mapped[int] = mapped_column(primary_key=True, autoincrement=True)
    user_id: Mapped[int] = mapped_column(ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)
    name: Mapped[str] = mapped_column(String(255), nullable=False)
    description: Mapped[str | None] = mapped_column(Text, nullable=True)
    status: Mapped[str] = mapped_column(String(20), default="draft")
    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)
    completed_at: Mapped[datetime | None] = mapped_column(DateTime, nullable=True)

    user = relationship("User", back_populates="decision_sessions")
    session_housings = relationship("SessionHousing", back_populates="session", cascade="all, delete-orphan")
    session_criteria = relationship("SessionCriteria", back_populates="session", cascade="all, delete-orphan")
    criteria_comparisons = relationship("CriteriaComparison", back_populates="session", cascade="all, delete-orphan")
    alternative_comparisons = relationship("AlternativeComparison", back_populates="session", cascade="all, delete-orphan")
    results = relationship("AHPResult", back_populates="session", cascade="all, delete-orphan")


class SessionHousing(Base):
    __tablename__ = "session_housings"

    id: Mapped[int] = mapped_column(primary_key=True, autoincrement=True)
    session_id: Mapped[int] = mapped_column(ForeignKey("decision_sessions.id", ondelete="CASCADE"), nullable=False)
    housing_id: Mapped[int] = mapped_column(ForeignKey("housings.id", ondelete="CASCADE"), nullable=False)

    session = relationship("DecisionSession", back_populates="session_housings")
    housing = relationship("Housing")

    __table_args__ = (
        UniqueConstraint("session_id", "housing_id", name="uq_session_housing"),
    )


class SessionCriteria(Base):
    __tablename__ = "session_criteria"

    id: Mapped[int] = mapped_column(primary_key=True, autoincrement=True)
    session_id: Mapped[int] = mapped_column(ForeignKey("decision_sessions.id", ondelete="CASCADE"), nullable=False)
    criteria_id: Mapped[int] = mapped_column(ForeignKey("criteria.id", ondelete="CASCADE"), nullable=False)

    session = relationship("DecisionSession", back_populates="session_criteria")
    criteria = relationship("Criteria")

    __table_args__ = (
        UniqueConstraint("session_id", "criteria_id", name="uq_session_criteria"),
    )


class AHPResult(Base):
    __tablename__ = "ahp_results"

    id: Mapped[int] = mapped_column(primary_key=True, autoincrement=True)
    session_id: Mapped[int] = mapped_column(ForeignKey("decision_sessions.id", ondelete="CASCADE"), nullable=False, index=True)
    housing_id: Mapped[int] = mapped_column(ForeignKey("housings.id", ondelete="CASCADE"), nullable=False)
    criteria_weights: Mapped[dict | None] = mapped_column(JSONB, nullable=True)
    alternative_scores: Mapped[dict | None] = mapped_column(JSONB, nullable=True)
    final_score: Mapped[float] = mapped_column(Numeric(10, 6), nullable=False)
    ranking: Mapped[int] = mapped_column(Integer, nullable=False)
    consistency_ratio: Mapped[float] = mapped_column(Numeric(10, 6), nullable=True)
    is_consistent: Mapped[bool | None] = mapped_column(Boolean, nullable=True)
    calculated_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)

    session = relationship("DecisionSession", back_populates="results")
    housing = relationship("Housing")
