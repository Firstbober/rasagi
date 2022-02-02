/**
 * api/source/info endpoint
 *
 * Here we handle request from client to check source url and get important info about it.
 *
 * To get most of the data, source url will be requested and checked for rss/atom meta tags,
 * some pages seem to also use /.feed so we will check for it here too if there is no meta tag.
 */

import type { NextApiRequest, NextApiResponse } from 'next'
import axios from 'axios';

// Create interface for typed response construction
interface Response {
	type: 'success' | 'error',
	value: {
		sourceName: string
	} | string
}

export default function handler(req: NextApiRequest, res: NextApiResponse) {
	let response: Response = {
		type: 'error',
		value: 'Invalid server request'
	};

	console.log(req.query);

	res.status(400).json(response);
}