/**
 * AddSourceModal component
 *
 * Entire source adding modal with all necesary sub-components
 * like steps in stepper.
 *
 * Last step of the stepper should be separated somewhat in future
 * as it can be reused for further edition of source beside adding it.
 */

import Modal from '@mui/material/Modal';
import Typography from '@mui/material/Typography';
import Box from '@mui/material/Box';
import IconButton from '@mui/material/IconButton';
import Divider from '@mui/material/Divider';

// Step component family
import Stepper from '@mui/material/Stepper';
import Step from '@mui/material/Step';
import StepLabel from '@mui/material/StepLabel';
import StepContent from '@mui/material/StepContent';

// React and the hooks
import useMediaQuery from '@mui/material/useMediaQuery';
import React from 'react';

// Icons
import Close from '@mui/icons-material/Close';

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

import TextField from '@mui/material/TextField';
import Alert, { AlertColor } from '@mui/material/Alert';
import Button from '@mui/material/Button';
import Skeleton from '@mui/material/Skeleton';
import MenuItem from '@mui/material/MenuItem';
import { endpoints, fetcher, fetcherAuth } from '../app/api';
import { FeedMetadata } from '../app/backend/feedparse';
import { useAppSelector } from '../app/hook';

interface StepArgs {
	sourceInfo: {
		set: (info: FeedMetadata) => void,
		info: FeedMetadata
	},
	handleBack: () => void,
	handleNext: () => void
}

const steps = [
	// First step
	//
	// We request user here to enter desired source link
	// so further steps can completed.
	{
		label: 'Enter link to the source',
		component: ({ handleNext, sourceInfo }: StepArgs) => {
			// Data for Alert element.
			const [alertData, setAlertData] = React.useState(['info', 'Waiting for the link...']);
			// State for current URL in TextField, so
			// it will stay between steps.
			const [currentURL, setCurrentURL] = React.useState('');
			// Current 'Next' button state.
			const [canMakeNextStep, setCanMakeNextStep] = React.useState(false);

			// Edit timeout id state.
			const [editTimeout, setEditTimeout] = React.useState({} as NodeJS.Timeout);

			return (
				<Box sx={{ paddingTop: 0, width: '100%' }}>
					<TextField
						id="source-url"
						label="Link to the source"
						variant="outlined"
						sx={{ width: '100%', marginBottom: 1 }}
						value={currentURL}
						onChange={(event) => {
							let value = event.target.value;

							setAlertData(['info', 'Analyzing the link...']);

							clearTimeout(editTimeout);
							setCurrentURL(value);

							setEditTimeout(setTimeout(async () => {
								if (value.length == 0) {
									setAlertData(['info', 'Waiting for the link...']);
									setCanMakeNextStep(false);
									return;
								}

								try {
									let response = await fetcher(endpoints.source.info, {
										sourceURL: value
									});

									if (response.type == 'success') {
										sourceInfo.set(response.value as FeedMetadata);

										setAlertData(['success', 'Successfully fetched source info!']);
										setCanMakeNextStep(true);

										setCurrentURL(value);
									} else {
										setAlertData([response.type, response.value]);
										setCanMakeNextStep(false);
									}
								} catch (error) {
									setAlertData(['error', 'Request failed with error!']);
									setCanMakeNextStep(false);
								}
							}, 600));
						}}
					/>
					<Alert severity={alertData[0] as AlertColor}>
						{alertData[1]}
					</Alert>

					<Box sx={{ display: 'flex', width: '100%', justifyContent: 'space-between', marginTop: 4 }}>
						<Button variant="text" disabled>
							Back
						</Button>
						<Button onClick={handleNext} variant="outlined" disabled={!canMakeNextStep}>
							Next
						</Button>
					</Box>
				</Box>
			)
		}
	},

	// Last step
	//
	// Here we allow our user to configure requested source
	// and submit it to the server making it persistent across
	// synchronized devices.
	{
		label: 'Configure source',
		component: ({ handleBack, handleNext, sourceInfo }: StepArgs) => {
			const syncID = useAppSelector((state) => state.syncState.syncID);
			const directories = useAppSelector((state) => state.syncState.directories);

			const [directory, setDirectory] = React.useState(`directory-${directories[0].name}`);

			const inHandleNext = () => {
				fetcherAuth(endpoints.sync.add_source, {
					name: sourceInfo.info.title,
					directory: directory.slice(10),
					url: sourceInfo.info.feedUrl
				}, syncID!)
					.then((response) => {
						console.log(response);
					})
					.catch((error) => {
						console.log(error);
					})
			}

			return (
				<Box sx={{ paddingTop: 0, width: '100%' }}>
					<Box sx={{ display: 'flex' }}>
						{
							sourceInfo.info.image
								? <img
									src={sourceInfo.info.image?.url}
									alt={sourceInfo.info.title}
									style={{ marginRight: 1, flexShrink: '0', objectFit: 'contain' }}
									width={90} height={90}
								/>
								: <Skeleton variant="rectangular" width={90} height={90} sx={{ marginRight: 1, flexShrink: '0' }} />

						}
						<Box>
							<TextField id="source-name" label="Source name" value={sourceInfo.info.title} variant="outlined" sx={{ width: '100%', marginBottom: 1 }} disabled />
							<TextField
								id="source-directory"
								label="Source directory"
								variant="outlined"
								sx={{ width: '100%', marginBottom: 1 }}
								value={directory}
								select
								onChange={(event) => {
									setDirectory(event.target.value);
								}}
							>
								{
									directories.map((dir, _idx) => {
										return <MenuItem key={`directory-${dir.name}`} value={`directory-${dir.name}`}>
											{dir.name}
										</MenuItem>
									})
								}
							</TextField>
						</Box>
					</Box>

					<Box sx={{ display: 'flex', width: '100%', justifyContent: 'space-between', marginTop: 4 }}>
						<Button onClick={handleBack} variant="text">
							Back
						</Button>
						<Button onClick={inHandleNext} variant="outlined" >
							Finish
						</Button>
					</Box>
				</Box>
			)
		}
	}
];

