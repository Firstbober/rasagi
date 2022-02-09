/**
 * Main app screen
 */

import type { NextPage } from 'next'

import Box from '@mui/material/Box';
import CssBaseline from '@mui/material/CssBaseline';
import Head from 'next/head'
import React from 'react'
import Toolbar from '@mui/material/Toolbar';

// App components
import Sidebar from '../components/sidebar';
import Appbar from '../components/appbar';
import NewsCard from '../components/newscard';
import { endpoints, fetcher, fetcherAuth } from '../app/api';
import { useAppDispatch, useAppSelector } from '../app/hook';
import { updateDirectories, updateSyncID } from '../app/features/syncstate';

const Home: NextPage = () => {
	// Sidebar open state.
	const [isSidebarOpen, setSidebarOpen] = React.useState(true);

	// This state controls if we should render entire app,
	// which in turns mean to synchronize data with the server.
	const [canSyncHappen, setCanSyncHappen] = React.useState(false);

	// Redux dispatch.
	const dispatch = useAppDispatch();

	// Error message for initial loading screen.
	const [initialErrorMessage, setInitialErrorMessage] = React.useState('');

	// Asynchronously updates Redux state
	// with directories cached on the client, then
	// fetched from the server.
	const updateSyncStateDirectories = async (syncID: string) => {
		let syncDirectories = localStorage.getItem("sync-directories");

		if (syncDirectories != null) {
			dispatch(updateDirectories(JSON.parse(syncDirectories)));
		}

		try {
			let res = await fetcherAuth(endpoints.sync.get_directories, {}, syncID!);

			if (res.type == "success") {
				dispatch(updateDirectories(res.value));
			}
		} catch (error) {
		}
	}

	// Here we check if local storage has sync-id key,
	// if so, then we can proceed further,
	// if not, then let's generate one with request to get_id endpoint.
	//
	// This hook will fire only on mount.
	React.useEffect(() => {
		// Get sync-id or null.
		let syncID = localStorage.getItem("sync-id");

		// If there is sync-id in local storage
		// let's render entire app.
		if (syncID != null) {
			dispatch(updateSyncID(syncID));
			updateSyncStateDirectories(syncID);

			setCanSyncHappen(true);
			return;
		}

		// Try to generate and register ID on server.
		const fn = async () => {
			try {
				let res = await fetcher(endpoints.sync.get_id, {});

				if (res.type == "success") {
					localStorage.setItem("sync-id", res.value);
					setCanSyncHappen(true);
				} else {
					setInitialErrorMessage(res.value);
				}
			} catch (error) {
				setInitialErrorMessage("Synchronization failed. Try again later.");
			}
		};
		fn();
	}, []);

	// Should we render app or loading screen?
	if (canSyncHappen) {
		return (
			<Box sx={{ display: 'flex' }}>
				<CssBaseline />

				<Head>
					<title>Rasagi</title>
					<meta name="description" content="A private RSS aggregator" />
					<link rel="icon" href="/favicon.ico" />
				</Head>

				<Appbar setSidebarOpen={() => setSidebarOpen(!isSidebarOpen)} />
				<Sidebar
					isOpen={isSidebarOpen}
					onNodeSelect={(node) => alert(`Not implemented (${node})`)}
				/>

				<Box component="main" sx={{ flexGrow: 1, p: 3 }}>
					<Toolbar />

					<Box sx={{ maxWidth: 800 }}>
						<NewsCard
							url="https://somenews.com"
							headline="My news headline"
							description="Something great happend! Check it our right now!"
							source="SomeNews"
							image="https://picsum.photos/200"
							pubDate="2020-01-22"
						/>
					</Box>
				</Box>
			</Box>
		)
	} else {
		return <Box sx={{
			display: 'flex',
			height: '100vh',
			justifyContent: 'center',
			alignItems: 'center',
			flexDirection: 'column'
		}}>
			<h1>Rasagi</h1>
			{initialErrorMessage == '' ? null : <h2>{initialErrorMessage}</h2>}
		</Box>
	}
}

export default Home