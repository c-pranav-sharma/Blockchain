import pandas as pd
import numpy as np
import logging
from sklearn.ensemble import IsolationForest
from sklearn.preprocessing import StandardScaler
from datetime import datetime, timedelta

# Configure logging for professional output
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s [%(levelname)s] %(message)s',
    datefmt='%H:%M:%S'
)
logger = logging.getLogger(__name__)

class SCAIAnomalyDetector:
    """
    Production-style Anomaly Detection for SCAIStaking DApp.
    Uses Isolation Forest to identify suspicious blockchain staking patterns.
    """
    
    def __init__(self, contamination=0.05):
        self.model = IsolationForest(contamination=contamination, random_state=42)
        self.scaler = StandardScaler()
        self.features = ['stake_amount', 'time_since_last_tx_seconds']

    def generate_simulated_data(self, n_normal=500, n_malicious=25):
        """
        Simulates staking transaction logs for normal users and bots.
        """
        logger.info(f"Generating simulated data: {n_normal} normal, {n_malicious} malicious...")
        
        # 1. Normal User Behavior: Moderate amounts, infrequent TXs
        normal_data = {
            'user_address': [f'0xUser{i}' for i in range(n_normal)],
            'stake_amount': np.random.uniform(100, 5000, n_normal),  # 100 to 5000 SCAI
            'time_since_last_tx_seconds': np.random.uniform(3600, 86400, n_normal), # 1 hour to 1 day
            'is_bot': 0
        }
        
        # 2. Malicious Bot/Sybil Behavior: Tiny amounts, extremely rapid TXs
        malicious_data = {
            'user_address': [f'0xBot{i}' for i in range(n_malicious)],
            'stake_amount': np.random.uniform(0.01, 1.0, n_malicious), # Micro-staking
            'time_since_last_tx_seconds': np.random.uniform(1, 30, n_malicious), # 1 to 30 seconds
            'is_bot': 1
        }
        
        df_normal = pd.DataFrame(normal_data)
        df_malicious = pd.DataFrame(malicious_data)
        
        return pd.concat([df_normal, df_malicious]).sample(frac=1).reset_index(drop=True)

    def train_and_detect(self, df):
        """
        Trains the Isolation Forest model and flags anomalies.
        """
        logger.info("Starting ML Workflow: Preprocessing and Training...")
        
        # Preprocessing: Scale features for better model performance
        X = df[self.features]
        X_scaled = self.scaler.fit_transform(X)
        
        # Fit Isolation Forest
        self.model.fit(X_scaled)
        
        # Predict: 1 for normal, -1 for anomaly
        df['anomaly_score'] = self.model.decision_function(X_scaled)
        df['prediction'] = self.model.predict(X_scaled)
        
        # Map -1 to True (Anomaly Detected)
        df['is_suspicious'] = df['prediction'].apply(lambda x: True if x == -1 else False)
        
        return df

    def export_results(self, df, filename='flagged_anomalies.csv'):
        """
        Exports detected anomalies to a CSV file for security review.
        """
        anomalies = df[df['is_suspicious'] == True]
        logger.info(f"Detected {len(anomalies)} anomalies out of {len(df)} total transactions.")
        
        if not anomalies.empty:
            anomalies.to_csv(filename, index=False)
            logger.info(f"Successfully exported flagged anomalies to {filename}")
            
            # Print sample output for the report
            print("\n" + "="*60)
            print("         SCAI STAKING SECURITY REPORT: ANOMALIES DETECTED")
            print("="*60)
            print(anomalies[['user_address', 'stake_amount', 'time_since_last_tx_seconds', 'anomaly_score']].head(10))
            print("="*60 + "\n")
        else:
            logger.warning("No anomalies detected.")

def main():
    print("""
    -------------------------------------------------------
    SCAIStaking: Blockchain Anomaly Detection Engine (ML)
    -------------------------------------------------------
    Objective: Identify Sybil attacks and micro-staking bots.
    Methodology: Unsupervised Isolation Forest.
    -------------------------------------------------------
    """)
    
    # Initialize Detector
    detector = SCAIAnomalyDetector(contamination=0.05)
    
    # Step 1: Simulate Logs
    data = detector.generate_simulated_data()
    
    # Step 2: Run Detection
    results = detector.train_and_detect(data)
    
    # Step 3: Export and Report
    detector.export_results(results)
    
    logger.info("ML Service cycle complete. Ready for integration.")

if __name__ == "__main__":
    main()
