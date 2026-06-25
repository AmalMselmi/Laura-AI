# 🩺 Laura AI — Medical Imaging & Diagnostics Platform

[![Docker](https://img.shields.io/badge/Docker-Enabled-blue.svg?logo=docker&logoColor=white)](https://www.docker.com/)
[![FastAPI](https://img.shields.io/badge/FastAPI-0.100+-009688.svg?logo=fastapi&logoColor=white)](https://fastapi.tiangolo.com/)
[![React](https://img.shields.io/badge/React-18.3-61DAFB.svg?logo=react&logoColor=white)](https://react.dev/)
[![Tailwind CSS v4](https://img.shields.io/badge/Tailwind_CSS-v4.0-38B2AC.svg?logo=tailwindcss&logoColor=white)](https://tailwindcss.com/)
[![License](https://img.shields.io/badge/License-Proprietary-red.svg)]()

Laura AI is a state-of-the-art, enterprise-grade medical imaging and diagnostics platform. It bridges the gap between patients, radiologists, and advanced artificial intelligence to provide automated scan analysis, secure medical document management, and seamless PACS (Picture Archiving and Communication System) integration.

The original UI/UX design and specifications are mapped to the [Laura AI Figma Design](https://www.figma.com/design/dLsQusImxk5bSa8XjgLl6t/Laura-AI).

---

## 🌟 Key Features

### 👤 Patient Portal
* **AI-Powered Scan Analysis:** Upload medical scans (X-Rays, MRIs, CT scans up to 50MB) for real-time, structured AI analysis with a mandatory French medical disclaimer.
* **Secure Document Locker:** Organize medical records into folders, view documents in-app, and manage storage quotas.
* **Secure Sharing:** Generate secure, encrypted sharing links (with custom expiry dates) to share documents with external doctors.

### 🩻 Radiologist Portal
* **DICOM File Manager:** Upload and manage raw DICOM files, view metadata, and organize files into folders.
* **PACS Server Integration:** Connect directly to local or remote PACS servers using standard protocols (C-STORE, C-FIND, C-GET).
* **Automated Report Generation:** Generate structured diagnostic reports based on DICOM scans and AI insights.

### 🔑 Admin & Compliance Panel
* **System Overview:** Live dashboard displaying user registration trends, storage usage, and active AI scanning jobs.
* **GDPR & Compliance Center:** Process automated GDPR portability exports and account erasure requests ("Right to be Forgotten") with full dependency purging.
* **Plan & Quota Management:** Configure subscription tiers (`Free`, `Starter`, `Pro`, `RadPro`, `Enterprise`) and manage scan/storage quotas.

---

## 🛠️ Tech Stack

* **Frontend:** React 18 (TypeScript), Vite, Tailwind CSS v4, Framer Motion, Recharts, Radix UI Primitives.
* **Backend:** FastAPI (Python 3.11), SQLAlchemy ORM, Alembic (Database migrations), Celery (Background task queue).
* **Databases & Caches:** PostgreSQL (Production) / SQLite (Local Dev), Redis 7 (Celery broker & cache).
* **Reverse Proxy:** Nginx (Routing frontend SPA assets and API endpoints).

---

## 🚀 How to Run the Project

You can run the entire stack using **Docker Compose** (recommended for production/staging) or set up the components **manually** for local development.

### Method A: The Quickest Way (Docker Compose)

Ensure you have [Docker Desktop](https://www.docker.com/products/docker-desktop/) installed and running.

1. **Clone and Navigate to the Directory:**
   ```bash
   cd "Laura AI "
   ```

2. **Configure Environment Variables:**
   Copy the example environment file and fill in your keys (especially `OPENAI_API_KEY` for AI scanning):
   ```bash
   cp .env.example .env
   ```

3. **Start the Stack:**
   ```bash
   docker compose up --build -d
   ```
   This command automatically builds and starts:
   * **`db`**: PostgreSQL database (exposed on port `5433` to avoid conflicts with local PostgreSQL)
   * **`redis`**: Redis cache and broker (exposed on port `6379`)
   * **`api`**: FastAPI backend (exposed on port `8000`)
   * **`worker`**: Celery worker for processing asynchronous AI scans
   * **`frontend`**: React SPA (built and optimized)
   * **`nginx`**: Nginx reverse proxy serving the frontend on port `80`

4. **Access the Applications:**
   * **Frontend Application:** [http://localhost](http://localhost) (or [http://localhost:80](http://localhost:80))
   * **Interactive API Docs (Swagger):** [http://localhost:8000/docs](http://localhost:8000/docs)
   * **Alternative API Docs (Redoc):** [http://localhost:8000/redoc](http://localhost:8000/redoc)

---

### Method B: Manual Local Development

If you want to run the frontend and backend separately on your local machine without Docker:

#### 1. Backend Setup (FastAPI)

1. **Navigate to the backend folder:**
   ```bash
   cd backend
   ```

2. **Create and Activate a Virtual Environment:**
   ```bash
   python3 -m venv .venv
   source .venv/bin/activate  # On Windows: .venv\Scripts\activate
   ```

3. **Install Dependencies:**
   ```bash
   pip install -r requirements.txt
   ```

4. **Configure Local Environment:**
   Create a `.env` file inside the `backend` folder (or use the root `.env`):
   ```bash
   DATABASE_URL=sqlite:///./dev.db
   REDIS_URL=redis://localhost:6379/0
   JWT_SECRET=your-super-secret-key
   OPENAI_API_KEY=your-openai-key
   ```

5. **Run Alembic Migrations:**
   Apply the database schema and seed initial plans/demo users:
   ```bash
   PYTHONPATH=. python3 -m alembic -c alembic.ini upgrade head
   ```

6. **Start the FastAPI Server:**
   ```bash
   uvicorn app.main:app --reload --port 8000
   ```

---

#### 2. Frontend Setup (React + Vite)

1. **Navigate to the root directory:**
   ```bash
   cd "Laura AI "
   ```

2. **Install Node Dependencies:**
   ```bash
   npm install
   ```

3. **Configure Frontend Environment:**
   Ensure you have a `.env.local` or `.env` in the root directory containing:
   ```env
   VITE_API_URL=http://localhost:8000
   ```

4. **Start the Vite Development Server:**
   ```bash
   npm run dev
   ```
   Open [http://localhost:5173](http://localhost:5173) in your browser.

---

## 🧪 Running Tests

Laura AI comes with a comprehensive test suite for both frontend and backend.

### 1. Backend Unit & Integration Tests
Run Python tests using `pytest` (ensure your virtual environment is activated):
```bash
cd backend
PYTHONPATH=. python3 -m pytest tests/ -v
```

### 2. Frontend Unit Tests
Run Vitest for frontend component testing:
```bash
npm run test
```

### 3. End-to-End (E2E) Tests
Run Playwright E2E tests to validate user registration, login, and scan flows:
```bash
npm run e2e
```
To open the interactive Playwright UI:
```bash
npm run e2e:ui
```

---

## 👥 Demo Accounts (Seeded)

Use these credentials to log in and explore the platform's role-based dashboards:

| Role | Email | Password |
| :--- | :--- | :--- |
| **Patient** | `amira.bensalah@email.com` | `Admin2026!` |
| **Radiologist** | `k.mansour@radiology.com` | `Admin2026!` |
| **Administrator** | `admin@laura-ai.fr` | `Admin2026!` |

---

## 🛡️ GitHub Repository Administration Guide

To collaborate on this repository, manage code, and invite other administrators, follow the guides below depending on your repository structure.

### Option A: Personal Repository (`Yaxin02/laura-ai`)
If the repository is hosted on a personal GitHub account:

1. **Invite a Collaborator:**
   * Go to the repository on GitHub.
   * Click on **Settings** (gear icon) -> **Collaborators** -> **Add people**.
   * Enter their username or email and invite them.
2. **Set Admin Permissions:**
   * Once invited, you can change their role to **Admin**.
   * **Capabilities:** Admin collaborators can push code, modify repository settings, and invite other collaborators.
   * **⚠️ Crucial Security Limitation:** Collaborators (even with the Admin role) **cannot** delete the repository, transfer ownership, or remove the original account owner (`Yaxin02`) from the repository.

---

### Option B: GitHub Organization (RECOMMENDED for Professional Teams)
If you want to grant an administrator **absolute control**—including the ability to manage all members, modify code, invite others, and **even delete or remove you (the original creator) from the repository**—you must host the repository under a **GitHub Organization**.

#### Step 1: Create a GitHub Organization (Free)
1. Log in to GitHub, click your profile picture in the top-right, and select **Your organizations**.
2. Click **New organization**, choose the **Free** plan, and give it a name (e.g., `Laura-AI-Health`).

#### Step 2: Transfer the Repository to the Organization
1. Go to your repository `Yaxin02/laura-ai`.
2. Click **Settings** -> Scroll to the bottom of the General tab to the **Danger Zone**.
3. Click **Transfer ownership**, enter the name of your newly created Organization, and confirm.

#### Step 3: Invite the Admin with Owner Role (Full Control)
1. Go to your Organization homepage (`https://github.com/your-organization-name`).
2. Click the **People** tab -> **Invite member**.
3. Search for the admin's GitHub username or email.
4. Under **Organization role**, select **Owner** (instead of Member).
5. Send the invitation.

#### 💥 What the "Owner" Role Can Do:
Once the invited admin accepts the invitation as an **Owner**:
* **Code Control:** They have full read/write access to modify the code in all repositories.
* **User Management:** They can invite new members, promote members to Owners, or demote them.
* **Absolute Authority (Including Deletion):** They possess identical privileges to you. **They can demote you from Owner to Member, remove you from the Organization entirely, or delete the repository/organization.** This is the only way to achieve true administrative parity on GitHub.
