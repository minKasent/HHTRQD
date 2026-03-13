from pydantic import BaseModel, Field


class PairwiseValue(BaseModel):
    i: int
    j: int
    value: float = Field(..., gt=0)


class CriteriaComparisonCreate(BaseModel):
    criteria_ids: list[int] = Field(..., min_length=2, max_length=10)
    comparisons: list[PairwiseValue]


class AlternativeComparisonCreate(BaseModel):
    criteria_id: int
    housing_ids: list[int] = Field(..., min_length=2, max_length=7)
    comparisons: list[PairwiseValue]


class AllAlternativeComparisonsCreate(BaseModel):
    housing_ids: list[int] = Field(..., min_length=2, max_length=7)
    comparisons_by_criteria: list[AlternativeComparisonCreate]


class ComparisonResponse(BaseModel):
    criteria_comparisons: list[dict]
    alternative_comparisons: list[dict]


class ConsistencyResult(BaseModel):
    lambda_max: float
    ci: float
    ri: float
    cr: float
    is_consistent: bool
