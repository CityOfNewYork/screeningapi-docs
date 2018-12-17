// Serving

const Express = require('express');
const Path = require('path');

const APP = new Express();
const PORT = 3000;

const DIST = Path.join(__dirname, '../', 'dist');
const VIEWS = Path.join(__dirname, '../', 'src/views');

APP.use(Express.static(DIST));

APP.listen(PORT, () => console.log(`Listening on port ${PORT}!`));