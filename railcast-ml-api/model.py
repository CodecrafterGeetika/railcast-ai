from pathlib import Path
from catboost import CatBoostRegressor
import pandas as pd

BASE_DIR = Path(__file__).resolve().parent
MODEL_PATH = BASE_DIR / "RailCast_AI_CatBoost_V2.cbm"

model = CatBoostRegressor()
model.load_model(str(MODEL_PATH))

FEATURES = [
    "train",
    "station",
    "next_station",
    "dep_delay",
    "scheduled_travel_min",
    "day_of_week",
    "departure_hour",
    "departure_minute",
    "historical_mean_delay",
    "historical_median_delay",
    "historical_std_delay",
    "historical_mean_dep_delay",
    "historical_observations",
    "historical_mean_delay_change",
    "historical_median_delay_change",
    "historical_std_delay_change",
]

def predict_delay(input_data):
    # Convert dictionary into a DataFrame
    df = pd.DataFrame([input_data])

    # Force exact feature order expected by CatBoost
    df = df[FEATURES]

    prediction = model.predict(df)

    return max(0, float(prediction[0]))
