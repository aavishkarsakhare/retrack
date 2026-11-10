const db = require('./db');

async function run() {
    try {
        await db.query(`
            CREATE TABLE IF NOT EXISTS ml_predictions (
                id SERIAL PRIMARY KEY,
                state VARCHAR(100) NOT NULL,
                year INTEGER NOT NULL,
                financial_year VARCHAR(10),
                predicted_ewaste NUMERIC(14,2) NOT NULL,
                unit VARCHAR(30) DEFAULT 'Metric Tonnes',
                created_at TIMESTAMP DEFAULT NOW()
            )
        `);
        console.log('Table ml_predictions is ready.');
    } catch (err) {
        console.error('Failed:', err.message);
    }
    process.exit();
}

run();