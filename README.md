# Hệ Hỗ Trợ Ra Quyết Định Chọn Nhà Trọ Cho Sinh Viên

Sử dụng phương pháp **AHP (Analytic Hierarchy Process)** để so sánh và xếp hạng nhà trọ tại TP.HCM.

## Yêu cầu

- **Python** 3.11+
- **Node.js** 18+
- **PostgreSQL** 14+

## Cài đặt & Chạy

### 1. Clone repo

```bash
git clone https://github.com/minKasent/HHTRQD.git
cd HHTRQD
```

### 2. Tạo database

```bash
psql -U postgres
CREATE DATABASE student_housing_dss;
\q
```

### 3. Chạy Backend

```bash
cd backend
python -m venv venv
venv\Scripts\activate        # Windows
# source venv/bin/activate   # Mac/Linux
pip install -r requirements.txt
uvicorn app.main:app --reload --port 8000
```

Lần đầu chạy, backend tự tạo bảng + import ~11.000 nhà trọ từ CSV.

Swagger docs: http://localhost:8000/docs

### 4. Chạy Frontend (terminal mới)

```bash
cd frontend
npm install
npm run dev
```

Mở trình duyệt: **http://localhost:3000**

## Cách sử dụng

1. Bấm **Bắt đầu** → vào Dashboard
2. **Xem dữ liệu** nhà trọ (lọc theo quận, giá, diện tích)
3. **Tạo so sánh AHP**: chọn nhà trọ → chọn tiêu chí → so sánh cặp (thang Saaty 1–9)
4. **Xem kết quả**: xếp hạng, ma trận, trọng số, biểu đồ, kiểm tra nhất quán (CR)

## Thang đo Saaty

| Giá trị | Ý nghĩa |
|---------|---------|
| 1 | Bằng nhau |
| 3 | Hơi quan trọng hơn |
| 5 | Quan trọng hơn |
| 7 | Rất quan trọng hơn |
| 9 | Cực kỳ quan trọng hơn |

**CR < 10%** → kết quả tin cậy. **CR ≥ 10%** → cần điều chỉnh.

## Deploy (miễn phí)

### Backend → Render

1. Push code lên GitHub
2. [render.com](https://render.com) → **New > Blueprint** → chọn repo → Render tự tạo database + API từ `render.yaml`
3. Copy URL backend (dạng `https://student-housing-api-xxxx.onrender.com`)
4. Sửa `CORS_ORIGINS` = `["https://hhtrqd.vercel.app"]`

### Frontend → Vercel

1. [vercel.com](https://vercel.com) → **Add New > Project** → import repo
2. Root Directory: `frontend`
3. Thêm env: `NEXT_PUBLIC_API_URL` = URL backend từ Render
4. Deploy

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Backend | Python, FastAPI, SQLAlchemy 2.0 (async), PostgreSQL |
| Frontend | Next.js 14, TypeScript, Tailwind CSS, shadcn/ui, Recharts |
| State | Zustand, TanStack Query |
