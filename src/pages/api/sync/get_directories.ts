/**
 * api/sync/get_directories
 *
 * SyncID guarded endpoint which returns an array of
 * directories but without any sources right now.
 */

import type { NextApiRequest, NextApiResponse } from 'next'

import { PrismaClient } from '@prisma/client'
import authentication, { updateLastActivity } from '../../../app/backend/authentication';
import { Directory, Source } from '../../../app/types';
import prisma from '../../../app/backend/prisma';

// Create interface for typed response construction.
interface Response {
	type: 'success' | 'error',
	value: string | Array<Directory>;
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
	let responseObject: Response = {
		type: 'error',
		value: 'Internal server error.'
	}
	let syncID: string | null;

	// Get syncID from helper function and check if it failed.
	if ((syncID = await authentication(req, res)) == null) {
		responseObject.value = 'Unauthorized';
		res.status(401).json(responseObject);
		return;
	}

	updateLastActivity(syncID);

	// Find all directories associated with provided
	// syncID.
	let directories = await prisma.directory.findMany({
		where: {
			syncID
		}
	});

	responseObject.type = "success";
	responseObject.value = [];

	// Map everything onto responseObject.
	for (const dir of directories) {
		let sources = await prisma.source.findMany({
			where: {
				directory: {
					id: dir.id
				}
			}
		});

		let sourcesArr = [];

		for (const source of sources) {
			sourcesArr.push({
				name: source.name,
				image: source.image == null ? undefined : source.image
			} as Source);
		}

		responseObject.value.push({
			name: dir.name,
			sources: sourcesArr
		});
	}

	// Send response to client.
	res.status(200).json(responseObject);
}