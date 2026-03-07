from backend.ml_model.predictor import predict_failure, fetch_latest_telemetry
from backend.tools.sql_tools import PLANT_LIST, PLANTS, _count_inverters_in_plant


def get_risk_assessment(inverter_id=None, plant_id=None, inverter_idx=None) -> dict:
    """Fetches telemetry and runs failure prediction for a specific inverter."""
    try:
        prediction_data = predict_failure(inverter_id=inverter_id, plant_id=plant_id, inverter_idx=inverter_idx)
        return {"success": True, "data": prediction_data}
    except Exception as e:
        return {"success": False, "error": str(e)}


def get_high_risk_inverters(plant_id: str = None) -> dict:
    """Retrieves high-risk inverters by running per-inverter predictions."""
    try:
        tables = [plant_id] if plant_id and plant_id in PLANT_LIST else PLANT_LIST
        results = []

        for table in tables:
            count = _count_inverters_in_plant(table)
            if count == 0:
                continue
            for idx in range(count):
                try:
                    result = predict_failure(plant_id=table, inverter_idx=str(idx))
                    if result:
                        block = PLANTS.get(table, "?")
                        results.append({
                            "plant_id": table,
                            "block": block,
                            "inverter_idx": idx,
                            "inverter_label": f"Block {block} — Inverter {idx + 1}",
                            "failure_probability": result.get("failure_probability", 0),
                            "prediction": "FAILING" if result.get("prediction") == 1 else "NORMAL",
                            "top_feature": result.get("top_contributing_feature", "unknown")
                        })
                except Exception:
                    continue

        results.sort(key=lambda x: x["failure_probability"], reverse=True)

        return {
            "success": True,
            "total_analyzed": len(results),
            "risky_inverters": results[:5]
        }
    except Exception as e:
        return {"success": False, "error": str(e)}


def get_top_risky_inverters(plant_id: str = None, limit: int = 3) -> dict:
    """Wrapper around get_high_risk_inverters for backward compat."""
    result = get_high_risk_inverters(plant_id)
    if result["success"]:
        result["risky_inverters"] = result["risky_inverters"][:limit]
    return result
