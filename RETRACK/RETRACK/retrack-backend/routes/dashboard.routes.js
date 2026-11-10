
const express = require('express');
const router = express.Router();
const db = require('../db');
const authenticateToken = require('../middleware/auth.middleware');

// GET dashboard information
router.get('/', authenticateToken, async (req, res) => {
    try {
        // Get brand ID (use 1 for testing)
        const brandId = req.user.brandId;

        // Get brand name
        const brandResult = await db.query(
            'SELECT name FROM brands WHERE id = $1',
            [brandId]
        );

        if (brandResult.rows.length === 0) {
            return res.status(404).json({
                message: 'Brand not found'
            });
        }

        // Calculate total verified recycling
        const achievedResult = await db.query(
            `SELECT COALESCE(SUM(tonnes), 0) AS achieved
             FROM certificates
             WHERE brand_id = $1 AND status = 'verified'`,
            [brandId]
        );

        // Count flagged certificates
        const alertsResult = await db.query(
            `SELECT COUNT(*) AS alerts
             FROM certificates
             WHERE brand_id = $1 AND status = 'flagged'`,
            [brandId]
        );

        // Set recycling target
        const targetTonnes = 800;

        const achievedTonnes = Number(
            achievedResult.rows[0].achieved
        );

        const openAlerts = Number(
            alertsResult.rows[0].alerts
        );

        // Calculate compliance percentage
        const compliancePercent =
            (achievedTonnes / targetTonnes) * 100;

        res.json({
            brandName: brandResult.rows[0].name,
            targetTonnes,
            achievedTonnes,
            compliancePercent,
            openAlerts
        });

    } catch (err) {
        console.error('Dashboard error:', err.message);

        res.status(500).json({
            message: 'Internal server error'
        });
    }
});

module.exports = router;

