/**
 * api/source/info endpoint
 *
 * Here we handle request from client to check source url and get important info about it.
 *
 * To get most of the data, source url will be requested and checked for rss/atom link tags,
 * some pages seem to also use /.feed so we will check for it here too if there is no link tag.
 */

import type { NextApiRequest, NextApiResponse } from 'next'
import axios from 'axios';
import { parse } from 'node-html-parser';
import { feedparse, FeedMedia, FeedMetadata, ParserOptions } from "../../../app/backend/feedparse";

// Create interface for typed response construction.
interface Response {
	type: 'success' | 'error' | 'info',
	value: FeedMetadata | string
}

export async function getFeedData(sourceURL: string, feedParseOptions: ParserOptions): Promise<Response | any> {
	let response: Response = {
		type: 'error',
		value: 'Invalid server request'
	};

	sourceURL =
		!sourceURL.startsWith("https://")
			? "https://" + sourceURL
			: sourceURL

	// Convenient function to check if we got useful response.
	const checkContentType = (contentType: string) => {
		contentType = contentType.split(";")[0];

		return (
			contentType == "application/rss+xml" ||
			contentType == "application/atom+xml" ||
			contentType == "application/xml"
		);
	}

	// Try, catch block for axios.get request.
	try {
		// Create URL object from sourceURL.
		const sourceURLObject = new URL(sourceURL);

		// Make request and get content type header.
		let sourceRes = await axios.get(sourceURL);
		let contentType = sourceRes.headers['content-type'];

		// Get if content type is valid.
		let validContentType = checkContentType(contentType);
		// Prepare feedData variable with current response data.
		let feedData = sourceRes.data;

		// First check,
		// we're trying to get some useful data from /.feed
		// endpoint and push it into feedData.
		if (!validContentType) {
			try {
				let sourceRes = await axios.get(sourceURLObject.protocol + "//" + sourceURLObject.hostname + '/.feed');
				let contentType = sourceRes.headers['content-type'];

				if (checkContentType(contentType)) {
					feedData = sourceRes.data;
					sourceURL = sourceURLObject.protocol + "//" + sourceURLObject.hostname + '/.feed';
					validContentType = true;
				}
			} catch (error) {
			}
		}

		// Second check,
		// we already know if we got anything other than standarised feed,
		// so we only check if in this hopefully html data is link tag with
		// useful feed url.
		//
		// Even if we get jpeg or some other data, client still be informed about
		// invalid url.
		if (!validContentType) {
			// Parse out data.
			const root = parse(sourceRes.data);
			// Get all link tags with rel="alternate".
			const alternateLinks = root.querySelectorAll('link[rel="alternate"]');

			// Map validLink variable with presumably valid feed links.
			let validLinks = alternateLinks.map((value) => {
				const type = value.getAttribute("type");
				const href = value.getAttribute("href");

				if (checkContentType(type as string)) {
					return href?.startsWith("/") ? sourceURLObject.protocol + "//" + sourceURLObject.hostname + href : href;
				}

				return;
			});
			// Filter out any undefined entries
			validLinks = validLinks.filter(x => x !== undefined);

			// If there isn't any valid feed links
			// send response with error to client.
			if (validLinks.length == 0) {
				response.value = "This page does not contain any feed!";
				return response;
			}

			// Retrive feed data from link.
			try {
				let sourceRes = await axios.get(validLinks[0] as string);
				let contentType = sourceRes.headers['content-type'];

				if (!checkContentType(contentType))
					throw new Error("Invalid feed");

				feedData = sourceRes.data;
			} catch (error) {
				response.value = "Cannot get feed from this source.";
				return response;
			}
		}

		const parseResult = feedparse(sourceURL, feedData, feedParseOptions);

		if (!parseResult.valid) {
			response.value = "Feed from URL cannot be read.";
			return response;
		}

		// Check if favicon url is valid and use it for
		// the feed icon, usually has better looks than one
		// directly from the feed.
		let faviconURL = sourceURLObject.protocol + "//" + sourceURLObject.hostname;
		try {
			let res = await axios.get(faviconURL);
			const root = parse(res.data);

			let relIcon = root.querySelectorAll('link[rel="icon"]');
			let relAppleTouchIcon = root.querySelectorAll('link[rel="apple-touch-icon"]');

			let biggestApple = 0;
			let biggestAppleHref: string | undefined = '';

			// Try to get biggest possible favicon
			// using apple tags.
			for (const appleIcon of relAppleTouchIcon) {
				let sizes = appleIcon.getAttribute('sizes');
				if (sizes != undefined) {
					let s = sizes.toLowerCase().split('x');
					if (s.length == 2) {
						if (parseInt(s[0]) > biggestApple) {
							biggestApple = parseInt(s[0]);
							biggestAppleHref = appleIcon.getAttribute('href');
						}
					}
				}
			}

			// Pretty big code duplication
			// TODO Remove code duplication
			if (biggestApple == 0 && relIcon.length != 0) {
				let href = relIcon[0].getAttribute("href");
				if (href != undefined) {
					if (href[0] == '/')
						faviconURL += "/" + href;
					else {
						faviconURL = href;
					}
				}

				parseResult.content!.metadata.image = {
					mime: "image/*",
					url: faviconURL
				};
			} else if (biggestAppleHref != undefined && biggestApple != 0) {
				if (biggestAppleHref[0] == '/')
					faviconURL += "/" + biggestAppleHref;
				else {
					faviconURL = biggestAppleHref;
				}

				parseResult.content!.metadata.image = {
					mime: "image/*",
					url: faviconURL
				};
			}
		} catch (error) { }

		return parseResult;
	} catch (error) {
		// Send error response
		response.value = "Provided URL is invalid!";
		return response;
	}
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
	let response: Response = {
		type: 'error',
		value: 'Invalid server request'
	};

	// Check if sourceURL exists.
	if (req.query.sourceURL == undefined) {
		res.status(400).json(response);
		return;
	}

	// Get sourceURL from query.
	let sourceURL = req.query.sourceURL as string;

	// Grab feed data from another function.
	let feedData = await getFeedData(sourceURL, {
		metadataOnly: true
	});

	if (feedData.valid == undefined) {
		res.status(200).json(feedData);
		return;
	}

	response.value = (feedData as any).content.metadata;
	response.type = 'success';

	res.status(200).json(response);
}