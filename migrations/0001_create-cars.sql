CREATE TABLE IF NOT EXISTS cars (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    brand TEXT NOT NULL,
    model TEXT NOT NULL,
    production_year INTEGER NOT NULL,
    mileage_km INTEGER NOT NULL,
    price_pln REAL NOT NULL,
    status TEXT NOT NULL CHECK (
        status IN ('AVAILABLE', 'RESERVED', 'SOLD')
    ),
    created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_cars_status
ON cars(status);-- Migration number: 0001 	 2026-10-16T09:32:03.705Z
