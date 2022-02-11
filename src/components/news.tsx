import Box from '@mui/material/Box';
// import Divider from '@mui/material/Divider';

import NewsCard from '../components/newscard';

const News = () => {
	return <Box sx={{ maxWidth: 800 }}>
		<NewsCard
			url="https://somenews.com"
			headline="My news headline"
			description="Something great happend! Check it our right now!"
			source="SomeNews"
			image="https://picsum.photos/200"
			pubDate="2020-01-22"
		/>
	</Box>
}

export default News