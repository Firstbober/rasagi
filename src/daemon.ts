import ipc from 'node-ipc';
import { PrismaClient } from '@prisma/client'
import { getFeedData } from './pages/api/source/info';
import { Feed, FeedItem } from './app/backend/feedparse';

// Prisma database client.
const prisma = new PrismaClient();

// Fetch sourceItems.
async function fetchSourceItems() {
	// Get all sourceFetchers from database.
	let sources = await prisma.sourceFetcher.findMany({});

	// Iterate over sourceFetchers.
	for (const source of sources) {
		getFeedData(source.url, {
			// We want to get entire feed
			// with all the items.
			metadataOnly: false
		}).then(async (data: Feed) => {
			// Some validity checks.
			if (data.valid == undefined) return;
			if (!data.valid) return;

			// Get latest item so we won't
			// be duplicating items.
			let latestItem = await prisma.sourceItem.findMany({
				take: 1,
				where: {
					sourceFetcher: {
						id: source.id
					}
				},
				orderBy: {
					createdAt: 'desc'
				}
			});

			// Latest URL and title for item
			// identification.
			let latestURL = '';
			let latestTitle = '';

			if (latestItem.length > 0) {
				latestURL = latestItem[0].link;
				latestTitle = latestItem[1].title;
			}

			// Create item function.
			const createItem = async (item: FeedItem) => {
				await prisma.sourceItem.create({
					data: {
						title: item.title,
						link: item.link,
						description: item.description,
						image: item.media?.mime.startsWith("image") ? item.media.url : undefined,

						sourceFetcher: {
							connect: { id: source.id }
						}
					}
				});
			}

			// Check if there is already some items for
			// this sourceFetcher.
			if (latestURL != '') {
				let idx = 0;

				for (let i = 0; i < data.content!.items!.length; i++) {
					const el = data.content!.items![i];

					if (el.link == latestURL && el.title == latestTitle) {
						idx = i;
						break;
					}
				}

				// There should be check if we
				// hit the end of the array so slice will not need to be
				// executed.
				// TODO btw.
				for (const item of data.content!.items!.slice(idx + 1)) {
					await createItem(item);
				}
			} else {
				for (const item of data.content!.items!) {
					await createItem(item);
				}
			}
		})
	}
}

// Run every 15 minutes.
setInterval(fetchSourceItems, 15 * 60 * 1000);
fetchSourceItems();