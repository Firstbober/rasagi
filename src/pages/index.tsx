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
import News from '../components/news';
import { endpoints, fetcher, fetcherAuth } from '../app/api';
import { useAppDispatch, useAppSelector } from '../app/hook';
import { setTheme, updateDirectories, updateSyncID } from '../app/features/syncstate';
import useMediaQuery from '@mui/material/useMediaQuery';
import { createTheme, ThemeProvider } from '@mui/material/styles';

const generateTheme = (mode: 'light' | 'dark') => {
	return createTheme({
		palette: {
			mode,
			...(mode === 'light'
				? {
					primary: {
						main: '#3f51b5'
					},
					secondary: {
						main: '#b5a33f'
					},
					info: {
						main: '#3f8cb5',
						light: '#3f8cb5',
						dark: '#3f8cb5'
					},
					error: {
						main: '#b53f51',
						light: '#b53f51',
						dark: '#b53f51'
					},
					warning: {
						main: '#b5a33f'
					},
					success: {
						main: '#303f9f'
					},
					action: {
						selected: '#e8eaf6',
						hover: '#c5cae9'
					}
				}
				: {
					primary: {
						main: '#5c6bc0'
					},
					secondary: {
						main: '#c9ba45'
					},
					info: {
						main: '#3f8cb5',
						light: '#3f8cb5',
						dark: '#3f8cb5'
					},
					error: {
						main: '#e97185'
					},
					warning: {
						main: '#b5a33f'
					},
					success: {
						main: '#7986cb'
					},
					action: {
						selected: '#5332a6',
						hover: '#c5cae95a'
					},
					background: {
						paper: '#16171c',
						default: "#16171c"
					}
				}
			)
		},
		spacing: 6,
		components: {
			MuiToolbar: {
				defaultProps: {
					variant: 'dense',
					sx: {
						m: 0.6
					}
				}
			}
		}
	});
}

const Home: NextPage = () => {
	// Sidebar open state.
	const [isSidebarOpen, setSidebarOpen] = React.useState(true);

	// This state controls if we should render entire app,
	// which in turns mean to synchronize data with the server.
	const [canSyncHappen, setCanSyncHappen] = React.useState(false);

	// Redux dispatch.
	const dispatch = useAppDispatch();

	// Error message for initial loading screen.
	const [initialMessage, setInitialMessage] = React.useState('');

	// Responsiveness stuff.
	const matchesRightPad = useMediaQuery('(min-width: 1420px)');
	const matchesSidebar = useMediaQuery('(max-width: 800px)');

	// Theme
	const themeType = useAppSelector((state) => state.syncState.theme);
	const theme = generateTheme(themeType);

	// Asynchronously updates Redux state
	// with directories cached on the client, then
	// fetched from the server.
	const updateSyncStateDirectories = async (syncID: string) => {
		const au = async () => {
			try {
				let res = await fetcherAuth(endpoints.sync.get_directories, {}, syncID!);

				if (res.type == "success") {
					dispatch(updateDirectories(res.value));
				}
			} catch (error) {
			}
		};

		let syncDirectories = localStorage.getItem("sync-directories");

		if (syncDirectories != null) {
			au();
			dispatch(updateDirectories(JSON.parse(syncDirectories)));
		} else {
			setInitialMessage("Performing initial synchronization");
			await au();
		}
	}

	// Here we check if local storage has sync-id key,
	// if so, then we can proceed further,
	// if not, then let's generate one with request to get_id endpoint.
	//
	// This hook will fire only on mount.
	React.useEffect(() => {
		const fn = async () => {
			// Get theme from localstorage
			let theme = localStorage.getItem('theme');
			if(theme == 'light' || theme == 'dark')
				dispatch(setTheme(theme as 'light' | 'dark'));

			// Get sync-id or null.
			let syncID = localStorage.getItem("sync-id");

			// If there is sync-id in local storage
			// let's render entire app.
			if (syncID != null) {
				// Check if syncID is still valid.
				try {
					await fetcherAuth(endpoints.sync.check_id, {}, syncID);
				} catch (error: any) {
					setInitialMessage("Synchronization failed. Trying to recover...");
					// If unauthorized then remove invalid
					// syncID.
					if (error.response.status === 401) {
						localStorage.removeItem("sync-id");
					}

					fn();

					return;
				}

				dispatch(updateSyncID(syncID!));
				await updateSyncStateDirectories(syncID!);

				setCanSyncHappen(true);

				return;
			}

			// Try to generate and register ID on server.
			try {
				let res = await fetcher(endpoints.sync.get_id, {});

				if (res.type == "success") {
					localStorage.setItem("sync-id", res.value);
					dispatch(updateSyncID(res.value));
					await updateSyncStateDirectories(res.value);

					setCanSyncHappen(true);

					return;
				} else {
					setInitialMessage(res.value);
				}
			} catch (error) {
				setInitialMessage("Synchronization failed. Try again later.");
			}

			return;
		};
		fn();
	}, []);

	React.useEffect(() => {
		document.body.style.backgroundColor = theme.palette.background.default;
		document.body.style.color = theme.palette.text.primary;
	}, [themeType]);

	// Should we render app or loading screen?
	if (canSyncHappen) {
		return (
			<Box
				sx={{ display: 'flex', height: '100vh', width: '100%', background: theme.palette.background.default }}
			>
				<CssBaseline />

				<Head>
					<title>Rasagi</title>
					<meta name="description" content="A private RSS aggregator" />
					<link rel="icon" href="/favicon.ico" />
				</Head>

				<ThemeProvider theme={theme}>
					<Appbar setSidebarOpen={() => setSidebarOpen(!isSidebarOpen)} />

					<Sidebar
						isOpen={isSidebarOpen}
						onNodeSelect={(node) => { }}
					/>

					<Box component="main" sx={{
						flexGrow: 1, p: 3,
						boxSizing: 'border-box',
						maxWidth: matchesSidebar ? "100%" : 'calc(100vw - 280px)'
					}}>
						<Toolbar />

						<Box sx={{
							display: 'flex',
							width: '100%'
						}}>
							<News />
							{
								matchesRightPad ? <Box sx={{ width: '260px' }} /> : undefined
							}
						</Box>
					</Box>
				</ThemeProvider>
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
			{initialMessage == '' ? null : <h2>{initialMessage}</h2>}
		</Box>
	}
}

export default Home