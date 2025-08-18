import { json } from '@sveltejs/kit';
import { db } from '$lib/server/db';
import { patients, branches } from '$lib/server/db/schema';
import { eq } from 'drizzle-orm';
import type { RequestHandler } from './$types';

export const GET: RequestHandler = async ({ url }) => {
	try {
		const search = url.searchParams.get('search');
		const branchId = url.searchParams.get('branchId');
		
		let query = db
			.select({
				id: patients.id,
				firstName: patients.firstName,
				lastName: patients.lastName,
				dateOfBirth: patients.dateOfBirth,
				gender: patients.gender,
				phone: patients.phone,
				email: patients.email,
				registeredBranch: patients.registeredBranch,
				branchName: branches.name,
				createdAt: patients.createdAt
			})
			.from(patients)
			.leftJoin(branches, eq(patients.registeredBranch, branches.id));

		if (branchId) {
			query = query.where(eq(patients.registeredBranch, parseInt(branchId)));
		}

		const allPatients = await query;
		
		// Filter by search term if provided
		let filteredPatients = allPatients;
		if (search) {
			const searchLower = search.toLowerCase();
			filteredPatients = allPatients.filter(patient => 
				patient.firstName.toLowerCase().includes(searchLower) ||
				patient.lastName.toLowerCase().includes(searchLower) ||
				patient.id.toLowerCase().includes(searchLower) ||
				patient.phone.includes(search)
			);
		}

		return json(filteredPatients);
	} catch (error) {
		console.error('Error fetching patients:', error);
		return json({ error: 'Failed to fetch patients' }, { status: 500 });
	}
};

export const POST: RequestHandler = async ({ request }) => {
	try {
		const data = await request.json();
		
		// Generate patient ID with branch prefix
		const branch = await db.select().from(branches).where(eq(branches.id, data.registeredBranch));
		if (!branch[0]) {
			return json({ error: 'Invalid branch' }, { status: 400 });
		}
		
		const branchPrefix = branch[0].location.substring(0, 3).toUpperCase();
		const patientCount = await db.select().from(patients).where(eq(patients.registeredBranch, data.registeredBranch));
		const patientNumber = (patientCount.length + 1).toString().padStart(3, '0');
		const patientId = `${branchPrefix}${patientNumber}`;
		
		const newPatient = await db.insert(patients).values({
			...data,
			id: patientId
		}).returning();
		
		return json(newPatient[0]);
	} catch (error) {
		console.error('Error creating patient:', error);
		return json({ error: 'Failed to create patient' }, { status: 500 });
	}
};