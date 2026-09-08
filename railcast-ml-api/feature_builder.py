from pathlib import Path
import pandas as pd
from datetime import datetime


BASE_DIR = Path(__file__).resolve().parent

CSV_PATH = BASE_DIR / "train_details.csv"

train_details = pd.read_csv(CSV_PATH)


# =========================================================
# DEMO ROUTE — TRAIN 1007
# =========================================================

DEMO_1007_ROUTE = [
    {
        "station": "PGT",
        "next_station": "CBE",
        "scheduled_arrival": "03:00",
        "scheduled_travel_min": 100,
    },
    {
        "station": "CBE",
        "next_station": "TUP",
        "scheduled_arrival": "03:50",
        "scheduled_travel_min": 47,
    },
    {
        "station": "TUP",
        "next_station": "ED",
        "scheduled_arrival": "04:30",
        "scheduled_travel_min": 38,
    },
    {
        "station": "ED",
        "next_station": "KRR",
        "scheduled_arrival": "05:50",
        "scheduled_travel_min": 75,
    },
    {
        "station": "KRR",
        "next_station": "TPJ",
        "scheduled_arrival": "08:35",
        "scheduled_travel_min": 163,
    },
    {
        "station": "TPJ",
        "next_station": "TJ",
        "scheduled_arrival": "09:28",
        "scheduled_travel_min": 43,
    },
    {
        "station": "TJ",
        "next_station": "TVR",
        "scheduled_arrival": "10:24",
        "scheduled_travel_min": 54,
    },
    {
        "station": "TVR",
        "next_station": "NGT",
        "scheduled_arrival": "11:40",
        "scheduled_travel_min": 75,
    },
    {
        "station": "NGT",
        "next_station": "VLNK",
        "scheduled_arrival": "12:25",
        "scheduled_travel_min": 35,
    },
]


# =========================================================
# HELPER FUNCTIONS
# =========================================================

def normalize_train_number(value):
    return str(value).replace(".0", "").strip()


def time_to_minutes(value):

    if pd.isna(value):
        return None

    value = str(value).strip()

    try:
        hour, minute = map(
            int,
            value.split(":")[:2]
        )

        return hour * 60 + minute

    except Exception:
        return None


# =========================================================
# BUILD FEATURES
# =========================================================

def build_features(
    train_number,
    current_station,
    departure_delay,
    now=None
):

    train_number = normalize_train_number(
        train_number
    )

    current_station = str(
        current_station
    ).strip().upper()

    departure_delay = float(
        departure_delay
    )

    if now is None:
        now = datetime.now()


    # =====================================================
    # TRAIN 1007 DEMO ROUTE
    # =====================================================

    if train_number == "1007":

        demo_row = None

        for row in DEMO_1007_ROUTE:

            if row["station"] == current_station:

                demo_row = row
                break


        if demo_row is None:

            raise ValueError(
                f"Station {current_station} "
                f"not found on demo Train 1007"
            )


        next_station = demo_row[
            "next_station"
        ]

        scheduled_arrival = demo_row[
            "scheduled_arrival"
        ]

        scheduled_travel_min = demo_row[
            "scheduled_travel_min"
        ]


        arrival_minutes = time_to_minutes(
            scheduled_arrival
        )

        departure_time = (
            arrival_minutes
            - scheduled_travel_min
        )

        departure_time %= 24 * 60


        features = {

            "train": train_number,

            "station": current_station,

            "next_station": next_station,

            "dep_delay": departure_delay,

            "scheduled_travel_min": float(
                scheduled_travel_min
            ),

            "day_of_week": now.weekday(),

            "departure_hour": (
                departure_time // 60
            ),

            "departure_minute": (
                departure_time % 60
            ),

            "historical_mean_delay": 0.0,

            "historical_median_delay": 0.0,

            "historical_std_delay": 0.0,

            "historical_mean_dep_delay":
                departure_delay,

            "historical_observations": 1.0,

            "historical_mean_delay_change": 0.0,

            "historical_median_delay_change": 0.0,

            "historical_std_delay_change": 0.0,
        }


        return (
            features,
            next_station,
            scheduled_arrival
        )


    # =====================================================
    # NORMAL TRAIN FROM TIMETABLE
    # =====================================================

    train_data = train_details[
        train_details["Train No"]
        .apply(normalize_train_number)
        == train_number
    ].copy()


    if train_data.empty:

        raise ValueError(
            f"Train {train_number} not found"
        )


    train_data = train_data.sort_values(
        "SEQ"
    ).reset_index(drop=True)


    current_matches = train_data[
        train_data["Station Code"]
        .astype(str)
        .str.upper()
        == current_station
    ]


    if current_matches.empty:

        raise ValueError(
            f"Station {current_station} "
            f"not found on train {train_number}"
        )


    current_index = current_matches.index[0]


    if current_index >= len(train_data) - 1:

        raise ValueError(
            f"No next station available "
            f"for train {train_number}"
        )


    current_row = train_data.iloc[
        current_index
    ]

    next_row = train_data.iloc[
        current_index + 1
    ]


    next_station = str(
        next_row["Station Code"]
    ).strip().upper()


    departure_time = time_to_minutes(
        current_row["Departure time"]
    )

    next_arrival_time = time_to_minutes(
        next_row["Arrival time"]
    )


    if (
        departure_time is None
        or next_arrival_time is None
    ):

        raise ValueError(
            "Invalid timetable time"
        )


    scheduled_travel_min = (
        next_arrival_time
        - departure_time
    )


    if scheduled_travel_min < 0:

        scheduled_travel_min += 24 * 60


    scheduled_arrival = str(
        next_row["Arrival time"]
    )


    features = {

        "train": train_number,

        "station": current_station,

        "next_station": next_station,

        "dep_delay": departure_delay,

        "scheduled_travel_min": float(
            scheduled_travel_min
        ),

        "day_of_week": now.weekday(),

        "departure_hour": (
            departure_time // 60
        ),

        "departure_minute": (
            departure_time % 60
        ),

        "historical_mean_delay": 0.0,

        "historical_median_delay": 0.0,

        "historical_std_delay": 0.0,

        "historical_mean_dep_delay":
            departure_delay,

        "historical_observations": 1.0,

        "historical_mean_delay_change": 0.0,

        "historical_median_delay_change": 0.0,

        "historical_std_delay_change": 0.0,
    }


    return (
        features,
        next_station,
        scheduled_arrival
    )
