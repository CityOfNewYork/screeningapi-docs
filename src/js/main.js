import requestForm from './modules/submission.js'
import swagger from './modules/swagger.js'

window.$ = window.jQuery = require('jquery');

if ((window.location.pathname.indexOf('endpoints') >= 0)) {
  swagger();
}
if ((window.location.pathname.indexOf('form') >= 0)) {
  requestForm();
}

/* Tables */
$('table').each(function(i){
  $(this).before('<div class="request-table-'+ i + '">')
  $('.request-table-'+ i).prepend('<div class="table"></div>')
  $('.request-table-'+ i).find('.table').prepend(this)
})

/****************************/
/* Generate json from form */
$('.generate-json').on('click', function(event){
  event.preventDefault();
  var formdata=$('.screener-form');
  
  var finalObj = {
    "commands" : []
  };
  
  /*************/
  /* HOUSEHOLD */
  var householdObj = {
    "insert" : {
      "object": {}
    }
  };

  householdObj['insert']['object']['accessnyc.request.Household'] = formdata.find('[household]').serializeArray().reduce((obj, item) => (obj[item.name] = item.value, obj) ,{})
  /*************/

  /***********/
  /* PERSON */
  var personObj = {
    "insert" : {
      "object": {}
    }
  };

  personObj['insert']['object']['accessnyc.request.Person'] = formdata.find('[person]').serializeArray().reduce((obj, item) => (obj[item.name] = item.value, obj) ,{})

  /* Incomes */
  var formIncomes = formdata.find('[person-incomes]').serializeArray()
  var incomesArr = [];
  var incomesObj = {};
  var numIncomes = formIncomes.length / 3;
  var index = 0;
  var subset;

  for (var i = 0; i < numIncomes; i++) { 
    incomesObj = {};
    subset = formIncomes.slice(index, index+3)
    subset.forEach(function(key){
      incomesObj[key.name] = key.value
    })
    incomesArr.push(incomesObj)

    index = index + 3;
  }

  personObj['insert']['object']['accessnyc.request.Person']['incomes'] = incomesArr;

  /***********/
  /* Expenses */
  var formExpenses = formdata.find('[person-expenses]').serializeArray()
  var expensesArr = [];
  var expensesObj = {};
  var numExpenses = formExpenses.length / 3;
  index = 0;

  for (var i = 0; i < numExpenses; i++) { 
    expensesObj = {};
    subset = formExpenses.slice(index, index+3)
    subset.forEach(function(key){
      expensesObj[key.name] = key.value
    })
    expensesArr.push(expensesObj)

    index = index + 3;
  }

  personObj['insert']['object']['accessnyc.request.Person']['expenses'] = expensesArr;

  /*generate the final object*/
  finalObj['commands'].push(householdObj);
  finalObj['commands'].push(personObj);

  $('.screener-form').hide();
  $('.screener-json').find('pre').remove();
  $('.screener-json').prepend('<pre><code>' + JSON.stringify(finalObj, undefined, 2) + '</code></pre>');
  $('.screener-json').show();
})

$('.generate-form').on('click', function(event){
  event.preventDefault();
  $('.screener-json').hide();
  $('.screener-form').show();
})

