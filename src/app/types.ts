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

export interface Item {
	title: string,
	link: string,
	description: string,
	image?: string,
	time: number,
	source: Source
}