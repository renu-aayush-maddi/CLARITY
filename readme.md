# CLARITY - End-to-End Execution Guide

This guide provides step-by-step instructions to set up, install, and run the CLARITY project.

## Table of Contents
1.  [Project Overview](#1-project-overview)
2.  [Architecture](#2-architecture)
3.  [Key API Endpoints](#3-key-api-endpoints)
4.  [Tech Stack](#4-tech-stack)
5.  [Prerequisites](#5-prerequisites)
6.  [Installation & Setup](#6-installation--setup)
7.  [Running the Application](#7-running-the-application)
8.  [Database Initialization](#8-database-initialization)
9.  [Git Workflow](#9-git-workflow)
10. [Project File Structure](#10-project-file-structure)

---

## 1. Project Overview

**CLARITY** (Clinical Lifecycle Analytics for Real-Time Intelligence) is a real-time clinical operations intelligence platform designed to integrate, govern, and analyze heterogeneous clinical trial data from multiple sources. The project focuses on transforming fragmented operational datasets into structured, explainable, and actionable insights that support trial readiness, data quality, and risk management.

### Problem Statement
Clinical trial data is often distributed across multiple systems such as EDC, safety, lab, and coding systems. These datasets are inconsistent, difficult to reconcile, and slow to interpret, leading to delayed decision-making, higher compliance risk, and increased operational overhead.

### Solution Summary
CLARITY ingests raw clinical and operational data, harmonizes schemas, enforces governance checks, and computes explainable data quality and risk metrics. The system provides multi-level visibility—from portfolio to patient—and supports proactive, insight-driven actions.

### Key Features
*   **Multi-source clinical data ingestion**
*   **Governance-first schema validation and lineage tracking**
*   **Explainable Data Quality Index (DQI)**
*   **Study, site, and patient-level drill-downs**
*   **AI-assisted insight explanation and action recommendations**

---

## 2. Architecture

The system follows a modern decoupled architecture, integrating a robust Python backend with a reactive Frontend and external AI services.

```mermaid
graph TD;
    subgraph Frontend
    A[React 19 + Vite] -- Axios --> B[FastAPI Backend]
    end
    
    subgraph Backend
    B -- SQLAlchemy --> C[Neon Database PostgreSQL]
    B -- Python SDK --> D[AI Agents]
    end
    
    subgraph External AI APIs
    D -- API Call --> E[Google Gemini / OpenAI]
    end
    
    subgraph Data Sources
    B -- Ingestion --> F[Clinical Data Excel/CSV]
    end
```

### High-Level Flow
```text
+---------------------+       +----------------------+       +-----------------------+
|   React Frontend    | <---> |   FastAPI Backend    | <---> |   AI Agents (Agno)    |
|     (Vite + JS)     |       |      (Python)        |       |      (Gemini)         |
+---------------------+       +----------------------+       +-----------------------+
                                         |
                                         v
                              +----------------------+
                              |    External APIs     |
                              | - Google Gemini      |
                              | - OpenAI (GPT-4)     |
                              +----------------------+
```

---

## 3. Key API Endpoints

The backend exposes several high-value endpoints for data and AI operations.

| Category | Method | Endpoint | Description |
| :--- | :--- | :--- | :--- |
| **Agents (AI)** | `POST` | `/agent/analyze-site` | Generates risk analysis for a specific site. |
| | `POST` | `/agent/draft-escalation` | Drafts a professional email to a PI based on metrics. |
| | `POST` | `/agent/explain-dqi` | Explains *why* a Data Quality score is low. |
| | `GET` | `/agent/cluster-queries` | Groups similar lab queries using AI logic. |
| **Analytics** | `GET` | `/analytics/dashboard-metrics` | **Main Dashboard**: Returns top risky sites & KPI cards. |
| | `GET` | `/analytics/subject-details` | **Patient 360**: Full unified view of a single patient. |
| | `GET` | `/analytics/ai-governance` | Audit logs of all AI decisions/thoughts. |
| | `GET` | `/analytics/portfolio-summary` | High-level health view of all studies. |
| **Chat** | `POST` | `/chat/query` | Natural Language -> SQL generator interface. |
| **Sentinel** | `GET` | `/sentinel/alerts` | Background process that flags "Ghost Sites" & training gaps. |

---

## 4. Tech Stack

### Frontend
*   **Framework**: React 19 (via Vite 7)
*   **Language**: JavaScript/JSX
*   **UI Library**: Mantine UI (`@mantine/core`)
*   **State/Data**: Axios
*   **Visualization**: Recharts (Charts), React Leaflet (Maps)
*   **Icons**: Lucide React

### Backend
*   **Framework**: FastAPI
*   **Language**: Python 3.x
*   **Database ORM**: SQLAlchemy
*   **Database Driver**: psycopg2-binary
*   **Data Processing**: Pandas
*   **Server**: Uvicorn

### Database
*   **System**: Neon Database (Serverless PostgreSQL)

---

## 5. Prerequisites

Ensure you have the following installed on your system:
*   **Node.js** (v18+ recommended) & **npm**
*   **Python** (v3.8+)
*   **Neon Database Account** (Serverless PostgreSQL)
*   **Git**

---

## 6. Installation & Setup

### A. Clone the Repository
```bash
git clone https://github.com/renu-aayush-maddi/CLARITY.git
cd CLARITY
```

### B. Backend Setup
1.  **Create a Virtual Environment** (in the root directory):
    ```bash
    python -m venv clarity
    ```

2.  **Activate the Virtual Environment**:
    *   **Windows (PowerShell)**:
        ```powershell
        .\clarity\Scripts\Activate
        ```
    *   **Mac/Linux**:
        ```bash
        source clarity/bin/activate
        ```

3.  **Install Dependencies**:
    ```bash
    pip install -r requirements.txt
    ```
    *If `requirements.txt` is missing issues arise, install core packages manually:*
    ```bash
    pip install fastapi uvicorn sqlalchemy psycopg2-binary python-dotenv pandas
    ```

4.  **Environment Variables (.env)**:
    *   Create a `.env` file in the **root** directory.
    *   Copy and paste the following template (fill in your actual values):
        ```env
        # Database (Neon Connection String)
        DATABASE_URL=postgresql://user:password@endpoint.neon.tech/dbname?sslmode=require

        # AI Configuration
        GOOGLE_API_KEY=your_google_api_key_here
        OPENAI_API_KEY=your_openai_api_key_here
        AI_PROVIDER=google

        # Frontend Configuration
        VITE_API_BASE_URL=http://127.0.0.1:8000
        ```

### C. Frontend Setup
1.  **Navigate to the frontend directory**:
    ```bash
    cd frontend
    ```

2.  **Install Dependencies**:
    ```bash
    npm install
    ```

---

## 7. Running the Application

You will need two terminal instances (one for Backend, one for Frontend).

### Terminal 1: Backend
Ensure you are in the project root and your virtual environment is active.
```bash
uvicorn backend.app.main:app --reload
```
*The API will typically be available at `http://127.0.0.1:8000`.*

### Terminal 2: Frontend
Navigate to the frontend directory.
```bash
cd frontend
npm run dev
```
*The application will typically be accessible at `http://localhost:5173`.*

---

## 8. Database Initialization (Optional/First Time)
If setting up the database for the first time, you may need to initialize the schema.
*   Check for initialization scripts in `backend/` (e.g., `init_db.py`) or SQL files like `schema.sql`.
*   Example run (if script exists):
    ```bash
    python backend/init_db.py
    ```

---

## 9. Git Workflow (Reference)
*   **New Feature**: `git checkout -b feature-name`
*   **Commit**: `git add .` -> `git commit -m "description"`
*   **Push**: `git push`
*   **Merge**: Switch to main (`git checkout main`), merge (`git merge feature-name`), and push (`git push`).

---

## 10. Project File Structure

```
CLARITY/
├── backend/                  # Python FastAPI Backend
│   ├── app/
│   │   ├── api/              # API Route Handlers
│   │   │   ├── agent.py      # AI Agent Endpoints
│   │   │   ├── analytics.py  # Analytics & Visualization Data
│   │   │   ├── chat.py       # Chat Interface Endpoints
│   │   │   └── sentinel.py   # System Monitoring/Alerts
│   │   │   
│   │   ├── core/             # Core Application Configuration
│   │   │   ├── config.py     # Environment & App Config
│   │   │   ├── database.py   # DB Connection & Session Management
│   │   │   └── models.py     # SQLAlchemy Database Models
│   │   │   
│   │   ├── utils/            # Utilities & Data Processing
│   │   │   ├── ingest_excel.py    # Excel Data Ingestion Logic
│   │   │   ├── smart_mapper.py    # AI-driven Column Mapping
│   │   │   ├── dataset_registry.py # Dataset Management
│   │   │   └── detect_dataset.py   # Data Type Detection
│   │   │   
│   │   └── main.py           # App Entry Point (FastAPI Instance)
│   │   
│   ├── requirements.txt      # Python Dependencies
│   ├── schema.sql            # SQL Schema Definitions
│   └── init_db.py            # Database Initialization Script
│
├── frontend/                 # React Frontend
│   ├── src/
│   │   ├── api/              # API Client (Axios)
│   │   ├── components/       # UI Components
│   │   ├── App.jsx           # Main Routings & Layout
│   │   └── main.jsx          # Entry Point
│   ├── package.json          # Frontend Dependencies
│   └── vite.config.js        # Build Configuration
│
├── .env                      # Environment Variables
└── EXECUTION_GUIDE.md        # This Documentation
```
