# PROMPT CHO CURSOR IDE

## 🎯 MỤC TIÊU DỰ ÁN

Xây dựng **Hệ Hỗ Trợ Ra Quyết Định (Decision Support System - DSS)** giúp sinh viên lựa chọn nhà trọ phù hợp nhất, sử dụng **phương pháp AHP (Analytic Hierarchy Process)** của Thomas L. Saaty.

---

## 📚 GIẢI THÍCH PHƯƠNG PHÁP AHP (để AI hiểu context)

AHP là phương pháp ra quyết định đa tiêu chí gồm 4 bước chính:

### Bước 1: Xây dựng cây phân cấp (Hierarchy)
```
Mục tiêu: Chọn nhà trọ tốt nhất
    │
    ├── Tiêu chí 1: Giá thuê (Price)
    ├── Tiêu chí 2: Diện tích (Area)
    ├── Tiêu chí 3: Khoảng cách đến trường (Distance)
    ├── Tiêu chí 4: An ninh (Security)
    ├── Tiêu chí 5: Tiện nghi (Amenities)
    └── Tiêu chí 6: Môi trường xung quanh (Environment)
          │
          ├── Phương án A: Nhà trọ A
          ├── Phương án B: Nhà trọ B
          └── Phương án C: Nhà trọ C
```

### Bước 2: Thiết lập ma trận so sánh cặp (Pairwise Comparison Matrix)
- Sử dụng thang đo Saaty 1-9:
  - 1 = Quan trọng bằng nhau
  - 3 = Quan trọng hơn vừa phải
  - 5 = Quan trọng hơn nhiều
  - 7 = Quan trọng hơn rất nhiều
  - 9 = Quan trọng hơn tuyệt đối
  - 2, 4, 6, 8 = Giá trị trung gian

### Bước 3: Tính trọng số (Priority Vector / Eigenvector)
- Tính trọng số cho từng tiêu chí từ ma trận so sánh cặp
- Kiểm tra tính nhất quán (Consistency Ratio - CR):
  - CR = CI / RI
  - CI = (λmax - n) / (n - 1)
  - RI: Random Index (tra bảng theo n)
  - CR < 0.1 (10%) → Ma trận nhất quán, chấp nhận được
  - CR >= 0.1 → Cần đánh giá lại

### Bước 4: Tổng hợp và xếp hạng
- Nhân trọng số tiêu chí với điểm đánh giá từng phương án
- Xếp hạng các phương án từ cao đến thấp

---

## 🛠️ TECH STACK YÊU CẦU

### Backend: Python FastAPI
- **Framework**: FastAPI (nhanh, async, auto-gen API docs với Swagger)
- **ORM**: SQLAlchemy 2.0 (async)
- **Database Driver**: asyncpg (cho PostgreSQL)
- **Database**: PostgreSQL 15+
- **Migration**: Alembic
- **Validation**: Pydantic v2
- **Tính toán AHP**: NumPy, SciPy
- **Authentication**: python-jose (JWT), passlib[bcrypt]
- **CORS**: fastapi.middleware.cors
- **Environment**: python-dotenv
- **Server**: Uvicorn

### Frontend: Next.js 14+ (App Router)
- **Framework**: Next.js 14+ với App Router
- **Language**: TypeScript
- **Styling**: Tailwind CSS 3+
- **UI Components**: shadcn/ui
- **State Management**: Zustand
- **API Client**: Axios hoặc TanStack Query (React Query) v5
- **Forms**: React Hook Form + Zod (validation)
- **Charts/Visualization**: Recharts hoặc Chart.js (hiển thị kết quả AHP)
- **Tables**: TanStack Table v8
- **Notifications**: Sonner (toast notifications)
- **Icons**: Lucide React

### DevOps / Tools
- **Containerization**: Docker + Docker Compose
- **API Documentation**: Swagger UI (tích hợp sẵn trong FastAPI)

---

## 📁 CẤU TRÚC THƯ MỤC

