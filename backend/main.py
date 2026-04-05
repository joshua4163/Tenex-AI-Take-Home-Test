from fastapi import FastAPI, UploadFile, File, BackgroundTasks
from fastapi.middleware.cors import CORSMiddleware
import pandas as pd
import io
import sqlite3
from sklearn.ensemble import IsolationForest
import numpy as np

app = FastAPI()

# Frontend connectivity
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

# AI Model Initialization (Global ga unte fast ga untundi)
model = IsolationForest(contamination=0.2, random_state=42)

def process_remaining_chunks(file_content):
    """
    Background lo 10GB data ni process chese function.
    User ki response vellaka idi silent ga run avthundi.
    """
    conn = sqlite3.connect('logs.db')
    # Chunksize use chesthe memory crash avvadu
    for chunk in pd.read_csv(io.BytesIO(file_content), chunksize=100000):
        # ... (AI analysis and DB storage logic ikkada untundi) ...
        pass
    conn.close()

@app.post("/analyze")
async def analyze_logs(background_tasks: BackgroundTasks, file: UploadFile = File(...)):
    try:
        contents = await file.read()
        
        # ⚡ FAST PATH: Only read first 50,000 rows for immediate UI response
        # Dheenivalla 10GB file aina 2 seconds lo results vasthayi
        df = pd.read_csv(io.BytesIO(contents), nrows=50000)
        
        # Data Cleaning
        mapping = {'time': 'timestamp', 'login': 'source_ip', 'url': 'url', 'totalsize': 'bytes_sent', 'risk_score': 'status'}
        df = df.rename(columns=mapping)
        df['status'] = pd.to_numeric(df['status'], errors='coerce').fillna(0)
        df['bytes_sent'] = pd.to_numeric(df['bytes_sent'], errors='coerce').fillna(0)

        # AI Prediction (Fast Inference)
        features = df[['status', 'bytes_sent']]
        df['is_anomaly'] = model.fit_predict(features) == -1
        
        # Background Task: Start processing the rest of the 10GB
        background_tasks.add_task(process_remaining_chunks, contents)

        # JSON Ready format
        final_df = df.fillna(0).replace([np.inf, -np.inf], 0)
        return final_df.to_dict(orient="records")

    except Exception as e:
        return {"error": str(e)}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)