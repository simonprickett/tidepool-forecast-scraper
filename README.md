# tidepool-forecast-scraper

A Tidepool Forecast Scraper that grabs data from tide-forecast.com and presents it in a basic front end.

# Brief

Write a simple web scraper to help us visit the tide pools. Use any language and/or tools that you want.

Go to [https://www.tide-forecast.com/](https://www.tide-forecast.com/) to get tide forecasts for these locations:

* Half Moon Bay, California
* Huntington Beach, California
* Providence, Rhode Island
* Wrightsville Beach, North Carolina

Load the tide forecast page for each location and extract information on low tides that occur after sunrise and before sunset. Return the time and height for each daylight low tide.

# Solution Overview

TODO

# View the Finished Solution

TODO

# Installing and Running Locally

You will need the following tools installed in order to install and run this on your local machine:

* git (verify with `git --help`)
* Node.js (v.8.9.1 or higher, verify with `node --version`)
* npm (v5.0.0 or higher, verify with `npm --version`)

Clone the repo from GitHub:

```
git clone https://github.com/simonprickett/tidepool-forecast-scraper.git
cd tidepool-forecast-scraper
```

Install dependencies with npm:

```
npm install
```

Optional, set the HTTP port that you want to have the server listen on (will default to 3000 if you omit this step):

```
export PORT=8080
```

Example above shows port 8080, but you could choose any available port.

Start the server:

```
npm start
```

Access the app at `http://localhost:3000/` or `http://localhost:PORT/` if you set a different value for port and didn't use the default.
