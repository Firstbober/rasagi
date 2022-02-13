/**
 * Sidebar containing complete feed, discovery screen and directories for feed sources.
 */

import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Drawer from '@mui/material/Drawer';
import Toolbar from '@mui/material/Toolbar';
import Typography from '@mui/material/Typography';
import { SvgIconProps } from '@mui/material/SvgIcon';
import TreeItem, { TreeItemProps, treeItemClasses } from '@mui/lab/TreeItem';
import TreeView from '@mui/lab/TreeView';
import { styled } from '@mui/material/styles';
import useMediaQuery from '@mui/material/useMediaQuery';
import IconButton from '@mui/material/IconButton';
import Avatar from '@mui/material/Avatar';

// Dialog
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogContentText from '@mui/material/DialogContentText';
import DialogTitle from '@mui/material/DialogTitle';

import React from 'react'

// Icons
import ArrowDropDownIcon from '@mui/icons-material/ArrowDropDown';
import ArrowRightIcon from '@mui/icons-material/ArrowRight';
import Label from '@mui/icons-material/Label';
import Newspaper from '@mui/icons-material/Newspaper';
import Discover from '@mui/icons-material/Explore';
import SourceIcon from '@mui/icons-material/Source';
import DeleteIcon from '@mui/icons-material/Delete';

import { useAppDispatch, useAppSelector } from '../app/hook';
import { endpoints, fetcherAuth } from '../app/api';
import { removeSourceFromDirectory } from '../app/features/syncstate';

declare module 'react' {
	interface CSSProperties {
		'--tree-view-color'?: string;
		'--tree-view-bg-color'?: string;
	}
}

type StyledTreeItemProps = TreeItemProps & {
	bgColor?: string;
	color?: string;
	labelIcon: React.ElementType<SvgIconProps>;
	labelImageURL?: string;
	labelInfo?: string;
	labelText: string;
	trashAction?: () => void
}

// Tree view item styles
const StyledTreeItemRoot = styled(TreeItem)(({ theme }) => ({
	color: theme.palette.text.secondary,
	[`& .${treeItemClasses.content}`]: {
		width: 240,
		color: theme.palette.text.secondary,
		borderRadius: theme.spacing(1),
		paddingRight: theme.spacing(1),
		fontWeight: theme.typography.fontWeightMedium,
		height: 42,
		'&.Mui-expanded': {
			fontWeight: theme.typography.fontWeightRegular,
		},
		'&:hover': {
			backgroundColor: theme.palette.action.hover,
			'.trashIcon': {
				display: 'inline-flex'
			}
		},
		'&.Mui-focused, &.Mui-selected, &.Mui-selected.Mui-focused': {
			backgroundColor: `var(--tree-view-bg-color, ${theme.palette.action.selected})`,
			color: 'var(--tree-view-color)',
		},
		[`& .${treeItemClasses.label}`]: {
			fontWeight: 'inherit',
			color: 'inherit',
		},
		marginBottom: 4
	},
	[`& .${treeItemClasses.group}`]: {
		marginLeft: 0,
		[`& .${treeItemClasses.content}`]: {
			paddingLeft: theme.spacing(2),
		},
	},
	['& .trashIcon']: {
		display: 'none',
	},
}))

// Tree view item itself
const StyledTreeItem = (props: StyledTreeItemProps) => {
	const {
		bgColor,
		color,
		labelImageURL,
		labelIcon: LabelIcon,
		labelInfo,
		labelText,
		trashAction,
		...other
	} = props;

	return (
		<StyledTreeItemRoot
			label={
				<Box sx={{ display: 'flex', alignItems: 'center', p: 0.5, pr: 0 }}>
					{
						labelImageURL
							? <Avatar src={labelImageURL} sx={{ mr: 1, width: 24, height: 24 }} />
							: <Box component={LabelIcon} color="inherit" sx={{ mr: 1 }} />
					}
					<Typography variant="body2" noWrap sx={{ fontWeight: 'inherit', flexGrow: 1 }}>
						{labelText}
					</Typography>
					<Typography variant="caption" color="inherit">
						{labelInfo}
					</Typography>

					{
						trashAction
							? <IconButton onClick={trashAction} className="trashIcon">
								<DeleteIcon />
							</IconButton>
							: undefined
					}
				</Box>
			}
			style={{
				'--tree-view-color': color,
				'--tree-view-bg-color': bgColor,
			}}
			{...other}
		/>
	);
}

interface SidebarProps {
	isOpen: boolean,
	onNodeSelect: (node: string) => void
}

interface DialogData {
	title: string,
	description: string,
	buttons: Array<{
		label: string,
		action: (closeDialog: () => void) => void
	}>
}

