/**
 * api/sync/check_id
 *
 * Simple syncID check.
 */

import type { NextApiRequest, NextApiResponse } from 'next'
import authentication, { updateLastActivity } from '../../../app/backend/authentication';

// Create interface for typed response construction.
interface Response {
	type: 'success' | 'error'
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
	let responseObject: Response = {
		type: 'error'
	}
	let syncID: string | null;

	// Get syncID from helper function and check if it failed.
	if ((syncID = await authentication(req, res)) == null) {
		res.status(401).json(responseObject);
		return;
	}

	updateLastActivity(syncID);

	responseObject.type = "success";

	// Send response to client.
	res.status(200).json(responseObject);
}