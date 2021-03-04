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

  function swagger(cdn) {
    const controller = new AbortController();

    window.editor = SwaggerEditorBundle({
      dom_id: '#swagger-editor',
      url: cdn + 'endpoints.yml'
    });

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
      fields = form.find('[required]'),
      errNode = $('.error-msg'),
      warningNode = $('.warning-msg'),
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

}());
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibWFpbi5qcyIsInNvdXJjZXMiOlsiLi4vLi4vLi4vc3JjL2pzL21vZHVsZXMvcG9seWZpbGwtcmVtb3ZlLmpzIiwiLi4vLi4vLi4vc3JjL2pzL21vZHVsZXMvcmVzcG9uc2VzLmpzIiwiLi4vLi4vLi4vc3JjL2pzL21vZHVsZXMvc3VibWlzc2lvbi5qcyIsIi4uLy4uLy4uL3NyYy9qcy9tb2R1bGVzL3N3YWdnZXIuanMiLCIuLi8uLi8uLi9ub2RlX21vZHVsZXMvQG55Y29wcG9ydHVuaXR5L3B0dHJuLXNjcmlwdHMvc3JjL2Zvcm1zL2Zvcm1zLmpzIiwiLi4vLi4vLi4vc3JjL2pzL21vZHVsZXMvdXRpbC5qcyIsIi4uLy4uLy4uL3NyYy9qcy9tb2R1bGVzL2J1bGstc3VibWlzc2lvbi5qcyIsIi4uLy4uLy4uL3NyYy9qcy9tb2R1bGVzL2NoYW5nZS1wYXNzd29yZC5qcyIsIi4uLy4uLy4uL3NyYy9qcy9tb2R1bGVzL3JlcXVlc3QtZm9ybS1qc29uLmpzIiwiLi4vLi4vLi4vbm9kZV9tb2R1bGVzL0BueWNvcHBvcnR1bml0eS9wdHRybi1zY3JpcHRzL3NyYy9pY29ucy9pY29ucy5qcyIsIi4uLy4uLy4uL25vZGVfbW9kdWxlcy9Abnljb3Bwb3J0dW5pdHkvcHR0cm4tc2NyaXB0cy9zcmMvdG9nZ2xlL3RvZ2dsZS5qcyIsIi4uLy4uLy4uL25vZGVfbW9kdWxlcy9Abnljb3Bwb3J0dW5pdHkvcHR0cm4tc2NyaXB0cy9zcmMvdHJhY2svdHJhY2suanMiLCIuLi8uLi8uLi9zcmMvanMvbWFpbi5qcyJdLCJzb3VyY2VzQ29udGVudCI6WyIoZnVuY3Rpb24oYXJyKSB7XG4gIGFyci5mb3JFYWNoKGZ1bmN0aW9uKGl0ZW0pIHtcbiAgICBpZiAoaXRlbS5oYXNPd25Qcm9wZXJ0eSgncmVtb3ZlJykpIHtcbiAgICAgIHJldHVybjtcbiAgICB9XG4gICAgT2JqZWN0LmRlZmluZVByb3BlcnR5KGl0ZW0sICdyZW1vdmUnLCB7XG4gICAgICBjb25maWd1cmFibGU6IHRydWUsXG4gICAgICBlbnVtZXJhYmxlOiB0cnVlLFxuICAgICAgd3JpdGFibGU6IHRydWUsXG4gICAgICB2YWx1ZTogZnVuY3Rpb24gcmVtb3ZlKCkge1xuICAgICAgICBpZiAodGhpcy5wYXJlbnROb2RlICE9PSBudWxsKVxuICAgICAgICAgIHRoaXMucGFyZW50Tm9kZS5yZW1vdmVDaGlsZCh0aGlzKTtcbiAgICAgIH1cbiAgICB9KTtcbiAgfSk7XG59KShbXG4gIEVsZW1lbnQucHJvdG90eXBlLFxuICBDaGFyYWN0ZXJEYXRhLnByb3RvdHlwZSxcbiAgRG9jdW1lbnRUeXBlLnByb3RvdHlwZVxuXSk7IiwiZXhwb3J0IGRlZmF1bHQgW1xuICB7XG4gICAgXCJFTUFJTFwiOiBcIlBsZWFzZSBlbnRlciBhIHZhbGlkIGVtYWlsLlwiXG4gIH0sXG4gIHtcbiAgICBcIkZOQU1FXCI6IFwiUGxlYXNlIGVudGVyIHlvdXIgZmlyc3QgbmFtZS5cIlxuICB9LFxuICB7XG4gICAgXCJMTkFNRVwiOiBcIlBsZWFzZSBlbnRlciB5b3VyIGxhc3QgbmFtZS5cIlxuICB9LFxuICB7XG4gICAgXCJPUkdcIjogXCJQbGVhc2UgZW50ZXIgeW91ciBvcmdhbml6YXRpb24uXCJcbiAgfSxcbiAge1xuICAgIFwiRVJSXCI6IFwiVGhlcmUgd2FzIGEgcHJvYmxlbSB3aXRoIHlvdXIgcmVxdWVzdC4gUGxlYXNlIHRyeSBhZ2FpbiBsYXRlciBvciBzZW5kIHVzIGEgbWVzc2FnZSBhdCA8YSBjbGFzcz1cXFwidGV4dC1wcmltYXJ5LXJlZFxcXCIgaHJlZj1cXFwibWFpbHRvOmVsaWdpYmlsaXR5YXBpQG55Y29wcG9ydHVuaXR5Lm55Yy5nb3ZcXFwiPmVsaWdpYmlsaXR5YXBpQG55Y29wcG9ydHVuaXR5Lm55Yy5nb3Y8L2E+LiBXZSB3aWxsIGdldCBiYWNrIHRvIHlvdSBhcyBzb29uIGFzIHBvc3NpYmxlIVwiXG4gIH0sXG4gIHtcbiAgICBcIkVSUl9BTFJFQURZX1JFUVVFU1RFRFwiOiBcIllvdSBoYXZlIGFscmVhZHkgbWFkZSBhIHJlcXVlc3QuIElmIHlvdSBoYXZlIG5vdCBoZWFyZCBiYWNrIGZyb20gdXMsIHBsZWFzZSBzZW5kIHVzIGEgbWVzc2FnZSBhdCA8YSBjbGFzcz1cXFwidGV4dC1wcmltYXJ5LXJlZFxcXCIgaHJlZj1cXFwibWFpbHRvOmVsaWdpYmlsaXR5YXBpQG55Y29wcG9ydHVuaXR5Lm55Yy5nb3ZcXFwiPmVsaWdpYmlsaXR5YXBpQG55Y29wcG9ydHVuaXR5Lm55Yy5nb3Y8L2E+LiBXZSB3aWxsIGdldCBiYWNrIHRvIHlvdSBhcyBzb29uIGFzIHBvc3NpYmxlIVwiXG4gIH0sXG4gIHtcbiAgICBcIkVSUl9UT09fTUFOWV9SRVFVRVNUU1wiOiBcIkl0IHNlZW1zIHRoYXQgeW91IGhhdmUgbWFkZSB0b28gbWFueSByZXF1ZXN0cy4gUGxlYXNlIHRyeSBhZ2FpbiBsYXRlciBvciBzZW5kIHVzIGEgbWVzc2FnZSBhdCA8YSBjbGFzcz1cXFwidGV4dC1wcmltYXJ5LXJlZFxcXCIgaHJlZj1cXFwibWFpbHRvOmVsaWdpYmlsaXR5YXBpQG55Y29wcG9ydHVuaXR5Lm55Yy5nb3ZcXFwiPmVsaWdpYmlsaXR5YXBpQG55Y29wcG9ydHVuaXR5Lm55Yy5nb3Y8L2E+LiBXZSB3aWxsIGdldCBiYWNrIHRvIHlvdSBhcyBzb29uIGFzIHBvc3NpYmxlIVwiXG4gIH0sXG4gIHtcbiAgICBcIk1TR19SRUNBUFRDSEFcIjogXCJUaGVyZSdzIG9uZSBtb3JlIHN0ZXAhXCJcbiAgfSxcbiAge1xuICAgIFwiU1VDQ0VTU1wiOiBcIlRoYW5rIHlvdSEgWW91ciByZXF1ZXN0IHdpbGwgYmUgcmV2aWV3ZWQgd2l0aCBjb25maXJtYXRpb24gd2l0aGluIDEtMiBidXNpbmVzcyBkYXlzLlwiXG4gIH0sXG4gIHtcbiAgICBcIkdlbmVyYWxcIjoge1xuICAgICAgXCJlcnJvclwiOiBcIlBsZWFzZSByZXNvbHZlIGhpZ2hsaWdodGVkIGZpZWxkcy5cIixcbiAgICAgIFwid2FybmluZ1wiOiBcIlJlc29sdmluZyB0aGUgZm9sbG93aW5nIG1pZ2h0IGdlbmVyYXRlIGRpZmZlcmVudCBzY3JlZW5pbmcgcmVzdWx0cyBmb3IgdGhpcyBob3VzZWhvbGQgKG9wdGlvbmFsKTpcIlxuICAgIH1cbiAgfSxcbiAge1xuICAgIFwiSG91c2Vob2xkXCI6IHtcbiAgICAgIFwiZXJyX2V4Y2Vzc19tZW1iZXJzXCI6IFwiSG91c2Vob2xkOiBUaGUgbnVtYmVyIG9mIGhvdXNlaG9sZCBtZW1iZXJzIG11c3QgYmUgYmV0d2VlbiAxIGFuZCA4IG1lbWJlcnMuXCIsXG4gICAgICBcIndhcm5pbmdfcmVudGFsX3R5cGVcIjogXCJIb3VzZWhvbGQ6IFRoZXJlIHNob3VsZCBiZSBhIHJlbnRhbCB0eXBlLlwiXG4gICAgfVxuICB9LFxuICB7XG4gICAgXCJQZXJzb25cIjoge1xuICAgICAgXCJlcnJfbnVtX3BlcnNvbnNcIjogXCJQZXJzb246IFRoZSBudW1iZXIgb2YgcGVyc29ucyBjYW5ub3QgZXhjZWVkIDggbWVtYmVyc1wiLFxuICAgICAgXCJlcnJfaG9oXCI6IFwiUGVyc29uOiBFeGFjdGx5IG9uZSBwZXJzb24gbXVzdCBiZSB0aGUgaGVhZCBvZiBob3VzZWhvbGQuXCIsXG4gICAgICBcIndhcm5pbmdfb25fbGVhc2VcIjogXCJQZXJzb246IEF0IGxlYXN0IG9uZSBwZXJzb24gc2hvdWxkIGJlIG9uIHRoZSBsZWFzZS5cIixcbiAgICAgIFwid2FybmluZ19vbl9kZWVkXCI6IFwiUGVyc29uOiBBdCBsZWFzdCBvbmUgcGVyc29uIHNob3VsZCBiZSBvbiB0aGUgZGVlZC5cIlxuICAgIH1cbiAgfVxuXVxuIiwiaW1wb3J0IHJlc3BvbnNlcyBmcm9tICcuL3Jlc3BvbnNlcy5qcyc7XG5cbmV4cG9ydCBkZWZhdWx0IGZ1bmN0aW9uKCkge1xuICBjb25zdCBlcnJvck1zZyA9ICdQbGVhc2UgZW50ZXIgeW91ciBmaXJzdCBuYW1lLCBsYXN0IG5hbWUsIGVtYWlsIGFuZCBvcmdhbml6YXRpb24uJztcblxuICAvKipcbiAgKiBWYWxpZGF0ZSBmb3JtIGZpZWxkc1xuICAqIEBwYXJhbSB7b2JqZWN0fSBmb3JtRGF0YSAtIGZvcm0gZmllbGRzXG4gICogQHBhcmFtIHtvYmplY3R9IGV2ZW50IC0gZXZlbnQgb2JqZWN0XG4gICovXG4gIGZ1bmN0aW9uIHZhbGlkYXRlRmllbGRzKGZvcm0sIGV2ZW50KSB7XG4gICAgZXZlbnQucHJldmVudERlZmF1bHQoKTtcblxuICAgIGNvbnN0IGZpZWxkcyA9IGZvcm0uc2VyaWFsaXplQXJyYXkoKS5yZWR1Y2UoKG9iaiwgaXRlbSkgPT4gKG9ialtpdGVtLm5hbWVdID0gaXRlbS52YWx1ZSwgb2JqKSAse30pXG4gICAgY29uc3QgcmVxdWlyZWRGaWVsZHMgPSBmb3JtLmZpbmQoJ1tyZXF1aXJlZF0nKTtcbiAgICBjb25zdCBlbWFpbFJlZ2V4ID0gbmV3IFJlZ0V4cCgvXFxTK0BcXFMrXFwuXFxTKy8pO1xuICAgIGxldCBoYXNFcnJvcnMgPSBmYWxzZTtcblxuICAgIC8vIGxvb3AgdGhyb3VnaCBlYWNoIHJlcXVpcmVkIGZpZWxkXG4gICAgcmVxdWlyZWRGaWVsZHMuZWFjaChmdW5jdGlvbigpIHtcbiAgICAgIGNvbnN0IGZpZWxkTmFtZSA9ICQodGhpcykuYXR0cignbmFtZScpO1xuXG4gICAgICBpZiggIWZpZWxkc1tmaWVsZE5hbWVdIHx8XG4gICAgICAgIChmaWVsZE5hbWUgPT0gJ0VNQUlMJyAmJiAhZW1haWxSZWdleC50ZXN0KGZpZWxkcy5FTUFJTCkpICkge1xuICAgICAgICBoYXNFcnJvcnMgPSB0cnVlO1xuICAgICAgICAkKHRoaXMpLmFkZENsYXNzKCdpcy1lcnJvcicpO1xuICAgICAgICAkKHRoaXMpLmFkZENsYXNzKCdib3JkZXItcHJpbWFyeS1yZWQnKTtcbiAgICAgICAgJCh0aGlzKS5iZWZvcmUoJzxwIGNsYXNzPVwiaXMtZXJyb3IgdGV4dC1wcmltYXJ5LXJlZCB0ZXh0LXNtYWxsIG15LTBcIj4nKyByZXNwb25zZXMuZmluZCh4ID0+IHhbZmllbGROYW1lXSlbZmllbGROYW1lXSArICc8L3A+Jyk7XG4gICAgICB9IGVsc2Uge1xuICAgICAgICAkKHRoaXMpLnJlbW92ZUNsYXNzKCdib3JkZXItcHJpbWFyeS1yZWQnKTtcbiAgICAgIH1cbiAgICB9KTtcblxuICAgIC8vIGlmIHRoZXJlIGFyZSBubyBlcnJvcnMsIHN1Ym1pdFxuICAgIGlmIChoYXNFcnJvcnMpIHtcbiAgICAgIGZvcm0uZmluZCgnLmZvcm0tZXJyb3InKS5odG1sKGA8cD4ke2Vycm9yTXNnfTwvcD5gKTtcbiAgICB9IGVsc2Uge1xuICAgICAgc3VibWl0U2lnbnVwKGZvcm0sIGZpZWxkcyk7XG4gICAgfVxuICB9XG5cbiAgLyoqXG4gICogU3VibWl0cyB0aGUgZm9ybSBvYmplY3QgdG8gTWFpbGNoaW1wXG4gICogQHBhcmFtIHtvYmplY3R9IGZvcm1EYXRhIC0gZm9ybSBmaWVsZHNcbiAgKi9cbiAgZnVuY3Rpb24gc3VibWl0U2lnbnVwKGZvcm0sIGZvcm1EYXRhKXtcbiAgICAkLmFqYXgoe1xuICAgICAgdXJsOiBmb3JtLmF0dHIoJ2FjdGlvbicpLFxuICAgICAgdHlwZTogZm9ybS5hdHRyKCdtZXRob2QnKSxcbiAgICAgIGRhdGFUeXBlOiAnanNvbicsLy9ubyBqc29ucFxuICAgICAgY2FjaGU6IGZhbHNlLFxuICAgICAgZGF0YTogZm9ybURhdGEsXG4gICAgICBjb250ZW50VHlwZTogXCJhcHBsaWNhdGlvbi9qc29uOyBjaGFyc2V0PXV0Zi04XCIsXG4gICAgICBzdWNjZXNzOiBmdW5jdGlvbihyZXNwb25zZSkge1xuICAgICAgICBpZihyZXNwb25zZS5yZXN1bHQgIT09ICdzdWNjZXNzJyl7XG4gICAgICAgICAgICBpZihyZXNwb25zZS5tc2cuaW5jbHVkZXMoJ2FscmVhZHkgc3Vic2NyaWJlZCcpKXtcbiAgICAgICAgICAgICAgZm9ybS5odG1sKCc8cCBjbGFzcz1cInRleHQtcHJpbWFyeS1yZWQgdGV4dC1jZW50ZXIgaXRhbGljXCI+JysgcmVzcG9uc2VzLmZpbmQoeCA9PiB4W1wiRVJSX0FMUkVBRFlfUkVRVUVTVEVEXCJdKVtcIkVSUl9BTFJFQURZX1JFUVVFU1RFRFwiXSArICc8L3A+Jyk7XG4gICAgICAgICAgICB9IGVsc2UgaWYocmVzcG9uc2UubXNnLmluY2x1ZGVzKCd0b28gbWFueSByZWNlbnQgc2lnbnVwIHJlcXVlc3RzJykpe1xuICAgICAgICAgICAgICBmb3JtLmh0bWwoJzxwIGNsYXNzPVwidGV4dC1wcmltYXJ5LXJlZCB0ZXh0LWNlbnRlciBpdGFsaWNcIj4nKyByZXNwb25zZXMuZmluZCh4ID0+IHhbXCJFUlJfVE9PX01BTllfUkVRVUVTVFNcIl0pW1wiRVJSX1RPT19NQU5ZX1JFUVVFU1RTXCJdICsnPC9wPicpO1xuICAgICAgICAgICAgfSBlbHNlIGlmKHJlc3BvbnNlLm1zZy5pbmNsdWRlcygnY2FwdGNoYScpKXtcbiAgICAgICAgICAgICAgdmFyIHVybCA9ICQoXCJmb3JtI21jLWVtYmVkZGVkLXN1YnNjcmliZS1mb3JtXCIpLmF0dHIoXCJhY3Rpb25cIik7XG4gICAgICAgICAgICAgIHZhciBwYXJhbWV0ZXJzID0gJC5wYXJhbShyZXNwb25zZS5wYXJhbXMpO1xuICAgICAgICAgICAgICB1cmwgPSB1cmwuc3BsaXQoXCItanNvbj9cIilbMF07XG4gICAgICAgICAgICAgIHVybCArPSBcIj9cIjtcbiAgICAgICAgICAgICAgdXJsICs9IHBhcmFtZXRlcnM7XG4gICAgICAgICAgICAgIHdpbmRvdy5vcGVuKHVybCwgJ19ibGFuaycpO1xuICAgICAgICAgICAgICBmb3JtLmh0bWwoJzxwIGNsYXNzPVwidGV4dC1wcmltYXJ5LW5hdnkgdGV4dC1jZW50ZXIgaXRhbGljXCI+JysgcmVzcG9uc2VzLmZpbmQoeCA9PiB4W1wiTVNHX1JFQ0FQVENIQVwiXSlbXCJNU0dfUkVDQVBUQ0hBXCJdICsnPGEgY2xhc3M9XCJ0ZXh0LXByaW1hcnktcmVkXCIgdGFyZ2V0PVwiX2JsYW5rXCIgaHJlZj1cIicgKyB1cmwgKyAnXCI+IFBsZWFzZSBjb25maXJtIHRoYXQgeW91IGFyZSBub3QgYSByb2JvdC48L2E+PC9wPicpO1xuICAgICAgICAgICAgfWVsc2Uge1xuICAgICAgICAgICAgICBmb3JtLmh0bWwoJzxwIGNsYXNzPVwidGV4dC1wcmltYXJ5LXJlZCB0ZXh0LWNlbnRlciBpdGFsaWNcIj4nICsgcmVzcG9uc2VzLmZpbmQoeCA9PiB4W1wiRVJSXCJdKVtcIkVSUlwiXSArICc8L3A+Jyk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1lbHNlIHtcbiAgICAgICAgICBmb3JtLmh0bWwoJzxwIGNsYXNzPVwidGV4dC1wcmltYXJ5LW5hdnkgdGV4dC1jZW50ZXIgaXRhbGljXCI+JysgcmVzcG9uc2VzLmZpbmQoeCA9PiB4W1wiU1VDQ0VTU1wiXSlbXCJTVUNDRVNTXCJdICsnPC9wPicpO1xuICAgICAgICB9XG4gICAgICB9LFxuICAgICAgZXJyb3I6IGZ1bmN0aW9uKHJlc3BvbnNlKSB7XG4gICAgICAgIGNvbnNvbGUubG9nKHJlc3BvbnNlKVxuICAgICAgICBmb3JtLmJlZm9yZSgnPHAgY2xhc3M9XCJ0ZXh0LXByaW1hcnktcmVkIHRleHQtY2VudGVyIGl0YWxpY1wiPicgKyByZXNwb25zZXMuZmluZCh4ID0+IHhbXCJFUlJcIl0pW1wiRVJSXCJdICsgJzwvcD4nKTtcbiAgICAgIH1cbiAgICB9KTtcbiAgfVxuXG4gIC8qKlxuICAqIFRyaWdnZXJzIGZvcm0gdmFsaWRhdGlvbiBhbmQgc2VuZHMgdGhlIGZvcm0gZGF0YSB0byBNYWlsY2hpbXBcbiAgKiBAcGFyYW0ge29iamVjdH0gZm9ybURhdGEgLSBmb3JtIGZpZWxkc1xuICAqL1xuICAkKCcjbWMtZW1iZWRkZWQtc3Vic2NyaWJlOmJ1dHRvblt0eXBlPVwic3VibWl0XCJdJykuY2xpY2soZnVuY3Rpb24oZXZlbnQpe1xuICAgIGV2ZW50LnByZXZlbnREZWZhdWx0KCk7XG4gICAgbGV0ICRmb3JtID0gJCh0aGlzKS5wYXJlbnRzKCdmb3JtJyk7XG4gICAgdmFsaWRhdGVGaWVsZHMoJGZvcm0sIGV2ZW50KTtcbiAgfSk7XG5cbn1cbiIsImV4cG9ydCBkZWZhdWx0IGZ1bmN0aW9uKGNkbikge1xuICBjb25zdCBjb250cm9sbGVyID0gbmV3IEFib3J0Q29udHJvbGxlcigpXG5cbiAgd2luZG93LmVkaXRvciA9IFN3YWdnZXJFZGl0b3JCdW5kbGUoe1xuICAgIGRvbV9pZDogJyNzd2FnZ2VyLWVkaXRvcicsXG4gICAgdXJsOiBjZG4gKyAnZW5kcG9pbnRzLnltbCdcbiAgfSk7XG5cbiAgJCgnLlNwbGl0UGFuZScpLmNzcygncG9zaXRpb24nLCAncmVsYXRpdmUnKTtcbiAgJCgnLlBhbmUxJykuY3NzKCdkaXNwbGF5JywgJ25vbmUnKTtcbiAgJCgnLlBhbmUyJykuY3NzKCd3aWR0aCcsICcxMDAlJyk7XG5cbiAgLy8gZ2VuZXJhdGUgY3VybCBjb21tYW5kIHRvIHRyeSBpdCBvdXRcbiAgJCgnYm9keScpLm9uKCdjbGljaycsICcudHJ5LW91dF9fYnRuJywgZnVuY3Rpb24oZXZlbnQpe1xuICAgIGdlbmVyYXRlQ3VybCh0aGlzKVxuICB9KVxuXG4gICQoJ2JvZHknKS5vbigna2V5dXAnLCAnW3BsYWNlaG9sZGVyXj1pbnRlcmVzdGVkUHJvZ3JhbXNdJywgZnVuY3Rpb24oZXZlbnQpe1xuICAgIGdlbmVyYXRlQ3VybCh0aGlzKTtcbiAgfSlcblxuICAkKCdib2R5Jykub24oJ2tleXVwJywgJ1twbGFjZWhvbGRlcl49QXV0aG9yaXphdGlvbl0nLCBmdW5jdGlvbihldmVudCl7XG4gICAgZ2VuZXJhdGVDdXJsKHRoaXMpO1xuICB9KVxuXG4gICQoJ2JvZHknKS5vbigna2V5dXAnLCAnW2NsYXNzXj1ib2R5LXBhcmFtX190ZXh0XScsIGZ1bmN0aW9uKGV2ZW50KXtcbiAgICBnZW5lcmF0ZUN1cmwodGhpcyk7XG4gIH0pXG5cbiAgJCgnYm9keScpLm9uKCdjaGFuZ2UnLCAnW3R5cGVePWZpbGVdJywgZnVuY3Rpb24oZXZlbnQpe1xuICAgIGdlbmVyYXRlQ3VybCh0aGlzKTtcbiAgfSlcblxuICAvLyAkKCcjc3dhZ2dlci1lZGl0b3InKS5mYWRlSW4oMjUwMClcblxuICBmdW5jdGlvbiBnZW5lcmF0ZUN1cmwob2JqKSB7XG4gICAgY29uc3QgZG9tYWluID0gJCgnYm9keScpLmZpbmQoJy5zZXJ2ZXJzIDpzZWxlY3RlZCcpLnRleHQoKTtcbiAgICBjb25zdCBlcF9pZCA9ICQob2JqKS5wYXJlbnRzKCcub3BibG9jay1wb3N0OmZpcnN0JykuYXR0cignaWQnKTtcbiAgICBjb25zdCBlcCA9IHV0aWwuZm9ybWF0KFwiLyVzXCIsIGVwX2lkLnN1YnN0cihlcF9pZC5pbmRleE9mKFwiX1wiKSArIDEpLnJlcGxhY2UoXCJfXCIsIFwiL1wiKSk7XG4gICAgY29uc3QgcGFyX25vZGUgPSAkKG9iaikucGFyZW50cygnLm9wYmxvY2stYm9keTpmaXJzdCcpO1xuICAgIGNvbnN0IGV4YW1wbGVCb2R5ID0gcGFyX25vZGUuZmluZCgnLmJvZHktcGFyYW1fX2V4YW1wbGUnKTtcbiAgICBjb25zdCB0ZXh0Qm9keSA9IGV4YW1wbGVCb2R5Lmxlbmd0aCA+IDAgPyBleGFtcGxlQm9keS50ZXh0KCkgOiBwYXJfbm9kZS5maW5kKCcuYm9keS1wYXJhbV9fdGV4dCcpLnRleHQoKVxuICAgIGNvbnN0IHBhcmFtcyA9IHRleHRCb2R5LnJlcGxhY2UoL1xccy9nLCcnKTtcblxuICAgIHBhcl9ub2RlLmZpbmQoJy5jdXJsJykucmVtb3ZlKCk7XG4gICAgcGFyX25vZGUuZmluZCgnLmV4ZWN1dGUtd3JhcHBlcicpLmFwcGVuZChgPHAgY2xhc3M9XCJjdXJsXCI+VXNlIHRoZSBmb2xsb3dpbmcgY29tbWFuZCB0byBtYWtlIGEgcmVxdWVzdCB0byB0aGUgPHN0cm9uZz4ke2VwfTwvc3Ryb25nPiBlbmRwb2ludCBiYXNlZCBvbiB0aGUgZGF0YSBzZXQgYWJvdmU6PC9wPmApO1xuXG4gICAgY29uc3QgYXV0aFZhbCA9IHBhcl9ub2RlLmZpbmQoJ1twbGFjZWhvbGRlcl49QXV0aG9yaXphdGlvbl0nKS52YWwoKTtcbiAgICBjb25zdCBpbnRlcmVzdGVkUHJvZ3JhbXNWYWwgPSBwYXJfbm9kZS5maW5kKCdbcGxhY2Vob2xkZXJePWludGVyZXN0ZWRQcm9ncmFtc10nKS52YWwoKTtcbiAgICBjb25zdCBxdWVyeSA9IGludGVyZXN0ZWRQcm9ncmFtc1ZhbCA/IGA/aW50ZXJlc3RlZFByb2dyYW1zPSR7aW50ZXJlc3RlZFByb2dyYW1zVmFsfWAgOiBcIlwiXG4gICAgaWYgKGVwX2lkLmluY2x1ZGVzKCdBdXRoZW50aWNhdGlvbicpKSB7XG4gICAgICBjb25zdCBhdXRoZW50aWNhdGlvbkN1cmwgPSBgY3VybCAtWCBQT1NUIFwiJHtkb21haW59JHtlcH1cIiBcXFxuICAgICAgICAtSCAgXCJhY2NlcHQ6IGFwcGxpY2F0aW9uL2pzb25cIiBcXFxuICAgICAgICAtSCAgXCJDb250ZW50LVR5cGU6IGFwcGxpY2F0aW9uL2pzb25cIiBcXFxuICAgICAgICAtZCBcXCcke3BhcmFtc31cXCdgO1xuICAgICAgcGFyX25vZGUuZmluZCgnLmV4ZWN1dGUtd3JhcHBlcicpLmFwcGVuZChgPHRleHRhcmVhIHJlYWRvbmx5PVwiXCIgY2xhc3M9XCJjdXJsXCIgc3R5bGU9XCJ3aGl0ZS1zcGFjZTogbm9ybWFsO1wiPiR7YXV0aGVudGljYXRpb25DdXJsfTwvdGV4dGFyZWE+YCk7XG4gICAgfSBlbHNlIGlmIChlcF9pZC5pbmNsdWRlcygnZWxpZ2liaWxpdHlQcm9ncmFtcycpKXtcbiAgICAgIGNvbnN0IGVsaWdpYmlsaXR5UHJvZ3JhbXNDdXJsID0gYGN1cmwgLVggUE9TVCBcIiR7ZG9tYWlufSR7ZXB9JHtxdWVyeX1cIiBcXFxuICAgICAgICAtSCBcImFjY2VwdDogYXBwbGljYXRpb24vanNvblwiIFxcXG4gICAgICAgIC1IIFwiQ29udGVudC1UeXBlOiBhcHBsaWNhdGlvbi9qc29uXCIgXFxcbiAgICAgICAgLUggXCJBdXRob3JpemF0aW9uOiAke2F1dGhWYWx9XCJcXFxuICAgICAgICAtZCBcXCcke3BhcmFtc31cXCdgO1xuICAgICAgcGFyX25vZGUuZmluZCgnLmV4ZWN1dGUtd3JhcHBlcicpLmFwcGVuZChgPHRleHRhcmVhIHJlYWRvbmx5PVwiXCIgY2xhc3M9XCJjdXJsXCIgc3R5bGU9XCJ3aGl0ZS1zcGFjZTogbm9ybWFsO1wiPiR7ZWxpZ2liaWxpdHlQcm9ncmFtc0N1cmx9PC90ZXh0YXJlYT5gKTtcbiAgICB9IGVsc2UgaWYgKGVwX2lkLmluY2x1ZGVzKCdidWxrU3VibWlzc2lvbicpKSB7XG4gICAgICBjb25zdCBpbnB1dFBhdGggPSBwYXJfbm9kZS5maW5kKCdbdHlwZV49ZmlsZV0nKS52YWwoKTtcbiAgICAgIGNvbnN0IGJ1bGtTdWJtaXNzaW9uQ3VybCA9IGBjdXJsIC1YIFBPU1QgXCIke2RvbWFpbn0ke2VwfSR7cXVlcnl9XCIgXFxcbiAgICAgICAgLUggXCJhY2NlcHQ6IG11bHRpcGFydC9mb3JtLWRhdGFcIiBcXFxuICAgICAgICAtSCBcIkNvbnRlbnQtVHlwZTogbXVsdGlwYXJ0L2Zvcm0tZGF0YVwiIFxcXG4gICAgICAgIC1IIFwiQXV0aG9yaXphdGlvbjogJHthdXRoVmFsfVwiXFxcbiAgICAgICAgLUYgXCI9QCR7aW5wdXRQYXRofTt0eXBlPXRleHQvY3N2XCJgO1xuICAgICAgcGFyX25vZGUuZmluZCgnLmV4ZWN1dGUtd3JhcHBlcicpLmFwcGVuZChgPHRleHRhcmVhIHJlYWRvbmx5PVwiXCIgY2xhc3M9XCJjdXJsXCIgc3R5bGU9XCJ3aGl0ZS1zcGFjZTogbm9ybWFsO1wiPiR7YnVsa1N1Ym1pc3Npb25DdXJsfTwvdGV4dGFyZWE+YCk7XG4gICAgfVxuICB9XG59XG4iLCIndXNlIHN0cmljdCc7XG5cbi8qKlxuICogVXRpbGl0aWVzIGZvciBGb3JtIGNvbXBvbmVudHNcbiAqIEBjbGFzc1xuICovXG5jbGFzcyBGb3JtcyB7XG4gIC8qKlxuICAgKiBUaGUgRm9ybSBjb25zdHJ1Y3RvclxuICAgKiBAcGFyYW0gIHtPYmplY3R9IGZvcm0gVGhlIGZvcm0gRE9NIGVsZW1lbnRcbiAgICovXG4gIGNvbnN0cnVjdG9yKGZvcm0gPSBmYWxzZSkge1xuICAgIHRoaXMuRk9STSA9IGZvcm07XG5cbiAgICB0aGlzLnN0cmluZ3MgPSBGb3Jtcy5zdHJpbmdzO1xuXG4gICAgdGhpcy5zdWJtaXQgPSBGb3Jtcy5zdWJtaXQ7XG5cbiAgICB0aGlzLmNsYXNzZXMgPSBGb3Jtcy5jbGFzc2VzO1xuXG4gICAgdGhpcy5tYXJrdXAgPSBGb3Jtcy5tYXJrdXA7XG5cbiAgICB0aGlzLnNlbGVjdG9ycyA9IEZvcm1zLnNlbGVjdG9ycztcblxuICAgIHRoaXMuYXR0cnMgPSBGb3Jtcy5hdHRycztcblxuICAgIHRoaXMuRk9STS5zZXRBdHRyaWJ1dGUoJ25vdmFsaWRhdGUnLCB0cnVlKTtcblxuICAgIHJldHVybiB0aGlzO1xuICB9XG5cbiAgLyoqXG4gICAqIE1hcCB0b2dnbGVkIGNoZWNrYm94IHZhbHVlcyB0byBhbiBpbnB1dC5cbiAgICogQHBhcmFtICB7T2JqZWN0fSBldmVudCBUaGUgcGFyZW50IGNsaWNrIGV2ZW50LlxuICAgKiBAcmV0dXJuIHtFbGVtZW50fSAgICAgIFRoZSB0YXJnZXQgZWxlbWVudC5cbiAgICovXG4gIGpvaW5WYWx1ZXMoZXZlbnQpIHtcbiAgICBpZiAoIWV2ZW50LnRhcmdldC5tYXRjaGVzKCdpbnB1dFt0eXBlPVwiY2hlY2tib3hcIl0nKSlcbiAgICAgIHJldHVybjtcblxuICAgIGlmICghZXZlbnQudGFyZ2V0LmNsb3Nlc3QoJ1tkYXRhLWpzLWpvaW4tdmFsdWVzXScpKVxuICAgICAgcmV0dXJuO1xuXG4gICAgbGV0IGVsID0gZXZlbnQudGFyZ2V0LmNsb3Nlc3QoJ1tkYXRhLWpzLWpvaW4tdmFsdWVzXScpO1xuICAgIGxldCB0YXJnZXQgPSBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKGVsLmRhdGFzZXQuanNKb2luVmFsdWVzKTtcblxuICAgIHRhcmdldC52YWx1ZSA9IEFycmF5LmZyb20oXG4gICAgICAgIGVsLnF1ZXJ5U2VsZWN0b3JBbGwoJ2lucHV0W3R5cGU9XCJjaGVja2JveFwiXScpXG4gICAgICApXG4gICAgICAuZmlsdGVyKChlKSA9PiAoZS52YWx1ZSAmJiBlLmNoZWNrZWQpKVxuICAgICAgLm1hcCgoZSkgPT4gZS52YWx1ZSlcbiAgICAgIC5qb2luKCcsICcpO1xuXG4gICAgcmV0dXJuIHRhcmdldDtcbiAgfVxuXG4gIC8qKlxuICAgKiBBIHNpbXBsZSBmb3JtIHZhbGlkYXRpb24gY2xhc3MgdGhhdCB1c2VzIG5hdGl2ZSBmb3JtIHZhbGlkYXRpb24uIEl0IHdpbGxcbiAgICogYWRkIGFwcHJvcHJpYXRlIGZvcm0gZmVlZGJhY2sgZm9yIGVhY2ggaW5wdXQgdGhhdCBpcyBpbnZhbGlkIGFuZCBuYXRpdmVcbiAgICogbG9jYWxpemVkIGJyb3dzZXIgbWVzc2FnaW5nLlxuICAgKlxuICAgKiBTZWUgaHR0cHM6Ly9kZXZlbG9wZXIubW96aWxsYS5vcmcvZW4tVVMvZG9jcy9MZWFybi9IVE1ML0Zvcm1zL0Zvcm1fdmFsaWRhdGlvblxuICAgKiBTZWUgaHR0cHM6Ly9jYW5pdXNlLmNvbS8jZmVhdD1mb3JtLXZhbGlkYXRpb24gZm9yIHN1cHBvcnRcbiAgICpcbiAgICogQHBhcmFtICB7RXZlbnR9ICAgICAgICAgZXZlbnQgVGhlIGZvcm0gc3VibWlzc2lvbiBldmVudFxuICAgKiBAcmV0dXJuIHtDbGFzcy9Cb29sZWFufSAgICAgICBUaGUgZm9ybSBjbGFzcyBvciBmYWxzZSBpZiBpbnZhbGlkXG4gICAqL1xuICB2YWxpZChldmVudCkge1xuICAgIGxldCB2YWxpZGl0eSA9IGV2ZW50LnRhcmdldC5jaGVja1ZhbGlkaXR5KCk7XG4gICAgbGV0IGVsZW1lbnRzID0gZXZlbnQudGFyZ2V0LnF1ZXJ5U2VsZWN0b3JBbGwodGhpcy5zZWxlY3RvcnMuUkVRVUlSRUQpO1xuXG4gICAgZm9yIChsZXQgaSA9IDA7IGkgPCBlbGVtZW50cy5sZW5ndGg7IGkrKykge1xuICAgICAgLy8gUmVtb3ZlIG9sZCBtZXNzYWdpbmcgaWYgaXQgZXhpc3RzXG4gICAgICBsZXQgZWwgPSBlbGVtZW50c1tpXTtcblxuICAgICAgdGhpcy5yZXNldChlbCk7XG5cbiAgICAgIC8vIElmIHRoaXMgaW5wdXQgdmFsaWQsIHNraXAgbWVzc2FnaW5nXG4gICAgICBpZiAoZWwudmFsaWRpdHkudmFsaWQpIGNvbnRpbnVlO1xuXG4gICAgICB0aGlzLmhpZ2hsaWdodChlbCk7XG4gICAgfVxuXG4gICAgcmV0dXJuICh2YWxpZGl0eSkgPyB0aGlzIDogdmFsaWRpdHk7XG4gIH1cblxuICAvKipcbiAgICogQWRkcyBmb2N1cyBhbmQgYmx1ciBldmVudHMgdG8gaW5wdXRzIHdpdGggcmVxdWlyZWQgYXR0cmlidXRlc1xuICAgKiBAcGFyYW0gICB7b2JqZWN0fSAgZm9ybSAgUGFzc2luZyBhIGZvcm0gaXMgcG9zc2libGUsIG90aGVyd2lzZSBpdCB3aWxsIHVzZVxuICAgKiAgICAgICAgICAgICAgICAgICAgICAgICAgdGhlIGZvcm0gcGFzc2VkIHRvIHRoZSBjb25zdHJ1Y3Rvci5cbiAgICogQHJldHVybiAge2NsYXNzfSAgICAgICAgIFRoZSBmb3JtIGNsYXNzXG4gICAqL1xuICB3YXRjaChmb3JtID0gZmFsc2UpIHtcbiAgICB0aGlzLkZPUk0gPSAoZm9ybSkgPyBmb3JtIDogdGhpcy5GT1JNO1xuXG4gICAgbGV0IGVsZW1lbnRzID0gdGhpcy5GT1JNLnF1ZXJ5U2VsZWN0b3JBbGwodGhpcy5zZWxlY3RvcnMuUkVRVUlSRUQpO1xuXG4gICAgLyoqIFdhdGNoIEluZGl2aWR1YWwgSW5wdXRzICovXG4gICAgZm9yIChsZXQgaSA9IDA7IGkgPCBlbGVtZW50cy5sZW5ndGg7IGkrKykge1xuICAgICAgLy8gUmVtb3ZlIG9sZCBtZXNzYWdpbmcgaWYgaXQgZXhpc3RzXG4gICAgICBsZXQgZWwgPSBlbGVtZW50c1tpXTtcblxuICAgICAgZWwuYWRkRXZlbnRMaXN0ZW5lcignZm9jdXMnLCAoKSA9PiB7XG4gICAgICAgIHRoaXMucmVzZXQoZWwpO1xuICAgICAgfSk7XG5cbiAgICAgIGVsLmFkZEV2ZW50TGlzdGVuZXIoJ2JsdXInLCAoKSA9PiB7XG4gICAgICAgIGlmICghZWwudmFsaWRpdHkudmFsaWQpXG4gICAgICAgICAgdGhpcy5oaWdobGlnaHQoZWwpO1xuICAgICAgfSk7XG4gICAgfVxuXG4gICAgLyoqIFN1Ym1pdCBFdmVudCAqL1xuICAgIHRoaXMuRk9STS5hZGRFdmVudExpc3RlbmVyKCdzdWJtaXQnLCAoZXZlbnQpID0+IHtcbiAgICAgIGV2ZW50LnByZXZlbnREZWZhdWx0KCk7XG5cbiAgICAgIGlmICh0aGlzLnZhbGlkKGV2ZW50KSA9PT0gZmFsc2UpXG4gICAgICAgIHJldHVybiBmYWxzZTtcblxuICAgICAgdGhpcy5zdWJtaXQoZXZlbnQpO1xuICAgIH0pO1xuXG4gICAgcmV0dXJuIHRoaXM7XG4gIH1cblxuICAvKipcbiAgICogUmVtb3ZlcyB0aGUgdmFsaWRpdHkgbWVzc2FnZSBhbmQgY2xhc3NlcyBmcm9tIHRoZSBtZXNzYWdlLlxuICAgKiBAcGFyYW0gICB7b2JqZWN0fSAgZWwgIFRoZSBpbnB1dCBlbGVtZW50XG4gICAqIEByZXR1cm4gIHtjbGFzc30gICAgICAgVGhlIGZvcm0gY2xhc3NcbiAgICovXG4gIHJlc2V0KGVsKSB7XG4gICAgbGV0IGNvbnRhaW5lciA9ICh0aGlzLnNlbGVjdG9ycy5FUlJPUl9NRVNTQUdFX1BBUkVOVClcbiAgICAgID8gZWwuY2xvc2VzdCh0aGlzLnNlbGVjdG9ycy5FUlJPUl9NRVNTQUdFX1BBUkVOVCkgOiBlbC5wYXJlbnROb2RlO1xuXG4gICAgbGV0IG1lc3NhZ2UgPSBjb250YWluZXIucXVlcnlTZWxlY3RvcignLicgKyB0aGlzLmNsYXNzZXMuRVJST1JfTUVTU0FHRSk7XG5cbiAgICAvLyBSZW1vdmUgb2xkIG1lc3NhZ2luZyBpZiBpdCBleGlzdHNcbiAgICBjb250YWluZXIuY2xhc3NMaXN0LnJlbW92ZSh0aGlzLmNsYXNzZXMuRVJST1JfQ09OVEFJTkVSKTtcbiAgICBpZiAobWVzc2FnZSkgbWVzc2FnZS5yZW1vdmUoKTtcblxuICAgIC8vIFJlbW92ZSBlcnJvciBjbGFzcyBmcm9tIHRoZSBmb3JtXG4gICAgY29udGFpbmVyLmNsb3Nlc3QoJ2Zvcm0nKS5jbGFzc0xpc3QucmVtb3ZlKHRoaXMuY2xhc3Nlcy5FUlJPUl9DT05UQUlORVIpO1xuXG4gICAgLy8gUmVtb3ZlIGR5bmFtaWMgYXR0cmlidXRlcyBmcm9tIHRoZSBpbnB1dFxuICAgIGVsLnJlbW92ZUF0dHJpYnV0ZSh0aGlzLmF0dHJzLkVSUk9SX0lOUFVUWzBdKTtcbiAgICBlbC5yZW1vdmVBdHRyaWJ1dGUodGhpcy5hdHRycy5FUlJPUl9MQUJFTCk7XG5cbiAgICByZXR1cm4gdGhpcztcbiAgfVxuXG4gIC8qKlxuICAgKiBEaXNwbGF5cyBhIHZhbGlkaXR5IG1lc3NhZ2UgdG8gdGhlIHVzZXIuIEl0IHdpbGwgZmlyc3QgdXNlIGFueSBsb2NhbGl6ZWRcbiAgICogc3RyaW5nIHBhc3NlZCB0byB0aGUgY2xhc3MgZm9yIHJlcXVpcmVkIGZpZWxkcyBtaXNzaW5nIGlucHV0LiBJZiB0aGVcbiAgICogaW5wdXQgaXMgZmlsbGVkIGluIGJ1dCBkb2Vzbid0IG1hdGNoIHRoZSByZXF1aXJlZCBwYXR0ZXJuLCBpdCB3aWxsIHVzZVxuICAgKiBhIGxvY2FsaXplZCBzdHJpbmcgc2V0IGZvciB0aGUgc3BlY2lmaWMgaW5wdXQgdHlwZS4gSWYgb25lIGlzbid0IHByb3ZpZGVkXG4gICAqIGl0IHdpbGwgdXNlIHRoZSBkZWZhdWx0IGJyb3dzZXIgcHJvdmlkZWQgbWVzc2FnZS5cbiAgICogQHBhcmFtICAge29iamVjdH0gIGVsICBUaGUgaW52YWxpZCBpbnB1dCBlbGVtZW50XG4gICAqIEByZXR1cm4gIHtjbGFzc30gICAgICAgVGhlIGZvcm0gY2xhc3NcbiAgICovXG4gIGhpZ2hsaWdodChlbCkge1xuICAgIGxldCBjb250YWluZXIgPSAodGhpcy5zZWxlY3RvcnMuRVJST1JfTUVTU0FHRV9QQVJFTlQpXG4gICAgICA/IGVsLmNsb3Nlc3QodGhpcy5zZWxlY3RvcnMuRVJST1JfTUVTU0FHRV9QQVJFTlQpIDogZWwucGFyZW50Tm9kZTtcblxuICAgIC8vIENyZWF0ZSB0aGUgbmV3IGVycm9yIG1lc3NhZ2UuXG4gICAgbGV0IG1lc3NhZ2UgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KHRoaXMubWFya3VwLkVSUk9SX01FU1NBR0UpO1xuICAgIGxldCBpZCA9IGAke2VsLmdldEF0dHJpYnV0ZSgnaWQnKX0tJHt0aGlzLmNsYXNzZXMuRVJST1JfTUVTU0FHRX1gO1xuXG4gICAgLy8gR2V0IHRoZSBlcnJvciBtZXNzYWdlIGZyb20gbG9jYWxpemVkIHN0cmluZ3MgKGlmIHNldCkuXG4gICAgaWYgKGVsLnZhbGlkaXR5LnZhbHVlTWlzc2luZyAmJiB0aGlzLnN0cmluZ3MuVkFMSURfUkVRVUlSRUQpXG4gICAgICBtZXNzYWdlLmlubmVySFRNTCA9IHRoaXMuc3RyaW5ncy5WQUxJRF9SRVFVSVJFRDtcbiAgICBlbHNlIGlmICghZWwudmFsaWRpdHkudmFsaWQgJiZcbiAgICAgIHRoaXMuc3RyaW5nc1tgVkFMSURfJHtlbC50eXBlLnRvVXBwZXJDYXNlKCl9X0lOVkFMSURgXSkge1xuICAgICAgbGV0IHN0cmluZ0tleSA9IGBWQUxJRF8ke2VsLnR5cGUudG9VcHBlckNhc2UoKX1fSU5WQUxJRGA7XG4gICAgICBtZXNzYWdlLmlubmVySFRNTCA9IHRoaXMuc3RyaW5nc1tzdHJpbmdLZXldO1xuICAgIH0gZWxzZVxuICAgICAgbWVzc2FnZS5pbm5lckhUTUwgPSBlbC52YWxpZGF0aW9uTWVzc2FnZTtcblxuICAgIC8vIFNldCBhcmlhIGF0dHJpYnV0ZXMgYW5kIGNzcyBjbGFzc2VzIHRvIHRoZSBtZXNzYWdlXG4gICAgbWVzc2FnZS5zZXRBdHRyaWJ1dGUoJ2lkJywgaWQpO1xuICAgIG1lc3NhZ2Uuc2V0QXR0cmlidXRlKHRoaXMuYXR0cnMuRVJST1JfTUVTU0FHRVswXSxcbiAgICAgIHRoaXMuYXR0cnMuRVJST1JfTUVTU0FHRVsxXSk7XG4gICAgbWVzc2FnZS5jbGFzc0xpc3QuYWRkKHRoaXMuY2xhc3Nlcy5FUlJPUl9NRVNTQUdFKTtcblxuICAgIC8vIEFkZCB0aGUgZXJyb3IgY2xhc3MgYW5kIGVycm9yIG1lc3NhZ2UgdG8gdGhlIGRvbS5cbiAgICBjb250YWluZXIuY2xhc3NMaXN0LmFkZCh0aGlzLmNsYXNzZXMuRVJST1JfQ09OVEFJTkVSKTtcbiAgICBjb250YWluZXIuaW5zZXJ0QmVmb3JlKG1lc3NhZ2UsIGNvbnRhaW5lci5jaGlsZE5vZGVzWzBdKTtcblxuICAgIC8vIEFkZCB0aGUgZXJyb3IgY2xhc3MgdG8gdGhlIGZvcm1cbiAgICBjb250YWluZXIuY2xvc2VzdCgnZm9ybScpLmNsYXNzTGlzdC5hZGQodGhpcy5jbGFzc2VzLkVSUk9SX0NPTlRBSU5FUik7XG5cbiAgICAvLyBBZGQgZHluYW1pYyBhdHRyaWJ1dGVzIHRvIHRoZSBpbnB1dFxuICAgIGVsLnNldEF0dHJpYnV0ZSh0aGlzLmF0dHJzLkVSUk9SX0lOUFVUWzBdLCB0aGlzLmF0dHJzLkVSUk9SX0lOUFVUWzFdKTtcbiAgICBlbC5zZXRBdHRyaWJ1dGUodGhpcy5hdHRycy5FUlJPUl9MQUJFTCwgaWQpO1xuXG4gICAgcmV0dXJuIHRoaXM7XG4gIH1cbn1cblxuLyoqXG4gKiBBIGRpY3Rpb25haXJ5IG9mIHN0cmluZ3MgaW4gdGhlIGZvcm1hdC5cbiAqIHtcbiAqICAgJ1ZBTElEX1JFUVVJUkVEJzogJ1RoaXMgaXMgcmVxdWlyZWQnLFxuICogICAnVkFMSURfe3sgVFlQRSB9fV9JTlZBTElEJzogJ0ludmFsaWQnXG4gKiB9XG4gKi9cbkZvcm1zLnN0cmluZ3MgPSB7fTtcblxuLyoqIFBsYWNlaG9sZGVyIGZvciB0aGUgc3VibWl0IGZ1bmN0aW9uICovXG5Gb3Jtcy5zdWJtaXQgPSBmdW5jdGlvbigpIHt9O1xuXG4vKiogQ2xhc3NlcyBmb3IgdmFyaW91cyBjb250YWluZXJzICovXG5Gb3Jtcy5jbGFzc2VzID0ge1xuICAnRVJST1JfTUVTU0FHRSc6ICdlcnJvci1tZXNzYWdlJywgLy8gZXJyb3IgY2xhc3MgZm9yIHRoZSB2YWxpZGl0eSBtZXNzYWdlXG4gICdFUlJPUl9DT05UQUlORVInOiAnZXJyb3InLCAvLyBjbGFzcyBmb3IgdGhlIHZhbGlkaXR5IG1lc3NhZ2UgcGFyZW50XG4gICdFUlJPUl9GT1JNJzogJ2Vycm9yJ1xufTtcblxuLyoqIEhUTUwgdGFncyBhbmQgbWFya3VwIGZvciB2YXJpb3VzIGVsZW1lbnRzICovXG5Gb3Jtcy5tYXJrdXAgPSB7XG4gICdFUlJPUl9NRVNTQUdFJzogJ2RpdicsXG59O1xuXG4vKiogRE9NIFNlbGVjdG9ycyBmb3IgdmFyaW91cyBlbGVtZW50cyAqL1xuRm9ybXMuc2VsZWN0b3JzID0ge1xuICAnUkVRVUlSRUQnOiAnW3JlcXVpcmVkPVwidHJ1ZVwiXScsIC8vIFNlbGVjdG9yIGZvciByZXF1aXJlZCBpbnB1dCBlbGVtZW50c1xuICAnRVJST1JfTUVTU0FHRV9QQVJFTlQnOiBmYWxzZVxufTtcblxuLyoqIEF0dHJpYnV0ZXMgZm9yIHZhcmlvdXMgZWxlbWVudHMgKi9cbkZvcm1zLmF0dHJzID0ge1xuICAnRVJST1JfTUVTU0FHRSc6IFsnYXJpYS1saXZlJywgJ3BvbGl0ZSddLCAvLyBBdHRyaWJ1dGUgZm9yIHZhbGlkIGVycm9yIG1lc3NhZ2VcbiAgJ0VSUk9SX0lOUFVUJzogWydhcmlhLWludmFsaWQnLCAndHJ1ZSddLFxuICAnRVJST1JfTEFCRUwnOiAnYXJpYS1kZXNjcmliZWRieSdcbn07XG5cbmV4cG9ydCBkZWZhdWx0IEZvcm1zO1xuIiwiXG5jb25zdCBlcnJvckJveElkID0gJ2Vycm9ycydcbmNvbnN0IGluZm9Cb3hJZCA9ICdpbmZvJ1xuXG5jb25zdCB0b1RpdGxlQ2FzZSA9IChzdHJpbmcpID0+IHtcbiAgcmV0dXJuIHN0cmluZy5jaGFyQXQoMCkudG9VcHBlckNhc2UoKSArIHN0cmluZy5zbGljZSgxKTtcbn1cblxuY29uc3Qgc2V0VGV4dEJveCA9IChtZXNzYWdlU3RyaW5nLCBkaXNwbGF5U3RhdGUsIGJveElkKSA9PiB7XG4gIHZhciBlbGUgPSBkb2N1bWVudC5nZXRFbGVtZW50QnlJZChib3hJZCk7XG4gIGlmIChlbGUpIHtcbiAgICBlbGUuaW5uZXJIVE1MID0gJzx1bCBjbGFzcz1cIm0tMCBweC0yXCI+JyArXG4gICAgICB0b1RpdGxlQ2FzZShtZXNzYWdlU3RyaW5nLnRyaW0oKSkgKyAnPC91bD4nO1xuXG4gICAgZWxlLnN0eWxlLmRpc3BsYXkgPSBkaXNwbGF5U3RhdGU7XG5cbiAgICBpZiAoZGlzcGxheVN0YXRlID09PSAnbm9uZScpIHtcbiAgICAgIGVsZS5yZW1vdmVBdHRyaWJ1dGUoJ2FyaWEtbGl2ZScsICdwb2xpdGUnKVxuICAgICAgZWxlLmNsYXNzTGlzdC5yZW1vdmUoJ2FuaW1hdGVkJylcbiAgICAgIGVsZS5jbGFzc0xpc3QucmVtb3ZlKCdmYWRlSW5VcCcpXG4gICAgfSBlbHNlIHtcbiAgICAgIGVsZS5zZXRBdHRyaWJ1dGUoJ2FyaWEtbGl2ZScsICdwb2xpdGUnKVxuICAgICAgZWxlLmNsYXNzTGlzdC5hZGQoJ2FuaW1hdGVkJylcbiAgICAgIGVsZS5jbGFzc0xpc3QuYWRkKCdmYWRlSW5VcCcpXG4gICAgfVxuICB9XG59XG5cbmV4cG9ydCBjb25zdCBzZW5kUG9zdFJlcXVlc3QgPSAodXJsLCBoZWFkZXJzT2JqZWN0LCByZXNwb25zZUhhbmRsZXIsIHJlcXVlc3RQYXlsb2FkKSA9PiB7XG4gIHNldFRleHRCb3goJycsICdub25lJywgZXJyb3JCb3hJZClcbiAgc2V0VGV4dEJveCgnJywgJ25vbmUnLCBpbmZvQm94SWQpXG5cbiAgZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ2xvYWRlcicpLnN0eWxlLmRpc3BsYXkgPSAnYmxvY2snXG5cbiAgdmFyIHJlcSA9IG5ldyBYTUxIdHRwUmVxdWVzdCgpXG5cbiAgcmVxLm9wZW4oJ1BPU1QnLCB1cmwsIHRydWUpO1xuXG4gIE9iamVjdC5rZXlzKGhlYWRlcnNPYmplY3QpLmZvckVhY2goZnVuY3Rpb24oa2V5KSB7XG4gICAgcmVxLnNldFJlcXVlc3RIZWFkZXIoa2V5LCBoZWFkZXJzT2JqZWN0W2tleV0pO1xuICB9KTtcblxuICByZXEub25yZWFkeXN0YXRlY2hhbmdlID0gZnVuY3Rpb24oKSB7XG4gICAgZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ2xvYWRlcicpLnN0eWxlLmRpc3BsYXkgPSAnbm9uZSdcbiAgICByZXNwb25zZUhhbmRsZXIocmVxKVxuICB9XG5cbiAgcmVxLnNlbmQocmVxdWVzdFBheWxvYWQpXG59XG5cbmNvbnN0IGRpc3BsYXlMaXN0VGV4dCA9IChyZXNwb25zZVRleHQsIHNob3dQYXRoLCBpZCkgPT4ge1xuXG59XG5cbmV4cG9ydCBjb25zdCBkaXNwbGF5RXJyb3JzID0gKHJlc3BvbnNlVGV4dCwgc2hvd1BhdGgpID0+IHtcbiAgdmFyIGVycm9ySlNPTlxuICB2YXIgZXJyb3JzQXJyYXkgPSBbXVxuICB0cnkge1xuICAgIGVycm9ySlNPTiA9IEpTT04ucGFyc2UocmVzcG9uc2VUZXh0KS5lcnJvcnNcbiAgICBlcnJvcnNBcnJheSA9IGVycm9ySlNPTi5tYXAoZnVuY3Rpb24oZXJyb3IpIHtcbiAgICAgIGNvbnN0IHsgZWxlbWVudFBhdGgsIG1lc3NhZ2UgfSA9IGVycm9yXG4gICAgICBjb25zdCBlcnJvck1zZyA9IGVsZW1lbnRQYXRoICYmIHNob3dQYXRoID9cbiAgICAgICAgbWVzc2FnZSArICcgRWxlbWVudCBQYXRoOiAnICsgZWxlbWVudFBhdGggKyAnLicgOiBtZXNzYWdlXG4gICAgICByZXR1cm4gJzxsaT4nICsgZXJyb3JNc2cgKyAnPC9saT4nXG4gICAgfSlcbiAgfSBjYXRjaCAoZXJyKSB7fVxuICBzZXRUZXh0Qm94KGVycm9yc0FycmF5LmpvaW4oJycpLCAnYmxvY2snLCBlcnJvckJveElkKTtcbn1cblxuZXhwb3J0IGNvbnN0IGRpc3BsYXlJbmZvID0gKGluZm9UZXh0KSA9PiB7XG4gIGNvbnN0IGluZm9IVE1MID0gJzxsaT4nICsgaW5mb1RleHQgKyAnPC9saT4nXG4gIHNldFRleHRCb3goaW5mb0hUTUwsICdibG9jaycsIGluZm9Cb3hJZCk7XG59IiwiaW1wb3J0IEZvcm1zIGZyb20gJ0BueWNvcHBvcnR1bml0eS9wdHRybi1zY3JpcHRzL3NyYy9mb3Jtcy9mb3Jtcyc7XG5pbXBvcnQgeyBkaXNwbGF5RXJyb3JzLCBkaXNwbGF5SW5mbywgc2VuZFBvc3RSZXF1ZXN0IH0gZnJvbSAnLi91dGlsJztcblxuZXhwb3J0IGRlZmF1bHQgZnVuY3Rpb24oKSB7XG4gIGNvbnN0IFNFTEVDVE9SID0gJ1tkYXRhLWpzKj1cImJ1bGstc3VibWlzc2lvblwiXSdcblxuICBjb25zdCBmaWxlbmFtZSA9ICdyZXNwb25zZS5jc3YnXG5cbiAgY29uc3QgRm9ybSA9IG5ldyBGb3Jtcyhkb2N1bWVudC5xdWVyeVNlbGVjdG9yKFNFTEVDVE9SKSk7XG5cbiAgY29uc3QgYnVsa1N1Ym1pc3Npb25IYW5kbGVyID0gKHJlcSkgPT4ge1xuICAgIGlmIChyZXEucmVhZHlTdGF0ZSA9PT0gNCkge1xuICAgICAgY29uc3Qgc3RhdHVzID0gcmVxLnN0YXR1cy50b1N0cmluZygpXG4gICAgICBpZiAoc3RhdHVzWzBdID09PSAnNCcgfHwgc3RhdHVzWzBdID09PSAnNScpIHtcbiAgICAgICAgZGlzcGxheUVycm9ycyhyZXEucmVzcG9uc2VUZXh0LCB0cnVlKVxuICAgICAgfSBlbHNlIGlmIChzdGF0dXNbMF0gPT09ICcyJykge1xuICAgICAgICBkaXNwbGF5SW5mbygnQnVsayBzdWJtaXNzaW9uIHN1Y2Nlc3NmdWwuIEEgQ1NWIHdpdGggcHJvZ3JhbSBjb2RlcyBcXFxuICAgICAgICAgIHNob3VsZCBiZSBkb3dubG9hZGVkIGF1dG9tYXRpY2FsbHkuJylcbiAgICAgICAgY29uc3QgYmxvYiA9IG5ldyBCbG9iKFtyZXEucmVzcG9uc2VdLCB7dHlwZSA6ICd0ZXh0L2Nzdid9KVxuICAgICAgICBpZiAodHlwZW9mIHdpbmRvdy5uYXZpZ2F0b3IubXNTYXZlQmxvYiAhPT0gJ3VuZGVmaW5lZCcpIHtcbiAgICAgICAgICB3aW5kb3cubmF2aWdhdG9yLm1zU2F2ZUJsb2IoYmxvYiwgZmlsZW5hbWUpXG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgY29uc3QgVVJMID0gd2luZG93LlVSTCB8fCB3aW5kb3cud2Via2l0VVJMXG4gICAgICAgICAgY29uc3QgZG93bmxvYWRVcmwgPSBVUkwuY3JlYXRlT2JqZWN0VVJMKGJsb2IpXG5cbiAgICAgICAgICBjb25zdCBhID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnYScpXG5cbiAgICAgICAgICBpZiAodHlwZW9mIGEuZG93bmxvYWQgPT09ICd1bmRlZmluZWQnKSB7XG4gICAgICAgICAgICB3aW5kb3cubG9jYXRpb24gPSBkb3dubG9hZFVybFxuICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICBhLmhyZWYgPSBkb3dubG9hZFVybFxuICAgICAgICAgICAgYS5kb3dubG9hZCA9IGZpbGVuYW1lXG4gICAgICAgICAgICBkb2N1bWVudC5ib2R5LmFwcGVuZENoaWxkKGEpXG4gICAgICAgICAgICBhLmNsaWNrKClcbiAgICAgICAgICB9XG5cbiAgICAgICAgICBzZXRUaW1lb3V0KCgpID0+IHtcbiAgICAgICAgICAgIFVSTC5yZXZva2VPYmplY3RVUkwoZG93bmxvYWRVcmwpXG4gICAgICAgICAgfSwgMTAwKVxuICAgICAgICB9XG4gICAgICB9XG4gICAgfVxuICB9XG5cbiAgY29uc3Qgc2VuZEJ1bGtTdWJtaXNzaW9uUmVxdWVzdCA9IChmb3JtVmFsdWVzLCB0b2tlbikgPT4ge1xuICAgIGNvbnN0IHsgYmFzZXVybCwgdXNlcm5hbWUsIGNzdkZpbGUgfSA9IGZvcm1WYWx1ZXNcbiAgICB2YXIgdXJsID0gYmFzZXVybCArICdidWxrU3VibWlzc2lvbi9pbXBvcnQnXG4gICAgaWYgKGZvcm1WYWx1ZXMucHJvZ3JhbXMpIHtcbiAgICAgIHZhciBwcm9ncmFtcyA9IGZvcm1WYWx1ZXMucHJvZ3JhbXMuc3BsaXQoJywnKS5tYXAocCA9PiBwLnRyaW0oKSkuam9pbignLCcpXG4gICAgICB1cmwgPSB1cmwgKyAnP2ludGVyZXN0ZWRQcm9ncmFtcz0nICsgcHJvZ3JhbXNcbiAgICB9XG4gICAgdmFyIGhlYWRlcnNPYmplY3QgPSB7XG4gICAgICAnQXV0aG9yaXphdGlvbic6IHRva2VuXG4gICAgfVxuICAgIHZhciBmb3JtRGF0YSA9IG5ldyBGb3JtRGF0YSgpO1xuICAgIGZvcm1EYXRhLmFwcGVuZCgnZmlsZScsIGNzdkZpbGUpO1xuICAgIHNlbmRQb3N0UmVxdWVzdCh1cmwsIGhlYWRlcnNPYmplY3QsIGJ1bGtTdWJtaXNzaW9uSGFuZGxlciwgZm9ybURhdGEpXG4gIH1cblxuICBjb25zdCBhdXRoUmVzcG9uc2VIYW5kbGVyID0gKGZvcm1WYWx1ZXMpID0+IChyZXEpID0+IHtcbiAgICBpZiAocmVxLnJlYWR5U3RhdGUgPT09IDQpIHtcbiAgICAgIGNvbnN0IHN0YXR1cyA9IHJlcS5zdGF0dXMudG9TdHJpbmcoKVxuICAgICAgaWYgKHN0YXR1c1swXSA9PT0gJzQnIHx8IHN0YXR1c1swXSA9PT0gJzUnKSB7XG4gICAgICAgIGRpc3BsYXlFcnJvcnMocmVxLnJlc3BvbnNlVGV4dCwgZmFsc2UpXG4gICAgICB9IGVsc2UgaWYgKHN0YXR1c1swXSA9PT0gJzInKSB7XG4gICAgICAgIHNlbmRCdWxrU3VibWlzc2lvblJlcXVlc3QoZm9ybVZhbHVlcyxcbiAgICAgICAgICBKU09OLnBhcnNlKHJlcS5yZXNwb25zZVRleHQpLnRva2VuKVxuICAgICAgfVxuICAgIH1cbiAgfVxuXG4gIGNvbnN0IHN1Ym1pdCA9IChldmVudCkgPT4ge1xuICAgIGNvbnN0IGJhc2V1cmwgPSBldmVudC50YXJnZXQuYWN0aW9uO1xuICAgIGNvbnN0IHVzZXJuYW1lID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ3VzZXJuYW1lJykudmFsdWVcbiAgICBjb25zdCBwYXNzd29yZCA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCdwYXNzd29yZCcpLnZhbHVlXG4gICAgY29uc3QgcHJvZ3JhbXMgPSBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgncHJvZ3JhbXMnKS52YWx1ZVxuICAgIGNvbnN0IGNzdkZpbGVJbnB1dCA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCdjc3YtdXBsb2FkJylcblxuICAgIGNvbnN0IGNzdkZpbGUgPSBjc3ZGaWxlSW5wdXQuZmlsZXMgJiZcbiAgICAgIGNzdkZpbGVJbnB1dC5maWxlcy5sZW5ndGggPiAwICYmXG4gICAgICBjc3ZGaWxlSW5wdXQuZmlsZXNbMF1cblxuICAgIGxldCBmb3JtVmFsdWVzID0ge1xuICAgICAgYmFzZXVybDogYmFzZXVybCxcbiAgICAgIHVzZXJuYW1lOiB1c2VybmFtZSxcbiAgICAgIHBhc3N3b3JkOiBwYXNzd29yZCxcbiAgICAgIGNzdkZpbGU6IGNzdkZpbGVcbiAgICB9XG5cbiAgICBpZiAocHJvZ3JhbXMgIT09ICcnKSBmb3JtVmFsdWVzLnByb2dyYW1zID0gcHJvZ3JhbXNcblxuICAgIHZhciB1cmwgPSBiYXNldXJsICsgJ2F1dGhUb2tlbidcbiAgICB2YXIgaGVhZGVyc09iamVjdCA9IHtcbiAgICAgICdDb250ZW50LXR5cGUnOiAnYXBwbGljYXRpb24vanNvbicsXG4gICAgICAnQWNjZXNzLUNvbnRyb2wtQWxsb3ctT3JpZ2luJzogJyonXG4gICAgfVxuXG4gICAgY29uc3QgYXV0aFBheWxvYWQgPSB7IHVzZXJuYW1lLCBwYXNzd29yZCB9XG5cbiAgICBzZW5kUG9zdFJlcXVlc3QodXJsLCBoZWFkZXJzT2JqZWN0LCBhdXRoUmVzcG9uc2VIYW5kbGVyKGZvcm1WYWx1ZXMpLFxuICAgICAgSlNPTi5zdHJpbmdpZnkoYXV0aFBheWxvYWQpKVxuICB9O1xuXG4gIEZvcm0uc2VsZWN0b3JzLkVSUk9SX01FU1NBR0VfUEFSRU5UID0gJ1tkYXRhLWpzKj1cInF1ZXN0aW9uLWNvbnRhaW5lclwiXSc7XG5cbiAgRm9ybS53YXRjaCgpO1xuXG4gIEZvcm0uc3VibWl0ID0gc3VibWl0O1xufVxuIiwiaW1wb3J0IEZvcm1zIGZyb20gJ0BueWNvcHBvcnR1bml0eS9wdHRybi1zY3JpcHRzL3NyYy9mb3Jtcy9mb3Jtcyc7XG5pbXBvcnQgeyBkaXNwbGF5RXJyb3JzLCBkaXNwbGF5SW5mbywgc2VuZFBvc3RSZXF1ZXN0IH0gZnJvbSAnLi91dGlsJztcblxuZXhwb3J0IGRlZmF1bHQgZnVuY3Rpb24oKSB7XG4gIGNvbnN0IFNFTEVDVE9SID0gJ1tkYXRhLWpzKj1cImNoYW5nZS1wYXNzd29yZFwiXSdcblxuICBjb25zdCBGb3JtID0gbmV3IEZvcm1zKGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoU0VMRUNUT1IpKTtcblxuICBjb25zdCByZXNwb25zZUhhbmRsZXIgPSAocmVxKSA9PiB7XG4gICAgaWYgKHJlcS5yZWFkeVN0YXRlID09PSA0KSB7XG4gICAgICBjb25zdCBzdGF0dXMgPSByZXEuc3RhdHVzLnRvU3RyaW5nKClcbiAgICAgIGlmIChzdGF0dXNbMF0gPT09ICc0JyB8fCBzdGF0dXNbMF0gPT09ICc1Jykge1xuICAgICAgICBkaXNwbGF5RXJyb3JzKHJlcS5yZXNwb25zZVRleHQsIGZhbHNlKVxuICAgICAgfSBlbHNlIGlmIChzdGF0dXNbMF0gPT09ICcyJykge1xuICAgICAgICBkaXNwbGF5SW5mbygnUGFzc3dvcmQgdXBkYXRlZCcpXG4gICAgICB9XG4gICAgfVxuICB9XG5cblxuICBjb25zdCBzdWJtaXQgPSAoZXZlbnQpID0+IHtcbiAgICBjb25zdCBkb21haW4gPSBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgnZG9tYWluJykudmFsdWVcbiAgICBjb25zdCB1c2VybmFtZSA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCd1c2VybmFtZScpLnZhbHVlXG4gICAgY29uc3QgcGFzc3dvcmQgPSBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgncGFzc3dvcmQnKS52YWx1ZVxuICAgIGNvbnN0IG5ld1Bhc3N3b3JkID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ25ld3Bhc3N3b3JkJykudmFsdWVcblxuICAgIHZhciB1cmwgPSBkb21haW4gKyAnYXV0aFRva2VuJ1xuICAgIHZhciBoZWFkZXJzT2JqZWN0ID0ge1xuICAgICAgJ0NvbnRlbnQtdHlwZSc6ICdhcHBsaWNhdGlvbi9qc29uJyxcbiAgICAgICdBY2Nlc3MtQ29udHJvbC1BbGxvdy1PcmlnaW4nOiAnKidcbiAgICB9XG5cbiAgICBjb25zdCBhdXRoUGF5bG9hZCA9IHsgdXNlcm5hbWUsIHBhc3N3b3JkLCBuZXdQYXNzd29yZCB9XG5cbiAgICBzZW5kUG9zdFJlcXVlc3QodXJsLCBoZWFkZXJzT2JqZWN0LCByZXNwb25zZUhhbmRsZXIsXG4gICAgICBKU09OLnN0cmluZ2lmeShhdXRoUGF5bG9hZCkpXG4gIH07XG5cbiAgRm9ybS5zZWxlY3RvcnMuRVJST1JfTUVTU0FHRV9QQVJFTlQgPSAnW2RhdGEtanMqPVwicXVlc3Rpb24tY29udGFpbmVyXCJdJztcblxuICBGb3JtLndhdGNoKCk7XG5cbiAgRm9ybS5zdWJtaXQgPSBzdWJtaXQ7XG59XG4iLCIvKipcbiAqIENvbnZlcnRzIGZvcm0gdG8gSlNPTlxuICovXG5cbmltcG9ydCByZXNwb25zZXMgZnJvbSAnLi9yZXNwb25zZXMuanMnO1xuXG5leHBvcnQgZGVmYXVsdCBmdW5jdGlvbigpIHtcbiAgJCgnLnNjcmVlbmVyLWZvcm0nKS5mYWRlSW4oNTAwKVxuXG4gIHZhciBpbmNvbWVzQ29udGFpbmVyID0gJCgnLmluY29tZXMnKS5jbG9uZSgpO1xuICB2YXIgZXhwZW5zZXNDb250YWluZXIgPSAkKCcuZXhwZW5zZXMnKS5jbG9uZSgpO1xuXG4gICQoJy5pbmNvbWVzJykucmVtb3ZlKCk7XG4gICQoJy5leHBlbnNlcycpLnJlbW92ZSgpO1xuXG4gIHZhciBwZXJzb25Db250YWluZXIgPSAkKCcucGVyc29uLWRhdGE6Zmlyc3QnKS5jbG9uZSgpO1xuXG4gIC8qIEdlbmVyYXRlIHRoZSBlbnRpcmUgSlNPTiAqL1xuICAkKCcuZ2VuZXJhdGUtanNvbicpLm9uKCdjbGljaycsIGZ1bmN0aW9uKGV2ZW50KXtcbiAgICBldmVudC5wcmV2ZW50RGVmYXVsdCgpO1xuXG4gICAgdmFyIGZvcm1kYXRhPSQoJy5zY3JlZW5lci1mb3JtJyk7XG5cbiAgICB2YXIgZmluYWxPYmogPSB7XG4gICAgICBob3VzZWhvbGQ6IFtdLFxuICAgICAgcGVyc29uOiBbXVxuICAgIH07XG5cbiAgICB2YXIgaG91c2Vob2xkT2JqID0gZ2VuZXJhdGVIb3VzZWhvbGRPYmooZm9ybWRhdGEpO1xuICAgIGZpbmFsT2JqWydob3VzZWhvbGQnXS5wdXNoKGhvdXNlaG9sZE9iaik7XG5cbiAgICB2YXIgcGVyc29uT2JqID0ge31cbiAgICAkKCcucGVyc29uLWRhdGEnKS5lYWNoKGZ1bmN0aW9uKHBpKSB7XG4gICAgICBwZXJzb25PYmogPSBnZW5lcmF0ZVBlcnNvbk9iaihmb3JtZGF0YSwgcGkpO1xuICAgICAgZmluYWxPYmpbJ3BlcnNvbiddLnB1c2gocGVyc29uT2JqKTtcbiAgICB9KVxuXG4gICAgZmluYWxPYmpbJ3dpdGhob2xkUGF5bG9hZCddID0gU3RyaW5nKGZvcm1kYXRhLmZpbmQoJ1tuYW1lPXdpdGhob2xkUGF5bG9hZF0nKS5pcygnOmNoZWNrZWQnKSk7XG5cbiAgICB2YXIgaGFzRXJyb3JzID0gdmFsaWRhdGVGaWVsZHMoZm9ybWRhdGEpO1xuXG4gICAgaWYgKGhhc0Vycm9yc1tcImVycm9yc1wiXSA+IDAgKSB7XG4gICAgICAkKCcuZXJyb3ItbXNnJykucmVtb3ZlQ2xhc3MoJ2hpZGRlbicpO1xuICAgIH1lbHNlIHtcbiAgICAgICQoJy5lcnJvci1tc2cnKS5hZGRDbGFzcygnaGlkZGVuJyk7XG4gICAgICAkKCcuZXJyb3InKS5yZW1vdmVDbGFzcygnZXJyb3InKTtcbiAgICAgICQoJy5zY3JlZW5lci1mb3JtJykuaGlkZSgpO1xuICAgICAgJCgnLnNjcmVlbmVyLWpzb24nKS5maW5kKCdwcmUnKS5yZW1vdmUoKTtcbiAgICAgICQoJy5zY3JlZW5lci1qc29uJykucHJlcGVuZCgnPHByZSBjbGFzcz1cImJsb2NrXCI+PGNvZGUgY2xhc3M9XCJjb2RlXCI+JyArIEpTT04uc3RyaW5naWZ5KFtmaW5hbE9ial0sIHVuZGVmaW5lZCwgMikgKyAnPC9jb2RlPjwvcHJlPicpO1xuICAgICAgJCgnLnNjcmVlbmVyLWpzb24nKS5yZW1vdmVDbGFzcygnaGlkZGVuJyk7XG4gICAgfVxuICAgIGlmIChoYXNFcnJvcnNbXCJ3YXJuaW5nc1wiXSA+IDAgKSB7XG4gICAgICAkKCcud2FybmluZy1tc2cnKS5yZW1vdmVDbGFzcygnaGlkZGVuJyk7XG4gICAgfWVsc2Uge1xuICAgICAgJCgnLndhcm5pbmctbXNnJykuYWRkQ2xhc3MoJ2hpZGRlbicpO1xuICAgIH1cbiAgfSlcblxuICAvKiBHbyBiYWNrIHRvIHRoZSBmb3JtICovXG4gICQoJy5nZW5lcmF0ZS1mb3JtJykub24oJ2NsaWNrJywgZnVuY3Rpb24oZXZlbnQpIHtcbiAgICBldmVudC5wcmV2ZW50RGVmYXVsdCgpO1xuICAgICQoJy5zY3JlZW5lci1qc29uJykuYWRkQ2xhc3MoJ2hpZGRlbicpO1xuICAgICQoJy5zY3JlZW5lci1mb3JtJykuc2hvdygpO1xuICB9KVxuXG4gICQoZG9jdW1lbnQpLm9uKCdjaGFuZ2UnLCdbbmFtZT1saXZpbmdUeXBlXScsIGZ1bmN0aW9uKGV2ZW50KSB7XG4gICAgZXZlbnQucHJldmVudERlZmF1bHQoKTtcbiAgICBpZigkKHRoaXMpLnZhbCgpID09ICdsaXZpbmdSZW50aW5nJyl7XG4gICAgICAkKCcubGl2aW5nUmVudGFsVHlwZScpLnJlbW92ZUNsYXNzKCdoaWRkZW4nKTtcbiAgICAgICQoJy5sZWFzZScpLnJlbW92ZUNsYXNzKCdoaWRkZW4nKTtcbiAgICAgIHBlcnNvbkNvbnRhaW5lci5maW5kKCcubGVhc2UnKS5yZW1vdmVDbGFzcygnaGlkZGVuJyk7XG4gICAgfSBlbHNlIHtcbiAgICAgICQoJy5saXZpbmdSZW50YWxUeXBlJykuYWRkQ2xhc3MoJ2hpZGRlbicpO1xuICAgICAgJCgnLmxlYXNlJykuYWRkQ2xhc3MoJ2hpZGRlbicpO1xuICAgIH1cbiAgICBpZigkKHRoaXMpLnZhbCgpID09ICdsaXZpbmdPd25lcicpe1xuICAgICAgJCgnLmRlZWQnKS5yZW1vdmVDbGFzcygnaGlkZGVuJyk7XG4gICAgICBwZXJzb25Db250YWluZXIuZmluZCgnLmRlZWQnKS5yZW1vdmVDbGFzcygnaGlkZGVuJyk7XG4gICAgfSBlbHNlIHtcbiAgICAgICQoJy5kZWVkJykuYWRkQ2xhc3MoJ2hpZGRlbicpO1xuICAgIH1cbiAgfSlcblxuICAvKiBBZGQgcGVyc29uICovXG4gICQoZG9jdW1lbnQpLm9uKCdjbGljaycsJy5hZGQtcGVyc29uJywgZnVuY3Rpb24oZXZlbnQpIHtcbiAgICBldmVudC5wcmV2ZW50RGVmYXVsdCgpO1xuXG4gICAgJCgnLmFkZC1yZW1vdmUnKS5maW5kKCcuZXJyb3InKS5yZW1vdmUoKVxuXG4gICAgaWYgKCQoJy5wZXJzb24tZGF0YScpLmxlbmd0aCA+IDgpIHtcbiAgICAgICQodGhpcykucGFyZW50KCkuYXBwZW5kKCc8cCBjbGFzcz1cImVycm9yIHB0LTJcIj4nKyByZXNwb25zZXMuZmluZCh4ID0+IHhbXCJQZXJzb25cIl0pW1wiUGVyc29uXCJdW1wiZXJyX251bV9wZXJzb25zXCJdKyc8L3A+JylcbiAgICB9ZWxzZSB7XG4gICAgICBwZXJzb25Db250YWluZXIuY2xvbmUoKS5pbnNlcnRCZWZvcmUoJCh0aGlzKS5wYXJlbnQoKSk7XG4gICAgfVxuXG4gICAgaWYgKCQoJy5wZXJzb24tZGF0YScpLmxlbmd0aCA+IDEpIHtcbiAgICAgICQoJy5yZW1vdmUtcGVyc29uJykucmVtb3ZlQ2xhc3MoJ2hpZGRlbicpO1xuICAgIH1cbiAgfSlcblxuICAvKiBSZW1vdmUgcGVyc29uICovXG4gICQoZG9jdW1lbnQpLm9uKCdjbGljaycsJy5yZW1vdmUtcGVyc29uJywgZnVuY3Rpb24oZXZlbnQpIHtcbiAgICBldmVudC5wcmV2ZW50RGVmYXVsdCgpO1xuXG4gICAgJCgnLmFkZC1yZW1vdmUnKS5maW5kKCcuZXJyb3InKS5yZW1vdmUoKVxuXG4gICAgaWYgKCQoJy5wZXJzb24tZGF0YScpLmxlbmd0aCA+MSkge1xuICAgICAgJCgnLnBlcnNvbi1kYXRhOmxhc3QnKS5yZW1vdmUoKTtcbiAgICB9XG4gICAgaWYgKCQoJy5wZXJzb24tZGF0YScpLmxlbmd0aCA9PSAxKSB7XG4gICAgICAkKCcucmVtb3ZlLXBlcnNvbicpLmFkZENsYXNzKCdoaWRkZW4nKTtcbiAgICB9XG4gIH0pXG5cbiAgLyogSU5DT01FUyAqL1xuICAkKGRvY3VtZW50KS5vbignY2xpY2snLCcuYWRkLWluY29tZScsIGZ1bmN0aW9uKGV2ZW50KSB7XG4gICAgZXZlbnQucHJldmVudERlZmF1bHQoKTtcbiAgICBpbmNvbWVzQ29udGFpbmVyLmNsb25lKCkuaW5zZXJ0QmVmb3JlKCQodGhpcykucGFyZW50KCkpXG4gICAgJCh0aGlzKS5jbG9zZXN0KCcucGVyc29uLWRhdGEnKS5maW5kKCcuaW5jb21lczpsYXN0JykucmVtb3ZlQ2xhc3MoJ2hpZGRlbicpXG4gICAgJCh0aGlzKS5wcmV2KCcucmVtb3ZlLWluY29tZScpLnJlbW92ZUNsYXNzKCdoaWRkZW4nKVxuICB9KVxuXG4gICQoZG9jdW1lbnQpLm9uKCdjbGljaycsJy5yZW1vdmUtaW5jb21lJywgZnVuY3Rpb24oZXZlbnQpIHtcbiAgICBldmVudC5wcmV2ZW50RGVmYXVsdCgpO1xuICAgICQodGhpcykuY2xvc2VzdCgnLnBlcnNvbi1kYXRhJykuZmluZCgnLmluY29tZXM6bGFzdCcpLnJlbW92ZSgpO1xuICAgIGlmKCQodGhpcykuY2xvc2VzdCgnLnBlcnNvbi1kYXRhJykuZmluZCgnLmluY29tZXMnKS5sZW5ndGggPiAwKXtcbiAgICAgICQodGhpcykucmVtb3ZlQ2xhc3MoJ2hpZGRlbicpO1xuICAgIH0gZWxzZSB7XG4gICAgICAkKHRoaXMpLmFkZENsYXNzKCdoaWRkZW4nKTtcbiAgICB9XG4gIH0pXG5cbiAgLyogRVhQRU5TRVMgKi9cbiAgJChkb2N1bWVudCkub24oJ2NsaWNrJywnLmFkZC1leHBlbnNlJywgZnVuY3Rpb24oZXZlbnQpIHtcbiAgICBldmVudC5wcmV2ZW50RGVmYXVsdCgpO1xuICAgIGV4cGVuc2VzQ29udGFpbmVyLmNsb25lKCkuaW5zZXJ0QmVmb3JlKCQodGhpcykucGFyZW50KCkpXG4gICAgJCh0aGlzKS5jbG9zZXN0KCcucGVyc29uLWRhdGEnKS5maW5kKCcuZXhwZW5zZXM6bGFzdCcpLnJlbW92ZUNsYXNzKCdoaWRkZW4nKVxuICAgICQodGhpcykucHJldignLnJlbW92ZS1leHBlbnNlJykucmVtb3ZlQ2xhc3MoJ2hpZGRlbicpXG4gIH0pXG5cbiAgJChkb2N1bWVudCkub24oJ2NsaWNrJywnLnJlbW92ZS1leHBlbnNlJywgZnVuY3Rpb24oZXZlbnQpIHtcbiAgICBldmVudC5wcmV2ZW50RGVmYXVsdCgpO1xuICAgICQodGhpcykuY2xvc2VzdCgnLnBlcnNvbi1kYXRhJykuZmluZCgnLmV4cGVuc2VzOmxhc3QnKS5yZW1vdmUoKTtcbiAgICBpZigkKHRoaXMpLmNsb3Nlc3QoJy5wZXJzb24tZGF0YScpLmZpbmQoJy5leHBlbnNlcycpLmxlbmd0aCA+IDApe1xuICAgICAgJCh0aGlzKS5yZW1vdmVDbGFzcygnaGlkZGVuJyk7XG4gICAgfSBlbHNlIHtcbiAgICAgICQodGhpcykuYWRkQ2xhc3MoJ2hpZGRlbicpO1xuICAgIH1cbiAgfSlcblxuICAvKiBHZW5lcmF0ZXMgdGhlIGhvdXNlaG9sZCBvYmplY3QgKi9cbiAgZnVuY3Rpb24gZ2VuZXJhdGVIb3VzZWhvbGRPYmooZm9ybSl7XG4gICAgdmFyIGhoID0gZm9ybS5maW5kKCdbaG91c2Vob2xkXScpLnNlcmlhbGl6ZUFycmF5KCkucmVkdWNlKChvYmosIGl0ZW0pID0+IChvYmpbaXRlbS5uYW1lXSA9IGl0ZW0udmFsdWUsIG9iaikgLHt9KTtcbiAgICB2YXIgbGl2aW5nVHlwZSA9IGZvcm0uZmluZCgnW25hbWU9bGl2aW5nVHlwZV0nKS5jaGlsZHJlbigpO1xuICAgIGxpdmluZ1R5cGUuZWFjaChmdW5jdGlvbigpe1xuICAgICAgaWYgKCQodGhpcykudmFsKCkgIT0gXCJcIil7XG4gICAgICAgIGlmKCQodGhpcykudmFsKCkgPT0gbGl2aW5nVHlwZS5wYXJlbnQoKS52YWwoKSl7XG4gICAgICAgICAgaGhbJCh0aGlzKS52YWwoKV09XCJ0cnVlXCI7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgaGhbJCh0aGlzKS52YWwoKV09XCJmYWxzZVwiO1xuICAgICAgICB9XG4gICAgICB9XG4gICAgfSlcbiAgICBkZWxldGUgaGhbJ2xpdmluZ1R5cGUnXTtcbiAgICByZXR1cm4gaGg7XG4gIH1cblxuICAvKiBHZW5lcmF0ZXMgdGhlIHBlcnNvbiBvYmplY3QgKi9cbiAgZnVuY3Rpb24gZ2VuZXJhdGVQZXJzb25PYmooZm9ybSwgcGluZGV4KSB7XG4gICAgdmFyIHBlcnNvbkZvcm0gPSBmb3JtLmZpbmQoJy5wZXJzb24tZGF0YScpLmVxKHBpbmRleCk7XG4gICAgdmFyIHBlcnNvbiA9IHBlcnNvbkZvcm0uZmluZCgnW3BlcnNvbl0nKS5zZXJpYWxpemVBcnJheSgpLnJlZHVjZSgob2JqLCBpdGVtKSA9PiAob2JqW2l0ZW0ubmFtZV0gPSBpdGVtLnZhbHVlLCBvYmopICx7fSk7XG4gICAgdmFyIHBlcnNvblR5cGUgPSBwZXJzb25Gb3JtLmZpbmQoJ1t0eXBlPWNoZWNrYm94XScpLmZpbHRlcignW3BlcnNvbl0nKTtcbiAgICBwZXJzb25UeXBlLmVhY2goZnVuY3Rpb24oKXtcbiAgICAgIGlmICgkKHRoaXMpLmlzKCc6Y2hlY2tlZCcpKXtcbiAgICAgICAgcGVyc29uWyQodGhpcykuYXR0cignbmFtZScpXT1cInRydWVcIjtcbiAgICAgIH1lbHNlIHtcbiAgICAgICAgcGVyc29uWyQodGhpcykuYXR0cignbmFtZScpXT1cImZhbHNlXCI7XG4gICAgICB9XG4gICAgfSlcblxuICAgIC8qIEluY29tZXMgKi9cbiAgICB2YXIgZm9ybUluY29tZXMgPSBwZXJzb25Gb3JtLmZpbmQoJ1twZXJzb24taW5jb21lc10nKS5zZXJpYWxpemVBcnJheSgpO1xuICAgIHZhciBpbmNvbWVzQXJyID0gW107XG4gICAgdmFyIGluY29tZXNPYmogPSB7fTtcbiAgICB2YXIgbnVtSW5jb21lcyA9IGZvcm1JbmNvbWVzLmxlbmd0aCAvIDM7XG4gICAgdmFyIGluZGV4ID0gMDtcbiAgICB2YXIgc3Vic2V0O1xuXG4gICAgZm9yICh2YXIgaSA9IDA7IGkgPCBudW1JbmNvbWVzOyBpKyspIHtcbiAgICAgIGluY29tZXNPYmogPSB7fTtcbiAgICAgIHN1YnNldCA9IGZvcm1JbmNvbWVzLnNsaWNlKGluZGV4LCBpbmRleCszKTtcbiAgICAgIHN1YnNldC5mb3JFYWNoKGZ1bmN0aW9uKGtleSl7XG4gICAgICAgIGluY29tZXNPYmpba2V5Lm5hbWVdID0ga2V5LnZhbHVlO1xuICAgICAgfSlcbiAgICAgIGluY29tZXNBcnIucHVzaChpbmNvbWVzT2JqKTtcblxuICAgICAgaW5kZXggPSBpbmRleCArIDM7XG4gICAgfVxuXG4gICAgaWYoaW5jb21lc0Fyci5sZW5ndGggPiAwKXtcbiAgICAgIHBlcnNvblsnaW5jb21lcyddID0gaW5jb21lc0FycjtcbiAgICB9XG5cbiAgICAvKiBFeHBlbnNlcyAqL1xuICAgIHZhciBmb3JtRXhwZW5zZXMgPSBwZXJzb25Gb3JtLmZpbmQoJ1twZXJzb24tZXhwZW5zZXNdJykuc2VyaWFsaXplQXJyYXkoKTtcbiAgICB2YXIgZXhwZW5zZXNBcnIgPSBbXTtcbiAgICB2YXIgZXhwZW5zZXNPYmogPSB7fTtcbiAgICB2YXIgbnVtRXhwZW5zZXMgPSBmb3JtRXhwZW5zZXMubGVuZ3RoIC8gMztcbiAgICBpbmRleCA9IDA7XG5cbiAgICBmb3IgKHZhciBpID0gMDsgaSA8IG51bUV4cGVuc2VzOyBpKyspIHtcbiAgICAgIGV4cGVuc2VzT2JqID0ge307XG4gICAgICBzdWJzZXQgPSBmb3JtRXhwZW5zZXMuc2xpY2UoaW5kZXgsIGluZGV4KzMpO1xuICAgICAgc3Vic2V0LmZvckVhY2goZnVuY3Rpb24oa2V5KXtcbiAgICAgICAgZXhwZW5zZXNPYmpba2V5Lm5hbWVdID0ga2V5LnZhbHVlO1xuICAgICAgfSlcblxuICAgICAgZXhwZW5zZXNBcnIucHVzaChleHBlbnNlc09iaik7XG5cbiAgICAgIGluZGV4ID0gaW5kZXggKyAzO1xuICAgIH1cblxuICAgIGlmKGV4cGVuc2VzQXJyLmxlbmd0aCA+IDApIHtcbiAgICAgIHBlcnNvblsnZXhwZW5zZXMnXSA9IGV4cGVuc2VzQXJyO1xuICAgIH1cblxuICAgIHJldHVybiBwZXJzb247XG4gIH1cblxuICAvKiBDb3B5IHRoZSBKU09OIG9iamVjdCB0byB0aGUgY2xpcGJvYXJkICovXG4gICQoZG9jdW1lbnQpLm9uKCdjbGljaycsJy5jb3B5LW9iaicsIGZ1bmN0aW9uKGV2ZW50KSB7XG4gICAgZXZlbnQucHJldmVudERlZmF1bHQoKTtcblxuICAgIHZhciByYW5nZSA9IGRvY3VtZW50LmNyZWF0ZVJhbmdlKCk7XG4gICAgcmFuZ2Uuc2VsZWN0Tm9kZShkb2N1bWVudC5nZXRFbGVtZW50c0J5Q2xhc3NOYW1lKFwiY29kZVwiKVswXSk7XG4gICAgd2luZG93LmdldFNlbGVjdGlvbigpLnJlbW92ZUFsbFJhbmdlcygpO1xuICAgIHdpbmRvdy5nZXRTZWxlY3Rpb24oKS5hZGRSYW5nZShyYW5nZSk7XG4gICAgZG9jdW1lbnQuZXhlY0NvbW1hbmQoXCJjb3B5XCIpO1xuXG4gICAgJCh0aGlzKS50ZXh0KCdDb3BpZWQhJyk7XG4gIH0pXG5cbiAgLyogVmFsaWRhdGUgdGhlIGZvcm0gKi9cbiAgZnVuY3Rpb24gdmFsaWRhdGVGaWVsZHMoZm9ybSkge1xuICAgIHZhciBmaWVsZCwgZmllbGROYW1lLCBncm91cFNlbGV0ZWQsXG4gICAgcmVzdWx0cyA9IHtcImVycm9yc1wiOiAwLCBcIndhcm5pbmdzXCI6IDB9LFxuICAgIGZpZWxkc09iaiA9IGZvcm0uc2VyaWFsaXplQXJyYXkoKS5yZWR1Y2UoKG9iaiwgaXRlbSkgPT4gKG9ialtpdGVtLm5hbWVdID0gaXRlbS52YWx1ZSwgb2JqKSAse30pLFxuICAgIGZpZWxkcyA9IGZvcm0uZmluZCgnW3JlcXVpcmVkXScpLFxuICAgIGVyck5vZGUgPSAkKCcuZXJyb3ItbXNnJyksXG4gICAgd2FybmluZ05vZGUgPSAkKCcud2FybmluZy1tc2cnKSxcbiAgICBoaE1zZ09iaiA9IHJlc3BvbnNlcy5maW5kKHggPT4geFtcIkhvdXNlaG9sZFwiXSlbXCJIb3VzZWhvbGRcIl0sXG4gICAgcGVyc29uTXNnT2JqID0gcmVzcG9uc2VzLmZpbmQoeCA9PiB4W1wiUGVyc29uXCJdKVtcIlBlcnNvblwiXSxcbiAgICBlcnJNc2dPYmogPSByZXNwb25zZXMuZmluZCh4ID0+IHhbXCJHZW5lcmFsXCJdKVtcIkdlbmVyYWxcIl1cblxuICAgICQoJy5lcnJvci1tc2cnKS5jaGlsZHJlbigpLnJlbW92ZSgpO1xuICAgICQoJy53YXJuaW5nLW1zZycpLmNoaWxkcmVuKCkucmVtb3ZlKCk7XG5cbiAgICAkKCcuZXJyb3ItbXNnJykuYWRkQ2xhc3MoJ2Vycm9yJylcbiAgICAkKCcuZXJyb3ItbXNnJykuYXBwZW5kKCc8cD48c3Ryb25nPicgKyBlcnJNc2dPYmpbXCJlcnJvclwiXSAgKyAnPC9zdHJvbmc+PC9wPicpXG4gICAgJCgnLndhcm5pbmctbXNnJykuYXBwZW5kKCc8cD48c3Ryb25nPicgKyBlcnJNc2dPYmpbXCJ3YXJuaW5nXCJdICsgJzwvc3Ryb25nPjwvcD4nKVxuXG4gICAgLyogY2hlY2sgZm9yIGVtcHR5IGZpZWxkcyAqL1xuICAgIGZpZWxkcy5lYWNoKGZ1bmN0aW9uKCl7XG4gICAgICBmaWVsZE5hbWUgPSAkKHRoaXMpLmF0dHIoJ25hbWUnKTtcbiAgICAgIGdyb3VwU2VsZXRlZCA9IE9iamVjdC5rZXlzKGZpZWxkc09iaikuZmluZChhID0+YS5pbmNsdWRlcyhmaWVsZE5hbWUpKT8gdHJ1ZSA6IGZhbHNlO1xuXG4gICAgICBpZiggJCh0aGlzKS52YWwoKSA9PT0gXCJcIiB8fFxuICAgICAgICAhZ3JvdXBTZWxldGVkXG4gICAgICApIHtcbiAgICAgICAgJCh0aGlzKS5wYXJlbnQoKS5wYXJlbnQoKS5hZGRDbGFzcygnZXJyb3InKTtcbiAgICAgICAgcmVzdWx0c1tcImVycm9yc1wiXSArPSAxO1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgJCh0aGlzKS5wYXJlbnQoKS5yZW1vdmVDbGFzcygnZXJyb3InKTtcbiAgICAgIH1cblxuICAgICAgaWYoICgkKHRoaXMpLnZhbCgpID09ICdsaXZpbmdSZW50aW5nJykgJiZcbiAgICAgICAgKGZvcm0uZmluZCgnW25hbWU9bGl2aW5nUmVudGFsVHlwZV0nKS52YWwoKSA9PSBcIlwiKVxuICAgICAgKSB7XG4gICAgICAgIHdhcm5pbmdOb2RlLmFwcGVuZCgnPHA+JyArIGhoTXNnT2JqW1wid2FybmluZ19yZW50YWxfdHlwZVwiXSArICc8L3A+JylcbiAgICAgICAgcmVzdWx0c1tcIndhcm5pbmdzXCJdICs9IDE7XG4gICAgICB9XG5cbiAgICB9KTtcblxuICAgIHZhciBudW1QZW9wbGUgPSAkKCcucGVyc29uLWRhdGEnKS5sZW5ndGg7XG4gICAgaWYgKChudW1QZW9wbGUgPCAxKSB8fCAobnVtUGVvcGxlID4gOCkpIHtcbiAgICAgICQoJy5lcnJvci1tc2cnKS5hcHBlbmQoJzxwPicrIHBlcnNvbk1zZ09ialtcImVycl9udW1fcGVyc29uc1wiXSArICc8L3A+JylcbiAgICAgIHJlc3VsdHNbXCJlcnJvcnNcIl0gKz0gMTtcbiAgICB9XG5cbiAgICB2YXIgbnVtSGVhZHMgPSAwXG4gICAgdmFyIGhvdXNlaG9sZE1lbWJlclR5cGVzID0gJCgnW25hbWU9aG91c2Vob2xkTWVtYmVyVHlwZV0nKVxuICAgIGZvciAodmFyIGkgPSAwOyBpIDwgaG91c2Vob2xkTWVtYmVyVHlwZXMubGVuZ3RoOyBpKyspIHtcbiAgICAgIGlmIChob3VzZWhvbGRNZW1iZXJUeXBlc1tpXS52YWx1ZSA9PSBcIkhlYWRPZkhvdXNlaG9sZFwiKSB7XG4gICAgICAgIG51bUhlYWRzICs9IDFcbiAgICAgIH1cbiAgICB9XG5cbiAgICBpZiAobnVtSGVhZHMgIT0gMSkge1xuICAgICAgJCgnW25hbWU9aG91c2Vob2xkTWVtYmVyVHlwZV0nKS5wYXJlbnQoKS5hZGRDbGFzcygnZXJyb3InKVxuICAgICAgJCgnLmVycm9yLW1zZycpLmFwcGVuZCgnPHA+JysgcGVyc29uTXNnT2JqW1wiZXJyX2hvaFwiXSArJzwvcD4nKVxuICAgICAgcmVzdWx0c1tcImVycm9yc1wiXSArPSAxO1xuICAgIH1cblxuICAgIGlmIChmb3JtLmZpbmQoJ1tuYW1lPWxpdmluZ1R5cGVdJykudmFsKCkgPT0gXCJsaXZpbmdSZW50aW5nXCIgJiZcbiAgICAgICEoJCgnW25hbWU9bGl2aW5nUmVudGFsT25MZWFzZV06Y2hlY2tlZCcpLmxlbmd0aCA+IDApXG4gICAgKXtcbiAgICAgIHdhcm5pbmdOb2RlLmFwcGVuZCgnPHA+JyArIHBlcnNvbk1zZ09ialtcIndhcm5pbmdfb25fbGVhc2VcIl0gKyAnPC9wPicpXG4gICAgICByZXN1bHRzW1wid2FybmluZ3NcIl0gKz0gMTtcbiAgICB9XG5cbiAgICBpZiAoZm9ybS5maW5kKCdbbmFtZT1saXZpbmdUeXBlXScpLnZhbCgpID09IFwibGl2aW5nT3duZXJcIiAmJlxuICAgICAgISgkKCdbbmFtZT1saXZpbmdSZW50YWxPbkxlYXNlXTpjaGVja2VkJykubGVuZ3RoID4gMClcbiAgICApe1xuICAgICAgd2FybmluZ05vZGUuYXBwZW5kKCc8cD4nICsgcGVyc29uTXNnT2JqW1wid2FybmluZ19vbl9kZWVkXCJdICsgJzwvcD4nKVxuICAgICAgcmVzdWx0c1tcIndhcm5pbmdzXCJdICs9IDE7XG4gICAgfVxuXG5cbiAgICByZXR1cm4gcmVzdWx0cztcbiAgfVxufVxuIiwiJ3VzZSBzdHJpY3QnO1xuXG4vKipcbiAqIFRoZSBJY29uIG1vZHVsZVxuICogQGNsYXNzXG4gKi9cbmNsYXNzIEljb25zIHtcbiAgLyoqXG4gICAqIEBjb25zdHJ1Y3RvclxuICAgKiBAcGFyYW0gIHtTdHJpbmd9IHBhdGggVGhlIHBhdGggb2YgdGhlIGljb24gZmlsZVxuICAgKiBAcmV0dXJuIHtvYmplY3R9IFRoZSBjbGFzc1xuICAgKi9cbiAgY29uc3RydWN0b3IocGF0aCkge1xuICAgIHBhdGggPSAocGF0aCkgPyBwYXRoIDogSWNvbnMucGF0aDtcblxuICAgIGZldGNoKHBhdGgpXG4gICAgICAudGhlbigocmVzcG9uc2UpID0+IHtcbiAgICAgICAgaWYgKHJlc3BvbnNlLm9rKVxuICAgICAgICAgIHJldHVybiByZXNwb25zZS50ZXh0KCk7XG4gICAgICAgIGVsc2VcbiAgICAgICAgICAvLyBlc2xpbnQtZGlzYWJsZS1uZXh0LWxpbmUgbm8tY29uc29sZVxuICAgICAgICAgIGlmIChwcm9jZXNzLmVudi5OT0RFX0VOViAhPT0gJ3Byb2R1Y3Rpb24nKVxuICAgICAgICAgICAgY29uc29sZS5kaXIocmVzcG9uc2UpO1xuICAgICAgfSlcbiAgICAgIC5jYXRjaCgoZXJyb3IpID0+IHtcbiAgICAgICAgLy8gZXNsaW50LWRpc2FibGUtbmV4dC1saW5lIG5vLWNvbnNvbGVcbiAgICAgICAgaWYgKHByb2Nlc3MuZW52Lk5PREVfRU5WICE9PSAncHJvZHVjdGlvbicpXG4gICAgICAgICAgY29uc29sZS5kaXIoZXJyb3IpO1xuICAgICAgfSlcbiAgICAgIC50aGVuKChkYXRhKSA9PiB7XG4gICAgICAgIGNvbnN0IHNwcml0ZSA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ2RpdicpO1xuICAgICAgICBzcHJpdGUuaW5uZXJIVE1MID0gZGF0YTtcbiAgICAgICAgc3ByaXRlLnNldEF0dHJpYnV0ZSgnYXJpYS1oaWRkZW4nLCB0cnVlKTtcbiAgICAgICAgc3ByaXRlLnNldEF0dHJpYnV0ZSgnc3R5bGUnLCAnZGlzcGxheTogbm9uZTsnKTtcbiAgICAgICAgZG9jdW1lbnQuYm9keS5hcHBlbmRDaGlsZChzcHJpdGUpO1xuICAgICAgfSk7XG5cbiAgICByZXR1cm4gdGhpcztcbiAgfVxufVxuXG4vKiogQHR5cGUge1N0cmluZ30gVGhlIHBhdGggb2YgdGhlIGljb24gZmlsZSAqL1xuSWNvbnMucGF0aCA9ICdzdmcvaWNvbnMuc3ZnJztcblxuZXhwb3J0IGRlZmF1bHQgSWNvbnM7XG4iLCIndXNlIHN0cmljdCc7XG5cbi8qKlxuICogVGhlIFNpbXBsZSBUb2dnbGUgY2xhc3MuIFRoaXMgd2lsbCB0b2dnbGUgdGhlIGNsYXNzICdhY3RpdmUnIGFuZCAnaGlkZGVuJ1xuICogb24gdGFyZ2V0IGVsZW1lbnRzLCBkZXRlcm1pbmVkIGJ5IGEgY2xpY2sgZXZlbnQgb24gYSBzZWxlY3RlZCBsaW5rIG9yXG4gKiBlbGVtZW50LiBUaGlzIHdpbGwgYWxzbyB0b2dnbGUgdGhlIGFyaWEtaGlkZGVuIGF0dHJpYnV0ZSBmb3IgdGFyZ2V0ZWRcbiAqIGVsZW1lbnRzIHRvIHN1cHBvcnQgc2NyZWVuIHJlYWRlcnMuIFRhcmdldCBzZXR0aW5ncyBhbmQgb3RoZXIgZnVuY3Rpb25hbGl0eVxuICogY2FuIGJlIGNvbnRyb2xsZWQgdGhyb3VnaCBkYXRhIGF0dHJpYnV0ZXMuXG4gKlxuICogVGhpcyB1c2VzIHRoZSAubWF0Y2hlcygpIG1ldGhvZCB3aGljaCB3aWxsIHJlcXVpcmUgYSBwb2x5ZmlsbCBmb3IgSUVcbiAqIGh0dHBzOi8vcG9seWZpbGwuaW8vdjIvZG9jcy9mZWF0dXJlcy8jRWxlbWVudF9wcm90b3R5cGVfbWF0Y2hlc1xuICpcbiAqIEBjbGFzc1xuICovXG5jbGFzcyBUb2dnbGUge1xuICAvKipcbiAgICogQGNvbnN0cnVjdG9yXG4gICAqXG4gICAqIEBwYXJhbSAge09iamVjdH0gIHMgIFNldHRpbmdzIGZvciB0aGlzIFRvZ2dsZSBpbnN0YW5jZVxuICAgKlxuICAgKiBAcmV0dXJuIHtPYmplY3R9ICAgICBUaGUgY2xhc3NcbiAgICovXG4gIGNvbnN0cnVjdG9yKHMpIHtcbiAgICAvLyBDcmVhdGUgYW4gb2JqZWN0IHRvIHN0b3JlIGV4aXN0aW5nIHRvZ2dsZSBsaXN0ZW5lcnMgKGlmIGl0IGRvZXNuJ3QgZXhpc3QpXG4gICAgaWYgKCF3aW5kb3cuaGFzT3duUHJvcGVydHkoVG9nZ2xlLmNhbGxiYWNrKSlcbiAgICAgIHdpbmRvd1tUb2dnbGUuY2FsbGJhY2tdID0gW107XG5cbiAgICBzID0gKCFzKSA/IHt9IDogcztcblxuICAgIHRoaXMuc2V0dGluZ3MgPSB7XG4gICAgICBzZWxlY3RvcjogKHMuc2VsZWN0b3IpID8gcy5zZWxlY3RvciA6IFRvZ2dsZS5zZWxlY3RvcixcbiAgICAgIG5hbWVzcGFjZTogKHMubmFtZXNwYWNlKSA/IHMubmFtZXNwYWNlIDogVG9nZ2xlLm5hbWVzcGFjZSxcbiAgICAgIGluYWN0aXZlQ2xhc3M6IChzLmluYWN0aXZlQ2xhc3MpID8gcy5pbmFjdGl2ZUNsYXNzIDogVG9nZ2xlLmluYWN0aXZlQ2xhc3MsXG4gICAgICBhY3RpdmVDbGFzczogKHMuYWN0aXZlQ2xhc3MpID8gcy5hY3RpdmVDbGFzcyA6IFRvZ2dsZS5hY3RpdmVDbGFzcyxcbiAgICAgIGJlZm9yZTogKHMuYmVmb3JlKSA/IHMuYmVmb3JlIDogZmFsc2UsXG4gICAgICBhZnRlcjogKHMuYWZ0ZXIpID8gcy5hZnRlciA6IGZhbHNlLFxuICAgICAgdmFsaWQ6IChzLnZhbGlkKSA/IHMudmFsaWQgOiBmYWxzZSxcbiAgICAgIGZvY3VzYWJsZTogKHMuaGFzT3duUHJvcGVydHkoJ2ZvY3VzYWJsZScpKSA/IHMuZm9jdXNhYmxlIDogdHJ1ZSxcbiAgICAgIGp1bXA6IChzLmhhc093blByb3BlcnR5KCdqdW1wJykpID8gcy5qdW1wIDogdHJ1ZVxuICAgIH07XG5cbiAgICAvLyBTdG9yZSB0aGUgZWxlbWVudCBmb3IgcG90ZW50aWFsIHVzZSBpbiBjYWxsYmFja3NcbiAgICB0aGlzLmVsZW1lbnQgPSAocy5lbGVtZW50KSA/IHMuZWxlbWVudCA6IGZhbHNlO1xuXG4gICAgaWYgKHRoaXMuZWxlbWVudCkge1xuICAgICAgdGhpcy5lbGVtZW50LmFkZEV2ZW50TGlzdGVuZXIoJ2NsaWNrJywgKGV2ZW50KSA9PiB7XG4gICAgICAgIHRoaXMudG9nZ2xlKGV2ZW50KTtcbiAgICAgIH0pO1xuICAgIH0gZWxzZSB7XG4gICAgICAvLyBJZiB0aGVyZSBpc24ndCBhbiBleGlzdGluZyBpbnN0YW50aWF0ZWQgdG9nZ2xlLCBhZGQgdGhlIGV2ZW50IGxpc3RlbmVyLlxuICAgICAgaWYgKCF3aW5kb3dbVG9nZ2xlLmNhbGxiYWNrXS5oYXNPd25Qcm9wZXJ0eSh0aGlzLnNldHRpbmdzLnNlbGVjdG9yKSkge1xuICAgICAgICBsZXQgYm9keSA9IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoJ2JvZHknKTtcblxuICAgICAgICBmb3IgKGxldCBpID0gMDsgaSA8IFRvZ2dsZS5ldmVudHMubGVuZ3RoOyBpKyspIHtcbiAgICAgICAgICBsZXQgdGdnbGVFdmVudCA9IFRvZ2dsZS5ldmVudHNbaV07XG5cbiAgICAgICAgICBib2R5LmFkZEV2ZW50TGlzdGVuZXIodGdnbGVFdmVudCwgZXZlbnQgPT4ge1xuICAgICAgICAgICAgaWYgKCFldmVudC50YXJnZXQubWF0Y2hlcyh0aGlzLnNldHRpbmdzLnNlbGVjdG9yKSlcbiAgICAgICAgICAgICAgcmV0dXJuO1xuXG4gICAgICAgICAgICB0aGlzLmV2ZW50ID0gZXZlbnQ7XG5cbiAgICAgICAgICAgIGxldCB0eXBlID0gZXZlbnQudHlwZS50b1VwcGVyQ2FzZSgpO1xuXG4gICAgICAgICAgICBpZiAoXG4gICAgICAgICAgICAgIHRoaXNbZXZlbnQudHlwZV0gJiZcbiAgICAgICAgICAgICAgVG9nZ2xlLmVsZW1lbnRzW3R5cGVdICYmXG4gICAgICAgICAgICAgIFRvZ2dsZS5lbGVtZW50c1t0eXBlXS5pbmNsdWRlcyhldmVudC50YXJnZXQudGFnTmFtZSlcbiAgICAgICAgICAgICkgdGhpc1tldmVudC50eXBlXShldmVudCk7XG4gICAgICAgICAgfSk7XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICB9XG5cbiAgICAvLyBSZWNvcmQgdGhhdCBhIHRvZ2dsZSB1c2luZyB0aGlzIHNlbGVjdG9yIGhhcyBiZWVuIGluc3RhbnRpYXRlZC5cbiAgICAvLyBUaGlzIHByZXZlbnRzIGRvdWJsZSB0b2dnbGluZy5cbiAgICB3aW5kb3dbVG9nZ2xlLmNhbGxiYWNrXVt0aGlzLnNldHRpbmdzLnNlbGVjdG9yXSA9IHRydWU7XG5cbiAgICByZXR1cm4gdGhpcztcbiAgfVxuXG4gIC8qKlxuICAgKiBDbGljayBldmVudCBoYW5kbGVyXG4gICAqXG4gICAqIEBwYXJhbSAge0V2ZW50fSAgZXZlbnQgIFRoZSBvcmlnaW5hbCBjbGljayBldmVudFxuICAgKi9cbiAgY2xpY2soZXZlbnQpIHtcbiAgICB0aGlzLnRvZ2dsZShldmVudCk7XG4gIH1cblxuICAvKipcbiAgICogSW5wdXQvc2VsZWN0L3RleHRhcmVhIGNoYW5nZSBldmVudCBoYW5kbGVyLiBDaGVja3MgdG8gc2VlIGlmIHRoZVxuICAgKiBldmVudC50YXJnZXQgaXMgdmFsaWQgdGhlbiB0b2dnbGVzIGFjY29yZGluZ2x5LlxuICAgKlxuICAgKiBAcGFyYW0gIHtFdmVudH0gIGV2ZW50ICBUaGUgb3JpZ2luYWwgaW5wdXQgY2hhbmdlIGV2ZW50XG4gICAqL1xuICBjaGFuZ2UoZXZlbnQpIHtcbiAgICBsZXQgdmFsaWQgPSBldmVudC50YXJnZXQuY2hlY2tWYWxpZGl0eSgpO1xuXG4gICAgaWYgKHZhbGlkICYmICF0aGlzLmlzQWN0aXZlKGV2ZW50LnRhcmdldCkpIHtcbiAgICAgIHRoaXMudG9nZ2xlKGV2ZW50KTsgLy8gc2hvd1xuICAgIH0gZWxzZSBpZiAoIXZhbGlkICYmIHRoaXMuaXNBY3RpdmUoZXZlbnQudGFyZ2V0KSkge1xuICAgICAgdGhpcy50b2dnbGUoZXZlbnQpOyAvLyBoaWRlXG4gICAgfVxuICB9XG5cbiAgLyoqXG4gICAqIENoZWNrIHRvIHNlZSBpZiB0aGUgdG9nZ2xlIGlzIGFjdGl2ZVxuICAgKlxuICAgKiBAcGFyYW0gIHtPYmplY3R9ICBlbGVtZW50ICBUaGUgdG9nZ2xlIGVsZW1lbnQgKHRyaWdnZXIpXG4gICAqL1xuICBpc0FjdGl2ZShlbGVtZW50KSB7XG4gICAgbGV0IGFjdGl2ZSA9IGZhbHNlO1xuXG4gICAgaWYgKHRoaXMuc2V0dGluZ3MuYWN0aXZlQ2xhc3MpIHtcbiAgICAgIGFjdGl2ZSA9IGVsZW1lbnQuY2xhc3NMaXN0LmNvbnRhaW5zKHRoaXMuc2V0dGluZ3MuYWN0aXZlQ2xhc3MpXG4gICAgfVxuXG4gICAgLy8gaWYgKCkge1xuICAgICAgLy8gVG9nZ2xlLmVsZW1lbnRBcmlhUm9sZXNcbiAgICAgIC8vIFRPRE86IEFkZCBjYXRjaCB0byBzZWUgaWYgZWxlbWVudCBhcmlhIHJvbGVzIGFyZSB0b2dnbGVkXG4gICAgLy8gfVxuXG4gICAgLy8gaWYgKCkge1xuICAgICAgLy8gVG9nZ2xlLnRhcmdldEFyaWFSb2xlc1xuICAgICAgLy8gVE9ETzogQWRkIGNhdGNoIHRvIHNlZSBpZiB0YXJnZXQgYXJpYSByb2xlcyBhcmUgdG9nZ2xlZFxuICAgIC8vIH1cblxuICAgIHJldHVybiBhY3RpdmU7XG4gIH1cblxuICAvKipcbiAgICogR2V0IHRoZSB0YXJnZXQgb2YgdGhlIHRvZ2dsZSBlbGVtZW50ICh0cmlnZ2VyKVxuICAgKlxuICAgKiBAcGFyYW0gIHtPYmplY3R9ICBlbCAgVGhlIHRvZ2dsZSBlbGVtZW50ICh0cmlnZ2VyKVxuICAgKi9cbiAgZ2V0VGFyZ2V0KGVsZW1lbnQpIHtcbiAgICBsZXQgdGFyZ2V0ID0gZmFsc2U7XG5cbiAgICAvKiogQW5jaG9yIExpbmtzICovXG4gICAgdGFyZ2V0ID0gKGVsZW1lbnQuaGFzQXR0cmlidXRlKCdocmVmJykpID9cbiAgICAgIGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoZWxlbWVudC5nZXRBdHRyaWJ1dGUoJ2hyZWYnKSkgOiB0YXJnZXQ7XG5cbiAgICAvKiogVG9nZ2xlIENvbnRyb2xzICovXG4gICAgdGFyZ2V0ID0gKGVsZW1lbnQuaGFzQXR0cmlidXRlKCdhcmlhLWNvbnRyb2xzJykpID9cbiAgICAgIGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoYCMke2VsZW1lbnQuZ2V0QXR0cmlidXRlKCdhcmlhLWNvbnRyb2xzJyl9YCkgOiB0YXJnZXQ7XG5cbiAgICByZXR1cm4gdGFyZ2V0O1xuICB9XG5cbiAgLyoqXG4gICAqIFRoZSB0b2dnbGUgZXZlbnQgcHJveHkgZm9yIGdldHRpbmcgYW5kIHNldHRpbmcgdGhlIGVsZW1lbnQvcyBhbmQgdGFyZ2V0XG4gICAqXG4gICAqIEBwYXJhbSAge09iamVjdH0gIGV2ZW50ICBUaGUgbWFpbiBjbGljayBldmVudFxuICAgKlxuICAgKiBAcmV0dXJuIHtPYmplY3R9ICAgICAgICAgVGhlIFRvZ2dsZSBpbnN0YW5jZVxuICAgKi9cbiAgdG9nZ2xlKGV2ZW50KSB7XG4gICAgbGV0IGVsZW1lbnQgPSBldmVudC50YXJnZXQ7XG4gICAgbGV0IHRhcmdldCA9IGZhbHNlO1xuICAgIGxldCBmb2N1c2FibGUgPSBbXTtcblxuICAgIGV2ZW50LnByZXZlbnREZWZhdWx0KCk7XG5cbiAgICB0YXJnZXQgPSB0aGlzLmdldFRhcmdldChlbGVtZW50KTtcblxuICAgIC8qKiBGb2N1c2FibGUgQ2hpbGRyZW4gKi9cbiAgICBmb2N1c2FibGUgPSAodGFyZ2V0KSA/XG4gICAgICB0YXJnZXQucXVlcnlTZWxlY3RvckFsbChUb2dnbGUuZWxGb2N1c2FibGUuam9pbignLCAnKSkgOiBmb2N1c2FibGU7XG5cbiAgICAvKiogTWFpbiBGdW5jdGlvbmFsaXR5ICovXG4gICAgaWYgKCF0YXJnZXQpIHJldHVybiB0aGlzO1xuICAgIHRoaXMuZWxlbWVudFRvZ2dsZShlbGVtZW50LCB0YXJnZXQsIGZvY3VzYWJsZSk7XG5cbiAgICAvKiogVW5kbyAqL1xuICAgIGlmIChlbGVtZW50LmRhdGFzZXRbYCR7dGhpcy5zZXR0aW5ncy5uYW1lc3BhY2V9VW5kb2BdKSB7XG4gICAgICBjb25zdCB1bmRvID0gZG9jdW1lbnQucXVlcnlTZWxlY3RvcihcbiAgICAgICAgZWxlbWVudC5kYXRhc2V0W2Ake3RoaXMuc2V0dGluZ3MubmFtZXNwYWNlfVVuZG9gXVxuICAgICAgKTtcblxuICAgICAgdW5kby5hZGRFdmVudExpc3RlbmVyKCdjbGljaycsIChldmVudCkgPT4ge1xuICAgICAgICBldmVudC5wcmV2ZW50RGVmYXVsdCgpO1xuICAgICAgICB0aGlzLmVsZW1lbnRUb2dnbGUoZWxlbWVudCwgdGFyZ2V0KTtcbiAgICAgICAgdW5kby5yZW1vdmVFdmVudExpc3RlbmVyKCdjbGljaycpO1xuICAgICAgfSk7XG4gICAgfVxuXG4gICAgcmV0dXJuIHRoaXM7XG4gIH1cblxuICAvKipcbiAgICogR2V0IG90aGVyIHRvZ2dsZXMgdGhhdCBtaWdodCBjb250cm9sIHRoZSBzYW1lIGVsZW1lbnRcbiAgICpcbiAgICogQHBhcmFtICAge09iamVjdH0gICAgZWxlbWVudCAgVGhlIHRvZ2dsaW5nIGVsZW1lbnRcbiAgICpcbiAgICogQHJldHVybiAge05vZGVMaXN0fSAgICAgICAgICAgTGlzdCBvZiBvdGhlciB0b2dnbGluZyBlbGVtZW50c1xuICAgKiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB0aGF0IGNvbnRyb2wgdGhlIHRhcmdldFxuICAgKi9cbiAgZ2V0T3RoZXJzKGVsZW1lbnQpIHtcbiAgICBsZXQgc2VsZWN0b3IgPSBmYWxzZTtcblxuICAgIGlmIChlbGVtZW50Lmhhc0F0dHJpYnV0ZSgnaHJlZicpKSB7XG4gICAgICBzZWxlY3RvciA9IGBbaHJlZj1cIiR7ZWxlbWVudC5nZXRBdHRyaWJ1dGUoJ2hyZWYnKX1cIl1gO1xuICAgIH0gZWxzZSBpZiAoZWxlbWVudC5oYXNBdHRyaWJ1dGUoJ2FyaWEtY29udHJvbHMnKSkge1xuICAgICAgc2VsZWN0b3IgPSBgW2FyaWEtY29udHJvbHM9XCIke2VsZW1lbnQuZ2V0QXR0cmlidXRlKCdhcmlhLWNvbnRyb2xzJyl9XCJdYDtcbiAgICB9XG5cbiAgICByZXR1cm4gKHNlbGVjdG9yKSA/IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3JBbGwoc2VsZWN0b3IpIDogW107XG4gIH1cblxuICAvKipcbiAgICogSGlkZSB0aGUgVG9nZ2xlIFRhcmdldCdzIGZvY3VzYWJsZSBjaGlsZHJlbiBmcm9tIGZvY3VzLlxuICAgKiBJZiBhbiBlbGVtZW50IGhhcyB0aGUgZGF0YS1hdHRyaWJ1dGUgYGRhdGEtdG9nZ2xlLXRhYmluZGV4YFxuICAgKiBpdCB3aWxsIHVzZSB0aGF0IGFzIHRoZSBkZWZhdWx0IHRhYiBpbmRleCBvZiB0aGUgZWxlbWVudC5cbiAgICpcbiAgICogQHBhcmFtICAge05vZGVMaXN0fSAgZWxlbWVudHMgIExpc3Qgb2YgZm9jdXNhYmxlIGVsZW1lbnRzXG4gICAqXG4gICAqIEByZXR1cm4gIHtPYmplY3R9ICAgICAgICAgICAgICBUaGUgVG9nZ2xlIEluc3RhbmNlXG4gICAqL1xuICB0b2dnbGVGb2N1c2FibGUoZWxlbWVudHMpIHtcbiAgICBlbGVtZW50cy5mb3JFYWNoKGVsZW1lbnQgPT4ge1xuICAgICAgbGV0IHRhYmluZGV4ID0gZWxlbWVudC5nZXRBdHRyaWJ1dGUoJ3RhYmluZGV4Jyk7XG5cbiAgICAgIGlmICh0YWJpbmRleCA9PT0gJy0xJykge1xuICAgICAgICBsZXQgZGF0YURlZmF1bHQgPSBlbGVtZW50XG4gICAgICAgICAgLmdldEF0dHJpYnV0ZShgZGF0YS0ke1RvZ2dsZS5uYW1lc3BhY2V9LXRhYmluZGV4YCk7XG5cbiAgICAgICAgaWYgKGRhdGFEZWZhdWx0KSB7XG4gICAgICAgICAgZWxlbWVudC5zZXRBdHRyaWJ1dGUoJ3RhYmluZGV4JywgZGF0YURlZmF1bHQpO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgIGVsZW1lbnQucmVtb3ZlQXR0cmlidXRlKCd0YWJpbmRleCcpO1xuICAgICAgICB9XG4gICAgICB9IGVsc2Uge1xuICAgICAgICBlbGVtZW50LnNldEF0dHJpYnV0ZSgndGFiaW5kZXgnLCAnLTEnKTtcbiAgICAgIH1cbiAgICB9KTtcblxuICAgIHJldHVybiB0aGlzO1xuICB9XG5cbiAgLyoqXG4gICAqIEp1bXBzIHRvIEVsZW1lbnQgdmlzaWJseSBhbmQgc2hpZnRzIGZvY3VzXG4gICAqIHRvIHRoZSBlbGVtZW50IGJ5IHNldHRpbmcgdGhlIHRhYmluZGV4XG4gICAqXG4gICAqIEBwYXJhbSAgIHtPYmplY3R9ICBlbGVtZW50ICBUaGUgVG9nZ2xpbmcgRWxlbWVudFxuICAgKiBAcGFyYW0gICB7T2JqZWN0fSAgdGFyZ2V0ICAgVGhlIFRhcmdldCBFbGVtZW50XG4gICAqXG4gICAqIEByZXR1cm4gIHtPYmplY3R9ICAgICAgICAgICBUaGUgVG9nZ2xlIGluc3RhbmNlXG4gICAqL1xuICBqdW1wVG8oZWxlbWVudCwgdGFyZ2V0KSB7XG4gICAgLy8gUmVzZXQgdGhlIGhpc3Rvcnkgc3RhdGUuIFRoaXMgd2lsbCBjbGVhciBvdXRcbiAgICAvLyB0aGUgaGFzaCB3aGVuIHRoZSB0YXJnZXQgaXMgdG9nZ2xlZCBjbG9zZWRcbiAgICBoaXN0b3J5LnB1c2hTdGF0ZSgnJywgJycsXG4gICAgICB3aW5kb3cubG9jYXRpb24ucGF0aG5hbWUgKyB3aW5kb3cubG9jYXRpb24uc2VhcmNoKTtcblxuICAgIC8vIEZvY3VzIGlmIGFjdGl2ZVxuICAgIGlmICh0YXJnZXQuY2xhc3NMaXN0LmNvbnRhaW5zKHRoaXMuc2V0dGluZ3MuYWN0aXZlQ2xhc3MpKSB7XG4gICAgICB3aW5kb3cubG9jYXRpb24uaGFzaCA9IGVsZW1lbnQuZ2V0QXR0cmlidXRlKCdocmVmJyk7XG5cbiAgICAgIHRhcmdldC5zZXRBdHRyaWJ1dGUoJ3RhYmluZGV4JywgJzAnKTtcbiAgICAgIHRhcmdldC5mb2N1cyh7cHJldmVudFNjcm9sbDogdHJ1ZX0pO1xuICAgIH0gZWxzZSB7XG4gICAgICB0YXJnZXQucmVtb3ZlQXR0cmlidXRlKCd0YWJpbmRleCcpO1xuICAgIH1cblxuICAgIHJldHVybiB0aGlzO1xuICB9XG5cbiAgLyoqXG4gICAqIFRoZSBtYWluIHRvZ2dsaW5nIG1ldGhvZCBmb3IgYXR0cmlidXRlc1xuICAgKlxuICAgKiBAcGFyYW0gIHtPYmplY3R9ICAgIGVsZW1lbnQgICAgVGhlIFRvZ2dsZSBlbGVtZW50XG4gICAqIEBwYXJhbSAge09iamVjdH0gICAgdGFyZ2V0ICAgICBUaGUgVGFyZ2V0IGVsZW1lbnQgdG8gdG9nZ2xlIGFjdGl2ZS9oaWRkZW5cbiAgICogQHBhcmFtICB7Tm9kZUxpc3R9ICBmb2N1c2FibGUgIEFueSBmb2N1c2FibGUgY2hpbGRyZW4gaW4gdGhlIHRhcmdldFxuICAgKlxuICAgKiBAcmV0dXJuIHtPYmplY3R9ICAgICAgICAgICAgICAgVGhlIFRvZ2dsZSBpbnN0YW5jZVxuICAgKi9cbiAgZWxlbWVudFRvZ2dsZShlbGVtZW50LCB0YXJnZXQsIGZvY3VzYWJsZSA9IFtdKSB7XG4gICAgbGV0IGkgPSAwO1xuICAgIGxldCBhdHRyID0gJyc7XG4gICAgbGV0IHZhbHVlID0gJyc7XG5cbiAgICAvKipcbiAgICAgKiBTdG9yZSBlbGVtZW50cyBmb3IgcG90ZW50aWFsIHVzZSBpbiBjYWxsYmFja3NcbiAgICAgKi9cblxuICAgIHRoaXMuZWxlbWVudCA9IGVsZW1lbnQ7XG4gICAgdGhpcy50YXJnZXQgPSB0YXJnZXQ7XG4gICAgdGhpcy5vdGhlcnMgPSB0aGlzLmdldE90aGVycyhlbGVtZW50KTtcbiAgICB0aGlzLmZvY3VzYWJsZSA9IGZvY3VzYWJsZTtcblxuICAgIC8qKlxuICAgICAqIFZhbGlkaXR5IG1ldGhvZCBwcm9wZXJ0eSB0aGF0IHdpbGwgY2FuY2VsIHRoZSB0b2dnbGUgaWYgaXQgcmV0dXJucyBmYWxzZVxuICAgICAqL1xuXG4gICAgaWYgKHRoaXMuc2V0dGluZ3MudmFsaWQgJiYgIXRoaXMuc2V0dGluZ3MudmFsaWQodGhpcykpXG4gICAgICByZXR1cm4gdGhpcztcblxuICAgIC8qKlxuICAgICAqIFRvZ2dsaW5nIGJlZm9yZSBob29rXG4gICAgICovXG5cbiAgICBpZiAodGhpcy5zZXR0aW5ncy5iZWZvcmUpXG4gICAgICB0aGlzLnNldHRpbmdzLmJlZm9yZSh0aGlzKTtcblxuICAgIC8qKlxuICAgICAqIFRvZ2dsZSBFbGVtZW50IGFuZCBUYXJnZXQgY2xhc3Nlc1xuICAgICAqL1xuXG4gICAgaWYgKHRoaXMuc2V0dGluZ3MuYWN0aXZlQ2xhc3MpIHtcbiAgICAgIHRoaXMuZWxlbWVudC5jbGFzc0xpc3QudG9nZ2xlKHRoaXMuc2V0dGluZ3MuYWN0aXZlQ2xhc3MpO1xuICAgICAgdGhpcy50YXJnZXQuY2xhc3NMaXN0LnRvZ2dsZSh0aGlzLnNldHRpbmdzLmFjdGl2ZUNsYXNzKTtcblxuICAgICAgLy8gSWYgdGhlcmUgYXJlIG90aGVyIHRvZ2dsZXMgdGhhdCBjb250cm9sIHRoZSBzYW1lIGVsZW1lbnRcbiAgICAgIHRoaXMub3RoZXJzLmZvckVhY2gob3RoZXIgPT4ge1xuICAgICAgICBpZiAob3RoZXIgIT09IHRoaXMuZWxlbWVudClcbiAgICAgICAgICBvdGhlci5jbGFzc0xpc3QudG9nZ2xlKHRoaXMuc2V0dGluZ3MuYWN0aXZlQ2xhc3MpO1xuICAgICAgfSk7XG4gICAgfVxuXG4gICAgaWYgKHRoaXMuc2V0dGluZ3MuaW5hY3RpdmVDbGFzcylcbiAgICAgIHRhcmdldC5jbGFzc0xpc3QudG9nZ2xlKHRoaXMuc2V0dGluZ3MuaW5hY3RpdmVDbGFzcyk7XG5cbiAgICAvKipcbiAgICAgKiBUYXJnZXQgRWxlbWVudCBBcmlhIEF0dHJpYnV0ZXNcbiAgICAgKi9cblxuICAgIGZvciAoaSA9IDA7IGkgPCBUb2dnbGUudGFyZ2V0QXJpYVJvbGVzLmxlbmd0aDsgaSsrKSB7XG4gICAgICBhdHRyID0gVG9nZ2xlLnRhcmdldEFyaWFSb2xlc1tpXTtcbiAgICAgIHZhbHVlID0gdGhpcy50YXJnZXQuZ2V0QXR0cmlidXRlKGF0dHIpO1xuXG4gICAgICBpZiAodmFsdWUgIT0gJycgJiYgdmFsdWUpXG4gICAgICAgIHRoaXMudGFyZ2V0LnNldEF0dHJpYnV0ZShhdHRyLCAodmFsdWUgPT09ICd0cnVlJykgPyAnZmFsc2UnIDogJ3RydWUnKTtcbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBUb2dnbGUgdGhlIHRhcmdldCdzIGZvY3VzYWJsZSBjaGlsZHJlbiB0YWJpbmRleFxuICAgICAqL1xuXG4gICAgaWYgKHRoaXMuc2V0dGluZ3MuZm9jdXNhYmxlKVxuICAgICAgdGhpcy50b2dnbGVGb2N1c2FibGUodGhpcy5mb2N1c2FibGUpO1xuXG4gICAgLyoqXG4gICAgICogSnVtcCB0byBUYXJnZXQgRWxlbWVudCBpZiBUb2dnbGUgRWxlbWVudCBpcyBhbiBhbmNob3IgbGlua1xuICAgICAqL1xuXG4gICAgaWYgKHRoaXMuc2V0dGluZ3MuanVtcCAmJiB0aGlzLmVsZW1lbnQuaGFzQXR0cmlidXRlKCdocmVmJykpXG4gICAgICB0aGlzLmp1bXBUbyh0aGlzLmVsZW1lbnQsIHRoaXMudGFyZ2V0KTtcblxuICAgIC8qKlxuICAgICAqIFRvZ2dsZSBFbGVtZW50IChpbmNsdWRpbmcgbXVsdGkgdG9nZ2xlcykgQXJpYSBBdHRyaWJ1dGVzXG4gICAgICovXG5cbiAgICBmb3IgKGkgPSAwOyBpIDwgVG9nZ2xlLmVsQXJpYVJvbGVzLmxlbmd0aDsgaSsrKSB7XG4gICAgICBhdHRyID0gVG9nZ2xlLmVsQXJpYVJvbGVzW2ldO1xuICAgICAgdmFsdWUgPSB0aGlzLmVsZW1lbnQuZ2V0QXR0cmlidXRlKGF0dHIpO1xuXG4gICAgICBpZiAodmFsdWUgIT0gJycgJiYgdmFsdWUpXG4gICAgICAgIHRoaXMuZWxlbWVudC5zZXRBdHRyaWJ1dGUoYXR0ciwgKHZhbHVlID09PSAndHJ1ZScpID8gJ2ZhbHNlJyA6ICd0cnVlJyk7XG5cbiAgICAgIC8vIElmIHRoZXJlIGFyZSBvdGhlciB0b2dnbGVzIHRoYXQgY29udHJvbCB0aGUgc2FtZSBlbGVtZW50XG4gICAgICB0aGlzLm90aGVycy5mb3JFYWNoKChvdGhlcikgPT4ge1xuICAgICAgICBpZiAob3RoZXIgIT09IHRoaXMuZWxlbWVudCAmJiBvdGhlci5nZXRBdHRyaWJ1dGUoYXR0cikpXG4gICAgICAgICAgb3RoZXIuc2V0QXR0cmlidXRlKGF0dHIsICh2YWx1ZSA9PT0gJ3RydWUnKSA/ICdmYWxzZScgOiAndHJ1ZScpO1xuICAgICAgfSk7XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogVG9nZ2xpbmcgY29tcGxldGUgaG9va1xuICAgICAqL1xuXG4gICAgaWYgKHRoaXMuc2V0dGluZ3MuYWZ0ZXIpXG4gICAgICB0aGlzLnNldHRpbmdzLmFmdGVyKHRoaXMpO1xuXG4gICAgcmV0dXJuIHRoaXM7XG4gIH1cbn1cblxuLyoqIEB0eXBlICB7U3RyaW5nfSAgVGhlIG1haW4gc2VsZWN0b3IgdG8gYWRkIHRoZSB0b2dnbGluZyBmdW5jdGlvbiB0byAqL1xuVG9nZ2xlLnNlbGVjdG9yID0gJ1tkYXRhLWpzKj1cInRvZ2dsZVwiXSc7XG5cbi8qKiBAdHlwZSAge1N0cmluZ30gIFRoZSBuYW1lc3BhY2UgZm9yIG91ciBkYXRhIGF0dHJpYnV0ZSBzZXR0aW5ncyAqL1xuVG9nZ2xlLm5hbWVzcGFjZSA9ICd0b2dnbGUnO1xuXG4vKiogQHR5cGUgIHtTdHJpbmd9ICBUaGUgaGlkZSBjbGFzcyAqL1xuVG9nZ2xlLmluYWN0aXZlQ2xhc3MgPSAnaGlkZGVuJztcblxuLyoqIEB0eXBlICB7U3RyaW5nfSAgVGhlIGFjdGl2ZSBjbGFzcyAqL1xuVG9nZ2xlLmFjdGl2ZUNsYXNzID0gJ2FjdGl2ZSc7XG5cbi8qKiBAdHlwZSAge0FycmF5fSAgQXJpYSByb2xlcyB0byB0b2dnbGUgdHJ1ZS9mYWxzZSBvbiB0aGUgdG9nZ2xpbmcgZWxlbWVudCAqL1xuVG9nZ2xlLmVsQXJpYVJvbGVzID0gWydhcmlhLXByZXNzZWQnLCAnYXJpYS1leHBhbmRlZCddO1xuXG4vKiogQHR5cGUgIHtBcnJheX0gIEFyaWEgcm9sZXMgdG8gdG9nZ2xlIHRydWUvZmFsc2Ugb24gdGhlIHRhcmdldCBlbGVtZW50ICovXG5Ub2dnbGUudGFyZ2V0QXJpYVJvbGVzID0gWydhcmlhLWhpZGRlbiddO1xuXG4vKiogQHR5cGUgIHtBcnJheX0gIEZvY3VzYWJsZSBlbGVtZW50cyB0byBoaWRlIHdpdGhpbiB0aGUgaGlkZGVuIHRhcmdldCBlbGVtZW50ICovXG5Ub2dnbGUuZWxGb2N1c2FibGUgPSBbXG4gICdhJywgJ2J1dHRvbicsICdpbnB1dCcsICdzZWxlY3QnLCAndGV4dGFyZWEnLCAnb2JqZWN0JywgJ2VtYmVkJywgJ2Zvcm0nLFxuICAnZmllbGRzZXQnLCAnbGVnZW5kJywgJ2xhYmVsJywgJ2FyZWEnLCAnYXVkaW8nLCAndmlkZW8nLCAnaWZyYW1lJywgJ3N2ZycsXG4gICdkZXRhaWxzJywgJ3RhYmxlJywgJ1t0YWJpbmRleF0nLCAnW2NvbnRlbnRlZGl0YWJsZV0nLCAnW3VzZW1hcF0nXG5dO1xuXG4vKiogQHR5cGUgIHtBcnJheX0gIEtleSBhdHRyaWJ1dGUgZm9yIHN0b3JpbmcgdG9nZ2xlcyBpbiB0aGUgd2luZG93ICovXG5Ub2dnbGUuY2FsbGJhY2sgPSBbJ1RvZ2dsZXNDYWxsYmFjayddO1xuXG4vKiogQHR5cGUgIHtBcnJheX0gIERlZmF1bHQgZXZlbnRzIHRvIHRvIHdhdGNoIGZvciB0b2dnbGluZy4gRWFjaCBtdXN0IGhhdmUgYSBoYW5kbGVyIGluIHRoZSBjbGFzcyBhbmQgZWxlbWVudHMgdG8gbG9vayBmb3IgaW4gVG9nZ2xlLmVsZW1lbnRzICovXG5Ub2dnbGUuZXZlbnRzID0gWydjbGljaycsICdjaGFuZ2UnXTtcblxuLyoqIEB0eXBlICB7QXJyYXl9ICBFbGVtZW50cyB0byBkZWxlZ2F0ZSB0byBlYWNoIGV2ZW50IGhhbmRsZXIgKi9cblRvZ2dsZS5lbGVtZW50cyA9IHtcbiAgQ0xJQ0s6IFsnQScsICdCVVRUT04nXSxcbiAgQ0hBTkdFOiBbJ1NFTEVDVCcsICdJTlBVVCcsICdURVhUQVJFQSddXG59O1xuXG5leHBvcnQgZGVmYXVsdCBUb2dnbGU7XG4iLCIndXNlIHN0cmljdCc7XG5cbi8qKlxuICogVHJhY2tpbmcgYnVzIGZvciBHb29nbGUgYW5hbHl0aWNzIGFuZCBXZWJ0cmVuZHMuXG4gKi9cbmNsYXNzIFRyYWNrIHtcbiAgY29uc3RydWN0b3Iocykge1xuICAgIGNvbnN0IGJvZHkgPSBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKCdib2R5Jyk7XG5cbiAgICBzID0gKCFzKSA/IHt9IDogcztcblxuICAgIHRoaXMuX3NldHRpbmdzID0ge1xuICAgICAgc2VsZWN0b3I6IChzLnNlbGVjdG9yKSA/IHMuc2VsZWN0b3IgOiBUcmFjay5zZWxlY3RvcixcbiAgICB9O1xuXG4gICAgdGhpcy5kZXNpbmF0aW9ucyA9IFRyYWNrLmRlc3RpbmF0aW9ucztcblxuICAgIGJvZHkuYWRkRXZlbnRMaXN0ZW5lcignY2xpY2snLCAoZXZlbnQpID0+IHtcbiAgICAgIGlmICghZXZlbnQudGFyZ2V0Lm1hdGNoZXModGhpcy5fc2V0dGluZ3Muc2VsZWN0b3IpKVxuICAgICAgICByZXR1cm47XG5cbiAgICAgIGxldCBrZXkgPSBldmVudC50YXJnZXQuZGF0YXNldC50cmFja0tleTtcbiAgICAgIGxldCBkYXRhID0gSlNPTi5wYXJzZShldmVudC50YXJnZXQuZGF0YXNldC50cmFja0RhdGEpO1xuXG4gICAgICB0aGlzLnRyYWNrKGtleSwgZGF0YSk7XG4gICAgfSk7XG5cbiAgICByZXR1cm4gdGhpcztcbiAgfVxuXG4gIC8qKlxuICAgKiBUcmFja2luZyBmdW5jdGlvbiB3cmFwcGVyXG4gICAqXG4gICAqIEBwYXJhbSAge1N0cmluZ30gICAgICBrZXkgICBUaGUga2V5IG9yIGV2ZW50IG9mIHRoZSBkYXRhXG4gICAqIEBwYXJhbSAge0NvbGxlY3Rpb259ICBkYXRhICBUaGUgZGF0YSB0byB0cmFja1xuICAgKlxuICAgKiBAcmV0dXJuIHtPYmplY3R9ICAgICAgICAgICAgVGhlIGZpbmFsIGRhdGEgb2JqZWN0XG4gICAqL1xuICB0cmFjayhrZXksIGRhdGEpIHtcbiAgICAvLyBTZXQgdGhlIHBhdGggbmFtZSBiYXNlZCBvbiB0aGUgbG9jYXRpb25cbiAgICBjb25zdCBkID0gZGF0YS5tYXAoZWwgPT4ge1xuICAgICAgICBpZiAoZWwuaGFzT3duUHJvcGVydHkoVHJhY2sua2V5KSlcbiAgICAgICAgICBlbFtUcmFjay5rZXldID0gYCR7d2luZG93LmxvY2F0aW9uLnBhdGhuYW1lfS8ke2VsW1RyYWNrLmtleV19YFxuICAgICAgICByZXR1cm4gZWw7XG4gICAgICB9KTtcblxuICAgIGxldCB3dCA9IHRoaXMud2VidHJlbmRzKGtleSwgZCk7XG4gICAgbGV0IGdhID0gdGhpcy5ndGFnKGtleSwgZCk7XG5cbiAgICAvKiBlc2xpbnQtZGlzYWJsZSBuby1jb25zb2xlICovXG4gICAgaWYgKHByb2Nlc3MuZW52Lk5PREVfRU5WICE9PSAncHJvZHVjdGlvbicpXG4gICAgICBjb25zb2xlLmRpcih7J1RyYWNrJzogW3d0LCBnYV19KTtcbiAgICAvKiBlc2xpbnQtZW5hYmxlIG5vLWNvbnNvbGUgKi9cblxuICAgIHJldHVybiBkO1xuICB9O1xuXG4gIC8qKlxuICAgKiBEYXRhIGJ1cyBmb3IgdHJhY2tpbmcgdmlld3MgaW4gV2VidHJlbmRzIGFuZCBHb29nbGUgQW5hbHl0aWNzXG4gICAqXG4gICAqIEBwYXJhbSAge1N0cmluZ30gICAgICBhcHAgICBUaGUgbmFtZSBvZiB0aGUgU2luZ2xlIFBhZ2UgQXBwbGljYXRpb24gdG8gdHJhY2tcbiAgICogQHBhcmFtICB7U3RyaW5nfSAgICAgIGtleSAgIFRoZSBrZXkgb3IgZXZlbnQgb2YgdGhlIGRhdGFcbiAgICogQHBhcmFtICB7Q29sbGVjdGlvbn0gIGRhdGEgIFRoZSBkYXRhIHRvIHRyYWNrXG4gICAqL1xuICB2aWV3KGFwcCwga2V5LCBkYXRhKSB7XG4gICAgbGV0IHd0ID0gdGhpcy53ZWJ0cmVuZHMoa2V5LCBkYXRhKTtcbiAgICBsZXQgZ2EgPSB0aGlzLmd0YWdWaWV3KGFwcCwga2V5KTtcblxuICAgIC8qIGVzbGludC1kaXNhYmxlIG5vLWNvbnNvbGUgKi9cbiAgICBpZiAocHJvY2Vzcy5lbnYuTk9ERV9FTlYgIT09ICdwcm9kdWN0aW9uJylcbiAgICAgIGNvbnNvbGUuZGlyKHsnVHJhY2snOiBbd3QsIGdhXX0pO1xuICAgIC8qIGVzbGludC1lbmFibGUgbm8tY29uc29sZSAqL1xuICB9O1xuXG4gIC8qKlxuICAgKiBQdXNoIEV2ZW50cyB0byBXZWJ0cmVuZHNcbiAgICpcbiAgICogQHBhcmFtICB7U3RyaW5nfSAgICAgIGtleSAgIFRoZSBrZXkgb3IgZXZlbnQgb2YgdGhlIGRhdGFcbiAgICogQHBhcmFtICB7Q29sbGVjdGlvbn0gIGRhdGEgIFRoZSBkYXRhIHRvIHRyYWNrXG4gICAqL1xuICB3ZWJ0cmVuZHMoa2V5LCBkYXRhKSB7XG4gICAgaWYgKFxuICAgICAgdHlwZW9mIFdlYnRyZW5kcyA9PT0gJ3VuZGVmaW5lZCcgfHxcbiAgICAgIHR5cGVvZiBkYXRhID09PSAndW5kZWZpbmVkJyB8fFxuICAgICAgIXRoaXMuZGVzaW5hdGlvbnMuaW5jbHVkZXMoJ3dlYnRyZW5kcycpXG4gICAgKVxuICAgICAgcmV0dXJuIGZhbHNlO1xuXG4gICAgbGV0IGV2ZW50ID0gW3tcbiAgICAgICdXVC50aSc6IGtleVxuICAgIH1dO1xuXG4gICAgaWYgKGRhdGFbMF0gJiYgZGF0YVswXS5oYXNPd25Qcm9wZXJ0eShUcmFjay5rZXkpKVxuICAgICAgZXZlbnQucHVzaCh7XG4gICAgICAgICdEQ1MuZGNzdXJpJzogZGF0YVswXVtUcmFjay5rZXldXG4gICAgICB9KTtcbiAgICBlbHNlXG4gICAgICBPYmplY3QuYXNzaWduKGV2ZW50LCBkYXRhKTtcblxuICAgIC8vIEZvcm1hdCBkYXRhIGZvciBXZWJ0cmVuZHNcbiAgICBsZXQgd3RkID0ge2FyZ3NhOiBldmVudC5mbGF0TWFwKGUgPT4ge1xuICAgICAgcmV0dXJuIE9iamVjdC5rZXlzKGUpLmZsYXRNYXAoayA9PiBbaywgZVtrXV0pO1xuICAgIH0pfTtcblxuICAgIC8vIElmICdhY3Rpb24nIGlzIHVzZWQgYXMgdGhlIGtleSAoZm9yIGd0YWcuanMpLCBzd2l0Y2ggaXQgdG8gV2VidHJlbmRzXG4gICAgbGV0IGFjdGlvbiA9IGRhdGEuYXJnc2EuaW5kZXhPZignYWN0aW9uJyk7XG5cbiAgICBpZiAoYWN0aW9uKSBkYXRhLmFyZ3NhW2FjdGlvbl0gPSAnRENTLmRjc3VyaSc7XG5cbiAgICAvLyBXZWJ0cmVuZHMgZG9lc24ndCBzZW5kIHRoZSBwYWdlIHZpZXcgZm9yIE11bHRpVHJhY2ssIGFkZCBwYXRoIHRvIHVybFxuICAgIGxldCBkY3N1cmkgPSBkYXRhLmFyZ3NhLmluZGV4T2YoJ0RDUy5kY3N1cmknKTtcblxuICAgIGlmIChkY3N1cmkpXG4gICAgICBkYXRhLmFyZ3NhW2Rjc3VyaSArIDFdID0gd2luZG93LmxvY2F0aW9uLnBhdGhuYW1lICsgZGF0YS5hcmdzYVtkY3N1cmkgKyAxXTtcblxuICAgIC8qIGVzbGludC1kaXNhYmxlIG5vLXVuZGVmICovXG4gICAgaWYgKHR5cGVvZiBXZWJ0cmVuZHMgIT09ICd1bmRlZmluZWQnKVxuICAgICAgV2VidHJlbmRzLm11bHRpVHJhY2sod3RkKTtcbiAgICAvKiBlc2xpbnQtZGlzYWJsZSBuby11bmRlZiAqL1xuXG4gICAgcmV0dXJuIFsnV2VidHJlbmRzJywgd3RkXTtcbiAgfTtcblxuICAvKipcbiAgICogUHVzaCBDbGljayBFdmVudHMgdG8gR29vZ2xlIEFuYWx5dGljc1xuICAgKlxuICAgKiBAcGFyYW0gIHtTdHJpbmd9ICAgICAga2V5ICAgVGhlIGtleSBvciBldmVudCBvZiB0aGUgZGF0YVxuICAgKiBAcGFyYW0gIHtDb2xsZWN0aW9ufSAgZGF0YSAgVGhlIGRhdGEgdG8gdHJhY2tcbiAgICovXG4gIGd0YWcoa2V5LCBkYXRhKSB7XG4gICAgaWYgKFxuICAgICAgdHlwZW9mIGd0YWcgPT09ICd1bmRlZmluZWQnIHx8XG4gICAgICB0eXBlb2YgZGF0YSA9PT0gJ3VuZGVmaW5lZCcgfHxcbiAgICAgICF0aGlzLmRlc2luYXRpb25zLmluY2x1ZGVzKCdndGFnJylcbiAgICApXG4gICAgICByZXR1cm4gZmFsc2U7XG5cbiAgICBsZXQgdXJpID0gZGF0YS5maW5kKChlbGVtZW50KSA9PiBlbGVtZW50Lmhhc093blByb3BlcnR5KFRyYWNrLmtleSkpO1xuXG4gICAgbGV0IGV2ZW50ID0ge1xuICAgICAgJ2V2ZW50X2NhdGVnb3J5Jzoga2V5XG4gICAgfTtcblxuICAgIC8qIGVzbGludC1kaXNhYmxlIG5vLXVuZGVmICovXG4gICAgZ3RhZyhUcmFjay5rZXksIHVyaVtUcmFjay5rZXldLCBldmVudCk7XG4gICAgLyogZXNsaW50LWVuYWJsZSBuby11bmRlZiAqL1xuXG4gICAgcmV0dXJuIFsnZ3RhZycsIFRyYWNrLmtleSwgdXJpW1RyYWNrLmtleV0sIGV2ZW50XTtcbiAgfTtcblxuICAvKipcbiAgICogUHVzaCBTY3JlZW4gVmlldyBFdmVudHMgdG8gR29vZ2xlIEFuYWx5dGljc1xuICAgKlxuICAgKiBAcGFyYW0gIHtTdHJpbmd9ICBhcHAgIFRoZSBuYW1lIG9mIHRoZSBhcHBsaWNhdGlvblxuICAgKiBAcGFyYW0gIHtTdHJpbmd9ICBrZXkgIFRoZSBrZXkgb3IgZXZlbnQgb2YgdGhlIGRhdGFcbiAgICovXG4gIGd0YWdWaWV3KGFwcCwga2V5KSB7XG4gICAgaWYgKFxuICAgICAgdHlwZW9mIGd0YWcgPT09ICd1bmRlZmluZWQnIHx8XG4gICAgICB0eXBlb2YgZGF0YSA9PT0gJ3VuZGVmaW5lZCcgfHxcbiAgICAgICF0aGlzLmRlc2luYXRpb25zLmluY2x1ZGVzKCdndGFnJylcbiAgICApXG4gICAgICByZXR1cm4gZmFsc2U7XG5cbiAgICBsZXQgdmlldyA9IHtcbiAgICAgIGFwcF9uYW1lOiBhcHAsXG4gICAgICBzY3JlZW5fbmFtZToga2V5XG4gICAgfTtcblxuICAgIC8qIGVzbGludC1kaXNhYmxlIG5vLXVuZGVmICovXG4gICAgZ3RhZygnZXZlbnQnLCAnc2NyZWVuX3ZpZXcnLCB2aWV3KTtcbiAgICAvKiBlc2xpbnQtZW5hYmxlIG5vLXVuZGVmICovXG5cbiAgICByZXR1cm4gWydndGFnJywgVHJhY2sua2V5LCAnc2NyZWVuX3ZpZXcnLCB2aWV3XTtcbiAgfTtcbn1cblxuLyoqIEB0eXBlIHtTdHJpbmd9IFRoZSBtYWluIHNlbGVjdG9yIHRvIGFkZCB0aGUgdHJhY2tpbmcgZnVuY3Rpb24gdG8gKi9cblRyYWNrLnNlbGVjdG9yID0gJ1tkYXRhLWpzKj1cInRyYWNrXCJdJztcblxuLyoqIEB0eXBlIHtTdHJpbmd9IFRoZSBtYWluIGV2ZW50IHRyYWNraW5nIGtleSB0byBtYXAgdG8gV2VidHJlbmRzIERDUy51cmkgKi9cblRyYWNrLmtleSA9ICdldmVudCc7XG5cbi8qKiBAdHlwZSB7QXJyYXl9IFdoYXQgZGVzdGluYXRpb25zIHRvIHB1c2ggZGF0YSB0byAqL1xuVHJhY2suZGVzdGluYXRpb25zID0gW1xuICAnd2VidHJlbmRzJyxcbiAgJ2d0YWcnXG5dO1xuXG5leHBvcnQgZGVmYXVsdCBUcmFjazsiLCJpbXBvcnQgJy4vbW9kdWxlcy9wb2x5ZmlsbC1yZW1vdmUnO1xuXG5pbXBvcnQgcmVxdWVzdEZvcm0gZnJvbSAnLi9tb2R1bGVzL3N1Ym1pc3Npb24uanMnO1xuaW1wb3J0IHN3YWdnZXIgZnJvbSAnLi9tb2R1bGVzL3N3YWdnZXIuanMnO1xuaW1wb3J0IGJ1bGtTdWJtaXNzaW9uIGZyb20gJy4vbW9kdWxlcy9idWxrLXN1Ym1pc3Npb24uanMnO1xuaW1wb3J0IGNoYW5nZVBhc3N3b3JkIGZyb20gJy4vbW9kdWxlcy9jaGFuZ2UtcGFzc3dvcmQuanMnO1xuaW1wb3J0IHJlcXVlc3RGb3JtSlNPTiBmcm9tICcuL21vZHVsZXMvcmVxdWVzdC1mb3JtLWpzb24uanMnO1xuXG5pbXBvcnQgSWNvbnMgZnJvbSAnQG55Y29wcG9ydHVuaXR5L3B0dHJuLXNjcmlwdHMvc3JjL2ljb25zL2ljb25zJztcbmltcG9ydCBUb2dnbGUgZnJvbSAnQG55Y29wcG9ydHVuaXR5L3B0dHJuLXNjcmlwdHMvc3JjL3RvZ2dsZS90b2dnbGUnO1xuaW1wb3J0IFRyYWNrIGZyb20gJ0BueWNvcHBvcnR1bml0eS9wdHRybi1zY3JpcHRzL3NyYy90cmFjay90cmFjayc7XG5cbmNvbnN0IGNkbiA9IENETl9CQVNFICsgQ0ROICsgJy8nO1xuXG5uZXcgSWNvbnMoJ3N2Zy9ueWNvLXBhdHRlcm5zLnN2ZycpOyAvLyBodHRwczovL2Nkbi5qc2RlbGl2ci5uZXQvZ2gvY2l0eW9mbmV3eW9yay9ueWNvLXBhdHRlcm5zQHYyLjYuOC9kaXN0L3N2Zy9pY29ucy5zdmdcbm5ldyBJY29ucygnc3ZnL2FjY2Vzcy1wYXR0ZXJucy5zdmcnKTsgLy8gaHR0cHM6Ly9jZG4uanNkZWxpdnIubmV0L2doL2NpdHlvZm5ld3lvcmsvYWNjZXNzLW55Yy1wYXR0ZXJuc0B2MC4xNS4xNC9kaXN0L3N2Zy9pY29ucy5zdmdcbm5ldyBJY29ucygnc3ZnL2ZlYXRoZXIuc3ZnJyk7XG5cbm5ldyBUb2dnbGUoKTtcbm5ldyBUcmFjaygpO1xuXG5pZiAoKHdpbmRvdy5sb2NhdGlvbi5wYXRobmFtZS5pbmRleE9mKCdlbmRwb2ludHMnKSA+PSAwKSlcbiAgc3dhZ2dlcihjZG4pO1xuXG5pZiAoKHdpbmRvdy5sb2NhdGlvbi5wYXRobmFtZS5pbmRleE9mKCdmb3JtJykgPj0gMCkpXG4gIHJlcXVlc3RGb3JtKCk7XG5cbmlmICgod2luZG93LmxvY2F0aW9uLnBhdGhuYW1lLmluZGV4T2YoJ3JlcXVlc3QtYnVpbGRlcicpID49IDApKVxuICByZXF1ZXN0Rm9ybUpTT04oKTtcblxuaWYgKCh3aW5kb3cubG9jYXRpb24ucGF0aG5hbWUuaW5kZXhPZignYnVsay1zdWJtaXNzaW9uJykgPj0gMCkpXG4gIGJ1bGtTdWJtaXNzaW9uKCk7XG5cbmlmICgod2luZG93LmxvY2F0aW9uLnBhdGhuYW1lLmluZGV4T2YoJ2NoYW5nZS1wYXNzd29yZCcpID49IDApKVxuICBjaGFuZ2VQYXNzd29yZCgpO1xuXG4vLyBHZXQgdGhlIGNvbnRlbnQgbWFya2Rvd24gZnJvbSBDRE4gYW5kIGFwcGVuZFxubGV0IG1hcmtkb3ducyA9ICQoJ2JvZHknKS5maW5kKCdbaWRePVwibWFya2Rvd25cIl0nKTtcblxubWFya2Rvd25zLmVhY2goZnVuY3Rpb24oKSB7XG4gIGxldCB0YXJnZXQgPSAkKHRoaXMpO1xuICBsZXQgZmlsZSA9ICQodGhpcykuYXR0cignaWQnKS5yZXBsYWNlKCdtYXJrZG93bi0nLCAnJyk7XG5cbiAgJC5nZXQoY2RuICsgZmlsZSArICcubWQnLCBmdW5jdGlvbihkYXRhKSB7XG4gICAgc2hvd2Rvd24uc2V0Rmxhdm9yKCdnaXRodWInKTtcblxuICAgIGxldCBjb252ZXJ0ZXIgPSBuZXcgc2hvd2Rvd24uQ29udmVydGVyKHt0YWJsZXM6IHRydWV9KTtcbiAgICBsZXQgaHRtbCA9IGNvbnZlcnRlci5tYWtlSHRtbChkYXRhKTtcblxuICAgIHRhcmdldC5hcHBlbmQoaHRtbClcbiAgICAgIC5oaWRlKClcbiAgICAgIC5mYWRlSW4oMjUwKVxuXG4gIH0sICd0ZXh0Jylcbn0pO1xuIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7OztFQUFBLENBQUMsU0FBUyxHQUFHLEVBQUU7RUFDZixF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
