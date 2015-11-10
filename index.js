'use strict';

module.exports = {
	mainProcess: options => require('./mainProcess')(options),
	webPage: () => require('./webPage')()
};
