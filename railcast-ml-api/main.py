from fastapi import FastAPI, HTTPException
from datetime import datetime, timedelta

from schemas import PredictionRequest, PredictionResponse
from feature_builder import build_features
from model import predict_delay


app = FastAPI(
    title="RailCast AI ML API",
    version="2.0"
)


# --------------------------------------------------
# ROOT
# --------------------------------------------------

@app.get("/")
def root():
    return {
        "service": "RailCast AI ML API",
        "model": "RailCast_AI_CatBoost_V2",
        "status": "running"
    }


# --------------------------------------------------
# HEALTH CHECK
# --------------------------------------------------

@app.get("/health")
def health():
    return {
        "status": "healthy",
        "model": "RailCast_AI_CatBoost_V2"
    }


# --------------------------------------------------
# PREDICTION
# --------------------------------------------------

@app.post("/predict", response_model=PredictionResponse)
def predict(request: PredictionRequest):

    try:
        # ------------------------------------------
        # 1. Build ML features
        # ------------------------------------------
        features, next_station, scheduled_arrival = build_features(
            train_number=request.train_number,
            current_station=request.current_station,
            departure_delay=request.departure_delay
        )

        # ------------------------------------------
        # 2. Run CatBoost model
        # ------------------------------------------
        predicted_delay = predict_delay(features)

        # Make sure prediction is never negative
        predicted_delay = max(0, float(predicted_delay))

        # ------------------------------------------
        # 3. Convert scheduled arrival HH:MM
        # ------------------------------------------
        scheduled_time = datetime.strptime(
            scheduled_arrival,
            "%H:%M"
        )

        # ------------------------------------------
        # 4. Add predicted delay
        # ------------------------------------------
        predicted_time = scheduled_time + timedelta(
            minutes=predicted_delay
        )

        predicted_arrival = predicted_time.strftime("%H:%M")

        # ------------------------------------------
        # 5. Determine train status
        # ------------------------------------------
        if predicted_delay <= 2:
            status = "On Time"

        elif predicted_delay <= 10:
            status = "Slightly Delayed"

        else:
            status = "Delayed"

        # ------------------------------------------
        # 6. Return response
        # ------------------------------------------
        return PredictionResponse(
            train=request.train_number,
            current_station=request.current_station,
            next_station=next_station,
            scheduled_arrival=scheduled_arrival,
            predicted_arrival=predicted_arrival,
            predicted_delay_min=round(predicted_delay, 2),
            status=status,
            model="RailCast_AI_CatBoost_V2"
        )

    except ValueError as e:

        raise HTTPException(
            status_code=400,
            detail=str(e)
        )

    except Exception as e:

        raise HTTPException(
            status_code=500,
            detail=str(e)
        )
