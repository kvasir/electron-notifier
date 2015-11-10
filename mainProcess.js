'use strict';

const ipc = require('ipc');
const notifier = require('node-notifier');
const path = require('path');
const BrowserWindow = require('browser-window');

module.exports = options => {
	options = options || {};

	ipc.on('notification-shim', (e, data) => {
		const win = BrowserWindow.fromWebContents(e.sender);

		let icon;
		if (data.icon || options.icon) {
			icon = path.join(__dirname, data.icon || options.icon);
		}

		const notification = {
			title: data.title,
			message: data.body,
			icon, // absolute path (not balloons)
			sound: options.sound && !data.silent, // Only Notification Center or Windows Toasters
			wait: options.wait !== false // must set it explicitly to false to be false
		};

		notifier.notify(notification, (err, response) => {
			if (err) {
				return console.error(err);
			}

			if (response.trim() === 'Activate') {
				win.focus();
			}
		});
	});
};
