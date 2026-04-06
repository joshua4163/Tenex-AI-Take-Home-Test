from fastapi import FastAPI, UploadFile, File, BackgroundTasks
from fastapi.middleware.cors import CORSMiddleware
import pandas as pd
import io
import sqlite3
from sklearn.ensemble import IsolationForest
import numpy as np
import os

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

# AI Model Initialization
model = IsolationForest(contamination=0.2, random_state=42)

# Function to save data in background (The "Scalability" part)
def process_remaining_chunks(file_content):
    conn = sqlite3.connect('logs.db')
    # Reading in chunks to handle huge files without crashing RAM
    for chunk in pd.read_csv(io.BytesIO(file_content), chunksize=50000):
        chunk.to_sql('all_logs', conn, if_exists='append', index=False)
    conn.close()
    print("✅ Background processing complete. All logs saved to SQLite.")

@app.post("/analyze")
async def analyze_logs(background_tasks: BackgroundTasks, file: UploadFile = File(...)):
    try:
        contents = await file.read()
        
        # ⚡ Read first 50k rows for Instant Preview
        df = pd.read_csv(io.BytesIO(contents), nrows=50000)
        
        # Data Cleaning & Mapping
        mapping = {'time': 'timestamp', 'login': 'source_ip', 'url': 'url', 'totalsize': 'bytes_sent', 'risk_score': 'status'}
        df = df.rename(columns=mapping)
        df['status'] = pd.to_numeric(df['status'], errors='coerce').fillna(0)
        df['bytes_sent'] = pd.to_numeric(df['bytes_sent'], errors='coerce').fillna(0)

        # 🧠 AI ANALYSIS
        features = df[['status', 'bytes_sent']]
        predictions = model.fit_predict(features)
        raw_scores = model.decision_function(features)
        
        results = []
        mean_bytes = df['bytes_sent'].mean()

        for i in range(len(df)):
            is_anomaly = bool(predictions[i] == -1)
            conf = 0
            reason = "Normal activity pattern."
            
            if is_anomaly:
                conf = round(min(abs(raw_scores[i]) * 500, 99.9), 2) 
                row = df.iloc[i]
                if row['status'] > 80:
                    reason = "Critical Zscaler Risk Score detected."
                elif row['bytes_sent'] > mean_bytes * 10:
                    reason = "Anomalous Data Volume: Potential Exfiltration."
                else:
                    reason = "Behavioral Outlier: Pattern deviates from baseline."

            record = df.iloc[i].to_dict()
            record.update({
                "is_anomaly": is_anomaly,
                "confidence": conf if is_anomaly else 0,
                "reason": reason
            })
            results.append(record)
        
        # 🚀 Start saving the rest of the 10GB file in the background
        background_tasks.add_task(process_remaining_chunks, contents)

        return pd.DataFrame(results).fillna(0).replace([np.inf, -np.inf], 0).to_dict(orient="records")

    except Exception as e:
        return {"error": str(e)}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)