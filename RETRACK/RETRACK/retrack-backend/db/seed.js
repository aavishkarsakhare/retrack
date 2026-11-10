
const db = require('./index');

async function seed() {
    try {
        // Clear existing development data
        await db.query(
            'TRUNCATE certificates, brands RESTART IDENTITY CASCADE'
        );

        // Insert sample brands
        const brands = await db.query(`
            INSERT INTO brands (name, email, password_hash) VALUES
            ('Acme Electronics', 'acme@test.com', 'hashed_pw_1'),
            ('GreenTech Gadgets', 'greentech@test.com', 'hashed_pw_2'),
            ('PuneAudio Co', 'puneaudio@test.com', 'hashed_pw_3')
            RETURNING id, name
        `);

        // Insert sample certificates
        await db.query(`
            INSERT INTO certificates
            (brand_id, certificate_number, recycler_name, tonnes, risk_score, status)
            VALUES
            (1, 'SEED-CERT-001', 'EcoRecycle Pvt Ltd', 120.5, 0.10, 'verified'),
            (1, 'SEED-CERT-002', 'GreenWaste Co', 500.0, 0.85, 'flagged'),
            (1, 'SEED-CERT-003', 'SafeDisposal Ltd', 200.0, 0.15, 'verified'),
            (2, 'SEED-CERT-004', 'EcoRecycle Pvt Ltd', 80.0, 0.05, 'verified'),
            (2, 'SEED-CERT-005', 'FakeRecyclerXYZ', 900.0, 0.95, 'flagged')
        `);

        console.log('Seed complete:', brands.rows);

        await db.end();

    } catch (err) {
        console.error('Seed failed:', err.message);
        await db.end();
        process.exitCode = 1;
    }
}

seed();