```
student-housing-dss/
│
├── docker-compose.yml
├── README.md
│
├── backend/
│   ├── Dockerfile
│   ├── requirements.txt
│   ├── alembic.ini
│   ├── alembic/
│   │   ├── env.py
│   │   └── versions/
│   │
│   ├── app/
│   │   ├── __init__.py
│   │   ├── main.py                 # FastAPI app entry point
│   │   ├── config.py               # Settings & environment variables
│   │   ├── database.py             # Database connection & session
│   │   │
│   │   ├── models/                 # SQLAlchemy models
│   │   │   ├── __init__.py
│   │   │   ├── user.py
│   │   │   ├── criteria.py         # Tiêu chí đánh giá
│   │   │   ├── housing.py          # Nhà trọ (phương án)
│   │   │   ├── comparison.py       # Ma trận so sánh cặp
│   │   │   └── decision.py         # Kết quả quyết định
│   │   │
│   │   ├── schemas/                # Pydantic schemas
│   │   │   ├── __init__.py
│   │   │   ├── user.py
│   │   │   ├── criteria.py
│   │   │   ├── housing.py
│   │   │   ├── comparison.py
│   │   │   └── decision.py
│   │   │
│   │   ├── routers/                # API routes
│   │   │   ├── __init__.py
│   │   │   ├── auth.py             # Đăng ký, đăng nhập
│   │   │   ├── criteria.py         # CRUD tiêu chí
│   │   │   ├── housing.py          # CRUD nhà trọ
│   │   │   ├── comparison.py       # So sánh cặp
│   │   │   └── decision.py         # Tính toán AHP & kết quả
│   │   │
│   │   ├── services/               # Business logic
│   │   │   ├── __init__.py
│   │   │   ├── auth_service.py
│   │   │   ├── ahp_service.py      # ⭐ CORE: Thuật toán AHP
│   │   │   ├── criteria_service.py
│   │   │   ├── housing_service.py
│   │   │   └── decision_service.py
│   │   │
│   │   └── utils/                  # Utilities
│   │       ├── __init__.py
│   │       ├── security.py         # JWT, password hashing
│   │       └── ahp_helpers.py      # Helper functions cho AHP
│   │
│   └── tests/
│       ├── test_ahp.py
│       └── test_api.py
│
└── frontend/
    ├── Dockerfile
    ├── package.json
    ├── next.config.js
    ├── tailwind.config.ts
    ├── tsconfig.json
    │
    ├── public/
    │   └── images/
    │
    ├── src/
    │   ├── app/                     # Next.js App Router
    │   │   ├── layout.tsx           # Root layout
    │   │   ├── page.tsx             # Landing page
    │   │   ├── globals.css
    │   │   │
    │   │   ├── (auth)/
    │   │   │   ├── login/page.tsx
    │   │   │   └── register/page.tsx
    │   │   │
    │   │   └── (dashboard)/
    │   │       ├── layout.tsx       # Dashboard layout với sidebar
    │   │       ├── dashboard/page.tsx
    │   │       ├── housing/
    │   │       │   ├── page.tsx         # Danh sách nhà trọ
    │   │       │   ├── new/page.tsx     # Thêm nhà trọ mới
    │   │       │   └── [id]/page.tsx    # Chi tiết nhà trọ
    │   │       ├── criteria/
    │   │       │   └── page.tsx         # Quản lý tiêu chí
    │   │       ├── comparison/
    │   │       │   └── page.tsx         # ⭐ Trang so sánh cặp (ma trận AHP)
    │   │       ├── decision/
    │   │       │   ├── page.tsx         # ⭐ Trang kết quả & xếp hạng
    │   │       │   └── [id]/page.tsx    # Chi tiết 1 phiên quyết định
    │   │       └── history/
    │   │           └── page.tsx         # Lịch sử các lần ra quyết định
    │   │
    │   ├── components/
    │   │   ├── ui/                  # shadcn/ui components
    │   │   ├── layout/
    │   │   │   ├── Navbar.tsx
    │   │   │   ├── Sidebar.tsx
    │   │   │   └── Footer.tsx
    │   │   ├── housing/
    │   │   │   ├── HousingCard.tsx
    │   │   │   ├── HousingForm.tsx
    │   │   │   └── HousingTable.tsx
    │   │   ├── ahp/
    │   │   │   ├── ComparisonMatrix.tsx    # ⭐ Component ma trận so sánh cặp
    │   │   │   ├── SaatySlider.tsx         # ⭐ Slider thang đo 1-9
    │   │   │   ├── ConsistencyCheck.tsx    # ⭐ Hiển thị CR
    │   │   │   ├── WeightChart.tsx         # ⭐ Biểu đồ trọng số
    │   │   │   ├── RankingResult.tsx       # ⭐ Bảng xếp hạng kết quả
    │   │   │   └── HierarchyTree.tsx       # ⭐ Cây phân cấp AHP
    │   │   └── common/
    │   │       ├── LoadingSpinner.tsx
    │   │       └── ConfirmDialog.tsx
    │   │
    │   ├── lib/
    │   │   ├── api.ts               # Axios instance & API functions
    │   │   ├── utils.ts             # shadcn utils (cn function)
    │   │   └── validations.ts       # Zod schemas
    │   │
    │   ├── stores/
    │   │   ├── authStore.ts         # Zustand auth store
    │   │   └── ahpStore.ts          # Zustand AHP state
    │   │
    │   ├── hooks/
    │   │   ├── useAuth.ts
    │   │   └── useAHP.ts
    │   │
    │   └── types/
    │       └── index.ts             # TypeScript interfaces
    │
    └── components.json              # shadcn/ui config
```

