-- Property Status Dashboard Schema
-- For AJ Real Estate Group

-- ============================================
-- Table: property_status
-- Stores current status for each property
-- ============================================

CREATE TABLE property_status (
  id SERIAL PRIMARY KEY,
  property_id INTEGER REFERENCES properties(id),
  status TEXT NOT NULL,
  status_date TIMESTAMP DEFAULT NOW(),
  priority INTEGER DEFAULT 999,
  assigned_to TEXT,
  target_date DATE,
  amount NUMERIC(10,2),
  notes TEXT,
  updated_at TIMESTAMP DEFAULT NOW(),
  updated_by TEXT
);

-- Create index for performance
CREATE INDEX idx_property_status ON property_status(property_id, status);

-- Insert initial statuses for all properties as 'RENTED'
INSERT INTO property_status (property_id, status, updated_by)
SELECT id, 'RENTED', 'System Init'
FROM properties
WHERE active = true;

-- ============================================
-- Table: status_history
-- Tracks all status changes over time
-- ============================================

CREATE TABLE status_history (
  id SERIAL PRIMARY KEY,
  property_id INTEGER REFERENCES properties(id),
  old_status TEXT,
  new_status TEXT,
  changed_by TEXT,
  changed_at TIMESTAMP DEFAULT NOW(),
  notes TEXT
);

-- Create index for historical queries
CREATE INDEX idx_status_history_property ON status_history(property_id, changed_at);

-- ============================================
-- Enable Row Level Security (Optional but recommended)
-- ============================================

-- Uncomment if you want to enable RLS
-- ALTER TABLE property_status ENABLE ROW LEVEL SECURITY;
-- ALTER TABLE status_history ENABLE ROW LEVEL SECURITY;

-- Create policies for authenticated access
-- CREATE POLICY "Enable read access for all users" ON property_status FOR SELECT USING (true);
-- CREATE POLICY "Enable insert access for all users" ON property_status FOR INSERT WITH CHECK (true);
-- CREATE POLICY "Enable update access for all users" ON property_status FOR UPDATE USING (true);

-- CREATE POLICY "Enable read access for all users" ON status_history FOR SELECT USING (true);
-- CREATE POLICY "Enable insert access for all users" ON status_history FOR INSERT WITH CHECK (true);
