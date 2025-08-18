CREATE TABLE branches (
    id SERIAL PRIMARY KEY,
    name TEXT NOT NULL,
    location TEXT NOT NULL,
    address TEXT NOT NULL,
    phone TEXT,
    email TEXT,
    operating_hours TEXT DEFAULT '08:00-20:00',
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE "user" (
    id TEXT PRIMARY KEY,
    username TEXT NOT NULL UNIQUE,
    password_hash TEXT NOT NULL,
    role TEXT NOT NULL DEFAULT 'staff',
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE session (
    id TEXT PRIMARY KEY,
    user_id TEXT NOT NULL REFERENCES "user"(id),
    expires_at TIMESTAMP WITH TIME ZONE NOT NULL
);

CREATE TABLE patients (
    id TEXT PRIMARY KEY,
    first_name TEXT NOT NULL,
    last_name TEXT NOT NULL,
    date_of_birth DATE NOT NULL,
    gender TEXT NOT NULL,
    address TEXT NOT NULL,
    phone TEXT NOT NULL,
    email TEXT,
    emergency_contact_name TEXT,
    emergency_contact_phone TEXT,
    emergency_contact_relation TEXT,
    registered_branch INTEGER NOT NULL REFERENCES branches(id),
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE medical_staff (
    id SERIAL PRIMARY KEY,
    user_id TEXT NOT NULL REFERENCES "user"(id),
    first_name TEXT NOT NULL,
    last_name TEXT NOT NULL,
    specialty TEXT,
    license_number TEXT,
    phone TEXT,
    email TEXT,
    branch_id INTEGER NOT NULL REFERENCES branches(id),
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE treatments (
    id SERIAL PRIMARY KEY,
    service_code TEXT NOT NULL UNIQUE,
    name TEXT NOT NULL,
    description TEXT,
    price DECIMAL(10,2) NOT NULL,
    category TEXT,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE appointments (
    id SERIAL PRIMARY KEY,
    patient_id TEXT NOT NULL REFERENCES patients(id),
    doctor_id INTEGER NOT NULL REFERENCES medical_staff(id),
    branch_id INTEGER NOT NULL REFERENCES branches(id),
    appointment_date DATE NOT NULL,
    appointment_time TEXT NOT NULL,
    status TEXT NOT NULL DEFAULT 'scheduled',
    appointment_type TEXT DEFAULT 'regular',
    notes TEXT,
    cancellation_reason TEXT,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE treatment_records (
    id SERIAL PRIMARY KEY,
    appointment_id INTEGER NOT NULL REFERENCES appointments(id),
    treatment_id INTEGER NOT NULL REFERENCES treatments(id),
    quantity INTEGER DEFAULT 1,
    unit_price DECIMAL(10,2) NOT NULL,
    total_price DECIMAL(10,2) NOT NULL,
    consultation_notes TEXT,
    recorded_by INTEGER NOT NULL REFERENCES medical_staff(id),
    created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE insurance_providers (
    id SERIAL PRIMARY KEY,
    name TEXT NOT NULL,
    contact_info TEXT,
    processing_requirements TEXT,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE patient_insurance (
    id SERIAL PRIMARY KEY,
    patient_id TEXT NOT NULL REFERENCES patients(id),
    provider_id INTEGER NOT NULL REFERENCES insurance_providers(id),
    policy_number TEXT NOT NULL,
    coverage_details TEXT,
    expiration_date DATE,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE invoices (
    id SERIAL PRIMARY KEY,
    patient_id TEXT NOT NULL REFERENCES patients(id),
    appointment_id INTEGER NOT NULL REFERENCES appointments(id),
    invoice_number TEXT NOT NULL UNIQUE,
    total_amount DECIMAL(10,2) NOT NULL,
    insurance_covered DECIMAL(10,2) DEFAULT 0,
    patient_responsible DECIMAL(10,2) NOT NULL,
    paid_amount DECIMAL(10,2) DEFAULT 0,
    outstanding_balance DECIMAL(10,2) NOT NULL,
    status TEXT NOT NULL DEFAULT 'pending',
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE payments (
    id SERIAL PRIMARY KEY,
    invoice_id INTEGER NOT NULL REFERENCES invoices(id),
    amount DECIMAL(10,2) NOT NULL,
    payment_method TEXT NOT NULL,
    payment_date TIMESTAMP DEFAULT NOW(),
    transaction_reference TEXT,
    processed_by TEXT NOT NULL REFERENCES "user"(id),
    notes TEXT,
    created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE insurance_claims (
    id SERIAL PRIMARY KEY,
    invoice_id INTEGER NOT NULL REFERENCES invoices(id),
    patient_insurance_id INTEGER NOT NULL REFERENCES patient_insurance(id),
    claim_number TEXT NOT NULL UNIQUE,
    claim_amount DECIMAL(10,2) NOT NULL,
    approved_amount DECIMAL(10,2),
    status TEXT NOT NULL DEFAULT 'submitted',
    submission_date TIMESTAMP DEFAULT NOW(),
    response_date TIMESTAMP,
    rejection_reason TEXT,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE audit_log (
    id SERIAL PRIMARY KEY,
    user_id TEXT NOT NULL REFERENCES "user"(id),
    action TEXT NOT NULL,
    table_name TEXT NOT NULL,
    record_id TEXT NOT NULL,
    old_values TEXT,
    new_values TEXT,
    timestamp TIMESTAMP DEFAULT NOW(),
    ip_address TEXT,
    user_agent TEXT
);

-- Insert sample data
INSERT INTO branches (name, location, address, phone, email) VALUES
('MedSync Colombo', 'Colombo', '123 Galle Road, Colombo 03', '+94112345678', 'colombo@medsync.lk'),
('MedSync Kandy', 'Kandy', '456 Peradeniya Road, Kandy', '+94812345678', 'kandy@medsync.lk'),
('MedSync Galle', 'Galle', '789 Matara Road, Galle', '+94912345678', 'galle@medsync.lk');

INSERT INTO treatments (service_code, name, description, price, category) VALUES
('CONS001', 'General Consultation', 'Basic medical consultation', 2500.00, 'Consultation'),
('CONS002', 'Specialist Consultation', 'Specialist medical consultation', 5000.00, 'Consultation'),
('LAB001', 'Blood Test - Full Blood Count', 'Complete blood count analysis', 1500.00, 'Laboratory'),
('LAB002', 'Blood Test - Lipid Profile', 'Cholesterol and triglyceride test', 2000.00, 'Laboratory'),
('XRAY001', 'Chest X-Ray', 'Chest radiograph', 3000.00, 'Radiology');

INSERT INTO insurance_providers (name, contact_info) VALUES
('Ceylon Insurance Company', 'Phone: +94112233445, Email: claims@ceylon.lk'),
('Ceylinco Insurance', 'Phone: +94112233446, Email: healthcare@ceylinco.lk'),
('SLIC Insurance', 'Phone: +94112233447, Email: medical@slic.lk');