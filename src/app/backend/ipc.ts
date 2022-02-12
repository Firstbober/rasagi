import ipc from 'node-ipc';

ipc.config.id = 'rasagiClient';
ipc.config.retry = 1500;

ipc.connectTo('rasagiRegularActions');

export function daemonFetchSources() {
	ipc.of.rasagiRegularActions.emit('message', 'fetchSources');
}