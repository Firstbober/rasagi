import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { Directory, Source } from "../types";

interface SyncStateInitial {
	syncID: string | null,
	directories: Array<Directory>,
	theme: 'light' | 'dark'
}

export const syncStateSlice = createSlice({
	name: 'syncState',
	initialState: {
		syncID: null,
		directories: [],
		theme: 'light'
	} as SyncStateInitial,
	reducers: {
		updateSyncID: (state, action: PayloadAction<string>) => {
			state.syncID = action.payload;
		},

		updateDirectories: (state, action: PayloadAction<Array<Directory>>) => {
			localStorage.setItem('sync-directories', JSON.stringify(action.payload));
			state.directories = action.payload;
		},

		addSourceToDirectory: (state, action: PayloadAction<[string, Source]>) => {
			for (const dir of state.directories) {
				if (dir.name == action.payload[0]) {
					dir.sources.push(action.payload[1]);
				}
			}

			localStorage.setItem('sync-directories', JSON.stringify(state.directories));
		},

		removeSourceFromDirectory: (state, action: PayloadAction<[string, string]>) => {
			for (const dir of state.directories) {
				if (dir.name == action.payload[0]) {
					dir.sources = dir.sources.filter((value) => {
						if (value.name != action.payload[1]) return value;
					})
				}
			}

			localStorage.setItem('sync-directories', JSON.stringify(state.directories));
		},

		setTheme: (state, action: PayloadAction<'light' | 'dark'>) => {
			localStorage.setItem('theme', action.payload);
			state.theme = action.payload;
		}
	}
})

export const {
	updateSyncID,
	updateDirectories,
	addSourceToDirectory,
	removeSourceFromDirectory,
	setTheme
} = syncStateSlice.actions
export default syncStateSlice.reducer