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
// import { XMLValidator } from "fast-xml-parser";
import { parse } from 'node-html-parser';

// Create interface for typed response construction.
interface Response {
	type: 'success' | 'error' | 'info',
	value: {
		sourceName: string
	} | string
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

	// Get sourceURL from query and add https:// if
	// there isn't already.
	let sourceURL = req.query.sourceURL as string;
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
				res.status(200).json(response);
				return;
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
				res.status(200).json(response);
				return;
			}
		}

		// TODO: Do feed parsing here.
	} catch (error) {
		// Send error response
		response.value = "Provided URL is invalid!";
		res.status(200).json(response);
		return;
	}

	response.type = 'success';

	res.status(200).json(response);
}