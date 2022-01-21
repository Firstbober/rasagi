/**
 * Top screen bar with actions
 */

import AppBar from '@mui/material/AppBar';
import Box from '@mui/material/Box';
import IconButton from '@mui/material/IconButton';
import Toolbar from '@mui/material/Toolbar';
import Typography from '@mui/material/Typography';
import Tooltip from '@mui/material/Tooltip';

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

				<Box sx={{ display: { xs: 'none', md: 'flex' } }}>
					<Tooltip title="Add source">
						<IconButton
							size="large"
							aria-label="Add source to the feed"
							color="inherit"
						>
							<AddIcon />
						</IconButton>
					</Tooltip>

					<Tooltip title="Synchronization">
						<IconButton
							size="large"
							color="inherit"
							aria-label="Synchronization settings"
						>
							<CloudSyncIcon />
						</IconButton>
					</Tooltip>
				</Box>
			</Toolbar>
		</AppBar>
	)
}

export default Appbar