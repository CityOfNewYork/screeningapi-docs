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

    var formdata=$('.screener-form');
    
    var finalObj = {
      household: [],
      person: []
    };
    
    var householdObj = generateHouseholdObj(formdata);
    finalObj['household'].push(householdObj);

    var personObj = {}
    $('.person-data').each(function(pi) {
      personObj = generatePersonObj(formdata, pi);
      finalObj['person'].push(personObj);
    })

    var hasErrors = validateFields(formdata);

    if (hasErrors) {
      $('.error-msg').removeClass('hidden');
    }else {
      $('.error-msg').addClass('hidden');
      $('.error').removeClass('error');
      $('.screener-form').hide();
      $('.screener-json').find('pre').remove();
      $('.screener-json').prepend('<pre class="block"><code class="code">' + JSON.stringify(finalObj, undefined, 2) + '</code></pre>');
      $('.screener-json').removeClass('hidden');
    }
  })

  /* Go back to the form */
  $('.generate-form').on('click', function(event) {
    event.preventDefault();
    $('.screener-json').addClass('hidden');
    $('.screener-form').show();
  })

  $(document).on('change','[name=livingType]', function(event) {
    event.preventDefault();
    if($(this).val() == 'livingRenting'){
      $('.livingRentalType').removeClass('hidden');
      $('.lease').removeClass('hidden');
    } else {
      $('.livingRentalType').addClass('hidden');
      $('.lease').addClass('hidden');
    }
    if($(this).val() == 'livingOwner'){
      $('.deed').removeClass('hidden');
    } else {
      $('.deed').addClass('hidden');
    }
  })

  /* Add additional persons*/
  $(document).on('click','.add-person', function(event) {
    event.preventDefault();
    personContainer.clone().insertBefore($(this).parent());

    if ($('.person-data').length > 1) {
      $('.remove-person').removeClass('hidden');
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
    var hh = form.find('[household]').serializeArray().reduce((obj, item) => (obj[item.name] = item.value, obj) ,{});
    var livingType = form.find('[name=livingType]').children();
    livingType.each(function(){
      if ($(this).val() != ""){
        if($(this).val() == livingType.parent().val()){
          hh[$(this).val()]="true";
        } else {
          hh[$(this).val()]="false";
        }
      }
    })
    delete hh['livingType'];
    return hh;
  }

  /* Generates the person object */ 
  function generatePersonObj(form, pindex) {
    var personForm = form.find('.person-data').eq(pindex);
    var person = personForm.find('[person]').serializeArray().reduce((obj, item) => (obj[item.name] = item.value, obj) ,{});
    var personType = personForm.find('[type=checkbox]').filter('[person]');
    personType.each(function(){
      if ($(this).is(':checked')){
        person[$(this).attr('name')]="true";
      }else {
        person[$(this).attr('name')]="false";
      }      
    })

    if(personForm.find('[name=headOfHouseholdRelation]').val() == 'Self'){
      person['headOfHouseholdRelation']="";
    }


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
      person['incomes'] = incomesArr;
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
      person['expenses'] = expensesArr;
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
    var fieldName, groupSeleted;
    var errors = false;
    var fieldsObj = form.serializeArray().reduce((obj, item) => (obj[item.name] = item.value, obj) ,{})
    var fields = form.find('[required]');

    $('.error-msg').children().remove();

    // check for two few or two many people
    var numPeople = $('.person-data').length
    if ((numPeople < 1) || (numPeople > 8)) {
      $('.error-msg').append('<p>Number of people: You must specify at least 1 and no more than 8 people.</p>')
      errors = true
    }

    // check for empty fields
    fields.each(function(){
      fieldName = $(this).attr('name');
      groupSeleted = Object.keys(fieldsObj).find(a =>a.includes(fieldName))? true : false;

      if( $(this).val() === "" ||
        !groupSeleted
      ) {
        $(this).addClass('error');
        errors = true;
      } else {
        $(this).removeClass('error');
      }

      if( ($(this).val() == 'livingRenting') && 
        (form.find('[name=livingRentalType]').val() == "")
      ) {
        form.find('[name=livingRentalType]').addClass('error')
        errors = true;
      }

    });

    if(($('[name=headOfHousehold]:checked').length > 1) || ($('[name=headOfHousehold]:checked').length == 0)){
      $('[name=headOfHousehold]').next().addClass('error')
      $('.error-msg').append('<p>Head of Household: Either none declared or too many declared.</p>')
      errors = true;
    }

    return errors;
  }
}