---

## 📊 DATABASE SCHEMA (PostgreSQL)

```sql
-- Bảng người dùng
CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    email VARCHAR(255) UNIQUE NOT NULL,
    full_name VARCHAR(255) NOT NULL,
    hashed_password VARCHAR(255) NOT NULL,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Bảng tiêu chí đánh giá
CREATE TABLE criteria (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,           -- Tên tiêu chí (Giá, Diện tích,...)
    description TEXT,                      -- Mô tả
    code VARCHAR(50) UNIQUE NOT NULL,     -- Mã tiêu chí (C1, C2,...)
    is_benefit BOOLEAN DEFAULT TRUE,      -- TRUE = càng cao càng tốt, FALSE = càng thấp càng tốt
    unit VARCHAR(50),                     -- Đơn vị (VNĐ, m², km,...)
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Bảng nhà trọ (phương án)
CREATE TABLE housings (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,           -- Tên nhà trọ
    address TEXT NOT NULL,                -- Địa chỉ
    price DECIMAL(12,2),                  -- Giá thuê (VNĐ/tháng)
    area DECIMAL(8,2),                    -- Diện tích (m²)
    distance DECIMAL(8,2),               -- Khoảng cách đến trường (km)
    security_rating INTEGER CHECK (security_rating BETWEEN 1 AND 10),
    amenities_rating INTEGER CHECK (amenities_rating BETWEEN 1 AND 10),
    environment_rating INTEGER CHECK (environment_rating BETWEEN 1 AND 10),
    image_url TEXT,
    notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Bảng phiên ra quyết định
CREATE TABLE decision_sessions (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,           -- Tên phiên (VD: "Tìm trọ quận Thủ Đức")
    description TEXT,
    status VARCHAR(20) DEFAULT 'draft',   -- draft, in_progress, completed
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    completed_at TIMESTAMP
);

-- Bảng liên kết phiên quyết định với nhà trọ
CREATE TABLE session_housings (
    id SERIAL PRIMARY KEY,
    session_id INTEGER REFERENCES decision_sessions(id) ON DELETE CASCADE,
    housing_id INTEGER REFERENCES housings(id) ON DELETE CASCADE,
    UNIQUE(session_id, housing_id)
);

-- Bảng liên kết phiên quyết định với tiêu chí
CREATE TABLE session_criteria (
    id SERIAL PRIMARY KEY,
    session_id INTEGER REFERENCES decision_sessions(id) ON DELETE CASCADE,
    criteria_id INTEGER REFERENCES criteria(id) ON DELETE CASCADE,
    UNIQUE(session_id, criteria_id)
);

-- Bảng ma trận so sánh cặp tiêu chí
CREATE TABLE criteria_comparisons (
    id SERIAL PRIMARY KEY,
    session_id INTEGER REFERENCES decision_sessions(id) ON DELETE CASCADE,
    criteria_i_id INTEGER REFERENCES criteria(id),    -- Tiêu chí hàng
    criteria_j_id INTEGER REFERENCES criteria(id),    -- Tiêu chí cột
    value DECIMAL(5,3) NOT NULL,                      -- Giá trị so sánh (1/9 đến 9)
    UNIQUE(session_id, criteria_i_id, criteria_j_id)
);

-- Bảng ma trận so sánh cặp phương án theo từng tiêu chí
CREATE TABLE alternative_comparisons (
    id SERIAL PRIMARY KEY,
    session_id INTEGER REFERENCES decision_sessions(id) ON DELETE CASCADE,
    criteria_id INTEGER REFERENCES criteria(id),      -- Theo tiêu chí nào
    housing_i_id INTEGER REFERENCES housings(id),     -- Nhà trọ hàng
    housing_j_id INTEGER REFERENCES housings(id),     -- Nhà trọ cột
    value DECIMAL(5,3) NOT NULL,                      -- Giá trị so sánh
    UNIQUE(session_id, criteria_id, housing_i_id, housing_j_id)
);

-- Bảng kết quả AHP
CREATE TABLE ahp_results (
    id SERIAL PRIMARY KEY,
    session_id INTEGER REFERENCES decision_sessions(id) ON DELETE CASCADE,
    housing_id INTEGER REFERENCES housings(id),
    criteria_weights JSONB,              -- {"C1": 0.35, "C2": 0.25, ...}
    alternative_scores JSONB,            -- {"housing_1": 0.45, "housing_2": 0.30, ...}
    final_score DECIMAL(10,6),           -- Điểm tổng hợp cuối cùng
    ranking INTEGER,                     -- Thứ hạng
    consistency_ratio DECIMAL(10,6),     -- Tỷ số nhất quán CR
    is_consistent BOOLEAN,              -- CR < 0.1 hay không
    calculated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Seed data: Tiêu chí mặc định
INSERT INTO criteria (name, description, code, is_benefit, unit) VALUES
('Giá thuê', 'Giá thuê hàng tháng', 'C1', FALSE, 'VNĐ/tháng'),
('Diện tích', 'Diện tích phòng trọ', 'C2', TRUE, 'm²'),
('Khoảng cách', 'Khoảng cách đến trường', 'C3', FALSE, 'km'),
('An ninh', 'Mức độ an ninh khu vực', 'C4', TRUE, 'điểm'),
('Tiện nghi', 'Các tiện nghi đi kèm (wifi, máy lạnh, ...)', 'C5', TRUE, 'điểm'),
('Môi trường', 'Môi trường xung quanh (yên tĩnh, sạch sẽ, ...)', 'C6', TRUE, 'điểm');
```

