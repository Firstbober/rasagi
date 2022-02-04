import axios from 'axios';

// Create map of all endpoint on the server.
const endpoints = {
	source: {
		info: '/api/source/info'
	}
}

// Fetcher for SWR hook and other stuff.
const fetcher = (url: string, params: any) => axios.get(url, { params: params }).then(res => res.data);


export { endpoints, fetcher };
