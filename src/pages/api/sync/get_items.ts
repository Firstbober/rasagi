/**
 * api/sync/get_items endpoint
 *
 * Here we get SourceItems from database and
 * send them to the client.
 *
 * Limit is 32 with paging.
 */

import { Source } from '@prisma/client';
import type { NextApiRequest, NextApiResponse } from 'next'

import authentication, { updateLastActivity } from '../../../app/backend/authentication';
import prisma from '../../../app/backend/prisma';
import { Item } from '../../../app/types';

interface Response {
	type: 'success' | 'error',
	value: 'Unauthorized' | 'Internal server error.' | 'No parameters passed.' | Array<Item>;
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
	let responseObject: Response = {
		type: 'error',
		value: 'Internal server error.'
	}
	let syncID: string | null;

	// Get sourceName and sourceDirectory from query.
	let page = req.query.page;

	// Get syncID from helper function and check if it failed.
	if ((syncID = await authentication(req, res)) == null) {
		responseObject.value = 'Unauthorized';
		res.status(401).json(responseObject);
		return;
	}

	updateLastActivity(syncID);

	// Check if any of variables below is undefined.
	if (page == undefined) {
		responseObject.value = 'No parameters passed.';
		res.status(200).json(responseObject);
		return;
	}

	// Get user directories.
	let directories = await prisma.directory.findMany({
		where: {
			syncID: syncID
		},
		select: {
			id: true
		}
	});

	// Get fetchers connected with the syncID.
	let fetchers = await prisma.sourceFetcher.findMany({
		where: {
			synchronizations: {
				some: {
					syncID: syncID
				}
			}
		},
		include: {
			Source: {}
		}
	});

	let sourceItems: Array<Item> = [];

	for (const fetcher of fetchers) {
		// Get items from sourceItems.
		let items = await prisma.sourceItem.findMany({
			where: {
				sourceFetcherID: fetcher.id
			},
			skip: (parseInt(page as string) * 32),
			take: 32 + (parseInt(page as string) * 32),
			orderBy: {
				createdAt: 'desc'
			}
		});

		// Extract source used by provided syncID.
		let source: Source;
		sourceSearch:
		for (const dir of directories) {
			for (const src of fetcher.Source) {
				if (src.directoryID == dir.id) {
					source = src;
					break sourceSearch;
				}
			}
		}

		// Push to the array with final items.
		for (const item of items) {
			sourceItems.push({
				title: item.title,
				description: item.description,
				link: item.link,
				image: item.image == null ? source!.image == null ? undefined : source!.image : item.image!,
				time: item.createdAt.getTime(),
				source: {
					name: source!.name,
					image: source!.image == null ? undefined : source!.image
				}
			});
		}
	}

	responseObject.type = 'success';
	responseObject.value = sourceItems;

	// Send response to client.
	res.status(200).json(responseObject);
}