
const express = require('express');
const router = express.Router();
const db = require('../db');
const checkFraudRisk = require('../services/fraud.service');
// Verify certificate using certificate number
router.post('/verify', async (req, res) => {
    try {
        const { certificateNumber } = req.body;

        // Check if certificate number is provided
        if (!certificateNumber) {
            return res.status(400).json({
                message: 'Certificate number is required'
            });
        }

        // Search certificate in database
        const result = await db.query(
            `SELECT certificate_number, recycler_name,
                    tonnes, risk_score, status
             FROM certificates
             WHERE certificate_number = $1`,
            [certificateNumber]
        );

        // If certificate does not exist
        if (result.rows.length === 0) {
            return res.status(404).json({
                message: 'Certificate not found'
            });
        }

       // Get certificate details
const certificate = result.rows[0];

// Check fraud risk using the risk score
const fraudAnalysis = checkFraudRisk(
    Number(certificate.risk_score)
);

// Return certificate and fraud analysis
res.json({
    message: 'Certificate found',
    certificate: certificate,
    fraudAnalysis: fraudAnalysis
});

    } catch (err) {
        console.error('Certificate verification error:', err.message);

        res.status(500).json({
            message: 'Internal server error'
        });
    }
});

module.exports = router;
