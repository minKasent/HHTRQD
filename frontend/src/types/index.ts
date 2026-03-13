export interface User {
  id: number;
  email: string;
  full_name: string;
  is_active: boolean;
  created_at: string;
}

export interface Token {
  access_token: string;
  token_type: string;
}

export interface Criteria {
  id: number;
  name: string;
  description: string | null;
  code: string;
  is_benefit: boolean;
  unit: string | null;
  created_at: string;
}

export interface Housing {
  id: number;
  price: number;
  area: number;
  bedrooms: number;
  toilets: number;
  direction: string;
  district: string;
  address: string;
  street: string;
  views: number;
  price_per_m2: number;
  room_density: number;
  quality_label: string;
}

export interface HousingListResponse {
  items: Housing[];
  total: number;
  page: number;
  page_size: number;
  total_pages: number;
}

export interface HousingFilter {
  district?: string;
  quality_label?: string;
  min_price?: number;
  max_price?: number;
  min_area?: number;
  max_area?: number;
  min_bedrooms?: number;
  max_bedrooms?: number;
  page?: number;
  page_size?: number;
}

export interface SessionListItem {
  id: number;
  name: string;
  description: string | null;
  status: string;
  created_at: string;
  completed_at: string | null;
  housing_count: number;
  criteria_count: number;
}

export interface SessionHousingDetail {
  id: number;
  name: string;
  district: string;
  price: number;
  area: number;
  bedrooms: number;
  toilets: number;
  quality_label: string;
}

export interface SessionDetail {
  id: number;
  user_id: number;
  name: string;
  description: string | null;
  status: string;
  created_at: string;
  completed_at: string | null;
  housings: SessionHousingDetail[];
  criteria: { id: number; name: string; code: string }[];
}

export interface PairwiseValue {
  i: number;
  j: number;
  value: number;
}

export interface CriteriaComparisonPayload {
  criteria_ids: number[];
  comparisons: PairwiseValue[];
}

export interface AlternativeComparisonItem {
  criteria_id: number;
  housing_ids: number[];
  comparisons: PairwiseValue[];
}

export interface AllAlternativeComparisonsPayload {
  housing_ids: number[];
  comparisons_by_criteria: AlternativeComparisonItem[];
}

export interface AHPRanking {
  housing_id: number;
  housing_name: string;
  final_score: number;
  ranking: number;
  alternative_scores: Record<string, number>;
  is_consistent: boolean;
}

export interface ConsistencyInfo {
  lambda_max: number;
  ci: number;
  ri: number;
  cr: number;
  is_consistent: boolean;
}

export interface AlternativeMatrixDetail {
  matrix: number[][];
  normalized_matrix: number[][];
  weights: number[];
  consistency: ConsistencyInfo;
}

export interface CalculationResult {
  session_id: number;
  session_name: string;
  status: string;
  criteria_names: string[];
  housing_names: string[];
  criteria_matrix: number[][];
  normalized_criteria_matrix: number[][];
  criteria_weights: Record<string, number>;
  criteria_consistency: ConsistencyInfo;
  alternative_matrices: Record<string, AlternativeMatrixDetail>;
  rankings: AHPRanking[];
  overall_consistent: boolean;
}

export interface DashboardStats {
  housing_count: number;
  session_count: number;
  completed_count: number;
  recent_sessions: SessionListItem[];
}

// ML Types
export interface PredictRequest {
  area: number;
  bedrooms: number;
  toilets: number;
  district: string;
  direction: string;
  views: number;
}

export interface PricePrediction {
  predicted_price: number;
  model_used: string;
  confidence_r2: number;
}

export interface QualityPrediction {
  quality_label: string;
  model_used: string;
  confidence_f1: number;
}

export interface HybridPrediction {
  price: PricePrediction;
  quality: QualityPrediction;
}

export interface ModelMetrics {
  r2?: number;
  rmse?: number;
  mae?: number;
  cv_r2_mean?: number;
  cv_r2_std?: number;
  accuracy?: number;
  f1_score?: number;
  precision?: number;
  recall?: number;
  cv_accuracy_mean?: number;
  cv_accuracy_std?: number;
  train_time_sec?: number;
}

export interface ModelComparisonResponse {
  dataset_size: number;
  train_size: number;
  test_size: number;
  regression: {
    task: string;
    target: string;
    features: string[];
    best_model: string;
    models: Record<string, ModelMetrics>;
  };
  classification: {
    task: string;
    target: string;
    classes: string[];
    features: string[];
    best_model: string;
    models: Record<string, ModelMetrics>;
  };
}

export interface DatasetStats {
  total_records: number;
  price_min: number;
  price_max: number;
  price_mean: number;
  price_median: number;
  area_min: number;
  area_max: number;
  area_mean: number;
  top_districts: Record<string, number>;
  quality_distribution: Record<string, number>;
}

export const SAATY_LABELS: Record<number, string> = {
  1: "Bằng nhau",
  2: "Giữa 1-3",
  3: "Hơi quan trọng hơn",
  4: "Giữa 3-5",
  5: "Quan trọng hơn",
  6: "Giữa 5-7",
  7: "Rất quan trọng hơn",
  8: "Giữa 7-9",
  9: "Cực kỳ quan trọng hơn",
};
