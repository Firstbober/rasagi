/**
 * src/app/authentication.ts
 *
 * A helper function for verifing syncID against the database.
 */

import type { NextApiRequest, NextApiResponse } from 'next'
import { PrismaClient } from '@prisma/client'

// Prisma database client.
const prisma = new PrismaClient();

export default async function authentication(req: NextApiRequest, res: NextApiResponse): Promise<string | null> {
	// Get Authorization header and remove "Bearer " part.
	const syncID = req.headers.authorization!.slice(7);

	// Try to find Synchronization with extracted id.
	let sync = await prisma.synchronization.findUnique({
		where: {
			syncID
		}
	});

	if (sync != null)
		return syncID;

	return null;
}