---

## ⭐ CORE: THUẬT TOÁN AHP (Backend - ahp_service.py)

Đây là phần QUAN TRỌNG NHẤT, hãy implement chính xác:

```python
# app/services/ahp_service.py
import numpy as np
from typing import List, Dict, Tuple

class AHPService:
    """
    Service xử lý thuật toán AHP (Analytic Hierarchy Process)
    """

    # Bảng Random Index (RI) theo kích thước ma trận n
    RANDOM_INDEX = {
        1: 0.00, 2: 0.00, 3: 0.58, 4: 0.90, 5: 1.12,
        6: 1.24, 7: 1.32, 8: 1.41, 9: 1.45, 10: 1.49
    }

    @staticmethod
    def create_comparison_matrix(comparisons: List[Dict], size: int) -> np.ndarray:
        """
        Tạo ma trận so sánh cặp từ dữ liệu input.
        Ma trận có tính chất: a[i][j] = 1/a[j][i] và a[i][i] = 1

        Args:
            comparisons: List các cặp so sánh {i, j, value}
            size: Kích thước ma trận (số tiêu chí hoặc số phương án)

        Returns:
            Ma trận numpy vuông size x size
        """
        matrix = np.ones((size, size))
        for comp in comparisons:
            i, j, value = comp['i'], comp['j'], comp['value']
            matrix[i][j] = value
            matrix[j][i] = 1.0 / value  # Tính chất nghịch đảo
        return matrix

    @staticmethod
    def calculate_priority_vector(matrix: np.ndarray) -> np.ndarray:
        """
        Tính vector trọng số (Priority Vector) bằng phương pháp trị riêng
        (Eigenvector method).

        Cách tính:
        1. Tính trị riêng lớn nhất (λmax) và vector riêng tương ứng
        2. Chuẩn hóa vector riêng → đó là trọng số

        Args:
            matrix: Ma trận so sánh cặp

        Returns:
            Vector trọng số đã chuẩn hóa (tổng = 1)
        """
        eigenvalues, eigenvectors = np.linalg.eig(matrix)

        # Lấy trị riêng lớn nhất (phần thực)
        max_index = np.argmax(np.real(eigenvalues))
        max_eigenvector = np.real(eigenvectors[:, max_index])

        # Chuẩn hóa: chia cho tổng để tổng trọng số = 1
        priority_vector = max_eigenvector / max_eigenvector.sum()
        return priority_vector

    @staticmethod
    def calculate_consistency_ratio(matrix: np.ndarray, priority_vector: np.ndarray) -> Dict:
        """
        Tính tỷ số nhất quán (Consistency Ratio - CR).

        Công thức:
        - λmax = trị riêng lớn nhất
        - CI (Consistency Index) = (λmax - n) / (n - 1)
        - CR (Consistency Ratio) = CI / RI
        - Nếu CR < 0.1 → Ma trận nhất quán (chấp nhận được)

        Args:
            matrix: Ma trận so sánh cặp
            priority_vector: Vector trọng số đã tính

        Returns:
            Dict chứa lambda_max, CI, RI, CR, is_consistent
        """
        n = matrix.shape[0]
        eigenvalues = np.real(np.linalg.eigvals(matrix))
        lambda_max = np.max(eigenvalues)

        # Consistency Index
        ci = (lambda_max - n) / (n - 1) if n > 1 else 0

        # Random Index
        ri = AHPService.RANDOM_INDEX.get(n, 1.49)

        # Consistency Ratio
        cr = ci / ri if ri != 0 else 0

        return {
            "lambda_max": float(lambda_max),
            "ci": float(ci),
            "ri": float(ri),
            "cr": float(cr),
            "is_consistent": cr < 0.1
        }

    @staticmethod
    def calculate_final_ranking(
        criteria_weights: np.ndarray,
        alternative_matrices: List[np.ndarray],
        housing_names: List[str]
    ) -> List[Dict]:
        """
        Tổng hợp kết quả cuối cùng: Nhân trọng số tiêu chí với
        điểm phương án để xếp hạng.

        Công thức: Score(Ai) = Σ (w_j × s_ij)
        Trong đó:
            - w_j: trọng số tiêu chí j
            - s_ij: điểm phương án i theo tiêu chí j

        Args:
            criteria_weights: Vector trọng số các tiêu chí
            alternative_matrices: List ma trận so sánh phương án theo từng tiêu chí
            housing_names: Tên các nhà trọ

        Returns:
            List kết quả xếp hạng
        """
        n_alternatives = alternative_matrices[0].shape[0]
        n_criteria = len(criteria_weights)

        # Ma trận điểm phương án theo tiêu chí
        score_matrix = np.zeros((n_alternatives, n_criteria))

        for j, alt_matrix in enumerate(alternative_matrices):
            alt_weights = AHPService.calculate_priority_vector(alt_matrix)
            score_matrix[:, j] = alt_weights

        # Tính điểm tổng hợp
        final_scores = score_matrix @ criteria_weights

        # Xếp hạng
        rankings = np.argsort(-final_scores)  # Sắp xếp giảm dần

        results = []
        for rank, idx in enumerate(rankings):
            results.append({
                "housing_name": housing_names[idx],
                "final_score": float(final_scores[idx]),
                "ranking": rank + 1,
                "criteria_scores": {
                    f"C{j+1}": float(score_matrix[idx, j])
                    for j in range(n_criteria)
                }
            })

        return results
```

