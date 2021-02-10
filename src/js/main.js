import './modules/polyfill-remove';

<<<<<<< HEAD
import requestForm from './modules/submission.js';
import swagger from './modules/swagger.js';
import bulkSubmission from './modules/bulk-submission.js';
import changePassword from './modules/change-password.js';
import requestFormJSON from './modules/request-form-json.js';
=======
import requestForm from './modules/submission.js'
import swagger from './modules/swagger.js'
import bulkSubmission from './modules/bulk-submission.js'
import changePassword from './modules/change-password.js'
import requestFormJSON from './modules/request-form-json.js'
>>>>>>> fc3eb4b... Modified implementation from CommonJS to ECMAScript
import Icons from '@nycopportunity/pttrn-scripts/src/icons/icons';
import Toggle from '@nycopportunity/pttrn-scripts/src/toggle/toggle';
import Track from '@nycopportunity/pttrn-scripts/src/track/track';

var cdn = (process.env.NODE_ENV === 'production') ?
  'https://raw.githubusercontent.com/CityOfNewYork/screeningapi-docs/content/' :
  'https://raw.githubusercontent.com/CityOfNewYork/screeningapi-docs/env/development-content/';

new Icons('svg/icons.svg');
new Toggle();
new Track();

<<<<<<< HEAD
=======
window.$ = window.jQuery = require('jquery');
>>>>>>> fc3eb4b... Modified implementation from CommonJS to ECMAScript
if ((window.location.pathname.indexOf('endpoints') >= 0))
  swagger(cdn);

if ((window.location.pathname.indexOf('form') >= 0))
  requestForm();

if ((window.location.pathname.indexOf('request-builder') >= 0))
  requestFormJSON();

if ((window.location.pathname.indexOf('bulk-submission') >= 0))
  bulkSubmission();

if ((window.location.pathname.indexOf('change-password') >= 0))
  changePassword();

/* Get the content markdown from CDN and append */
let markdowns = $('body').find('[id^="markdown"]');

markdowns.each(function() {
  let target = $(this);
  let file = $(this).attr('id').replace('markdown-', '');

  $.get(cdn + file + '.md', function(data) {
    let converter = new showdown.Converter({tables: true});
    let html      = converter.makeHtml(data);

    target.append(html)
      .hide()
      .fadeIn(250)

  }, 'text')
});
