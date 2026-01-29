-- Create bookings table for JT Trauma Therapy
CREATE TABLE IF NOT EXISTS bookings (
    id BIGSERIAL PRIMARY KEY,
    full_name VARCHAR(100) NOT NULL,
    email VARCHAR(255) NOT NULL,
    age INTEGER NOT NULL CHECK (age >= 16 AND age <= 100),
    session_type VARCHAR(20) NOT NULL CHECK (session_type IN ('online', 'in-person')),
    availability TEXT NOT NULL,
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create an index on email for faster lookups
CREATE INDEX IF NOT EXISTS idx_bookings_email ON bookings(email);

-- Create an index on created_at for sorting
CREATE INDEX IF NOT EXISTS idx_bookings_created_at ON bookings(created_at DESC);

-- Enable Row Level Security (RLS)
ALTER TABLE bookings ENABLE ROW LEVEL SECURITY;

-- Create policy to allow anonymous inserts (for form submissions)
CREATE POLICY "Allow anonymous inserts" ON bookings
    FOR INSERT 
    TO anon 
    WITH CHECK (true);

-- Create policy to allow authenticated users to view all records
CREATE POLICY "Allow authenticated users to view all" ON bookings
    FOR SELECT 
    TO authenticated 
    USING (true);

-- Optional: Create a function to automatically update the updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create trigger to automatically update updated_at
CREATE TRIGGER update_bookings_updated_at 
    BEFORE UPDATE ON bookings 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();