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
        return '<li>' + toTitleCase(errorMsg) + '</li>'
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

  var cdn = 
    'https://raw.githubusercontent.com/CityOfNewYork/screeningapi-docs/env/development-content/';

  // new Icons('svg/icons.svg');
  new Icons('https://cdn.jsdelivr.net/gh/cityofnewyork/nyco-patterns@v2.6.8/dist/svg/icons.svg');
  new Icons('https://cdn.jsdelivr.net/gh/cityofnewyork/access-nyc-patterns@v0.15.14/dist/svg/icons.svg');

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

  /* Get the content markdown from CDN and append */
  let markdowns = $('body').find('[id^="markdown"]');

  markdowns.each(function() {
    let target = $(this);
    let file = $(this).attr('id').replace('markdown-', '');

    $.get(cdn + file + '.md', function(data) {
      let converter = new showdown.Converter({tables: true});
      let html      = converter.makeHtml(data);

      target.append(html)
        .hide()
        .fadeIn(250);

    }, 'text');
  });

}());
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoic291cmNlLmpzIiwic291cmNlcyI6WyIuLi8uLi9zcmMvanMvbW9kdWxlcy9wb2x5ZmlsbC1yZW1vdmUuanMiLCIuLi8uLi9zcmMvanMvbW9kdWxlcy9yZXNwb25zZXMuanMiLCIuLi8uLi9zcmMvanMvbW9kdWxlcy9zdWJtaXNzaW9uLmpzIiwiLi4vLi4vc3JjL2pzL21vZHVsZXMvc3dhZ2dlci5qcyIsIi4uLy4uL25vZGVfbW9kdWxlcy9Abnljb3Bwb3J0dW5pdHkvcHR0cm4tc2NyaXB0cy9zcmMvZm9ybXMvZm9ybXMuanMiLCIuLi8uLi9zcmMvanMvbW9kdWxlcy91dGlsLmpzIiwiLi4vLi4vc3JjL2pzL21vZHVsZXMvYnVsay1zdWJtaXNzaW9uLmpzIiwiLi4vLi4vc3JjL2pzL21vZHVsZXMvY2hhbmdlLXBhc3N3b3JkLmpzIiwiLi4vLi4vc3JjL2pzL21vZHVsZXMvcmVxdWVzdC1mb3JtLWpzb24uanMiLCIuLi8uLi9ub2RlX21vZHVsZXMvQG55Y29wcG9ydHVuaXR5L3B0dHJuLXNjcmlwdHMvc3JjL2ljb25zL2ljb25zLmpzIiwiLi4vLi4vbm9kZV9tb2R1bGVzL0BueWNvcHBvcnR1bml0eS9wdHRybi1zY3JpcHRzL3NyYy90b2dnbGUvdG9nZ2xlLmpzIiwiLi4vLi4vbm9kZV9tb2R1bGVzL0BueWNvcHBvcnR1bml0eS9wdHRybi1zY3JpcHRzL3NyYy90cmFjay90cmFjay5qcyIsIi4uLy4uL3NyYy9qcy9tYWluLmpzIl0sInNvdXJjZXNDb250ZW50IjpbIihmdW5jdGlvbihhcnIpIHtcbiAgYXJyLmZvckVhY2goZnVuY3Rpb24oaXRlbSkge1xuICAgIGlmIChpdGVtLmhhc093blByb3BlcnR5KCdyZW1vdmUnKSkge1xuICAgICAgcmV0dXJuO1xuICAgIH1cbiAgICBPYmplY3QuZGVmaW5lUHJvcGVydHkoaXRlbSwgJ3JlbW92ZScsIHtcbiAgICAgIGNvbmZpZ3VyYWJsZTogdHJ1ZSxcbiAgICAgIGVudW1lcmFibGU6IHRydWUsXG4gICAgICB3cml0YWJsZTogdHJ1ZSxcbiAgICAgIHZhbHVlOiBmdW5jdGlvbiByZW1vdmUoKSB7XG4gICAgICAgIGlmICh0aGlzLnBhcmVudE5vZGUgIT09IG51bGwpXG4gICAgICAgICAgdGhpcy5wYXJlbnROb2RlLnJlbW92ZUNoaWxkKHRoaXMpO1xuICAgICAgfVxuICAgIH0pO1xuICB9KTtcbn0pKFtcbiAgRWxlbWVudC5wcm90b3R5cGUsXG4gIENoYXJhY3RlckRhdGEucHJvdG90eXBlLFxuICBEb2N1bWVudFR5cGUucHJvdG90eXBlXG5dKTsiLCJleHBvcnQgZGVmYXVsdCBbXG4gIHtcbiAgICBcIkVNQUlMXCI6IFwiUGxlYXNlIGVudGVyIGEgdmFsaWQgZW1haWwuXCJcbiAgfSxcbiAge1xuICAgIFwiRk5BTUVcIjogXCJQbGVhc2UgZW50ZXIgeW91ciBmaXJzdCBuYW1lLlwiXG4gIH0sXG4gIHtcbiAgICBcIkxOQU1FXCI6IFwiUGxlYXNlIGVudGVyIHlvdXIgbGFzdCBuYW1lLlwiXG4gIH0sXG4gIHtcbiAgICBcIk9SR1wiOiBcIlBsZWFzZSBlbnRlciB5b3VyIG9yZ2FuaXphdGlvbi5cIlxuICB9LFxuICB7XG4gICAgXCJFUlJcIjogXCJUaGVyZSB3YXMgYSBwcm9ibGVtIHdpdGggeW91ciByZXF1ZXN0LiBQbGVhc2UgdHJ5IGFnYWluIGxhdGVyIG9yIHNlbmQgdXMgYSBtZXNzYWdlIGF0IDxhIGNsYXNzPVxcXCJ0ZXh0LXByaW1hcnktcmVkXFxcIiBocmVmPVxcXCJtYWlsdG86ZWxpZ2liaWxpdHlhcGlAbnljb3Bwb3J0dW5pdHkubnljLmdvdlxcXCI+ZWxpZ2liaWxpdHlhcGlAbnljb3Bwb3J0dW5pdHkubnljLmdvdjwvYT4uIFdlIHdpbGwgZ2V0IGJhY2sgdG8geW91IGFzIHNvb24gYXMgcG9zc2libGUhXCJcbiAgfSxcbiAge1xuICAgIFwiRVJSX0FMUkVBRFlfUkVRVUVTVEVEXCI6IFwiWW91IGhhdmUgYWxyZWFkeSBtYWRlIGEgcmVxdWVzdC4gSWYgeW91IGhhdmUgbm90IGhlYXJkIGJhY2sgZnJvbSB1cywgcGxlYXNlIHNlbmQgdXMgYSBtZXNzYWdlIGF0IDxhIGNsYXNzPVxcXCJ0ZXh0LXByaW1hcnktcmVkXFxcIiBocmVmPVxcXCJtYWlsdG86ZWxpZ2liaWxpdHlhcGlAbnljb3Bwb3J0dW5pdHkubnljLmdvdlxcXCI+ZWxpZ2liaWxpdHlhcGlAbnljb3Bwb3J0dW5pdHkubnljLmdvdjwvYT4uIFdlIHdpbGwgZ2V0IGJhY2sgdG8geW91IGFzIHNvb24gYXMgcG9zc2libGUhXCJcbiAgfSxcbiAge1xuICAgIFwiRVJSX1RPT19NQU5ZX1JFUVVFU1RTXCI6IFwiSXQgc2VlbXMgdGhhdCB5b3UgaGF2ZSBtYWRlIHRvbyBtYW55IHJlcXVlc3RzLiBQbGVhc2UgdHJ5IGFnYWluIGxhdGVyIG9yIHNlbmQgdXMgYSBtZXNzYWdlIGF0IDxhIGNsYXNzPVxcXCJ0ZXh0LXByaW1hcnktcmVkXFxcIiBocmVmPVxcXCJtYWlsdG86ZWxpZ2liaWxpdHlhcGlAbnljb3Bwb3J0dW5pdHkubnljLmdvdlxcXCI+ZWxpZ2liaWxpdHlhcGlAbnljb3Bwb3J0dW5pdHkubnljLmdvdjwvYT4uIFdlIHdpbGwgZ2V0IGJhY2sgdG8geW91IGFzIHNvb24gYXMgcG9zc2libGUhXCJcbiAgfSxcbiAge1xuICAgIFwiTVNHX1JFQ0FQVENIQVwiOiBcIlRoZXJlJ3Mgb25lIG1vcmUgc3RlcCFcIlxuICB9LFxuICB7XG4gICAgXCJTVUNDRVNTXCI6IFwiVGhhbmsgeW91ISBZb3VyIHJlcXVlc3Qgd2lsbCBiZSByZXZpZXdlZCB3aXRoIGNvbmZpcm1hdGlvbiB3aXRoaW4gMS0yIGJ1c2luZXNzIGRheXMuXCJcbiAgfSxcbiAge1xuICAgIFwiR2VuZXJhbFwiOiB7XG4gICAgICBcImVycm9yXCI6IFwiUGxlYXNlIHJlc29sdmUgaGlnaGxpZ2h0ZWQgZmllbGRzLlwiLFxuICAgICAgXCJ3YXJuaW5nXCI6IFwiUmVzb2x2aW5nIHRoZSBmb2xsb3dpbmcgbWlnaHQgZ2VuZXJhdGUgZGlmZmVyZW50IHNjcmVlbmluZyByZXN1bHRzIGZvciB0aGlzIGhvdXNlaG9sZCAob3B0aW9uYWwpOlwiXG4gICAgfVxuICB9LFxuICB7XG4gICAgXCJIb3VzZWhvbGRcIjoge1xuICAgICAgXCJlcnJfZXhjZXNzX21lbWJlcnNcIjogXCJIb3VzZWhvbGQ6IFRoZSBudW1iZXIgb2YgaG91c2Vob2xkIG1lbWJlcnMgbXVzdCBiZSBiZXR3ZWVuIDEgYW5kIDggbWVtYmVycy5cIixcbiAgICAgIFwid2FybmluZ19yZW50YWxfdHlwZVwiOiBcIkhvdXNlaG9sZDogVGhlcmUgc2hvdWxkIGJlIGEgcmVudGFsIHR5cGUuXCJcbiAgICB9XG4gIH0sXG4gIHtcbiAgICBcIlBlcnNvblwiOiB7XG4gICAgICBcImVycl9udW1fcGVyc29uc1wiOiBcIlBlcnNvbjogVGhlIG51bWJlciBvZiBwZXJzb25zIGNhbm5vdCBleGNlZWQgOCBtZW1iZXJzXCIsXG4gICAgICBcImVycl9ob2hcIjogXCJQZXJzb246IEV4YWN0bHkgb25lIHBlcnNvbiBtdXN0IGJlIHRoZSBoZWFkIG9mIGhvdXNlaG9sZC5cIixcbiAgICAgIFwid2FybmluZ19vbl9sZWFzZVwiOiBcIlBlcnNvbjogQXQgbGVhc3Qgb25lIHBlcnNvbiBzaG91bGQgYmUgb24gdGhlIGxlYXNlLlwiLFxuICAgICAgXCJ3YXJuaW5nX29uX2RlZWRcIjogXCJQZXJzb246IEF0IGxlYXN0IG9uZSBwZXJzb24gc2hvdWxkIGJlIG9uIHRoZSBkZWVkLlwiXG4gICAgfVxuICB9XG5dXG4iLCJpbXBvcnQgcmVzcG9uc2VzIGZyb20gJy4vcmVzcG9uc2VzLmpzJztcblxuZXhwb3J0IGRlZmF1bHQgZnVuY3Rpb24oKSB7XG4gIGNvbnN0IGVycm9yTXNnID0gJ1BsZWFzZSBlbnRlciB5b3VyIGZpcnN0IG5hbWUsIGxhc3QgbmFtZSwgZW1haWwgYW5kIG9yZ2FuaXphdGlvbi4nO1xuXG4gIC8qKlxuICAqIFZhbGlkYXRlIGZvcm0gZmllbGRzXG4gICogQHBhcmFtIHtvYmplY3R9IGZvcm1EYXRhIC0gZm9ybSBmaWVsZHNcbiAgKiBAcGFyYW0ge29iamVjdH0gZXZlbnQgLSBldmVudCBvYmplY3RcbiAgKi9cbiAgZnVuY3Rpb24gdmFsaWRhdGVGaWVsZHMoZm9ybSwgZXZlbnQpIHtcbiAgICBldmVudC5wcmV2ZW50RGVmYXVsdCgpO1xuXG4gICAgY29uc3QgZmllbGRzID0gZm9ybS5zZXJpYWxpemVBcnJheSgpLnJlZHVjZSgob2JqLCBpdGVtKSA9PiAob2JqW2l0ZW0ubmFtZV0gPSBpdGVtLnZhbHVlLCBvYmopICx7fSlcbiAgICBjb25zdCByZXF1aXJlZEZpZWxkcyA9IGZvcm0uZmluZCgnW3JlcXVpcmVkXScpO1xuICAgIGNvbnN0IGVtYWlsUmVnZXggPSBuZXcgUmVnRXhwKC9cXFMrQFxcUytcXC5cXFMrLyk7XG4gICAgbGV0IGhhc0Vycm9ycyA9IGZhbHNlO1xuXG4gICAgLy8gbG9vcCB0aHJvdWdoIGVhY2ggcmVxdWlyZWQgZmllbGRcbiAgICByZXF1aXJlZEZpZWxkcy5lYWNoKGZ1bmN0aW9uKCkge1xuICAgICAgY29uc3QgZmllbGROYW1lID0gJCh0aGlzKS5hdHRyKCduYW1lJyk7XG5cbiAgICAgIGlmKCAhZmllbGRzW2ZpZWxkTmFtZV0gfHxcbiAgICAgICAgKGZpZWxkTmFtZSA9PSAnRU1BSUwnICYmICFlbWFpbFJlZ2V4LnRlc3QoZmllbGRzLkVNQUlMKSkgKSB7XG4gICAgICAgIGhhc0Vycm9ycyA9IHRydWU7XG4gICAgICAgICQodGhpcykuYWRkQ2xhc3MoJ2lzLWVycm9yJyk7XG4gICAgICAgICQodGhpcykuYWRkQ2xhc3MoJ2JvcmRlci1wcmltYXJ5LXJlZCcpO1xuICAgICAgICAkKHRoaXMpLmJlZm9yZSgnPHAgY2xhc3M9XCJpcy1lcnJvciB0ZXh0LXByaW1hcnktcmVkIHRleHQtc21hbGwgbXktMFwiPicrIHJlc3BvbnNlcy5maW5kKHggPT4geFtmaWVsZE5hbWVdKVtmaWVsZE5hbWVdICsgJzwvcD4nKTtcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgICQodGhpcykucmVtb3ZlQ2xhc3MoJ2JvcmRlci1wcmltYXJ5LXJlZCcpO1xuICAgICAgfVxuICAgIH0pO1xuXG4gICAgLy8gaWYgdGhlcmUgYXJlIG5vIGVycm9ycywgc3VibWl0XG4gICAgaWYgKGhhc0Vycm9ycykge1xuICAgICAgZm9ybS5maW5kKCcuZm9ybS1lcnJvcicpLmh0bWwoYDxwPiR7ZXJyb3JNc2d9PC9wPmApO1xuICAgIH0gZWxzZSB7XG4gICAgICBzdWJtaXRTaWdudXAoZm9ybSwgZmllbGRzKTtcbiAgICB9XG4gIH1cblxuICAvKipcbiAgKiBTdWJtaXRzIHRoZSBmb3JtIG9iamVjdCB0byBNYWlsY2hpbXBcbiAgKiBAcGFyYW0ge29iamVjdH0gZm9ybURhdGEgLSBmb3JtIGZpZWxkc1xuICAqL1xuICBmdW5jdGlvbiBzdWJtaXRTaWdudXAoZm9ybSwgZm9ybURhdGEpe1xuICAgICQuYWpheCh7XG4gICAgICB1cmw6IGZvcm0uYXR0cignYWN0aW9uJyksXG4gICAgICB0eXBlOiBmb3JtLmF0dHIoJ21ldGhvZCcpLFxuICAgICAgZGF0YVR5cGU6ICdqc29uJywvL25vIGpzb25wXG4gICAgICBjYWNoZTogZmFsc2UsXG4gICAgICBkYXRhOiBmb3JtRGF0YSxcbiAgICAgIGNvbnRlbnRUeXBlOiBcImFwcGxpY2F0aW9uL2pzb247IGNoYXJzZXQ9dXRmLThcIixcbiAgICAgIHN1Y2Nlc3M6IGZ1bmN0aW9uKHJlc3BvbnNlKSB7XG4gICAgICAgIGlmKHJlc3BvbnNlLnJlc3VsdCAhPT0gJ3N1Y2Nlc3MnKXtcbiAgICAgICAgICAgIGlmKHJlc3BvbnNlLm1zZy5pbmNsdWRlcygnYWxyZWFkeSBzdWJzY3JpYmVkJykpe1xuICAgICAgICAgICAgICBmb3JtLmh0bWwoJzxwIGNsYXNzPVwidGV4dC1wcmltYXJ5LXJlZCB0ZXh0LWNlbnRlciBpdGFsaWNcIj4nKyByZXNwb25zZXMuZmluZCh4ID0+IHhbXCJFUlJfQUxSRUFEWV9SRVFVRVNURURcIl0pW1wiRVJSX0FMUkVBRFlfUkVRVUVTVEVEXCJdICsgJzwvcD4nKTtcbiAgICAgICAgICAgIH0gZWxzZSBpZihyZXNwb25zZS5tc2cuaW5jbHVkZXMoJ3RvbyBtYW55IHJlY2VudCBzaWdudXAgcmVxdWVzdHMnKSl7XG4gICAgICAgICAgICAgIGZvcm0uaHRtbCgnPHAgY2xhc3M9XCJ0ZXh0LXByaW1hcnktcmVkIHRleHQtY2VudGVyIGl0YWxpY1wiPicrIHJlc3BvbnNlcy5maW5kKHggPT4geFtcIkVSUl9UT09fTUFOWV9SRVFVRVNUU1wiXSlbXCJFUlJfVE9PX01BTllfUkVRVUVTVFNcIl0gKyc8L3A+Jyk7XG4gICAgICAgICAgICB9IGVsc2UgaWYocmVzcG9uc2UubXNnLmluY2x1ZGVzKCdjYXB0Y2hhJykpe1xuICAgICAgICAgICAgICB2YXIgdXJsID0gJChcImZvcm0jbWMtZW1iZWRkZWQtc3Vic2NyaWJlLWZvcm1cIikuYXR0cihcImFjdGlvblwiKTtcbiAgICAgICAgICAgICAgdmFyIHBhcmFtZXRlcnMgPSAkLnBhcmFtKHJlc3BvbnNlLnBhcmFtcyk7XG4gICAgICAgICAgICAgIHVybCA9IHVybC5zcGxpdChcIi1qc29uP1wiKVswXTtcbiAgICAgICAgICAgICAgdXJsICs9IFwiP1wiO1xuICAgICAgICAgICAgICB1cmwgKz0gcGFyYW1ldGVycztcbiAgICAgICAgICAgICAgd2luZG93Lm9wZW4odXJsLCAnX2JsYW5rJyk7XG4gICAgICAgICAgICAgIGZvcm0uaHRtbCgnPHAgY2xhc3M9XCJ0ZXh0LXByaW1hcnktbmF2eSB0ZXh0LWNlbnRlciBpdGFsaWNcIj4nKyByZXNwb25zZXMuZmluZCh4ID0+IHhbXCJNU0dfUkVDQVBUQ0hBXCJdKVtcIk1TR19SRUNBUFRDSEFcIl0gKyc8YSBjbGFzcz1cInRleHQtcHJpbWFyeS1yZWRcIiB0YXJnZXQ9XCJfYmxhbmtcIiBocmVmPVwiJyArIHVybCArICdcIj4gUGxlYXNlIGNvbmZpcm0gdGhhdCB5b3UgYXJlIG5vdCBhIHJvYm90LjwvYT48L3A+Jyk7XG4gICAgICAgICAgICB9ZWxzZSB7XG4gICAgICAgICAgICAgIGZvcm0uaHRtbCgnPHAgY2xhc3M9XCJ0ZXh0LXByaW1hcnktcmVkIHRleHQtY2VudGVyIGl0YWxpY1wiPicgKyByZXNwb25zZXMuZmluZCh4ID0+IHhbXCJFUlJcIl0pW1wiRVJSXCJdICsgJzwvcD4nKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfWVsc2Uge1xuICAgICAgICAgIGZvcm0uaHRtbCgnPHAgY2xhc3M9XCJ0ZXh0LXByaW1hcnktbmF2eSB0ZXh0LWNlbnRlciBpdGFsaWNcIj4nKyByZXNwb25zZXMuZmluZCh4ID0+IHhbXCJTVUNDRVNTXCJdKVtcIlNVQ0NFU1NcIl0gKyc8L3A+Jyk7XG4gICAgICAgIH1cbiAgICAgIH0sXG4gICAgICBlcnJvcjogZnVuY3Rpb24ocmVzcG9uc2UpIHtcbiAgICAgICAgY29uc29sZS5sb2cocmVzcG9uc2UpXG4gICAgICAgIGZvcm0uYmVmb3JlKCc8cCBjbGFzcz1cInRleHQtcHJpbWFyeS1yZWQgdGV4dC1jZW50ZXIgaXRhbGljXCI+JyArIHJlc3BvbnNlcy5maW5kKHggPT4geFtcIkVSUlwiXSlbXCJFUlJcIl0gKyAnPC9wPicpO1xuICAgICAgfVxuICAgIH0pO1xuICB9XG5cbiAgLyoqXG4gICogVHJpZ2dlcnMgZm9ybSB2YWxpZGF0aW9uIGFuZCBzZW5kcyB0aGUgZm9ybSBkYXRhIHRvIE1haWxjaGltcFxuICAqIEBwYXJhbSB7b2JqZWN0fSBmb3JtRGF0YSAtIGZvcm0gZmllbGRzXG4gICovXG4gICQoJyNtYy1lbWJlZGRlZC1zdWJzY3JpYmU6YnV0dG9uW3R5cGU9XCJzdWJtaXRcIl0nKS5jbGljayhmdW5jdGlvbihldmVudCl7XG4gICAgZXZlbnQucHJldmVudERlZmF1bHQoKTtcbiAgICBsZXQgJGZvcm0gPSAkKHRoaXMpLnBhcmVudHMoJ2Zvcm0nKTtcbiAgICB2YWxpZGF0ZUZpZWxkcygkZm9ybSwgZXZlbnQpO1xuICB9KTtcblxufVxuIiwiZXhwb3J0IGRlZmF1bHQgZnVuY3Rpb24oY2RuKSB7XG4gIGNvbnN0IGNvbnRyb2xsZXIgPSBuZXcgQWJvcnRDb250cm9sbGVyKClcblxuICB3aW5kb3cuZWRpdG9yID0gU3dhZ2dlckVkaXRvckJ1bmRsZSh7XG4gICAgZG9tX2lkOiAnI3N3YWdnZXItZWRpdG9yJyxcbiAgICB1cmw6IGNkbiArICdlbmRwb2ludHMueW1sJ1xuICB9KTtcblxuICAkKCcuU3BsaXRQYW5lJykuY3NzKCdwb3NpdGlvbicsICdyZWxhdGl2ZScpO1xuICAkKCcuUGFuZTEnKS5jc3MoJ2Rpc3BsYXknLCAnbm9uZScpO1xuICAkKCcuUGFuZTInKS5jc3MoJ3dpZHRoJywgJzEwMCUnKTtcblxuICAvLyBnZW5lcmF0ZSBjdXJsIGNvbW1hbmQgdG8gdHJ5IGl0IG91dFxuICAkKCdib2R5Jykub24oJ2NsaWNrJywgJy50cnktb3V0X19idG4nLCBmdW5jdGlvbihldmVudCl7XG4gICAgZ2VuZXJhdGVDdXJsKHRoaXMpXG4gIH0pXG5cbiAgJCgnYm9keScpLm9uKCdrZXl1cCcsICdbcGxhY2Vob2xkZXJePWludGVyZXN0ZWRQcm9ncmFtc10nLCBmdW5jdGlvbihldmVudCl7XG4gICAgZ2VuZXJhdGVDdXJsKHRoaXMpO1xuICB9KVxuXG4gICQoJ2JvZHknKS5vbigna2V5dXAnLCAnW3BsYWNlaG9sZGVyXj1BdXRob3JpemF0aW9uXScsIGZ1bmN0aW9uKGV2ZW50KXtcbiAgICBnZW5lcmF0ZUN1cmwodGhpcyk7XG4gIH0pXG5cbiAgJCgnYm9keScpLm9uKCdrZXl1cCcsICdbY2xhc3NePWJvZHktcGFyYW1fX3RleHRdJywgZnVuY3Rpb24oZXZlbnQpe1xuICAgIGdlbmVyYXRlQ3VybCh0aGlzKTtcbiAgfSlcblxuICAkKCdib2R5Jykub24oJ2NoYW5nZScsICdbdHlwZV49ZmlsZV0nLCBmdW5jdGlvbihldmVudCl7XG4gICAgZ2VuZXJhdGVDdXJsKHRoaXMpO1xuICB9KVxuXG4gIC8vICQoJyNzd2FnZ2VyLWVkaXRvcicpLmZhZGVJbigyNTAwKVxuXG4gIGZ1bmN0aW9uIGdlbmVyYXRlQ3VybChvYmopIHtcbiAgICBjb25zdCBkb21haW4gPSAkKCdib2R5JykuZmluZCgnLnNlcnZlcnMgOnNlbGVjdGVkJykudGV4dCgpO1xuICAgIGNvbnN0IGVwX2lkID0gJChvYmopLnBhcmVudHMoJy5vcGJsb2NrLXBvc3Q6Zmlyc3QnKS5hdHRyKCdpZCcpO1xuICAgIGNvbnN0IGVwID0gdXRpbC5mb3JtYXQoXCIvJXNcIiwgZXBfaWQuc3Vic3RyKGVwX2lkLmluZGV4T2YoXCJfXCIpICsgMSkucmVwbGFjZShcIl9cIiwgXCIvXCIpKTtcbiAgICBjb25zdCBwYXJfbm9kZSA9ICQob2JqKS5wYXJlbnRzKCcub3BibG9jay1ib2R5OmZpcnN0Jyk7XG4gICAgY29uc3QgZXhhbXBsZUJvZHkgPSBwYXJfbm9kZS5maW5kKCcuYm9keS1wYXJhbV9fZXhhbXBsZScpO1xuICAgIGNvbnN0IHRleHRCb2R5ID0gZXhhbXBsZUJvZHkubGVuZ3RoID4gMCA/IGV4YW1wbGVCb2R5LnRleHQoKSA6IHBhcl9ub2RlLmZpbmQoJy5ib2R5LXBhcmFtX190ZXh0JykudGV4dCgpXG4gICAgY29uc3QgcGFyYW1zID0gdGV4dEJvZHkucmVwbGFjZSgvXFxzL2csJycpO1xuXG4gICAgcGFyX25vZGUuZmluZCgnLmN1cmwnKS5yZW1vdmUoKTtcbiAgICBwYXJfbm9kZS5maW5kKCcuZXhlY3V0ZS13cmFwcGVyJykuYXBwZW5kKGA8cCBjbGFzcz1cImN1cmxcIj5Vc2UgdGhlIGZvbGxvd2luZyBjb21tYW5kIHRvIG1ha2UgYSByZXF1ZXN0IHRvIHRoZSA8c3Ryb25nPiR7ZXB9PC9zdHJvbmc+IGVuZHBvaW50IGJhc2VkIG9uIHRoZSBkYXRhIHNldCBhYm92ZTo8L3A+YCk7XG5cbiAgICBjb25zdCBhdXRoVmFsID0gcGFyX25vZGUuZmluZCgnW3BsYWNlaG9sZGVyXj1BdXRob3JpemF0aW9uXScpLnZhbCgpO1xuICAgIGNvbnN0IGludGVyZXN0ZWRQcm9ncmFtc1ZhbCA9IHBhcl9ub2RlLmZpbmQoJ1twbGFjZWhvbGRlcl49aW50ZXJlc3RlZFByb2dyYW1zXScpLnZhbCgpO1xuICAgIGNvbnN0IHF1ZXJ5ID0gaW50ZXJlc3RlZFByb2dyYW1zVmFsID8gYD9pbnRlcmVzdGVkUHJvZ3JhbXM9JHtpbnRlcmVzdGVkUHJvZ3JhbXNWYWx9YCA6IFwiXCJcbiAgICBpZiAoZXBfaWQuaW5jbHVkZXMoJ0F1dGhlbnRpY2F0aW9uJykpIHtcbiAgICAgIGNvbnN0IGF1dGhlbnRpY2F0aW9uQ3VybCA9IGBjdXJsIC1YIFBPU1QgXCIke2RvbWFpbn0ke2VwfVwiIFxcXG4gICAgICAgIC1IICBcImFjY2VwdDogYXBwbGljYXRpb24vanNvblwiIFxcXG4gICAgICAgIC1IICBcIkNvbnRlbnQtVHlwZTogYXBwbGljYXRpb24vanNvblwiIFxcXG4gICAgICAgIC1kIFxcJyR7cGFyYW1zfVxcJ2A7XG4gICAgICBwYXJfbm9kZS5maW5kKCcuZXhlY3V0ZS13cmFwcGVyJykuYXBwZW5kKGA8dGV4dGFyZWEgcmVhZG9ubHk9XCJcIiBjbGFzcz1cImN1cmxcIiBzdHlsZT1cIndoaXRlLXNwYWNlOiBub3JtYWw7XCI+JHthdXRoZW50aWNhdGlvbkN1cmx9PC90ZXh0YXJlYT5gKTtcbiAgICB9IGVsc2UgaWYgKGVwX2lkLmluY2x1ZGVzKCdlbGlnaWJpbGl0eVByb2dyYW1zJykpe1xuICAgICAgY29uc3QgZWxpZ2liaWxpdHlQcm9ncmFtc0N1cmwgPSBgY3VybCAtWCBQT1NUIFwiJHtkb21haW59JHtlcH0ke3F1ZXJ5fVwiIFxcXG4gICAgICAgIC1IIFwiYWNjZXB0OiBhcHBsaWNhdGlvbi9qc29uXCIgXFxcbiAgICAgICAgLUggXCJDb250ZW50LVR5cGU6IGFwcGxpY2F0aW9uL2pzb25cIiBcXFxuICAgICAgICAtSCBcIkF1dGhvcml6YXRpb246ICR7YXV0aFZhbH1cIlxcXG4gICAgICAgIC1kIFxcJyR7cGFyYW1zfVxcJ2A7XG4gICAgICBwYXJfbm9kZS5maW5kKCcuZXhlY3V0ZS13cmFwcGVyJykuYXBwZW5kKGA8dGV4dGFyZWEgcmVhZG9ubHk9XCJcIiBjbGFzcz1cImN1cmxcIiBzdHlsZT1cIndoaXRlLXNwYWNlOiBub3JtYWw7XCI+JHtlbGlnaWJpbGl0eVByb2dyYW1zQ3VybH08L3RleHRhcmVhPmApO1xuICAgIH0gZWxzZSBpZiAoZXBfaWQuaW5jbHVkZXMoJ2J1bGtTdWJtaXNzaW9uJykpIHtcbiAgICAgIGNvbnN0IGlucHV0UGF0aCA9IHBhcl9ub2RlLmZpbmQoJ1t0eXBlXj1maWxlXScpLnZhbCgpO1xuICAgICAgY29uc3QgYnVsa1N1Ym1pc3Npb25DdXJsID0gYGN1cmwgLVggUE9TVCBcIiR7ZG9tYWlufSR7ZXB9JHtxdWVyeX1cIiBcXFxuICAgICAgICAtSCBcImFjY2VwdDogbXVsdGlwYXJ0L2Zvcm0tZGF0YVwiIFxcXG4gICAgICAgIC1IIFwiQ29udGVudC1UeXBlOiBtdWx0aXBhcnQvZm9ybS1kYXRhXCIgXFxcbiAgICAgICAgLUggXCJBdXRob3JpemF0aW9uOiAke2F1dGhWYWx9XCJcXFxuICAgICAgICAtRiBcIj1AJHtpbnB1dFBhdGh9O3R5cGU9dGV4dC9jc3ZcImA7XG4gICAgICBwYXJfbm9kZS5maW5kKCcuZXhlY3V0ZS13cmFwcGVyJykuYXBwZW5kKGA8dGV4dGFyZWEgcmVhZG9ubHk9XCJcIiBjbGFzcz1cImN1cmxcIiBzdHlsZT1cIndoaXRlLXNwYWNlOiBub3JtYWw7XCI+JHtidWxrU3VibWlzc2lvbkN1cmx9PC90ZXh0YXJlYT5gKTtcbiAgICB9XG4gIH1cbn1cbiIsIid1c2Ugc3RyaWN0JztcblxuLyoqXG4gKiBVdGlsaXRpZXMgZm9yIEZvcm0gY29tcG9uZW50c1xuICogQGNsYXNzXG4gKi9cbmNsYXNzIEZvcm1zIHtcbiAgLyoqXG4gICAqIFRoZSBGb3JtIGNvbnN0cnVjdG9yXG4gICAqIEBwYXJhbSAge09iamVjdH0gZm9ybSBUaGUgZm9ybSBET00gZWxlbWVudFxuICAgKi9cbiAgY29uc3RydWN0b3IoZm9ybSA9IGZhbHNlKSB7XG4gICAgdGhpcy5GT1JNID0gZm9ybTtcblxuICAgIHRoaXMuc3RyaW5ncyA9IEZvcm1zLnN0cmluZ3M7XG5cbiAgICB0aGlzLnN1Ym1pdCA9IEZvcm1zLnN1Ym1pdDtcblxuICAgIHRoaXMuY2xhc3NlcyA9IEZvcm1zLmNsYXNzZXM7XG5cbiAgICB0aGlzLm1hcmt1cCA9IEZvcm1zLm1hcmt1cDtcblxuICAgIHRoaXMuc2VsZWN0b3JzID0gRm9ybXMuc2VsZWN0b3JzO1xuXG4gICAgdGhpcy5hdHRycyA9IEZvcm1zLmF0dHJzO1xuXG4gICAgdGhpcy5GT1JNLnNldEF0dHJpYnV0ZSgnbm92YWxpZGF0ZScsIHRydWUpO1xuXG4gICAgcmV0dXJuIHRoaXM7XG4gIH1cblxuICAvKipcbiAgICogTWFwIHRvZ2dsZWQgY2hlY2tib3ggdmFsdWVzIHRvIGFuIGlucHV0LlxuICAgKiBAcGFyYW0gIHtPYmplY3R9IGV2ZW50IFRoZSBwYXJlbnQgY2xpY2sgZXZlbnQuXG4gICAqIEByZXR1cm4ge0VsZW1lbnR9ICAgICAgVGhlIHRhcmdldCBlbGVtZW50LlxuICAgKi9cbiAgam9pblZhbHVlcyhldmVudCkge1xuICAgIGlmICghZXZlbnQudGFyZ2V0Lm1hdGNoZXMoJ2lucHV0W3R5cGU9XCJjaGVja2JveFwiXScpKVxuICAgICAgcmV0dXJuO1xuXG4gICAgaWYgKCFldmVudC50YXJnZXQuY2xvc2VzdCgnW2RhdGEtanMtam9pbi12YWx1ZXNdJykpXG4gICAgICByZXR1cm47XG5cbiAgICBsZXQgZWwgPSBldmVudC50YXJnZXQuY2xvc2VzdCgnW2RhdGEtanMtam9pbi12YWx1ZXNdJyk7XG4gICAgbGV0IHRhcmdldCA9IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoZWwuZGF0YXNldC5qc0pvaW5WYWx1ZXMpO1xuXG4gICAgdGFyZ2V0LnZhbHVlID0gQXJyYXkuZnJvbShcbiAgICAgICAgZWwucXVlcnlTZWxlY3RvckFsbCgnaW5wdXRbdHlwZT1cImNoZWNrYm94XCJdJylcbiAgICAgIClcbiAgICAgIC5maWx0ZXIoKGUpID0+IChlLnZhbHVlICYmIGUuY2hlY2tlZCkpXG4gICAgICAubWFwKChlKSA9PiBlLnZhbHVlKVxuICAgICAgLmpvaW4oJywgJyk7XG5cbiAgICByZXR1cm4gdGFyZ2V0O1xuICB9XG5cbiAgLyoqXG4gICAqIEEgc2ltcGxlIGZvcm0gdmFsaWRhdGlvbiBjbGFzcyB0aGF0IHVzZXMgbmF0aXZlIGZvcm0gdmFsaWRhdGlvbi4gSXQgd2lsbFxuICAgKiBhZGQgYXBwcm9wcmlhdGUgZm9ybSBmZWVkYmFjayBmb3IgZWFjaCBpbnB1dCB0aGF0IGlzIGludmFsaWQgYW5kIG5hdGl2ZVxuICAgKiBsb2NhbGl6ZWQgYnJvd3NlciBtZXNzYWdpbmcuXG4gICAqXG4gICAqIFNlZSBodHRwczovL2RldmVsb3Blci5tb3ppbGxhLm9yZy9lbi1VUy9kb2NzL0xlYXJuL0hUTUwvRm9ybXMvRm9ybV92YWxpZGF0aW9uXG4gICAqIFNlZSBodHRwczovL2Nhbml1c2UuY29tLyNmZWF0PWZvcm0tdmFsaWRhdGlvbiBmb3Igc3VwcG9ydFxuICAgKlxuICAgKiBAcGFyYW0gIHtFdmVudH0gICAgICAgICBldmVudCBUaGUgZm9ybSBzdWJtaXNzaW9uIGV2ZW50XG4gICAqIEByZXR1cm4ge0NsYXNzL0Jvb2xlYW59ICAgICAgIFRoZSBmb3JtIGNsYXNzIG9yIGZhbHNlIGlmIGludmFsaWRcbiAgICovXG4gIHZhbGlkKGV2ZW50KSB7XG4gICAgbGV0IHZhbGlkaXR5ID0gZXZlbnQudGFyZ2V0LmNoZWNrVmFsaWRpdHkoKTtcbiAgICBsZXQgZWxlbWVudHMgPSBldmVudC50YXJnZXQucXVlcnlTZWxlY3RvckFsbCh0aGlzLnNlbGVjdG9ycy5SRVFVSVJFRCk7XG5cbiAgICBmb3IgKGxldCBpID0gMDsgaSA8IGVsZW1lbnRzLmxlbmd0aDsgaSsrKSB7XG4gICAgICAvLyBSZW1vdmUgb2xkIG1lc3NhZ2luZyBpZiBpdCBleGlzdHNcbiAgICAgIGxldCBlbCA9IGVsZW1lbnRzW2ldO1xuXG4gICAgICB0aGlzLnJlc2V0KGVsKTtcblxuICAgICAgLy8gSWYgdGhpcyBpbnB1dCB2YWxpZCwgc2tpcCBtZXNzYWdpbmdcbiAgICAgIGlmIChlbC52YWxpZGl0eS52YWxpZCkgY29udGludWU7XG5cbiAgICAgIHRoaXMuaGlnaGxpZ2h0KGVsKTtcbiAgICB9XG5cbiAgICByZXR1cm4gKHZhbGlkaXR5KSA/IHRoaXMgOiB2YWxpZGl0eTtcbiAgfVxuXG4gIC8qKlxuICAgKiBBZGRzIGZvY3VzIGFuZCBibHVyIGV2ZW50cyB0byBpbnB1dHMgd2l0aCByZXF1aXJlZCBhdHRyaWJ1dGVzXG4gICAqIEBwYXJhbSAgIHtvYmplY3R9ICBmb3JtICBQYXNzaW5nIGEgZm9ybSBpcyBwb3NzaWJsZSwgb3RoZXJ3aXNlIGl0IHdpbGwgdXNlXG4gICAqICAgICAgICAgICAgICAgICAgICAgICAgICB0aGUgZm9ybSBwYXNzZWQgdG8gdGhlIGNvbnN0cnVjdG9yLlxuICAgKiBAcmV0dXJuICB7Y2xhc3N9ICAgICAgICAgVGhlIGZvcm0gY2xhc3NcbiAgICovXG4gIHdhdGNoKGZvcm0gPSBmYWxzZSkge1xuICAgIHRoaXMuRk9STSA9IChmb3JtKSA/IGZvcm0gOiB0aGlzLkZPUk07XG5cbiAgICBsZXQgZWxlbWVudHMgPSB0aGlzLkZPUk0ucXVlcnlTZWxlY3RvckFsbCh0aGlzLnNlbGVjdG9ycy5SRVFVSVJFRCk7XG5cbiAgICAvKiogV2F0Y2ggSW5kaXZpZHVhbCBJbnB1dHMgKi9cbiAgICBmb3IgKGxldCBpID0gMDsgaSA8IGVsZW1lbnRzLmxlbmd0aDsgaSsrKSB7XG4gICAgICAvLyBSZW1vdmUgb2xkIG1lc3NhZ2luZyBpZiBpdCBleGlzdHNcbiAgICAgIGxldCBlbCA9IGVsZW1lbnRzW2ldO1xuXG4gICAgICBlbC5hZGRFdmVudExpc3RlbmVyKCdmb2N1cycsICgpID0+IHtcbiAgICAgICAgdGhpcy5yZXNldChlbCk7XG4gICAgICB9KTtcblxuICAgICAgZWwuYWRkRXZlbnRMaXN0ZW5lcignYmx1cicsICgpID0+IHtcbiAgICAgICAgaWYgKCFlbC52YWxpZGl0eS52YWxpZClcbiAgICAgICAgICB0aGlzLmhpZ2hsaWdodChlbCk7XG4gICAgICB9KTtcbiAgICB9XG5cbiAgICAvKiogU3VibWl0IEV2ZW50ICovXG4gICAgdGhpcy5GT1JNLmFkZEV2ZW50TGlzdGVuZXIoJ3N1Ym1pdCcsIChldmVudCkgPT4ge1xuICAgICAgZXZlbnQucHJldmVudERlZmF1bHQoKTtcblxuICAgICAgaWYgKHRoaXMudmFsaWQoZXZlbnQpID09PSBmYWxzZSlcbiAgICAgICAgcmV0dXJuIGZhbHNlO1xuXG4gICAgICB0aGlzLnN1Ym1pdChldmVudCk7XG4gICAgfSk7XG5cbiAgICByZXR1cm4gdGhpcztcbiAgfVxuXG4gIC8qKlxuICAgKiBSZW1vdmVzIHRoZSB2YWxpZGl0eSBtZXNzYWdlIGFuZCBjbGFzc2VzIGZyb20gdGhlIG1lc3NhZ2UuXG4gICAqIEBwYXJhbSAgIHtvYmplY3R9ICBlbCAgVGhlIGlucHV0IGVsZW1lbnRcbiAgICogQHJldHVybiAge2NsYXNzfSAgICAgICBUaGUgZm9ybSBjbGFzc1xuICAgKi9cbiAgcmVzZXQoZWwpIHtcbiAgICBsZXQgY29udGFpbmVyID0gKHRoaXMuc2VsZWN0b3JzLkVSUk9SX01FU1NBR0VfUEFSRU5UKVxuICAgICAgPyBlbC5jbG9zZXN0KHRoaXMuc2VsZWN0b3JzLkVSUk9SX01FU1NBR0VfUEFSRU5UKSA6IGVsLnBhcmVudE5vZGU7XG5cbiAgICBsZXQgbWVzc2FnZSA9IGNvbnRhaW5lci5xdWVyeVNlbGVjdG9yKCcuJyArIHRoaXMuY2xhc3Nlcy5FUlJPUl9NRVNTQUdFKTtcblxuICAgIC8vIFJlbW92ZSBvbGQgbWVzc2FnaW5nIGlmIGl0IGV4aXN0c1xuICAgIGNvbnRhaW5lci5jbGFzc0xpc3QucmVtb3ZlKHRoaXMuY2xhc3Nlcy5FUlJPUl9DT05UQUlORVIpO1xuICAgIGlmIChtZXNzYWdlKSBtZXNzYWdlLnJlbW92ZSgpO1xuXG4gICAgLy8gUmVtb3ZlIGVycm9yIGNsYXNzIGZyb20gdGhlIGZvcm1cbiAgICBjb250YWluZXIuY2xvc2VzdCgnZm9ybScpLmNsYXNzTGlzdC5yZW1vdmUodGhpcy5jbGFzc2VzLkVSUk9SX0NPTlRBSU5FUik7XG5cbiAgICAvLyBSZW1vdmUgZHluYW1pYyBhdHRyaWJ1dGVzIGZyb20gdGhlIGlucHV0XG4gICAgZWwucmVtb3ZlQXR0cmlidXRlKHRoaXMuYXR0cnMuRVJST1JfSU5QVVRbMF0pO1xuICAgIGVsLnJlbW92ZUF0dHJpYnV0ZSh0aGlzLmF0dHJzLkVSUk9SX0xBQkVMKTtcblxuICAgIHJldHVybiB0aGlzO1xuICB9XG5cbiAgLyoqXG4gICAqIERpc3BsYXlzIGEgdmFsaWRpdHkgbWVzc2FnZSB0byB0aGUgdXNlci4gSXQgd2lsbCBmaXJzdCB1c2UgYW55IGxvY2FsaXplZFxuICAgKiBzdHJpbmcgcGFzc2VkIHRvIHRoZSBjbGFzcyBmb3IgcmVxdWlyZWQgZmllbGRzIG1pc3NpbmcgaW5wdXQuIElmIHRoZVxuICAgKiBpbnB1dCBpcyBmaWxsZWQgaW4gYnV0IGRvZXNuJ3QgbWF0Y2ggdGhlIHJlcXVpcmVkIHBhdHRlcm4sIGl0IHdpbGwgdXNlXG4gICAqIGEgbG9jYWxpemVkIHN0cmluZyBzZXQgZm9yIHRoZSBzcGVjaWZpYyBpbnB1dCB0eXBlLiBJZiBvbmUgaXNuJ3QgcHJvdmlkZWRcbiAgICogaXQgd2lsbCB1c2UgdGhlIGRlZmF1bHQgYnJvd3NlciBwcm92aWRlZCBtZXNzYWdlLlxuICAgKiBAcGFyYW0gICB7b2JqZWN0fSAgZWwgIFRoZSBpbnZhbGlkIGlucHV0IGVsZW1lbnRcbiAgICogQHJldHVybiAge2NsYXNzfSAgICAgICBUaGUgZm9ybSBjbGFzc1xuICAgKi9cbiAgaGlnaGxpZ2h0KGVsKSB7XG4gICAgbGV0IGNvbnRhaW5lciA9ICh0aGlzLnNlbGVjdG9ycy5FUlJPUl9NRVNTQUdFX1BBUkVOVClcbiAgICAgID8gZWwuY2xvc2VzdCh0aGlzLnNlbGVjdG9ycy5FUlJPUl9NRVNTQUdFX1BBUkVOVCkgOiBlbC5wYXJlbnROb2RlO1xuXG4gICAgLy8gQ3JlYXRlIHRoZSBuZXcgZXJyb3IgbWVzc2FnZS5cbiAgICBsZXQgbWVzc2FnZSA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQodGhpcy5tYXJrdXAuRVJST1JfTUVTU0FHRSk7XG4gICAgbGV0IGlkID0gYCR7ZWwuZ2V0QXR0cmlidXRlKCdpZCcpfS0ke3RoaXMuY2xhc3Nlcy5FUlJPUl9NRVNTQUdFfWA7XG5cbiAgICAvLyBHZXQgdGhlIGVycm9yIG1lc3NhZ2UgZnJvbSBsb2NhbGl6ZWQgc3RyaW5ncyAoaWYgc2V0KS5cbiAgICBpZiAoZWwudmFsaWRpdHkudmFsdWVNaXNzaW5nICYmIHRoaXMuc3RyaW5ncy5WQUxJRF9SRVFVSVJFRClcbiAgICAgIG1lc3NhZ2UuaW5uZXJIVE1MID0gdGhpcy5zdHJpbmdzLlZBTElEX1JFUVVJUkVEO1xuICAgIGVsc2UgaWYgKCFlbC52YWxpZGl0eS52YWxpZCAmJlxuICAgICAgdGhpcy5zdHJpbmdzW2BWQUxJRF8ke2VsLnR5cGUudG9VcHBlckNhc2UoKX1fSU5WQUxJRGBdKSB7XG4gICAgICBsZXQgc3RyaW5nS2V5ID0gYFZBTElEXyR7ZWwudHlwZS50b1VwcGVyQ2FzZSgpfV9JTlZBTElEYDtcbiAgICAgIG1lc3NhZ2UuaW5uZXJIVE1MID0gdGhpcy5zdHJpbmdzW3N0cmluZ0tleV07XG4gICAgfSBlbHNlXG4gICAgICBtZXNzYWdlLmlubmVySFRNTCA9IGVsLnZhbGlkYXRpb25NZXNzYWdlO1xuXG4gICAgLy8gU2V0IGFyaWEgYXR0cmlidXRlcyBhbmQgY3NzIGNsYXNzZXMgdG8gdGhlIG1lc3NhZ2VcbiAgICBtZXNzYWdlLnNldEF0dHJpYnV0ZSgnaWQnLCBpZCk7XG4gICAgbWVzc2FnZS5zZXRBdHRyaWJ1dGUodGhpcy5hdHRycy5FUlJPUl9NRVNTQUdFWzBdLFxuICAgICAgdGhpcy5hdHRycy5FUlJPUl9NRVNTQUdFWzFdKTtcbiAgICBtZXNzYWdlLmNsYXNzTGlzdC5hZGQodGhpcy5jbGFzc2VzLkVSUk9SX01FU1NBR0UpO1xuXG4gICAgLy8gQWRkIHRoZSBlcnJvciBjbGFzcyBhbmQgZXJyb3IgbWVzc2FnZSB0byB0aGUgZG9tLlxuICAgIGNvbnRhaW5lci5jbGFzc0xpc3QuYWRkKHRoaXMuY2xhc3Nlcy5FUlJPUl9DT05UQUlORVIpO1xuICAgIGNvbnRhaW5lci5pbnNlcnRCZWZvcmUobWVzc2FnZSwgY29udGFpbmVyLmNoaWxkTm9kZXNbMF0pO1xuXG4gICAgLy8gQWRkIHRoZSBlcnJvciBjbGFzcyB0byB0aGUgZm9ybVxuICAgIGNvbnRhaW5lci5jbG9zZXN0KCdmb3JtJykuY2xhc3NMaXN0LmFkZCh0aGlzLmNsYXNzZXMuRVJST1JfQ09OVEFJTkVSKTtcblxuICAgIC8vIEFkZCBkeW5hbWljIGF0dHJpYnV0ZXMgdG8gdGhlIGlucHV0XG4gICAgZWwuc2V0QXR0cmlidXRlKHRoaXMuYXR0cnMuRVJST1JfSU5QVVRbMF0sIHRoaXMuYXR0cnMuRVJST1JfSU5QVVRbMV0pO1xuICAgIGVsLnNldEF0dHJpYnV0ZSh0aGlzLmF0dHJzLkVSUk9SX0xBQkVMLCBpZCk7XG5cbiAgICByZXR1cm4gdGhpcztcbiAgfVxufVxuXG4vKipcbiAqIEEgZGljdGlvbmFpcnkgb2Ygc3RyaW5ncyBpbiB0aGUgZm9ybWF0LlxuICoge1xuICogICAnVkFMSURfUkVRVUlSRUQnOiAnVGhpcyBpcyByZXF1aXJlZCcsXG4gKiAgICdWQUxJRF97eyBUWVBFIH19X0lOVkFMSUQnOiAnSW52YWxpZCdcbiAqIH1cbiAqL1xuRm9ybXMuc3RyaW5ncyA9IHt9O1xuXG4vKiogUGxhY2Vob2xkZXIgZm9yIHRoZSBzdWJtaXQgZnVuY3Rpb24gKi9cbkZvcm1zLnN1Ym1pdCA9IGZ1bmN0aW9uKCkge307XG5cbi8qKiBDbGFzc2VzIGZvciB2YXJpb3VzIGNvbnRhaW5lcnMgKi9cbkZvcm1zLmNsYXNzZXMgPSB7XG4gICdFUlJPUl9NRVNTQUdFJzogJ2Vycm9yLW1lc3NhZ2UnLCAvLyBlcnJvciBjbGFzcyBmb3IgdGhlIHZhbGlkaXR5IG1lc3NhZ2VcbiAgJ0VSUk9SX0NPTlRBSU5FUic6ICdlcnJvcicsIC8vIGNsYXNzIGZvciB0aGUgdmFsaWRpdHkgbWVzc2FnZSBwYXJlbnRcbiAgJ0VSUk9SX0ZPUk0nOiAnZXJyb3InXG59O1xuXG4vKiogSFRNTCB0YWdzIGFuZCBtYXJrdXAgZm9yIHZhcmlvdXMgZWxlbWVudHMgKi9cbkZvcm1zLm1hcmt1cCA9IHtcbiAgJ0VSUk9SX01FU1NBR0UnOiAnZGl2Jyxcbn07XG5cbi8qKiBET00gU2VsZWN0b3JzIGZvciB2YXJpb3VzIGVsZW1lbnRzICovXG5Gb3Jtcy5zZWxlY3RvcnMgPSB7XG4gICdSRVFVSVJFRCc6ICdbcmVxdWlyZWQ9XCJ0cnVlXCJdJywgLy8gU2VsZWN0b3IgZm9yIHJlcXVpcmVkIGlucHV0IGVsZW1lbnRzXG4gICdFUlJPUl9NRVNTQUdFX1BBUkVOVCc6IGZhbHNlXG59O1xuXG4vKiogQXR0cmlidXRlcyBmb3IgdmFyaW91cyBlbGVtZW50cyAqL1xuRm9ybXMuYXR0cnMgPSB7XG4gICdFUlJPUl9NRVNTQUdFJzogWydhcmlhLWxpdmUnLCAncG9saXRlJ10sIC8vIEF0dHJpYnV0ZSBmb3IgdmFsaWQgZXJyb3IgbWVzc2FnZVxuICAnRVJST1JfSU5QVVQnOiBbJ2FyaWEtaW52YWxpZCcsICd0cnVlJ10sXG4gICdFUlJPUl9MQUJFTCc6ICdhcmlhLWRlc2NyaWJlZGJ5J1xufTtcblxuZXhwb3J0IGRlZmF1bHQgRm9ybXM7XG4iLCJcbmNvbnN0IGVycm9yQm94SWQgPSAnZXJyb3JzJ1xuY29uc3QgaW5mb0JveElkID0gJ2luZm8nXG5cbmNvbnN0IHRvVGl0bGVDYXNlID0gKHN0cmluZykgPT4ge1xuICByZXR1cm4gc3RyaW5nLmNoYXJBdCgwKS50b1VwcGVyQ2FzZSgpICsgc3RyaW5nLnNsaWNlKDEpO1xufVxuXG5jb25zdCBzZXRUZXh0Qm94ID0gKG1lc3NhZ2VTdHJpbmcsIGRpc3BsYXlTdGF0ZSwgYm94SWQpID0+IHtcbiAgdmFyIGVsZSA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKGJveElkKTtcbiAgaWYgKGVsZSkge1xuICAgIGVsZS5pbm5lckhUTUwgPSAnPHVsIGNsYXNzPVwibS0wIHB4LTJcIj4nICtcbiAgICAgIHRvVGl0bGVDYXNlKG1lc3NhZ2VTdHJpbmcudHJpbSgpKSArICc8L3VsPic7XG5cbiAgICBlbGUuc3R5bGUuZGlzcGxheSA9IGRpc3BsYXlTdGF0ZTtcblxuICAgIGlmIChkaXNwbGF5U3RhdGUgPT09ICdub25lJykge1xuICAgICAgZWxlLnJlbW92ZUF0dHJpYnV0ZSgnYXJpYS1saXZlJywgJ3BvbGl0ZScpXG4gICAgICBlbGUuY2xhc3NMaXN0LnJlbW92ZSgnYW5pbWF0ZWQnKVxuICAgICAgZWxlLmNsYXNzTGlzdC5yZW1vdmUoJ2ZhZGVJblVwJylcbiAgICB9IGVsc2Uge1xuICAgICAgZWxlLnNldEF0dHJpYnV0ZSgnYXJpYS1saXZlJywgJ3BvbGl0ZScpXG4gICAgICBlbGUuY2xhc3NMaXN0LmFkZCgnYW5pbWF0ZWQnKVxuICAgICAgZWxlLmNsYXNzTGlzdC5hZGQoJ2ZhZGVJblVwJylcbiAgICB9XG4gIH1cbn1cblxuZXhwb3J0IGNvbnN0IHNlbmRQb3N0UmVxdWVzdCA9ICh1cmwsIGhlYWRlcnNPYmplY3QsIHJlc3BvbnNlSGFuZGxlciwgcmVxdWVzdFBheWxvYWQpID0+IHtcbiAgc2V0VGV4dEJveCgnJywgJ25vbmUnLCBlcnJvckJveElkKVxuICBzZXRUZXh0Qm94KCcnLCAnbm9uZScsIGluZm9Cb3hJZClcblxuICBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgnbG9hZGVyJykuc3R5bGUuZGlzcGxheSA9ICdibG9jaydcblxuICB2YXIgcmVxID0gbmV3IFhNTEh0dHBSZXF1ZXN0KClcblxuICByZXEub3BlbignUE9TVCcsIHVybCwgdHJ1ZSk7XG5cbiAgT2JqZWN0LmtleXMoaGVhZGVyc09iamVjdCkuZm9yRWFjaChmdW5jdGlvbihrZXkpIHtcbiAgICByZXEuc2V0UmVxdWVzdEhlYWRlcihrZXksIGhlYWRlcnNPYmplY3Rba2V5XSk7XG4gIH0pO1xuXG4gIHJlcS5vbnJlYWR5c3RhdGVjaGFuZ2UgPSBmdW5jdGlvbigpIHtcbiAgICBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgnbG9hZGVyJykuc3R5bGUuZGlzcGxheSA9ICdub25lJ1xuICAgIHJlc3BvbnNlSGFuZGxlcihyZXEpXG4gIH1cblxuICByZXEuc2VuZChyZXF1ZXN0UGF5bG9hZClcbn1cblxuY29uc3QgZGlzcGxheUxpc3RUZXh0ID0gKHJlc3BvbnNlVGV4dCwgc2hvd1BhdGgsIGlkKSA9PiB7XG5cbn1cblxuZXhwb3J0IGNvbnN0IGRpc3BsYXlFcnJvcnMgPSAocmVzcG9uc2VUZXh0LCBzaG93UGF0aCkgPT4ge1xuICB2YXIgZXJyb3JKU09OXG4gIHZhciBlcnJvcnNBcnJheSA9IFtdXG4gIHRyeSB7XG4gICAgZXJyb3JKU09OID0gSlNPTi5wYXJzZShyZXNwb25zZVRleHQpLmVycm9yc1xuICAgIGVycm9yc0FycmF5ID0gZXJyb3JKU09OLm1hcChmdW5jdGlvbihlcnJvcikge1xuICAgICAgY29uc3QgeyBlbGVtZW50UGF0aCwgbWVzc2FnZSB9ID0gZXJyb3JcbiAgICAgIGNvbnN0IGVycm9yTXNnID0gZWxlbWVudFBhdGggJiYgc2hvd1BhdGggP1xuICAgICAgICBtZXNzYWdlICsgJyBFbGVtZW50IFBhdGg6ICcgKyBlbGVtZW50UGF0aCArICcuJyA6IG1lc3NhZ2VcbiAgICAgIHJldHVybiAnPGxpPicgKyB0b1RpdGxlQ2FzZShlcnJvck1zZykgKyAnPC9saT4nXG4gICAgfSlcbiAgfSBjYXRjaCAoZXJyKSB7fVxuICBzZXRUZXh0Qm94KGVycm9yc0FycmF5LmpvaW4oJycpLCAnYmxvY2snLCBlcnJvckJveElkKTtcbn1cblxuZXhwb3J0IGNvbnN0IGRpc3BsYXlJbmZvID0gKGluZm9UZXh0KSA9PiB7XG4gIGNvbnN0IGluZm9IVE1MID0gJzxsaT4nICsgaW5mb1RleHQgKyAnPC9saT4nXG4gIHNldFRleHRCb3goaW5mb0hUTUwsICdibG9jaycsIGluZm9Cb3hJZCk7XG59IiwiaW1wb3J0IEZvcm1zIGZyb20gJ0BueWNvcHBvcnR1bml0eS9wdHRybi1zY3JpcHRzL3NyYy9mb3Jtcy9mb3Jtcyc7XG5pbXBvcnQgeyBkaXNwbGF5RXJyb3JzLCBkaXNwbGF5SW5mbywgc2VuZFBvc3RSZXF1ZXN0IH0gZnJvbSAnLi91dGlsJztcblxuZXhwb3J0IGRlZmF1bHQgZnVuY3Rpb24oKSB7XG4gIGNvbnN0IFNFTEVDVE9SID0gJ1tkYXRhLWpzKj1cImJ1bGstc3VibWlzc2lvblwiXSdcblxuICBjb25zdCBmaWxlbmFtZSA9ICdyZXNwb25zZS5jc3YnXG5cbiAgY29uc3QgRm9ybSA9IG5ldyBGb3Jtcyhkb2N1bWVudC5xdWVyeVNlbGVjdG9yKFNFTEVDVE9SKSk7XG5cbiAgY29uc3QgYnVsa1N1Ym1pc3Npb25IYW5kbGVyID0gKHJlcSkgPT4ge1xuICAgIGlmIChyZXEucmVhZHlTdGF0ZSA9PT0gNCkge1xuICAgICAgY29uc3Qgc3RhdHVzID0gcmVxLnN0YXR1cy50b1N0cmluZygpXG4gICAgICBpZiAoc3RhdHVzWzBdID09PSAnNCcgfHwgc3RhdHVzWzBdID09PSAnNScpIHtcbiAgICAgICAgZGlzcGxheUVycm9ycyhyZXEucmVzcG9uc2VUZXh0LCB0cnVlKVxuICAgICAgfSBlbHNlIGlmIChzdGF0dXNbMF0gPT09ICcyJykge1xuICAgICAgICBkaXNwbGF5SW5mbygnQnVsayBzdWJtaXNzaW9uIHN1Y2Nlc3NmdWwuIEEgQ1NWIHdpdGggcHJvZ3JhbSBjb2RlcyBcXFxuICAgICAgICAgIHNob3VsZCBiZSBkb3dubG9hZGVkIGF1dG9tYXRpY2FsbHkuJylcbiAgICAgICAgY29uc3QgYmxvYiA9IG5ldyBCbG9iKFtyZXEucmVzcG9uc2VdLCB7dHlwZSA6ICd0ZXh0L2Nzdid9KVxuICAgICAgICBpZiAodHlwZW9mIHdpbmRvdy5uYXZpZ2F0b3IubXNTYXZlQmxvYiAhPT0gJ3VuZGVmaW5lZCcpIHtcbiAgICAgICAgICB3aW5kb3cubmF2aWdhdG9yLm1zU2F2ZUJsb2IoYmxvYiwgZmlsZW5hbWUpXG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgY29uc3QgVVJMID0gd2luZG93LlVSTCB8fCB3aW5kb3cud2Via2l0VVJMXG4gICAgICAgICAgY29uc3QgZG93bmxvYWRVcmwgPSBVUkwuY3JlYXRlT2JqZWN0VVJMKGJsb2IpXG5cbiAgICAgICAgICBjb25zdCBhID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnYScpXG5cbiAgICAgICAgICBpZiAodHlwZW9mIGEuZG93bmxvYWQgPT09ICd1bmRlZmluZWQnKSB7XG4gICAgICAgICAgICB3aW5kb3cubG9jYXRpb24gPSBkb3dubG9hZFVybFxuICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICBhLmhyZWYgPSBkb3dubG9hZFVybFxuICAgICAgICAgICAgYS5kb3dubG9hZCA9IGZpbGVuYW1lXG4gICAgICAgICAgICBkb2N1bWVudC5ib2R5LmFwcGVuZENoaWxkKGEpXG4gICAgICAgICAgICBhLmNsaWNrKClcbiAgICAgICAgICB9XG5cbiAgICAgICAgICBzZXRUaW1lb3V0KCgpID0+IHtcbiAgICAgICAgICAgIFVSTC5yZXZva2VPYmplY3RVUkwoZG93bmxvYWRVcmwpXG4gICAgICAgICAgfSwgMTAwKVxuICAgICAgICB9XG4gICAgICB9XG4gICAgfVxuICB9XG5cbiAgY29uc3Qgc2VuZEJ1bGtTdWJtaXNzaW9uUmVxdWVzdCA9IChmb3JtVmFsdWVzLCB0b2tlbikgPT4ge1xuICAgIGNvbnN0IHsgYmFzZXVybCwgdXNlcm5hbWUsIGNzdkZpbGUgfSA9IGZvcm1WYWx1ZXNcbiAgICB2YXIgdXJsID0gYmFzZXVybCArICdidWxrU3VibWlzc2lvbi9pbXBvcnQnXG4gICAgaWYgKGZvcm1WYWx1ZXMucHJvZ3JhbXMpIHtcbiAgICAgIHZhciBwcm9ncmFtcyA9IGZvcm1WYWx1ZXMucHJvZ3JhbXMuc3BsaXQoJywnKS5tYXAocCA9PiBwLnRyaW0oKSkuam9pbignLCcpXG4gICAgICB1cmwgPSB1cmwgKyAnP2ludGVyZXN0ZWRQcm9ncmFtcz0nICsgcHJvZ3JhbXNcbiAgICB9XG4gICAgdmFyIGhlYWRlcnNPYmplY3QgPSB7XG4gICAgICAnQXV0aG9yaXphdGlvbic6IHRva2VuXG4gICAgfVxuICAgIHZhciBmb3JtRGF0YSA9IG5ldyBGb3JtRGF0YSgpO1xuICAgIGZvcm1EYXRhLmFwcGVuZCgnZmlsZScsIGNzdkZpbGUpO1xuICAgIHNlbmRQb3N0UmVxdWVzdCh1cmwsIGhlYWRlcnNPYmplY3QsIGJ1bGtTdWJtaXNzaW9uSGFuZGxlciwgZm9ybURhdGEpXG4gIH1cblxuICBjb25zdCBhdXRoUmVzcG9uc2VIYW5kbGVyID0gKGZvcm1WYWx1ZXMpID0+IChyZXEpID0+IHtcbiAgICBpZiAocmVxLnJlYWR5U3RhdGUgPT09IDQpIHtcbiAgICAgIGNvbnN0IHN0YXR1cyA9IHJlcS5zdGF0dXMudG9TdHJpbmcoKVxuICAgICAgaWYgKHN0YXR1c1swXSA9PT0gJzQnIHx8IHN0YXR1c1swXSA9PT0gJzUnKSB7XG4gICAgICAgIGRpc3BsYXlFcnJvcnMocmVxLnJlc3BvbnNlVGV4dCwgZmFsc2UpXG4gICAgICB9IGVsc2UgaWYgKHN0YXR1c1swXSA9PT0gJzInKSB7XG4gICAgICAgIHNlbmRCdWxrU3VibWlzc2lvblJlcXVlc3QoZm9ybVZhbHVlcyxcbiAgICAgICAgICBKU09OLnBhcnNlKHJlcS5yZXNwb25zZVRleHQpLnRva2VuKVxuICAgICAgfVxuICAgIH1cbiAgfVxuXG4gIGNvbnN0IHN1Ym1pdCA9IChldmVudCkgPT4ge1xuICAgIGNvbnN0IGJhc2V1cmwgPSBldmVudC50YXJnZXQuYWN0aW9uO1xuICAgIGNvbnN0IHVzZXJuYW1lID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ3VzZXJuYW1lJykudmFsdWVcbiAgICBjb25zdCBwYXNzd29yZCA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCdwYXNzd29yZCcpLnZhbHVlXG4gICAgY29uc3QgcHJvZ3JhbXMgPSBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgncHJvZ3JhbXMnKS52YWx1ZVxuICAgIGNvbnN0IGNzdkZpbGVJbnB1dCA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCdjc3YtdXBsb2FkJylcblxuICAgIGNvbnN0IGNzdkZpbGUgPSBjc3ZGaWxlSW5wdXQuZmlsZXMgJiZcbiAgICAgIGNzdkZpbGVJbnB1dC5maWxlcy5sZW5ndGggPiAwICYmXG4gICAgICBjc3ZGaWxlSW5wdXQuZmlsZXNbMF1cblxuICAgIGxldCBmb3JtVmFsdWVzID0ge1xuICAgICAgYmFzZXVybDogYmFzZXVybCxcbiAgICAgIHVzZXJuYW1lOiB1c2VybmFtZSxcbiAgICAgIHBhc3N3b3JkOiBwYXNzd29yZCxcbiAgICAgIGNzdkZpbGU6IGNzdkZpbGVcbiAgICB9XG5cbiAgICBpZiAocHJvZ3JhbXMgIT09ICcnKSBmb3JtVmFsdWVzLnByb2dyYW1zID0gcHJvZ3JhbXNcblxuICAgIHZhciB1cmwgPSBiYXNldXJsICsgJ2F1dGhUb2tlbidcbiAgICB2YXIgaGVhZGVyc09iamVjdCA9IHtcbiAgICAgICdDb250ZW50LXR5cGUnOiAnYXBwbGljYXRpb24vanNvbicsXG4gICAgICAnQWNjZXNzLUNvbnRyb2wtQWxsb3ctT3JpZ2luJzogJyonXG4gICAgfVxuXG4gICAgY29uc3QgYXV0aFBheWxvYWQgPSB7IHVzZXJuYW1lLCBwYXNzd29yZCB9XG5cbiAgICBzZW5kUG9zdFJlcXVlc3QodXJsLCBoZWFkZXJzT2JqZWN0LCBhdXRoUmVzcG9uc2VIYW5kbGVyKGZvcm1WYWx1ZXMpLFxuICAgICAgSlNPTi5zdHJpbmdpZnkoYXV0aFBheWxvYWQpKVxuICB9O1xuXG4gIEZvcm0ud2F0Y2goKTtcbiAgRm9ybS5zdWJtaXQgPSBzdWJtaXQ7XG59XG4iLCJpbXBvcnQgRm9ybXMgZnJvbSAnQG55Y29wcG9ydHVuaXR5L3B0dHJuLXNjcmlwdHMvc3JjL2Zvcm1zL2Zvcm1zJztcbmltcG9ydCB7IGRpc3BsYXlFcnJvcnMsIGRpc3BsYXlJbmZvLCBzZW5kUG9zdFJlcXVlc3QgfSBmcm9tICcuL3V0aWwnO1xuXG5leHBvcnQgZGVmYXVsdCBmdW5jdGlvbigpIHtcbiAgY29uc3QgU0VMRUNUT1IgPSAnW2RhdGEtanMqPVwiY2hhbmdlLXBhc3N3b3JkXCJdJ1xuXG4gIGNvbnN0IEZvcm0gPSBuZXcgRm9ybXMoZG9jdW1lbnQucXVlcnlTZWxlY3RvcihTRUxFQ1RPUikpO1xuXG4gIGNvbnN0IHJlc3BvbnNlSGFuZGxlciA9IChyZXEpID0+IHtcbiAgICBpZiAocmVxLnJlYWR5U3RhdGUgPT09IDQpIHtcbiAgICAgIGNvbnN0IHN0YXR1cyA9IHJlcS5zdGF0dXMudG9TdHJpbmcoKSBcbiAgICAgIGlmIChzdGF0dXNbMF0gPT09ICc0JyB8fCBzdGF0dXNbMF0gPT09ICc1Jykge1xuICAgICAgICBkaXNwbGF5RXJyb3JzKHJlcS5yZXNwb25zZVRleHQsIGZhbHNlKVxuICAgICAgfSBlbHNlIGlmIChzdGF0dXNbMF0gPT09ICcyJykge1xuICAgICAgICBkaXNwbGF5SW5mbygnUGFzc3dvcmQgdXBkYXRlZCcpXG4gICAgICB9XG4gICAgfVxuICB9XG4gIFxuXG4gIGNvbnN0IHN1Ym1pdCA9IChldmVudCkgPT4ge1xuICAgIGNvbnN0IGRvbWFpbiA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCdkb21haW4nKS52YWx1ZVxuICAgIGNvbnN0IHVzZXJuYW1lID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ3VzZXJuYW1lJykudmFsdWVcbiAgICBjb25zdCBwYXNzd29yZCA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCdwYXNzd29yZCcpLnZhbHVlXG4gICAgY29uc3QgbmV3UGFzc3dvcmQgPSBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgnbmV3cGFzc3dvcmQnKS52YWx1ZVxuXG4gICAgdmFyIHVybCA9IGRvbWFpbiArICdhdXRoVG9rZW4nXG4gICAgdmFyIGhlYWRlcnNPYmplY3QgPSB7XG4gICAgICAnQ29udGVudC10eXBlJzogJ2FwcGxpY2F0aW9uL2pzb24nLFxuICAgICAgJ0FjY2Vzcy1Db250cm9sLUFsbG93LU9yaWdpbic6ICcqJ1xuICAgIH1cblxuICAgIGNvbnN0IGF1dGhQYXlsb2FkID0geyB1c2VybmFtZSwgcGFzc3dvcmQsIG5ld1Bhc3N3b3JkIH1cblxuICAgIHNlbmRQb3N0UmVxdWVzdCh1cmwsIGhlYWRlcnNPYmplY3QsIHJlc3BvbnNlSGFuZGxlcixcbiAgICAgIEpTT04uc3RyaW5naWZ5KGF1dGhQYXlsb2FkKSlcbiAgfTtcblxuICBGb3JtLndhdGNoKCk7XG4gIEZvcm0uc3VibWl0ID0gc3VibWl0O1xufVxuIiwiLyoqXG4gKiBDb252ZXJ0cyBmb3JtIHRvIEpTT05cbiAqL1xuXG5pbXBvcnQgcmVzcG9uc2VzIGZyb20gJy4vcmVzcG9uc2VzLmpzJztcblxuZXhwb3J0IGRlZmF1bHQgZnVuY3Rpb24oKSB7XG4gICQoJy5zY3JlZW5lci1mb3JtJykuZmFkZUluKDUwMClcblxuICB2YXIgaW5jb21lc0NvbnRhaW5lciA9ICQoJy5pbmNvbWVzJykuY2xvbmUoKTtcbiAgdmFyIGV4cGVuc2VzQ29udGFpbmVyID0gJCgnLmV4cGVuc2VzJykuY2xvbmUoKTtcblxuICAkKCcuaW5jb21lcycpLnJlbW92ZSgpO1xuICAkKCcuZXhwZW5zZXMnKS5yZW1vdmUoKTtcblxuICB2YXIgcGVyc29uQ29udGFpbmVyID0gJCgnLnBlcnNvbi1kYXRhOmZpcnN0JykuY2xvbmUoKTtcblxuICAvKiBHZW5lcmF0ZSB0aGUgZW50aXJlIEpTT04gKi9cbiAgJCgnLmdlbmVyYXRlLWpzb24nKS5vbignY2xpY2snLCBmdW5jdGlvbihldmVudCl7XG4gICAgZXZlbnQucHJldmVudERlZmF1bHQoKTtcblxuICAgIHZhciBmb3JtZGF0YT0kKCcuc2NyZWVuZXItZm9ybScpO1xuXG4gICAgdmFyIGZpbmFsT2JqID0ge1xuICAgICAgaG91c2Vob2xkOiBbXSxcbiAgICAgIHBlcnNvbjogW11cbiAgICB9O1xuXG4gICAgdmFyIGhvdXNlaG9sZE9iaiA9IGdlbmVyYXRlSG91c2Vob2xkT2JqKGZvcm1kYXRhKTtcbiAgICBmaW5hbE9ialsnaG91c2Vob2xkJ10ucHVzaChob3VzZWhvbGRPYmopO1xuXG4gICAgdmFyIHBlcnNvbk9iaiA9IHt9XG4gICAgJCgnLnBlcnNvbi1kYXRhJykuZWFjaChmdW5jdGlvbihwaSkge1xuICAgICAgcGVyc29uT2JqID0gZ2VuZXJhdGVQZXJzb25PYmooZm9ybWRhdGEsIHBpKTtcbiAgICAgIGZpbmFsT2JqWydwZXJzb24nXS5wdXNoKHBlcnNvbk9iaik7XG4gICAgfSlcblxuICAgIGZpbmFsT2JqWyd3aXRoaG9sZFBheWxvYWQnXSA9IFN0cmluZyhmb3JtZGF0YS5maW5kKCdbbmFtZT13aXRoaG9sZFBheWxvYWRdJykuaXMoJzpjaGVja2VkJykpO1xuXG4gICAgdmFyIGhhc0Vycm9ycyA9IHZhbGlkYXRlRmllbGRzKGZvcm1kYXRhKTtcblxuICAgIGlmIChoYXNFcnJvcnNbXCJlcnJvcnNcIl0gPiAwICkge1xuICAgICAgJCgnLmVycm9yLW1zZycpLnJlbW92ZUNsYXNzKCdoaWRkZW4nKTtcbiAgICB9ZWxzZSB7XG4gICAgICAkKCcuZXJyb3ItbXNnJykuYWRkQ2xhc3MoJ2hpZGRlbicpO1xuICAgICAgJCgnLmVycm9yJykucmVtb3ZlQ2xhc3MoJ2Vycm9yJyk7XG4gICAgICAkKCcuc2NyZWVuZXItZm9ybScpLmhpZGUoKTtcbiAgICAgICQoJy5zY3JlZW5lci1qc29uJykuZmluZCgncHJlJykucmVtb3ZlKCk7XG4gICAgICAkKCcuc2NyZWVuZXItanNvbicpLnByZXBlbmQoJzxwcmUgY2xhc3M9XCJibG9ja1wiPjxjb2RlIGNsYXNzPVwiY29kZVwiPicgKyBKU09OLnN0cmluZ2lmeShbZmluYWxPYmpdLCB1bmRlZmluZWQsIDIpICsgJzwvY29kZT48L3ByZT4nKTtcbiAgICAgICQoJy5zY3JlZW5lci1qc29uJykucmVtb3ZlQ2xhc3MoJ2hpZGRlbicpO1xuICAgIH1cbiAgICBpZiAoaGFzRXJyb3JzW1wid2FybmluZ3NcIl0gPiAwICkge1xuICAgICAgJCgnLndhcm5pbmctbXNnJykucmVtb3ZlQ2xhc3MoJ2hpZGRlbicpO1xuICAgIH1lbHNlIHtcbiAgICAgICQoJy53YXJuaW5nLW1zZycpLmFkZENsYXNzKCdoaWRkZW4nKTtcbiAgICB9XG4gIH0pXG5cbiAgLyogR28gYmFjayB0byB0aGUgZm9ybSAqL1xuICAkKCcuZ2VuZXJhdGUtZm9ybScpLm9uKCdjbGljaycsIGZ1bmN0aW9uKGV2ZW50KSB7XG4gICAgZXZlbnQucHJldmVudERlZmF1bHQoKTtcbiAgICAkKCcuc2NyZWVuZXItanNvbicpLmFkZENsYXNzKCdoaWRkZW4nKTtcbiAgICAkKCcuc2NyZWVuZXItZm9ybScpLnNob3coKTtcbiAgfSlcblxuICAkKGRvY3VtZW50KS5vbignY2hhbmdlJywnW25hbWU9bGl2aW5nVHlwZV0nLCBmdW5jdGlvbihldmVudCkge1xuICAgIGV2ZW50LnByZXZlbnREZWZhdWx0KCk7XG4gICAgaWYoJCh0aGlzKS52YWwoKSA9PSAnbGl2aW5nUmVudGluZycpe1xuICAgICAgJCgnLmxpdmluZ1JlbnRhbFR5cGUnKS5yZW1vdmVDbGFzcygnaGlkZGVuJyk7XG4gICAgICAkKCcubGVhc2UnKS5yZW1vdmVDbGFzcygnaGlkZGVuJyk7XG4gICAgICBwZXJzb25Db250YWluZXIuZmluZCgnLmxlYXNlJykucmVtb3ZlQ2xhc3MoJ2hpZGRlbicpO1xuICAgIH0gZWxzZSB7XG4gICAgICAkKCcubGl2aW5nUmVudGFsVHlwZScpLmFkZENsYXNzKCdoaWRkZW4nKTtcbiAgICAgICQoJy5sZWFzZScpLmFkZENsYXNzKCdoaWRkZW4nKTtcbiAgICB9XG4gICAgaWYoJCh0aGlzKS52YWwoKSA9PSAnbGl2aW5nT3duZXInKXtcbiAgICAgICQoJy5kZWVkJykucmVtb3ZlQ2xhc3MoJ2hpZGRlbicpO1xuICAgICAgcGVyc29uQ29udGFpbmVyLmZpbmQoJy5kZWVkJykucmVtb3ZlQ2xhc3MoJ2hpZGRlbicpO1xuICAgIH0gZWxzZSB7XG4gICAgICAkKCcuZGVlZCcpLmFkZENsYXNzKCdoaWRkZW4nKTtcbiAgICB9XG4gIH0pXG5cbiAgLyogQWRkIHBlcnNvbiAqL1xuICAkKGRvY3VtZW50KS5vbignY2xpY2snLCcuYWRkLXBlcnNvbicsIGZ1bmN0aW9uKGV2ZW50KSB7XG4gICAgZXZlbnQucHJldmVudERlZmF1bHQoKTtcblxuICAgICQoJy5hZGQtcmVtb3ZlJykuZmluZCgnLmVycm9yJykucmVtb3ZlKClcblxuICAgIGlmICgkKCcucGVyc29uLWRhdGEnKS5sZW5ndGggPiA4KSB7XG4gICAgICAkKHRoaXMpLnBhcmVudCgpLmFwcGVuZCgnPHAgY2xhc3M9XCJlcnJvciBwdC0yXCI+JysgcmVzcG9uc2VzLmZpbmQoeCA9PiB4W1wiUGVyc29uXCJdKVtcIlBlcnNvblwiXVtcImVycl9udW1fcGVyc29uc1wiXSsnPC9wPicpXG4gICAgfWVsc2Uge1xuICAgICAgcGVyc29uQ29udGFpbmVyLmNsb25lKCkuaW5zZXJ0QmVmb3JlKCQodGhpcykucGFyZW50KCkpO1xuICAgIH1cblxuICAgIGlmICgkKCcucGVyc29uLWRhdGEnKS5sZW5ndGggPiAxKSB7XG4gICAgICAkKCcucmVtb3ZlLXBlcnNvbicpLnJlbW92ZUNsYXNzKCdoaWRkZW4nKTtcbiAgICB9XG4gIH0pXG5cbiAgLyogUmVtb3ZlIHBlcnNvbiAqL1xuICAkKGRvY3VtZW50KS5vbignY2xpY2snLCcucmVtb3ZlLXBlcnNvbicsIGZ1bmN0aW9uKGV2ZW50KSB7XG4gICAgZXZlbnQucHJldmVudERlZmF1bHQoKTtcblxuICAgICQoJy5hZGQtcmVtb3ZlJykuZmluZCgnLmVycm9yJykucmVtb3ZlKClcblxuICAgIGlmICgkKCcucGVyc29uLWRhdGEnKS5sZW5ndGggPjEpIHtcbiAgICAgICQoJy5wZXJzb24tZGF0YTpsYXN0JykucmVtb3ZlKCk7XG4gICAgfVxuICAgIGlmICgkKCcucGVyc29uLWRhdGEnKS5sZW5ndGggPT0gMSkge1xuICAgICAgJCgnLnJlbW92ZS1wZXJzb24nKS5hZGRDbGFzcygnaGlkZGVuJyk7XG4gICAgfVxuICB9KVxuXG4gIC8qIElOQ09NRVMgKi9cbiAgJChkb2N1bWVudCkub24oJ2NsaWNrJywnLmFkZC1pbmNvbWUnLCBmdW5jdGlvbihldmVudCkge1xuICAgIGV2ZW50LnByZXZlbnREZWZhdWx0KCk7XG4gICAgaW5jb21lc0NvbnRhaW5lci5jbG9uZSgpLmluc2VydEJlZm9yZSgkKHRoaXMpLnBhcmVudCgpKVxuICAgICQodGhpcykuY2xvc2VzdCgnLnBlcnNvbi1kYXRhJykuZmluZCgnLmluY29tZXM6bGFzdCcpLnJlbW92ZUNsYXNzKCdoaWRkZW4nKVxuICAgICQodGhpcykucHJldignLnJlbW92ZS1pbmNvbWUnKS5yZW1vdmVDbGFzcygnaGlkZGVuJylcbiAgfSlcblxuICAkKGRvY3VtZW50KS5vbignY2xpY2snLCcucmVtb3ZlLWluY29tZScsIGZ1bmN0aW9uKGV2ZW50KSB7XG4gICAgZXZlbnQucHJldmVudERlZmF1bHQoKTtcbiAgICAkKHRoaXMpLmNsb3Nlc3QoJy5wZXJzb24tZGF0YScpLmZpbmQoJy5pbmNvbWVzOmxhc3QnKS5yZW1vdmUoKTtcbiAgICBpZigkKHRoaXMpLmNsb3Nlc3QoJy5wZXJzb24tZGF0YScpLmZpbmQoJy5pbmNvbWVzJykubGVuZ3RoID4gMCl7XG4gICAgICAkKHRoaXMpLnJlbW92ZUNsYXNzKCdoaWRkZW4nKTtcbiAgICB9IGVsc2Uge1xuICAgICAgJCh0aGlzKS5hZGRDbGFzcygnaGlkZGVuJyk7XG4gICAgfVxuICB9KVxuXG4gIC8qIEVYUEVOU0VTICovXG4gICQoZG9jdW1lbnQpLm9uKCdjbGljaycsJy5hZGQtZXhwZW5zZScsIGZ1bmN0aW9uKGV2ZW50KSB7XG4gICAgZXZlbnQucHJldmVudERlZmF1bHQoKTtcbiAgICBleHBlbnNlc0NvbnRhaW5lci5jbG9uZSgpLmluc2VydEJlZm9yZSgkKHRoaXMpLnBhcmVudCgpKVxuICAgICQodGhpcykuY2xvc2VzdCgnLnBlcnNvbi1kYXRhJykuZmluZCgnLmV4cGVuc2VzOmxhc3QnKS5yZW1vdmVDbGFzcygnaGlkZGVuJylcbiAgICAkKHRoaXMpLnByZXYoJy5yZW1vdmUtZXhwZW5zZScpLnJlbW92ZUNsYXNzKCdoaWRkZW4nKVxuICB9KVxuXG4gICQoZG9jdW1lbnQpLm9uKCdjbGljaycsJy5yZW1vdmUtZXhwZW5zZScsIGZ1bmN0aW9uKGV2ZW50KSB7XG4gICAgZXZlbnQucHJldmVudERlZmF1bHQoKTtcbiAgICAkKHRoaXMpLmNsb3Nlc3QoJy5wZXJzb24tZGF0YScpLmZpbmQoJy5leHBlbnNlczpsYXN0JykucmVtb3ZlKCk7XG4gICAgaWYoJCh0aGlzKS5jbG9zZXN0KCcucGVyc29uLWRhdGEnKS5maW5kKCcuZXhwZW5zZXMnKS5sZW5ndGggPiAwKXtcbiAgICAgICQodGhpcykucmVtb3ZlQ2xhc3MoJ2hpZGRlbicpO1xuICAgIH0gZWxzZSB7XG4gICAgICAkKHRoaXMpLmFkZENsYXNzKCdoaWRkZW4nKTtcbiAgICB9XG4gIH0pXG5cbiAgLyogR2VuZXJhdGVzIHRoZSBob3VzZWhvbGQgb2JqZWN0ICovXG4gIGZ1bmN0aW9uIGdlbmVyYXRlSG91c2Vob2xkT2JqKGZvcm0pe1xuICAgIHZhciBoaCA9IGZvcm0uZmluZCgnW2hvdXNlaG9sZF0nKS5zZXJpYWxpemVBcnJheSgpLnJlZHVjZSgob2JqLCBpdGVtKSA9PiAob2JqW2l0ZW0ubmFtZV0gPSBpdGVtLnZhbHVlLCBvYmopICx7fSk7XG4gICAgdmFyIGxpdmluZ1R5cGUgPSBmb3JtLmZpbmQoJ1tuYW1lPWxpdmluZ1R5cGVdJykuY2hpbGRyZW4oKTtcbiAgICBsaXZpbmdUeXBlLmVhY2goZnVuY3Rpb24oKXtcbiAgICAgIGlmICgkKHRoaXMpLnZhbCgpICE9IFwiXCIpe1xuICAgICAgICBpZigkKHRoaXMpLnZhbCgpID09IGxpdmluZ1R5cGUucGFyZW50KCkudmFsKCkpe1xuICAgICAgICAgIGhoWyQodGhpcykudmFsKCldPVwidHJ1ZVwiO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgIGhoWyQodGhpcykudmFsKCldPVwiZmFsc2VcIjtcbiAgICAgICAgfVxuICAgICAgfVxuICAgIH0pXG4gICAgZGVsZXRlIGhoWydsaXZpbmdUeXBlJ107XG4gICAgcmV0dXJuIGhoO1xuICB9XG5cbiAgLyogR2VuZXJhdGVzIHRoZSBwZXJzb24gb2JqZWN0ICovXG4gIGZ1bmN0aW9uIGdlbmVyYXRlUGVyc29uT2JqKGZvcm0sIHBpbmRleCkge1xuICAgIHZhciBwZXJzb25Gb3JtID0gZm9ybS5maW5kKCcucGVyc29uLWRhdGEnKS5lcShwaW5kZXgpO1xuICAgIHZhciBwZXJzb24gPSBwZXJzb25Gb3JtLmZpbmQoJ1twZXJzb25dJykuc2VyaWFsaXplQXJyYXkoKS5yZWR1Y2UoKG9iaiwgaXRlbSkgPT4gKG9ialtpdGVtLm5hbWVdID0gaXRlbS52YWx1ZSwgb2JqKSAse30pO1xuICAgIHZhciBwZXJzb25UeXBlID0gcGVyc29uRm9ybS5maW5kKCdbdHlwZT1jaGVja2JveF0nKS5maWx0ZXIoJ1twZXJzb25dJyk7XG4gICAgcGVyc29uVHlwZS5lYWNoKGZ1bmN0aW9uKCl7XG4gICAgICBpZiAoJCh0aGlzKS5pcygnOmNoZWNrZWQnKSl7XG4gICAgICAgIHBlcnNvblskKHRoaXMpLmF0dHIoJ25hbWUnKV09XCJ0cnVlXCI7XG4gICAgICB9ZWxzZSB7XG4gICAgICAgIHBlcnNvblskKHRoaXMpLmF0dHIoJ25hbWUnKV09XCJmYWxzZVwiO1xuICAgICAgfVxuICAgIH0pXG5cbiAgICAvKiBJbmNvbWVzICovXG4gICAgdmFyIGZvcm1JbmNvbWVzID0gcGVyc29uRm9ybS5maW5kKCdbcGVyc29uLWluY29tZXNdJykuc2VyaWFsaXplQXJyYXkoKTtcbiAgICB2YXIgaW5jb21lc0FyciA9IFtdO1xuICAgIHZhciBpbmNvbWVzT2JqID0ge307XG4gICAgdmFyIG51bUluY29tZXMgPSBmb3JtSW5jb21lcy5sZW5ndGggLyAzO1xuICAgIHZhciBpbmRleCA9IDA7XG4gICAgdmFyIHN1YnNldDtcblxuICAgIGZvciAodmFyIGkgPSAwOyBpIDwgbnVtSW5jb21lczsgaSsrKSB7XG4gICAgICBpbmNvbWVzT2JqID0ge307XG4gICAgICBzdWJzZXQgPSBmb3JtSW5jb21lcy5zbGljZShpbmRleCwgaW5kZXgrMyk7XG4gICAgICBzdWJzZXQuZm9yRWFjaChmdW5jdGlvbihrZXkpe1xuICAgICAgICBpbmNvbWVzT2JqW2tleS5uYW1lXSA9IGtleS52YWx1ZTtcbiAgICAgIH0pXG4gICAgICBpbmNvbWVzQXJyLnB1c2goaW5jb21lc09iaik7XG5cbiAgICAgIGluZGV4ID0gaW5kZXggKyAzO1xuICAgIH1cblxuICAgIGlmKGluY29tZXNBcnIubGVuZ3RoID4gMCl7XG4gICAgICBwZXJzb25bJ2luY29tZXMnXSA9IGluY29tZXNBcnI7XG4gICAgfVxuXG4gICAgLyogRXhwZW5zZXMgKi9cbiAgICB2YXIgZm9ybUV4cGVuc2VzID0gcGVyc29uRm9ybS5maW5kKCdbcGVyc29uLWV4cGVuc2VzXScpLnNlcmlhbGl6ZUFycmF5KCk7XG4gICAgdmFyIGV4cGVuc2VzQXJyID0gW107XG4gICAgdmFyIGV4cGVuc2VzT2JqID0ge307XG4gICAgdmFyIG51bUV4cGVuc2VzID0gZm9ybUV4cGVuc2VzLmxlbmd0aCAvIDM7XG4gICAgaW5kZXggPSAwO1xuXG4gICAgZm9yICh2YXIgaSA9IDA7IGkgPCBudW1FeHBlbnNlczsgaSsrKSB7XG4gICAgICBleHBlbnNlc09iaiA9IHt9O1xuICAgICAgc3Vic2V0ID0gZm9ybUV4cGVuc2VzLnNsaWNlKGluZGV4LCBpbmRleCszKTtcbiAgICAgIHN1YnNldC5mb3JFYWNoKGZ1bmN0aW9uKGtleSl7XG4gICAgICAgIGV4cGVuc2VzT2JqW2tleS5uYW1lXSA9IGtleS52YWx1ZTtcbiAgICAgIH0pXG5cbiAgICAgIGV4cGVuc2VzQXJyLnB1c2goZXhwZW5zZXNPYmopO1xuXG4gICAgICBpbmRleCA9IGluZGV4ICsgMztcbiAgICB9XG5cbiAgICBpZihleHBlbnNlc0Fyci5sZW5ndGggPiAwKSB7XG4gICAgICBwZXJzb25bJ2V4cGVuc2VzJ10gPSBleHBlbnNlc0FycjtcbiAgICB9XG5cbiAgICByZXR1cm4gcGVyc29uO1xuICB9XG5cbiAgLyogQ29weSB0aGUgSlNPTiBvYmplY3QgdG8gdGhlIGNsaXBib2FyZCAqL1xuICAkKGRvY3VtZW50KS5vbignY2xpY2snLCcuY29weS1vYmonLCBmdW5jdGlvbihldmVudCkge1xuICAgIGV2ZW50LnByZXZlbnREZWZhdWx0KCk7XG5cbiAgICB2YXIgcmFuZ2UgPSBkb2N1bWVudC5jcmVhdGVSYW5nZSgpO1xuICAgIHJhbmdlLnNlbGVjdE5vZGUoZG9jdW1lbnQuZ2V0RWxlbWVudHNCeUNsYXNzTmFtZShcImNvZGVcIilbMF0pO1xuICAgIHdpbmRvdy5nZXRTZWxlY3Rpb24oKS5yZW1vdmVBbGxSYW5nZXMoKTtcbiAgICB3aW5kb3cuZ2V0U2VsZWN0aW9uKCkuYWRkUmFuZ2UocmFuZ2UpO1xuICAgIGRvY3VtZW50LmV4ZWNDb21tYW5kKFwiY29weVwiKTtcblxuICAgICQodGhpcykudGV4dCgnQ29waWVkIScpO1xuICB9KVxuXG4gIC8qIFZhbGlkYXRlIHRoZSBmb3JtICovXG4gIGZ1bmN0aW9uIHZhbGlkYXRlRmllbGRzKGZvcm0pIHtcbiAgICB2YXIgZmllbGQsIGZpZWxkTmFtZSwgZ3JvdXBTZWxldGVkLFxuICAgIHJlc3VsdHMgPSB7XCJlcnJvcnNcIjogMCwgXCJ3YXJuaW5nc1wiOiAwfSxcbiAgICBmaWVsZHNPYmogPSBmb3JtLnNlcmlhbGl6ZUFycmF5KCkucmVkdWNlKChvYmosIGl0ZW0pID0+IChvYmpbaXRlbS5uYW1lXSA9IGl0ZW0udmFsdWUsIG9iaikgLHt9KSxcbiAgICBmaWVsZHMgPSBmb3JtLmZpbmQoJ1tyZXF1aXJlZF0nKSxcbiAgICBlcnJOb2RlID0gJCgnLmVycm9yLW1zZycpLFxuICAgIHdhcm5pbmdOb2RlID0gJCgnLndhcm5pbmctbXNnJyksXG4gICAgaGhNc2dPYmogPSByZXNwb25zZXMuZmluZCh4ID0+IHhbXCJIb3VzZWhvbGRcIl0pW1wiSG91c2Vob2xkXCJdLFxuICAgIHBlcnNvbk1zZ09iaiA9IHJlc3BvbnNlcy5maW5kKHggPT4geFtcIlBlcnNvblwiXSlbXCJQZXJzb25cIl0sXG4gICAgZXJyTXNnT2JqID0gcmVzcG9uc2VzLmZpbmQoeCA9PiB4W1wiR2VuZXJhbFwiXSlbXCJHZW5lcmFsXCJdXG5cbiAgICAkKCcuZXJyb3ItbXNnJykuY2hpbGRyZW4oKS5yZW1vdmUoKTtcbiAgICAkKCcud2FybmluZy1tc2cnKS5jaGlsZHJlbigpLnJlbW92ZSgpO1xuXG4gICAgJCgnLmVycm9yLW1zZycpLmFkZENsYXNzKCdlcnJvcicpXG4gICAgJCgnLmVycm9yLW1zZycpLmFwcGVuZCgnPHA+PHN0cm9uZz4nICsgZXJyTXNnT2JqW1wiZXJyb3JcIl0gICsgJzwvc3Ryb25nPjwvcD4nKVxuICAgICQoJy53YXJuaW5nLW1zZycpLmFwcGVuZCgnPHA+PHN0cm9uZz4nICsgZXJyTXNnT2JqW1wid2FybmluZ1wiXSArICc8L3N0cm9uZz48L3A+JylcblxuICAgIC8qIGNoZWNrIGZvciBlbXB0eSBmaWVsZHMgKi9cbiAgICBmaWVsZHMuZWFjaChmdW5jdGlvbigpe1xuICAgICAgZmllbGROYW1lID0gJCh0aGlzKS5hdHRyKCduYW1lJyk7XG4gICAgICBncm91cFNlbGV0ZWQgPSBPYmplY3Qua2V5cyhmaWVsZHNPYmopLmZpbmQoYSA9PmEuaW5jbHVkZXMoZmllbGROYW1lKSk/IHRydWUgOiBmYWxzZTtcblxuICAgICAgaWYoICQodGhpcykudmFsKCkgPT09IFwiXCIgfHxcbiAgICAgICAgIWdyb3VwU2VsZXRlZFxuICAgICAgKSB7XG4gICAgICAgICQodGhpcykucGFyZW50KCkucGFyZW50KCkuYWRkQ2xhc3MoJ2Vycm9yJyk7XG4gICAgICAgIHJlc3VsdHNbXCJlcnJvcnNcIl0gKz0gMTtcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgICQodGhpcykucGFyZW50KCkucmVtb3ZlQ2xhc3MoJ2Vycm9yJyk7XG4gICAgICB9XG5cbiAgICAgIGlmKCAoJCh0aGlzKS52YWwoKSA9PSAnbGl2aW5nUmVudGluZycpICYmXG4gICAgICAgIChmb3JtLmZpbmQoJ1tuYW1lPWxpdmluZ1JlbnRhbFR5cGVdJykudmFsKCkgPT0gXCJcIilcbiAgICAgICkge1xuICAgICAgICB3YXJuaW5nTm9kZS5hcHBlbmQoJzxwPicgKyBoaE1zZ09ialtcIndhcm5pbmdfcmVudGFsX3R5cGVcIl0gKyAnPC9wPicpXG4gICAgICAgIHJlc3VsdHNbXCJ3YXJuaW5nc1wiXSArPSAxO1xuICAgICAgfVxuXG4gICAgfSk7XG5cbiAgICB2YXIgbnVtUGVvcGxlID0gJCgnLnBlcnNvbi1kYXRhJykubGVuZ3RoO1xuICAgIGlmICgobnVtUGVvcGxlIDwgMSkgfHwgKG51bVBlb3BsZSA+IDgpKSB7XG4gICAgICAkKCcuZXJyb3ItbXNnJykuYXBwZW5kKCc8cD4nKyBwZXJzb25Nc2dPYmpbXCJlcnJfbnVtX3BlcnNvbnNcIl0gKyAnPC9wPicpXG4gICAgICByZXN1bHRzW1wiZXJyb3JzXCJdICs9IDE7XG4gICAgfVxuXG4gICAgdmFyIG51bUhlYWRzID0gMFxuICAgIHZhciBob3VzZWhvbGRNZW1iZXJUeXBlcyA9ICQoJ1tuYW1lPWhvdXNlaG9sZE1lbWJlclR5cGVdJylcbiAgICBmb3IgKHZhciBpID0gMDsgaSA8IGhvdXNlaG9sZE1lbWJlclR5cGVzLmxlbmd0aDsgaSsrKSB7XG4gICAgICBpZiAoaG91c2Vob2xkTWVtYmVyVHlwZXNbaV0udmFsdWUgPT0gXCJIZWFkT2ZIb3VzZWhvbGRcIikge1xuICAgICAgICBudW1IZWFkcyArPSAxXG4gICAgICB9XG4gICAgfVxuXG4gICAgaWYgKG51bUhlYWRzICE9IDEpIHtcbiAgICAgICQoJ1tuYW1lPWhvdXNlaG9sZE1lbWJlclR5cGVdJykucGFyZW50KCkuYWRkQ2xhc3MoJ2Vycm9yJylcbiAgICAgICQoJy5lcnJvci1tc2cnKS5hcHBlbmQoJzxwPicrIHBlcnNvbk1zZ09ialtcImVycl9ob2hcIl0gKyc8L3A+JylcbiAgICAgIHJlc3VsdHNbXCJlcnJvcnNcIl0gKz0gMTtcbiAgICB9XG5cbiAgICBpZiAoZm9ybS5maW5kKCdbbmFtZT1saXZpbmdUeXBlXScpLnZhbCgpID09IFwibGl2aW5nUmVudGluZ1wiICYmXG4gICAgICAhKCQoJ1tuYW1lPWxpdmluZ1JlbnRhbE9uTGVhc2VdOmNoZWNrZWQnKS5sZW5ndGggPiAwKVxuICAgICl7XG4gICAgICB3YXJuaW5nTm9kZS5hcHBlbmQoJzxwPicgKyBwZXJzb25Nc2dPYmpbXCJ3YXJuaW5nX29uX2xlYXNlXCJdICsgJzwvcD4nKVxuICAgICAgcmVzdWx0c1tcIndhcm5pbmdzXCJdICs9IDE7XG4gICAgfVxuXG4gICAgaWYgKGZvcm0uZmluZCgnW25hbWU9bGl2aW5nVHlwZV0nKS52YWwoKSA9PSBcImxpdmluZ093bmVyXCIgJiZcbiAgICAgICEoJCgnW25hbWU9bGl2aW5nUmVudGFsT25MZWFzZV06Y2hlY2tlZCcpLmxlbmd0aCA+IDApXG4gICAgKXtcbiAgICAgIHdhcm5pbmdOb2RlLmFwcGVuZCgnPHA+JyArIHBlcnNvbk1zZ09ialtcIndhcm5pbmdfb25fZGVlZFwiXSArICc8L3A+JylcbiAgICAgIHJlc3VsdHNbXCJ3YXJuaW5nc1wiXSArPSAxO1xuICAgIH1cblxuXG4gICAgcmV0dXJuIHJlc3VsdHM7XG4gIH1cbn1cbiIsIid1c2Ugc3RyaWN0JztcblxuLyoqXG4gKiBUaGUgSWNvbiBtb2R1bGVcbiAqIEBjbGFzc1xuICovXG5jbGFzcyBJY29ucyB7XG4gIC8qKlxuICAgKiBAY29uc3RydWN0b3JcbiAgICogQHBhcmFtICB7U3RyaW5nfSBwYXRoIFRoZSBwYXRoIG9mIHRoZSBpY29uIGZpbGVcbiAgICogQHJldHVybiB7b2JqZWN0fSBUaGUgY2xhc3NcbiAgICovXG4gIGNvbnN0cnVjdG9yKHBhdGgpIHtcbiAgICBwYXRoID0gKHBhdGgpID8gcGF0aCA6IEljb25zLnBhdGg7XG5cbiAgICBmZXRjaChwYXRoKVxuICAgICAgLnRoZW4oKHJlc3BvbnNlKSA9PiB7XG4gICAgICAgIGlmIChyZXNwb25zZS5vaylcbiAgICAgICAgICByZXR1cm4gcmVzcG9uc2UudGV4dCgpO1xuICAgICAgICBlbHNlXG4gICAgICAgICAgLy8gZXNsaW50LWRpc2FibGUtbmV4dC1saW5lIG5vLWNvbnNvbGVcbiAgICAgICAgICBpZiAocHJvY2Vzcy5lbnYuTk9ERV9FTlYgIT09ICdwcm9kdWN0aW9uJylcbiAgICAgICAgICAgIGNvbnNvbGUuZGlyKHJlc3BvbnNlKTtcbiAgICAgIH0pXG4gICAgICAuY2F0Y2goKGVycm9yKSA9PiB7XG4gICAgICAgIC8vIGVzbGludC1kaXNhYmxlLW5leHQtbGluZSBuby1jb25zb2xlXG4gICAgICAgIGlmIChwcm9jZXNzLmVudi5OT0RFX0VOViAhPT0gJ3Byb2R1Y3Rpb24nKVxuICAgICAgICAgIGNvbnNvbGUuZGlyKGVycm9yKTtcbiAgICAgIH0pXG4gICAgICAudGhlbigoZGF0YSkgPT4ge1xuICAgICAgICBjb25zdCBzcHJpdGUgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdkaXYnKTtcbiAgICAgICAgc3ByaXRlLmlubmVySFRNTCA9IGRhdGE7XG4gICAgICAgIHNwcml0ZS5zZXRBdHRyaWJ1dGUoJ2FyaWEtaGlkZGVuJywgdHJ1ZSk7XG4gICAgICAgIHNwcml0ZS5zZXRBdHRyaWJ1dGUoJ3N0eWxlJywgJ2Rpc3BsYXk6IG5vbmU7Jyk7XG4gICAgICAgIGRvY3VtZW50LmJvZHkuYXBwZW5kQ2hpbGQoc3ByaXRlKTtcbiAgICAgIH0pO1xuXG4gICAgcmV0dXJuIHRoaXM7XG4gIH1cbn1cblxuLyoqIEB0eXBlIHtTdHJpbmd9IFRoZSBwYXRoIG9mIHRoZSBpY29uIGZpbGUgKi9cbkljb25zLnBhdGggPSAnc3ZnL2ljb25zLnN2Zyc7XG5cbmV4cG9ydCBkZWZhdWx0IEljb25zO1xuIiwiJ3VzZSBzdHJpY3QnO1xuXG4vKipcbiAqIFRoZSBTaW1wbGUgVG9nZ2xlIGNsYXNzLiBUaGlzIHdpbGwgdG9nZ2xlIHRoZSBjbGFzcyAnYWN0aXZlJyBhbmQgJ2hpZGRlbidcbiAqIG9uIHRhcmdldCBlbGVtZW50cywgZGV0ZXJtaW5lZCBieSBhIGNsaWNrIGV2ZW50IG9uIGEgc2VsZWN0ZWQgbGluayBvclxuICogZWxlbWVudC4gVGhpcyB3aWxsIGFsc28gdG9nZ2xlIHRoZSBhcmlhLWhpZGRlbiBhdHRyaWJ1dGUgZm9yIHRhcmdldGVkXG4gKiBlbGVtZW50cyB0byBzdXBwb3J0IHNjcmVlbiByZWFkZXJzLiBUYXJnZXQgc2V0dGluZ3MgYW5kIG90aGVyIGZ1bmN0aW9uYWxpdHlcbiAqIGNhbiBiZSBjb250cm9sbGVkIHRocm91Z2ggZGF0YSBhdHRyaWJ1dGVzLlxuICpcbiAqIFRoaXMgdXNlcyB0aGUgLm1hdGNoZXMoKSBtZXRob2Qgd2hpY2ggd2lsbCByZXF1aXJlIGEgcG9seWZpbGwgZm9yIElFXG4gKiBodHRwczovL3BvbHlmaWxsLmlvL3YyL2RvY3MvZmVhdHVyZXMvI0VsZW1lbnRfcHJvdG90eXBlX21hdGNoZXNcbiAqXG4gKiBAY2xhc3NcbiAqL1xuY2xhc3MgVG9nZ2xlIHtcbiAgLyoqXG4gICAqIEBjb25zdHJ1Y3RvclxuICAgKlxuICAgKiBAcGFyYW0gIHtPYmplY3R9ICBzICBTZXR0aW5ncyBmb3IgdGhpcyBUb2dnbGUgaW5zdGFuY2VcbiAgICpcbiAgICogQHJldHVybiB7T2JqZWN0fSAgICAgVGhlIGNsYXNzXG4gICAqL1xuICBjb25zdHJ1Y3RvcihzKSB7XG4gICAgLy8gQ3JlYXRlIGFuIG9iamVjdCB0byBzdG9yZSBleGlzdGluZyB0b2dnbGUgbGlzdGVuZXJzIChpZiBpdCBkb2Vzbid0IGV4aXN0KVxuICAgIGlmICghd2luZG93Lmhhc093blByb3BlcnR5KFRvZ2dsZS5jYWxsYmFjaykpXG4gICAgICB3aW5kb3dbVG9nZ2xlLmNhbGxiYWNrXSA9IFtdO1xuXG4gICAgcyA9ICghcykgPyB7fSA6IHM7XG5cbiAgICB0aGlzLnNldHRpbmdzID0ge1xuICAgICAgc2VsZWN0b3I6IChzLnNlbGVjdG9yKSA/IHMuc2VsZWN0b3IgOiBUb2dnbGUuc2VsZWN0b3IsXG4gICAgICBuYW1lc3BhY2U6IChzLm5hbWVzcGFjZSkgPyBzLm5hbWVzcGFjZSA6IFRvZ2dsZS5uYW1lc3BhY2UsXG4gICAgICBpbmFjdGl2ZUNsYXNzOiAocy5pbmFjdGl2ZUNsYXNzKSA/IHMuaW5hY3RpdmVDbGFzcyA6IFRvZ2dsZS5pbmFjdGl2ZUNsYXNzLFxuICAgICAgYWN0aXZlQ2xhc3M6IChzLmFjdGl2ZUNsYXNzKSA/IHMuYWN0aXZlQ2xhc3MgOiBUb2dnbGUuYWN0aXZlQ2xhc3MsXG4gICAgICBiZWZvcmU6IChzLmJlZm9yZSkgPyBzLmJlZm9yZSA6IGZhbHNlLFxuICAgICAgYWZ0ZXI6IChzLmFmdGVyKSA/IHMuYWZ0ZXIgOiBmYWxzZSxcbiAgICAgIHZhbGlkOiAocy52YWxpZCkgPyBzLnZhbGlkIDogZmFsc2UsXG4gICAgICBmb2N1c2FibGU6IChzLmhhc093blByb3BlcnR5KCdmb2N1c2FibGUnKSkgPyBzLmZvY3VzYWJsZSA6IHRydWUsXG4gICAgICBqdW1wOiAocy5oYXNPd25Qcm9wZXJ0eSgnanVtcCcpKSA/IHMuanVtcCA6IHRydWVcbiAgICB9O1xuXG4gICAgLy8gU3RvcmUgdGhlIGVsZW1lbnQgZm9yIHBvdGVudGlhbCB1c2UgaW4gY2FsbGJhY2tzXG4gICAgdGhpcy5lbGVtZW50ID0gKHMuZWxlbWVudCkgPyBzLmVsZW1lbnQgOiBmYWxzZTtcblxuICAgIGlmICh0aGlzLmVsZW1lbnQpIHtcbiAgICAgIHRoaXMuZWxlbWVudC5hZGRFdmVudExpc3RlbmVyKCdjbGljaycsIChldmVudCkgPT4ge1xuICAgICAgICB0aGlzLnRvZ2dsZShldmVudCk7XG4gICAgICB9KTtcbiAgICB9IGVsc2Uge1xuICAgICAgLy8gSWYgdGhlcmUgaXNuJ3QgYW4gZXhpc3RpbmcgaW5zdGFudGlhdGVkIHRvZ2dsZSwgYWRkIHRoZSBldmVudCBsaXN0ZW5lci5cbiAgICAgIGlmICghd2luZG93W1RvZ2dsZS5jYWxsYmFja10uaGFzT3duUHJvcGVydHkodGhpcy5zZXR0aW5ncy5zZWxlY3RvcikpIHtcbiAgICAgICAgbGV0IGJvZHkgPSBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKCdib2R5Jyk7XG5cbiAgICAgICAgZm9yIChsZXQgaSA9IDA7IGkgPCBUb2dnbGUuZXZlbnRzLmxlbmd0aDsgaSsrKSB7XG4gICAgICAgICAgbGV0IHRnZ2xlRXZlbnQgPSBUb2dnbGUuZXZlbnRzW2ldO1xuXG4gICAgICAgICAgYm9keS5hZGRFdmVudExpc3RlbmVyKHRnZ2xlRXZlbnQsIGV2ZW50ID0+IHtcbiAgICAgICAgICAgIGlmICghZXZlbnQudGFyZ2V0Lm1hdGNoZXModGhpcy5zZXR0aW5ncy5zZWxlY3RvcikpXG4gICAgICAgICAgICAgIHJldHVybjtcblxuICAgICAgICAgICAgdGhpcy5ldmVudCA9IGV2ZW50O1xuXG4gICAgICAgICAgICBsZXQgdHlwZSA9IGV2ZW50LnR5cGUudG9VcHBlckNhc2UoKTtcblxuICAgICAgICAgICAgaWYgKFxuICAgICAgICAgICAgICB0aGlzW2V2ZW50LnR5cGVdICYmXG4gICAgICAgICAgICAgIFRvZ2dsZS5lbGVtZW50c1t0eXBlXSAmJlxuICAgICAgICAgICAgICBUb2dnbGUuZWxlbWVudHNbdHlwZV0uaW5jbHVkZXMoZXZlbnQudGFyZ2V0LnRhZ05hbWUpXG4gICAgICAgICAgICApIHRoaXNbZXZlbnQudHlwZV0oZXZlbnQpO1xuICAgICAgICAgIH0pO1xuICAgICAgICB9XG4gICAgICB9XG4gICAgfVxuXG4gICAgLy8gUmVjb3JkIHRoYXQgYSB0b2dnbGUgdXNpbmcgdGhpcyBzZWxlY3RvciBoYXMgYmVlbiBpbnN0YW50aWF0ZWQuXG4gICAgLy8gVGhpcyBwcmV2ZW50cyBkb3VibGUgdG9nZ2xpbmcuXG4gICAgd2luZG93W1RvZ2dsZS5jYWxsYmFja11bdGhpcy5zZXR0aW5ncy5zZWxlY3Rvcl0gPSB0cnVlO1xuXG4gICAgcmV0dXJuIHRoaXM7XG4gIH1cblxuICAvKipcbiAgICogQ2xpY2sgZXZlbnQgaGFuZGxlclxuICAgKlxuICAgKiBAcGFyYW0gIHtFdmVudH0gIGV2ZW50ICBUaGUgb3JpZ2luYWwgY2xpY2sgZXZlbnRcbiAgICovXG4gIGNsaWNrKGV2ZW50KSB7XG4gICAgdGhpcy50b2dnbGUoZXZlbnQpO1xuICB9XG5cbiAgLyoqXG4gICAqIElucHV0L3NlbGVjdC90ZXh0YXJlYSBjaGFuZ2UgZXZlbnQgaGFuZGxlci4gQ2hlY2tzIHRvIHNlZSBpZiB0aGVcbiAgICogZXZlbnQudGFyZ2V0IGlzIHZhbGlkIHRoZW4gdG9nZ2xlcyBhY2NvcmRpbmdseS5cbiAgICpcbiAgICogQHBhcmFtICB7RXZlbnR9ICBldmVudCAgVGhlIG9yaWdpbmFsIGlucHV0IGNoYW5nZSBldmVudFxuICAgKi9cbiAgY2hhbmdlKGV2ZW50KSB7XG4gICAgbGV0IHZhbGlkID0gZXZlbnQudGFyZ2V0LmNoZWNrVmFsaWRpdHkoKTtcblxuICAgIGlmICh2YWxpZCAmJiAhdGhpcy5pc0FjdGl2ZShldmVudC50YXJnZXQpKSB7XG4gICAgICB0aGlzLnRvZ2dsZShldmVudCk7IC8vIHNob3dcbiAgICB9IGVsc2UgaWYgKCF2YWxpZCAmJiB0aGlzLmlzQWN0aXZlKGV2ZW50LnRhcmdldCkpIHtcbiAgICAgIHRoaXMudG9nZ2xlKGV2ZW50KTsgLy8gaGlkZVxuICAgIH1cbiAgfVxuXG4gIC8qKlxuICAgKiBDaGVjayB0byBzZWUgaWYgdGhlIHRvZ2dsZSBpcyBhY3RpdmVcbiAgICpcbiAgICogQHBhcmFtICB7T2JqZWN0fSAgZWxlbWVudCAgVGhlIHRvZ2dsZSBlbGVtZW50ICh0cmlnZ2VyKVxuICAgKi9cbiAgaXNBY3RpdmUoZWxlbWVudCkge1xuICAgIGxldCBhY3RpdmUgPSBmYWxzZTtcblxuICAgIGlmICh0aGlzLnNldHRpbmdzLmFjdGl2ZUNsYXNzKSB7XG4gICAgICBhY3RpdmUgPSBlbGVtZW50LmNsYXNzTGlzdC5jb250YWlucyh0aGlzLnNldHRpbmdzLmFjdGl2ZUNsYXNzKVxuICAgIH1cblxuICAgIC8vIGlmICgpIHtcbiAgICAgIC8vIFRvZ2dsZS5lbGVtZW50QXJpYVJvbGVzXG4gICAgICAvLyBUT0RPOiBBZGQgY2F0Y2ggdG8gc2VlIGlmIGVsZW1lbnQgYXJpYSByb2xlcyBhcmUgdG9nZ2xlZFxuICAgIC8vIH1cblxuICAgIC8vIGlmICgpIHtcbiAgICAgIC8vIFRvZ2dsZS50YXJnZXRBcmlhUm9sZXNcbiAgICAgIC8vIFRPRE86IEFkZCBjYXRjaCB0byBzZWUgaWYgdGFyZ2V0IGFyaWEgcm9sZXMgYXJlIHRvZ2dsZWRcbiAgICAvLyB9XG5cbiAgICByZXR1cm4gYWN0aXZlO1xuICB9XG5cbiAgLyoqXG4gICAqIEdldCB0aGUgdGFyZ2V0IG9mIHRoZSB0b2dnbGUgZWxlbWVudCAodHJpZ2dlcilcbiAgICpcbiAgICogQHBhcmFtICB7T2JqZWN0fSAgZWwgIFRoZSB0b2dnbGUgZWxlbWVudCAodHJpZ2dlcilcbiAgICovXG4gIGdldFRhcmdldChlbGVtZW50KSB7XG4gICAgbGV0IHRhcmdldCA9IGZhbHNlO1xuXG4gICAgLyoqIEFuY2hvciBMaW5rcyAqL1xuICAgIHRhcmdldCA9IChlbGVtZW50Lmhhc0F0dHJpYnV0ZSgnaHJlZicpKSA/XG4gICAgICBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKGVsZW1lbnQuZ2V0QXR0cmlidXRlKCdocmVmJykpIDogdGFyZ2V0O1xuXG4gICAgLyoqIFRvZ2dsZSBDb250cm9scyAqL1xuICAgIHRhcmdldCA9IChlbGVtZW50Lmhhc0F0dHJpYnV0ZSgnYXJpYS1jb250cm9scycpKSA/XG4gICAgICBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKGAjJHtlbGVtZW50LmdldEF0dHJpYnV0ZSgnYXJpYS1jb250cm9scycpfWApIDogdGFyZ2V0O1xuXG4gICAgcmV0dXJuIHRhcmdldDtcbiAgfVxuXG4gIC8qKlxuICAgKiBUaGUgdG9nZ2xlIGV2ZW50IHByb3h5IGZvciBnZXR0aW5nIGFuZCBzZXR0aW5nIHRoZSBlbGVtZW50L3MgYW5kIHRhcmdldFxuICAgKlxuICAgKiBAcGFyYW0gIHtPYmplY3R9ICBldmVudCAgVGhlIG1haW4gY2xpY2sgZXZlbnRcbiAgICpcbiAgICogQHJldHVybiB7T2JqZWN0fSAgICAgICAgIFRoZSBUb2dnbGUgaW5zdGFuY2VcbiAgICovXG4gIHRvZ2dsZShldmVudCkge1xuICAgIGxldCBlbGVtZW50ID0gZXZlbnQudGFyZ2V0O1xuICAgIGxldCB0YXJnZXQgPSBmYWxzZTtcbiAgICBsZXQgZm9jdXNhYmxlID0gW107XG5cbiAgICBldmVudC5wcmV2ZW50RGVmYXVsdCgpO1xuXG4gICAgdGFyZ2V0ID0gdGhpcy5nZXRUYXJnZXQoZWxlbWVudCk7XG5cbiAgICAvKiogRm9jdXNhYmxlIENoaWxkcmVuICovXG4gICAgZm9jdXNhYmxlID0gKHRhcmdldCkgP1xuICAgICAgdGFyZ2V0LnF1ZXJ5U2VsZWN0b3JBbGwoVG9nZ2xlLmVsRm9jdXNhYmxlLmpvaW4oJywgJykpIDogZm9jdXNhYmxlO1xuXG4gICAgLyoqIE1haW4gRnVuY3Rpb25hbGl0eSAqL1xuICAgIGlmICghdGFyZ2V0KSByZXR1cm4gdGhpcztcbiAgICB0aGlzLmVsZW1lbnRUb2dnbGUoZWxlbWVudCwgdGFyZ2V0LCBmb2N1c2FibGUpO1xuXG4gICAgLyoqIFVuZG8gKi9cbiAgICBpZiAoZWxlbWVudC5kYXRhc2V0W2Ake3RoaXMuc2V0dGluZ3MubmFtZXNwYWNlfVVuZG9gXSkge1xuICAgICAgY29uc3QgdW5kbyA9IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoXG4gICAgICAgIGVsZW1lbnQuZGF0YXNldFtgJHt0aGlzLnNldHRpbmdzLm5hbWVzcGFjZX1VbmRvYF1cbiAgICAgICk7XG5cbiAgICAgIHVuZG8uYWRkRXZlbnRMaXN0ZW5lcignY2xpY2snLCAoZXZlbnQpID0+IHtcbiAgICAgICAgZXZlbnQucHJldmVudERlZmF1bHQoKTtcbiAgICAgICAgdGhpcy5lbGVtZW50VG9nZ2xlKGVsZW1lbnQsIHRhcmdldCk7XG4gICAgICAgIHVuZG8ucmVtb3ZlRXZlbnRMaXN0ZW5lcignY2xpY2snKTtcbiAgICAgIH0pO1xuICAgIH1cblxuICAgIHJldHVybiB0aGlzO1xuICB9XG5cbiAgLyoqXG4gICAqIEdldCBvdGhlciB0b2dnbGVzIHRoYXQgbWlnaHQgY29udHJvbCB0aGUgc2FtZSBlbGVtZW50XG4gICAqXG4gICAqIEBwYXJhbSAgIHtPYmplY3R9ICAgIGVsZW1lbnQgIFRoZSB0b2dnbGluZyBlbGVtZW50XG4gICAqXG4gICAqIEByZXR1cm4gIHtOb2RlTGlzdH0gICAgICAgICAgIExpc3Qgb2Ygb3RoZXIgdG9nZ2xpbmcgZWxlbWVudHNcbiAgICogICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgdGhhdCBjb250cm9sIHRoZSB0YXJnZXRcbiAgICovXG4gIGdldE90aGVycyhlbGVtZW50KSB7XG4gICAgbGV0IHNlbGVjdG9yID0gZmFsc2U7XG5cbiAgICBpZiAoZWxlbWVudC5oYXNBdHRyaWJ1dGUoJ2hyZWYnKSkge1xuICAgICAgc2VsZWN0b3IgPSBgW2hyZWY9XCIke2VsZW1lbnQuZ2V0QXR0cmlidXRlKCdocmVmJyl9XCJdYDtcbiAgICB9IGVsc2UgaWYgKGVsZW1lbnQuaGFzQXR0cmlidXRlKCdhcmlhLWNvbnRyb2xzJykpIHtcbiAgICAgIHNlbGVjdG9yID0gYFthcmlhLWNvbnRyb2xzPVwiJHtlbGVtZW50LmdldEF0dHJpYnV0ZSgnYXJpYS1jb250cm9scycpfVwiXWA7XG4gICAgfVxuXG4gICAgcmV0dXJuIChzZWxlY3RvcikgPyBkb2N1bWVudC5xdWVyeVNlbGVjdG9yQWxsKHNlbGVjdG9yKSA6IFtdO1xuICB9XG5cbiAgLyoqXG4gICAqIEhpZGUgdGhlIFRvZ2dsZSBUYXJnZXQncyBmb2N1c2FibGUgY2hpbGRyZW4gZnJvbSBmb2N1cy5cbiAgICogSWYgYW4gZWxlbWVudCBoYXMgdGhlIGRhdGEtYXR0cmlidXRlIGBkYXRhLXRvZ2dsZS10YWJpbmRleGBcbiAgICogaXQgd2lsbCB1c2UgdGhhdCBhcyB0aGUgZGVmYXVsdCB0YWIgaW5kZXggb2YgdGhlIGVsZW1lbnQuXG4gICAqXG4gICAqIEBwYXJhbSAgIHtOb2RlTGlzdH0gIGVsZW1lbnRzICBMaXN0IG9mIGZvY3VzYWJsZSBlbGVtZW50c1xuICAgKlxuICAgKiBAcmV0dXJuICB7T2JqZWN0fSAgICAgICAgICAgICAgVGhlIFRvZ2dsZSBJbnN0YW5jZVxuICAgKi9cbiAgdG9nZ2xlRm9jdXNhYmxlKGVsZW1lbnRzKSB7XG4gICAgZWxlbWVudHMuZm9yRWFjaChlbGVtZW50ID0+IHtcbiAgICAgIGxldCB0YWJpbmRleCA9IGVsZW1lbnQuZ2V0QXR0cmlidXRlKCd0YWJpbmRleCcpO1xuXG4gICAgICBpZiAodGFiaW5kZXggPT09ICctMScpIHtcbiAgICAgICAgbGV0IGRhdGFEZWZhdWx0ID0gZWxlbWVudFxuICAgICAgICAgIC5nZXRBdHRyaWJ1dGUoYGRhdGEtJHtUb2dnbGUubmFtZXNwYWNlfS10YWJpbmRleGApO1xuXG4gICAgICAgIGlmIChkYXRhRGVmYXVsdCkge1xuICAgICAgICAgIGVsZW1lbnQuc2V0QXR0cmlidXRlKCd0YWJpbmRleCcsIGRhdGFEZWZhdWx0KTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICBlbGVtZW50LnJlbW92ZUF0dHJpYnV0ZSgndGFiaW5kZXgnKTtcbiAgICAgICAgfVxuICAgICAgfSBlbHNlIHtcbiAgICAgICAgZWxlbWVudC5zZXRBdHRyaWJ1dGUoJ3RhYmluZGV4JywgJy0xJyk7XG4gICAgICB9XG4gICAgfSk7XG5cbiAgICByZXR1cm4gdGhpcztcbiAgfVxuXG4gIC8qKlxuICAgKiBKdW1wcyB0byBFbGVtZW50IHZpc2libHkgYW5kIHNoaWZ0cyBmb2N1c1xuICAgKiB0byB0aGUgZWxlbWVudCBieSBzZXR0aW5nIHRoZSB0YWJpbmRleFxuICAgKlxuICAgKiBAcGFyYW0gICB7T2JqZWN0fSAgZWxlbWVudCAgVGhlIFRvZ2dsaW5nIEVsZW1lbnRcbiAgICogQHBhcmFtICAge09iamVjdH0gIHRhcmdldCAgIFRoZSBUYXJnZXQgRWxlbWVudFxuICAgKlxuICAgKiBAcmV0dXJuICB7T2JqZWN0fSAgICAgICAgICAgVGhlIFRvZ2dsZSBpbnN0YW5jZVxuICAgKi9cbiAganVtcFRvKGVsZW1lbnQsIHRhcmdldCkge1xuICAgIC8vIFJlc2V0IHRoZSBoaXN0b3J5IHN0YXRlLiBUaGlzIHdpbGwgY2xlYXIgb3V0XG4gICAgLy8gdGhlIGhhc2ggd2hlbiB0aGUgdGFyZ2V0IGlzIHRvZ2dsZWQgY2xvc2VkXG4gICAgaGlzdG9yeS5wdXNoU3RhdGUoJycsICcnLFxuICAgICAgd2luZG93LmxvY2F0aW9uLnBhdGhuYW1lICsgd2luZG93LmxvY2F0aW9uLnNlYXJjaCk7XG5cbiAgICAvLyBGb2N1cyBpZiBhY3RpdmVcbiAgICBpZiAodGFyZ2V0LmNsYXNzTGlzdC5jb250YWlucyh0aGlzLnNldHRpbmdzLmFjdGl2ZUNsYXNzKSkge1xuICAgICAgd2luZG93LmxvY2F0aW9uLmhhc2ggPSBlbGVtZW50LmdldEF0dHJpYnV0ZSgnaHJlZicpO1xuXG4gICAgICB0YXJnZXQuc2V0QXR0cmlidXRlKCd0YWJpbmRleCcsICcwJyk7XG4gICAgICB0YXJnZXQuZm9jdXMoe3ByZXZlbnRTY3JvbGw6IHRydWV9KTtcbiAgICB9IGVsc2Uge1xuICAgICAgdGFyZ2V0LnJlbW92ZUF0dHJpYnV0ZSgndGFiaW5kZXgnKTtcbiAgICB9XG5cbiAgICByZXR1cm4gdGhpcztcbiAgfVxuXG4gIC8qKlxuICAgKiBUaGUgbWFpbiB0b2dnbGluZyBtZXRob2QgZm9yIGF0dHJpYnV0ZXNcbiAgICpcbiAgICogQHBhcmFtICB7T2JqZWN0fSAgICBlbGVtZW50ICAgIFRoZSBUb2dnbGUgZWxlbWVudFxuICAgKiBAcGFyYW0gIHtPYmplY3R9ICAgIHRhcmdldCAgICAgVGhlIFRhcmdldCBlbGVtZW50IHRvIHRvZ2dsZSBhY3RpdmUvaGlkZGVuXG4gICAqIEBwYXJhbSAge05vZGVMaXN0fSAgZm9jdXNhYmxlICBBbnkgZm9jdXNhYmxlIGNoaWxkcmVuIGluIHRoZSB0YXJnZXRcbiAgICpcbiAgICogQHJldHVybiB7T2JqZWN0fSAgICAgICAgICAgICAgIFRoZSBUb2dnbGUgaW5zdGFuY2VcbiAgICovXG4gIGVsZW1lbnRUb2dnbGUoZWxlbWVudCwgdGFyZ2V0LCBmb2N1c2FibGUgPSBbXSkge1xuICAgIGxldCBpID0gMDtcbiAgICBsZXQgYXR0ciA9ICcnO1xuICAgIGxldCB2YWx1ZSA9ICcnO1xuXG4gICAgLyoqXG4gICAgICogU3RvcmUgZWxlbWVudHMgZm9yIHBvdGVudGlhbCB1c2UgaW4gY2FsbGJhY2tzXG4gICAgICovXG5cbiAgICB0aGlzLmVsZW1lbnQgPSBlbGVtZW50O1xuICAgIHRoaXMudGFyZ2V0ID0gdGFyZ2V0O1xuICAgIHRoaXMub3RoZXJzID0gdGhpcy5nZXRPdGhlcnMoZWxlbWVudCk7XG4gICAgdGhpcy5mb2N1c2FibGUgPSBmb2N1c2FibGU7XG5cbiAgICAvKipcbiAgICAgKiBWYWxpZGl0eSBtZXRob2QgcHJvcGVydHkgdGhhdCB3aWxsIGNhbmNlbCB0aGUgdG9nZ2xlIGlmIGl0IHJldHVybnMgZmFsc2VcbiAgICAgKi9cblxuICAgIGlmICh0aGlzLnNldHRpbmdzLnZhbGlkICYmICF0aGlzLnNldHRpbmdzLnZhbGlkKHRoaXMpKVxuICAgICAgcmV0dXJuIHRoaXM7XG5cbiAgICAvKipcbiAgICAgKiBUb2dnbGluZyBiZWZvcmUgaG9va1xuICAgICAqL1xuXG4gICAgaWYgKHRoaXMuc2V0dGluZ3MuYmVmb3JlKVxuICAgICAgdGhpcy5zZXR0aW5ncy5iZWZvcmUodGhpcyk7XG5cbiAgICAvKipcbiAgICAgKiBUb2dnbGUgRWxlbWVudCBhbmQgVGFyZ2V0IGNsYXNzZXNcbiAgICAgKi9cblxuICAgIGlmICh0aGlzLnNldHRpbmdzLmFjdGl2ZUNsYXNzKSB7XG4gICAgICB0aGlzLmVsZW1lbnQuY2xhc3NMaXN0LnRvZ2dsZSh0aGlzLnNldHRpbmdzLmFjdGl2ZUNsYXNzKTtcbiAgICAgIHRoaXMudGFyZ2V0LmNsYXNzTGlzdC50b2dnbGUodGhpcy5zZXR0aW5ncy5hY3RpdmVDbGFzcyk7XG5cbiAgICAgIC8vIElmIHRoZXJlIGFyZSBvdGhlciB0b2dnbGVzIHRoYXQgY29udHJvbCB0aGUgc2FtZSBlbGVtZW50XG4gICAgICB0aGlzLm90aGVycy5mb3JFYWNoKG90aGVyID0+IHtcbiAgICAgICAgaWYgKG90aGVyICE9PSB0aGlzLmVsZW1lbnQpXG4gICAgICAgICAgb3RoZXIuY2xhc3NMaXN0LnRvZ2dsZSh0aGlzLnNldHRpbmdzLmFjdGl2ZUNsYXNzKTtcbiAgICAgIH0pO1xuICAgIH1cblxuICAgIGlmICh0aGlzLnNldHRpbmdzLmluYWN0aXZlQ2xhc3MpXG4gICAgICB0YXJnZXQuY2xhc3NMaXN0LnRvZ2dsZSh0aGlzLnNldHRpbmdzLmluYWN0aXZlQ2xhc3MpO1xuXG4gICAgLyoqXG4gICAgICogVGFyZ2V0IEVsZW1lbnQgQXJpYSBBdHRyaWJ1dGVzXG4gICAgICovXG5cbiAgICBmb3IgKGkgPSAwOyBpIDwgVG9nZ2xlLnRhcmdldEFyaWFSb2xlcy5sZW5ndGg7IGkrKykge1xuICAgICAgYXR0ciA9IFRvZ2dsZS50YXJnZXRBcmlhUm9sZXNbaV07XG4gICAgICB2YWx1ZSA9IHRoaXMudGFyZ2V0LmdldEF0dHJpYnV0ZShhdHRyKTtcblxuICAgICAgaWYgKHZhbHVlICE9ICcnICYmIHZhbHVlKVxuICAgICAgICB0aGlzLnRhcmdldC5zZXRBdHRyaWJ1dGUoYXR0ciwgKHZhbHVlID09PSAndHJ1ZScpID8gJ2ZhbHNlJyA6ICd0cnVlJyk7XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogVG9nZ2xlIHRoZSB0YXJnZXQncyBmb2N1c2FibGUgY2hpbGRyZW4gdGFiaW5kZXhcbiAgICAgKi9cblxuICAgIGlmICh0aGlzLnNldHRpbmdzLmZvY3VzYWJsZSlcbiAgICAgIHRoaXMudG9nZ2xlRm9jdXNhYmxlKHRoaXMuZm9jdXNhYmxlKTtcblxuICAgIC8qKlxuICAgICAqIEp1bXAgdG8gVGFyZ2V0IEVsZW1lbnQgaWYgVG9nZ2xlIEVsZW1lbnQgaXMgYW4gYW5jaG9yIGxpbmtcbiAgICAgKi9cblxuICAgIGlmICh0aGlzLnNldHRpbmdzLmp1bXAgJiYgdGhpcy5lbGVtZW50Lmhhc0F0dHJpYnV0ZSgnaHJlZicpKVxuICAgICAgdGhpcy5qdW1wVG8odGhpcy5lbGVtZW50LCB0aGlzLnRhcmdldCk7XG5cbiAgICAvKipcbiAgICAgKiBUb2dnbGUgRWxlbWVudCAoaW5jbHVkaW5nIG11bHRpIHRvZ2dsZXMpIEFyaWEgQXR0cmlidXRlc1xuICAgICAqL1xuXG4gICAgZm9yIChpID0gMDsgaSA8IFRvZ2dsZS5lbEFyaWFSb2xlcy5sZW5ndGg7IGkrKykge1xuICAgICAgYXR0ciA9IFRvZ2dsZS5lbEFyaWFSb2xlc1tpXTtcbiAgICAgIHZhbHVlID0gdGhpcy5lbGVtZW50LmdldEF0dHJpYnV0ZShhdHRyKTtcblxuICAgICAgaWYgKHZhbHVlICE9ICcnICYmIHZhbHVlKVxuICAgICAgICB0aGlzLmVsZW1lbnQuc2V0QXR0cmlidXRlKGF0dHIsICh2YWx1ZSA9PT0gJ3RydWUnKSA/ICdmYWxzZScgOiAndHJ1ZScpO1xuXG4gICAgICAvLyBJZiB0aGVyZSBhcmUgb3RoZXIgdG9nZ2xlcyB0aGF0IGNvbnRyb2wgdGhlIHNhbWUgZWxlbWVudFxuICAgICAgdGhpcy5vdGhlcnMuZm9yRWFjaCgob3RoZXIpID0+IHtcbiAgICAgICAgaWYgKG90aGVyICE9PSB0aGlzLmVsZW1lbnQgJiYgb3RoZXIuZ2V0QXR0cmlidXRlKGF0dHIpKVxuICAgICAgICAgIG90aGVyLnNldEF0dHJpYnV0ZShhdHRyLCAodmFsdWUgPT09ICd0cnVlJykgPyAnZmFsc2UnIDogJ3RydWUnKTtcbiAgICAgIH0pO1xuICAgIH1cblxuICAgIC8qKlxuICAgICAqIFRvZ2dsaW5nIGNvbXBsZXRlIGhvb2tcbiAgICAgKi9cblxuICAgIGlmICh0aGlzLnNldHRpbmdzLmFmdGVyKVxuICAgICAgdGhpcy5zZXR0aW5ncy5hZnRlcih0aGlzKTtcblxuICAgIHJldHVybiB0aGlzO1xuICB9XG59XG5cbi8qKiBAdHlwZSAge1N0cmluZ30gIFRoZSBtYWluIHNlbGVjdG9yIHRvIGFkZCB0aGUgdG9nZ2xpbmcgZnVuY3Rpb24gdG8gKi9cblRvZ2dsZS5zZWxlY3RvciA9ICdbZGF0YS1qcyo9XCJ0b2dnbGVcIl0nO1xuXG4vKiogQHR5cGUgIHtTdHJpbmd9ICBUaGUgbmFtZXNwYWNlIGZvciBvdXIgZGF0YSBhdHRyaWJ1dGUgc2V0dGluZ3MgKi9cblRvZ2dsZS5uYW1lc3BhY2UgPSAndG9nZ2xlJztcblxuLyoqIEB0eXBlICB7U3RyaW5nfSAgVGhlIGhpZGUgY2xhc3MgKi9cblRvZ2dsZS5pbmFjdGl2ZUNsYXNzID0gJ2hpZGRlbic7XG5cbi8qKiBAdHlwZSAge1N0cmluZ30gIFRoZSBhY3RpdmUgY2xhc3MgKi9cblRvZ2dsZS5hY3RpdmVDbGFzcyA9ICdhY3RpdmUnO1xuXG4vKiogQHR5cGUgIHtBcnJheX0gIEFyaWEgcm9sZXMgdG8gdG9nZ2xlIHRydWUvZmFsc2Ugb24gdGhlIHRvZ2dsaW5nIGVsZW1lbnQgKi9cblRvZ2dsZS5lbEFyaWFSb2xlcyA9IFsnYXJpYS1wcmVzc2VkJywgJ2FyaWEtZXhwYW5kZWQnXTtcblxuLyoqIEB0eXBlICB7QXJyYXl9ICBBcmlhIHJvbGVzIHRvIHRvZ2dsZSB0cnVlL2ZhbHNlIG9uIHRoZSB0YXJnZXQgZWxlbWVudCAqL1xuVG9nZ2xlLnRhcmdldEFyaWFSb2xlcyA9IFsnYXJpYS1oaWRkZW4nXTtcblxuLyoqIEB0eXBlICB7QXJyYXl9ICBGb2N1c2FibGUgZWxlbWVudHMgdG8gaGlkZSB3aXRoaW4gdGhlIGhpZGRlbiB0YXJnZXQgZWxlbWVudCAqL1xuVG9nZ2xlLmVsRm9jdXNhYmxlID0gW1xuICAnYScsICdidXR0b24nLCAnaW5wdXQnLCAnc2VsZWN0JywgJ3RleHRhcmVhJywgJ29iamVjdCcsICdlbWJlZCcsICdmb3JtJyxcbiAgJ2ZpZWxkc2V0JywgJ2xlZ2VuZCcsICdsYWJlbCcsICdhcmVhJywgJ2F1ZGlvJywgJ3ZpZGVvJywgJ2lmcmFtZScsICdzdmcnLFxuICAnZGV0YWlscycsICd0YWJsZScsICdbdGFiaW5kZXhdJywgJ1tjb250ZW50ZWRpdGFibGVdJywgJ1t1c2VtYXBdJ1xuXTtcblxuLyoqIEB0eXBlICB7QXJyYXl9ICBLZXkgYXR0cmlidXRlIGZvciBzdG9yaW5nIHRvZ2dsZXMgaW4gdGhlIHdpbmRvdyAqL1xuVG9nZ2xlLmNhbGxiYWNrID0gWydUb2dnbGVzQ2FsbGJhY2snXTtcblxuLyoqIEB0eXBlICB7QXJyYXl9ICBEZWZhdWx0IGV2ZW50cyB0byB0byB3YXRjaCBmb3IgdG9nZ2xpbmcuIEVhY2ggbXVzdCBoYXZlIGEgaGFuZGxlciBpbiB0aGUgY2xhc3MgYW5kIGVsZW1lbnRzIHRvIGxvb2sgZm9yIGluIFRvZ2dsZS5lbGVtZW50cyAqL1xuVG9nZ2xlLmV2ZW50cyA9IFsnY2xpY2snLCAnY2hhbmdlJ107XG5cbi8qKiBAdHlwZSAge0FycmF5fSAgRWxlbWVudHMgdG8gZGVsZWdhdGUgdG8gZWFjaCBldmVudCBoYW5kbGVyICovXG5Ub2dnbGUuZWxlbWVudHMgPSB7XG4gIENMSUNLOiBbJ0EnLCAnQlVUVE9OJ10sXG4gIENIQU5HRTogWydTRUxFQ1QnLCAnSU5QVVQnLCAnVEVYVEFSRUEnXVxufTtcblxuZXhwb3J0IGRlZmF1bHQgVG9nZ2xlO1xuIiwiJ3VzZSBzdHJpY3QnO1xuXG4vKipcbiAqIFRyYWNraW5nIGJ1cyBmb3IgR29vZ2xlIGFuYWx5dGljcyBhbmQgV2VidHJlbmRzLlxuICovXG5jbGFzcyBUcmFjayB7XG4gIGNvbnN0cnVjdG9yKHMpIHtcbiAgICBjb25zdCBib2R5ID0gZG9jdW1lbnQucXVlcnlTZWxlY3RvcignYm9keScpO1xuXG4gICAgcyA9ICghcykgPyB7fSA6IHM7XG5cbiAgICB0aGlzLl9zZXR0aW5ncyA9IHtcbiAgICAgIHNlbGVjdG9yOiAocy5zZWxlY3RvcikgPyBzLnNlbGVjdG9yIDogVHJhY2suc2VsZWN0b3IsXG4gICAgfTtcblxuICAgIHRoaXMuZGVzaW5hdGlvbnMgPSBUcmFjay5kZXN0aW5hdGlvbnM7XG5cbiAgICBib2R5LmFkZEV2ZW50TGlzdGVuZXIoJ2NsaWNrJywgKGV2ZW50KSA9PiB7XG4gICAgICBpZiAoIWV2ZW50LnRhcmdldC5tYXRjaGVzKHRoaXMuX3NldHRpbmdzLnNlbGVjdG9yKSlcbiAgICAgICAgcmV0dXJuO1xuXG4gICAgICBsZXQga2V5ID0gZXZlbnQudGFyZ2V0LmRhdGFzZXQudHJhY2tLZXk7XG4gICAgICBsZXQgZGF0YSA9IEpTT04ucGFyc2UoZXZlbnQudGFyZ2V0LmRhdGFzZXQudHJhY2tEYXRhKTtcblxuICAgICAgdGhpcy50cmFjayhrZXksIGRhdGEpO1xuICAgIH0pO1xuXG4gICAgcmV0dXJuIHRoaXM7XG4gIH1cblxuICAvKipcbiAgICogVHJhY2tpbmcgZnVuY3Rpb24gd3JhcHBlclxuICAgKlxuICAgKiBAcGFyYW0gIHtTdHJpbmd9ICAgICAga2V5ICAgVGhlIGtleSBvciBldmVudCBvZiB0aGUgZGF0YVxuICAgKiBAcGFyYW0gIHtDb2xsZWN0aW9ufSAgZGF0YSAgVGhlIGRhdGEgdG8gdHJhY2tcbiAgICpcbiAgICogQHJldHVybiB7T2JqZWN0fSAgICAgICAgICAgIFRoZSBmaW5hbCBkYXRhIG9iamVjdFxuICAgKi9cbiAgdHJhY2soa2V5LCBkYXRhKSB7XG4gICAgLy8gU2V0IHRoZSBwYXRoIG5hbWUgYmFzZWQgb24gdGhlIGxvY2F0aW9uXG4gICAgY29uc3QgZCA9IGRhdGEubWFwKGVsID0+IHtcbiAgICAgICAgaWYgKGVsLmhhc093blByb3BlcnR5KFRyYWNrLmtleSkpXG4gICAgICAgICAgZWxbVHJhY2sua2V5XSA9IGAke3dpbmRvdy5sb2NhdGlvbi5wYXRobmFtZX0vJHtlbFtUcmFjay5rZXldfWBcbiAgICAgICAgcmV0dXJuIGVsO1xuICAgICAgfSk7XG5cbiAgICBsZXQgd3QgPSB0aGlzLndlYnRyZW5kcyhrZXksIGQpO1xuICAgIGxldCBnYSA9IHRoaXMuZ3RhZyhrZXksIGQpO1xuXG4gICAgLyogZXNsaW50LWRpc2FibGUgbm8tY29uc29sZSAqL1xuICAgIGlmIChwcm9jZXNzLmVudi5OT0RFX0VOViAhPT0gJ3Byb2R1Y3Rpb24nKVxuICAgICAgY29uc29sZS5kaXIoeydUcmFjayc6IFt3dCwgZ2FdfSk7XG4gICAgLyogZXNsaW50LWVuYWJsZSBuby1jb25zb2xlICovXG5cbiAgICByZXR1cm4gZDtcbiAgfTtcblxuICAvKipcbiAgICogRGF0YSBidXMgZm9yIHRyYWNraW5nIHZpZXdzIGluIFdlYnRyZW5kcyBhbmQgR29vZ2xlIEFuYWx5dGljc1xuICAgKlxuICAgKiBAcGFyYW0gIHtTdHJpbmd9ICAgICAgYXBwICAgVGhlIG5hbWUgb2YgdGhlIFNpbmdsZSBQYWdlIEFwcGxpY2F0aW9uIHRvIHRyYWNrXG4gICAqIEBwYXJhbSAge1N0cmluZ30gICAgICBrZXkgICBUaGUga2V5IG9yIGV2ZW50IG9mIHRoZSBkYXRhXG4gICAqIEBwYXJhbSAge0NvbGxlY3Rpb259ICBkYXRhICBUaGUgZGF0YSB0byB0cmFja1xuICAgKi9cbiAgdmlldyhhcHAsIGtleSwgZGF0YSkge1xuICAgIGxldCB3dCA9IHRoaXMud2VidHJlbmRzKGtleSwgZGF0YSk7XG4gICAgbGV0IGdhID0gdGhpcy5ndGFnVmlldyhhcHAsIGtleSk7XG5cbiAgICAvKiBlc2xpbnQtZGlzYWJsZSBuby1jb25zb2xlICovXG4gICAgaWYgKHByb2Nlc3MuZW52Lk5PREVfRU5WICE9PSAncHJvZHVjdGlvbicpXG4gICAgICBjb25zb2xlLmRpcih7J1RyYWNrJzogW3d0LCBnYV19KTtcbiAgICAvKiBlc2xpbnQtZW5hYmxlIG5vLWNvbnNvbGUgKi9cbiAgfTtcblxuICAvKipcbiAgICogUHVzaCBFdmVudHMgdG8gV2VidHJlbmRzXG4gICAqXG4gICAqIEBwYXJhbSAge1N0cmluZ30gICAgICBrZXkgICBUaGUga2V5IG9yIGV2ZW50IG9mIHRoZSBkYXRhXG4gICAqIEBwYXJhbSAge0NvbGxlY3Rpb259ICBkYXRhICBUaGUgZGF0YSB0byB0cmFja1xuICAgKi9cbiAgd2VidHJlbmRzKGtleSwgZGF0YSkge1xuICAgIGlmIChcbiAgICAgIHR5cGVvZiBXZWJ0cmVuZHMgPT09ICd1bmRlZmluZWQnIHx8XG4gICAgICB0eXBlb2YgZGF0YSA9PT0gJ3VuZGVmaW5lZCcgfHxcbiAgICAgICF0aGlzLmRlc2luYXRpb25zLmluY2x1ZGVzKCd3ZWJ0cmVuZHMnKVxuICAgIClcbiAgICAgIHJldHVybiBmYWxzZTtcblxuICAgIGxldCBldmVudCA9IFt7XG4gICAgICAnV1QudGknOiBrZXlcbiAgICB9XTtcblxuICAgIGlmIChkYXRhWzBdICYmIGRhdGFbMF0uaGFzT3duUHJvcGVydHkoVHJhY2sua2V5KSlcbiAgICAgIGV2ZW50LnB1c2goe1xuICAgICAgICAnRENTLmRjc3VyaSc6IGRhdGFbMF1bVHJhY2sua2V5XVxuICAgICAgfSk7XG4gICAgZWxzZVxuICAgICAgT2JqZWN0LmFzc2lnbihldmVudCwgZGF0YSk7XG5cbiAgICAvLyBGb3JtYXQgZGF0YSBmb3IgV2VidHJlbmRzXG4gICAgbGV0IHd0ZCA9IHthcmdzYTogZXZlbnQuZmxhdE1hcChlID0+IHtcbiAgICAgIHJldHVybiBPYmplY3Qua2V5cyhlKS5mbGF0TWFwKGsgPT4gW2ssIGVba11dKTtcbiAgICB9KX07XG5cbiAgICAvLyBJZiAnYWN0aW9uJyBpcyB1c2VkIGFzIHRoZSBrZXkgKGZvciBndGFnLmpzKSwgc3dpdGNoIGl0IHRvIFdlYnRyZW5kc1xuICAgIGxldCBhY3Rpb24gPSBkYXRhLmFyZ3NhLmluZGV4T2YoJ2FjdGlvbicpO1xuXG4gICAgaWYgKGFjdGlvbikgZGF0YS5hcmdzYVthY3Rpb25dID0gJ0RDUy5kY3N1cmknO1xuXG4gICAgLy8gV2VidHJlbmRzIGRvZXNuJ3Qgc2VuZCB0aGUgcGFnZSB2aWV3IGZvciBNdWx0aVRyYWNrLCBhZGQgcGF0aCB0byB1cmxcbiAgICBsZXQgZGNzdXJpID0gZGF0YS5hcmdzYS5pbmRleE9mKCdEQ1MuZGNzdXJpJyk7XG5cbiAgICBpZiAoZGNzdXJpKVxuICAgICAgZGF0YS5hcmdzYVtkY3N1cmkgKyAxXSA9IHdpbmRvdy5sb2NhdGlvbi5wYXRobmFtZSArIGRhdGEuYXJnc2FbZGNzdXJpICsgMV07XG5cbiAgICAvKiBlc2xpbnQtZGlzYWJsZSBuby11bmRlZiAqL1xuICAgIGlmICh0eXBlb2YgV2VidHJlbmRzICE9PSAndW5kZWZpbmVkJylcbiAgICAgIFdlYnRyZW5kcy5tdWx0aVRyYWNrKHd0ZCk7XG4gICAgLyogZXNsaW50LWRpc2FibGUgbm8tdW5kZWYgKi9cblxuICAgIHJldHVybiBbJ1dlYnRyZW5kcycsIHd0ZF07XG4gIH07XG5cbiAgLyoqXG4gICAqIFB1c2ggQ2xpY2sgRXZlbnRzIHRvIEdvb2dsZSBBbmFseXRpY3NcbiAgICpcbiAgICogQHBhcmFtICB7U3RyaW5nfSAgICAgIGtleSAgIFRoZSBrZXkgb3IgZXZlbnQgb2YgdGhlIGRhdGFcbiAgICogQHBhcmFtICB7Q29sbGVjdGlvbn0gIGRhdGEgIFRoZSBkYXRhIHRvIHRyYWNrXG4gICAqL1xuICBndGFnKGtleSwgZGF0YSkge1xuICAgIGlmIChcbiAgICAgIHR5cGVvZiBndGFnID09PSAndW5kZWZpbmVkJyB8fFxuICAgICAgdHlwZW9mIGRhdGEgPT09ICd1bmRlZmluZWQnIHx8XG4gICAgICAhdGhpcy5kZXNpbmF0aW9ucy5pbmNsdWRlcygnZ3RhZycpXG4gICAgKVxuICAgICAgcmV0dXJuIGZhbHNlO1xuXG4gICAgbGV0IHVyaSA9IGRhdGEuZmluZCgoZWxlbWVudCkgPT4gZWxlbWVudC5oYXNPd25Qcm9wZXJ0eShUcmFjay5rZXkpKTtcblxuICAgIGxldCBldmVudCA9IHtcbiAgICAgICdldmVudF9jYXRlZ29yeSc6IGtleVxuICAgIH07XG5cbiAgICAvKiBlc2xpbnQtZGlzYWJsZSBuby11bmRlZiAqL1xuICAgIGd0YWcoVHJhY2sua2V5LCB1cmlbVHJhY2sua2V5XSwgZXZlbnQpO1xuICAgIC8qIGVzbGludC1lbmFibGUgbm8tdW5kZWYgKi9cblxuICAgIHJldHVybiBbJ2d0YWcnLCBUcmFjay5rZXksIHVyaVtUcmFjay5rZXldLCBldmVudF07XG4gIH07XG5cbiAgLyoqXG4gICAqIFB1c2ggU2NyZWVuIFZpZXcgRXZlbnRzIHRvIEdvb2dsZSBBbmFseXRpY3NcbiAgICpcbiAgICogQHBhcmFtICB7U3RyaW5nfSAgYXBwICBUaGUgbmFtZSBvZiB0aGUgYXBwbGljYXRpb25cbiAgICogQHBhcmFtICB7U3RyaW5nfSAga2V5ICBUaGUga2V5IG9yIGV2ZW50IG9mIHRoZSBkYXRhXG4gICAqL1xuICBndGFnVmlldyhhcHAsIGtleSkge1xuICAgIGlmIChcbiAgICAgIHR5cGVvZiBndGFnID09PSAndW5kZWZpbmVkJyB8fFxuICAgICAgdHlwZW9mIGRhdGEgPT09ICd1bmRlZmluZWQnIHx8XG4gICAgICAhdGhpcy5kZXNpbmF0aW9ucy5pbmNsdWRlcygnZ3RhZycpXG4gICAgKVxuICAgICAgcmV0dXJuIGZhbHNlO1xuXG4gICAgbGV0IHZpZXcgPSB7XG4gICAgICBhcHBfbmFtZTogYXBwLFxuICAgICAgc2NyZWVuX25hbWU6IGtleVxuICAgIH07XG5cbiAgICAvKiBlc2xpbnQtZGlzYWJsZSBuby11bmRlZiAqL1xuICAgIGd0YWcoJ2V2ZW50JywgJ3NjcmVlbl92aWV3Jywgdmlldyk7XG4gICAgLyogZXNsaW50LWVuYWJsZSBuby11bmRlZiAqL1xuXG4gICAgcmV0dXJuIFsnZ3RhZycsIFRyYWNrLmtleSwgJ3NjcmVlbl92aWV3Jywgdmlld107XG4gIH07XG59XG5cbi8qKiBAdHlwZSB7U3RyaW5nfSBUaGUgbWFpbiBzZWxlY3RvciB0byBhZGQgdGhlIHRyYWNraW5nIGZ1bmN0aW9uIHRvICovXG5UcmFjay5zZWxlY3RvciA9ICdbZGF0YS1qcyo9XCJ0cmFja1wiXSc7XG5cbi8qKiBAdHlwZSB7U3RyaW5nfSBUaGUgbWFpbiBldmVudCB0cmFja2luZyBrZXkgdG8gbWFwIHRvIFdlYnRyZW5kcyBEQ1MudXJpICovXG5UcmFjay5rZXkgPSAnZXZlbnQnO1xuXG4vKiogQHR5cGUge0FycmF5fSBXaGF0IGRlc3RpbmF0aW9ucyB0byBwdXNoIGRhdGEgdG8gKi9cblRyYWNrLmRlc3RpbmF0aW9ucyA9IFtcbiAgJ3dlYnRyZW5kcycsXG4gICdndGFnJ1xuXTtcblxuZXhwb3J0IGRlZmF1bHQgVHJhY2s7IiwiaW1wb3J0ICcuL21vZHVsZXMvcG9seWZpbGwtcmVtb3ZlJztcblxuaW1wb3J0IHJlcXVlc3RGb3JtIGZyb20gJy4vbW9kdWxlcy9zdWJtaXNzaW9uLmpzJztcbmltcG9ydCBzd2FnZ2VyIGZyb20gJy4vbW9kdWxlcy9zd2FnZ2VyLmpzJztcbmltcG9ydCBidWxrU3VibWlzc2lvbiBmcm9tICcuL21vZHVsZXMvYnVsay1zdWJtaXNzaW9uLmpzJztcbmltcG9ydCBjaGFuZ2VQYXNzd29yZCBmcm9tICcuL21vZHVsZXMvY2hhbmdlLXBhc3N3b3JkLmpzJztcbmltcG9ydCByZXF1ZXN0Rm9ybUpTT04gZnJvbSAnLi9tb2R1bGVzL3JlcXVlc3QtZm9ybS1qc29uLmpzJztcbmltcG9ydCBJY29ucyBmcm9tICdAbnljb3Bwb3J0dW5pdHkvcHR0cm4tc2NyaXB0cy9zcmMvaWNvbnMvaWNvbnMnO1xuaW1wb3J0IFRvZ2dsZSBmcm9tICdAbnljb3Bwb3J0dW5pdHkvcHR0cm4tc2NyaXB0cy9zcmMvdG9nZ2xlL3RvZ2dsZSc7XG5pbXBvcnQgVHJhY2sgZnJvbSAnQG55Y29wcG9ydHVuaXR5L3B0dHJuLXNjcmlwdHMvc3JjL3RyYWNrL3RyYWNrJztcblxudmFyIGNkbiA9IChwcm9jZXNzLmVudi5OT0RFX0VOViA9PT0gJ3Byb2R1Y3Rpb24nKSA/XG4gICdodHRwczovL3Jhdy5naXRodWJ1c2VyY29udGVudC5jb20vQ2l0eU9mTmV3WW9yay9zY3JlZW5pbmdhcGktZG9jcy9jb250ZW50LycgOlxuICAnaHR0cHM6Ly9yYXcuZ2l0aHVidXNlcmNvbnRlbnQuY29tL0NpdHlPZk5ld1lvcmsvc2NyZWVuaW5nYXBpLWRvY3MvZW52L2RldmVsb3BtZW50LWNvbnRlbnQvJztcblxuLy8gbmV3IEljb25zKCdzdmcvaWNvbnMuc3ZnJyk7XG5uZXcgSWNvbnMoJ2h0dHBzOi8vY2RuLmpzZGVsaXZyLm5ldC9naC9jaXR5b2ZuZXd5b3JrL255Y28tcGF0dGVybnNAdjIuNi44L2Rpc3Qvc3ZnL2ljb25zLnN2ZycpO1xubmV3IEljb25zKCdodHRwczovL2Nkbi5qc2RlbGl2ci5uZXQvZ2gvY2l0eW9mbmV3eW9yay9hY2Nlc3MtbnljLXBhdHRlcm5zQHYwLjE1LjE0L2Rpc3Qvc3ZnL2ljb25zLnN2ZycpO1xuXG5uZXcgSWNvbnMoJ3N2Zy9mZWF0aGVyLnN2ZycpO1xuXG5uZXcgVG9nZ2xlKCk7XG5uZXcgVHJhY2soKTtcblxuaWYgKCh3aW5kb3cubG9jYXRpb24ucGF0aG5hbWUuaW5kZXhPZignZW5kcG9pbnRzJykgPj0gMCkpXG4gIHN3YWdnZXIoY2RuKTtcblxuaWYgKCh3aW5kb3cubG9jYXRpb24ucGF0aG5hbWUuaW5kZXhPZignZm9ybScpID49IDApKVxuICByZXF1ZXN0Rm9ybSgpO1xuXG5pZiAoKHdpbmRvdy5sb2NhdGlvbi5wYXRobmFtZS5pbmRleE9mKCdyZXF1ZXN0LWJ1aWxkZXInKSA+PSAwKSlcbiAgcmVxdWVzdEZvcm1KU09OKCk7XG5cbmlmICgod2luZG93LmxvY2F0aW9uLnBhdGhuYW1lLmluZGV4T2YoJ2J1bGstc3VibWlzc2lvbicpID49IDApKVxuICBidWxrU3VibWlzc2lvbigpO1xuXG5pZiAoKHdpbmRvdy5sb2NhdGlvbi5wYXRobmFtZS5pbmRleE9mKCdjaGFuZ2UtcGFzc3dvcmQnKSA+PSAwKSlcbiAgY2hhbmdlUGFzc3dvcmQoKTtcblxuLyogR2V0IHRoZSBjb250ZW50IG1hcmtkb3duIGZyb20gQ0ROIGFuZCBhcHBlbmQgKi9cbmxldCBtYXJrZG93bnMgPSAkKCdib2R5JykuZmluZCgnW2lkXj1cIm1hcmtkb3duXCJdJyk7XG5cbm1hcmtkb3ducy5lYWNoKGZ1bmN0aW9uKCkge1xuICBsZXQgdGFyZ2V0ID0gJCh0aGlzKTtcbiAgbGV0IGZpbGUgPSAkKHRoaXMpLmF0dHIoJ2lkJykucmVwbGFjZSgnbWFya2Rvd24tJywgJycpO1xuXG4gICQuZ2V0KGNkbiArIGZpbGUgKyAnLm1kJywgZnVuY3Rpb24oZGF0YSkge1xuICAgIGxldCBjb252ZXJ0ZXIgPSBuZXcgc2hvd2Rvd24uQ29udmVydGVyKHt0YWJsZXM6IHRydWV9KTtcbiAgICBsZXQgaHRtbCAgICAgID0gY29udmVydGVyLm1ha2VIdG1sKGRhdGEpO1xuXG4gICAgdGFyZ2V0LmFwcGVuZChodG1sKVxuICAgICAgLmhpZGUoKVxuICAgICAgLmZhZGVJbigyNTApXG5cbiAgfSwgJ3RleHQnKVxufSk7XG4iXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7O0VBQUEsQ0FBQyxTQUFTLEdBQUcsRUFBRTtFQUNmLEVBQUUsR0FBRyxDQUFDLE9BQU8sQ0FBQyxTQUFTLElBQUksRUFB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QUNBLElBQUksSUFBSSxJQUFJLENBQUMsUUFBUSxDQUFDLElBQUksSUFBSSxJQUFJLENBQUMsT0FBTyxDQUFDLFlBQVksQ0FBQyxNQUFNLENBQUM7RUFDL0QsTUFBTSxJQUFJLENBQUMsTUFBTSxDQUFDLElBQUksQ0FBQyxPQUFPLEVBQUUsSUFBSSxDQUFDLE1BQU0sQ0FBQyxDQUFDO0FBQzdDO0VBQ0E7RUFDQTtFQUNBO0FBQ0E7RUFDQSxJQUFJLEtBQUssQ0FBQyxHQUFHLENBQUMsRUFBRSxDQUFDLEdBQUcsTUFBTSxDQUFDLFdBQVcsQ0FBQyxNQUFNLEVBQUUsQ0FBQyxFQUFFLEVBQUU7RUFDcEQsTUFBTSxJQUFJLEdBQUcsTUFBTSxDQUFDLFdBQVcsQ0FBQyxDQUFDLENBQUMsQ0FBQztFQUNuQyxNQUFNLEtBQUssR0FBRyxJQUFJLENBQUMsT0FBTyxDQUFDLFlBQVksQ0FBQyxJQUFJLENBQUMsQ0FBQztBQUM5QztFQUNBLE1BQU0sSUFBSSxLQUFLLElBQUksRUFBRSxJQUFJLEtBQUs7RUFDOUIsUUFBUSxJQUFJLENBQUMsT0FBTyxDQUFDLFlBQVksQ0FBQyxJQUFJLEVBQUUsQ0FBQyxLQUFLLEtBQUssTUFBTSxJQUFJLE9BQU8sR0FBRyxNQUFNLENBQUMsQ0FBQztBQUMvRTtFQUNBO0VBQ0EsTUFBTSxJQUFJLENBQUMsTUFBTSxDQUFDLE9BQU8sQ0FBQyxDQUFDLEtBQUssS0FBSztFQUNyQyxRQUFRLElBQUksS0FBSyxLQUFLLElBQUksQ0FBQyxPQUFPLElBQUksS0FBSyxDQUFDLFlBQVksQ0FBQyxJQUFJLENBQUM7RUFDOUQsVUFBVSxLQUFLLENBQUMsWUFBWSxDQUFDLElBQUksRUFBRSxDQUFDLEtBQUssS0FBSyxNQUFNLElBQUksT0FBTyxHQUFHLE1BQU0sQ0FBQyxDQUFDO0VBQzFFLE9BQU8sQ0FBQyxDQUFDO0VBQ1QsS0FBSztBQUNMO0VBQ0E7RUFDQTtFQUNBO0FBQ0E7RUFDQSxJQUFJLElBQUksSUFBSSxDQUFDLFFBQVEsQ0FBQyxLQUFLO0VBQzNCLE1BQU0sSUFBSSxDQUFDLFFBQVEs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
