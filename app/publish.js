// Publish to gh-page branch

const ghpages = require('gh-pages');
const Path = require('path');

const DIST = Path.join(__dirname, '../', 'dist');

ghpages.publish(DIST, function(err) {
	if(err){
		console.log(err)
	}
});