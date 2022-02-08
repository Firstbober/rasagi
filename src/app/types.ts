// Source
export interface Source {
	name: string,
	image?: string
}

// Directory
export interface Directory {
	name: string,
	sources: Array<Source>
}
