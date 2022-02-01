import Modal from '@mui/material/Modal';
import Typography from '@mui/material/Typography';
import Box from '@mui/material/Box';
import useMediaQuery from '@mui/material/useMediaQuery';

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

const SyncSettingsModal = ({ isOpen, onClose }: AddSourceModalProps) => {
	const matches = useMediaQuery('(max-width: 420px)');

	return (
		<Modal
			open={isOpen}
			onClose={onClose}
		>
			<Box sx={{...style, width: matches ? 360 : 420}}></Box>
		</Modal>
	)
}

export default SyncSettingsModal