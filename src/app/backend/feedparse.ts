import { XMLParser, XMLValidator } from "fast-xml-parser";

interface FeedItem {
	title: string,
	link: string,
	description: string,
	media?: FeedMedia
}

interface FeedMedia {
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

export function feedparse(feed: string): Feed {
	if(!XMLValidator.validate(feed)) {
		return {
			valid: false
		};
	}

	// TODO: Do XML parsing stuff here

	return {
		valid: true
	};
}