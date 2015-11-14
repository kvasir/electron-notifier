'use strict';

const ipc = require('ipc');
const renderBadge = require('./render-badge');

let notificationCounter = 0;

module.exports = () => {
	//require('electron-notification-shim')();
	const OldNotification = Notification;

	Notification = function (title, options) {
		// Send this to main thread.
		// Catch it in your main 'app' instance with `ipc.on`.
		// Then send it back to the view, if you want, with `event.returnValue` or `event.sender.send()`.
		notificationCounter++;
		let opts = {
			body: '',
			data: null,
			dir: 'auto',
			icon: '',
			lang: '',
			onclick: null,
			onclose: null,
			onerror: null,
			onshow: null,
			silent: false,
			tag: '',
			title,
			badge: renderBadge(notificationCounter.toString()),
			count: notificationCounter
		};

		// Send the native Notification.
		// You can't catch it, that's why we're doing all of this. :)
		console.log('innan', opts);
		opts = Object.assign(opts, options);

		ipc.send('notification-shim', opts);

		console.log('efter', opts);
		return opts;
		//return new OldNotification(title, options);
	};

	Notification.prototype = OldNotification.prototype;
	Notification.permission = OldNotification.permission;
	Notification.requestPermission = OldNotification.requestPermission;

	ipc.on('reset-notifications', () => notificationCounter = 0);
};
