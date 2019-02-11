import requestForm from './modules/submission.js'
import swagger from './modules/swagger.js'
import requestFormJSON from './modules/request-form-json.js'

window.$ = window.jQuery = require('jquery');

if ((window.location.pathname.indexOf('endpoints') >= 0)) {
  swagger();
}
if ((window.location.pathname.indexOf('form') >= 0)) {
  requestForm();
}
if ((window.location.pathname.indexOf('request-builder') >= 0)) {
  requestFormJSON();
}

/* Tables */
$('table').each(function(i){
  $(this).before('<div class="request-table-'+ i + '">')
  $('.request-table-'+ i).prepend('<div class="table"></div>')
  $('.request-table-'+ i).find('.table').prepend(this)
})
