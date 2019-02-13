/** 
 * Converts form to JSON
 */

export default function() {

  var personContainer = $('.person-data:first').clone();
  var incomesContainer = $('.incomes').clone();
  var expensesContainer = $('.expenses').clone();

  /* Generate the entire JSON */
  $('.generate-json').on('click', function(event){
    event.preventDefault();
    $('.error-msg').remove();

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

    var hasErrors = validateFields(formdata);

    if (hasErrors) {
      formdata.append('<p class="error-msg">Please resolve the errors and try again.</p>');
    }else {
      $('.error-msg').remove();
      $('.screener-form').hide();
      $('.screener-json').find('pre').remove();
      $('.screener-json').prepend('<pre><code class="code">' + JSON.stringify(finalObj, undefined, 2) + '</code></pre>');
      $('.screener-json').show();
    }
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
    personContainer.clone().insertBefore($(this).parent());

    if ($('.person-data').length > 1) {
      $('.remove-person').show();
    }
  })

  /* Remove person*/
  $(document).on('click','.remove-person', function(event) {
    event.preventDefault();
    if ($('.person-data').length >1) {
      $('.person-data:last').remove();
    }
    if ($('.person-data').length == 1) {
      $(this).hide();
    }
  })

  /* Add additional incomes*/
  $(document).on('click','.add-income', function(event) {
    event.preventDefault();
    incomesContainer.clone().insertBefore($(this).parent())
    if($('.incomes').length > 0){
      $('.remove-income').show();
    }
  })

  $(document).on('click','.remove-income', function(event) {
    event.preventDefault();
    $('.incomes:last').remove();
    if($('.incomes').length == 0){
      $('.remove-income').hide();
    }
  })

  /* Add additional expenses*/
  $(document).on('click','.add-expense', function(event) {
    event.preventDefault();
    expensesContainer.clone().insertBefore($(this).parent());
    if($('.expenses').length > 0){
      $('.remove-expense').show();
    }
  })

  $(document).on('click','.remove-expense', function(event) {
    event.preventDefault();
    $('.expenses:last').remove();
    if($('.expenses').length == 0){
      $('.remove-expense').hide();
    }
  })

  /* Generates the household object */ 
  function generateHouseholdObj(form){
    var hh = {
      "insert" : {
        "object": {}
      }
    };

    hh['insert']['object']['accessnyc.request.Household'] = form.find('[household]').serializeArray().reduce((obj, item) => (obj[item.name] = item.value, obj) ,{});

    var fields = form.find('[household]')

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

  /* Validate the form */
  function validateFields(form) {
    var field, fieldName, groupSeleted;
    var errors = false;
    var fieldsObj = form.serializeArray().reduce((obj, item) => (obj[item.name] = item.value, obj) ,{})
    var fields = form.find('[required]');

    fields.each(function(){
      fieldName = $(this).attr('name');
      groupSeleted = Object.keys(fieldsObj).find(a =>a.includes(fieldName))? true : false;

      if( $(this).val() === "" ||
        !groupSeleted
      ) {
        $(this).addClass('error');
        if($(this).attr('type') == 'radio'){
          $(this).next().addClass('error');
        }
        errors = true;
      } else {
        $(this).removeClass('error');
        if($(this).attr('type') == 'radio'){
          $(this).next().removeClass('error');
        }
      }
    });
    return errors;
  }
}