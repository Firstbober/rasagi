import Card from '@mui/material/Card';
import CardMedia from '@mui/material/CardMedia';
import CardContent from '@mui/material/CardContent';
import CardActions from '@mui/material/CardActions';
import Typography from '@mui/material/Typography';
import Link from '@mui/material/Link';
import IconButton from '@mui/material/IconButton';
import Snackbar from '@mui/material/Snackbar';

import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';
dayjs.extend(relativeTime);

// Icons
import OpenInNew from '@mui/icons-material/OpenInNew';
import Share from '@mui/icons-material/Share';
import BookmarkBorder from '@mui/icons-material/BookmarkBorder';
import Bookmark from '@mui/icons-material/Bookmark';
import React from 'react';
import useMediaQuery from '@mui/material/useMediaQuery';

interface NewsCardProps {
	url: string,
	headline: string,
	description: string,
	source: string,
	image: string,
	pubDate: number
}

const NewsCard = (props: NewsCardProps) => {
	const [isSnackbarOpen, setSnackbarOpen] = React.useState({ isOpen: false, message: "" });

	// Responsiveness stuff.
	const matches = useMediaQuery('(min-width: 600px)');

	const fnOpenInNewTab = () => {
		window.open(props.url, '_blank');
	}
	const fnShareLink = () => {
		navigator.clipboard.writeText(props.url);

		setSnackbarOpen({
			isOpen: true,
			message: "Link copied to the clipboard."
		});
	}
	const fnBookmarkArticle = () => {
		alert("Not implemented");
	}

	return (
		<Card variant="outlined" sx={{ marginBottom: 2, width: '100%' }}>
			<Link
				href={props.url}
				color="inherit"
				sx={{
					display: 'flex', p: 2,
					textDecoration: 'none',
					":hover": { textDecoration: 'underline' }
				}}
				target="_blank"
				rel="noopener"
			>
				<CardContent sx={{
					display: 'flex',
					flexDirection: 'column', p: 0, mr: 'auto',
					width: matches ? '80%' : '100%'
				}}>
					<Typography variant="h6" noWrap>
						{props.headline}
					</Typography>
					<Typography variant="subtitle2">
						{props.source} • {dayjs(props.pubDate).fromNow()}
					</Typography>
					<Typography variant="caption" sx={{
						marginTop: 'auto',
						marginBottom: 'auto',
						paddingRight: 4,
						paddingTop: 1
					}} noWrap>
						{props.description}
					</Typography>
				</CardContent>
				{
					matches
						? <CardMedia
							component="img"
							image={props.image}
							alt="Article complementary image"
							sx={{ width: 100, height: 100, borderRadius: 1 }}
						/>
						: undefined
				}
			</Link>

			<CardActions disableSpacing>
				<IconButton aria-label="Open in new tab" title="Open in new tab" onClick={fnOpenInNewTab}>
					<OpenInNew />
				</IconButton>
				<IconButton aria-label="Share link" title="Share link" onClick={fnShareLink}>
					<Share />
				</IconButton>
				{
					/*
					TODO: Add bookmarks

					<IconButton aria-label="Bookmark article" title="Bookmark article" onClick={fnBookmarkArticle}>
						<BookmarkBorder />
					</IconButton>
					*/
				}
			</CardActions>

			<Snackbar
				open={isSnackbarOpen.isOpen}
				autoHideDuration={5000}
				onClose={(event: React.SyntheticEvent | Event, reason?: string) => {
					if (reason === 'clickaway') {
						return;
					}

					setSnackbarOpen({
						isOpen: false,
						message: ""
					});
				}}
				message={isSnackbarOpen.message}
			/>
		</Card>
	)
}

export default NewsCard