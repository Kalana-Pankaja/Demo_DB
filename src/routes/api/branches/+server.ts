import { json } from '@sveltejs/kit';
import { db } from '$lib/server/db';
import { branches } from '$lib/server/db/schema';
import type { RequestHandler } from './$types';

export const GET: RequestHandler = async () => {
	try {
		const allBranches = await db.select().from(branches);
		return json(allBranches);
	} catch (error) {
		console.error('Error fetching branches:', error);
		return json({ error: 'Failed to fetch branches' }, { status: 500 });
	}
};

export const POST: RequestHandler = async ({ request }) => {
	try {
		const data = await request.json();
		const newBranch = await db.insert(branches).values(data).returning();
		return json(newBranch[0]);
	} catch (error) {
		console.error('Error creating branch:', error);
		return json({ error: 'Failed to create branch' }, { status: 500 });
	}
};