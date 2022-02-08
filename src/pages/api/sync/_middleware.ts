/**
 * api/sync/_middleware
 *
 * Check if there is Authorization header and if so then, allow it to pass,
 * otherwise send an error.
 */

import { NextFetchEvent, NextRequest, NextResponse } from 'next/server'

export async function middleware(req: NextRequest, ev: NextFetchEvent) {
	if (!req.headers.has('Authorization')) {
		return new Response('No Authorization header!', {
			status: 401
		});
	}

	return NextResponse.next();
}