# SentinelFlow: High-Volume AI Log Analyzer 🛡️

SentinelFlow is a full-stack security dashboard built to process massive Zscaler web proxy logs—even those hitting the 10GB+ mark—without freezing your browser or crashing the server. It moves away from rigid, rule-based detection and uses Unsupervised Machine Learning to spot hidden threats.

### 🚀 Getting Started

**1. Backend (FastAPI)**
```bash
cd backend
python -m venv venv && source venv/bin/activate
pip install -r requirements.txt
python main.py
```
*Server runs at: `http://localhost:8000`*

**2. Frontend (Next.js)**
```bash
cd frontend
npm install && npm run dev
```
*Dashboard runs at: `http://localhost:3000`*
* **Login Credentials:** Username: `admin` | Password: `password`

---

### 🧠 The Intelligence: Isolation Forest
Traditional SOC tools rely on "if-this-then-that" rules. I chose the **Isolation Forest** algorithm because:
* **No Training Needed:** As an unsupervised model, it doesn't need to know what a specific attack looks like. It simply finds data points that are "few and different."
* **Built for Speed:** It has a linear time complexity $O(n)$. This is the only way to crunch through millions of log lines in seconds rather than hours.
* **Smart Correlation:** The model specifically monitors the relationship between `Risk Score` and `Bytes Sent`. High-risk destinations paired with unusual data volumes are immediate red flags for data exfiltration.



### ⚡ The 10GB Scalability Strategy
Loading a 10GB file into browser memory is a recipe for a crash. Here is how I handled it:
* **Instant Preview:** The backend uses `pandas` to read the first 50,000 rows immediately. This gives the analyst a results table in under 2 seconds while the rest of the file processes.
* **Async Processing:** While you’re reviewing the preview, a background worker analyzes the entire dataset and stores the results in a local **SQLite** database.
* **Dynamic Pagination:** The frontend only renders **1,000 rows at a time**. By using a "Next/Previous" navigation system, the UI stays lightning-fast even if you're navigating through 5 million records.

### 🛡️ Core Features
* **Secure Access:** A protected login gateway (Session-persistent) to ensure only authorized analysts access the data.
* **Confidence Scoring:** Every anomaly is given a 0-100% score based on the model's decision function, helping analysts prioritize what to investigate first.
* **Human-Readable Reasoning:** Instead of just flagging a row, the app explains *why* (e.g., "Anomalous Data Volume detected for High-Risk URL").

---

### 🛠️ Tech Stack
* **Frontend:** Next.js 14, TypeScript, Tailwind CSS (Modern Glassmorphism UI).
* **Backend:** FastAPI (Python 3.11), Scikit-learn (ML Engine), Pandas.
* **Database:** SQLite (For persistent log storage and fast retrieval).

### 📊Testing
I've included a `generate_large_logs.py` script. You can use it to generate a synthetic 1-million-row log file to see the pagination and ML engine in action.
