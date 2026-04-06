import pandas as pd
import io

def parse_zscaler_logs(content: str):
    df = pd.read_csv(io.StringIO(content))
    
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