const Sidebar = ({ isOpen, onNodeSelect }: SidebarProps) => {
	const width = 260;
	const matches = useMediaQuery('(max-width: 800px)');

	const directories = useAppSelector((state) => state.syncState.directories);
	const syncID = useAppSelector((state) => state.syncState.syncID);

	const dispatch = useAppDispatch();

	const [selectedNode, setSelectedNode] = React.useState('feed');

	const [isDialogOpen, setDialogOpen] = React.useState(false);
	const [dialogData, setDialogData] = React.useState({
		title: "-",
		description: "-",
		buttons: []
	} as DialogData);

	return (
		<Drawer
			variant={matches ? "temporary" : "persistent"}
			sx={{
				width: width,
				flexShrink: 0,
				[`& .MuiDrawer-paper`]: {
					width: width,
					boxSizing: 'border-box',
					paddingTop: 2,
					borderRight: 'none'
				},
			}}
			open={matches ? !isOpen : isOpen}
		>
			<Toolbar />

			<Box sx={{ overflow: 'auto', height: '100%' }}>
				<TreeView
					aria-label="Sidebar"
					defaultExpanded={['directory-All']}
					defaultSelected={'feed'}
					defaultCollapseIcon={<ArrowDropDownIcon />}
					defaultExpandIcon={<ArrowRightIcon />}
					defaultEndIcon={<div style={{ width: 24 }} />}
					sx={{
						flexGrow: 1,
						maxWidth: width,
						overflowY: 'auto',
						userSelect: 'none',
						height: '100%',
						display: 'flex',
						flexDirection: 'column',
						alignItems: 'center'
					}}
					onNodeSelect={(event: React.SyntheticEvent, nodeIds: string) => {
						if (!nodeIds.startsWith('directory-')) {
							onNodeSelect(nodeIds);
							setSelectedNode(nodeIds);
						}
					}}
					selected={selectedNode}
				>
					<StyledTreeItem nodeId="feed" labelText="Feed" labelIcon={Newspaper} />
					{
						// Some day, maybe
						// <StyledTreeItem nodeId="discover" labelText="Discover" labelIcon={Discover} />
					}

					{
						directories.map((directory, _idx) => {
							return <StyledTreeItem
								nodeId={`directory-${directory.name}`}
								labelText={directory.name}
								labelIcon={Label}
								key={`directory-${directory.name}`}
							>
								{
									directory.sources.map((source, _idx) => {
										return <StyledTreeItem
											nodeId={`directory-source-${source.name}`}
											labelText={source.name}
											labelIcon={SourceIcon}
											labelImageURL={source.image}
											key={`directory-source-${source.name}`}
											trashAction={async () => {
												const errorDialog = (description: string) => {
													setDialogData({
														title: "Source removal failed",
														description: description,
														buttons: [
															{
																label: 'Continue',
																action: (cd) => cd()
															}
														]
													});
													setDialogOpen(true);
												}

												setDialogData({
													title: "Are you sure?",
													description: `Please click "Remove" button to delete "${source.name}" source.`,
													buttons: [
														{
															label: 'Go back',
															action: (cd) => cd()
														},
														{
															label: 'Remove',
															action: async (cd) => {
																try {
																	let res = await fetcherAuth(endpoints.sync.del_source, {
																		name: source.name,
																		directory: directory.name
																	}, syncID!);

																	if (res.type == "error") {
																		errorDialog(`Could not remove "${source.name}" due to ${res.value}`);
																	} else {
																		dispatch(removeSourceFromDirectory([directory.name, source.name]));
																	}
																} catch (error) {
																	errorDialog(`Could not remove "${source.name}" due to unknown reasons. Try again later.`);
																}

																cd();
															}
														}
													]
												});
												setDialogOpen(true);
											}}
										/>
									})
								}
							</StyledTreeItem>
						})
					}
				</TreeView>
			</Box>

			<Dialog
				open={isDialogOpen}
				onClose={() => setDialogOpen(false)}
				aria-labelledby="alert-dialog-title"
				aria-describedby="alert-dialog-description"
			>
				<DialogTitle id="alert-dialog-title">
					{dialogData.title}
				</DialogTitle>
				<DialogContent>
					<DialogContentText id="alert-dialog-description">
						{dialogData.description}
					</DialogContentText>
				</DialogContent>
				<DialogActions>
					{
						dialogData.buttons.map((button) => {
							return <Button onClick={() => button.action(() => setDialogOpen(false))} key={`dbtn-${button.label}`}>{button.label}</Button>;
						})
					}
				</DialogActions>
			</Dialog>
		</Drawer>
	)
}

export default Sidebar