/**
 * api/get_id endpoint
 *
 * Here we generate and register ID for our client.
 * It will be used later for feed synchronization and new
 * source entries.
 */

// TODO: Add removal of Sync after 1 year.

import type { NextApiRequest, NextApiResponse } from 'next'

import { PrismaClient } from '@prisma/client'
import cryptoRandomString from 'crypto-random-string';
import prisma from '../../app/backend/prisma';

// Create interface for typed response construction.
interface Response {
	type: 'success' | 'error',
	value: string
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
	let responseObject: Response = {
		type: 'error',
		value: 'Internal server error.'
	}

	// Variable for our while loop, so
	// we can exit out of it when there is
	// no generated id in database.
	let getSync: object | null = {};
	// Amount of tries.
	let tries = 0;
	// Final sync id.
	let id: string = '';

	// Run this loop until we find unused sync or,
	// until tries >= 16.
	while (getSync != null) {
		if(tries >= 16) {
			responseObject.value = "Couldn't find any free Sync ID.";
			res.status(200).json(responseObject);
			return;
		}

		// Generate random string, get 3 parts per 6 characters,
		// and join them all into id string.
		// ABCXXX-DEFYYY-HIJZZZ
		id = cryptoRandomString({ length: 18, type: 'distinguishable' }).match(/.{6}/g)!.join("-");

		// Try to get record with our generated id from database.
		getSync = await prisma.synchronization.findUnique({
			where: {
				syncID: id
			}
		});

		tries += 1;
	}

	// If we got this far, then id we generated
	// is unused one and it needs its own entry.
	await prisma.synchronization.create({
		data: {
			syncID: id,
			// Create "All" directory here.
			directories: {
				create: [
					{
						name: 'All'
					}
				]
			}
		}
	});

	// Set response values.
	responseObject.type = 'success';
	responseObject.value = id;

	// Send response to client.
	res.status(200).json(responseObject);
}