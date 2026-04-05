import pandas as pd
import numpy as np
import random
from datetime import datetime, timedelta

def generate_bulk_zscaler_logs(num_rows=1000000):
    print(f"Generating {num_rows} logs... Idhi konchem time paduthundi mowa!")
    
    start_time = datetime.now()
    log_data = []
    
    # Pre-defined data for randomization
    users = ['joshua@safemarch.com', 'angie@safemarch.com', 'admin@safemarch.com', 'guest@safemarch.com']
    apps = ['Gmail', 'Google Drive', 'Salesforce', 'Slack', 'GitHub', 'Unknown']
    urls = ['mail.google.com', 'drive.google.com', 'github.com', 'malware-site.ru', 'internal.server.local']
    
    data = {
        'time': [(start_time + timedelta(seconds=i)).strftime("%a %b %d %H:%M:%S %Y") for i in range(num_rows)],
        'login': [random.choice(users) for _ in range(num_rows)],
        'appname': [random.choice(apps) for _ in range(num_rows)],
        'risk_score': np.random.randint(0, 40, size=num_rows), # Normal logs (0-40)
        'url': [random.choice(urls) for _ in range(num_rows)],
        'cip': [f"192.168.1.{random.randint(1, 254)}" for _ in range(num_rows)],
        'sip': [f"142.250.{random.randint(1, 255)}.{random.randint(1, 255)}" for _ in range(num_rows)],
        'action': ['Allowed'] * num_rows,
        'totalsize': np.random.randint(100, 10000, size=num_rows), # Normal size (100 bytes - 10KB)
        'threatname': ['None'] * num_rows
    }

    df = pd.DataFrame(data)

    # --- Add Anomalies (Injecting threats for AI to catch) ---
    # 1. High Risk Score Anomaly
    df.loc[random.sample(range(num_rows), 500), 'risk_score'] = 95
    df.loc[df['risk_score'] == 95, 'threatname'] = 'Win32/Trojan.Gen'
    
    # 2. High Data Transfer Anomaly (Data Exfiltration)
    df.loc[random.sample(range(num_rows), 500), 'totalsize'] = 985000000 # ~900MB
    
    df.to_csv('large_zscaler_logs.csv', index=False)
    print("Success! 'large_zscaler_logs.csv' ready ayindi.")

if __name__ == "__main__":
    generate_bulk_zscaler_logs(1000000) # Change to 10,000,000 if you want 10x more