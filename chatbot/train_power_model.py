import os
import requests
import json
import pandas as pd
import numpy as np
from sklearn.model_selection import train_test_split
from sklearn.ensemble import RandomForestRegressor
from sklearn.metrics import mean_squared_error, r2_score

def fetch_telemetry_data():
    env_vars = {}
    with open('backend/.env', 'r') as f:
        for line in f:
            if '=' in line:
                k, v = line.strip().split('=', 1)
                env_vars[k] = v

    url = env_vars.get("SUPABASE_URL")
    key = env_vars.get("SUPABASE_SERVICE_KEY")
    
    headers = {
        "apikey": key,
        "Authorization": f"Bearer {key}"
    }
    
    print("--- 1. Fetching Telemetry Data from Database ---")
    response = requests.get(f"{url}/rest/v1/plant1_1?limit=2000&order=timestamp.desc", headers=headers)
    if response.status_code != 200:
        print(f"Failed to fetch data: {response.text}")
        return None
        
    data = response.json()
    print(f"Fetched {len(data)} rows from Supabase.")
    return pd.DataFrame(data)

def create_and_run_model():
    df = fetch_telemetry_data()
    if df is None or df.empty:
        return
        
    print("\n--- 2. Preparing Features and Target ---")
    # Mapping to DB columns
    # target: inverters[0].power
    # features: inverters[0].temp, inverters[0].pv1_voltage, inverters[0].pv1_current, sensors[0].ambient_temp
    
    features = [
        'inverters[0].temp', 
        'inverters[0].v_ab', 
        'smu[0].string1', 
        'sensors[0].ambient_temp'
    ]
    target = 'inverters[0].power'
    
    # Ensure columns exist, drop rows with NaN in these columns
    cols_to_check = features + [target]
    for c in cols_to_check:
        if c not in df.columns:
            print(f"Column {c} not found in DB!")
            return
            
    # Convert to numeric just in case
    for c in cols_to_check:
        df[c] = pd.to_numeric(df[c], errors='coerce')
        
    df = df.dropna(subset=cols_to_check)
    
    print(f"Dataset Size after cleaning: {df.shape[0]} rows")
    if df.shape[0] < 10:
        print("Not enough data to train a model.")
        return
        
    print("Dataset Sample (first 5 rows):")
    print(df[cols_to_check].head())
    
    X = df[features]
    y = df[target]
    
    X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42)
    print(f"Training set: {X_train.shape[0]} rows | Testing set: {X_test.shape[0]} rows")
    
    print("\n--- 3. Training RandomForest Regressor Model ---")
    model = RandomForestRegressor(n_estimators=100, random_state=42)
    model.fit(X_train, y_train)
    print("Model training complete!")
    
    print("\n--- 4. Evaluating the Model ---")
    predictions = model.predict(X_test)
    rmse = np.sqrt(mean_squared_error(y_test, predictions))
    r2 = r2_score(y_test, predictions)
    
    print(f"RMSE (Root Mean Squared Error): {rmse:.2f} W")
    print(f"R² Score: {r2:.4f} (1.0 is perfect prediction)")
    
    print("\n--- 5. Feature Importances ---")
    importances = model.feature_importances_
    # rename for display nicely
    display_names = ['temp', 'v_ab', 'string1_current', 'ambient_temp']
    for feature_name, imp in sorted(zip(display_names, importances), key=lambda x: x[1], reverse=True):
        print(f" - {feature_name}: {imp:.4f} ({imp*100:.1f}%) contribution")

if __name__ == "__main__":
    create_and_run_model()
