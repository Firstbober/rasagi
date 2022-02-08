import { createSlice, PayloadAction } from "@reduxjs/toolkit";

// Source similar to the one on the server.
interface Source {
	name: string,
	image?: string
}

// Directory similar to the one on the server.
interface Directory {
	name: string,
	sources: Array<Source>
}

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
			state.directories = action.payload;
		}
	}
})

export const { updateSyncID, updateDirectories } = syncStateSlice.actions
export default syncStateSlice.reducer