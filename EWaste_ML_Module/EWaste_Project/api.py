from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import predict

app = FastAPI(title="E-Waste Prediction Service")

# Allow requests from your Node backend and local frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

class PredictionRequest(BaseModel):
    state: str
    year: int

@app.get("/states")
def get_states():
    """Returns the list of valid states for dropdowns."""
    return {"states": predict.available_states}

@app.post("/predict")
def run_prediction(payload: PredictionRequest):
    result = predict.predict_ewaste(payload.state, payload.year)
    if "error" in result:
        raise HTTPException(status_code=400, detail=result["error"])
    return result