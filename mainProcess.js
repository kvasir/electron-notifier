'use strict';

const app = require('app');
const ipc = require('ipc');
const notifier = require('node-notifier');
const path = require('path');
const BrowserWindow = require('browser-window');
const NativeImage = require('native-image');

const badge = NativeImage.createFromPath(path.join(__dirname, 'media/dot.png'));

module.exports = options => {
	options = options || {
		badge: true,
		bounce: true,
		balloons: false,
		toasters: true,
		sound: true
	};

	function setBadge(win, badgeDataUrl, count) {
		if (process.platform === 'darwin') {
			app.dock.setBadge(count);
		} else if (process.platform === 'win32') {
			const img = NativeImage.createFromDataUrl(badgeDataUrl);

			win.setOverlayIcon(img, 'You have unread messages');
		}
	}

	function showBadge(win) {
		if (!options.badge) {
			return;
		}

		if (process.platform === 'darwin') {
			app.dock.setBadge(' ');
		} else if (process.platform === 'win32') {
			win.setOverlayIcon(badge, 'You have unread messages');
		}
	}

	function hideBadge(win) {
		if (!options.badge) {
			return;
		}

		if (process.platform === 'darwin') {
			app.dock.setBadge('');
		} else if (process.platform === 'win32') {
			win.setOverlayIcon(null, '');
		}
	}

	ipc.on('notification-shim', (e, data) => {
		const win = BrowserWindow.fromWebContents(e.sender);
		const badgeData = require('./render-badge');

		let icon;
		if (data.icon || options.icon) {
			icon = path.join(__dirname, data.icon || options.icon);
		}

		if (data.badge) {
			showBadge(win);
			//setBadge(win, data.badge, data.count);
		}

		const notification = {
			title: data.title,
			message: data.body,
			// absolute path (not balloons)
			icon,
			// Only Notification Center or Windows Toasters
			sound: options.sound && !data.silent,
			// must set it explicitly to false to be false
			wait: options.wait !== false
		};

		notifier.notify(notification, (err, response) => {
			if (err) {
				return console.error(err);
			}

			if (response.trim() === 'Activate') {
				win.focus();
				hideBadge(win);
			}
		});
	});
};
