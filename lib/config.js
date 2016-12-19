var nconf = require('nconf');

nconf.argv()
	.env()
	.file({
		file: process.cwd() + '/lib/config.json'
	});

module.exports = nconf;