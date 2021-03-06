import axios from 'axios';

// Create map of all endpoint on the server.
const endpoints = {
	source: {
		info: '/api/source/info'
	},
	sync: {
		check_id: '/api/sync/check_id',

		get_id: '/api/get_id',
		get_directories: '/api/sync/get_directories',

		add_source: '/api/sync/add_source',
		del_source: '/api/sync/del_source',

		get_items: '/api/sync/get_items'
	}
}

// Fetcher for SWR hook and other stuff.
const fetcher = (url: string, params: any) => axios.get(url, { params: params }).then(res => res.data);
const fetcherAuth = (url: string, params: any, syncID: string) => axios.get(url, {
	params: params,
	headers: { 'Authorization': `Bearer ${syncID}` }
}).then(res => res.data);


export { endpoints, fetcher, fetcherAuth };
