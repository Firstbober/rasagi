import Modal from '@mui/material/Modal';
import Typography from '@mui/material/Typography';
import Box from '@mui/material/Box';
import Tabs from '@mui/material/Tabs';
import Tab from '@mui/material/Tab';
import IconButton from '@mui/material/IconButton';
import useMediaQuery from '@mui/material/useMediaQuery';
import React from 'react';

// Dialog stuff
import Button from '@mui/material/Button';
import TextField from '@mui/material/TextField';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogContentText from '@mui/material/DialogContentText';
import DialogTitle from '@mui/material/DialogTitle';

import Alert, { AlertColor } from '@mui/material/Alert';

// Icons
import Close from '@mui/icons-material/Close';
import SwitchAccount from '@mui/icons-material/SwitchAccount';
import { useAppDispatch, useAppSelector } from '../app/hook';
import { endpoints, fetcherAuth } from '../app/api';

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

			// Is dialog visible right now.
			const [switchSyncDialogOpen, setSwitchSyncDialogOpen] = React.useState(false);
			// Data for the alert in the dialog.
			const [alertData, setAlertData] = React.useState(['info', 'Waiting for the sync ID...']);
			// SyncID from dialog textfield.
			const [currentSyncID, setCurrentSyncID] = React.useState('');
			// Request timeout so we won't spam the server with hundreds of requests.
			const [editTimeout, setEditTimeout] = React.useState({} as NodeJS.Timeout);
			// Can we continue and change syncID.
			const [canContinue, setCanContinue] = React.useState(false);

			const fnSwitchSyncID = () => {
				setSwitchSyncDialogOpen(true);
			}

			const fnDisableSwitchSyncDialog = () => {
				setSwitchSyncDialogOpen(false);
			}

			return (
				<Box height={160}>
					<Dialog open={switchSyncDialogOpen} onClose={fnDisableSwitchSyncDialog}>
						<DialogTitle>Switch synchronization ID</DialogTitle>
						<DialogContent>
							<DialogContentText>
								Enter here synchronization ID you want to use.
							</DialogContentText>
							<TextField
								autoFocus
								margin="dense"
								label="Synchronization ID"
								fullWidth
								variant="standard"
								sx={{ mb: 3 }}
								value={currentSyncID}
								onChange={(event) => {
									let value = event.target.value;

									setAlertData(['info', 'Processing...']);

									clearTimeout(editTimeout);
									setCurrentSyncID(value);

									setEditTimeout(setTimeout(async () => {
										if (value.length == 0) {
											setAlertData(['info', 'Waiting for the sync ID...']);
											setCanContinue(false);
											return;
										}

										try {
											console.log(value);
											await fetcherAuth(endpoints.sync.check_id, {}, value);

											setCurrentSyncID(value);
											setAlertData(['success', 'Valid sync ID. Continue to complete the process.']);
											setCanContinue(true);
										} catch (error: any) {
											if (error.response.status === 401) {
												setAlertData(['error', 'Invalid sync ID!']);
												setCanContinue(false);
												return;
											}

											setAlertData(['error', 'Request failed with error!']);
											setCanContinue(false);
										}
									}, 600));
								}}
							/>
							<Alert severity={alertData[0] as AlertColor}>
								{alertData[1]}
							</Alert>
						</DialogContent>
						<DialogActions sx={{ pr: 3, pl: 3, pb: 2 }}>
							<Button onClick={fnDisableSwitchSyncDialog} sx={{ mr: 'auto' }}>Cancel</Button>
							<Button onClick={() => {
								localStorage.removeItem("sync-id");
								localStorage.setItem("sync-id", currentSyncID);
								window.location.reload();
							}} variant='outlined' disabled={!canContinue}>Continue</Button>
						</DialogActions>
					</Dialog>

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