# ☀️ PrimeOps Solar Plant AI Dashboard

PrimeOps is a state-of-the-art predictive maintenance and monitoring dashboard designed for large-scale solar power plants. It integrates raw telemetry ingestion, dynamic visualizations, and a Python Machine Learning microservice into a single cohesive UI.

## 🌟 Key Features

- **Live Block-Level Visualization:** Dynamically scales and maps physical inverters across multiple plant blocks directly into the React UI state.
- **AI-Powered Diagnostics:** Uses XGBoost ML models to analyze raw `voltage`, `temperature`, and `power` metrics to probabilistically predict inverter failure states up to 7 days in advance.
- **Intelligent Engineering Assistant:** An integrated Floating Chatbot powered by `Groq LLM (LLaMA-3 70B)`. The bot natively executes backend SQL routing tools to query live Supabase telemetry and summarize real-time operational answers.
- **Real-Time Alert Thresholding:** A dual-layer Node.js warning system that catches and registers critical temperature or underperforming power anomalies before catastrophic failure.

---

## 🏗️ Architecture Overview

This project is structured as a **Microservices Monorepo** composed of three distinct layers:

### 1. The Frontend (React + Vite)
- **Location:** `./src`
- **Stack:** React 18, Vite, Framer Motion, Tailwind CSS, Lucide React, Recharts.
- **Role:** The Client-facing UI. It uses complex Context Providers (`BlockContext`) to map state across dynamic dashboards. It relies on Radix UI primitives and highly customized Tailwind variables (`index.css`) for a "Glassmorphism" premium Dark Mode aesthetic.

### 2. The API Gateway (Node.js + Express)
- **Location:** `./backend`
- **Stack:** Node.js, Express, Supabase JS Client.
- **Role:** Handles core CRUD operations and acts as the secure middleman to the database. It strictly filters datasets (e.g. dropping irrelevant blocks via `blockMapper.js`) before delivering sanitized JSON to the frontend. It proxies heavy AI requests to the Python microservice.

### 3. The AI & ML Engine (Python + FastAPI)
- **Location:** `./chatbot`
- **Stack:** Python 3, FastAPI, XGBoost, Pandas, Groq SDK.
- **Role:** The analytical brain. It hosts the `.pkl` machine learning artifacts to score failure probabilities (`predictor.py`). It also exposes the `/chat` endpoint (`router.py`) that uses natural language intent routing to dynamically query the live database and summarize contextual plant information.

---

## 🛠️ Installation & Setup Instructions

### Prerequisites
You must have the following installed on your machine:
- Node.js (v18+ recommended)
- Python (3.9+ recommended)
- `npm` or `yarn`

### 1. Environment Configurations

You need to establish environmental variables for all three services.

**Root Level (`./.env`)**
```env
VITE_API_URL=http://localhost:5000/api
```

**Node Backend (`./backend/.env`)**
```env
PORT=5000
SUPABASE_URL=your_supabase_project_url
SUPABASE_KEY=your_supabase_anon_or_service_key
```

**Python AI (`./chatbot/.env`)**
```env
SUPABASE_URL=your_supabase_project_url
SUPABASE_KEY=your_supabase_anon_or_service_key
GROQ_API_KEY=your_groq_llm_api_key
```

### 2. Install Dependencies

You need to install dependencies for **all three** directories.

```bash
# 1. Install Frontend Dependencies
npm install

# 2. Install Node.js Backend Dependencies
cd backend
npm install
cd ..

# 3. Install Python AI Dependencies
cd chatbot
pip install -r requirements.txt
cd ..
```

### 3. Running the Stack

We have configured `concurrently` in the root `package.json` to elegantly boot the entire application cluster with a single command. 

From the **Root Directory**, run:
```bash
npm run dev:all
```

**What this does:**
1. Starts the Vite Frontend on HTTP Server (`:5173`)
2. Starts the Node API server (`:5000`)
3. Starts the Uvicorn FastAPI Python server (`:8001`)

---

## 🎨 Design Decisions & Tech Choices

#### State Management & Routing
React Context (`BlockContext`) was chosen over heavy managers like Redux because the state footprint is highly localized (Active Plant Block selection). The mapping logic dynamically drives the components.

#### Why Python for AI?
While TensorFlow.js exists natively, using Python FastAPI allows us to utilize industry-standard data-science packages (`pandas`, `xgboost`, `scikit-learn`) seamlessly. It allows the Frontend to remain ultra-lightweight while the backend does the heavy processing.

#### Secure Context Prompting
The Chatbot (`router.py`) was engineered with stringent Guardrails. Instead of letting the LLM generate raw SQL, the LLM maps intent to pre-defined safe queries (`sql_tools.py`), preventing injection attacks and hallucination when dealing with critical industrial telemetry.

#### UI Aesthetics
We prioritized a high-fidelity modern dashboard look. 
- **Dark Mode Native:** Deep charcoal `#0E1117` and `#1A1D29` for reduced eye strain in operational command centers.
- **Color Coding:** Actionable health metric colors: `#00E676` (Healthy/Green), `#FFC107` (Warning/Amber), `#FF5252` (Critical/Red).
- **Framer Motion:** Used to inject micro-animations, ensuring the dashboard feels alive during real-time data ingestion.

## Team Members
#### Member 1
- **Name:** Aadhiya Hirani
- **Phone Number:** 9429277156
- **email ID:** 23bce103@nirmauni.ac.in
- **College name:** Nirma University
- **Year of Graduation:** 2027
#### Member 2
- **Name:** Diya Gupta
- **Phone Number:** 9879472806
- **email ID:** 23bce071@nirmauni.ac.in
- **College name:** Nirma University
- **Year of Graduation:** 2027
#### Member 3
- **Name:** Tejas Gheria
- **Phone Number:** 8849348301
- **email ID:** 23bce082@nirmauni.ac.in
- **College name:** Nirma University
- **Year of Graduation:** 2027
#### Member 4
- **Name:** Hensi Patel
- **Phone Number:** 7043351302
- **email ID:** 23bce095@nirmauni.ac.in
- **College name:** Nirma University
- **Year of Graduation:** 2027
#### Member 5
- **Name:** Prapti Patel
- **Phone Number:** 7041985054
- **email ID:** 23bce241@nirmauni.ac.in
- **College name:** Nirma University
- **Year of Graduation:** 2027
