from sklearn.ensemble import IsolationForest

def detect_anomalies(df):
    if df.empty: return df

    # AI Training
    model = IsolationForest(contamination=0.1, random_state=42)
    
    # Numeric data select 
    features = df[['risk_score', 'bytes_sent']].fillna(0)
    
    df['anomaly_score'] = model.fit_predict(features)
    df['is_anomaly'] = df['anomaly_score'] == -1
    
    # Anomaly Reason (Bonus Requirement)
    def get_reason(row):
        if row['is_anomaly']:
            if row['risk_score'] > 75: return "High Risk Score detected by Zscaler"
            if row['bytes_sent'] > 1000000: return "Unusual data transfer volume"
            return "Suspicious behavioral pattern"
        return ""

    df['reason'] = df.apply(get_reason, axis=1)
    return df