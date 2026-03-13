import numpy as np
from typing import Any


class AHPService:
    """
    AHP (Analytic Hierarchy Process) calculation engine.
    Implements the eigenvector method by Thomas L. Saaty.
    """

    RANDOM_INDEX: dict[int, float] = {
        1: 0.00, 2: 0.00, 3: 0.58, 4: 0.90, 5: 1.12,
        6: 1.24, 7: 1.32, 8: 1.41, 9: 1.45, 10: 1.49,
    }

    @staticmethod
    def create_comparison_matrix(comparisons: list[dict], size: int) -> np.ndarray:
        """
        Build a pairwise comparison matrix from upper-triangle entries.
        Properties: a[i][j] = 1/a[j][i], a[i][i] = 1
        """
        matrix = np.ones((size, size))
        for comp in comparisons:
            i, j, value = comp["i"], comp["j"], comp["value"]
            matrix[i][j] = value
            matrix[j][i] = 1.0 / value
        return matrix

    @staticmethod
    def calculate_priority_vector(matrix: np.ndarray) -> np.ndarray:
        """
        Compute the priority vector using the eigenvector method.
        Returns normalized weights summing to 1.
        """
        eigenvalues, eigenvectors = np.linalg.eig(matrix)
        max_index = np.argmax(np.real(eigenvalues))
        max_eigenvector = np.real(eigenvectors[:, max_index])
        priority_vector = np.abs(max_eigenvector)
        priority_vector = priority_vector / priority_vector.sum()
        return priority_vector

    @staticmethod
    def calculate_priority_vector_geometric(matrix: np.ndarray) -> np.ndarray:
        """
        Alternative: geometric mean method (more numerically stable for small matrices).
        """
        n = matrix.shape[0]
        geo_means = np.zeros(n)
        for i in range(n):
            geo_means[i] = np.prod(matrix[i, :]) ** (1.0 / n)
        return geo_means / geo_means.sum()

    @staticmethod
    def calculate_consistency(matrix: np.ndarray, priority_vector: np.ndarray) -> dict[str, Any]:
        """
        Compute Consistency Ratio (CR).
        CR < 0.1 means the judgments are acceptably consistent.
        """
        n = matrix.shape[0]

        if n <= 2:
            return {
                "lambda_max": float(n),
                "ci": 0.0,
                "ri": 0.0,
                "cr": 0.0,
                "is_consistent": True,
            }

        weighted_sum = matrix @ priority_vector
        lambda_vector = weighted_sum / priority_vector
        lambda_max = float(np.mean(lambda_vector))
        ci = (lambda_max - n) / (n - 1)
        ri = AHPService.RANDOM_INDEX.get(n, 1.49)
        cr = ci / ri if ri > 0 else 0.0

        return {
            "lambda_max": round(lambda_max, 6),
            "ci": round(float(ci), 6),
            "ri": float(ri),
            "cr": round(float(cr), 6),
            "is_consistent": float(cr) < 0.1,
        }

    @staticmethod
    def normalize_column_sum(matrix: np.ndarray) -> tuple[np.ndarray, np.ndarray]:
        """
        Column-sum normalization (standard textbook AHP method).
        Returns (normalized_matrix, weights) where weights are row averages.
        """
        col_sums = matrix.sum(axis=0)
        normalized = matrix / col_sums
        weights = normalized.mean(axis=1)
        return normalized, weights

    @staticmethod
    def to_rounded_list(matrix: np.ndarray, decimals: int = 4) -> list[list[float]]:
        return [[round(float(v), decimals) for v in row] for row in matrix]

    @staticmethod
    def calculate_final_ranking(
        criteria_weights: np.ndarray,
        alternative_priority_vectors: list[np.ndarray],
        housing_names: list[str],
        criteria_names: list[str],
    ) -> list[dict]:
        """
        Synthesize final scores: Score(Ai) = sum(w_j * s_ij)
        Returns sorted ranking list.
        """
        n_alternatives = len(housing_names)
        n_criteria = len(criteria_weights)

        score_matrix = np.zeros((n_alternatives, n_criteria))
        for j, alt_pv in enumerate(alternative_priority_vectors):
            score_matrix[:, j] = alt_pv

        final_scores = score_matrix @ criteria_weights
        rankings = np.argsort(-final_scores)

        results = []
        for rank, idx in enumerate(rankings):
            criteria_scores = {}
            for j in range(n_criteria):
                criteria_scores[criteria_names[j]] = round(float(score_matrix[idx, j]), 6)

            results.append({
                "housing_name": housing_names[int(idx)],
                "housing_index": int(idx),
                "final_score": round(float(final_scores[idx]), 6),
                "ranking": rank + 1,
                "criteria_scores": criteria_scores,
            })

        return results

    @staticmethod
    def run_full_ahp(
        criteria_comparisons: list[dict],
        n_criteria: int,
        alternative_comparisons_by_criteria: list[list[dict]],
        n_alternatives: int,
        housing_names: list[str],
        criteria_names: list[str],
    ) -> dict[str, Any]:
        """
        Execute the complete AHP pipeline:
        1. Build criteria comparison matrix -> weights + consistency
        2. For each criterion, build alternative comparison matrix -> priorities + consistency
        3. Synthesize final ranking
        """
        criteria_matrix = AHPService.create_comparison_matrix(criteria_comparisons, n_criteria)
        criteria_weights = AHPService.calculate_priority_vector(criteria_matrix)
        criteria_consistency = AHPService.calculate_consistency(criteria_matrix, criteria_weights)

        alternative_pvs: list[np.ndarray] = []
        alternative_consistencies: dict[str, dict] = {}

        for j, alt_comps in enumerate(alternative_comparisons_by_criteria):
            alt_matrix = AHPService.create_comparison_matrix(alt_comps, n_alternatives)
            alt_pv = AHPService.calculate_priority_vector(alt_matrix)
            alt_consistency = AHPService.calculate_consistency(alt_matrix, alt_pv)

            alternative_pvs.append(alt_pv)
            alternative_consistencies[criteria_names[j]] = alt_consistency

        rankings = AHPService.calculate_final_ranking(
            criteria_weights, alternative_pvs, housing_names, criteria_names,
        )

        criteria_weights_dict = {
            criteria_names[j]: round(float(criteria_weights[j]), 6)
            for j in range(n_criteria)
        }

        overall_consistent = criteria_consistency["is_consistent"] and all(
            c["is_consistent"] for c in alternative_consistencies.values()
        )

        return {
            "criteria_weights": criteria_weights_dict,
            "criteria_consistency": criteria_consistency,
            "alternative_consistencies": alternative_consistencies,
            "rankings": rankings,
            "overall_consistent": overall_consistent,
        }
