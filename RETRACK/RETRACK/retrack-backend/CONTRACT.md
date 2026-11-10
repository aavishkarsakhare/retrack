# RETRACK Backend API Contract

## 1. Health Check

- **Method:** GET
- **Endpoint:** `/api/health`
- **Purpose:** Checks whether the backend server is running.

## 2. Database Test

- **Method:** GET
- **Endpoint:** `/api/db-test`
- **Purpose:** Checks whether the backend is connected to PostgreSQL.

## 3. Dashboard

- **Method:** GET
- **Endpoint:** `/api/dashboard?brandId=1`
- **Purpose:** Fetches dashboard information for a brand.

## 4. Certificate Verification

- **Method:** POST
- **Endpoint:** `/api/certificates/verify`
- **Request body:**
  ```json
  {
    "certificateId": "CERT101"
  }
  ```
- **Purpose:** Verifies a recycling certificate.

## 5. Target Prediction

- **Method:** POST
- **Endpoint:** `/api/predict-target`
- **Request body:**
  ```json
  {
    "brandId": 1,
    "year": 2027
  }
  ```
- **Purpose:** Predicts the recycling target for a brand.