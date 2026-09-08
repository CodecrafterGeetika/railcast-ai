from datetime import datetime, timedelta

from fastapi import FastAPI, HTTPException

from feature_builder import build_features
from model import predict_delay
from schemas import PredictionRequest, PredictionResponse


app = FastAPI(
    title="RailCast AI ML API",
    version="2.0.0",
)


@app.get("/")
def root():
    return {
        "service": "RailCast AI ML API",
        "model": "RailCast_AI_CatBoost_V2",
        "status": "running",
    }


@app.get("/health")
def health():
    return {
        "status": "healthy",
        "model": "RailCast_AI_CatBoost_V2",
    }


@app.post(
    "/predict",
    response_model=PredictionResponse
)
def predict(request: PredictionRequest):

    try:

        now = datetime.now()

        (
            features,
            next_station,
            scheduled_arrival
        ) = build_features(
            train_number=request.train_number,
            current_station=request.current_station,
            departure_delay=request.departure_delay,
            now=now,
        )

        predicted_delay = predict_delay(features)

        # Convert scheduled arrival into a datetime.
        arrival_time = datetime.strptime(
            scheduled_arrival,
            "%H:%M:%S"
        )

        # Put it on today's date.
        scheduled_datetime = datetime.combine(
            now.date(),
            arrival_time.time()
        )

        # Handle an arrival time that has already passed
        # because of a midnight-crossing timetable.
        if scheduled_datetime < now - timedelta(hours=12):
            scheduled_datetime += timedelta(days=1)

        predicted_datetime = (
            scheduled_datetime
            + timedelta(minutes=predicted_delay)
        )

        predicted_arrival = predicted_datetime.strftime(
            "%H:%M"
        )

        scheduled_arrival_formatted = (
            scheduled_datetime.strftime("%H:%M")
        )

        if predicted_delay <= 2:
            status = "On Time"
        elif predicted_delay <= 10:
            status = "Slightly Delayed"
        else:
            status = "Delayed"

        return PredictionResponse(
            train=str(request.train_number),
            current_station=request.current_station.upper(),
            next_station=next_station,
            scheduled_arrival=scheduled_arrival_formatted,
            predicted_arrival=predicted_arrival,
            predicted_delay_min=predicted_delay,
            status=status,
            model="RailCast_AI_CatBoost_V2",
        )

    except Exception as exc:

        raise HTTPException(
            status_code=400,
            detail=str(exc)
        )
