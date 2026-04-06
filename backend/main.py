from fastapi import FastAPI, UploadFile, File
from fastapi.middleware.cors import CORSMiddleware
import pandas as pd
import io
from sklearn.ensemble import IsolationForest
import numpy as np
import os

app = FastAPI()

# Enable CORS for Vercel Frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

# AI Model Initialization
model = IsolationForest(contamination=0.2, random_state=42)

@app.get("/")
def health():
    return {"status": "SentinelFlow API is Live"}

@app.post("/analyze")
async def analyze_logs(file: UploadFile = File(...)):
    try:
        contents = await file.read()
        
        # ⚡ Read first 10k rows (Vercel has a 10s timeout, 50k might be too slow)
        df = pd.read_csv(io.BytesIO(contents), nrows=10000)
        
        # Data Cleaning & Mapping
        mapping = {
            'time': 'timestamp', 
            'login': 'source_ip', 
            'url': 'url', 
            'totalsize': 'bytes_sent', 
            'risk_score': 'status'
        }
        df = df.rename(columns=mapping)
        
        # Ensure columns exist before processing
        cols = ['status', 'bytes_sent']
        for col in cols:
            if col in df.columns:
                df[col] = pd.to_numeric(df[col], errors='coerce').fillna(0)
            else:
                df[col] = 0

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

        # ⚠️ SQLite logic removed for Vercel compatibility
        return pd.DataFrame(results).fillna(0).replace([np.inf, -np.inf], 0).to_dict(orient="records")

    except Exception as e:
        return {"error": str(e)}

# For local testing
if __name__ == "__main__":
    import uvicorn
    port = int(os.environ.get("PORT", 8000))
    uvicorn.run(app, host="0.0.0.0", port=port)