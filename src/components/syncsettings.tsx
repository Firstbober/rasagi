import Modal from '@mui/material/Modal';
import Typography from '@mui/material/Typography';
import Box from '@mui/material/Box';
import Tabs from '@mui/material/Tabs';
import Tab from '@mui/material/Tab';
import IconButton from '@mui/material/IconButton';
import Divider from '@mui/material/Divider';
import useMediaQuery from '@mui/material/useMediaQuery';
import React from 'react';

// Icons
import Close from '@mui/icons-material/Close';
import SwitchAccount from '@mui/icons-material/SwitchAccount';
import { useAppSelector } from '../app/hook';

interface AddSourceModalProps {
	isOpen: boolean,
	onClose: () => void
}

const style = {
	position: 'absolute' as 'absolute',
	top: '50%',
	left: '50%',
	transform: 'translate(-50%, -50%)',
	bgcolor: 'background.paper',
	borderRadius: 1,
	boxShadow: 4,
	p: 2,
}

const TabList = [
	{
		label: 'Sync ID',
		component: () => {
			const syncID = useAppSelector((state) => state.syncState.syncID);

			const fnSwitchSyncID = () => {
				alert('Not implemented (fnSwitchSyncID)');
			}

			return (
				<Box height={160}>
					<Box
						sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}
						height={120}
					>
						<Typography
							variant="h5"
							sx={{
								":hover": {
									color: 'text.primary',
									bgcolor: 'transparent',
								},
								p: 1,
								borderRadius: 1,
								color: 'transparent',
								bgcolor: 'text.primary',
								transitionDuration: '150ms',
								border: '1px solid'
							}}
						>
							{syncID}
						</Typography>
					</Box>
					<Box sx={{ display: 'flex', alignItems: 'center' }} textAlign={'center'}>
						<IconButton aria-label="Switch synchronization ID" title="Switch synchronization ID" onClick={fnSwitchSyncID}>
							<SwitchAccount />
						</IconButton>
						<Typography variant="caption">Sync ID will be automatically removed after one year of inactivity.</Typography>
					</Box>
				</Box>
			)
		}
	}
];

const SyncSettingsModal = ({ isOpen, onClose }: AddSourceModalProps) => {
	const matches = useMediaQuery('(max-width: 420px)');
	const [tabsValue, setTabsValue] = React.useState(0);

	return (
		<Modal
			open={isOpen}
			onClose={onClose}
		>
			<Box sx={{ ...style, width: matches ? 360 : 420 }}>
				<Box sx={{ display: 'flex', alignItems: 'center', marginBottom: 1 }}>
					<Tabs
						value={tabsValue}
						onChange={(event, newValue) => {
							setTabsValue(newValue);
						}}
						variant="scrollable"
						scrollButtons
						allowScrollButtonsMobile
						sx={{
							['.MuiTabs-scrollButtons.Mui-disabled']: {
								opacity: 0.3
							},
							width: '100%'
						}}
					>
						{
							TabList.map((tab, index) => {
								return <Tab label={tab.label} id={`sync-settings-tab-${index}`} aria-controls={`sync-settings-tab-${index}`} key={index} />
							})
						}
					</Tabs>

					<IconButton
						color="inherit"
						aria-label="Close modal"
						onClick={onClose}
					>
						<Close />
					</IconButton>
				</Box>
				{
					TabList[tabsValue].component()
				}
			</Box>
		</Modal>
	)
}

export default SyncSettingsModal