/**
 * api/sync/add_source endpoint
 *
 * Here we add Source to the database so it can be fetched and managed.
 */

import type { NextApiRequest, NextApiResponse } from 'next'

import { PrismaClient } from '@prisma/client'
import authentication from '../../../app/backend/authentication';
import { getFeedData } from '../source/info';
import { FeedMetadata } from '../../../app/backend/feedparse';
import { Source } from '../../../app/types';

// Prisma database client.
const prisma = new PrismaClient();

// Create interface for typed response construction.
interface Response {
	type: 'success' | 'error',
	value: 'Unauthorized' | 'Internal server error.'
	| 'No parameters passed.' | 'Passed directory is non existent.'
	| 'Invalid feed URL.' | 'Feed is not valid.'
	| 'There is already source with this name' | Source;
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
	let responseObject: Response = {
		type: 'error',
		value: 'Internal server error.'
	}
	let syncID: string | null;

	// Get sourceName, sourceURL and
	// sourceDirectory from query.
	let sourceName = req.query.name;
	let sourceURL = req.query.url;
	let sourceDirectory = req.query.directory;

	// Get syncID from helper function and check if it failed.
	if ((syncID = await authentication(req, res)) == null) {
		responseObject.value = 'Unauthorized';
		res.status(401).json(responseObject);
		return;
	}

	// Check if any of variables below is undefined.
	if (sourceName == undefined || sourceURL == undefined
		|| sourceDirectory == undefined) {
		responseObject.value = 'No parameters passed.';
		res.status(200).json(responseObject);
		return;
	}

	// Check if directory specified in the request
	// exists.
	let directories = await prisma.directory.findMany({
		where: {
			name: sourceDirectory as string,
			syncID: syncID
		}
	});

	if (directories.length == 0) {
		responseObject.value = 'Passed directory is non existent.';
		res.status(200).json(responseObject);
		return;
	}

	// Check if there is already source with
	// provided name.
	let sources = await prisma.source.findMany({
		where: {
			name: sourceName as string,
			directoryID: directories[0].id
		}
	});

	if (sources.length > 0) {
		responseObject.value = 'There is already source with this name';
		res.status(200).json(responseObject);
		return;
	}

	// Get metadata from feed if possible.
	let feedData = await getFeedData(sourceURL as string, {
		metadataOnly: true
	});

	if (feedData.valid == undefined) {
		res.status(200).json(feedData as Response);
		return;
	}

	if (!feedData.valid) {
		responseObject.value = 'Feed is not valid.';
		res.status(200).json(responseObject);
		return;
	}

	let feedMetadata = feedData.content.metadata as FeedMetadata;

	let sourceFetcher = await prisma.sourceFetcher.findMany({
		where: {
			url: feedMetadata.feedUrl
		}
	});

	let connectWithFetcher = false;

	if (sourceFetcher.length > 0) {
		connectWithFetcher = true;
	}

	// Create new source in the database.
	await prisma.source.create({
		data: {
			name: feedMetadata.title,
			image:
				// If mime type of the media is some image
				// then we can pass it to the database.
				feedMetadata.image?.mime.startsWith('image/')
					? feedMetadata.image.url : undefined,
			directory: {
				connect: {
					id: directories[0].id
				}
			},
			sourceFetcher: {
				connect: connectWithFetcher ? {
					id: sourceFetcher[0].id
				} : undefined,

				create: connectWithFetcher ? undefined : {
					url: feedMetadata.feedUrl
				}
			}
		}
	});

	responseObject.type = 'success';
	responseObject.value = {
		name: feedMetadata.title,
		image: feedMetadata.image?.mime.startsWith('image/')
			? feedMetadata.image.url : undefined
	} as Source;

	// Send response to client.
	res.status(200).json(responseObject);
}