---

## 🖥️ FRONTEND: CÁC TRANG CHÍNH CẦN IMPLEMENT

### 1. Trang Landing (/)
- Hero section giới thiệu hệ thống
- Nút "Bắt đầu" → chuyển đến đăng ký/đăng nhập

### 2. Trang Dashboard (/dashboard)
- Tổng quan: số nhà trọ đã thêm, số phiên quyết định
- Quick actions: Tạo phiên mới, Thêm nhà trọ
- Lịch sử phiên quyết định gần đây

### 3. Trang Quản lý Nhà trọ (/housing)
- Bảng danh sách nhà trọ (dùng TanStack Table)
- Form thêm/sửa nhà trọ (dùng React Hook Form + Zod)
- Hiển thị card view hoặc table view

### 4. ⭐ Trang So sánh cặp (/comparison) - QUAN TRỌNG NHẤT
- **Step 1**: Chọn các nhà trọ muốn so sánh (tối thiểu 2, tối đa 7)
- **Step 2**: Chọn các tiêu chí (có thể dùng mặc định hoặc tùy chỉnh)
- **Step 3**: So sánh cặp tiêu chí:
  - Hiển thị ma trận NxN
  - Mỗi ô là slider/select từ 1/9 đến 9
  - Chỉ cần nhập tam giác trên (phía trên đường chéo), tam giác dưới tự động tính nghịch đảo
  - Đường chéo chính luôn = 1
  - **SaatySlider component**: Slider trực quan với label giải thích mức độ
  - Hiển thị real-time: trọng số tạm tính + CR
  - Cảnh báo nếu CR >= 0.1 (không nhất quán)
