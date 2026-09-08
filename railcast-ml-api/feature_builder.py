from pathlib import Path
import pandas as pd
from datetime import datetime


BASE_DIR = Path(__file__).resolve().parent
CSV_PATH = BASE_DIR / "train_details.csv"

train_details = pd.read_csv(CSV_PATH)


def normalize_train_number(value):
    return str(value).replace(".0", "").strip()


def time_to_minutes(value):
    if pd.isna(value):
        return None

    value = str(value).strip()

    try:
        hour, minute = map(int, value.split(":")[:2])
        return hour * 60 + minute
    except Exception:
        return None


def minutes_to_time(minutes):
    minutes = int(round(minutes)) % (24 * 60)
    return f"{minutes // 60:02d}:{minutes % 60:02d}"


def build_features(train_number, current_station, departure_delay, now=None):
    train_number = normalize_train_number(train_number)
    current_station = str(current_station).strip().upper()

    train_data = train_details[
        train_details["Train No"].apply(normalize_train_number)
        == train_number
    ].copy()

    if train_data.empty:
        raise ValueError(f"Train {train_number} not found")

    train_data = train_data.sort_values("SEQ").reset_index(drop=True)

    current_matches = train_data[
        train_data["Station Code"].astype(str).str.upper()
        == current_station
    ]

    if current_matches.empty:
        raise ValueError(
            f"Station {current_station} not found on train {train_number}"
        )

    current_index = current_matches.index[0]

    if current_index >= len(train_data) - 1:
        raise ValueError("No next station available")

    current_row = train_data.iloc[current_index]
    next_row = train_data.iloc[current_index + 1]

    next_station = str(next_row["Station Code"]).strip().upper()

    departure_time = time_to_minutes(current_row["Departure time"])
    next_arrival_time = time_to_minutes(next_row["Arrival time"])

    if departure_time is None or next_arrival_time is None:
        raise ValueError("Invalid timetable time")

    scheduled_travel_min = next_arrival_time - departure_time

    if scheduled_travel_min < 0:
        scheduled_travel_min += 24 * 60

    now = datetime.now()

    features = {
        "train": train_number,
        "station": current_station,
        "next_station": next_station,

        "dep_delay": float(departure_delay),
        "scheduled_travel_min": float(scheduled_travel_min),

        "day_of_week": now.weekday(),
        "departure_hour": departure_time // 60,
        "departure_minute": departure_time % 60,

        # Historical features are defaults until real historical
        # delay-training data is connected.
        "historical_mean_delay": 0.0,
        "historical_median_delay": 0.0,
        "historical_std_delay": 0.0,
        "historical_mean_dep_delay": float(departure_delay),
        "historical_observations": 1.0,
        "historical_mean_delay_change": 0.0,
        "historical_median_delay_change": 0.0,
        "historical_std_delay_change": 0.0,
    }

    return features, {
        "next_station": next_station,
        "scheduled_arrival": next_row["Arrival time"],
        "scheduled_travel_min": scheduled_travel_min,
    }
