'use strict';

// Require dependencies.
const Hapi = require('hapi');
const Inert = require('inert');
const osmosis = require('osmosis');

// Globals.
const server = new Hapi.Server();

// Basic way of caching scraped data.
let currentTidePools = [
    {
        city: 'Half Moon Bay',
        state: 'CA',
        lowTides: [
            {
                date: 'Saturday 10th February',
                tides: [
                    {
                        time: '3:33PM PST',
                        height: {
                            meters: -0.03,
                            feet: -0.1
                        }
                    }
                ]
            },
            {
                date: 'Sunday 11th February',
                tides: [
                    {
                        time: '10:27AM PST',
                        height: {
                            meters: -0.1,
                            feet: -0.3
                        }
                    },
                    {
                        time: '4:35PM PST',
                        height: {
                            meters: -0.1,
                            feet: -0.3
                        }
                    }
                ]
            }
        ]
    },
    {
        city: 'Huntington Beach',
        state: 'CA',
        lowTides: [
            {
                date: 'Saturday 10th February',
                tides: [
                    {
                        time: '3:33PM EST',
                        height: {
                            meters: -0.03,
                            feet: -0.1
                        }
                    }
                ]
            }
        ]
    },
    {
        city: 'Providence',
        state: 'RI',
        lowTides: [
        ]
    },
    {
        city: 'Wrightsville Beach',
        state: 'NC',
        lowTides: [
            {
                date: 'Saturday 10th February',
                tides: [
                    {
                        time: '3:33PM EST',
                        height: {
                            meters: -0.03,
                            feet: -0.1
                        }
                    }
                ]
            },
            {
                date: 'Sunday 11th February',
                tides: [
                ]
            }
        ]
    }    
];

// Scrape tide pool data for a specific location
function scrapeData(location) {
    return new Promise((resolve, reject) => {
        console.log(`Scraping data for ${location.city}, ${location.state}.`);
        osmosis
            .get(`https://www.tide-forecast.com/locations/${location.tideForecastKeyName}/tides/latest`)
            .find('.tide-events table')
            .find('tr')
            .set({
                date: 'td[0]',
                time: 'td[1]',
                timezone: 'td[2]',
                meters: 'td[3]',
                feet: 'td[4]',
                tide: 'td[5]'
            })
            .data((data) => {
                // TODO filter for low tides between sunrise and sunset...
                console.log(data);
                // TODO return the right thing...
                resolve(location.city);
            });
    });
}

// Load/re-load tide pool data
async function refreshTidePoolData() {
    console.log('Refreshing tide pool data...');

    const locationsToScrape = require('./locations.json');
    const scrapePromises = locationsToScrape.map(scrapeData);

    const results = await Promise.all(scrapePromises);

    console.log('Tide pool data refreshed.');
    console.log(JSON.stringify(results));
}

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

// Start up the server and listen on the configured port.
server.start((err) => {
    if (err) {
        throw err;
    }

    console.log(`tidepool-forecast-scraper server running at ${server.info.uri}.`);

    // This will take a short while to load data, but if user loads page too fast, front
    // end will render gracefully anyway.
    refreshTidePoolData();

    // Start up scheduled data refresh.
    setInterval(refreshTidePoolData, 10000);
});