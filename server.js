'use strict';

// Require dependencies.
const Hapi = require('hapi');
const Inert = require('inert');
const schedule = require('node-schedule');

// Globals.
const server = new Hapi.Server();
// Basic way of caching scraped data.
let currentTidePools = [];

// Configure server to listen on all IP addresses for this machine, and configured port number.
server.connection({
    host: '0.0.0.0',
    port: 3000 || process.env.PORT
});

// Serving of static content via Inert.
server.register(Inert, () => {});

server.route({
	method: 'GET',
	path: '/{param*}',
	handler: {
		directory: {
			path: 'static',
			redirectToSlash: true,
			index: true
		}
	}
});

// API route for front end clients to get tide pool data.
server.route({
    method: 'GET',
    path: '/api/tidepools',
    handler: (request, reply) => {
        // Return whatever the current cached tide pool data is.
        reply({ tidePools: currentTidePools }).code(200);
    }
})

// TODO load tidepool data before starting server...

// Start up the server and listen on the configured port.
server.start((err) => {
    if (err) {
        throw err;
    }

    console.log(`tidepool-forecast-scraper server running at ${server.info.uri}.`);
});