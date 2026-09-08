from pydantic import BaseModel, Field


class PredictionRequest(BaseModel):
    train_number: str = Field(..., min_length=1)
    current_station: str = Field(..., min_length=2)
    departure_delay: float = 0


class PredictionResponse(BaseModel):
    train: str
    current_station: str
    next_station: str
    scheduled_arrival: str
    predicted_arrival: str
    predicted_delay_min: float
    status: str
    model: str