- **Step 4**: So sánh cặp các nhà trọ theo TỪNG tiêu chí
  - Với mỗi tiêu chí → 1 ma trận so sánh các nhà trọ
  - Tổng cộng có N ma trận (N = số tiêu chí)
- **Step 5**: Xem kết quả

### 5. ⭐ Trang Kết quả (/decision)
- **Bảng xếp hạng**: Nhà trọ từ tốt nhất → kém nhất, với điểm số
- **Biểu đồ cột**: So sánh điểm các nhà trọ (dùng Recharts)
- **Biểu đồ radar**: So sánh đa tiêu chí
- **Biểu đồ tròn**: Trọng số các tiêu chí
- **Chi tiết tính toán**:
  - Ma trận so sánh cặp tiêu chí + trọng số
  - Từng ma trận so sánh phương án + trọng số
  - Bảng tổng hợp điểm
  - Giá trị CR của từng ma trận
- **Cây phân cấp AHP** (visualization)
- Nút xuất PDF/Excel

### 6. Trang Lịch sử (/history)
- Danh sách các phiên quyết định đã hoàn thành
- Xem lại chi tiết từng phiên

---

## 🔌 API ENDPOINTS

```
# Authentication
POST   /api/auth/register          # Đăng ký
POST   /api/auth/login             # Đăng nhập → JWT token
GET    /api/auth/me                # Thông tin user hiện tại

# Criteria (Tiêu chí)
GET    /api/criteria               # Lấy danh sách tiêu chí
POST   /api/criteria               # Thêm tiêu chí mới
PUT    /api/criteria/{id}          # Sửa tiêu chí
DELETE /api/criteria/{id}          # Xóa tiêu chí

# Housing (Nhà trọ)
GET    /api/housings               # Danh sách nhà trọ của user
POST   /api/housings               # Thêm nhà trọ
GET    /api/housings/{id}          # Chi tiết nhà trọ
PUT    /api/housings/{id}          # Sửa nhà trọ
DELETE /api/housings/{id}          # Xóa nhà trọ

# Decision Sessions (Phiên quyết định)
GET    /api/sessions               # Danh sách phiên
POST   /api/sessions               # Tạo phiên mới
GET    /api/sessions/{id}          # Chi tiết phiên
DELETE /api/sessions/{id}          # Xóa phiên

# AHP Comparison (So sánh cặp)
POST   /api/sessions/{id}/criteria-comparison      # Lưu ma trận so sánh tiêu chí
POST   /api/sessions/{id}/alternative-comparison   # Lưu ma trận so sánh phương án
GET    /api/sessions/{id}/comparisons              # Lấy dữ liệu so sánh đã lưu

# AHP Calculation (Tính toán)
POST   /api/sessions/{id}/calculate     # ⭐ Chạy thuật toán AHP
GET    /api/sessions/{id}/results       # ⭐ Lấy kết quả xếp hạng
GET    /api/sessions/{id}/export/pdf    # Xuất PDF
```

