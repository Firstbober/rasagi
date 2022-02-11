import Box from '@mui/material/Box';
import { endpoints, fetcherAuth } from '../app/api';
import { useAppSelector } from '../app/hook';
import Divider from '@mui/material/Divider';
import useSWR from 'swr'

import NewsCard from '../components/newscard';
import { Item } from '../app/types';
import React from 'react';

const News = () => {
	const syncID = useAppSelector((state) => state.syncState.syncID);
	// Count amount of pages.
	const [cnt, setCnt] = React.useState(1);

	// Detect if we reached end of page,
	// used for infinite scrolling.
	window.onscroll = function (ev) {
		if ((window.innerHeight + window.scrollY) >= document.body.offsetHeight) {
			setCnt(cnt + 1);
		}
	};

	const pages = [];
	for (let i = 0; i < cnt; i++) {
		pages.push(<NewsPage page={i} syncID={syncID!} key={`news-page-${i}`} />);
	}

	return <Box sx={{ maxWidth: 800 }}>
		{pages}
		<Divider>Loading/End of page.</Divider>
	</Box>
}

interface NewsPageProps {
	page: number,
	syncID: string
}

const NewsPage = ({ page: page, syncID }: NewsPageProps) => {
	const { data, error } = useSWR([endpoints.sync.get_items, { page: page }, syncID], fetcherAuth);

	if (error) return <Divider>Failed to load!</Divider>
	if (!data) return <Divider>Loading...</Divider>

	if (data.valid == false) {
		return <h1>Failed to load! {data.value}</h1>;
	}

	// Sort items alphabetically.
	data.value.sort((a: Item, b: Item) => {
		if (a.title < b.title) { return -1; }
		if (a.title > b.title) { return 1; }
		return 0;
	});

	return data.value.map((item: Item) => {
		{ /* TODO: If possible, use pubDate */ }
		return <NewsCard
			url={item.link}
			headline={item.title}
			description={item.description}
			source={item.source.name}
			image={item.image ? item.image : "https://picsum.photos/200"}
			pubDate={item.time}

			key={item.time + item.title}
		/>
	})
}

export default News