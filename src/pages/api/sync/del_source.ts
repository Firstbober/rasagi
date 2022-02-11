/**
 * api/sync/del_source endpoint
 *
 * Here we delete Source from the database.
 */

import type { NextApiRequest, NextApiResponse } from 'next'

import { PrismaClient } from '@prisma/client'
import authentication, { updateLastActivity } from '../../../app/backend/authentication';
import prisma from '../../../app/backend/prisma';

interface Response {
	type: 'success' | 'error',
	value: 'Unauthorized' | 'Internal server error.'
	| 'No parameters passed.' | 'Source with this name does not exist.';
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
	let responseObject: Response = {
		type: 'error',
		value: 'Internal server error.'
	}
	let syncID: string | null;

	// Get sourceName and sourceDirectory from query.
	let sourceName = req.query.name;
	let sourceDirectory = req.query.directory;

	// Get syncID from helper function and check if it failed.
	if ((syncID = await authentication(req, res)) == null) {
		responseObject.value = 'Unauthorized';
		res.status(401).json(responseObject);
		return;
	}

	updateLastActivity(syncID);

	// Check if sourceName and sourceDirectory is undefined.
	if (sourceName == undefined && sourceDirectory == undefined) {
		responseObject.value = 'No parameters passed.';
		res.status(200).json(responseObject);
		return;
	}

	// Try to get source in specified directory.
	let source = await prisma.source.findMany({
		where: {
			name: sourceName as string,
			directory: {
				name: sourceDirectory as string
			}
		}
	});

	// If there is no source, then
	// send an error.
	if(source.length == 0) {
		responseObject.value = 'Source with this name does not exist.';
		res.status(200).json(responseObject);
		return;
	}

	// Delete source.
	await prisma.source.delete({
		where: {
			id: source[0].id
		}
	});

	responseObject.type = 'success';
	// Send response to client.
	res.status(200).json(responseObject);
}