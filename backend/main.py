from fastapi import FastAPI, UploadFile, File, BackgroundTasks
from fastapi.middleware.cors import CORSMiddleware
import pandas as pd
import io
import sqlite3
from sklearn.ensemble import IsolationForest
import numpy as np

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

# AI Model Initialization
model = IsolationForest(contamination=0.2, random_state=42)

def process_remaining_chunks(file_content):
    # Background processing logic
    conn = sqlite3.connect('logs.db')
    for chunk in pd.read_csv(io.BytesIO(file_content), chunksize=100000):
        pass
    conn.close()

@app.post("/analyze")
async def analyze_logs(background_tasks: BackgroundTasks, file: UploadFile = File(...)):
    try:
        contents = await file.read()
        
        # ⚡ Read first 50k rows for speed
        df = pd.read_csv(io.BytesIO(contents), nrows=50000)
        
        # Data Cleaning & Mapping
        mapping = {'time': 'timestamp', 'login': 'source_ip', 'url': 'url', 'totalsize': 'bytes_sent', 'risk_score': 'status'}
        df = df.rename(columns=mapping)
        df['status'] = pd.to_numeric(df['status'], errors='coerce').fillna(0)
        df['bytes_sent'] = pd.to_numeric(df['bytes_sent'], errors='coerce').fillna(0)

        # 🧠 AI ANALYSIS
        features = df[['status', 'bytes_sent']]
        
        # 1. Predict Anomalies (-1 = anomaly, 1 = normal)
        predictions = model.fit_predict(features)
        
        # 2. Get Decision Scores (Lower/Negative means more anomalous)
        raw_scores = model.decision_function(features)
        
        # 3. Logic for Results, Confidence, and Reasons
        results = []
        
        # Mean bytes for anomaly reasoning
        mean_bytes = df['bytes_sent'].mean()

        for i in range(len(df)):
            is_anomaly = bool(predictions[i] == -1)
            
            # --- Confidence Score Calculation ---
            # Decision function negative values indicate outliers.
            # Normalizing it to a 0-100 scale for UI.
            conf = 0
            reason = "Normal activity pattern."
            
            if is_anomaly:
                # Calculate confidence based on how far it is from the boundary
                conf = round(min(abs(raw_scores[i]) * 500, 99.9), 2) 
                
                # --- Reasoning Engine ---
                if df.iloc[i]['status'] > 80:
                    reason = "Critical Zscaler Risk Score detected (High Threat)."
                elif df.iloc[i]['bytes_sent'] > mean_bytes * 10:
                    reason = "Anomalous Data Volume: Potential Data Exfiltration detected."
                elif df.iloc[i]['status'] > 50 and df.iloc[i]['bytes_sent'] > mean_bytes * 3:
                    reason = "Correlation Alert: Suspicious risk score and elevated data transfer."
                else:
                    reason = "Behavioral Outlier: Pattern deviates from baseline user activity."

            # Build record
            record = df.iloc[i].to_dict()
            record.update({
                "is_anomaly": is_anomaly,
                "confidence": conf if is_anomaly else 0,
                "reason": reason
            })
            results.append(record)
        
        background_tasks.add_task(process_remaining_chunks, contents)

        # Clean up JSON formatting
        return pd.DataFrame(results).fillna(0).replace([np.inf, -np.inf], 0).to_dict(orient="records")

    except Exception as e:
        return {"error": str(e)}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)