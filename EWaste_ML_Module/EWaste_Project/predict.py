import os
import numpy as np
import pandas as pd

BASE_DIR = os.path.dirname(os.path.abspath(__file__))
DATA_PATH = os.path.join(BASE_DIR, "India_EWaste_Research_Datasets.xlsx")

MAX_GROWTH = 0.30   # cap yearly growth at 30%
MIN_GROWTH = 0.0    # no negative growth

# ---------- load and clean data ----------
df = pd.read_excel(DATA_PATH, sheet_name="state_generation_observed")
df["E_waste_Generated_MT"] = pd.to_numeric(df["E_waste_Generated_MT"], errors="coerce")
df = df.dropna(subset=["E_waste_Generated_MT", "State", "Financial_Year"]).copy()
df["State"] = df["State"].astype(str).str.strip()
df["Year"] = pd.to_numeric(df["Financial_Year"].str.extract(r"(\d{4})")[0], errors="coerce")
df = df.dropna(subset=["Year"]).copy()
df["Year"] = df["Year"].astype(int)

available_states = sorted(df["State"].unique().tolist())

# ---------- per-state growth rate ----------
state_info = {}
for st, g in df.groupby("State"):
    g = g.sort_values("Year")
    last_year = int(g["Year"].iloc[-1])
    last_value = float(g["E_waste_Generated_MT"].iloc[-1])
    growth = None
    if len(g) >= 2:
        first_year = int(g["Year"].iloc[0])
        first_value = float(g["E_waste_Generated_MT"].iloc[0])
        years = last_year - first_year
        if years > 0 and first_value > 0:
            growth = (last_value / first_value) ** (1 / years) - 1
            growth = min(max(growth, MIN_GROWTH), MAX_GROWTH)
    state_info[st] = {"last_year": last_year, "last_value": last_value, "growth": growth}

known = [v["growth"] for v in state_info.values() if v["growth"] is not None]
default_growth = float(np.median(known)) if known else 0.05


# ---------- prediction function ----------
def predict_ewaste(state, year):

    matched_state = next(
        (s for s in available_states if s.lower() == state.strip().lower()),
        None
    )
    if matched_state is None:
        return {"error": "Invalid state name"}

    if not isinstance(year, int) or year < 1900 or year > 2100:
        return {"error": "Invalid year"}

    info = state_info[matched_state]
    growth = info["growth"] if info["growth"] is not None else default_growth

    prediction = info["last_value"] * ((1 + growth) ** (year - info["last_year"]))

    return {
        "state": matched_state,
        "year": year,
        "financial_year": str(year) + "-" + str(year + 1)[-2:],
        "predicted_ewaste": round(float(prediction), 2),
        "unit": "Metric Tonnes"
    }


if __name__ == "__main__":
    print(predict_ewaste("Karnataka", 2030))
    print(predict_ewaste("Delhi", 2026))
    print(predict_ewaste("Andaman and Nicobar Islands", 2026))