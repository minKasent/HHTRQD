# Hệ Hỗ Trợ Ra Quyết Định Chọn Nhà Trọ Cho Sinh Viên

Sử dụng phương pháp **AHP (Analytic Hierarchy Process)** của Thomas L. Saaty để so sánh và xếp hạng các lựa chọn nhà trọ tại TP.HCM dựa trên nhiều tiêu chí.

## Tech Stack

| Layer    | Technology                                         |
| -------- | -------------------------------------------------- |
| Backend  | Python 3.13, FastAPI, SQLAlchemy 2.0 (async)       |
| Database | PostgreSQL                                         |
| Frontend | Next.js 14 (App Router), TypeScript, Tailwind CSS  |
| UI       | shadcn/ui, Recharts                                |

## Yêu cầu hệ thống

- **Python** 3.11+ (khuyến nghị 3.13)
- **Node.js** 18+ (khuyến nghị 20+)
- **PostgreSQL** 14+
- **npm** hoặc **yarn**

## Hướng dẫn chạy project

### Bước 1: Clone repo

```bash
git clone https://github.com/<your-username>/hhtrqd.git
cd hhtrqd
```

### Bước 2: Tạo database PostgreSQL

Mở terminal/cmd, đảm bảo PostgreSQL đang chạy, rồi tạo database:

```bash
# Đăng nhập PostgreSQL (mật khẩu mặc định: postgres)
psql -U postgres

# Trong psql shell, chạy:
CREATE DATABASE student_housing_dss;
\q
```

> **Lưu ý:** Backend mặc định kết nối với user `postgres`, password `postgres`, port `5432`.
> Nếu PostgreSQL của bạn dùng thông tin khác, tạo file `backend/.env`:
>
> ```env
> DATABASE_URL=postgresql://user:password@localhost:5432/student_housing_dss
> ```

### Bước 3: Chạy Backend

```bash
cd backend

# Tạo virtual environment
python -m venv venv

# Kích hoạt (Windows)
venv\Scripts\activate

# Kích hoạt (Linux/Mac)
# source venv/bin/activate

# Cài dependencies
pip install -r requirements.txt

# Chạy server
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

Khi khởi động lần đầu, backend sẽ tự động:
- Tạo tất cả các bảng trong database
- Seed dữ liệu tiêu chí mặc định (giá, diện tích, phòng ngủ, ...)
- Import ~11.000 nhà trọ từ file CSV vào database

Kiểm tra backend hoạt động: http://localhost:8000/docs

### Bước 4: Chạy Frontend

Mở **terminal mới** (giữ backend đang chạy):

```bash
cd frontend

# Cài dependencies
npm install

# Chạy dev server
npm run dev
```

Truy cập: **http://localhost:3000**

### Cách chạy với Docker (tùy chọn)

```bash
docker compose up --build
```

- Frontend: http://localhost:3000
- Backend: http://localhost:8000
- Swagger Docs: http://localhost:8000/docs

## Quy trình sử dụng

1. **Truy cập trang chủ** → Bấm "Bắt đầu ngay"
2. **Duyệt dữ liệu nhà trọ** — lọc theo quận, giá, diện tích, chất lượng
3. **Tạo phiên so sánh AHP**:
   - Đặt tên phiên
   - Chọn 2–7 nhà trọ từ bộ dữ liệu
   - Chọn 2–10 tiêu chí
   - So sánh cặp tiêu chí (thang Saaty 1–9)
   - So sánh cặp nhà trọ theo từng tiêu chí
4. **Xem kết quả** — bảng xếp hạng, ma trận AHP, trọng số, biểu đồ, kiểm tra nhất quán (CR)

## Phương pháp AHP

### Thang đo Saaty (1–9)

| Giá trị | Ý nghĩa                  |
| ------- | ------------------------- |
| 1       | Quan trọng bằng nhau      |
| 3       | Quan trọng hơn vừa phải   |
| 5       | Quan trọng hơn nhiều      |
| 7       | Quan trọng hơn rất nhiều  |
| 9       | Quan trọng hơn tuyệt đối |
| 2,4,6,8 | Giá trị trung gian        |

### Kiểm tra nhất quán (Consistency Ratio)

- **CR < 10%**: Ma trận nhất quán — kết quả tin cậy
- **CR ≥ 10%**: Ma trận không nhất quán — cần điều chỉnh

## Deploy lên internet (miễn phí)

Dùng **Render** (backend + database) + **Vercel** (frontend).

### A. Deploy Backend + Database trên Render

1. Push code lên GitHub
2. Vào [render.com](https://render.com), đăng nhập bằng GitHub
3. Chọn **New > Blueprint** → chọn repo GitHub → Render sẽ đọc file `render.yaml` và tự tạo:
   - 1 PostgreSQL database (free)
   - 1 Web Service chạy FastAPI (free)
4. Đợi deploy xong, copy URL backend (dạng `https://student-housing-api-xxxx.onrender.com`)
5. Vào **Environment** của web service, sửa biến `CORS_ORIGINS`:

   ```
   ["https://your-app.vercel.app"]
   ```

   *(thay bằng domain Vercel thật sau bước B)*

> **Lưu ý:** Render free tier sẽ sleep sau 15 phút không có request. Lần truy cập đầu tiên sẽ mất ~30s để khởi động lại.

### B. Deploy Frontend trên Vercel

1. Vào [vercel.com](https://vercel.com), đăng nhập bằng GitHub
2. Chọn **Add New > Project** → import repo GitHub
3. Cấu hình:
   - **Root Directory**: `frontend`
   - **Framework Preset**: Next.js (tự detect)
4. Thêm **Environment Variable**:

   | Key                    | Value                                              |
   | ---------------------- | -------------------------------------------------- |
   | `NEXT_PUBLIC_API_URL`  | `https://student-housing-api-xxxx.onrender.com`    |

   *(thay bằng URL backend Render thật từ bước A)*

5. Bấm **Deploy**

### C. Cập nhật CORS (sau khi có domain Vercel)

Quay lại Render → web service → **Environment** → sửa `CORS_ORIGINS`:

```
["https://your-app.vercel.app"]
```

Thay `your-app.vercel.app` bằng domain Vercel thật, rồi bấm **Save Changes** (Render sẽ tự redeploy).

## Cấu trúc dự án

```
├── docker-compose.yml
├── backend/
│   ├── requirements.txt
│   ├── app/
│   │   ├── main.py              # Entry point, seed data
│   │   ├── config.py            # Settings (DB, JWT, CORS)
│   │   ├── database.py          # DB connection
│   │   ├── models/              # SQLAlchemy models
│   │   ├── schemas/             # Pydantic schemas
│   │   ├── services/
│   │   │   ├── ahp_service.py   # Core AHP algorithm
│   │   │   ├── decision_service.py
│   │   │   └── ...
│   │   ├── routers/             # API routes
│   │   └── utils/               # JWT, security
│   └── ml/
│       ├── preprocess.py        # CSV preprocessing
│       └── data/
│           └── processed_housing.csv
├── frontend/
│   ├── package.json
│   └── src/
│       ├── app/                 # Next.js pages (App Router)
│       ├── components/
│       │   ├── ahp/             # AHP matrices, rankings, charts
│       │   ├── housing/         # Housing table, cards
│       │   ├── layout/          # Navbar, Sidebar, Footer
│       │   └── ui/              # shadcn/ui components
│       ├── hooks/               # Custom React hooks
│       ├── lib/                 # API client, utilities
│       ├── stores/              # Zustand state management
│       └── types/               # TypeScript interfaces
└── rental_housing_in_HCM_city.csv  # Raw dataset gốc
```
