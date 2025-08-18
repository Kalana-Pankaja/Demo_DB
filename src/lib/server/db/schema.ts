import { pgTable, serial, integer, text, timestamp, boolean, decimal, date } from 'drizzle-orm/pg-core';

// Authentication tables
export const user = pgTable('user', {
	id: text('id').primaryKey(),
	username: text('username').notNull().unique(),
	passwordHash: text('password_hash').notNull(),
	role: text('role').notNull().default('staff'), // doctor, staff, admin, patient
	createdAt: timestamp('created_at').defaultNow(),
	updatedAt: timestamp('updated_at').defaultNow()
});

export const session = pgTable('session', {
	id: text('id').primaryKey(),
	userId: text('user_id')
		.notNull()
		.references(() => user.id),
	expiresAt: timestamp('expires_at', { withTimezone: true, mode: 'date' }).notNull()
});

// Branch/Location tables
export const branches = pgTable('branches', {
	id: serial('id').primaryKey(),
	name: text('name').notNull(),
	location: text('location').notNull(),
	address: text('address').notNull(),
	phone: text('phone'),
	email: text('email'),
	operatingHours: text('operating_hours').default('08:00-20:00'),
	isActive: boolean('is_active').default(true),
	createdAt: timestamp('created_at').defaultNow()
});

// Patient Management
export const patients = pgTable('patients', {
	id: text('id').primaryKey(), // Auto-generated with branch prefix
	firstName: text('first_name').notNull(),
	lastName: text('last_name').notNull(),
	dateOfBirth: date('date_of_birth').notNull(),
	gender: text('gender').notNull(), // male, female, other
	address: text('address').notNull(),
	phone: text('phone').notNull(),
	email: text('email'),
	emergencyContactName: text('emergency_contact_name'),
	emergencyContactPhone: text('emergency_contact_phone'),
	emergencyContactRelation: text('emergency_contact_relation'),
	registeredBranch: integer('registered_branch')
		.notNull()
		.references(() => branches.id),
	isActive: boolean('is_active').default(true),
	createdAt: timestamp('created_at').defaultNow(),
	updatedAt: timestamp('updated_at').defaultNow()
});

// Medical Staff Management
export const medicalStaff = pgTable('medical_staff', {
	id: serial('id').primaryKey(),
	userId: text('user_id')
		.notNull()
		.references(() => user.id),
	firstName: text('first_name').notNull(),
	lastName: text('last_name').notNull(),
	specialty: text('specialty'),
	licenseNumber: text('license_number'),
	phone: text('phone'),
	email: text('email'),
	branchId: integer('branch_id')
		.notNull()
		.references(() => branches.id),
	isActive: boolean('is_active').default(true),
	createdAt: timestamp('created_at').defaultNow()
});

// Treatment Catalog
export const treatments = pgTable('treatments', {
	id: serial('id').primaryKey(),
	serviceCode: text('service_code').notNull().unique(),
	name: text('name').notNull(),
	description: text('description'),
	price: decimal('price', { precision: 10, scale: 2 }).notNull(),
	category: text('category'),
	isActive: boolean('is_active').default(true),
	createdAt: timestamp('created_at').defaultNow(),
	updatedAt: timestamp('updated_at').defaultNow()
});

// Appointments
export const appointments = pgTable('appointments', {
	id: serial('id').primaryKey(),
	patientId: text('patient_id')
		.notNull()
		.references(() => patients.id),
	doctorId: integer('doctor_id')
		.notNull()
		.references(() => medicalStaff.id),
	branchId: integer('branch_id')
		.notNull()
		.references(() => branches.id),
	appointmentDate: date('appointment_date').notNull(),
	appointmentTime: text('appointment_time').notNull(),
	status: text('status').notNull().default('scheduled'), // scheduled, completed, cancelled
	appointmentType: text('appointment_type').default('regular'), // regular, emergency, walk-in
	notes: text('notes'),
	cancellationReason: text('cancellation_reason'),
	createdAt: timestamp('created_at').defaultNow(),
	updatedAt: timestamp('updated_at').defaultNow()
});

// Treatment Records
export const treatmentRecords = pgTable('treatment_records', {
	id: serial('id').primaryKey(),
	appointmentId: integer('appointment_id')
		.notNull()
		.references(() => appointments.id),
	treatmentId: integer('treatment_id')
		.notNull()
		.references(() => treatments.id),
	quantity: integer('quantity').default(1),
	unitPrice: decimal('unit_price', { precision: 10, scale: 2 }).notNull(),
	totalPrice: decimal('total_price', { precision: 10, scale: 2 }).notNull(),
	consultationNotes: text('consultation_notes'),
	recordedBy: integer('recorded_by')
		.notNull()
		.references(() => medicalStaff.id),
	createdAt: timestamp('created_at').defaultNow()
});

