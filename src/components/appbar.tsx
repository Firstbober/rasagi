/**
 * Top screen bar with actions
 */

import AppBar from '@mui/material/AppBar';
import Box from '@mui/material/Box';
import IconButton from '@mui/material/IconButton';
import Toolbar from '@mui/material/Toolbar';
import Typography from '@mui/material/Typography';

// Icons
import MenuIcon from '@mui/icons-material/Menu';
import CloudSyncIcon from '@mui/icons-material/CloudSync';
import AddIcon from '@mui/icons-material/Add';

interface AppbarProps {
	setSidebarOpen: () => void
};

const Appbar = ({ setSidebarOpen }: AppbarProps) => {
	return (
		<AppBar position="fixed" sx={{ zIndex: (theme) => theme.zIndex.drawer + 1 }}>
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
					>
						<AddIcon />
					</IconButton>

					<IconButton
						color="inherit"
						aria-label="Synchronization settings"
						title="Synchronization"
					>
						<CloudSyncIcon />
					</IconButton>
				</Box>
			</Toolbar>
		</AppBar>
	)
}

export default Appbar