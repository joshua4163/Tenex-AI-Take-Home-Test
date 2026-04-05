import pandas as pd
import io

def parse_zscaler_logs(content: str):
    # CSV format lo read chesthunnam (Zscaler NSS standard)
    df = pd.read_csv(io.StringIO(content))
    
    # Manaki kavalsina columns ni filter/rename cheddam
    # Zscaler fields: %s{time}, %s{login}, %s{url}, %s{action}, %d{totalsize}, %d{riskscore}
    
    # Dashboard lo chupinchadaniki mapping
    mapping = {
        'time': 'timestamp',
        'login': 'user',
        'url': 'url',
        'action': 'action',
        'totalsize': 'bytes_sent',
        'riskscore': 'risk_score',
        'cip': 'source_ip'
    }
    
    df = df.rename(columns=mapping)
    return df