// Insurance Providers
export const insuranceProviders = pgTable('insurance_providers', {
	id: serial('id').primaryKey(),
	name: text('name').notNull(),
	contactInfo: text('contact_info'),
	processingRequirements: text('processing_requirements'),
	isActive: boolean('is_active').default(true),
	createdAt: timestamp('created_at').defaultNow()
});

// Patient Insurance
export const patientInsurance = pgTable('patient_insurance', {
	id: serial('id').primaryKey(),
	patientId: text('patient_id')
		.notNull()
		.references(() => patients.id),
	providerId: integer('provider_id')
		.notNull()
		.references(() => insuranceProviders.id),
	policyNumber: text('policy_number').notNull(),
	coverageDetails: text('coverage_details'),
	expirationDate: date('expiration_date'),
	isActive: boolean('is_active').default(true),
	createdAt: timestamp('created_at').defaultNow()
});

// Billing/Invoices
export const invoices = pgTable('invoices', {
	id: serial('id').primaryKey(),
	patientId: text('patient_id')
		.notNull()
		.references(() => patients.id),
	appointmentId: integer('appointment_id')
		.notNull()
		.references(() => appointments.id),
	invoiceNumber: text('invoice_number').notNull().unique(),
	totalAmount: decimal('total_amount', { precision: 10, scale: 2 }).notNull(),
	insuranceCovered: decimal('insurance_covered', { precision: 10, scale: 2 }).default('0'),
	patientResponsible: decimal('patient_responsible', { precision: 10, scale: 2 }).notNull(),
	paidAmount: decimal('paid_amount', { precision: 10, scale: 2 }).default('0'),
	outstandingBalance: decimal('outstanding_balance', { precision: 10, scale: 2 }).notNull(),
	status: text('status').notNull().default('pending'), // pending, partially_paid, paid, overdue
	createdAt: timestamp('created_at').defaultNow(),
	updatedAt: timestamp('updated_at').defaultNow()
});

// Payments
export const payments = pgTable('payments', {
	id: serial('id').primaryKey(),
	invoiceId: integer('invoice_id')
		.notNull()
		.references(() => invoices.id),
	amount: decimal('amount', { precision: 10, scale: 2 }).notNull(),
	paymentMethod: text('payment_method').notNull(), // cash, card, bank_transfer
	paymentDate: timestamp('payment_date').defaultNow(),
	transactionReference: text('transaction_reference'),
	processedBy: text('processed_by')
		.notNull()
		.references(() => user.id),
	notes: text('notes'),
	createdAt: timestamp('created_at').defaultNow()
});

// Insurance Claims
export const insuranceClaims = pgTable('insurance_claims', {
	id: serial('id').primaryKey(),
	invoiceId: integer('invoice_id')
		.notNull()
		.references(() => invoices.id),
	patientInsuranceId: integer('patient_insurance_id')
		.notNull()
		.references(() => patientInsurance.id),
	claimNumber: text('claim_number').notNull().unique(),
	claimAmount: decimal('claim_amount', { precision: 10, scale: 2 }).notNull(),
	approvedAmount: decimal('approved_amount', { precision: 10, scale: 2 }),
	status: text('status').notNull().default('submitted'), // submitted, approved, rejected, paid
	submissionDate: timestamp('submission_date').defaultNow(),
	responseDate: timestamp('response_date'),
	rejectionReason: text('rejection_reason'),
	createdAt: timestamp('created_at').defaultNow(),
	updatedAt: timestamp('updated_at').defaultNow()
});

// Audit Trail
export const auditLog = pgTable('audit_log', {
	id: serial('id').primaryKey(),
	userId: text('user_id')
		.notNull()
		.references(() => user.id),
	action: text('action').notNull(),
	tableName: text('table_name').notNull(),
	recordId: text('record_id').notNull(),
	oldValues: text('old_values'), // JSON string
	newValues: text('new_values'), // JSON string
	timestamp: timestamp('timestamp').defaultNow(),
	ipAddress: text('ip_address'),
	userAgent: text('user_agent')
});

// Type exports
export type User = typeof user.$inferSelect;
export type Session = typeof session.$inferSelect;
export type Branch = typeof branches.$inferSelect;
export type Patient = typeof patients.$inferSelect;
export type MedicalStaff = typeof medicalStaff.$inferSelect;
export type Treatment = typeof treatments.$inferSelect;
export type Appointment = typeof appointments.$inferSelect;
export type TreatmentRecord = typeof treatmentRecords.$inferSelect;
export type InsuranceProvider = typeof insuranceProviders.$inferSelect;
export type PatientInsurance = typeof patientInsurance.$inferSelect;
export type Invoice = typeof invoices.$inferSelect;
export type Payment = typeof payments.$inferSelect;
export type InsuranceClaim = typeof insuranceClaims.$inferSelect;
export type AuditLog = typeof auditLog.$inferSelect;
