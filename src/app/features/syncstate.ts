import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { Directory } from "../types";

interface SyncStateInitial {
	syncID: string | null,
	directories: Array<Directory>
}

export const syncStateSlice = createSlice({
	name: 'syncState',
	initialState: {
		syncID: null,
		directories: []
	} as SyncStateInitial,
	reducers: {
		updateSyncID: (state, action: PayloadAction<string>) => {
			state.syncID = action.payload;
		},

		updateDirectories: (state, action: PayloadAction<Array<Directory>>) => {
			localStorage.setItem('sync-directories', JSON.stringify(action.payload));
			state.directories = action.payload;
		}
	}
})

export const { updateSyncID, updateDirectories } = syncStateSlice.actions
export default syncStateSlice.reducer