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
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoic291cmNlLmpzIiwic291cmNlcyI6WyIuLi8uLi9zcmMvanMvbW9kdWxlcy9wb2x5ZmlsbC1yZW1vdmUuanMiLCIuLi8uLi9zcmMvanMvbW9kdWxlcy9yZXNwb25zZXMuanMiLCIuLi8uLi9zcmMvanMvbW9kdWxlcy9zdWJtaXNzaW9uLmpzIiwiLi4vLi4vc3JjL2pzL21vZHVsZXMvc3dhZ2dlci5qcyIsIi4uLy4uL25vZGVfbW9kdWxlcy9Abnljb3Bwb3J0dW5pdHkvcHR0cm4tc2NyaXB0cy9zcmMvZm9ybXMvZm9ybXMuanMiLCIuLi8uLi9zcmMvanMvbW9kdWxlcy91dGlsLmpzIiwiLi4vLi4vc3JjL2pzL21vZHVsZXMvYnVsay1zdWJtaXNzaW9uLmpzIiwiLi4vLi4vc3JjL2pzL21vZHVsZXMvY2hhbmdlLXBhc3N3b3JkLmpzIiwiLi4vLi4vc3JjL2pzL21vZHVsZXMvcmVxdWVzdC1mb3JtLWpzb24uanMiLCIuLi8uLi9ub2RlX21vZHVsZXMvQG55Y29wcG9ydHVuaXR5L3B0dHJuLXNjcmlwdHMvc3JjL2ljb25zL2ljb25zLmpzIiwiLi4vLi4vbm9kZV9tb2R1bGVzL0BueWNvcHBvcnR1bml0eS9wdHRybi1zY3JpcHRzL3NyYy90b2dnbGUvdG9nZ2xlLmpzIiwiLi4vLi4vbm9kZV9tb2R1bGVzL0BueWNvcHBvcnR1bml0eS9wdHRybi1zY3JpcHRzL3NyYy90cmFjay90cmFjay5qcyIsIi4uLy4uL3NyYy9qcy9tYWluLmpzIl0sInNvdXJjZXNDb250ZW50IjpbIihmdW5jdGlvbihhcnIpIHtcbiAgYXJyLmZvckVhY2goZnVuY3Rpb24oaXRlbSkge1xuICAgIGlmIChpdGVtLmhhc093blByb3BlcnR5KCdyZW1vdmUnKSkge1xuICAgICAgcmV0dXJuO1xuICAgIH1cbiAgICBPYmplY3QuZGVmaW5lUHJvcGVydHkoaXRlbSwgJ3JlbW92ZScsIHtcbiAgICAgIGNvbmZpZ3VyYWJsZTogdHJ1ZSxcbiAgICAgIGVudW1lcmFibGU6IHRydWUsXG4gICAgICB3cml0YWJsZTogdHJ1ZSxcbiAgICAgIHZhbHVlOiBmdW5jdGlvbiByZW1vdmUoKSB7XG4gICAgICAgIGlmICh0aGlzLnBhcmVudE5vZGUgIT09IG51bGwpXG4gICAgICAgICAgdGhpcy5wYXJlbnROb2RlLnJlbW92ZUNoaWxkKHRoaXMpO1xuICAgICAgfVxuICAgIH0pO1xuICB9KTtcbn0pKFtcbiAgRWxlbWVudC5wcm90b3R5cGUsXG4gIENoYXJhY3RlckRhdGEucHJvdG90eXBlLFxuICBEb2N1bWVudFR5cGUucHJvdG90eXBlXG5dKTsiLCJleHBvcnQgZGVmYXVsdCBbXG4gIHtcbiAgICBcIkVNQUlMXCI6IFwiUGxlYXNlIGVudGVyIGEgdmFsaWQgZW1haWwuXCJcbiAgfSxcbiAge1xuICAgIFwiRk5BTUVcIjogXCJQbGVhc2UgZW50ZXIgeW91ciBmaXJzdCBuYW1lLlwiXG4gIH0sXG4gIHtcbiAgICBcIkxOQU1FXCI6IFwiUGxlYXNlIGVudGVyIHlvdXIgbGFzdCBuYW1lLlwiXG4gIH0sXG4gIHtcbiAgICBcIk9SR1wiOiBcIlBsZWFzZSBlbnRlciB5b3VyIG9yZ2FuaXphdGlvbi5cIlxuICB9LFxuICB7XG4gICAgXCJFUlJcIjogXCJUaGVyZSB3YXMgYSBwcm9ibGVtIHdpdGggeW91ciByZXF1ZXN0LiBQbGVhc2UgdHJ5IGFnYWluIGxhdGVyIG9yIHNlbmQgdXMgYSBtZXNzYWdlIGF0IDxhIGNsYXNzPVxcXCJ0ZXh0LXByaW1hcnktcmVkXFxcIiBocmVmPVxcXCJtYWlsdG86ZWxpZ2liaWxpdHlhcGlAbnljb3Bwb3J0dW5pdHkubnljLmdvdlxcXCI+ZWxpZ2liaWxpdHlhcGlAbnljb3Bwb3J0dW5pdHkubnljLmdvdjwvYT4uIFdlIHdpbGwgZ2V0IGJhY2sgdG8geW91IGFzIHNvb24gYXMgcG9zc2libGUhXCJcbiAgfSxcbiAge1xuICAgIFwiRVJSX0FMUkVBRFlfUkVRVUVTVEVEXCI6IFwiWW91IGhhdmUgYWxyZWFkeSBtYWRlIGEgcmVxdWVzdC4gSWYgeW91IGhhdmUgbm90IGhlYXJkIGJhY2sgZnJvbSB1cywgcGxlYXNlIHNlbmQgdXMgYSBtZXNzYWdlIGF0IDxhIGNsYXNzPVxcXCJ0ZXh0LXByaW1hcnktcmVkXFxcIiBocmVmPVxcXCJtYWlsdG86ZWxpZ2liaWxpdHlhcGlAbnljb3Bwb3J0dW5pdHkubnljLmdvdlxcXCI+ZWxpZ2liaWxpdHlhcGlAbnljb3Bwb3J0dW5pdHkubnljLmdvdjwvYT4uIFdlIHdpbGwgZ2V0IGJhY2sgdG8geW91IGFzIHNvb24gYXMgcG9zc2libGUhXCJcbiAgfSxcbiAge1xuICAgIFwiRVJSX1RPT19NQU5ZX1JFUVVFU1RTXCI6IFwiSXQgc2VlbXMgdGhhdCB5b3UgaGF2ZSBtYWRlIHRvbyBtYW55IHJlcXVlc3RzLiBQbGVhc2UgdHJ5IGFnYWluIGxhdGVyIG9yIHNlbmQgdXMgYSBtZXNzYWdlIGF0IDxhIGNsYXNzPVxcXCJ0ZXh0LXByaW1hcnktcmVkXFxcIiBocmVmPVxcXCJtYWlsdG86ZWxpZ2liaWxpdHlhcGlAbnljb3Bwb3J0dW5pdHkubnljLmdvdlxcXCI+ZWxpZ2liaWxpdHlhcGlAbnljb3Bwb3J0dW5pdHkubnljLmdvdjwvYT4uIFdlIHdpbGwgZ2V0IGJhY2sgdG8geW91IGFzIHNvb24gYXMgcG9zc2libGUhXCJcbiAgfSxcbiAge1xuICAgIFwiTVNHX1JFQ0FQVENIQVwiOiBcIlRoZXJlJ3Mgb25lIG1vcmUgc3RlcCFcIlxuICB9LFxuICB7XG4gICAgXCJTVUNDRVNTXCI6IFwiVGhhbmsgeW91ISBZb3VyIHJlcXVlc3Qgd2lsbCBiZSByZXZpZXdlZCB3aXRoIGNvbmZpcm1hdGlvbiB3aXRoaW4gMS0yIGJ1c2luZXNzIGRheXMuXCJcbiAgfSxcbiAge1xuICAgIFwiR2VuZXJhbFwiOiB7XG4gICAgICBcImVycm9yXCI6IFwiUGxlYXNlIHJlc29sdmUgaGlnaGxpZ2h0ZWQgZmllbGRzLlwiLFxuICAgICAgXCJ3YXJuaW5nXCI6IFwiUmVzb2x2aW5nIHRoZSBmb2xsb3dpbmcgbWlnaHQgZ2VuZXJhdGUgZGlmZmVyZW50IHNjcmVlbmluZyByZXN1bHRzIGZvciB0aGlzIGhvdXNlaG9sZCAob3B0aW9uYWwpOlwiXG4gICAgfVxuICB9LFxuICB7XG4gICAgXCJIb3VzZWhvbGRcIjoge1xuICAgICAgXCJlcnJfZXhjZXNzX21lbWJlcnNcIjogXCJIb3VzZWhvbGQ6IFRoZSBudW1iZXIgb2YgaG91c2Vob2xkIG1lbWJlcnMgbXVzdCBiZSBiZXR3ZWVuIDEgYW5kIDggbWVtYmVycy5cIixcbiAgICAgIFwid2FybmluZ19yZW50YWxfdHlwZVwiOiBcIkhvdXNlaG9sZDogVGhlcmUgc2hvdWxkIGJlIGEgcmVudGFsIHR5cGUuXCJcbiAgICB9XG4gIH0sXG4gIHtcbiAgICBcIlBlcnNvblwiOiB7XG4gICAgICBcImVycl9udW1fcGVyc29uc1wiOiBcIlBlcnNvbjogVGhlIG51bWJlciBvZiBwZXJzb25zIGNhbm5vdCBleGNlZWQgOCBtZW1iZXJzXCIsXG4gICAgICBcImVycl9ob2hcIjogXCJQZXJzb246IEV4YWN0bHkgb25lIHBlcnNvbiBtdXN0IGJlIHRoZSBoZWFkIG9mIGhvdXNlaG9sZC5cIixcbiAgICAgIFwid2FybmluZ19vbl9sZWFzZVwiOiBcIlBlcnNvbjogQXQgbGVhc3Qgb25lIHBlcnNvbiBzaG91bGQgYmUgb24gdGhlIGxlYXNlLlwiLFxuICAgICAgXCJ3YXJuaW5nX29uX2RlZWRcIjogXCJQZXJzb246IEF0IGxlYXN0IG9uZSBwZXJzb24gc2hvdWxkIGJlIG9uIHRoZSBkZWVkLlwiXG4gICAgfVxuICB9XG5dXG4iLCJpbXBvcnQgcmVzcG9uc2VzIGZyb20gJy4vcmVzcG9uc2VzLmpzJztcblxuZXhwb3J0IGRlZmF1bHQgZnVuY3Rpb24oKSB7XG4gIGNvbnN0IGVycm9yTXNnID0gJ1BsZWFzZSBlbnRlciB5b3VyIGZpcnN0IG5hbWUsIGxhc3QgbmFtZSwgZW1haWwgYW5kIG9yZ2FuaXphdGlvbi4nO1xuXG4gIC8qKlxuICAqIFZhbGlkYXRlIGZvcm0gZmllbGRzXG4gICogQHBhcmFtIHtvYmplY3R9IGZvcm1EYXRhIC0gZm9ybSBmaWVsZHNcbiAgKiBAcGFyYW0ge29iamVjdH0gZXZlbnQgLSBldmVudCBvYmplY3RcbiAgKi9cbiAgZnVuY3Rpb24gdmFsaWRhdGVGaWVsZHMoZm9ybSwgZXZlbnQpIHtcbiAgICBldmVudC5wcmV2ZW50RGVmYXVsdCgpO1xuXG4gICAgY29uc3QgZmllbGRzID0gZm9ybS5zZXJpYWxpemVBcnJheSgpLnJlZHVjZSgob2JqLCBpdGVtKSA9PiAob2JqW2l0ZW0ubmFtZV0gPSBpdGVtLnZhbHVlLCBvYmopICx7fSlcbiAgICBjb25zdCByZXF1aXJlZEZpZWxkcyA9IGZvcm0uZmluZCgnW3JlcXVpcmVkXScpO1xuICAgIGNvbnN0IGVtYWlsUmVnZXggPSBuZXcgUmVnRXhwKC9cXFMrQFxcUytcXC5cXFMrLyk7XG4gICAgbGV0IGhhc0Vycm9ycyA9IGZhbHNlO1xuXG4gICAgLy8gbG9vcCB0aHJvdWdoIGVhY2ggcmVxdWlyZWQgZmllbGRcbiAgICByZXF1aXJlZEZpZWxkcy5lYWNoKGZ1bmN0aW9uKCkge1xuICAgICAgY29uc3QgZmllbGROYW1lID0gJCh0aGlzKS5hdHRyKCduYW1lJyk7XG5cbiAgICAgIGlmKCAhZmllbGRzW2ZpZWxkTmFtZV0gfHxcbiAgICAgICAgKGZpZWxkTmFtZSA9PSAnRU1BSUwnICYmICFlbWFpbFJlZ2V4LnRlc3QoZmllbGRzLkVNQUlMKSkgKSB7XG4gICAgICAgIGhhc0Vycm9ycyA9IHRydWU7XG4gICAgICAgICQodGhpcykuYWRkQ2xhc3MoJ2lzLWVycm9yJyk7XG4gICAgICAgICQodGhpcykuYWRkQ2xhc3MoJ2JvcmRlci1wcmltYXJ5LXJlZCcpO1xuICAgICAgICAkKHRoaXMpLmJlZm9yZSgnPHAgY2xhc3M9XCJpcy1lcnJvciB0ZXh0LXByaW1hcnktcmVkIHRleHQtc21hbGwgbXktMFwiPicrIHJlc3BvbnNlcy5maW5kKHggPT4geFtmaWVsZE5hbWVdKVtmaWVsZE5hbWVdICsgJzwvcD4nKTtcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgICQodGhpcykucmVtb3ZlQ2xhc3MoJ2JvcmRlci1wcmltYXJ5LXJlZCcpO1xuICAgICAgfVxuICAgIH0pO1xuXG4gICAgLy8gaWYgdGhlcmUgYXJlIG5vIGVycm9ycywgc3VibWl0XG4gICAgaWYgKGhhc0Vycm9ycykge1xuICAgICAgZm9ybS5maW5kKCcuZm9ybS1lcnJvcicpLmh0bWwoYDxwPiR7ZXJyb3JNc2d9PC9wPmApO1xuICAgIH0gZWxzZSB7XG4gICAgICBzdWJtaXRTaWdudXAoZm9ybSwgZmllbGRzKTtcbiAgICB9XG4gIH1cblxuICAvKipcbiAgKiBTdWJtaXRzIHRoZSBmb3JtIG9iamVjdCB0byBNYWlsY2hpbXBcbiAgKiBAcGFyYW0ge29iamVjdH0gZm9ybURhdGEgLSBmb3JtIGZpZWxkc1xuICAqL1xuICBmdW5jdGlvbiBzdWJtaXRTaWdudXAoZm9ybSwgZm9ybURhdGEpe1xuICAgICQuYWpheCh7XG4gICAgICB1cmw6IGZvcm0uYXR0cignYWN0aW9uJyksXG4gICAgICB0eXBlOiBmb3JtLmF0dHIoJ21ldGhvZCcpLFxuICAgICAgZGF0YVR5cGU6ICdqc29uJywvL25vIGpzb25wXG4gICAgICBjYWNoZTogZmFsc2UsXG4gICAgICBkYXRhOiBmb3JtRGF0YSxcbiAgICAgIGNvbnRlbnRUeXBlOiBcImFwcGxpY2F0aW9uL2pzb247IGNoYXJzZXQ9dXRmLThcIixcbiAgICAgIHN1Y2Nlc3M6IGZ1bmN0aW9uKHJlc3BvbnNlKSB7XG4gICAgICAgIGlmKHJlc3BvbnNlLnJlc3VsdCAhPT0gJ3N1Y2Nlc3MnKXtcbiAgICAgICAgICAgIGlmKHJlc3BvbnNlLm1zZy5pbmNsdWRlcygnYWxyZWFkeSBzdWJzY3JpYmVkJykpe1xuICAgICAgICAgICAgICBmb3JtLmh0bWwoJzxwIGNsYXNzPVwidGV4dC1wcmltYXJ5LXJlZCB0ZXh0LWNlbnRlciBpdGFsaWNcIj4nKyByZXNwb25zZXMuZmluZCh4ID0+IHhbXCJFUlJfQUxSRUFEWV9SRVFVRVNURURcIl0pW1wiRVJSX0FMUkVBRFlfUkVRVUVTVEVEXCJdICsgJzwvcD4nKTtcbiAgICAgICAgICAgIH0gZWxzZSBpZihyZXNwb25zZS5tc2cuaW5jbHVkZXMoJ3RvbyBtYW55IHJlY2VudCBzaWdudXAgcmVxdWVzdHMnKSl7XG4gICAgICAgICAgICAgIGZvcm0uaHRtbCgnPHAgY2xhc3M9XCJ0ZXh0LXByaW1hcnktcmVkIHRleHQtY2VudGVyIGl0YWxpY1wiPicrIHJlc3BvbnNlcy5maW5kKHggPT4geFtcIkVSUl9UT09fTUFOWV9SRVFVRVNUU1wiXSlbXCJFUlJfVE9PX01BTllfUkVRVUVTVFNcIl0gKyc8L3A+Jyk7XG4gICAgICAgICAgICB9IGVsc2UgaWYocmVzcG9uc2UubXNnLmluY2x1ZGVzKCdjYXB0Y2hhJykpe1xuICAgICAgICAgICAgICB2YXIgdXJsID0gJChcImZvcm0jbWMtZW1iZWRkZWQtc3Vic2NyaWJlLWZvcm1cIikuYXR0cihcImFjdGlvblwiKTtcbiAgICAgICAgICAgICAgdmFyIHBhcmFtZXRlcnMgPSAkLnBhcmFtKHJlc3BvbnNlLnBhcmFtcyk7XG4gICAgICAgICAgICAgIHVybCA9IHVybC5zcGxpdChcIi1qc29uP1wiKVswXTtcbiAgICAgICAgICAgICAgdXJsICs9IFwiP1wiO1xuICAgICAgICAgICAgICB1cmwgKz0gcGFyYW1ldGVycztcbiAgICAgICAgICAgICAgd2luZG93Lm9wZW4odXJsLCAnX2JsYW5rJyk7XG4gICAgICAgICAgICAgIGZvcm0uaHRtbCgnPHAgY2xhc3M9XCJ0ZXh0LXByaW1hcnktbmF2eSB0ZXh0LWNlbnRlciBpdGFsaWNcIj4nKyByZXNwb25zZXMuZmluZCh4ID0+IHhbXCJNU0dfUkVDQVBUQ0hBXCJdKVtcIk1TR19SRUNBUFRDSEFcIl0gKyc8YSBjbGFzcz1cInRleHQtcHJpbWFyeS1yZWRcIiB0YXJnZXQ9XCJfYmxhbmtcIiBocmVmPVwiJyArIHVybCArICdcIj4gUGxlYXNlIGNvbmZpcm0gdGhhdCB5b3UgYXJlIG5vdCBhIHJvYm90LjwvYT48L3A+Jyk7XG4gICAgICAgICAgICB9ZWxzZSB7XG4gICAgICAgICAgICAgIGZvcm0uaHRtbCgnPHAgY2xhc3M9XCJ0ZXh0LXByaW1hcnktcmVkIHRleHQtY2VudGVyIGl0YWxpY1wiPicgKyByZXNwb25zZXMuZmluZCh4ID0+IHhbXCJFUlJcIl0pW1wiRVJSXCJdICsgJzwvcD4nKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfWVsc2Uge1xuICAgICAgICAgIGZvcm0uaHRtbCgnPHAgY2xhc3M9XCJ0ZXh0LXByaW1hcnktbmF2eSB0ZXh0LWNlbnRlciBpdGFsaWNcIj4nKyByZXNwb25zZXMuZmluZCh4ID0+IHhbXCJTVUNDRVNTXCJdKVtcIlNVQ0NFU1NcIl0gKyc8L3A+Jyk7XG4gICAgICAgIH1cbiAgICAgIH0sXG4gICAgICBlcnJvcjogZnVuY3Rpb24ocmVzcG9uc2UpIHtcbiAgICAgICAgY29uc29sZS5sb2cocmVzcG9uc2UpXG4gICAgICAgIGZvcm0uYmVmb3JlKCc8cCBjbGFzcz1cInRleHQtcHJpbWFyeS1yZWQgdGV4dC1jZW50ZXIgaXRhbGljXCI+JyArIHJlc3BvbnNlcy5maW5kKHggPT4geFtcIkVSUlwiXSlbXCJFUlJcIl0gKyAnPC9wPicpO1xuICAgICAgfVxuICAgIH0pO1xuICB9XG5cbiAgLyoqXG4gICogVHJpZ2dlcnMgZm9ybSB2YWxpZGF0aW9uIGFuZCBzZW5kcyB0aGUgZm9ybSBkYXRhIHRvIE1haWxjaGltcFxuICAqIEBwYXJhbSB7b2JqZWN0fSBmb3JtRGF0YSAtIGZvcm0gZmllbGRzXG4gICovXG4gICQoJyNtYy1lbWJlZGRlZC1zdWJzY3JpYmU6YnV0dG9uW3R5cGU9XCJzdWJtaXRcIl0nKS5jbGljayhmdW5jdGlvbihldmVudCl7XG4gICAgZXZlbnQucHJldmVudERlZmF1bHQoKTtcbiAgICBsZXQgJGZvcm0gPSAkKHRoaXMpLnBhcmVudHMoJ2Zvcm0nKTtcbiAgICB2YWxpZGF0ZUZpZWxkcygkZm9ybSwgZXZlbnQpO1xuICB9KTtcblxufVxuIiwiZXhwb3J0IGRlZmF1bHQgZnVuY3Rpb24oY2RuKSB7XG4gIGNvbnN0IGNvbnRyb2xsZXIgPSBuZXcgQWJvcnRDb250cm9sbGVyKClcblxuICB3aW5kb3cuZWRpdG9yID0gU3dhZ2dlckVkaXRvckJ1bmRsZSh7XG4gICAgZG9tX2lkOiAnI3N3YWdnZXItZWRpdG9yJyxcbiAgICB1cmw6IGNkbiArICdlbmRwb2ludHMueW1sJ1xuICB9KTtcblxuICAkKCcuU3BsaXRQYW5lJykuY3NzKCdwb3NpdGlvbicsICdyZWxhdGl2ZScpO1xuICAkKCcuUGFuZTEnKS5jc3MoJ2Rpc3BsYXknLCAnbm9uZScpO1xuICAkKCcuUGFuZTInKS5jc3MoJ3dpZHRoJywgJzEwMCUnKTtcblxuICAvLyBnZW5lcmF0ZSBjdXJsIGNvbW1hbmQgdG8gdHJ5IGl0IG91dFxuICAkKCdib2R5Jykub24oJ2NsaWNrJywgJy50cnktb3V0X19idG4nLCBmdW5jdGlvbihldmVudCl7XG4gICAgZ2VuZXJhdGVDdXJsKHRoaXMpXG4gIH0pXG5cbiAgJCgnYm9keScpLm9uKCdrZXl1cCcsICdbcGxhY2Vob2xkZXJePWludGVyZXN0ZWRQcm9ncmFtc10nLCBmdW5jdGlvbihldmVudCl7XG4gICAgZ2VuZXJhdGVDdXJsKHRoaXMpO1xuICB9KVxuXG4gICQoJ2JvZHknKS5vbigna2V5dXAnLCAnW3BsYWNlaG9sZGVyXj1BdXRob3JpemF0aW9uXScsIGZ1bmN0aW9uKGV2ZW50KXtcbiAgICBnZW5lcmF0ZUN1cmwodGhpcyk7XG4gIH0pXG5cbiAgJCgnYm9keScpLm9uKCdrZXl1cCcsICdbY2xhc3NePWJvZHktcGFyYW1fX3RleHRdJywgZnVuY3Rpb24oZXZlbnQpe1xuICAgIGdlbmVyYXRlQ3VybCh0aGlzKTtcbiAgfSlcblxuICAkKCdib2R5Jykub24oJ2NoYW5nZScsICdbdHlwZV49ZmlsZV0nLCBmdW5jdGlvbihldmVudCl7XG4gICAgZ2VuZXJhdGVDdXJsKHRoaXMpO1xuICB9KVxuXG4gIC8vICQoJyNzd2FnZ2VyLWVkaXRvcicpLmZhZGVJbigyNTAwKVxuXG4gIGZ1bmN0aW9uIGdlbmVyYXRlQ3VybChvYmopIHtcbiAgICBjb25zdCBkb21haW4gPSAkKCdib2R5JykuZmluZCgnLnNlcnZlcnMgOnNlbGVjdGVkJykudGV4dCgpO1xuICAgIGNvbnN0IGVwX2lkID0gJChvYmopLnBhcmVudHMoJy5vcGJsb2NrLXBvc3Q6Zmlyc3QnKS5hdHRyKCdpZCcpO1xuICAgIGNvbnN0IGVwID0gdXRpbC5mb3JtYXQoXCIvJXNcIiwgZXBfaWQuc3Vic3RyKGVwX2lkLmluZGV4T2YoXCJfXCIpICsgMSkucmVwbGFjZShcIl9cIiwgXCIvXCIpKTtcbiAgICBjb25zdCBwYXJfbm9kZSA9ICQob2JqKS5wYXJlbnRzKCcub3BibG9jay1ib2R5OmZpcnN0Jyk7XG4gICAgY29uc3QgZXhhbXBsZUJvZHkgPSBwYXJfbm9kZS5maW5kKCcuYm9keS1wYXJhbV9fZXhhbXBsZScpO1xuICAgIGNvbnN0IHRleHRCb2R5ID0gZXhhbXBsZUJvZHkubGVuZ3RoID4gMCA/IGV4YW1wbGVCb2R5LnRleHQoKSA6IHBhcl9ub2RlLmZpbmQoJy5ib2R5LXBhcmFtX190ZXh0JykudGV4dCgpXG4gICAgY29uc3QgcGFyYW1zID0gdGV4dEJvZHkucmVwbGFjZSgvXFxzL2csJycpO1xuXG4gICAgcGFyX25vZGUuZmluZCgnLmN1cmwnKS5yZW1vdmUoKTtcbiAgICBwYXJfbm9kZS5maW5kKCcuZXhlY3V0ZS13cmFwcGVyJykuYXBwZW5kKGA8cCBjbGFzcz1cImN1cmxcIj5Vc2UgdGhlIGZvbGxvd2luZyBjb21tYW5kIHRvIG1ha2UgYSByZXF1ZXN0IHRvIHRoZSA8c3Ryb25nPiR7ZXB9PC9zdHJvbmc+IGVuZHBvaW50IGJhc2VkIG9uIHRoZSBkYXRhIHNldCBhYm92ZTo8L3A+YCk7XG5cbiAgICBjb25zdCBhdXRoVmFsID0gcGFyX25vZGUuZmluZCgnW3BsYWNlaG9sZGVyXj1BdXRob3JpemF0aW9uXScpLnZhbCgpO1xuICAgIGNvbnN0IGludGVyZXN0ZWRQcm9ncmFtc1ZhbCA9IHBhcl9ub2RlLmZpbmQoJ1twbGFjZWhvbGRlcl49aW50ZXJlc3RlZFByb2dyYW1zXScpLnZhbCgpO1xuICAgIGNvbnN0IHF1ZXJ5ID0gaW50ZXJlc3RlZFByb2dyYW1zVmFsID8gYD9pbnRlcmVzdGVkUHJvZ3JhbXM9JHtpbnRlcmVzdGVkUHJvZ3JhbXNWYWx9YCA6IFwiXCJcbiAgICBpZiAoZXBfaWQuaW5jbHVkZXMoJ0F1dGhlbnRpY2F0aW9uJykpIHtcbiAgICAgIGNvbnN0IGF1dGhlbnRpY2F0aW9uQ3VybCA9IGBjdXJsIC1YIFBPU1QgXCIke2RvbWFpbn0ke2VwfVwiIFxcXG4gICAgICAgIC1IICBcImFjY2VwdDogYXBwbGljYXRpb24vanNvblwiIFxcXG4gICAgICAgIC1IICBcIkNvbnRlbnQtVHlwZTogYXBwbGljYXRpb24vanNvblwiIFxcXG4gICAgICAgIC1kIFxcJyR7cGFyYW1zfVxcJ2A7XG4gICAgICBwYXJfbm9kZS5maW5kKCcuZXhlY3V0ZS13cmFwcGVyJykuYXBwZW5kKGA8dGV4dGFyZWEgcmVhZG9ubHk9XCJcIiBjbGFzcz1cImN1cmxcIiBzdHlsZT1cIndoaXRlLXNwYWNlOiBub3JtYWw7XCI+JHthdXRoZW50aWNhdGlvbkN1cmx9PC90ZXh0YXJlYT5gKTtcbiAgICB9IGVsc2UgaWYgKGVwX2lkLmluY2x1ZGVzKCdlbGlnaWJpbGl0eVByb2dyYW1zJykpe1xuICAgICAgY29uc3QgZWxpZ2liaWxpdHlQcm9ncmFtc0N1cmwgPSBgY3VybCAtWCBQT1NUIFwiJHtkb21haW59JHtlcH0ke3F1ZXJ5fVwiIFxcXG4gICAgICAgIC1IIFwiYWNjZXB0OiBhcHBsaWNhdGlvbi9qc29uXCIgXFxcbiAgICAgICAgLUggXCJDb250ZW50LVR5cGU6IGFwcGxpY2F0aW9uL2pzb25cIiBcXFxuICAgICAgICAtSCBcIkF1dGhvcml6YXRpb246ICR7YXV0aFZhbH1cIlxcXG4gICAgICAgIC1kIFxcJyR7cGFyYW1zfVxcJ2A7XG4gICAgICBwYXJfbm9kZS5maW5kKCcuZXhlY3V0ZS13cmFwcGVyJykuYXBwZW5kKGA8dGV4dGFyZWEgcmVhZG9ubHk9XCJcIiBjbGFzcz1cImN1cmxcIiBzdHlsZT1cIndoaXRlLXNwYWNlOiBub3JtYWw7XCI+JHtlbGlnaWJpbGl0eVByb2dyYW1zQ3VybH08L3RleHRhcmVhPmApO1xuICAgIH0gZWxzZSBpZiAoZXBfaWQuaW5jbHVkZXMoJ2J1bGtTdWJtaXNzaW9uJykpIHtcbiAgICAgIGNvbnN0IGlucHV0UGF0aCA9IHBhcl9ub2RlLmZpbmQoJ1t0eXBlXj1maWxlXScpLnZhbCgpO1xuICAgICAgY29uc3QgYnVsa1N1Ym1pc3Npb25DdXJsID0gYGN1cmwgLVggUE9TVCBcIiR7ZG9tYWlufSR7ZXB9JHtxdWVyeX1cIiBcXFxuICAgICAgICAtSCBcImFjY2VwdDogbXVsdGlwYXJ0L2Zvcm0tZGF0YVwiIFxcXG4gICAgICAgIC1IIFwiQ29udGVudC1UeXBlOiBtdWx0aXBhcnQvZm9ybS1kYXRhXCIgXFxcbiAgICAgICAgLUggXCJBdXRob3JpemF0aW9uOiAke2F1dGhWYWx9XCJcXFxuICAgICAgICAtRiBcIj1AJHtpbnB1dFBhdGh9O3R5cGU9dGV4dC9jc3ZcImA7XG4gICAgICBwYXJfbm9kZS5maW5kKCcuZXhlY3V0ZS13cmFwcGVyJykuYXBwZW5kKGA8dGV4dGFyZWEgcmVhZG9ubHk9XCJcIiBjbGFzcz1cImN1cmxcIiBzdHlsZT1cIndoaXRlLXNwYWNlOiBub3JtYWw7XCI+JHtidWxrU3VibWlzc2lvbkN1cmx9PC90ZXh0YXJlYT5gKTtcbiAgICB9XG4gIH1cbn1cbiIsIid1c2Ugc3RyaWN0JztcblxuLyoqXG4gKiBVdGlsaXRpZXMgZm9yIEZvcm0gY29tcG9uZW50c1xuICogQGNsYXNzXG4gKi9cbmNsYXNzIEZvcm1zIHtcbiAgLyoqXG4gICAqIFRoZSBGb3JtIGNvbnN0cnVjdG9yXG4gICAqIEBwYXJhbSAge09iamVjdH0gZm9ybSBUaGUgZm9ybSBET00gZWxlbWVudFxuICAgKi9cbiAgY29uc3RydWN0b3IoZm9ybSA9IGZhbHNlKSB7XG4gICAgdGhpcy5GT1JNID0gZm9ybTtcblxuICAgIHRoaXMuc3RyaW5ncyA9IEZvcm1zLnN0cmluZ3M7XG5cbiAgICB0aGlzLnN1Ym1pdCA9IEZvcm1zLnN1Ym1pdDtcblxuICAgIHRoaXMuY2xhc3NlcyA9IEZvcm1zLmNsYXNzZXM7XG5cbiAgICB0aGlzLm1hcmt1cCA9IEZvcm1zLm1hcmt1cDtcblxuICAgIHRoaXMuc2VsZWN0b3JzID0gRm9ybXMuc2VsZWN0b3JzO1xuXG4gICAgdGhpcy5hdHRycyA9IEZvcm1zLmF0dHJzO1xuXG4gICAgdGhpcy5GT1JNLnNldEF0dHJpYnV0ZSgnbm92YWxpZGF0ZScsIHRydWUpO1xuXG4gICAgcmV0dXJuIHRoaXM7XG4gIH1cblxuICAvKipcbiAgICogTWFwIHRvZ2dsZWQgY2hlY2tib3ggdmFsdWVzIHRvIGFuIGlucHV0LlxuICAgKiBAcGFyYW0gIHtPYmplY3R9IGV2ZW50IFRoZSBwYXJlbnQgY2xpY2sgZXZlbnQuXG4gICAqIEByZXR1cm4ge0VsZW1lbnR9ICAgICAgVGhlIHRhcmdldCBlbGVtZW50LlxuICAgKi9cbiAgam9pblZhbHVlcyhldmVudCkge1xuICAgIGlmICghZXZlbnQudGFyZ2V0Lm1hdGNoZXMoJ2lucHV0W3R5cGU9XCJjaGVja2JveFwiXScpKVxuICAgICAgcmV0dXJuO1xuXG4gICAgaWYgKCFldmVudC50YXJnZXQuY2xvc2VzdCgnW2RhdGEtanMtam9pbi12YWx1ZXNdJykpXG4gICAgICByZXR1cm47XG5cbiAgICBsZXQgZWwgPSBldmVudC50YXJnZXQuY2xvc2VzdCgnW2RhdGEtanMtam9pbi12YWx1ZXNdJyk7XG4gICAgbGV0IHRhcmdldCA9IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoZWwuZGF0YXNldC5qc0pvaW5WYWx1ZXMpO1xuXG4gICAgdGFyZ2V0LnZhbHVlID0gQXJyYXkuZnJvbShcbiAgICAgICAgZWwucXVlcnlTZWxlY3RvckFsbCgnaW5wdXRbdHlwZT1cImNoZWNrYm94XCJdJylcbiAgICAgIClcbiAgICAgIC5maWx0ZXIoKGUpID0+IChlLnZhbHVlICYmIGUuY2hlY2tlZCkpXG4gICAgICAubWFwKChlKSA9PiBlLnZhbHVlKVxuICAgICAgLmpvaW4oJywgJyk7XG5cbiAgICByZXR1cm4gdGFyZ2V0O1xuICB9XG5cbiAgLyoqXG4gICAqIEEgc2ltcGxlIGZvcm0gdmFsaWRhdGlvbiBjbGFzcyB0aGF0IHVzZXMgbmF0aXZlIGZvcm0gdmFsaWRhdGlvbi4gSXQgd2lsbFxuICAgKiBhZGQgYXBwcm9wcmlhdGUgZm9ybSBmZWVkYmFjayBmb3IgZWFjaCBpbnB1dCB0aGF0IGlzIGludmFsaWQgYW5kIG5hdGl2ZVxuICAgKiBsb2NhbGl6ZWQgYnJvd3NlciBtZXNzYWdpbmcuXG4gICAqXG4gICAqIFNlZSBodHRwczovL2RldmVsb3Blci5tb3ppbGxhLm9yZy9lbi1VUy9kb2NzL0xlYXJuL0hUTUwvRm9ybXMvRm9ybV92YWxpZGF0aW9uXG4gICAqIFNlZSBodHRwczovL2Nhbml1c2UuY29tLyNmZWF0PWZvcm0tdmFsaWRhdGlvbiBmb3Igc3VwcG9ydFxuICAgKlxuICAgKiBAcGFyYW0gIHtFdmVudH0gICAgICAgICBldmVudCBUaGUgZm9ybSBzdWJtaXNzaW9uIGV2ZW50XG4gICAqIEByZXR1cm4ge0NsYXNzL0Jvb2xlYW59ICAgICAgIFRoZSBmb3JtIGNsYXNzIG9yIGZhbHNlIGlmIGludmFsaWRcbiAgICovXG4gIHZhbGlkKGV2ZW50KSB7XG4gICAgbGV0IHZhbGlkaXR5ID0gZXZlbnQudGFyZ2V0LmNoZWNrVmFsaWRpdHkoKTtcbiAgICBsZXQgZWxlbWVudHMgPSBldmVudC50YXJnZXQucXVlcnlTZWxlY3RvckFsbCh0aGlzLnNlbGVjdG9ycy5SRVFVSVJFRCk7XG5cbiAgICBmb3IgKGxldCBpID0gMDsgaSA8IGVsZW1lbnRzLmxlbmd0aDsgaSsrKSB7XG4gICAgICAvLyBSZW1vdmUgb2xkIG1lc3NhZ2luZyBpZiBpdCBleGlzdHNcbiAgICAgIGxldCBlbCA9IGVsZW1lbnRzW2ldO1xuXG4gICAgICB0aGlzLnJlc2V0KGVsKTtcblxuICAgICAgLy8gSWYgdGhpcyBpbnB1dCB2YWxpZCwgc2tpcCBtZXNzYWdpbmdcbiAgICAgIGlmIChlbC52YWxpZGl0eS52YWxpZCkgY29udGludWU7XG5cbiAgICAgIHRoaXMuaGlnaGxpZ2h0KGVsKTtcbiAgICB9XG5cbiAgICByZXR1cm4gKHZhbGlkaXR5KSA/IHRoaXMgOiB2YWxpZGl0eTtcbiAgfVxuXG4gIC8qKlxuICAgKiBBZGRzIGZvY3VzIGFuZCBibHVyIGV2ZW50cyB0byBpbnB1dHMgd2l0aCByZXF1aXJlZCBhdHRyaWJ1dGVzXG4gICAqIEBwYXJhbSAgIHtvYmplY3R9ICBmb3JtICBQYXNzaW5nIGEgZm9ybSBpcyBwb3NzaWJsZSwgb3RoZXJ3aXNlIGl0IHdpbGwgdXNlXG4gICAqICAgICAgICAgICAgICAgICAgICAgICAgICB0aGUgZm9ybSBwYXNzZWQgdG8gdGhlIGNvbnN0cnVjdG9yLlxuICAgKiBAcmV0dXJuICB7Y2xhc3N9ICAgICAgICAgVGhlIGZvcm0gY2xhc3NcbiAgICovXG4gIHdhdGNoKGZvcm0gPSBmYWxzZSkge1xuICAgIHRoaXMuRk9STSA9IChmb3JtKSA/IGZvcm0gOiB0aGlzLkZPUk07XG5cbiAgICBsZXQgZWxlbWVudHMgPSB0aGlzLkZPUk0ucXVlcnlTZWxlY3RvckFsbCh0aGlzLnNlbGVjdG9ycy5SRVFVSVJFRCk7XG5cbiAgICAvKiogV2F0Y2ggSW5kaXZpZHVhbCBJbnB1dHMgKi9cbiAgICBmb3IgKGxldCBpID0gMDsgaSA8IGVsZW1lbnRzLmxlbmd0aDsgaSsrKSB7XG4gICAgICAvLyBSZW1vdmUgb2xkIG1lc3NhZ2luZyBpZiBpdCBleGlzdHNcbiAgICAgIGxldCBlbCA9IGVsZW1lbnRzW2ldO1xuXG4gICAgICBlbC5hZGRFdmVudExpc3RlbmVyKCdmb2N1cycsICgpID0+IHtcbiAgICAgICAgdGhpcy5yZXNldChlbCk7XG4gICAgICB9KTtcblxuICAgICAgZWwuYWRkRXZlbnRMaXN0ZW5lcignYmx1cicsICgpID0+IHtcbiAgICAgICAgaWYgKCFlbC52YWxpZGl0eS52YWxpZClcbiAgICAgICAgICB0aGlzLmhpZ2hsaWdodChlbCk7XG4gICAgICB9KTtcbiAgICB9XG5cbiAgICAvKiogU3VibWl0IEV2ZW50ICovXG4gICAgdGhpcy5GT1JNLmFkZEV2ZW50TGlzdGVuZXIoJ3N1Ym1pdCcsIChldmVudCkgPT4ge1xuICAgICAgZXZlbnQucHJldmVudERlZmF1bHQoKTtcblxuICAgICAgaWYgKHRoaXMudmFsaWQoZXZlbnQpID09PSBmYWxzZSlcbiAgICAgICAgcmV0dXJuIGZhbHNlO1xuXG4gICAgICB0aGlzLnN1Ym1pdChldmVudCk7XG4gICAgfSk7XG5cbiAgICByZXR1cm4gdGhpcztcbiAgfVxuXG4gIC8qKlxuICAgKiBSZW1vdmVzIHRoZSB2YWxpZGl0eSBtZXNzYWdlIGFuZCBjbGFzc2VzIGZyb20gdGhlIG1lc3NhZ2UuXG4gICAqIEBwYXJhbSAgIHtvYmplY3R9ICBlbCAgVGhlIGlucHV0IGVsZW1lbnRcbiAgICogQHJldHVybiAge2NsYXNzfSAgICAgICBUaGUgZm9ybSBjbGFzc1xuICAgKi9cbiAgcmVzZXQoZWwpIHtcbiAgICBsZXQgY29udGFpbmVyID0gKHRoaXMuc2VsZWN0b3JzLkVSUk9SX01FU1NBR0VfUEFSRU5UKVxuICAgICAgPyBlbC5jbG9zZXN0KHRoaXMuc2VsZWN0b3JzLkVSUk9SX01FU1NBR0VfUEFSRU5UKSA6IGVsLnBhcmVudE5vZGU7XG5cbiAgICBsZXQgbWVzc2FnZSA9IGNvbnRhaW5lci5xdWVyeVNlbGVjdG9yKCcuJyArIHRoaXMuY2xhc3Nlcy5FUlJPUl9NRVNTQUdFKTtcblxuICAgIC8vIFJlbW92ZSBvbGQgbWVzc2FnaW5nIGlmIGl0IGV4aXN0c1xuICAgIGNvbnRhaW5lci5jbGFzc0xpc3QucmVtb3ZlKHRoaXMuY2xhc3Nlcy5FUlJPUl9DT05UQUlORVIpO1xuICAgIGlmIChtZXNzYWdlKSBtZXNzYWdlLnJlbW92ZSgpO1xuXG4gICAgLy8gUmVtb3ZlIGVycm9yIGNsYXNzIGZyb20gdGhlIGZvcm1cbiAgICBjb250YWluZXIuY2xvc2VzdCgnZm9ybScpLmNsYXNzTGlzdC5yZW1vdmUodGhpcy5jbGFzc2VzLkVSUk9SX0NPTlRBSU5FUik7XG5cbiAgICAvLyBSZW1vdmUgZHluYW1pYyBhdHRyaWJ1dGVzIGZyb20gdGhlIGlucHV0XG4gICAgZWwucmVtb3ZlQXR0cmlidXRlKHRoaXMuYXR0cnMuRVJST1JfSU5QVVRbMF0pO1xuICAgIGVsLnJlbW92ZUF0dHJpYnV0ZSh0aGlzLmF0dHJzLkVSUk9SX0xBQkVMKTtcblxuICAgIHJldHVybiB0aGlzO1xuICB9XG5cbiAgLyoqXG4gICAqIERpc3BsYXlzIGEgdmFsaWRpdHkgbWVzc2FnZSB0byB0aGUgdXNlci4gSXQgd2lsbCBmaXJzdCB1c2UgYW55IGxvY2FsaXplZFxuICAgKiBzdHJpbmcgcGFzc2VkIHRvIHRoZSBjbGFzcyBmb3IgcmVxdWlyZWQgZmllbGRzIG1pc3NpbmcgaW5wdXQuIElmIHRoZVxuICAgKiBpbnB1dCBpcyBmaWxsZWQgaW4gYnV0IGRvZXNuJ3QgbWF0Y2ggdGhlIHJlcXVpcmVkIHBhdHRlcm4sIGl0IHdpbGwgdXNlXG4gICAqIGEgbG9jYWxpemVkIHN0cmluZyBzZXQgZm9yIHRoZSBzcGVjaWZpYyBpbnB1dCB0eXBlLiBJZiBvbmUgaXNuJ3QgcHJvdmlkZWRcbiAgICogaXQgd2lsbCB1c2UgdGhlIGRlZmF1bHQgYnJvd3NlciBwcm92aWRlZCBtZXNzYWdlLlxuICAgKiBAcGFyYW0gICB7b2JqZWN0fSAgZWwgIFRoZSBpbnZhbGlkIGlucHV0IGVsZW1lbnRcbiAgICogQHJldHVybiAge2NsYXNzfSAgICAgICBUaGUgZm9ybSBjbGFzc1xuICAgKi9cbiAgaGlnaGxpZ2h0KGVsKSB7XG4gICAgbGV0IGNvbnRhaW5lciA9ICh0aGlzLnNlbGVjdG9ycy5FUlJPUl9NRVNTQUdFX1BBUkVOVClcbiAgICAgID8gZWwuY2xvc2VzdCh0aGlzLnNlbGVjdG9ycy5FUlJPUl9NRVNTQUdFX1BBUkVOVCkgOiBlbC5wYXJlbnROb2RlO1xuXG4gICAgLy8gQ3JlYXRlIHRoZSBuZXcgZXJyb3IgbWVzc2FnZS5cbiAgICBsZXQgbWVzc2FnZSA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQodGhpcy5tYXJrdXAuRVJST1JfTUVTU0FHRSk7XG4gICAgbGV0IGlkID0gYCR7ZWwuZ2V0QXR0cmlidXRlKCdpZCcpfS0ke3RoaXMuY2xhc3Nlcy5FUlJPUl9NRVNTQUdFfWA7XG5cbiAgICAvLyBHZXQgdGhlIGVycm9yIG1lc3NhZ2UgZnJvbSBsb2NhbGl6ZWQgc3RyaW5ncyAoaWYgc2V0KS5cbiAgICBpZiAoZWwudmFsaWRpdHkudmFsdWVNaXNzaW5nICYmIHRoaXMuc3RyaW5ncy5WQUxJRF9SRVFVSVJFRClcbiAgICAgIG1lc3NhZ2UuaW5uZXJIVE1MID0gdGhpcy5zdHJpbmdzLlZBTElEX1JFUVVJUkVEO1xuICAgIGVsc2UgaWYgKCFlbC52YWxpZGl0eS52YWxpZCAmJlxuICAgICAgdGhpcy5zdHJpbmdzW2BWQUxJRF8ke2VsLnR5cGUudG9VcHBlckNhc2UoKX1fSU5WQUxJRGBdKSB7XG4gICAgICBsZXQgc3RyaW5nS2V5ID0gYFZBTElEXyR7ZWwudHlwZS50b1VwcGVyQ2FzZSgpfV9JTlZBTElEYDtcbiAgICAgIG1lc3NhZ2UuaW5uZXJIVE1MID0gdGhpcy5zdHJpbmdzW3N0cmluZ0tleV07XG4gICAgfSBlbHNlXG4gICAgICBtZXNzYWdlLmlubmVySFRNTCA9IGVsLnZhbGlkYXRpb25NZXNzYWdlO1xuXG4gICAgLy8gU2V0IGFyaWEgYXR0cmlidXRlcyBhbmQgY3NzIGNsYXNzZXMgdG8gdGhlIG1lc3NhZ2VcbiAgICBtZXNzYWdlLnNldEF0dHJpYnV0ZSgnaWQnLCBpZCk7XG4gICAgbWVzc2FnZS5zZXRBdHRyaWJ1dGUodGhpcy5hdHRycy5FUlJPUl9NRVNTQUdFWzBdLFxuICAgICAgdGhpcy5hdHRycy5FUlJPUl9NRVNTQUdFWzFdKTtcbiAgICBtZXNzYWdlLmNsYXNzTGlzdC5hZGQodGhpcy5jbGFzc2VzLkVSUk9SX01FU1NBR0UpO1xuXG4gICAgLy8gQWRkIHRoZSBlcnJvciBjbGFzcyBhbmQgZXJyb3IgbWVzc2FnZSB0byB0aGUgZG9tLlxuICAgIGNvbnRhaW5lci5jbGFzc0xpc3QuYWRkKHRoaXMuY2xhc3Nlcy5FUlJPUl9DT05UQUlORVIpO1xuICAgIGNvbnRhaW5lci5pbnNlcnRCZWZvcmUobWVzc2FnZSwgY29udGFpbmVyLmNoaWxkTm9kZXNbMF0pO1xuXG4gICAgLy8gQWRkIHRoZSBlcnJvciBjbGFzcyB0byB0aGUgZm9ybVxuICAgIGNvbnRhaW5lci5jbG9zZXN0KCdmb3JtJykuY2xhc3NMaXN0LmFkZCh0aGlzLmNsYXNzZXMuRVJST1JfQ09OVEFJTkVSKTtcblxuICAgIC8vIEFkZCBkeW5hbWljIGF0dHJpYnV0ZXMgdG8gdGhlIGlucHV0XG4gICAgZWwuc2V0QXR0cmlidXRlKHRoaXMuYXR0cnMuRVJST1JfSU5QVVRbMF0sIHRoaXMuYXR0cnMuRVJST1JfSU5QVVRbMV0pO1xuICAgIGVsLnNldEF0dHJpYnV0ZSh0aGlzLmF0dHJzLkVSUk9SX0xBQkVMLCBpZCk7XG5cbiAgICByZXR1cm4gdGhpcztcbiAgfVxufVxuXG4vKipcbiAqIEEgZGljdGlvbmFpcnkgb2Ygc3RyaW5ncyBpbiB0aGUgZm9ybWF0LlxuICoge1xuICogICAnVkFMSURfUkVRVUlSRUQnOiAnVGhpcyBpcyByZXF1aXJlZCcsXG4gKiAgICdWQUxJRF97eyBUWVBFIH19X0lOVkFMSUQnOiAnSW52YWxpZCdcbiAqIH1cbiAqL1xuRm9ybXMuc3RyaW5ncyA9IHt9O1xuXG4vKiogUGxhY2Vob2xkZXIgZm9yIHRoZSBzdWJtaXQgZnVuY3Rpb24gKi9cbkZvcm1zLnN1Ym1pdCA9IGZ1bmN0aW9uKCkge307XG5cbi8qKiBDbGFzc2VzIGZvciB2YXJpb3VzIGNvbnRhaW5lcnMgKi9cbkZvcm1zLmNsYXNzZXMgPSB7XG4gICdFUlJPUl9NRVNTQUdFJzogJ2Vycm9yLW1lc3NhZ2UnLCAvLyBlcnJvciBjbGFzcyBmb3IgdGhlIHZhbGlkaXR5IG1lc3NhZ2VcbiAgJ0VSUk9SX0NPTlRBSU5FUic6ICdlcnJvcicsIC8vIGNsYXNzIGZvciB0aGUgdmFsaWRpdHkgbWVzc2FnZSBwYXJlbnRcbiAgJ0VSUk9SX0ZPUk0nOiAnZXJyb3InXG59O1xuXG4vKiogSFRNTCB0YWdzIGFuZCBtYXJrdXAgZm9yIHZhcmlvdXMgZWxlbWVudHMgKi9cbkZvcm1zLm1hcmt1cCA9IHtcbiAgJ0VSUk9SX01FU1NBR0UnOiAnZGl2Jyxcbn07XG5cbi8qKiBET00gU2VsZWN0b3JzIGZvciB2YXJpb3VzIGVsZW1lbnRzICovXG5Gb3Jtcy5zZWxlY3RvcnMgPSB7XG4gICdSRVFVSVJFRCc6ICdbcmVxdWlyZWQ9XCJ0cnVlXCJdJywgLy8gU2VsZWN0b3IgZm9yIHJlcXVpcmVkIGlucHV0IGVsZW1lbnRzXG4gICdFUlJPUl9NRVNTQUdFX1BBUkVOVCc6IGZhbHNlXG59O1xuXG4vKiogQXR0cmlidXRlcyBmb3IgdmFyaW91cyBlbGVtZW50cyAqL1xuRm9ybXMuYXR0cnMgPSB7XG4gICdFUlJPUl9NRVNTQUdFJzogWydhcmlhLWxpdmUnLCAncG9saXRlJ10sIC8vIEF0dHJpYnV0ZSBmb3IgdmFsaWQgZXJyb3IgbWVzc2FnZVxuICAnRVJST1JfSU5QVVQnOiBbJ2FyaWEtaW52YWxpZCcsICd0cnVlJ10sXG4gICdFUlJPUl9MQUJFTCc6ICdhcmlhLWRlc2NyaWJlZGJ5J1xufTtcblxuZXhwb3J0IGRlZmF1bHQgRm9ybXM7XG4iLCJcbmNvbnN0IGVycm9yQm94SWQgPSAnZXJyb3JzJ1xuY29uc3QgaW5mb0JveElkID0gJ2luZm8nXG5cbmNvbnN0IHRvVGl0bGVDYXNlID0gKHN0cmluZykgPT4ge1xuICByZXR1cm4gc3RyaW5nLmNoYXJBdCgwKS50b1VwcGVyQ2FzZSgpICsgc3RyaW5nLnNsaWNlKDEpO1xufVxuXG5jb25zdCBzZXRUZXh0Qm94ID0gKG1lc3NhZ2VTdHJpbmcsIGRpc3BsYXlTdGF0ZSwgYm94SWQpID0+IHtcbiAgdmFyIGVsZSA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKGJveElkKTtcbiAgaWYgKGVsZSkge1xuICAgIGVsZS5pbm5lckhUTUwgPSAnPHVsIGNsYXNzPVwibS0wIHB4LTJcIj4nICtcbiAgICAgIHRvVGl0bGVDYXNlKG1lc3NhZ2VTdHJpbmcudHJpbSgpKSArICc8L3VsPic7XG5cbiAgICBlbGUuc3R5bGUuZGlzcGxheSA9IGRpc3BsYXlTdGF0ZTtcblxuICAgIGlmIChkaXNwbGF5U3RhdGUgPT09ICdub25lJykge1xuICAgICAgZWxlLnJlbW92ZUF0dHJpYnV0ZSgnYXJpYS1saXZlJywgJ3BvbGl0ZScpXG4gICAgICBlbGUuY2xhc3NMaXN0LnJlbW92ZSgnYW5pbWF0ZWQnKVxuICAgICAgZWxlLmNsYXNzTGlzdC5yZW1vdmUoJ2ZhZGVJblVwJylcbiAgICB9IGVsc2Uge1xuICAgICAgZWxlLnNldEF0dHJpYnV0ZSgnYXJpYS1saXZlJywgJ3BvbGl0ZScpXG4gICAgICBlbGUuY2xhc3NMaXN0LmFkZCgnYW5pbWF0ZWQnKVxuICAgICAgZWxlLmNsYXNzTGlzdC5hZGQoJ2ZhZGVJblVwJylcbiAgICB9XG4gIH1cbn1cblxuZXhwb3J0IGNvbnN0IHNlbmRQb3N0UmVxdWVzdCA9ICh1cmwsIGhlYWRlcnNPYmplY3QsIHJlc3BvbnNlSGFuZGxlciwgcmVxdWVzdFBheWxvYWQpID0+IHtcbiAgc2V0VGV4dEJveCgnJywgJ25vbmUnLCBlcnJvckJveElkKVxuICBzZXRUZXh0Qm94KCcnLCAnbm9uZScsIGluZm9Cb3hJZClcblxuICBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgnbG9hZGVyJykuc3R5bGUuZGlzcGxheSA9ICdibG9jaydcblxuICB2YXIgcmVxID0gbmV3IFhNTEh0dHBSZXF1ZXN0KClcblxuICByZXEub3BlbignUE9TVCcsIHVybCwgdHJ1ZSk7XG5cbiAgT2JqZWN0LmtleXMoaGVhZGVyc09iamVjdCkuZm9yRWFjaChmdW5jdGlvbihrZXkpIHtcbiAgICByZXEuc2V0UmVxdWVzdEhlYWRlcihrZXksIGhlYWRlcnNPYmplY3Rba2V5XSk7XG4gIH0pO1xuXG4gIHJlcS5vbnJlYWR5c3RhdGVjaGFuZ2UgPSBmdW5jdGlvbigpIHtcbiAgICBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgnbG9hZGVyJykuc3R5bGUuZGlzcGxheSA9ICdub25lJ1xuICAgIHJlc3BvbnNlSGFuZGxlcihyZXEpXG4gIH1cblxuICByZXEuc2VuZChyZXF1ZXN0UGF5bG9hZClcbn1cblxuY29uc3QgZGlzcGxheUxpc3RUZXh0ID0gKHJlc3BvbnNlVGV4dCwgc2hvd1BhdGgsIGlkKSA9PiB7XG5cbn1cblxuZXhwb3J0IGNvbnN0IGRpc3BsYXlFcnJvcnMgPSAocmVzcG9uc2VUZXh0LCBzaG93UGF0aCkgPT4ge1xuICB2YXIgZXJyb3JKU09OXG4gIHZhciBlcnJvcnNBcnJheSA9IFtdXG4gIHRyeSB7XG4gICAgZXJyb3JKU09OID0gSlNPTi5wYXJzZShyZXNwb25zZVRleHQpLmVycm9yc1xuICAgIGVycm9yc0FycmF5ID0gZXJyb3JKU09OLm1hcChmdW5jdGlvbihlcnJvcikge1xuICAgICAgY29uc3QgeyBlbGVtZW50UGF0aCwgbWVzc2FnZSB9ID0gZXJyb3JcbiAgICAgIGNvbnN0IGVycm9yTXNnID0gZWxlbWVudFBhdGggJiYgc2hvd1BhdGggP1xuICAgICAgICBtZXNzYWdlICsgJyBFbGVtZW50IFBhdGg6ICcgKyBlbGVtZW50UGF0aCArICcuJyA6IG1lc3NhZ2VcbiAgICAgIHJldHVybiAnPGxpPicgKyBlcnJvck1zZyArICc8L2xpPidcbiAgICB9KVxuICB9IGNhdGNoIChlcnIpIHt9XG4gIHNldFRleHRCb3goZXJyb3JzQXJyYXkuam9pbignJyksICdibG9jaycsIGVycm9yQm94SWQpO1xufVxuXG5leHBvcnQgY29uc3QgZGlzcGxheUluZm8gPSAoaW5mb1RleHQpID0+IHtcbiAgY29uc3QgaW5mb0hUTUwgPSAnPGxpPicgKyBpbmZvVGV4dCArICc8L2xpPidcbiAgc2V0VGV4dEJveChpbmZvSFRNTCwgJ2Jsb2NrJywgaW5mb0JveElkKTtcbn0iLCJpbXBvcnQgRm9ybXMgZnJvbSAnQG55Y29wcG9ydHVuaXR5L3B0dHJuLXNjcmlwdHMvc3JjL2Zvcm1zL2Zvcm1zJztcbmltcG9ydCB7IGRpc3BsYXlFcnJvcnMsIGRpc3BsYXlJbmZvLCBzZW5kUG9zdFJlcXVlc3QgfSBmcm9tICcuL3V0aWwnO1xuXG5leHBvcnQgZGVmYXVsdCBmdW5jdGlvbigpIHtcbiAgY29uc3QgU0VMRUNUT1IgPSAnW2RhdGEtanMqPVwiYnVsay1zdWJtaXNzaW9uXCJdJ1xuXG4gIGNvbnN0IGZpbGVuYW1lID0gJ3Jlc3BvbnNlLmNzdidcblxuICBjb25zdCBGb3JtID0gbmV3IEZvcm1zKGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoU0VMRUNUT1IpKTtcblxuICBjb25zdCBidWxrU3VibWlzc2lvbkhhbmRsZXIgPSAocmVxKSA9PiB7XG4gICAgaWYgKHJlcS5yZWFkeVN0YXRlID09PSA0KSB7XG4gICAgICBjb25zdCBzdGF0dXMgPSByZXEuc3RhdHVzLnRvU3RyaW5nKClcbiAgICAgIGlmIChzdGF0dXNbMF0gPT09ICc0JyB8fCBzdGF0dXNbMF0gPT09ICc1Jykge1xuICAgICAgICBkaXNwbGF5RXJyb3JzKHJlcS5yZXNwb25zZVRleHQsIHRydWUpXG4gICAgICB9IGVsc2UgaWYgKHN0YXR1c1swXSA9PT0gJzInKSB7XG4gICAgICAgIGRpc3BsYXlJbmZvKCdCdWxrIHN1Ym1pc3Npb24gc3VjY2Vzc2Z1bC4gQSBDU1Ygd2l0aCBwcm9ncmFtIGNvZGVzIFxcXG4gICAgICAgICAgc2hvdWxkIGJlIGRvd25sb2FkZWQgYXV0b21hdGljYWxseS4nKVxuICAgICAgICBjb25zdCBibG9iID0gbmV3IEJsb2IoW3JlcS5yZXNwb25zZV0sIHt0eXBlIDogJ3RleHQvY3N2J30pXG4gICAgICAgIGlmICh0eXBlb2Ygd2luZG93Lm5hdmlnYXRvci5tc1NhdmVCbG9iICE9PSAndW5kZWZpbmVkJykge1xuICAgICAgICAgIHdpbmRvdy5uYXZpZ2F0b3IubXNTYXZlQmxvYihibG9iLCBmaWxlbmFtZSlcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICBjb25zdCBVUkwgPSB3aW5kb3cuVVJMIHx8IHdpbmRvdy53ZWJraXRVUkxcbiAgICAgICAgICBjb25zdCBkb3dubG9hZFVybCA9IFVSTC5jcmVhdGVPYmplY3RVUkwoYmxvYilcblxuICAgICAgICAgIGNvbnN0IGEgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdhJylcblxuICAgICAgICAgIGlmICh0eXBlb2YgYS5kb3dubG9hZCA9PT0gJ3VuZGVmaW5lZCcpIHtcbiAgICAgICAgICAgIHdpbmRvdy5sb2NhdGlvbiA9IGRvd25sb2FkVXJsXG4gICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIGEuaHJlZiA9IGRvd25sb2FkVXJsXG4gICAgICAgICAgICBhLmRvd25sb2FkID0gZmlsZW5hbWVcbiAgICAgICAgICAgIGRvY3VtZW50LmJvZHkuYXBwZW5kQ2hpbGQoYSlcbiAgICAgICAgICAgIGEuY2xpY2soKVxuICAgICAgICAgIH1cblxuICAgICAgICAgIHNldFRpbWVvdXQoKCkgPT4ge1xuICAgICAgICAgICAgVVJMLnJldm9rZU9iamVjdFVSTChkb3dubG9hZFVybClcbiAgICAgICAgICB9LCAxMDApXG4gICAgICAgIH1cbiAgICAgIH1cbiAgICB9XG4gIH1cblxuICBjb25zdCBzZW5kQnVsa1N1Ym1pc3Npb25SZXF1ZXN0ID0gKGZvcm1WYWx1ZXMsIHRva2VuKSA9PiB7XG4gICAgY29uc3QgeyBiYXNldXJsLCB1c2VybmFtZSwgY3N2RmlsZSB9ID0gZm9ybVZhbHVlc1xuICAgIHZhciB1cmwgPSBiYXNldXJsICsgJ2J1bGtTdWJtaXNzaW9uL2ltcG9ydCdcbiAgICBpZiAoZm9ybVZhbHVlcy5wcm9ncmFtcykge1xuICAgICAgdmFyIHByb2dyYW1zID0gZm9ybVZhbHVlcy5wcm9ncmFtcy5zcGxpdCgnLCcpLm1hcChwID0+IHAudHJpbSgpKS5qb2luKCcsJylcbiAgICAgIHVybCA9IHVybCArICc/aW50ZXJlc3RlZFByb2dyYW1zPScgKyBwcm9ncmFtc1xuICAgIH1cbiAgICB2YXIgaGVhZGVyc09iamVjdCA9IHtcbiAgICAgICdBdXRob3JpemF0aW9uJzogdG9rZW5cbiAgICB9XG4gICAgdmFyIGZvcm1EYXRhID0gbmV3IEZvcm1EYXRhKCk7XG4gICAgZm9ybURhdGEuYXBwZW5kKCdmaWxlJywgY3N2RmlsZSk7XG4gICAgc2VuZFBvc3RSZXF1ZXN0KHVybCwgaGVhZGVyc09iamVjdCwgYnVsa1N1Ym1pc3Npb25IYW5kbGVyLCBmb3JtRGF0YSlcbiAgfVxuXG4gIGNvbnN0IGF1dGhSZXNwb25zZUhhbmRsZXIgPSAoZm9ybVZhbHVlcykgPT4gKHJlcSkgPT4ge1xuICAgIGlmIChyZXEucmVhZHlTdGF0ZSA9PT0gNCkge1xuICAgICAgY29uc3Qgc3RhdHVzID0gcmVxLnN0YXR1cy50b1N0cmluZygpXG4gICAgICBpZiAoc3RhdHVzWzBdID09PSAnNCcgfHwgc3RhdHVzWzBdID09PSAnNScpIHtcbiAgICAgICAgZGlzcGxheUVycm9ycyhyZXEucmVzcG9uc2VUZXh0LCBmYWxzZSlcbiAgICAgIH0gZWxzZSBpZiAoc3RhdHVzWzBdID09PSAnMicpIHtcbiAgICAgICAgc2VuZEJ1bGtTdWJtaXNzaW9uUmVxdWVzdChmb3JtVmFsdWVzLFxuICAgICAgICAgIEpTT04ucGFyc2UocmVxLnJlc3BvbnNlVGV4dCkudG9rZW4pXG4gICAgICB9XG4gICAgfVxuICB9XG5cbiAgY29uc3Qgc3VibWl0ID0gKGV2ZW50KSA9PiB7XG4gICAgY29uc3QgYmFzZXVybCA9IGV2ZW50LnRhcmdldC5hY3Rpb247XG4gICAgY29uc3QgdXNlcm5hbWUgPSBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgndXNlcm5hbWUnKS52YWx1ZVxuICAgIGNvbnN0IHBhc3N3b3JkID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ3Bhc3N3b3JkJykudmFsdWVcbiAgICBjb25zdCBwcm9ncmFtcyA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCdwcm9ncmFtcycpLnZhbHVlXG4gICAgY29uc3QgY3N2RmlsZUlucHV0ID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ2Nzdi11cGxvYWQnKVxuXG4gICAgY29uc3QgY3N2RmlsZSA9IGNzdkZpbGVJbnB1dC5maWxlcyAmJlxuICAgICAgY3N2RmlsZUlucHV0LmZpbGVzLmxlbmd0aCA+IDAgJiZcbiAgICAgIGNzdkZpbGVJbnB1dC5maWxlc1swXVxuXG4gICAgbGV0IGZvcm1WYWx1ZXMgPSB7XG4gICAgICBiYXNldXJsOiBiYXNldXJsLFxuICAgICAgdXNlcm5hbWU6IHVzZXJuYW1lLFxuICAgICAgcGFzc3dvcmQ6IHBhc3N3b3JkLFxuICAgICAgY3N2RmlsZTogY3N2RmlsZVxuICAgIH1cblxuICAgIGlmIChwcm9ncmFtcyAhPT0gJycpIGZvcm1WYWx1ZXMucHJvZ3JhbXMgPSBwcm9ncmFtc1xuXG4gICAgdmFyIHVybCA9IGJhc2V1cmwgKyAnYXV0aFRva2VuJ1xuICAgIHZhciBoZWFkZXJzT2JqZWN0ID0ge1xuICAgICAgJ0NvbnRlbnQtdHlwZSc6ICdhcHBsaWNhdGlvbi9qc29uJyxcbiAgICAgICdBY2Nlc3MtQ29udHJvbC1BbGxvdy1PcmlnaW4nOiAnKidcbiAgICB9XG5cbiAgICBjb25zdCBhdXRoUGF5bG9hZCA9IHsgdXNlcm5hbWUsIHBhc3N3b3JkIH1cblxuICAgIHNlbmRQb3N0UmVxdWVzdCh1cmwsIGhlYWRlcnNPYmplY3QsIGF1dGhSZXNwb25zZUhhbmRsZXIoZm9ybVZhbHVlcyksXG4gICAgICBKU09OLnN0cmluZ2lmeShhdXRoUGF5bG9hZCkpXG4gIH07XG5cbiAgRm9ybS5zZWxlY3RvcnMuRVJST1JfTUVTU0FHRV9QQVJFTlQgPSAnW2RhdGEtanMqPVwicXVlc3Rpb24tY29udGFpbmVyXCJdJztcblxuICBGb3JtLndhdGNoKCk7XG5cbiAgRm9ybS5zdWJtaXQgPSBzdWJtaXQ7XG59XG4iLCJpbXBvcnQgRm9ybXMgZnJvbSAnQG55Y29wcG9ydHVuaXR5L3B0dHJuLXNjcmlwdHMvc3JjL2Zvcm1zL2Zvcm1zJztcbmltcG9ydCB7IGRpc3BsYXlFcnJvcnMsIGRpc3BsYXlJbmZvLCBzZW5kUG9zdFJlcXVlc3QgfSBmcm9tICcuL3V0aWwnO1xuXG5leHBvcnQgZGVmYXVsdCBmdW5jdGlvbigpIHtcbiAgY29uc3QgU0VMRUNUT1IgPSAnW2RhdGEtanMqPVwiY2hhbmdlLXBhc3N3b3JkXCJdJ1xuXG4gIGNvbnN0IEZvcm0gPSBuZXcgRm9ybXMoZG9jdW1lbnQucXVlcnlTZWxlY3RvcihTRUxFQ1RPUikpO1xuXG4gIGNvbnN0IHJlc3BvbnNlSGFuZGxlciA9IChyZXEpID0+IHtcbiAgICBpZiAocmVxLnJlYWR5U3RhdGUgPT09IDQpIHtcbiAgICAgIGNvbnN0IHN0YXR1cyA9IHJlcS5zdGF0dXMudG9TdHJpbmcoKVxuICAgICAgaWYgKHN0YXR1c1swXSA9PT0gJzQnIHx8IHN0YXR1c1swXSA9PT0gJzUnKSB7XG4gICAgICAgIGRpc3BsYXlFcnJvcnMocmVxLnJlc3BvbnNlVGV4dCwgZmFsc2UpXG4gICAgICB9IGVsc2UgaWYgKHN0YXR1c1swXSA9PT0gJzInKSB7XG4gICAgICAgIGRpc3BsYXlJbmZvKCdQYXNzd29yZCB1cGRhdGVkJylcbiAgICAgIH1cbiAgICB9XG4gIH1cblxuXG4gIGNvbnN0IHN1Ym1pdCA9IChldmVudCkgPT4ge1xuICAgIGNvbnN0IGRvbWFpbiA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCdkb21haW4nKS52YWx1ZVxuICAgIGNvbnN0IHVzZXJuYW1lID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ3VzZXJuYW1lJykudmFsdWVcbiAgICBjb25zdCBwYXNzd29yZCA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCdwYXNzd29yZCcpLnZhbHVlXG4gICAgY29uc3QgbmV3UGFzc3dvcmQgPSBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgnbmV3cGFzc3dvcmQnKS52YWx1ZVxuXG4gICAgdmFyIHVybCA9IGRvbWFpbiArICdhdXRoVG9rZW4nXG4gICAgdmFyIGhlYWRlcnNPYmplY3QgPSB7XG4gICAgICAnQ29udGVudC10eXBlJzogJ2FwcGxpY2F0aW9uL2pzb24nLFxuICAgICAgJ0FjY2Vzcy1Db250cm9sLUFsbG93LU9yaWdpbic6ICcqJ1xuICAgIH1cblxuICAgIGNvbnN0IGF1dGhQYXlsb2FkID0geyB1c2VybmFtZSwgcGFzc3dvcmQsIG5ld1Bhc3N3b3JkIH1cblxuICAgIHNlbmRQb3N0UmVxdWVzdCh1cmwsIGhlYWRlcnNPYmplY3QsIHJlc3BvbnNlSGFuZGxlcixcbiAgICAgIEpTT04uc3RyaW5naWZ5KGF1dGhQYXlsb2FkKSlcbiAgfTtcblxuICBGb3JtLnNlbGVjdG9ycy5FUlJPUl9NRVNTQUdFX1BBUkVOVCA9ICdbZGF0YS1qcyo9XCJxdWVzdGlvbi1jb250YWluZXJcIl0nO1xuXG4gIEZvcm0ud2F0Y2goKTtcblxuICBGb3JtLnN1Ym1pdCA9IHN1Ym1pdDtcbn1cbiIsIi8qKlxuICogQ29udmVydHMgZm9ybSB0byBKU09OXG4gKi9cblxuaW1wb3J0IHJlc3BvbnNlcyBmcm9tICcuL3Jlc3BvbnNlcy5qcyc7XG5cbmV4cG9ydCBkZWZhdWx0IGZ1bmN0aW9uKCkge1xuICAkKCcuc2NyZWVuZXItZm9ybScpLmZhZGVJbig1MDApXG5cbiAgdmFyIGluY29tZXNDb250YWluZXIgPSAkKCcuaW5jb21lcycpLmNsb25lKCk7XG4gIHZhciBleHBlbnNlc0NvbnRhaW5lciA9ICQoJy5leHBlbnNlcycpLmNsb25lKCk7XG5cbiAgJCgnLmluY29tZXMnKS5yZW1vdmUoKTtcbiAgJCgnLmV4cGVuc2VzJykucmVtb3ZlKCk7XG5cbiAgdmFyIHBlcnNvbkNvbnRhaW5lciA9ICQoJy5wZXJzb24tZGF0YTpmaXJzdCcpLmNsb25lKCk7XG5cbiAgLyogR2VuZXJhdGUgdGhlIGVudGlyZSBKU09OICovXG4gICQoJy5nZW5lcmF0ZS1qc29uJykub24oJ2NsaWNrJywgZnVuY3Rpb24oZXZlbnQpe1xuICAgIGV2ZW50LnByZXZlbnREZWZhdWx0KCk7XG5cbiAgICB2YXIgZm9ybWRhdGE9JCgnLnNjcmVlbmVyLWZvcm0nKTtcblxuICAgIHZhciBmaW5hbE9iaiA9IHtcbiAgICAgIGhvdXNlaG9sZDogW10sXG4gICAgICBwZXJzb246IFtdXG4gICAgfTtcblxuICAgIHZhciBob3VzZWhvbGRPYmogPSBnZW5lcmF0ZUhvdXNlaG9sZE9iaihmb3JtZGF0YSk7XG4gICAgZmluYWxPYmpbJ2hvdXNlaG9sZCddLnB1c2goaG91c2Vob2xkT2JqKTtcblxuICAgIHZhciBwZXJzb25PYmogPSB7fVxuICAgICQoJy5wZXJzb24tZGF0YScpLmVhY2goZnVuY3Rpb24ocGkpIHtcbiAgICAgIHBlcnNvbk9iaiA9IGdlbmVyYXRlUGVyc29uT2JqKGZvcm1kYXRhLCBwaSk7XG4gICAgICBmaW5hbE9ialsncGVyc29uJ10ucHVzaChwZXJzb25PYmopO1xuICAgIH0pXG5cbiAgICBmaW5hbE9ialsnd2l0aGhvbGRQYXlsb2FkJ10gPSBTdHJpbmcoZm9ybWRhdGEuZmluZCgnW25hbWU9d2l0aGhvbGRQYXlsb2FkXScpLmlzKCc6Y2hlY2tlZCcpKTtcblxuICAgIHZhciBoYXNFcnJvcnMgPSB2YWxpZGF0ZUZpZWxkcyhmb3JtZGF0YSk7XG5cbiAgICBpZiAoaGFzRXJyb3JzW1wiZXJyb3JzXCJdID4gMCApIHtcbiAgICAgICQoJy5lcnJvci1tc2cnKS5yZW1vdmVDbGFzcygnaGlkZGVuJyk7XG4gICAgfWVsc2Uge1xuICAgICAgJCgnLmVycm9yLW1zZycpLmFkZENsYXNzKCdoaWRkZW4nKTtcbiAgICAgICQoJy5lcnJvcicpLnJlbW92ZUNsYXNzKCdlcnJvcicpO1xuICAgICAgJCgnLnNjcmVlbmVyLWZvcm0nKS5oaWRlKCk7XG4gICAgICAkKCcuc2NyZWVuZXItanNvbicpLmZpbmQoJ3ByZScpLnJlbW92ZSgpO1xuICAgICAgJCgnLnNjcmVlbmVyLWpzb24nKS5wcmVwZW5kKCc8cHJlIGNsYXNzPVwiYmxvY2tcIj48Y29kZSBjbGFzcz1cImNvZGVcIj4nICsgSlNPTi5zdHJpbmdpZnkoW2ZpbmFsT2JqXSwgdW5kZWZpbmVkLCAyKSArICc8L2NvZGU+PC9wcmU+Jyk7XG4gICAgICAkKCcuc2NyZWVuZXItanNvbicpLnJlbW92ZUNsYXNzKCdoaWRkZW4nKTtcbiAgICB9XG4gICAgaWYgKGhhc0Vycm9yc1tcIndhcm5pbmdzXCJdID4gMCApIHtcbiAgICAgICQoJy53YXJuaW5nLW1zZycpLnJlbW92ZUNsYXNzKCdoaWRkZW4nKTtcbiAgICB9ZWxzZSB7XG4gICAgICAkKCcud2FybmluZy1tc2cnKS5hZGRDbGFzcygnaGlkZGVuJyk7XG4gICAgfVxuICB9KVxuXG4gIC8qIEdvIGJhY2sgdG8gdGhlIGZvcm0gKi9cbiAgJCgnLmdlbmVyYXRlLWZvcm0nKS5vbignY2xpY2snLCBmdW5jdGlvbihldmVudCkge1xuICAgIGV2ZW50LnByZXZlbnREZWZhdWx0KCk7XG4gICAgJCgnLnNjcmVlbmVyLWpzb24nKS5hZGRDbGFzcygnaGlkZGVuJyk7XG4gICAgJCgnLnNjcmVlbmVyLWZvcm0nKS5zaG93KCk7XG4gIH0pXG5cbiAgJChkb2N1bWVudCkub24oJ2NoYW5nZScsJ1tuYW1lPWxpdmluZ1R5cGVdJywgZnVuY3Rpb24oZXZlbnQpIHtcbiAgICBldmVudC5wcmV2ZW50RGVmYXVsdCgpO1xuICAgIGlmKCQodGhpcykudmFsKCkgPT0gJ2xpdmluZ1JlbnRpbmcnKXtcbiAgICAgICQoJy5saXZpbmdSZW50YWxUeXBlJykucmVtb3ZlQ2xhc3MoJ2hpZGRlbicpO1xuICAgICAgJCgnLmxlYXNlJykucmVtb3ZlQ2xhc3MoJ2hpZGRlbicpO1xuICAgICAgcGVyc29uQ29udGFpbmVyLmZpbmQoJy5sZWFzZScpLnJlbW92ZUNsYXNzKCdoaWRkZW4nKTtcbiAgICB9IGVsc2Uge1xuICAgICAgJCgnLmxpdmluZ1JlbnRhbFR5cGUnKS5hZGRDbGFzcygnaGlkZGVuJyk7XG4gICAgICAkKCcubGVhc2UnKS5hZGRDbGFzcygnaGlkZGVuJyk7XG4gICAgfVxuICAgIGlmKCQodGhpcykudmFsKCkgPT0gJ2xpdmluZ093bmVyJyl7XG4gICAgICAkKCcuZGVlZCcpLnJlbW92ZUNsYXNzKCdoaWRkZW4nKTtcbiAgICAgIHBlcnNvbkNvbnRhaW5lci5maW5kKCcuZGVlZCcpLnJlbW92ZUNsYXNzKCdoaWRkZW4nKTtcbiAgICB9IGVsc2Uge1xuICAgICAgJCgnLmRlZWQnKS5hZGRDbGFzcygnaGlkZGVuJyk7XG4gICAgfVxuICB9KVxuXG4gIC8qIEFkZCBwZXJzb24gKi9cbiAgJChkb2N1bWVudCkub24oJ2NsaWNrJywnLmFkZC1wZXJzb24nLCBmdW5jdGlvbihldmVudCkge1xuICAgIGV2ZW50LnByZXZlbnREZWZhdWx0KCk7XG5cbiAgICAkKCcuYWRkLXJlbW92ZScpLmZpbmQoJy5lcnJvcicpLnJlbW92ZSgpXG5cbiAgICBpZiAoJCgnLnBlcnNvbi1kYXRhJykubGVuZ3RoID4gOCkge1xuICAgICAgJCh0aGlzKS5wYXJlbnQoKS5hcHBlbmQoJzxwIGNsYXNzPVwiZXJyb3IgcHQtMlwiPicrIHJlc3BvbnNlcy5maW5kKHggPT4geFtcIlBlcnNvblwiXSlbXCJQZXJzb25cIl1bXCJlcnJfbnVtX3BlcnNvbnNcIl0rJzwvcD4nKVxuICAgIH1lbHNlIHtcbiAgICAgIHBlcnNvbkNvbnRhaW5lci5jbG9uZSgpLmluc2VydEJlZm9yZSgkKHRoaXMpLnBhcmVudCgpKTtcbiAgICB9XG5cbiAgICBpZiAoJCgnLnBlcnNvbi1kYXRhJykubGVuZ3RoID4gMSkge1xuICAgICAgJCgnLnJlbW92ZS1wZXJzb24nKS5yZW1vdmVDbGFzcygnaGlkZGVuJyk7XG4gICAgfVxuICB9KVxuXG4gIC8qIFJlbW92ZSBwZXJzb24gKi9cbiAgJChkb2N1bWVudCkub24oJ2NsaWNrJywnLnJlbW92ZS1wZXJzb24nLCBmdW5jdGlvbihldmVudCkge1xuICAgIGV2ZW50LnByZXZlbnREZWZhdWx0KCk7XG5cbiAgICAkKCcuYWRkLXJlbW92ZScpLmZpbmQoJy5lcnJvcicpLnJlbW92ZSgpXG5cbiAgICBpZiAoJCgnLnBlcnNvbi1kYXRhJykubGVuZ3RoID4xKSB7XG4gICAgICAkKCcucGVyc29uLWRhdGE6bGFzdCcpLnJlbW92ZSgpO1xuICAgIH1cbiAgICBpZiAoJCgnLnBlcnNvbi1kYXRhJykubGVuZ3RoID09IDEpIHtcbiAgICAgICQoJy5yZW1vdmUtcGVyc29uJykuYWRkQ2xhc3MoJ2hpZGRlbicpO1xuICAgIH1cbiAgfSlcblxuICAvKiBJTkNPTUVTICovXG4gICQoZG9jdW1lbnQpLm9uKCdjbGljaycsJy5hZGQtaW5jb21lJywgZnVuY3Rpb24oZXZlbnQpIHtcbiAgICBldmVudC5wcmV2ZW50RGVmYXVsdCgpO1xuICAgIGluY29tZXNDb250YWluZXIuY2xvbmUoKS5pbnNlcnRCZWZvcmUoJCh0aGlzKS5wYXJlbnQoKSlcbiAgICAkKHRoaXMpLmNsb3Nlc3QoJy5wZXJzb24tZGF0YScpLmZpbmQoJy5pbmNvbWVzOmxhc3QnKS5yZW1vdmVDbGFzcygnaGlkZGVuJylcbiAgICAkKHRoaXMpLnByZXYoJy5yZW1vdmUtaW5jb21lJykucmVtb3ZlQ2xhc3MoJ2hpZGRlbicpXG4gIH0pXG5cbiAgJChkb2N1bWVudCkub24oJ2NsaWNrJywnLnJlbW92ZS1pbmNvbWUnLCBmdW5jdGlvbihldmVudCkge1xuICAgIGV2ZW50LnByZXZlbnREZWZhdWx0KCk7XG4gICAgJCh0aGlzKS5jbG9zZXN0KCcucGVyc29uLWRhdGEnKS5maW5kKCcuaW5jb21lczpsYXN0JykucmVtb3ZlKCk7XG4gICAgaWYoJCh0aGlzKS5jbG9zZXN0KCcucGVyc29uLWRhdGEnKS5maW5kKCcuaW5jb21lcycpLmxlbmd0aCA+IDApe1xuICAgICAgJCh0aGlzKS5yZW1vdmVDbGFzcygnaGlkZGVuJyk7XG4gICAgfSBlbHNlIHtcbiAgICAgICQodGhpcykuYWRkQ2xhc3MoJ2hpZGRlbicpO1xuICAgIH1cbiAgfSlcblxuICAvKiBFWFBFTlNFUyAqL1xuICAkKGRvY3VtZW50KS5vbignY2xpY2snLCcuYWRkLWV4cGVuc2UnLCBmdW5jdGlvbihldmVudCkge1xuICAgIGV2ZW50LnByZXZlbnREZWZhdWx0KCk7XG4gICAgZXhwZW5zZXNDb250YWluZXIuY2xvbmUoKS5pbnNlcnRCZWZvcmUoJCh0aGlzKS5wYXJlbnQoKSlcbiAgICAkKHRoaXMpLmNsb3Nlc3QoJy5wZXJzb24tZGF0YScpLmZpbmQoJy5leHBlbnNlczpsYXN0JykucmVtb3ZlQ2xhc3MoJ2hpZGRlbicpXG4gICAgJCh0aGlzKS5wcmV2KCcucmVtb3ZlLWV4cGVuc2UnKS5yZW1vdmVDbGFzcygnaGlkZGVuJylcbiAgfSlcblxuICAkKGRvY3VtZW50KS5vbignY2xpY2snLCcucmVtb3ZlLWV4cGVuc2UnLCBmdW5jdGlvbihldmVudCkge1xuICAgIGV2ZW50LnByZXZlbnREZWZhdWx0KCk7XG4gICAgJCh0aGlzKS5jbG9zZXN0KCcucGVyc29uLWRhdGEnKS5maW5kKCcuZXhwZW5zZXM6bGFzdCcpLnJlbW92ZSgpO1xuICAgIGlmKCQodGhpcykuY2xvc2VzdCgnLnBlcnNvbi1kYXRhJykuZmluZCgnLmV4cGVuc2VzJykubGVuZ3RoID4gMCl7XG4gICAgICAkKHRoaXMpLnJlbW92ZUNsYXNzKCdoaWRkZW4nKTtcbiAgICB9IGVsc2Uge1xuICAgICAgJCh0aGlzKS5hZGRDbGFzcygnaGlkZGVuJyk7XG4gICAgfVxuICB9KVxuXG4gIC8qIEdlbmVyYXRlcyB0aGUgaG91c2Vob2xkIG9iamVjdCAqL1xuICBmdW5jdGlvbiBnZW5lcmF0ZUhvdXNlaG9sZE9iaihmb3JtKXtcbiAgICB2YXIgaGggPSBmb3JtLmZpbmQoJ1tob3VzZWhvbGRdJykuc2VyaWFsaXplQXJyYXkoKS5yZWR1Y2UoKG9iaiwgaXRlbSkgPT4gKG9ialtpdGVtLm5hbWVdID0gaXRlbS52YWx1ZSwgb2JqKSAse30pO1xuICAgIHZhciBsaXZpbmdUeXBlID0gZm9ybS5maW5kKCdbbmFtZT1saXZpbmdUeXBlXScpLmNoaWxkcmVuKCk7XG4gICAgbGl2aW5nVHlwZS5lYWNoKGZ1bmN0aW9uKCl7XG4gICAgICBpZiAoJCh0aGlzKS52YWwoKSAhPSBcIlwiKXtcbiAgICAgICAgaWYoJCh0aGlzKS52YWwoKSA9PSBsaXZpbmdUeXBlLnBhcmVudCgpLnZhbCgpKXtcbiAgICAgICAgICBoaFskKHRoaXMpLnZhbCgpXT1cInRydWVcIjtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICBoaFskKHRoaXMpLnZhbCgpXT1cImZhbHNlXCI7XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICB9KVxuICAgIGRlbGV0ZSBoaFsnbGl2aW5nVHlwZSddO1xuICAgIHJldHVybiBoaDtcbiAgfVxuXG4gIC8qIEdlbmVyYXRlcyB0aGUgcGVyc29uIG9iamVjdCAqL1xuICBmdW5jdGlvbiBnZW5lcmF0ZVBlcnNvbk9iaihmb3JtLCBwaW5kZXgpIHtcbiAgICB2YXIgcGVyc29uRm9ybSA9IGZvcm0uZmluZCgnLnBlcnNvbi1kYXRhJykuZXEocGluZGV4KTtcbiAgICB2YXIgcGVyc29uID0gcGVyc29uRm9ybS5maW5kKCdbcGVyc29uXScpLnNlcmlhbGl6ZUFycmF5KCkucmVkdWNlKChvYmosIGl0ZW0pID0+IChvYmpbaXRlbS5uYW1lXSA9IGl0ZW0udmFsdWUsIG9iaikgLHt9KTtcbiAgICB2YXIgcGVyc29uVHlwZSA9IHBlcnNvbkZvcm0uZmluZCgnW3R5cGU9Y2hlY2tib3hdJykuZmlsdGVyKCdbcGVyc29uXScpO1xuICAgIHBlcnNvblR5cGUuZWFjaChmdW5jdGlvbigpe1xuICAgICAgaWYgKCQodGhpcykuaXMoJzpjaGVja2VkJykpe1xuICAgICAgICBwZXJzb25bJCh0aGlzKS5hdHRyKCduYW1lJyldPVwidHJ1ZVwiO1xuICAgICAgfWVsc2Uge1xuICAgICAgICBwZXJzb25bJCh0aGlzKS5hdHRyKCduYW1lJyldPVwiZmFsc2VcIjtcbiAgICAgIH1cbiAgICB9KVxuXG4gICAgLyogSW5jb21lcyAqL1xuICAgIHZhciBmb3JtSW5jb21lcyA9IHBlcnNvbkZvcm0uZmluZCgnW3BlcnNvbi1pbmNvbWVzXScpLnNlcmlhbGl6ZUFycmF5KCk7XG4gICAgdmFyIGluY29tZXNBcnIgPSBbXTtcbiAgICB2YXIgaW5jb21lc09iaiA9IHt9O1xuICAgIHZhciBudW1JbmNvbWVzID0gZm9ybUluY29tZXMubGVuZ3RoIC8gMztcbiAgICB2YXIgaW5kZXggPSAwO1xuICAgIHZhciBzdWJzZXQ7XG5cbiAgICBmb3IgKHZhciBpID0gMDsgaSA8IG51bUluY29tZXM7IGkrKykge1xuICAgICAgaW5jb21lc09iaiA9IHt9O1xuICAgICAgc3Vic2V0ID0gZm9ybUluY29tZXMuc2xpY2UoaW5kZXgsIGluZGV4KzMpO1xuICAgICAgc3Vic2V0LmZvckVhY2goZnVuY3Rpb24oa2V5KXtcbiAgICAgICAgaW5jb21lc09ialtrZXkubmFtZV0gPSBrZXkudmFsdWU7XG4gICAgICB9KVxuICAgICAgaW5jb21lc0Fyci5wdXNoKGluY29tZXNPYmopO1xuXG4gICAgICBpbmRleCA9IGluZGV4ICsgMztcbiAgICB9XG5cbiAgICBpZihpbmNvbWVzQXJyLmxlbmd0aCA+IDApe1xuICAgICAgcGVyc29uWydpbmNvbWVzJ10gPSBpbmNvbWVzQXJyO1xuICAgIH1cblxuICAgIC8qIEV4cGVuc2VzICovXG4gICAgdmFyIGZvcm1FeHBlbnNlcyA9IHBlcnNvbkZvcm0uZmluZCgnW3BlcnNvbi1leHBlbnNlc10nKS5zZXJpYWxpemVBcnJheSgpO1xuICAgIHZhciBleHBlbnNlc0FyciA9IFtdO1xuICAgIHZhciBleHBlbnNlc09iaiA9IHt9O1xuICAgIHZhciBudW1FeHBlbnNlcyA9IGZvcm1FeHBlbnNlcy5sZW5ndGggLyAzO1xuICAgIGluZGV4ID0gMDtcblxuICAgIGZvciAodmFyIGkgPSAwOyBpIDwgbnVtRXhwZW5zZXM7IGkrKykge1xuICAgICAgZXhwZW5zZXNPYmogPSB7fTtcbiAgICAgIHN1YnNldCA9IGZvcm1FeHBlbnNlcy5zbGljZShpbmRleCwgaW5kZXgrMyk7XG4gICAgICBzdWJzZXQuZm9yRWFjaChmdW5jdGlvbihrZXkpe1xuICAgICAgICBleHBlbnNlc09ialtrZXkubmFtZV0gPSBrZXkudmFsdWU7XG4gICAgICB9KVxuXG4gICAgICBleHBlbnNlc0Fyci5wdXNoKGV4cGVuc2VzT2JqKTtcblxuICAgICAgaW5kZXggPSBpbmRleCArIDM7XG4gICAgfVxuXG4gICAgaWYoZXhwZW5zZXNBcnIubGVuZ3RoID4gMCkge1xuICAgICAgcGVyc29uWydleHBlbnNlcyddID0gZXhwZW5zZXNBcnI7XG4gICAgfVxuXG4gICAgcmV0dXJuIHBlcnNvbjtcbiAgfVxuXG4gIC8qIENvcHkgdGhlIEpTT04gb2JqZWN0IHRvIHRoZSBjbGlwYm9hcmQgKi9cbiAgJChkb2N1bWVudCkub24oJ2NsaWNrJywnLmNvcHktb2JqJywgZnVuY3Rpb24oZXZlbnQpIHtcbiAgICBldmVudC5wcmV2ZW50RGVmYXVsdCgpO1xuXG4gICAgdmFyIHJhbmdlID0gZG9jdW1lbnQuY3JlYXRlUmFuZ2UoKTtcbiAgICByYW5nZS5zZWxlY3ROb2RlKGRvY3VtZW50LmdldEVsZW1lbnRzQnlDbGFzc05hbWUoXCJjb2RlXCIpWzBdKTtcbiAgICB3aW5kb3cuZ2V0U2VsZWN0aW9uKCkucmVtb3ZlQWxsUmFuZ2VzKCk7XG4gICAgd2luZG93LmdldFNlbGVjdGlvbigpLmFkZFJhbmdlKHJhbmdlKTtcbiAgICBkb2N1bWVudC5leGVjQ29tbWFuZChcImNvcHlcIik7XG5cbiAgICAkKHRoaXMpLnRleHQoJ0NvcGllZCEnKTtcbiAgfSlcblxuICAvKiBWYWxpZGF0ZSB0aGUgZm9ybSAqL1xuICBmdW5jdGlvbiB2YWxpZGF0ZUZpZWxkcyhmb3JtKSB7XG4gICAgdmFyIGZpZWxkLCBmaWVsZE5hbWUsIGdyb3VwU2VsZXRlZCxcbiAgICByZXN1bHRzID0ge1wiZXJyb3JzXCI6IDAsIFwid2FybmluZ3NcIjogMH0sXG4gICAgZmllbGRzT2JqID0gZm9ybS5zZXJpYWxpemVBcnJheSgpLnJlZHVjZSgob2JqLCBpdGVtKSA9PiAob2JqW2l0ZW0ubmFtZV0gPSBpdGVtLnZhbHVlLCBvYmopICx7fSksXG4gICAgZmllbGRzID0gZm9ybS5maW5kKCdbcmVxdWlyZWRdJyksXG4gICAgZXJyTm9kZSA9ICQoJy5lcnJvci1tc2cnKSxcbiAgICB3YXJuaW5nTm9kZSA9ICQoJy53YXJuaW5nLW1zZycpLFxuICAgIGhoTXNnT2JqID0gcmVzcG9uc2VzLmZpbmQoeCA9PiB4W1wiSG91c2Vob2xkXCJdKVtcIkhvdXNlaG9sZFwiXSxcbiAgICBwZXJzb25Nc2dPYmogPSByZXNwb25zZXMuZmluZCh4ID0+IHhbXCJQZXJzb25cIl0pW1wiUGVyc29uXCJdLFxuICAgIGVyck1zZ09iaiA9IHJlc3BvbnNlcy5maW5kKHggPT4geFtcIkdlbmVyYWxcIl0pW1wiR2VuZXJhbFwiXVxuXG4gICAgJCgnLmVycm9yLW1zZycpLmNoaWxkcmVuKCkucmVtb3ZlKCk7XG4gICAgJCgnLndhcm5pbmctbXNnJykuY2hpbGRyZW4oKS5yZW1vdmUoKTtcblxuICAgICQoJy5lcnJvci1tc2cnKS5hZGRDbGFzcygnZXJyb3InKVxuICAgICQoJy5lcnJvci1tc2cnKS5hcHBlbmQoJzxwPjxzdHJvbmc+JyArIGVyck1zZ09ialtcImVycm9yXCJdICArICc8L3N0cm9uZz48L3A+JylcbiAgICAkKCcud2FybmluZy1tc2cnKS5hcHBlbmQoJzxwPjxzdHJvbmc+JyArIGVyck1zZ09ialtcIndhcm5pbmdcIl0gKyAnPC9zdHJvbmc+PC9wPicpXG5cbiAgICAvKiBjaGVjayBmb3IgZW1wdHkgZmllbGRzICovXG4gICAgZmllbGRzLmVhY2goZnVuY3Rpb24oKXtcbiAgICAgIGZpZWxkTmFtZSA9ICQodGhpcykuYXR0cignbmFtZScpO1xuICAgICAgZ3JvdXBTZWxldGVkID0gT2JqZWN0LmtleXMoZmllbGRzT2JqKS5maW5kKGEgPT5hLmluY2x1ZGVzKGZpZWxkTmFtZSkpPyB0cnVlIDogZmFsc2U7XG5cbiAgICAgIGlmKCAkKHRoaXMpLnZhbCgpID09PSBcIlwiIHx8XG4gICAgICAgICFncm91cFNlbGV0ZWRcbiAgICAgICkge1xuICAgICAgICAkKHRoaXMpLnBhcmVudCgpLnBhcmVudCgpLmFkZENsYXNzKCdlcnJvcicpO1xuICAgICAgICByZXN1bHRzW1wiZXJyb3JzXCJdICs9IDE7XG4gICAgICB9IGVsc2Uge1xuICAgICAgICAkKHRoaXMpLnBhcmVudCgpLnJlbW92ZUNsYXNzKCdlcnJvcicpO1xuICAgICAgfVxuXG4gICAgICBpZiggKCQodGhpcykudmFsKCkgPT0gJ2xpdmluZ1JlbnRpbmcnKSAmJlxuICAgICAgICAoZm9ybS5maW5kKCdbbmFtZT1saXZpbmdSZW50YWxUeXBlXScpLnZhbCgpID09IFwiXCIpXG4gICAgICApIHtcbiAgICAgICAgd2FybmluZ05vZGUuYXBwZW5kKCc8cD4nICsgaGhNc2dPYmpbXCJ3YXJuaW5nX3JlbnRhbF90eXBlXCJdICsgJzwvcD4nKVxuICAgICAgICByZXN1bHRzW1wid2FybmluZ3NcIl0gKz0gMTtcbiAgICAgIH1cblxuICAgIH0pO1xuXG4gICAgdmFyIG51bVBlb3BsZSA9ICQoJy5wZXJzb24tZGF0YScpLmxlbmd0aDtcbiAgICBpZiAoKG51bVBlb3BsZSA8IDEpIHx8IChudW1QZW9wbGUgPiA4KSkge1xuICAgICAgJCgnLmVycm9yLW1zZycpLmFwcGVuZCgnPHA+JysgcGVyc29uTXNnT2JqW1wiZXJyX251bV9wZXJzb25zXCJdICsgJzwvcD4nKVxuICAgICAgcmVzdWx0c1tcImVycm9yc1wiXSArPSAxO1xuICAgIH1cblxuICAgIHZhciBudW1IZWFkcyA9IDBcbiAgICB2YXIgaG91c2Vob2xkTWVtYmVyVHlwZXMgPSAkKCdbbmFtZT1ob3VzZWhvbGRNZW1iZXJUeXBlXScpXG4gICAgZm9yICh2YXIgaSA9IDA7IGkgPCBob3VzZWhvbGRNZW1iZXJUeXBlcy5sZW5ndGg7IGkrKykge1xuICAgICAgaWYgKGhvdXNlaG9sZE1lbWJlclR5cGVzW2ldLnZhbHVlID09IFwiSGVhZE9mSG91c2Vob2xkXCIpIHtcbiAgICAgICAgbnVtSGVhZHMgKz0gMVxuICAgICAgfVxuICAgIH1cblxuICAgIGlmIChudW1IZWFkcyAhPSAxKSB7XG4gICAgICAkKCdbbmFtZT1ob3VzZWhvbGRNZW1iZXJUeXBlXScpLnBhcmVudCgpLmFkZENsYXNzKCdlcnJvcicpXG4gICAgICAkKCcuZXJyb3ItbXNnJykuYXBwZW5kKCc8cD4nKyBwZXJzb25Nc2dPYmpbXCJlcnJfaG9oXCJdICsnPC9wPicpXG4gICAgICByZXN1bHRzW1wiZXJyb3JzXCJdICs9IDE7XG4gICAgfVxuXG4gICAgaWYgKGZvcm0uZmluZCgnW25hbWU9bGl2aW5nVHlwZV0nKS52YWwoKSA9PSBcImxpdmluZ1JlbnRpbmdcIiAmJlxuICAgICAgISgkKCdbbmFtZT1saXZpbmdSZW50YWxPbkxlYXNlXTpjaGVja2VkJykubGVuZ3RoID4gMClcbiAgICApe1xuICAgICAgd2FybmluZ05vZGUuYXBwZW5kKCc8cD4nICsgcGVyc29uTXNnT2JqW1wid2FybmluZ19vbl9sZWFzZVwiXSArICc8L3A+JylcbiAgICAgIHJlc3VsdHNbXCJ3YXJuaW5nc1wiXSArPSAxO1xuICAgIH1cblxuICAgIGlmIChmb3JtLmZpbmQoJ1tuYW1lPWxpdmluZ1R5cGVdJykudmFsKCkgPT0gXCJsaXZpbmdPd25lclwiICYmXG4gICAgICAhKCQoJ1tuYW1lPWxpdmluZ1JlbnRhbE9uTGVhc2VdOmNoZWNrZWQnKS5sZW5ndGggPiAwKVxuICAgICl7XG4gICAgICB3YXJuaW5nTm9kZS5hcHBlbmQoJzxwPicgKyBwZXJzb25Nc2dPYmpbXCJ3YXJuaW5nX29uX2RlZWRcIl0gKyAnPC9wPicpXG4gICAgICByZXN1bHRzW1wid2FybmluZ3NcIl0gKz0gMTtcbiAgICB9XG5cblxuICAgIHJldHVybiByZXN1bHRzO1xuICB9XG59XG4iLCIndXNlIHN0cmljdCc7XG5cbi8qKlxuICogVGhlIEljb24gbW9kdWxlXG4gKiBAY2xhc3NcbiAqL1xuY2xhc3MgSWNvbnMge1xuICAvKipcbiAgICogQGNvbnN0cnVjdG9yXG4gICAqIEBwYXJhbSAge1N0cmluZ30gcGF0aCBUaGUgcGF0aCBvZiB0aGUgaWNvbiBmaWxlXG4gICAqIEByZXR1cm4ge29iamVjdH0gVGhlIGNsYXNzXG4gICAqL1xuICBjb25zdHJ1Y3RvcihwYXRoKSB7XG4gICAgcGF0aCA9IChwYXRoKSA/IHBhdGggOiBJY29ucy5wYXRoO1xuXG4gICAgZmV0Y2gocGF0aClcbiAgICAgIC50aGVuKChyZXNwb25zZSkgPT4ge1xuICAgICAgICBpZiAocmVzcG9uc2Uub2spXG4gICAgICAgICAgcmV0dXJuIHJlc3BvbnNlLnRleHQoKTtcbiAgICAgICAgZWxzZVxuICAgICAgICAgIC8vIGVzbGludC1kaXNhYmxlLW5leHQtbGluZSBuby1jb25zb2xlXG4gICAgICAgICAgaWYgKHByb2Nlc3MuZW52Lk5PREVfRU5WICE9PSAncHJvZHVjdGlvbicpXG4gICAgICAgICAgICBjb25zb2xlLmRpcihyZXNwb25zZSk7XG4gICAgICB9KVxuICAgICAgLmNhdGNoKChlcnJvcikgPT4ge1xuICAgICAgICAvLyBlc2xpbnQtZGlzYWJsZS1uZXh0LWxpbmUgbm8tY29uc29sZVxuICAgICAgICBpZiAocHJvY2Vzcy5lbnYuTk9ERV9FTlYgIT09ICdwcm9kdWN0aW9uJylcbiAgICAgICAgICBjb25zb2xlLmRpcihlcnJvcik7XG4gICAgICB9KVxuICAgICAgLnRoZW4oKGRhdGEpID0+IHtcbiAgICAgICAgY29uc3Qgc3ByaXRlID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnZGl2Jyk7XG4gICAgICAgIHNwcml0ZS5pbm5lckhUTUwgPSBkYXRhO1xuICAgICAgICBzcHJpdGUuc2V0QXR0cmlidXRlKCdhcmlhLWhpZGRlbicsIHRydWUpO1xuICAgICAgICBzcHJpdGUuc2V0QXR0cmlidXRlKCdzdHlsZScsICdkaXNwbGF5OiBub25lOycpO1xuICAgICAgICBkb2N1bWVudC5ib2R5LmFwcGVuZENoaWxkKHNwcml0ZSk7XG4gICAgICB9KTtcblxuICAgIHJldHVybiB0aGlzO1xuICB9XG59XG5cbi8qKiBAdHlwZSB7U3RyaW5nfSBUaGUgcGF0aCBvZiB0aGUgaWNvbiBmaWxlICovXG5JY29ucy5wYXRoID0gJ3N2Zy9pY29ucy5zdmcnO1xuXG5leHBvcnQgZGVmYXVsdCBJY29ucztcbiIsIid1c2Ugc3RyaWN0JztcblxuLyoqXG4gKiBUaGUgU2ltcGxlIFRvZ2dsZSBjbGFzcy4gVGhpcyB3aWxsIHRvZ2dsZSB0aGUgY2xhc3MgJ2FjdGl2ZScgYW5kICdoaWRkZW4nXG4gKiBvbiB0YXJnZXQgZWxlbWVudHMsIGRldGVybWluZWQgYnkgYSBjbGljayBldmVudCBvbiBhIHNlbGVjdGVkIGxpbmsgb3JcbiAqIGVsZW1lbnQuIFRoaXMgd2lsbCBhbHNvIHRvZ2dsZSB0aGUgYXJpYS1oaWRkZW4gYXR0cmlidXRlIGZvciB0YXJnZXRlZFxuICogZWxlbWVudHMgdG8gc3VwcG9ydCBzY3JlZW4gcmVhZGVycy4gVGFyZ2V0IHNldHRpbmdzIGFuZCBvdGhlciBmdW5jdGlvbmFsaXR5XG4gKiBjYW4gYmUgY29udHJvbGxlZCB0aHJvdWdoIGRhdGEgYXR0cmlidXRlcy5cbiAqXG4gKiBUaGlzIHVzZXMgdGhlIC5tYXRjaGVzKCkgbWV0aG9kIHdoaWNoIHdpbGwgcmVxdWlyZSBhIHBvbHlmaWxsIGZvciBJRVxuICogaHR0cHM6Ly9wb2x5ZmlsbC5pby92Mi9kb2NzL2ZlYXR1cmVzLyNFbGVtZW50X3Byb3RvdHlwZV9tYXRjaGVzXG4gKlxuICogQGNsYXNzXG4gKi9cbmNsYXNzIFRvZ2dsZSB7XG4gIC8qKlxuICAgKiBAY29uc3RydWN0b3JcbiAgICpcbiAgICogQHBhcmFtICB7T2JqZWN0fSAgcyAgU2V0dGluZ3MgZm9yIHRoaXMgVG9nZ2xlIGluc3RhbmNlXG4gICAqXG4gICAqIEByZXR1cm4ge09iamVjdH0gICAgIFRoZSBjbGFzc1xuICAgKi9cbiAgY29uc3RydWN0b3Iocykge1xuICAgIC8vIENyZWF0ZSBhbiBvYmplY3QgdG8gc3RvcmUgZXhpc3RpbmcgdG9nZ2xlIGxpc3RlbmVycyAoaWYgaXQgZG9lc24ndCBleGlzdClcbiAgICBpZiAoIXdpbmRvdy5oYXNPd25Qcm9wZXJ0eShUb2dnbGUuY2FsbGJhY2spKVxuICAgICAgd2luZG93W1RvZ2dsZS5jYWxsYmFja10gPSBbXTtcblxuICAgIHMgPSAoIXMpID8ge30gOiBzO1xuXG4gICAgdGhpcy5zZXR0aW5ncyA9IHtcbiAgICAgIHNlbGVjdG9yOiAocy5zZWxlY3RvcikgPyBzLnNlbGVjdG9yIDogVG9nZ2xlLnNlbGVjdG9yLFxuICAgICAgbmFtZXNwYWNlOiAocy5uYW1lc3BhY2UpID8gcy5uYW1lc3BhY2UgOiBUb2dnbGUubmFtZXNwYWNlLFxuICAgICAgaW5hY3RpdmVDbGFzczogKHMuaW5hY3RpdmVDbGFzcykgPyBzLmluYWN0aXZlQ2xhc3MgOiBUb2dnbGUuaW5hY3RpdmVDbGFzcyxcbiAgICAgIGFjdGl2ZUNsYXNzOiAocy5hY3RpdmVDbGFzcykgPyBzLmFjdGl2ZUNsYXNzIDogVG9nZ2xlLmFjdGl2ZUNsYXNzLFxuICAgICAgYmVmb3JlOiAocy5iZWZvcmUpID8gcy5iZWZvcmUgOiBmYWxzZSxcbiAgICAgIGFmdGVyOiAocy5hZnRlcikgPyBzLmFmdGVyIDogZmFsc2UsXG4gICAgICB2YWxpZDogKHMudmFsaWQpID8gcy52YWxpZCA6IGZhbHNlLFxuICAgICAgZm9jdXNhYmxlOiAocy5oYXNPd25Qcm9wZXJ0eSgnZm9jdXNhYmxlJykpID8gcy5mb2N1c2FibGUgOiB0cnVlLFxuICAgICAganVtcDogKHMuaGFzT3duUHJvcGVydHkoJ2p1bXAnKSkgPyBzLmp1bXAgOiB0cnVlXG4gICAgfTtcblxuICAgIC8vIFN0b3JlIHRoZSBlbGVtZW50IGZvciBwb3RlbnRpYWwgdXNlIGluIGNhbGxiYWNrc1xuICAgIHRoaXMuZWxlbWVudCA9IChzLmVsZW1lbnQpID8gcy5lbGVtZW50IDogZmFsc2U7XG5cbiAgICBpZiAodGhpcy5lbGVtZW50KSB7XG4gICAgICB0aGlzLmVsZW1lbnQuYWRkRXZlbnRMaXN0ZW5lcignY2xpY2snLCAoZXZlbnQpID0+IHtcbiAgICAgICAgdGhpcy50b2dnbGUoZXZlbnQpO1xuICAgICAgfSk7XG4gICAgfSBlbHNlIHtcbiAgICAgIC8vIElmIHRoZXJlIGlzbid0IGFuIGV4aXN0aW5nIGluc3RhbnRpYXRlZCB0b2dnbGUsIGFkZCB0aGUgZXZlbnQgbGlzdGVuZXIuXG4gICAgICBpZiAoIXdpbmRvd1tUb2dnbGUuY2FsbGJhY2tdLmhhc093blByb3BlcnR5KHRoaXMuc2V0dGluZ3Muc2VsZWN0b3IpKSB7XG4gICAgICAgIGxldCBib2R5ID0gZG9jdW1lbnQucXVlcnlTZWxlY3RvcignYm9keScpO1xuXG4gICAgICAgIGZvciAobGV0IGkgPSAwOyBpIDwgVG9nZ2xlLmV2ZW50cy5sZW5ndGg7IGkrKykge1xuICAgICAgICAgIGxldCB0Z2dsZUV2ZW50ID0gVG9nZ2xlLmV2ZW50c1tpXTtcblxuICAgICAgICAgIGJvZHkuYWRkRXZlbnRMaXN0ZW5lcih0Z2dsZUV2ZW50LCBldmVudCA9PiB7XG4gICAgICAgICAgICBpZiAoIWV2ZW50LnRhcmdldC5tYXRjaGVzKHRoaXMuc2V0dGluZ3Muc2VsZWN0b3IpKVxuICAgICAgICAgICAgICByZXR1cm47XG5cbiAgICAgICAgICAgIHRoaXMuZXZlbnQgPSBldmVudDtcblxuICAgICAgICAgICAgbGV0IHR5cGUgPSBldmVudC50eXBlLnRvVXBwZXJDYXNlKCk7XG5cbiAgICAgICAgICAgIGlmIChcbiAgICAgICAgICAgICAgdGhpc1tldmVudC50eXBlXSAmJlxuICAgICAgICAgICAgICBUb2dnbGUuZWxlbWVudHNbdHlwZV0gJiZcbiAgICAgICAgICAgICAgVG9nZ2xlLmVsZW1lbnRzW3R5cGVdLmluY2x1ZGVzKGV2ZW50LnRhcmdldC50YWdOYW1lKVxuICAgICAgICAgICAgKSB0aGlzW2V2ZW50LnR5cGVdKGV2ZW50KTtcbiAgICAgICAgICB9KTtcbiAgICAgICAgfVxuICAgICAgfVxuICAgIH1cblxuICAgIC8vIFJlY29yZCB0aGF0IGEgdG9nZ2xlIHVzaW5nIHRoaXMgc2VsZWN0b3IgaGFzIGJlZW4gaW5zdGFudGlhdGVkLlxuICAgIC8vIFRoaXMgcHJldmVudHMgZG91YmxlIHRvZ2dsaW5nLlxuICAgIHdpbmRvd1tUb2dnbGUuY2FsbGJhY2tdW3RoaXMuc2V0dGluZ3Muc2VsZWN0b3JdID0gdHJ1ZTtcblxuICAgIHJldHVybiB0aGlzO1xuICB9XG5cbiAgLyoqXG4gICAqIENsaWNrIGV2ZW50IGhhbmRsZXJcbiAgICpcbiAgICogQHBhcmFtICB7RXZlbnR9ICBldmVudCAgVGhlIG9yaWdpbmFsIGNsaWNrIGV2ZW50XG4gICAqL1xuICBjbGljayhldmVudCkge1xuICAgIHRoaXMudG9nZ2xlKGV2ZW50KTtcbiAgfVxuXG4gIC8qKlxuICAgKiBJbnB1dC9zZWxlY3QvdGV4dGFyZWEgY2hhbmdlIGV2ZW50IGhhbmRsZXIuIENoZWNrcyB0byBzZWUgaWYgdGhlXG4gICAqIGV2ZW50LnRhcmdldCBpcyB2YWxpZCB0aGVuIHRvZ2dsZXMgYWNjb3JkaW5nbHkuXG4gICAqXG4gICAqIEBwYXJhbSAge0V2ZW50fSAgZXZlbnQgIFRoZSBvcmlnaW5hbCBpbnB1dCBjaGFuZ2UgZXZlbnRcbiAgICovXG4gIGNoYW5nZShldmVudCkge1xuICAgIGxldCB2YWxpZCA9IGV2ZW50LnRhcmdldC5jaGVja1ZhbGlkaXR5KCk7XG5cbiAgICBpZiAodmFsaWQgJiYgIXRoaXMuaXNBY3RpdmUoZXZlbnQudGFyZ2V0KSkge1xuICAgICAgdGhpcy50b2dnbGUoZXZlbnQpOyAvLyBzaG93XG4gICAgfSBlbHNlIGlmICghdmFsaWQgJiYgdGhpcy5pc0FjdGl2ZShldmVudC50YXJnZXQpKSB7XG4gICAgICB0aGlzLnRvZ2dsZShldmVudCk7IC8vIGhpZGVcbiAgICB9XG4gIH1cblxuICAvKipcbiAgICogQ2hlY2sgdG8gc2VlIGlmIHRoZSB0b2dnbGUgaXMgYWN0aXZlXG4gICAqXG4gICAqIEBwYXJhbSAge09iamVjdH0gIGVsZW1lbnQgIFRoZSB0b2dnbGUgZWxlbWVudCAodHJpZ2dlcilcbiAgICovXG4gIGlzQWN0aXZlKGVsZW1lbnQpIHtcbiAgICBsZXQgYWN0aXZlID0gZmFsc2U7XG5cbiAgICBpZiAodGhpcy5zZXR0aW5ncy5hY3RpdmVDbGFzcykge1xuICAgICAgYWN0aXZlID0gZWxlbWVudC5jbGFzc0xpc3QuY29udGFpbnModGhpcy5zZXR0aW5ncy5hY3RpdmVDbGFzcylcbiAgICB9XG5cbiAgICAvLyBpZiAoKSB7XG4gICAgICAvLyBUb2dnbGUuZWxlbWVudEFyaWFSb2xlc1xuICAgICAgLy8gVE9ETzogQWRkIGNhdGNoIHRvIHNlZSBpZiBlbGVtZW50IGFyaWEgcm9sZXMgYXJlIHRvZ2dsZWRcbiAgICAvLyB9XG5cbiAgICAvLyBpZiAoKSB7XG4gICAgICAvLyBUb2dnbGUudGFyZ2V0QXJpYVJvbGVzXG4gICAgICAvLyBUT0RPOiBBZGQgY2F0Y2ggdG8gc2VlIGlmIHRhcmdldCBhcmlhIHJvbGVzIGFyZSB0b2dnbGVkXG4gICAgLy8gfVxuXG4gICAgcmV0dXJuIGFjdGl2ZTtcbiAgfVxuXG4gIC8qKlxuICAgKiBHZXQgdGhlIHRhcmdldCBvZiB0aGUgdG9nZ2xlIGVsZW1lbnQgKHRyaWdnZXIpXG4gICAqXG4gICAqIEBwYXJhbSAge09iamVjdH0gIGVsICBUaGUgdG9nZ2xlIGVsZW1lbnQgKHRyaWdnZXIpXG4gICAqL1xuICBnZXRUYXJnZXQoZWxlbWVudCkge1xuICAgIGxldCB0YXJnZXQgPSBmYWxzZTtcblxuICAgIC8qKiBBbmNob3IgTGlua3MgKi9cbiAgICB0YXJnZXQgPSAoZWxlbWVudC5oYXNBdHRyaWJ1dGUoJ2hyZWYnKSkgP1xuICAgICAgZG9jdW1lbnQucXVlcnlTZWxlY3RvcihlbGVtZW50LmdldEF0dHJpYnV0ZSgnaHJlZicpKSA6IHRhcmdldDtcblxuICAgIC8qKiBUb2dnbGUgQ29udHJvbHMgKi9cbiAgICB0YXJnZXQgPSAoZWxlbWVudC5oYXNBdHRyaWJ1dGUoJ2FyaWEtY29udHJvbHMnKSkgP1xuICAgICAgZG9jdW1lbnQucXVlcnlTZWxlY3RvcihgIyR7ZWxlbWVudC5nZXRBdHRyaWJ1dGUoJ2FyaWEtY29udHJvbHMnKX1gKSA6IHRhcmdldDtcblxuICAgIHJldHVybiB0YXJnZXQ7XG4gIH1cblxuICAvKipcbiAgICogVGhlIHRvZ2dsZSBldmVudCBwcm94eSBmb3IgZ2V0dGluZyBhbmQgc2V0dGluZyB0aGUgZWxlbWVudC9zIGFuZCB0YXJnZXRcbiAgICpcbiAgICogQHBhcmFtICB7T2JqZWN0fSAgZXZlbnQgIFRoZSBtYWluIGNsaWNrIGV2ZW50XG4gICAqXG4gICAqIEByZXR1cm4ge09iamVjdH0gICAgICAgICBUaGUgVG9nZ2xlIGluc3RhbmNlXG4gICAqL1xuICB0b2dnbGUoZXZlbnQpIHtcbiAgICBsZXQgZWxlbWVudCA9IGV2ZW50LnRhcmdldDtcbiAgICBsZXQgdGFyZ2V0ID0gZmFsc2U7XG4gICAgbGV0IGZvY3VzYWJsZSA9IFtdO1xuXG4gICAgZXZlbnQucHJldmVudERlZmF1bHQoKTtcblxuICAgIHRhcmdldCA9IHRoaXMuZ2V0VGFyZ2V0KGVsZW1lbnQpO1xuXG4gICAgLyoqIEZvY3VzYWJsZSBDaGlsZHJlbiAqL1xuICAgIGZvY3VzYWJsZSA9ICh0YXJnZXQpID9cbiAgICAgIHRhcmdldC5xdWVyeVNlbGVjdG9yQWxsKFRvZ2dsZS5lbEZvY3VzYWJsZS5qb2luKCcsICcpKSA6IGZvY3VzYWJsZTtcblxuICAgIC8qKiBNYWluIEZ1bmN0aW9uYWxpdHkgKi9cbiAgICBpZiAoIXRhcmdldCkgcmV0dXJuIHRoaXM7XG4gICAgdGhpcy5lbGVtZW50VG9nZ2xlKGVsZW1lbnQsIHRhcmdldCwgZm9jdXNhYmxlKTtcblxuICAgIC8qKiBVbmRvICovXG4gICAgaWYgKGVsZW1lbnQuZGF0YXNldFtgJHt0aGlzLnNldHRpbmdzLm5hbWVzcGFjZX1VbmRvYF0pIHtcbiAgICAgIGNvbnN0IHVuZG8gPSBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKFxuICAgICAgICBlbGVtZW50LmRhdGFzZXRbYCR7dGhpcy5zZXR0aW5ncy5uYW1lc3BhY2V9VW5kb2BdXG4gICAgICApO1xuXG4gICAgICB1bmRvLmFkZEV2ZW50TGlzdGVuZXIoJ2NsaWNrJywgKGV2ZW50KSA9PiB7XG4gICAgICAgIGV2ZW50LnByZXZlbnREZWZhdWx0KCk7XG4gICAgICAgIHRoaXMuZWxlbWVudFRvZ2dsZShlbGVtZW50LCB0YXJnZXQpO1xuICAgICAgICB1bmRvLnJlbW92ZUV2ZW50TGlzdGVuZXIoJ2NsaWNrJyk7XG4gICAgICB9KTtcbiAgICB9XG5cbiAgICByZXR1cm4gdGhpcztcbiAgfVxuXG4gIC8qKlxuICAgKiBHZXQgb3RoZXIgdG9nZ2xlcyB0aGF0IG1pZ2h0IGNvbnRyb2wgdGhlIHNhbWUgZWxlbWVudFxuICAgKlxuICAgKiBAcGFyYW0gICB7T2JqZWN0fSAgICBlbGVtZW50ICBUaGUgdG9nZ2xpbmcgZWxlbWVudFxuICAgKlxuICAgKiBAcmV0dXJuICB7Tm9kZUxpc3R9ICAgICAgICAgICBMaXN0IG9mIG90aGVyIHRvZ2dsaW5nIGVsZW1lbnRzXG4gICAqICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHRoYXQgY29udHJvbCB0aGUgdGFyZ2V0XG4gICAqL1xuICBnZXRPdGhlcnMoZWxlbWVudCkge1xuICAgIGxldCBzZWxlY3RvciA9IGZhbHNlO1xuXG4gICAgaWYgKGVsZW1lbnQuaGFzQXR0cmlidXRlKCdocmVmJykpIHtcbiAgICAgIHNlbGVjdG9yID0gYFtocmVmPVwiJHtlbGVtZW50LmdldEF0dHJpYnV0ZSgnaHJlZicpfVwiXWA7XG4gICAgfSBlbHNlIGlmIChlbGVtZW50Lmhhc0F0dHJpYnV0ZSgnYXJpYS1jb250cm9scycpKSB7XG4gICAgICBzZWxlY3RvciA9IGBbYXJpYS1jb250cm9scz1cIiR7ZWxlbWVudC5nZXRBdHRyaWJ1dGUoJ2FyaWEtY29udHJvbHMnKX1cIl1gO1xuICAgIH1cblxuICAgIHJldHVybiAoc2VsZWN0b3IpID8gZG9jdW1lbnQucXVlcnlTZWxlY3RvckFsbChzZWxlY3RvcikgOiBbXTtcbiAgfVxuXG4gIC8qKlxuICAgKiBIaWRlIHRoZSBUb2dnbGUgVGFyZ2V0J3MgZm9jdXNhYmxlIGNoaWxkcmVuIGZyb20gZm9jdXMuXG4gICAqIElmIGFuIGVsZW1lbnQgaGFzIHRoZSBkYXRhLWF0dHJpYnV0ZSBgZGF0YS10b2dnbGUtdGFiaW5kZXhgXG4gICAqIGl0IHdpbGwgdXNlIHRoYXQgYXMgdGhlIGRlZmF1bHQgdGFiIGluZGV4IG9mIHRoZSBlbGVtZW50LlxuICAgKlxuICAgKiBAcGFyYW0gICB7Tm9kZUxpc3R9ICBlbGVtZW50cyAgTGlzdCBvZiBmb2N1c2FibGUgZWxlbWVudHNcbiAgICpcbiAgICogQHJldHVybiAge09iamVjdH0gICAgICAgICAgICAgIFRoZSBUb2dnbGUgSW5zdGFuY2VcbiAgICovXG4gIHRvZ2dsZUZvY3VzYWJsZShlbGVtZW50cykge1xuICAgIGVsZW1lbnRzLmZvckVhY2goZWxlbWVudCA9PiB7XG4gICAgICBsZXQgdGFiaW5kZXggPSBlbGVtZW50LmdldEF0dHJpYnV0ZSgndGFiaW5kZXgnKTtcblxuICAgICAgaWYgKHRhYmluZGV4ID09PSAnLTEnKSB7XG4gICAgICAgIGxldCBkYXRhRGVmYXVsdCA9IGVsZW1lbnRcbiAgICAgICAgICAuZ2V0QXR0cmlidXRlKGBkYXRhLSR7VG9nZ2xlLm5hbWVzcGFjZX0tdGFiaW5kZXhgKTtcblxuICAgICAgICBpZiAoZGF0YURlZmF1bHQpIHtcbiAgICAgICAgICBlbGVtZW50LnNldEF0dHJpYnV0ZSgndGFiaW5kZXgnLCBkYXRhRGVmYXVsdCk7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgZWxlbWVudC5yZW1vdmVBdHRyaWJ1dGUoJ3RhYmluZGV4Jyk7XG4gICAgICAgIH1cbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIGVsZW1lbnQuc2V0QXR0cmlidXRlKCd0YWJpbmRleCcsICctMScpO1xuICAgICAgfVxuICAgIH0pO1xuXG4gICAgcmV0dXJuIHRoaXM7XG4gIH1cblxuICAvKipcbiAgICogSnVtcHMgdG8gRWxlbWVudCB2aXNpYmx5IGFuZCBzaGlmdHMgZm9jdXNcbiAgICogdG8gdGhlIGVsZW1lbnQgYnkgc2V0dGluZyB0aGUgdGFiaW5kZXhcbiAgICpcbiAgICogQHBhcmFtICAge09iamVjdH0gIGVsZW1lbnQgIFRoZSBUb2dnbGluZyBFbGVtZW50XG4gICAqIEBwYXJhbSAgIHtPYmplY3R9ICB0YXJnZXQgICBUaGUgVGFyZ2V0IEVsZW1lbnRcbiAgICpcbiAgICogQHJldHVybiAge09iamVjdH0gICAgICAgICAgIFRoZSBUb2dnbGUgaW5zdGFuY2VcbiAgICovXG4gIGp1bXBUbyhlbGVtZW50LCB0YXJnZXQpIHtcbiAgICAvLyBSZXNldCB0aGUgaGlzdG9yeSBzdGF0ZS4gVGhpcyB3aWxsIGNsZWFyIG91dFxuICAgIC8vIHRoZSBoYXNoIHdoZW4gdGhlIHRhcmdldCBpcyB0b2dnbGVkIGNsb3NlZFxuICAgIGhpc3RvcnkucHVzaFN0YXRlKCcnLCAnJyxcbiAgICAgIHdpbmRvdy5sb2NhdGlvbi5wYXRobmFtZSArIHdpbmRvdy5sb2NhdGlvbi5zZWFyY2gpO1xuXG4gICAgLy8gRm9jdXMgaWYgYWN0aXZlXG4gICAgaWYgKHRhcmdldC5jbGFzc0xpc3QuY29udGFpbnModGhpcy5zZXR0aW5ncy5hY3RpdmVDbGFzcykpIHtcbiAgICAgIHdpbmRvdy5sb2NhdGlvbi5oYXNoID0gZWxlbWVudC5nZXRBdHRyaWJ1dGUoJ2hyZWYnKTtcblxuICAgICAgdGFyZ2V0LnNldEF0dHJpYnV0ZSgndGFiaW5kZXgnLCAnMCcpO1xuICAgICAgdGFyZ2V0LmZvY3VzKHtwcmV2ZW50U2Nyb2xsOiB0cnVlfSk7XG4gICAgfSBlbHNlIHtcbiAgICAgIHRhcmdldC5yZW1vdmVBdHRyaWJ1dGUoJ3RhYmluZGV4Jyk7XG4gICAgfVxuXG4gICAgcmV0dXJuIHRoaXM7XG4gIH1cblxuICAvKipcbiAgICogVGhlIG1haW4gdG9nZ2xpbmcgbWV0aG9kIGZvciBhdHRyaWJ1dGVzXG4gICAqXG4gICAqIEBwYXJhbSAge09iamVjdH0gICAgZWxlbWVudCAgICBUaGUgVG9nZ2xlIGVsZW1lbnRcbiAgICogQHBhcmFtICB7T2JqZWN0fSAgICB0YXJnZXQgICAgIFRoZSBUYXJnZXQgZWxlbWVudCB0byB0b2dnbGUgYWN0aXZlL2hpZGRlblxuICAgKiBAcGFyYW0gIHtOb2RlTGlzdH0gIGZvY3VzYWJsZSAgQW55IGZvY3VzYWJsZSBjaGlsZHJlbiBpbiB0aGUgdGFyZ2V0XG4gICAqXG4gICAqIEByZXR1cm4ge09iamVjdH0gICAgICAgICAgICAgICBUaGUgVG9nZ2xlIGluc3RhbmNlXG4gICAqL1xuICBlbGVtZW50VG9nZ2xlKGVsZW1lbnQsIHRhcmdldCwgZm9jdXNhYmxlID0gW10pIHtcbiAgICBsZXQgaSA9IDA7XG4gICAgbGV0IGF0dHIgPSAnJztcbiAgICBsZXQgdmFsdWUgPSAnJztcblxuICAgIC8qKlxuICAgICAqIFN0b3JlIGVsZW1lbnRzIGZvciBwb3RlbnRpYWwgdXNlIGluIGNhbGxiYWNrc1xuICAgICAqL1xuXG4gICAgdGhpcy5lbGVtZW50ID0gZWxlbWVudDtcbiAgICB0aGlzLnRhcmdldCA9IHRhcmdldDtcbiAgICB0aGlzLm90aGVycyA9IHRoaXMuZ2V0T3RoZXJzKGVsZW1lbnQpO1xuICAgIHRoaXMuZm9jdXNhYmxlID0gZm9jdXNhYmxlO1xuXG4gICAgLyoqXG4gICAgICogVmFsaWRpdHkgbWV0aG9kIHByb3BlcnR5IHRoYXQgd2lsbCBjYW5jZWwgdGhlIHRvZ2dsZSBpZiBpdCByZXR1cm5zIGZhbHNlXG4gICAgICovXG5cbiAgICBpZiAodGhpcy5zZXR0aW5ncy52YWxpZCAmJiAhdGhpcy5zZXR0aW5ncy52YWxpZCh0aGlzKSlcbiAgICAgIHJldHVybiB0aGlzO1xuXG4gICAgLyoqXG4gICAgICogVG9nZ2xpbmcgYmVmb3JlIGhvb2tcbiAgICAgKi9cblxuICAgIGlmICh0aGlzLnNldHRpbmdzLmJlZm9yZSlcbiAgICAgIHRoaXMuc2V0dGluZ3MuYmVmb3JlKHRoaXMpO1xuXG4gICAgLyoqXG4gICAgICogVG9nZ2xlIEVsZW1lbnQgYW5kIFRhcmdldCBjbGFzc2VzXG4gICAgICovXG5cbiAgICBpZiAodGhpcy5zZXR0aW5ncy5hY3RpdmVDbGFzcykge1xuICAgICAgdGhpcy5lbGVtZW50LmNsYXNzTGlzdC50b2dnbGUodGhpcy5zZXR0aW5ncy5hY3RpdmVDbGFzcyk7XG4gICAgICB0aGlzLnRhcmdldC5jbGFzc0xpc3QudG9nZ2xlKHRoaXMuc2V0dGluZ3MuYWN0aXZlQ2xhc3MpO1xuXG4gICAgICAvLyBJZiB0aGVyZSBhcmUgb3RoZXIgdG9nZ2xlcyB0aGF0IGNvbnRyb2wgdGhlIHNhbWUgZWxlbWVudFxuICAgICAgdGhpcy5vdGhlcnMuZm9yRWFjaChvdGhlciA9PiB7XG4gICAgICAgIGlmIChvdGhlciAhPT0gdGhpcy5lbGVtZW50KVxuICAgICAgICAgIG90aGVyLmNsYXNzTGlzdC50b2dnbGUodGhpcy5zZXR0aW5ncy5hY3RpdmVDbGFzcyk7XG4gICAgICB9KTtcbiAgICB9XG5cbiAgICBpZiAodGhpcy5zZXR0aW5ncy5pbmFjdGl2ZUNsYXNzKVxuICAgICAgdGFyZ2V0LmNsYXNzTGlzdC50b2dnbGUodGhpcy5zZXR0aW5ncy5pbmFjdGl2ZUNsYXNzKTtcblxuICAgIC8qKlxuICAgICAqIFRhcmdldCBFbGVtZW50IEFyaWEgQXR0cmlidXRlc1xuICAgICAqL1xuXG4gICAgZm9yIChpID0gMDsgaSA8IFRvZ2dsZS50YXJnZXRBcmlhUm9sZXMubGVuZ3RoOyBpKyspIHtcbiAgICAgIGF0dHIgPSBUb2dnbGUudGFyZ2V0QXJpYVJvbGVzW2ldO1xuICAgICAgdmFsdWUgPSB0aGlzLnRhcmdldC5nZXRBdHRyaWJ1dGUoYXR0cik7XG5cbiAgICAgIGlmICh2YWx1ZSAhPSAnJyAmJiB2YWx1ZSlcbiAgICAgICAgdGhpcy50YXJnZXQuc2V0QXR0cmlidXRlKGF0dHIsICh2YWx1ZSA9PT0gJ3RydWUnKSA/ICdmYWxzZScgOiAndHJ1ZScpO1xuICAgIH1cblxuICAgIC8qKlxuICAgICAqIFRvZ2dsZSB0aGUgdGFyZ2V0J3MgZm9jdXNhYmxlIGNoaWxkcmVuIHRhYmluZGV4XG4gICAgICovXG5cbiAgICBpZiAodGhpcy5zZXR0aW5ncy5mb2N1c2FibGUpXG4gICAgICB0aGlzLnRvZ2dsZUZvY3VzYWJsZSh0aGlzLmZvY3VzYWJsZSk7XG5cbiAgICAvKipcbiAgICAgKiBKdW1wIHRvIFRhcmdldCBFbGVtZW50IGlmIFRvZ2dsZSBFbGVtZW50IGlzIGFuIGFuY2hvciBsaW5rXG4gICAgICovXG5cbiAgICBpZiAodGhpcy5zZXR0aW5ncy5qdW1wICYmIHRoaXMuZWxlbWVudC5oYXNBdHRyaWJ1dGUoJ2hyZWYnKSlcbiAgICAgIHRoaXMuanVtcFRvKHRoaXMuZWxlbWVudCwgdGhpcy50YXJnZXQpO1xuXG4gICAgLyoqXG4gICAgICogVG9nZ2xlIEVsZW1lbnQgKGluY2x1ZGluZyBtdWx0aSB0b2dnbGVzKSBBcmlhIEF0dHJpYnV0ZXNcbiAgICAgKi9cblxuICAgIGZvciAoaSA9IDA7IGkgPCBUb2dnbGUuZWxBcmlhUm9sZXMubGVuZ3RoOyBpKyspIHtcbiAgICAgIGF0dHIgPSBUb2dnbGUuZWxBcmlhUm9sZXNbaV07XG4gICAgICB2YWx1ZSA9IHRoaXMuZWxlbWVudC5nZXRBdHRyaWJ1dGUoYXR0cik7XG5cbiAgICAgIGlmICh2YWx1ZSAhPSAnJyAmJiB2YWx1ZSlcbiAgICAgICAgdGhpcy5lbGVtZW50LnNldEF0dHJpYnV0ZShhdHRyLCAodmFsdWUgPT09ICd0cnVlJykgPyAnZmFsc2UnIDogJ3RydWUnKTtcblxuICAgICAgLy8gSWYgdGhlcmUgYXJlIG90aGVyIHRvZ2dsZXMgdGhhdCBjb250cm9sIHRoZSBzYW1lIGVsZW1lbnRcbiAgICAgIHRoaXMub3RoZXJzLmZvckVhY2goKG90aGVyKSA9PiB7XG4gICAgICAgIGlmIChvdGhlciAhPT0gdGhpcy5lbGVtZW50ICYmIG90aGVyLmdldEF0dHJpYnV0ZShhdHRyKSlcbiAgICAgICAgICBvdGhlci5zZXRBdHRyaWJ1dGUoYXR0ciwgKHZhbHVlID09PSAndHJ1ZScpID8gJ2ZhbHNlJyA6ICd0cnVlJyk7XG4gICAgICB9KTtcbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBUb2dnbGluZyBjb21wbGV0ZSBob29rXG4gICAgICovXG5cbiAgICBpZiAodGhpcy5zZXR0aW5ncy5hZnRlcilcbiAgICAgIHRoaXMuc2V0dGluZ3MuYWZ0ZXIodGhpcyk7XG5cbiAgICByZXR1cm4gdGhpcztcbiAgfVxufVxuXG4vKiogQHR5cGUgIHtTdHJpbmd9ICBUaGUgbWFpbiBzZWxlY3RvciB0byBhZGQgdGhlIHRvZ2dsaW5nIGZ1bmN0aW9uIHRvICovXG5Ub2dnbGUuc2VsZWN0b3IgPSAnW2RhdGEtanMqPVwidG9nZ2xlXCJdJztcblxuLyoqIEB0eXBlICB7U3RyaW5nfSAgVGhlIG5hbWVzcGFjZSBmb3Igb3VyIGRhdGEgYXR0cmlidXRlIHNldHRpbmdzICovXG5Ub2dnbGUubmFtZXNwYWNlID0gJ3RvZ2dsZSc7XG5cbi8qKiBAdHlwZSAge1N0cmluZ30gIFRoZSBoaWRlIGNsYXNzICovXG5Ub2dnbGUuaW5hY3RpdmVDbGFzcyA9ICdoaWRkZW4nO1xuXG4vKiogQHR5cGUgIHtTdHJpbmd9ICBUaGUgYWN0aXZlIGNsYXNzICovXG5Ub2dnbGUuYWN0aXZlQ2xhc3MgPSAnYWN0aXZlJztcblxuLyoqIEB0eXBlICB7QXJyYXl9ICBBcmlhIHJvbGVzIHRvIHRvZ2dsZSB0cnVlL2ZhbHNlIG9uIHRoZSB0b2dnbGluZyBlbGVtZW50ICovXG5Ub2dnbGUuZWxBcmlhUm9sZXMgPSBbJ2FyaWEtcHJlc3NlZCcsICdhcmlhLWV4cGFuZGVkJ107XG5cbi8qKiBAdHlwZSAge0FycmF5fSAgQXJpYSByb2xlcyB0byB0b2dnbGUgdHJ1ZS9mYWxzZSBvbiB0aGUgdGFyZ2V0IGVsZW1lbnQgKi9cblRvZ2dsZS50YXJnZXRBcmlhUm9sZXMgPSBbJ2FyaWEtaGlkZGVuJ107XG5cbi8qKiBAdHlwZSAge0FycmF5fSAgRm9jdXNhYmxlIGVsZW1lbnRzIHRvIGhpZGUgd2l0aGluIHRoZSBoaWRkZW4gdGFyZ2V0IGVsZW1lbnQgKi9cblRvZ2dsZS5lbEZvY3VzYWJsZSA9IFtcbiAgJ2EnLCAnYnV0dG9uJywgJ2lucHV0JywgJ3NlbGVjdCcsICd0ZXh0YXJlYScsICdvYmplY3QnLCAnZW1iZWQnLCAnZm9ybScsXG4gICdmaWVsZHNldCcsICdsZWdlbmQnLCAnbGFiZWwnLCAnYXJlYScsICdhdWRpbycsICd2aWRlbycsICdpZnJhbWUnLCAnc3ZnJyxcbiAgJ2RldGFpbHMnLCAndGFibGUnLCAnW3RhYmluZGV4XScsICdbY29udGVudGVkaXRhYmxlXScsICdbdXNlbWFwXSdcbl07XG5cbi8qKiBAdHlwZSAge0FycmF5fSAgS2V5IGF0dHJpYnV0ZSBmb3Igc3RvcmluZyB0b2dnbGVzIGluIHRoZSB3aW5kb3cgKi9cblRvZ2dsZS5jYWxsYmFjayA9IFsnVG9nZ2xlc0NhbGxiYWNrJ107XG5cbi8qKiBAdHlwZSAge0FycmF5fSAgRGVmYXVsdCBldmVudHMgdG8gdG8gd2F0Y2ggZm9yIHRvZ2dsaW5nLiBFYWNoIG11c3QgaGF2ZSBhIGhhbmRsZXIgaW4gdGhlIGNsYXNzIGFuZCBlbGVtZW50cyB0byBsb29rIGZvciBpbiBUb2dnbGUuZWxlbWVudHMgKi9cblRvZ2dsZS5ldmVudHMgPSBbJ2NsaWNrJywgJ2NoYW5nZSddO1xuXG4vKiogQHR5cGUgIHtBcnJheX0gIEVsZW1lbnRzIHRvIGRlbGVnYXRlIHRvIGVhY2ggZXZlbnQgaGFuZGxlciAqL1xuVG9nZ2xlLmVsZW1lbnRzID0ge1xuICBDTElDSzogWydBJywgJ0JVVFRPTiddLFxuICBDSEFOR0U6IFsnU0VMRUNUJywgJ0lOUFVUJywgJ1RFWFRBUkVBJ11cbn07XG5cbmV4cG9ydCBkZWZhdWx0IFRvZ2dsZTtcbiIsIid1c2Ugc3RyaWN0JztcblxuLyoqXG4gKiBUcmFja2luZyBidXMgZm9yIEdvb2dsZSBhbmFseXRpY3MgYW5kIFdlYnRyZW5kcy5cbiAqL1xuY2xhc3MgVHJhY2sge1xuICBjb25zdHJ1Y3RvcihzKSB7XG4gICAgY29uc3QgYm9keSA9IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoJ2JvZHknKTtcblxuICAgIHMgPSAoIXMpID8ge30gOiBzO1xuXG4gICAgdGhpcy5fc2V0dGluZ3MgPSB7XG4gICAgICBzZWxlY3RvcjogKHMuc2VsZWN0b3IpID8gcy5zZWxlY3RvciA6IFRyYWNrLnNlbGVjdG9yLFxuICAgIH07XG5cbiAgICB0aGlzLmRlc2luYXRpb25zID0gVHJhY2suZGVzdGluYXRpb25zO1xuXG4gICAgYm9keS5hZGRFdmVudExpc3RlbmVyKCdjbGljaycsIChldmVudCkgPT4ge1xuICAgICAgaWYgKCFldmVudC50YXJnZXQubWF0Y2hlcyh0aGlzLl9zZXR0aW5ncy5zZWxlY3RvcikpXG4gICAgICAgIHJldHVybjtcblxuICAgICAgbGV0IGtleSA9IGV2ZW50LnRhcmdldC5kYXRhc2V0LnRyYWNrS2V5O1xuICAgICAgbGV0IGRhdGEgPSBKU09OLnBhcnNlKGV2ZW50LnRhcmdldC5kYXRhc2V0LnRyYWNrRGF0YSk7XG5cbiAgICAgIHRoaXMudHJhY2soa2V5LCBkYXRhKTtcbiAgICB9KTtcblxuICAgIHJldHVybiB0aGlzO1xuICB9XG5cbiAgLyoqXG4gICAqIFRyYWNraW5nIGZ1bmN0aW9uIHdyYXBwZXJcbiAgICpcbiAgICogQHBhcmFtICB7U3RyaW5nfSAgICAgIGtleSAgIFRoZSBrZXkgb3IgZXZlbnQgb2YgdGhlIGRhdGFcbiAgICogQHBhcmFtICB7Q29sbGVjdGlvbn0gIGRhdGEgIFRoZSBkYXRhIHRvIHRyYWNrXG4gICAqXG4gICAqIEByZXR1cm4ge09iamVjdH0gICAgICAgICAgICBUaGUgZmluYWwgZGF0YSBvYmplY3RcbiAgICovXG4gIHRyYWNrKGtleSwgZGF0YSkge1xuICAgIC8vIFNldCB0aGUgcGF0aCBuYW1lIGJhc2VkIG9uIHRoZSBsb2NhdGlvblxuICAgIGNvbnN0IGQgPSBkYXRhLm1hcChlbCA9PiB7XG4gICAgICAgIGlmIChlbC5oYXNPd25Qcm9wZXJ0eShUcmFjay5rZXkpKVxuICAgICAgICAgIGVsW1RyYWNrLmtleV0gPSBgJHt3aW5kb3cubG9jYXRpb24ucGF0aG5hbWV9LyR7ZWxbVHJhY2sua2V5XX1gXG4gICAgICAgIHJldHVybiBlbDtcbiAgICAgIH0pO1xuXG4gICAgbGV0IHd0ID0gdGhpcy53ZWJ0cmVuZHMoa2V5LCBkKTtcbiAgICBsZXQgZ2EgPSB0aGlzLmd0YWcoa2V5LCBkKTtcblxuICAgIC8qIGVzbGludC1kaXNhYmxlIG5vLWNvbnNvbGUgKi9cbiAgICBpZiAocHJvY2Vzcy5lbnYuTk9ERV9FTlYgIT09ICdwcm9kdWN0aW9uJylcbiAgICAgIGNvbnNvbGUuZGlyKHsnVHJhY2snOiBbd3QsIGdhXX0pO1xuICAgIC8qIGVzbGludC1lbmFibGUgbm8tY29uc29sZSAqL1xuXG4gICAgcmV0dXJuIGQ7XG4gIH07XG5cbiAgLyoqXG4gICAqIERhdGEgYnVzIGZvciB0cmFja2luZyB2aWV3cyBpbiBXZWJ0cmVuZHMgYW5kIEdvb2dsZSBBbmFseXRpY3NcbiAgICpcbiAgICogQHBhcmFtICB7U3RyaW5nfSAgICAgIGFwcCAgIFRoZSBuYW1lIG9mIHRoZSBTaW5nbGUgUGFnZSBBcHBsaWNhdGlvbiB0byB0cmFja1xuICAgKiBAcGFyYW0gIHtTdHJpbmd9ICAgICAga2V5ICAgVGhlIGtleSBvciBldmVudCBvZiB0aGUgZGF0YVxuICAgKiBAcGFyYW0gIHtDb2xsZWN0aW9ufSAgZGF0YSAgVGhlIGRhdGEgdG8gdHJhY2tcbiAgICovXG4gIHZpZXcoYXBwLCBrZXksIGRhdGEpIHtcbiAgICBsZXQgd3QgPSB0aGlzLndlYnRyZW5kcyhrZXksIGRhdGEpO1xuICAgIGxldCBnYSA9IHRoaXMuZ3RhZ1ZpZXcoYXBwLCBrZXkpO1xuXG4gICAgLyogZXNsaW50LWRpc2FibGUgbm8tY29uc29sZSAqL1xuICAgIGlmIChwcm9jZXNzLmVudi5OT0RFX0VOViAhPT0gJ3Byb2R1Y3Rpb24nKVxuICAgICAgY29uc29sZS5kaXIoeydUcmFjayc6IFt3dCwgZ2FdfSk7XG4gICAgLyogZXNsaW50LWVuYWJsZSBuby1jb25zb2xlICovXG4gIH07XG5cbiAgLyoqXG4gICAqIFB1c2ggRXZlbnRzIHRvIFdlYnRyZW5kc1xuICAgKlxuICAgKiBAcGFyYW0gIHtTdHJpbmd9ICAgICAga2V5ICAgVGhlIGtleSBvciBldmVudCBvZiB0aGUgZGF0YVxuICAgKiBAcGFyYW0gIHtDb2xsZWN0aW9ufSAgZGF0YSAgVGhlIGRhdGEgdG8gdHJhY2tcbiAgICovXG4gIHdlYnRyZW5kcyhrZXksIGRhdGEpIHtcbiAgICBpZiAoXG4gICAgICB0eXBlb2YgV2VidHJlbmRzID09PSAndW5kZWZpbmVkJyB8fFxuICAgICAgdHlwZW9mIGRhdGEgPT09ICd1bmRlZmluZWQnIHx8XG4gICAgICAhdGhpcy5kZXNpbmF0aW9ucy5pbmNsdWRlcygnd2VidHJlbmRzJylcbiAgICApXG4gICAgICByZXR1cm4gZmFsc2U7XG5cbiAgICBsZXQgZXZlbnQgPSBbe1xuICAgICAgJ1dULnRpJzoga2V5XG4gICAgfV07XG5cbiAgICBpZiAoZGF0YVswXSAmJiBkYXRhWzBdLmhhc093blByb3BlcnR5KFRyYWNrLmtleSkpXG4gICAgICBldmVudC5wdXNoKHtcbiAgICAgICAgJ0RDUy5kY3N1cmknOiBkYXRhWzBdW1RyYWNrLmtleV1cbiAgICAgIH0pO1xuICAgIGVsc2VcbiAgICAgIE9iamVjdC5hc3NpZ24oZXZlbnQsIGRhdGEpO1xuXG4gICAgLy8gRm9ybWF0IGRhdGEgZm9yIFdlYnRyZW5kc1xuICAgIGxldCB3dGQgPSB7YXJnc2E6IGV2ZW50LmZsYXRNYXAoZSA9PiB7XG4gICAgICByZXR1cm4gT2JqZWN0LmtleXMoZSkuZmxhdE1hcChrID0+IFtrLCBlW2tdXSk7XG4gICAgfSl9O1xuXG4gICAgLy8gSWYgJ2FjdGlvbicgaXMgdXNlZCBhcyB0aGUga2V5IChmb3IgZ3RhZy5qcyksIHN3aXRjaCBpdCB0byBXZWJ0cmVuZHNcbiAgICBsZXQgYWN0aW9uID0gZGF0YS5hcmdzYS5pbmRleE9mKCdhY3Rpb24nKTtcblxuICAgIGlmIChhY3Rpb24pIGRhdGEuYXJnc2FbYWN0aW9uXSA9ICdEQ1MuZGNzdXJpJztcblxuICAgIC8vIFdlYnRyZW5kcyBkb2Vzbid0IHNlbmQgdGhlIHBhZ2UgdmlldyBmb3IgTXVsdGlUcmFjaywgYWRkIHBhdGggdG8gdXJsXG4gICAgbGV0IGRjc3VyaSA9IGRhdGEuYXJnc2EuaW5kZXhPZignRENTLmRjc3VyaScpO1xuXG4gICAgaWYgKGRjc3VyaSlcbiAgICAgIGRhdGEuYXJnc2FbZGNzdXJpICsgMV0gPSB3aW5kb3cubG9jYXRpb24ucGF0aG5hbWUgKyBkYXRhLmFyZ3NhW2Rjc3VyaSArIDFdO1xuXG4gICAgLyogZXNsaW50LWRpc2FibGUgbm8tdW5kZWYgKi9cbiAgICBpZiAodHlwZW9mIFdlYnRyZW5kcyAhPT0gJ3VuZGVmaW5lZCcpXG4gICAgICBXZWJ0cmVuZHMubXVsdGlUcmFjayh3dGQpO1xuICAgIC8qIGVzbGludC1kaXNhYmxlIG5vLXVuZGVmICovXG5cbiAgICByZXR1cm4gWydXZWJ0cmVuZHMnLCB3dGRdO1xuICB9O1xuXG4gIC8qKlxuICAgKiBQdXNoIENsaWNrIEV2ZW50cyB0byBHb29nbGUgQW5hbHl0aWNzXG4gICAqXG4gICAqIEBwYXJhbSAge1N0cmluZ30gICAgICBrZXkgICBUaGUga2V5IG9yIGV2ZW50IG9mIHRoZSBkYXRhXG4gICAqIEBwYXJhbSAge0NvbGxlY3Rpb259ICBkYXRhICBUaGUgZGF0YSB0byB0cmFja1xuICAgKi9cbiAgZ3RhZyhrZXksIGRhdGEpIHtcbiAgICBpZiAoXG4gICAgICB0eXBlb2YgZ3RhZyA9PT0gJ3VuZGVmaW5lZCcgfHxcbiAgICAgIHR5cGVvZiBkYXRhID09PSAndW5kZWZpbmVkJyB8fFxuICAgICAgIXRoaXMuZGVzaW5hdGlvbnMuaW5jbHVkZXMoJ2d0YWcnKVxuICAgIClcbiAgICAgIHJldHVybiBmYWxzZTtcblxuICAgIGxldCB1cmkgPSBkYXRhLmZpbmQoKGVsZW1lbnQpID0+IGVsZW1lbnQuaGFzT3duUHJvcGVydHkoVHJhY2sua2V5KSk7XG5cbiAgICBsZXQgZXZlbnQgPSB7XG4gICAgICAnZXZlbnRfY2F0ZWdvcnknOiBrZXlcbiAgICB9O1xuXG4gICAgLyogZXNsaW50LWRpc2FibGUgbm8tdW5kZWYgKi9cbiAgICBndGFnKFRyYWNrLmtleSwgdXJpW1RyYWNrLmtleV0sIGV2ZW50KTtcbiAgICAvKiBlc2xpbnQtZW5hYmxlIG5vLXVuZGVmICovXG5cbiAgICByZXR1cm4gWydndGFnJywgVHJhY2sua2V5LCB1cmlbVHJhY2sua2V5XSwgZXZlbnRdO1xuICB9O1xuXG4gIC8qKlxuICAgKiBQdXNoIFNjcmVlbiBWaWV3IEV2ZW50cyB0byBHb29nbGUgQW5hbHl0aWNzXG4gICAqXG4gICAqIEBwYXJhbSAge1N0cmluZ30gIGFwcCAgVGhlIG5hbWUgb2YgdGhlIGFwcGxpY2F0aW9uXG4gICAqIEBwYXJhbSAge1N0cmluZ30gIGtleSAgVGhlIGtleSBvciBldmVudCBvZiB0aGUgZGF0YVxuICAgKi9cbiAgZ3RhZ1ZpZXcoYXBwLCBrZXkpIHtcbiAgICBpZiAoXG4gICAgICB0eXBlb2YgZ3RhZyA9PT0gJ3VuZGVmaW5lZCcgfHxcbiAgICAgIHR5cGVvZiBkYXRhID09PSAndW5kZWZpbmVkJyB8fFxuICAgICAgIXRoaXMuZGVzaW5hdGlvbnMuaW5jbHVkZXMoJ2d0YWcnKVxuICAgIClcbiAgICAgIHJldHVybiBmYWxzZTtcblxuICAgIGxldCB2aWV3ID0ge1xuICAgICAgYXBwX25hbWU6IGFwcCxcbiAgICAgIHNjcmVlbl9uYW1lOiBrZXlcbiAgICB9O1xuXG4gICAgLyogZXNsaW50LWRpc2FibGUgbm8tdW5kZWYgKi9cbiAgICBndGFnKCdldmVudCcsICdzY3JlZW5fdmlldycsIHZpZXcpO1xuICAgIC8qIGVzbGludC1lbmFibGUgbm8tdW5kZWYgKi9cblxuICAgIHJldHVybiBbJ2d0YWcnLCBUcmFjay5rZXksICdzY3JlZW5fdmlldycsIHZpZXddO1xuICB9O1xufVxuXG4vKiogQHR5cGUge1N0cmluZ30gVGhlIG1haW4gc2VsZWN0b3IgdG8gYWRkIHRoZSB0cmFja2luZyBmdW5jdGlvbiB0byAqL1xuVHJhY2suc2VsZWN0b3IgPSAnW2RhdGEtanMqPVwidHJhY2tcIl0nO1xuXG4vKiogQHR5cGUge1N0cmluZ30gVGhlIG1haW4gZXZlbnQgdHJhY2tpbmcga2V5IHRvIG1hcCB0byBXZWJ0cmVuZHMgRENTLnVyaSAqL1xuVHJhY2sua2V5ID0gJ2V2ZW50JztcblxuLyoqIEB0eXBlIHtBcnJheX0gV2hhdCBkZXN0aW5hdGlvbnMgdG8gcHVzaCBkYXRhIHRvICovXG5UcmFjay5kZXN0aW5hdGlvbnMgPSBbXG4gICd3ZWJ0cmVuZHMnLFxuICAnZ3RhZydcbl07XG5cbmV4cG9ydCBkZWZhdWx0IFRyYWNrOyIsImltcG9ydCAnLi9tb2R1bGVzL3BvbHlmaWxsLXJlbW92ZSc7XG5cbmltcG9ydCByZXF1ZXN0Rm9ybSBmcm9tICcuL21vZHVsZXMvc3VibWlzc2lvbi5qcyc7XG5pbXBvcnQgc3dhZ2dlciBmcm9tICcuL21vZHVsZXMvc3dhZ2dlci5qcyc7XG5pbXBvcnQgYnVsa1N1Ym1pc3Npb24gZnJvbSAnLi9tb2R1bGVzL2J1bGstc3VibWlzc2lvbi5qcyc7XG5pbXBvcnQgY2hhbmdlUGFzc3dvcmQgZnJvbSAnLi9tb2R1bGVzL2NoYW5nZS1wYXNzd29yZC5qcyc7XG5pbXBvcnQgcmVxdWVzdEZvcm1KU09OIGZyb20gJy4vbW9kdWxlcy9yZXF1ZXN0LWZvcm0tanNvbi5qcyc7XG5cbmltcG9ydCBJY29ucyBmcm9tICdAbnljb3Bwb3J0dW5pdHkvcHR0cm4tc2NyaXB0cy9zcmMvaWNvbnMvaWNvbnMnO1xuaW1wb3J0IFRvZ2dsZSBmcm9tICdAbnljb3Bwb3J0dW5pdHkvcHR0cm4tc2NyaXB0cy9zcmMvdG9nZ2xlL3RvZ2dsZSc7XG5pbXBvcnQgVHJhY2sgZnJvbSAnQG55Y29wcG9ydHVuaXR5L3B0dHJuLXNjcmlwdHMvc3JjL3RyYWNrL3RyYWNrJztcblxuY29uc3QgY2RuID0gQ0ROX0JBU0UgKyBDRE4gKyAnLyc7XG5cbm5ldyBJY29ucygnc3ZnL255Y28tcGF0dGVybnMuc3ZnJyk7IC8vIGh0dHBzOi8vY2RuLmpzZGVsaXZyLm5ldC9naC9jaXR5b2ZuZXd5b3JrL255Y28tcGF0dGVybnNAdjIuNi44L2Rpc3Qvc3ZnL2ljb25zLnN2Z1xubmV3IEljb25zKCdzdmcvYWNjZXNzLXBhdHRlcm5zLnN2ZycpOyAvLyBodHRwczovL2Nkbi5qc2RlbGl2ci5uZXQvZ2gvY2l0eW9mbmV3eW9yay9hY2Nlc3MtbnljLXBhdHRlcm5zQHYwLjE1LjE0L2Rpc3Qvc3ZnL2ljb25zLnN2Z1xubmV3IEljb25zKCdzdmcvZmVhdGhlci5zdmcnKTtcblxubmV3IFRvZ2dsZSgpO1xubmV3IFRyYWNrKCk7XG5cbmlmICgod2luZG93LmxvY2F0aW9uLnBhdGhuYW1lLmluZGV4T2YoJ2VuZHBvaW50cycpID49IDApKVxuICBzd2FnZ2VyKGNkbik7XG5cbmlmICgod2luZG93LmxvY2F0aW9uLnBhdGhuYW1lLmluZGV4T2YoJ2Zvcm0nKSA+PSAwKSlcbiAgcmVxdWVzdEZvcm0oKTtcblxuaWYgKCh3aW5kb3cubG9jYXRpb24ucGF0aG5hbWUuaW5kZXhPZigncmVxdWVzdC1idWlsZGVyJykgPj0gMCkpXG4gIHJlcXVlc3RGb3JtSlNPTigpO1xuXG5pZiAoKHdpbmRvdy5sb2NhdGlvbi5wYXRobmFtZS5pbmRleE9mKCdidWxrLXN1Ym1pc3Npb24nKSA+PSAwKSlcbiAgYnVsa1N1Ym1pc3Npb24oKTtcblxuaWYgKCh3aW5kb3cubG9jYXRpb24ucGF0aG5hbWUuaW5kZXhPZignY2hhbmdlLXBhc3N3b3JkJykgPj0gMCkpXG4gIGNoYW5nZVBhc3N3b3JkKCk7XG5cbi8vIEdldCB0aGUgY29udGVudCBtYXJrZG93biBmcm9tIENETiBhbmQgYXBwZW5kXG5sZXQgbWFya2Rvd25zID0gJCgnYm9keScpLmZpbmQoJ1tpZF49XCJtYXJrZG93blwiXScpO1xuXG5tYXJrZG93bnMuZWFjaChmdW5jdGlvbigpIHtcbiAgbGV0IHRhcmdldCA9ICQodGhpcyk7XG4gIGxldCBmaWxlID0gJCh0aGlzKS5hdHRyKCdpZCcpLnJlcGxhY2UoJ21hcmtkb3duLScsICcnKTtcblxuICAkLmdldChjZG4gKyBmaWxlICsgJy5tZCcsIGZ1bmN0aW9uKGRhdGEpIHtcbiAgICBzaG93ZG93bi5zZXRGbGF2b3IoJ2dpdGh1YicpO1xuXG4gICAgbGV0IGNvbnZlcnRlciA9IG5ldyBzaG93ZG93bi5Db252ZXJ0ZXIoe3RhYmxlczogdHJ1ZX0pO1xuICAgIGxldCBodG1sID0gY29udmVydGVyLm1ha2VIdG1sKGRhdGEpO1xuXG4gICAgdGFyZ2V0LmFwcGVuZChodG1sKVxuICAgICAgLmhpZGUoKVxuICAgICAgLmZhZGVJbigyNTApXG5cbiAgfSwgJ3RleHQnKVxufSk7XG4iXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7O0VBQUEsQ0FBQyxTQUFTLEdBQUcsRUFBRTtFQUNmLEVBQUUsR0FBRyxDQUFDLE9BQU8sQ0FBQyxTQUFTLElBQUksRUFB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SSxJQUFJLElBQUksQ0FBQyxRQUFRLENBQUMsU0FBUztFQUMvQixNQUFNLElBQUksQ0FBQyxlQUFlLENBQUMsSUFBSSxDQUFDLFNBQVMsQ0FBQyxDQUFDO0FBQzNDO0VBQ0E7RUFDQTtFQUNBO0FBQ0E7RUFDQSxJQUFJLElBQUksSUFBSSxDQUFDLFFBQVEsQ0FBQyxJQUFJLElBQUksSUFBSSxDQUFDLE9BQU8sQ0FBQyxZQUFZLENBQUMsTUFBTSxDQUFDO0VBQy9ELE1BQU0sSUFBSSxDQUFDLE1BQU0sQ0FBQyxJQUFJLENBQUMsT0FBTyxFQUFFLElBQUksQ0FBQyxNQUFNLENBQUMsQ0FBQztBQUM3QztFQUNBO0VBQ0E7RUFDQTtBQUNBO0VBQ0EsSUFBSSxLQUFLLENBQUMsR0FBRyxDQUFDLEVBQUUsQ0FBQyxHQUFHLE1BQU0sQ0FBQyxXQUFXLENBQUMsTUFBTSxFQUFFLENBQUMsRUFBRSxFQUFFO0VBQ3BELE1BQU0sSUFBSSxHQUFHLE1BQU0sQ0FBQyxXQUFXLENBQUMsQ0FBQyxDQUFDLENBQUM7RUFDbkMsTUFBTSxLQUFLLEdBQUcsSUFBSSxDQUFDLE9BQU8sQ0FBQyxZQUFZLENBQUMsSUFBSSxDQUFDLENBQUM7QUFDOUM7RUFDQSxNQUFNLElBQUksS0FBSyxJQUFJLEVBQUUsSUFBSSxLQUFLO0VBQzlCLFFBQVEsSUFBSSxDQUFDLE9BQU8sQ0FBQyxZQUFZLENBQUMsSUFBSSxFQUFFLENBQUMsS0FBSyxLQUFLLE1BQU0sSUFBSSxPQUFPLEdBQUcsTUFBTSxDQUFDLENBQUM7QUFDL0U7RUFDQTtFQUNBLE1BQU0sSUFBSSxDQUFDLE1BQU0sQ0FBQyxPQUFPLENBQUMsQ0FBQyxLQUFLLEtBQUs7RUFDckMsUUFBUSxJQUFJLEtBQUssS0FBSyxJQUFJLENBQUMsT0FBTyxJQUFJLEtBQUssQ0FBQyxZQUFZLENBQUMsSUFBSSxDQUFDO0VBQzlELFVBQVUsS0FBSyxDQUFDLFlBQVksQ0FBQyxJQUFJLEVBQUUsQ0FBQyxLQUFLLEtBQUssTUFBTSxJQUFJLE9BQU8sR0FBRyxNQUFNLENBQUMsQ0FBQztFQUMxRSxP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
