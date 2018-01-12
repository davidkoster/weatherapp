# Weather App

Weather App built in javascript as a personal project to work on my front-end skills. The idea was to have a visually pleasing and interactive UI to effectively display the weather.

There is currently no databse to store information such as cities and log in infomation, however I plan on doing this at some stage in the future.

## Getting Started

These instructions will get you a copy of the project up and running on your local machine for development and testing purposes. See deployment for notes on how to deploy the project on a live system.

### Prerequisites

The application requires jQuery, jQuery AlterClass plugin and Luxon.js to run.

The APIs being used are:
  - Google Maps Places for autocomplete of the city search field.
  - Open weather Maps API for all the weather data.
  
The App is using node to watch and compile all SASS to CSS.
The App is also runs using node live-server and npm to for package management.

To load all dev dependencies simply navigate to the project folder and run

```
npm install
```

Now run

```
npm run start
```

to start live server and the SASS compiler

## Authors

* **David Koster** - *Initial work* - [TumblingMidget](https://github.com/tumblingmidget)


## Acknowledgments

* Thanks to Pete Boere for the jQuery alterClass plugin - (https://gist.github.com/peteboere/1517285)
