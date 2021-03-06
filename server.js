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

        const thisCityTides = {
            city: location.city,
            state: location.state,
            lowTides: []
        };

        osmosis
            .get(`https://www.tide-forecast.com/locations/${location.tideForecastKeyName}/tides/latest`)
            .find('.tide-events table')
            .find('tr')
            .set({
                date: 'td[@class="date"]',
                time: 'td[@class="time tide"]',
                timezone: 'td[@class="time-zone"]',
                meters: 'td[@class="level metric"]',
                feet: 'td[@class="level"]',
                tide: 'td[@class="tide"]',
                phase: 'td[6]'
            })
            .data((data) => {
                // TODO filter for low tides between sunrise and sunset...
                // YOU NEED TO CHECK FOR DATE BEFORE FILTERING!!
                console.log(`RAW --> ${location.city} --> ${JSON.stringify(data)}`);
                if ((data.tide) && (data.tide === 'Low Tide')) {
                    console.log(`LOW --> ${location.city} --> ${JSON.stringify(data)}`);
                    // Check if we have tides for this day already?
                    let appendedToExistingDay = false;

                    for (const tideDay of thisCityTides.lowTides) {
                        if (tideDay.date === data.date) {
                            // We have low tides for this date already, so append this newly found one.
                            tideDay.tides.push({
                                time: data.time,
                                height: {
                                    meters: data.meters,
                                    feet: data.feet
                                }
                            });

                            appendedToExistingDay = true;
                        }
                    }

                    if (! appendedToExistingDay) {
                        // We did not have low tides for this data already, so create a new object for this newly found one.
                        const newTideDay = {
                            date: data.date,
                            tides: []
                        };

                        newTideDay.tides.push({
                            time: data.time,
                            height: {
                                meters: data.meters,
                                feet: data.feet
                            }
                        });

                        thisCityTides.lowTides.push(newTideDay);
                    }
                }
            })
            .done(() => {
                console.log(`All done for ${location.city}`);
                resolve(thisCityTides);
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
    //setInterval(refreshTidePoolData, 10000);
});