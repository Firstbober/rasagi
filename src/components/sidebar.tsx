/**
 * Sidebar containing complete feed, discovery screen and directories for feed sources.
 */

import Box from '@mui/material/Box';
import Drawer from '@mui/material/Drawer';
import Toolbar from '@mui/material/Toolbar';
import Typography from '@mui/material/Typography';
import { SvgIconProps } from '@mui/material/SvgIcon';
import TreeItem, { TreeItemProps, treeItemClasses } from '@mui/lab/TreeItem';
import TreeView from '@mui/lab/TreeView';
import { styled } from '@mui/material/styles';
import useMediaQuery from '@mui/material/useMediaQuery';

// Icons
import ArrowDropDownIcon from '@mui/icons-material/ArrowDropDown';
import ArrowRightIcon from '@mui/icons-material/ArrowRight';
import Label from '@mui/icons-material/Label';
import Newspaper from '@mui/icons-material/Newspaper';
import Discover from '@mui/icons-material/Explore';
import { useAppSelector } from '../app/hook';

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
	labelInfo?: string;
	labelText: string;
}

// Tree view item styles
const StyledTreeItemRoot = styled(TreeItem)(({ theme }) => ({
	color: theme.palette.text.secondary,
	[`& .${treeItemClasses.content}`]: {
		color: theme.palette.text.secondary,
		borderTopRightRadius: theme.spacing(12),
		borderBottomRightRadius: theme.spacing(12),
		paddingRight: theme.spacing(1),
		fontWeight: theme.typography.fontWeightMedium,
		height: 42,
		'&.Mui-expanded': {
			fontWeight: theme.typography.fontWeightRegular,
		},
		'&:hover': {
			backgroundColor: theme.palette.action.hover,
		},
		'&.Mui-focused, &.Mui-selected, &.Mui-selected.Mui-focused': {
			backgroundColor: `var(--tree-view-bg-color, ${theme.palette.action.selected})`,
			color: 'var(--tree-view-color)',
		},
		[`& .${treeItemClasses.label}`]: {
			fontWeight: 'inherit',
			color: 'inherit',
		},
	},
	[`& .${treeItemClasses.group}`]: {
		marginLeft: 0,
		[`& .${treeItemClasses.content}`]: {
			paddingLeft: theme.spacing(2),
		},
	},
}))

// Tree view item itself
const StyledTreeItem = (props: StyledTreeItemProps) => {
	const {
		bgColor,
		color,
		labelIcon: LabelIcon,
		labelInfo,
		labelText,
		...other
	} = props;

	return (
		<StyledTreeItemRoot
			label={
				<Box sx={{ display: 'flex', alignItems: 'center', p: 0.5, pr: 0 }}>
					<Box component={LabelIcon} color="inherit" sx={{ mr: 1 }} />
					<Typography variant="body2" sx={{ fontWeight: 'inherit', flexGrow: 1 }}>
						{labelText}
					</Typography>
					<Typography variant="caption" color="inherit">
						{labelInfo}
					</Typography>
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

const Sidebar = ({ isOpen, onNodeSelect }: SidebarProps) => {
	const width = 260;
	const matches = useMediaQuery('(max-width: 800px)');

	const directories = useAppSelector((state) => state.syncState.directories);

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
			<Box sx={{ overflow: 'auto' }}>
				<TreeView
					aria-label="Sidebar"
					defaultExpanded={['directory-all']}
					defaultSelected={'feed'}
					defaultCollapseIcon={<ArrowDropDownIcon />}
					defaultExpandIcon={<ArrowRightIcon />}
					defaultEndIcon={<div style={{ width: 24 }} />}
					sx={{ flexGrow: 1, maxWidth: width, overflowY: 'auto', userSelect: 'none' }}
					onNodeSelect={(event: React.SyntheticEvent, nodeIds: string) => {
						if (!nodeIds.startsWith('directory-')) { onNodeSelect(nodeIds) }
					}}
				>
					<StyledTreeItem nodeId="feed" labelText="Feed" labelIcon={Newspaper} />
					<StyledTreeItem nodeId="discover" labelText="Discover" labelIcon={Discover} />

					{
						directories.map((directory, _idx) => {
							return <StyledTreeItem
								nodeId={`directory-${directory.name}`}
								labelText={directory.name}
								labelIcon={Label}
								key={`directory-${directory.name}`}
							/>
						})

						// TODO: Add sources here with removal icon.
					}
				</TreeView>
			</Box>
		</Drawer>
	)
}

export default Sidebar