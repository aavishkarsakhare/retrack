const ML_URL = process.env.ML_SERVICE_URL || 'http://127.0.0.1:8000';
const dashboardRoutes = require('./routes/dashboard.routes');
require('dotenv').config();
const authRoutes = require('./routes/auth.routes');
const certificateRoutes = require('./routes/certificates.routes');
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const db = require('./db');

const app = express();

// Middleware
app.use(express.json());
app.use(cors());
app.use(helmet());
app.use('/api/dashboard', dashboardRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/certificates', certificateRoutes);


// 1. Health API
app.get('/api/health', (req, res) => {
    res.json({
        status: "success",
        message: "RETRACK Backend is alive!"
    });
});

// 2. Database Test API
app.get('/api/db-test', async (req, res) => {
    try {
        const result = await db.query('SELECT NOW()');

        res.json({
            status: "success",
            message: "Database connected successfully!",
            time: result.rows[0]
        });

    } catch (error) {
        console.error(error);

        res.status(500).json({
            status: "error",
            message: "Database connection failed!"
        });
    }
});






// 5. Target Prediction API
app.post('/api/predict-target', (req, res) => {
    console.log("Prediction API called!");

    const brandId = req.body.brandId;
    const year = req.body.year;

    console.log("Brand:", brandId, "Year:", year);

    res.json({
        status: "success",
        brandId: brandId,
        year: year,
        predictedTarget: 600,
        message: "Target predicted successfully!"
    });
});
// 6. ML: Get valid states
app.get('/api/ml/states', async (req, res) => {
    try {
        const response = await fetch(ML_URL + '/states');
        const data = await response.json();
        res.status(response.status).json(data);
    } catch (error) {
        console.error(error);
        res.status(503).json({
            status: "error",
            message: "ML service is not reachable"
        });
    }
});

// 7. ML: Predict e-waste

// 7. ML: Predict e-waste (and save to database)
app.post('/api/ml/predict', async (req, res) => {
    try {
        const { state, year } = req.body;

        const response = await fetch(ML_URL + '/predict', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ state, year: Number(year) })
        });

        const data = await response.json();

        if (response.ok) {
            try {
                await db.query(
                    'INSERT INTO ml_predictions (state, year, financial_year, predicted_ewaste, unit) VALUES ($1, $2, $3, $4, $5)',
                    [data.state, data.year, data.financial_year, data.predicted_ewaste, data.unit]
                );
            } catch (dbErr) {
                console.error('DB save failed:', dbErr.message);
            }
        }

        res.status(response.status).json(data);
    } catch (error) {
        console.error(error);
        res.status(503).json({
            status: "error",
            message: "ML service is not reachable"
        });
    }
});

// 8. ML: Prediction history
app.get('/api/ml/history', async (req, res) => {
    try {
        const result = await db.query(
            'SELECT * FROM ml_predictions ORDER BY created_at DESC LIMIT 20'
        );
        res.json({ history: result.rows });
    } catch (error) {
        console.error(error);
        res.status(500).json({ status: "error", message: "Could not load history" });
    }
});
// Start Server (ONLY ONCE)
const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});

