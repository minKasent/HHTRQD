import numpy as np
import pytest

from app.services.ahp_service import AHPService


class TestAHPService:
    """Tests for core AHP calculation engine."""

    def test_create_comparison_matrix_basic(self):
        comparisons = [
            {"i": 0, "j": 1, "value": 3.0},
            {"i": 0, "j": 2, "value": 5.0},
            {"i": 1, "j": 2, "value": 2.0},
        ]
        matrix = AHPService.create_comparison_matrix(comparisons, 3)

        assert matrix.shape == (3, 3)
        assert matrix[0][0] == 1.0
        assert matrix[1][1] == 1.0
        assert matrix[2][2] == 1.0
        assert matrix[0][1] == 3.0
        assert abs(matrix[1][0] - 1.0 / 3.0) < 1e-6
        assert matrix[0][2] == 5.0
        assert abs(matrix[2][0] - 1.0 / 5.0) < 1e-6

    def test_priority_vector_sum_to_one(self):
        comparisons = [
            {"i": 0, "j": 1, "value": 3.0},
            {"i": 0, "j": 2, "value": 5.0},
            {"i": 1, "j": 2, "value": 2.0},
        ]
        matrix = AHPService.create_comparison_matrix(comparisons, 3)
        pv = AHPService.calculate_priority_vector(matrix)

        assert abs(pv.sum() - 1.0) < 1e-6
        assert all(w > 0 for w in pv)

    def test_consistency_ratio_consistent_matrix(self):
        comparisons = [
            {"i": 0, "j": 1, "value": 3.0},
            {"i": 0, "j": 2, "value": 9.0},
            {"i": 1, "j": 2, "value": 3.0},
        ]
        matrix = AHPService.create_comparison_matrix(comparisons, 3)
        pv = AHPService.calculate_priority_vector(matrix)
        result = AHPService.calculate_consistency(matrix, pv)

        assert result["is_consistent"] is True
        assert result["cr"] < 0.1

    def test_consistency_2x2_always_consistent(self):
        comparisons = [{"i": 0, "j": 1, "value": 5.0}]
        matrix = AHPService.create_comparison_matrix(comparisons, 2)
        pv = AHPService.calculate_priority_vector(matrix)
        result = AHPService.calculate_consistency(matrix, pv)

        assert result["cr"] == 0.0
        assert result["is_consistent"] is True

    def test_inconsistent_matrix_detected(self):
        comparisons = [
            {"i": 0, "j": 1, "value": 9.0},
            {"i": 0, "j": 2, "value": 1.0 / 9.0},
            {"i": 1, "j": 2, "value": 9.0},
        ]
        matrix = AHPService.create_comparison_matrix(comparisons, 3)
        pv = AHPService.calculate_priority_vector(matrix)
        result = AHPService.calculate_consistency(matrix, pv)

        assert result["cr"] > 0.1
        assert result["is_consistent"] is False

    def test_full_ahp_ranking(self):
        criteria_comps = [
            {"i": 0, "j": 1, "value": 3.0},
            {"i": 0, "j": 2, "value": 5.0},
            {"i": 1, "j": 2, "value": 2.0},
        ]
        alt_comps_c1 = [
            {"i": 0, "j": 1, "value": 2.0},
            {"i": 0, "j": 2, "value": 4.0},
            {"i": 1, "j": 2, "value": 3.0},
        ]
        alt_comps_c2 = [
            {"i": 0, "j": 1, "value": 1.0 / 3.0},
            {"i": 0, "j": 2, "value": 1.0 / 5.0},
            {"i": 1, "j": 2, "value": 1.0 / 2.0},
        ]
        alt_comps_c3 = [
            {"i": 0, "j": 1, "value": 5.0},
            {"i": 0, "j": 2, "value": 3.0},
            {"i": 1, "j": 2, "value": 1.0 / 2.0},
        ]

        result = AHPService.run_full_ahp(
            criteria_comparisons=criteria_comps,
            n_criteria=3,
            alternative_comparisons_by_criteria=[alt_comps_c1, alt_comps_c2, alt_comps_c3],
            n_alternatives=3,
            housing_names=["Trọ A", "Trọ B", "Trọ C"],
            criteria_names=["C1", "C2", "C3"],
        )

        assert len(result["rankings"]) == 3
        assert result["rankings"][0]["ranking"] == 1
        assert result["rankings"][1]["ranking"] == 2
        assert result["rankings"][2]["ranking"] == 3

        scores = [r["final_score"] for r in result["rankings"]]
        assert scores == sorted(scores, reverse=True)
        assert abs(sum(result["criteria_weights"].values()) - 1.0) < 1e-4

    def test_geometric_mean_method(self):
        comparisons = [
            {"i": 0, "j": 1, "value": 3.0},
            {"i": 0, "j": 2, "value": 5.0},
            {"i": 1, "j": 2, "value": 2.0},
        ]
        matrix = AHPService.create_comparison_matrix(comparisons, 3)
        pv_eigen = AHPService.calculate_priority_vector(matrix)
        pv_geo = AHPService.calculate_priority_vector_geometric(matrix)

        assert abs(pv_geo.sum() - 1.0) < 1e-6
        for a, b in zip(pv_eigen, pv_geo):
            assert abs(a - b) < 0.05
