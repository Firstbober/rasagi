import Box from '@mui/material/Box';
import { endpoints, fetcherAuth } from '../app/api';
import { useAppSelector } from '../app/hook';
import Divider from '@mui/material/Divider';
import useSWR from 'swr'

import NewsCard from '../components/newscard';
import { Item } from '../app/types';
import React from 'react';

import FeedIcon from '@mui/icons-material/Feed';
import Typography from '@mui/material/Typography';
import useMediaQuery from '@mui/material/useMediaQuery';

interface FeedInfoProps {
	title: string,
	description: string
}

const FeedInfo = (props: FeedInfoProps) => {
	return (
		<Box sx={{
			display: 'flex',
			flexDirection: 'column',
			alignItems: 'center',
			justifyContent: 'center',
			textAlign: 'center',
			height: '100%',
			minHeight: 640,
			borderWidth: 1,
			borderColor: 'lightgray',
			borderStyle: 'solid',
			borderRadius: 1
		}}>
			<FeedIcon sx={{ fontSize: 96 }} color='disabled' />
			<Typography variant='h5' color='GrayText' mb={1}>
				{props.title}
			</Typography>
			<Typography variant='subtitle2' color='GrayText' maxWidth={'60%'}>
				{props.description}
			</Typography>
		</Box>
	)
}

const News = () => {
	const syncID = useAppSelector((state) => state.syncState.syncID);
	const directories = useAppSelector((state) => state.syncState.directories);

	// Count amount of pages.
	const [cnt, setCnt] = React.useState(1);

	// Item count from lastest page.
	const [itemCount, setItemCount] = React.useState(0);

	// Scroll timeout id state.
	const [scrollTimeout, setScrollTimeout] = React.useState({} as NodeJS.Timeout);

	// Responsiveness stuff.
	const matches = useMediaQuery('(min-width: 1200px)');

	// Detect if we reached end of page,
	// used for infinite scrolling.
	window.onscroll = function (ev) {
		if ((window.innerHeight + window.scrollY) >= document.body.offsetHeight) {
			clearInterval(scrollTimeout);

			setScrollTimeout(setTimeout(() => {
				setCnt(cnt + 1);
			}, 250));
		}
	};

	// Get pages.
	const pages = [];
	for (let i = 0; i < cnt; i++) {
		pages.push(<NewsPage page={i} syncID={syncID!} key={`news-page-${i}`} setItemCount={
			(count) => {
				setItemCount(count);
			}
		} />);
	}

	let sourceCount = 0;
	for (const directory of directories) {
		sourceCount += directory.sources.length;
	}

	return <Box sx={{
		maxWidth: matches ? 800 : '100%',
		height: '80%',
		marginLeft: 'auto',
		marginRight: 'auto'
	}}>
		{pages}
		{
			sourceCount == 0 ?
				<FeedInfo
					title="No sources added"
					description='Click on the + icon to add source to the feed or use Discover tab to find sources which may interest you.'
				/>
				: itemCount == 0
					? <FeedInfo
						title="No feed yet"
						description='We still are preparing the things for you... Just wait a litte.'
					/>
					: <Divider>End of page.</Divider>
		}
	</Box>
}

interface NewsPageProps {
	page: number,
	syncID: string,
	setItemCount: (count: number) => void
}

const NewsPage = ({ page: page, syncID, setItemCount }: NewsPageProps) => {
	const { data, error } = useSWR([endpoints.sync.get_items, { page: page }, syncID], fetcherAuth);

	if (error) return <Divider>Failed to load!</Divider>
	if (!data) return <Divider>Loading...</Divider>

	if (data.valid == false) {
		return <h1>Failed to load! {data.value}</h1>;
	}

	// Sort items alphabetically.
	data.value.sort((a: Item, b: Item) => {
		if (a.time > b.time) { return -1; }
		if (a.time < b.time) { return 1; }
		console.log(a.time);
		return 0;
	});

	if (data.value.length != 0)
		setItemCount(data.value.length);

	return data.value.map((item: Item) => {
		return <NewsCard
			url={item.link}
			headline={item.title}
			description={item.description}
			source={item.source.name}
			image={item.image ? item.image : "https://picsum.photos/200"}
			pubDate={item.time}

			key={item.time + item.title}
		/>
	});
}

export default News