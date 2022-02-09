import type { NextApiRequest, NextApiResponse } from 'next'

import { PrismaClient } from '@prisma/client'
import authentication from '../../../app/backend/authentication';

// Prisma database client.
const prisma = new PrismaClient();

// Create interface for typed response construction.
interface Response {
	type: 'success' | 'error',
	value: 'Unauthorized' | 'Internal server error.'
	| 'No parameters passed.' | 'Passed directory is non existent.';
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
	let responseObject: Response = {
		type: 'error',
		value: 'Internal server error.'
	}
	let syncID: string | null;

	let sourceName = req.query.name;
	let sourceURL = req.query.url;
	let sourceDirectory = req.query.directory;

	// Get syncID from helper function and check if it failed.
	if ((syncID = await authentication(req, res)) == null) {
		responseObject.value = 'Unauthorized';
		res.status(401).json(responseObject);
		return;
	}

	if (sourceName == undefined || sourceURL == undefined
		|| sourceDirectory == undefined) {
		responseObject.value = 'No parameters passed.';
		res.status(200).json(responseObject);
		return;
	}

	let directories = await prisma.directory.findMany({
		where: {
			name: sourceDirectory as string
		}
	});

	if(directories.length == 0) {
		responseObject.value = 'Passed directory is non existent.';
		res.status(200).json(responseObject);
		return;
	}

	// TODO: Get here feed data.


	// Send response to client.
	res.status(200).json(responseObject);
}