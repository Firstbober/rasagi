/**
 * Top screen bar with actions
 */

import AppBar from '@mui/material/AppBar';
import Box from '@mui/material/Box';
import IconButton from '@mui/material/IconButton';
import Toolbar from '@mui/material/Toolbar';
import Typography from '@mui/material/Typography';
import React from 'react';

// Icons
import MenuIcon from '@mui/icons-material/Menu';
import CloudSyncIcon from '@mui/icons-material/CloudSync';
import AddIcon from '@mui/icons-material/Add';
import DarkMode from '@mui/icons-material/DarkMode';
import LightMode from '@mui/icons-material/LightMode';
import FolderIcon from '@mui/icons-material/Folder';

import AddSourceModal from './addsource';
import SyncSettingsModal from './syncsettings';

const DarkModeSwitch = () => {
	const [isDarkMode, setDarkMode] = React.useState(false);

	const fnToggleThemeMode = () => {
		setDarkMode(!isDarkMode);
	}

	return (
		<IconButton
			aria-label="Toggle theme mode"
			color="inherit"
			title="Toggle theme mode"
			onClick={fnToggleThemeMode}
		>
			{
				isDarkMode ?
					<LightMode />
					:
					<DarkMode />
			}
		</IconButton>
	)
}

interface AppbarProps {
	setSidebarOpen: () => void
};

const Appbar = ({ setSidebarOpen }: AppbarProps) => {
	const [isAddSourceModalOpen, setAddSourceModalOpen] = React.useState(false);
	const [isSyncSettingsModalOpen, setSyncSettingsModalOpen] = React.useState(false);

	const fnAddSource = () => {
		setAddSourceModalOpen(true);
	}
	const fnManageFolders = () => {
		alert("Not implemented");
	}
	const fnSyncSettings = () => {
		setSyncSettingsModalOpen(true);
	}

	return (
		<AppBar position="fixed" sx={{ zIndex: (theme) => theme.zIndex.drawer + 1 }}>
			<AddSourceModal
				isOpen={isAddSourceModalOpen}
				onClose={() => { setAddSourceModalOpen(false) }}
			/>

			<SyncSettingsModal
				isOpen={isSyncSettingsModalOpen}
				onClose={() => { setSyncSettingsModalOpen(false) }}
			/>

			<Toolbar>
				<IconButton
					size="large"
					edge="start"
					color="inherit"
					aria-label="Main menu"
					sx={{ mr: 2 }}
					onClick={setSidebarOpen}
				>
					<MenuIcon />
				</IconButton>

				<Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
					Rasagi
				</Typography>

				<Box sx={{ display: { md: 'flex' } }}>
					<IconButton
						aria-label="Add source to the feed"
						color="inherit"
						title="Add source"
						onClick={fnAddSource}
					>
						<AddIcon />
					</IconButton>

					{
						/*
							<IconButton
								aria-label="Manage folders"
								color="inherit"
								title="Manage folders"
								onClick={fnManageFolders}
							>
								<FolderIcon />
							</IconButton>
						*/
					}

					<DarkModeSwitch />

					<IconButton
						color="inherit"
						aria-label="Synchronization settings"
						title="Synchronization"
						onClick={fnSyncSettings}
					>
						<CloudSyncIcon />
					</IconButton>
				</Box>
			</Toolbar>
		</AppBar>
	)
}

export default Appbar