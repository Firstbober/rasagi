import Modal from '@mui/material/Modal';
import Typography from '@mui/material/Typography';
import Box from '@mui/material/Box';
import IconButton from '@mui/material/IconButton';
import Divider from '@mui/material/Divider';
import Stepper from '@mui/material/Stepper';
import Step from '@mui/material/Step';
import StepLabel from '@mui/material/StepLabel';
import StepContent from '@mui/material/StepContent';

// Icons
import Close from '@mui/icons-material/Close';
import React from 'react';

interface AddSourceModalProps {
	isOpen: boolean,
	onClose: () => void
}

const style = {
	position: 'absolute' as 'absolute',
	top: '50%',
	left: '50%',
	transform: 'translate(-50%, -50%)',
	width: 400,
	bgcolor: 'background.paper',
	borderRadius: 1,
	boxShadow: 4,
	p: 2,
}

import TextField from '@mui/material/TextField';
import Alert from '@mui/material/Alert';
import Button from '@mui/material/Button';
import Skeleton from '@mui/material/Skeleton';
import MenuItem from '@mui/material/MenuItem';

const steps = [
	{
		label: 'Enter link to the source',
		component: ({ handleNext }: { handleNext: () => void }) => {
			return (
				<Box sx={{ paddingTop: 0, width: '100%' }}>
					<TextField id="source-url" label="Link to the source" variant="outlined" sx={{ width: '100%', marginBottom: 1 }} />
					<Alert severity="info">Waiting for the link...</Alert>

					<Box sx={{ display: 'flex', width: '100%', justifyContent: 'space-between', marginTop: 4 }}>
						<Button variant="text" disabled>
							Back
						</Button>
						<Button onClick={handleNext} variant="outlined" >
							Next
						</Button>
					</Box>
				</Box>
			)
		}
	},
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
								{ alert('Not implemented! (directory listing)') }
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

	return (
		<Modal
			open={isOpen}
			onClose={onClose}
		>
			<Box sx={style}>
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
							if(index != steps.length - 1) {
								return (
									<Step key={step.label}>
										<StepLabel>{step.label}</StepLabel>
										<StepContent>{step.component({
											handleBack: () => {},
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