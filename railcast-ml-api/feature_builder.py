from datetime import datetime
from pathlib import Path

import pandas as pd


DATA_PATH = (
    Path(__file__).resolve().parent
    / "data"
    / "train_details.csv"
)


# Load schedule data once when the server starts.
schedule_df = pd.read_csv(DATA_PATH)


# Normalize column names.
schedule_df.columns = [
    str(column).strip()
    for column in schedule_df.columns
]


def normalize_train_number(value) -> str:
    """
    Converts 1007 / 1007.0 into '1007'.
    """
    try:
        return str(int(float(value)))
    except Exception:
        return str(value).strip()


def get_train_route(train_number: str):
    """
    Return the timetable rows for a train.
    """

    train = normalize_train_number(train_number)

    df = schedule_df[
        schedule_df["Train No"].apply(normalize_train_number) == train
    ].copy()

    if df.empty:
        raise ValueError(
            f"Train {train_number} was not found in schedule data."
        )

    df = df.sort_values("SEQ")

    return df


def get_next_station(train_number: str, current_station: str):
    """
    Find the next station after current_station.
    """

    route = get_train_route(train_number)

    current_station = current_station.upper().strip()

    matches = route[
        route["Station Code"].astype(str).str.upper().str.strip()
        == current_station
    ]

    if matches.empty:
        raise ValueError(
            f"Station {current_station} was not found "
            f"on train {train_number}."
        )

    current_index = matches.index[0]

    positions = list(route.index)
    position = positions.index(current_index)

    if position >= len(positions) - 1:
        raise ValueError(
            f"{train_number} has no next station after {current_station}."
        )

    next_row = route.iloc[position + 1]

    return next_row


def time_to_minutes(value: str) -> int:
    """
    Convert HH:MM or HH:MM:SS into minutes from midnight.
    """

    value = str(value)

    if not value or value == "nan":
        return 0

    parts = value.split(":")

    hour = int(parts[0])
    minute = int(parts[1])

    return hour * 60 + minute


def scheduled_travel_minutes(current_row, next_row) -> float:
    """
    Calculate scheduled travel time between two stations.
    Handles midnight crossing.
    """

    departure = time_to_minutes(
        current_row["Departure Time"]
    )

    arrival = time_to_minutes(
        next_row["Arrival time"]
    )

    travel = arrival - departure

    if travel < 0:
        travel += 24 * 60

    return float(travel)


def build_features(
    train_number: str,
    current_station: str,
    departure_delay: float,
    now: datetime | None = None,
):
    """
    Build the exact 16 CatBoost V2 features.

    Historical features are currently initialized from the
    available live input when no historical feature store exists.

    Replace the historical section with your team's historical
    feature-generation pipeline when available.
    """

    if now is None:
        now = datetime.now()

    route = get_train_route(train_number)

    current_station = current_station.upper().strip()

    matches = route[
        route["Station Code"].astype(str).str.upper().str.strip()
        == current_station
    ]

    if matches.empty:
        raise ValueError(
            f"Station {current_station} not found for train {train_number}."
        )

    current_row = matches.iloc[0]

    next_row = get_next_station(
        train_number,
        current_station
    )

    next_station = str(
        next_row["Station Code"]
    ).strip().upper()

    travel_min = scheduled_travel_minutes(
        current_row,
        next_row
    )

    dep_delay = float(departure_delay)

    # ---------------------------------------------------------
    # Historical features
    # ---------------------------------------------------------
    #
    # These defaults make the API operational immediately.
    #
    # IMPORTANT:
    # Replace these with the historical feature-generation
    # logic used while training CatBoost V2 as soon as your
    # friend's feature-engineering code is available.
    #

    historical_mean_delay = 0.0
    historical_median_delay = 0.0
    historical_std_delay = 0.0

    historical_mean_dep_delay = dep_delay
    historical_observations = 1

    historical_mean_delay_change = -dep_delay
    historical_median_delay_change = -dep_delay
    historical_std_delay_change = 0.0

    features = {
        "train": normalize_train_number(train_number),
        "station": current_station,
        "next_station": next_station,

        "dep_delay": dep_delay,
        "scheduled_travel_min": travel_min,

        "day_of_week": now.weekday(),
        "departure_hour": now.hour,
        "departure_minute": now.minute,

        "historical_mean_delay": historical_mean_delay,
        "historical_median_delay": historical_median_delay,
        "historical_std_delay": historical_std_delay,

        "historical_mean_dep_delay":
            historical_mean_dep_delay,

        "historical_observations":
            historical_observations,

        "historical_mean_delay_change":
            historical_mean_delay_change,

        "historical_median_delay_change":
            historical_median_delay_change,

        "historical_std_delay_change":
            historical_std_delay_change,
    }

    scheduled_arrival = str(
        next_row["Arrival time"]
    )

    return features, next_station, scheduled_arrival
