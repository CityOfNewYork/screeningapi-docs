/** 
 * Converts form to JSON
 */

import responses from './responses.json';

export default function() {

  $('.screener-form').fadeIn(2500)

  var incomesContainer = $('.incomes').clone();
  var expensesContainer = $('.expenses').clone();

  $('.incomes').remove();
  $('.expenses').remove();

  var personContainer = $('.person-data:first').clone();

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

    if (hasErrors["errors"] > 0 ) {
      $('.error-msg').removeClass('hidden');
    }else {
      $('.error-msg').addClass('hidden');
      $('.error').removeClass('error');
      $('.screener-form').hide();
      $('.screener-json').find('pre').remove();
      $('.screener-json').prepend('<pre class="block"><code class="code">' + JSON.stringify([finalObj], undefined, 2) + '</code></pre>');
      $('.screener-json').removeClass('hidden');
    }
    if (hasErrors["warnings"] > 0 ) {
      $('.warning-msg').removeClass('hidden');
    }else {
      $('.warning-msg').addClass('hidden');
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
      personContainer.find('.lease').removeClass('hidden');
    } else {
      $('.livingRentalType').addClass('hidden');
      $('.lease').addClass('hidden');
    }
    if($(this).val() == 'livingOwner'){
      $('.deed').removeClass('hidden');
      personContainer.find('.deed').removeClass('hidden');
    } else {
      $('.deed').addClass('hidden');
    }
  })

  /* Head of household */
  $(document).on('change','[name=headOfHousehold]', function(event) {
    event.preventDefault();
    if($(this).is(':checked')){
      $(this).parent().next().addClass('hidden');
    }else {
      $(this).parent().next().removeClass('hidden');
    }
  })

  /* Add person */
  $(document).on('click','.add-person', function(event) {
    event.preventDefault();

    $('.add-remove').find('.error').remove()

    if ($('.person-data').length > 8) {
      $(this).parent().append('<p class="error pt-2">'+responses.find(x => x["Person"])["Person"]["err_num_persons"]+'</p>')
    }else {
      personContainer.clone().insertBefore($(this).parent());
    }

    if ($('.person-data').length > 1) {
      console.log('more than 1')
      $('.remove-person').removeClass('hidden');
    }else {
      console.log('less than 1')
    }
  })

  /* Remove person */
  $(document).on('click','.remove-person', function(event) {
    event.preventDefault();

    $('.add-remove').find('.error').remove()

    if ($('.person-data').length >1) {
      $('.person-data:last').remove();
    }
    if ($('.person-data').length == 1) {
      $('.remove-person').addClass('hidden');
    }
  })

  /* INCOMES */
  $(document).on('click','.add-income', function(event) {
    event.preventDefault();
    incomesContainer.clone().insertBefore($(this).parent())
    $(this).closest('.person-data').find('.incomes:last').removeClass('hidden')
    $(this).prev('.remove-income').removeClass('hidden')
  })

  $(document).on('click','.remove-income', function(event) {
    event.preventDefault();
    $(this).closest('.person-data').find('.incomes:last').remove();
    if($(this).closest('.person-data').find('.incomes').length > 0){
      $(this).removeClass('hidden');
    } else {
      $(this).addClass('hidden');
    }
  })

  /* EXPENSES */
  $(document).on('click','.add-expense', function(event) {
    event.preventDefault();
    expensesContainer.clone().insertBefore($(this).parent())
    $(this).closest('.person-data').find('.expenses:last').removeClass('hidden')
    $(this).prev('.remove-expense').removeClass('hidden')
  })

  $(document).on('click','.remove-expense', function(event) {
    event.preventDefault();
    $(this).closest('.person-data').find('.expenses:last').remove();
    if($(this).closest('.person-data').find('.expenses').length > 0){
      $(this).removeClass('hidden');
    } else {
      $(this).addClass('hidden');
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
    var field, fieldName, groupSeleted,
    results = {"errors": 0, "warnings": 0},
    fieldsObj = form.serializeArray().reduce((obj, item) => (obj[item.name] = item.value, obj) ,{}),
    fields = form.find('[required]'),
    errNode = $('.error-msg'),
    warningNode = $('.warning-msg'),
    hhMsgObj = responses.find(x => x["Household"])["Household"],
    personMsgObj = responses.find(x => x["Person"])["Person"],
    errMsgObj = responses.find(x => x["General"])["General"]

    $('.error-msg').children().remove();
    $('.warning-msg').children().remove();    

    $('.error-msg').addClass('error')
    $('.error-msg').append('<p><strong>' + errMsgObj["error"]  + '</strong></p>')
    $('.warning-msg').append('<p><strong>' + errMsgObj["warning"] + '</strong></p>')

    /* check for empty fields */
    fields.each(function(){
      console.log('error')
      fieldName = $(this).attr('name');
      groupSeleted = Object.keys(fieldsObj).find(a =>a.includes(fieldName))? true : false;

      if( $(this).val() === "" ||
        !groupSeleted
      ) {
        $(this).addClass('error');
        results["errors"] += 1;
      } else {
        $(this).removeClass('error');
      }

      if( ($(this).val() == 'livingRenting') && 
        (form.find('[name=livingRentalType]').val() == "")
      ) {
        warningNode.append('<p>' + hhMsgObj["warning_rental_type"] + '</p>')
        results["warnings"] += 1;
      }

    });

    var numPeople = $('.person-data').length;
    if ((numPeople < 1) || (numPeople > 8)) {
      $('.error-msg').append('<p>'+ personMsgObj["err_num_persons"] + '</p>')
      results["errors"] += 1;
    }
    
    var numHeads = 0
    var householdMemberTypes = $('[name=householdMemberType]')
    for (var i = 0; i < householdMemberTypes.length; i++) {
      if (householdMemberTypes[i].value == "HeadOfHousehold") {
        numHeads += 1
      }
    }

    if (numHeads != 1) {
      $('[name=headOfHousehold]').next().addClass('error')
      $('.error-msg').append('<p>Head of Household: Exactly one person must be the head of household.</p>')
      results["errors"] += 1;
    }

    if (form.find('[name=livingType]').val() == "livingRenting" &&
      !($('[name=livingRentalOnLease]:checked').length > 0)
    ){
      warningNode.append('<p>' + personMsgObj["warning_on_lease"] + '</p>')
      results["warnings"] += 1;
    }

    if (form.find('[name=livingType]').val() == "livingOwner" &&
      !($('[name=livingRentalOnLease]:checked').length > 0)
    ){
      warningNode.append('<p>' + personMsgObj["warning_on_deed"] + '</p>')
      results["warnings"] += 1;
    }


    return results;
  }
}