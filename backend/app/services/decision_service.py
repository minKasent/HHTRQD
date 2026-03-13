from datetime import datetime
from typing import Any

from fastapi import HTTPException, status
from sqlalchemy import select, func, delete
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload

from app.models.comparison import AlternativeComparison, CriteriaComparison
from app.models.criteria import Criteria
from app.models.decision import AHPResult, DecisionSession, SessionCriteria, SessionHousing
from app.models.housing import Housing
from app.schemas.comparison import CriteriaComparisonCreate, AllAlternativeComparisonsCreate
from app.schemas.decision import SessionCreate
from app.services.ahp_service import AHPService


class DecisionService:
    @staticmethod
    async def get_sessions(db: AsyncSession, user_id: int) -> list[dict]:
        result = await db.execute(
            select(DecisionSession)
            .where(DecisionSession.user_id == user_id)
            .options(selectinload(DecisionSession.session_housings), selectinload(DecisionSession.session_criteria))
            .order_by(DecisionSession.created_at.desc())
        )
        sessions = result.scalars().all()
        return [
            {
                "id": s.id,
                "name": s.name,
                "description": s.description,
                "status": s.status,
                "created_at": s.created_at.isoformat(),
                "completed_at": s.completed_at.isoformat() if s.completed_at else None,
                "housing_count": len(s.session_housings),
                "criteria_count": len(s.session_criteria),
            }
            for s in sessions
        ]

    @staticmethod
    async def get_session(db: AsyncSession, session_id: int, user_id: int) -> dict:
        result = await db.execute(
            select(DecisionSession)
            .where(DecisionSession.id == session_id, DecisionSession.user_id == user_id)
            .options(
                selectinload(DecisionSession.session_housings).selectinload(SessionHousing.housing),
                selectinload(DecisionSession.session_criteria).selectinload(SessionCriteria.criteria),
            )
        )
        session = result.scalar_one_or_none()
        if not session:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Không tìm thấy phiên quyết định")

        return {
            "id": session.id,
            "user_id": session.user_id,
            "name": session.name,
            "description": session.description,
            "status": session.status,
            "created_at": session.created_at.isoformat(),
            "completed_at": session.completed_at.isoformat() if session.completed_at else None,
            "housings": [
                {
                    "id": sh.housing.id,
                    "name": f"{sh.housing.district} - {sh.housing.street or ''} - {sh.housing.area}m² - {sh.housing.bedrooms}PN",
                    "district": sh.housing.district,
                    "address": sh.housing.address,
                    "street": sh.housing.street,
                    "price": sh.housing.price,
                    "area": sh.housing.area,
                    "bedrooms": sh.housing.bedrooms,
                    "toilets": sh.housing.toilets,
                    "quality_label": sh.housing.quality_label,
                }
                for sh in session.session_housings
            ],
            "criteria": [
                {"id": sc.criteria.id, "name": sc.criteria.name, "code": sc.criteria.code}
                for sc in session.session_criteria
            ],
        }

    @staticmethod
    async def create_session(db: AsyncSession, user_id: int, data: SessionCreate) -> dict:
        for hid in data.housing_ids:
            h_result = await db.execute(select(Housing).where(Housing.id == hid))
            if not h_result.scalar_one_or_none():
                raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=f"Nhà trọ ID {hid} không hợp lệ")

        for cid in data.criteria_ids:
            c_result = await db.execute(select(Criteria).where(Criteria.id == cid))
            if not c_result.scalar_one_or_none():
                raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=f"Tiêu chí ID {cid} không hợp lệ")

        session = DecisionSession(user_id=user_id, name=data.name, description=data.description)
        db.add(session)
        await db.flush()

        for hid in data.housing_ids:
            db.add(SessionHousing(session_id=session.id, housing_id=hid))
        for cid in data.criteria_ids:
            db.add(SessionCriteria(session_id=session.id, criteria_id=cid))

        await db.flush()
        return await DecisionService.get_session(db, session.id, user_id)

    @staticmethod
    async def delete_session(db: AsyncSession, session_id: int, user_id: int) -> None:
        result = await db.execute(
            select(DecisionSession).where(DecisionSession.id == session_id, DecisionSession.user_id == user_id)
        )
        session = result.scalar_one_or_none()
        if not session:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Không tìm thấy phiên quyết định")
        await db.delete(session)

    @staticmethod
    async def save_criteria_comparisons(
        db: AsyncSession, session_id: int, user_id: int, data: CriteriaComparisonCreate
    ) -> dict:
        session_data = await DecisionService.get_session(db, session_id, user_id)
        session_criteria_ids = [c["id"] for c in session_data["criteria"]]

        for cid in data.criteria_ids:
            if cid not in session_criteria_ids:
                raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=f"Tiêu chí ID {cid} không thuộc phiên này")

        await db.execute(
            delete(CriteriaComparison).where(CriteriaComparison.session_id == session_id)
        )

        for comp in data.comparisons:
            ci_id = data.criteria_ids[comp.i]
            cj_id = data.criteria_ids[comp.j]
            db.add(CriteriaComparison(
                session_id=session_id,
                criteria_i_id=ci_id,
                criteria_j_id=cj_id,
                value=comp.value,
            ))

        result = await db.execute(
            select(DecisionSession).where(DecisionSession.id == session_id)
        )
        session = result.scalar_one()
        session.status = "in_progress"
        await db.flush()

        return {"message": "Đã lưu ma trận so sánh tiêu chí", "count": len(data.comparisons)}

    @staticmethod
    async def save_alternative_comparisons(
        db: AsyncSession, session_id: int, user_id: int, data: AllAlternativeComparisonsCreate
    ) -> dict:
        session_data = await DecisionService.get_session(db, session_id, user_id)
        session_housing_ids = [h["id"] for h in session_data["housings"]]

        for hid in data.housing_ids:
            if hid not in session_housing_ids:
                raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=f"Nhà trọ ID {hid} không thuộc phiên này")

        await db.execute(
            delete(AlternativeComparison).where(AlternativeComparison.session_id == session_id)
        )

        total = 0
        for alt_comp in data.comparisons_by_criteria:
            for comp in alt_comp.comparisons:
                hi_id = data.housing_ids[comp.i]
                hj_id = data.housing_ids[comp.j]
                db.add(AlternativeComparison(
                    session_id=session_id,
                    criteria_id=alt_comp.criteria_id,
                    housing_i_id=hi_id,
                    housing_j_id=hj_id,
                    value=comp.value,
                ))
                total += 1

        await db.flush()
        return {"message": "Đã lưu ma trận so sánh phương án", "count": total}

    @staticmethod
    async def get_comparisons(db: AsyncSession, session_id: int, user_id: int) -> dict:
        await DecisionService.get_session(db, session_id, user_id)

        cc_result = await db.execute(
            select(CriteriaComparison).where(CriteriaComparison.session_id == session_id)
        )
        ccs = cc_result.scalars().all()

        ac_result = await db.execute(
            select(AlternativeComparison).where(AlternativeComparison.session_id == session_id)
        )
        acs = ac_result.scalars().all()

        return {
            "criteria_comparisons": [
                {"criteria_i_id": c.criteria_i_id, "criteria_j_id": c.criteria_j_id, "value": float(c.value)}
                for c in ccs
            ],
            "alternative_comparisons": [
                {"criteria_id": a.criteria_id, "housing_i_id": a.housing_i_id, "housing_j_id": a.housing_j_id, "value": float(a.value)}
                for a in acs
            ],
        }

    @staticmethod
    async def calculate(db: AsyncSession, session_id: int, user_id: int) -> dict[str, Any]:
        session_data = await DecisionService.get_session(db, session_id, user_id)
        housings = session_data["housings"]
        criteria_list = session_data["criteria"]

        n_criteria = len(criteria_list)
        n_alternatives = len(housings)
        criteria_ids = [c["id"] for c in criteria_list]
        housing_ids = [h["id"] for h in housings]
        criteria_names = [c["name"] for c in criteria_list]
        housing_names = [h["name"] for h in housings]

        criteria_id_to_idx = {cid: idx for idx, cid in enumerate(criteria_ids)}
        housing_id_to_idx = {hid: idx for idx, hid in enumerate(housing_ids)}

        cc_result = await db.execute(
            select(CriteriaComparison).where(CriteriaComparison.session_id == session_id)
        )
        raw_ccs = cc_result.scalars().all()
        if not raw_ccs:
            raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Chưa có dữ liệu so sánh tiêu chí")

        criteria_comps = []
        for cc in raw_ccs:
            i = criteria_id_to_idx.get(cc.criteria_i_id)
            j = criteria_id_to_idx.get(cc.criteria_j_id)
            if i is not None and j is not None:
                criteria_comps.append({"i": i, "j": j, "value": float(cc.value)})

        ac_result = await db.execute(
            select(AlternativeComparison).where(AlternativeComparison.session_id == session_id)
        )
        raw_acs = ac_result.scalars().all()
        if not raw_acs:
            raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Chưa có dữ liệu so sánh phương án")

        alt_comps_by_criteria: list[list[dict]] = [[] for _ in range(n_criteria)]
        for ac in raw_acs:
            c_idx = criteria_id_to_idx.get(ac.criteria_id)
            hi_idx = housing_id_to_idx.get(ac.housing_i_id)
            hj_idx = housing_id_to_idx.get(ac.housing_j_id)
            if c_idx is not None and hi_idx is not None and hj_idx is not None:
                alt_comps_by_criteria[c_idx].append({"i": hi_idx, "j": hj_idx, "value": float(ac.value)})

        ahp_result = AHPService.run_full_ahp(
            criteria_comparisons=criteria_comps,
            n_criteria=n_criteria,
            alternative_comparisons_by_criteria=alt_comps_by_criteria,
            n_alternatives=n_alternatives,
            housing_names=housing_names,
            criteria_names=criteria_names,
        )

        await db.execute(delete(AHPResult).where(AHPResult.session_id == session_id))

        for r in ahp_result["rankings"]:
            h_idx = r["housing_index"]
            db.add(AHPResult(
                session_id=session_id,
                housing_id=housing_ids[h_idx],
                criteria_weights=ahp_result["criteria_weights"],
                alternative_scores=r["criteria_scores"],
                final_score=r["final_score"],
                ranking=r["ranking"],
                consistency_ratio=ahp_result["criteria_consistency"]["cr"],
                is_consistent=ahp_result["overall_consistent"],
            ))

        result = await db.execute(select(DecisionSession).where(DecisionSession.id == session_id))
        session = result.scalar_one()
        session.status = "completed"
        session.completed_at = datetime.utcnow()
        await db.flush()

        return {
            "session_id": session_id,
            "session_name": session_data["name"],
            "status": "completed",
            **ahp_result,
        }

    @staticmethod
    async def get_results(db: AsyncSession, session_id: int, user_id: int) -> dict[str, Any]:
        session_data = await DecisionService.get_session(db, session_id, user_id)
        criteria_list = session_data["criteria"]
        housings = session_data["housings"]

        n_criteria = len(criteria_list)
        n_alternatives = len(housings)
        criteria_ids = [c["id"] for c in criteria_list]
        housing_ids = [h["id"] for h in housings]
        criteria_names = [c["name"] for c in criteria_list]
        housing_names = [h["name"] for h in housings]
        code_to_name = {c["code"]: c["name"] for c in criteria_list}

        criteria_id_to_idx = {cid: idx for idx, cid in enumerate(criteria_ids)}
        housing_id_to_idx = {hid: idx for idx, hid in enumerate(housing_ids)}

        def remap_keys(d: dict | None) -> dict:
            if not d:
                return {}
            return {code_to_name.get(k, k): v for k, v in d.items()}

        result = await db.execute(
            select(AHPResult)
            .where(AHPResult.session_id == session_id)
            .options(selectinload(AHPResult.housing))
            .order_by(AHPResult.ranking)
        )
        ahp_results = result.scalars().all()
        if not ahp_results:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Chưa có kết quả. Hãy chạy tính toán AHP trước.")

        cc_result = await db.execute(
            select(CriteriaComparison).where(CriteriaComparison.session_id == session_id)
        )
        raw_ccs = cc_result.scalars().all()

        criteria_comps = []
        for cc in raw_ccs:
            i = criteria_id_to_idx.get(cc.criteria_i_id)
            j = criteria_id_to_idx.get(cc.criteria_j_id)
            if i is not None and j is not None:
                criteria_comps.append({"i": i, "j": j, "value": float(cc.value)})

        ac_result = await db.execute(
            select(AlternativeComparison).where(AlternativeComparison.session_id == session_id)
        )
        raw_acs = ac_result.scalars().all()

        alt_comps_by_criteria: list[list[dict]] = [[] for _ in range(n_criteria)]
        for ac in raw_acs:
            c_idx = criteria_id_to_idx.get(ac.criteria_id)
            hi_idx = housing_id_to_idx.get(ac.housing_i_id)
            hj_idx = housing_id_to_idx.get(ac.housing_j_id)
            if c_idx is not None and hi_idx is not None and hj_idx is not None:
                alt_comps_by_criteria[c_idx].append({"i": hi_idx, "j": hj_idx, "value": float(ac.value)})

        criteria_matrix = AHPService.create_comparison_matrix(criteria_comps, n_criteria)
        norm_criteria, cw = AHPService.normalize_column_sum(criteria_matrix)
        criteria_consistency = AHPService.calculate_consistency(criteria_matrix, cw)

        alternative_matrices: dict[str, dict] = {}
        for j in range(n_criteria):
            alt_matrix = AHPService.create_comparison_matrix(alt_comps_by_criteria[j], n_alternatives)
            norm_alt, aw = AHPService.normalize_column_sum(alt_matrix)
            alt_consistency = AHPService.calculate_consistency(alt_matrix, aw)
            alternative_matrices[criteria_names[j]] = {
                "matrix": AHPService.to_rounded_list(alt_matrix),
                "normalized_matrix": AHPService.to_rounded_list(norm_alt),
                "weights": [round(float(w), 6) for w in aw],
                "consistency": alt_consistency,
            }

        return {
            "session_id": session_id,
            "session_name": session_data["name"],
            "status": session_data["status"],
            "criteria_names": criteria_names,
            "housing_names": housing_names,
            "criteria_matrix": AHPService.to_rounded_list(criteria_matrix),
            "normalized_criteria_matrix": AHPService.to_rounded_list(norm_criteria),
            "criteria_weights": {criteria_names[j]: round(float(cw[j]), 6) for j in range(n_criteria)},
            "criteria_consistency": criteria_consistency,
            "alternative_matrices": alternative_matrices,
            "overall_consistent": ahp_results[0].is_consistent if ahp_results else False,
            "rankings": [
                {
                    "housing_id": r.housing_id,
                    "housing_name": f"{r.housing.district} - {r.housing.street or ''} - {r.housing.area}m² - {r.housing.bedrooms}PN",
                    "final_score": float(r.final_score),
                    "ranking": r.ranking,
                    "alternative_scores": remap_keys(r.alternative_scores),
                    "is_consistent": r.is_consistent,
                }
                for r in ahp_results
            ],
        }

    @staticmethod
    async def count_sessions(db: AsyncSession, user_id: int) -> int:
        result = await db.execute(
            select(func.count(DecisionSession.id)).where(DecisionSession.user_id == user_id)
        )
        return result.scalar() or 0
