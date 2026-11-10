
// Fraud detection service

function checkFraudRisk(riskScore) {

    if (riskScore >= 0.7) {
        return {
            riskLevel: 'High',
            flagged: true,
            message: 'Suspicious certificate detected!'
        };
    }

    if (riskScore >= 0.4) {
        return {
            riskLevel: 'Medium',
            flagged: false,
            message: 'Certificate requires further review.'
        };
    }

    return {
        riskLevel: 'Low',
        flagged: false,
        message: 'Certificate appears safe.'
    };
}

module.exports = checkFraudRisk;
