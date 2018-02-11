const Hapi = require('hapi');
const Inert = require('inert');
const schedule = require('node-schedule');

const server = new Hapi.Server();
let currentTidePools = {};

server.connection({
    host: '0.0.0.0',
    port: 3000 || process.env.PORT
});

// Serving of static content
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

server.route({
    method: 'GET',
    path: '/api/tidepools',
    handler: (request, reply) => {
        reply(currentTidePools).code(200);
    }
})

server.start((err) => {
    if (err) {
        throw err;
    }

    console.log(`tidepool-forecast-scraper server running at ${server.info.uri}.`);
});