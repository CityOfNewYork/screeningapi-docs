(function () {
  'use strict';

  (function(arr) {
    arr.forEach(function(item) {
      if (item.hasOwnProperty('remove')) {
        return;
      }
      Object.defineProperty(item, 'remove', {
        configurable: true,
        enumerable: true,
        writable: true,
        value: function remove() {
          if (this.parentNode !== null)
            this.parentNode.removeChild(this);
        }
      });
    });
  })([
    Element.prototype,
    CharacterData.prototype,
    DocumentType.prototype
  ]);

  var responses = [
    {
      "EMAIL": "Please enter a valid email."
    },
    {
      "FNAME": "Please enter your first name."
    },
    {
      "LNAME": "Please enter your last name."
    },
    {
      "ORG": "Please enter your organization."
    },
    {
      "ERR": "There was a problem with your request. Please try again later or send us a message at <a class=\"text-primary-red\" href=\"mailto:eligibilityapi@nycopportunity.nyc.gov\">eligibilityapi@nycopportunity.nyc.gov</a>. We will get back to you as soon as possible!"
    },
    {
      "ERR_ALREADY_REQUESTED": "You have already made a request. If you have not heard back from us, please send us a message at <a class=\"text-primary-red\" href=\"mailto:eligibilityapi@nycopportunity.nyc.gov\">eligibilityapi@nycopportunity.nyc.gov</a>. We will get back to you as soon as possible!"
    },
    {
      "ERR_TOO_MANY_REQUESTS": "It seems that you have made too many requests. Please try again later or send us a message at <a class=\"text-primary-red\" href=\"mailto:eligibilityapi@nycopportunity.nyc.gov\">eligibilityapi@nycopportunity.nyc.gov</a>. We will get back to you as soon as possible!"
    },
    {
      "MSG_RECAPTCHA": "There's one more step!"
    },
    {
      "SUCCESS": "Thank you! Your request will be reviewed with confirmation within 1-2 business days."
    },
    {
      "General": {
        "error": "Please resolve highlighted fields.",
        "warning": "Resolving the following might generate different screening results for this household (optional):"
      }
    },
    {
      "Household": {
        "err_excess_members": "Household: The number of household members must be between 1 and 8 members.",
        "warning_rental_type": "Household: There should be a rental type."
      }
    },
    {
      "Person": {
        "err_num_persons": "Person: The number of persons cannot exceed 8 members",
        "err_hoh": "Person: Exactly one person must be the head of household.",
        "warning_on_lease": "Person: At least one person should be on the lease.",
        "warning_on_deed": "Person: At least one person should be on the deed."
      }
    }
  ];

  function requestForm() {
    const errorMsg = 'Please enter your first name, last name, email and organization.';

    /**
    * Validate form fields
    * @param {object} formData - form fields
    * @param {object} event - event object
    */
    function validateFields(form, event) {
      event.preventDefault();

      const fields = form.serializeArray().reduce((obj, item) => (obj[item.name] = item.value, obj) ,{});
      const requiredFields = form.find('[required]');
      const emailRegex = new RegExp(/\S+@\S+\.\S+/);
      let hasErrors = false;

      // loop through each required field
      requiredFields.each(function() {
        const fieldName = $(this).attr('name');

        if( !fields[fieldName] ||
          (fieldName == 'EMAIL' && !emailRegex.test(fields.EMAIL)) ) {
          hasErrors = true;
          $(this).addClass('is-error');
          $(this).addClass('border-primary-red');
          $(this).before('<p class="is-error text-primary-red text-small my-0">'+ responses.find(x => x[fieldName])[fieldName] + '</p>');
        } else {
          $(this).removeClass('border-primary-red');
        }
      });

      // if there are no errors, submit
      if (hasErrors) {
        form.find('.form-error').html(`<p>${errorMsg}</p>`);
      } else {
        submitSignup(form, fields);
      }
    }

    /**
    * Submits the form object to Mailchimp
    * @param {object} formData - form fields
    */
    function submitSignup(form, formData){
      $.ajax({
        url: form.attr('action'),
        type: form.attr('method'),
        dataType: 'json',//no jsonp
        cache: false,
        data: formData,
        contentType: "application/json; charset=utf-8",
        success: function(response) {
          if(response.result !== 'success'){
              if(response.msg.includes('already subscribed')){
                form.html('<p class="text-primary-red text-center italic">'+ responses.find(x => x["ERR_ALREADY_REQUESTED"])["ERR_ALREADY_REQUESTED"] + '</p>');
              } else if(response.msg.includes('too many recent signup requests')){
                form.html('<p class="text-primary-red text-center italic">'+ responses.find(x => x["ERR_TOO_MANY_REQUESTS"])["ERR_TOO_MANY_REQUESTS"] +'</p>');
              } else if(response.msg.includes('captcha')){
                var url = $("form#mc-embedded-subscribe-form").attr("action");
                var parameters = $.param(response.params);
                url = url.split("-json?")[0];
                url += "?";
                url += parameters;
                window.open(url, '_blank');
                form.html('<p class="text-primary-navy text-center italic">'+ responses.find(x => x["MSG_RECAPTCHA"])["MSG_RECAPTCHA"] +'<a class="text-primary-red" target="_blank" href="' + url + '"> Please confirm that you are not a robot.</a></p>');
              }else {
                form.html('<p class="text-primary-red text-center italic">' + responses.find(x => x["ERR"])["ERR"] + '</p>');
              }
          }else {
            form.html('<p class="text-primary-navy text-center italic">'+ responses.find(x => x["SUCCESS"])["SUCCESS"] +'</p>');
          }
        },
        error: function(response) {
          console.log(response);
          form.before('<p class="text-primary-red text-center italic">' + responses.find(x => x["ERR"])["ERR"] + '</p>');
        }
      });
    }

    /**
    * Triggers form validation and sends the form data to Mailchimp
    * @param {object} formData - form fields
    */
    $('#mc-embedded-subscribe:button[type="submit"]').click(function(event){
      event.preventDefault();
      let $form = $(this).parents('form');
      validateFields($form, event);
    });

  }

  // import * as SwaggerUI from 'swagger-ui';

  function swagger(cdn) {
    // const controller = new AbortController()\
    // const SwaggerUI = require('swagger-ui');

    SwaggerUIBundle({
      dom_id: '#swagger-editor',
      url: cdn + 'endpoints.yml'
    });

    // window.editor = SwaggerEditorBundle({
    //   dom_id: '#swagger-editor',
    //   url: cdn + 'endpoints.yml'
    // });

    $('.SplitPane').css('position', 'relative');
    $('.Pane1').css('display', 'none');
    $('.Pane2').css('width', '100%');

    // generate curl command to try it out
    $('body').on('click', '.try-out__btn', function(event){
      generateCurl(this);
    });

    $('body').on('keyup', '[placeholder^=interestedPrograms]', function(event){
      generateCurl(this);
    });

    $('body').on('keyup', '[placeholder^=Authorization]', function(event){
      generateCurl(this);
    });

    $('body').on('keyup', '[class^=body-param__text]', function(event){
      generateCurl(this);
    });

    $('body').on('change', '[type^=file]', function(event){
      generateCurl(this);
    });

    // $('#swagger-editor').fadeIn(2500)

    function generateCurl(obj) {
      const domain = $('body').find('.servers :selected').text();
      const ep_id = $(obj).parents('.opblock-post:first').attr('id');
      const ep = util.format("/%s", ep_id.substr(ep_id.indexOf("_") + 1).replace("_", "/"));
      const par_node = $(obj).parents('.opblock-body:first');
      const exampleBody = par_node.find('.body-param__example');
      const textBody = exampleBody.length > 0 ? exampleBody.text() : par_node.find('.body-param__text').text();
      const params = textBody.replace(/\s/g,'');

      par_node.find('.curl').remove();
      par_node.find('.execute-wrapper').append(`<p class="curl">Use the following command to make a request to the <strong>${ep}</strong> endpoint based on the data set above:</p>`);

      const authVal = par_node.find('[placeholder^=Authorization]').val();
      const interestedProgramsVal = par_node.find('[placeholder^=interestedPrograms]').val();
      const query = interestedProgramsVal ? `?interestedPrograms=${interestedProgramsVal}` : "";
      if (ep_id.includes('Authentication')) {
        const authenticationCurl = `curl -X POST "${domain}${ep}" \
        -H  "accept: application/json" \
        -H  "Content-Type: application/json" \
        -d \'${params}\'`;
        par_node.find('.execute-wrapper').append(`<textarea readonly="" class="curl" style="white-space: normal;">${authenticationCurl}</textarea>`);
      } else if (ep_id.includes('eligibilityPrograms')){
        const eligibilityProgramsCurl = `curl -X POST "${domain}${ep}${query}" \
        -H "accept: application/json" \
        -H "Content-Type: application/json" \
        -H "Authorization: ${authVal}"\
        -d \'${params}\'`;
        par_node.find('.execute-wrapper').append(`<textarea readonly="" class="curl" style="white-space: normal;">${eligibilityProgramsCurl}</textarea>`);
      } else if (ep_id.includes('bulkSubmission')) {
        const inputPath = par_node.find('[type^=file]').val();
        const bulkSubmissionCurl = `curl -X POST "${domain}${ep}${query}" \
        -H "accept: multipart/form-data" \
        -H "Content-Type: multipart/form-data" \
        -H "Authorization: ${authVal}"\
        -F "=@${inputPath};type=text/csv"`;
        par_node.find('.execute-wrapper').append(`<textarea readonly="" class="curl" style="white-space: normal;">${bulkSubmissionCurl}</textarea>`);
      }
    }
  }

  /**
   * Utilities for Form components
   * @class
   */
  class Forms {
    /**
     * The Form constructor
     * @param  {Object} form The form DOM element
     */
    constructor(form = false) {
      this.FORM = form;

      this.strings = Forms.strings;

      this.submit = Forms.submit;

      this.classes = Forms.classes;

      this.markup = Forms.markup;

      this.selectors = Forms.selectors;

      this.attrs = Forms.attrs;

      this.FORM.setAttribute('novalidate', true);

      return this;
    }

    /**
     * Map toggled checkbox values to an input.
     * @param  {Object} event The parent click event.
     * @return {Element}      The target element.
     */
    joinValues(event) {
      if (!event.target.matches('input[type="checkbox"]'))
        return;

      if (!event.target.closest('[data-js-join-values]'))
        return;

      let el = event.target.closest('[data-js-join-values]');
      let target = document.querySelector(el.dataset.jsJoinValues);

      target.value = Array.from(
          el.querySelectorAll('input[type="checkbox"]')
        )
        .filter((e) => (e.value && e.checked))
        .map((e) => e.value)
        .join(', ');

      return target;
    }

    /**
     * A simple form validation class that uses native form validation. It will
     * add appropriate form feedback for each input that is invalid and native
     * localized browser messaging.
     *
     * See https://developer.mozilla.org/en-US/docs/Learn/HTML/Forms/Form_validation
     * See https://caniuse.com/#feat=form-validation for support
     *
     * @param  {Event}         event The form submission event
     * @return {Class/Boolean}       The form class or false if invalid
     */
    valid(event) {
      let validity = event.target.checkValidity();
      let elements = event.target.querySelectorAll(this.selectors.REQUIRED);

      for (let i = 0; i < elements.length; i++) {
        // Remove old messaging if it exists
        let el = elements[i];

        this.reset(el);

        // If this input valid, skip messaging
        if (el.validity.valid) continue;

        this.highlight(el);
      }

      return (validity) ? this : validity;
    }

    /**
     * Adds focus and blur events to inputs with required attributes
     * @param   {object}  form  Passing a form is possible, otherwise it will use
     *                          the form passed to the constructor.
     * @return  {class}         The form class
     */
    watch(form = false) {
      this.FORM = (form) ? form : this.FORM;

      let elements = this.FORM.querySelectorAll(this.selectors.REQUIRED);

      /** Watch Individual Inputs */
      for (let i = 0; i < elements.length; i++) {
        // Remove old messaging if it exists
        let el = elements[i];

        el.addEventListener('focus', () => {
          this.reset(el);
        });

        el.addEventListener('blur', () => {
          if (!el.validity.valid)
            this.highlight(el);
        });
      }

      /** Submit Event */
      this.FORM.addEventListener('submit', (event) => {
        event.preventDefault();

        if (this.valid(event) === false)
          return false;

        this.submit(event);
      });

      return this;
    }

    /**
     * Removes the validity message and classes from the message.
     * @param   {object}  el  The input element
     * @return  {class}       The form class
     */
    reset(el) {
      let container = (this.selectors.ERROR_MESSAGE_PARENT)
        ? el.closest(this.selectors.ERROR_MESSAGE_PARENT) : el.parentNode;

      let message = container.querySelector('.' + this.classes.ERROR_MESSAGE);

      // Remove old messaging if it exists
      container.classList.remove(this.classes.ERROR_CONTAINER);
      if (message) message.remove();

      // Remove error class from the form
      container.closest('form').classList.remove(this.classes.ERROR_CONTAINER);

      // Remove dynamic attributes from the input
      el.removeAttribute(this.attrs.ERROR_INPUT[0]);
      el.removeAttribute(this.attrs.ERROR_LABEL);

      return this;
    }

    /**
     * Displays a validity message to the user. It will first use any localized
     * string passed to the class for required fields missing input. If the
     * input is filled in but doesn't match the required pattern, it will use
     * a localized string set for the specific input type. If one isn't provided
     * it will use the default browser provided message.
     * @param   {object}  el  The invalid input element
     * @return  {class}       The form class
     */
    highlight(el) {
      let container = (this.selectors.ERROR_MESSAGE_PARENT)
        ? el.closest(this.selectors.ERROR_MESSAGE_PARENT) : el.parentNode;

      // Create the new error message.
      let message = document.createElement(this.markup.ERROR_MESSAGE);
      let id = `${el.getAttribute('id')}-${this.classes.ERROR_MESSAGE}`;

      // Get the error message from localized strings (if set).
      if (el.validity.valueMissing && this.strings.VALID_REQUIRED)
        message.innerHTML = this.strings.VALID_REQUIRED;
      else if (!el.validity.valid &&
        this.strings[`VALID_${el.type.toUpperCase()}_INVALID`]) {
        let stringKey = `VALID_${el.type.toUpperCase()}_INVALID`;
        message.innerHTML = this.strings[stringKey];
      } else
        message.innerHTML = el.validationMessage;

      // Set aria attributes and css classes to the message
      message.setAttribute('id', id);
      message.setAttribute(this.attrs.ERROR_MESSAGE[0],
        this.attrs.ERROR_MESSAGE[1]);
      message.classList.add(this.classes.ERROR_MESSAGE);

      // Add the error class and error message to the dom.
      container.classList.add(this.classes.ERROR_CONTAINER);
      container.insertBefore(message, container.childNodes[0]);

      // Add the error class to the form
      container.closest('form').classList.add(this.classes.ERROR_CONTAINER);

      // Add dynamic attributes to the input
      el.setAttribute(this.attrs.ERROR_INPUT[0], this.attrs.ERROR_INPUT[1]);
      el.setAttribute(this.attrs.ERROR_LABEL, id);

      return this;
    }
  }

  /**
   * A dictionairy of strings in the format.
   * {
   *   'VALID_REQUIRED': 'This is required',
   *   'VALID_{{ TYPE }}_INVALID': 'Invalid'
   * }
   */
  Forms.strings = {};

  /** Placeholder for the submit function */
  Forms.submit = function() {};

  /** Classes for various containers */
  Forms.classes = {
    'ERROR_MESSAGE': 'error-message', // error class for the validity message
    'ERROR_CONTAINER': 'error', // class for the validity message parent
    'ERROR_FORM': 'error'
  };

  /** HTML tags and markup for various elements */
  Forms.markup = {
    'ERROR_MESSAGE': 'div',
  };

  /** DOM Selectors for various elements */
  Forms.selectors = {
    'REQUIRED': '[required="true"]', // Selector for required input elements
    'ERROR_MESSAGE_PARENT': false
  };

  /** Attributes for various elements */
  Forms.attrs = {
    'ERROR_MESSAGE': ['aria-live', 'polite'], // Attribute for valid error message
    'ERROR_INPUT': ['aria-invalid', 'true'],
    'ERROR_LABEL': 'aria-describedby'
  };

  const errorBoxId = 'errors';
  const infoBoxId = 'info';

  const toTitleCase = (string) => {
    return string.charAt(0).toUpperCase() + string.slice(1);
  };

  const setTextBox = (messageString, displayState, boxId) => {
    var ele = document.getElementById(boxId);
    if (ele) {
      ele.innerHTML = '<ul class="m-0 px-2">' +
        toTitleCase(messageString.trim()) + '</ul>';

      ele.style.display = displayState;

      if (displayState === 'none') {
        ele.removeAttribute('aria-live', 'polite');
        ele.classList.remove('animated');
        ele.classList.remove('fadeInUp');
      } else {
        ele.setAttribute('aria-live', 'polite');
        ele.classList.add('animated');
        ele.classList.add('fadeInUp');
      }
    }
  };

  const sendPostRequest = (url, headersObject, responseHandler, requestPayload) => {
    setTextBox('', 'none', errorBoxId);
    setTextBox('', 'none', infoBoxId);

    document.getElementById('loader').style.display = 'block';

    var req = new XMLHttpRequest();

    req.open('POST', url, true);

    Object.keys(headersObject).forEach(function(key) {
      req.setRequestHeader(key, headersObject[key]);
    });

    req.onreadystatechange = function() {
      document.getElementById('loader').style.display = 'none';
      responseHandler(req);
    };

    req.send(requestPayload);
  };

  const displayErrors = (responseText, showPath) => {
    var errorJSON;
    var errorsArray = [];
    try {
      errorJSON = JSON.parse(responseText).errors;
      errorsArray = errorJSON.map(function(error) {
        const { elementPath, message } = error;
        const errorMsg = elementPath && showPath ?
          message + ' Element Path: ' + elementPath + '.' : message;
        return '<li>' + errorMsg + '</li>'
      });
    } catch (err) {}
    setTextBox(errorsArray.join(''), 'block', errorBoxId);
  };

  const displayInfo = (infoText) => {
    const infoHTML = '<li>' + infoText + '</li>';
    setTextBox(infoHTML, 'block', infoBoxId);
  };

  function bulkSubmission() {
    const SELECTOR = '[data-js*="bulk-submission"]';

    const filename = 'response.csv';

    const Form = new Forms(document.querySelector(SELECTOR));

    const bulkSubmissionHandler = (req) => {
      if (req.readyState === 4) {
        const status = req.status.toString();
        if (status[0] === '4' || status[0] === '5') {
          displayErrors(req.responseText, true);
        } else if (status[0] === '2') {
          displayInfo('Bulk submission successful. A CSV with program codes \
          should be downloaded automatically.');
          const blob = new Blob([req.response], {type : 'text/csv'});
          if (typeof window.navigator.msSaveBlob !== 'undefined') {
            window.navigator.msSaveBlob(blob, filename);
          } else {
            const URL = window.URL || window.webkitURL;
            const downloadUrl = URL.createObjectURL(blob);

            const a = document.createElement('a');

            if (typeof a.download === 'undefined') {
              window.location = downloadUrl;
            } else {
              a.href = downloadUrl;
              a.download = filename;
              document.body.appendChild(a);
              a.click();
            }

            setTimeout(() => {
              URL.revokeObjectURL(downloadUrl);
            }, 100);
          }
        }
      }
    };

    const sendBulkSubmissionRequest = (formValues, token) => {
      const { baseurl, username, csvFile } = formValues;
      var url = baseurl + 'bulkSubmission/import';
      if (formValues.programs) {
        var programs = formValues.programs.split(',').map(p => p.trim()).join(',');
        url = url + '?interestedPrograms=' + programs;
      }
      var headersObject = {
        'Authorization': token
      };
      var formData = new FormData();
      formData.append('file', csvFile);
      sendPostRequest(url, headersObject, bulkSubmissionHandler, formData);
    };

    const authResponseHandler = (formValues) => (req) => {
      if (req.readyState === 4) {
        const status = req.status.toString();
        if (status[0] === '4' || status[0] === '5') {
          displayErrors(req.responseText, false);
        } else if (status[0] === '2') {
          sendBulkSubmissionRequest(formValues,
            JSON.parse(req.responseText).token);
        }
      }
    };

    const submit = (event) => {
      const baseurl = event.target.action;
      const username = document.getElementById('username').value;
      const password = document.getElementById('password').value;
      const programs = document.getElementById('programs').value;
      const csvFileInput = document.getElementById('csv-upload');

      const csvFile = csvFileInput.files &&
        csvFileInput.files.length > 0 &&
        csvFileInput.files[0];

      let formValues = {
        baseurl: baseurl,
        username: username,
        password: password,
        csvFile: csvFile
      };

      if (programs !== '') formValues.programs = programs;

      var url = baseurl + 'authToken';
      var headersObject = {
        'Content-type': 'application/json',
        'Access-Control-Allow-Origin': '*'
      };

      const authPayload = { username, password };

      sendPostRequest(url, headersObject, authResponseHandler(formValues),
        JSON.stringify(authPayload));
    };

    Form.selectors.ERROR_MESSAGE_PARENT = '[data-js*="question-container"]';

    Form.watch();

    Form.submit = submit;
  }

  function changePassword() {
    const SELECTOR = '[data-js*="change-password"]';

    const Form = new Forms(document.querySelector(SELECTOR));

    const responseHandler = (req) => {
      if (req.readyState === 4) {
        const status = req.status.toString();
        if (status[0] === '4' || status[0] === '5') {
          displayErrors(req.responseText, false);
        } else if (status[0] === '2') {
          displayInfo('Password updated');
        }
      }
    };


    const submit = (event) => {
      const domain = document.getElementById('domain').value;
      const username = document.getElementById('username').value;
      const password = document.getElementById('password').value;
      const newPassword = document.getElementById('newpassword').value;

      var url = domain + 'authToken';
      var headersObject = {
        'Content-type': 'application/json',
        'Access-Control-Allow-Origin': '*'
      };

      const authPayload = { username, password, newPassword };

      sendPostRequest(url, headersObject, responseHandler,
        JSON.stringify(authPayload));
    };

    Form.selectors.ERROR_MESSAGE_PARENT = '[data-js*="question-container"]';

    Form.watch();

    Form.submit = submit;
  }

  /**
   * Converts form to JSON
   */

  function requestFormJSON() {
    $('.screener-form').fadeIn(500);

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

      var personObj = {};
      $('.person-data').each(function(pi) {
        personObj = generatePersonObj(formdata, pi);
        finalObj['person'].push(personObj);
      });

      finalObj['withholdPayload'] = String(formdata.find('[name=withholdPayload]').is(':checked'));

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
    });

    /* Go back to the form */
    $('.generate-form').on('click', function(event) {
      event.preventDefault();
      $('.screener-json').addClass('hidden');
      $('.screener-form').show();
    });

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
    });

    /* Add person */
    $(document).on('click','.add-person', function(event) {
      event.preventDefault();

      $('.add-remove').find('.error').remove();

      if ($('.person-data').length > 8) {
        $(this).parent().append('<p class="error pt-2">'+ responses.find(x => x["Person"])["Person"]["err_num_persons"]+'</p>');
      }else {
        personContainer.clone().insertBefore($(this).parent());
      }

      if ($('.person-data').length > 1) {
        $('.remove-person').removeClass('hidden');
      }
    });

    /* Remove person */
    $(document).on('click','.remove-person', function(event) {
      event.preventDefault();

      $('.add-remove').find('.error').remove();

      if ($('.person-data').length >1) {
        $('.person-data:last').remove();
      }
      if ($('.person-data').length == 1) {
        $('.remove-person').addClass('hidden');
      }
    });

    /* INCOMES */
    $(document).on('click','.add-income', function(event) {
      event.preventDefault();
      incomesContainer.clone().insertBefore($(this).parent());
      $(this).closest('.person-data').find('.incomes:last').removeClass('hidden');
      $(this).prev('.remove-income').removeClass('hidden');
    });

    $(document).on('click','.remove-income', function(event) {
      event.preventDefault();
      $(this).closest('.person-data').find('.incomes:last').remove();
      if($(this).closest('.person-data').find('.incomes').length > 0){
        $(this).removeClass('hidden');
      } else {
        $(this).addClass('hidden');
      }
    });

    /* EXPENSES */
    $(document).on('click','.add-expense', function(event) {
      event.preventDefault();
      expensesContainer.clone().insertBefore($(this).parent());
      $(this).closest('.person-data').find('.expenses:last').removeClass('hidden');
      $(this).prev('.remove-expense').removeClass('hidden');
    });

    $(document).on('click','.remove-expense', function(event) {
      event.preventDefault();
      $(this).closest('.person-data').find('.expenses:last').remove();
      if($(this).closest('.person-data').find('.expenses').length > 0){
        $(this).removeClass('hidden');
      } else {
        $(this).addClass('hidden');
      }
    });

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
      });
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
      });

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
        });
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
        });

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
    });

    /* Validate the form */
    function validateFields(form) {
      var fieldName, groupSeleted,
      results = {"errors": 0, "warnings": 0},
      fieldsObj = form.serializeArray().reduce((obj, item) => (obj[item.name] = item.value, obj) ,{}),
      fields = form.find('[required]');
      $('.error-msg');
      var warningNode = $('.warning-msg'),
      hhMsgObj = responses.find(x => x["Household"])["Household"],
      personMsgObj = responses.find(x => x["Person"])["Person"],
      errMsgObj = responses.find(x => x["General"])["General"];

      $('.error-msg').children().remove();
      $('.warning-msg').children().remove();

      $('.error-msg').addClass('error');
      $('.error-msg').append('<p><strong>' + errMsgObj["error"]  + '</strong></p>');
      $('.warning-msg').append('<p><strong>' + errMsgObj["warning"] + '</strong></p>');

      /* check for empty fields */
      fields.each(function(){
        fieldName = $(this).attr('name');
        groupSeleted = Object.keys(fieldsObj).find(a =>a.includes(fieldName))? true : false;

        if( $(this).val() === "" ||
          !groupSeleted
        ) {
          $(this).parent().parent().addClass('error');
          results["errors"] += 1;
        } else {
          $(this).parent().removeClass('error');
        }

        if( ($(this).val() == 'livingRenting') &&
          (form.find('[name=livingRentalType]').val() == "")
        ) {
          warningNode.append('<p>' + hhMsgObj["warning_rental_type"] + '</p>');
          results["warnings"] += 1;
        }

      });

      var numPeople = $('.person-data').length;
      if ((numPeople < 1) || (numPeople > 8)) {
        $('.error-msg').append('<p>'+ personMsgObj["err_num_persons"] + '</p>');
        results["errors"] += 1;
      }

      var numHeads = 0;
      var householdMemberTypes = $('[name=householdMemberType]');
      for (var i = 0; i < householdMemberTypes.length; i++) {
        if (householdMemberTypes[i].value == "HeadOfHousehold") {
          numHeads += 1;
        }
      }

      if (numHeads != 1) {
        $('[name=householdMemberType]').parent().addClass('error');
        $('.error-msg').append('<p>'+ personMsgObj["err_hoh"] +'</p>');
        results["errors"] += 1;
      }

      if (form.find('[name=livingType]').val() == "livingRenting" &&
        !($('[name=livingRentalOnLease]:checked').length > 0)
      ){
        warningNode.append('<p>' + personMsgObj["warning_on_lease"] + '</p>');
        results["warnings"] += 1;
      }

      if (form.find('[name=livingType]').val() == "livingOwner" &&
        !($('[name=livingRentalOnLease]:checked').length > 0)
      ){
        warningNode.append('<p>' + personMsgObj["warning_on_deed"] + '</p>');
        results["warnings"] += 1;
      }


      return results;
    }
  }

  /**
   * The Icon module
   * @class
   */
  class Icons {
    /**
     * @constructor
     * @param  {String} path The path of the icon file
     * @return {object} The class
     */
    constructor(path) {
      path = (path) ? path : Icons.path;

      fetch(path)
        .then((response) => {
          if (response.ok)
            return response.text();
          else
            // eslint-disable-next-line no-console
            console.dir(response);
        })
        .catch((error) => {
          // eslint-disable-next-line no-console
          console.dir(error);
        })
        .then((data) => {
          const sprite = document.createElement('div');
          sprite.innerHTML = data;
          sprite.setAttribute('aria-hidden', true);
          sprite.setAttribute('style', 'display: none;');
          document.body.appendChild(sprite);
        });

      return this;
    }
  }

  /** @type {String} The path of the icon file */
  Icons.path = 'svg/icons.svg';

  /**
   * The Simple Toggle class. This will toggle the class 'active' and 'hidden'
   * on target elements, determined by a click event on a selected link or
   * element. This will also toggle the aria-hidden attribute for targeted
   * elements to support screen readers. Target settings and other functionality
   * can be controlled through data attributes.
   *
   * This uses the .matches() method which will require a polyfill for IE
   * https://polyfill.io/v2/docs/features/#Element_prototype_matches
   *
   * @class
   */
  class Toggle {
    /**
     * @constructor
     *
     * @param  {Object}  s  Settings for this Toggle instance
     *
     * @return {Object}     The class
     */
    constructor(s) {
      // Create an object to store existing toggle listeners (if it doesn't exist)
      if (!window.hasOwnProperty(Toggle.callback))
        window[Toggle.callback] = [];

      s = (!s) ? {} : s;

      this.settings = {
        selector: (s.selector) ? s.selector : Toggle.selector,
        namespace: (s.namespace) ? s.namespace : Toggle.namespace,
        inactiveClass: (s.inactiveClass) ? s.inactiveClass : Toggle.inactiveClass,
        activeClass: (s.activeClass) ? s.activeClass : Toggle.activeClass,
        before: (s.before) ? s.before : false,
        after: (s.after) ? s.after : false,
        valid: (s.valid) ? s.valid : false,
        focusable: (s.hasOwnProperty('focusable')) ? s.focusable : true,
        jump: (s.hasOwnProperty('jump')) ? s.jump : true
      };

      // Store the element for potential use in callbacks
      this.element = (s.element) ? s.element : false;

      if (this.element) {
        this.element.addEventListener('click', (event) => {
          this.toggle(event);
        });
      } else {
        // If there isn't an existing instantiated toggle, add the event listener.
        if (!window[Toggle.callback].hasOwnProperty(this.settings.selector)) {
          let body = document.querySelector('body');

          for (let i = 0; i < Toggle.events.length; i++) {
            let tggleEvent = Toggle.events[i];

            body.addEventListener(tggleEvent, event => {
              if (!event.target.matches(this.settings.selector))
                return;

              this.event = event;

              let type = event.type.toUpperCase();

              if (
                this[event.type] &&
                Toggle.elements[type] &&
                Toggle.elements[type].includes(event.target.tagName)
              ) this[event.type](event);
            });
          }
        }
      }

      // Record that a toggle using this selector has been instantiated.
      // This prevents double toggling.
      window[Toggle.callback][this.settings.selector] = true;

      return this;
    }

    /**
     * Click event handler
     *
     * @param  {Event}  event  The original click event
     */
    click(event) {
      this.toggle(event);
    }

    /**
     * Input/select/textarea change event handler. Checks to see if the
     * event.target is valid then toggles accordingly.
     *
     * @param  {Event}  event  The original input change event
     */
    change(event) {
      let valid = event.target.checkValidity();

      if (valid && !this.isActive(event.target)) {
        this.toggle(event); // show
      } else if (!valid && this.isActive(event.target)) {
        this.toggle(event); // hide
      }
    }

    /**
     * Check to see if the toggle is active
     *
     * @param  {Object}  element  The toggle element (trigger)
     */
    isActive(element) {
      let active = false;

      if (this.settings.activeClass) {
        active = element.classList.contains(this.settings.activeClass);
      }

      // if () {
        // Toggle.elementAriaRoles
        // TODO: Add catch to see if element aria roles are toggled
      // }

      // if () {
        // Toggle.targetAriaRoles
        // TODO: Add catch to see if target aria roles are toggled
      // }

      return active;
    }

    /**
     * Get the target of the toggle element (trigger)
     *
     * @param  {Object}  el  The toggle element (trigger)
     */
    getTarget(element) {
      let target = false;

      /** Anchor Links */
      target = (element.hasAttribute('href')) ?
        document.querySelector(element.getAttribute('href')) : target;

      /** Toggle Controls */
      target = (element.hasAttribute('aria-controls')) ?
        document.querySelector(`#${element.getAttribute('aria-controls')}`) : target;

      return target;
    }

    /**
     * The toggle event proxy for getting and setting the element/s and target
     *
     * @param  {Object}  event  The main click event
     *
     * @return {Object}         The Toggle instance
     */
    toggle(event) {
      let element = event.target;
      let target = false;
      let focusable = [];

      event.preventDefault();

      target = this.getTarget(element);

      /** Focusable Children */
      focusable = (target) ?
        target.querySelectorAll(Toggle.elFocusable.join(', ')) : focusable;

      /** Main Functionality */
      if (!target) return this;
      this.elementToggle(element, target, focusable);

      /** Undo */
      if (element.dataset[`${this.settings.namespace}Undo`]) {
        const undo = document.querySelector(
          element.dataset[`${this.settings.namespace}Undo`]
        );

        undo.addEventListener('click', (event) => {
          event.preventDefault();
          this.elementToggle(element, target);
          undo.removeEventListener('click');
        });
      }

      return this;
    }

    /**
     * Get other toggles that might control the same element
     *
     * @param   {Object}    element  The toggling element
     *
     * @return  {NodeList}           List of other toggling elements
     *                               that control the target
     */
    getOthers(element) {
      let selector = false;

      if (element.hasAttribute('href')) {
        selector = `[href="${element.getAttribute('href')}"]`;
      } else if (element.hasAttribute('aria-controls')) {
        selector = `[aria-controls="${element.getAttribute('aria-controls')}"]`;
      }

      return (selector) ? document.querySelectorAll(selector) : [];
    }

    /**
     * Hide the Toggle Target's focusable children from focus.
     * If an element has the data-attribute `data-toggle-tabindex`
     * it will use that as the default tab index of the element.
     *
     * @param   {NodeList}  elements  List of focusable elements
     *
     * @return  {Object}              The Toggle Instance
     */
    toggleFocusable(elements) {
      elements.forEach(element => {
        let tabindex = element.getAttribute('tabindex');

        if (tabindex === '-1') {
          let dataDefault = element
            .getAttribute(`data-${Toggle.namespace}-tabindex`);

          if (dataDefault) {
            element.setAttribute('tabindex', dataDefault);
          } else {
            element.removeAttribute('tabindex');
          }
        } else {
          element.setAttribute('tabindex', '-1');
        }
      });

      return this;
    }

    /**
     * Jumps to Element visibly and shifts focus
     * to the element by setting the tabindex
     *
     * @param   {Object}  element  The Toggling Element
     * @param   {Object}  target   The Target Element
     *
     * @return  {Object}           The Toggle instance
     */
    jumpTo(element, target) {
      // Reset the history state. This will clear out
      // the hash when the target is toggled closed
      history.pushState('', '',
        window.location.pathname + window.location.search);

      // Focus if active
      if (target.classList.contains(this.settings.activeClass)) {
        window.location.hash = element.getAttribute('href');

        target.setAttribute('tabindex', '0');
        target.focus({preventScroll: true});
      } else {
        target.removeAttribute('tabindex');
      }

      return this;
    }

    /**
     * The main toggling method for attributes
     *
     * @param  {Object}    element    The Toggle element
     * @param  {Object}    target     The Target element to toggle active/hidden
     * @param  {NodeList}  focusable  Any focusable children in the target
     *
     * @return {Object}               The Toggle instance
     */
    elementToggle(element, target, focusable = []) {
      let i = 0;
      let attr = '';
      let value = '';

      /**
       * Store elements for potential use in callbacks
       */

      this.element = element;
      this.target = target;
      this.others = this.getOthers(element);
      this.focusable = focusable;

      /**
       * Validity method property that will cancel the toggle if it returns false
       */

      if (this.settings.valid && !this.settings.valid(this))
        return this;

      /**
       * Toggling before hook
       */

      if (this.settings.before)
        this.settings.before(this);

      /**
       * Toggle Element and Target classes
       */

      if (this.settings.activeClass) {
        this.element.classList.toggle(this.settings.activeClass);
        this.target.classList.toggle(this.settings.activeClass);

        // If there are other toggles that control the same element
        this.others.forEach(other => {
          if (other !== this.element)
            other.classList.toggle(this.settings.activeClass);
        });
      }

      if (this.settings.inactiveClass)
        target.classList.toggle(this.settings.inactiveClass);

      /**
       * Target Element Aria Attributes
       */

      for (i = 0; i < Toggle.targetAriaRoles.length; i++) {
        attr = Toggle.targetAriaRoles[i];
        value = this.target.getAttribute(attr);

        if (value != '' && value)
          this.target.setAttribute(attr, (value === 'true') ? 'false' : 'true');
      }

      /**
       * Toggle the target's focusable children tabindex
       */

      if (this.settings.focusable)
        this.toggleFocusable(this.focusable);

      /**
       * Jump to Target Element if Toggle Element is an anchor link
       */

      if (this.settings.jump && this.element.hasAttribute('href'))
        this.jumpTo(this.element, this.target);

      /**
       * Toggle Element (including multi toggles) Aria Attributes
       */

      for (i = 0; i < Toggle.elAriaRoles.length; i++) {
        attr = Toggle.elAriaRoles[i];
        value = this.element.getAttribute(attr);

        if (value != '' && value)
          this.element.setAttribute(attr, (value === 'true') ? 'false' : 'true');

        // If there are other toggles that control the same element
        this.others.forEach((other) => {
          if (other !== this.element && other.getAttribute(attr))
            other.setAttribute(attr, (value === 'true') ? 'false' : 'true');
        });
      }

      /**
       * Toggling complete hook
       */

      if (this.settings.after)
        this.settings.after(this);

      return this;
    }
  }

  /** @type  {String}  The main selector to add the toggling function to */
  Toggle.selector = '[data-js*="toggle"]';

  /** @type  {String}  The namespace for our data attribute settings */
  Toggle.namespace = 'toggle';

  /** @type  {String}  The hide class */
  Toggle.inactiveClass = 'hidden';

  /** @type  {String}  The active class */
  Toggle.activeClass = 'active';

  /** @type  {Array}  Aria roles to toggle true/false on the toggling element */
  Toggle.elAriaRoles = ['aria-pressed', 'aria-expanded'];

  /** @type  {Array}  Aria roles to toggle true/false on the target element */
  Toggle.targetAriaRoles = ['aria-hidden'];

  /** @type  {Array}  Focusable elements to hide within the hidden target element */
  Toggle.elFocusable = [
    'a', 'button', 'input', 'select', 'textarea', 'object', 'embed', 'form',
    'fieldset', 'legend', 'label', 'area', 'audio', 'video', 'iframe', 'svg',
    'details', 'table', '[tabindex]', '[contenteditable]', '[usemap]'
  ];

  /** @type  {Array}  Key attribute for storing toggles in the window */
  Toggle.callback = ['TogglesCallback'];

  /** @type  {Array}  Default events to to watch for toggling. Each must have a handler in the class and elements to look for in Toggle.elements */
  Toggle.events = ['click', 'change'];

  /** @type  {Array}  Elements to delegate to each event handler */
  Toggle.elements = {
    CLICK: ['A', 'BUTTON'],
    CHANGE: ['SELECT', 'INPUT', 'TEXTAREA']
  };

  /**
   * Tracking bus for Google analytics and Webtrends.
   */
  class Track {
    constructor(s) {
      const body = document.querySelector('body');

      s = (!s) ? {} : s;

      this._settings = {
        selector: (s.selector) ? s.selector : Track.selector,
      };

      this.desinations = Track.destinations;

      body.addEventListener('click', (event) => {
        if (!event.target.matches(this._settings.selector))
          return;

        let key = event.target.dataset.trackKey;
        let data = JSON.parse(event.target.dataset.trackData);

        this.track(key, data);
      });

      return this;
    }

    /**
     * Tracking function wrapper
     *
     * @param  {String}      key   The key or event of the data
     * @param  {Collection}  data  The data to track
     *
     * @return {Object}            The final data object
     */
    track(key, data) {
      // Set the path name based on the location
      const d = data.map(el => {
          if (el.hasOwnProperty(Track.key))
            el[Track.key] = `${window.location.pathname}/${el[Track.key]}`;
          return el;
        });

      let wt = this.webtrends(key, d);
      let ga = this.gtag(key, d);

      /* eslint-disable no-console */
      console.dir({'Track': [wt, ga]});
      /* eslint-enable no-console */

      return d;
    };

    /**
     * Data bus for tracking views in Webtrends and Google Analytics
     *
     * @param  {String}      app   The name of the Single Page Application to track
     * @param  {String}      key   The key or event of the data
     * @param  {Collection}  data  The data to track
     */
    view(app, key, data) {
      let wt = this.webtrends(key, data);
      let ga = this.gtagView(app, key);

      /* eslint-disable no-console */
      console.dir({'Track': [wt, ga]});
      /* eslint-enable no-console */
    };

    /**
     * Push Events to Webtrends
     *
     * @param  {String}      key   The key or event of the data
     * @param  {Collection}  data  The data to track
     */
    webtrends(key, data) {
      if (
        typeof Webtrends === 'undefined' ||
        typeof data === 'undefined' ||
        !this.desinations.includes('webtrends')
      )
        return false;

      let event = [{
        'WT.ti': key
      }];

      if (data[0] && data[0].hasOwnProperty(Track.key))
        event.push({
          'DCS.dcsuri': data[0][Track.key]
        });
      else
        Object.assign(event, data);

      // Format data for Webtrends
      let wtd = {argsa: event.flatMap(e => {
        return Object.keys(e).flatMap(k => [k, e[k]]);
      })};

      // If 'action' is used as the key (for gtag.js), switch it to Webtrends
      let action = data.argsa.indexOf('action');

      if (action) data.argsa[action] = 'DCS.dcsuri';

      // Webtrends doesn't send the page view for MultiTrack, add path to url
      let dcsuri = data.argsa.indexOf('DCS.dcsuri');

      if (dcsuri)
        data.argsa[dcsuri + 1] = window.location.pathname + data.argsa[dcsuri + 1];

      /* eslint-disable no-undef */
      if (typeof Webtrends !== 'undefined')
        Webtrends.multiTrack(wtd);
      /* eslint-disable no-undef */

      return ['Webtrends', wtd];
    };

    /**
     * Push Click Events to Google Analytics
     *
     * @param  {String}      key   The key or event of the data
     * @param  {Collection}  data  The data to track
     */
    gtag(key, data) {
      if (
        typeof gtag === 'undefined' ||
        typeof data === 'undefined' ||
        !this.desinations.includes('gtag')
      )
        return false;

      let uri = data.find((element) => element.hasOwnProperty(Track.key));

      let event = {
        'event_category': key
      };

      /* eslint-disable no-undef */
      gtag(Track.key, uri[Track.key], event);
      /* eslint-enable no-undef */

      return ['gtag', Track.key, uri[Track.key], event];
    };

    /**
     * Push Screen View Events to Google Analytics
     *
     * @param  {String}  app  The name of the application
     * @param  {String}  key  The key or event of the data
     */
    gtagView(app, key) {
      if (
        typeof gtag === 'undefined' ||
        typeof data === 'undefined' ||
        !this.desinations.includes('gtag')
      )
        return false;

      let view = {
        app_name: app,
        screen_name: key
      };

      /* eslint-disable no-undef */
      gtag('event', 'screen_view', view);
      /* eslint-enable no-undef */

      return ['gtag', Track.key, 'screen_view', view];
    };
  }

  /** @type {String} The main selector to add the tracking function to */
  Track.selector = '[data-js*="track"]';

  /** @type {String} The main event tracking key to map to Webtrends DCS.uri */
  Track.key = 'event';

  /** @type {Array} What destinations to push data to */
  Track.destinations = [
    'webtrends',
    'gtag'
  ];

  const cdn = "https://raw.githubusercontent.com/CityOfNewYork/screeningapi-docs/" + "drafts" + '/';

  new Icons('svg/nyco-patterns.svg'); // https://cdn.jsdelivr.net/gh/cityofnewyork/nyco-patterns@v2.6.8/dist/svg/icons.svg
  new Icons('svg/access-patterns.svg'); // https://cdn.jsdelivr.net/gh/cityofnewyork/access-nyc-patterns@v0.15.14/dist/svg/icons.svg
  new Icons('svg/feather.svg');

  new Toggle();
  new Track();

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

  // Get the content markdown from "drafts" and append
  let markdowns = $('body').find('[id^="markdown"]');

  markdowns.each(function() {
    let target = $(this);
    let file = $(this).attr('id').replace('markdown-', '');

    $.get(cdn + file + '.md', function(data) {
      showdown.setFlavor('github');

      let converter = new showdown.Converter({tables: true});
      let html = converter.makeHtml(data);

      target.append(html)
        .hide()
        .fadeIn(250);

    }, 'text');
  });

})();
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibWFpbi5qcyIsInNvdXJjZXMiOlsiLi4vLi4vLi4vc3JjL2pzL21vZHVsZXMvcG9seWZpbGwtcmVtb3ZlLmpzIiwiLi4vLi4vLi4vc3JjL2pzL21vZHVsZXMvcmVzcG9uc2VzLmpzIiwiLi4vLi4vLi4vc3JjL2pzL21vZHVsZXMvc3VibWlzc2lvbi5qcyIsIi4uLy4uLy4uL3NyYy9qcy9tb2R1bGVzL3N3YWdnZXIuanMiLCIuLi8uLi8uLi9ub2RlX21vZHVsZXMvQG55Y29wcG9ydHVuaXR5L3B0dHJuLXNjcmlwdHMvc3JjL2Zvcm1zL2Zvcm1zLmpzIiwiLi4vLi4vLi4vc3JjL2pzL21vZHVsZXMvdXRpbC5qcyIsIi4uLy4uLy4uL3NyYy9qcy9tb2R1bGVzL2J1bGstc3VibWlzc2lvbi5qcyIsIi4uLy4uLy4uL3NyYy9qcy9tb2R1bGVzL2NoYW5nZS1wYXNzd29yZC5qcyIsIi4uLy4uLy4uL3NyYy9qcy9tb2R1bGVzL3JlcXVlc3QtZm9ybS1qc29uLmpzIiwiLi4vLi4vLi4vbm9kZV9tb2R1bGVzL0BueWNvcHBvcnR1bml0eS9wdHRybi1zY3JpcHRzL3NyYy9pY29ucy9pY29ucy5qcyIsIi4uLy4uLy4uL25vZGVfbW9kdWxlcy9Abnljb3Bwb3J0dW5pdHkvcHR0cm4tc2NyaXB0cy9zcmMvdG9nZ2xlL3RvZ2dsZS5qcyIsIi4uLy4uLy4uL25vZGVfbW9kdWxlcy9Abnljb3Bwb3J0dW5pdHkvcHR0cm4tc2NyaXB0cy9zcmMvdHJhY2svdHJhY2suanMiLCIuLi8uLi8uLi9zcmMvanMvbWFpbi5qcyJdLCJzb3VyY2VzQ29udGVudCI6WyIoZnVuY3Rpb24oYXJyKSB7XG4gIGFyci5mb3JFYWNoKGZ1bmN0aW9uKGl0ZW0pIHtcbiAgICBpZiAoaXRlbS5oYXNPd25Qcm9wZXJ0eSgncmVtb3ZlJykpIHtcbiAgICAgIHJldHVybjtcbiAgICB9XG4gICAgT2JqZWN0LmRlZmluZVByb3BlcnR5KGl0ZW0sICdyZW1vdmUnLCB7XG4gICAgICBjb25maWd1cmFibGU6IHRydWUsXG4gICAgICBlbnVtZXJhYmxlOiB0cnVlLFxuICAgICAgd3JpdGFibGU6IHRydWUsXG4gICAgICB2YWx1ZTogZnVuY3Rpb24gcmVtb3ZlKCkge1xuICAgICAgICBpZiAodGhpcy5wYXJlbnROb2RlICE9PSBudWxsKVxuICAgICAgICAgIHRoaXMucGFyZW50Tm9kZS5yZW1vdmVDaGlsZCh0aGlzKTtcbiAgICAgIH1cbiAgICB9KTtcbiAgfSk7XG59KShbXG4gIEVsZW1lbnQucHJvdG90eXBlLFxuICBDaGFyYWN0ZXJEYXRhLnByb3RvdHlwZSxcbiAgRG9jdW1lbnRUeXBlLnByb3RvdHlwZVxuXSk7IiwiZXhwb3J0IGRlZmF1bHQgW1xuICB7XG4gICAgXCJFTUFJTFwiOiBcIlBsZWFzZSBlbnRlciBhIHZhbGlkIGVtYWlsLlwiXG4gIH0sXG4gIHtcbiAgICBcIkZOQU1FXCI6IFwiUGxlYXNlIGVudGVyIHlvdXIgZmlyc3QgbmFtZS5cIlxuICB9LFxuICB7XG4gICAgXCJMTkFNRVwiOiBcIlBsZWFzZSBlbnRlciB5b3VyIGxhc3QgbmFtZS5cIlxuICB9LFxuICB7XG4gICAgXCJPUkdcIjogXCJQbGVhc2UgZW50ZXIgeW91ciBvcmdhbml6YXRpb24uXCJcbiAgfSxcbiAge1xuICAgIFwiRVJSXCI6IFwiVGhlcmUgd2FzIGEgcHJvYmxlbSB3aXRoIHlvdXIgcmVxdWVzdC4gUGxlYXNlIHRyeSBhZ2FpbiBsYXRlciBvciBzZW5kIHVzIGEgbWVzc2FnZSBhdCA8YSBjbGFzcz1cXFwidGV4dC1wcmltYXJ5LXJlZFxcXCIgaHJlZj1cXFwibWFpbHRvOmVsaWdpYmlsaXR5YXBpQG55Y29wcG9ydHVuaXR5Lm55Yy5nb3ZcXFwiPmVsaWdpYmlsaXR5YXBpQG55Y29wcG9ydHVuaXR5Lm55Yy5nb3Y8L2E+LiBXZSB3aWxsIGdldCBiYWNrIHRvIHlvdSBhcyBzb29uIGFzIHBvc3NpYmxlIVwiXG4gIH0sXG4gIHtcbiAgICBcIkVSUl9BTFJFQURZX1JFUVVFU1RFRFwiOiBcIllvdSBoYXZlIGFscmVhZHkgbWFkZSBhIHJlcXVlc3QuIElmIHlvdSBoYXZlIG5vdCBoZWFyZCBiYWNrIGZyb20gdXMsIHBsZWFzZSBzZW5kIHVzIGEgbWVzc2FnZSBhdCA8YSBjbGFzcz1cXFwidGV4dC1wcmltYXJ5LXJlZFxcXCIgaHJlZj1cXFwibWFpbHRvOmVsaWdpYmlsaXR5YXBpQG55Y29wcG9ydHVuaXR5Lm55Yy5nb3ZcXFwiPmVsaWdpYmlsaXR5YXBpQG55Y29wcG9ydHVuaXR5Lm55Yy5nb3Y8L2E+LiBXZSB3aWxsIGdldCBiYWNrIHRvIHlvdSBhcyBzb29uIGFzIHBvc3NpYmxlIVwiXG4gIH0sXG4gIHtcbiAgICBcIkVSUl9UT09fTUFOWV9SRVFVRVNUU1wiOiBcIkl0IHNlZW1zIHRoYXQgeW91IGhhdmUgbWFkZSB0b28gbWFueSByZXF1ZXN0cy4gUGxlYXNlIHRyeSBhZ2FpbiBsYXRlciBvciBzZW5kIHVzIGEgbWVzc2FnZSBhdCA8YSBjbGFzcz1cXFwidGV4dC1wcmltYXJ5LXJlZFxcXCIgaHJlZj1cXFwibWFpbHRvOmVsaWdpYmlsaXR5YXBpQG55Y29wcG9ydHVuaXR5Lm55Yy5nb3ZcXFwiPmVsaWdpYmlsaXR5YXBpQG55Y29wcG9ydHVuaXR5Lm55Yy5nb3Y8L2E+LiBXZSB3aWxsIGdldCBiYWNrIHRvIHlvdSBhcyBzb29uIGFzIHBvc3NpYmxlIVwiXG4gIH0sXG4gIHtcbiAgICBcIk1TR19SRUNBUFRDSEFcIjogXCJUaGVyZSdzIG9uZSBtb3JlIHN0ZXAhXCJcbiAgfSxcbiAge1xuICAgIFwiU1VDQ0VTU1wiOiBcIlRoYW5rIHlvdSEgWW91ciByZXF1ZXN0IHdpbGwgYmUgcmV2aWV3ZWQgd2l0aCBjb25maXJtYXRpb24gd2l0aGluIDEtMiBidXNpbmVzcyBkYXlzLlwiXG4gIH0sXG4gIHtcbiAgICBcIkdlbmVyYWxcIjoge1xuICAgICAgXCJlcnJvclwiOiBcIlBsZWFzZSByZXNvbHZlIGhpZ2hsaWdodGVkIGZpZWxkcy5cIixcbiAgICAgIFwid2FybmluZ1wiOiBcIlJlc29sdmluZyB0aGUgZm9sbG93aW5nIG1pZ2h0IGdlbmVyYXRlIGRpZmZlcmVudCBzY3JlZW5pbmcgcmVzdWx0cyBmb3IgdGhpcyBob3VzZWhvbGQgKG9wdGlvbmFsKTpcIlxuICAgIH1cbiAgfSxcbiAge1xuICAgIFwiSG91c2Vob2xkXCI6IHtcbiAgICAgIFwiZXJyX2V4Y2Vzc19tZW1iZXJzXCI6IFwiSG91c2Vob2xkOiBUaGUgbnVtYmVyIG9mIGhvdXNlaG9sZCBtZW1iZXJzIG11c3QgYmUgYmV0d2VlbiAxIGFuZCA4IG1lbWJlcnMuXCIsXG4gICAgICBcIndhcm5pbmdfcmVudGFsX3R5cGVcIjogXCJIb3VzZWhvbGQ6IFRoZXJlIHNob3VsZCBiZSBhIHJlbnRhbCB0eXBlLlwiXG4gICAgfVxuICB9LFxuICB7XG4gICAgXCJQZXJzb25cIjoge1xuICAgICAgXCJlcnJfbnVtX3BlcnNvbnNcIjogXCJQZXJzb246IFRoZSBudW1iZXIgb2YgcGVyc29ucyBjYW5ub3QgZXhjZWVkIDggbWVtYmVyc1wiLFxuICAgICAgXCJlcnJfaG9oXCI6IFwiUGVyc29uOiBFeGFjdGx5IG9uZSBwZXJzb24gbXVzdCBiZSB0aGUgaGVhZCBvZiBob3VzZWhvbGQuXCIsXG4gICAgICBcIndhcm5pbmdfb25fbGVhc2VcIjogXCJQZXJzb246IEF0IGxlYXN0IG9uZSBwZXJzb24gc2hvdWxkIGJlIG9uIHRoZSBsZWFzZS5cIixcbiAgICAgIFwid2FybmluZ19vbl9kZWVkXCI6IFwiUGVyc29uOiBBdCBsZWFzdCBvbmUgcGVyc29uIHNob3VsZCBiZSBvbiB0aGUgZGVlZC5cIlxuICAgIH1cbiAgfVxuXVxuIiwiaW1wb3J0IHJlc3BvbnNlcyBmcm9tICcuL3Jlc3BvbnNlcy5qcyc7XG5cbmV4cG9ydCBkZWZhdWx0IGZ1bmN0aW9uKCkge1xuICBjb25zdCBlcnJvck1zZyA9ICdQbGVhc2UgZW50ZXIgeW91ciBmaXJzdCBuYW1lLCBsYXN0IG5hbWUsIGVtYWlsIGFuZCBvcmdhbml6YXRpb24uJztcblxuICAvKipcbiAgKiBWYWxpZGF0ZSBmb3JtIGZpZWxkc1xuICAqIEBwYXJhbSB7b2JqZWN0fSBmb3JtRGF0YSAtIGZvcm0gZmllbGRzXG4gICogQHBhcmFtIHtvYmplY3R9IGV2ZW50IC0gZXZlbnQgb2JqZWN0XG4gICovXG4gIGZ1bmN0aW9uIHZhbGlkYXRlRmllbGRzKGZvcm0sIGV2ZW50KSB7XG4gICAgZXZlbnQucHJldmVudERlZmF1bHQoKTtcblxuICAgIGNvbnN0IGZpZWxkcyA9IGZvcm0uc2VyaWFsaXplQXJyYXkoKS5yZWR1Y2UoKG9iaiwgaXRlbSkgPT4gKG9ialtpdGVtLm5hbWVdID0gaXRlbS52YWx1ZSwgb2JqKSAse30pXG4gICAgY29uc3QgcmVxdWlyZWRGaWVsZHMgPSBmb3JtLmZpbmQoJ1tyZXF1aXJlZF0nKTtcbiAgICBjb25zdCBlbWFpbFJlZ2V4ID0gbmV3IFJlZ0V4cCgvXFxTK0BcXFMrXFwuXFxTKy8pO1xuICAgIGxldCBoYXNFcnJvcnMgPSBmYWxzZTtcblxuICAgIC8vIGxvb3AgdGhyb3VnaCBlYWNoIHJlcXVpcmVkIGZpZWxkXG4gICAgcmVxdWlyZWRGaWVsZHMuZWFjaChmdW5jdGlvbigpIHtcbiAgICAgIGNvbnN0IGZpZWxkTmFtZSA9ICQodGhpcykuYXR0cignbmFtZScpO1xuXG4gICAgICBpZiggIWZpZWxkc1tmaWVsZE5hbWVdIHx8XG4gICAgICAgIChmaWVsZE5hbWUgPT0gJ0VNQUlMJyAmJiAhZW1haWxSZWdleC50ZXN0KGZpZWxkcy5FTUFJTCkpICkge1xuICAgICAgICBoYXNFcnJvcnMgPSB0cnVlO1xuICAgICAgICAkKHRoaXMpLmFkZENsYXNzKCdpcy1lcnJvcicpO1xuICAgICAgICAkKHRoaXMpLmFkZENsYXNzKCdib3JkZXItcHJpbWFyeS1yZWQnKTtcbiAgICAgICAgJCh0aGlzKS5iZWZvcmUoJzxwIGNsYXNzPVwiaXMtZXJyb3IgdGV4dC1wcmltYXJ5LXJlZCB0ZXh0LXNtYWxsIG15LTBcIj4nKyByZXNwb25zZXMuZmluZCh4ID0+IHhbZmllbGROYW1lXSlbZmllbGROYW1lXSArICc8L3A+Jyk7XG4gICAgICB9IGVsc2Uge1xuICAgICAgICAkKHRoaXMpLnJlbW92ZUNsYXNzKCdib3JkZXItcHJpbWFyeS1yZWQnKTtcbiAgICAgIH1cbiAgICB9KTtcblxuICAgIC8vIGlmIHRoZXJlIGFyZSBubyBlcnJvcnMsIHN1Ym1pdFxuICAgIGlmIChoYXNFcnJvcnMpIHtcbiAgICAgIGZvcm0uZmluZCgnLmZvcm0tZXJyb3InKS5odG1sKGA8cD4ke2Vycm9yTXNnfTwvcD5gKTtcbiAgICB9IGVsc2Uge1xuICAgICAgc3VibWl0U2lnbnVwKGZvcm0sIGZpZWxkcyk7XG4gICAgfVxuICB9XG5cbiAgLyoqXG4gICogU3VibWl0cyB0aGUgZm9ybSBvYmplY3QgdG8gTWFpbGNoaW1wXG4gICogQHBhcmFtIHtvYmplY3R9IGZvcm1EYXRhIC0gZm9ybSBmaWVsZHNcbiAgKi9cbiAgZnVuY3Rpb24gc3VibWl0U2lnbnVwKGZvcm0sIGZvcm1EYXRhKXtcbiAgICAkLmFqYXgoe1xuICAgICAgdXJsOiBmb3JtLmF0dHIoJ2FjdGlvbicpLFxuICAgICAgdHlwZTogZm9ybS5hdHRyKCdtZXRob2QnKSxcbiAgICAgIGRhdGFUeXBlOiAnanNvbicsLy9ubyBqc29ucFxuICAgICAgY2FjaGU6IGZhbHNlLFxuICAgICAgZGF0YTogZm9ybURhdGEsXG4gICAgICBjb250ZW50VHlwZTogXCJhcHBsaWNhdGlvbi9qc29uOyBjaGFyc2V0PXV0Zi04XCIsXG4gICAgICBzdWNjZXNzOiBmdW5jdGlvbihyZXNwb25zZSkge1xuICAgICAgICBpZihyZXNwb25zZS5yZXN1bHQgIT09ICdzdWNjZXNzJyl7XG4gICAgICAgICAgICBpZihyZXNwb25zZS5tc2cuaW5jbHVkZXMoJ2FscmVhZHkgc3Vic2NyaWJlZCcpKXtcbiAgICAgICAgICAgICAgZm9ybS5odG1sKCc8cCBjbGFzcz1cInRleHQtcHJpbWFyeS1yZWQgdGV4dC1jZW50ZXIgaXRhbGljXCI+JysgcmVzcG9uc2VzLmZpbmQoeCA9PiB4W1wiRVJSX0FMUkVBRFlfUkVRVUVTVEVEXCJdKVtcIkVSUl9BTFJFQURZX1JFUVVFU1RFRFwiXSArICc8L3A+Jyk7XG4gICAgICAgICAgICB9IGVsc2UgaWYocmVzcG9uc2UubXNnLmluY2x1ZGVzKCd0b28gbWFueSByZWNlbnQgc2lnbnVwIHJlcXVlc3RzJykpe1xuICAgICAgICAgICAgICBmb3JtLmh0bWwoJzxwIGNsYXNzPVwidGV4dC1wcmltYXJ5LXJlZCB0ZXh0LWNlbnRlciBpdGFsaWNcIj4nKyByZXNwb25zZXMuZmluZCh4ID0+IHhbXCJFUlJfVE9PX01BTllfUkVRVUVTVFNcIl0pW1wiRVJSX1RPT19NQU5ZX1JFUVVFU1RTXCJdICsnPC9wPicpO1xuICAgICAgICAgICAgfSBlbHNlIGlmKHJlc3BvbnNlLm1zZy5pbmNsdWRlcygnY2FwdGNoYScpKXtcbiAgICAgICAgICAgICAgdmFyIHVybCA9ICQoXCJmb3JtI21jLWVtYmVkZGVkLXN1YnNjcmliZS1mb3JtXCIpLmF0dHIoXCJhY3Rpb25cIik7XG4gICAgICAgICAgICAgIHZhciBwYXJhbWV0ZXJzID0gJC5wYXJhbShyZXNwb25zZS5wYXJhbXMpO1xuICAgICAgICAgICAgICB1cmwgPSB1cmwuc3BsaXQoXCItanNvbj9cIilbMF07XG4gICAgICAgICAgICAgIHVybCArPSBcIj9cIjtcbiAgICAgICAgICAgICAgdXJsICs9IHBhcmFtZXRlcnM7XG4gICAgICAgICAgICAgIHdpbmRvdy5vcGVuKHVybCwgJ19ibGFuaycpO1xuICAgICAgICAgICAgICBmb3JtLmh0bWwoJzxwIGNsYXNzPVwidGV4dC1wcmltYXJ5LW5hdnkgdGV4dC1jZW50ZXIgaXRhbGljXCI+JysgcmVzcG9uc2VzLmZpbmQoeCA9PiB4W1wiTVNHX1JFQ0FQVENIQVwiXSlbXCJNU0dfUkVDQVBUQ0hBXCJdICsnPGEgY2xhc3M9XCJ0ZXh0LXByaW1hcnktcmVkXCIgdGFyZ2V0PVwiX2JsYW5rXCIgaHJlZj1cIicgKyB1cmwgKyAnXCI+IFBsZWFzZSBjb25maXJtIHRoYXQgeW91IGFyZSBub3QgYSByb2JvdC48L2E+PC9wPicpO1xuICAgICAgICAgICAgfWVsc2Uge1xuICAgICAgICAgICAgICBmb3JtLmh0bWwoJzxwIGNsYXNzPVwidGV4dC1wcmltYXJ5LXJlZCB0ZXh0LWNlbnRlciBpdGFsaWNcIj4nICsgcmVzcG9uc2VzLmZpbmQoeCA9PiB4W1wiRVJSXCJdKVtcIkVSUlwiXSArICc8L3A+Jyk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1lbHNlIHtcbiAgICAgICAgICBmb3JtLmh0bWwoJzxwIGNsYXNzPVwidGV4dC1wcmltYXJ5LW5hdnkgdGV4dC1jZW50ZXIgaXRhbGljXCI+JysgcmVzcG9uc2VzLmZpbmQoeCA9PiB4W1wiU1VDQ0VTU1wiXSlbXCJTVUNDRVNTXCJdICsnPC9wPicpO1xuICAgICAgICB9XG4gICAgICB9LFxuICAgICAgZXJyb3I6IGZ1bmN0aW9uKHJlc3BvbnNlKSB7XG4gICAgICAgIGNvbnNvbGUubG9nKHJlc3BvbnNlKVxuICAgICAgICBmb3JtLmJlZm9yZSgnPHAgY2xhc3M9XCJ0ZXh0LXByaW1hcnktcmVkIHRleHQtY2VudGVyIGl0YWxpY1wiPicgKyByZXNwb25zZXMuZmluZCh4ID0+IHhbXCJFUlJcIl0pW1wiRVJSXCJdICsgJzwvcD4nKTtcbiAgICAgIH1cbiAgICB9KTtcbiAgfVxuXG4gIC8qKlxuICAqIFRyaWdnZXJzIGZvcm0gdmFsaWRhdGlvbiBhbmQgc2VuZHMgdGhlIGZvcm0gZGF0YSB0byBNYWlsY2hpbXBcbiAgKiBAcGFyYW0ge29iamVjdH0gZm9ybURhdGEgLSBmb3JtIGZpZWxkc1xuICAqL1xuICAkKCcjbWMtZW1iZWRkZWQtc3Vic2NyaWJlOmJ1dHRvblt0eXBlPVwic3VibWl0XCJdJykuY2xpY2soZnVuY3Rpb24oZXZlbnQpe1xuICAgIGV2ZW50LnByZXZlbnREZWZhdWx0KCk7XG4gICAgbGV0ICRmb3JtID0gJCh0aGlzKS5wYXJlbnRzKCdmb3JtJyk7XG4gICAgdmFsaWRhdGVGaWVsZHMoJGZvcm0sIGV2ZW50KTtcbiAgfSk7XG5cbn1cbiIsIi8vIGltcG9ydCAqIGFzIFN3YWdnZXJVSSBmcm9tICdzd2FnZ2VyLXVpJztcblxuZXhwb3J0IGRlZmF1bHQgZnVuY3Rpb24oY2RuKSB7XG4gIC8vIGNvbnN0IGNvbnRyb2xsZXIgPSBuZXcgQWJvcnRDb250cm9sbGVyKClcXFxuICAvLyBjb25zdCBTd2FnZ2VyVUkgPSByZXF1aXJlKCdzd2FnZ2VyLXVpJyk7XG5cbiAgU3dhZ2dlclVJQnVuZGxlKHtcbiAgICBkb21faWQ6ICcjc3dhZ2dlci1lZGl0b3InLFxuICAgIHVybDogY2RuICsgJ2VuZHBvaW50cy55bWwnXG4gIH0pO1xuXG4gIC8vIHdpbmRvdy5lZGl0b3IgPSBTd2FnZ2VyRWRpdG9yQnVuZGxlKHtcbiAgLy8gICBkb21faWQ6ICcjc3dhZ2dlci1lZGl0b3InLFxuICAvLyAgIHVybDogY2RuICsgJ2VuZHBvaW50cy55bWwnXG4gIC8vIH0pO1xuXG4gICQoJy5TcGxpdFBhbmUnKS5jc3MoJ3Bvc2l0aW9uJywgJ3JlbGF0aXZlJyk7XG4gICQoJy5QYW5lMScpLmNzcygnZGlzcGxheScsICdub25lJyk7XG4gICQoJy5QYW5lMicpLmNzcygnd2lkdGgnLCAnMTAwJScpO1xuXG4gIC8vIGdlbmVyYXRlIGN1cmwgY29tbWFuZCB0byB0cnkgaXQgb3V0XG4gICQoJ2JvZHknKS5vbignY2xpY2snLCAnLnRyeS1vdXRfX2J0bicsIGZ1bmN0aW9uKGV2ZW50KXtcbiAgICBnZW5lcmF0ZUN1cmwodGhpcylcbiAgfSlcblxuICAkKCdib2R5Jykub24oJ2tleXVwJywgJ1twbGFjZWhvbGRlcl49aW50ZXJlc3RlZFByb2dyYW1zXScsIGZ1bmN0aW9uKGV2ZW50KXtcbiAgICBnZW5lcmF0ZUN1cmwodGhpcyk7XG4gIH0pXG5cbiAgJCgnYm9keScpLm9uKCdrZXl1cCcsICdbcGxhY2Vob2xkZXJePUF1dGhvcml6YXRpb25dJywgZnVuY3Rpb24oZXZlbnQpe1xuICAgIGdlbmVyYXRlQ3VybCh0aGlzKTtcbiAgfSlcblxuICAkKCdib2R5Jykub24oJ2tleXVwJywgJ1tjbGFzc149Ym9keS1wYXJhbV9fdGV4dF0nLCBmdW5jdGlvbihldmVudCl7XG4gICAgZ2VuZXJhdGVDdXJsKHRoaXMpO1xuICB9KVxuXG4gICQoJ2JvZHknKS5vbignY2hhbmdlJywgJ1t0eXBlXj1maWxlXScsIGZ1bmN0aW9uKGV2ZW50KXtcbiAgICBnZW5lcmF0ZUN1cmwodGhpcyk7XG4gIH0pXG5cbiAgLy8gJCgnI3N3YWdnZXItZWRpdG9yJykuZmFkZUluKDI1MDApXG5cbiAgZnVuY3Rpb24gZ2VuZXJhdGVDdXJsKG9iaikge1xuICAgIGNvbnN0IGRvbWFpbiA9ICQoJ2JvZHknKS5maW5kKCcuc2VydmVycyA6c2VsZWN0ZWQnKS50ZXh0KCk7XG4gICAgY29uc3QgZXBfaWQgPSAkKG9iaikucGFyZW50cygnLm9wYmxvY2stcG9zdDpmaXJzdCcpLmF0dHIoJ2lkJyk7XG4gICAgY29uc3QgZXAgPSB1dGlsLmZvcm1hdChcIi8lc1wiLCBlcF9pZC5zdWJzdHIoZXBfaWQuaW5kZXhPZihcIl9cIikgKyAxKS5yZXBsYWNlKFwiX1wiLCBcIi9cIikpO1xuICAgIGNvbnN0IHBhcl9ub2RlID0gJChvYmopLnBhcmVudHMoJy5vcGJsb2NrLWJvZHk6Zmlyc3QnKTtcbiAgICBjb25zdCBleGFtcGxlQm9keSA9IHBhcl9ub2RlLmZpbmQoJy5ib2R5LXBhcmFtX19leGFtcGxlJyk7XG4gICAgY29uc3QgdGV4dEJvZHkgPSBleGFtcGxlQm9keS5sZW5ndGggPiAwID8gZXhhbXBsZUJvZHkudGV4dCgpIDogcGFyX25vZGUuZmluZCgnLmJvZHktcGFyYW1fX3RleHQnKS50ZXh0KClcbiAgICBjb25zdCBwYXJhbXMgPSB0ZXh0Qm9keS5yZXBsYWNlKC9cXHMvZywnJyk7XG5cbiAgICBwYXJfbm9kZS5maW5kKCcuY3VybCcpLnJlbW92ZSgpO1xuICAgIHBhcl9ub2RlLmZpbmQoJy5leGVjdXRlLXdyYXBwZXInKS5hcHBlbmQoYDxwIGNsYXNzPVwiY3VybFwiPlVzZSB0aGUgZm9sbG93aW5nIGNvbW1hbmQgdG8gbWFrZSBhIHJlcXVlc3QgdG8gdGhlIDxzdHJvbmc+JHtlcH08L3N0cm9uZz4gZW5kcG9pbnQgYmFzZWQgb24gdGhlIGRhdGEgc2V0IGFib3ZlOjwvcD5gKTtcblxuICAgIGNvbnN0IGF1dGhWYWwgPSBwYXJfbm9kZS5maW5kKCdbcGxhY2Vob2xkZXJePUF1dGhvcml6YXRpb25dJykudmFsKCk7XG4gICAgY29uc3QgaW50ZXJlc3RlZFByb2dyYW1zVmFsID0gcGFyX25vZGUuZmluZCgnW3BsYWNlaG9sZGVyXj1pbnRlcmVzdGVkUHJvZ3JhbXNdJykudmFsKCk7XG4gICAgY29uc3QgcXVlcnkgPSBpbnRlcmVzdGVkUHJvZ3JhbXNWYWwgPyBgP2ludGVyZXN0ZWRQcm9ncmFtcz0ke2ludGVyZXN0ZWRQcm9ncmFtc1ZhbH1gIDogXCJcIlxuICAgIGlmIChlcF9pZC5pbmNsdWRlcygnQXV0aGVudGljYXRpb24nKSkge1xuICAgICAgY29uc3QgYXV0aGVudGljYXRpb25DdXJsID0gYGN1cmwgLVggUE9TVCBcIiR7ZG9tYWlufSR7ZXB9XCIgXFxcbiAgICAgICAgLUggIFwiYWNjZXB0OiBhcHBsaWNhdGlvbi9qc29uXCIgXFxcbiAgICAgICAgLUggIFwiQ29udGVudC1UeXBlOiBhcHBsaWNhdGlvbi9qc29uXCIgXFxcbiAgICAgICAgLWQgXFwnJHtwYXJhbXN9XFwnYDtcbiAgICAgIHBhcl9ub2RlLmZpbmQoJy5leGVjdXRlLXdyYXBwZXInKS5hcHBlbmQoYDx0ZXh0YXJlYSByZWFkb25seT1cIlwiIGNsYXNzPVwiY3VybFwiIHN0eWxlPVwid2hpdGUtc3BhY2U6IG5vcm1hbDtcIj4ke2F1dGhlbnRpY2F0aW9uQ3VybH08L3RleHRhcmVhPmApO1xuICAgIH0gZWxzZSBpZiAoZXBfaWQuaW5jbHVkZXMoJ2VsaWdpYmlsaXR5UHJvZ3JhbXMnKSl7XG4gICAgICBjb25zdCBlbGlnaWJpbGl0eVByb2dyYW1zQ3VybCA9IGBjdXJsIC1YIFBPU1QgXCIke2RvbWFpbn0ke2VwfSR7cXVlcnl9XCIgXFxcbiAgICAgICAgLUggXCJhY2NlcHQ6IGFwcGxpY2F0aW9uL2pzb25cIiBcXFxuICAgICAgICAtSCBcIkNvbnRlbnQtVHlwZTogYXBwbGljYXRpb24vanNvblwiIFxcXG4gICAgICAgIC1IIFwiQXV0aG9yaXphdGlvbjogJHthdXRoVmFsfVwiXFxcbiAgICAgICAgLWQgXFwnJHtwYXJhbXN9XFwnYDtcbiAgICAgIHBhcl9ub2RlLmZpbmQoJy5leGVjdXRlLXdyYXBwZXInKS5hcHBlbmQoYDx0ZXh0YXJlYSByZWFkb25seT1cIlwiIGNsYXNzPVwiY3VybFwiIHN0eWxlPVwid2hpdGUtc3BhY2U6IG5vcm1hbDtcIj4ke2VsaWdpYmlsaXR5UHJvZ3JhbXNDdXJsfTwvdGV4dGFyZWE+YCk7XG4gICAgfSBlbHNlIGlmIChlcF9pZC5pbmNsdWRlcygnYnVsa1N1Ym1pc3Npb24nKSkge1xuICAgICAgY29uc3QgaW5wdXRQYXRoID0gcGFyX25vZGUuZmluZCgnW3R5cGVePWZpbGVdJykudmFsKCk7XG4gICAgICBjb25zdCBidWxrU3VibWlzc2lvbkN1cmwgPSBgY3VybCAtWCBQT1NUIFwiJHtkb21haW59JHtlcH0ke3F1ZXJ5fVwiIFxcXG4gICAgICAgIC1IIFwiYWNjZXB0OiBtdWx0aXBhcnQvZm9ybS1kYXRhXCIgXFxcbiAgICAgICAgLUggXCJDb250ZW50LVR5cGU6IG11bHRpcGFydC9mb3JtLWRhdGFcIiBcXFxuICAgICAgICAtSCBcIkF1dGhvcml6YXRpb246ICR7YXV0aFZhbH1cIlxcXG4gICAgICAgIC1GIFwiPUAke2lucHV0UGF0aH07dHlwZT10ZXh0L2NzdlwiYDtcbiAgICAgIHBhcl9ub2RlLmZpbmQoJy5leGVjdXRlLXdyYXBwZXInKS5hcHBlbmQoYDx0ZXh0YXJlYSByZWFkb25seT1cIlwiIGNsYXNzPVwiY3VybFwiIHN0eWxlPVwid2hpdGUtc3BhY2U6IG5vcm1hbDtcIj4ke2J1bGtTdWJtaXNzaW9uQ3VybH08L3RleHRhcmVhPmApO1xuICAgIH1cbiAgfVxufVxuIiwiJ3VzZSBzdHJpY3QnO1xuXG4vKipcbiAqIFV0aWxpdGllcyBmb3IgRm9ybSBjb21wb25lbnRzXG4gKiBAY2xhc3NcbiAqL1xuY2xhc3MgRm9ybXMge1xuICAvKipcbiAgICogVGhlIEZvcm0gY29uc3RydWN0b3JcbiAgICogQHBhcmFtICB7T2JqZWN0fSBmb3JtIFRoZSBmb3JtIERPTSBlbGVtZW50XG4gICAqL1xuICBjb25zdHJ1Y3Rvcihmb3JtID0gZmFsc2UpIHtcbiAgICB0aGlzLkZPUk0gPSBmb3JtO1xuXG4gICAgdGhpcy5zdHJpbmdzID0gRm9ybXMuc3RyaW5ncztcblxuICAgIHRoaXMuc3VibWl0ID0gRm9ybXMuc3VibWl0O1xuXG4gICAgdGhpcy5jbGFzc2VzID0gRm9ybXMuY2xhc3NlcztcblxuICAgIHRoaXMubWFya3VwID0gRm9ybXMubWFya3VwO1xuXG4gICAgdGhpcy5zZWxlY3RvcnMgPSBGb3Jtcy5zZWxlY3RvcnM7XG5cbiAgICB0aGlzLmF0dHJzID0gRm9ybXMuYXR0cnM7XG5cbiAgICB0aGlzLkZPUk0uc2V0QXR0cmlidXRlKCdub3ZhbGlkYXRlJywgdHJ1ZSk7XG5cbiAgICByZXR1cm4gdGhpcztcbiAgfVxuXG4gIC8qKlxuICAgKiBNYXAgdG9nZ2xlZCBjaGVja2JveCB2YWx1ZXMgdG8gYW4gaW5wdXQuXG4gICAqIEBwYXJhbSAge09iamVjdH0gZXZlbnQgVGhlIHBhcmVudCBjbGljayBldmVudC5cbiAgICogQHJldHVybiB7RWxlbWVudH0gICAgICBUaGUgdGFyZ2V0IGVsZW1lbnQuXG4gICAqL1xuICBqb2luVmFsdWVzKGV2ZW50KSB7XG4gICAgaWYgKCFldmVudC50YXJnZXQubWF0Y2hlcygnaW5wdXRbdHlwZT1cImNoZWNrYm94XCJdJykpXG4gICAgICByZXR1cm47XG5cbiAgICBpZiAoIWV2ZW50LnRhcmdldC5jbG9zZXN0KCdbZGF0YS1qcy1qb2luLXZhbHVlc10nKSlcbiAgICAgIHJldHVybjtcblxuICAgIGxldCBlbCA9IGV2ZW50LnRhcmdldC5jbG9zZXN0KCdbZGF0YS1qcy1qb2luLXZhbHVlc10nKTtcbiAgICBsZXQgdGFyZ2V0ID0gZG9jdW1lbnQucXVlcnlTZWxlY3RvcihlbC5kYXRhc2V0LmpzSm9pblZhbHVlcyk7XG5cbiAgICB0YXJnZXQudmFsdWUgPSBBcnJheS5mcm9tKFxuICAgICAgICBlbC5xdWVyeVNlbGVjdG9yQWxsKCdpbnB1dFt0eXBlPVwiY2hlY2tib3hcIl0nKVxuICAgICAgKVxuICAgICAgLmZpbHRlcigoZSkgPT4gKGUudmFsdWUgJiYgZS5jaGVja2VkKSlcbiAgICAgIC5tYXAoKGUpID0+IGUudmFsdWUpXG4gICAgICAuam9pbignLCAnKTtcblxuICAgIHJldHVybiB0YXJnZXQ7XG4gIH1cblxuICAvKipcbiAgICogQSBzaW1wbGUgZm9ybSB2YWxpZGF0aW9uIGNsYXNzIHRoYXQgdXNlcyBuYXRpdmUgZm9ybSB2YWxpZGF0aW9uLiBJdCB3aWxsXG4gICAqIGFkZCBhcHByb3ByaWF0ZSBmb3JtIGZlZWRiYWNrIGZvciBlYWNoIGlucHV0IHRoYXQgaXMgaW52YWxpZCBhbmQgbmF0aXZlXG4gICAqIGxvY2FsaXplZCBicm93c2VyIG1lc3NhZ2luZy5cbiAgICpcbiAgICogU2VlIGh0dHBzOi8vZGV2ZWxvcGVyLm1vemlsbGEub3JnL2VuLVVTL2RvY3MvTGVhcm4vSFRNTC9Gb3Jtcy9Gb3JtX3ZhbGlkYXRpb25cbiAgICogU2VlIGh0dHBzOi8vY2FuaXVzZS5jb20vI2ZlYXQ9Zm9ybS12YWxpZGF0aW9uIGZvciBzdXBwb3J0XG4gICAqXG4gICAqIEBwYXJhbSAge0V2ZW50fSAgICAgICAgIGV2ZW50IFRoZSBmb3JtIHN1Ym1pc3Npb24gZXZlbnRcbiAgICogQHJldHVybiB7Q2xhc3MvQm9vbGVhbn0gICAgICAgVGhlIGZvcm0gY2xhc3Mgb3IgZmFsc2UgaWYgaW52YWxpZFxuICAgKi9cbiAgdmFsaWQoZXZlbnQpIHtcbiAgICBsZXQgdmFsaWRpdHkgPSBldmVudC50YXJnZXQuY2hlY2tWYWxpZGl0eSgpO1xuICAgIGxldCBlbGVtZW50cyA9IGV2ZW50LnRhcmdldC5xdWVyeVNlbGVjdG9yQWxsKHRoaXMuc2VsZWN0b3JzLlJFUVVJUkVEKTtcblxuICAgIGZvciAobGV0IGkgPSAwOyBpIDwgZWxlbWVudHMubGVuZ3RoOyBpKyspIHtcbiAgICAgIC8vIFJlbW92ZSBvbGQgbWVzc2FnaW5nIGlmIGl0IGV4aXN0c1xuICAgICAgbGV0IGVsID0gZWxlbWVudHNbaV07XG5cbiAgICAgIHRoaXMucmVzZXQoZWwpO1xuXG4gICAgICAvLyBJZiB0aGlzIGlucHV0IHZhbGlkLCBza2lwIG1lc3NhZ2luZ1xuICAgICAgaWYgKGVsLnZhbGlkaXR5LnZhbGlkKSBjb250aW51ZTtcblxuICAgICAgdGhpcy5oaWdobGlnaHQoZWwpO1xuICAgIH1cblxuICAgIHJldHVybiAodmFsaWRpdHkpID8gdGhpcyA6IHZhbGlkaXR5O1xuICB9XG5cbiAgLyoqXG4gICAqIEFkZHMgZm9jdXMgYW5kIGJsdXIgZXZlbnRzIHRvIGlucHV0cyB3aXRoIHJlcXVpcmVkIGF0dHJpYnV0ZXNcbiAgICogQHBhcmFtICAge29iamVjdH0gIGZvcm0gIFBhc3NpbmcgYSBmb3JtIGlzIHBvc3NpYmxlLCBvdGhlcndpc2UgaXQgd2lsbCB1c2VcbiAgICogICAgICAgICAgICAgICAgICAgICAgICAgIHRoZSBmb3JtIHBhc3NlZCB0byB0aGUgY29uc3RydWN0b3IuXG4gICAqIEByZXR1cm4gIHtjbGFzc30gICAgICAgICBUaGUgZm9ybSBjbGFzc1xuICAgKi9cbiAgd2F0Y2goZm9ybSA9IGZhbHNlKSB7XG4gICAgdGhpcy5GT1JNID0gKGZvcm0pID8gZm9ybSA6IHRoaXMuRk9STTtcblxuICAgIGxldCBlbGVtZW50cyA9IHRoaXMuRk9STS5xdWVyeVNlbGVjdG9yQWxsKHRoaXMuc2VsZWN0b3JzLlJFUVVJUkVEKTtcblxuICAgIC8qKiBXYXRjaCBJbmRpdmlkdWFsIElucHV0cyAqL1xuICAgIGZvciAobGV0IGkgPSAwOyBpIDwgZWxlbWVudHMubGVuZ3RoOyBpKyspIHtcbiAgICAgIC8vIFJlbW92ZSBvbGQgbWVzc2FnaW5nIGlmIGl0IGV4aXN0c1xuICAgICAgbGV0IGVsID0gZWxlbWVudHNbaV07XG5cbiAgICAgIGVsLmFkZEV2ZW50TGlzdGVuZXIoJ2ZvY3VzJywgKCkgPT4ge1xuICAgICAgICB0aGlzLnJlc2V0KGVsKTtcbiAgICAgIH0pO1xuXG4gICAgICBlbC5hZGRFdmVudExpc3RlbmVyKCdibHVyJywgKCkgPT4ge1xuICAgICAgICBpZiAoIWVsLnZhbGlkaXR5LnZhbGlkKVxuICAgICAgICAgIHRoaXMuaGlnaGxpZ2h0KGVsKTtcbiAgICAgIH0pO1xuICAgIH1cblxuICAgIC8qKiBTdWJtaXQgRXZlbnQgKi9cbiAgICB0aGlzLkZPUk0uYWRkRXZlbnRMaXN0ZW5lcignc3VibWl0JywgKGV2ZW50KSA9PiB7XG4gICAgICBldmVudC5wcmV2ZW50RGVmYXVsdCgpO1xuXG4gICAgICBpZiAodGhpcy52YWxpZChldmVudCkgPT09IGZhbHNlKVxuICAgICAgICByZXR1cm4gZmFsc2U7XG5cbiAgICAgIHRoaXMuc3VibWl0KGV2ZW50KTtcbiAgICB9KTtcblxuICAgIHJldHVybiB0aGlzO1xuICB9XG5cbiAgLyoqXG4gICAqIFJlbW92ZXMgdGhlIHZhbGlkaXR5IG1lc3NhZ2UgYW5kIGNsYXNzZXMgZnJvbSB0aGUgbWVzc2FnZS5cbiAgICogQHBhcmFtICAge29iamVjdH0gIGVsICBUaGUgaW5wdXQgZWxlbWVudFxuICAgKiBAcmV0dXJuICB7Y2xhc3N9ICAgICAgIFRoZSBmb3JtIGNsYXNzXG4gICAqL1xuICByZXNldChlbCkge1xuICAgIGxldCBjb250YWluZXIgPSAodGhpcy5zZWxlY3RvcnMuRVJST1JfTUVTU0FHRV9QQVJFTlQpXG4gICAgICA/IGVsLmNsb3Nlc3QodGhpcy5zZWxlY3RvcnMuRVJST1JfTUVTU0FHRV9QQVJFTlQpIDogZWwucGFyZW50Tm9kZTtcblxuICAgIGxldCBtZXNzYWdlID0gY29udGFpbmVyLnF1ZXJ5U2VsZWN0b3IoJy4nICsgdGhpcy5jbGFzc2VzLkVSUk9SX01FU1NBR0UpO1xuXG4gICAgLy8gUmVtb3ZlIG9sZCBtZXNzYWdpbmcgaWYgaXQgZXhpc3RzXG4gICAgY29udGFpbmVyLmNsYXNzTGlzdC5yZW1vdmUodGhpcy5jbGFzc2VzLkVSUk9SX0NPTlRBSU5FUik7XG4gICAgaWYgKG1lc3NhZ2UpIG1lc3NhZ2UucmVtb3ZlKCk7XG5cbiAgICAvLyBSZW1vdmUgZXJyb3IgY2xhc3MgZnJvbSB0aGUgZm9ybVxuICAgIGNvbnRhaW5lci5jbG9zZXN0KCdmb3JtJykuY2xhc3NMaXN0LnJlbW92ZSh0aGlzLmNsYXNzZXMuRVJST1JfQ09OVEFJTkVSKTtcblxuICAgIC8vIFJlbW92ZSBkeW5hbWljIGF0dHJpYnV0ZXMgZnJvbSB0aGUgaW5wdXRcbiAgICBlbC5yZW1vdmVBdHRyaWJ1dGUodGhpcy5hdHRycy5FUlJPUl9JTlBVVFswXSk7XG4gICAgZWwucmVtb3ZlQXR0cmlidXRlKHRoaXMuYXR0cnMuRVJST1JfTEFCRUwpO1xuXG4gICAgcmV0dXJuIHRoaXM7XG4gIH1cblxuICAvKipcbiAgICogRGlzcGxheXMgYSB2YWxpZGl0eSBtZXNzYWdlIHRvIHRoZSB1c2VyLiBJdCB3aWxsIGZpcnN0IHVzZSBhbnkgbG9jYWxpemVkXG4gICAqIHN0cmluZyBwYXNzZWQgdG8gdGhlIGNsYXNzIGZvciByZXF1aXJlZCBmaWVsZHMgbWlzc2luZyBpbnB1dC4gSWYgdGhlXG4gICAqIGlucHV0IGlzIGZpbGxlZCBpbiBidXQgZG9lc24ndCBtYXRjaCB0aGUgcmVxdWlyZWQgcGF0dGVybiwgaXQgd2lsbCB1c2VcbiAgICogYSBsb2NhbGl6ZWQgc3RyaW5nIHNldCBmb3IgdGhlIHNwZWNpZmljIGlucHV0IHR5cGUuIElmIG9uZSBpc24ndCBwcm92aWRlZFxuICAgKiBpdCB3aWxsIHVzZSB0aGUgZGVmYXVsdCBicm93c2VyIHByb3ZpZGVkIG1lc3NhZ2UuXG4gICAqIEBwYXJhbSAgIHtvYmplY3R9ICBlbCAgVGhlIGludmFsaWQgaW5wdXQgZWxlbWVudFxuICAgKiBAcmV0dXJuICB7Y2xhc3N9ICAgICAgIFRoZSBmb3JtIGNsYXNzXG4gICAqL1xuICBoaWdobGlnaHQoZWwpIHtcbiAgICBsZXQgY29udGFpbmVyID0gKHRoaXMuc2VsZWN0b3JzLkVSUk9SX01FU1NBR0VfUEFSRU5UKVxuICAgICAgPyBlbC5jbG9zZXN0KHRoaXMuc2VsZWN0b3JzLkVSUk9SX01FU1NBR0VfUEFSRU5UKSA6IGVsLnBhcmVudE5vZGU7XG5cbiAgICAvLyBDcmVhdGUgdGhlIG5ldyBlcnJvciBtZXNzYWdlLlxuICAgIGxldCBtZXNzYWdlID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCh0aGlzLm1hcmt1cC5FUlJPUl9NRVNTQUdFKTtcbiAgICBsZXQgaWQgPSBgJHtlbC5nZXRBdHRyaWJ1dGUoJ2lkJyl9LSR7dGhpcy5jbGFzc2VzLkVSUk9SX01FU1NBR0V9YDtcblxuICAgIC8vIEdldCB0aGUgZXJyb3IgbWVzc2FnZSBmcm9tIGxvY2FsaXplZCBzdHJpbmdzIChpZiBzZXQpLlxuICAgIGlmIChlbC52YWxpZGl0eS52YWx1ZU1pc3NpbmcgJiYgdGhpcy5zdHJpbmdzLlZBTElEX1JFUVVJUkVEKVxuICAgICAgbWVzc2FnZS5pbm5lckhUTUwgPSB0aGlzLnN0cmluZ3MuVkFMSURfUkVRVUlSRUQ7XG4gICAgZWxzZSBpZiAoIWVsLnZhbGlkaXR5LnZhbGlkICYmXG4gICAgICB0aGlzLnN0cmluZ3NbYFZBTElEXyR7ZWwudHlwZS50b1VwcGVyQ2FzZSgpfV9JTlZBTElEYF0pIHtcbiAgICAgIGxldCBzdHJpbmdLZXkgPSBgVkFMSURfJHtlbC50eXBlLnRvVXBwZXJDYXNlKCl9X0lOVkFMSURgO1xuICAgICAgbWVzc2FnZS5pbm5lckhUTUwgPSB0aGlzLnN0cmluZ3Nbc3RyaW5nS2V5XTtcbiAgICB9IGVsc2VcbiAgICAgIG1lc3NhZ2UuaW5uZXJIVE1MID0gZWwudmFsaWRhdGlvbk1lc3NhZ2U7XG5cbiAgICAvLyBTZXQgYXJpYSBhdHRyaWJ1dGVzIGFuZCBjc3MgY2xhc3NlcyB0byB0aGUgbWVzc2FnZVxuICAgIG1lc3NhZ2Uuc2V0QXR0cmlidXRlKCdpZCcsIGlkKTtcbiAgICBtZXNzYWdlLnNldEF0dHJpYnV0ZSh0aGlzLmF0dHJzLkVSUk9SX01FU1NBR0VbMF0sXG4gICAgICB0aGlzLmF0dHJzLkVSUk9SX01FU1NBR0VbMV0pO1xuICAgIG1lc3NhZ2UuY2xhc3NMaXN0LmFkZCh0aGlzLmNsYXNzZXMuRVJST1JfTUVTU0FHRSk7XG5cbiAgICAvLyBBZGQgdGhlIGVycm9yIGNsYXNzIGFuZCBlcnJvciBtZXNzYWdlIHRvIHRoZSBkb20uXG4gICAgY29udGFpbmVyLmNsYXNzTGlzdC5hZGQodGhpcy5jbGFzc2VzLkVSUk9SX0NPTlRBSU5FUik7XG4gICAgY29udGFpbmVyLmluc2VydEJlZm9yZShtZXNzYWdlLCBjb250YWluZXIuY2hpbGROb2Rlc1swXSk7XG5cbiAgICAvLyBBZGQgdGhlIGVycm9yIGNsYXNzIHRvIHRoZSBmb3JtXG4gICAgY29udGFpbmVyLmNsb3Nlc3QoJ2Zvcm0nKS5jbGFzc0xpc3QuYWRkKHRoaXMuY2xhc3Nlcy5FUlJPUl9DT05UQUlORVIpO1xuXG4gICAgLy8gQWRkIGR5bmFtaWMgYXR0cmlidXRlcyB0byB0aGUgaW5wdXRcbiAgICBlbC5zZXRBdHRyaWJ1dGUodGhpcy5hdHRycy5FUlJPUl9JTlBVVFswXSwgdGhpcy5hdHRycy5FUlJPUl9JTlBVVFsxXSk7XG4gICAgZWwuc2V0QXR0cmlidXRlKHRoaXMuYXR0cnMuRVJST1JfTEFCRUwsIGlkKTtcblxuICAgIHJldHVybiB0aGlzO1xuICB9XG59XG5cbi8qKlxuICogQSBkaWN0aW9uYWlyeSBvZiBzdHJpbmdzIGluIHRoZSBmb3JtYXQuXG4gKiB7XG4gKiAgICdWQUxJRF9SRVFVSVJFRCc6ICdUaGlzIGlzIHJlcXVpcmVkJyxcbiAqICAgJ1ZBTElEX3t7IFRZUEUgfX1fSU5WQUxJRCc6ICdJbnZhbGlkJ1xuICogfVxuICovXG5Gb3Jtcy5zdHJpbmdzID0ge307XG5cbi8qKiBQbGFjZWhvbGRlciBmb3IgdGhlIHN1Ym1pdCBmdW5jdGlvbiAqL1xuRm9ybXMuc3VibWl0ID0gZnVuY3Rpb24oKSB7fTtcblxuLyoqIENsYXNzZXMgZm9yIHZhcmlvdXMgY29udGFpbmVycyAqL1xuRm9ybXMuY2xhc3NlcyA9IHtcbiAgJ0VSUk9SX01FU1NBR0UnOiAnZXJyb3ItbWVzc2FnZScsIC8vIGVycm9yIGNsYXNzIGZvciB0aGUgdmFsaWRpdHkgbWVzc2FnZVxuICAnRVJST1JfQ09OVEFJTkVSJzogJ2Vycm9yJywgLy8gY2xhc3MgZm9yIHRoZSB2YWxpZGl0eSBtZXNzYWdlIHBhcmVudFxuICAnRVJST1JfRk9STSc6ICdlcnJvcidcbn07XG5cbi8qKiBIVE1MIHRhZ3MgYW5kIG1hcmt1cCBmb3IgdmFyaW91cyBlbGVtZW50cyAqL1xuRm9ybXMubWFya3VwID0ge1xuICAnRVJST1JfTUVTU0FHRSc6ICdkaXYnLFxufTtcblxuLyoqIERPTSBTZWxlY3RvcnMgZm9yIHZhcmlvdXMgZWxlbWVudHMgKi9cbkZvcm1zLnNlbGVjdG9ycyA9IHtcbiAgJ1JFUVVJUkVEJzogJ1tyZXF1aXJlZD1cInRydWVcIl0nLCAvLyBTZWxlY3RvciBmb3IgcmVxdWlyZWQgaW5wdXQgZWxlbWVudHNcbiAgJ0VSUk9SX01FU1NBR0VfUEFSRU5UJzogZmFsc2Vcbn07XG5cbi8qKiBBdHRyaWJ1dGVzIGZvciB2YXJpb3VzIGVsZW1lbnRzICovXG5Gb3Jtcy5hdHRycyA9IHtcbiAgJ0VSUk9SX01FU1NBR0UnOiBbJ2FyaWEtbGl2ZScsICdwb2xpdGUnXSwgLy8gQXR0cmlidXRlIGZvciB2YWxpZCBlcnJvciBtZXNzYWdlXG4gICdFUlJPUl9JTlBVVCc6IFsnYXJpYS1pbnZhbGlkJywgJ3RydWUnXSxcbiAgJ0VSUk9SX0xBQkVMJzogJ2FyaWEtZGVzY3JpYmVkYnknXG59O1xuXG5leHBvcnQgZGVmYXVsdCBGb3JtcztcbiIsIlxuY29uc3QgZXJyb3JCb3hJZCA9ICdlcnJvcnMnXG5jb25zdCBpbmZvQm94SWQgPSAnaW5mbydcblxuY29uc3QgdG9UaXRsZUNhc2UgPSAoc3RyaW5nKSA9PiB7XG4gIHJldHVybiBzdHJpbmcuY2hhckF0KDApLnRvVXBwZXJDYXNlKCkgKyBzdHJpbmcuc2xpY2UoMSk7XG59XG5cbmNvbnN0IHNldFRleHRCb3ggPSAobWVzc2FnZVN0cmluZywgZGlzcGxheVN0YXRlLCBib3hJZCkgPT4ge1xuICB2YXIgZWxlID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoYm94SWQpO1xuICBpZiAoZWxlKSB7XG4gICAgZWxlLmlubmVySFRNTCA9ICc8dWwgY2xhc3M9XCJtLTAgcHgtMlwiPicgK1xuICAgICAgdG9UaXRsZUNhc2UobWVzc2FnZVN0cmluZy50cmltKCkpICsgJzwvdWw+JztcblxuICAgIGVsZS5zdHlsZS5kaXNwbGF5ID0gZGlzcGxheVN0YXRlO1xuXG4gICAgaWYgKGRpc3BsYXlTdGF0ZSA9PT0gJ25vbmUnKSB7XG4gICAgICBlbGUucmVtb3ZlQXR0cmlidXRlKCdhcmlhLWxpdmUnLCAncG9saXRlJylcbiAgICAgIGVsZS5jbGFzc0xpc3QucmVtb3ZlKCdhbmltYXRlZCcpXG4gICAgICBlbGUuY2xhc3NMaXN0LnJlbW92ZSgnZmFkZUluVXAnKVxuICAgIH0gZWxzZSB7XG4gICAgICBlbGUuc2V0QXR0cmlidXRlKCdhcmlhLWxpdmUnLCAncG9saXRlJylcbiAgICAgIGVsZS5jbGFzc0xpc3QuYWRkKCdhbmltYXRlZCcpXG4gICAgICBlbGUuY2xhc3NMaXN0LmFkZCgnZmFkZUluVXAnKVxuICAgIH1cbiAgfVxufVxuXG5leHBvcnQgY29uc3Qgc2VuZFBvc3RSZXF1ZXN0ID0gKHVybCwgaGVhZGVyc09iamVjdCwgcmVzcG9uc2VIYW5kbGVyLCByZXF1ZXN0UGF5bG9hZCkgPT4ge1xuICBzZXRUZXh0Qm94KCcnLCAnbm9uZScsIGVycm9yQm94SWQpXG4gIHNldFRleHRCb3goJycsICdub25lJywgaW5mb0JveElkKVxuXG4gIGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCdsb2FkZXInKS5zdHlsZS5kaXNwbGF5ID0gJ2Jsb2NrJ1xuXG4gIHZhciByZXEgPSBuZXcgWE1MSHR0cFJlcXVlc3QoKVxuXG4gIHJlcS5vcGVuKCdQT1NUJywgdXJsLCB0cnVlKTtcblxuICBPYmplY3Qua2V5cyhoZWFkZXJzT2JqZWN0KS5mb3JFYWNoKGZ1bmN0aW9uKGtleSkge1xuICAgIHJlcS5zZXRSZXF1ZXN0SGVhZGVyKGtleSwgaGVhZGVyc09iamVjdFtrZXldKTtcbiAgfSk7XG5cbiAgcmVxLm9ucmVhZHlzdGF0ZWNoYW5nZSA9IGZ1bmN0aW9uKCkge1xuICAgIGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCdsb2FkZXInKS5zdHlsZS5kaXNwbGF5ID0gJ25vbmUnXG4gICAgcmVzcG9uc2VIYW5kbGVyKHJlcSlcbiAgfVxuXG4gIHJlcS5zZW5kKHJlcXVlc3RQYXlsb2FkKVxufVxuXG5jb25zdCBkaXNwbGF5TGlzdFRleHQgPSAocmVzcG9uc2VUZXh0LCBzaG93UGF0aCwgaWQpID0+IHtcblxufVxuXG5leHBvcnQgY29uc3QgZGlzcGxheUVycm9ycyA9IChyZXNwb25zZVRleHQsIHNob3dQYXRoKSA9PiB7XG4gIHZhciBlcnJvckpTT05cbiAgdmFyIGVycm9yc0FycmF5ID0gW11cbiAgdHJ5IHtcbiAgICBlcnJvckpTT04gPSBKU09OLnBhcnNlKHJlc3BvbnNlVGV4dCkuZXJyb3JzXG4gICAgZXJyb3JzQXJyYXkgPSBlcnJvckpTT04ubWFwKGZ1bmN0aW9uKGVycm9yKSB7XG4gICAgICBjb25zdCB7IGVsZW1lbnRQYXRoLCBtZXNzYWdlIH0gPSBlcnJvclxuICAgICAgY29uc3QgZXJyb3JNc2cgPSBlbGVtZW50UGF0aCAmJiBzaG93UGF0aCA/XG4gICAgICAgIG1lc3NhZ2UgKyAnIEVsZW1lbnQgUGF0aDogJyArIGVsZW1lbnRQYXRoICsgJy4nIDogbWVzc2FnZVxuICAgICAgcmV0dXJuICc8bGk+JyArIGVycm9yTXNnICsgJzwvbGk+J1xuICAgIH0pXG4gIH0gY2F0Y2ggKGVycikge31cbiAgc2V0VGV4dEJveChlcnJvcnNBcnJheS5qb2luKCcnKSwgJ2Jsb2NrJywgZXJyb3JCb3hJZCk7XG59XG5cbmV4cG9ydCBjb25zdCBkaXNwbGF5SW5mbyA9IChpbmZvVGV4dCkgPT4ge1xuICBjb25zdCBpbmZvSFRNTCA9ICc8bGk+JyArIGluZm9UZXh0ICsgJzwvbGk+J1xuICBzZXRUZXh0Qm94KGluZm9IVE1MLCAnYmxvY2snLCBpbmZvQm94SWQpO1xufSIsImltcG9ydCBGb3JtcyBmcm9tICdAbnljb3Bwb3J0dW5pdHkvcHR0cm4tc2NyaXB0cy9zcmMvZm9ybXMvZm9ybXMnO1xuaW1wb3J0IHsgZGlzcGxheUVycm9ycywgZGlzcGxheUluZm8sIHNlbmRQb3N0UmVxdWVzdCB9IGZyb20gJy4vdXRpbCc7XG5cbmV4cG9ydCBkZWZhdWx0IGZ1bmN0aW9uKCkge1xuICBjb25zdCBTRUxFQ1RPUiA9ICdbZGF0YS1qcyo9XCJidWxrLXN1Ym1pc3Npb25cIl0nXG5cbiAgY29uc3QgZmlsZW5hbWUgPSAncmVzcG9uc2UuY3N2J1xuXG4gIGNvbnN0IEZvcm0gPSBuZXcgRm9ybXMoZG9jdW1lbnQucXVlcnlTZWxlY3RvcihTRUxFQ1RPUikpO1xuXG4gIGNvbnN0IGJ1bGtTdWJtaXNzaW9uSGFuZGxlciA9IChyZXEpID0+IHtcbiAgICBpZiAocmVxLnJlYWR5U3RhdGUgPT09IDQpIHtcbiAgICAgIGNvbnN0IHN0YXR1cyA9IHJlcS5zdGF0dXMudG9TdHJpbmcoKVxuICAgICAgaWYgKHN0YXR1c1swXSA9PT0gJzQnIHx8IHN0YXR1c1swXSA9PT0gJzUnKSB7XG4gICAgICAgIGRpc3BsYXlFcnJvcnMocmVxLnJlc3BvbnNlVGV4dCwgdHJ1ZSlcbiAgICAgIH0gZWxzZSBpZiAoc3RhdHVzWzBdID09PSAnMicpIHtcbiAgICAgICAgZGlzcGxheUluZm8oJ0J1bGsgc3VibWlzc2lvbiBzdWNjZXNzZnVsLiBBIENTViB3aXRoIHByb2dyYW0gY29kZXMgXFxcbiAgICAgICAgICBzaG91bGQgYmUgZG93bmxvYWRlZCBhdXRvbWF0aWNhbGx5LicpXG4gICAgICAgIGNvbnN0IGJsb2IgPSBuZXcgQmxvYihbcmVxLnJlc3BvbnNlXSwge3R5cGUgOiAndGV4dC9jc3YnfSlcbiAgICAgICAgaWYgKHR5cGVvZiB3aW5kb3cubmF2aWdhdG9yLm1zU2F2ZUJsb2IgIT09ICd1bmRlZmluZWQnKSB7XG4gICAgICAgICAgd2luZG93Lm5hdmlnYXRvci5tc1NhdmVCbG9iKGJsb2IsIGZpbGVuYW1lKVxuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgIGNvbnN0IFVSTCA9IHdpbmRvdy5VUkwgfHwgd2luZG93LndlYmtpdFVSTFxuICAgICAgICAgIGNvbnN0IGRvd25sb2FkVXJsID0gVVJMLmNyZWF0ZU9iamVjdFVSTChibG9iKVxuXG4gICAgICAgICAgY29uc3QgYSA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ2EnKVxuXG4gICAgICAgICAgaWYgKHR5cGVvZiBhLmRvd25sb2FkID09PSAndW5kZWZpbmVkJykge1xuICAgICAgICAgICAgd2luZG93LmxvY2F0aW9uID0gZG93bmxvYWRVcmxcbiAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgYS5ocmVmID0gZG93bmxvYWRVcmxcbiAgICAgICAgICAgIGEuZG93bmxvYWQgPSBmaWxlbmFtZVxuICAgICAgICAgICAgZG9jdW1lbnQuYm9keS5hcHBlbmRDaGlsZChhKVxuICAgICAgICAgICAgYS5jbGljaygpXG4gICAgICAgICAgfVxuXG4gICAgICAgICAgc2V0VGltZW91dCgoKSA9PiB7XG4gICAgICAgICAgICBVUkwucmV2b2tlT2JqZWN0VVJMKGRvd25sb2FkVXJsKVxuICAgICAgICAgIH0sIDEwMClcbiAgICAgICAgfVxuICAgICAgfVxuICAgIH1cbiAgfVxuXG4gIGNvbnN0IHNlbmRCdWxrU3VibWlzc2lvblJlcXVlc3QgPSAoZm9ybVZhbHVlcywgdG9rZW4pID0+IHtcbiAgICBjb25zdCB7IGJhc2V1cmwsIHVzZXJuYW1lLCBjc3ZGaWxlIH0gPSBmb3JtVmFsdWVzXG4gICAgdmFyIHVybCA9IGJhc2V1cmwgKyAnYnVsa1N1Ym1pc3Npb24vaW1wb3J0J1xuICAgIGlmIChmb3JtVmFsdWVzLnByb2dyYW1zKSB7XG4gICAgICB2YXIgcHJvZ3JhbXMgPSBmb3JtVmFsdWVzLnByb2dyYW1zLnNwbGl0KCcsJykubWFwKHAgPT4gcC50cmltKCkpLmpvaW4oJywnKVxuICAgICAgdXJsID0gdXJsICsgJz9pbnRlcmVzdGVkUHJvZ3JhbXM9JyArIHByb2dyYW1zXG4gICAgfVxuICAgIHZhciBoZWFkZXJzT2JqZWN0ID0ge1xuICAgICAgJ0F1dGhvcml6YXRpb24nOiB0b2tlblxuICAgIH1cbiAgICB2YXIgZm9ybURhdGEgPSBuZXcgRm9ybURhdGEoKTtcbiAgICBmb3JtRGF0YS5hcHBlbmQoJ2ZpbGUnLCBjc3ZGaWxlKTtcbiAgICBzZW5kUG9zdFJlcXVlc3QodXJsLCBoZWFkZXJzT2JqZWN0LCBidWxrU3VibWlzc2lvbkhhbmRsZXIsIGZvcm1EYXRhKVxuICB9XG5cbiAgY29uc3QgYXV0aFJlc3BvbnNlSGFuZGxlciA9IChmb3JtVmFsdWVzKSA9PiAocmVxKSA9PiB7XG4gICAgaWYgKHJlcS5yZWFkeVN0YXRlID09PSA0KSB7XG4gICAgICBjb25zdCBzdGF0dXMgPSByZXEuc3RhdHVzLnRvU3RyaW5nKClcbiAgICAgIGlmIChzdGF0dXNbMF0gPT09ICc0JyB8fCBzdGF0dXNbMF0gPT09ICc1Jykge1xuICAgICAgICBkaXNwbGF5RXJyb3JzKHJlcS5yZXNwb25zZVRleHQsIGZhbHNlKVxuICAgICAgfSBlbHNlIGlmIChzdGF0dXNbMF0gPT09ICcyJykge1xuICAgICAgICBzZW5kQnVsa1N1Ym1pc3Npb25SZXF1ZXN0KGZvcm1WYWx1ZXMsXG4gICAgICAgICAgSlNPTi5wYXJzZShyZXEucmVzcG9uc2VUZXh0KS50b2tlbilcbiAgICAgIH1cbiAgICB9XG4gIH1cblxuICBjb25zdCBzdWJtaXQgPSAoZXZlbnQpID0+IHtcbiAgICBjb25zdCBiYXNldXJsID0gZXZlbnQudGFyZ2V0LmFjdGlvbjtcbiAgICBjb25zdCB1c2VybmFtZSA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCd1c2VybmFtZScpLnZhbHVlXG4gICAgY29uc3QgcGFzc3dvcmQgPSBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgncGFzc3dvcmQnKS52YWx1ZVxuICAgIGNvbnN0IHByb2dyYW1zID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ3Byb2dyYW1zJykudmFsdWVcbiAgICBjb25zdCBjc3ZGaWxlSW5wdXQgPSBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgnY3N2LXVwbG9hZCcpXG5cbiAgICBjb25zdCBjc3ZGaWxlID0gY3N2RmlsZUlucHV0LmZpbGVzICYmXG4gICAgICBjc3ZGaWxlSW5wdXQuZmlsZXMubGVuZ3RoID4gMCAmJlxuICAgICAgY3N2RmlsZUlucHV0LmZpbGVzWzBdXG5cbiAgICBsZXQgZm9ybVZhbHVlcyA9IHtcbiAgICAgIGJhc2V1cmw6IGJhc2V1cmwsXG4gICAgICB1c2VybmFtZTogdXNlcm5hbWUsXG4gICAgICBwYXNzd29yZDogcGFzc3dvcmQsXG4gICAgICBjc3ZGaWxlOiBjc3ZGaWxlXG4gICAgfVxuXG4gICAgaWYgKHByb2dyYW1zICE9PSAnJykgZm9ybVZhbHVlcy5wcm9ncmFtcyA9IHByb2dyYW1zXG5cbiAgICB2YXIgdXJsID0gYmFzZXVybCArICdhdXRoVG9rZW4nXG4gICAgdmFyIGhlYWRlcnNPYmplY3QgPSB7XG4gICAgICAnQ29udGVudC10eXBlJzogJ2FwcGxpY2F0aW9uL2pzb24nLFxuICAgICAgJ0FjY2Vzcy1Db250cm9sLUFsbG93LU9yaWdpbic6ICcqJ1xuICAgIH1cblxuICAgIGNvbnN0IGF1dGhQYXlsb2FkID0geyB1c2VybmFtZSwgcGFzc3dvcmQgfVxuXG4gICAgc2VuZFBvc3RSZXF1ZXN0KHVybCwgaGVhZGVyc09iamVjdCwgYXV0aFJlc3BvbnNlSGFuZGxlcihmb3JtVmFsdWVzKSxcbiAgICAgIEpTT04uc3RyaW5naWZ5KGF1dGhQYXlsb2FkKSlcbiAgfTtcblxuICBGb3JtLnNlbGVjdG9ycy5FUlJPUl9NRVNTQUdFX1BBUkVOVCA9ICdbZGF0YS1qcyo9XCJxdWVzdGlvbi1jb250YWluZXJcIl0nO1xuXG4gIEZvcm0ud2F0Y2goKTtcblxuICBGb3JtLnN1Ym1pdCA9IHN1Ym1pdDtcbn1cbiIsImltcG9ydCBGb3JtcyBmcm9tICdAbnljb3Bwb3J0dW5pdHkvcHR0cm4tc2NyaXB0cy9zcmMvZm9ybXMvZm9ybXMnO1xuaW1wb3J0IHsgZGlzcGxheUVycm9ycywgZGlzcGxheUluZm8sIHNlbmRQb3N0UmVxdWVzdCB9IGZyb20gJy4vdXRpbCc7XG5cbmV4cG9ydCBkZWZhdWx0IGZ1bmN0aW9uKCkge1xuICBjb25zdCBTRUxFQ1RPUiA9ICdbZGF0YS1qcyo9XCJjaGFuZ2UtcGFzc3dvcmRcIl0nXG5cbiAgY29uc3QgRm9ybSA9IG5ldyBGb3Jtcyhkb2N1bWVudC5xdWVyeVNlbGVjdG9yKFNFTEVDVE9SKSk7XG5cbiAgY29uc3QgcmVzcG9uc2VIYW5kbGVyID0gKHJlcSkgPT4ge1xuICAgIGlmIChyZXEucmVhZHlTdGF0ZSA9PT0gNCkge1xuICAgICAgY29uc3Qgc3RhdHVzID0gcmVxLnN0YXR1cy50b1N0cmluZygpXG4gICAgICBpZiAoc3RhdHVzWzBdID09PSAnNCcgfHwgc3RhdHVzWzBdID09PSAnNScpIHtcbiAgICAgICAgZGlzcGxheUVycm9ycyhyZXEucmVzcG9uc2VUZXh0LCBmYWxzZSlcbiAgICAgIH0gZWxzZSBpZiAoc3RhdHVzWzBdID09PSAnMicpIHtcbiAgICAgICAgZGlzcGxheUluZm8oJ1Bhc3N3b3JkIHVwZGF0ZWQnKVxuICAgICAgfVxuICAgIH1cbiAgfVxuXG5cbiAgY29uc3Qgc3VibWl0ID0gKGV2ZW50KSA9PiB7XG4gICAgY29uc3QgZG9tYWluID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ2RvbWFpbicpLnZhbHVlXG4gICAgY29uc3QgdXNlcm5hbWUgPSBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgndXNlcm5hbWUnKS52YWx1ZVxuICAgIGNvbnN0IHBhc3N3b3JkID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ3Bhc3N3b3JkJykudmFsdWVcbiAgICBjb25zdCBuZXdQYXNzd29yZCA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCduZXdwYXNzd29yZCcpLnZhbHVlXG5cbiAgICB2YXIgdXJsID0gZG9tYWluICsgJ2F1dGhUb2tlbidcbiAgICB2YXIgaGVhZGVyc09iamVjdCA9IHtcbiAgICAgICdDb250ZW50LXR5cGUnOiAnYXBwbGljYXRpb24vanNvbicsXG4gICAgICAnQWNjZXNzLUNvbnRyb2wtQWxsb3ctT3JpZ2luJzogJyonXG4gICAgfVxuXG4gICAgY29uc3QgYXV0aFBheWxvYWQgPSB7IHVzZXJuYW1lLCBwYXNzd29yZCwgbmV3UGFzc3dvcmQgfVxuXG4gICAgc2VuZFBvc3RSZXF1ZXN0KHVybCwgaGVhZGVyc09iamVjdCwgcmVzcG9uc2VIYW5kbGVyLFxuICAgICAgSlNPTi5zdHJpbmdpZnkoYXV0aFBheWxvYWQpKVxuICB9O1xuXG4gIEZvcm0uc2VsZWN0b3JzLkVSUk9SX01FU1NBR0VfUEFSRU5UID0gJ1tkYXRhLWpzKj1cInF1ZXN0aW9uLWNvbnRhaW5lclwiXSc7XG5cbiAgRm9ybS53YXRjaCgpO1xuXG4gIEZvcm0uc3VibWl0ID0gc3VibWl0O1xufVxuIiwiLyoqXG4gKiBDb252ZXJ0cyBmb3JtIHRvIEpTT05cbiAqL1xuXG5pbXBvcnQgcmVzcG9uc2VzIGZyb20gJy4vcmVzcG9uc2VzLmpzJztcblxuZXhwb3J0IGRlZmF1bHQgZnVuY3Rpb24oKSB7XG4gICQoJy5zY3JlZW5lci1mb3JtJykuZmFkZUluKDUwMClcblxuICB2YXIgaW5jb21lc0NvbnRhaW5lciA9ICQoJy5pbmNvbWVzJykuY2xvbmUoKTtcbiAgdmFyIGV4cGVuc2VzQ29udGFpbmVyID0gJCgnLmV4cGVuc2VzJykuY2xvbmUoKTtcblxuICAkKCcuaW5jb21lcycpLnJlbW92ZSgpO1xuICAkKCcuZXhwZW5zZXMnKS5yZW1vdmUoKTtcblxuICB2YXIgcGVyc29uQ29udGFpbmVyID0gJCgnLnBlcnNvbi1kYXRhOmZpcnN0JykuY2xvbmUoKTtcblxuICAvKiBHZW5lcmF0ZSB0aGUgZW50aXJlIEpTT04gKi9cbiAgJCgnLmdlbmVyYXRlLWpzb24nKS5vbignY2xpY2snLCBmdW5jdGlvbihldmVudCl7XG4gICAgZXZlbnQucHJldmVudERlZmF1bHQoKTtcblxuICAgIHZhciBmb3JtZGF0YT0kKCcuc2NyZWVuZXItZm9ybScpO1xuXG4gICAgdmFyIGZpbmFsT2JqID0ge1xuICAgICAgaG91c2Vob2xkOiBbXSxcbiAgICAgIHBlcnNvbjogW11cbiAgICB9O1xuXG4gICAgdmFyIGhvdXNlaG9sZE9iaiA9IGdlbmVyYXRlSG91c2Vob2xkT2JqKGZvcm1kYXRhKTtcbiAgICBmaW5hbE9ialsnaG91c2Vob2xkJ10ucHVzaChob3VzZWhvbGRPYmopO1xuXG4gICAgdmFyIHBlcnNvbk9iaiA9IHt9XG4gICAgJCgnLnBlcnNvbi1kYXRhJykuZWFjaChmdW5jdGlvbihwaSkge1xuICAgICAgcGVyc29uT2JqID0gZ2VuZXJhdGVQZXJzb25PYmooZm9ybWRhdGEsIHBpKTtcbiAgICAgIGZpbmFsT2JqWydwZXJzb24nXS5wdXNoKHBlcnNvbk9iaik7XG4gICAgfSlcblxuICAgIGZpbmFsT2JqWyd3aXRoaG9sZFBheWxvYWQnXSA9IFN0cmluZyhmb3JtZGF0YS5maW5kKCdbbmFtZT13aXRoaG9sZFBheWxvYWRdJykuaXMoJzpjaGVja2VkJykpO1xuXG4gICAgdmFyIGhhc0Vycm9ycyA9IHZhbGlkYXRlRmllbGRzKGZvcm1kYXRhKTtcblxuICAgIGlmIChoYXNFcnJvcnNbXCJlcnJvcnNcIl0gPiAwICkge1xuICAgICAgJCgnLmVycm9yLW1zZycpLnJlbW92ZUNsYXNzKCdoaWRkZW4nKTtcbiAgICB9ZWxzZSB7XG4gICAgICAkKCcuZXJyb3ItbXNnJykuYWRkQ2xhc3MoJ2hpZGRlbicpO1xuICAgICAgJCgnLmVycm9yJykucmVtb3ZlQ2xhc3MoJ2Vycm9yJyk7XG4gICAgICAkKCcuc2NyZWVuZXItZm9ybScpLmhpZGUoKTtcbiAgICAgICQoJy5zY3JlZW5lci1qc29uJykuZmluZCgncHJlJykucmVtb3ZlKCk7XG4gICAgICAkKCcuc2NyZWVuZXItanNvbicpLnByZXBlbmQoJzxwcmUgY2xhc3M9XCJibG9ja1wiPjxjb2RlIGNsYXNzPVwiY29kZVwiPicgKyBKU09OLnN0cmluZ2lmeShbZmluYWxPYmpdLCB1bmRlZmluZWQsIDIpICsgJzwvY29kZT48L3ByZT4nKTtcbiAgICAgICQoJy5zY3JlZW5lci1qc29uJykucmVtb3ZlQ2xhc3MoJ2hpZGRlbicpO1xuICAgIH1cbiAgICBpZiAoaGFzRXJyb3JzW1wid2FybmluZ3NcIl0gPiAwICkge1xuICAgICAgJCgnLndhcm5pbmctbXNnJykucmVtb3ZlQ2xhc3MoJ2hpZGRlbicpO1xuICAgIH1lbHNlIHtcbiAgICAgICQoJy53YXJuaW5nLW1zZycpLmFkZENsYXNzKCdoaWRkZW4nKTtcbiAgICB9XG4gIH0pXG5cbiAgLyogR28gYmFjayB0byB0aGUgZm9ybSAqL1xuICAkKCcuZ2VuZXJhdGUtZm9ybScpLm9uKCdjbGljaycsIGZ1bmN0aW9uKGV2ZW50KSB7XG4gICAgZXZlbnQucHJldmVudERlZmF1bHQoKTtcbiAgICAkKCcuc2NyZWVuZXItanNvbicpLmFkZENsYXNzKCdoaWRkZW4nKTtcbiAgICAkKCcuc2NyZWVuZXItZm9ybScpLnNob3coKTtcbiAgfSlcblxuICAkKGRvY3VtZW50KS5vbignY2hhbmdlJywnW25hbWU9bGl2aW5nVHlwZV0nLCBmdW5jdGlvbihldmVudCkge1xuICAgIGV2ZW50LnByZXZlbnREZWZhdWx0KCk7XG4gICAgaWYoJCh0aGlzKS52YWwoKSA9PSAnbGl2aW5nUmVudGluZycpe1xuICAgICAgJCgnLmxpdmluZ1JlbnRhbFR5cGUnKS5yZW1vdmVDbGFzcygnaGlkZGVuJyk7XG4gICAgICAkKCcubGVhc2UnKS5yZW1vdmVDbGFzcygnaGlkZGVuJyk7XG4gICAgICBwZXJzb25Db250YWluZXIuZmluZCgnLmxlYXNlJykucmVtb3ZlQ2xhc3MoJ2hpZGRlbicpO1xuICAgIH0gZWxzZSB7XG4gICAgICAkKCcubGl2aW5nUmVudGFsVHlwZScpLmFkZENsYXNzKCdoaWRkZW4nKTtcbiAgICAgICQoJy5sZWFzZScpLmFkZENsYXNzKCdoaWRkZW4nKTtcbiAgICB9XG4gICAgaWYoJCh0aGlzKS52YWwoKSA9PSAnbGl2aW5nT3duZXInKXtcbiAgICAgICQoJy5kZWVkJykucmVtb3ZlQ2xhc3MoJ2hpZGRlbicpO1xuICAgICAgcGVyc29uQ29udGFpbmVyLmZpbmQoJy5kZWVkJykucmVtb3ZlQ2xhc3MoJ2hpZGRlbicpO1xuICAgIH0gZWxzZSB7XG4gICAgICAkKCcuZGVlZCcpLmFkZENsYXNzKCdoaWRkZW4nKTtcbiAgICB9XG4gIH0pXG5cbiAgLyogQWRkIHBlcnNvbiAqL1xuICAkKGRvY3VtZW50KS5vbignY2xpY2snLCcuYWRkLXBlcnNvbicsIGZ1bmN0aW9uKGV2ZW50KSB7XG4gICAgZXZlbnQucHJldmVudERlZmF1bHQoKTtcblxuICAgICQoJy5hZGQtcmVtb3ZlJykuZmluZCgnLmVycm9yJykucmVtb3ZlKClcblxuICAgIGlmICgkKCcucGVyc29uLWRhdGEnKS5sZW5ndGggPiA4KSB7XG4gICAgICAkKHRoaXMpLnBhcmVudCgpLmFwcGVuZCgnPHAgY2xhc3M9XCJlcnJvciBwdC0yXCI+JysgcmVzcG9uc2VzLmZpbmQoeCA9PiB4W1wiUGVyc29uXCJdKVtcIlBlcnNvblwiXVtcImVycl9udW1fcGVyc29uc1wiXSsnPC9wPicpXG4gICAgfWVsc2Uge1xuICAgICAgcGVyc29uQ29udGFpbmVyLmNsb25lKCkuaW5zZXJ0QmVmb3JlKCQodGhpcykucGFyZW50KCkpO1xuICAgIH1cblxuICAgIGlmICgkKCcucGVyc29uLWRhdGEnKS5sZW5ndGggPiAxKSB7XG4gICAgICAkKCcucmVtb3ZlLXBlcnNvbicpLnJlbW92ZUNsYXNzKCdoaWRkZW4nKTtcbiAgICB9XG4gIH0pXG5cbiAgLyogUmVtb3ZlIHBlcnNvbiAqL1xuICAkKGRvY3VtZW50KS5vbignY2xpY2snLCcucmVtb3ZlLXBlcnNvbicsIGZ1bmN0aW9uKGV2ZW50KSB7XG4gICAgZXZlbnQucHJldmVudERlZmF1bHQoKTtcblxuICAgICQoJy5hZGQtcmVtb3ZlJykuZmluZCgnLmVycm9yJykucmVtb3ZlKClcblxuICAgIGlmICgkKCcucGVyc29uLWRhdGEnKS5sZW5ndGggPjEpIHtcbiAgICAgICQoJy5wZXJzb24tZGF0YTpsYXN0JykucmVtb3ZlKCk7XG4gICAgfVxuICAgIGlmICgkKCcucGVyc29uLWRhdGEnKS5sZW5ndGggPT0gMSkge1xuICAgICAgJCgnLnJlbW92ZS1wZXJzb24nKS5hZGRDbGFzcygnaGlkZGVuJyk7XG4gICAgfVxuICB9KVxuXG4gIC8qIElOQ09NRVMgKi9cbiAgJChkb2N1bWVudCkub24oJ2NsaWNrJywnLmFkZC1pbmNvbWUnLCBmdW5jdGlvbihldmVudCkge1xuICAgIGV2ZW50LnByZXZlbnREZWZhdWx0KCk7XG4gICAgaW5jb21lc0NvbnRhaW5lci5jbG9uZSgpLmluc2VydEJlZm9yZSgkKHRoaXMpLnBhcmVudCgpKVxuICAgICQodGhpcykuY2xvc2VzdCgnLnBlcnNvbi1kYXRhJykuZmluZCgnLmluY29tZXM6bGFzdCcpLnJlbW92ZUNsYXNzKCdoaWRkZW4nKVxuICAgICQodGhpcykucHJldignLnJlbW92ZS1pbmNvbWUnKS5yZW1vdmVDbGFzcygnaGlkZGVuJylcbiAgfSlcblxuICAkKGRvY3VtZW50KS5vbignY2xpY2snLCcucmVtb3ZlLWluY29tZScsIGZ1bmN0aW9uKGV2ZW50KSB7XG4gICAgZXZlbnQucHJldmVudERlZmF1bHQoKTtcbiAgICAkKHRoaXMpLmNsb3Nlc3QoJy5wZXJzb24tZGF0YScpLmZpbmQoJy5pbmNvbWVzOmxhc3QnKS5yZW1vdmUoKTtcbiAgICBpZigkKHRoaXMpLmNsb3Nlc3QoJy5wZXJzb24tZGF0YScpLmZpbmQoJy5pbmNvbWVzJykubGVuZ3RoID4gMCl7XG4gICAgICAkKHRoaXMpLnJlbW92ZUNsYXNzKCdoaWRkZW4nKTtcbiAgICB9IGVsc2Uge1xuICAgICAgJCh0aGlzKS5hZGRDbGFzcygnaGlkZGVuJyk7XG4gICAgfVxuICB9KVxuXG4gIC8qIEVYUEVOU0VTICovXG4gICQoZG9jdW1lbnQpLm9uKCdjbGljaycsJy5hZGQtZXhwZW5zZScsIGZ1bmN0aW9uKGV2ZW50KSB7XG4gICAgZXZlbnQucHJldmVudERlZmF1bHQoKTtcbiAgICBleHBlbnNlc0NvbnRhaW5lci5jbG9uZSgpLmluc2VydEJlZm9yZSgkKHRoaXMpLnBhcmVudCgpKVxuICAgICQodGhpcykuY2xvc2VzdCgnLnBlcnNvbi1kYXRhJykuZmluZCgnLmV4cGVuc2VzOmxhc3QnKS5yZW1vdmVDbGFzcygnaGlkZGVuJylcbiAgICAkKHRoaXMpLnByZXYoJy5yZW1vdmUtZXhwZW5zZScpLnJlbW92ZUNsYXNzKCdoaWRkZW4nKVxuICB9KVxuXG4gICQoZG9jdW1lbnQpLm9uKCdjbGljaycsJy5yZW1vdmUtZXhwZW5zZScsIGZ1bmN0aW9uKGV2ZW50KSB7XG4gICAgZXZlbnQucHJldmVudERlZmF1bHQoKTtcbiAgICAkKHRoaXMpLmNsb3Nlc3QoJy5wZXJzb24tZGF0YScpLmZpbmQoJy5leHBlbnNlczpsYXN0JykucmVtb3ZlKCk7XG4gICAgaWYoJCh0aGlzKS5jbG9zZXN0KCcucGVyc29uLWRhdGEnKS5maW5kKCcuZXhwZW5zZXMnKS5sZW5ndGggPiAwKXtcbiAgICAgICQodGhpcykucmVtb3ZlQ2xhc3MoJ2hpZGRlbicpO1xuICAgIH0gZWxzZSB7XG4gICAgICAkKHRoaXMpLmFkZENsYXNzKCdoaWRkZW4nKTtcbiAgICB9XG4gIH0pXG5cbiAgLyogR2VuZXJhdGVzIHRoZSBob3VzZWhvbGQgb2JqZWN0ICovXG4gIGZ1bmN0aW9uIGdlbmVyYXRlSG91c2Vob2xkT2JqKGZvcm0pe1xuICAgIHZhciBoaCA9IGZvcm0uZmluZCgnW2hvdXNlaG9sZF0nKS5zZXJpYWxpemVBcnJheSgpLnJlZHVjZSgob2JqLCBpdGVtKSA9PiAob2JqW2l0ZW0ubmFtZV0gPSBpdGVtLnZhbHVlLCBvYmopICx7fSk7XG4gICAgdmFyIGxpdmluZ1R5cGUgPSBmb3JtLmZpbmQoJ1tuYW1lPWxpdmluZ1R5cGVdJykuY2hpbGRyZW4oKTtcbiAgICBsaXZpbmdUeXBlLmVhY2goZnVuY3Rpb24oKXtcbiAgICAgIGlmICgkKHRoaXMpLnZhbCgpICE9IFwiXCIpe1xuICAgICAgICBpZigkKHRoaXMpLnZhbCgpID09IGxpdmluZ1R5cGUucGFyZW50KCkudmFsKCkpe1xuICAgICAgICAgIGhoWyQodGhpcykudmFsKCldPVwidHJ1ZVwiO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgIGhoWyQodGhpcykudmFsKCldPVwiZmFsc2VcIjtcbiAgICAgICAgfVxuICAgICAgfVxuICAgIH0pXG4gICAgZGVsZXRlIGhoWydsaXZpbmdUeXBlJ107XG4gICAgcmV0dXJuIGhoO1xuICB9XG5cbiAgLyogR2VuZXJhdGVzIHRoZSBwZXJzb24gb2JqZWN0ICovXG4gIGZ1bmN0aW9uIGdlbmVyYXRlUGVyc29uT2JqKGZvcm0sIHBpbmRleCkge1xuICAgIHZhciBwZXJzb25Gb3JtID0gZm9ybS5maW5kKCcucGVyc29uLWRhdGEnKS5lcShwaW5kZXgpO1xuICAgIHZhciBwZXJzb24gPSBwZXJzb25Gb3JtLmZpbmQoJ1twZXJzb25dJykuc2VyaWFsaXplQXJyYXkoKS5yZWR1Y2UoKG9iaiwgaXRlbSkgPT4gKG9ialtpdGVtLm5hbWVdID0gaXRlbS52YWx1ZSwgb2JqKSAse30pO1xuICAgIHZhciBwZXJzb25UeXBlID0gcGVyc29uRm9ybS5maW5kKCdbdHlwZT1jaGVja2JveF0nKS5maWx0ZXIoJ1twZXJzb25dJyk7XG4gICAgcGVyc29uVHlwZS5lYWNoKGZ1bmN0aW9uKCl7XG4gICAgICBpZiAoJCh0aGlzKS5pcygnOmNoZWNrZWQnKSl7XG4gICAgICAgIHBlcnNvblskKHRoaXMpLmF0dHIoJ25hbWUnKV09XCJ0cnVlXCI7XG4gICAgICB9ZWxzZSB7XG4gICAgICAgIHBlcnNvblskKHRoaXMpLmF0dHIoJ25hbWUnKV09XCJmYWxzZVwiO1xuICAgICAgfVxuICAgIH0pXG5cbiAgICAvKiBJbmNvbWVzICovXG4gICAgdmFyIGZvcm1JbmNvbWVzID0gcGVyc29uRm9ybS5maW5kKCdbcGVyc29uLWluY29tZXNdJykuc2VyaWFsaXplQXJyYXkoKTtcbiAgICB2YXIgaW5jb21lc0FyciA9IFtdO1xuICAgIHZhciBpbmNvbWVzT2JqID0ge307XG4gICAgdmFyIG51bUluY29tZXMgPSBmb3JtSW5jb21lcy5sZW5ndGggLyAzO1xuICAgIHZhciBpbmRleCA9IDA7XG4gICAgdmFyIHN1YnNldDtcblxuICAgIGZvciAodmFyIGkgPSAwOyBpIDwgbnVtSW5jb21lczsgaSsrKSB7XG4gICAgICBpbmNvbWVzT2JqID0ge307XG4gICAgICBzdWJzZXQgPSBmb3JtSW5jb21lcy5zbGljZShpbmRleCwgaW5kZXgrMyk7XG4gICAgICBzdWJzZXQuZm9yRWFjaChmdW5jdGlvbihrZXkpe1xuICAgICAgICBpbmNvbWVzT2JqW2tleS5uYW1lXSA9IGtleS52YWx1ZTtcbiAgICAgIH0pXG4gICAgICBpbmNvbWVzQXJyLnB1c2goaW5jb21lc09iaik7XG5cbiAgICAgIGluZGV4ID0gaW5kZXggKyAzO1xuICAgIH1cblxuICAgIGlmKGluY29tZXNBcnIubGVuZ3RoID4gMCl7XG4gICAgICBwZXJzb25bJ2luY29tZXMnXSA9IGluY29tZXNBcnI7XG4gICAgfVxuXG4gICAgLyogRXhwZW5zZXMgKi9cbiAgICB2YXIgZm9ybUV4cGVuc2VzID0gcGVyc29uRm9ybS5maW5kKCdbcGVyc29uLWV4cGVuc2VzXScpLnNlcmlhbGl6ZUFycmF5KCk7XG4gICAgdmFyIGV4cGVuc2VzQXJyID0gW107XG4gICAgdmFyIGV4cGVuc2VzT2JqID0ge307XG4gICAgdmFyIG51bUV4cGVuc2VzID0gZm9ybUV4cGVuc2VzLmxlbmd0aCAvIDM7XG4gICAgaW5kZXggPSAwO1xuXG4gICAgZm9yICh2YXIgaSA9IDA7IGkgPCBudW1FeHBlbnNlczsgaSsrKSB7XG4gICAgICBleHBlbnNlc09iaiA9IHt9O1xuICAgICAgc3Vic2V0ID0gZm9ybUV4cGVuc2VzLnNsaWNlKGluZGV4LCBpbmRleCszKTtcbiAgICAgIHN1YnNldC5mb3JFYWNoKGZ1bmN0aW9uKGtleSl7XG4gICAgICAgIGV4cGVuc2VzT2JqW2tleS5uYW1lXSA9IGtleS52YWx1ZTtcbiAgICAgIH0pXG5cbiAgICAgIGV4cGVuc2VzQXJyLnB1c2goZXhwZW5zZXNPYmopO1xuXG4gICAgICBpbmRleCA9IGluZGV4ICsgMztcbiAgICB9XG5cbiAgICBpZihleHBlbnNlc0Fyci5sZW5ndGggPiAwKSB7XG4gICAgICBwZXJzb25bJ2V4cGVuc2VzJ10gPSBleHBlbnNlc0FycjtcbiAgICB9XG5cbiAgICByZXR1cm4gcGVyc29uO1xuICB9XG5cbiAgLyogQ29weSB0aGUgSlNPTiBvYmplY3QgdG8gdGhlIGNsaXBib2FyZCAqL1xuICAkKGRvY3VtZW50KS5vbignY2xpY2snLCcuY29weS1vYmonLCBmdW5jdGlvbihldmVudCkge1xuICAgIGV2ZW50LnByZXZlbnREZWZhdWx0KCk7XG5cbiAgICB2YXIgcmFuZ2UgPSBkb2N1bWVudC5jcmVhdGVSYW5nZSgpO1xuICAgIHJhbmdlLnNlbGVjdE5vZGUoZG9jdW1lbnQuZ2V0RWxlbWVudHNCeUNsYXNzTmFtZShcImNvZGVcIilbMF0pO1xuICAgIHdpbmRvdy5nZXRTZWxlY3Rpb24oKS5yZW1vdmVBbGxSYW5nZXMoKTtcbiAgICB3aW5kb3cuZ2V0U2VsZWN0aW9uKCkuYWRkUmFuZ2UocmFuZ2UpO1xuICAgIGRvY3VtZW50LmV4ZWNDb21tYW5kKFwiY29weVwiKTtcblxuICAgICQodGhpcykudGV4dCgnQ29waWVkIScpO1xuICB9KVxuXG4gIC8qIFZhbGlkYXRlIHRoZSBmb3JtICovXG4gIGZ1bmN0aW9uIHZhbGlkYXRlRmllbGRzKGZvcm0pIHtcbiAgICB2YXIgZmllbGQsIGZpZWxkTmFtZSwgZ3JvdXBTZWxldGVkLFxuICAgIHJlc3VsdHMgPSB7XCJlcnJvcnNcIjogMCwgXCJ3YXJuaW5nc1wiOiAwfSxcbiAgICBmaWVsZHNPYmogPSBmb3JtLnNlcmlhbGl6ZUFycmF5KCkucmVkdWNlKChvYmosIGl0ZW0pID0+IChvYmpbaXRlbS5uYW1lXSA9IGl0ZW0udmFsdWUsIG9iaikgLHt9KSxcbiAgICBmaWVsZHMgPSBmb3JtLmZpbmQoJ1tyZXF1aXJlZF0nKSxcbiAgICBlcnJOb2RlID0gJCgnLmVycm9yLW1zZycpLFxuICAgIHdhcm5pbmdOb2RlID0gJCgnLndhcm5pbmctbXNnJyksXG4gICAgaGhNc2dPYmogPSByZXNwb25zZXMuZmluZCh4ID0+IHhbXCJIb3VzZWhvbGRcIl0pW1wiSG91c2Vob2xkXCJdLFxuICAgIHBlcnNvbk1zZ09iaiA9IHJlc3BvbnNlcy5maW5kKHggPT4geFtcIlBlcnNvblwiXSlbXCJQZXJzb25cIl0sXG4gICAgZXJyTXNnT2JqID0gcmVzcG9uc2VzLmZpbmQoeCA9PiB4W1wiR2VuZXJhbFwiXSlbXCJHZW5lcmFsXCJdXG5cbiAgICAkKCcuZXJyb3ItbXNnJykuY2hpbGRyZW4oKS5yZW1vdmUoKTtcbiAgICAkKCcud2FybmluZy1tc2cnKS5jaGlsZHJlbigpLnJlbW92ZSgpO1xuXG4gICAgJCgnLmVycm9yLW1zZycpLmFkZENsYXNzKCdlcnJvcicpXG4gICAgJCgnLmVycm9yLW1zZycpLmFwcGVuZCgnPHA+PHN0cm9uZz4nICsgZXJyTXNnT2JqW1wiZXJyb3JcIl0gICsgJzwvc3Ryb25nPjwvcD4nKVxuICAgICQoJy53YXJuaW5nLW1zZycpLmFwcGVuZCgnPHA+PHN0cm9uZz4nICsgZXJyTXNnT2JqW1wid2FybmluZ1wiXSArICc8L3N0cm9uZz48L3A+JylcblxuICAgIC8qIGNoZWNrIGZvciBlbXB0eSBmaWVsZHMgKi9cbiAgICBmaWVsZHMuZWFjaChmdW5jdGlvbigpe1xuICAgICAgZmllbGROYW1lID0gJCh0aGlzKS5hdHRyKCduYW1lJyk7XG4gICAgICBncm91cFNlbGV0ZWQgPSBPYmplY3Qua2V5cyhmaWVsZHNPYmopLmZpbmQoYSA9PmEuaW5jbHVkZXMoZmllbGROYW1lKSk/IHRydWUgOiBmYWxzZTtcblxuICAgICAgaWYoICQodGhpcykudmFsKCkgPT09IFwiXCIgfHxcbiAgICAgICAgIWdyb3VwU2VsZXRlZFxuICAgICAgKSB7XG4gICAgICAgICQodGhpcykucGFyZW50KCkucGFyZW50KCkuYWRkQ2xhc3MoJ2Vycm9yJyk7XG4gICAgICAgIHJlc3VsdHNbXCJlcnJvcnNcIl0gKz0gMTtcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgICQodGhpcykucGFyZW50KCkucmVtb3ZlQ2xhc3MoJ2Vycm9yJyk7XG4gICAgICB9XG5cbiAgICAgIGlmKCAoJCh0aGlzKS52YWwoKSA9PSAnbGl2aW5nUmVudGluZycpICYmXG4gICAgICAgIChmb3JtLmZpbmQoJ1tuYW1lPWxpdmluZ1JlbnRhbFR5cGVdJykudmFsKCkgPT0gXCJcIilcbiAgICAgICkge1xuICAgICAgICB3YXJuaW5nTm9kZS5hcHBlbmQoJzxwPicgKyBoaE1zZ09ialtcIndhcm5pbmdfcmVudGFsX3R5cGVcIl0gKyAnPC9wPicpXG4gICAgICAgIHJlc3VsdHNbXCJ3YXJuaW5nc1wiXSArPSAxO1xuICAgICAgfVxuXG4gICAgfSk7XG5cbiAgICB2YXIgbnVtUGVvcGxlID0gJCgnLnBlcnNvbi1kYXRhJykubGVuZ3RoO1xuICAgIGlmICgobnVtUGVvcGxlIDwgMSkgfHwgKG51bVBlb3BsZSA+IDgpKSB7XG4gICAgICAkKCcuZXJyb3ItbXNnJykuYXBwZW5kKCc8cD4nKyBwZXJzb25Nc2dPYmpbXCJlcnJfbnVtX3BlcnNvbnNcIl0gKyAnPC9wPicpXG4gICAgICByZXN1bHRzW1wiZXJyb3JzXCJdICs9IDE7XG4gICAgfVxuXG4gICAgdmFyIG51bUhlYWRzID0gMFxuICAgIHZhciBob3VzZWhvbGRNZW1iZXJUeXBlcyA9ICQoJ1tuYW1lPWhvdXNlaG9sZE1lbWJlclR5cGVdJylcbiAgICBmb3IgKHZhciBpID0gMDsgaSA8IGhvdXNlaG9sZE1lbWJlclR5cGVzLmxlbmd0aDsgaSsrKSB7XG4gICAgICBpZiAoaG91c2Vob2xkTWVtYmVyVHlwZXNbaV0udmFsdWUgPT0gXCJIZWFkT2ZIb3VzZWhvbGRcIikge1xuICAgICAgICBudW1IZWFkcyArPSAxXG4gICAgICB9XG4gICAgfVxuXG4gICAgaWYgKG51bUhlYWRzICE9IDEpIHtcbiAgICAgICQoJ1tuYW1lPWhvdXNlaG9sZE1lbWJlclR5cGVdJykucGFyZW50KCkuYWRkQ2xhc3MoJ2Vycm9yJylcbiAgICAgICQoJy5lcnJvci1tc2cnKS5hcHBlbmQoJzxwPicrIHBlcnNvbk1zZ09ialtcImVycl9ob2hcIl0gKyc8L3A+JylcbiAgICAgIHJlc3VsdHNbXCJlcnJvcnNcIl0gKz0gMTtcbiAgICB9XG5cbiAgICBpZiAoZm9ybS5maW5kKCdbbmFtZT1saXZpbmdUeXBlXScpLnZhbCgpID09IFwibGl2aW5nUmVudGluZ1wiICYmXG4gICAgICAhKCQoJ1tuYW1lPWxpdmluZ1JlbnRhbE9uTGVhc2VdOmNoZWNrZWQnKS5sZW5ndGggPiAwKVxuICAgICl7XG4gICAgICB3YXJuaW5nTm9kZS5hcHBlbmQoJzxwPicgKyBwZXJzb25Nc2dPYmpbXCJ3YXJuaW5nX29uX2xlYXNlXCJdICsgJzwvcD4nKVxuICAgICAgcmVzdWx0c1tcIndhcm5pbmdzXCJdICs9IDE7XG4gICAgfVxuXG4gICAgaWYgKGZvcm0uZmluZCgnW25hbWU9bGl2aW5nVHlwZV0nKS52YWwoKSA9PSBcImxpdmluZ093bmVyXCIgJiZcbiAgICAgICEoJCgnW25hbWU9bGl2aW5nUmVudGFsT25MZWFzZV06Y2hlY2tlZCcpLmxlbmd0aCA+IDApXG4gICAgKXtcbiAgICAgIHdhcm5pbmdOb2RlLmFwcGVuZCgnPHA+JyArIHBlcnNvbk1zZ09ialtcIndhcm5pbmdfb25fZGVlZFwiXSArICc8L3A+JylcbiAgICAgIHJlc3VsdHNbXCJ3YXJuaW5nc1wiXSArPSAxO1xuICAgIH1cblxuXG4gICAgcmV0dXJuIHJlc3VsdHM7XG4gIH1cbn1cbiIsIid1c2Ugc3RyaWN0JztcblxuLyoqXG4gKiBUaGUgSWNvbiBtb2R1bGVcbiAqIEBjbGFzc1xuICovXG5jbGFzcyBJY29ucyB7XG4gIC8qKlxuICAgKiBAY29uc3RydWN0b3JcbiAgICogQHBhcmFtICB7U3RyaW5nfSBwYXRoIFRoZSBwYXRoIG9mIHRoZSBpY29uIGZpbGVcbiAgICogQHJldHVybiB7b2JqZWN0fSBUaGUgY2xhc3NcbiAgICovXG4gIGNvbnN0cnVjdG9yKHBhdGgpIHtcbiAgICBwYXRoID0gKHBhdGgpID8gcGF0aCA6IEljb25zLnBhdGg7XG5cbiAgICBmZXRjaChwYXRoKVxuICAgICAgLnRoZW4oKHJlc3BvbnNlKSA9PiB7XG4gICAgICAgIGlmIChyZXNwb25zZS5vaylcbiAgICAgICAgICByZXR1cm4gcmVzcG9uc2UudGV4dCgpO1xuICAgICAgICBlbHNlXG4gICAgICAgICAgLy8gZXNsaW50LWRpc2FibGUtbmV4dC1saW5lIG5vLWNvbnNvbGVcbiAgICAgICAgICBpZiAocHJvY2Vzcy5lbnYuTk9ERV9FTlYgIT09ICdwcm9kdWN0aW9uJylcbiAgICAgICAgICAgIGNvbnNvbGUuZGlyKHJlc3BvbnNlKTtcbiAgICAgIH0pXG4gICAgICAuY2F0Y2goKGVycm9yKSA9PiB7XG4gICAgICAgIC8vIGVzbGludC1kaXNhYmxlLW5leHQtbGluZSBuby1jb25zb2xlXG4gICAgICAgIGlmIChwcm9jZXNzLmVudi5OT0RFX0VOViAhPT0gJ3Byb2R1Y3Rpb24nKVxuICAgICAgICAgIGNvbnNvbGUuZGlyKGVycm9yKTtcbiAgICAgIH0pXG4gICAgICAudGhlbigoZGF0YSkgPT4ge1xuICAgICAgICBjb25zdCBzcHJpdGUgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdkaXYnKTtcbiAgICAgICAgc3ByaXRlLmlubmVySFRNTCA9IGRhdGE7XG4gICAgICAgIHNwcml0ZS5zZXRBdHRyaWJ1dGUoJ2FyaWEtaGlkZGVuJywgdHJ1ZSk7XG4gICAgICAgIHNwcml0ZS5zZXRBdHRyaWJ1dGUoJ3N0eWxlJywgJ2Rpc3BsYXk6IG5vbmU7Jyk7XG4gICAgICAgIGRvY3VtZW50LmJvZHkuYXBwZW5kQ2hpbGQoc3ByaXRlKTtcbiAgICAgIH0pO1xuXG4gICAgcmV0dXJuIHRoaXM7XG4gIH1cbn1cblxuLyoqIEB0eXBlIHtTdHJpbmd9IFRoZSBwYXRoIG9mIHRoZSBpY29uIGZpbGUgKi9cbkljb25zLnBhdGggPSAnc3ZnL2ljb25zLnN2Zyc7XG5cbmV4cG9ydCBkZWZhdWx0IEljb25zO1xuIiwiJ3VzZSBzdHJpY3QnO1xuXG4vKipcbiAqIFRoZSBTaW1wbGUgVG9nZ2xlIGNsYXNzLiBUaGlzIHdpbGwgdG9nZ2xlIHRoZSBjbGFzcyAnYWN0aXZlJyBhbmQgJ2hpZGRlbidcbiAqIG9uIHRhcmdldCBlbGVtZW50cywgZGV0ZXJtaW5lZCBieSBhIGNsaWNrIGV2ZW50IG9uIGEgc2VsZWN0ZWQgbGluayBvclxuICogZWxlbWVudC4gVGhpcyB3aWxsIGFsc28gdG9nZ2xlIHRoZSBhcmlhLWhpZGRlbiBhdHRyaWJ1dGUgZm9yIHRhcmdldGVkXG4gKiBlbGVtZW50cyB0byBzdXBwb3J0IHNjcmVlbiByZWFkZXJzLiBUYXJnZXQgc2V0dGluZ3MgYW5kIG90aGVyIGZ1bmN0aW9uYWxpdHlcbiAqIGNhbiBiZSBjb250cm9sbGVkIHRocm91Z2ggZGF0YSBhdHRyaWJ1dGVzLlxuICpcbiAqIFRoaXMgdXNlcyB0aGUgLm1hdGNoZXMoKSBtZXRob2Qgd2hpY2ggd2lsbCByZXF1aXJlIGEgcG9seWZpbGwgZm9yIElFXG4gKiBodHRwczovL3BvbHlmaWxsLmlvL3YyL2RvY3MvZmVhdHVyZXMvI0VsZW1lbnRfcHJvdG90eXBlX21hdGNoZXNcbiAqXG4gKiBAY2xhc3NcbiAqL1xuY2xhc3MgVG9nZ2xlIHtcbiAgLyoqXG4gICAqIEBjb25zdHJ1Y3RvclxuICAgKlxuICAgKiBAcGFyYW0gIHtPYmplY3R9ICBzICBTZXR0aW5ncyBmb3IgdGhpcyBUb2dnbGUgaW5zdGFuY2VcbiAgICpcbiAgICogQHJldHVybiB7T2JqZWN0fSAgICAgVGhlIGNsYXNzXG4gICAqL1xuICBjb25zdHJ1Y3RvcihzKSB7XG4gICAgLy8gQ3JlYXRlIGFuIG9iamVjdCB0byBzdG9yZSBleGlzdGluZyB0b2dnbGUgbGlzdGVuZXJzIChpZiBpdCBkb2Vzbid0IGV4aXN0KVxuICAgIGlmICghd2luZG93Lmhhc093blByb3BlcnR5KFRvZ2dsZS5jYWxsYmFjaykpXG4gICAgICB3aW5kb3dbVG9nZ2xlLmNhbGxiYWNrXSA9IFtdO1xuXG4gICAgcyA9ICghcykgPyB7fSA6IHM7XG5cbiAgICB0aGlzLnNldHRpbmdzID0ge1xuICAgICAgc2VsZWN0b3I6IChzLnNlbGVjdG9yKSA/IHMuc2VsZWN0b3IgOiBUb2dnbGUuc2VsZWN0b3IsXG4gICAgICBuYW1lc3BhY2U6IChzLm5hbWVzcGFjZSkgPyBzLm5hbWVzcGFjZSA6IFRvZ2dsZS5uYW1lc3BhY2UsXG4gICAgICBpbmFjdGl2ZUNsYXNzOiAocy5pbmFjdGl2ZUNsYXNzKSA/IHMuaW5hY3RpdmVDbGFzcyA6IFRvZ2dsZS5pbmFjdGl2ZUNsYXNzLFxuICAgICAgYWN0aXZlQ2xhc3M6IChzLmFjdGl2ZUNsYXNzKSA/IHMuYWN0aXZlQ2xhc3MgOiBUb2dnbGUuYWN0aXZlQ2xhc3MsXG4gICAgICBiZWZvcmU6IChzLmJlZm9yZSkgPyBzLmJlZm9yZSA6IGZhbHNlLFxuICAgICAgYWZ0ZXI6IChzLmFmdGVyKSA/IHMuYWZ0ZXIgOiBmYWxzZSxcbiAgICAgIHZhbGlkOiAocy52YWxpZCkgPyBzLnZhbGlkIDogZmFsc2UsXG4gICAgICBmb2N1c2FibGU6IChzLmhhc093blByb3BlcnR5KCdmb2N1c2FibGUnKSkgPyBzLmZvY3VzYWJsZSA6IHRydWUsXG4gICAgICBqdW1wOiAocy5oYXNPd25Qcm9wZXJ0eSgnanVtcCcpKSA/IHMuanVtcCA6IHRydWVcbiAgICB9O1xuXG4gICAgLy8gU3RvcmUgdGhlIGVsZW1lbnQgZm9yIHBvdGVudGlhbCB1c2UgaW4gY2FsbGJhY2tzXG4gICAgdGhpcy5lbGVtZW50ID0gKHMuZWxlbWVudCkgPyBzLmVsZW1lbnQgOiBmYWxzZTtcblxuICAgIGlmICh0aGlzLmVsZW1lbnQpIHtcbiAgICAgIHRoaXMuZWxlbWVudC5hZGRFdmVudExpc3RlbmVyKCdjbGljaycsIChldmVudCkgPT4ge1xuICAgICAgICB0aGlzLnRvZ2dsZShldmVudCk7XG4gICAgICB9KTtcbiAgICB9IGVsc2Uge1xuICAgICAgLy8gSWYgdGhlcmUgaXNuJ3QgYW4gZXhpc3RpbmcgaW5zdGFudGlhdGVkIHRvZ2dsZSwgYWRkIHRoZSBldmVudCBsaXN0ZW5lci5cbiAgICAgIGlmICghd2luZG93W1RvZ2dsZS5jYWxsYmFja10uaGFzT3duUHJvcGVydHkodGhpcy5zZXR0aW5ncy5zZWxlY3RvcikpIHtcbiAgICAgICAgbGV0IGJvZHkgPSBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKCdib2R5Jyk7XG5cbiAgICAgICAgZm9yIChsZXQgaSA9IDA7IGkgPCBUb2dnbGUuZXZlbnRzLmxlbmd0aDsgaSsrKSB7XG4gICAgICAgICAgbGV0IHRnZ2xlRXZlbnQgPSBUb2dnbGUuZXZlbnRzW2ldO1xuXG4gICAgICAgICAgYm9keS5hZGRFdmVudExpc3RlbmVyKHRnZ2xlRXZlbnQsIGV2ZW50ID0+IHtcbiAgICAgICAgICAgIGlmICghZXZlbnQudGFyZ2V0Lm1hdGNoZXModGhpcy5zZXR0aW5ncy5zZWxlY3RvcikpXG4gICAgICAgICAgICAgIHJldHVybjtcblxuICAgICAgICAgICAgdGhpcy5ldmVudCA9IGV2ZW50O1xuXG4gICAgICAgICAgICBsZXQgdHlwZSA9IGV2ZW50LnR5cGUudG9VcHBlckNhc2UoKTtcblxuICAgICAgICAgICAgaWYgKFxuICAgICAgICAgICAgICB0aGlzW2V2ZW50LnR5cGVdICYmXG4gICAgICAgICAgICAgIFRvZ2dsZS5lbGVtZW50c1t0eXBlXSAmJlxuICAgICAgICAgICAgICBUb2dnbGUuZWxlbWVudHNbdHlwZV0uaW5jbHVkZXMoZXZlbnQudGFyZ2V0LnRhZ05hbWUpXG4gICAgICAgICAgICApIHRoaXNbZXZlbnQudHlwZV0oZXZlbnQpO1xuICAgICAgICAgIH0pO1xuICAgICAgICB9XG4gICAgICB9XG4gICAgfVxuXG4gICAgLy8gUmVjb3JkIHRoYXQgYSB0b2dnbGUgdXNpbmcgdGhpcyBzZWxlY3RvciBoYXMgYmVlbiBpbnN0YW50aWF0ZWQuXG4gICAgLy8gVGhpcyBwcmV2ZW50cyBkb3VibGUgdG9nZ2xpbmcuXG4gICAgd2luZG93W1RvZ2dsZS5jYWxsYmFja11bdGhpcy5zZXR0aW5ncy5zZWxlY3Rvcl0gPSB0cnVlO1xuXG4gICAgcmV0dXJuIHRoaXM7XG4gIH1cblxuICAvKipcbiAgICogQ2xpY2sgZXZlbnQgaGFuZGxlclxuICAgKlxuICAgKiBAcGFyYW0gIHtFdmVudH0gIGV2ZW50ICBUaGUgb3JpZ2luYWwgY2xpY2sgZXZlbnRcbiAgICovXG4gIGNsaWNrKGV2ZW50KSB7XG4gICAgdGhpcy50b2dnbGUoZXZlbnQpO1xuICB9XG5cbiAgLyoqXG4gICAqIElucHV0L3NlbGVjdC90ZXh0YXJlYSBjaGFuZ2UgZXZlbnQgaGFuZGxlci4gQ2hlY2tzIHRvIHNlZSBpZiB0aGVcbiAgICogZXZlbnQudGFyZ2V0IGlzIHZhbGlkIHRoZW4gdG9nZ2xlcyBhY2NvcmRpbmdseS5cbiAgICpcbiAgICogQHBhcmFtICB7RXZlbnR9ICBldmVudCAgVGhlIG9yaWdpbmFsIGlucHV0IGNoYW5nZSBldmVudFxuICAgKi9cbiAgY2hhbmdlKGV2ZW50KSB7XG4gICAgbGV0IHZhbGlkID0gZXZlbnQudGFyZ2V0LmNoZWNrVmFsaWRpdHkoKTtcblxuICAgIGlmICh2YWxpZCAmJiAhdGhpcy5pc0FjdGl2ZShldmVudC50YXJnZXQpKSB7XG4gICAgICB0aGlzLnRvZ2dsZShldmVudCk7IC8vIHNob3dcbiAgICB9IGVsc2UgaWYgKCF2YWxpZCAmJiB0aGlzLmlzQWN0aXZlKGV2ZW50LnRhcmdldCkpIHtcbiAgICAgIHRoaXMudG9nZ2xlKGV2ZW50KTsgLy8gaGlkZVxuICAgIH1cbiAgfVxuXG4gIC8qKlxuICAgKiBDaGVjayB0byBzZWUgaWYgdGhlIHRvZ2dsZSBpcyBhY3RpdmVcbiAgICpcbiAgICogQHBhcmFtICB7T2JqZWN0fSAgZWxlbWVudCAgVGhlIHRvZ2dsZSBlbGVtZW50ICh0cmlnZ2VyKVxuICAgKi9cbiAgaXNBY3RpdmUoZWxlbWVudCkge1xuICAgIGxldCBhY3RpdmUgPSBmYWxzZTtcblxuICAgIGlmICh0aGlzLnNldHRpbmdzLmFjdGl2ZUNsYXNzKSB7XG4gICAgICBhY3RpdmUgPSBlbGVtZW50LmNsYXNzTGlzdC5jb250YWlucyh0aGlzLnNldHRpbmdzLmFjdGl2ZUNsYXNzKVxuICAgIH1cblxuICAgIC8vIGlmICgpIHtcbiAgICAgIC8vIFRvZ2dsZS5lbGVtZW50QXJpYVJvbGVzXG4gICAgICAvLyBUT0RPOiBBZGQgY2F0Y2ggdG8gc2VlIGlmIGVsZW1lbnQgYXJpYSByb2xlcyBhcmUgdG9nZ2xlZFxuICAgIC8vIH1cblxuICAgIC8vIGlmICgpIHtcbiAgICAgIC8vIFRvZ2dsZS50YXJnZXRBcmlhUm9sZXNcbiAgICAgIC8vIFRPRE86IEFkZCBjYXRjaCB0byBzZWUgaWYgdGFyZ2V0IGFyaWEgcm9sZXMgYXJlIHRvZ2dsZWRcbiAgICAvLyB9XG5cbiAgICByZXR1cm4gYWN0aXZlO1xuICB9XG5cbiAgLyoqXG4gICAqIEdldCB0aGUgdGFyZ2V0IG9mIHRoZSB0b2dnbGUgZWxlbWVudCAodHJpZ2dlcilcbiAgICpcbiAgICogQHBhcmFtICB7T2JqZWN0fSAgZWwgIFRoZSB0b2dnbGUgZWxlbWVudCAodHJpZ2dlcilcbiAgICovXG4gIGdldFRhcmdldChlbGVtZW50KSB7XG4gICAgbGV0IHRhcmdldCA9IGZhbHNlO1xuXG4gICAgLyoqIEFuY2hvciBMaW5rcyAqL1xuICAgIHRhcmdldCA9IChlbGVtZW50Lmhhc0F0dHJpYnV0ZSgnaHJlZicpKSA/XG4gICAgICBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKGVsZW1lbnQuZ2V0QXR0cmlidXRlKCdocmVmJykpIDogdGFyZ2V0O1xuXG4gICAgLyoqIFRvZ2dsZSBDb250cm9scyAqL1xuICAgIHRhcmdldCA9IChlbGVtZW50Lmhhc0F0dHJpYnV0ZSgnYXJpYS1jb250cm9scycpKSA/XG4gICAgICBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKGAjJHtlbGVtZW50LmdldEF0dHJpYnV0ZSgnYXJpYS1jb250cm9scycpfWApIDogdGFyZ2V0O1xuXG4gICAgcmV0dXJuIHRhcmdldDtcbiAgfVxuXG4gIC8qKlxuICAgKiBUaGUgdG9nZ2xlIGV2ZW50IHByb3h5IGZvciBnZXR0aW5nIGFuZCBzZXR0aW5nIHRoZSBlbGVtZW50L3MgYW5kIHRhcmdldFxuICAgKlxuICAgKiBAcGFyYW0gIHtPYmplY3R9ICBldmVudCAgVGhlIG1haW4gY2xpY2sgZXZlbnRcbiAgICpcbiAgICogQHJldHVybiB7T2JqZWN0fSAgICAgICAgIFRoZSBUb2dnbGUgaW5zdGFuY2VcbiAgICovXG4gIHRvZ2dsZShldmVudCkge1xuICAgIGxldCBlbGVtZW50ID0gZXZlbnQudGFyZ2V0O1xuICAgIGxldCB0YXJnZXQgPSBmYWxzZTtcbiAgICBsZXQgZm9jdXNhYmxlID0gW107XG5cbiAgICBldmVudC5wcmV2ZW50RGVmYXVsdCgpO1xuXG4gICAgdGFyZ2V0ID0gdGhpcy5nZXRUYXJnZXQoZWxlbWVudCk7XG5cbiAgICAvKiogRm9jdXNhYmxlIENoaWxkcmVuICovXG4gICAgZm9jdXNhYmxlID0gKHRhcmdldCkgP1xuICAgICAgdGFyZ2V0LnF1ZXJ5U2VsZWN0b3JBbGwoVG9nZ2xlLmVsRm9jdXNhYmxlLmpvaW4oJywgJykpIDogZm9jdXNhYmxlO1xuXG4gICAgLyoqIE1haW4gRnVuY3Rpb25hbGl0eSAqL1xuICAgIGlmICghdGFyZ2V0KSByZXR1cm4gdGhpcztcbiAgICB0aGlzLmVsZW1lbnRUb2dnbGUoZWxlbWVudCwgdGFyZ2V0LCBmb2N1c2FibGUpO1xuXG4gICAgLyoqIFVuZG8gKi9cbiAgICBpZiAoZWxlbWVudC5kYXRhc2V0W2Ake3RoaXMuc2V0dGluZ3MubmFtZXNwYWNlfVVuZG9gXSkge1xuICAgICAgY29uc3QgdW5kbyA9IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoXG4gICAgICAgIGVsZW1lbnQuZGF0YXNldFtgJHt0aGlzLnNldHRpbmdzLm5hbWVzcGFjZX1VbmRvYF1cbiAgICAgICk7XG5cbiAgICAgIHVuZG8uYWRkRXZlbnRMaXN0ZW5lcignY2xpY2snLCAoZXZlbnQpID0+IHtcbiAgICAgICAgZXZlbnQucHJldmVudERlZmF1bHQoKTtcbiAgICAgICAgdGhpcy5lbGVtZW50VG9nZ2xlKGVsZW1lbnQsIHRhcmdldCk7XG4gICAgICAgIHVuZG8ucmVtb3ZlRXZlbnRMaXN0ZW5lcignY2xpY2snKTtcbiAgICAgIH0pO1xuICAgIH1cblxuICAgIHJldHVybiB0aGlzO1xuICB9XG5cbiAgLyoqXG4gICAqIEdldCBvdGhlciB0b2dnbGVzIHRoYXQgbWlnaHQgY29udHJvbCB0aGUgc2FtZSBlbGVtZW50XG4gICAqXG4gICAqIEBwYXJhbSAgIHtPYmplY3R9ICAgIGVsZW1lbnQgIFRoZSB0b2dnbGluZyBlbGVtZW50XG4gICAqXG4gICAqIEByZXR1cm4gIHtOb2RlTGlzdH0gICAgICAgICAgIExpc3Qgb2Ygb3RoZXIgdG9nZ2xpbmcgZWxlbWVudHNcbiAgICogICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgdGhhdCBjb250cm9sIHRoZSB0YXJnZXRcbiAgICovXG4gIGdldE90aGVycyhlbGVtZW50KSB7XG4gICAgbGV0IHNlbGVjdG9yID0gZmFsc2U7XG5cbiAgICBpZiAoZWxlbWVudC5oYXNBdHRyaWJ1dGUoJ2hyZWYnKSkge1xuICAgICAgc2VsZWN0b3IgPSBgW2hyZWY9XCIke2VsZW1lbnQuZ2V0QXR0cmlidXRlKCdocmVmJyl9XCJdYDtcbiAgICB9IGVsc2UgaWYgKGVsZW1lbnQuaGFzQXR0cmlidXRlKCdhcmlhLWNvbnRyb2xzJykpIHtcbiAgICAgIHNlbGVjdG9yID0gYFthcmlhLWNvbnRyb2xzPVwiJHtlbGVtZW50LmdldEF0dHJpYnV0ZSgnYXJpYS1jb250cm9scycpfVwiXWA7XG4gICAgfVxuXG4gICAgcmV0dXJuIChzZWxlY3RvcikgPyBkb2N1bWVudC5xdWVyeVNlbGVjdG9yQWxsKHNlbGVjdG9yKSA6IFtdO1xuICB9XG5cbiAgLyoqXG4gICAqIEhpZGUgdGhlIFRvZ2dsZSBUYXJnZXQncyBmb2N1c2FibGUgY2hpbGRyZW4gZnJvbSBmb2N1cy5cbiAgICogSWYgYW4gZWxlbWVudCBoYXMgdGhlIGRhdGEtYXR0cmlidXRlIGBkYXRhLXRvZ2dsZS10YWJpbmRleGBcbiAgICogaXQgd2lsbCB1c2UgdGhhdCBhcyB0aGUgZGVmYXVsdCB0YWIgaW5kZXggb2YgdGhlIGVsZW1lbnQuXG4gICAqXG4gICAqIEBwYXJhbSAgIHtOb2RlTGlzdH0gIGVsZW1lbnRzICBMaXN0IG9mIGZvY3VzYWJsZSBlbGVtZW50c1xuICAgKlxuICAgKiBAcmV0dXJuICB7T2JqZWN0fSAgICAgICAgICAgICAgVGhlIFRvZ2dsZSBJbnN0YW5jZVxuICAgKi9cbiAgdG9nZ2xlRm9jdXNhYmxlKGVsZW1lbnRzKSB7XG4gICAgZWxlbWVudHMuZm9yRWFjaChlbGVtZW50ID0+IHtcbiAgICAgIGxldCB0YWJpbmRleCA9IGVsZW1lbnQuZ2V0QXR0cmlidXRlKCd0YWJpbmRleCcpO1xuXG4gICAgICBpZiAodGFiaW5kZXggPT09ICctMScpIHtcbiAgICAgICAgbGV0IGRhdGFEZWZhdWx0ID0gZWxlbWVudFxuICAgICAgICAgIC5nZXRBdHRyaWJ1dGUoYGRhdGEtJHtUb2dnbGUubmFtZXNwYWNlfS10YWJpbmRleGApO1xuXG4gICAgICAgIGlmIChkYXRhRGVmYXVsdCkge1xuICAgICAgICAgIGVsZW1lbnQuc2V0QXR0cmlidXRlKCd0YWJpbmRleCcsIGRhdGFEZWZhdWx0KTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICBlbGVtZW50LnJlbW92ZUF0dHJpYnV0ZSgndGFiaW5kZXgnKTtcbiAgICAgICAgfVxuICAgICAgfSBlbHNlIHtcbiAgICAgICAgZWxlbWVudC5zZXRBdHRyaWJ1dGUoJ3RhYmluZGV4JywgJy0xJyk7XG4gICAgICB9XG4gICAgfSk7XG5cbiAgICByZXR1cm4gdGhpcztcbiAgfVxuXG4gIC8qKlxuICAgKiBKdW1wcyB0byBFbGVtZW50IHZpc2libHkgYW5kIHNoaWZ0cyBmb2N1c1xuICAgKiB0byB0aGUgZWxlbWVudCBieSBzZXR0aW5nIHRoZSB0YWJpbmRleFxuICAgKlxuICAgKiBAcGFyYW0gICB7T2JqZWN0fSAgZWxlbWVudCAgVGhlIFRvZ2dsaW5nIEVsZW1lbnRcbiAgICogQHBhcmFtICAge09iamVjdH0gIHRhcmdldCAgIFRoZSBUYXJnZXQgRWxlbWVudFxuICAgKlxuICAgKiBAcmV0dXJuICB7T2JqZWN0fSAgICAgICAgICAgVGhlIFRvZ2dsZSBpbnN0YW5jZVxuICAgKi9cbiAganVtcFRvKGVsZW1lbnQsIHRhcmdldCkge1xuICAgIC8vIFJlc2V0IHRoZSBoaXN0b3J5IHN0YXRlLiBUaGlzIHdpbGwgY2xlYXIgb3V0XG4gICAgLy8gdGhlIGhhc2ggd2hlbiB0aGUgdGFyZ2V0IGlzIHRvZ2dsZWQgY2xvc2VkXG4gICAgaGlzdG9yeS5wdXNoU3RhdGUoJycsICcnLFxuICAgICAgd2luZG93LmxvY2F0aW9uLnBhdGhuYW1lICsgd2luZG93LmxvY2F0aW9uLnNlYXJjaCk7XG5cbiAgICAvLyBGb2N1cyBpZiBhY3RpdmVcbiAgICBpZiAodGFyZ2V0LmNsYXNzTGlzdC5jb250YWlucyh0aGlzLnNldHRpbmdzLmFjdGl2ZUNsYXNzKSkge1xuICAgICAgd2luZG93LmxvY2F0aW9uLmhhc2ggPSBlbGVtZW50LmdldEF0dHJpYnV0ZSgnaHJlZicpO1xuXG4gICAgICB0YXJnZXQuc2V0QXR0cmlidXRlKCd0YWJpbmRleCcsICcwJyk7XG4gICAgICB0YXJnZXQuZm9jdXMoe3ByZXZlbnRTY3JvbGw6IHRydWV9KTtcbiAgICB9IGVsc2Uge1xuICAgICAgdGFyZ2V0LnJlbW92ZUF0dHJpYnV0ZSgndGFiaW5kZXgnKTtcbiAgICB9XG5cbiAgICByZXR1cm4gdGhpcztcbiAgfVxuXG4gIC8qKlxuICAgKiBUaGUgbWFpbiB0b2dnbGluZyBtZXRob2QgZm9yIGF0dHJpYnV0ZXNcbiAgICpcbiAgICogQHBhcmFtICB7T2JqZWN0fSAgICBlbGVtZW50ICAgIFRoZSBUb2dnbGUgZWxlbWVudFxuICAgKiBAcGFyYW0gIHtPYmplY3R9ICAgIHRhcmdldCAgICAgVGhlIFRhcmdldCBlbGVtZW50IHRvIHRvZ2dsZSBhY3RpdmUvaGlkZGVuXG4gICAqIEBwYXJhbSAge05vZGVMaXN0fSAgZm9jdXNhYmxlICBBbnkgZm9jdXNhYmxlIGNoaWxkcmVuIGluIHRoZSB0YXJnZXRcbiAgICpcbiAgICogQHJldHVybiB7T2JqZWN0fSAgICAgICAgICAgICAgIFRoZSBUb2dnbGUgaW5zdGFuY2VcbiAgICovXG4gIGVsZW1lbnRUb2dnbGUoZWxlbWVudCwgdGFyZ2V0LCBmb2N1c2FibGUgPSBbXSkge1xuICAgIGxldCBpID0gMDtcbiAgICBsZXQgYXR0ciA9ICcnO1xuICAgIGxldCB2YWx1ZSA9ICcnO1xuXG4gICAgLyoqXG4gICAgICogU3RvcmUgZWxlbWVudHMgZm9yIHBvdGVudGlhbCB1c2UgaW4gY2FsbGJhY2tzXG4gICAgICovXG5cbiAgICB0aGlzLmVsZW1lbnQgPSBlbGVtZW50O1xuICAgIHRoaXMudGFyZ2V0ID0gdGFyZ2V0O1xuICAgIHRoaXMub3RoZXJzID0gdGhpcy5nZXRPdGhlcnMoZWxlbWVudCk7XG4gICAgdGhpcy5mb2N1c2FibGUgPSBmb2N1c2FibGU7XG5cbiAgICAvKipcbiAgICAgKiBWYWxpZGl0eSBtZXRob2QgcHJvcGVydHkgdGhhdCB3aWxsIGNhbmNlbCB0aGUgdG9nZ2xlIGlmIGl0IHJldHVybnMgZmFsc2VcbiAgICAgKi9cblxuICAgIGlmICh0aGlzLnNldHRpbmdzLnZhbGlkICYmICF0aGlzLnNldHRpbmdzLnZhbGlkKHRoaXMpKVxuICAgICAgcmV0dXJuIHRoaXM7XG5cbiAgICAvKipcbiAgICAgKiBUb2dnbGluZyBiZWZvcmUgaG9va1xuICAgICAqL1xuXG4gICAgaWYgKHRoaXMuc2V0dGluZ3MuYmVmb3JlKVxuICAgICAgdGhpcy5zZXR0aW5ncy5iZWZvcmUodGhpcyk7XG5cbiAgICAvKipcbiAgICAgKiBUb2dnbGUgRWxlbWVudCBhbmQgVGFyZ2V0IGNsYXNzZXNcbiAgICAgKi9cblxuICAgIGlmICh0aGlzLnNldHRpbmdzLmFjdGl2ZUNsYXNzKSB7XG4gICAgICB0aGlzLmVsZW1lbnQuY2xhc3NMaXN0LnRvZ2dsZSh0aGlzLnNldHRpbmdzLmFjdGl2ZUNsYXNzKTtcbiAgICAgIHRoaXMudGFyZ2V0LmNsYXNzTGlzdC50b2dnbGUodGhpcy5zZXR0aW5ncy5hY3RpdmVDbGFzcyk7XG5cbiAgICAgIC8vIElmIHRoZXJlIGFyZSBvdGhlciB0b2dnbGVzIHRoYXQgY29udHJvbCB0aGUgc2FtZSBlbGVtZW50XG4gICAgICB0aGlzLm90aGVycy5mb3JFYWNoKG90aGVyID0+IHtcbiAgICAgICAgaWYgKG90aGVyICE9PSB0aGlzLmVsZW1lbnQpXG4gICAgICAgICAgb3RoZXIuY2xhc3NMaXN0LnRvZ2dsZSh0aGlzLnNldHRpbmdzLmFjdGl2ZUNsYXNzKTtcbiAgICAgIH0pO1xuICAgIH1cblxuICAgIGlmICh0aGlzLnNldHRpbmdzLmluYWN0aXZlQ2xhc3MpXG4gICAgICB0YXJnZXQuY2xhc3NMaXN0LnRvZ2dsZSh0aGlzLnNldHRpbmdzLmluYWN0aXZlQ2xhc3MpO1xuXG4gICAgLyoqXG4gICAgICogVGFyZ2V0IEVsZW1lbnQgQXJpYSBBdHRyaWJ1dGVzXG4gICAgICovXG5cbiAgICBmb3IgKGkgPSAwOyBpIDwgVG9nZ2xlLnRhcmdldEFyaWFSb2xlcy5sZW5ndGg7IGkrKykge1xuICAgICAgYXR0ciA9IFRvZ2dsZS50YXJnZXRBcmlhUm9sZXNbaV07XG4gICAgICB2YWx1ZSA9IHRoaXMudGFyZ2V0LmdldEF0dHJpYnV0ZShhdHRyKTtcblxuICAgICAgaWYgKHZhbHVlICE9ICcnICYmIHZhbHVlKVxuICAgICAgICB0aGlzLnRhcmdldC5zZXRBdHRyaWJ1dGUoYXR0ciwgKHZhbHVlID09PSAndHJ1ZScpID8gJ2ZhbHNlJyA6ICd0cnVlJyk7XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogVG9nZ2xlIHRoZSB0YXJnZXQncyBmb2N1c2FibGUgY2hpbGRyZW4gdGFiaW5kZXhcbiAgICAgKi9cblxuICAgIGlmICh0aGlzLnNldHRpbmdzLmZvY3VzYWJsZSlcbiAgICAgIHRoaXMudG9nZ2xlRm9jdXNhYmxlKHRoaXMuZm9jdXNhYmxlKTtcblxuICAgIC8qKlxuICAgICAqIEp1bXAgdG8gVGFyZ2V0IEVsZW1lbnQgaWYgVG9nZ2xlIEVsZW1lbnQgaXMgYW4gYW5jaG9yIGxpbmtcbiAgICAgKi9cblxuICAgIGlmICh0aGlzLnNldHRpbmdzLmp1bXAgJiYgdGhpcy5lbGVtZW50Lmhhc0F0dHJpYnV0ZSgnaHJlZicpKVxuICAgICAgdGhpcy5qdW1wVG8odGhpcy5lbGVtZW50LCB0aGlzLnRhcmdldCk7XG5cbiAgICAvKipcbiAgICAgKiBUb2dnbGUgRWxlbWVudCAoaW5jbHVkaW5nIG11bHRpIHRvZ2dsZXMpIEFyaWEgQXR0cmlidXRlc1xuICAgICAqL1xuXG4gICAgZm9yIChpID0gMDsgaSA8IFRvZ2dsZS5lbEFyaWFSb2xlcy5sZW5ndGg7IGkrKykge1xuICAgICAgYXR0ciA9IFRvZ2dsZS5lbEFyaWFSb2xlc1tpXTtcbiAgICAgIHZhbHVlID0gdGhpcy5lbGVtZW50LmdldEF0dHJpYnV0ZShhdHRyKTtcblxuICAgICAgaWYgKHZhbHVlICE9ICcnICYmIHZhbHVlKVxuICAgICAgICB0aGlzLmVsZW1lbnQuc2V0QXR0cmlidXRlKGF0dHIsICh2YWx1ZSA9PT0gJ3RydWUnKSA/ICdmYWxzZScgOiAndHJ1ZScpO1xuXG4gICAgICAvLyBJZiB0aGVyZSBhcmUgb3RoZXIgdG9nZ2xlcyB0aGF0IGNvbnRyb2wgdGhlIHNhbWUgZWxlbWVudFxuICAgICAgdGhpcy5vdGhlcnMuZm9yRWFjaCgob3RoZXIpID0+IHtcbiAgICAgICAgaWYgKG90aGVyICE9PSB0aGlzLmVsZW1lbnQgJiYgb3RoZXIuZ2V0QXR0cmlidXRlKGF0dHIpKVxuICAgICAgICAgIG90aGVyLnNldEF0dHJpYnV0ZShhdHRyLCAodmFsdWUgPT09ICd0cnVlJykgPyAnZmFsc2UnIDogJ3RydWUnKTtcbiAgICAgIH0pO1xuICAgIH1cblxuICAgIC8qKlxuICAgICAqIFRvZ2dsaW5nIGNvbXBsZXRlIGhvb2tcbiAgICAgKi9cblxuICAgIGlmICh0aGlzLnNldHRpbmdzLmFmdGVyKVxuICAgICAgdGhpcy5zZXR0aW5ncy5hZnRlcih0aGlzKTtcblxuICAgIHJldHVybiB0aGlzO1xuICB9XG59XG5cbi8qKiBAdHlwZSAge1N0cmluZ30gIFRoZSBtYWluIHNlbGVjdG9yIHRvIGFkZCB0aGUgdG9nZ2xpbmcgZnVuY3Rpb24gdG8gKi9cblRvZ2dsZS5zZWxlY3RvciA9ICdbZGF0YS1qcyo9XCJ0b2dnbGVcIl0nO1xuXG4vKiogQHR5cGUgIHtTdHJpbmd9ICBUaGUgbmFtZXNwYWNlIGZvciBvdXIgZGF0YSBhdHRyaWJ1dGUgc2V0dGluZ3MgKi9cblRvZ2dsZS5uYW1lc3BhY2UgPSAndG9nZ2xlJztcblxuLyoqIEB0eXBlICB7U3RyaW5nfSAgVGhlIGhpZGUgY2xhc3MgKi9cblRvZ2dsZS5pbmFjdGl2ZUNsYXNzID0gJ2hpZGRlbic7XG5cbi8qKiBAdHlwZSAge1N0cmluZ30gIFRoZSBhY3RpdmUgY2xhc3MgKi9cblRvZ2dsZS5hY3RpdmVDbGFzcyA9ICdhY3RpdmUnO1xuXG4vKiogQHR5cGUgIHtBcnJheX0gIEFyaWEgcm9sZXMgdG8gdG9nZ2xlIHRydWUvZmFsc2Ugb24gdGhlIHRvZ2dsaW5nIGVsZW1lbnQgKi9cblRvZ2dsZS5lbEFyaWFSb2xlcyA9IFsnYXJpYS1wcmVzc2VkJywgJ2FyaWEtZXhwYW5kZWQnXTtcblxuLyoqIEB0eXBlICB7QXJyYXl9ICBBcmlhIHJvbGVzIHRvIHRvZ2dsZSB0cnVlL2ZhbHNlIG9uIHRoZSB0YXJnZXQgZWxlbWVudCAqL1xuVG9nZ2xlLnRhcmdldEFyaWFSb2xlcyA9IFsnYXJpYS1oaWRkZW4nXTtcblxuLyoqIEB0eXBlICB7QXJyYXl9ICBGb2N1c2FibGUgZWxlbWVudHMgdG8gaGlkZSB3aXRoaW4gdGhlIGhpZGRlbiB0YXJnZXQgZWxlbWVudCAqL1xuVG9nZ2xlLmVsRm9jdXNhYmxlID0gW1xuICAnYScsICdidXR0b24nLCAnaW5wdXQnLCAnc2VsZWN0JywgJ3RleHRhcmVhJywgJ29iamVjdCcsICdlbWJlZCcsICdmb3JtJyxcbiAgJ2ZpZWxkc2V0JywgJ2xlZ2VuZCcsICdsYWJlbCcsICdhcmVhJywgJ2F1ZGlvJywgJ3ZpZGVvJywgJ2lmcmFtZScsICdzdmcnLFxuICAnZGV0YWlscycsICd0YWJsZScsICdbdGFiaW5kZXhdJywgJ1tjb250ZW50ZWRpdGFibGVdJywgJ1t1c2VtYXBdJ1xuXTtcblxuLyoqIEB0eXBlICB7QXJyYXl9ICBLZXkgYXR0cmlidXRlIGZvciBzdG9yaW5nIHRvZ2dsZXMgaW4gdGhlIHdpbmRvdyAqL1xuVG9nZ2xlLmNhbGxiYWNrID0gWydUb2dnbGVzQ2FsbGJhY2snXTtcblxuLyoqIEB0eXBlICB7QXJyYXl9ICBEZWZhdWx0IGV2ZW50cyB0byB0byB3YXRjaCBmb3IgdG9nZ2xpbmcuIEVhY2ggbXVzdCBoYXZlIGEgaGFuZGxlciBpbiB0aGUgY2xhc3MgYW5kIGVsZW1lbnRzIHRvIGxvb2sgZm9yIGluIFRvZ2dsZS5lbGVtZW50cyAqL1xuVG9nZ2xlLmV2ZW50cyA9IFsnY2xpY2snLCAnY2hhbmdlJ107XG5cbi8qKiBAdHlwZSAge0FycmF5fSAgRWxlbWVudHMgdG8gZGVsZWdhdGUgdG8gZWFjaCBldmVudCBoYW5kbGVyICovXG5Ub2dnbGUuZWxlbWVudHMgPSB7XG4gIENMSUNLOiBbJ0EnLCAnQlVUVE9OJ10sXG4gIENIQU5HRTogWydTRUxFQ1QnLCAnSU5QVVQnLCAnVEVYVEFSRUEnXVxufTtcblxuZXhwb3J0IGRlZmF1bHQgVG9nZ2xlO1xuIiwiJ3VzZSBzdHJpY3QnO1xuXG4vKipcbiAqIFRyYWNraW5nIGJ1cyBmb3IgR29vZ2xlIGFuYWx5dGljcyBhbmQgV2VidHJlbmRzLlxuICovXG5jbGFzcyBUcmFjayB7XG4gIGNvbnN0cnVjdG9yKHMpIHtcbiAgICBjb25zdCBib2R5ID0gZG9jdW1lbnQucXVlcnlTZWxlY3RvcignYm9keScpO1xuXG4gICAgcyA9ICghcykgPyB7fSA6IHM7XG5cbiAgICB0aGlzLl9zZXR0aW5ncyA9IHtcbiAgICAgIHNlbGVjdG9yOiAocy5zZWxlY3RvcikgPyBzLnNlbGVjdG9yIDogVHJhY2suc2VsZWN0b3IsXG4gICAgfTtcblxuICAgIHRoaXMuZGVzaW5hdGlvbnMgPSBUcmFjay5kZXN0aW5hdGlvbnM7XG5cbiAgICBib2R5LmFkZEV2ZW50TGlzdGVuZXIoJ2NsaWNrJywgKGV2ZW50KSA9PiB7XG4gICAgICBpZiAoIWV2ZW50LnRhcmdldC5tYXRjaGVzKHRoaXMuX3NldHRpbmdzLnNlbGVjdG9yKSlcbiAgICAgICAgcmV0dXJuO1xuXG4gICAgICBsZXQga2V5ID0gZXZlbnQudGFyZ2V0LmRhdGFzZXQudHJhY2tLZXk7XG4gICAgICBsZXQgZGF0YSA9IEpTT04ucGFyc2UoZXZlbnQudGFyZ2V0LmRhdGFzZXQudHJhY2tEYXRhKTtcblxuICAgICAgdGhpcy50cmFjayhrZXksIGRhdGEpO1xuICAgIH0pO1xuXG4gICAgcmV0dXJuIHRoaXM7XG4gIH1cblxuICAvKipcbiAgICogVHJhY2tpbmcgZnVuY3Rpb24gd3JhcHBlclxuICAgKlxuICAgKiBAcGFyYW0gIHtTdHJpbmd9ICAgICAga2V5ICAgVGhlIGtleSBvciBldmVudCBvZiB0aGUgZGF0YVxuICAgKiBAcGFyYW0gIHtDb2xsZWN0aW9ufSAgZGF0YSAgVGhlIGRhdGEgdG8gdHJhY2tcbiAgICpcbiAgICogQHJldHVybiB7T2JqZWN0fSAgICAgICAgICAgIFRoZSBmaW5hbCBkYXRhIG9iamVjdFxuICAgKi9cbiAgdHJhY2soa2V5LCBkYXRhKSB7XG4gICAgLy8gU2V0IHRoZSBwYXRoIG5hbWUgYmFzZWQgb24gdGhlIGxvY2F0aW9uXG4gICAgY29uc3QgZCA9IGRhdGEubWFwKGVsID0+IHtcbiAgICAgICAgaWYgKGVsLmhhc093blByb3BlcnR5KFRyYWNrLmtleSkpXG4gICAgICAgICAgZWxbVHJhY2sua2V5XSA9IGAke3dpbmRvdy5sb2NhdGlvbi5wYXRobmFtZX0vJHtlbFtUcmFjay5rZXldfWBcbiAgICAgICAgcmV0dXJuIGVsO1xuICAgICAgfSk7XG5cbiAgICBsZXQgd3QgPSB0aGlzLndlYnRyZW5kcyhrZXksIGQpO1xuICAgIGxldCBnYSA9IHRoaXMuZ3RhZyhrZXksIGQpO1xuXG4gICAgLyogZXNsaW50LWRpc2FibGUgbm8tY29uc29sZSAqL1xuICAgIGlmIChwcm9jZXNzLmVudi5OT0RFX0VOViAhPT0gJ3Byb2R1Y3Rpb24nKVxuICAgICAgY29uc29sZS5kaXIoeydUcmFjayc6IFt3dCwgZ2FdfSk7XG4gICAgLyogZXNsaW50LWVuYWJsZSBuby1jb25zb2xlICovXG5cbiAgICByZXR1cm4gZDtcbiAgfTtcblxuICAvKipcbiAgICogRGF0YSBidXMgZm9yIHRyYWNraW5nIHZpZXdzIGluIFdlYnRyZW5kcyBhbmQgR29vZ2xlIEFuYWx5dGljc1xuICAgKlxuICAgKiBAcGFyYW0gIHtTdHJpbmd9ICAgICAgYXBwICAgVGhlIG5hbWUgb2YgdGhlIFNpbmdsZSBQYWdlIEFwcGxpY2F0aW9uIHRvIHRyYWNrXG4gICAqIEBwYXJhbSAge1N0cmluZ30gICAgICBrZXkgICBUaGUga2V5IG9yIGV2ZW50IG9mIHRoZSBkYXRhXG4gICAqIEBwYXJhbSAge0NvbGxlY3Rpb259ICBkYXRhICBUaGUgZGF0YSB0byB0cmFja1xuICAgKi9cbiAgdmlldyhhcHAsIGtleSwgZGF0YSkge1xuICAgIGxldCB3dCA9IHRoaXMud2VidHJlbmRzKGtleSwgZGF0YSk7XG4gICAgbGV0IGdhID0gdGhpcy5ndGFnVmlldyhhcHAsIGtleSk7XG5cbiAgICAvKiBlc2xpbnQtZGlzYWJsZSBuby1jb25zb2xlICovXG4gICAgaWYgKHByb2Nlc3MuZW52Lk5PREVfRU5WICE9PSAncHJvZHVjdGlvbicpXG4gICAgICBjb25zb2xlLmRpcih7J1RyYWNrJzogW3d0LCBnYV19KTtcbiAgICAvKiBlc2xpbnQtZW5hYmxlIG5vLWNvbnNvbGUgKi9cbiAgfTtcblxuICAvKipcbiAgICogUHVzaCBFdmVudHMgdG8gV2VidHJlbmRzXG4gICAqXG4gICAqIEBwYXJhbSAge1N0cmluZ30gICAgICBrZXkgICBUaGUga2V5IG9yIGV2ZW50IG9mIHRoZSBkYXRhXG4gICAqIEBwYXJhbSAge0NvbGxlY3Rpb259ICBkYXRhICBUaGUgZGF0YSB0byB0cmFja1xuICAgKi9cbiAgd2VidHJlbmRzKGtleSwgZGF0YSkge1xuICAgIGlmIChcbiAgICAgIHR5cGVvZiBXZWJ0cmVuZHMgPT09ICd1bmRlZmluZWQnIHx8XG4gICAgICB0eXBlb2YgZGF0YSA9PT0gJ3VuZGVmaW5lZCcgfHxcbiAgICAgICF0aGlzLmRlc2luYXRpb25zLmluY2x1ZGVzKCd3ZWJ0cmVuZHMnKVxuICAgIClcbiAgICAgIHJldHVybiBmYWxzZTtcblxuICAgIGxldCBldmVudCA9IFt7XG4gICAgICAnV1QudGknOiBrZXlcbiAgICB9XTtcblxuICAgIGlmIChkYXRhWzBdICYmIGRhdGFbMF0uaGFzT3duUHJvcGVydHkoVHJhY2sua2V5KSlcbiAgICAgIGV2ZW50LnB1c2goe1xuICAgICAgICAnRENTLmRjc3VyaSc6IGRhdGFbMF1bVHJhY2sua2V5XVxuICAgICAgfSk7XG4gICAgZWxzZVxuICAgICAgT2JqZWN0LmFzc2lnbihldmVudCwgZGF0YSk7XG5cbiAgICAvLyBGb3JtYXQgZGF0YSBmb3IgV2VidHJlbmRzXG4gICAgbGV0IHd0ZCA9IHthcmdzYTogZXZlbnQuZmxhdE1hcChlID0+IHtcbiAgICAgIHJldHVybiBPYmplY3Qua2V5cyhlKS5mbGF0TWFwKGsgPT4gW2ssIGVba11dKTtcbiAgICB9KX07XG5cbiAgICAvLyBJZiAnYWN0aW9uJyBpcyB1c2VkIGFzIHRoZSBrZXkgKGZvciBndGFnLmpzKSwgc3dpdGNoIGl0IHRvIFdlYnRyZW5kc1xuICAgIGxldCBhY3Rpb24gPSBkYXRhLmFyZ3NhLmluZGV4T2YoJ2FjdGlvbicpO1xuXG4gICAgaWYgKGFjdGlvbikgZGF0YS5hcmdzYVthY3Rpb25dID0gJ0RDUy5kY3N1cmknO1xuXG4gICAgLy8gV2VidHJlbmRzIGRvZXNuJ3Qgc2VuZCB0aGUgcGFnZSB2aWV3IGZvciBNdWx0aVRyYWNrLCBhZGQgcGF0aCB0byB1cmxcbiAgICBsZXQgZGNzdXJpID0gZGF0YS5hcmdzYS5pbmRleE9mKCdEQ1MuZGNzdXJpJyk7XG5cbiAgICBpZiAoZGNzdXJpKVxuICAgICAgZGF0YS5hcmdzYVtkY3N1cmkgKyAxXSA9IHdpbmRvdy5sb2NhdGlvbi5wYXRobmFtZSArIGRhdGEuYXJnc2FbZGNzdXJpICsgMV07XG5cbiAgICAvKiBlc2xpbnQtZGlzYWJsZSBuby11bmRlZiAqL1xuICAgIGlmICh0eXBlb2YgV2VidHJlbmRzICE9PSAndW5kZWZpbmVkJylcbiAgICAgIFdlYnRyZW5kcy5tdWx0aVRyYWNrKHd0ZCk7XG4gICAgLyogZXNsaW50LWRpc2FibGUgbm8tdW5kZWYgKi9cblxuICAgIHJldHVybiBbJ1dlYnRyZW5kcycsIHd0ZF07XG4gIH07XG5cbiAgLyoqXG4gICAqIFB1c2ggQ2xpY2sgRXZlbnRzIHRvIEdvb2dsZSBBbmFseXRpY3NcbiAgICpcbiAgICogQHBhcmFtICB7U3RyaW5nfSAgICAgIGtleSAgIFRoZSBrZXkgb3IgZXZlbnQgb2YgdGhlIGRhdGFcbiAgICogQHBhcmFtICB7Q29sbGVjdGlvbn0gIGRhdGEgIFRoZSBkYXRhIHRvIHRyYWNrXG4gICAqL1xuICBndGFnKGtleSwgZGF0YSkge1xuICAgIGlmIChcbiAgICAgIHR5cGVvZiBndGFnID09PSAndW5kZWZpbmVkJyB8fFxuICAgICAgdHlwZW9mIGRhdGEgPT09ICd1bmRlZmluZWQnIHx8XG4gICAgICAhdGhpcy5kZXNpbmF0aW9ucy5pbmNsdWRlcygnZ3RhZycpXG4gICAgKVxuICAgICAgcmV0dXJuIGZhbHNlO1xuXG4gICAgbGV0IHVyaSA9IGRhdGEuZmluZCgoZWxlbWVudCkgPT4gZWxlbWVudC5oYXNPd25Qcm9wZXJ0eShUcmFjay5rZXkpKTtcblxuICAgIGxldCBldmVudCA9IHtcbiAgICAgICdldmVudF9jYXRlZ29yeSc6IGtleVxuICAgIH07XG5cbiAgICAvKiBlc2xpbnQtZGlzYWJsZSBuby11bmRlZiAqL1xuICAgIGd0YWcoVHJhY2sua2V5LCB1cmlbVHJhY2sua2V5XSwgZXZlbnQpO1xuICAgIC8qIGVzbGludC1lbmFibGUgbm8tdW5kZWYgKi9cblxuICAgIHJldHVybiBbJ2d0YWcnLCBUcmFjay5rZXksIHVyaVtUcmFjay5rZXldLCBldmVudF07XG4gIH07XG5cbiAgLyoqXG4gICAqIFB1c2ggU2NyZWVuIFZpZXcgRXZlbnRzIHRvIEdvb2dsZSBBbmFseXRpY3NcbiAgICpcbiAgICogQHBhcmFtICB7U3RyaW5nfSAgYXBwICBUaGUgbmFtZSBvZiB0aGUgYXBwbGljYXRpb25cbiAgICogQHBhcmFtICB7U3RyaW5nfSAga2V5ICBUaGUga2V5IG9yIGV2ZW50IG9mIHRoZSBkYXRhXG4gICAqL1xuICBndGFnVmlldyhhcHAsIGtleSkge1xuICAgIGlmIChcbiAgICAgIHR5cGVvZiBndGFnID09PSAndW5kZWZpbmVkJyB8fFxuICAgICAgdHlwZW9mIGRhdGEgPT09ICd1bmRlZmluZWQnIHx8XG4gICAgICAhdGhpcy5kZXNpbmF0aW9ucy5pbmNsdWRlcygnZ3RhZycpXG4gICAgKVxuICAgICAgcmV0dXJuIGZhbHNlO1xuXG4gICAgbGV0IHZpZXcgPSB7XG4gICAgICBhcHBfbmFtZTogYXBwLFxuICAgICAgc2NyZWVuX25hbWU6IGtleVxuICAgIH07XG5cbiAgICAvKiBlc2xpbnQtZGlzYWJsZSBuby11bmRlZiAqL1xuICAgIGd0YWcoJ2V2ZW50JywgJ3NjcmVlbl92aWV3Jywgdmlldyk7XG4gICAgLyogZXNsaW50LWVuYWJsZSBuby11bmRlZiAqL1xuXG4gICAgcmV0dXJuIFsnZ3RhZycsIFRyYWNrLmtleSwgJ3NjcmVlbl92aWV3Jywgdmlld107XG4gIH07XG59XG5cbi8qKiBAdHlwZSB7U3RyaW5nfSBUaGUgbWFpbiBzZWxlY3RvciB0byBhZGQgdGhlIHRyYWNraW5nIGZ1bmN0aW9uIHRvICovXG5UcmFjay5zZWxlY3RvciA9ICdbZGF0YS1qcyo9XCJ0cmFja1wiXSc7XG5cbi8qKiBAdHlwZSB7U3RyaW5nfSBUaGUgbWFpbiBldmVudCB0cmFja2luZyBrZXkgdG8gbWFwIHRvIFdlYnRyZW5kcyBEQ1MudXJpICovXG5UcmFjay5rZXkgPSAnZXZlbnQnO1xuXG4vKiogQHR5cGUge0FycmF5fSBXaGF0IGRlc3RpbmF0aW9ucyB0byBwdXNoIGRhdGEgdG8gKi9cblRyYWNrLmRlc3RpbmF0aW9ucyA9IFtcbiAgJ3dlYnRyZW5kcycsXG4gICdndGFnJ1xuXTtcblxuZXhwb3J0IGRlZmF1bHQgVHJhY2s7IiwiaW1wb3J0ICcuL21vZHVsZXMvcG9seWZpbGwtcmVtb3ZlJztcblxuaW1wb3J0IHJlcXVlc3RGb3JtIGZyb20gJy4vbW9kdWxlcy9zdWJtaXNzaW9uLmpzJztcbmltcG9ydCBzd2FnZ2VyIGZyb20gJy4vbW9kdWxlcy9zd2FnZ2VyLmpzJztcbmltcG9ydCBidWxrU3VibWlzc2lvbiBmcm9tICcuL21vZHVsZXMvYnVsay1zdWJtaXNzaW9uLmpzJztcbmltcG9ydCBjaGFuZ2VQYXNzd29yZCBmcm9tICcuL21vZHVsZXMvY2hhbmdlLXBhc3N3b3JkLmpzJztcbmltcG9ydCByZXF1ZXN0Rm9ybUpTT04gZnJvbSAnLi9tb2R1bGVzL3JlcXVlc3QtZm9ybS1qc29uLmpzJztcblxuaW1wb3J0IEljb25zIGZyb20gJ0BueWNvcHBvcnR1bml0eS9wdHRybi1zY3JpcHRzL3NyYy9pY29ucy9pY29ucyc7XG5pbXBvcnQgVG9nZ2xlIGZyb20gJ0BueWNvcHBvcnR1bml0eS9wdHRybi1zY3JpcHRzL3NyYy90b2dnbGUvdG9nZ2xlJztcbmltcG9ydCBUcmFjayBmcm9tICdAbnljb3Bwb3J0dW5pdHkvcHR0cm4tc2NyaXB0cy9zcmMvdHJhY2svdHJhY2snO1xuXG5jb25zdCBjZG4gPSBDRE5fQkFTRSArIENETiArICcvJztcblxubmV3IEljb25zKCdzdmcvbnljby1wYXR0ZXJucy5zdmcnKTsgLy8gaHR0cHM6Ly9jZG4uanNkZWxpdnIubmV0L2doL2NpdHlvZm5ld3lvcmsvbnljby1wYXR0ZXJuc0B2Mi42LjgvZGlzdC9zdmcvaWNvbnMuc3ZnXG5uZXcgSWNvbnMoJ3N2Zy9hY2Nlc3MtcGF0dGVybnMuc3ZnJyk7IC8vIGh0dHBzOi8vY2RuLmpzZGVsaXZyLm5ldC9naC9jaXR5b2ZuZXd5b3JrL2FjY2Vzcy1ueWMtcGF0dGVybnNAdjAuMTUuMTQvZGlzdC9zdmcvaWNvbnMuc3ZnXG5uZXcgSWNvbnMoJ3N2Zy9mZWF0aGVyLnN2ZycpO1xuXG5uZXcgVG9nZ2xlKCk7XG5uZXcgVHJhY2soKTtcblxuaWYgKCh3aW5kb3cubG9jYXRpb24ucGF0aG5hbWUuaW5kZXhPZignZW5kcG9pbnRzJykgPj0gMCkpXG4gIHN3YWdnZXIoY2RuKTtcblxuaWYgKCh3aW5kb3cubG9jYXRpb24ucGF0aG5hbWUuaW5kZXhPZignZm9ybScpID49IDApKVxuICByZXF1ZXN0Rm9ybSgpO1xuXG5pZiAoKHdpbmRvdy5sb2NhdGlvbi5wYXRobmFtZS5pbmRleE9mKCdyZXF1ZXN0LWJ1aWxkZXInKSA+PSAwKSlcbiAgcmVxdWVzdEZvcm1KU09OKCk7XG5cbmlmICgod2luZG93LmxvY2F0aW9uLnBhdGhuYW1lLmluZGV4T2YoJ2J1bGstc3VibWlzc2lvbicpID49IDApKVxuICBidWxrU3VibWlzc2lvbigpO1xuXG5pZiAoKHdpbmRvdy5sb2NhdGlvbi5wYXRobmFtZS5pbmRleE9mKCdjaGFuZ2UtcGFzc3dvcmQnKSA+PSAwKSlcbiAgY2hhbmdlUGFzc3dvcmQoKTtcblxuLy8gR2V0IHRoZSBjb250ZW50IG1hcmtkb3duIGZyb20gQ0ROIGFuZCBhcHBlbmRcbmxldCBtYXJrZG93bnMgPSAkKCdib2R5JykuZmluZCgnW2lkXj1cIm1hcmtkb3duXCJdJyk7XG5cbm1hcmtkb3ducy5lYWNoKGZ1bmN0aW9uKCkge1xuICBsZXQgdGFyZ2V0ID0gJCh0aGlzKTtcbiAgbGV0IGZpbGUgPSAkKHRoaXMpLmF0dHIoJ2lkJykucmVwbGFjZSgnbWFya2Rvd24tJywgJycpO1xuXG4gICQuZ2V0KGNkbiArIGZpbGUgKyAnLm1kJywgZnVuY3Rpb24oZGF0YSkge1xuICAgIHNob3dkb3duLnNldEZsYXZvcignZ2l0aHViJyk7XG5cbiAgICBsZXQgY29udmVydGVyID0gbmV3IHNob3dkb3duLkNvbnZlcnRlcih7dGFibGVzOiB0cnVlfSk7XG4gICAgbGV0IGh0bWwgPSBjb252ZXJ0ZXIubWFrZUh0bWwoZGF0YSk7XG5cbiAgICB0YXJnZXQuYXBwZW5kKGh0bWwpXG4gICAgICAuaGlkZSgpXG4gICAgICAuZmFkZUluKDI1MClcblxuICB9LCAndGV4dCcpXG59KTtcbiJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7RUFBQSxDQUFDLFNBQVMsR0FBRyxFQUFFO0VBQ2YsRUFBRSxHQUFHLENBQUMsT0FBTyxDQUFDLFNBQVMsSUFBSSxFQUFFO0VBQzdCLElBQUksSUFBSSxJQUFJLENBQUMsY0FBYyxDQUFDLFFBQVEsQ0FBQyxFQUFFO0VBQ3ZDLE1BQU0sT0FBTztFQUNiLEtBQUs7RUFDTCxJQUFJLE1BQU0sQ0FBQyxjQUFjLENBQUMsSUFBSSxFQUFFLFFBQVEsRUFBRTtFQUMxQyxNQUFNLFlBQVksRUFBRSxJQUFJO0VBQ3hCLE1BQU0sVUFBVSxFQUFFLElBQUk7RUFDdEIsTUFBTSxRQUFRLEVBQUUsSUFBSTtFQUNwQixNQUFNLEtBQUssRUFBRSxTQUFTLE1BQU0sR0FBRztFQUMvQixRQUFRLElBQUksSUFBSSxDQUFDLFVBQVUsS0FBSyxJQUFJO0VBQ3BDLFVBQVUsSUFBSSxDQUFDLFVBQVUsQ0FBQyxXQUFXLENBQUMsSUFBSSxDQUFDLENBQUM7RUFDNUMsT0FBTztFQUNQLEtBQUssQ0FBQyxDQUFDO0VBQ1AsR0FBRyxDQUFDLENBQUM7RUFDTCxDQUFDLEVBQUU7RUFDSCxFQUFFLE9BQU8sQ0FBQyxTQUFTO0VBQ25CLEVBQUUsYUFBYSxDQUFDLFNBQVM7RUFDekIsRUFBRSxZQUFZLENBQUMsU0FBUztFQUN4QixDQUFDLENBQUM7O0FDbkJGLGtCQUFlO0VBQ2YsRUFBRTtFQUNGLElBQUksT0FBTyxFQUFFLDZCQUE2QjtFQUMxQyxHQUFHO0VBQ0gsRUFBRTtFQUNGLElBQUksT0FBTyxFQUFFLCtCQUErQjtFQUM1QyxHQUFHO0VBQ0gsRUFBRTtFQUNGLElBQUksT0FBTyxFQUFFLDhCQUE4QjtFQUMzQyxHQUFHO0VB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
