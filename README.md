# At Stop #

A hybrid mobile app that provides information about when the next bus will arrive at your stop. The app uses the [Transitland](http://transit.land) and Mapzen Search APIs to get the scheduled arrival of the transit service serving a particular stop. The app is built on top of [Ionic Framework](http://ionicframework.com/).

Comments/contributions are welcome.


### Setting up the project ###
* install [NodeJS](https://nodejs.org/en/) and the [ionic CLI] (http://ionicframework.com/getting-started/)

Optionally, run
* wget -O - https://raw.githubusercontent.com/laidig/transitland-atstop/master/setup.sh | bash
to fire off the commands below. 

* (Wait before cloning this repo)
* First, install [Ionic Framework](http://ionicframework.com/getting-started/).
* Second, start a new project using `ionic start atstop blank`.
* Then, in the project root (`cd atstop`):
  * Setup SASS running `ionic setup sass`.
  * `git init`
  * `git remote add origin PATH/TO/THIS/REPO`
  * `git fetch --all`
  * `git reset --hard origin/master`
  * `rm www/img/ionic.png www/css/style.css`
  * `mv js/config.tmpl.js  js/config.js`
  * `npm install` to grab dependencies defined in package.json.
  * `bower install` to grab dependencies defined in bower.json (yes, we know).
  * Get a Mapzen Search API key. Go [here](https://mapzen.com/developers/) to request one.
  * Insert your key(s) into the `API_KEY` field of `config.js`.
  * Set the API end point via the `API_END_POINT` constant in the same file (e.g. `http://search.mapzen.com/v1/`)
  * run `gulp sass && gulp compress` to generate CSS from SCSS and generate the scripts.js.

### Running
* Use the `ionic serve` function of [Ionic Framework](http://ionicframework.com/docs/guide/testing.html)
* In order to build the native mobile app, use `ionic build [platform]`

### Testing

We are using [ng-describe](https://github.com/kensho/ng-describe). 

* First, install:
  * `sudo npm install -g karma-cli`
(If this fails on Linux with a node-gyp error, you may need to install the build-essential package)

* Default Karma Config (`karma.conf.js`) file located in the root directory of the project
* Run `karma start`
* To open the coverage report page in the browser, run `open coverage/Chrome<...>/index.html`

### Building via Cordova
* running `ionic state restore` will pick up plugins and platforms necessary to build via Cordova
 Note: If building for iOS9, you may need to update the [App Transport Security](http://ste.vn/2015/06/10/configuring-app-transport-security-ios-9-osx-10-11/) parameters.

### Project License ###
The project uses the [Apache License, version 2.0](http://opensource.org/licenses/Apache-2.0).
