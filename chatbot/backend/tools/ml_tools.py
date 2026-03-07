from backend.ml_model.predictor import predict_failure, fetch_latest_telemetry

def get_risk_assessment(inverter_id=None, plant_id=None, inverter_idx=None) -> dict:
    """Fetches telemetry and runs failure prediction for a specific inverter."""
    try:
        prediction_data = predict_failure(inverter_id=inverter_id, plant_id=plant_id, inverter_idx=inverter_idx)
        return {"success": True, "data": prediction_data}
    except Exception as e:
        return {"success": False, "error": str(e)}

def get_top_risky_inverters(plant_id: str = None, limit: int = 3) -> dict:
    """Retrieves the top high-risk inverters."""
    # In a full production app, this would query all rows in Supabase and run predict_failure.
    # We will simulate the aggregation here for demonstration, running against the mock DB.
    try:
        # We test DB health
        raw_data = fetch_latest_telemetry(plant_id=plant_id) 
        mocked_risks = [
            {"inverter_id": "INV_2", "risk_probability": 0.72, "top_feature": "temperature"},
            {"inverter_id": "INV_1", "risk_probability": 0.45, "top_feature": "voltage_fluctuation"},
            {"inverter_id": "INV_5", "risk_probability": 0.38, "top_feature": "power_drop"}
        ]
        message = f"Top {limit} risky inverters retrieved for {plant_id if plant_id else 'all plants'}."
        return {
            "success": True, 
            "message": message,
            "risky_inverters": mocked_risks[:limit]
        }
    except Exception as e:
         return {"success": False, "error": str(e)}
