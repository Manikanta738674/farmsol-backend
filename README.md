# FARMSOL Backend API Service

Official Backend API for the Smart Agricultural Procurement Platform (SIH26032) for the Department of Consumer Affairs (DoCA), Ministry of Consumer Affairs, Food & Public Distribution, Government of India.

---

## 🚀 Quick Deploy to Render

### Method 1: Deploy with Render Blueprint (Recommended)
1. In [Render Dashboard](https://dashboard.render.com/), click **New +** -> **Blueprint**.
2. Connect your GitHub repository (`Manikanta738674/farmsol-backend` or `Manikanta738674/farmsol`).
3. Render will automatically read `render.yaml` and configure:
   - **Build Command**: `npm install && npm run build`
   - **Start Command**: `npm start`
   - **Health Check**: `/api/health`
4. Add your **`MONGODB_URI`** under **Environment Variables**.
5. Click **Apply**!

---

### Method 2: Deploy as Web Service Manually
1. Click **New +** -> **Web Service**.
2. Select your repository (`Manikanta738674/farmsol-backend`).
3. Set the following parameters:
   - **Name**: `farmsol-backend`
   - **Region**: Oregon (or Singapore / Frankfurt)
   - **Branch**: `main`
   - **Runtime**: `Node`
   - **Build Command**: `npm install && npm run build`
   - **Start Command**: `npm start`
4. Under **Environment Variables**, add:
   | Key | Value | Description |
   |---|---|---|
   | `NODE_ENV` | `production` | Production environment flag |
   | `PORT` | `10000` | Render port (auto assigned) |
   | `MONGODB_URI` | `mongodb+srv://<user>:<password>@cluster0.mongodb.net/smartfarmer` | MongoDB Atlas Connection URI |
   | `JWT_SECRET` | *(Random 32-character string)* | JWT Signing Secret |
   | `CORS_ORIGIN` | `*` | Or your Vercel frontend URLs |

---

## 🔍 Health Check & Verification
Once deployed, verify your service:
```bash
curl https://farmsol-backend.onrender.com/api/health
```
Response:
```json
{
  "status": "HEALTHY",
  "service": "Smart Agricultural Procurement Platform API",
  "department": "Department of Consumer Affairs (DoCA)",
  "database": "Connected",
  "timestamp": "2026-09-10T15:50:00.000Z"
}
```
