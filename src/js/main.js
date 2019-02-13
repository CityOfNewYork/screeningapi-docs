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
$('[data-js="jsonToTable"]').each((index, el) => {
  let json = $(el.dataset.jsJsonToTableJson);
  let data = JSON.parse(json.text());
  let table = $('<table />');
  let thead = $('<thead />');
  let tbody = $('<tbody />');

  for (var i = 0; i < data.length; i++) {
    let row = $('<tr />');
    let keys = Object.keys(data[i]);
    let twrap = (i === 0) ? thead : tbody;

    $(keys).each((index, key) => {
      let tcell = (i === 0) ? $('<th />') : $('<td />');
      tcell.html(data[i][key]);
      row.append(tcell);
    });

    twrap.append(row);
  }

  table.append(thead);
  table.append(tbody);

  $(el.dataset.jsJsonToTableTable).html(table);
});