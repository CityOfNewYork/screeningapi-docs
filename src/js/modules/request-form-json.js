/** 
 * Converts form to JSON
 */

export default function() {

  var personContainer = $('.person-data:first').clone()

  /* Generate the entire JSON */
  $('.generate-json').on('click', function(event){
    event.preventDefault();

    var formdata=$('.screener-form');
    
    var finalObj = {
      "commands" : []
    };
    
    var householdObj = generateHouseholdObj(formdata);
    finalObj['commands'].push(householdObj);

    var personObj = {}
    $('.person-data').each(function(pi) {
      personObj = generatePersonObj(formdata, pi);
      finalObj['commands'].push(personObj);
    })

    $('.screener-form').hide();
    $('.screener-json').find('pre').remove();
    $('.screener-json').prepend('<pre><code class="code">' + JSON.stringify(finalObj, undefined, 2) + '</code></pre>');
    $('.screener-json').show();
  })

  /* Go back to the form */
  $('.generate-form').on('click', function(event) {
    event.preventDefault();
    $('.screener-json').hide();
    $('.screener-form').show();
  })

  /* Add additional persons*/
  $(document).on('click','.add-person', function(event) {
    event.preventDefault();
    personContainer.clone().insertBefore(this);
  })

  /* Add additional incomes*/
  $(document).on('click','.add-income', function(event) {
    event.preventDefault();
    var incomesContainer = $('<div class="incomes"><label>incomes</label><input type="text" name="amount" placeholder="200" person-incomes><input type="text" name="type" placeholder="Veteran" person-incomes><input type="text" name="frequency" placeholder="monthly" person-incomes></div>');
    incomesContainer.insertBefore(this)

  })

  /* Add additional expenses*/
  $(document).on('click','.add-expense', function(event) {
    event.preventDefault();
    var expensesContainer = $('<div class="expenses"><label>expenses</label><input type="text" name="amount" placeholder="50" person-expenses><input type="text" name="type" placeholder="Medical" person-expenses><input type="text" name="frequency" placeholder="weekly" person-expenses></div>');
    expensesContainer.clone().insertBefore(this);
  })

  /* Generates the household object */ 
  function generateHouseholdObj(form){
    var hh = {
      "insert" : {
        "object": {}
      }
    };

    hh['insert']['object']['accessnyc.request.Household'] = form.find('[household]').serializeArray().reduce((obj, item) => (obj[item.name] = item.value, obj) ,{});

    return hh;
  }

  /* Generates the person object */ 
  function generatePersonObj(form, pindex) {
    var personForm = form.find('.person-data').eq(pindex);

    var person = {
      "insert" : {
        "object": {}
      }
    };

    person['insert']['object']['accessnyc.request.Person'] = personForm.find('[person]').serializeArray().reduce((obj, item) => (obj[item.name] = item.value, obj) ,{});

    /* Incomes */
    var formIncomes = personForm.find('[person-incomes]').serializeArray();
    var incomesArr = [];
    var incomesObj = {};
    var numIncomes = formIncomes.length / 3;
    var index = 0;
    var subset;

    for (var i = 0; i < numIncomes; i++) { 
      incomesObj = {};
      subset = formIncomes.slice(index, index+3);
      subset.forEach(function(key){
        incomesObj[key.name] = key.value;
      })
      incomesArr.push(incomesObj);

      index = index + 3;
    }

    if(incomesArr.length > 0){
      person['insert']['object']['accessnyc.request.Person']['incomes'] = incomesArr;
    }

    /* Expenses */
    var formExpenses = personForm.find('[person-expenses]').serializeArray();
    var expensesArr = [];
    var expensesObj = {};
    var numExpenses = formExpenses.length / 3;
    index = 0;

    for (var i = 0; i < numExpenses; i++) { 
      expensesObj = {};
      subset = formExpenses.slice(index, index+3);
      subset.forEach(function(key){
        expensesObj[key.name] = key.value;
      })

      expensesArr.push(expensesObj);

      index = index + 3;
    }

    if(expensesArr.length > 0) {
      person['insert']['object']['accessnyc.request.Person']['expenses'] = expensesArr;
    }

    return person;
  }

  /* Copy the JSON object to the clipboard */
  $(document).on('click','.copy-obj', function(event) {
    event.preventDefault();

    var range = document.createRange();
    range.selectNode(document.getElementsByClassName("code")[0]);
    window.getSelection().removeAllRanges();
    window.getSelection().addRange(range);
    document.execCommand("copy");

    $(this).text('Copied!');
  })
}