---

## 🎨 UI/UX REQUIREMENTS

1. **Theme**: Light/Dark mode (dùng next-themes)
2. **Responsive**: Mobile-first, hoạt động tốt trên điện thoại
3. **Language**: Tiếng Việt (giao diện chính)
4. **Ma trận so sánh cặp**:
   - Dùng slider hoặc dropdown cho mỗi ô
   - Có tooltip giải thích thang đo Saaty
   - Highlight các ô đã điền / chưa điền
   - Real-time calculation khi thay đổi giá trị
5. **Kết quả**: Trực quan bằng biểu đồ, không chỉ hiển thị số
6. **Loading states**: Skeleton loading cho mọi trang
7. **Error handling**: Toast notifications cho lỗi, thành công
8. **Stepper**: Dùng multi-step wizard cho quy trình AHP

---

## 🚀 YÊU CẦU THỰC HIỆN

Hãy implement TOÀN BỘ dự án theo thứ tự sau:

### Phase 1: Backend Setup
1. Tạo project structure cho FastAPI
2. Cấu hình database PostgreSQL + SQLAlchemy
3. Tạo models, schemas
4. Implement auth (JWT)
5. Setup Alembic migrations

### Phase 2: AHP Core
6. Implement ahp_service.py (thuật toán AHP đầy đủ)
7. Viết unit tests cho AHP
8. Tạo API endpoints cho comparison và calculation

### Phase 3: Backend API
9. CRUD APIs cho criteria, housing, sessions
10. API tính toán AHP + trả kết quả
11. API xuất PDF

### Phase 4: Frontend Setup
12. Tạo Next.js project + cấu hình
13. Install shadcn/ui components
14. Setup Zustand stores, API client

### Phase 5: Frontend Pages
15. Auth pages (login, register)
16. Dashboard
17. Housing management
18. ⭐ Comparison matrix page (trang so sánh cặp)
19. ⭐ Results & ranking page (trang kết quả)
20. History page

### Phase 6: Polish
21. Docker Compose cho toàn bộ stack
22. README với hướng dẫn chạy
23. Seed data mẫu

---

## ⚠️ LƯU Ý QUAN TRỌNG

1. **AHP phải chính xác toán học**: Kiểm tra lại công thức eigenvector, CR, RI
2. **Ma trận đối xứng**: Đảm bảo a[i][j] = 1/a[j][i]
3. **Consistency check là BẮT BUỘC**: Luôn kiểm tra CR < 0.1
4. **Thang đo Saaty chỉ có**: 1, 2, 3, 4, 5, 6, 7, 8, 9 và nghịch đảo
5. **Edge cases**: Ma trận 2x2 (CR luôn = 0), ma trận 1x1
6. **Số phương án**: Tối thiểu 2, tối đa 7 (AHP không hiệu quả với >7)
7. **Số tiêu chí**: Tối thiểu 2, tối đa 10
```