const AddSourceModal = ({ isOpen, onClose }: AddSourceModalProps) => {
	const [activeStep, setActiveStep] = React.useState(0);
	const [sourceInfo, setSourceInfo] = React.useState({} as FeedMetadata);
	const matches = useMediaQuery('(max-width: 420px)');

	return (
		<Modal
			open={isOpen}
			onClose={onClose}
		>
			<Box sx={{ ...style, width: matches ? 360 : 420 }}>
				<Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
					<Typography variant="h6">Add source</Typography>
					<IconButton
						color="inherit"
						aria-label="Close modal"
						onClick={onClose}
					>
						<Close />
					</IconButton>
				</Box>
				<Divider sx={{ marginTop: 1, marginBottom: 1 }} />
				<Box >
					<Stepper activeStep={activeStep} orientation="vertical">
						{steps.map((step, index) => {
							if (index != steps.length - 1) {
								return (
									<Step key={step.label}>
										<StepLabel>{step.label}</StepLabel>
										<StepContent>{step.component({
											handleBack: () => { },
											handleNext: () => {
												setActiveStep(activeStep + 1);
											},
											sourceInfo: {
												set: (info: FeedMetadata) => {
													setSourceInfo(info);
												},
												info: sourceInfo
											}
										})}</StepContent>
									</Step>
								);
							} else {
								return (
									<Step key={step.label}>
										<StepLabel>{step.label}</StepLabel>
										<StepContent>{step.component({
											handleBack: () => {
												setActiveStep(activeStep - 1);
											},
											handleNext: () => {
												alert('unimplmented');
											},
											sourceInfo: {
												set: () => { },
												info: sourceInfo
											}
										})}</StepContent>
									</Step>
								);
							}
						})}
					</Stepper>
				</Box>
			</Box>
		</Modal>
	);
}

export default AddSourceModal