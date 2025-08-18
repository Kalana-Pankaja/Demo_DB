import { json } from '@sveltejs/kit';
import { db } from '$lib/server/db';
import { treatments } from '$lib/server/db/schema';
import { eq } from 'drizzle-orm';
import type { RequestHandler } from './$types';

export const GET: RequestHandler = async ({ url }) => {
	try {
		const category = url.searchParams.get('category');
		const isActive = url.searchParams.get('isActive');
		
		let query = db.select().from(treatments);
		
		if (category) {
			query = query.where(eq(treatments.category, category));
		}
		
		if (isActive !== null) {
			query = query.where(eq(treatments.isActive, isActive === 'true'));
		}
		
		const allTreatments = await query;
		return json(allTreatments);
	} catch (error) {
		console.error('Error fetching treatments:', error);
		return json({ error: 'Failed to fetch treatments' }, { status: 500 });
	}
};

export const POST: RequestHandler = async ({ request }) => {
	try {
		const data = await request.json();
		const newTreatment = await db.insert(treatments).values(data).returning();
		return json(newTreatment[0]);
	} catch (error) {
		console.error('Error creating treatment:', error);
		return json({ error: 'Failed to create treatment' }, { status: 500 });
	}
};