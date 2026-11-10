
-- 1. Brands table
CREATE TABLE IF NOT EXISTS brands (
    id SERIAL PRIMARY KEY,
    brand_name VARCHAR(150) NOT NULL,
    email VARCHAR(150) UNIQUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 2. Certificates table
CREATE TABLE IF NOT EXISTS certificates (
    id SERIAL PRIMARY KEY,
    brand_id INTEGER REFERENCES brands(id),
    certificate_number VARCHAR(100) UNIQUE NOT NULL,
    recycler_name VARCHAR(150),
    quantity_kg DECIMAL(12,2) CHECK (quantity_kg > 0),
    issue_date DATE,
    verification_status VARCHAR(30) DEFAULT 'pending',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 3. Recycling records table
CREATE TABLE IF NOT EXISTS recycling_records (
    id SERIAL PRIMARY KEY,
    brand_id INTEGER REFERENCES brands(id),
    certificate_id INTEGER REFERENCES certificates(id),
    quantity_kg DECIMAL(12,2) CHECK (quantity_kg > 0),
    recycled_at DATE DEFAULT CURRENT_DATE
);
