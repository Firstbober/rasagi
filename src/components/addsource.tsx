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
import { endpoints, fetcher } from '../app/api';

const steps = [
	// First step
	//
	// We request user here to enter desired source link
	// so Redux state can be set and further steps completed.
	{
		label: 'Enter link to the source',
		component: ({ handleNext }: { handleNext: () => void }) => {
			// Data for Alert element.
			const [alertData, setAlertData] = React.useState(['info', 'Waiting for the link...']);
			// Current 'Next' button state.
			const [canMakeNextStep, setCanMakeNextStep] = React.useState(false);

			let editTimeout: NodeJS.Timeout;

			return (
				<Box sx={{ paddingTop: 0, width: '100%' }}>
					<TextField
						id="source-url"
						label="Link to the source"
						variant="outlined"
						sx={{ width: '100%', marginBottom: 1 }}
						onInput={(event) => {
							clearTimeout(editTimeout);

							editTimeout = setTimeout(async () => {
								let value = (event.target as HTMLInputElement).value;

								if (value.length == 0) {
									setAlertData(['info', 'Waiting for the link...']);
									setCanMakeNextStep(false);
									return;
								}

								try {
									let response = await fetcher(endpoints.source.info, {
										sourceURL: (event.target as HTMLInputElement).value
									});

									if (response.type == 'success') {
										setAlertData(['success', 'Successfully fetched source info!']);
										setCanMakeNextStep(true);
									} else {
										setAlertData([response.type, response.value]);
										setCanMakeNextStep(false);
									}
								} catch (error) {
									setAlertData(['error', 'Request failed with error!']);
									setCanMakeNextStep(false);
								}
							}, 600)
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
		component: ({ handleBack, handleNext }: { handleBack: () => void, handleNext: () => void }) => {
			return (
				<Box sx={{ paddingTop: 0, width: '100%' }}>
					<Box sx={{ display: 'flex' }}>
						<Skeleton variant="rectangular" width={90} height={90} sx={{ marginRight: 1, flexShrink: '0' }} />
						<Box>
							<TextField id="source-name" label="Source name" variant="outlined" sx={{ width: '100%', marginBottom: 1 }} disabled />
							<TextField id="source-directory" label="Source directory" variant="outlined" sx={{ width: '100%', marginBottom: 1 }} value="directory-all" select>
								<MenuItem key="directory-all" value="directory-all">
									All
								</MenuItem>
								{ /* TODO: Directory listing */}
							</TextField>
						</Box>
					</Box>

					<Box sx={{ display: 'flex', width: '100%', justifyContent: 'space-between', marginTop: 4 }}>
						<Button onClick={handleBack} variant="text">
							Back
						</Button>
						<Button onClick={handleNext} variant="outlined" >
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
												alert('Not implemented! (finish)');
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