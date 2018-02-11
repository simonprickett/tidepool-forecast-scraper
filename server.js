const Hapi = require('hapi');
const Inert = require('inert');

const server = new Hapi.Server();

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

server.start((err) => {
    if (err) {
        throw err;
    }

    console.log(`tidepool-forecast-scraper server running at ${server.info.uri}.`);
});