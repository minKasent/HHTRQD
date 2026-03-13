from decimal import Decimal

from sqlalchemy import ForeignKey, Numeric, UniqueConstraint
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.database import Base


class CriteriaComparison(Base):
    __tablename__ = "criteria_comparisons"

    id: Mapped[int] = mapped_column(primary_key=True, autoincrement=True)
    session_id: Mapped[int] = mapped_column(ForeignKey("decision_sessions.id", ondelete="CASCADE"), nullable=False, index=True)
    criteria_i_id: Mapped[int] = mapped_column(ForeignKey("criteria.id"), nullable=False)
    criteria_j_id: Mapped[int] = mapped_column(ForeignKey("criteria.id"), nullable=False)
    value: Mapped[Decimal] = mapped_column(Numeric(5, 3), nullable=False)

    session = relationship("DecisionSession", back_populates="criteria_comparisons")
    criteria_i = relationship("Criteria", foreign_keys=[criteria_i_id])
    criteria_j = relationship("Criteria", foreign_keys=[criteria_j_id])

    __table_args__ = (
        UniqueConstraint("session_id", "criteria_i_id", "criteria_j_id", name="uq_criteria_comparison"),
    )


class AlternativeComparison(Base):
    __tablename__ = "alternative_comparisons"

    id: Mapped[int] = mapped_column(primary_key=True, autoincrement=True)
    session_id: Mapped[int] = mapped_column(ForeignKey("decision_sessions.id", ondelete="CASCADE"), nullable=False, index=True)
    criteria_id: Mapped[int] = mapped_column(ForeignKey("criteria.id"), nullable=False)
    housing_i_id: Mapped[int] = mapped_column(ForeignKey("housings.id", ondelete="CASCADE"), nullable=False)
    housing_j_id: Mapped[int] = mapped_column(ForeignKey("housings.id", ondelete="CASCADE"), nullable=False)
    value: Mapped[Decimal] = mapped_column(Numeric(5, 3), nullable=False)

    session = relationship("DecisionSession", back_populates="alternative_comparisons")
    criteria = relationship("Criteria", foreign_keys=[criteria_id])
    housing_i = relationship("Housing", foreign_keys=[housing_i_id])
    housing_j = relationship("Housing", foreign_keys=[housing_j_id])

    __table_args__ = (
        UniqueConstraint("session_id", "criteria_id", "housing_i_id", "housing_j_id", name="uq_alternative_comparison"),
    )
