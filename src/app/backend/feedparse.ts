/**
 * src/app/backend/feedparse
 *
 * Small function for parsing RSS and Atom feeds.
 */

import { XMLParser, XMLValidator } from "fast-xml-parser";

interface FeedItem {
	title: string,
	link: string,
	description: string,
	media?: FeedMedia
}

export interface FeedMedia {
	mime: string,
	url: string
}

interface FeedContent {
	metadata: {
		title: string,
		link: string,
		description: string,
		image?: FeedMedia
	},

	items: Array<FeedItem>
}

interface Feed {
	valid: boolean,
	content?: FeedContent
}

interface ParserOptions {
	// Should we only return metadata about feed
	// [title, link, description, image].
	metadataOnly: boolean
}

// Function for parsing RSS feed.
function parseRSS(xml: any, options: ParserOptions): FeedContent | boolean {
	// Prepare variable which we can fill out later.
	let feedContent: FeedContent = { metadata: {} } as any;

	// If channel in xml is undefined then return error.
	if (xml.channel == undefined)
		return false;

	// Fill out required metadata from xml.channel.
	feedContent.metadata.title = xml.channel.title;
	feedContent.metadata.link = xml.channel.link;
	feedContent.metadata.description = xml.channel.description;

	// Check if optional <image> tag is included,
	// and add it to our metdata.
	if (xml.channel.image != undefined) {
		if (xml.channel.image.url == undefined)
			return false;

		feedContent.metadata.image = {
			mime: "image/*",
			url: xml.channel.image.url
		};
	}

	// Check if any non-optional field is undefined,
	// if so, return an error.
	for (const [_, val] of Object.entries(feedContent.metadata)) {
		if (val == undefined)
			return false;
	}

	// Create required array.
	feedContent.items = [];

	// If metadataOnly is true in options
	// then return FeedContent without parsing
	// any items.
	if(options.metadataOnly)
		return feedContent;

	// Iterate over items from xml.channel.
	for (const item of xml.channel.item) {
		// Fill out required fields.
		let feedItem: FeedItem = {
			title: item.title,
			link: item.link,
			description: item.description
		};

		// Check for optional <enclosure> tag and fill it out
		// if it is included.
		if (item.enclosure != undefined) {
			if (item.enclosure["@_type"] == undefined || item.enclosure["@_url"] == undefined)
				return false;

			feedItem.media = {
				mime: item.enclosure["@_type"],
				url: item.enclosure["@_url"],
			};
		}

		// Again as above, check if fields aren't undefined
		// and if it is the case return an error.
		for (const [_, val] of Object.entries(feedItem)) {
			if (val == undefined)
				return false;
		}

		// Push item into the array.
		feedContent.items.push(feedItem);
	}

	return feedContent;
}

export function feedparse(feed: string, options?: ParserOptions): Feed {
	// Check if provided XML is a valid one.
	if (!XMLValidator.validate(feed)) {
		return {
			valid: false
		};
	}

	// Set up parser options.
	const parserOptions: ParserOptions = options ? options : {
		metadataOnly: false
	};

	// Set up a XML parser.
	const parser = new XMLParser({
		ignoreAttributes: false
	});
	// Get XML root.
	let xmlRoot = parser.parse(feed);

	let feedContent: FeedContent;
	let parseRet = xmlRoot.rss != undefined
		? parseRSS(xmlRoot.rss, parserOptions)
		// Temporarily parse RSS here, so vscode is silent.
		//
		// After some thought, I will not make Atom parser
		// as right now there is virtually none feeds I could find.
		// Pull requests are welcomed.
		: parseRSS(xmlRoot.rss, parserOptions);

	// Parsing function can return FeedContent or false,
	// so we're using this fact for error handling.
	if (!parseRet)
		return {
			valid: false
		}

	// Cast types so TypeScript will be happy.
	// In this case this is safe as we check everything earlier.
	feedContent = parseRet as FeedContent;

	return {
		valid: true,
		content: feedContent
	};
}