from pathlib import Path
from catboost import CatBoostRegressor


MODEL_PATH = (
    Path(__file__).resolve().parent
    / "models"
    / "RailCast_AI_CatBoost_V2.cbm"
)

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

CATEGORICAL_FEATURES = [
    "train",
    "station",
    "next_station",
]


model = CatBoostRegressor()
model.load_model(str(MODEL_PATH))


def predict_delay(features: dict) -> float:
    """
    Predict arrival delay using the RailCast AI CatBoost V2 model.
    """

    import pandas as pd

    row = {
        feature: features[feature]
        for feature in FEATURES
    }

    df = pd.DataFrame([row], columns=FEATURES)

    prediction = model.predict(df)

    predicted_delay = max(0.0, float(prediction[0]))

    return round(predicted_delay, 2)
