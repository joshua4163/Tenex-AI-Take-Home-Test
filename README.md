# SentinelFlow: Full-Stack AI Log Analyzer

## 🏗️ Architecture Overview
Designed as a decoupled micro-pipeline to ensure scalability in SOC environments.

1.  **Ingestion:** Next.js (App Router) with client-side validation. 
2.  **Processing:** FastAPI (Python) service. Uses a multi-stage pipeline:
    * **Regex Parser:** Efficiently structures raw ZScaler/Proxy logs.
    * **ML Engine:** Uses Scikit-learn (Isolation Forest) for high-speed statistical outlier detection.
    * **AI Augmentation:** OpenAI GPT-4o-mini generates context-aware reasoning only for high-score anomalies (optimizing for cost/latency).
3.  **Storage:** PostgreSQL with an optimized index on `timestamp` for fast dashboard retrieval. 

## 🧠 Anomaly Detection Approach
Instead of passing every log line to an LLM, I implemented a **Hybrid Detection Strategy**:  
- **Layer 1 (Statistical):** Flagging logs where `bytes_sent` or `request_frequency` is > 3 standard deviations from the mean.
- **Layer 2 (Generative):** The LLM reviews the 1% of logs flagged by Layer 1 to explain the "Human Intent" behind the threat.

## 🚀 Future Scalability (Roadmap)
- **Async Processing:** Transition from REST to a Celery/Redis worker pattern for multi-gigabyte uploads.
- **Stream Processing:** Integrate Kafka for real-time log ingestion vs. batch uploads.
- **Vector Search:** Use pgvector to find similar historical threats.
