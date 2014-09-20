#CountTags
Given a URL, this app will do the following things
- Parse the entire DOM & count the number of occurences of each HTML tag.
- Find all the Classes & Ids used for each HTML tag
- Parse the CSS files that are linked by this page (Omits google fonts)
- Find all values that are assigned for property `color`, `font-size` & `font-family`

##Pre-requisites
Following components need to be installed

 * Node.js 0.11 (Use NVM)
 * MongoDB 2.6 or above

## Installation Steps

- Start by installing dependencies

    `sudo npm install`

- Make necessary amends in config.js in root file

- Fire up the application

    `npm start` OR `node --harmony index.js`

- Check in browser by going to http://localhost:portnumber


## Demo
[http://54.191.205.94/](http://54.191.205.94/)


## Contribute
I think you already know how to contribute. Fork & Pull Request