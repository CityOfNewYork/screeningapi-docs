(function () {
<<<<<<< HEAD
<<<<<<< HEAD
=======
>>>>>>> ee68aa6... Integrating jquery via a CDN
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

    $('#swagger-editor').fadeIn(2500);

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
<<<<<<< HEAD
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
=======
	'use strict';

	/*!
	 * jQuery JavaScript Library v3.5.1
	 * https://jquery.com/
	 *
	 * Includes Sizzle.js
	 * https://sizzlejs.com/
	 *
	 * Copyright JS Foundation and other contributors
	 * Released under the MIT license
	 * https://jquery.org/license
	 *
	 * Date: 2020-05-04T22:49Z
	 */
	( function( global, factory ) {

		if ( typeof module === "object" && typeof module.exports === "object" ) {

			// For CommonJS and CommonJS-like environments where a proper `window`
			// is present, execute the factory and get jQuery.
			// For environments that do not have a `window` with a `document`
			// (such as Node.js), expose a factory as module.exports.
			// This accentuates the need for the creation of a real `window`.
			// e.g. var jQuery = require("jquery")(window);
			// See ticket #14549 for more info.
			module.exports = global.document ?
				factory( global, true ) :
				function( w ) {
					if ( !w.document ) {
						throw new Error( "jQuery requires a window with a document" );
					}
					return factory( w );
				};
		} else {
			factory( global );
		}

	// Pass this if window is not defined yet
	} )( typeof window !== "undefined" ? window : undefined, function( window, noGlobal ) {

	var arr = [];

	var getProto = Object.getPrototypeOf;

	var slice = arr.slice;

	var flat = arr.flat ? function( array ) {
		return arr.flat.call( array );
	} : function( array ) {
		return arr.concat.apply( [], array );
	};


	var push = arr.push;

	var indexOf = arr.indexOf;

	var class2type = {};

	var toString = class2type.toString;

	var hasOwn = class2type.hasOwnProperty;

	var fnToString = hasOwn.toString;

	var ObjectFunctionString = fnToString.call( Object );

	var support = {};

	var isFunction = function isFunction( obj ) {

	      // Support: Chrome <=57, Firefox <=52
	      // In some browsers, typeof returns "function" for HTML <object> elements
	      // (i.e., `typeof document.createElement( "object" ) === "function"`).
	      // We don't want to classify *any* DOM node as a function.
	      return typeof obj === "function" && typeof obj.nodeType !== "number";
	  };


	var isWindow = function isWindow( obj ) {
			return obj != null && obj === obj.window;
		};
>>>>>>> 481c593... Replaced compiled file from main.js to source.js

      this.classes = Forms.classes;

<<<<<<< HEAD
      this.markup = Forms.markup;

      this.selectors = Forms.selectors;

      this.attrs = Forms.attrs;

      this.FORM.setAttribute('novalidate', true);

      return this;
    }
=======
	var document = window.document;



		var preservedScriptAttributes = {
			type: true,
			src: true,
			nonce: true,
			noModule: true
		};

		function DOMEval( code, node, doc ) {
			doc = doc || document;

			var i, val,
				script = doc.createElement( "script" );

			script.text = code;
			if ( node ) {
				for ( i in preservedScriptAttributes ) {

					// Support: Firefox 64+, Edge 18+
					// Some browsers don't support the "nonce" property on scripts.
					// On the other hand, just using `getAttribute` is not enough as
					// the `nonce` attribute is reset to an empty string whenever it
					// becomes browsing-context connected.
					// See https://github.com/whatwg/html/issues/2369
					// See https://html.spec.whatwg.org/#nonce-attributes
					// The `node.getAttribute` check was added for the sake of
					// `jQuery.globalEval` so that it can fake a nonce-containing node
					// via an object.
					val = node[ i ] || node.getAttribute && node.getAttribute( i );
					if ( val ) {
						script.setAttribute( i, val );
					}
				}
			}
			doc.head.appendChild( script ).parentNode.removeChild( script );
		}
>>>>>>> 481c593... Replaced compiled file from main.js to source.js

    /**
     * Map toggled checkbox values to an input.
     * @param  {Object} event The parent click event.
     * @return {Element}      The target element.
     */
    joinValues(event) {
      if (!event.target.matches('input[type="checkbox"]'))
        return;

<<<<<<< HEAD
      if (!event.target.closest('[data-js-join-values]'))
        return;

      let el = event.target.closest('[data-js-join-values]');
      let target = document.querySelector(el.dataset.jsJoinValues);
=======
	function toType( obj ) {
		if ( obj == null ) {
			return obj + "";
		}

		// Support: Android <=2.3 only (functionish RegExp)
		return typeof obj === "object" || typeof obj === "function" ?
			class2type[ toString.call( obj ) ] || "object" :
			typeof obj;
	}
	/* global Symbol */
	// Defining this global in .eslintrc.json would create a danger of using the global
	// unguarded in another place, it seems safer to define global only for this module

>>>>>>> 481c593... Replaced compiled file from main.js to source.js

      target.value = Array.from(
          el.querySelectorAll('input[type="checkbox"]')
        )
        .filter((e) => (e.value && e.checked))
        .map((e) => e.value)
        .join(', ');

<<<<<<< HEAD
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
          $(this).parent().addClass('error');
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

  new Icons('svg/icons.svg');
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
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoic291cmNlLmpzIiwic291cmNlcyI6WyIuLi8uLi9zcmMvanMvbW9kdWxlcy9wb2x5ZmlsbC1yZW1vdmUuanMiLCIuLi8uLi9zcmMvanMvbW9kdWxlcy9yZXNwb25zZXMuanMiLCIuLi8uLi9zcmMvanMvbW9kdWxlcy9zdWJtaXNzaW9uLmpzIiwiLi4vLi4vc3JjL2pzL21vZHVsZXMvc3dhZ2dlci5qcyIsIi4uLy4uL25vZGVfbW9kdWxlcy9Abnljb3Bwb3J0dW5pdHkvcHR0cm4tc2NyaXB0cy9zcmMvZm9ybXMvZm9ybXMuanMiLCIuLi8uLi9zcmMvanMvbW9kdWxlcy91dGlsLmpzIiwiLi4vLi4vc3JjL2pzL21vZHVsZXMvYnVsay1zdWJtaXNzaW9uLmpzIiwiLi4vLi4vc3JjL2pzL21vZHVsZXMvY2hhbmdlLXBhc3N3b3JkLmpzIiwiLi4vLi4vc3JjL2pzL21vZHVsZXMvcmVxdWVzdC1mb3JtLWpzb24uanMiLCIuLi8uLi9ub2RlX21vZHVsZXMvQG55Y29wcG9ydHVuaXR5L3B0dHJuLXNjcmlwdHMvc3JjL2ljb25zL2ljb25zLmpzIiwiLi4vLi4vbm9kZV9tb2R1bGVzL0BueWNvcHBvcnR1bml0eS9wdHRybi1zY3JpcHRzL3NyYy90b2dnbGUvdG9nZ2xlLmpzIiwiLi4vLi4vbm9kZV9tb2R1bGVzL0BueWNvcHBvcnR1bml0eS9wdHRybi1zY3JpcHRzL3NyYy90cmFjay90cmFjay5qcyIsIi4uLy4uL3NyYy9qcy9tYWluLmpzIl0sInNvdXJjZXNDb250ZW50IjpbIihmdW5jdGlvbihhcnIpIHtcbiAgYXJyLmZvckVhY2goZnVuY3Rpb24oaXRlbSkge1xuICAgIGlmIChpdGVtLmhhc093blByb3BlcnR5KCdyZW1vdmUnKSkge1xuICAgICAgcmV0dXJuO1xuICAgIH1cbiAgICBPYmplY3QuZGVmaW5lUHJvcGVydHkoaXRlbSwgJ3JlbW92ZScsIHtcbiAgICAgIGNvbmZpZ3VyYWJsZTogdHJ1ZSxcbiAgICAgIGVudW1lcmFibGU6IHRydWUsXG4gICAgICB3cml0YWJsZTogdHJ1ZSxcbiAgICAgIHZhbHVlOiBmdW5jdGlvbiByZW1vdmUoKSB7XG4gICAgICAgIGlmICh0aGlzLnBhcmVudE5vZGUgIT09IG51bGwpXG4gICAgICAgICAgdGhpcy5wYXJlbnROb2RlLnJlbW92ZUNoaWxkKHRoaXMpO1xuICAgICAgfVxuICAgIH0pO1xuICB9KTtcbn0pKFtcbiAgRWxlbWVudC5wcm90b3R5cGUsXG4gIENoYXJhY3RlckRhdGEucHJvdG90eXBlLFxuICBEb2N1bWVudFR5cGUucHJvdG90eXBlXG5dKTsiLCJleHBvcnQgZGVmYXVsdCBbXG4gIHtcbiAgICBcIkVNQUlMXCI6IFwiUGxlYXNlIGVudGVyIGEgdmFsaWQgZW1haWwuXCJcbiAgfSxcbiAge1xuICAgIFwiRk5BTUVcIjogXCJQbGVhc2UgZW50ZXIgeW91ciBmaXJzdCBuYW1lLlwiXG4gIH0sXG4gIHtcbiAgICBcIkxOQU1FXCI6IFwiUGxlYXNlIGVudGVyIHlvdXIgbGFzdCBuYW1lLlwiXG4gIH0sXG4gIHtcbiAgICBcIk9SR1wiOiBcIlBsZWFzZSBlbnRlciB5b3VyIG9yZ2FuaXphdGlvbi5cIlxuICB9LFxuICB7XG4gICAgXCJFUlJcIjogXCJUaGVyZSB3YXMgYSBwcm9ibGVtIHdpdGggeW91ciByZXF1ZXN0LiBQbGVhc2UgdHJ5IGFnYWluIGxhdGVyIG9yIHNlbmQgdXMgYSBtZXNzYWdlIGF0IDxhIGNsYXNzPVxcXCJ0ZXh0LXByaW1hcnktcmVkXFxcIiBocmVmPVxcXCJtYWlsdG86ZWxpZ2liaWxpdHlhcGlAbnljb3Bwb3J0dW5pdHkubnljLmdvdlxcXCI+ZWxpZ2liaWxpdHlhcGlAbnljb3Bwb3J0dW5pdHkubnljLmdvdjwvYT4uIFdlIHdpbGwgZ2V0IGJhY2sgdG8geW91IGFzIHNvb24gYXMgcG9zc2libGUhXCJcbiAgfSxcbiAge1xuICAgIFwiRVJSX0FMUkVBRFlfUkVRVUVTVEVEXCI6IFwiWW91IGhhdmUgYWxyZWFkeSBtYWRlIGEgcmVxdWVzdC4gSWYgeW91IGhhdmUgbm90IGhlYXJkIGJhY2sgZnJvbSB1cywgcGxlYXNlIHNlbmQgdXMgYSBtZXNzYWdlIGF0IDxhIGNsYXNzPVxcXCJ0ZXh0LXByaW1hcnktcmVkXFxcIiBocmVmPVxcXCJtYWlsdG86ZWxpZ2liaWxpdHlhcGlAbnljb3Bwb3J0dW5pdHkubnljLmdvdlxcXCI+ZWxpZ2liaWxpdHlhcGlAbnljb3Bwb3J0dW5pdHkubnljLmdvdjwvYT4uIFdlIHdpbGwgZ2V0IGJhY2sgdG8geW91IGFzIHNvb24gYXMgcG9zc2libGUhXCJcbiAgfSxcbiAge1xuICAgIFwiRVJSX1RPT19NQU5ZX1JFUVVFU1RTXCI6IFwiSXQgc2VlbXMgdGhhdCB5b3UgaGF2ZSBtYWRlIHRvbyBtYW55IHJlcXVlc3RzLiBQbGVhc2UgdHJ5IGFnYWluIGxhdGVyIG9yIHNlbmQgdXMgYSBtZXNzYWdlIGF0IDxhIGNsYXNzPVxcXCJ0ZXh0LXByaW1hcnktcmVkXFxcIiBocmVmPVxcXCJtYWlsdG86ZWxpZ2liaWxpdHlhcGlAbnljb3Bwb3J0dW5pdHkubnljLmdvdlxcXCI+ZWxpZ2liaWxpdHlhcGlAbnljb3Bwb3J0dW5pdHkubnljLmdvdjwvYT4uIFdlIHdpbGwgZ2V0IGJhY2sgdG8geW91IGFzIHNvb24gYXMgcG9zc2libGUhXCJcbiAgfSxcbiAge1xuICAgIFwiTVNHX1JFQ0FQVENIQVwiOiBcIlRoZXJlJ3Mgb25lIG1vcmUgc3RlcCFcIlxuICB9LFxuICB7XG4gICAgXCJTVUNDRVNTXCI6IFwiVGhhbmsgeW91ISBZb3VyIHJlcXVlc3Qgd2lsbCBiZSByZXZpZXdlZCB3aXRoIGNvbmZpcm1hdGlvbiB3aXRoaW4gMS0yIGJ1c2luZXNzIGRheXMuXCJcbiAgfSxcbiAge1xuICAgIFwiR2VuZXJhbFwiOiB7XG4gICAgICBcImVycm9yXCI6IFwiUGxlYXNlIHJlc29sdmUgaGlnaGxpZ2h0ZWQgZmllbGRzLlwiLFxuICAgICAgXCJ3YXJuaW5nXCI6IFwiUmVzb2x2aW5nIHRoZSBmb2xsb3dpbmcgbWlnaHQgZ2VuZXJhdGUgZGlmZmVyZW50IHNjcmVlbmluZyByZXN1bHRzIGZvciB0aGlzIGhvdXNlaG9sZCAob3B0aW9uYWwpOlwiXG4gICAgfVxuICB9LFxuICB7XG4gICAgXCJIb3VzZWhvbGRcIjoge1xuICAgICAgXCJlcnJfZXhjZXNzX21lbWJlcnNcIjogXCJIb3VzZWhvbGQ6IFRoZSBudW1iZXIgb2YgaG91c2Vob2xkIG1lbWJlcnMgbXVzdCBiZSBiZXR3ZWVuIDEgYW5kIDggbWVtYmVycy5cIixcbiAgICAgIFwid2FybmluZ19yZW50YWxfdHlwZVwiOiBcIkhvdXNlaG9sZDogVGhlcmUgc2hvdWxkIGJlIGEgcmVudGFsIHR5cGUuXCJcbiAgICB9XG4gIH0sXG4gIHtcbiAgICBcIlBlcnNvblwiOiB7XG4gICAgICBcImVycl9udW1fcGVyc29uc1wiOiBcIlBlcnNvbjogVGhlIG51bWJlciBvZiBwZXJzb25zIGNhbm5vdCBleGNlZWQgOCBtZW1iZXJzXCIsXG4gICAgICBcImVycl9ob2hcIjogXCJQZXJzb246IEV4YWN0bHkgb25lIHBlcnNvbiBtdXN0IGJlIHRoZSBoZWFkIG9mIGhvdXNlaG9sZC5cIixcbiAgICAgIFwid2FybmluZ19vbl9sZWFzZVwiOiBcIlBlcnNvbjogQXQgbGVhc3Qgb25lIHBlcnNvbiBzaG91bGQgYmUgb24gdGhlIGxlYXNlLlwiLFxuICAgICAgXCJ3YXJuaW5nX29uX2RlZWRcIjogXCJQZXJzb246IEF0IGxlYXN0IG9uZSBwZXJzb24gc2hvdWxkIGJlIG9uIHRoZSBkZWVkLlwiXG4gICAgfVxuICB9XG5dXG4iLCJpbXBvcnQgcmVzcG9uc2VzIGZyb20gJy4vcmVzcG9uc2VzLmpzJztcblxuZXhwb3J0IGRlZmF1bHQgZnVuY3Rpb24oKSB7XG4gIGNvbnN0IGVycm9yTXNnID0gJ1BsZWFzZSBlbnRlciB5b3VyIGZpcnN0IG5hbWUsIGxhc3QgbmFtZSwgZW1haWwgYW5kIG9yZ2FuaXphdGlvbi4nO1xuXG4gIC8qKlxuICAqIFZhbGlkYXRlIGZvcm0gZmllbGRzXG4gICogQHBhcmFtIHtvYmplY3R9IGZvcm1EYXRhIC0gZm9ybSBmaWVsZHNcbiAgKiBAcGFyYW0ge29iamVjdH0gZXZlbnQgLSBldmVudCBvYmplY3RcbiAgKi9cbiAgZnVuY3Rpb24gdmFsaWRhdGVGaWVsZHMoZm9ybSwgZXZlbnQpIHtcbiAgICBldmVudC5wcmV2ZW50RGVmYXVsdCgpO1xuXG4gICAgY29uc3QgZmllbGRzID0gZm9ybS5zZXJpYWxpemVBcnJheSgpLnJlZHVjZSgob2JqLCBpdGVtKSA9PiAob2JqW2l0ZW0ubmFtZV0gPSBpdGVtLnZhbHVlLCBvYmopICx7fSlcbiAgICBjb25zdCByZXF1aXJlZEZpZWxkcyA9IGZvcm0uZmluZCgnW3JlcXVpcmVkXScpO1xuICAgIGNvbnN0IGVtYWlsUmVnZXggPSBuZXcgUmVnRXhwKC9cXFMrQFxcUytcXC5cXFMrLyk7XG4gICAgbGV0IGhhc0Vycm9ycyA9IGZhbHNlO1xuXG4gICAgLy8gbG9vcCB0aHJvdWdoIGVhY2ggcmVxdWlyZWQgZmllbGRcbiAgICByZXF1aXJlZEZpZWxkcy5lYWNoKGZ1bmN0aW9uKCkge1xuICAgICAgY29uc3QgZmllbGROYW1lID0gJCh0aGlzKS5hdHRyKCduYW1lJyk7XG5cbiAgICAgIGlmKCAhZmllbGRzW2ZpZWxkTmFtZV0gfHxcbiAgICAgICAgKGZpZWxkTmFtZSA9PSAnRU1BSUwnICYmICFlbWFpbFJlZ2V4LnRlc3QoZmllbGRzLkVNQUlMKSkgKSB7XG4gICAgICAgIGhhc0Vycm9ycyA9IHRydWU7XG4gICAgICAgICQodGhpcykuYWRkQ2xhc3MoJ2lzLWVycm9yJyk7XG4gICAgICAgICQodGhpcykuYWRkQ2xhc3MoJ2JvcmRlci1wcmltYXJ5LXJlZCcpO1xuICAgICAgICAkKHRoaXMpLmJlZm9yZSgnPHAgY2xhc3M9XCJpcy1lcnJvciB0ZXh0LXByaW1hcnktcmVkIHRleHQtc21hbGwgbXktMFwiPicrIHJlc3BvbnNlcy5maW5kKHggPT4geFtmaWVsZE5hbWVdKVtmaWVsZE5hbWVdICsgJzwvcD4nKTtcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgICQodGhpcykucmVtb3ZlQ2xhc3MoJ2JvcmRlci1wcmltYXJ5LXJlZCcpO1xuICAgICAgfVxuICAgIH0pO1xuXG4gICAgLy8gaWYgdGhlcmUgYXJlIG5vIGVycm9ycywgc3VibWl0XG4gICAgaWYgKGhhc0Vycm9ycykge1xuICAgICAgZm9ybS5maW5kKCcuZm9ybS1lcnJvcicpLmh0bWwoYDxwPiR7ZXJyb3JNc2d9PC9wPmApO1xuICAgIH0gZWxzZSB7XG4gICAgICBzdWJtaXRTaWdudXAoZm9ybSwgZmllbGRzKTtcbiAgICB9XG4gIH1cblxuICAvKipcbiAgKiBTdWJtaXRzIHRoZSBmb3JtIG9iamVjdCB0byBNYWlsY2hpbXBcbiAgKiBAcGFyYW0ge29iamVjdH0gZm9ybURhdGEgLSBmb3JtIGZpZWxkc1xuICAqL1xuICBmdW5jdGlvbiBzdWJtaXRTaWdudXAoZm9ybSwgZm9ybURhdGEpe1xuICAgICQuYWpheCh7XG4gICAgICB1cmw6IGZvcm0uYXR0cignYWN0aW9uJyksXG4gICAgICB0eXBlOiBmb3JtLmF0dHIoJ21ldGhvZCcpLFxuICAgICAgZGF0YVR5cGU6ICdqc29uJywvL25vIGpzb25wXG4gICAgICBjYWNoZTogZmFsc2UsXG4gICAgICBkYXRhOiBmb3JtRGF0YSxcbiAgICAgIGNvbnRlbnRUeXBlOiBcImFwcGxpY2F0aW9uL2pzb247IGNoYXJzZXQ9dXRmLThcIixcbiAgICAgIHN1Y2Nlc3M6IGZ1bmN0aW9uKHJlc3BvbnNlKSB7XG4gICAgICAgIGlmKHJlc3BvbnNlLnJlc3VsdCAhPT0gJ3N1Y2Nlc3MnKXtcbiAgICAgICAgICAgIGlmKHJlc3BvbnNlLm1zZy5pbmNsdWRlcygnYWxyZWFkeSBzdWJzY3JpYmVkJykpe1xuICAgICAgICAgICAgICBmb3JtLmh0bWwoJzxwIGNsYXNzPVwidGV4dC1wcmltYXJ5LXJlZCB0ZXh0LWNlbnRlciBpdGFsaWNcIj4nKyByZXNwb25zZXMuZmluZCh4ID0+IHhbXCJFUlJfQUxSRUFEWV9SRVFVRVNURURcIl0pW1wiRVJSX0FMUkVBRFlfUkVRVUVTVEVEXCJdICsgJzwvcD4nKTtcbiAgICAgICAgICAgIH0gZWxzZSBpZihyZXNwb25zZS5tc2cuaW5jbHVkZXMoJ3RvbyBtYW55IHJlY2VudCBzaWdudXAgcmVxdWVzdHMnKSl7XG4gICAgICAgICAgICAgIGZvcm0uaHRtbCgnPHAgY2xhc3M9XCJ0ZXh0LXByaW1hcnktcmVkIHRleHQtY2VudGVyIGl0YWxpY1wiPicrIHJlc3BvbnNlcy5maW5kKHggPT4geFtcIkVSUl9UT09fTUFOWV9SRVFVRVNUU1wiXSlbXCJFUlJfVE9PX01BTllfUkVRVUVTVFNcIl0gKyc8L3A+Jyk7XG4gICAgICAgICAgICB9IGVsc2UgaWYocmVzcG9uc2UubXNnLmluY2x1ZGVzKCdjYXB0Y2hhJykpe1xuICAgICAgICAgICAgICB2YXIgdXJsID0gJChcImZvcm0jbWMtZW1iZWRkZWQtc3Vic2NyaWJlLWZvcm1cIikuYXR0cihcImFjdGlvblwiKTtcbiAgICAgICAgICAgICAgdmFyIHBhcmFtZXRlcnMgPSAkLnBhcmFtKHJlc3BvbnNlLnBhcmFtcyk7XG4gICAgICAgICAgICAgIHVybCA9IHVybC5zcGxpdChcIi1qc29uP1wiKVswXTtcbiAgICAgICAgICAgICAgdXJsICs9IFwiP1wiO1xuICAgICAgICAgICAgICB1cmwgKz0gcGFyYW1ldGVycztcbiAgICAgICAgICAgICAgd2luZG93Lm9wZW4odXJsLCAnX2JsYW5rJyk7XG4gICAgICAgICAgICAgIGZvcm0uaHRtbCgnPHAgY2xhc3M9XCJ0ZXh0LXByaW1hcnktbmF2eSB0ZXh0LWNlbnRlciBpdGFsaWNcIj4nKyByZXNwb25zZXMuZmluZCh4ID0+IHhbXCJNU0dfUkVDQVBUQ0hBXCJdKVtcIk1TR19SRUNBUFRDSEFcIl0gKyc8YSBjbGFzcz1cInRleHQtcHJpbWFyeS1yZWRcIiB0YXJnZXQ9XCJfYmxhbmtcIiBocmVmPVwiJyArIHVybCArICdcIj4gUGxlYXNlIGNvbmZpcm0gdGhhdCB5b3UgYXJlIG5vdCBhIHJvYm90LjwvYT48L3A+Jyk7XG4gICAgICAgICAgICB9ZWxzZSB7XG4gICAgICAgICAgICAgIGZvcm0uaHRtbCgnPHAgY2xhc3M9XCJ0ZXh0LXByaW1hcnktcmVkIHRleHQtY2VudGVyIGl0YWxpY1wiPicgKyByZXNwb25zZXMuZmluZCh4ID0+IHhbXCJFUlJcIl0pW1wiRVJSXCJdICsgJzwvcD4nKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfWVsc2Uge1xuICAgICAgICAgIGZvcm0uaHRtbCgnPHAgY2xhc3M9XCJ0ZXh0LXByaW1hcnktbmF2eSB0ZXh0LWNlbnRlciBpdGFsaWNcIj4nKyByZXNwb25zZXMuZmluZCh4ID0+IHhbXCJTVUNDRVNTXCJdKVtcIlNVQ0NFU1NcIl0gKyc8L3A+Jyk7XG4gICAgICAgIH1cbiAgICAgIH0sXG4gICAgICBlcnJvcjogZnVuY3Rpb24ocmVzcG9uc2UpIHtcbiAgICAgICAgY29uc29sZS5sb2cocmVzcG9uc2UpXG4gICAgICAgIGZvcm0uYmVmb3JlKCc8cCBjbGFzcz1cInRleHQtcHJpbWFyeS1yZWQgdGV4dC1jZW50ZXIgaXRhbGljXCI+JyArIHJlc3BvbnNlcy5maW5kKHggPT4geFtcIkVSUlwiXSlbXCJFUlJcIl0gKyAnPC9wPicpO1xuICAgICAgfVxuICAgIH0pO1xuICB9XG5cbiAgLyoqXG4gICogVHJpZ2dlcnMgZm9ybSB2YWxpZGF0aW9uIGFuZCBzZW5kcyB0aGUgZm9ybSBkYXRhIHRvIE1haWxjaGltcFxuICAqIEBwYXJhbSB7b2JqZWN0fSBmb3JtRGF0YSAtIGZvcm0gZmllbGRzXG4gICovXG4gICQoJyNtYy1lbWJlZGRlZC1zdWJzY3JpYmU6YnV0dG9uW3R5cGU9XCJzdWJtaXRcIl0nKS5jbGljayhmdW5jdGlvbihldmVudCl7XG4gICAgZXZlbnQucHJldmVudERlZmF1bHQoKTtcbiAgICBsZXQgJGZvcm0gPSAkKHRoaXMpLnBhcmVudHMoJ2Zvcm0nKTtcbiAgICB2YWxpZGF0ZUZpZWxkcygkZm9ybSwgZXZlbnQpO1xuICB9KTtcblxufVxuIiwiZXhwb3J0IGRlZmF1bHQgZnVuY3Rpb24oY2RuKSB7XG4gIGNvbnN0IGNvbnRyb2xsZXIgPSBuZXcgQWJvcnRDb250cm9sbGVyKClcblxuICB3aW5kb3cuZWRpdG9yID0gU3dhZ2dlckVkaXRvckJ1bmRsZSh7XG4gICAgZG9tX2lkOiAnI3N3YWdnZXItZWRpdG9yJyxcbiAgICB1cmw6IGNkbiArICdlbmRwb2ludHMueW1sJ1xuICB9KTtcblxuICAkKCcuU3BsaXRQYW5lJykuY3NzKCdwb3NpdGlvbicsICdyZWxhdGl2ZScpO1xuICAkKCcuUGFuZTEnKS5jc3MoJ2Rpc3BsYXknLCAnbm9uZScpO1xuICAkKCcuUGFuZTInKS5jc3MoJ3dpZHRoJywgJzEwMCUnKTtcblxuICAvLyBnZW5lcmF0ZSBjdXJsIGNvbW1hbmQgdG8gdHJ5IGl0IG91dFxuICAkKCdib2R5Jykub24oJ2NsaWNrJywgJy50cnktb3V0X19idG4nLCBmdW5jdGlvbihldmVudCl7XG4gICAgZ2VuZXJhdGVDdXJsKHRoaXMpXG4gIH0pXG5cbiAgJCgnYm9keScpLm9uKCdrZXl1cCcsICdbcGxhY2Vob2xkZXJePWludGVyZXN0ZWRQcm9ncmFtc10nLCBmdW5jdGlvbihldmVudCl7XG4gICAgZ2VuZXJhdGVDdXJsKHRoaXMpO1xuICB9KVxuXG4gICQoJ2JvZHknKS5vbigna2V5dXAnLCAnW3BsYWNlaG9sZGVyXj1BdXRob3JpemF0aW9uXScsIGZ1bmN0aW9uKGV2ZW50KXtcbiAgICBnZW5lcmF0ZUN1cmwodGhpcyk7XG4gIH0pXG5cbiAgJCgnYm9keScpLm9uKCdrZXl1cCcsICdbY2xhc3NePWJvZHktcGFyYW1fX3RleHRdJywgZnVuY3Rpb24oZXZlbnQpe1xuICAgIGdlbmVyYXRlQ3VybCh0aGlzKTtcbiAgfSlcblxuICAkKCdib2R5Jykub24oJ2NoYW5nZScsICdbdHlwZV49ZmlsZV0nLCBmdW5jdGlvbihldmVudCl7XG4gICAgZ2VuZXJhdGVDdXJsKHRoaXMpO1xuICB9KVxuXG4gICQoJyNzd2FnZ2VyLWVkaXRvcicpLmZhZGVJbigyNTAwKVxuXG4gIGZ1bmN0aW9uIGdlbmVyYXRlQ3VybChvYmopIHtcbiAgICBjb25zdCBkb21haW4gPSAkKCdib2R5JykuZmluZCgnLnNlcnZlcnMgOnNlbGVjdGVkJykudGV4dCgpO1xuICAgIGNvbnN0IGVwX2lkID0gJChvYmopLnBhcmVudHMoJy5vcGJsb2NrLXBvc3Q6Zmlyc3QnKS5hdHRyKCdpZCcpO1xuICAgIGNvbnN0IGVwID0gdXRpbC5mb3JtYXQoXCIvJXNcIiwgZXBfaWQuc3Vic3RyKGVwX2lkLmluZGV4T2YoXCJfXCIpICsgMSkucmVwbGFjZShcIl9cIiwgXCIvXCIpKTtcbiAgICBjb25zdCBwYXJfbm9kZSA9ICQob2JqKS5wYXJlbnRzKCcub3BibG9jay1ib2R5OmZpcnN0Jyk7XG4gICAgY29uc3QgZXhhbXBsZUJvZHkgPSBwYXJfbm9kZS5maW5kKCcuYm9keS1wYXJhbV9fZXhhbXBsZScpO1xuICAgIGNvbnN0IHRleHRCb2R5ID0gZXhhbXBsZUJvZHkubGVuZ3RoID4gMCA/IGV4YW1wbGVCb2R5LnRleHQoKSA6IHBhcl9ub2RlLmZpbmQoJy5ib2R5LXBhcmFtX190ZXh0JykudGV4dCgpXG4gICAgY29uc3QgcGFyYW1zID0gdGV4dEJvZHkucmVwbGFjZSgvXFxzL2csJycpO1xuXG4gICAgcGFyX25vZGUuZmluZCgnLmN1cmwnKS5yZW1vdmUoKTtcbiAgICBwYXJfbm9kZS5maW5kKCcuZXhlY3V0ZS13cmFwcGVyJykuYXBwZW5kKGA8cCBjbGFzcz1cImN1cmxcIj5Vc2UgdGhlIGZvbGxvd2luZyBjb21tYW5kIHRvIG1ha2UgYSByZXF1ZXN0IHRvIHRoZSA8c3Ryb25nPiR7ZXB9PC9zdHJvbmc+IGVuZHBvaW50IGJhc2VkIG9uIHRoZSBkYXRhIHNldCBhYm92ZTo8L3A+YCk7XG5cbiAgICBjb25zdCBhdXRoVmFsID0gcGFyX25vZGUuZmluZCgnW3BsYWNlaG9sZGVyXj1BdXRob3JpemF0aW9uXScpLnZhbCgpO1xuICAgIGNvbnN0IGludGVyZXN0ZWRQcm9ncmFtc1ZhbCA9IHBhcl9ub2RlLmZpbmQoJ1twbGFjZWhvbGRlcl49aW50ZXJlc3RlZFByb2dyYW1zXScpLnZhbCgpO1xuICAgIGNvbnN0IHF1ZXJ5ID0gaW50ZXJlc3RlZFByb2dyYW1zVmFsID8gYD9pbnRlcmVzdGVkUHJvZ3JhbXM9JHtpbnRlcmVzdGVkUHJvZ3JhbXNWYWx9YCA6IFwiXCJcbiAgICBpZiAoZXBfaWQuaW5jbHVkZXMoJ0F1dGhlbnRpY2F0aW9uJykpIHtcbiAgICAgIGNvbnN0IGF1dGhlbnRpY2F0aW9uQ3VybCA9IGBjdXJsIC1YIFBPU1QgXCIke2RvbWFpbn0ke2VwfVwiIFxcXG4gICAgICAgIC1IICBcImFjY2VwdDogYXBwbGljYXRpb24vanNvblwiIFxcXG4gICAgICAgIC1IICBcIkNvbnRlbnQtVHlwZTogYXBwbGljYXRpb24vanNvblwiIFxcXG4gICAgICAgIC1kIFxcJyR7cGFyYW1zfVxcJ2A7XG4gICAgICBwYXJfbm9kZS5maW5kKCcuZXhlY3V0ZS13cmFwcGVyJykuYXBwZW5kKGA8dGV4dGFyZWEgcmVhZG9ubHk9XCJcIiBjbGFzcz1cImN1cmxcIiBzdHlsZT1cIndoaXRlLXNwYWNlOiBub3JtYWw7XCI+JHthdXRoZW50aWNhdGlvbkN1cmx9PC90ZXh0YXJlYT5gKTtcbiAgICB9IGVsc2UgaWYgKGVwX2lkLmluY2x1ZGVzKCdlbGlnaWJpbGl0eVByb2dyYW1zJykpe1xuICAgICAgY29uc3QgZWxpZ2liaWxpdHlQcm9ncmFtc0N1cmwgPSBgY3VybCAtWCBQT1NUIFwiJHtkb21haW59JHtlcH0ke3F1ZXJ5fVwiIFxcXG4gICAgICAgIC1IIFwiYWNjZXB0OiBhcHBsaWNhdGlvbi9qc29uXCIgXFxcbiAgICAgICAgLUggXCJDb250ZW50LVR5cGU6IGFwcGxpY2F0aW9uL2pzb25cIiBcXFxuICAgICAgICAtSCBcIkF1dGhvcml6YXRpb246ICR7YXV0aFZhbH1cIlxcXG4gICAgICAgIC1kIFxcJyR7cGFyYW1zfVxcJ2A7XG4gICAgICBwYXJfbm9kZS5maW5kKCcuZXhlY3V0ZS13cmFwcGVyJykuYXBwZW5kKGA8dGV4dGFyZWEgcmVhZG9ubHk9XCJcIiBjbGFzcz1cImN1cmxcIiBzdHlsZT1cIndoaXRlLXNwYWNlOiBub3JtYWw7XCI+JHtlbGlnaWJpbGl0eVByb2dyYW1zQ3VybH08L3RleHRhcmVhPmApO1xuICAgIH0gZWxzZSBpZiAoZXBfaWQuaW5jbHVkZXMoJ2J1bGtTdWJtaXNzaW9uJykpIHtcbiAgICAgIGNvbnN0IGlucHV0UGF0aCA9IHBhcl9ub2RlLmZpbmQoJ1t0eXBlXj1maWxlXScpLnZhbCgpO1xuICAgICAgY29uc3QgYnVsa1N1Ym1pc3Npb25DdXJsID0gYGN1cmwgLVggUE9TVCBcIiR7ZG9tYWlufSR7ZXB9JHtxdWVyeX1cIiBcXFxuICAgICAgICAtSCBcImFjY2VwdDogbXVsdGlwYXJ0L2Zvcm0tZGF0YVwiIFxcXG4gICAgICAgIC1IIFwiQ29udGVudC1UeXBlOiBtdWx0aXBhcnQvZm9ybS1kYXRhXCIgXFxcbiAgICAgICAgLUggXCJBdXRob3JpemF0aW9uOiAke2F1dGhWYWx9XCJcXFxuICAgICAgICAtRiBcIj1AJHtpbnB1dFBhdGh9O3R5cGU9dGV4dC9jc3ZcImA7XG4gICAgICBwYXJfbm9kZS5maW5kKCcuZXhlY3V0ZS13cmFwcGVyJykuYXBwZW5kKGA8dGV4dGFyZWEgcmVhZG9ubHk9XCJcIiBjbGFzcz1cImN1cmxcIiBzdHlsZT1cIndoaXRlLXNwYWNlOiBub3JtYWw7XCI+JHtidWxrU3VibWlzc2lvbkN1cmx9PC90ZXh0YXJlYT5gKTtcbiAgICB9XG4gIH1cbn1cbiIsIid1c2Ugc3RyaWN0JztcblxuLyoqXG4gKiBVdGlsaXRpZXMgZm9yIEZvcm0gY29tcG9uZW50c1xuICogQGNsYXNzXG4gKi9cbmNsYXNzIEZvcm1zIHtcbiAgLyoqXG4gICAqIFRoZSBGb3JtIGNvbnN0cnVjdG9yXG4gICAqIEBwYXJhbSAge09iamVjdH0gZm9ybSBUaGUgZm9ybSBET00gZWxlbWVudFxuICAgKi9cbiAgY29uc3RydWN0b3IoZm9ybSA9IGZhbHNlKSB7XG4gICAgdGhpcy5GT1JNID0gZm9ybTtcblxuICAgIHRoaXMuc3RyaW5ncyA9IEZvcm1zLnN0cmluZ3M7XG5cbiAgICB0aGlzLnN1Ym1pdCA9IEZvcm1zLnN1Ym1pdDtcblxuICAgIHRoaXMuY2xhc3NlcyA9IEZvcm1zLmNsYXNzZXM7XG5cbiAgICB0aGlzLm1hcmt1cCA9IEZvcm1zLm1hcmt1cDtcblxuICAgIHRoaXMuc2VsZWN0b3JzID0gRm9ybXMuc2VsZWN0b3JzO1xuXG4gICAgdGhpcy5hdHRycyA9IEZvcm1zLmF0dHJzO1xuXG4gICAgdGhpcy5GT1JNLnNldEF0dHJpYnV0ZSgnbm92YWxpZGF0ZScsIHRydWUpO1xuXG4gICAgcmV0dXJuIHRoaXM7XG4gIH1cblxuICAvKipcbiAgICogTWFwIHRvZ2dsZWQgY2hlY2tib3ggdmFsdWVzIHRvIGFuIGlucHV0LlxuICAgKiBAcGFyYW0gIHtPYmplY3R9IGV2ZW50IFRoZSBwYXJlbnQgY2xpY2sgZXZlbnQuXG4gICAqIEByZXR1cm4ge0VsZW1lbnR9ICAgICAgVGhlIHRhcmdldCBlbGVtZW50LlxuICAgKi9cbiAgam9pblZhbHVlcyhldmVudCkge1xuICAgIGlmICghZXZlbnQudGFyZ2V0Lm1hdGNoZXMoJ2lucHV0W3R5cGU9XCJjaGVja2JveFwiXScpKVxuICAgICAgcmV0dXJuO1xuXG4gICAgaWYgKCFldmVudC50YXJnZXQuY2xvc2VzdCgnW2RhdGEtanMtam9pbi12YWx1ZXNdJykpXG4gICAgICByZXR1cm47XG5cbiAgICBsZXQgZWwgPSBldmVudC50YXJnZXQuY2xvc2VzdCgnW2RhdGEtanMtam9pbi12YWx1ZXNdJyk7XG4gICAgbGV0IHRhcmdldCA9IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoZWwuZGF0YXNldC5qc0pvaW5WYWx1ZXMpO1xuXG4gICAgdGFyZ2V0LnZhbHVlID0gQXJyYXkuZnJvbShcbiAgICAgICAgZWwucXVlcnlTZWxlY3RvckFsbCgnaW5wdXRbdHlwZT1cImNoZWNrYm94XCJdJylcbiAgICAgIClcbiAgICAgIC5maWx0ZXIoKGUpID0+IChlLnZhbHVlICYmIGUuY2hlY2tlZCkpXG4gICAgICAubWFwKChlKSA9PiBlLnZhbHVlKVxuICAgICAgLmpvaW4oJywgJyk7XG5cbiAgICByZXR1cm4gdGFyZ2V0O1xuICB9XG5cbiAgLyoqXG4gICAqIEEgc2ltcGxlIGZvcm0gdmFsaWRhdGlvbiBjbGFzcyB0aGF0IHVzZXMgbmF0aXZlIGZvcm0gdmFsaWRhdGlvbi4gSXQgd2lsbFxuICAgKiBhZGQgYXBwcm9wcmlhdGUgZm9ybSBmZWVkYmFjayBmb3IgZWFjaCBpbnB1dCB0aGF0IGlzIGludmFsaWQgYW5kIG5hdGl2ZVxuICAgKiBsb2NhbGl6ZWQgYnJvd3NlciBtZXNzYWdpbmcuXG4gICAqXG4gICAqIFNlZSBodHRwczovL2RldmVsb3Blci5tb3ppbGxhLm9yZy9lbi1VUy9kb2NzL0xlYXJuL0hUTUwvRm9ybXMvRm9ybV92YWxpZGF0aW9uXG4gICAqIFNlZSBodHRwczovL2Nhbml1c2UuY29tLyNmZWF0PWZvcm0tdmFsaWRhdGlvbiBmb3Igc3VwcG9ydFxuICAgKlxuICAgKiBAcGFyYW0gIHtFdmVudH0gICAgICAgICBldmVudCBUaGUgZm9ybSBzdWJtaXNzaW9uIGV2ZW50XG4gICAqIEByZXR1cm4ge0NsYXNzL0Jvb2xlYW59ICAgICAgIFRoZSBmb3JtIGNsYXNzIG9yIGZhbHNlIGlmIGludmFsaWRcbiAgICovXG4gIHZhbGlkKGV2ZW50KSB7XG4gICAgbGV0IHZhbGlkaXR5ID0gZXZlbnQudGFyZ2V0LmNoZWNrVmFsaWRpdHkoKTtcbiAgICBsZXQgZWxlbWVudHMgPSBldmVudC50YXJnZXQucXVlcnlTZWxlY3RvckFsbCh0aGlzLnNlbGVjdG9ycy5SRVFVSVJFRCk7XG5cbiAgICBmb3IgKGxldCBpID0gMDsgaSA8IGVsZW1lbnRzLmxlbmd0aDsgaSsrKSB7XG4gICAgICAvLyBSZW1vdmUgb2xkIG1lc3NhZ2luZyBpZiBpdCBleGlzdHNcbiAgICAgIGxldCBlbCA9IGVsZW1lbnRzW2ldO1xuXG4gICAgICB0aGlzLnJlc2V0KGVsKTtcblxuICAgICAgLy8gSWYgdGhpcyBpbnB1dCB2YWxpZCwgc2tpcCBtZXNzYWdpbmdcbiAgICAgIGlmIChlbC52YWxpZGl0eS52YWxpZCkgY29udGludWU7XG5cbiAgICAgIHRoaXMuaGlnaGxpZ2h0KGVsKTtcbiAgICB9XG5cbiAgICByZXR1cm4gKHZhbGlkaXR5KSA/IHRoaXMgOiB2YWxpZGl0eTtcbiAgfVxuXG4gIC8qKlxuICAgKiBBZGRzIGZvY3VzIGFuZCBibHVyIGV2ZW50cyB0byBpbnB1dHMgd2l0aCByZXF1aXJlZCBhdHRyaWJ1dGVzXG4gICAqIEBwYXJhbSAgIHtvYmplY3R9ICBmb3JtICBQYXNzaW5nIGEgZm9ybSBpcyBwb3NzaWJsZSwgb3RoZXJ3aXNlIGl0IHdpbGwgdXNlXG4gICAqICAgICAgICAgICAgICAgICAgICAgICAgICB0aGUgZm9ybSBwYXNzZWQgdG8gdGhlIGNvbnN0cnVjdG9yLlxuICAgKiBAcmV0dXJuICB7Y2xhc3N9ICAgICAgICAgVGhlIGZvcm0gY2xhc3NcbiAgICovXG4gIHdhdGNoKGZvcm0gPSBmYWxzZSkge1xuICAgIHRoaXMuRk9STSA9IChmb3JtKSA/IGZvcm0gOiB0aGlzLkZPUk07XG5cbiAgICBsZXQgZWxlbWVudHMgPSB0aGlzLkZPUk0ucXVlcnlTZWxlY3RvckFsbCh0aGlzLnNlbGVjdG9ycy5SRVFVSVJFRCk7XG5cbiAgICAvKiogV2F0Y2ggSW5kaXZpZHVhbCBJbnB1dHMgKi9cbiAgICBmb3IgKGxldCBpID0gMDsgaSA8IGVsZW1lbnRzLmxlbmd0aDsgaSsrKSB7XG4gICAgICAvLyBSZW1vdmUgb2xkIG1lc3NhZ2luZyBpZiBpdCBleGlzdHNcbiAgICAgIGxldCBlbCA9IGVsZW1lbnRzW2ldO1xuXG4gICAgICBlbC5hZGRFdmVudExpc3RlbmVyKCdmb2N1cycsICgpID0+IHtcbiAgICAgICAgdGhpcy5yZXNldChlbCk7XG4gICAgICB9KTtcblxuICAgICAgZWwuYWRkRXZlbnRMaXN0ZW5lcignYmx1cicsICgpID0+IHtcbiAgICAgICAgaWYgKCFlbC52YWxpZGl0eS52YWxpZClcbiAgICAgICAgICB0aGlzLmhpZ2hsaWdodChlbCk7XG4gICAgICB9KTtcbiAgICB9XG5cbiAgICAvKiogU3VibWl0IEV2ZW50ICovXG4gICAgdGhpcy5GT1JNLmFkZEV2ZW50TGlzdGVuZXIoJ3N1Ym1pdCcsIChldmVudCkgPT4ge1xuICAgICAgZXZlbnQucHJldmVudERlZmF1bHQoKTtcblxuICAgICAgaWYgKHRoaXMudmFsaWQoZXZlbnQpID09PSBmYWxzZSlcbiAgICAgICAgcmV0dXJuIGZhbHNlO1xuXG4gICAgICB0aGlzLnN1Ym1pdChldmVudCk7XG4gICAgfSk7XG5cbiAgICByZXR1cm4gdGhpcztcbiAgfVxuXG4gIC8qKlxuICAgKiBSZW1vdmVzIHRoZSB2YWxpZGl0eSBtZXNzYWdlIGFuZCBjbGFzc2VzIGZyb20gdGhlIG1lc3NhZ2UuXG4gICAqIEBwYXJhbSAgIHtvYmplY3R9ICBlbCAgVGhlIGlucHV0IGVsZW1lbnRcbiAgICogQHJldHVybiAge2NsYXNzfSAgICAgICBUaGUgZm9ybSBjbGFzc1xuICAgKi9cbiAgcmVzZXQoZWwpIHtcbiAgICBsZXQgY29udGFpbmVyID0gKHRoaXMuc2VsZWN0b3JzLkVSUk9SX01FU1NBR0VfUEFSRU5UKVxuICAgICAgPyBlbC5jbG9zZXN0KHRoaXMuc2VsZWN0b3JzLkVSUk9SX01FU1NBR0VfUEFSRU5UKSA6IGVsLnBhcmVudE5vZGU7XG5cbiAgICBsZXQgbWVzc2FnZSA9IGNvbnRhaW5lci5xdWVyeVNlbGVjdG9yKCcuJyArIHRoaXMuY2xhc3Nlcy5FUlJPUl9NRVNTQUdFKTtcblxuICAgIC8vIFJlbW92ZSBvbGQgbWVzc2FnaW5nIGlmIGl0IGV4aXN0c1xuICAgIGNvbnRhaW5lci5jbGFzc0xpc3QucmVtb3ZlKHRoaXMuY2xhc3Nlcy5FUlJPUl9DT05UQUlORVIpO1xuICAgIGlmIChtZXNzYWdlKSBtZXNzYWdlLnJlbW92ZSgpO1xuXG4gICAgLy8gUmVtb3ZlIGVycm9yIGNsYXNzIGZyb20gdGhlIGZvcm1cbiAgICBjb250YWluZXIuY2xvc2VzdCgnZm9ybScpLmNsYXNzTGlzdC5yZW1vdmUodGhpcy5jbGFzc2VzLkVSUk9SX0NPTlRBSU5FUik7XG5cbiAgICAvLyBSZW1vdmUgZHluYW1pYyBhdHRyaWJ1dGVzIGZyb20gdGhlIGlucHV0XG4gICAgZWwucmVtb3ZlQXR0cmlidXRlKHRoaXMuYXR0cnMuRVJST1JfSU5QVVRbMF0pO1xuICAgIGVsLnJlbW92ZUF0dHJpYnV0ZSh0aGlzLmF0dHJzLkVSUk9SX0xBQkVMKTtcblxuICAgIHJldHVybiB0aGlzO1xuICB9XG5cbiAgLyoqXG4gICAqIERpc3BsYXlzIGEgdmFsaWRpdHkgbWVzc2FnZSB0byB0aGUgdXNlci4gSXQgd2lsbCBmaXJzdCB1c2UgYW55IGxvY2FsaXplZFxuICAgKiBzdHJpbmcgcGFzc2VkIHRvIHRoZSBjbGFzcyBmb3IgcmVxdWlyZWQgZmllbGRzIG1pc3NpbmcgaW5wdXQuIElmIHRoZVxuICAgKiBpbnB1dCBpcyBmaWxsZWQgaW4gYnV0IGRvZXNuJ3QgbWF0Y2ggdGhlIHJlcXVpcmVkIHBhdHRlcm4sIGl0IHdpbGwgdXNlXG4gICAqIGEgbG9jYWxpemVkIHN0cmluZyBzZXQgZm9yIHRoZSBzcGVjaWZpYyBpbnB1dCB0eXBlLiBJZiBvbmUgaXNuJ3QgcHJvdmlkZWRcbiAgICogaXQgd2lsbCB1c2UgdGhlIGRlZmF1bHQgYnJvd3NlciBwcm92aWRlZCBtZXNzYWdlLlxuICAgKiBAcGFyYW0gICB7b2JqZWN0fSAgZWwgIFRoZSBpbnZhbGlkIGlucHV0IGVsZW1lbnRcbiAgICogQHJldHVybiAge2NsYXNzfSAgICAgICBUaGUgZm9ybSBjbGFzc1xuICAgKi9cbiAgaGlnaGxpZ2h0KGVsKSB7XG4gICAgbGV0IGNvbnRhaW5lciA9ICh0aGlzLnNlbGVjdG9ycy5FUlJPUl9NRVNTQUdFX1BBUkVOVClcbiAgICAgID8gZWwuY2xvc2VzdCh0aGlzLnNlbGVjdG9ycy5FUlJPUl9NRVNTQUdFX1BBUkVOVCkgOiBlbC5wYXJlbnROb2RlO1xuXG4gICAgLy8gQ3JlYXRlIHRoZSBuZXcgZXJyb3IgbWVzc2FnZS5cbiAgICBsZXQgbWVzc2FnZSA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQodGhpcy5tYXJrdXAuRVJST1JfTUVTU0FHRSk7XG4gICAgbGV0IGlkID0gYCR7ZWwuZ2V0QXR0cmlidXRlKCdpZCcpfS0ke3RoaXMuY2xhc3Nlcy5FUlJPUl9NRVNTQUdFfWA7XG5cbiAgICAvLyBHZXQgdGhlIGVycm9yIG1lc3NhZ2UgZnJvbSBsb2NhbGl6ZWQgc3RyaW5ncyAoaWYgc2V0KS5cbiAgICBpZiAoZWwudmFsaWRpdHkudmFsdWVNaXNzaW5nICYmIHRoaXMuc3RyaW5ncy5WQUxJRF9SRVFVSVJFRClcbiAgICAgIG1lc3NhZ2UuaW5uZXJIVE1MID0gdGhpcy5zdHJpbmdzLlZBTElEX1JFUVVJUkVEO1xuICAgIGVsc2UgaWYgKCFlbC52YWxpZGl0eS52YWxpZCAmJlxuICAgICAgdGhpcy5zdHJpbmdzW2BWQUxJRF8ke2VsLnR5cGUudG9VcHBlckNhc2UoKX1fSU5WQUxJRGBdKSB7XG4gICAgICBsZXQgc3RyaW5nS2V5ID0gYFZBTElEXyR7ZWwudHlwZS50b1VwcGVyQ2FzZSgpfV9JTlZBTElEYDtcbiAgICAgIG1lc3NhZ2UuaW5uZXJIVE1MID0gdGhpcy5zdHJpbmdzW3N0cmluZ0tleV07XG4gICAgfSBlbHNlXG4gICAgICBtZXNzYWdlLmlubmVySFRNTCA9IGVsLnZhbGlkYXRpb25NZXNzYWdlO1xuXG4gICAgLy8gU2V0IGFyaWEgYXR0cmlidXRlcyBhbmQgY3NzIGNsYXNzZXMgdG8gdGhlIG1lc3NhZ2VcbiAgICBtZXNzYWdlLnNldEF0dHJpYnV0ZSgnaWQnLCBpZCk7XG4gICAgbWVzc2FnZS5zZXRBdHRyaWJ1dGUodGhpcy5hdHRycy5FUlJPUl9NRVNTQUdFWzBdLFxuICAgICAgdGhpcy5hdHRycy5FUlJPUl9NRVNTQUdFWzFdKTtcbiAgICBtZXNzYWdlLmNsYXNzTGlzdC5hZGQodGhpcy5jbGFzc2VzLkVSUk9SX01FU1NBR0UpO1xuXG4gICAgLy8gQWRkIHRoZSBlcnJvciBjbGFzcyBhbmQgZXJyb3IgbWVzc2FnZSB0byB0aGUgZG9tLlxuICAgIGNvbnRhaW5lci5jbGFzc0xpc3QuYWRkKHRoaXMuY2xhc3Nlcy5FUlJPUl9DT05UQUlORVIpO1xuICAgIGNvbnRhaW5lci5pbnNlcnRCZWZvcmUobWVzc2FnZSwgY29udGFpbmVyLmNoaWxkTm9kZXNbMF0pO1xuXG4gICAgLy8gQWRkIHRoZSBlcnJvciBjbGFzcyB0byB0aGUgZm9ybVxuICAgIGNvbnRhaW5lci5jbG9zZXN0KCdmb3JtJykuY2xhc3NMaXN0LmFkZCh0aGlzLmNsYXNzZXMuRVJST1JfQ09OVEFJTkVSKTtcblxuICAgIC8vIEFkZCBkeW5hbWljIGF0dHJpYnV0ZXMgdG8gdGhlIGlucHV0XG4gICAgZWwuc2V0QXR0cmlidXRlKHRoaXMuYXR0cnMuRVJST1JfSU5QVVRbMF0sIHRoaXMuYXR0cnMuRVJST1JfSU5QVVRbMV0pO1xuICAgIGVsLnNldEF0dHJpYnV0ZSh0aGlzLmF0dHJzLkVSUk9SX0xBQkVMLCBpZCk7XG5cbiAgICByZXR1cm4gdGhpcztcbiAgfVxufVxuXG4vKipcbiAqIEEgZGljdGlvbmFpcnkgb2Ygc3RyaW5ncyBpbiB0aGUgZm9ybWF0LlxuICoge1xuICogICAnVkFMSURfUkVRVUlSRUQnOiAnVGhpcyBpcyByZXF1aXJlZCcsXG4gKiAgICdWQUxJRF97eyBUWVBFIH19X0lOVkFMSUQnOiAnSW52YWxpZCdcbiAqIH1cbiAqL1xuRm9ybXMuc3RyaW5ncyA9IHt9O1xuXG4vKiogUGxhY2Vob2xkZXIgZm9yIHRoZSBzdWJtaXQgZnVuY3Rpb24gKi9cbkZvcm1zLnN1Ym1pdCA9IGZ1bmN0aW9uKCkge307XG5cbi8qKiBDbGFzc2VzIGZvciB2YXJpb3VzIGNvbnRhaW5lcnMgKi9cbkZvcm1zLmNsYXNzZXMgPSB7XG4gICdFUlJPUl9NRVNTQUdFJzogJ2Vycm9yLW1lc3NhZ2UnLCAvLyBlcnJvciBjbGFzcyBmb3IgdGhlIHZhbGlkaXR5IG1lc3NhZ2VcbiAgJ0VSUk9SX0NPTlRBSU5FUic6ICdlcnJvcicsIC8vIGNsYXNzIGZvciB0aGUgdmFsaWRpdHkgbWVzc2FnZSBwYXJlbnRcbiAgJ0VSUk9SX0ZPUk0nOiAnZXJyb3InXG59O1xuXG4vKiogSFRNTCB0YWdzIGFuZCBtYXJrdXAgZm9yIHZhcmlvdXMgZWxlbWVudHMgKi9cbkZvcm1zLm1hcmt1cCA9IHtcbiAgJ0VSUk9SX01FU1NBR0UnOiAnZGl2Jyxcbn07XG5cbi8qKiBET00gU2VsZWN0b3JzIGZvciB2YXJpb3VzIGVsZW1lbnRzICovXG5Gb3Jtcy5zZWxlY3RvcnMgPSB7XG4gICdSRVFVSVJFRCc6ICdbcmVxdWlyZWQ9XCJ0cnVlXCJdJywgLy8gU2VsZWN0b3IgZm9yIHJlcXVpcmVkIGlucHV0IGVsZW1lbnRzXG4gICdFUlJPUl9NRVNTQUdFX1BBUkVOVCc6IGZhbHNlXG59O1xuXG4vKiogQXR0cmlidXRlcyBmb3IgdmFyaW91cyBlbGVtZW50cyAqL1xuRm9ybXMuYXR0cnMgPSB7XG4gICdFUlJPUl9NRVNTQUdFJzogWydhcmlhLWxpdmUnLCAncG9saXRlJ10sIC8vIEF0dHJpYnV0ZSBmb3IgdmFsaWQgZXJyb3IgbWVzc2FnZVxuICAnRVJST1JfSU5QVVQnOiBbJ2FyaWEtaW52YWxpZCcsICd0cnVlJ10sXG4gICdFUlJPUl9MQUJFTCc6ICdhcmlhLWRlc2NyaWJlZGJ5J1xufTtcblxuZXhwb3J0IGRlZmF1bHQgRm9ybXM7XG4iLCJcbmNvbnN0IGVycm9yQm94SWQgPSAnZXJyb3JzJ1xuY29uc3QgaW5mb0JveElkID0gJ2luZm8nXG5cbmNvbnN0IHRvVGl0bGVDYXNlID0gKHN0cmluZykgPT4ge1xuICByZXR1cm4gc3RyaW5nLmNoYXJBdCgwKS50b1VwcGVyQ2FzZSgpICsgc3RyaW5nLnNsaWNlKDEpO1xufVxuXG5jb25zdCBzZXRUZXh0Qm94ID0gKG1lc3NhZ2VTdHJpbmcsIGRpc3BsYXlTdGF0ZSwgYm94SWQpID0+IHtcbiAgdmFyIGVsZSA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKGJveElkKTtcbiAgaWYgKGVsZSkge1xuICAgIGVsZS5pbm5lckhUTUwgPSAnPHVsIGNsYXNzPVwibS0wIHB4LTJcIj4nICtcbiAgICAgIHRvVGl0bGVDYXNlKG1lc3NhZ2VTdHJpbmcudHJpbSgpKSArICc8L3VsPic7XG5cbiAgICBlbGUuc3R5bGUuZGlzcGxheSA9IGRpc3BsYXlTdGF0ZTtcblxuICAgIGlmIChkaXNwbGF5U3RhdGUgPT09ICdub25lJykge1xuICAgICAgZWxlLnJlbW92ZUF0dHJpYnV0ZSgnYXJpYS1saXZlJywgJ3BvbGl0ZScpXG4gICAgICBlbGUuY2xhc3NMaXN0LnJlbW92ZSgnYW5pbWF0ZWQnKVxuICAgICAgZWxlLmNsYXNzTGlzdC5yZW1vdmUoJ2ZhZGVJblVwJylcbiAgICB9IGVsc2Uge1xuICAgICAgZWxlLnNldEF0dHJpYnV0ZSgnYXJpYS1saXZlJywgJ3BvbGl0ZScpXG4gICAgICBlbGUuY2xhc3NMaXN0LmFkZCgnYW5pbWF0ZWQnKVxuICAgICAgZWxlLmNsYXNzTGlzdC5hZGQoJ2ZhZGVJblVwJylcbiAgICB9XG4gIH1cbn1cblxuZXhwb3J0IGNvbnN0IHNlbmRQb3N0UmVxdWVzdCA9ICh1cmwsIGhlYWRlcnNPYmplY3QsIHJlc3BvbnNlSGFuZGxlciwgcmVxdWVzdFBheWxvYWQpID0+IHtcbiAgc2V0VGV4dEJveCgnJywgJ25vbmUnLCBlcnJvckJveElkKVxuICBzZXRUZXh0Qm94KCcnLCAnbm9uZScsIGluZm9Cb3hJZClcblxuICBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgnbG9hZGVyJykuc3R5bGUuZGlzcGxheSA9ICdibG9jaydcblxuICB2YXIgcmVxID0gbmV3IFhNTEh0dHBSZXF1ZXN0KClcblxuICByZXEub3BlbignUE9TVCcsIHVybCwgdHJ1ZSk7XG5cbiAgT2JqZWN0LmtleXMoaGVhZGVyc09iamVjdCkuZm9yRWFjaChmdW5jdGlvbihrZXkpIHtcbiAgICByZXEuc2V0UmVxdWVzdEhlYWRlcihrZXksIGhlYWRlcnNPYmplY3Rba2V5XSk7XG4gIH0pO1xuXG4gIHJlcS5vbnJlYWR5c3RhdGVjaGFuZ2UgPSBmdW5jdGlvbigpIHtcbiAgICBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgnbG9hZGVyJykuc3R5bGUuZGlzcGxheSA9ICdub25lJ1xuICAgIHJlc3BvbnNlSGFuZGxlcihyZXEpXG4gIH1cblxuICByZXEuc2VuZChyZXF1ZXN0UGF5bG9hZClcbn1cblxuY29uc3QgZGlzcGxheUxpc3RUZXh0ID0gKHJlc3BvbnNlVGV4dCwgc2hvd1BhdGgsIGlkKSA9PiB7XG5cbn1cblxuZXhwb3J0IGNvbnN0IGRpc3BsYXlFcnJvcnMgPSAocmVzcG9uc2VUZXh0LCBzaG93UGF0aCkgPT4ge1xuICB2YXIgZXJyb3JKU09OXG4gIHZhciBlcnJvcnNBcnJheSA9IFtdXG4gIHRyeSB7XG4gICAgZXJyb3JKU09OID0gSlNPTi5wYXJzZShyZXNwb25zZVRleHQpLmVycm9yc1xuICAgIGVycm9yc0FycmF5ID0gZXJyb3JKU09OLm1hcChmdW5jdGlvbihlcnJvcikge1xuICAgICAgY29uc3QgeyBlbGVtZW50UGF0aCwgbWVzc2FnZSB9ID0gZXJyb3JcbiAgICAgIGNvbnN0IGVycm9yTXNnID0gZWxlbWVudFBhdGggJiYgc2hvd1BhdGggP1xuICAgICAgICBtZXNzYWdlICsgJyBFbGVtZW50IFBhdGg6ICcgKyBlbGVtZW50UGF0aCArICcuJyA6IG1lc3NhZ2VcbiAgICAgIHJldHVybiAnPGxpPicgKyB0b1RpdGxlQ2FzZShlcnJvck1zZykgKyAnPC9saT4nXG4gICAgfSlcbiAgfSBjYXRjaCAoZXJyKSB7fVxuICBzZXRUZXh0Qm94KGVycm9yc0FycmF5LmpvaW4oJycpLCAnYmxvY2snLCBlcnJvckJveElkKTtcbn1cblxuZXhwb3J0IGNvbnN0IGRpc3BsYXlJbmZvID0gKGluZm9UZXh0KSA9PiB7XG4gIGNvbnN0IGluZm9IVE1MID0gJzxsaT4nICsgaW5mb1RleHQgKyAnPC9saT4nXG4gIHNldFRleHRCb3goaW5mb0hUTUwsICdibG9jaycsIGluZm9Cb3hJZCk7XG59IiwiaW1wb3J0IEZvcm1zIGZyb20gJ0BueWNvcHBvcnR1bml0eS9wdHRybi1zY3JpcHRzL3NyYy9mb3Jtcy9mb3Jtcyc7XG5pbXBvcnQgeyBkaXNwbGF5RXJyb3JzLCBkaXNwbGF5SW5mbywgc2VuZFBvc3RSZXF1ZXN0IH0gZnJvbSAnLi91dGlsJztcblxuZXhwb3J0IGRlZmF1bHQgZnVuY3Rpb24oKSB7XG4gIGNvbnN0IFNFTEVDVE9SID0gJ1tkYXRhLWpzKj1cImJ1bGstc3VibWlzc2lvblwiXSdcblxuICBjb25zdCBmaWxlbmFtZSA9ICdyZXNwb25zZS5jc3YnXG5cbiAgY29uc3QgRm9ybSA9IG5ldyBGb3Jtcyhkb2N1bWVudC5xdWVyeVNlbGVjdG9yKFNFTEVDVE9SKSk7XG5cbiAgY29uc3QgYnVsa1N1Ym1pc3Npb25IYW5kbGVyID0gKHJlcSkgPT4ge1xuICAgIGlmIChyZXEucmVhZHlTdGF0ZSA9PT0gNCkge1xuICAgICAgY29uc3Qgc3RhdHVzID0gcmVxLnN0YXR1cy50b1N0cmluZygpXG4gICAgICBpZiAoc3RhdHVzWzBdID09PSAnNCcgfHwgc3RhdHVzWzBdID09PSAnNScpIHtcbiAgICAgICAgZGlzcGxheUVycm9ycyhyZXEucmVzcG9uc2VUZXh0LCB0cnVlKVxuICAgICAgfSBlbHNlIGlmIChzdGF0dXNbMF0gPT09ICcyJykge1xuICAgICAgICBkaXNwbGF5SW5mbygnQnVsayBzdWJtaXNzaW9uIHN1Y2Nlc3NmdWwuIEEgQ1NWIHdpdGggcHJvZ3JhbSBjb2RlcyBcXFxuICAgICAgICAgIHNob3VsZCBiZSBkb3dubG9hZGVkIGF1dG9tYXRpY2FsbHkuJylcbiAgICAgICAgY29uc3QgYmxvYiA9IG5ldyBCbG9iKFtyZXEucmVzcG9uc2VdLCB7dHlwZSA6ICd0ZXh0L2Nzdid9KVxuICAgICAgICBpZiAodHlwZW9mIHdpbmRvdy5uYXZpZ2F0b3IubXNTYXZlQmxvYiAhPT0gJ3VuZGVmaW5lZCcpIHtcbiAgICAgICAgICB3aW5kb3cubmF2aWdhdG9yLm1zU2F2ZUJsb2IoYmxvYiwgZmlsZW5hbWUpXG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgY29uc3QgVVJMID0gd2luZG93LlVSTCB8fCB3aW5kb3cud2Via2l0VVJMXG4gICAgICAgICAgY29uc3QgZG93bmxvYWRVcmwgPSBVUkwuY3JlYXRlT2JqZWN0VVJMKGJsb2IpXG5cbiAgICAgICAgICBjb25zdCBhID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnYScpXG5cbiAgICAgICAgICBpZiAodHlwZW9mIGEuZG93bmxvYWQgPT09ICd1bmRlZmluZWQnKSB7XG4gICAgICAgICAgICB3aW5kb3cubG9jYXRpb24gPSBkb3dubG9hZFVybFxuICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICBhLmhyZWYgPSBkb3dubG9hZFVybFxuICAgICAgICAgICAgYS5kb3dubG9hZCA9IGZpbGVuYW1lXG4gICAgICAgICAgICBkb2N1bWVudC5ib2R5LmFwcGVuZENoaWxkKGEpXG4gICAgICAgICAgICBhLmNsaWNrKClcbiAgICAgICAgICB9XG5cbiAgICAgICAgICBzZXRUaW1lb3V0KCgpID0+IHtcbiAgICAgICAgICAgIFVSTC5yZXZva2VPYmplY3RVUkwoZG93bmxvYWRVcmwpXG4gICAgICAgICAgfSwgMTAwKVxuICAgICAgICB9XG4gICAgICB9XG4gICAgfVxuICB9XG5cbiAgY29uc3Qgc2VuZEJ1bGtTdWJtaXNzaW9uUmVxdWVzdCA9IChmb3JtVmFsdWVzLCB0b2tlbikgPT4ge1xuICAgIGNvbnN0IHsgYmFzZXVybCwgdXNlcm5hbWUsIGNzdkZpbGUgfSA9IGZvcm1WYWx1ZXNcbiAgICB2YXIgdXJsID0gYmFzZXVybCArICdidWxrU3VibWlzc2lvbi9pbXBvcnQnXG4gICAgaWYgKGZvcm1WYWx1ZXMucHJvZ3JhbXMpIHtcbiAgICAgIHZhciBwcm9ncmFtcyA9IGZvcm1WYWx1ZXMucHJvZ3JhbXMuc3BsaXQoJywnKS5tYXAocCA9PiBwLnRyaW0oKSkuam9pbignLCcpXG4gICAgICB1cmwgPSB1cmwgKyAnP2ludGVyZXN0ZWRQcm9ncmFtcz0nICsgcHJvZ3JhbXNcbiAgICB9XG4gICAgdmFyIGhlYWRlcnNPYmplY3QgPSB7XG4gICAgICAnQXV0aG9yaXphdGlvbic6IHRva2VuXG4gICAgfVxuICAgIHZhciBmb3JtRGF0YSA9IG5ldyBGb3JtRGF0YSgpO1xuICAgIGZvcm1EYXRhLmFwcGVuZCgnZmlsZScsIGNzdkZpbGUpO1xuICAgIHNlbmRQb3N0UmVxdWVzdCh1cmwsIGhlYWRlcnNPYmplY3QsIGJ1bGtTdWJtaXNzaW9uSGFuZGxlciwgZm9ybURhdGEpXG4gIH1cblxuICBjb25zdCBhdXRoUmVzcG9uc2VIYW5kbGVyID0gKGZvcm1WYWx1ZXMpID0+IChyZXEpID0+IHtcbiAgICBpZiAocmVxLnJlYWR5U3RhdGUgPT09IDQpIHtcbiAgICAgIGNvbnN0IHN0YXR1cyA9IHJlcS5zdGF0dXMudG9TdHJpbmcoKVxuICAgICAgaWYgKHN0YXR1c1swXSA9PT0gJzQnIHx8IHN0YXR1c1swXSA9PT0gJzUnKSB7XG4gICAgICAgIGRpc3BsYXlFcnJvcnMocmVxLnJlc3BvbnNlVGV4dCwgZmFsc2UpXG4gICAgICB9IGVsc2UgaWYgKHN0YXR1c1swXSA9PT0gJzInKSB7XG4gICAgICAgIHNlbmRCdWxrU3VibWlzc2lvblJlcXVlc3QoZm9ybVZhbHVlcyxcbiAgICAgICAgICBKU09OLnBhcnNlKHJlcS5yZXNwb25zZVRleHQpLnRva2VuKVxuICAgICAgfVxuICAgIH1cbiAgfVxuXG4gIGNvbnN0IHN1Ym1pdCA9IChldmVudCkgPT4ge1xuICAgIGNvbnN0IGJhc2V1cmwgPSBldmVudC50YXJnZXQuYWN0aW9uO1xuICAgIGNvbnN0IHVzZXJuYW1lID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ3VzZXJuYW1lJykudmFsdWVcbiAgICBjb25zdCBwYXNzd29yZCA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCdwYXNzd29yZCcpLnZhbHVlXG4gICAgY29uc3QgcHJvZ3JhbXMgPSBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgncHJvZ3JhbXMnKS52YWx1ZVxuICAgIGNvbnN0IGNzdkZpbGVJbnB1dCA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCdjc3YtdXBsb2FkJylcblxuICAgIGNvbnN0IGNzdkZpbGUgPSBjc3ZGaWxlSW5wdXQuZmlsZXMgJiZcbiAgICAgIGNzdkZpbGVJbnB1dC5maWxlcy5sZW5ndGggPiAwICYmXG4gICAgICBjc3ZGaWxlSW5wdXQuZmlsZXNbMF1cblxuICAgIGxldCBmb3JtVmFsdWVzID0ge1xuICAgICAgYmFzZXVybDogYmFzZXVybCxcbiAgICAgIHVzZXJuYW1lOiB1c2VybmFtZSxcbiAgICAgIHBhc3N3b3JkOiBwYXNzd29yZCxcbiAgICAgIGNzdkZpbGU6IGNzdkZpbGVcbiAgICB9XG5cbiAgICBpZiAocHJvZ3JhbXMgIT09ICcnKSBmb3JtVmFsdWVzLnByb2dyYW1zID0gcHJvZ3JhbXNcblxuICAgIHZhciB1cmwgPSBiYXNldXJsICsgJ2F1dGhUb2tlbidcbiAgICB2YXIgaGVhZGVyc09iamVjdCA9IHtcbiAgICAgICdDb250ZW50LXR5cGUnOiAnYXBwbGljYXRpb24vanNvbicsXG4gICAgICAnQWNjZXNzLUNvbnRyb2wtQWxsb3ctT3JpZ2luJzogJyonXG4gICAgfVxuXG4gICAgY29uc3QgYXV0aFBheWxvYWQgPSB7IHVzZXJuYW1lLCBwYXNzd29yZCB9XG5cbiAgICBzZW5kUG9zdFJlcXVlc3QodXJsLCBoZWFkZXJzT2JqZWN0LCBhdXRoUmVzcG9uc2VIYW5kbGVyKGZvcm1WYWx1ZXMpLFxuICAgICAgSlNPTi5zdHJpbmdpZnkoYXV0aFBheWxvYWQpKVxuICB9O1xuXG4gIEZvcm0ud2F0Y2goKTtcbiAgRm9ybS5zdWJtaXQgPSBzdWJtaXQ7XG59XG4iLCJpbXBvcnQgRm9ybXMgZnJvbSAnQG55Y29wcG9ydHVuaXR5L3B0dHJuLXNjcmlwdHMvc3JjL2Zvcm1zL2Zvcm1zJztcbmltcG9ydCB7IGRpc3BsYXlFcnJvcnMsIGRpc3BsYXlJbmZvLCBzZW5kUG9zdFJlcXVlc3QgfSBmcm9tICcuL3V0aWwnO1xuXG5leHBvcnQgZGVmYXVsdCBmdW5jdGlvbigpIHtcbiAgY29uc3QgU0VMRUNUT1IgPSAnW2RhdGEtanMqPVwiY2hhbmdlLXBhc3N3b3JkXCJdJ1xuXG4gIGNvbnN0IEZvcm0gPSBuZXcgRm9ybXMoZG9jdW1lbnQucXVlcnlTZWxlY3RvcihTRUxFQ1RPUikpO1xuXG4gIGNvbnN0IHJlc3BvbnNlSGFuZGxlciA9IChyZXEpID0+IHtcbiAgICBpZiAocmVxLnJlYWR5U3RhdGUgPT09IDQpIHtcbiAgICAgIGNvbnN0IHN0YXR1cyA9IHJlcS5zdGF0dXMudG9TdHJpbmcoKSBcbiAgICAgIGlmIChzdGF0dXNbMF0gPT09ICc0JyB8fCBzdGF0dXNbMF0gPT09ICc1Jykge1xuICAgICAgICBkaXNwbGF5RXJyb3JzKHJlcS5yZXNwb25zZVRleHQsIGZhbHNlKVxuICAgICAgfSBlbHNlIGlmIChzdGF0dXNbMF0gPT09ICcyJykge1xuICAgICAgICBkaXNwbGF5SW5mbygnUGFzc3dvcmQgdXBkYXRlZCcpXG4gICAgICB9XG4gICAgfVxuICB9XG4gIFxuXG4gIGNvbnN0IHN1Ym1pdCA9IChldmVudCkgPT4ge1xuICAgIGNvbnN0IGRvbWFpbiA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCdkb21haW4nKS52YWx1ZVxuICAgIGNvbnN0IHVzZXJuYW1lID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ3VzZXJuYW1lJykudmFsdWVcbiAgICBjb25zdCBwYXNzd29yZCA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCdwYXNzd29yZCcpLnZhbHVlXG4gICAgY29uc3QgbmV3UGFzc3dvcmQgPSBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgnbmV3cGFzc3dvcmQnKS52YWx1ZVxuXG4gICAgdmFyIHVybCA9IGRvbWFpbiArICdhdXRoVG9rZW4nXG4gICAgdmFyIGhlYWRlcnNPYmplY3QgPSB7XG4gICAgICAnQ29udGVudC10eXBlJzogJ2FwcGxpY2F0aW9uL2pzb24nLFxuICAgICAgJ0FjY2Vzcy1Db250cm9sLUFsbG93LU9yaWdpbic6ICcqJ1xuICAgIH1cblxuICAgIGNvbnN0IGF1dGhQYXlsb2FkID0geyB1c2VybmFtZSwgcGFzc3dvcmQsIG5ld1Bhc3N3b3JkIH1cblxuICAgIHNlbmRQb3N0UmVxdWVzdCh1cmwsIGhlYWRlcnNPYmplY3QsIHJlc3BvbnNlSGFuZGxlcixcbiAgICAgIEpTT04uc3RyaW5naWZ5KGF1dGhQYXlsb2FkKSlcbiAgfTtcblxuICBGb3JtLndhdGNoKCk7XG4gIEZvcm0uc3VibWl0ID0gc3VibWl0O1xufVxuIiwiLyoqXG4gKiBDb252ZXJ0cyBmb3JtIHRvIEpTT05cbiAqL1xuXG5pbXBvcnQgcmVzcG9uc2VzIGZyb20gJy4vcmVzcG9uc2VzLmpzJztcblxuZXhwb3J0IGRlZmF1bHQgZnVuY3Rpb24oKSB7XG4gICQoJy5zY3JlZW5lci1mb3JtJykuZmFkZUluKDUwMClcblxuICB2YXIgaW5jb21lc0NvbnRhaW5lciA9ICQoJy5pbmNvbWVzJykuY2xvbmUoKTtcbiAgdmFyIGV4cGVuc2VzQ29udGFpbmVyID0gJCgnLmV4cGVuc2VzJykuY2xvbmUoKTtcblxuICAkKCcuaW5jb21lcycpLnJlbW92ZSgpO1xuICAkKCcuZXhwZW5zZXMnKS5yZW1vdmUoKTtcblxuICB2YXIgcGVyc29uQ29udGFpbmVyID0gJCgnLnBlcnNvbi1kYXRhOmZpcnN0JykuY2xvbmUoKTtcblxuICAvKiBHZW5lcmF0ZSB0aGUgZW50aXJlIEpTT04gKi9cbiAgJCgnLmdlbmVyYXRlLWpzb24nKS5vbignY2xpY2snLCBmdW5jdGlvbihldmVudCl7XG4gICAgZXZlbnQucHJldmVudERlZmF1bHQoKTtcblxuICAgIHZhciBmb3JtZGF0YT0kKCcuc2NyZWVuZXItZm9ybScpO1xuXG4gICAgdmFyIGZpbmFsT2JqID0ge1xuICAgICAgaG91c2Vob2xkOiBbXSxcbiAgICAgIHBlcnNvbjogW11cbiAgICB9O1xuXG4gICAgdmFyIGhvdXNlaG9sZE9iaiA9IGdlbmVyYXRlSG91c2Vob2xkT2JqKGZvcm1kYXRhKTtcbiAgICBmaW5hbE9ialsnaG91c2Vob2xkJ10ucHVzaChob3VzZWhvbGRPYmopO1xuXG4gICAgdmFyIHBlcnNvbk9iaiA9IHt9XG4gICAgJCgnLnBlcnNvbi1kYXRhJykuZWFjaChmdW5jdGlvbihwaSkge1xuICAgICAgcGVyc29uT2JqID0gZ2VuZXJhdGVQZXJzb25PYmooZm9ybWRhdGEsIHBpKTtcbiAgICAgIGZpbmFsT2JqWydwZXJzb24nXS5wdXNoKHBlcnNvbk9iaik7XG4gICAgfSlcblxuICAgIHZhciBoYXNFcnJvcnMgPSB2YWxpZGF0ZUZpZWxkcyhmb3JtZGF0YSk7XG5cbiAgICBpZiAoaGFzRXJyb3JzW1wiZXJyb3JzXCJdID4gMCApIHtcbiAgICAgICQoJy5lcnJvci1tc2cnKS5yZW1vdmVDbGFzcygnaGlkZGVuJyk7XG4gICAgfWVsc2Uge1xuICAgICAgJCgnLmVycm9yLW1zZycpLmFkZENsYXNzKCdoaWRkZW4nKTtcbiAgICAgICQoJy5lcnJvcicpLnJlbW92ZUNsYXNzKCdlcnJvcicpO1xuICAgICAgJCgnLnNjcmVlbmVyLWZvcm0nKS5oaWRlKCk7XG4gICAgICAkKCcuc2NyZWVuZXItanNvbicpLmZpbmQoJ3ByZScpLnJlbW92ZSgpO1xuICAgICAgJCgnLnNjcmVlbmVyLWpzb24nKS5wcmVwZW5kKCc8cHJlIGNsYXNzPVwiYmxvY2tcIj48Y29kZSBjbGFzcz1cImNvZGVcIj4nICsgSlNPTi5zdHJpbmdpZnkoW2ZpbmFsT2JqXSwgdW5kZWZpbmVkLCAyKSArICc8L2NvZGU+PC9wcmU+Jyk7XG4gICAgICAkKCcuc2NyZWVuZXItanNvbicpLnJlbW92ZUNsYXNzKCdoaWRkZW4nKTtcbiAgICB9XG4gICAgaWYgKGhhc0Vycm9yc1tcIndhcm5pbmdzXCJdID4gMCApIHtcbiAgICAgICQoJy53YXJuaW5nLW1zZycpLnJlbW92ZUNsYXNzKCdoaWRkZW4nKTtcbiAgICB9ZWxzZSB7XG4gICAgICAkKCcud2FybmluZy1tc2cnKS5hZGRDbGFzcygnaGlkZGVuJyk7XG4gICAgfVxuICB9KVxuXG4gIC8qIEdvIGJhY2sgdG8gdGhlIGZvcm0gKi9cbiAgJCgnLmdlbmVyYXRlLWZvcm0nKS5vbignY2xpY2snLCBmdW5jdGlvbihldmVudCkge1xuICAgIGV2ZW50LnByZXZlbnREZWZhdWx0KCk7XG4gICAgJCgnLnNjcmVlbmVyLWpzb24nKS5hZGRDbGFzcygnaGlkZGVuJyk7XG4gICAgJCgnLnNjcmVlbmVyLWZvcm0nKS5zaG93KCk7XG4gIH0pXG5cbiAgJChkb2N1bWVudCkub24oJ2NoYW5nZScsJ1tuYW1lPWxpdmluZ1R5cGVdJywgZnVuY3Rpb24oZXZlbnQpIHtcbiAgICBldmVudC5wcmV2ZW50RGVmYXVsdCgpO1xuICAgIGlmKCQodGhpcykudmFsKCkgPT0gJ2xpdmluZ1JlbnRpbmcnKXtcbiAgICAgICQoJy5saXZpbmdSZW50YWxUeXBlJykucmVtb3ZlQ2xhc3MoJ2hpZGRlbicpO1xuICAgICAgJCgnLmxlYXNlJykucmVtb3ZlQ2xhc3MoJ2hpZGRlbicpO1xuICAgICAgcGVyc29uQ29udGFpbmVyLmZpbmQoJy5sZWFzZScpLnJlbW92ZUNsYXNzKCdoaWRkZW4nKTtcbiAgICB9IGVsc2Uge1xuICAgICAgJCgnLmxpdmluZ1JlbnRhbFR5cGUnKS5hZGRDbGFzcygnaGlkZGVuJyk7XG4gICAgICAkKCcubGVhc2UnKS5hZGRDbGFzcygnaGlkZGVuJyk7XG4gICAgfVxuICAgIGlmKCQodGhpcykudmFsKCkgPT0gJ2xpdmluZ093bmVyJyl7XG4gICAgICAkKCcuZGVlZCcpLnJlbW92ZUNsYXNzKCdoaWRkZW4nKTtcbiAgICAgIHBlcnNvbkNvbnRhaW5lci5maW5kKCcuZGVlZCcpLnJlbW92ZUNsYXNzKCdoaWRkZW4nKTtcbiAgICB9IGVsc2Uge1xuICAgICAgJCgnLmRlZWQnKS5hZGRDbGFzcygnaGlkZGVuJyk7XG4gICAgfVxuICB9KVxuXG4gIC8qIEFkZCBwZXJzb24gKi9cbiAgJChkb2N1bWVudCkub24oJ2NsaWNrJywnLmFkZC1wZXJzb24nLCBmdW5jdGlvbihldmVudCkge1xuICAgIGV2ZW50LnByZXZlbnREZWZhdWx0KCk7XG5cbiAgICAkKCcuYWRkLXJlbW92ZScpLmZpbmQoJy5lcnJvcicpLnJlbW92ZSgpXG5cbiAgICBpZiAoJCgnLnBlcnNvbi1kYXRhJykubGVuZ3RoID4gOCkge1xuICAgICAgJCh0aGlzKS5wYXJlbnQoKS5hcHBlbmQoJzxwIGNsYXNzPVwiZXJyb3IgcHQtMlwiPicrIHJlc3BvbnNlcy5maW5kKHggPT4geFtcIlBlcnNvblwiXSlbXCJQZXJzb25cIl1bXCJlcnJfbnVtX3BlcnNvbnNcIl0rJzwvcD4nKVxuICAgIH1lbHNlIHtcbiAgICAgIHBlcnNvbkNvbnRhaW5lci5jbG9uZSgpLmluc2VydEJlZm9yZSgkKHRoaXMpLnBhcmVudCgpKTtcbiAgICB9XG5cbiAgICBpZiAoJCgnLnBlcnNvbi1kYXRhJykubGVuZ3RoID4gMSkge1xuICAgICAgJCgnLnJlbW92ZS1wZXJzb24nKS5yZW1vdmVDbGFzcygnaGlkZGVuJyk7XG4gICAgfVxuICB9KVxuXG4gIC8qIFJlbW92ZSBwZXJzb24gKi9cbiAgJChkb2N1bWVudCkub24oJ2NsaWNrJywnLnJlbW92ZS1wZXJzb24nLCBmdW5jdGlvbihldmVudCkge1xuICAgIGV2ZW50LnByZXZlbnREZWZhdWx0KCk7XG5cbiAgICAkKCcuYWRkLXJlbW92ZScpLmZpbmQoJy5lcnJvcicpLnJlbW92ZSgpXG5cbiAgICBpZiAoJCgnLnBlcnNvbi1kYXRhJykubGVuZ3RoID4xKSB7XG4gICAgICAkKCcucGVyc29uLWRhdGE6bGFzdCcpLnJlbW92ZSgpO1xuICAgIH1cbiAgICBpZiAoJCgnLnBlcnNvbi1kYXRhJykubGVuZ3RoID09IDEpIHtcbiAgICAgICQoJy5yZW1vdmUtcGVyc29uJykuYWRkQ2xhc3MoJ2hpZGRlbicpO1xuICAgIH1cbiAgfSlcblxuICAvKiBJTkNPTUVTICovXG4gICQoZG9jdW1lbnQpLm9uKCdjbGljaycsJy5hZGQtaW5jb21lJywgZnVuY3Rpb24oZXZlbnQpIHtcbiAgICBldmVudC5wcmV2ZW50RGVmYXVsdCgpO1xuICAgIGluY29tZXNDb250YWluZXIuY2xvbmUoKS5pbnNlcnRCZWZvcmUoJCh0aGlzKS5wYXJlbnQoKSlcbiAgICAkKHRoaXMpLmNsb3Nlc3QoJy5wZXJzb24tZGF0YScpLmZpbmQoJy5pbmNvbWVzOmxhc3QnKS5yZW1vdmVDbGFzcygnaGlkZGVuJylcbiAgICAkKHRoaXMpLnByZXYoJy5yZW1vdmUtaW5jb21lJykucmVtb3ZlQ2xhc3MoJ2hpZGRlbicpXG4gIH0pXG5cbiAgJChkb2N1bWVudCkub24oJ2NsaWNrJywnLnJlbW92ZS1pbmNvbWUnLCBmdW5jdGlvbihldmVudCkge1xuICAgIGV2ZW50LnByZXZlbnREZWZhdWx0KCk7XG4gICAgJCh0aGlzKS5jbG9zZXN0KCcucGVyc29uLWRhdGEnKS5maW5kKCcuaW5jb21lczpsYXN0JykucmVtb3ZlKCk7XG4gICAgaWYoJCh0aGlzKS5jbG9zZXN0KCcucGVyc29uLWRhdGEnKS5maW5kKCcuaW5jb21lcycpLmxlbmd0aCA+IDApe1xuICAgICAgJCh0aGlzKS5yZW1vdmVDbGFzcygnaGlkZGVuJyk7XG4gICAgfSBlbHNlIHtcbiAgICAgICQodGhpcykuYWRkQ2xhc3MoJ2hpZGRlbicpO1xuICAgIH1cbiAgfSlcblxuICAvKiBFWFBFTlNFUyAqL1xuICAkKGRvY3VtZW50KS5vbignY2xpY2snLCcuYWRkLWV4cGVuc2UnLCBmdW5jdGlvbihldmVudCkge1xuICAgIGV2ZW50LnByZXZlbnREZWZhdWx0KCk7XG4gICAgZXhwZW5zZXNDb250YWluZXIuY2xvbmUoKS5pbnNlcnRCZWZvcmUoJCh0aGlzKS5wYXJlbnQoKSlcbiAgICAkKHRoaXMpLmNsb3Nlc3QoJy5wZXJzb24tZGF0YScpLmZpbmQoJy5leHBlbnNlczpsYXN0JykucmVtb3ZlQ2xhc3MoJ2hpZGRlbicpXG4gICAgJCh0aGlzKS5wcmV2KCcucmVtb3ZlLWV4cGVuc2UnKS5yZW1vdmVDbGFzcygnaGlkZGVuJylcbiAgfSlcblxuICAkKGRvY3VtZW50KS5vbignY2xpY2snLCcucmVtb3ZlLWV4cGVuc2UnLCBmdW5jdGlvbihldmVudCkge1xuICAgIGV2ZW50LnByZXZlbnREZWZhdWx0KCk7XG4gICAgJCh0aGlzKS5jbG9zZXN0KCcucGVyc29uLWRhdGEnKS5maW5kKCcuZXhwZW5zZXM6bGFzdCcpLnJlbW92ZSgpO1xuICAgIGlmKCQodGhpcykuY2xvc2VzdCgnLnBlcnNvbi1kYXRhJykuZmluZCgnLmV4cGVuc2VzJykubGVuZ3RoID4gMCl7XG4gICAgICAkKHRoaXMpLnJlbW92ZUNsYXNzKCdoaWRkZW4nKTtcbiAgICB9IGVsc2Uge1xuICAgICAgJCh0aGlzKS5hZGRDbGFzcygnaGlkZGVuJyk7XG4gICAgfVxuICB9KVxuXG4gIC8qIEdlbmVyYXRlcyB0aGUgaG91c2Vob2xkIG9iamVjdCAqL1xuICBmdW5jdGlvbiBnZW5lcmF0ZUhvdXNlaG9sZE9iaihmb3JtKXtcbiAgICB2YXIgaGggPSBmb3JtLmZpbmQoJ1tob3VzZWhvbGRdJykuc2VyaWFsaXplQXJyYXkoKS5yZWR1Y2UoKG9iaiwgaXRlbSkgPT4gKG9ialtpdGVtLm5hbWVdID0gaXRlbS52YWx1ZSwgb2JqKSAse30pO1xuICAgIHZhciBsaXZpbmdUeXBlID0gZm9ybS5maW5kKCdbbmFtZT1saXZpbmdUeXBlXScpLmNoaWxkcmVuKCk7XG4gICAgbGl2aW5nVHlwZS5lYWNoKGZ1bmN0aW9uKCl7XG4gICAgICBpZiAoJCh0aGlzKS52YWwoKSAhPSBcIlwiKXtcbiAgICAgICAgaWYoJCh0aGlzKS52YWwoKSA9PSBsaXZpbmdUeXBlLnBhcmVudCgpLnZhbCgpKXtcbiAgICAgICAgICBoaFskKHRoaXMpLnZhbCgpXT1cInRydWVcIjtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICBoaFskKHRoaXMpLnZhbCgpXT1cImZhbHNlXCI7XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICB9KVxuICAgIGRlbGV0ZSBoaFsnbGl2aW5nVHlwZSddO1xuICAgIHJldHVybiBoaDtcbiAgfVxuXG4gIC8qIEdlbmVyYXRlcyB0aGUgcGVyc29uIG9iamVjdCAqL1xuICBmdW5jdGlvbiBnZW5lcmF0ZVBlcnNvbk9iaihmb3JtLCBwaW5kZXgpIHtcbiAgICB2YXIgcGVyc29uRm9ybSA9IGZvcm0uZmluZCgnLnBlcnNvbi1kYXRhJykuZXEocGluZGV4KTtcbiAgICB2YXIgcGVyc29uID0gcGVyc29uRm9ybS5maW5kKCdbcGVyc29uXScpLnNlcmlhbGl6ZUFycmF5KCkucmVkdWNlKChvYmosIGl0ZW0pID0+IChvYmpbaXRlbS5uYW1lXSA9IGl0ZW0udmFsdWUsIG9iaikgLHt9KTtcbiAgICB2YXIgcGVyc29uVHlwZSA9IHBlcnNvbkZvcm0uZmluZCgnW3R5cGU9Y2hlY2tib3hdJykuZmlsdGVyKCdbcGVyc29uXScpO1xuICAgIHBlcnNvblR5cGUuZWFjaChmdW5jdGlvbigpe1xuICAgICAgaWYgKCQodGhpcykuaXMoJzpjaGVja2VkJykpe1xuICAgICAgICBwZXJzb25bJCh0aGlzKS5hdHRyKCduYW1lJyldPVwidHJ1ZVwiO1xuICAgICAgfWVsc2Uge1xuICAgICAgICBwZXJzb25bJCh0aGlzKS5hdHRyKCduYW1lJyldPVwiZmFsc2VcIjtcbiAgICAgIH1cbiAgICB9KVxuXG4gICAgLyogSW5jb21lcyAqL1xuICAgIHZhciBmb3JtSW5jb21lcyA9IHBlcnNvbkZvcm0uZmluZCgnW3BlcnNvbi1pbmNvbWVzXScpLnNlcmlhbGl6ZUFycmF5KCk7XG4gICAgdmFyIGluY29tZXNBcnIgPSBbXTtcbiAgICB2YXIgaW5jb21lc09iaiA9IHt9O1xuICAgIHZhciBudW1JbmNvbWVzID0gZm9ybUluY29tZXMubGVuZ3RoIC8gMztcbiAgICB2YXIgaW5kZXggPSAwO1xuICAgIHZhciBzdWJzZXQ7XG5cbiAgICBmb3IgKHZhciBpID0gMDsgaSA8IG51bUluY29tZXM7IGkrKykge1xuICAgICAgaW5jb21lc09iaiA9IHt9O1xuICAgICAgc3Vic2V0ID0gZm9ybUluY29tZXMuc2xpY2UoaW5kZXgsIGluZGV4KzMpO1xuICAgICAgc3Vic2V0LmZvckVhY2goZnVuY3Rpb24oa2V5KXtcbiAgICAgICAgaW5jb21lc09ialtrZXkubmFtZV0gPSBrZXkudmFsdWU7XG4gICAgICB9KVxuICAgICAgaW5jb21lc0Fyci5wdXNoKGluY29tZXNPYmopO1xuXG4gICAgICBpbmRleCA9IGluZGV4ICsgMztcbiAgICB9XG5cbiAgICBpZihpbmNvbWVzQXJyLmxlbmd0aCA+IDApe1xuICAgICAgcGVyc29uWydpbmNvbWVzJ10gPSBpbmNvbWVzQXJyO1xuICAgIH1cblxuICAgIC8qIEV4cGVuc2VzICovXG4gICAgdmFyIGZvcm1FeHBlbnNlcyA9IHBlcnNvbkZvcm0uZmluZCgnW3BlcnNvbi1leHBlbnNlc10nKS5zZXJpYWxpemVBcnJheSgpO1xuICAgIHZhciBleHBlbnNlc0FyciA9IFtdO1xuICAgIHZhciBleHBlbnNlc09iaiA9IHt9O1xuICAgIHZhciBudW1FeHBlbnNlcyA9IGZvcm1FeHBlbnNlcy5sZW5ndGggLyAzO1xuICAgIGluZGV4ID0gMDtcblxuICAgIGZvciAodmFyIGkgPSAwOyBpIDwgbnVtRXhwZW5zZXM7IGkrKykge1xuICAgICAgZXhwZW5zZXNPYmogPSB7fTtcbiAgICAgIHN1YnNldCA9IGZvcm1FeHBlbnNlcy5zbGljZShpbmRleCwgaW5kZXgrMyk7XG4gICAgICBzdWJzZXQuZm9yRWFjaChmdW5jdGlvbihrZXkpe1xuICAgICAgICBleHBlbnNlc09ialtrZXkubmFtZV0gPSBrZXkudmFsdWU7XG4gICAgICB9KVxuXG4gICAgICBleHBlbnNlc0Fyci5wdXNoKGV4cGVuc2VzT2JqKTtcblxuICAgICAgaW5kZXggPSBpbmRleCArIDM7XG4gICAgfVxuXG4gICAgaWYoZXhwZW5zZXNBcnIubGVuZ3RoID4gMCkge1xuICAgICAgcGVyc29uWydleHBlbnNlcyddID0gZXhwZW5zZXNBcnI7XG4gICAgfVxuXG4gICAgcmV0dXJuIHBlcnNvbjtcbiAgfVxuXG4gIC8qIENvcHkgdGhlIEpTT04gb2JqZWN0IHRvIHRoZSBjbGlwYm9hcmQgKi9cbiAgJChkb2N1bWVudCkub24oJ2NsaWNrJywnLmNvcHktb2JqJywgZnVuY3Rpb24oZXZlbnQpIHtcbiAgICBldmVudC5wcmV2ZW50RGVmYXVsdCgpO1xuXG4gICAgdmFyIHJhbmdlID0gZG9jdW1lbnQuY3JlYXRlUmFuZ2UoKTtcbiAgICByYW5nZS5zZWxlY3ROb2RlKGRvY3VtZW50LmdldEVsZW1lbnRzQnlDbGFzc05hbWUoXCJjb2RlXCIpWzBdKTtcbiAgICB3aW5kb3cuZ2V0U2VsZWN0aW9uKCkucmVtb3ZlQWxsUmFuZ2VzKCk7XG4gICAgd2luZG93LmdldFNlbGVjdGlvbigpLmFkZFJhbmdlKHJhbmdlKTtcbiAgICBkb2N1bWVudC5leGVjQ29tbWFuZChcImNvcHlcIik7XG5cbiAgICAkKHRoaXMpLnRleHQoJ0NvcGllZCEnKTtcbiAgfSlcblxuICAvKiBWYWxpZGF0ZSB0aGUgZm9ybSAqL1xuICBmdW5jdGlvbiB2YWxpZGF0ZUZpZWxkcyhmb3JtKSB7XG4gICAgdmFyIGZpZWxkLCBmaWVsZE5hbWUsIGdyb3VwU2VsZXRlZCxcbiAgICByZXN1bHRzID0ge1wiZXJyb3JzXCI6IDAsIFwid2FybmluZ3NcIjogMH0sXG4gICAgZmllbGRzT2JqID0gZm9ybS5zZXJpYWxpemVBcnJheSgpLnJlZHVjZSgob2JqLCBpdGVtKSA9PiAob2JqW2l0ZW0ubmFtZV0gPSBpdGVtLnZhbHVlLCBvYmopICx7fSksXG4gICAgZmllbGRzID0gZm9ybS5maW5kKCdbcmVxdWlyZWRdJyksXG4gICAgZXJyTm9kZSA9ICQoJy5lcnJvci1tc2cnKSxcbiAgICB3YXJuaW5nTm9kZSA9ICQoJy53YXJuaW5nLW1zZycpLFxuICAgIGhoTXNnT2JqID0gcmVzcG9uc2VzLmZpbmQoeCA9PiB4W1wiSG91c2Vob2xkXCJdKVtcIkhvdXNlaG9sZFwiXSxcbiAgICBwZXJzb25Nc2dPYmogPSByZXNwb25zZXMuZmluZCh4ID0+IHhbXCJQZXJzb25cIl0pW1wiUGVyc29uXCJdLFxuICAgIGVyck1zZ09iaiA9IHJlc3BvbnNlcy5maW5kKHggPT4geFtcIkdlbmVyYWxcIl0pW1wiR2VuZXJhbFwiXVxuXG4gICAgJCgnLmVycm9yLW1zZycpLmNoaWxkcmVuKCkucmVtb3ZlKCk7XG4gICAgJCgnLndhcm5pbmctbXNnJykuY2hpbGRyZW4oKS5yZW1vdmUoKTtcblxuICAgICQoJy5lcnJvci1tc2cnKS5hZGRDbGFzcygnZXJyb3InKVxuICAgICQoJy5lcnJvci1tc2cnKS5hcHBlbmQoJzxwPjxzdHJvbmc+JyArIGVyck1zZ09ialtcImVycm9yXCJdICArICc8L3N0cm9uZz48L3A+JylcbiAgICAkKCcud2FybmluZy1tc2cnKS5hcHBlbmQoJzxwPjxzdHJvbmc+JyArIGVyck1zZ09ialtcIndhcm5pbmdcIl0gKyAnPC9zdHJvbmc+PC9wPicpXG5cbiAgICAvKiBjaGVjayBmb3IgZW1wdHkgZmllbGRzICovXG4gICAgZmllbGRzLmVhY2goZnVuY3Rpb24oKXtcbiAgICAgIGZpZWxkTmFtZSA9ICQodGhpcykuYXR0cignbmFtZScpO1xuICAgICAgZ3JvdXBTZWxldGVkID0gT2JqZWN0LmtleXMoZmllbGRzT2JqKS5maW5kKGEgPT5hLmluY2x1ZGVzKGZpZWxkTmFtZSkpPyB0cnVlIDogZmFsc2U7XG5cbiAgICAgIGlmKCAkKHRoaXMpLnZhbCgpID09PSBcIlwiIHx8XG4gICAgICAgICFncm91cFNlbGV0ZWRcbiAgICAgICkge1xuICAgICAgICAkKHRoaXMpLnBhcmVudCgpLmFkZENsYXNzKCdlcnJvcicpO1xuICAgICAgICByZXN1bHRzW1wiZXJyb3JzXCJdICs9IDE7XG4gICAgICB9IGVsc2Uge1xuICAgICAgICAkKHRoaXMpLnBhcmVudCgpLnJlbW92ZUNsYXNzKCdlcnJvcicpO1xuICAgICAgfVxuXG4gICAgICBpZiggKCQodGhpcykudmFsKCkgPT0gJ2xpdmluZ1JlbnRpbmcnKSAmJlxuICAgICAgICAoZm9ybS5maW5kKCdbbmFtZT1saXZpbmdSZW50YWxUeXBlXScpLnZhbCgpID09IFwiXCIpXG4gICAgICApIHtcbiAgICAgICAgd2FybmluZ05vZGUuYXBwZW5kKCc8cD4nICsgaGhNc2dPYmpbXCJ3YXJuaW5nX3JlbnRhbF90eXBlXCJdICsgJzwvcD4nKVxuICAgICAgICByZXN1bHRzW1wid2FybmluZ3NcIl0gKz0gMTtcbiAgICAgIH1cblxuICAgIH0pO1xuXG4gICAgdmFyIG51bVBlb3BsZSA9ICQoJy5wZXJzb24tZGF0YScpLmxlbmd0aDtcbiAgICBpZiAoKG51bVBlb3BsZSA8IDEpIHx8IChudW1QZW9wbGUgPiA4KSkge1xuICAgICAgJCgnLmVycm9yLW1zZycpLmFwcGVuZCgnPHA+JysgcGVyc29uTXNnT2JqW1wiZXJyX251bV9wZXJzb25zXCJdICsgJzwvcD4nKVxuICAgICAgcmVzdWx0c1tcImVycm9yc1wiXSArPSAxO1xuICAgIH1cblxuICAgIHZhciBudW1IZWFkcyA9IDBcbiAgICB2YXIgaG91c2Vob2xkTWVtYmVyVHlwZXMgPSAkKCdbbmFtZT1ob3VzZWhvbGRNZW1iZXJUeXBlXScpXG4gICAgZm9yICh2YXIgaSA9IDA7IGkgPCBob3VzZWhvbGRNZW1iZXJUeXBlcy5sZW5ndGg7IGkrKykge1xuICAgICAgaWYgKGhvdXNlaG9sZE1lbWJlclR5cGVzW2ldLnZhbHVlID09IFwiSGVhZE9mSG91c2Vob2xkXCIpIHtcbiAgICAgICAgbnVtSGVhZHMgKz0gMVxuICAgICAgfVxuICAgIH1cblxuICAgIGlmIChudW1IZWFkcyAhPSAxKSB7XG4gICAgICAkKCdbbmFtZT1ob3VzZWhvbGRNZW1iZXJUeXBlXScpLnBhcmVudCgpLmFkZENsYXNzKCdlcnJvcicpXG4gICAgICAkKCcuZXJyb3ItbXNnJykuYXBwZW5kKCc8cD4nKyBwZXJzb25Nc2dPYmpbXCJlcnJfaG9oXCJdICsnPC9wPicpXG4gICAgICByZXN1bHRzW1wiZXJyb3JzXCJdICs9IDE7XG4gICAgfVxuXG4gICAgaWYgKGZvcm0uZmluZCgnW25hbWU9bGl2aW5nVHlwZV0nKS52YWwoKSA9PSBcImxpdmluZ1JlbnRpbmdcIiAmJlxuICAgICAgISgkKCdbbmFtZT1saXZpbmdSZW50YWxPbkxlYXNlXTpjaGVja2VkJykubGVuZ3RoID4gMClcbiAgICApe1xuICAgICAgd2FybmluZ05vZGUuYXBwZW5kKCc8cD4nICsgcGVyc29uTXNnT2JqW1wid2FybmluZ19vbl9sZWFzZVwiXSArICc8L3A+JylcbiAgICAgIHJlc3VsdHNbXCJ3YXJuaW5nc1wiXSArPSAxO1xuICAgIH1cblxuICAgIGlmIChmb3JtLmZpbmQoJ1tuYW1lPWxpdmluZ1R5cGVdJykudmFsKCkgPT0gXCJsaXZpbmdPd25lclwiICYmXG4gICAgICAhKCQoJ1tuYW1lPWxpdmluZ1JlbnRhbE9uTGVhc2VdOmNoZWNrZWQnKS5sZW5ndGggPiAwKVxuICAgICl7XG4gICAgICB3YXJuaW5nTm9kZS5hcHBlbmQoJzxwPicgKyBwZXJzb25Nc2dPYmpbXCJ3YXJuaW5nX29uX2RlZWRcIl0gKyAnPC9wPicpXG4gICAgICByZXN1bHRzW1wid2FybmluZ3NcIl0gKz0gMTtcbiAgICB9XG5cblxuICAgIHJldHVybiByZXN1bHRzO1xuICB9XG59XG4iLCIndXNlIHN0cmljdCc7XG5cbi8qKlxuICogVGhlIEljb24gbW9kdWxlXG4gKiBAY2xhc3NcbiAqL1xuY2xhc3MgSWNvbnMge1xuICAvKipcbiAgICogQGNvbnN0cnVjdG9yXG4gICAqIEBwYXJhbSAge1N0cmluZ30gcGF0aCBUaGUgcGF0aCBvZiB0aGUgaWNvbiBmaWxlXG4gICAqIEByZXR1cm4ge29iamVjdH0gVGhlIGNsYXNzXG4gICAqL1xuICBjb25zdHJ1Y3RvcihwYXRoKSB7XG4gICAgcGF0aCA9IChwYXRoKSA/IHBhdGggOiBJY29ucy5wYXRoO1xuXG4gICAgZmV0Y2gocGF0aClcbiAgICAgIC50aGVuKChyZXNwb25zZSkgPT4ge1xuICAgICAgICBpZiAocmVzcG9uc2Uub2spXG4gICAgICAgICAgcmV0dXJuIHJlc3BvbnNlLnRleHQoKTtcbiAgICAgICAgZWxzZVxuICAgICAgICAgIC8vIGVzbGludC1kaXNhYmxlLW5leHQtbGluZSBuby1jb25zb2xlXG4gICAgICAgICAgaWYgKHByb2Nlc3MuZW52Lk5PREVfRU5WICE9PSAncHJvZHVjdGlvbicpXG4gICAgICAgICAgICBjb25zb2xlLmRpcihyZXNwb25zZSk7XG4gICAgICB9KVxuICAgICAgLmNhdGNoKChlcnJvcikgPT4ge1xuICAgICAgICAvLyBlc2xpbnQtZGlzYWJsZS1uZXh0LWxpbmUgbm8tY29uc29sZVxuICAgICAgICBpZiAocHJvY2Vzcy5lbnYuTk9ERV9FTlYgIT09ICdwcm9kdWN0aW9uJylcbiAgICAgICAgICBjb25zb2xlLmRpcihlcnJvcik7XG4gICAgICB9KVxuICAgICAgLnRoZW4oKGRhdGEpID0+IHtcbiAgICAgICAgY29uc3Qgc3ByaXRlID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnZGl2Jyk7XG4gICAgICAgIHNwcml0ZS5pbm5lckhUTUwgPSBkYXRhO1xuICAgICAgICBzcHJpdGUuc2V0QXR0cmlidXRlKCdhcmlhLWhpZGRlbicsIHRydWUpO1xuICAgICAgICBzcHJpdGUuc2V0QXR0cmlidXRlKCdzdHlsZScsICdkaXNwbGF5OiBub25lOycpO1xuICAgICAgICBkb2N1bWVudC5ib2R5LmFwcGVuZENoaWxkKHNwcml0ZSk7XG4gICAgICB9KTtcblxuICAgIHJldHVybiB0aGlzO1xuICB9XG59XG5cbi8qKiBAdHlwZSB7U3RyaW5nfSBUaGUgcGF0aCBvZiB0aGUgaWNvbiBmaWxlICovXG5JY29ucy5wYXRoID0gJ3N2Zy9pY29ucy5zdmcnO1xuXG5leHBvcnQgZGVmYXVsdCBJY29ucztcbiIsIid1c2Ugc3RyaWN0JztcblxuLyoqXG4gKiBUaGUgU2ltcGxlIFRvZ2dsZSBjbGFzcy4gVGhpcyB3aWxsIHRvZ2dsZSB0aGUgY2xhc3MgJ2FjdGl2ZScgYW5kICdoaWRkZW4nXG4gKiBvbiB0YXJnZXQgZWxlbWVudHMsIGRldGVybWluZWQgYnkgYSBjbGljayBldmVudCBvbiBhIHNlbGVjdGVkIGxpbmsgb3JcbiAqIGVsZW1lbnQuIFRoaXMgd2lsbCBhbHNvIHRvZ2dsZSB0aGUgYXJpYS1oaWRkZW4gYXR0cmlidXRlIGZvciB0YXJnZXRlZFxuICogZWxlbWVudHMgdG8gc3VwcG9ydCBzY3JlZW4gcmVhZGVycy4gVGFyZ2V0IHNldHRpbmdzIGFuZCBvdGhlciBmdW5jdGlvbmFsaXR5XG4gKiBjYW4gYmUgY29udHJvbGxlZCB0aHJvdWdoIGRhdGEgYXR0cmlidXRlcy5cbiAqXG4gKiBUaGlzIHVzZXMgdGhlIC5tYXRjaGVzKCkgbWV0aG9kIHdoaWNoIHdpbGwgcmVxdWlyZSBhIHBvbHlmaWxsIGZvciBJRVxuICogaHR0cHM6Ly9wb2x5ZmlsbC5pby92Mi9kb2NzL2ZlYXR1cmVzLyNFbGVtZW50X3Byb3RvdHlwZV9tYXRjaGVzXG4gKlxuICogQGNsYXNzXG4gKi9cbmNsYXNzIFRvZ2dsZSB7XG4gIC8qKlxuICAgKiBAY29uc3RydWN0b3JcbiAgICpcbiAgICogQHBhcmFtICB7T2JqZWN0fSAgcyAgU2V0dGluZ3MgZm9yIHRoaXMgVG9nZ2xlIGluc3RhbmNlXG4gICAqXG4gICAqIEByZXR1cm4ge09iamVjdH0gICAgIFRoZSBjbGFzc1xuICAgKi9cbiAgY29uc3RydWN0b3Iocykge1xuICAgIC8vIENyZWF0ZSBhbiBvYmplY3QgdG8gc3RvcmUgZXhpc3RpbmcgdG9nZ2xlIGxpc3RlbmVycyAoaWYgaXQgZG9lc24ndCBleGlzdClcbiAgICBpZiAoIXdpbmRvdy5oYXNPd25Qcm9wZXJ0eShUb2dnbGUuY2FsbGJhY2spKVxuICAgICAgd2luZG93W1RvZ2dsZS5jYWxsYmFja10gPSBbXTtcblxuICAgIHMgPSAoIXMpID8ge30gOiBzO1xuXG4gICAgdGhpcy5zZXR0aW5ncyA9IHtcbiAgICAgIHNlbGVjdG9yOiAocy5zZWxlY3RvcikgPyBzLnNlbGVjdG9yIDogVG9nZ2xlLnNlbGVjdG9yLFxuICAgICAgbmFtZXNwYWNlOiAocy5uYW1lc3BhY2UpID8gcy5uYW1lc3BhY2UgOiBUb2dnbGUubmFtZXNwYWNlLFxuICAgICAgaW5hY3RpdmVDbGFzczogKHMuaW5hY3RpdmVDbGFzcykgPyBzLmluYWN0aXZlQ2xhc3MgOiBUb2dnbGUuaW5hY3RpdmVDbGFzcyxcbiAgICAgIGFjdGl2ZUNsYXNzOiAocy5hY3RpdmVDbGFzcykgPyBzLmFjdGl2ZUNsYXNzIDogVG9nZ2xlLmFjdGl2ZUNsYXNzLFxuICAgICAgYmVmb3JlOiAocy5iZWZvcmUpID8gcy5iZWZvcmUgOiBmYWxzZSxcbiAgICAgIGFmdGVyOiAocy5hZnRlcikgPyBzLmFmdGVyIDogZmFsc2UsXG4gICAgICB2YWxpZDogKHMudmFsaWQpID8gcy52YWxpZCA6IGZhbHNlLFxuICAgICAgZm9jdXNhYmxlOiAocy5oYXNPd25Qcm9wZXJ0eSgnZm9jdXNhYmxlJykpID8gcy5mb2N1c2FibGUgOiB0cnVlLFxuICAgICAganVtcDogKHMuaGFzT3duUHJvcGVydHkoJ2p1bXAnKSkgPyBzLmp1bXAgOiB0cnVlXG4gICAgfTtcblxuICAgIC8vIFN0b3JlIHRoZSBlbGVtZW50IGZvciBwb3RlbnRpYWwgdXNlIGluIGNhbGxiYWNrc1xuICAgIHRoaXMuZWxlbWVudCA9IChzLmVsZW1lbnQpID8gcy5lbGVtZW50IDogZmFsc2U7XG5cbiAgICBpZiAodGhpcy5lbGVtZW50KSB7XG4gICAgICB0aGlzLmVsZW1lbnQuYWRkRXZlbnRMaXN0ZW5lcignY2xpY2snLCAoZXZlbnQpID0+IHtcbiAgICAgICAgdGhpcy50b2dnbGUoZXZlbnQpO1xuICAgICAgfSk7XG4gICAgfSBlbHNlIHtcbiAgICAgIC8vIElmIHRoZXJlIGlzbid0IGFuIGV4aXN0aW5nIGluc3RhbnRpYXRlZCB0b2dnbGUsIGFkZCB0aGUgZXZlbnQgbGlzdGVuZXIuXG4gICAgICBpZiAoIXdpbmRvd1tUb2dnbGUuY2FsbGJhY2tdLmhhc093blByb3BlcnR5KHRoaXMuc2V0dGluZ3Muc2VsZWN0b3IpKSB7XG4gICAgICAgIGxldCBib2R5ID0gZG9jdW1lbnQucXVlcnlTZWxlY3RvcignYm9keScpO1xuXG4gICAgICAgIGZvciAobGV0IGkgPSAwOyBpIDwgVG9nZ2xlLmV2ZW50cy5sZW5ndGg7IGkrKykge1xuICAgICAgICAgIGxldCB0Z2dsZUV2ZW50ID0gVG9nZ2xlLmV2ZW50c1tpXTtcblxuICAgICAgICAgIGJvZHkuYWRkRXZlbnRMaXN0ZW5lcih0Z2dsZUV2ZW50LCBldmVudCA9PiB7XG4gICAgICAgICAgICBpZiAoIWV2ZW50LnRhcmdldC5tYXRjaGVzKHRoaXMuc2V0dGluZ3Muc2VsZWN0b3IpKVxuICAgICAgICAgICAgICByZXR1cm47XG5cbiAgICAgICAgICAgIHRoaXMuZXZlbnQgPSBldmVudDtcblxuICAgICAgICAgICAgbGV0IHR5cGUgPSBldmVudC50eXBlLnRvVXBwZXJDYXNlKCk7XG5cbiAgICAgICAgICAgIGlmIChcbiAgICAgICAgICAgICAgdGhpc1tldmVudC50eXBlXSAmJlxuICAgICAgICAgICAgICBUb2dnbGUuZWxlbWVudHNbdHlwZV0gJiZcbiAgICAgICAgICAgICAgVG9nZ2xlLmVsZW1lbnRzW3R5cGVdLmluY2x1ZGVzKGV2ZW50LnRhcmdldC50YWdOYW1lKVxuICAgICAgICAgICAgKSB0aGlzW2V2ZW50LnR5cGVdKGV2ZW50KTtcbiAgICAgICAgICB9KTtcbiAgICAgICAgfVxuICAgICAgfVxuICAgIH1cblxuICAgIC8vIFJlY29yZCB0aGF0IGEgdG9nZ2xlIHVzaW5nIHRoaXMgc2VsZWN0b3IgaGFzIGJlZW4gaW5zdGFudGlhdGVkLlxuICAgIC8vIFRoaXMgcHJldmVudHMgZG91YmxlIHRvZ2dsaW5nLlxuICAgIHdpbmRvd1tUb2dnbGUuY2FsbGJhY2tdW3RoaXMuc2V0dGluZ3Muc2VsZWN0b3JdID0gdHJ1ZTtcblxuICAgIHJldHVybiB0aGlzO1xuICB9XG5cbiAgLyoqXG4gICAqIENsaWNrIGV2ZW50IGhhbmRsZXJcbiAgICpcbiAgICogQHBhcmFtICB7RXZlbnR9ICBldmVudCAgVGhlIG9yaWdpbmFsIGNsaWNrIGV2ZW50XG4gICAqL1xuICBjbGljayhldmVudCkge1xuICAgIHRoaXMudG9nZ2xlKGV2ZW50KTtcbiAgfVxuXG4gIC8qKlxuICAgKiBJbnB1dC9zZWxlY3QvdGV4dGFyZWEgY2hhbmdlIGV2ZW50IGhhbmRsZXIuIENoZWNrcyB0byBzZWUgaWYgdGhlXG4gICAqIGV2ZW50LnRhcmdldCBpcyB2YWxpZCB0aGVuIHRvZ2dsZXMgYWNjb3JkaW5nbHkuXG4gICAqXG4gICAqIEBwYXJhbSAge0V2ZW50fSAgZXZlbnQgIFRoZSBvcmlnaW5hbCBpbnB1dCBjaGFuZ2UgZXZlbnRcbiAgICovXG4gIGNoYW5nZShldmVudCkge1xuICAgIGxldCB2YWxpZCA9IGV2ZW50LnRhcmdldC5jaGVja1ZhbGlkaXR5KCk7XG5cbiAgICBpZiAodmFsaWQgJiYgIXRoaXMuaXNBY3RpdmUoZXZlbnQudGFyZ2V0KSkge1xuICAgICAgdGhpcy50b2dnbGUoZXZlbnQpOyAvLyBzaG93XG4gICAgfSBlbHNlIGlmICghdmFsaWQgJiYgdGhpcy5pc0FjdGl2ZShldmVudC50YXJnZXQpKSB7XG4gICAgICB0aGlzLnRvZ2dsZShldmVudCk7IC8vIGhpZGVcbiAgICB9XG4gIH1cblxuICAvKipcbiAgICogQ2hlY2sgdG8gc2VlIGlmIHRoZSB0b2dnbGUgaXMgYWN0aXZlXG4gICAqXG4gICAqIEBwYXJhbSAge09iamVjdH0gIGVsZW1lbnQgIFRoZSB0b2dnbGUgZWxlbWVudCAodHJpZ2dlcilcbiAgICovXG4gIGlzQWN0aXZlKGVsZW1lbnQpIHtcbiAgICBsZXQgYWN0aXZlID0gZmFsc2U7XG5cbiAgICBpZiAodGhpcy5zZXR0aW5ncy5hY3RpdmVDbGFzcykge1xuICAgICAgYWN0aXZlID0gZWxlbWVudC5jbGFzc0xpc3QuY29udGFpbnModGhpcy5zZXR0aW5ncy5hY3RpdmVDbGFzcylcbiAgICB9XG5cbiAgICAvLyBpZiAoKSB7XG4gICAgICAvLyBUb2dnbGUuZWxlbWVudEFyaWFSb2xlc1xuICAgICAgLy8gVE9ETzogQWRkIGNhdGNoIHRvIHNlZSBpZiBlbGVtZW50IGFyaWEgcm9sZXMgYXJlIHRvZ2dsZWRcbiAgICAvLyB9XG5cbiAgICAvLyBpZiAoKSB7XG4gICAgICAvLyBUb2dnbGUudGFyZ2V0QXJpYVJvbGVzXG4gICAgICAvLyBUT0RPOiBBZGQgY2F0Y2ggdG8gc2VlIGlmIHRhcmdldCBhcmlhIHJvbGVzIGFyZSB0b2dnbGVkXG4gICAgLy8gfVxuXG4gICAgcmV0dXJuIGFjdGl2ZTtcbiAgfVxuXG4gIC8qKlxuICAgKiBHZXQgdGhlIHRhcmdldCBvZiB0aGUgdG9nZ2xlIGVsZW1lbnQgKHRyaWdnZXIpXG4gICAqXG4gICAqIEBwYXJhbSAge09iamVjdH0gIGVsICBUaGUgdG9nZ2xlIGVsZW1lbnQgKHRyaWdnZXIpXG4gICAqL1xuICBnZXRUYXJnZXQoZWxlbWVudCkge1xuICAgIGxldCB0YXJnZXQgPSBmYWxzZTtcblxuICAgIC8qKiBBbmNob3IgTGlua3MgKi9cbiAgICB0YXJnZXQgPSAoZWxlbWVudC5oYXNBdHRyaWJ1dGUoJ2hyZWYnKSkgP1xuICAgICAgZG9jdW1lbnQucXVlcnlTZWxlY3RvcihlbGVtZW50LmdldEF0dHJpYnV0ZSgnaHJlZicpKSA6IHRhcmdldDtcblxuICAgIC8qKiBUb2dnbGUgQ29udHJvbHMgKi9cbiAgICB0YXJnZXQgPSAoZWxlbWVudC5oYXNBdHRyaWJ1dGUoJ2FyaWEtY29udHJvbHMnKSkgP1xuICAgICAgZG9jdW1lbnQucXVlcnlTZWxlY3RvcihgIyR7ZWxlbWVudC5nZXRBdHRyaWJ1dGUoJ2FyaWEtY29udHJvbHMnKX1gKSA6IHRhcmdldDtcblxuICAgIHJldHVybiB0YXJnZXQ7XG4gIH1cblxuICAvKipcbiAgICogVGhlIHRvZ2dsZSBldmVudCBwcm94eSBmb3IgZ2V0dGluZyBhbmQgc2V0dGluZyB0aGUgZWxlbWVudC9zIGFuZCB0YXJnZXRcbiAgICpcbiAgICogQHBhcmFtICB7T2JqZWN0fSAgZXZlbnQgIFRoZSBtYWluIGNsaWNrIGV2ZW50XG4gICAqXG4gICAqIEByZXR1cm4ge09iamVjdH0gICAgICAgICBUaGUgVG9nZ2xlIGluc3RhbmNlXG4gICAqL1xuICB0b2dnbGUoZXZlbnQpIHtcbiAgICBsZXQgZWxlbWVudCA9IGV2ZW50LnRhcmdldDtcbiAgICBsZXQgdGFyZ2V0ID0gZmFsc2U7XG4gICAgbGV0IGZvY3VzYWJsZSA9IFtdO1xuXG4gICAgZXZlbnQucHJldmVudERlZmF1bHQoKTtcblxuICAgIHRhcmdldCA9IHRoaXMuZ2V0VGFyZ2V0KGVsZW1lbnQpO1xuXG4gICAgLyoqIEZvY3VzYWJsZSBDaGlsZHJlbiAqL1xuICAgIGZvY3VzYWJsZSA9ICh0YXJnZXQpID9cbiAgICAgIHRhcmdldC5xdWVyeVNlbGVjdG9yQWxsKFRvZ2dsZS5lbEZvY3VzYWJsZS5qb2luKCcsICcpKSA6IGZvY3VzYWJsZTtcblxuICAgIC8qKiBNYWluIEZ1bmN0aW9uYWxpdHkgKi9cbiAgICBpZiAoIXRhcmdldCkgcmV0dXJuIHRoaXM7XG4gICAgdGhpcy5lbGVtZW50VG9nZ2xlKGVsZW1lbnQsIHRhcmdldCwgZm9jdXNhYmxlKTtcblxuICAgIC8qKiBVbmRvICovXG4gICAgaWYgKGVsZW1lbnQuZGF0YXNldFtgJHt0aGlzLnNldHRpbmdzLm5hbWVzcGFjZX1VbmRvYF0pIHtcbiAgICAgIGNvbnN0IHVuZG8gPSBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKFxuICAgICAgICBlbGVtZW50LmRhdGFzZXRbYCR7dGhpcy5zZXR0aW5ncy5uYW1lc3BhY2V9VW5kb2BdXG4gICAgICApO1xuXG4gICAgICB1bmRvLmFkZEV2ZW50TGlzdGVuZXIoJ2NsaWNrJywgKGV2ZW50KSA9PiB7XG4gICAgICAgIGV2ZW50LnByZXZlbnREZWZhdWx0KCk7XG4gICAgICAgIHRoaXMuZWxlbWVudFRvZ2dsZShlbGVtZW50LCB0YXJnZXQpO1xuICAgICAgICB1bmRvLnJlbW92ZUV2ZW50TGlzdGVuZXIoJ2NsaWNrJyk7XG4gICAgICB9KTtcbiAgICB9XG5cbiAgICByZXR1cm4gdGhpcztcbiAgfVxuXG4gIC8qKlxuICAgKiBHZXQgb3RoZXIgdG9nZ2xlcyB0aGF0IG1pZ2h0IGNvbnRyb2wgdGhlIHNhbWUgZWxlbWVudFxuICAgKlxuICAgKiBAcGFyYW0gICB7T2JqZWN0fSAgICBlbGVtZW50ICBUaGUgdG9nZ2xpbmcgZWxlbWVudFxuICAgKlxuICAgKiBAcmV0dXJuICB7Tm9kZUxpc3R9ICAgICAgICAgICBMaXN0IG9mIG90aGVyIHRvZ2dsaW5nIGVsZW1lbnRzXG4gICAqICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHRoYXQgY29udHJvbCB0aGUgdGFyZ2V0XG4gICAqL1xuICBnZXRPdGhlcnMoZWxlbWVudCkge1xuICAgIGxldCBzZWxlY3RvciA9IGZhbHNlO1xuXG4gICAgaWYgKGVsZW1lbnQuaGFzQXR0cmlidXRlKCdocmVmJykpIHtcbiAgICAgIHNlbGVjdG9yID0gYFtocmVmPVwiJHtlbGVtZW50LmdldEF0dHJpYnV0ZSgnaHJlZicpfVwiXWA7XG4gICAgfSBlbHNlIGlmIChlbGVtZW50Lmhhc0F0dHJpYnV0ZSgnYXJpYS1jb250cm9scycpKSB7XG4gICAgICBzZWxlY3RvciA9IGBbYXJpYS1jb250cm9scz1cIiR7ZWxlbWVudC5nZXRBdHRyaWJ1dGUoJ2FyaWEtY29udHJvbHMnKX1cIl1gO1xuICAgIH1cblxuICAgIHJldHVybiAoc2VsZWN0b3IpID8gZG9jdW1lbnQucXVlcnlTZWxlY3RvckFsbChzZWxlY3RvcikgOiBbXTtcbiAgfVxuXG4gIC8qKlxuICAgKiBIaWRlIHRoZSBUb2dnbGUgVGFyZ2V0J3MgZm9jdXNhYmxlIGNoaWxkcmVuIGZyb20gZm9jdXMuXG4gICAqIElmIGFuIGVsZW1lbnQgaGFzIHRoZSBkYXRhLWF0dHJpYnV0ZSBgZGF0YS10b2dnbGUtdGFiaW5kZXhgXG4gICAqIGl0IHdpbGwgdXNlIHRoYXQgYXMgdGhlIGRlZmF1bHQgdGFiIGluZGV4IG9mIHRoZSBlbGVtZW50LlxuICAgKlxuICAgKiBAcGFyYW0gICB7Tm9kZUxpc3R9ICBlbGVtZW50cyAgTGlzdCBvZiBmb2N1c2FibGUgZWxlbWVudHNcbiAgICpcbiAgICogQHJldHVybiAge09iamVjdH0gICAgICAgICAgICAgIFRoZSBUb2dnbGUgSW5zdGFuY2VcbiAgICovXG4gIHRvZ2dsZUZvY3VzYWJsZShlbGVtZW50cykge1xuICAgIGVsZW1lbnRzLmZvckVhY2goZWxlbWVudCA9PiB7XG4gICAgICBsZXQgdGFiaW5kZXggPSBlbGVtZW50LmdldEF0dHJpYnV0ZSgndGFiaW5kZXgnKTtcblxuICAgICAgaWYgKHRhYmluZGV4ID09PSAnLTEnKSB7XG4gICAgICAgIGxldCBkYXRhRGVmYXVsdCA9IGVsZW1lbnRcbiAgICAgICAgICAuZ2V0QXR0cmlidXRlKGBkYXRhLSR7VG9nZ2xlLm5hbWVzcGFjZX0tdGFiaW5kZXhgKTtcblxuICAgICAgICBpZiAoZGF0YURlZmF1bHQpIHtcbiAgICAgICAgICBlbGVtZW50LnNldEF0dHJpYnV0ZSgndGFiaW5kZXgnLCBkYXRhRGVmYXVsdCk7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgZWxlbWVudC5yZW1vdmVBdHRyaWJ1dGUoJ3RhYmluZGV4Jyk7XG4gICAgICAgIH1cbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIGVsZW1lbnQuc2V0QXR0cmlidXRlKCd0YWJpbmRleCcsICctMScpO1xuICAgICAgfVxuICAgIH0pO1xuXG4gICAgcmV0dXJuIHRoaXM7XG4gIH1cblxuICAvKipcbiAgICogSnVtcHMgdG8gRWxlbWVudCB2aXNpYmx5IGFuZCBzaGlmdHMgZm9jdXNcbiAgICogdG8gdGhlIGVsZW1lbnQgYnkgc2V0dGluZyB0aGUgdGFiaW5kZXhcbiAgICpcbiAgICogQHBhcmFtICAge09iamVjdH0gIGVsZW1lbnQgIFRoZSBUb2dnbGluZyBFbGVtZW50XG4gICAqIEBwYXJhbSAgIHtPYmplY3R9ICB0YXJnZXQgICBUaGUgVGFyZ2V0IEVsZW1lbnRcbiAgICpcbiAgICogQHJldHVybiAge09iamVjdH0gICAgICAgICAgIFRoZSBUb2dnbGUgaW5zdGFuY2VcbiAgICovXG4gIGp1bXBUbyhlbGVtZW50LCB0YXJnZXQpIHtcbiAgICAvLyBSZXNldCB0aGUgaGlzdG9yeSBzdGF0ZS4gVGhpcyB3aWxsIGNsZWFyIG91dFxuICAgIC8vIHRoZSBoYXNoIHdoZW4gdGhlIHRhcmdldCBpcyB0b2dnbGVkIGNsb3NlZFxuICAgIGhpc3RvcnkucHVzaFN0YXRlKCcnLCAnJyxcbiAgICAgIHdpbmRvdy5sb2NhdGlvbi5wYXRobmFtZSArIHdpbmRvdy5sb2NhdGlvbi5zZWFyY2gpO1xuXG4gICAgLy8gRm9jdXMgaWYgYWN0aXZlXG4gICAgaWYgKHRhcmdldC5jbGFzc0xpc3QuY29udGFpbnModGhpcy5zZXR0aW5ncy5hY3RpdmVDbGFzcykpIHtcbiAgICAgIHdpbmRvdy5sb2NhdGlvbi5oYXNoID0gZWxlbWVudC5nZXRBdHRyaWJ1dGUoJ2hyZWYnKTtcblxuICAgICAgdGFyZ2V0LnNldEF0dHJpYnV0ZSgndGFiaW5kZXgnLCAnMCcpO1xuICAgICAgdGFyZ2V0LmZvY3VzKHtwcmV2ZW50U2Nyb2xsOiB0cnVlfSk7XG4gICAgfSBlbHNlIHtcbiAgICAgIHRhcmdldC5yZW1vdmVBdHRyaWJ1dGUoJ3RhYmluZGV4Jyk7XG4gICAgfVxuXG4gICAgcmV0dXJuIHRoaXM7XG4gIH1cblxuICAvKipcbiAgICogVGhlIG1haW4gdG9nZ2xpbmcgbWV0aG9kIGZvciBhdHRyaWJ1dGVzXG4gICAqXG4gICAqIEBwYXJhbSAge09iamVjdH0gICAgZWxlbWVudCAgICBUaGUgVG9nZ2xlIGVsZW1lbnRcbiAgICogQHBhcmFtICB7T2JqZWN0fSAgICB0YXJnZXQgICAgIFRoZSBUYXJnZXQgZWxlbWVudCB0byB0b2dnbGUgYWN0aXZlL2hpZGRlblxuICAgKiBAcGFyYW0gIHtOb2RlTGlzdH0gIGZvY3VzYWJsZSAgQW55IGZvY3VzYWJsZSBjaGlsZHJlbiBpbiB0aGUgdGFyZ2V0XG4gICAqXG4gICAqIEByZXR1cm4ge09iamVjdH0gICAgICAgICAgICAgICBUaGUgVG9nZ2xlIGluc3RhbmNlXG4gICAqL1xuICBlbGVtZW50VG9nZ2xlKGVsZW1lbnQsIHRhcmdldCwgZm9jdXNhYmxlID0gW10pIHtcbiAgICBsZXQgaSA9IDA7XG4gICAgbGV0IGF0dHIgPSAnJztcbiAgICBsZXQgdmFsdWUgPSAnJztcblxuICAgIC8qKlxuICAgICAqIFN0b3JlIGVsZW1lbnRzIGZvciBwb3RlbnRpYWwgdXNlIGluIGNhbGxiYWNrc1xuICAgICAqL1xuXG4gICAgdGhpcy5lbGVtZW50ID0gZWxlbWVudDtcbiAgICB0aGlzLnRhcmdldCA9IHRhcmdldDtcbiAgICB0aGlzLm90aGVycyA9IHRoaXMuZ2V0T3RoZXJzKGVsZW1lbnQpO1xuICAgIHRoaXMuZm9jdXNhYmxlID0gZm9jdXNhYmxlO1xuXG4gICAgLyoqXG4gICAgICogVmFsaWRpdHkgbWV0aG9kIHByb3BlcnR5IHRoYXQgd2lsbCBjYW5jZWwgdGhlIHRvZ2dsZSBpZiBpdCByZXR1cm5zIGZhbHNlXG4gICAgICovXG5cbiAgICBpZiAodGhpcy5zZXR0aW5ncy52YWxpZCAmJiAhdGhpcy5zZXR0aW5ncy52YWxpZCh0aGlzKSlcbiAgICAgIHJldHVybiB0aGlzO1xuXG4gICAgLyoqXG4gICAgICogVG9nZ2xpbmcgYmVmb3JlIGhvb2tcbiAgICAgKi9cblxuICAgIGlmICh0aGlzLnNldHRpbmdzLmJlZm9yZSlcbiAgICAgIHRoaXMuc2V0dGluZ3MuYmVmb3JlKHRoaXMpO1xuXG4gICAgLyoqXG4gICAgICogVG9nZ2xlIEVsZW1lbnQgYW5kIFRhcmdldCBjbGFzc2VzXG4gICAgICovXG5cbiAgICBpZiAodGhpcy5zZXR0aW5ncy5hY3RpdmVDbGFzcykge1xuICAgICAgdGhpcy5lbGVtZW50LmNsYXNzTGlzdC50b2dnbGUodGhpcy5zZXR0aW5ncy5hY3RpdmVDbGFzcyk7XG4gICAgICB0aGlzLnRhcmdldC5jbGFzc0xpc3QudG9nZ2xlKHRoaXMuc2V0dGluZ3MuYWN0aXZlQ2xhc3MpO1xuXG4gICAgICAvLyBJZiB0aGVyZSBhcmUgb3RoZXIgdG9nZ2xlcyB0aGF0IGNvbnRyb2wgdGhlIHNhbWUgZWxlbWVudFxuICAgICAgdGhpcy5vdGhlcnMuZm9yRWFjaChvdGhlciA9PiB7XG4gICAgICAgIGlmIChvdGhlciAhPT0gdGhpcy5lbGVtZW50KVxuICAgICAgICAgIG90aGVyLmNsYXNzTGlzdC50b2dnbGUodGhpcy5zZXR0aW5ncy5hY3RpdmVDbGFzcyk7XG4gICAgICB9KTtcbiAgICB9XG5cbiAgICBpZiAodGhpcy5zZXR0aW5ncy5pbmFjdGl2ZUNsYXNzKVxuICAgICAgdGFyZ2V0LmNsYXNzTGlzdC50b2dnbGUodGhpcy5zZXR0aW5ncy5pbmFjdGl2ZUNsYXNzKTtcblxuICAgIC8qKlxuICAgICAqIFRhcmdldCBFbGVtZW50IEFyaWEgQXR0cmlidXRlc1xuICAgICAqL1xuXG4gICAgZm9yIChpID0gMDsgaSA8IFRvZ2dsZS50YXJnZXRBcmlhUm9sZXMubGVuZ3RoOyBpKyspIHtcbiAgICAgIGF0dHIgPSBUb2dnbGUudGFyZ2V0QXJpYVJvbGVzW2ldO1xuICAgICAgdmFsdWUgPSB0aGlzLnRhcmdldC5nZXRBdHRyaWJ1dGUoYXR0cik7XG5cbiAgICAgIGlmICh2YWx1ZSAhPSAnJyAmJiB2YWx1ZSlcbiAgICAgICAgdGhpcy50YXJnZXQuc2V0QXR0cmlidXRlKGF0dHIsICh2YWx1ZSA9PT0gJ3RydWUnKSA/ICdmYWxzZScgOiAndHJ1ZScpO1xuICAgIH1cblxuICAgIC8qKlxuICAgICAqIFRvZ2dsZSB0aGUgdGFyZ2V0J3MgZm9jdXNhYmxlIGNoaWxkcmVuIHRhYmluZGV4XG4gICAgICovXG5cbiAgICBpZiAodGhpcy5zZXR0aW5ncy5mb2N1c2FibGUpXG4gICAgICB0aGlzLnRvZ2dsZUZvY3VzYWJsZSh0aGlzLmZvY3VzYWJsZSk7XG5cbiAgICAvKipcbiAgICAgKiBKdW1wIHRvIFRhcmdldCBFbGVtZW50IGlmIFRvZ2dsZSBFbGVtZW50IGlzIGFuIGFuY2hvciBsaW5rXG4gICAgICovXG5cbiAgICBpZiAodGhpcy5zZXR0aW5ncy5qdW1wICYmIHRoaXMuZWxlbWVudC5oYXNBdHRyaWJ1dGUoJ2hyZWYnKSlcbiAgICAgIHRoaXMuanVtcFRvKHRoaXMuZWxlbWVudCwgdGhpcy50YXJnZXQpO1xuXG4gICAgLyoqXG4gICAgICogVG9nZ2xlIEVsZW1lbnQgKGluY2x1ZGluZyBtdWx0aSB0b2dnbGVzKSBBcmlhIEF0dHJpYnV0ZXNcbiAgICAgKi9cblxuICAgIGZvciAoaSA9IDA7IGkgPCBUb2dnbGUuZWxBcmlhUm9sZXMubGVuZ3RoOyBpKyspIHtcbiAgICAgIGF0dHIgPSBUb2dnbGUuZWxBcmlhUm9sZXNbaV07XG4gICAgICB2YWx1ZSA9IHRoaXMuZWxlbWVudC5nZXRBdHRyaWJ1dGUoYXR0cik7XG5cbiAgICAgIGlmICh2YWx1ZSAhPSAnJyAmJiB2YWx1ZSlcbiAgICAgICAgdGhpcy5lbGVtZW50LnNldEF0dHJpYnV0ZShhdHRyLCAodmFsdWUgPT09ICd0cnVlJykgPyAnZmFsc2UnIDogJ3RydWUnKTtcblxuICAgICAgLy8gSWYgdGhlcmUgYXJlIG90aGVyIHRvZ2dsZXMgdGhhdCBjb250cm9sIHRoZSBzYW1lIGVsZW1lbnRcbiAgICAgIHRoaXMub3RoZXJzLmZvckVhY2goKG90aGVyKSA9PiB7XG4gICAgICAgIGlmIChvdGhlciAhPT0gdGhpcy5lbGVtZW50ICYmIG90aGVyLmdldEF0dHJpYnV0ZShhdHRyKSlcbiAgICAgICAgICBvdGhlci5zZXRBdHRyaWJ1dGUoYXR0ciwgKHZhbHVlID09PSAndHJ1ZScpID8gJ2ZhbHNlJyA6ICd0cnVlJyk7XG4gICAgICB9KTtcbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBUb2dnbGluZyBjb21wbGV0ZSBob29rXG4gICAgICovXG5cbiAgICBpZiAodGhpcy5zZXR0aW5ncy5hZnRlcilcbiAgICAgIHRoaXMuc2V0dGluZ3MuYWZ0ZXIodGhpcyk7XG5cbiAgICByZXR1cm4gdGhpcztcbiAgfVxufVxuXG4vKiogQHR5cGUgIHtTdHJpbmd9ICBUaGUgbWFpbiBzZWxlY3RvciB0byBhZGQgdGhlIHRvZ2dsaW5nIGZ1bmN0aW9uIHRvICovXG5Ub2dnbGUuc2VsZWN0b3IgPSAnW2RhdGEtanMqPVwidG9nZ2xlXCJdJztcblxuLyoqIEB0eXBlICB7U3RyaW5nfSAgVGhlIG5hbWVzcGFjZSBmb3Igb3VyIGRhdGEgYXR0cmlidXRlIHNldHRpbmdzICovXG5Ub2dnbGUubmFtZXNwYWNlID0gJ3RvZ2dsZSc7XG5cbi8qKiBAdHlwZSAge1N0cmluZ30gIFRoZSBoaWRlIGNsYXNzICovXG5Ub2dnbGUuaW5hY3RpdmVDbGFzcyA9ICdoaWRkZW4nO1xuXG4vKiogQHR5cGUgIHtTdHJpbmd9ICBUaGUgYWN0aXZlIGNsYXNzICovXG5Ub2dnbGUuYWN0aXZlQ2xhc3MgPSAnYWN0aXZlJztcblxuLyoqIEB0eXBlICB7QXJyYXl9ICBBcmlhIHJvbGVzIHRvIHRvZ2dsZSB0cnVlL2ZhbHNlIG9uIHRoZSB0b2dnbGluZyBlbGVtZW50ICovXG5Ub2dnbGUuZWxBcmlhUm9sZXMgPSBbJ2FyaWEtcHJlc3NlZCcsICdhcmlhLWV4cGFuZGVkJ107XG5cbi8qKiBAdHlwZSAge0FycmF5fSAgQXJpYSByb2xlcyB0byB0b2dnbGUgdHJ1ZS9mYWxzZSBvbiB0aGUgdGFyZ2V0IGVsZW1lbnQgKi9cblRvZ2dsZS50YXJnZXRBcmlhUm9sZXMgPSBbJ2FyaWEtaGlkZGVuJ107XG5cbi8qKiBAdHlwZSAge0FycmF5fSAgRm9jdXNhYmxlIGVsZW1lbnRzIHRvIGhpZGUgd2l0aGluIHRoZSBoaWRkZW4gdGFyZ2V0IGVsZW1lbnQgKi9cblRvZ2dsZS5lbEZvY3VzYWJsZSA9IFtcbiAgJ2EnLCAnYnV0dG9uJywgJ2lucHV0JywgJ3NlbGVjdCcsICd0ZXh0YXJlYScsICdvYmplY3QnLCAnZW1iZWQnLCAnZm9ybScsXG4gICdmaWVsZHNldCcsICdsZWdlbmQnLCAnbGFiZWwnLCAnYXJlYScsICdhdWRpbycsICd2aWRlbycsICdpZnJhbWUnLCAnc3ZnJyxcbiAgJ2RldGFpbHMnLCAndGFibGUnLCAnW3RhYmluZGV4XScsICdbY29udGVudGVkaXRhYmxlXScsICdbdXNlbWFwXSdcbl07XG5cbi8qKiBAdHlwZSAge0FycmF5fSAgS2V5IGF0dHJpYnV0ZSBmb3Igc3RvcmluZyB0b2dnbGVzIGluIHRoZSB3aW5kb3cgKi9cblRvZ2dsZS5jYWxsYmFjayA9IFsnVG9nZ2xlc0NhbGxiYWNrJ107XG5cbi8qKiBAdHlwZSAge0FycmF5fSAgRGVmYXVsdCBldmVudHMgdG8gdG8gd2F0Y2ggZm9yIHRvZ2dsaW5nLiBFYWNoIG11c3QgaGF2ZSBhIGhhbmRsZXIgaW4gdGhlIGNsYXNzIGFuZCBlbGVtZW50cyB0byBsb29rIGZvciBpbiBUb2dnbGUuZWxlbWVudHMgKi9cblRvZ2dsZS5ldmVudHMgPSBbJ2NsaWNrJywgJ2NoYW5nZSddO1xuXG4vKiogQHR5cGUgIHtBcnJheX0gIEVsZW1lbnRzIHRvIGRlbGVnYXRlIHRvIGVhY2ggZXZlbnQgaGFuZGxlciAqL1xuVG9nZ2xlLmVsZW1lbnRzID0ge1xuICBDTElDSzogWydBJywgJ0JVVFRPTiddLFxuICBDSEFOR0U6IFsnU0VMRUNUJywgJ0lOUFVUJywgJ1RFWFRBUkVBJ11cbn07XG5cbmV4cG9ydCBkZWZhdWx0IFRvZ2dsZTtcbiIsIid1c2Ugc3RyaWN0JztcblxuLyoqXG4gKiBUcmFja2luZyBidXMgZm9yIEdvb2dsZSBhbmFseXRpY3MgYW5kIFdlYnRyZW5kcy5cbiAqL1xuY2xhc3MgVHJhY2sge1xuICBjb25zdHJ1Y3RvcihzKSB7XG4gICAgY29uc3QgYm9keSA9IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoJ2JvZHknKTtcblxuICAgIHMgPSAoIXMpID8ge30gOiBzO1xuXG4gICAgdGhpcy5fc2V0dGluZ3MgPSB7XG4gICAgICBzZWxlY3RvcjogKHMuc2VsZWN0b3IpID8gcy5zZWxlY3RvciA6IFRyYWNrLnNlbGVjdG9yLFxuICAgIH07XG5cbiAgICB0aGlzLmRlc2luYXRpb25zID0gVHJhY2suZGVzdGluYXRpb25zO1xuXG4gICAgYm9keS5hZGRFdmVudExpc3RlbmVyKCdjbGljaycsIChldmVudCkgPT4ge1xuICAgICAgaWYgKCFldmVudC50YXJnZXQubWF0Y2hlcyh0aGlzLl9zZXR0aW5ncy5zZWxlY3RvcikpXG4gICAgICAgIHJldHVybjtcblxuICAgICAgbGV0IGtleSA9IGV2ZW50LnRhcmdldC5kYXRhc2V0LnRyYWNrS2V5O1xuICAgICAgbGV0IGRhdGEgPSBKU09OLnBhcnNlKGV2ZW50LnRhcmdldC5kYXRhc2V0LnRyYWNrRGF0YSk7XG5cbiAgICAgIHRoaXMudHJhY2soa2V5LCBkYXRhKTtcbiAgICB9KTtcblxuICAgIHJldHVybiB0aGlzO1xuICB9XG5cbiAgLyoqXG4gICAqIFRyYWNraW5nIGZ1bmN0aW9uIHdyYXBwZXJcbiAgICpcbiAgICogQHBhcmFtICB7U3RyaW5nfSAgICAgIGtleSAgIFRoZSBrZXkgb3IgZXZlbnQgb2YgdGhlIGRhdGFcbiAgICogQHBhcmFtICB7Q29sbGVjdGlvbn0gIGRhdGEgIFRoZSBkYXRhIHRvIHRyYWNrXG4gICAqXG4gICAqIEByZXR1cm4ge09iamVjdH0gICAgICAgICAgICBUaGUgZmluYWwgZGF0YSBvYmplY3RcbiAgICovXG4gIHRyYWNrKGtleSwgZGF0YSkge1xuICAgIC8vIFNldCB0aGUgcGF0aCBuYW1lIGJhc2VkIG9uIHRoZSBsb2NhdGlvblxuICAgIGNvbnN0IGQgPSBkYXRhLm1hcChlbCA9PiB7XG4gICAgICAgIGlmIChlbC5oYXNPd25Qcm9wZXJ0eShUcmFjay5rZXkpKVxuICAgICAgICAgIGVsW1RyYWNrLmtleV0gPSBgJHt3aW5kb3cubG9jYXRpb24ucGF0aG5hbWV9LyR7ZWxbVHJhY2sua2V5XX1gXG4gICAgICAgIHJldHVybiBlbDtcbiAgICAgIH0pO1xuXG4gICAgbGV0IHd0ID0gdGhpcy53ZWJ0cmVuZHMoa2V5LCBkKTtcbiAgICBsZXQgZ2EgPSB0aGlzLmd0YWcoa2V5LCBkKTtcblxuICAgIC8qIGVzbGludC1kaXNhYmxlIG5vLWNvbnNvbGUgKi9cbiAgICBpZiAocHJvY2Vzcy5lbnYuTk9ERV9FTlYgIT09ICdwcm9kdWN0aW9uJylcbiAgICAgIGNvbnNvbGUuZGlyKHsnVHJhY2snOiBbd3QsIGdhXX0pO1xuICAgIC8qIGVzbGludC1lbmFibGUgbm8tY29uc29sZSAqL1xuXG4gICAgcmV0dXJuIGQ7XG4gIH07XG5cbiAgLyoqXG4gICAqIERhdGEgYnVzIGZvciB0cmFja2luZyB2aWV3cyBpbiBXZWJ0cmVuZHMgYW5kIEdvb2dsZSBBbmFseXRpY3NcbiAgICpcbiAgICogQHBhcmFtICB7U3RyaW5nfSAgICAgIGFwcCAgIFRoZSBuYW1lIG9mIHRoZSBTaW5nbGUgUGFnZSBBcHBsaWNhdGlvbiB0byB0cmFja1xuICAgKiBAcGFyYW0gIHtTdHJpbmd9ICAgICAga2V5ICAgVGhlIGtleSBvciBldmVudCBvZiB0aGUgZGF0YVxuICAgKiBAcGFyYW0gIHtDb2xsZWN0aW9ufSAgZGF0YSAgVGhlIGRhdGEgdG8gdHJhY2tcbiAgICovXG4gIHZpZXcoYXBwLCBrZXksIGRhdGEpIHtcbiAgICBsZXQgd3QgPSB0aGlzLndlYnRyZW5kcyhrZXksIGRhdGEpO1xuICAgIGxldCBnYSA9IHRoaXMuZ3RhZ1ZpZXcoYXBwLCBrZXkpO1xuXG4gICAgLyogZXNsaW50LWRpc2FibGUgbm8tY29uc29sZSAqL1xuICAgIGlmIChwcm9jZXNzLmVudi5OT0RFX0VOViAhPT0gJ3Byb2R1Y3Rpb24nKVxuICAgICAgY29uc29sZS5kaXIoeydUcmFjayc6IFt3dCwgZ2FdfSk7XG4gICAgLyogZXNsaW50LWVuYWJsZSBuby1jb25zb2xlICovXG4gIH07XG5cbiAgLyoqXG4gICAqIFB1c2ggRXZlbnRzIHRvIFdlYnRyZW5kc1xuICAgKlxuICAgKiBAcGFyYW0gIHtTdHJpbmd9ICAgICAga2V5ICAgVGhlIGtleSBvciBldmVudCBvZiB0aGUgZGF0YVxuICAgKiBAcGFyYW0gIHtDb2xsZWN0aW9ufSAgZGF0YSAgVGhlIGRhdGEgdG8gdHJhY2tcbiAgICovXG4gIHdlYnRyZW5kcyhrZXksIGRhdGEpIHtcbiAgICBpZiAoXG4gICAgICB0eXBlb2YgV2VidHJlbmRzID09PSAndW5kZWZpbmVkJyB8fFxuICAgICAgdHlwZW9mIGRhdGEgPT09ICd1bmRlZmluZWQnIHx8XG4gICAgICAhdGhpcy5kZXNpbmF0aW9ucy5pbmNsdWRlcygnd2VidHJlbmRzJylcbiAgICApXG4gICAgICByZXR1cm4gZmFsc2U7XG5cbiAgICBsZXQgZXZlbnQgPSBbe1xuICAgICAgJ1dULnRpJzoga2V5XG4gICAgfV07XG5cbiAgICBpZiAoZGF0YVswXSAmJiBkYXRhWzBdLmhhc093blByb3BlcnR5KFRyYWNrLmtleSkpXG4gICAgICBldmVudC5wdXNoKHtcbiAgICAgICAgJ0RDUy5kY3N1cmknOiBkYXRhWzBdW1RyYWNrLmtleV1cbiAgICAgIH0pO1xuICAgIGVsc2VcbiAgICAgIE9iamVjdC5hc3NpZ24oZXZlbnQsIGRhdGEpO1xuXG4gICAgLy8gRm9ybWF0IGRhdGEgZm9yIFdlYnRyZW5kc1xuICAgIGxldCB3dGQgPSB7YXJnc2E6IGV2ZW50LmZsYXRNYXAoZSA9PiB7XG4gICAgICByZXR1cm4gT2JqZWN0LmtleXMoZSkuZmxhdE1hcChrID0+IFtrLCBlW2tdXSk7XG4gICAgfSl9O1xuXG4gICAgLy8gSWYgJ2FjdGlvbicgaXMgdXNlZCBhcyB0aGUga2V5IChmb3IgZ3RhZy5qcyksIHN3aXRjaCBpdCB0byBXZWJ0cmVuZHNcbiAgICBsZXQgYWN0aW9uID0gZGF0YS5hcmdzYS5pbmRleE9mKCdhY3Rpb24nKTtcblxuICAgIGlmIChhY3Rpb24pIGRhdGEuYXJnc2FbYWN0aW9uXSA9ICdEQ1MuZGNzdXJpJztcblxuICAgIC8vIFdlYnRyZW5kcyBkb2Vzbid0IHNlbmQgdGhlIHBhZ2UgdmlldyBmb3IgTXVsdGlUcmFjaywgYWRkIHBhdGggdG8gdXJsXG4gICAgbGV0IGRjc3VyaSA9IGRhdGEuYXJnc2EuaW5kZXhPZignRENTLmRjc3VyaScpO1xuXG4gICAgaWYgKGRjc3VyaSlcbiAgICAgIGRhdGEuYXJnc2FbZGNzdXJpICsgMV0gPSB3aW5kb3cubG9jYXRpb24ucGF0aG5hbWUgKyBkYXRhLmFyZ3NhW2Rjc3VyaSArIDFdO1xuXG4gICAgLyogZXNsaW50LWRpc2FibGUgbm8tdW5kZWYgKi9cbiAgICBpZiAodHlwZW9mIFdlYnRyZW5kcyAhPT0gJ3VuZGVmaW5lZCcpXG4gICAgICBXZWJ0cmVuZHMubXVsdGlUcmFjayh3dGQpO1xuICAgIC8qIGVzbGludC1kaXNhYmxlIG5vLXVuZGVmICovXG5cbiAgICByZXR1cm4gWydXZWJ0cmVuZHMnLCB3dGRdO1xuICB9O1xuXG4gIC8qKlxuICAgKiBQdXNoIENsaWNrIEV2ZW50cyB0byBHb29nbGUgQW5hbHl0aWNzXG4gICAqXG4gICAqIEBwYXJhbSAge1N0cmluZ30gICAgICBrZXkgICBUaGUga2V5IG9yIGV2ZW50IG9mIHRoZSBkYXRhXG4gICAqIEBwYXJhbSAge0NvbGxlY3Rpb259ICBkYXRhICBUaGUgZGF0YSB0byB0cmFja1xuICAgKi9cbiAgZ3RhZyhrZXksIGRhdGEpIHtcbiAgICBpZiAoXG4gICAgICB0eXBlb2YgZ3RhZyA9PT0gJ3VuZGVmaW5lZCcgfHxcbiAgICAgIHR5cGVvZiBkYXRhID09PSAndW5kZWZpbmVkJyB8fFxuICAgICAgIXRoaXMuZGVzaW5hdGlvbnMuaW5jbHVkZXMoJ2d0YWcnKVxuICAgIClcbiAgICAgIHJldHVybiBmYWxzZTtcblxuICAgIGxldCB1cmkgPSBkYXRhLmZpbmQoKGVsZW1lbnQpID0+IGVsZW1lbnQuaGFzT3duUHJvcGVydHkoVHJhY2sua2V5KSk7XG5cbiAgICBsZXQgZXZlbnQgPSB7XG4gICAgICAnZXZlbnRfY2F0ZWdvcnknOiBrZXlcbiAgICB9O1xuXG4gICAgLyogZXNsaW50LWRpc2FibGUgbm8tdW5kZWYgKi9cbiAgICBndGFnKFRyYWNrLmtleSwgdXJpW1RyYWNrLmtleV0sIGV2ZW50KTtcbiAgICAvKiBlc2xpbnQtZW5hYmxlIG5vLXVuZGVmICovXG5cbiAgICByZXR1cm4gWydndGFnJywgVHJhY2sua2V5LCB1cmlbVHJhY2sua2V5XSwgZXZlbnRdO1xuICB9O1xuXG4gIC8qKlxuICAgKiBQdXNoIFNjcmVlbiBWaWV3IEV2ZW50cyB0byBHb29nbGUgQW5hbHl0aWNzXG4gICAqXG4gICAqIEBwYXJhbSAge1N0cmluZ30gIGFwcCAgVGhlIG5hbWUgb2YgdGhlIGFwcGxpY2F0aW9uXG4gICAqIEBwYXJhbSAge1N0cmluZ30gIGtleSAgVGhlIGtleSBvciBldmVudCBvZiB0aGUgZGF0YVxuICAgKi9cbiAgZ3RhZ1ZpZXcoYXBwLCBrZXkpIHtcbiAgICBpZiAoXG4gICAgICB0eXBlb2YgZ3RhZyA9PT0gJ3VuZGVmaW5lZCcgfHxcbiAgICAgIHR5cGVvZiBkYXRhID09PSAndW5kZWZpbmVkJyB8fFxuICAgICAgIXRoaXMuZGVzaW5hdGlvbnMuaW5jbHVkZXMoJ2d0YWcnKVxuICAgIClcbiAgICAgIHJldHVybiBmYWxzZTtcblxuICAgIGxldCB2aWV3ID0ge1xuICAgICAgYXBwX25hbWU6IGFwcCxcbiAgICAgIHNjcmVlbl9uYW1lOiBrZXlcbiAgICB9O1xuXG4gICAgLyogZXNsaW50LWRpc2FibGUgbm8tdW5kZWYgKi9cbiAgICBndGFnKCdldmVudCcsICdzY3JlZW5fdmlldycsIHZpZXcpO1xuICAgIC8qIGVzbGludC1lbmFibGUgbm8tdW5kZWYgKi9cblxuICAgIHJldHVybiBbJ2d0YWcnLCBUcmFjay5rZXksICdzY3JlZW5fdmlldycsIHZpZXddO1xuICB9O1xufVxuXG4vKiogQHR5cGUge1N0cmluZ30gVGhlIG1haW4gc2VsZWN0b3IgdG8gYWRkIHRoZSB0cmFja2luZyBmdW5jdGlvbiB0byAqL1xuVHJhY2suc2VsZWN0b3IgPSAnW2RhdGEtanMqPVwidHJhY2tcIl0nO1xuXG4vKiogQHR5cGUge1N0cmluZ30gVGhlIG1haW4gZXZlbnQgdHJhY2tpbmcga2V5IHRvIG1hcCB0byBXZWJ0cmVuZHMgRENTLnVyaSAqL1xuVHJhY2sua2V5ID0gJ2V2ZW50JztcblxuLyoqIEB0eXBlIHtBcnJheX0gV2hhdCBkZXN0aW5hdGlvbnMgdG8gcHVzaCBkYXRhIHRvICovXG5UcmFjay5kZXN0aW5hdGlvbnMgPSBbXG4gICd3ZWJ0cmVuZHMnLFxuICAnZ3RhZydcbl07XG5cbmV4cG9ydCBkZWZhdWx0IFRyYWNrOyIsImltcG9ydCAnLi9tb2R1bGVzL3BvbHlmaWxsLXJlbW92ZSc7XG5cbmltcG9ydCByZXF1ZXN0Rm9ybSBmcm9tICcuL21vZHVsZXMvc3VibWlzc2lvbi5qcyc7XG5pbXBvcnQgc3dhZ2dlciBmcm9tICcuL21vZHVsZXMvc3dhZ2dlci5qcyc7XG5pbXBvcnQgYnVsa1N1Ym1pc3Npb24gZnJvbSAnLi9tb2R1bGVzL2J1bGstc3VibWlzc2lvbi5qcyc7XG5pbXBvcnQgY2hhbmdlUGFzc3dvcmQgZnJvbSAnLi9tb2R1bGVzL2NoYW5nZS1wYXNzd29yZC5qcyc7XG5pbXBvcnQgcmVxdWVzdEZvcm1KU09OIGZyb20gJy4vbW9kdWxlcy9yZXF1ZXN0LWZvcm0tanNvbi5qcyc7XG5pbXBvcnQgSWNvbnMgZnJvbSAnQG55Y29wcG9ydHVuaXR5L3B0dHJuLXNjcmlwdHMvc3JjL2ljb25zL2ljb25zJztcbmltcG9ydCBUb2dnbGUgZnJvbSAnQG55Y29wcG9ydHVuaXR5L3B0dHJuLXNjcmlwdHMvc3JjL3RvZ2dsZS90b2dnbGUnO1xuaW1wb3J0IFRyYWNrIGZyb20gJ0BueWNvcHBvcnR1bml0eS9wdHRybi1zY3JpcHRzL3NyYy90cmFjay90cmFjayc7XG5cbnZhciBjZG4gPSAocHJvY2Vzcy5lbnYuTk9ERV9FTlYgPT09ICdwcm9kdWN0aW9uJykgP1xuICAnaHR0cHM6Ly9yYXcuZ2l0aHVidXNlcmNvbnRlbnQuY29tL0NpdHlPZk5ld1lvcmsvc2NyZWVuaW5nYXBpLWRvY3MvY29udGVudC8nIDpcbiAgJ2h0dHBzOi8vcmF3LmdpdGh1YnVzZXJjb250ZW50LmNvbS9DaXR5T2ZOZXdZb3JrL3NjcmVlbmluZ2FwaS1kb2NzL2Vudi9kZXZlbG9wbWVudC1jb250ZW50Lyc7XG5cbm5ldyBJY29ucygnc3ZnL2ljb25zLnN2ZycpO1xubmV3IFRvZ2dsZSgpO1xubmV3IFRyYWNrKCk7XG5cbmlmICgod2luZG93LmxvY2F0aW9uLnBhdGhuYW1lLmluZGV4T2YoJ2VuZHBvaW50cycpID49IDApKVxuICBzd2FnZ2VyKGNkbik7XG5cbmlmICgod2luZG93LmxvY2F0aW9uLnBhdGhuYW1lLmluZGV4T2YoJ2Zvcm0nKSA+PSAwKSlcbiAgcmVxdWVzdEZvcm0oKTtcblxuaWYgKCh3aW5kb3cubG9jYXRpb24ucGF0aG5hbWUuaW5kZXhPZigncmVxdWVzdC1idWlsZGVyJykgPj0gMCkpXG4gIHJlcXVlc3RGb3JtSlNPTigpO1xuXG5pZiAoKHdpbmRvdy5sb2NhdGlvbi5wYXRobmFtZS5pbmRleE9mKCdidWxrLXN1Ym1pc3Npb24nKSA+PSAwKSlcbiAgYnVsa1N1Ym1pc3Npb24oKTtcblxuaWYgKCh3aW5kb3cubG9jYXRpb24ucGF0aG5hbWUuaW5kZXhPZignY2hhbmdlLXBhc3N3b3JkJykgPj0gMCkpXG4gIGNoYW5nZVBhc3N3b3JkKCk7XG5cbi8qIEdldCB0aGUgY29udGVudCBtYXJrZG93biBmcm9tIENETiBhbmQgYXBwZW5kICovXG5sZXQgbWFya2Rvd25zID0gJCgnYm9keScpLmZpbmQoJ1tpZF49XCJtYXJrZG93blwiXScpO1xuXG5tYXJrZG93bnMuZWFjaChmdW5jdGlvbigpIHtcbiAgbGV0IHRhcmdldCA9ICQodGhpcyk7XG4gIGxldCBmaWxlID0gJCh0aGlzKS5hdHRyKCdpZCcpLnJlcGxhY2UoJ21hcmtkb3duLScsICcnKTtcblxuICAkLmdldChjZG4gKyBmaWxlICsgJy5tZCcsIGZ1bmN0aW9uKGRhdGEpIHtcbiAgICBsZXQgY29udmVydGVyID0gbmV3IHNob3dkb3duLkNvbnZlcnRlcih7dGFibGVzOiB0cnVlfSk7XG4gICAgbGV0IGh0bWwgICAgICA9IGNvbnZlcnRlci5tYWtlSHRtbChkYXRhKTtcblxuICAgIHRhcmdldC5hcHBlbmQoaHRtbClcbiAgICAgIC5oaWRlKClcbiAgICAgIC5mYWRlSW4oMjUwKVxuXG4gIH0sICd0ZXh0Jylcbn0pO1xuIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7OztFQUFBLENBQUMsU0FBUyxHQUFHLEVBQUU7RUFDZixFQUFFLEdBQUcsQ0FBQyxPQUFPLENBQUMsU0FBUyxJQUFJLEVBQUU7RUFDN0IsSUFBSSxJQUFJLElBQUksQ0FBQyxjQUFjLENBQUMsUUFBUSxDQUFDLEVBQUU7RUFDdkMsTUFBTSxPQUFPO0VBQ2IsS0FBSztFQUNMLElBQUksTUFBTSxDQUFDLGNBQWMsQ0FBQyxJQUFJLEVBQUUsUUFBUSxFQUFFO0VBQzFDLE1BQU0sWUFBWSxFQUFFLElBQUk7RUFDeEIsTUFBTSxVQUFVLEVBQUUsSUFBSTtFQUN0QixNQUFNLFFBQVEsRUFBRSxJQUFJO0VBQ3BCLE1BQU0sS0FBSyxFQUFFLFNBQVMsTUFBTSxHQUFHO0VBQy9CLFFBQVEsSUFBSSxJQUFJLENBQUMsVUFBVSxLQUFLLElBQUk7RUFDcEMsVUFBVSxJQUFJLENBQUMsVUFBVSxDQUFDLFdBQVcsQ0FBQyxJQUFJLENBQUMsQ0FBQztFQUM1QyxPQUFPO0VB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RUFDQTtBQUNBO0VBQ0EsSUFBSSxJQUFJLElBQUksQ0FBQyxRQUFRLENBQUMsS0FBSyxJQUFJLENBQUMsSUFBSSxDQUFDLFFBQVEsQ0FBQyxLQUFLLENBQUMsSUFBSSxDQUFDO0VBQ3pELE1BQU0sT0FBTyxJQUFJLENBQUM7QUFDbEI7RUFDQTtFQUNBO0VBQ0E7QUFDQTtFQUNBLElBQUksSUFBSSxJQUFJLENBQUMsUUFBUSxDQUFDLE1BQU07RUFDNUIsTUFBTSxJQUFJLENBQUMsUUFBUSxDQUFDLE1BQU0sQ0FBQyxJQUFJLENBQUMsQ0FBQztBQUNqQztFQUNBO0VBQ0E7RUFDQTtBQUNBO0VBQ0EsSUFBSSxJQUFJLElBQUksQ0FBQyxRQUFRLENBQUMsV0FBVyxFQUFFO0VBQ25DLE1BQU0sSUFBSSxDQUFDLE9BQU8sQ0FBQyxTQUFTLENBQUMsTUFBTSxDQUFDLElBQUksQ0FBQyxRQUFRLENBQUMsV0FBVyxDQUFDLENBQUM7RUFDL0QsTUFBTSxJQUFJLENBQUMsTUFBTSxDQUFDLFNBQVMsQ0FBQyxNQUFNLENBQUMsSUFBSSxDQUFDLFFBQVEsQ0FBQyxXQUFXLENBQUMsQ0FBQztBQUM5RDtFQUNBO0VBQ0EsTUFBTSxJQUFJLENBQUMsTUFBTSxDQUFDLE9BQU8sQ0FBQyxLQUFLLElBQUk7RUFDbkMsUUFBUSxJQUFJLEtBQUssS0FBSyxJQUFJLENBQUMsT0FBTztFQUNsQyxVQUFVLEtBQUssQ0FBQyxTQUFTLENBQUMsTUFBTSxDQUFDLElBQUksQ0FBQyxRQUFRLENBQUMsV0FBVyxDQUFDLENBQUM7RUFDNUQsT0FBTyxDQUFDLENBQUM7RUFDVCxLQUFLO0FBQ0w7RUFDQSxJQUFJLElBQUksSUFBSSxDQUFDLFFBQVEsQ0FBQyxhQUFhO0VBQ25DLE1BQU0sTUFBTSxDQUFDLFNBQVMsQ0FBQyxNQUFNLENBQUMsSUFBSSxDQUFDLFFBQVEsQ0FBQyxhQUFhLENBQUMsQ0FBQztBQUMzRDtFQUNBO0VBQ0E7RUFDQTtBQUNBO0VBQ0EsSUFBSSxLQUFLLENBQUMsR0FBRyxDQUFDLEVBQUUsQ0FBQyxHQUFHLE1BQU0sQ0FBQyxlQUFlLENBQUMsTUFBTSxFQUFFLENBQUMsRUFBRSxFQUFFO0VBQ3hELE1BQU0sSUFBSSxHQUFHLE1BQU0sQ0FBQyxlQUFlLENBQUMsQ0FBQyxDQUFDLENBQUM7RUFDdkMsTUFBTSxLQUFLLEdBQUcsSUFBSSxDQUFDLE1BQU0sQ0FBQyxZQUFZLENBQUMsSUFBSSxDQUFDLENBQUM7QUFDN0M7RUFDQSxNQUFNLElBQUksS0FBSyxJQUFJLEVBQUUsSUFBSSxLQUFLO0VBQzlCLFFBQVEsSUFBSSxDQUFDLE1BQU0sQ0FBQyxZQUFZLENBQUMsSUFBSSxFQUFFLENBQUMsS0FBSyxLQUFLLE1BQU0sSUFBSSxPQUFPLEdBQUcsTUFBTSxDQUFDLENBQUM7RUFDOUUsS0FBSztBQUNMO0VBQ0E7RUFDQTtFQUNBO0FBQ0E7RUFDQSxJQUFJLElBQUksSUFBSSxDQUFDLFFBQVEsQ0FBQyxTQUFTO0VBQy9CLE1BQU0sSUFBSSxDQUFDLGVBQWUsQ0FBQyxJQUFJLENBQUMsU0FBUyxDQUFDLENBQUM7QUFDM0M7RUFDQTtFQUNBO0VBQ0E7QUFDQTtFQUNBLElBQUksSUFBSSxJQUFJLENBQUMsUUFBUSxDQUFDLElBQUksSUFBSSxJQUFJLENBQUMsT0FBTyxDQUFDLFlBQVksQ0FBQyxNQUFNLENBQUM7RUFDL0QsTUFBTSxJQUFJLENBQUMsTUFBTSxDQUFDLElBQUksQ0FBQyxPQUFPLEVBQUUsSUFBSSxDQUFDLE1BQU0sQ0FBQyxDQUFDO0FBQzdDO0VBQ0E7RUFDQTtFQUNBO0FBQ0E7RUFDQSxJQUFJLEtBQUssQ0FBQyxHQUFHLENBQUMsRUFBRSxDQUFDLEdBQUcsTUFBTSxDQUFDLFdBQVcsQ0FBQyxNQUFNLEVBQUUsQ0FBQyxFQUFFLEVBQUU7RUFDcEQsTUFBTSxJQUFJLEdBQUcsTUFBTSxDQUFDLFdBQVcsQ0FBQyxDQUFDLENBQUMsQ0FBQztFQUNuQyxNQUFNLEtBQUssR0FBRyxJQUFJLENBQUMsT0FBTyxDQUFDLFlBQVksQ0FBQyxJQUFJLENBQUMsQ0FBQztBQUM5QztFQUNBLE1BQU0sSUFBSSxLQUFLLElBQUksRUFBRSxJQUFJLEtBQUs7RUFDOUIsUUFBUSxJQUFJLENBQUMsT0FBTyxDQUFDLFlBQVksQ0FBQyxJQUFJLEVBQUUsQ0FBQyxLQUFLLEtBQUssTUFBTSxJQUFJLE9BQU8sR0FBRyxNQUFNLENBQUMsQ0FBQztBQUMvRTtFQUNBO0VBQ0EsTUFBTSxJQUFJLENBQUMsTUFBTSxDQUFDLE9BQU8sQ0FBQyxDQUFDLEtBQUssS0FBSztFQUNyQyxRQUFRLElBQUksS0FBSyxLQUFLLElBQUksQ0FBQyxPQUFPLElBQUksS0FBSyxDQUFDLFlBQVksQ0FBQyxJQUFJLENBQUM7RUFDOUQsVUFBVSxLQUFLLENBQUMsWUFBWSxDQUFDLElBQUksRUFBRSxDQUFDLEtBQUssS0FBSyxNQUFNLElBQUksT0FBTyxHQUFHLE1BQU0sQ0FBQyxDQUFDO0VBQzFFLE9BQU8sQ0FBQyxDQUFDO0VBQ1QsS0FBSztBQUNMO0VBQ0E7RUFDQTtFQUNBO0FBQ0E7RUFDQSxJQUFJLElBQUksSUFBSSxDQUFDLFFBQVEsQ0FBQyxLQUFLO0VBQzNCLE1BQU0sSUFBSSxDQUFDLFFBQVEsQ0FBQyxLQUFLLENBQUMsSUFBSSxDQUFDLENBQUM7QUFDaEM7RUFDQSxJQUFJLE9BQU8sSUFBSSxDQUFDO0VBQ2hCLEdBQUc7RUFDSCxDQUFDO0FBQ0Q7RUFDQTtFQUNBLE1BQU0sQ0FBQyxRQUFRLEdBQUcscUJBQXFCLENBQUM7QUFDeEM7RUFDQTtFQUNBLE1BQU0sQ0FBQyxTQUFTLEdBQUcsUUFBUSxDQUFDO0FBQzVCO0VBQ0E7RUFDQSxNQUFNLENBQUMsYUFBYSxHQUFHLFFBQVEsQ0FBQztBQUNoQztFQUNBO0VBQ0EsTUFBTSxDQUFDLFdBQVcsR0FBRyxRQUFRLENBQUM7QUFDOUI7RUFDQTtFQUNBLE1BQU0sQ0FBQyxXQUFXLEdBQUcsQ0FBQyxjQUFjLEVBQUUsZUFBZSxDQUFDLENBQUM7QUFDdkQ7RUFDQTtFQUNBLE1BQU0sQ0FBQyxlQUFlLEdBQUcsQ0FBQyxhQUFhLENBQUMsQ0FBQztBQUN6QztFQUNBO0VBQ0EsTUFBTSxDQUFDLFdBQVcsR0FBRztFQUNyQixFQUFFLEdBQUcsRUFBRSxRQUFRLEVBQUUsT0FBTyxFQUFFLFFBQVEsRUFBRSxVQUFVLEVBQUUsUUFBUSxFQUFFLE9BQU8sRUFBRSxNQUFNO0VBQ3pFLEVBQUUsVUFBVSxFQUFFLFFBQVEsRUFBRSxPQUFPLEVBQUUsTUFBTSxFQUFFLE9BQU8sRUFBRSxPQUFPLEVBQUUsUUFBUSxFQUFFLEtBQUs7RUFDMUUsRUFBRSxTQUFTLEVBQUUsT0FBTyxFQUFFLFlBQVksRUFBRSxtQkFBbUIsRUFBRSxVQUFVO0VBQ25FLENBQUMsQ0FBQztBQUNGO0VBQ0E7RUFDQSxNQUFNLENBQUMsUUFBUSxHQUFHLENBQUMsaUJBQWlCLENBQUMsQ0FBQztBQUN0QztFQUNBO0VBQ0EsTUFBTSxDQUFDLE1BQU0sR0FBRyxDQUFDLE9BQU8sRUFBRSxRQUFRLENBQUMsQ0FBQztBQUNwQztFQUNBO0VBQ0EsTUFBTSxDQUFDLFFBQVEsR0FBRztFQUNsQixFQUFFLEtBQUssRUFBRSxDQUFDLEdBQUcsRUFBRSxRQUFRLENBQUM7RUFDeEIsRUFBRSxNQUFNLEVBQUUsQ0FBQyxRQUFRLEVBQUUsT0FBTyxFQUFFLFVBQVUsQ0FBQztFQUN6QyxDQUFDOztFQzNaRDtFQUNBO0VBQ0E7RUFDQSxNQUFNLEtBQUssQ0FBQztFQUNaLEVBQUUsV0FBVyxDQUFDLENBQUMsRUFBRTtFQUNqQixJQUFJLE1BQU0sSUFBSSxHQUFHLFFBQVEsQ0FBQyxhQUFhLENBQUMsTUFBTSxDQUFDLENBQUM7QUFDaEQ7RUFDQSxJQUFJLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxJQUFJLEVBQUUsR0FBRyxDQUFDLENBQUM7QUFDdEI7RUFDQSxJQUFJLElBQUksQ0FBQyxTQUFTLEdBQUc7RUFDckIsTUFBTSxRQUFRLEVBQUUsQ0FBQyxDQUFDLENBQUMsUUFBUSxJQUFJLENBQUMsQ0FBQyxRQUFRLEdBQUcsS0FBSyxDQUFDLFFBQVE7RUFDMUQsS0FBSyxDQUFDO0FBQ047RUFDQSxJQUFJLElBQUksQ0FBQyxXQUFXLEdBQUcsS0FBSyxDQUFDLFlBQVksQ0FBQztBQUMxQztFQUNBLElBQUksSUFBSSxDQUFDLGdCQUFnQixDQUFDLE9BQU8sRUFBRSxDQUFDLEtBQUssS0FBSztFQUM5QyxNQUFNLElBQUksQ0FBQyxLQUFLLENBQUMsTUFBTSxDQUFDLE9BQU8sQ0FBQyxJQUFJLENBQUMsU0FBUyxDQUFDLFFBQVEsQ0FBQztFQUN4RCxRQUFRLE9BQU87QUFDZjtFQUNBLE1BQU0sSUFBSSxHQUFHLEdBQUcsS0FBSyxDQUFDLE1BQU0sQ0FBQyxPQUFPLENBQUMsUUFBUSxDQUFDO0VBQzlDLE1BQU0sSUFBSSxJQUFJLEdBQUcsSUFBSSxDQUFDLEtBQUssQ0FBQyxLQUFLLENBQUMsTUFBTSxDQUFDLE9BQU8sQ0FBQyxTQUFTLENBQUMsQ0FBQztBQUM1RDtFQUNBLE1BQU0sSUFBSSxDQUFDLEtBQUssQ0FBQyxHQUFHLEVBQUUsSUFBSSxDQUFDLENBQUM7RUFDNUIsS0FBSyxDQUFDLENBQUM7QUFDUDtFQUNBLElBQUksT0FBTyxJQUFJLENBQUM7RUFDaEIsR0FBRztBQUNIO0VBQ0E7RUFDQTtFQUNBO0VBQ0E7RUFDQTtFQUNBO0VBQ0E7RUFDQTtFQUNBLEVBQUUsS0FBSyxDQUFDLEdBQUcsRUFBRSxJQUFJLEVBQUU7RUFDbkI7RUFDQSxJQUFJLE1BQU0sQ0FBQyxHQUFHLElBQUksQ0FBQyxHQUFHLENBQUMsRUFBRSxJQUFJO0VBQzdCLFFBQVEsSUFBSSxFQUFFLENBQUMsY0FBYyxDQUFDLEtBQUssQ0FBQyxHQUFHLENBQUM7RUFDeEMsVUFBVSxFQUFFLENBQUMsS0FBSyxDQUFDLEdBQUcsQ0FBQyxHQUFHLENBQUMsRUFBRSxNQUFNLENBQUMsUUFBUSxDQUFDLFFBQVEsQ0FBQyxDQUFDLEVBQUUsRUFBRSxDQUFDLEtBQUssQ0FBQyxHQUFHLENBQUMsQ0FBQyxFQUFDO0VBQ3hFLFFBQVEsT0FBTyxFQUFFLENBQUM7RUFDbEIsT0FBTyxDQUFDLENBQUM7QUFDVDtFQUNBLElBQUksSUFBSSxFQUFFLEdBQUcsSUFBSSxDQUFDLFNBQVMsQ0FBQyxHQUFHLEVBQUUsQ0FBQyxDQUFDLENBQUM7RUFDcEMsSUFBSSxJQUFJLEVBQUUsR0FBRyxJQUFJLENBQUMsSUFBSSxDQUFDLEdBQUcsRUFBRSxDQUFDLENBQUMsQ0FBQztBQUMvQjtFQUNBO0VBQ0EsSUFDTSxPQUFPLENBQUMsR0FBRyxDQUFDLENBQUMsT0FBTyxFQUFFLENBQUMsRUFBRSxFQUFFLEVBQUUsQ0FBQyxDQUFDLENBQUMsQ0FBQztFQUN2QztBQUNBO0VBQ0EsSUFBSSxPQUFPLENBQUMsQ0FBQztFQUNiLEdBQUc7QUFDSDtFQUNBO0VBQ0E7RUFDQTtFQUNBO0VBQ0E7RUFDQTtFQUNBO0VBQ0EsRUFBRSxJQUFJLENBQUMsR0FBRyxFQUFFLEdBQUcsRUFBRSxJQUFJLEVBQUU7RUFDdkIsSUFBSSxJQUFJLEVBQUUsR0FBRyxJQUFJLENBQUMsU0FBUyxDQUFDLEdBQUcsRUFBRSxJQUFJLENBQUMsQ0FBQztFQUN2QyxJQUFJLElBQUksRUFBRSxHQUFHLElBQUksQ0FBQyxRQUFRLENBQUMsR0FBRyxFQUFFLEdBQUcsQ0FBQyxDQUFDO0FBQ3JDO0VBQ0E7RUFDQSxJQUNNLE9BQU8sQ0FBQyxHQUFHLENBQUMsQ0FBQyxPQUFPLEVBQUUsQ0FBQyxFQUFFLEVBQUUsRUFBRSxDQUFDLENBQUMsQ0FBQyxDQUFDO0VBQ3ZDO0VBQ0EsR0FBRztBQUNIO0VBQ0E7RUFDQTtFQUNBO0VBQ0E7RUFDQTtFQUNBO0VBQ0EsRUFBRSxTQUFTLENBQUMsR0FBRyxFQUFFLElBQUksRUFBRTtFQUN2QixJQUFJO0VBQ0osTUFBTSxPQUFPLFNBQVMsS0FBSyxXQUFXO0VBQ3RDLE1BQU0sT0FBTyxJQUFJLEtBQUssV0FBVztFQUNqQyxNQUFNLENBQUMsSUFBSSxDQUFDLFdBQVcsQ0FBQyxRQUFRLENBQUMsV0FBVyxDQUFDO0VBQzdDO0VBQ0EsTUFBTSxPQUFPLEtBQUssQ0FBQztBQUNuQjtFQUNBLElBQUksSUFBSSxLQUFLLEdBQUcsQ0FBQztFQUNqQixNQUFNLE9BQU8sRUFBRSxHQUFHO0VBQ2xCLEtBQUssQ0FBQyxDQUFDO0FBQ1A7RUFDQSxJQUFJLElBQUksSUFBSSxDQUFDLENBQUMsQ0FBQyxJQUFJLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQyxjQUFjLENBQUMsS0FBSyxDQUFDLEdBQUcsQ0FBQztFQUNwRCxNQUFNLEtBQUssQ0FBQyxJQUFJLENBQUM7RUFDakIsUUFBUSxZQUFZLEVBQUUsSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDLEtBQUssQ0FBQyxHQUFHLENBQUM7RUFDeEMsT0FBTyxDQUFDLENBQUM7RUFDVDtFQUNBLE1BQU0sTUFBTSxDQUFDLE1BQU0sQ0FBQyxLQUFLLEVBQUUsSUFBSSxDQUFDLENBQUM7QUFDakM7RUFDQTtFQUNBLElBQUksSUFBSSxHQUFHLEdBQUcsQ0FBQyxLQUFLLEVBQUUsS0FBSyxDQUFDLE9BQU8sQ0FBQyxDQUFDLElBQUk7RUFDekMsTUFBTSxPQUFPLE1BQU0sQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUMsT0FBTyxDQUFDLENBQUMsSUFBSSxDQUFDLENBQUMsRUFBRSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDO0VBQ3BELEtBQUssQ0FBQyxDQUFDLENBQUM7QUFDUjtFQUNBO0VBQ0EsSUFBSSxJQUFJLE1BQU0sR0FBRyxJQUFJLENBQUMsS0FBSyxDQUFDLE9BQU8sQ0FBQyxRQUFRLENBQUMsQ0FBQztBQUM5QztFQUNBLElBQUksSUFBSSxNQUFNLEVBQUUsSUFBSSxDQUFDLEtBQUssQ0FBQyxNQUFNLENBQUMsR0FBRyxZQUFZLENBQUM7QUFDbEQ7RUFDQTtFQUNBLElBQUksSUFBSSxNQUFNLEdBQUcsSUFBSSxDQUFDLEtBQUssQ0FBQyxPQUFPLENBQUMsWUFBWSxDQUFDLENBQUM7QUFDbEQ7RUFDQSxJQUFJLElBQUksTUFBTTtFQUNkLE1BQU0sSUFBSSxDQUFDLEtBQUssQ0FBQyxNQUFNLEdBQUcsQ0FBQyxDQUFDLEdBQUcsTUFBTSxDQUFDLFFBQVEsQ0FBQyxRQUFRLEdBQUcsSUFBSSxDQUFDLEtBQUssQ0FBQyxNQUFNLEdBQUcsQ0FBQyxDQUFDLENBQUM7QUFDakY7RUFDQTtFQUNBLElBQUksSUFBSSxPQUFPLFNBQVMsS0FBSyxXQUFXO0VBQ3hDLE1BQU0sU0FBUyxDQUFDLFVBQVUsQ0FBQyxHQUFHLENBQUMsQ0FBQztFQUNoQztBQUNBO0VBQ0EsSUFBSSxPQUFPLENBQUMsV0FBVyxFQUFFLEdBQUcsQ0FBQyxDQUFDO0VBQzlCLEdBQUc7QUFDSDtFQUNBO0VBQ0E7RUFDQTtFQUNBO0VBQ0E7RUFDQTtFQUNBLEVBQUUsSUFBSSxDQUFDLEdBQUcsRUFBRSxJQUFJLEVBQUU7RUFDbEIsSUFBSTtFQUNKLE1BQU0sT0FBTyxJQUFJLEtBQUssV0FBVztFQUNqQyxNQUFNLE9BQU8sSUFBSSxLQUFLLFdBQVc7RUFDakMsTUFBTSxDQUFDLElBQUksQ0FBQyxXQUFXLENBQUMsUUFBUSxDQUFDLE1BQU0sQ0FBQztFQUN4QztFQUNBLE1BQU0sT0FBTyxLQUFLLENBQUM7QUFDbkI7RUFDQSxJQUFJLElBQUksR0FBRyxHQUFHLElBQUksQ0FBQyxJQUFJLENBQUMsQ0FBQyxPQUFPLEtBQUssT0FBTyxDQUFDLGNBQWMsQ0FBQyxLQUFLLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQztBQUN4RTtFQUNBLElBQUksSUFBSSxLQUFLLEdBQUc7RUFDaEIsTUFBTSxnQkFBZ0IsRUFBRSxHQUFHO0VBQzNCLEtBQUssQ0FBQztBQUNOO0VBQ0E7RUFDQSxJQUFJLElBQUksQ0FBQyxLQUFLLENBQUMsR0FBRyxFQUFFLEdBQUcsQ0FBQyxLQUFLLENBQUMsR0FBRyxDQUFDLEVBQUUsS0FBSyxDQUFDLENBQUM7RUFDM0M7QUFDQTtFQUNBLElBQUksT0FBTyxDQUFDLE1BQU0sRUFBRSxLQUFLLENBQUMsR0FBRyxFQUFFLEdBQUcsQ0FBQyxLQUFLLENBQUMsR0FBRyxDQUFDLEVBQUUsS0FBSyxDQUFDLENBQUM7RUFDdEQsR0FBRztBQUNIO0VBQ0E7RUFDQTtFQUNBO0VBQ0E7RUFDQTtFQUNBO0VBQ0EsRUFBRSxRQUFRLENBQUMsR0FBRyxFQUFFLEdBQUcsRUFBRTtFQUNyQixJQUFJO0VBQ0osTUFBTSxPQUFPLElBQUksS0FBSyxXQUFXO0VBQ2pDLE1BQU0sT0FBTyxJQUFJLEtBQUssV0FBVztFQUNqQyxNQUFNLENBQUMsSUFBSSxDQUFDLFdBQVcsQ0FBQyxRQUFRLENBQUMsTUFBTSxDQUFDO0VBQ3hDO0VBQ0EsTUFBTSxPQUFPLEtBQUssQ0FBQztBQUNuQjtFQUNBLElBQUksSUFBSSxJQUFJLEdBQUc7RUFDZixNQUFNLFFBQVEsRUFBRSxHQUFHO0VBQ25CLE1BQU0sV0FBVyxFQUFFLEdBQUc7RUFDdEIsS0FBSyxDQUFDO0FBQ047RUFDQTtFQUNBLElBQUksSUFBSSxDQUFDLE9BQU8sRUFBRSxhQUFhLEVBQUUsSUFBSSxDQUFDLENBQUM7RUFDdkM7QUFDQTtFQUNBLElBQUksT0FBTyxDQUFDLE1BQU0sRUFBRSxLQUFLLENBQUMsR0FBRyxFQUFFLGFBQWEsRUFBRSxJQUFJLENBQUMsQ0FBQztFQUNwRCxHQUFHO0VBQ0gsQ0FBQztBQUNEO0VBQ0E7RUFDQSxLQUFLLENBQUMsUUFBUSxHQUFHLG9CQUFvQixDQUFDO0FBQ3RDO0VBQ0E7RUFDQSxLQUFLLENBQUMsR0FBRyxHQUFHLE9BQU8sQ0FBQztBQUNwQjtFQUNBO0VBQ0EsS0FBSyxDQUFDLFlBQVksR0FBRztFQUNyQixFQUFFLFdBQVc7RUFDYixFQUFFLE1BQU07RUFDUixDQUFDOztFQ2hMRCxJQUFJLEdBQUcsR0FDeUU7RUFDaEYsRUFBRSw0RkFBNEYsQ0FBQztBQUMvRjtFQUNBLElBQUksS0FBSyxDQUFDLGVBQWUsQ0FBQyxDQUFDO0VBQzNCLElBQUksTUFBTSxFQUFFLENBQUM7RUFDYixJQUFJLEtBQUssRUFBRSxDQUFDO0FBQ1o7RUFDQSxLQUFLLE1BQU0sQ0FBQyxRQUFRLENBQUMsUUFBUSxDQUFDLE9BQU8sQ0FBQyxXQUFXLENBQUMsSUFBSSxDQUFDO0VBQ3ZELEVBQUUsT0FBTyxDQUFDLEdBQUcsQ0FBQyxDQUFDO0FBQ2Y7RUFDQSxLQUFLLE1BQU0sQ0FBQyxRQUFRLENBQUMsUUFBUSxDQUFDLE9BQU8sQ0FBQyxNQUFNLENBQUMsSUFBSSxDQUFDO0VBQ2xELEVBQUUsV0FBVyxFQUFFLENBQUM7QUFDaEI7RUFDQSxLQUFLLE1BQU0sQ0FBQyxRQUFRLENBQUMsUUFBUSxDQUFDLE9BQU8sQ0FBQyxpQkFBaUIsQ0FBQyxJQUFJLENBQUM7RUFDN0QsRUFBRSxlQUFlLEVBQUUsQ0FBQztBQUNwQjtFQUNBLEtBQUssTUFBTSxDQUFDLFFBQVEsQ0FBQyxRQUFRLENBQUMsT0FBTyxDQUFDLGlCQUFpQixDQUFDLElBQUksQ0FBQztFQUM3RCxFQUFFLGNBQWMsRUFBRSxDQUFDO0FBQ25CO0VBQ0EsS0FBSyxNQUFNLENBQUMsUUFBUSxDQUFDLFFBQVEsQ0FBQyxPQUFPLENBQUMsaUJBQWlCLENBQUMsSUFBSSxDQUFDO0VBQzdELEVBQUUsY0FBYyxFQUFFLENBQUM7QUFDbkI7RUFDQTtFQUNBLElBQUksU0FBUyxHQUFHLENBQUMsQ0FBQyxNQUFNLENBQUMsQ0FBQyxJQUFJLENBQUMsa0JBQWtCLENBQUMsQ0FBQztBQUNuRDtFQUNBLFNBQVMsQ0FBQyxJQUFJLENBQUMsV0FBVztFQUMxQixFQUFFLElBQUksTUFBTSxHQUFHLENBQUMsQ0FBQyxJQUFJLENBQUMsQ0FBQztFQUN2QixFQUFFLElBQUksSUFBSSxHQUFHLENBQUMsQ0FBQyxJQUFJLENBQUMsQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLENBQUMsT0FBTyxDQUFDLFdBQVcsRUFBRSxFQUFFLENBQUMsQ0FBQztBQUN6RDtFQUNBLEVBQUUsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxHQUFHLEdBQUcsSUFBSSxHQUFHLEtBQUssRUFBRSxTQUFTLElBQUksRUFBRTtFQUMzQyxJQUFJLElBQUksU0FBUyxHQUFHLElBQUksUUFBUSxDQUFDLFNBQVMsQ0FBQyxDQUFDLE1BQU0sRUFBRSxJQUFJLENBQUMsQ0FBQyxDQUFDO0VBQzNELElBQUksSUFBSSxJQUFJLFFBQVEsU0FBUyxDQUFDLFFBQVEsQ0FBQyxJQUFJLENBQUMsQ0FBQztBQUM3QztFQUNBLElBQUksTUFBTSxDQUFDLE1BQU0sQ0FBQyxJQUFJLENBQUM7RUFDdkIsT0FBTyxJQUFJLEVBQUU7RUFDYixPQUFPLE1BQU0sQ0FBQyxHQUFHLEVBQUM7QUFDbEI7RUFDQSxHQUFHLEVBQUUsTUFBTSxFQUFDO0VBQ1osQ0FBQyxDQUFDOzs7Ozs7In0=
=======
	var
		version = "3.5.1",

		// Define a local copy of jQuery
		jQuery = function( selector, context ) {

			// The jQuery object is actually just the init constructor 'enhanced'
			// Need init if jQuery is called (just allow error to be thrown if not included)
			return new jQuery.fn.init( selector, context );
		};

	jQuery.fn = jQuery.prototype = {

		// The current version of jQuery being used
		jquery: version,

		constructor: jQuery,

		// The default length of a jQuery object is 0
		length: 0,

		toArray: function() {
			return slice.call( this );
		},

		// Get the Nth element in the matched element set OR
		// Get the whole matched element set as a clean array
		get: function( num ) {

			// Return all the elements in a clean array
			if ( num == null ) {
				return slice.call( this );
			}

			// Return just the one element from the set
			return num < 0 ? this[ num + this.length ] : this[ num ];
		},

		// Take an array of elements and push it onto the stack
		// (returning the new matched element set)
		pushStack: function( elems ) {

			// Build a new jQuery matched element set
			var ret = jQuery.merge( this.constructor(), elems );

			// Add the old object onto the stack (as a reference)
			ret.prevObject = this;

			// Return the newly-formed element set
			return ret;
		},

		// Execute a callback for every element in the matched set.
		each: function( callback ) {
			return jQuery.each( this, callback );
		},

		map: function( callback ) {
			return this.pushStack( jQuery.map( this, function( elem, i ) {
				return callback.call( elem, i, elem );
			} ) );
		},

		slice: function() {
			return this.pushStack( slice.apply( this, arguments ) );
		},

		first: function() {
			return this.eq( 0 );
		},

		last: function() {
			return this.eq( -1 );
		},

		even: function() {
			return this.pushStack( jQuery.grep( this, function( _elem, i ) {
				return ( i + 1 ) % 2;
			} ) );
		},

		odd: function() {
			return this.pushStack( jQuery.grep( this, function( _elem, i ) {
				return i % 2;
			} ) );
		},

		eq: function( i ) {
			var len = this.length,
				j = +i + ( i < 0 ? len : 0 );
			return this.pushStack( j >= 0 && j < len ? [ this[ j ] ] : [] );
		},

		end: function() {
			return this.prevObject || this.constructor();
		},

		// For internal use only.
		// Behaves like an Array's method, not like a jQuery method.
		push: push,
		sort: arr.sort,
		splice: arr.splice
	};

	jQuery.extend = jQuery.fn.extend = function() {
		var options, name, src, copy, copyIsArray, clone,
			target = arguments[ 0 ] || {},
			i = 1,
			length = arguments.length,
			deep = false;

		// Handle a deep copy situation
		if ( typeof target === "boolean" ) {
			deep = target;

			// Skip the boolean and the target
			target = arguments[ i ] || {};
			i++;
		}

		// Handle case when target is a string or something (possible in deep copy)
		if ( typeof target !== "object" && !isFunction( target ) ) {
			target = {};
		}

		// Extend jQuery itself if only one argument is passed
		if ( i === length ) {
			target = this;
			i--;
		}

		for ( ; i < length; i++ ) {

			// Only deal with non-null/undefined values
			if ( ( options = arguments[ i ] ) != null ) {

				// Extend the base object
				for ( name in options ) {
					copy = options[ name ];

					// Prevent Object.prototype pollution
					// Prevent never-ending loop
					if ( name === "__proto__" || target === copy ) {
						continue;
					}

					// Recurse if we're merging plain objects or arrays
					if ( deep && copy && ( jQuery.isPlainObject( copy ) ||
						( copyIsArray = Array.isArray( copy ) ) ) ) {
						src = target[ name ];

						// Ensure proper type for the source value
						if ( copyIsArray && !Array.isArray( src ) ) {
							clone = [];
						} else if ( !copyIsArray && !jQuery.isPlainObject( src ) ) {
							clone = {};
						} else {
							clone = src;
						}
						copyIsArray = false;

						// Never move original objects, clone them
						target[ name ] = jQuery.extend( deep, clone, copy );

					// Don't bring in undefined values
					} else if ( copy !== undefined ) {
						target[ name ] = copy;
					}
				}
			}
		}

		// Return the modified object
		return target;
	};

	jQuery.extend( {

		// Unique for each copy of jQuery on the page
		expando: "jQuery" + ( version + Math.random() ).replace( /\D/g, "" ),

		// Assume jQuery is ready without the ready module
		isReady: true,

		error: function( msg ) {
			throw new Error( msg );
		},

		noop: function() {},

		isPlainObject: function( obj ) {
			var proto, Ctor;

			// Detect obvious negatives
			// Use toString instead of jQuery.type to catch host objects
			if ( !obj || toString.call( obj ) !== "[object Object]" ) {
				return false;
			}

			proto = getProto( obj );

			// Objects with no prototype (e.g., `Object.create( null )`) are plain
			if ( !proto ) {
				return true;
			}

			// Objects with prototype are plain iff they were constructed by a global Object function
			Ctor = hasOwn.call( proto, "constructor" ) && proto.constructor;
			return typeof Ctor === "function" && fnToString.call( Ctor ) === ObjectFunctionString;
		},

		isEmptyObject: function( obj ) {
			var name;

			for ( name in obj ) {
				return false;
			}
			return true;
		},

		// Evaluates a script in a provided context; falls back to the global one
		// if not specified.
		globalEval: function( code, options, doc ) {
			DOMEval( code, { nonce: options && options.nonce }, doc );
		},

		each: function( obj, callback ) {
			var length, i = 0;

			if ( isArrayLike( obj ) ) {
				length = obj.length;
				for ( ; i < length; i++ ) {
					if ( callback.call( obj[ i ], i, obj[ i ] ) === false ) {
						break;
					}
				}
			} else {
				for ( i in obj ) {
					if ( callback.call( obj[ i ], i, obj[ i ] ) === false ) {
						break;
					}
				}
			}

			return obj;
		},

		// results is for internal usage only
		makeArray: function( arr, results ) {
			var ret = results || [];

			if ( arr != null ) {
				if ( isArrayLike( Object( arr ) ) ) {
					jQuery.merge( ret,
						typeof arr === "string" ?
						[ arr ] : arr
					);
				} else {
					push.call( ret, arr );
				}
			}

			return ret;
		},

		inArray: function( elem, arr, i ) {
			return arr == null ? -1 : indexOf.call( arr, elem, i );
		},

		// Support: Android <=4.0 only, PhantomJS 1 only
		// push.apply(_, arraylike) throws on ancient WebKit
		merge: function( first, second ) {
			var len = +second.length,
				j = 0,
				i = first.length;

			for ( ; j < len; j++ ) {
				first[ i++ ] = second[ j ];
			}

			first.length = i;

			return first;
		},

		grep: function( elems, callback, invert ) {
			var callbackInverse,
				matches = [],
				i = 0,
				length = elems.length,
				callbackExpect = !invert;

			// Go through the array, only saving the items
			// that pass the validator function
			for ( ; i < length; i++ ) {
				callbackInverse = !callback( elems[ i ], i );
				if ( callbackInverse !== callbackExpect ) {
					matches.push( elems[ i ] );
				}
			}

			return matches;
		},

		// arg is for internal usage only
		map: function( elems, callback, arg ) {
			var length, value,
				i = 0,
				ret = [];

			// Go through the array, translating each of the items to their new values
			if ( isArrayLike( elems ) ) {
				length = elems.length;
				for ( ; i < length; i++ ) {
					value = callback( elems[ i ], i, arg );

					if ( value != null ) {
						ret.push( value );
					}
				}

			// Go through every key on the object,
			} else {
				for ( i in elems ) {
					value = callback( elems[ i ], i, arg );

					if ( value != null ) {
						ret.push( value );
					}
				}
			}

			// Flatten any nested arrays
			return flat( ret );
		},

		// A global GUID counter for objects
		guid: 1,

		// jQuery.support is not used in Core but other projects attach their
		// properties to it so it needs to exist.
		support: support
	} );

	if ( typeof Symbol === "function" ) {
		jQuery.fn[ Symbol.iterator ] = arr[ Symbol.iterator ];
	}

	// Populate the class2type map
	jQuery.each( "Boolean Number String Function Array Date RegExp Object Error Symbol".split( " " ),
	function( _i, name ) {
		class2type[ "[object " + name + "]" ] = name.toLowerCase();
	} );

	function isArrayLike( obj ) {

		// Support: real iOS 8.2 only (not reproducible in simulator)
		// `in` check used to prevent JIT error (gh-2145)
		// hasOwn isn't used here due to false negatives
		// regarding Nodelist length in IE
		var length = !!obj && "length" in obj && obj.length,
			type = toType( obj );

		if ( isFunction( obj ) || isWindow( obj ) ) {
			return false;
		}

		return type === "array" || length === 0 ||
			typeof length === "number" && length > 0 && ( length - 1 ) in obj;
	}
	var Sizzle =
	/*!
	 * Sizzle CSS Selector Engine v2.3.5
	 * https://sizzlejs.com/
	 *
	 * Copyright JS Foundation and other contributors
	 * Released under the MIT license
	 * https://js.foundation/
	 *
	 * Date: 2020-03-14
	 */
	( function( window ) {
	var i,
		support,
		Expr,
		getText,
		isXML,
		tokenize,
		compile,
		select,
		outermostContext,
		sortInput,
		hasDuplicate,

		// Local document vars
		setDocument,
		document,
		docElem,
		documentIsHTML,
		rbuggyQSA,
		rbuggyMatches,
		matches,
		contains,

		// Instance-specific data
		expando = "sizzle" + 1 * new Date(),
		preferredDoc = window.document,
		dirruns = 0,
		done = 0,
		classCache = createCache(),
		tokenCache = createCache(),
		compilerCache = createCache(),
		nonnativeSelectorCache = createCache(),
		sortOrder = function( a, b ) {
			if ( a === b ) {
				hasDuplicate = true;
			}
			return 0;
		},

		// Instance methods
		hasOwn = ( {} ).hasOwnProperty,
		arr = [],
		pop = arr.pop,
		pushNative = arr.push,
		push = arr.push,
		slice = arr.slice,

		// Use a stripped-down indexOf as it's faster than native
		// https://jsperf.com/thor-indexof-vs-for/5
		indexOf = function( list, elem ) {
			var i = 0,
				len = list.length;
			for ( ; i < len; i++ ) {
				if ( list[ i ] === elem ) {
					return i;
				}
			}
			return -1;
		},

		booleans = "checked|selected|async|autofocus|autoplay|controls|defer|disabled|hidden|" +
			"ismap|loop|multiple|open|readonly|required|scoped",

		// Regular expressions

		// http://www.w3.org/TR/css3-selectors/#whitespace
		whitespace = "[\\x20\\t\\r\\n\\f]",

		// https://www.w3.org/TR/css-syntax-3/#ident-token-diagram
		identifier = "(?:\\\\[\\da-fA-F]{1,6}" + whitespace +
			"?|\\\\[^\\r\\n\\f]|[\\w-]|[^\0-\\x7f])+",

		// Attribute selectors: http://www.w3.org/TR/selectors/#attribute-selectors
		attributes = "\\[" + whitespace + "*(" + identifier + ")(?:" + whitespace +

			// Operator (capture 2)
			"*([*^$|!~]?=)" + whitespace +

			// "Attribute values must be CSS identifiers [capture 5]
			// or strings [capture 3 or capture 4]"
			"*(?:'((?:\\\\.|[^\\\\'])*)'|\"((?:\\\\.|[^\\\\\"])*)\"|(" + identifier + "))|)" +
			whitespace + "*\\]",

		pseudos = ":(" + identifier + ")(?:\\((" +

			// To reduce the number of selectors needing tokenize in the preFilter, prefer arguments:
			// 1. quoted (capture 3; capture 4 or capture 5)
			"('((?:\\\\.|[^\\\\'])*)'|\"((?:\\\\.|[^\\\\\"])*)\")|" +

			// 2. simple (capture 6)
			"((?:\\\\.|[^\\\\()[\\]]|" + attributes + ")*)|" +

			// 3. anything else (capture 2)
			".*" +
			")\\)|)",

		// Leading and non-escaped trailing whitespace, capturing some non-whitespace characters preceding the latter
		rwhitespace = new RegExp( whitespace + "+", "g" ),
		rtrim = new RegExp( "^" + whitespace + "+|((?:^|[^\\\\])(?:\\\\.)*)" +
			whitespace + "+$", "g" ),

		rcomma = new RegExp( "^" + whitespace + "*," + whitespace + "*" ),
		rcombinators = new RegExp( "^" + whitespace + "*([>+~]|" + whitespace + ")" + whitespace +
			"*" ),
		rdescend = new RegExp( whitespace + "|>" ),

		rpseudo = new RegExp( pseudos ),
		ridentifier = new RegExp( "^" + identifier + "$" ),

		matchExpr = {
			"ID": new RegExp( "^#(" + identifier + ")" ),
			"CLASS": new RegExp( "^\\.(" + identifier + ")" ),
			"TAG": new RegExp( "^(" + identifier + "|[*])" ),
			"ATTR": new RegExp( "^" + attributes ),
			"PSEUDO": new RegExp( "^" + pseudos ),
			"CHILD": new RegExp( "^:(only|first|last|nth|nth-last)-(child|of-type)(?:\\(" +
				whitespace + "*(even|odd|(([+-]|)(\\d*)n|)" + whitespace + "*(?:([+-]|)" +
				whitespace + "*(\\d+)|))" + whitespace + "*\\)|)", "i" ),
			"bool": new RegExp( "^(?:" + booleans + ")$", "i" ),

			// For use in libraries implementing .is()
			// We use this for POS matching in `select`
			"needsContext": new RegExp( "^" + whitespace +
				"*[>+~]|:(even|odd|eq|gt|lt|nth|first|last)(?:\\(" + whitespace +
				"*((?:-\\d)?\\d*)" + whitespace + "*\\)|)(?=[^-]|$)", "i" )
		},

		rhtml = /HTML$/i,
		rinputs = /^(?:input|select|textarea|button)$/i,
		rheader = /^h\d$/i,

		rnative = /^[^{]+\{\s*\[native \w/,

		// Easily-parseable/retrievable ID or TAG or CLASS selectors
		rquickExpr = /^(?:#([\w-]+)|(\w+)|\.([\w-]+))$/,

		rsibling = /[+~]/,

		// CSS escapes
		// http://www.w3.org/TR/CSS21/syndata.html#escaped-characters
		runescape = new RegExp( "\\\\[\\da-fA-F]{1,6}" + whitespace + "?|\\\\([^\\r\\n\\f])", "g" ),
		funescape = function( escape, nonHex ) {
			var high = "0x" + escape.slice( 1 ) - 0x10000;

			return nonHex ?

				// Strip the backslash prefix from a non-hex escape sequence
				nonHex :

				// Replace a hexadecimal escape sequence with the encoded Unicode code point
				// Support: IE <=11+
				// For values outside the Basic Multilingual Plane (BMP), manually construct a
				// surrogate pair
				high < 0 ?
					String.fromCharCode( high + 0x10000 ) :
					String.fromCharCode( high >> 10 | 0xD800, high & 0x3FF | 0xDC00 );
		},

		// CSS string/identifier serialization
		// https://drafts.csswg.org/cssom/#common-serializing-idioms
		rcssescape = /([\0-\x1f\x7f]|^-?\d)|^-$|[^\0-\x1f\x7f-\uFFFF\w-]/g,
		fcssescape = function( ch, asCodePoint ) {
			if ( asCodePoint ) {

				// U+0000 NULL becomes U+FFFD REPLACEMENT CHARACTER
				if ( ch === "\0" ) {
					return "\uFFFD";
				}

				// Control characters and (dependent upon position) numbers get escaped as code points
				return ch.slice( 0, -1 ) + "\\" +
					ch.charCodeAt( ch.length - 1 ).toString( 16 ) + " ";
			}

			// Other potentially-special ASCII characters get backslash-escaped
			return "\\" + ch;
		},

		// Used for iframes
		// See setDocument()
		// Removing the function wrapper causes a "Permission Denied"
		// error in IE
		unloadHandler = function() {
			setDocument();
		},

		inDisabledFieldset = addCombinator(
			function( elem ) {
				return elem.disabled === true && elem.nodeName.toLowerCase() === "fieldset";
			},
			{ dir: "parentNode", next: "legend" }
		);

	// Optimize for push.apply( _, NodeList )
	try {
		push.apply(
			( arr = slice.call( preferredDoc.childNodes ) ),
			preferredDoc.childNodes
		);

		// Support: Android<4.0
		// Detect silently failing push.apply
		// eslint-disable-next-line no-unused-expressions
		arr[ preferredDoc.childNodes.length ].nodeType;
	} catch ( e ) {
		push = { apply: arr.length ?

			// Leverage slice if possible
			function( target, els ) {
				pushNative.apply( target, slice.call( els ) );
			} :

			// Support: IE<9
			// Otherwise append directly
			function( target, els ) {
				var j = target.length,
					i = 0;

				// Can't trust NodeList.length
				while ( ( target[ j++ ] = els[ i++ ] ) ) {}
				target.length = j - 1;
			}
		};
	}

	function Sizzle( selector, context, results, seed ) {
		var m, i, elem, nid, match, groups, newSelector,
			newContext = context && context.ownerDocument,

			// nodeType defaults to 9, since context defaults to document
			nodeType = context ? context.nodeType : 9;

		results = results || [];

		// Return early from calls with invalid selector or context
		if ( typeof selector !== "string" || !selector ||
			nodeType !== 1 && nodeType !== 9 && nodeType !== 11 ) {

			return results;
		}

		// Try to shortcut find operations (as opposed to filters) in HTML documents
		if ( !seed ) {
			setDocument( context );
			context = context || document;

			if ( documentIsHTML ) {

				// If the selector is sufficiently simple, try using a "get*By*" DOM method
				// (excepting DocumentFragment context, where the methods don't exist)
				if ( nodeType !== 11 && ( match = rquickExpr.exec( selector ) ) ) {

					// ID selector
					if ( ( m = match[ 1 ] ) ) {

						// Document context
						if ( nodeType === 9 ) {
							if ( ( elem = context.getElementById( m ) ) ) {

								// Support: IE, Opera, Webkit
								// TODO: identify versions
								// getElementById can match elements by name instead of ID
								if ( elem.id === m ) {
									results.push( elem );
									return results;
								}
							} else {
								return results;
							}

						// Element context
						} else {

							// Support: IE, Opera, Webkit
							// TODO: identify versions
							// getElementById can match elements by name instead of ID
							if ( newContext && ( elem = newContext.getElementById( m ) ) &&
								contains( context, elem ) &&
								elem.id === m ) {

								results.push( elem );
								return results;
							}
						}

					// Type selector
					} else if ( match[ 2 ] ) {
						push.apply( results, context.getElementsByTagName( selector ) );
						return results;

					// Class selector
					} else if ( ( m = match[ 3 ] ) && support.getElementsByClassName &&
						context.getElementsByClassName ) {

						push.apply( results, context.getElementsByClassName( m ) );
						return results;
					}
				}

				// Take advantage of querySelectorAll
				if ( support.qsa &&
					!nonnativeSelectorCache[ selector + " " ] &&
					( !rbuggyQSA || !rbuggyQSA.test( selector ) ) &&

					// Support: IE 8 only
					// Exclude object elements
					( nodeType !== 1 || context.nodeName.toLowerCase() !== "object" ) ) {

					newSelector = selector;
					newContext = context;

					// qSA considers elements outside a scoping root when evaluating child or
					// descendant combinators, which is not what we want.
					// In such cases, we work around the behavior by prefixing every selector in the
					// list with an ID selector referencing the scope context.
					// The technique has to be used as well when a leading combinator is used
					// as such selectors are not recognized by querySelectorAll.
					// Thanks to Andrew Dupont for this technique.
					if ( nodeType === 1 &&
						( rdescend.test( selector ) || rcombinators.test( selector ) ) ) {

						// Expand context for sibling selectors
						newContext = rsibling.test( selector ) && testContext( context.parentNode ) ||
							context;

						// We can use :scope instead of the ID hack if the browser
						// supports it & if we're not changing the context.
						if ( newContext !== context || !support.scope ) {

							// Capture the context ID, setting it first if necessary
							if ( ( nid = context.getAttribute( "id" ) ) ) {
								nid = nid.replace( rcssescape, fcssescape );
							} else {
								context.setAttribute( "id", ( nid = expando ) );
							}
						}

						// Prefix every selector in the list
						groups = tokenize( selector );
						i = groups.length;
						while ( i-- ) {
							groups[ i ] = ( nid ? "#" + nid : ":scope" ) + " " +
								toSelector( groups[ i ] );
						}
						newSelector = groups.join( "," );
					}

					try {
						push.apply( results,
							newContext.querySelectorAll( newSelector )
						);
						return results;
					} catch ( qsaError ) {
						nonnativeSelectorCache( selector, true );
					} finally {
						if ( nid === expando ) {
							context.removeAttribute( "id" );
						}
					}
				}
			}
		}

		// All others
		return select( selector.replace( rtrim, "$1" ), context, results, seed );
	}

	/**
	 * Create key-value caches of limited size
	 * @returns {function(string, object)} Returns the Object data after storing it on itself with
	 *	property name the (space-suffixed) string and (if the cache is larger than Expr.cacheLength)
	 *	deleting the oldest entry
	 */
	function createCache() {
		var keys = [];

		function cache( key, value ) {

			// Use (key + " ") to avoid collision with native prototype properties (see Issue #157)
			if ( keys.push( key + " " ) > Expr.cacheLength ) {

				// Only keep the most recent entries
				delete cache[ keys.shift() ];
			}
			return ( cache[ key + " " ] = value );
		}
		return cache;
	}

	/**
	 * Mark a function for special use by Sizzle
	 * @param {Function} fn The function to mark
	 */
	function markFunction( fn ) {
		fn[ expando ] = true;
		return fn;
	}

	/**
	 * Support testing using an element
	 * @param {Function} fn Passed the created element and returns a boolean result
	 */
	function assert( fn ) {
		var el = document.createElement( "fieldset" );

		try {
			return !!fn( el );
		} catch ( e ) {
			return false;
		} finally {

			// Remove from its parent by default
			if ( el.parentNode ) {
				el.parentNode.removeChild( el );
			}

			// release memory in IE
			el = null;
		}
	}

	/**
	 * Adds the same handler for all of the specified attrs
	 * @param {String} attrs Pipe-separated list of attributes
	 * @param {Function} handler The method that will be applied
	 */
	function addHandle( attrs, handler ) {
		var arr = attrs.split( "|" ),
			i = arr.length;

		while ( i-- ) {
			Expr.attrHandle[ arr[ i ] ] = handler;
		}
	}

	/**
	 * Checks document order of two siblings
	 * @param {Element} a
	 * @param {Element} b
	 * @returns {Number} Returns less than 0 if a precedes b, greater than 0 if a follows b
	 */
	function siblingCheck( a, b ) {
		var cur = b && a,
			diff = cur && a.nodeType === 1 && b.nodeType === 1 &&
				a.sourceIndex - b.sourceIndex;

		// Use IE sourceIndex if available on both nodes
		if ( diff ) {
			return diff;
		}

		// Check if b follows a
		if ( cur ) {
			while ( ( cur = cur.nextSibling ) ) {
				if ( cur === b ) {
					return -1;
				}
			}
		}

		return a ? 1 : -1;
	}

	/**
	 * Returns a function to use in pseudos for input types
	 * @param {String} type
	 */
	function createInputPseudo( type ) {
		return function( elem ) {
			var name = elem.nodeName.toLowerCase();
			return name === "input" && elem.type === type;
		};
	}

	/**
	 * Returns a function to use in pseudos for buttons
	 * @param {String} type
	 */
	function createButtonPseudo( type ) {
		return function( elem ) {
			var name = elem.nodeName.toLowerCase();
			return ( name === "input" || name === "button" ) && elem.type === type;
		};
	}

	/**
	 * Returns a function to use in pseudos for :enabled/:disabled
	 * @param {Boolean} disabled true for :disabled; false for :enabled
	 */
	function createDisabledPseudo( disabled ) {

		// Known :disabled false positives: fieldset[disabled] > legend:nth-of-type(n+2) :can-disable
		return function( elem ) {

			// Only certain elements can match :enabled or :disabled
			// https://html.spec.whatwg.org/multipage/scripting.html#selector-enabled
			// https://html.spec.whatwg.org/multipage/scripting.html#selector-disabled
			if ( "form" in elem ) {

				// Check for inherited disabledness on relevant non-disabled elements:
				// * listed form-associated elements in a disabled fieldset
				//   https://html.spec.whatwg.org/multipage/forms.html#category-listed
				//   https://html.spec.whatwg.org/multipage/forms.html#concept-fe-disabled
				// * option elements in a disabled optgroup
				//   https://html.spec.whatwg.org/multipage/forms.html#concept-option-disabled
				// All such elements have a "form" property.
				if ( elem.parentNode && elem.disabled === false ) {

					// Option elements defer to a parent optgroup if present
					if ( "label" in elem ) {
						if ( "label" in elem.parentNode ) {
							return elem.parentNode.disabled === disabled;
						} else {
							return elem.disabled === disabled;
						}
					}

					// Support: IE 6 - 11
					// Use the isDisabled shortcut property to check for disabled fieldset ancestors
					return elem.isDisabled === disabled ||

						// Where there is no isDisabled, check manually
						/* jshint -W018 */
						elem.isDisabled !== !disabled &&
						inDisabledFieldset( elem ) === disabled;
				}

				return elem.disabled === disabled;

			// Try to winnow out elements that can't be disabled before trusting the disabled property.
			// Some victims get caught in our net (label, legend, menu, track), but it shouldn't
			// even exist on them, let alone have a boolean value.
			} else if ( "label" in elem ) {
				return elem.disabled === disabled;
			}

			// Remaining elements are neither :enabled nor :disabled
			return false;
		};
	}

	/**
	 * Returns a function to use in pseudos for positionals
	 * @param {Function} fn
	 */
	function createPositionalPseudo( fn ) {
		return markFunction( function( argument ) {
			argument = +argument;
			return markFunction( function( seed, matches ) {
				var j,
					matchIndexes = fn( [], seed.length, argument ),
					i = matchIndexes.length;

				// Match elements found at the specified indexes
				while ( i-- ) {
					if ( seed[ ( j = matchIndexes[ i ] ) ] ) {
						seed[ j ] = !( matches[ j ] = seed[ j ] );
					}
				}
			} );
		} );
	}

	/**
	 * Checks a node for validity as a Sizzle context
	 * @param {Element|Object=} context
	 * @returns {Element|Object|Boolean} The input node if acceptable, otherwise a falsy value
	 */
	function testContext( context ) {
		return context && typeof context.getElementsByTagName !== "undefined" && context;
	}

	// Expose support vars for convenience
	support = Sizzle.support = {};

	/**
	 * Detects XML nodes
	 * @param {Element|Object} elem An element or a document
	 * @returns {Boolean} True iff elem is a non-HTML XML node
	 */
	isXML = Sizzle.isXML = function( elem ) {
		var namespace = elem.namespaceURI,
			docElem = ( elem.ownerDocument || elem ).documentElement;

		// Support: IE <=8
		// Assume HTML when documentElement doesn't yet exist, such as inside loading iframes
		// https://bugs.jquery.com/ticket/4833
		return !rhtml.test( namespace || docElem && docElem.nodeName || "HTML" );
	};

	/**
	 * Sets document-related variables once based on the current document
	 * @param {Element|Object} [doc] An element or document object to use to set the document
	 * @returns {Object} Returns the current document
	 */
	setDocument = Sizzle.setDocument = function( node ) {
		var hasCompare, subWindow,
			doc = node ? node.ownerDocument || node : preferredDoc;

		// Return early if doc is invalid or already selected
		// Support: IE 11+, Edge 17 - 18+
		// IE/Edge sometimes throw a "Permission denied" error when strict-comparing
		// two documents; shallow comparisons work.
		// eslint-disable-next-line eqeqeq
		if ( doc == document || doc.nodeType !== 9 || !doc.documentElement ) {
			return document;
		}

		// Update global variables
		document = doc;
		docElem = document.documentElement;
		documentIsHTML = !isXML( document );

		// Support: IE 9 - 11+, Edge 12 - 18+
		// Accessing iframe documents after unload throws "permission denied" errors (jQuery #13936)
		// Support: IE 11+, Edge 17 - 18+
		// IE/Edge sometimes throw a "Permission denied" error when strict-comparing
		// two documents; shallow comparisons work.
		// eslint-disable-next-line eqeqeq
		if ( preferredDoc != document &&
			( subWindow = document.defaultView ) && subWindow.top !== subWindow ) {

			// Support: IE 11, Edge
			if ( subWindow.addEventListener ) {
				subWindow.addEventListener( "unload", unloadHandler, false );

			// Support: IE 9 - 10 only
			} else if ( subWindow.attachEvent ) {
				subWindow.attachEvent( "onunload", unloadHandler );
			}
		}

		// Support: IE 8 - 11+, Edge 12 - 18+, Chrome <=16 - 25 only, Firefox <=3.6 - 31 only,
		// Safari 4 - 5 only, Opera <=11.6 - 12.x only
		// IE/Edge & older browsers don't support the :scope pseudo-class.
		// Support: Safari 6.0 only
		// Safari 6.0 supports :scope but it's an alias of :root there.
		support.scope = assert( function( el ) {
			docElem.appendChild( el ).appendChild( document.createElement( "div" ) );
			return typeof el.querySelectorAll !== "undefined" &&
				!el.querySelectorAll( ":scope fieldset div" ).length;
		} );

		/* Attributes
		---------------------------------------------------------------------- */

		// Support: IE<8
		// Verify that getAttribute really returns attributes and not properties
		// (excepting IE8 booleans)
		support.attributes = assert( function( el ) {
			el.className = "i";
			return !el.getAttribute( "className" );
		} );

		/* getElement(s)By*
		---------------------------------------------------------------------- */

		// Check if getElementsByTagName("*") returns only elements
		support.getElementsByTagName = assert( function( el ) {
			el.appendChild( document.createComment( "" ) );
			return !el.getElementsByTagName( "*" ).length;
		} );

		// Support: IE<9
		support.getElementsByClassName = rnative.test( document.getElementsByClassName );

		// Support: IE<10
		// Check if getElementById returns elements by name
		// The broken getElementById methods don't pick up programmatically-set names,
		// so use a roundabout getElementsByName test
		support.getById = assert( function( el ) {
			docElem.appendChild( el ).id = expando;
			return !document.getElementsByName || !document.getElementsByName( expando ).length;
		} );

		// ID filter and find
		if ( support.getById ) {
			Expr.filter[ "ID" ] = function( id ) {
				var attrId = id.replace( runescape, funescape );
				return function( elem ) {
					return elem.getAttribute( "id" ) === attrId;
				};
			};
			Expr.find[ "ID" ] = function( id, context ) {
				if ( typeof context.getElementById !== "undefined" && documentIsHTML ) {
					var elem = context.getElementById( id );
					return elem ? [ elem ] : [];
				}
			};
		} else {
			Expr.filter[ "ID" ] =  function( id ) {
				var attrId = id.replace( runescape, funescape );
				return function( elem ) {
					var node = typeof elem.getAttributeNode !== "undefined" &&
						elem.getAttributeNode( "id" );
					return node && node.value === attrId;
				};
			};

			// Support: IE 6 - 7 only
			// getElementById is not reliable as a find shortcut
			Expr.find[ "ID" ] = function( id, context ) {
				if ( typeof context.getElementById !== "undefined" && documentIsHTML ) {
					var node, i, elems,
						elem = context.getElementById( id );

					if ( elem ) {

						// Verify the id attribute
						node = elem.getAttributeNode( "id" );
						if ( node && node.value === id ) {
							return [ elem ];
						}

						// Fall back on getElementsByName
						elems = context.getElementsByName( id );
						i = 0;
						while ( ( elem = elems[ i++ ] ) ) {
							node = elem.getAttributeNode( "id" );
							if ( node && node.value === id ) {
								return [ elem ];
							}
						}
					}

					return [];
				}
			};
		}

		// Tag
		Expr.find[ "TAG" ] = support.getElementsByTagName ?
			function( tag, context ) {
				if ( typeof context.getElementsByTagName !== "undefined" ) {
					return context.getElementsByTagName( tag );

				// DocumentFragment nodes don't have gEBTN
				} else if ( support.qsa ) {
					return context.querySelectorAll( tag );
				}
			} :

			function( tag, context ) {
				var elem,
					tmp = [],
					i = 0,

					// By happy coincidence, a (broken) gEBTN appears on DocumentFragment nodes too
					results = context.getElementsByTagName( tag );

				// Filter out possible comments
				if ( tag === "*" ) {
					while ( ( elem = results[ i++ ] ) ) {
						if ( elem.nodeType === 1 ) {
							tmp.push( elem );
						}
					}

					return tmp;
				}
				return results;
			};

		// Class
		Expr.find[ "CLASS" ] = support.getElementsByClassName && function( className, context ) {
			if ( typeof context.getElementsByClassName !== "undefined" && documentIsHTML ) {
				return context.getElementsByClassName( className );
			}
		};

		/* QSA/matchesSelector
		---------------------------------------------------------------------- */

		// QSA and matchesSelector support

		// matchesSelector(:active) reports false when true (IE9/Opera 11.5)
		rbuggyMatches = [];

		// qSa(:focus) reports false when true (Chrome 21)
		// We allow this because of a bug in IE8/9 that throws an error
		// whenever `document.activeElement` is accessed on an iframe
		// So, we allow :focus to pass through QSA all the time to avoid the IE error
		// See https://bugs.jquery.com/ticket/13378
		rbuggyQSA = [];

		if ( ( support.qsa = rnative.test( document.querySelectorAll ) ) ) {

			// Build QSA regex
			// Regex strategy adopted from Diego Perini
			assert( function( el ) {

				var input;

				// Select is set to empty string on purpose
				// This is to test IE's treatment of not explicitly
				// setting a boolean content attribute,
				// since its presence should be enough
				// https://bugs.jquery.com/ticket/12359
				docElem.appendChild( el ).innerHTML = "<a id='" + expando + "'></a>" +
					"<select id='" + expando + "-\r\\' msallowcapture=''>" +
					"<option selected=''></option></select>";

				// Support: IE8, Opera 11-12.16
				// Nothing should be selected when empty strings follow ^= or $= or *=
				// The test attribute must be unknown in Opera but "safe" for WinRT
				// https://msdn.microsoft.com/en-us/library/ie/hh465388.aspx#attribute_section
				if ( el.querySelectorAll( "[msallowcapture^='']" ).length ) {
					rbuggyQSA.push( "[*^$]=" + whitespace + "*(?:''|\"\")" );
				}

				// Support: IE8
				// Boolean attributes and "value" are not treated correctly
				if ( !el.querySelectorAll( "[selected]" ).length ) {
					rbuggyQSA.push( "\\[" + whitespace + "*(?:value|" + booleans + ")" );
				}

				// Support: Chrome<29, Android<4.4, Safari<7.0+, iOS<7.0+, PhantomJS<1.9.8+
				if ( !el.querySelectorAll( "[id~=" + expando + "-]" ).length ) {
					rbuggyQSA.push( "~=" );
				}

				// Support: IE 11+, Edge 15 - 18+
				// IE 11/Edge don't find elements on a `[name='']` query in some cases.
				// Adding a temporary attribute to the document before the selection works
				// around the issue.
				// Interestingly, IE 10 & older don't seem to have the issue.
				input = document.createElement( "input" );
				input.setAttribute( "name", "" );
				el.appendChild( input );
				if ( !el.querySelectorAll( "[name='']" ).length ) {
					rbuggyQSA.push( "\\[" + whitespace + "*name" + whitespace + "*=" +
						whitespace + "*(?:''|\"\")" );
				}

				// Webkit/Opera - :checked should return selected option elements
				// http://www.w3.org/TR/2011/REC-css3-selectors-20110929/#checked
				// IE8 throws error here and will not see later tests
				if ( !el.querySelectorAll( ":checked" ).length ) {
					rbuggyQSA.push( ":checked" );
				}

				// Support: Safari 8+, iOS 8+
				// https://bugs.webkit.org/show_bug.cgi?id=136851
				// In-page `selector#id sibling-combinator selector` fails
				if ( !el.querySelectorAll( "a#" + expando + "+*" ).length ) {
					rbuggyQSA.push( ".#.+[+~]" );
				}

				// Support: Firefox <=3.6 - 5 only
				// Old Firefox doesn't throw on a badly-escaped identifier.
				el.querySelectorAll( "\\\f" );
				rbuggyQSA.push( "[\\r\\n\\f]" );
			} );

			assert( function( el ) {
				el.innerHTML = "<a href='' disabled='disabled'></a>" +
					"<select disabled='disabled'><option/></select>";

				// Support: Windows 8 Native Apps
				// The type and name attributes are restricted during .innerHTML assignment
				var input = document.createElement( "input" );
				input.setAttribute( "type", "hidden" );
				el.appendChild( input ).setAttribute( "name", "D" );

				// Support: IE8
				// Enforce case-sensitivity of name attribute
				if ( el.querySelectorAll( "[name=d]" ).length ) {
					rbuggyQSA.push( "name" + whitespace + "*[*^$|!~]?=" );
				}

				// FF 3.5 - :enabled/:disabled and hidden elements (hidden elements are still enabled)
				// IE8 throws error here and will not see later tests
				if ( el.querySelectorAll( ":enabled" ).length !== 2 ) {
					rbuggyQSA.push( ":enabled", ":disabled" );
				}

				// Support: IE9-11+
				// IE's :disabled selector does not pick up the children of disabled fieldsets
				docElem.appendChild( el ).disabled = true;
				if ( el.querySelectorAll( ":disabled" ).length !== 2 ) {
					rbuggyQSA.push( ":enabled", ":disabled" );
				}

				// Support: Opera 10 - 11 only
				// Opera 10-11 does not throw on post-comma invalid pseudos
				el.querySelectorAll( "*,:x" );
				rbuggyQSA.push( ",.*:" );
			} );
		}

		if ( ( support.matchesSelector = rnative.test( ( matches = docElem.matches ||
			docElem.webkitMatchesSelector ||
			docElem.mozMatchesSelector ||
			docElem.oMatchesSelector ||
			docElem.msMatchesSelector ) ) ) ) {

			assert( function( el ) {

				// Check to see if it's possible to do matchesSelector
				// on a disconnected node (IE 9)
				support.disconnectedMatch = matches.call( el, "*" );

				// This should fail with an exception
				// Gecko does not error, returns false instead
				matches.call( el, "[s!='']:x" );
				rbuggyMatches.push( "!=", pseudos );
			} );
		}

		rbuggyQSA = rbuggyQSA.length && new RegExp( rbuggyQSA.join( "|" ) );
		rbuggyMatches = rbuggyMatches.length && new RegExp( rbuggyMatches.join( "|" ) );

		/* Contains
		---------------------------------------------------------------------- */
		hasCompare = rnative.test( docElem.compareDocumentPosition );

		// Element contains another
		// Purposefully self-exclusive
		// As in, an element does not contain itself
		contains = hasCompare || rnative.test( docElem.contains ) ?
			function( a, b ) {
				var adown = a.nodeType === 9 ? a.documentElement : a,
					bup = b && b.parentNode;
				return a === bup || !!( bup && bup.nodeType === 1 && (
					adown.contains ?
						adown.contains( bup ) :
						a.compareDocumentPosition && a.compareDocumentPosition( bup ) & 16
				) );
			} :
			function( a, b ) {
				if ( b ) {
					while ( ( b = b.parentNode ) ) {
						if ( b === a ) {
							return true;
						}
					}
				}
				return false;
			};

		/* Sorting
		---------------------------------------------------------------------- */

		// Document order sorting
		sortOrder = hasCompare ?
		function( a, b ) {

			// Flag for duplicate removal
			if ( a === b ) {
				hasDuplicate = true;
				return 0;
			}

			// Sort on method existence if only one input has compareDocumentPosition
			var compare = !a.compareDocumentPosition - !b.compareDocumentPosition;
			if ( compare ) {
				return compare;
			}

			// Calculate position if both inputs belong to the same document
			// Support: IE 11+, Edge 17 - 18+
			// IE/Edge sometimes throw a "Permission denied" error when strict-comparing
			// two documents; shallow comparisons work.
			// eslint-disable-next-line eqeqeq
			compare = ( a.ownerDocument || a ) == ( b.ownerDocument || b ) ?
				a.compareDocumentPosition( b ) :

				// Otherwise we know they are disconnected
				1;

			// Disconnected nodes
			if ( compare & 1 ||
				( !support.sortDetached && b.compareDocumentPosition( a ) === compare ) ) {

				// Choose the first element that is related to our preferred document
				// Support: IE 11+, Edge 17 - 18+
				// IE/Edge sometimes throw a "Permission denied" error when strict-comparing
				// two documents; shallow comparisons work.
				// eslint-disable-next-line eqeqeq
				if ( a == document || a.ownerDocument == preferredDoc &&
					contains( preferredDoc, a ) ) {
					return -1;
				}

				// Support: IE 11+, Edge 17 - 18+
				// IE/Edge sometimes throw a "Permission denied" error when strict-comparing
				// two documents; shallow comparisons work.
				// eslint-disable-next-line eqeqeq
				if ( b == document || b.ownerDocument == preferredDoc &&
					contains( preferredDoc, b ) ) {
					return 1;
				}

				// Maintain original order
				return sortInput ?
					( indexOf( sortInput, a ) - indexOf( sortInput, b ) ) :
					0;
			}

			return compare & 4 ? -1 : 1;
		} :
		function( a, b ) {

			// Exit early if the nodes are identical
			if ( a === b ) {
				hasDuplicate = true;
				return 0;
			}

			var cur,
				i = 0,
				aup = a.parentNode,
				bup = b.parentNode,
				ap = [ a ],
				bp = [ b ];

			// Parentless nodes are either documents or disconnected
			if ( !aup || !bup ) {

				// Support: IE 11+, Edge 17 - 18+
				// IE/Edge sometimes throw a "Permission denied" error when strict-comparing
				// two documents; shallow comparisons work.
				/* eslint-disable eqeqeq */
				return a == document ? -1 :
					b == document ? 1 :
					/* eslint-enable eqeqeq */
					aup ? -1 :
					bup ? 1 :
					sortInput ?
					( indexOf( sortInput, a ) - indexOf( sortInput, b ) ) :
					0;

			// If the nodes are siblings, we can do a quick check
			} else if ( aup === bup ) {
				return siblingCheck( a, b );
			}

			// Otherwise we need full lists of their ancestors for comparison
			cur = a;
			while ( ( cur = cur.parentNode ) ) {
				ap.unshift( cur );
			}
			cur = b;
			while ( ( cur = cur.parentNode ) ) {
				bp.unshift( cur );
			}

			// Walk down the tree looking for a discrepancy
			while ( ap[ i ] === bp[ i ] ) {
				i++;
			}

			return i ?

				// Do a sibling check if the nodes have a common ancestor
				siblingCheck( ap[ i ], bp[ i ] ) :

				// Otherwise nodes in our document sort first
				// Support: IE 11+, Edge 17 - 18+
				// IE/Edge sometimes throw a "Permission denied" error when strict-comparing
				// two documents; shallow comparisons work.
				/* eslint-disable eqeqeq */
				ap[ i ] == preferredDoc ? -1 :
				bp[ i ] == preferredDoc ? 1 :
				/* eslint-enable eqeqeq */
				0;
		};

		return document;
	};

	Sizzle.matches = function( expr, elements ) {
		return Sizzle( expr, null, null, elements );
	};

	Sizzle.matchesSelector = function( elem, expr ) {
		setDocument( elem );

		if ( support.matchesSelector && documentIsHTML &&
			!nonnativeSelectorCache[ expr + " " ] &&
			( !rbuggyMatches || !rbuggyMatches.test( expr ) ) &&
			( !rbuggyQSA     || !rbuggyQSA.test( expr ) ) ) {

			try {
				var ret = matches.call( elem, expr );

				// IE 9's matchesSelector returns false on disconnected nodes
				if ( ret || support.disconnectedMatch ||

					// As well, disconnected nodes are said to be in a document
					// fragment in IE 9
					elem.document && elem.document.nodeType !== 11 ) {
					return ret;
				}
			} catch ( e ) {
				nonnativeSelectorCache( expr, true );
			}
		}

		return Sizzle( expr, document, null, [ elem ] ).length > 0;
	};

	Sizzle.contains = function( context, elem ) {

		// Set document vars if needed
		// Support: IE 11+, Edge 17 - 18+
		// IE/Edge sometimes throw a "Permission denied" error when strict-comparing
		// two documents; shallow comparisons work.
		// eslint-disable-next-line eqeqeq
		if ( ( context.ownerDocument || context ) != document ) {
			setDocument( context );
		}
		return contains( context, elem );
	};

	Sizzle.attr = function( elem, name ) {

		// Set document vars if needed
		// Support: IE 11+, Edge 17 - 18+
		// IE/Edge sometimes throw a "Permission denied" error when strict-comparing
		// two documents; shallow comparisons work.
		// eslint-disable-next-line eqeqeq
		if ( ( elem.ownerDocument || elem ) != document ) {
			setDocument( elem );
		}

		var fn = Expr.attrHandle[ name.toLowerCase() ],

			// Don't get fooled by Object.prototype properties (jQuery #13807)
			val = fn && hasOwn.call( Expr.attrHandle, name.toLowerCase() ) ?
				fn( elem, name, !documentIsHTML ) :
				undefined;

		return val !== undefined ?
			val :
			support.attributes || !documentIsHTML ?
				elem.getAttribute( name ) :
				( val = elem.getAttributeNode( name ) ) && val.specified ?
					val.value :
					null;
	};

	Sizzle.escape = function( sel ) {
		return ( sel + "" ).replace( rcssescape, fcssescape );
	};

	Sizzle.error = function( msg ) {
		throw new Error( "Syntax error, unrecognized expression: " + msg );
	};

	/**
	 * Document sorting and removing duplicates
	 * @param {ArrayLike} results
	 */
	Sizzle.uniqueSort = function( results ) {
		var elem,
			duplicates = [],
			j = 0,
			i = 0;

		// Unless we *know* we can detect duplicates, assume their presence
		hasDuplicate = !support.detectDuplicates;
		sortInput = !support.sortStable && results.slice( 0 );
		results.sort( sortOrder );

		if ( hasDuplicate ) {
			while ( ( elem = results[ i++ ] ) ) {
				if ( elem === results[ i ] ) {
					j = duplicates.push( i );
				}
			}
			while ( j-- ) {
				results.splice( duplicates[ j ], 1 );
			}
		}

		// Clear input after sorting to release objects
		// See https://github.com/jquery/sizzle/pull/225
		sortInput = null;

		return results;
	};

	/**
	 * Utility function for retrieving the text value of an array of DOM nodes
	 * @param {Array|Element} elem
	 */
	getText = Sizzle.getText = function( elem ) {
		var node,
			ret = "",
			i = 0,
			nodeType = elem.nodeType;

		if ( !nodeType ) {

			// If no nodeType, this is expected to be an array
			while ( ( node = elem[ i++ ] ) ) {

				// Do not traverse comment nodes
				ret += getText( node );
			}
		} else if ( nodeType === 1 || nodeType === 9 || nodeType === 11 ) {

			// Use textContent for elements
			// innerText usage removed for consistency of new lines (jQuery #11153)
			if ( typeof elem.textContent === "string" ) {
				return elem.textContent;
			} else {

				// Traverse its children
				for ( elem = elem.firstChild; elem; elem = elem.nextSibling ) {
					ret += getText( elem );
				}
			}
		} else if ( nodeType === 3 || nodeType === 4 ) {
			return elem.nodeValue;
		}

		// Do not include comment or processing instruction nodes

		return ret;
	};

	Expr = Sizzle.selectors = {

		// Can be adjusted by the user
		cacheLength: 50,

		createPseudo: markFunction,

		match: matchExpr,

		attrHandle: {},

		find: {},

		relative: {
			">": { dir: "parentNode", first: true },
			" ": { dir: "parentNode" },
			"+": { dir: "previousSibling", first: true },
			"~": { dir: "previousSibling" }
		},

		preFilter: {
			"ATTR": function( match ) {
				match[ 1 ] = match[ 1 ].replace( runescape, funescape );

				// Move the given value to match[3] whether quoted or unquoted
				match[ 3 ] = ( match[ 3 ] || match[ 4 ] ||
					match[ 5 ] || "" ).replace( runescape, funescape );

				if ( match[ 2 ] === "~=" ) {
					match[ 3 ] = " " + match[ 3 ] + " ";
				}

				return match.slice( 0, 4 );
			},

			"CHILD": function( match ) {

				/* matches from matchExpr["CHILD"]
					1 type (only|nth|...)
					2 what (child|of-type)
					3 argument (even|odd|\d*|\d*n([+-]\d+)?|...)
					4 xn-component of xn+y argument ([+-]?\d*n|)
					5 sign of xn-component
					6 x of xn-component
					7 sign of y-component
					8 y of y-component
				*/
				match[ 1 ] = match[ 1 ].toLowerCase();

				if ( match[ 1 ].slice( 0, 3 ) === "nth" ) {

					// nth-* requires argument
					if ( !match[ 3 ] ) {
						Sizzle.error( match[ 0 ] );
					}

					// numeric x and y parameters for Expr.filter.CHILD
					// remember that false/true cast respectively to 0/1
					match[ 4 ] = +( match[ 4 ] ?
						match[ 5 ] + ( match[ 6 ] || 1 ) :
						2 * ( match[ 3 ] === "even" || match[ 3 ] === "odd" ) );
					match[ 5 ] = +( ( match[ 7 ] + match[ 8 ] ) || match[ 3 ] === "odd" );

					// other types prohibit arguments
				} else if ( match[ 3 ] ) {
					Sizzle.error( match[ 0 ] );
				}

				return match;
			},

			"PSEUDO": function( match ) {
				var excess,
					unquoted = !match[ 6 ] && match[ 2 ];

				if ( matchExpr[ "CHILD" ].test( match[ 0 ] ) ) {
					return null;
				}

				// Accept quoted arguments as-is
				if ( match[ 3 ] ) {
					match[ 2 ] = match[ 4 ] || match[ 5 ] || "";

				// Strip excess characters from unquoted arguments
				} else if ( unquoted && rpseudo.test( unquoted ) &&

					// Get excess from tokenize (recursively)
					( excess = tokenize( unquoted, true ) ) &&

					// advance to the next closing parenthesis
					( excess = unquoted.indexOf( ")", unquoted.length - excess ) - unquoted.length ) ) {

					// excess is a negative index
					match[ 0 ] = match[ 0 ].slice( 0, excess );
					match[ 2 ] = unquoted.slice( 0, excess );
				}

				// Return only captures needed by the pseudo filter method (type and argument)
				return match.slice( 0, 3 );
			}
		},

		filter: {

			"TAG": function( nodeNameSelector ) {
				var nodeName = nodeNameSelector.replace( runescape, funescape ).toLowerCase();
				return nodeNameSelector === "*" ?
					function() {
						return true;
					} :
					function( elem ) {
						return elem.nodeName && elem.nodeName.toLowerCase() === nodeName;
					};
			},

			"CLASS": function( className ) {
				var pattern = classCache[ className + " " ];

				return pattern ||
					( pattern = new RegExp( "(^|" + whitespace +
						")" + className + "(" + whitespace + "|$)" ) ) && classCache(
							className, function( elem ) {
								return pattern.test(
									typeof elem.className === "string" && elem.className ||
									typeof elem.getAttribute !== "undefined" &&
										elem.getAttribute( "class" ) ||
									""
								);
					} );
			},

			"ATTR": function( name, operator, check ) {
				return function( elem ) {
					var result = Sizzle.attr( elem, name );

					if ( result == null ) {
						return operator === "!=";
					}
					if ( !operator ) {
						return true;
					}

					result += "";

					/* eslint-disable max-len */

					return operator === "=" ? result === check :
						operator === "!=" ? result !== check :
						operator === "^=" ? check && result.indexOf( check ) === 0 :
						operator === "*=" ? check && result.indexOf( check ) > -1 :
						operator === "$=" ? check && result.slice( -check.length ) === check :
						operator === "~=" ? ( " " + result.replace( rwhitespace, " " ) + " " ).indexOf( check ) > -1 :
						operator === "|=" ? result === check || result.slice( 0, check.length + 1 ) === check + "-" :
						false;
					/* eslint-enable max-len */

				};
			},

			"CHILD": function( type, what, _argument, first, last ) {
				var simple = type.slice( 0, 3 ) !== "nth",
					forward = type.slice( -4 ) !== "last",
					ofType = what === "of-type";

				return first === 1 && last === 0 ?

					// Shortcut for :nth-*(n)
					function( elem ) {
						return !!elem.parentNode;
					} :

					function( elem, _context, xml ) {
						var cache, uniqueCache, outerCache, node, nodeIndex, start,
							dir = simple !== forward ? "nextSibling" : "previousSibling",
							parent = elem.parentNode,
							name = ofType && elem.nodeName.toLowerCase(),
							useCache = !xml && !ofType,
							diff = false;

						if ( parent ) {

							// :(first|last|only)-(child|of-type)
							if ( simple ) {
								while ( dir ) {
									node = elem;
									while ( ( node = node[ dir ] ) ) {
										if ( ofType ?
											node.nodeName.toLowerCase() === name :
											node.nodeType === 1 ) {

											return false;
										}
									}

									// Reverse direction for :only-* (if we haven't yet done so)
									start = dir = type === "only" && !start && "nextSibling";
								}
								return true;
							}

							start = [ forward ? parent.firstChild : parent.lastChild ];

							// non-xml :nth-child(...) stores cache data on `parent`
							if ( forward && useCache ) {

								// Seek `elem` from a previously-cached index

								// ...in a gzip-friendly way
								node = parent;
								outerCache = node[ expando ] || ( node[ expando ] = {} );

								// Support: IE <9 only
								// Defend against cloned attroperties (jQuery gh-1709)
								uniqueCache = outerCache[ node.uniqueID ] ||
									( outerCache[ node.uniqueID ] = {} );

								cache = uniqueCache[ type ] || [];
								nodeIndex = cache[ 0 ] === dirruns && cache[ 1 ];
								diff = nodeIndex && cache[ 2 ];
								node = nodeIndex && parent.childNodes[ nodeIndex ];

								while ( ( node = ++nodeIndex && node && node[ dir ] ||

									// Fallback to seeking `elem` from the start
									( diff = nodeIndex = 0 ) || start.pop() ) ) {

									// When found, cache indexes on `parent` and break
									if ( node.nodeType === 1 && ++diff && node === elem ) {
										uniqueCache[ type ] = [ dirruns, nodeIndex, diff ];
										break;
									}
								}

							} else {

								// Use previously-cached element index if available
								if ( useCache ) {

									// ...in a gzip-friendly way
									node = elem;
									outerCache = node[ expando ] || ( node[ expando ] = {} );

									// Support: IE <9 only
									// Defend against cloned attroperties (jQuery gh-1709)
									uniqueCache = outerCache[ node.uniqueID ] ||
										( outerCache[ node.uniqueID ] = {} );

									cache = uniqueCache[ type ] || [];
									nodeIndex = cache[ 0 ] === dirruns && cache[ 1 ];
									diff = nodeIndex;
								}

								// xml :nth-child(...)
								// or :nth-last-child(...) or :nth(-last)?-of-type(...)
								if ( diff === false ) {

									// Use the same loop as above to seek `elem` from the start
									while ( ( node = ++nodeIndex && node && node[ dir ] ||
										( diff = nodeIndex = 0 ) || start.pop() ) ) {

										if ( ( ofType ?
											node.nodeName.toLowerCase() === name :
											node.nodeType === 1 ) &&
											++diff ) {

											// Cache the index of each encountered element
											if ( useCache ) {
												outerCache = node[ expando ] ||
													( node[ expando ] = {} );

												// Support: IE <9 only
												// Defend against cloned attroperties (jQuery gh-1709)
												uniqueCache = outerCache[ node.uniqueID ] ||
													( outerCache[ node.uniqueID ] = {} );

												uniqueCache[ type ] = [ dirruns, diff ];
											}

											if ( node === elem ) {
												break;
											}
										}
									}
								}
							}

							// Incorporate the offset, then check against cycle size
							diff -= last;
							return diff === first || ( diff % first === 0 && diff / first >= 0 );
						}
					};
			},

			"PSEUDO": function( pseudo, argument ) {

				// pseudo-class names are case-insensitive
				// http://www.w3.org/TR/selectors/#pseudo-classes
				// Prioritize by case sensitivity in case custom pseudos are added with uppercase letters
				// Remember that setFilters inherits from pseudos
				var args,
					fn = Expr.pseudos[ pseudo ] || Expr.setFilters[ pseudo.toLowerCase() ] ||
						Sizzle.error( "unsupported pseudo: " + pseudo );

				// The user may use createPseudo to indicate that
				// arguments are needed to create the filter function
				// just as Sizzle does
				if ( fn[ expando ] ) {
					return fn( argument );
				}

				// But maintain support for old signatures
				if ( fn.length > 1 ) {
					args = [ pseudo, pseudo, "", argument ];
					return Expr.setFilters.hasOwnProperty( pseudo.toLowerCase() ) ?
						markFunction( function( seed, matches ) {
							var idx,
								matched = fn( seed, argument ),
								i = matched.length;
							while ( i-- ) {
								idx = indexOf( seed, matched[ i ] );
								seed[ idx ] = !( matches[ idx ] = matched[ i ] );
							}
						} ) :
						function( elem ) {
							return fn( elem, 0, args );
						};
				}

				return fn;
			}
		},

		pseudos: {

			// Potentially complex pseudos
			"not": markFunction( function( selector ) {

				// Trim the selector passed to compile
				// to avoid treating leading and trailing
				// spaces as combinators
				var input = [],
					results = [],
					matcher = compile( selector.replace( rtrim, "$1" ) );

				return matcher[ expando ] ?
					markFunction( function( seed, matches, _context, xml ) {
						var elem,
							unmatched = matcher( seed, null, xml, [] ),
							i = seed.length;

						// Match elements unmatched by `matcher`
						while ( i-- ) {
							if ( ( elem = unmatched[ i ] ) ) {
								seed[ i ] = !( matches[ i ] = elem );
							}
						}
					} ) :
					function( elem, _context, xml ) {
						input[ 0 ] = elem;
						matcher( input, null, xml, results );

						// Don't keep the element (issue #299)
						input[ 0 ] = null;
						return !results.pop();
					};
			} ),

			"has": markFunction( function( selector ) {
				return function( elem ) {
					return Sizzle( selector, elem ).length > 0;
				};
			} ),

			"contains": markFunction( function( text ) {
				text = text.replace( runescape, funescape );
				return function( elem ) {
					return ( elem.textContent || getText( elem ) ).indexOf( text ) > -1;
				};
			} ),

			// "Whether an element is represented by a :lang() selector
			// is based solely on the element's language value
			// being equal to the identifier C,
			// or beginning with the identifier C immediately followed by "-".
			// The matching of C against the element's language value is performed case-insensitively.
			// The identifier C does not have to be a valid language name."
			// http://www.w3.org/TR/selectors/#lang-pseudo
			"lang": markFunction( function( lang ) {

				// lang value must be a valid identifier
				if ( !ridentifier.test( lang || "" ) ) {
					Sizzle.error( "unsupported lang: " + lang );
				}
				lang = lang.replace( runescape, funescape ).toLowerCase();
				return function( elem ) {
					var elemLang;
					do {
						if ( ( elemLang = documentIsHTML ?
							elem.lang :
							elem.getAttribute( "xml:lang" ) || elem.getAttribute( "lang" ) ) ) {

							elemLang = elemLang.toLowerCase();
							return elemLang === lang || elemLang.indexOf( lang + "-" ) === 0;
						}
					} while ( ( elem = elem.parentNode ) && elem.nodeType === 1 );
					return false;
				};
			} ),

			// Miscellaneous
			"target": function( elem ) {
				var hash = window.location && window.location.hash;
				return hash && hash.slice( 1 ) === elem.id;
			},

			"root": function( elem ) {
				return elem === docElem;
			},

			"focus": function( elem ) {
				return elem === document.activeElement &&
					( !document.hasFocus || document.hasFocus() ) &&
					!!( elem.type || elem.href || ~elem.tabIndex );
			},

			// Boolean properties
			"enabled": createDisabledPseudo( false ),
			"disabled": createDisabledPseudo( true ),

			"checked": function( elem ) {

				// In CSS3, :checked should return both checked and selected elements
				// http://www.w3.org/TR/2011/REC-css3-selectors-20110929/#checked
				var nodeName = elem.nodeName.toLowerCase();
				return ( nodeName === "input" && !!elem.checked ) ||
					( nodeName === "option" && !!elem.selected );
			},

			"selected": function( elem ) {

				// Accessing this property makes selected-by-default
				// options in Safari work properly
				if ( elem.parentNode ) {
					// eslint-disable-next-line no-unused-expressions
					elem.parentNode.selectedIndex;
				}

				return elem.selected === true;
			},

			// Contents
			"empty": function( elem ) {

				// http://www.w3.org/TR/selectors/#empty-pseudo
				// :empty is negated by element (1) or content nodes (text: 3; cdata: 4; entity ref: 5),
				//   but not by others (comment: 8; processing instruction: 7; etc.)
				// nodeType < 6 works because attributes (2) do not appear as children
				for ( elem = elem.firstChild; elem; elem = elem.nextSibling ) {
					if ( elem.nodeType < 6 ) {
						return false;
					}
				}
				return true;
			},

			"parent": function( elem ) {
				return !Expr.pseudos[ "empty" ]( elem );
			},

			// Element/input types
			"header": function( elem ) {
				return rheader.test( elem.nodeName );
			},

			"input": function( elem ) {
				return rinputs.test( elem.nodeName );
			},

			"button": function( elem ) {
				var name = elem.nodeName.toLowerCase();
				return name === "input" && elem.type === "button" || name === "button";
			},

			"text": function( elem ) {
				var attr;
				return elem.nodeName.toLowerCase() === "input" &&
					elem.type === "text" &&

					// Support: IE<8
					// New HTML5 attribute values (e.g., "search") appear with elem.type === "text"
					( ( attr = elem.getAttribute( "type" ) ) == null ||
						attr.toLowerCase() === "text" );
			},

			// Position-in-collection
			"first": createPositionalPseudo( function() {
				return [ 0 ];
			} ),

			"last": createPositionalPseudo( function( _matchIndexes, length ) {
				return [ length - 1 ];
			} ),

			"eq": createPositionalPseudo( function( _matchIndexes, length, argument ) {
				return [ argument < 0 ? argument + length : argument ];
			} ),

			"even": createPositionalPseudo( function( matchIndexes, length ) {
				var i = 0;
				for ( ; i < length; i += 2 ) {
					matchIndexes.push( i );
				}
				return matchIndexes;
			} ),

			"odd": createPositionalPseudo( function( matchIndexes, length ) {
				var i = 1;
				for ( ; i < length; i += 2 ) {
					matchIndexes.push( i );
				}
				return matchIndexes;
			} ),

			"lt": createPositionalPseudo( function( matchIndexes, length, argument ) {
				var i = argument < 0 ?
					argument + length :
					argument > length ?
						length :
						argument;
				for ( ; --i >= 0; ) {
					matchIndexes.push( i );
				}
				return matchIndexes;
			} ),

			"gt": createPositionalPseudo( function( matchIndexes, length, argument ) {
				var i = argument < 0 ? argument + length : argument;
				for ( ; ++i < length; ) {
					matchIndexes.push( i );
				}
				return matchIndexes;
			} )
		}
	};

	Expr.pseudos[ "nth" ] = Expr.pseudos[ "eq" ];

	// Add button/input type pseudos
	for ( i in { radio: true, checkbox: true, file: true, password: true, image: true } ) {
		Expr.pseudos[ i ] = createInputPseudo( i );
	}
	for ( i in { submit: true, reset: true } ) {
		Expr.pseudos[ i ] = createButtonPseudo( i );
	}

	// Easy API for creating new setFilters
	function setFilters() {}
	setFilters.prototype = Expr.filters = Expr.pseudos;
	Expr.setFilters = new setFilters();

	tokenize = Sizzle.tokenize = function( selector, parseOnly ) {
		var matched, match, tokens, type,
			soFar, groups, preFilters,
			cached = tokenCache[ selector + " " ];

		if ( cached ) {
			return parseOnly ? 0 : cached.slice( 0 );
		}

		soFar = selector;
		groups = [];
		preFilters = Expr.preFilter;

		while ( soFar ) {

			// Comma and first run
			if ( !matched || ( match = rcomma.exec( soFar ) ) ) {
				if ( match ) {

					// Don't consume trailing commas as valid
					soFar = soFar.slice( match[ 0 ].length ) || soFar;
				}
				groups.push( ( tokens = [] ) );
			}

			matched = false;

			// Combinators
			if ( ( match = rcombinators.exec( soFar ) ) ) {
				matched = match.shift();
				tokens.push( {
					value: matched,

					// Cast descendant combinators to space
					type: match[ 0 ].replace( rtrim, " " )
				} );
				soFar = soFar.slice( matched.length );
			}

			// Filters
			for ( type in Expr.filter ) {
				if ( ( match = matchExpr[ type ].exec( soFar ) ) && ( !preFilters[ type ] ||
					( match = preFilters[ type ]( match ) ) ) ) {
					matched = match.shift();
					tokens.push( {
						value: matched,
						type: type,
						matches: match
					} );
					soFar = soFar.slice( matched.length );
				}
			}

			if ( !matched ) {
				break;
			}
		}

		// Return the length of the invalid excess
		// if we're just parsing
		// Otherwise, throw an error or return tokens
		return parseOnly ?
			soFar.length :
			soFar ?
				Sizzle.error( selector ) :

				// Cache the tokens
				tokenCache( selector, groups ).slice( 0 );
	};

	function toSelector( tokens ) {
		var i = 0,
			len = tokens.length,
			selector = "";
		for ( ; i < len; i++ ) {
			selector += tokens[ i ].value;
		}
		return selector;
	}

	function addCombinator( matcher, combinator, base ) {
		var dir = combinator.dir,
			skip = combinator.next,
			key = skip || dir,
			checkNonElements = base && key === "parentNode",
			doneName = done++;

		return combinator.first ?

			// Check against closest ancestor/preceding element
			function( elem, context, xml ) {
				while ( ( elem = elem[ dir ] ) ) {
					if ( elem.nodeType === 1 || checkNonElements ) {
						return matcher( elem, context, xml );
					}
				}
				return false;
			} :

			// Check against all ancestor/preceding elements
			function( elem, context, xml ) {
				var oldCache, uniqueCache, outerCache,
					newCache = [ dirruns, doneName ];

				// We can't set arbitrary data on XML nodes, so they don't benefit from combinator caching
				if ( xml ) {
					while ( ( elem = elem[ dir ] ) ) {
						if ( elem.nodeType === 1 || checkNonElements ) {
							if ( matcher( elem, context, xml ) ) {
								return true;
							}
						}
					}
				} else {
					while ( ( elem = elem[ dir ] ) ) {
						if ( elem.nodeType === 1 || checkNonElements ) {
							outerCache = elem[ expando ] || ( elem[ expando ] = {} );

							// Support: IE <9 only
							// Defend against cloned attroperties (jQuery gh-1709)
							uniqueCache = outerCache[ elem.uniqueID ] ||
								( outerCache[ elem.uniqueID ] = {} );

							if ( skip && skip === elem.nodeName.toLowerCase() ) {
								elem = elem[ dir ] || elem;
							} else if ( ( oldCache = uniqueCache[ key ] ) &&
								oldCache[ 0 ] === dirruns && oldCache[ 1 ] === doneName ) {

								// Assign to newCache so results back-propagate to previous elements
								return ( newCache[ 2 ] = oldCache[ 2 ] );
							} else {

								// Reuse newcache so results back-propagate to previous elements
								uniqueCache[ key ] = newCache;

								// A match means we're done; a fail means we have to keep checking
								if ( ( newCache[ 2 ] = matcher( elem, context, xml ) ) ) {
									return true;
								}
							}
						}
					}
				}
				return false;
			};
	}

	function elementMatcher( matchers ) {
		return matchers.length > 1 ?
			function( elem, context, xml ) {
				var i = matchers.length;
				while ( i-- ) {
					if ( !matchers[ i ]( elem, context, xml ) ) {
						return false;
					}
				}
				return true;
			} :
			matchers[ 0 ];
	}

	function multipleContexts( selector, contexts, results ) {
		var i = 0,
			len = contexts.length;
		for ( ; i < len; i++ ) {
			Sizzle( selector, contexts[ i ], results );
		}
		return results;
	}

	function condense( unmatched, map, filter, context, xml ) {
		var elem,
			newUnmatched = [],
			i = 0,
			len = unmatched.length,
			mapped = map != null;

		for ( ; i < len; i++ ) {
			if ( ( elem = unmatched[ i ] ) ) {
				if ( !filter || filter( elem, context, xml ) ) {
					newUnmatched.push( elem );
					if ( mapped ) {
						map.push( i );
					}
				}
			}
		}

		return newUnmatched;
	}

	function setMatcher( preFilter, selector, matcher, postFilter, postFinder, postSelector ) {
		if ( postFilter && !postFilter[ expando ] ) {
			postFilter = setMatcher( postFilter );
		}
		if ( postFinder && !postFinder[ expando ] ) {
			postFinder = setMatcher( postFinder, postSelector );
		}
		return markFunction( function( seed, results, context, xml ) {
			var temp, i, elem,
				preMap = [],
				postMap = [],
				preexisting = results.length,

				// Get initial elements from seed or context
				elems = seed || multipleContexts(
					selector || "*",
					context.nodeType ? [ context ] : context,
					[]
				),

				// Prefilter to get matcher input, preserving a map for seed-results synchronization
				matcherIn = preFilter && ( seed || !selector ) ?
					condense( elems, preMap, preFilter, context, xml ) :
					elems,

				matcherOut = matcher ?

					// If we have a postFinder, or filtered seed, or non-seed postFilter or preexisting results,
					postFinder || ( seed ? preFilter : preexisting || postFilter ) ?

						// ...intermediate processing is necessary
						[] :

						// ...otherwise use results directly
						results :
					matcherIn;

			// Find primary matches
			if ( matcher ) {
				matcher( matcherIn, matcherOut, context, xml );
			}

			// Apply postFilter
			if ( postFilter ) {
				temp = condense( matcherOut, postMap );
				postFilter( temp, [], context, xml );

				// Un-match failing elements by moving them back to matcherIn
				i = temp.length;
				while ( i-- ) {
					if ( ( elem = temp[ i ] ) ) {
						matcherOut[ postMap[ i ] ] = !( matcherIn[ postMap[ i ] ] = elem );
					}
				}
			}

			if ( seed ) {
				if ( postFinder || preFilter ) {
					if ( postFinder ) {

						// Get the final matcherOut by condensing this intermediate into postFinder contexts
						temp = [];
						i = matcherOut.length;
						while ( i-- ) {
							if ( ( elem = matcherOut[ i ] ) ) {

								// Restore matcherIn since elem is not yet a final match
								temp.push( ( matcherIn[ i ] = elem ) );
							}
						}
						postFinder( null, ( matcherOut = [] ), temp, xml );
					}

					// Move matched elements from seed to results to keep them synchronized
					i = matcherOut.length;
					while ( i-- ) {
						if ( ( elem = matcherOut[ i ] ) &&
							( temp = postFinder ? indexOf( seed, elem ) : preMap[ i ] ) > -1 ) {

							seed[ temp ] = !( results[ temp ] = elem );
						}
					}
				}

			// Add elements to results, through postFinder if defined
			} else {
				matcherOut = condense(
					matcherOut === results ?
						matcherOut.splice( preexisting, matcherOut.length ) :
						matcherOut
				);
				if ( postFinder ) {
					postFinder( null, results, matcherOut, xml );
				} else {
					push.apply( results, matcherOut );
				}
			}
		} );
	}

	function matcherFromTokens( tokens ) {
		var checkContext, matcher, j,
			len = tokens.length,
			leadingRelative = Expr.relative[ tokens[ 0 ].type ],
			implicitRelative = leadingRelative || Expr.relative[ " " ],
			i = leadingRelative ? 1 : 0,

			// The foundational matcher ensures that elements are reachable from top-level context(s)
			matchContext = addCombinator( function( elem ) {
				return elem === checkContext;
			}, implicitRelative, true ),
			matchAnyContext = addCombinator( function( elem ) {
				return indexOf( checkContext, elem ) > -1;
			}, implicitRelative, true ),
			matchers = [ function( elem, context, xml ) {
				var ret = ( !leadingRelative && ( xml || context !== outermostContext ) ) || (
					( checkContext = context ).nodeType ?
						matchContext( elem, context, xml ) :
						matchAnyContext( elem, context, xml ) );

				// Avoid hanging onto element (issue #299)
				checkContext = null;
				return ret;
			} ];

		for ( ; i < len; i++ ) {
			if ( ( matcher = Expr.relative[ tokens[ i ].type ] ) ) {
				matchers = [ addCombinator( elementMatcher( matchers ), matcher ) ];
			} else {
				matcher = Expr.filter[ tokens[ i ].type ].apply( null, tokens[ i ].matches );

				// Return special upon seeing a positional matcher
				if ( matcher[ expando ] ) {

					// Find the next relative operator (if any) for proper handling
					j = ++i;
					for ( ; j < len; j++ ) {
						if ( Expr.relative[ tokens[ j ].type ] ) {
							break;
						}
					}
					return setMatcher(
						i > 1 && elementMatcher( matchers ),
						i > 1 && toSelector(

						// If the preceding token was a descendant combinator, insert an implicit any-element `*`
						tokens
							.slice( 0, i - 1 )
							.concat( { value: tokens[ i - 2 ].type === " " ? "*" : "" } )
						).replace( rtrim, "$1" ),
						matcher,
						i < j && matcherFromTokens( tokens.slice( i, j ) ),
						j < len && matcherFromTokens( ( tokens = tokens.slice( j ) ) ),
						j < len && toSelector( tokens )
					);
				}
				matchers.push( matcher );
			}
		}

		return elementMatcher( matchers );
	}

	function matcherFromGroupMatchers( elementMatchers, setMatchers ) {
		var bySet = setMatchers.length > 0,
			byElement = elementMatchers.length > 0,
			superMatcher = function( seed, context, xml, results, outermost ) {
				var elem, j, matcher,
					matchedCount = 0,
					i = "0",
					unmatched = seed && [],
					setMatched = [],
					contextBackup = outermostContext,

					// We must always have either seed elements or outermost context
					elems = seed || byElement && Expr.find[ "TAG" ]( "*", outermost ),

					// Use integer dirruns iff this is the outermost matcher
					dirrunsUnique = ( dirruns += contextBackup == null ? 1 : Math.random() || 0.1 ),
					len = elems.length;

				if ( outermost ) {

					// Support: IE 11+, Edge 17 - 18+
					// IE/Edge sometimes throw a "Permission denied" error when strict-comparing
					// two documents; shallow comparisons work.
					// eslint-disable-next-line eqeqeq
					outermostContext = context == document || context || outermost;
				}

				// Add elements passing elementMatchers directly to results
				// Support: IE<9, Safari
				// Tolerate NodeList properties (IE: "length"; Safari: <number>) matching elements by id
				for ( ; i !== len && ( elem = elems[ i ] ) != null; i++ ) {
					if ( byElement && elem ) {
						j = 0;

						// Support: IE 11+, Edge 17 - 18+
						// IE/Edge sometimes throw a "Permission denied" error when strict-comparing
						// two documents; shallow comparisons work.
						// eslint-disable-next-line eqeqeq
						if ( !context && elem.ownerDocument != document ) {
							setDocument( elem );
							xml = !documentIsHTML;
						}
						while ( ( matcher = elementMatchers[ j++ ] ) ) {
							if ( matcher( elem, context || document, xml ) ) {
								results.push( elem );
								break;
							}
						}
						if ( outermost ) {
							dirruns = dirrunsUnique;
						}
					}

					// Track unmatched elements for set filters
					if ( bySet ) {

						// They will have gone through all possible matchers
						if ( ( elem = !matcher && elem ) ) {
							matchedCount--;
						}

						// Lengthen the array for every element, matched or not
						if ( seed ) {
							unmatched.push( elem );
						}
					}
				}

				// `i` is now the count of elements visited above, and adding it to `matchedCount`
				// makes the latter nonnegative.
				matchedCount += i;

				// Apply set filters to unmatched elements
				// NOTE: This can be skipped if there are no unmatched elements (i.e., `matchedCount`
				// equals `i`), unless we didn't visit _any_ elements in the above loop because we have
				// no element matchers and no seed.
				// Incrementing an initially-string "0" `i` allows `i` to remain a string only in that
				// case, which will result in a "00" `matchedCount` that differs from `i` but is also
				// numerically zero.
				if ( bySet && i !== matchedCount ) {
					j = 0;
					while ( ( matcher = setMatchers[ j++ ] ) ) {
						matcher( unmatched, setMatched, context, xml );
					}

					if ( seed ) {

						// Reintegrate element matches to eliminate the need for sorting
						if ( matchedCount > 0 ) {
							while ( i-- ) {
								if ( !( unmatched[ i ] || setMatched[ i ] ) ) {
									setMatched[ i ] = pop.call( results );
								}
							}
						}

						// Discard index placeholder values to get only actual matches
						setMatched = condense( setMatched );
					}

					// Add matches to results
					push.apply( results, setMatched );

					// Seedless set matches succeeding multiple successful matchers stipulate sorting
					if ( outermost && !seed && setMatched.length > 0 &&
						( matchedCount + setMatchers.length ) > 1 ) {

						Sizzle.uniqueSort( results );
					}
				}

				// Override manipulation of globals by nested matchers
				if ( outermost ) {
					dirruns = dirrunsUnique;
					outermostContext = contextBackup;
				}

				return unmatched;
			};

		return bySet ?
			markFunction( superMatcher ) :
			superMatcher;
	}

	compile = Sizzle.compile = function( selector, match /* Internal Use Only */ ) {
		var i,
			setMatchers = [],
			elementMatchers = [],
			cached = compilerCache[ selector + " " ];

		if ( !cached ) {

			// Generate a function of recursive functions that can be used to check each element
			if ( !match ) {
				match = tokenize( selector );
			}
			i = match.length;
			while ( i-- ) {
				cached = matcherFromTokens( match[ i ] );
				if ( cached[ expando ] ) {
					setMatchers.push( cached );
				} else {
					elementMatchers.push( cached );
				}
			}

			// Cache the compiled function
			cached = compilerCache(
				selector,
				matcherFromGroupMatchers( elementMatchers, setMatchers )
			);

			// Save selector and tokenization
			cached.selector = selector;
		}
		return cached;
	};

	/**
	 * A low-level selection function that works with Sizzle's compiled
	 *  selector functions
	 * @param {String|Function} selector A selector or a pre-compiled
	 *  selector function built with Sizzle.compile
	 * @param {Element} context
	 * @param {Array} [results]
	 * @param {Array} [seed] A set of elements to match against
	 */
	select = Sizzle.select = function( selector, context, results, seed ) {
		var i, tokens, token, type, find,
			compiled = typeof selector === "function" && selector,
			match = !seed && tokenize( ( selector = compiled.selector || selector ) );

		results = results || [];

		// Try to minimize operations if there is only one selector in the list and no seed
		// (the latter of which guarantees us context)
		if ( match.length === 1 ) {

			// Reduce context if the leading compound selector is an ID
			tokens = match[ 0 ] = match[ 0 ].slice( 0 );
			if ( tokens.length > 2 && ( token = tokens[ 0 ] ).type === "ID" &&
				context.nodeType === 9 && documentIsHTML && Expr.relative[ tokens[ 1 ].type ] ) {

				context = ( Expr.find[ "ID" ]( token.matches[ 0 ]
					.replace( runescape, funescape ), context ) || [] )[ 0 ];
				if ( !context ) {
					return results;

				// Precompiled matchers will still verify ancestry, so step up a level
				} else if ( compiled ) {
					context = context.parentNode;
				}

				selector = selector.slice( tokens.shift().value.length );
			}

			// Fetch a seed set for right-to-left matching
			i = matchExpr[ "needsContext" ].test( selector ) ? 0 : tokens.length;
			while ( i-- ) {
				token = tokens[ i ];

				// Abort if we hit a combinator
				if ( Expr.relative[ ( type = token.type ) ] ) {
					break;
				}
				if ( ( find = Expr.find[ type ] ) ) {

					// Search, expanding context for leading sibling combinators
					if ( ( seed = find(
						token.matches[ 0 ].replace( runescape, funescape ),
						rsibling.test( tokens[ 0 ].type ) && testContext( context.parentNode ) ||
							context
					) ) ) {

						// If seed is empty or no tokens remain, we can return early
						tokens.splice( i, 1 );
						selector = seed.length && toSelector( tokens );
						if ( !selector ) {
							push.apply( results, seed );
							return results;
						}

						break;
					}
				}
			}
		}

		// Compile and execute a filtering function if one is not provided
		// Provide `match` to avoid retokenization if we modified the selector above
		( compiled || compile( selector, match ) )(
			seed,
			context,
			!documentIsHTML,
			results,
			!context || rsibling.test( selector ) && testContext( context.parentNode ) || context
		);
		return results;
	};

	// One-time assignments

	// Sort stability
	support.sortStable = expando.split( "" ).sort( sortOrder ).join( "" ) === expando;

	// Support: Chrome 14-35+
	// Always assume duplicates if they aren't passed to the comparison function
	support.detectDuplicates = !!hasDuplicate;

	// Initialize against the default document
	setDocument();

	// Support: Webkit<537.32 - Safari 6.0.3/Chrome 25 (fixed in Chrome 27)
	// Detached nodes confoundingly follow *each other*
	support.sortDetached = assert( function( el ) {

		// Should return 1, but returns 4 (following)
		return el.compareDocumentPosition( document.createElement( "fieldset" ) ) & 1;
	} );

	// Support: IE<8
	// Prevent attribute/property "interpolation"
	// https://msdn.microsoft.com/en-us/library/ms536429%28VS.85%29.aspx
	if ( !assert( function( el ) {
		el.innerHTML = "<a href='#'></a>";
		return el.firstChild.getAttribute( "href" ) === "#";
	} ) ) {
		addHandle( "type|href|height|width", function( elem, name, isXML ) {
			if ( !isXML ) {
				return elem.getAttribute( name, name.toLowerCase() === "type" ? 1 : 2 );
			}
		} );
	}

	// Support: IE<9
	// Use defaultValue in place of getAttribute("value")
	if ( !support.attributes || !assert( function( el ) {
		el.innerHTML = "<input/>";
		el.firstChild.setAttribute( "value", "" );
		return el.firstChild.getAttribute( "value" ) === "";
	} ) ) {
		addHandle( "value", function( elem, _name, isXML ) {
			if ( !isXML && elem.nodeName.toLowerCase() === "input" ) {
				return elem.defaultValue;
			}
		} );
	}

	// Support: IE<9
	// Use getAttributeNode to fetch booleans when getAttribute lies
	if ( !assert( function( el ) {
		return el.getAttribute( "disabled" ) == null;
	} ) ) {
		addHandle( booleans, function( elem, name, isXML ) {
			var val;
			if ( !isXML ) {
				return elem[ name ] === true ? name.toLowerCase() :
					( val = elem.getAttributeNode( name ) ) && val.specified ?
						val.value :
						null;
			}
		} );
	}

	return Sizzle;

	} )( window );



	jQuery.find = Sizzle;
	jQuery.expr = Sizzle.selectors;

	// Deprecated
	jQuery.expr[ ":" ] = jQuery.expr.pseudos;
	jQuery.uniqueSort = jQuery.unique = Sizzle.uniqueSort;
	jQuery.text = Sizzle.getText;
	jQuery.isXMLDoc = Sizzle.isXML;
	jQuery.contains = Sizzle.contains;
	jQuery.escapeSelector = Sizzle.escape;




	var dir = function( elem, dir, until ) {
		var matched = [],
			truncate = until !== undefined;

		while ( ( elem = elem[ dir ] ) && elem.nodeType !== 9 ) {
			if ( elem.nodeType === 1 ) {
				if ( truncate && jQuery( elem ).is( until ) ) {
					break;
				}
				matched.push( elem );
			}
		}
		return matched;
	};


	var siblings = function( n, elem ) {
		var matched = [];

		for ( ; n; n = n.nextSibling ) {
			if ( n.nodeType === 1 && n !== elem ) {
				matched.push( n );
			}
		}

		return matched;
	};


	var rneedsContext = jQuery.expr.match.needsContext;



	function nodeName( elem, name ) {

	  return elem.nodeName && elem.nodeName.toLowerCase() === name.toLowerCase();

	}var rsingleTag = ( /^<([a-z][^\/\0>:\x20\t\r\n\f]*)[\x20\t\r\n\f]*\/?>(?:<\/\1>|)$/i );



	// Implement the identical functionality for filter and not
	function winnow( elements, qualifier, not ) {
		if ( isFunction( qualifier ) ) {
			return jQuery.grep( elements, function( elem, i ) {
				return !!qualifier.call( elem, i, elem ) !== not;
			} );
		}

		// Single element
		if ( qualifier.nodeType ) {
			return jQuery.grep( elements, function( elem ) {
				return ( elem === qualifier ) !== not;
			} );
		}

		// Arraylike of elements (jQuery, arguments, Array)
		if ( typeof qualifier !== "string" ) {
			return jQuery.grep( elements, function( elem ) {
				return ( indexOf.call( qualifier, elem ) > -1 ) !== not;
			} );
		}

		// Filtered directly for both simple and complex selectors
		return jQuery.filter( qualifier, elements, not );
	}

	jQuery.filter = function( expr, elems, not ) {
		var elem = elems[ 0 ];

		if ( not ) {
			expr = ":not(" + expr + ")";
		}

		if ( elems.length === 1 && elem.nodeType === 1 ) {
			return jQuery.find.matchesSelector( elem, expr ) ? [ elem ] : [];
		}

		return jQuery.find.matches( expr, jQuery.grep( elems, function( elem ) {
			return elem.nodeType === 1;
		} ) );
	};

	jQuery.fn.extend( {
		find: function( selector ) {
			var i, ret,
				len = this.length,
				self = this;

			if ( typeof selector !== "string" ) {
				return this.pushStack( jQuery( selector ).filter( function() {
					for ( i = 0; i < len; i++ ) {
						if ( jQuery.contains( self[ i ], this ) ) {
							return true;
						}
					}
				} ) );
			}

			ret = this.pushStack( [] );

			for ( i = 0; i < len; i++ ) {
				jQuery.find( selector, self[ i ], ret );
			}

			return len > 1 ? jQuery.uniqueSort( ret ) : ret;
		},
		filter: function( selector ) {
			return this.pushStack( winnow( this, selector || [], false ) );
		},
		not: function( selector ) {
			return this.pushStack( winnow( this, selector || [], true ) );
		},
		is: function( selector ) {
			return !!winnow(
				this,

				// If this is a positional/relative selector, check membership in the returned set
				// so $("p:first").is("p:last") won't return true for a doc with two "p".
				typeof selector === "string" && rneedsContext.test( selector ) ?
					jQuery( selector ) :
					selector || [],
				false
			).length;
		}
	} );


	// Initialize a jQuery object


	// A central reference to the root jQuery(document)
	var rootjQuery,

		// A simple way to check for HTML strings
		// Prioritize #id over <tag> to avoid XSS via location.hash (#9521)
		// Strict HTML recognition (#11290: must start with <)
		// Shortcut simple #id case for speed
		rquickExpr = /^(?:\s*(<[\w\W]+>)[^>]*|#([\w-]+))$/,

		init = jQuery.fn.init = function( selector, context, root ) {
			var match, elem;

			// HANDLE: $(""), $(null), $(undefined), $(false)
			if ( !selector ) {
				return this;
			}

			// Method init() accepts an alternate rootjQuery
			// so migrate can support jQuery.sub (gh-2101)
			root = root || rootjQuery;

			// Handle HTML strings
			if ( typeof selector === "string" ) {
				if ( selector[ 0 ] === "<" &&
					selector[ selector.length - 1 ] === ">" &&
					selector.length >= 3 ) {

					// Assume that strings that start and end with <> are HTML and skip the regex check
					match = [ null, selector, null ];

				} else {
					match = rquickExpr.exec( selector );
				}

				// Match html or make sure no context is specified for #id
				if ( match && ( match[ 1 ] || !context ) ) {

					// HANDLE: $(html) -> $(array)
					if ( match[ 1 ] ) {
						context = context instanceof jQuery ? context[ 0 ] : context;

						// Option to run scripts is true for back-compat
						// Intentionally let the error be thrown if parseHTML is not present
						jQuery.merge( this, jQuery.parseHTML(
							match[ 1 ],
							context && context.nodeType ? context.ownerDocument || context : document,
							true
						) );

						// HANDLE: $(html, props)
						if ( rsingleTag.test( match[ 1 ] ) && jQuery.isPlainObject( context ) ) {
							for ( match in context ) {

								// Properties of context are called as methods if possible
								if ( isFunction( this[ match ] ) ) {
									this[ match ]( context[ match ] );

								// ...and otherwise set as attributes
								} else {
									this.attr( match, context[ match ] );
								}
							}
						}

						return this;

					// HANDLE: $(#id)
					} else {
						elem = document.getElementById( match[ 2 ] );

						if ( elem ) {

							// Inject the element directly into the jQuery object
							this[ 0 ] = elem;
							this.length = 1;
						}
						return this;
					}

				// HANDLE: $(expr, $(...))
				} else if ( !context || context.jquery ) {
					return ( context || root ).find( selector );

				// HANDLE: $(expr, context)
				// (which is just equivalent to: $(context).find(expr)
				} else {
					return this.constructor( context ).find( selector );
				}

			// HANDLE: $(DOMElement)
			} else if ( selector.nodeType ) {
				this[ 0 ] = selector;
				this.length = 1;
				return this;

			// HANDLE: $(function)
			// Shortcut for document ready
			} else if ( isFunction( selector ) ) {
				return root.ready !== undefined ?
					root.ready( selector ) :

					// Execute immediately if ready is not present
					selector( jQuery );
			}

			return jQuery.makeArray( selector, this );
		};

	// Give the init function the jQuery prototype for later instantiation
	init.prototype = jQuery.fn;

	// Initialize central reference
	rootjQuery = jQuery( document );


	var rparentsprev = /^(?:parents|prev(?:Until|All))/,

		// Methods guaranteed to produce a unique set when starting from a unique set
		guaranteedUnique = {
			children: true,
			contents: true,
			next: true,
			prev: true
		};

	jQuery.fn.extend( {
		has: function( target ) {
			var targets = jQuery( target, this ),
				l = targets.length;

			return this.filter( function() {
				var i = 0;
				for ( ; i < l; i++ ) {
					if ( jQuery.contains( this, targets[ i ] ) ) {
						return true;
					}
				}
			} );
		},

		closest: function( selectors, context ) {
			var cur,
				i = 0,
				l = this.length,
				matched = [],
				targets = typeof selectors !== "string" && jQuery( selectors );

			// Positional selectors never match, since there's no _selection_ context
			if ( !rneedsContext.test( selectors ) ) {
				for ( ; i < l; i++ ) {
					for ( cur = this[ i ]; cur && cur !== context; cur = cur.parentNode ) {

						// Always skip document fragments
						if ( cur.nodeType < 11 && ( targets ?
							targets.index( cur ) > -1 :

							// Don't pass non-elements to Sizzle
							cur.nodeType === 1 &&
								jQuery.find.matchesSelector( cur, selectors ) ) ) {

							matched.push( cur );
							break;
						}
					}
				}
			}

			return this.pushStack( matched.length > 1 ? jQuery.uniqueSort( matched ) : matched );
		},

		// Determine the position of an element within the set
		index: function( elem ) {

			// No argument, return index in parent
			if ( !elem ) {
				return ( this[ 0 ] && this[ 0 ].parentNode ) ? this.first().prevAll().length : -1;
			}

			// Index in selector
			if ( typeof elem === "string" ) {
				return indexOf.call( jQuery( elem ), this[ 0 ] );
			}

			// Locate the position of the desired element
			return indexOf.call( this,

				// If it receives a jQuery object, the first element is used
				elem.jquery ? elem[ 0 ] : elem
			);
		},

		add: function( selector, context ) {
			return this.pushStack(
				jQuery.uniqueSort(
					jQuery.merge( this.get(), jQuery( selector, context ) )
				)
			);
		},

		addBack: function( selector ) {
			return this.add( selector == null ?
				this.prevObject : this.prevObject.filter( selector )
			);
		}
	} );

	function sibling( cur, dir ) {
		while ( ( cur = cur[ dir ] ) && cur.nodeType !== 1 ) {}
		return cur;
	}

	jQuery.each( {
		parent: function( elem ) {
			var parent = elem.parentNode;
			return parent && parent.nodeType !== 11 ? parent : null;
		},
		parents: function( elem ) {
			return dir( elem, "parentNode" );
		},
		parentsUntil: function( elem, _i, until ) {
			return dir( elem, "parentNode", until );
		},
		next: function( elem ) {
			return sibling( elem, "nextSibling" );
		},
		prev: function( elem ) {
			return sibling( elem, "previousSibling" );
		},
		nextAll: function( elem ) {
			return dir( elem, "nextSibling" );
		},
		prevAll: function( elem ) {
			return dir( elem, "previousSibling" );
		},
		nextUntil: function( elem, _i, until ) {
			return dir( elem, "nextSibling", until );
		},
		prevUntil: function( elem, _i, until ) {
			return dir( elem, "previousSibling", until );
		},
		siblings: function( elem ) {
			return siblings( ( elem.parentNode || {} ).firstChild, elem );
		},
		children: function( elem ) {
			return siblings( elem.firstChild );
		},
		contents: function( elem ) {
			if ( elem.contentDocument != null &&

				// Support: IE 11+
				// <object> elements with no `data` attribute has an object
				// `contentDocument` with a `null` prototype.
				getProto( elem.contentDocument ) ) {

				return elem.contentDocument;
			}

			// Support: IE 9 - 11 only, iOS 7 only, Android Browser <=4.3 only
			// Treat the template element as a regular one in browsers that
			// don't support it.
			if ( nodeName( elem, "template" ) ) {
				elem = elem.content || elem;
			}

			return jQuery.merge( [], elem.childNodes );
		}
	}, function( name, fn ) {
		jQuery.fn[ name ] = function( until, selector ) {
			var matched = jQuery.map( this, fn, until );

			if ( name.slice( -5 ) !== "Until" ) {
				selector = until;
			}

			if ( selector && typeof selector === "string" ) {
				matched = jQuery.filter( selector, matched );
			}

			if ( this.length > 1 ) {

				// Remove duplicates
				if ( !guaranteedUnique[ name ] ) {
					jQuery.uniqueSort( matched );
				}

				// Reverse order for parents* and prev-derivatives
				if ( rparentsprev.test( name ) ) {
					matched.reverse();
				}
			}

			return this.pushStack( matched );
		};
	} );
	var rnothtmlwhite = ( /[^\x20\t\r\n\f]+/g );



	// Convert String-formatted options into Object-formatted ones
	function createOptions( options ) {
		var object = {};
		jQuery.each( options.match( rnothtmlwhite ) || [], function( _, flag ) {
			object[ flag ] = true;
		} );
		return object;
	}

	/*
	 * Create a callback list using the following parameters:
	 *
	 *	options: an optional list of space-separated options that will change how
	 *			the callback list behaves or a more traditional option object
	 *
	 * By default a callback list will act like an event callback list and can be
	 * "fired" multiple times.
	 *
	 * Possible options:
	 *
	 *	once:			will ensure the callback list can only be fired once (like a Deferred)
	 *
	 *	memory:			will keep track of previous values and will call any callback added
	 *					after the list has been fired right away with the latest "memorized"
	 *					values (like a Deferred)
	 *
	 *	unique:			will ensure a callback can only be added once (no duplicate in the list)
	 *
	 *	stopOnFalse:	interrupt callings when a callback returns false
	 *
	 */
	jQuery.Callbacks = function( options ) {

		// Convert options from String-formatted to Object-formatted if needed
		// (we check in cache first)
		options = typeof options === "string" ?
			createOptions( options ) :
			jQuery.extend( {}, options );

		var // Flag to know if list is currently firing
			firing,

			// Last fire value for non-forgettable lists
			memory,

			// Flag to know if list was already fired
			fired,

			// Flag to prevent firing
			locked,

			// Actual callback list
			list = [],

			// Queue of execution data for repeatable lists
			queue = [],

			// Index of currently firing callback (modified by add/remove as needed)
			firingIndex = -1,

			// Fire callbacks
			fire = function() {

				// Enforce single-firing
				locked = locked || options.once;

				// Execute callbacks for all pending executions,
				// respecting firingIndex overrides and runtime changes
				fired = firing = true;
				for ( ; queue.length; firingIndex = -1 ) {
					memory = queue.shift();
					while ( ++firingIndex < list.length ) {

						// Run callback and check for early termination
						if ( list[ firingIndex ].apply( memory[ 0 ], memory[ 1 ] ) === false &&
							options.stopOnFalse ) {

							// Jump to end and forget the data so .add doesn't re-fire
							firingIndex = list.length;
							memory = false;
						}
					}
				}

				// Forget the data if we're done with it
				if ( !options.memory ) {
					memory = false;
				}

				firing = false;

				// Clean up if we're done firing for good
				if ( locked ) {

					// Keep an empty list if we have data for future add calls
					if ( memory ) {
						list = [];

					// Otherwise, this object is spent
					} else {
						list = "";
					}
				}
			},

			// Actual Callbacks object
			self = {

				// Add a callback or a collection of callbacks to the list
				add: function() {
					if ( list ) {

						// If we have memory from a past run, we should fire after adding
						if ( memory && !firing ) {
							firingIndex = list.length - 1;
							queue.push( memory );
						}

						( function add( args ) {
							jQuery.each( args, function( _, arg ) {
								if ( isFunction( arg ) ) {
									if ( !options.unique || !self.has( arg ) ) {
										list.push( arg );
									}
								} else if ( arg && arg.length && toType( arg ) !== "string" ) {

									// Inspect recursively
									add( arg );
								}
							} );
						} )( arguments );

						if ( memory && !firing ) {
							fire();
						}
					}
					return this;
				},

				// Remove a callback from the list
				remove: function() {
					jQuery.each( arguments, function( _, arg ) {
						var index;
						while ( ( index = jQuery.inArray( arg, list, index ) ) > -1 ) {
							list.splice( index, 1 );

							// Handle firing indexes
							if ( index <= firingIndex ) {
								firingIndex--;
							}
						}
					} );
					return this;
				},

				// Check if a given callback is in the list.
				// If no argument is given, return whether or not list has callbacks attached.
				has: function( fn ) {
					return fn ?
						jQuery.inArray( fn, list ) > -1 :
						list.length > 0;
				},

				// Remove all callbacks from the list
				empty: function() {
					if ( list ) {
						list = [];
					}
					return this;
				},

				// Disable .fire and .add
				// Abort any current/pending executions
				// Clear all callbacks and values
				disable: function() {
					locked = queue = [];
					list = memory = "";
					return this;
				},
				disabled: function() {
					return !list;
				},

				// Disable .fire
				// Also disable .add unless we have memory (since it would have no effect)
				// Abort any pending executions
				lock: function() {
					locked = queue = [];
					if ( !memory && !firing ) {
						list = memory = "";
					}
					return this;
				},
				locked: function() {
					return !!locked;
				},

				// Call all callbacks with the given context and arguments
				fireWith: function( context, args ) {
					if ( !locked ) {
						args = args || [];
						args = [ context, args.slice ? args.slice() : args ];
						queue.push( args );
						if ( !firing ) {
							fire();
						}
					}
					return this;
				},

				// Call all the callbacks with the given arguments
				fire: function() {
					self.fireWith( this, arguments );
					return this;
				},

				// To know if the callbacks have already been called at least once
				fired: function() {
					return !!fired;
				}
			};

		return self;
	};


	function Identity( v ) {
		return v;
	}
	function Thrower( ex ) {
		throw ex;
	}

	function adoptValue( value, resolve, reject, noValue ) {
		var method;

		try {

			// Check for promise aspect first to privilege synchronous behavior
			if ( value && isFunction( ( method = value.promise ) ) ) {
				method.call( value ).done( resolve ).fail( reject );

			// Other thenables
			} else if ( value && isFunction( ( method = value.then ) ) ) {
				method.call( value, resolve, reject );

			// Other non-thenables
			} else {

				// Control `resolve` arguments by letting Array#slice cast boolean `noValue` to integer:
				// * false: [ value ].slice( 0 ) => resolve( value )
				// * true: [ value ].slice( 1 ) => resolve()
				resolve.apply( undefined, [ value ].slice( noValue ) );
			}

		// For Promises/A+, convert exceptions into rejections
		// Since jQuery.when doesn't unwrap thenables, we can skip the extra checks appearing in
		// Deferred#then to conditionally suppress rejection.
		} catch ( value ) {

			// Support: Android 4.0 only
			// Strict mode functions invoked without .call/.apply get global-object context
			reject.apply( undefined, [ value ] );
		}
	}

	jQuery.extend( {

		Deferred: function( func ) {
			var tuples = [

					// action, add listener, callbacks,
					// ... .then handlers, argument index, [final state]
					[ "notify", "progress", jQuery.Callbacks( "memory" ),
						jQuery.Callbacks( "memory" ), 2 ],
					[ "resolve", "done", jQuery.Callbacks( "once memory" ),
						jQuery.Callbacks( "once memory" ), 0, "resolved" ],
					[ "reject", "fail", jQuery.Callbacks( "once memory" ),
						jQuery.Callbacks( "once memory" ), 1, "rejected" ]
				],
				state = "pending",
				promise = {
					state: function() {
						return state;
					},
					always: function() {
						deferred.done( arguments ).fail( arguments );
						return this;
					},
					"catch": function( fn ) {
						return promise.then( null, fn );
					},

					// Keep pipe for back-compat
					pipe: function( /* fnDone, fnFail, fnProgress */ ) {
						var fns = arguments;

						return jQuery.Deferred( function( newDefer ) {
							jQuery.each( tuples, function( _i, tuple ) {

								// Map tuples (progress, done, fail) to arguments (done, fail, progress)
								var fn = isFunction( fns[ tuple[ 4 ] ] ) && fns[ tuple[ 4 ] ];

								// deferred.progress(function() { bind to newDefer or newDefer.notify })
								// deferred.done(function() { bind to newDefer or newDefer.resolve })
								// deferred.fail(function() { bind to newDefer or newDefer.reject })
								deferred[ tuple[ 1 ] ]( function() {
									var returned = fn && fn.apply( this, arguments );
									if ( returned && isFunction( returned.promise ) ) {
										returned.promise()
											.progress( newDefer.notify )
											.done( newDefer.resolve )
											.fail( newDefer.reject );
									} else {
										newDefer[ tuple[ 0 ] + "With" ](
											this,
											fn ? [ returned ] : arguments
										);
									}
								} );
							} );
							fns = null;
						} ).promise();
					},
					then: function( onFulfilled, onRejected, onProgress ) {
						var maxDepth = 0;
						function resolve( depth, deferred, handler, special ) {
							return function() {
								var that = this,
									args = arguments,
									mightThrow = function() {
										var returned, then;

										// Support: Promises/A+ section 2.3.3.3.3
										// https://promisesaplus.com/#point-59
										// Ignore double-resolution attempts
										if ( depth < maxDepth ) {
											return;
										}

										returned = handler.apply( that, args );

										// Support: Promises/A+ section 2.3.1
										// https://promisesaplus.com/#point-48
										if ( returned === deferred.promise() ) {
											throw new TypeError( "Thenable self-resolution" );
										}

										// Support: Promises/A+ sections 2.3.3.1, 3.5
										// https://promisesaplus.com/#point-54
										// https://promisesaplus.com/#point-75
										// Retrieve `then` only once
										then = returned &&

											// Support: Promises/A+ section 2.3.4
											// https://promisesaplus.com/#point-64
											// Only check objects and functions for thenability
											( typeof returned === "object" ||
												typeof returned === "function" ) &&
											returned.then;

										// Handle a returned thenable
										if ( isFunction( then ) ) {

											// Special processors (notify) just wait for resolution
											if ( special ) {
												then.call(
													returned,
													resolve( maxDepth, deferred, Identity, special ),
													resolve( maxDepth, deferred, Thrower, special )
												);

											// Normal processors (resolve) also hook into progress
											} else {

												// ...and disregard older resolution values
												maxDepth++;

												then.call(
													returned,
													resolve( maxDepth, deferred, Identity, special ),
													resolve( maxDepth, deferred, Thrower, special ),
													resolve( maxDepth, deferred, Identity,
														deferred.notifyWith )
												);
											}

										// Handle all other returned values
										} else {

											// Only substitute handlers pass on context
											// and multiple values (non-spec behavior)
											if ( handler !== Identity ) {
												that = undefined;
												args = [ returned ];
											}

											// Process the value(s)
											// Default process is resolve
											( special || deferred.resolveWith )( that, args );
										}
									},

									// Only normal processors (resolve) catch and reject exceptions
									process = special ?
										mightThrow :
										function() {
											try {
												mightThrow();
											} catch ( e ) {

												if ( jQuery.Deferred.exceptionHook ) {
													jQuery.Deferred.exceptionHook( e,
														process.stackTrace );
												}

												// Support: Promises/A+ section 2.3.3.3.4.1
												// https://promisesaplus.com/#point-61
												// Ignore post-resolution exceptions
												if ( depth + 1 >= maxDepth ) {

													// Only substitute handlers pass on context
													// and multiple values (non-spec behavior)
													if ( handler !== Thrower ) {
														that = undefined;
														args = [ e ];
													}

													deferred.rejectWith( that, args );
												}
											}
										};

								// Support: Promises/A+ section 2.3.3.3.1
								// https://promisesaplus.com/#point-57
								// Re-resolve promises immediately to dodge false rejection from
								// subsequent errors
								if ( depth ) {
									process();
								} else {

									// Call an optional hook to record the stack, in case of exception
									// since it's otherwise lost when execution goes async
									if ( jQuery.Deferred.getStackHook ) {
										process.stackTrace = jQuery.Deferred.getStackHook();
									}
									window.setTimeout( process );
								}
							};
						}

						return jQuery.Deferred( function( newDefer ) {

							// progress_handlers.add( ... )
							tuples[ 0 ][ 3 ].add(
								resolve(
									0,
									newDefer,
									isFunction( onProgress ) ?
										onProgress :
										Identity,
									newDefer.notifyWith
								)
							);

							// fulfilled_handlers.add( ... )
							tuples[ 1 ][ 3 ].add(
								resolve(
									0,
									newDefer,
									isFunction( onFulfilled ) ?
										onFulfilled :
										Identity
								)
							);

							// rejected_handlers.add( ... )
							tuples[ 2 ][ 3 ].add(
								resolve(
									0,
									newDefer,
									isFunction( onRejected ) ?
										onRejected :
										Thrower
								)
							);
						} ).promise();
					},

					// Get a promise for this deferred
					// If obj is provided, the promise aspect is added to the object
					promise: function( obj ) {
						return obj != null ? jQuery.extend( obj, promise ) : promise;
					}
				},
				deferred = {};

			// Add list-specific methods
			jQuery.each( tuples, function( i, tuple ) {
				var list = tuple[ 2 ],
					stateString = tuple[ 5 ];

				// promise.progress = list.add
				// promise.done = list.add
				// promise.fail = list.add
				promise[ tuple[ 1 ] ] = list.add;

				// Handle state
				if ( stateString ) {
					list.add(
						function() {

							// state = "resolved" (i.e., fulfilled)
							// state = "rejected"
							state = stateString;
						},

						// rejected_callbacks.disable
						// fulfilled_callbacks.disable
						tuples[ 3 - i ][ 2 ].disable,

						// rejected_handlers.disable
						// fulfilled_handlers.disable
						tuples[ 3 - i ][ 3 ].disable,

						// progress_callbacks.lock
						tuples[ 0 ][ 2 ].lock,

						// progress_handlers.lock
						tuples[ 0 ][ 3 ].lock
					);
				}

				// progress_handlers.fire
				// fulfilled_handlers.fire
				// rejected_handlers.fire
				list.add( tuple[ 3 ].fire );

				// deferred.notify = function() { deferred.notifyWith(...) }
				// deferred.resolve = function() { deferred.resolveWith(...) }
				// deferred.reject = function() { deferred.rejectWith(...) }
				deferred[ tuple[ 0 ] ] = function() {
					deferred[ tuple[ 0 ] + "With" ]( this === deferred ? undefined : this, arguments );
					return this;
				};

				// deferred.notifyWith = list.fireWith
				// deferred.resolveWith = list.fireWith
				// deferred.rejectWith = list.fireWith
				deferred[ tuple[ 0 ] + "With" ] = list.fireWith;
			} );

			// Make the deferred a promise
			promise.promise( deferred );

			// Call given func if any
			if ( func ) {
				func.call( deferred, deferred );
			}

			// All done!
			return deferred;
		},

		// Deferred helper
		when: function( singleValue ) {
			var

				// count of uncompleted subordinates
				remaining = arguments.length,

				// count of unprocessed arguments
				i = remaining,

				// subordinate fulfillment data
				resolveContexts = Array( i ),
				resolveValues = slice.call( arguments ),

				// the master Deferred
				master = jQuery.Deferred(),

				// subordinate callback factory
				updateFunc = function( i ) {
					return function( value ) {
						resolveContexts[ i ] = this;
						resolveValues[ i ] = arguments.length > 1 ? slice.call( arguments ) : value;
						if ( !( --remaining ) ) {
							master.resolveWith( resolveContexts, resolveValues );
						}
					};
				};

			// Single- and empty arguments are adopted like Promise.resolve
			if ( remaining <= 1 ) {
				adoptValue( singleValue, master.done( updateFunc( i ) ).resolve, master.reject,
					!remaining );

				// Use .then() to unwrap secondary thenables (cf. gh-3000)
				if ( master.state() === "pending" ||
					isFunction( resolveValues[ i ] && resolveValues[ i ].then ) ) {

					return master.then();
				}
			}

			// Multiple arguments are aggregated like Promise.all array elements
			while ( i-- ) {
				adoptValue( resolveValues[ i ], updateFunc( i ), master.reject );
			}

			return master.promise();
		}
	} );


	// These usually indicate a programmer mistake during development,
	// warn about them ASAP rather than swallowing them by default.
	var rerrorNames = /^(Eval|Internal|Range|Reference|Syntax|Type|URI)Error$/;

	jQuery.Deferred.exceptionHook = function( error, stack ) {

		// Support: IE 8 - 9 only
		// Console exists when dev tools are open, which can happen at any time
		if ( window.console && window.console.warn && error && rerrorNames.test( error.name ) ) {
			window.console.warn( "jQuery.Deferred exception: " + error.message, error.stack, stack );
		}
	};




	jQuery.readyException = function( error ) {
		window.setTimeout( function() {
			throw error;
		} );
	};




	// The deferred used on DOM ready
	var readyList = jQuery.Deferred();

	jQuery.fn.ready = function( fn ) {

		readyList
			.then( fn )

			// Wrap jQuery.readyException in a function so that the lookup
			// happens at the time of error handling instead of callback
			// registration.
			.catch( function( error ) {
				jQuery.readyException( error );
			} );

		return this;
	};

	jQuery.extend( {

		// Is the DOM ready to be used? Set to true once it occurs.
		isReady: false,

		// A counter to track how many items to wait for before
		// the ready event fires. See #6781
		readyWait: 1,

		// Handle when the DOM is ready
		ready: function( wait ) {

			// Abort if there are pending holds or we're already ready
			if ( wait === true ? --jQuery.readyWait : jQuery.isReady ) {
				return;
			}

			// Remember that the DOM is ready
			jQuery.isReady = true;

			// If a normal DOM Ready event fired, decrement, and wait if need be
			if ( wait !== true && --jQuery.readyWait > 0 ) {
				return;
			}

			// If there are functions bound, to execute
			readyList.resolveWith( document, [ jQuery ] );
		}
	} );

	jQuery.ready.then = readyList.then;

	// The ready event handler and self cleanup method
	function completed() {
		document.removeEventListener( "DOMContentLoaded", completed );
		window.removeEventListener( "load", completed );
		jQuery.ready();
	}

	// Catch cases where $(document).ready() is called
	// after the browser event has already occurred.
	// Support: IE <=9 - 10 only
	// Older IE sometimes signals "interactive" too soon
	if ( document.readyState === "complete" ||
		( document.readyState !== "loading" && !document.documentElement.doScroll ) ) {

		// Handle it asynchronously to allow scripts the opportunity to delay ready
		window.setTimeout( jQuery.ready );

	} else {

		// Use the handy event callback
		document.addEventListener( "DOMContentLoaded", completed );

		// A fallback to window.onload, that will always work
		window.addEventListener( "load", completed );
	}




	// Multifunctional method to get and set values of a collection
	// The value/s can optionally be executed if it's a function
	var access = function( elems, fn, key, value, chainable, emptyGet, raw ) {
		var i = 0,
			len = elems.length,
			bulk = key == null;

		// Sets many values
		if ( toType( key ) === "object" ) {
			chainable = true;
			for ( i in key ) {
				access( elems, fn, i, key[ i ], true, emptyGet, raw );
			}

		// Sets one value
		} else if ( value !== undefined ) {
			chainable = true;

			if ( !isFunction( value ) ) {
				raw = true;
			}

			if ( bulk ) {

				// Bulk operations run against the entire set
				if ( raw ) {
					fn.call( elems, value );
					fn = null;

				// ...except when executing function values
				} else {
					bulk = fn;
					fn = function( elem, _key, value ) {
						return bulk.call( jQuery( elem ), value );
					};
				}
			}

			if ( fn ) {
				for ( ; i < len; i++ ) {
					fn(
						elems[ i ], key, raw ?
						value :
						value.call( elems[ i ], i, fn( elems[ i ], key ) )
					);
				}
			}
		}

		if ( chainable ) {
			return elems;
		}

		// Gets
		if ( bulk ) {
			return fn.call( elems );
		}

		return len ? fn( elems[ 0 ], key ) : emptyGet;
	};


	// Matches dashed string for camelizing
	var rmsPrefix = /^-ms-/,
		rdashAlpha = /-([a-z])/g;

	// Used by camelCase as callback to replace()
	function fcamelCase( _all, letter ) {
		return letter.toUpperCase();
	}

	// Convert dashed to camelCase; used by the css and data modules
	// Support: IE <=9 - 11, Edge 12 - 15
	// Microsoft forgot to hump their vendor prefix (#9572)
	function camelCase( string ) {
		return string.replace( rmsPrefix, "ms-" ).replace( rdashAlpha, fcamelCase );
	}
	var acceptData = function( owner ) {

		// Accepts only:
		//  - Node
		//    - Node.ELEMENT_NODE
		//    - Node.DOCUMENT_NODE
		//  - Object
		//    - Any
		return owner.nodeType === 1 || owner.nodeType === 9 || !( +owner.nodeType );
	};




	function Data() {
		this.expando = jQuery.expando + Data.uid++;
	}

	Data.uid = 1;

	Data.prototype = {

		cache: function( owner ) {

			// Check if the owner object already has a cache
			var value = owner[ this.expando ];

			// If not, create one
			if ( !value ) {
				value = {};

				// We can accept data for non-element nodes in modern browsers,
				// but we should not, see #8335.
				// Always return an empty object.
				if ( acceptData( owner ) ) {

					// If it is a node unlikely to be stringify-ed or looped over
					// use plain assignment
					if ( owner.nodeType ) {
						owner[ this.expando ] = value;

					// Otherwise secure it in a non-enumerable property
					// configurable must be true to allow the property to be
					// deleted when data is removed
					} else {
						Object.defineProperty( owner, this.expando, {
							value: value,
							configurable: true
						} );
					}
				}
			}

			return value;
		},
		set: function( owner, data, value ) {
			var prop,
				cache = this.cache( owner );

			// Handle: [ owner, key, value ] args
			// Always use camelCase key (gh-2257)
			if ( typeof data === "string" ) {
				cache[ camelCase( data ) ] = value;

			// Handle: [ owner, { properties } ] args
			} else {

				// Copy the properties one-by-one to the cache object
				for ( prop in data ) {
					cache[ camelCase( prop ) ] = data[ prop ];
				}
			}
			return cache;
		},
		get: function( owner, key ) {
			return key === undefined ?
				this.cache( owner ) :

				// Always use camelCase key (gh-2257)
				owner[ this.expando ] && owner[ this.expando ][ camelCase( key ) ];
		},
		access: function( owner, key, value ) {

			// In cases where either:
			//
			//   1. No key was specified
			//   2. A string key was specified, but no value provided
			//
			// Take the "read" path and allow the get method to determine
			// which value to return, respectively either:
			//
			//   1. The entire cache object
			//   2. The data stored at the key
			//
			if ( key === undefined ||
					( ( key && typeof key === "string" ) && value === undefined ) ) {

				return this.get( owner, key );
			}

			// When the key is not a string, or both a key and value
			// are specified, set or extend (existing objects) with either:
			//
			//   1. An object of properties
			//   2. A key and value
			//
			this.set( owner, key, value );

			// Since the "set" path can have two possible entry points
			// return the expected data based on which path was taken[*]
			return value !== undefined ? value : key;
		},
		remove: function( owner, key ) {
			var i,
				cache = owner[ this.expando ];

			if ( cache === undefined ) {
				return;
			}

			if ( key !== undefined ) {

				// Support array or space separated string of keys
				if ( Array.isArray( key ) ) {

					// If key is an array of keys...
					// We always set camelCase keys, so remove that.
					key = key.map( camelCase );
				} else {
					key = camelCase( key );

					// If a key with the spaces exists, use it.
					// Otherwise, create an array by matching non-whitespace
					key = key in cache ?
						[ key ] :
						( key.match( rnothtmlwhite ) || [] );
				}

				i = key.length;

				while ( i-- ) {
					delete cache[ key[ i ] ];
				}
			}

			// Remove the expando if there's no more data
			if ( key === undefined || jQuery.isEmptyObject( cache ) ) {

				// Support: Chrome <=35 - 45
				// Webkit & Blink performance suffers when deleting properties
				// from DOM nodes, so set to undefined instead
				// https://bugs.chromium.org/p/chromium/issues/detail?id=378607 (bug restricted)
				if ( owner.nodeType ) {
					owner[ this.expando ] = undefined;
				} else {
					delete owner[ this.expando ];
				}
			}
		},
		hasData: function( owner ) {
			var cache = owner[ this.expando ];
			return cache !== undefined && !jQuery.isEmptyObject( cache );
		}
	};
	var dataPriv = new Data();

	var dataUser = new Data();



	//	Implementation Summary
	//
	//	1. Enforce API surface and semantic compatibility with 1.9.x branch
	//	2. Improve the module's maintainability by reducing the storage
	//		paths to a single mechanism.
	//	3. Use the same single mechanism to support "private" and "user" data.
	//	4. _Never_ expose "private" data to user code (TODO: Drop _data, _removeData)
	//	5. Avoid exposing implementation details on user objects (eg. expando properties)
	//	6. Provide a clear path for implementation upgrade to WeakMap in 2014

	var rbrace = /^(?:\{[\w\W]*\}|\[[\w\W]*\])$/,
		rmultiDash = /[A-Z]/g;

	function getData( data ) {
		if ( data === "true" ) {
			return true;
		}

		if ( data === "false" ) {
			return false;
		}

		if ( data === "null" ) {
			return null;
		}

		// Only convert to a number if it doesn't change the string
		if ( data === +data + "" ) {
			return +data;
		}

		if ( rbrace.test( data ) ) {
			return JSON.parse( data );
		}

		return data;
	}

	function dataAttr( elem, key, data ) {
		var name;

		// If nothing was found internally, try to fetch any
		// data from the HTML5 data-* attribute
		if ( data === undefined && elem.nodeType === 1 ) {
			name = "data-" + key.replace( rmultiDash, "-$&" ).toLowerCase();
			data = elem.getAttribute( name );

			if ( typeof data === "string" ) {
				try {
					data = getData( data );
				} catch ( e ) {}

				// Make sure we set the data so it isn't changed later
				dataUser.set( elem, key, data );
			} else {
				data = undefined;
			}
		}
		return data;
	}

	jQuery.extend( {
		hasData: function( elem ) {
			return dataUser.hasData( elem ) || dataPriv.hasData( elem );
		},

		data: function( elem, name, data ) {
			return dataUser.access( elem, name, data );
		},

		removeData: function( elem, name ) {
			dataUser.remove( elem, name );
		},

		// TODO: Now that all calls to _data and _removeData have been replaced
		// with direct calls to dataPriv methods, these can be deprecated.
		_data: function( elem, name, data ) {
			return dataPriv.access( elem, name, data );
		},

		_removeData: function( elem, name ) {
			dataPriv.remove( elem, name );
		}
	} );

	jQuery.fn.extend( {
		data: function( key, value ) {
			var i, name, data,
				elem = this[ 0 ],
				attrs = elem && elem.attributes;

			// Gets all values
			if ( key === undefined ) {
				if ( this.length ) {
					data = dataUser.get( elem );

					if ( elem.nodeType === 1 && !dataPriv.get( elem, "hasDataAttrs" ) ) {
						i = attrs.length;
						while ( i-- ) {

							// Support: IE 11 only
							// The attrs elements can be null (#14894)
							if ( attrs[ i ] ) {
								name = attrs[ i ].name;
								if ( name.indexOf( "data-" ) === 0 ) {
									name = camelCase( name.slice( 5 ) );
									dataAttr( elem, name, data[ name ] );
								}
							}
						}
						dataPriv.set( elem, "hasDataAttrs", true );
					}
				}

				return data;
			}

			// Sets multiple values
			if ( typeof key === "object" ) {
				return this.each( function() {
					dataUser.set( this, key );
				} );
			}

			return access( this, function( value ) {
				var data;

				// The calling jQuery object (element matches) is not empty
				// (and therefore has an element appears at this[ 0 ]) and the
				// `value` parameter was not undefined. An empty jQuery object
				// will result in `undefined` for elem = this[ 0 ] which will
				// throw an exception if an attempt to read a data cache is made.
				if ( elem && value === undefined ) {

					// Attempt to get data from the cache
					// The key will always be camelCased in Data
					data = dataUser.get( elem, key );
					if ( data !== undefined ) {
						return data;
					}

					// Attempt to "discover" the data in
					// HTML5 custom data-* attrs
					data = dataAttr( elem, key );
					if ( data !== undefined ) {
						return data;
					}

					// We tried really hard, but the data doesn't exist.
					return;
				}

				// Set the data...
				this.each( function() {

					// We always store the camelCased key
					dataUser.set( this, key, value );
				} );
			}, null, value, arguments.length > 1, null, true );
		},

		removeData: function( key ) {
			return this.each( function() {
				dataUser.remove( this, key );
			} );
		}
	} );


	jQuery.extend( {
		queue: function( elem, type, data ) {
			var queue;

			if ( elem ) {
				type = ( type || "fx" ) + "queue";
				queue = dataPriv.get( elem, type );

				// Speed up dequeue by getting out quickly if this is just a lookup
				if ( data ) {
					if ( !queue || Array.isArray( data ) ) {
						queue = dataPriv.access( elem, type, jQuery.makeArray( data ) );
					} else {
						queue.push( data );
					}
				}
				return queue || [];
			}
		},

		dequeue: function( elem, type ) {
			type = type || "fx";

			var queue = jQuery.queue( elem, type ),
				startLength = queue.length,
				fn = queue.shift(),
				hooks = jQuery._queueHooks( elem, type ),
				next = function() {
					jQuery.dequeue( elem, type );
				};

			// If the fx queue is dequeued, always remove the progress sentinel
			if ( fn === "inprogress" ) {
				fn = queue.shift();
				startLength--;
			}

			if ( fn ) {

				// Add a progress sentinel to prevent the fx queue from being
				// automatically dequeued
				if ( type === "fx" ) {
					queue.unshift( "inprogress" );
				}

				// Clear up the last queue stop function
				delete hooks.stop;
				fn.call( elem, next, hooks );
			}

			if ( !startLength && hooks ) {
				hooks.empty.fire();
			}
		},

		// Not public - generate a queueHooks object, or return the current one
		_queueHooks: function( elem, type ) {
			var key = type + "queueHooks";
			return dataPriv.get( elem, key ) || dataPriv.access( elem, key, {
				empty: jQuery.Callbacks( "once memory" ).add( function() {
					dataPriv.remove( elem, [ type + "queue", key ] );
				} )
			} );
		}
	} );

	jQuery.fn.extend( {
		queue: function( type, data ) {
			var setter = 2;

			if ( typeof type !== "string" ) {
				data = type;
				type = "fx";
				setter--;
			}

			if ( arguments.length < setter ) {
				return jQuery.queue( this[ 0 ], type );
			}

			return data === undefined ?
				this :
				this.each( function() {
					var queue = jQuery.queue( this, type, data );

					// Ensure a hooks for this queue
					jQuery._queueHooks( this, type );

					if ( type === "fx" && queue[ 0 ] !== "inprogress" ) {
						jQuery.dequeue( this, type );
					}
				} );
		},
		dequeue: function( type ) {
			return this.each( function() {
				jQuery.dequeue( this, type );
			} );
		},
		clearQueue: function( type ) {
			return this.queue( type || "fx", [] );
		},

		// Get a promise resolved when queues of a certain type
		// are emptied (fx is the type by default)
		promise: function( type, obj ) {
			var tmp,
				count = 1,
				defer = jQuery.Deferred(),
				elements = this,
				i = this.length,
				resolve = function() {
					if ( !( --count ) ) {
						defer.resolveWith( elements, [ elements ] );
					}
				};

			if ( typeof type !== "string" ) {
				obj = type;
				type = undefined;
			}
			type = type || "fx";

			while ( i-- ) {
				tmp = dataPriv.get( elements[ i ], type + "queueHooks" );
				if ( tmp && tmp.empty ) {
					count++;
					tmp.empty.add( resolve );
				}
			}
			resolve();
			return defer.promise( obj );
		}
	} );
	var pnum = ( /[+-]?(?:\d*\.|)\d+(?:[eE][+-]?\d+|)/ ).source;

	var rcssNum = new RegExp( "^(?:([+-])=|)(" + pnum + ")([a-z%]*)$", "i" );


	var cssExpand = [ "Top", "Right", "Bottom", "Left" ];

	var documentElement = document.documentElement;



		var isAttached = function( elem ) {
				return jQuery.contains( elem.ownerDocument, elem );
			},
			composed = { composed: true };

		// Support: IE 9 - 11+, Edge 12 - 18+, iOS 10.0 - 10.2 only
		// Check attachment across shadow DOM boundaries when possible (gh-3504)
		// Support: iOS 10.0-10.2 only
		// Early iOS 10 versions support `attachShadow` but not `getRootNode`,
		// leading to errors. We need to check for `getRootNode`.
		if ( documentElement.getRootNode ) {
			isAttached = function( elem ) {
				return jQuery.contains( elem.ownerDocument, elem ) ||
					elem.getRootNode( composed ) === elem.ownerDocument;
			};
		}
	var isHiddenWithinTree = function( elem, el ) {

			// isHiddenWithinTree might be called from jQuery#filter function;
			// in that case, element will be second argument
			elem = el || elem;

			// Inline style trumps all
			return elem.style.display === "none" ||
				elem.style.display === "" &&

				// Otherwise, check computed style
				// Support: Firefox <=43 - 45
				// Disconnected elements can have computed display: none, so first confirm that elem is
				// in the document.
				isAttached( elem ) &&

				jQuery.css( elem, "display" ) === "none";
		};



	function adjustCSS( elem, prop, valueParts, tween ) {
		var adjusted, scale,
			maxIterations = 20,
			currentValue = tween ?
				function() {
					return tween.cur();
				} :
				function() {
					return jQuery.css( elem, prop, "" );
				},
			initial = currentValue(),
			unit = valueParts && valueParts[ 3 ] || ( jQuery.cssNumber[ prop ] ? "" : "px" ),

			// Starting value computation is required for potential unit mismatches
			initialInUnit = elem.nodeType &&
				( jQuery.cssNumber[ prop ] || unit !== "px" && +initial ) &&
				rcssNum.exec( jQuery.css( elem, prop ) );

		if ( initialInUnit && initialInUnit[ 3 ] !== unit ) {

			// Support: Firefox <=54
			// Halve the iteration target value to prevent interference from CSS upper bounds (gh-2144)
			initial = initial / 2;

			// Trust units reported by jQuery.css
			unit = unit || initialInUnit[ 3 ];

			// Iteratively approximate from a nonzero starting point
			initialInUnit = +initial || 1;

			while ( maxIterations-- ) {

				// Evaluate and update our best guess (doubling guesses that zero out).
				// Finish if the scale equals or crosses 1 (making the old*new product non-positive).
				jQuery.style( elem, prop, initialInUnit + unit );
				if ( ( 1 - scale ) * ( 1 - ( scale = currentValue() / initial || 0.5 ) ) <= 0 ) {
					maxIterations = 0;
				}
				initialInUnit = initialInUnit / scale;

			}

			initialInUnit = initialInUnit * 2;
			jQuery.style( elem, prop, initialInUnit + unit );

			// Make sure we update the tween properties later on
			valueParts = valueParts || [];
		}

		if ( valueParts ) {
			initialInUnit = +initialInUnit || +initial || 0;

			// Apply relative offset (+=/-=) if specified
			adjusted = valueParts[ 1 ] ?
				initialInUnit + ( valueParts[ 1 ] + 1 ) * valueParts[ 2 ] :
				+valueParts[ 2 ];
			if ( tween ) {
				tween.unit = unit;
				tween.start = initialInUnit;
				tween.end = adjusted;
			}
		}
		return adjusted;
	}


	var defaultDisplayMap = {};

	function getDefaultDisplay( elem ) {
		var temp,
			doc = elem.ownerDocument,
			nodeName = elem.nodeName,
			display = defaultDisplayMap[ nodeName ];

		if ( display ) {
			return display;
		}

		temp = doc.body.appendChild( doc.createElement( nodeName ) );
		display = jQuery.css( temp, "display" );

		temp.parentNode.removeChild( temp );

		if ( display === "none" ) {
			display = "block";
		}
		defaultDisplayMap[ nodeName ] = display;

		return display;
	}

	function showHide( elements, show ) {
		var display, elem,
			values = [],
			index = 0,
			length = elements.length;

		// Determine new display value for elements that need to change
		for ( ; index < length; index++ ) {
			elem = elements[ index ];
			if ( !elem.style ) {
				continue;
			}

			display = elem.style.display;
			if ( show ) {

				// Since we force visibility upon cascade-hidden elements, an immediate (and slow)
				// check is required in this first loop unless we have a nonempty display value (either
				// inline or about-to-be-restored)
				if ( display === "none" ) {
					values[ index ] = dataPriv.get( elem, "display" ) || null;
					if ( !values[ index ] ) {
						elem.style.display = "";
					}
				}
				if ( elem.style.display === "" && isHiddenWithinTree( elem ) ) {
					values[ index ] = getDefaultDisplay( elem );
				}
			} else {
				if ( display !== "none" ) {
					values[ index ] = "none";

					// Remember what we're overwriting
					dataPriv.set( elem, "display", display );
				}
			}
		}

		// Set the display of the elements in a second loop to avoid constant reflow
		for ( index = 0; index < length; index++ ) {
			if ( values[ index ] != null ) {
				elements[ index ].style.display = values[ index ];
			}
		}

		return elements;
	}

	jQuery.fn.extend( {
		show: function() {
			return showHide( this, true );
		},
		hide: function() {
			return showHide( this );
		},
		toggle: function( state ) {
			if ( typeof state === "boolean" ) {
				return state ? this.show() : this.hide();
			}

			return this.each( function() {
				if ( isHiddenWithinTree( this ) ) {
					jQuery( this ).show();
				} else {
					jQuery( this ).hide();
				}
			} );
		}
	} );
	var rcheckableType = ( /^(?:checkbox|radio)$/i );

	var rtagName = ( /<([a-z][^\/\0>\x20\t\r\n\f]*)/i );

	var rscriptType = ( /^$|^module$|\/(?:java|ecma)script/i );



	( function() {
		var fragment = document.createDocumentFragment(),
			div = fragment.appendChild( document.createElement( "div" ) ),
			input = document.createElement( "input" );

		// Support: Android 4.0 - 4.3 only
		// Check state lost if the name is set (#11217)
		// Support: Windows Web Apps (WWA)
		// `name` and `type` must use .setAttribute for WWA (#14901)
		input.setAttribute( "type", "radio" );
		input.setAttribute( "checked", "checked" );
		input.setAttribute( "name", "t" );

		div.appendChild( input );

		// Support: Android <=4.1 only
		// Older WebKit doesn't clone checked state correctly in fragments
		support.checkClone = div.cloneNode( true ).cloneNode( true ).lastChild.checked;

		// Support: IE <=11 only
		// Make sure textarea (and checkbox) defaultValue is properly cloned
		div.innerHTML = "<textarea>x</textarea>";
		support.noCloneChecked = !!div.cloneNode( true ).lastChild.defaultValue;

		// Support: IE <=9 only
		// IE <=9 replaces <option> tags with their contents when inserted outside of
		// the select element.
		div.innerHTML = "<option></option>";
		support.option = !!div.lastChild;
	} )();


	// We have to close these tags to support XHTML (#13200)
	var wrapMap = {

		// XHTML parsers do not magically insert elements in the
		// same way that tag soup parsers do. So we cannot shorten
		// this by omitting <tbody> or other required elements.
		thead: [ 1, "<table>", "</table>" ],
		col: [ 2, "<table><colgroup>", "</colgroup></table>" ],
		tr: [ 2, "<table><tbody>", "</tbody></table>" ],
		td: [ 3, "<table><tbody><tr>", "</tr></tbody></table>" ],

		_default: [ 0, "", "" ]
	};

	wrapMap.tbody = wrapMap.tfoot = wrapMap.colgroup = wrapMap.caption = wrapMap.thead;
	wrapMap.th = wrapMap.td;

	// Support: IE <=9 only
	if ( !support.option ) {
		wrapMap.optgroup = wrapMap.option = [ 1, "<select multiple='multiple'>", "</select>" ];
	}


	function getAll( context, tag ) {

		// Support: IE <=9 - 11 only
		// Use typeof to avoid zero-argument method invocation on host objects (#15151)
		var ret;

		if ( typeof context.getElementsByTagName !== "undefined" ) {
			ret = context.getElementsByTagName( tag || "*" );

		} else if ( typeof context.querySelectorAll !== "undefined" ) {
			ret = context.querySelectorAll( tag || "*" );

		} else {
			ret = [];
		}

		if ( tag === undefined || tag && nodeName( context, tag ) ) {
			return jQuery.merge( [ context ], ret );
		}

		return ret;
	}


	// Mark scripts as having already been evaluated
	function setGlobalEval( elems, refElements ) {
		var i = 0,
			l = elems.length;

		for ( ; i < l; i++ ) {
			dataPriv.set(
				elems[ i ],
				"globalEval",
				!refElements || dataPriv.get( refElements[ i ], "globalEval" )
			);
		}
	}


	var rhtml = /<|&#?\w+;/;

	function buildFragment( elems, context, scripts, selection, ignored ) {
		var elem, tmp, tag, wrap, attached, j,
			fragment = context.createDocumentFragment(),
			nodes = [],
			i = 0,
			l = elems.length;

		for ( ; i < l; i++ ) {
			elem = elems[ i ];

			if ( elem || elem === 0 ) {

				// Add nodes directly
				if ( toType( elem ) === "object" ) {

					// Support: Android <=4.0 only, PhantomJS 1 only
					// push.apply(_, arraylike) throws on ancient WebKit
					jQuery.merge( nodes, elem.nodeType ? [ elem ] : elem );

				// Convert non-html into a text node
				} else if ( !rhtml.test( elem ) ) {
					nodes.push( context.createTextNode( elem ) );

				// Convert html into DOM nodes
				} else {
					tmp = tmp || fragment.appendChild( context.createElement( "div" ) );

					// Deserialize a standard representation
					tag = ( rtagName.exec( elem ) || [ "", "" ] )[ 1 ].toLowerCase();
					wrap = wrapMap[ tag ] || wrapMap._default;
					tmp.innerHTML = wrap[ 1 ] + jQuery.htmlPrefilter( elem ) + wrap[ 2 ];

					// Descend through wrappers to the right content
					j = wrap[ 0 ];
					while ( j-- ) {
						tmp = tmp.lastChild;
					}

					// Support: Android <=4.0 only, PhantomJS 1 only
					// push.apply(_, arraylike) throws on ancient WebKit
					jQuery.merge( nodes, tmp.childNodes );

					// Remember the top-level container
					tmp = fragment.firstChild;

					// Ensure the created nodes are orphaned (#12392)
					tmp.textContent = "";
				}
			}
		}

		// Remove wrapper from fragment
		fragment.textContent = "";

		i = 0;
		while ( ( elem = nodes[ i++ ] ) ) {

			// Skip elements already in the context collection (trac-4087)
			if ( selection && jQuery.inArray( elem, selection ) > -1 ) {
				if ( ignored ) {
					ignored.push( elem );
				}
				continue;
			}

			attached = isAttached( elem );

			// Append to fragment
			tmp = getAll( fragment.appendChild( elem ), "script" );

			// Preserve script evaluation history
			if ( attached ) {
				setGlobalEval( tmp );
			}

			// Capture executables
			if ( scripts ) {
				j = 0;
				while ( ( elem = tmp[ j++ ] ) ) {
					if ( rscriptType.test( elem.type || "" ) ) {
						scripts.push( elem );
					}
				}
			}
		}

		return fragment;
	}


	var
		rkeyEvent = /^key/,
		rmouseEvent = /^(?:mouse|pointer|contextmenu|drag|drop)|click/,
		rtypenamespace = /^([^.]*)(?:\.(.+)|)/;

	function returnTrue() {
		return true;
	}

	function returnFalse() {
		return false;
	}

	// Support: IE <=9 - 11+
	// focus() and blur() are asynchronous, except when they are no-op.
	// So expect focus to be synchronous when the element is already active,
	// and blur to be synchronous when the element is not already active.
	// (focus and blur are always synchronous in other supported browsers,
	// this just defines when we can count on it).
	function expectSync( elem, type ) {
		return ( elem === safeActiveElement() ) === ( type === "focus" );
	}

	// Support: IE <=9 only
	// Accessing document.activeElement can throw unexpectedly
	// https://bugs.jquery.com/ticket/13393
	function safeActiveElement() {
		try {
			return document.activeElement;
		} catch ( err ) { }
	}

	function on( elem, types, selector, data, fn, one ) {
		var origFn, type;

		// Types can be a map of types/handlers
		if ( typeof types === "object" ) {

			// ( types-Object, selector, data )
			if ( typeof selector !== "string" ) {

				// ( types-Object, data )
				data = data || selector;
				selector = undefined;
			}
			for ( type in types ) {
				on( elem, type, selector, data, types[ type ], one );
			}
			return elem;
		}

		if ( data == null && fn == null ) {

			// ( types, fn )
			fn = selector;
			data = selector = undefined;
		} else if ( fn == null ) {
			if ( typeof selector === "string" ) {

				// ( types, selector, fn )
				fn = data;
				data = undefined;
			} else {

				// ( types, data, fn )
				fn = data;
				data = selector;
				selector = undefined;
			}
		}
		if ( fn === false ) {
			fn = returnFalse;
		} else if ( !fn ) {
			return elem;
		}

		if ( one === 1 ) {
			origFn = fn;
			fn = function( event ) {

				// Can use an empty set, since event contains the info
				jQuery().off( event );
				return origFn.apply( this, arguments );
			};

			// Use same guid so caller can remove using origFn
			fn.guid = origFn.guid || ( origFn.guid = jQuery.guid++ );
		}
		return elem.each( function() {
			jQuery.event.add( this, types, fn, data, selector );
		} );
	}

	/*
	 * Helper functions for managing events -- not part of the public interface.
	 * Props to Dean Edwards' addEvent library for many of the ideas.
	 */
	jQuery.event = {

		global: {},

		add: function( elem, types, handler, data, selector ) {

			var handleObjIn, eventHandle, tmp,
				events, t, handleObj,
				special, handlers, type, namespaces, origType,
				elemData = dataPriv.get( elem );

			// Only attach events to objects that accept data
			if ( !acceptData( elem ) ) {
				return;
			}

			// Caller can pass in an object of custom data in lieu of the handler
			if ( handler.handler ) {
				handleObjIn = handler;
				handler = handleObjIn.handler;
				selector = handleObjIn.selector;
			}

			// Ensure that invalid selectors throw exceptions at attach time
			// Evaluate against documentElement in case elem is a non-element node (e.g., document)
			if ( selector ) {
				jQuery.find.matchesSelector( documentElement, selector );
			}

			// Make sure that the handler has a unique ID, used to find/remove it later
			if ( !handler.guid ) {
				handler.guid = jQuery.guid++;
			}

			// Init the element's event structure and main handler, if this is the first
			if ( !( events = elemData.events ) ) {
				events = elemData.events = Object.create( null );
			}
			if ( !( eventHandle = elemData.handle ) ) {
				eventHandle = elemData.handle = function( e ) {

					// Discard the second event of a jQuery.event.trigger() and
					// when an event is called after a page has unloaded
					return typeof jQuery !== "undefined" && jQuery.event.triggered !== e.type ?
						jQuery.event.dispatch.apply( elem, arguments ) : undefined;
				};
			}

			// Handle multiple events separated by a space
			types = ( types || "" ).match( rnothtmlwhite ) || [ "" ];
			t = types.length;
			while ( t-- ) {
				tmp = rtypenamespace.exec( types[ t ] ) || [];
				type = origType = tmp[ 1 ];
				namespaces = ( tmp[ 2 ] || "" ).split( "." ).sort();

				// There *must* be a type, no attaching namespace-only handlers
				if ( !type ) {
					continue;
				}

				// If event changes its type, use the special event handlers for the changed type
				special = jQuery.event.special[ type ] || {};

				// If selector defined, determine special event api type, otherwise given type
				type = ( selector ? special.delegateType : special.bindType ) || type;

				// Update special based on newly reset type
				special = jQuery.event.special[ type ] || {};

				// handleObj is passed to all event handlers
				handleObj = jQuery.extend( {
					type: type,
					origType: origType,
					data: data,
					handler: handler,
					guid: handler.guid,
					selector: selector,
					needsContext: selector && jQuery.expr.match.needsContext.test( selector ),
					namespace: namespaces.join( "." )
				}, handleObjIn );

				// Init the event handler queue if we're the first
				if ( !( handlers = events[ type ] ) ) {
					handlers = events[ type ] = [];
					handlers.delegateCount = 0;

					// Only use addEventListener if the special events handler returns false
					if ( !special.setup ||
						special.setup.call( elem, data, namespaces, eventHandle ) === false ) {

						if ( elem.addEventListener ) {
							elem.addEventListener( type, eventHandle );
						}
					}
				}

				if ( special.add ) {
					special.add.call( elem, handleObj );

					if ( !handleObj.handler.guid ) {
						handleObj.handler.guid = handler.guid;
					}
				}

				// Add to the element's handler list, delegates in front
				if ( selector ) {
					handlers.splice( handlers.delegateCount++, 0, handleObj );
				} else {
					handlers.push( handleObj );
				}

				// Keep track of which events have ever been used, for event optimization
				jQuery.event.global[ type ] = true;
			}

		},

		// Detach an event or set of events from an element
		remove: function( elem, types, handler, selector, mappedTypes ) {

			var j, origCount, tmp,
				events, t, handleObj,
				special, handlers, type, namespaces, origType,
				elemData = dataPriv.hasData( elem ) && dataPriv.get( elem );

			if ( !elemData || !( events = elemData.events ) ) {
				return;
			}

			// Once for each type.namespace in types; type may be omitted
			types = ( types || "" ).match( rnothtmlwhite ) || [ "" ];
			t = types.length;
			while ( t-- ) {
				tmp = rtypenamespace.exec( types[ t ] ) || [];
				type = origType = tmp[ 1 ];
				namespaces = ( tmp[ 2 ] || "" ).split( "." ).sort();

				// Unbind all events (on this namespace, if provided) for the element
				if ( !type ) {
					for ( type in events ) {
						jQuery.event.remove( elem, type + types[ t ], handler, selector, true );
					}
					continue;
				}

				special = jQuery.event.special[ type ] || {};
				type = ( selector ? special.delegateType : special.bindType ) || type;
				handlers = events[ type ] || [];
				tmp = tmp[ 2 ] &&
					new RegExp( "(^|\\.)" + namespaces.join( "\\.(?:.*\\.|)" ) + "(\\.|$)" );

				// Remove matching events
				origCount = j = handlers.length;
				while ( j-- ) {
					handleObj = handlers[ j ];

					if ( ( mappedTypes || origType === handleObj.origType ) &&
						( !handler || handler.guid === handleObj.guid ) &&
						( !tmp || tmp.test( handleObj.namespace ) ) &&
						( !selector || selector === handleObj.selector ||
							selector === "**" && handleObj.selector ) ) {
						handlers.splice( j, 1 );

						if ( handleObj.selector ) {
							handlers.delegateCount--;
						}
						if ( special.remove ) {
							special.remove.call( elem, handleObj );
						}
					}
				}

				// Remove generic event handler if we removed something and no more handlers exist
				// (avoids potential for endless recursion during removal of special event handlers)
				if ( origCount && !handlers.length ) {
					if ( !special.teardown ||
						special.teardown.call( elem, namespaces, elemData.handle ) === false ) {

						jQuery.removeEvent( elem, type, elemData.handle );
					}

					delete events[ type ];
				}
			}

			// Remove data and the expando if it's no longer used
			if ( jQuery.isEmptyObject( events ) ) {
				dataPriv.remove( elem, "handle events" );
			}
		},

		dispatch: function( nativeEvent ) {

			var i, j, ret, matched, handleObj, handlerQueue,
				args = new Array( arguments.length ),

				// Make a writable jQuery.Event from the native event object
				event = jQuery.event.fix( nativeEvent ),

				handlers = (
						dataPriv.get( this, "events" ) || Object.create( null )
					)[ event.type ] || [],
				special = jQuery.event.special[ event.type ] || {};

			// Use the fix-ed jQuery.Event rather than the (read-only) native event
			args[ 0 ] = event;

			for ( i = 1; i < arguments.length; i++ ) {
				args[ i ] = arguments[ i ];
			}

			event.delegateTarget = this;

			// Call the preDispatch hook for the mapped type, and let it bail if desired
			if ( special.preDispatch && special.preDispatch.call( this, event ) === false ) {
				return;
			}

			// Determine handlers
			handlerQueue = jQuery.event.handlers.call( this, event, handlers );

			// Run delegates first; they may want to stop propagation beneath us
			i = 0;
			while ( ( matched = handlerQueue[ i++ ] ) && !event.isPropagationStopped() ) {
				event.currentTarget = matched.elem;

				j = 0;
				while ( ( handleObj = matched.handlers[ j++ ] ) &&
					!event.isImmediatePropagationStopped() ) {

					// If the event is namespaced, then each handler is only invoked if it is
					// specially universal or its namespaces are a superset of the event's.
					if ( !event.rnamespace || handleObj.namespace === false ||
						event.rnamespace.test( handleObj.namespace ) ) {

						event.handleObj = handleObj;
						event.data = handleObj.data;

						ret = ( ( jQuery.event.special[ handleObj.origType ] || {} ).handle ||
							handleObj.handler ).apply( matched.elem, args );

						if ( ret !== undefined ) {
							if ( ( event.result = ret ) === false ) {
								event.preventDefault();
								event.stopPropagation();
							}
						}
					}
				}
			}

			// Call the postDispatch hook for the mapped type
			if ( special.postDispatch ) {
				special.postDispatch.call( this, event );
			}

			return event.result;
		},

		handlers: function( event, handlers ) {
			var i, handleObj, sel, matchedHandlers, matchedSelectors,
				handlerQueue = [],
				delegateCount = handlers.delegateCount,
				cur = event.target;

			// Find delegate handlers
			if ( delegateCount &&

				// Support: IE <=9
				// Black-hole SVG <use> instance trees (trac-13180)
				cur.nodeType &&

				// Support: Firefox <=42
				// Suppress spec-violating clicks indicating a non-primary pointer button (trac-3861)
				// https://www.w3.org/TR/DOM-Level-3-Events/#event-type-click
				// Support: IE 11 only
				// ...but not arrow key "clicks" of radio inputs, which can have `button` -1 (gh-2343)
				!( event.type === "click" && event.button >= 1 ) ) {

				for ( ; cur !== this; cur = cur.parentNode || this ) {

					// Don't check non-elements (#13208)
					// Don't process clicks on disabled elements (#6911, #8165, #11382, #11764)
					if ( cur.nodeType === 1 && !( event.type === "click" && cur.disabled === true ) ) {
						matchedHandlers = [];
						matchedSelectors = {};
						for ( i = 0; i < delegateCount; i++ ) {
							handleObj = handlers[ i ];

							// Don't conflict with Object.prototype properties (#13203)
							sel = handleObj.selector + " ";

							if ( matchedSelectors[ sel ] === undefined ) {
								matchedSelectors[ sel ] = handleObj.needsContext ?
									jQuery( sel, this ).index( cur ) > -1 :
									jQuery.find( sel, this, null, [ cur ] ).length;
							}
							if ( matchedSelectors[ sel ] ) {
								matchedHandlers.push( handleObj );
							}
						}
						if ( matchedHandlers.length ) {
							handlerQueue.push( { elem: cur, handlers: matchedHandlers } );
						}
					}
				}
			}

			// Add the remaining (directly-bound) handlers
			cur = this;
			if ( delegateCount < handlers.length ) {
				handlerQueue.push( { elem: cur, handlers: handlers.slice( delegateCount ) } );
			}

			return handlerQueue;
		},

		addProp: function( name, hook ) {
			Object.defineProperty( jQuery.Event.prototype, name, {
				enumerable: true,
				configurable: true,

				get: isFunction( hook ) ?
					function() {
						if ( this.originalEvent ) {
								return hook( this.originalEvent );
						}
					} :
					function() {
						if ( this.originalEvent ) {
								return this.originalEvent[ name ];
						}
					},

				set: function( value ) {
					Object.defineProperty( this, name, {
						enumerable: true,
						configurable: true,
						writable: true,
						value: value
					} );
				}
			} );
		},

		fix: function( originalEvent ) {
			return originalEvent[ jQuery.expando ] ?
				originalEvent :
				new jQuery.Event( originalEvent );
		},

		special: {
			load: {

				// Prevent triggered image.load events from bubbling to window.load
				noBubble: true
			},
			click: {

				// Utilize native event to ensure correct state for checkable inputs
				setup: function( data ) {

					// For mutual compressibility with _default, replace `this` access with a local var.
					// `|| data` is dead code meant only to preserve the variable through minification.
					var el = this || data;

					// Claim the first handler
					if ( rcheckableType.test( el.type ) &&
						el.click && nodeName( el, "input" ) ) {

						// dataPriv.set( el, "click", ... )
						leverageNative( el, "click", returnTrue );
					}

					// Return false to allow normal processing in the caller
					return false;
				},
				trigger: function( data ) {

					// For mutual compressibility with _default, replace `this` access with a local var.
					// `|| data` is dead code meant only to preserve the variable through minification.
					var el = this || data;

					// Force setup before triggering a click
					if ( rcheckableType.test( el.type ) &&
						el.click && nodeName( el, "input" ) ) {

						leverageNative( el, "click" );
					}

					// Return non-false to allow normal event-path propagation
					return true;
				},

				// For cross-browser consistency, suppress native .click() on links
				// Also prevent it if we're currently inside a leveraged native-event stack
				_default: function( event ) {
					var target = event.target;
					return rcheckableType.test( target.type ) &&
						target.click && nodeName( target, "input" ) &&
						dataPriv.get( target, "click" ) ||
						nodeName( target, "a" );
				}
			},

			beforeunload: {
				postDispatch: function( event ) {

					// Support: Firefox 20+
					// Firefox doesn't alert if the returnValue field is not set.
					if ( event.result !== undefined && event.originalEvent ) {
						event.originalEvent.returnValue = event.result;
					}
				}
			}
		}
	};

	// Ensure the presence of an event listener that handles manually-triggered
	// synthetic events by interrupting progress until reinvoked in response to
	// *native* events that it fires directly, ensuring that state changes have
	// already occurred before other listeners are invoked.
	function leverageNative( el, type, expectSync ) {

		// Missing expectSync indicates a trigger call, which must force setup through jQuery.event.add
		if ( !expectSync ) {
			if ( dataPriv.get( el, type ) === undefined ) {
				jQuery.event.add( el, type, returnTrue );
			}
			return;
		}

		// Register the controller as a special universal handler for all event namespaces
		dataPriv.set( el, type, false );
		jQuery.event.add( el, type, {
			namespace: false,
			handler: function( event ) {
				var notAsync, result,
					saved = dataPriv.get( this, type );

				if ( ( event.isTrigger & 1 ) && this[ type ] ) {

					// Interrupt processing of the outer synthetic .trigger()ed event
					// Saved data should be false in such cases, but might be a leftover capture object
					// from an async native handler (gh-4350)
					if ( !saved.length ) {

						// Store arguments for use when handling the inner native event
						// There will always be at least one argument (an event object), so this array
						// will not be confused with a leftover capture object.
						saved = slice.call( arguments );
						dataPriv.set( this, type, saved );

						// Trigger the native event and capture its result
						// Support: IE <=9 - 11+
						// focus() and blur() are asynchronous
						notAsync = expectSync( this, type );
						this[ type ]();
						result = dataPriv.get( this, type );
						if ( saved !== result || notAsync ) {
							dataPriv.set( this, type, false );
						} else {
							result = {};
						}
						if ( saved !== result ) {

							// Cancel the outer synthetic event
							event.stopImmediatePropagation();
							event.preventDefault();
							return result.value;
						}

					// If this is an inner synthetic event for an event with a bubbling surrogate
					// (focus or blur), assume that the surrogate already propagated from triggering the
					// native event and prevent that from happening again here.
					// This technically gets the ordering wrong w.r.t. to `.trigger()` (in which the
					// bubbling surrogate propagates *after* the non-bubbling base), but that seems
					// less bad than duplication.
					} else if ( ( jQuery.event.special[ type ] || {} ).delegateType ) {
						event.stopPropagation();
					}

				// If this is a native event triggered above, everything is now in order
				// Fire an inner synthetic event with the original arguments
				} else if ( saved.length ) {

					// ...and capture the result
					dataPriv.set( this, type, {
						value: jQuery.event.trigger(

							// Support: IE <=9 - 11+
							// Extend with the prototype to reset the above stopImmediatePropagation()
							jQuery.extend( saved[ 0 ], jQuery.Event.prototype ),
							saved.slice( 1 ),
							this
						)
					} );

					// Abort handling of the native event
					event.stopImmediatePropagation();
				}
			}
		} );
	}

	jQuery.removeEvent = function( elem, type, handle ) {

		// This "if" is needed for plain objects
		if ( elem.removeEventListener ) {
			elem.removeEventListener( type, handle );
		}
	};

	jQuery.Event = function( src, props ) {

		// Allow instantiation without the 'new' keyword
		if ( !( this instanceof jQuery.Event ) ) {
			return new jQuery.Event( src, props );
		}

		// Event object
		if ( src && src.type ) {
			this.originalEvent = src;
			this.type = src.type;

			// Events bubbling up the document may have been marked as prevented
			// by a handler lower down the tree; reflect the correct value.
			this.isDefaultPrevented = src.defaultPrevented ||
					src.defaultPrevented === undefined &&

					// Support: Android <=2.3 only
					src.returnValue === false ?
				returnTrue :
				returnFalse;

			// Create target properties
			// Support: Safari <=6 - 7 only
			// Target should not be a text node (#504, #13143)
			this.target = ( src.target && src.target.nodeType === 3 ) ?
				src.target.parentNode :
				src.target;

			this.currentTarget = src.currentTarget;
			this.relatedTarget = src.relatedTarget;

		// Event type
		} else {
			this.type = src;
		}

		// Put explicitly provided properties onto the event object
		if ( props ) {
			jQuery.extend( this, props );
		}

		// Create a timestamp if incoming event doesn't have one
		this.timeStamp = src && src.timeStamp || Date.now();

		// Mark it as fixed
		this[ jQuery.expando ] = true;
	};

	// jQuery.Event is based on DOM3 Events as specified by the ECMAScript Language Binding
	// https://www.w3.org/TR/2003/WD-DOM-Level-3-Events-20030331/ecma-script-binding.html
	jQuery.Event.prototype = {
		constructor: jQuery.Event,
		isDefaultPrevented: returnFalse,
		isPropagationStopped: returnFalse,
		isImmediatePropagationStopped: returnFalse,
		isSimulated: false,

		preventDefault: function() {
			var e = this.originalEvent;

			this.isDefaultPrevented = returnTrue;

			if ( e && !this.isSimulated ) {
				e.preventDefault();
			}
		},
		stopPropagation: function() {
			var e = this.originalEvent;

			this.isPropagationStopped = returnTrue;

			if ( e && !this.isSimulated ) {
				e.stopPropagation();
			}
		},
		stopImmediatePropagation: function() {
			var e = this.originalEvent;

			this.isImmediatePropagationStopped = returnTrue;

			if ( e && !this.isSimulated ) {
				e.stopImmediatePropagation();
			}

			this.stopPropagation();
		}
	};

	// Includes all common event props including KeyEvent and MouseEvent specific props
	jQuery.each( {
		altKey: true,
		bubbles: true,
		cancelable: true,
		changedTouches: true,
		ctrlKey: true,
		detail: true,
		eventPhase: true,
		metaKey: true,
		pageX: true,
		pageY: true,
		shiftKey: true,
		view: true,
		"char": true,
		code: true,
		charCode: true,
		key: true,
		keyCode: true,
		button: true,
		buttons: true,
		clientX: true,
		clientY: true,
		offsetX: true,
		offsetY: true,
		pointerId: true,
		pointerType: true,
		screenX: true,
		screenY: true,
		targetTouches: true,
		toElement: true,
		touches: true,

		which: function( event ) {
			var button = event.button;

			// Add which for key events
			if ( event.which == null && rkeyEvent.test( event.type ) ) {
				return event.charCode != null ? event.charCode : event.keyCode;
			}

			// Add which for click: 1 === left; 2 === middle; 3 === right
			if ( !event.which && button !== undefined && rmouseEvent.test( event.type ) ) {
				if ( button & 1 ) {
					return 1;
				}

				if ( button & 2 ) {
					return 3;
				}

				if ( button & 4 ) {
					return 2;
				}

				return 0;
			}

			return event.which;
		}
	}, jQuery.event.addProp );

	jQuery.each( { focus: "focusin", blur: "focusout" }, function( type, delegateType ) {
		jQuery.event.special[ type ] = {

			// Utilize native event if possible so blur/focus sequence is correct
			setup: function() {

				// Claim the first handler
				// dataPriv.set( this, "focus", ... )
				// dataPriv.set( this, "blur", ... )
				leverageNative( this, type, expectSync );

				// Return false to allow normal processing in the caller
				return false;
			},
			trigger: function() {

				// Force setup before trigger
				leverageNative( this, type );

				// Return non-false to allow normal event-path propagation
				return true;
			},

			delegateType: delegateType
		};
	} );

	// Create mouseenter/leave events using mouseover/out and event-time checks
	// so that event delegation works in jQuery.
	// Do the same for pointerenter/pointerleave and pointerover/pointerout
	//
	// Support: Safari 7 only
	// Safari sends mouseenter too often; see:
	// https://bugs.chromium.org/p/chromium/issues/detail?id=470258
	// for the description of the bug (it existed in older Chrome versions as well).
	jQuery.each( {
		mouseenter: "mouseover",
		mouseleave: "mouseout",
		pointerenter: "pointerover",
		pointerleave: "pointerout"
	}, function( orig, fix ) {
		jQuery.event.special[ orig ] = {
			delegateType: fix,
			bindType: fix,

			handle: function( event ) {
				var ret,
					target = this,
					related = event.relatedTarget,
					handleObj = event.handleObj;

				// For mouseenter/leave call the handler if related is outside the target.
				// NB: No relatedTarget if the mouse left/entered the browser window
				if ( !related || ( related !== target && !jQuery.contains( target, related ) ) ) {
					event.type = handleObj.origType;
					ret = handleObj.handler.apply( this, arguments );
					event.type = fix;
				}
				return ret;
			}
		};
	} );

	jQuery.fn.extend( {

		on: function( types, selector, data, fn ) {
			return on( this, types, selector, data, fn );
		},
		one: function( types, selector, data, fn ) {
			return on( this, types, selector, data, fn, 1 );
		},
		off: function( types, selector, fn ) {
			var handleObj, type;
			if ( types && types.preventDefault && types.handleObj ) {

				// ( event )  dispatched jQuery.Event
				handleObj = types.handleObj;
				jQuery( types.delegateTarget ).off(
					handleObj.namespace ?
						handleObj.origType + "." + handleObj.namespace :
						handleObj.origType,
					handleObj.selector,
					handleObj.handler
				);
				return this;
			}
			if ( typeof types === "object" ) {

				// ( types-object [, selector] )
				for ( type in types ) {
					this.off( type, selector, types[ type ] );
				}
				return this;
			}
			if ( selector === false || typeof selector === "function" ) {

				// ( types [, fn] )
				fn = selector;
				selector = undefined;
			}
			if ( fn === false ) {
				fn = returnFalse;
			}
			return this.each( function() {
				jQuery.event.remove( this, types, fn, selector );
			} );
		}
	} );


	var

		// Support: IE <=10 - 11, Edge 12 - 13 only
		// In IE/Edge using regex groups here causes severe slowdowns.
		// See https://connect.microsoft.com/IE/feedback/details/1736512/
		rnoInnerhtml = /<script|<style|<link/i,

		// checked="checked" or checked
		rchecked = /checked\s*(?:[^=]|=\s*.checked.)/i,
		rcleanScript = /^\s*<!(?:\[CDATA\[|--)|(?:\]\]|--)>\s*$/g;

	// Prefer a tbody over its parent table for containing new rows
	function manipulationTarget( elem, content ) {
		if ( nodeName( elem, "table" ) &&
			nodeName( content.nodeType !== 11 ? content : content.firstChild, "tr" ) ) {

			return jQuery( elem ).children( "tbody" )[ 0 ] || elem;
		}

		return elem;
	}

	// Replace/restore the type attribute of script elements for safe DOM manipulation
	function disableScript( elem ) {
		elem.type = ( elem.getAttribute( "type" ) !== null ) + "/" + elem.type;
		return elem;
	}
	function restoreScript( elem ) {
		if ( ( elem.type || "" ).slice( 0, 5 ) === "true/" ) {
			elem.type = elem.type.slice( 5 );
		} else {
			elem.removeAttribute( "type" );
		}

		return elem;
	}

	function cloneCopyEvent( src, dest ) {
		var i, l, type, pdataOld, udataOld, udataCur, events;

		if ( dest.nodeType !== 1 ) {
			return;
		}

		// 1. Copy private data: events, handlers, etc.
		if ( dataPriv.hasData( src ) ) {
			pdataOld = dataPriv.get( src );
			events = pdataOld.events;

			if ( events ) {
				dataPriv.remove( dest, "handle events" );

				for ( type in events ) {
					for ( i = 0, l = events[ type ].length; i < l; i++ ) {
						jQuery.event.add( dest, type, events[ type ][ i ] );
					}
				}
			}
		}

		// 2. Copy user data
		if ( dataUser.hasData( src ) ) {
			udataOld = dataUser.access( src );
			udataCur = jQuery.extend( {}, udataOld );

			dataUser.set( dest, udataCur );
		}
	}

	// Fix IE bugs, see support tests
	function fixInput( src, dest ) {
		var nodeName = dest.nodeName.toLowerCase();

		// Fails to persist the checked state of a cloned checkbox or radio button.
		if ( nodeName === "input" && rcheckableType.test( src.type ) ) {
			dest.checked = src.checked;

		// Fails to return the selected option to the default selected state when cloning options
		} else if ( nodeName === "input" || nodeName === "textarea" ) {
			dest.defaultValue = src.defaultValue;
		}
	}

	function domManip( collection, args, callback, ignored ) {

		// Flatten any nested arrays
		args = flat( args );

		var fragment, first, scripts, hasScripts, node, doc,
			i = 0,
			l = collection.length,
			iNoClone = l - 1,
			value = args[ 0 ],
			valueIsFunction = isFunction( value );

		// We can't cloneNode fragments that contain checked, in WebKit
		if ( valueIsFunction ||
				( l > 1 && typeof value === "string" &&
					!support.checkClone && rchecked.test( value ) ) ) {
			return collection.each( function( index ) {
				var self = collection.eq( index );
				if ( valueIsFunction ) {
					args[ 0 ] = value.call( this, index, self.html() );
				}
				domManip( self, args, callback, ignored );
			} );
		}

		if ( l ) {
			fragment = buildFragment( args, collection[ 0 ].ownerDocument, false, collection, ignored );
			first = fragment.firstChild;

			if ( fragment.childNodes.length === 1 ) {
				fragment = first;
			}

			// Require either new content or an interest in ignored elements to invoke the callback
			if ( first || ignored ) {
				scripts = jQuery.map( getAll( fragment, "script" ), disableScript );
				hasScripts = scripts.length;

				// Use the original fragment for the last item
				// instead of the first because it can end up
				// being emptied incorrectly in certain situations (#8070).
				for ( ; i < l; i++ ) {
					node = fragment;

					if ( i !== iNoClone ) {
						node = jQuery.clone( node, true, true );

						// Keep references to cloned scripts for later restoration
						if ( hasScripts ) {

							// Support: Android <=4.0 only, PhantomJS 1 only
							// push.apply(_, arraylike) throws on ancient WebKit
							jQuery.merge( scripts, getAll( node, "script" ) );
						}
					}

					callback.call( collection[ i ], node, i );
				}

				if ( hasScripts ) {
					doc = scripts[ scripts.length - 1 ].ownerDocument;

					// Reenable scripts
					jQuery.map( scripts, restoreScript );

					// Evaluate executable scripts on first document insertion
					for ( i = 0; i < hasScripts; i++ ) {
						node = scripts[ i ];
						if ( rscriptType.test( node.type || "" ) &&
							!dataPriv.access( node, "globalEval" ) &&
							jQuery.contains( doc, node ) ) {

							if ( node.src && ( node.type || "" ).toLowerCase()  !== "module" ) {

								// Optional AJAX dependency, but won't run scripts if not present
								if ( jQuery._evalUrl && !node.noModule ) {
									jQuery._evalUrl( node.src, {
										nonce: node.nonce || node.getAttribute( "nonce" )
									}, doc );
								}
							} else {
								DOMEval( node.textContent.replace( rcleanScript, "" ), node, doc );
							}
						}
					}
				}
			}
		}

		return collection;
	}

	function remove( elem, selector, keepData ) {
		var node,
			nodes = selector ? jQuery.filter( selector, elem ) : elem,
			i = 0;

		for ( ; ( node = nodes[ i ] ) != null; i++ ) {
			if ( !keepData && node.nodeType === 1 ) {
				jQuery.cleanData( getAll( node ) );
			}

			if ( node.parentNode ) {
				if ( keepData && isAttached( node ) ) {
					setGlobalEval( getAll( node, "script" ) );
				}
				node.parentNode.removeChild( node );
			}
		}

		return elem;
	}

	jQuery.extend( {
		htmlPrefilter: function( html ) {
			return html;
		},

		clone: function( elem, dataAndEvents, deepDataAndEvents ) {
			var i, l, srcElements, destElements,
				clone = elem.cloneNode( true ),
				inPage = isAttached( elem );

			// Fix IE cloning issues
			if ( !support.noCloneChecked && ( elem.nodeType === 1 || elem.nodeType === 11 ) &&
					!jQuery.isXMLDoc( elem ) ) {

				// We eschew Sizzle here for performance reasons: https://jsperf.com/getall-vs-sizzle/2
				destElements = getAll( clone );
				srcElements = getAll( elem );

				for ( i = 0, l = srcElements.length; i < l; i++ ) {
					fixInput( srcElements[ i ], destElements[ i ] );
				}
			}

			// Copy the events from the original to the clone
			if ( dataAndEvents ) {
				if ( deepDataAndEvents ) {
					srcElements = srcElements || getAll( elem );
					destElements = destElements || getAll( clone );

					for ( i = 0, l = srcElements.length; i < l; i++ ) {
						cloneCopyEvent( srcElements[ i ], destElements[ i ] );
					}
				} else {
					cloneCopyEvent( elem, clone );
				}
			}

			// Preserve script evaluation history
			destElements = getAll( clone, "script" );
			if ( destElements.length > 0 ) {
				setGlobalEval( destElements, !inPage && getAll( elem, "script" ) );
			}

			// Return the cloned set
			return clone;
		},

		cleanData: function( elems ) {
			var data, elem, type,
				special = jQuery.event.special,
				i = 0;

			for ( ; ( elem = elems[ i ] ) !== undefined; i++ ) {
				if ( acceptData( elem ) ) {
					if ( ( data = elem[ dataPriv.expando ] ) ) {
						if ( data.events ) {
							for ( type in data.events ) {
								if ( special[ type ] ) {
									jQuery.event.remove( elem, type );

								// This is a shortcut to avoid jQuery.event.remove's overhead
								} else {
									jQuery.removeEvent( elem, type, data.handle );
								}
							}
						}

						// Support: Chrome <=35 - 45+
						// Assign undefined instead of using delete, see Data#remove
						elem[ dataPriv.expando ] = undefined;
					}
					if ( elem[ dataUser.expando ] ) {

						// Support: Chrome <=35 - 45+
						// Assign undefined instead of using delete, see Data#remove
						elem[ dataUser.expando ] = undefined;
					}
				}
			}
		}
	} );

	jQuery.fn.extend( {
		detach: function( selector ) {
			return remove( this, selector, true );
		},

		remove: function( selector ) {
			return remove( this, selector );
		},

		text: function( value ) {
			return access( this, function( value ) {
				return value === undefined ?
					jQuery.text( this ) :
					this.empty().each( function() {
						if ( this.nodeType === 1 || this.nodeType === 11 || this.nodeType === 9 ) {
							this.textContent = value;
						}
					} );
			}, null, value, arguments.length );
		},

		append: function() {
			return domManip( this, arguments, function( elem ) {
				if ( this.nodeType === 1 || this.nodeType === 11 || this.nodeType === 9 ) {
					var target = manipulationTarget( this, elem );
					target.appendChild( elem );
				}
			} );
		},

		prepend: function() {
			return domManip( this, arguments, function( elem ) {
				if ( this.nodeType === 1 || this.nodeType === 11 || this.nodeType === 9 ) {
					var target = manipulationTarget( this, elem );
					target.insertBefore( elem, target.firstChild );
				}
			} );
		},

		before: function() {
			return domManip( this, arguments, function( elem ) {
				if ( this.parentNode ) {
					this.parentNode.insertBefore( elem, this );
				}
			} );
		},

		after: function() {
			return domManip( this, arguments, function( elem ) {
				if ( this.parentNode ) {
					this.parentNode.insertBefore( elem, this.nextSibling );
				}
			} );
		},

		empty: function() {
			var elem,
				i = 0;

			for ( ; ( elem = this[ i ] ) != null; i++ ) {
				if ( elem.nodeType === 1 ) {

					// Prevent memory leaks
					jQuery.cleanData( getAll( elem, false ) );

					// Remove any remaining nodes
					elem.textContent = "";
				}
			}

			return this;
		},

		clone: function( dataAndEvents, deepDataAndEvents ) {
			dataAndEvents = dataAndEvents == null ? false : dataAndEvents;
			deepDataAndEvents = deepDataAndEvents == null ? dataAndEvents : deepDataAndEvents;

			return this.map( function() {
				return jQuery.clone( this, dataAndEvents, deepDataAndEvents );
			} );
		},

		html: function( value ) {
			return access( this, function( value ) {
				var elem = this[ 0 ] || {},
					i = 0,
					l = this.length;

				if ( value === undefined && elem.nodeType === 1 ) {
					return elem.innerHTML;
				}

				// See if we can take a shortcut and just use innerHTML
				if ( typeof value === "string" && !rnoInnerhtml.test( value ) &&
					!wrapMap[ ( rtagName.exec( value ) || [ "", "" ] )[ 1 ].toLowerCase() ] ) {

					value = jQuery.htmlPrefilter( value );

					try {
						for ( ; i < l; i++ ) {
							elem = this[ i ] || {};

							// Remove element nodes and prevent memory leaks
							if ( elem.nodeType === 1 ) {
								jQuery.cleanData( getAll( elem, false ) );
								elem.innerHTML = value;
							}
						}

						elem = 0;

					// If using innerHTML throws an exception, use the fallback method
					} catch ( e ) {}
				}

				if ( elem ) {
					this.empty().append( value );
				}
			}, null, value, arguments.length );
		},

		replaceWith: function() {
			var ignored = [];

			// Make the changes, replacing each non-ignored context element with the new content
			return domManip( this, arguments, function( elem ) {
				var parent = this.parentNode;

				if ( jQuery.inArray( this, ignored ) < 0 ) {
					jQuery.cleanData( getAll( this ) );
					if ( parent ) {
						parent.replaceChild( elem, this );
					}
				}

			// Force callback invocation
			}, ignored );
		}
	} );

	jQuery.each( {
		appendTo: "append",
		prependTo: "prepend",
		insertBefore: "before",
		insertAfter: "after",
		replaceAll: "replaceWith"
	}, function( name, original ) {
		jQuery.fn[ name ] = function( selector ) {
			var elems,
				ret = [],
				insert = jQuery( selector ),
				last = insert.length - 1,
				i = 0;

			for ( ; i <= last; i++ ) {
				elems = i === last ? this : this.clone( true );
				jQuery( insert[ i ] )[ original ]( elems );

				// Support: Android <=4.0 only, PhantomJS 1 only
				// .get() because push.apply(_, arraylike) throws on ancient WebKit
				push.apply( ret, elems.get() );
			}

			return this.pushStack( ret );
		};
	} );
	var rnumnonpx = new RegExp( "^(" + pnum + ")(?!px)[a-z%]+$", "i" );

	var getStyles = function( elem ) {

			// Support: IE <=11 only, Firefox <=30 (#15098, #14150)
			// IE throws on elements created in popups
			// FF meanwhile throws on frame elements through "defaultView.getComputedStyle"
			var view = elem.ownerDocument.defaultView;

			if ( !view || !view.opener ) {
				view = window;
			}

			return view.getComputedStyle( elem );
		};

	var swap = function( elem, options, callback ) {
		var ret, name,
			old = {};

		// Remember the old values, and insert the new ones
		for ( name in options ) {
			old[ name ] = elem.style[ name ];
			elem.style[ name ] = options[ name ];
		}

		ret = callback.call( elem );

		// Revert the old values
		for ( name in options ) {
			elem.style[ name ] = old[ name ];
		}

		return ret;
	};


	var rboxStyle = new RegExp( cssExpand.join( "|" ), "i" );



	( function() {

		// Executing both pixelPosition & boxSizingReliable tests require only one layout
		// so they're executed at the same time to save the second computation.
		function computeStyleTests() {

			// This is a singleton, we need to execute it only once
			if ( !div ) {
				return;
			}

			container.style.cssText = "position:absolute;left:-11111px;width:60px;" +
				"margin-top:1px;padding:0;border:0";
			div.style.cssText =
				"position:relative;display:block;box-sizing:border-box;overflow:scroll;" +
				"margin:auto;border:1px;padding:1px;" +
				"width:60%;top:1%";
			documentElement.appendChild( container ).appendChild( div );

			var divStyle = window.getComputedStyle( div );
			pixelPositionVal = divStyle.top !== "1%";

			// Support: Android 4.0 - 4.3 only, Firefox <=3 - 44
			reliableMarginLeftVal = roundPixelMeasures( divStyle.marginLeft ) === 12;

			// Support: Android 4.0 - 4.3 only, Safari <=9.1 - 10.1, iOS <=7.0 - 9.3
			// Some styles come back with percentage values, even though they shouldn't
			div.style.right = "60%";
			pixelBoxStylesVal = roundPixelMeasures( divStyle.right ) === 36;

			// Support: IE 9 - 11 only
			// Detect misreporting of content dimensions for box-sizing:border-box elements
			boxSizingReliableVal = roundPixelMeasures( divStyle.width ) === 36;

			// Support: IE 9 only
			// Detect overflow:scroll screwiness (gh-3699)
			// Support: Chrome <=64
			// Don't get tricked when zoom affects offsetWidth (gh-4029)
			div.style.position = "absolute";
			scrollboxSizeVal = roundPixelMeasures( div.offsetWidth / 3 ) === 12;

			documentElement.removeChild( container );

			// Nullify the div so it wouldn't be stored in the memory and
			// it will also be a sign that checks already performed
			div = null;
		}

		function roundPixelMeasures( measure ) {
			return Math.round( parseFloat( measure ) );
		}

		var pixelPositionVal, boxSizingReliableVal, scrollboxSizeVal, pixelBoxStylesVal,
			reliableTrDimensionsVal, reliableMarginLeftVal,
			container = document.createElement( "div" ),
			div = document.createElement( "div" );

		// Finish early in limited (non-browser) environments
		if ( !div.style ) {
			return;
		}

		// Support: IE <=9 - 11 only
		// Style of cloned element affects source element cloned (#8908)
		div.style.backgroundClip = "content-box";
		div.cloneNode( true ).style.backgroundClip = "";
		support.clearCloneStyle = div.style.backgroundClip === "content-box";

		jQuery.extend( support, {
			boxSizingReliable: function() {
				computeStyleTests();
				return boxSizingReliableVal;
			},
			pixelBoxStyles: function() {
				computeStyleTests();
				return pixelBoxStylesVal;
			},
			pixelPosition: function() {
				computeStyleTests();
				return pixelPositionVal;
			},
			reliableMarginLeft: function() {
				computeStyleTests();
				return reliableMarginLeftVal;
			},
			scrollboxSize: function() {
				computeStyleTests();
				return scrollboxSizeVal;
			},

			// Support: IE 9 - 11+, Edge 15 - 18+
			// IE/Edge misreport `getComputedStyle` of table rows with width/height
			// set in CSS while `offset*` properties report correct values.
			// Behavior in IE 9 is more subtle than in newer versions & it passes
			// some versions of this test; make sure not to make it pass there!
			reliableTrDimensions: function() {
				var table, tr, trChild, trStyle;
				if ( reliableTrDimensionsVal == null ) {
					table = document.createElement( "table" );
					tr = document.createElement( "tr" );
					trChild = document.createElement( "div" );

					table.style.cssText = "position:absolute;left:-11111px";
					tr.style.height = "1px";
					trChild.style.height = "9px";

					documentElement
						.appendChild( table )
						.appendChild( tr )
						.appendChild( trChild );

					trStyle = window.getComputedStyle( tr );
					reliableTrDimensionsVal = parseInt( trStyle.height ) > 3;

					documentElement.removeChild( table );
				}
				return reliableTrDimensionsVal;
			}
		} );
	} )();


	function curCSS( elem, name, computed ) {
		var width, minWidth, maxWidth, ret,

			// Support: Firefox 51+
			// Retrieving style before computed somehow
			// fixes an issue with getting wrong values
			// on detached elements
			style = elem.style;

		computed = computed || getStyles( elem );

		// getPropertyValue is needed for:
		//   .css('filter') (IE 9 only, #12537)
		//   .css('--customProperty) (#3144)
		if ( computed ) {
			ret = computed.getPropertyValue( name ) || computed[ name ];

			if ( ret === "" && !isAttached( elem ) ) {
				ret = jQuery.style( elem, name );
			}

			// A tribute to the "awesome hack by Dean Edwards"
			// Android Browser returns percentage for some values,
			// but width seems to be reliably pixels.
			// This is against the CSSOM draft spec:
			// https://drafts.csswg.org/cssom/#resolved-values
			if ( !support.pixelBoxStyles() && rnumnonpx.test( ret ) && rboxStyle.test( name ) ) {

				// Remember the original values
				width = style.width;
				minWidth = style.minWidth;
				maxWidth = style.maxWidth;

				// Put in the new values to get a computed value out
				style.minWidth = style.maxWidth = style.width = ret;
				ret = computed.width;

				// Revert the changed values
				style.width = width;
				style.minWidth = minWidth;
				style.maxWidth = maxWidth;
			}
		}

		return ret !== undefined ?

			// Support: IE <=9 - 11 only
			// IE returns zIndex value as an integer.
			ret + "" :
			ret;
	}


	function addGetHookIf( conditionFn, hookFn ) {

		// Define the hook, we'll check on the first run if it's really needed.
		return {
			get: function() {
				if ( conditionFn() ) {

					// Hook not needed (or it's not possible to use it due
					// to missing dependency), remove it.
					delete this.get;
					return;
				}

				// Hook needed; redefine it so that the support test is not executed again.
				return ( this.get = hookFn ).apply( this, arguments );
			}
		};
	}


	var cssPrefixes = [ "Webkit", "Moz", "ms" ],
		emptyStyle = document.createElement( "div" ).style,
		vendorProps = {};

	// Return a vendor-prefixed property or undefined
	function vendorPropName( name ) {

		// Check for vendor prefixed names
		var capName = name[ 0 ].toUpperCase() + name.slice( 1 ),
			i = cssPrefixes.length;

		while ( i-- ) {
			name = cssPrefixes[ i ] + capName;
			if ( name in emptyStyle ) {
				return name;
			}
		}
	}

	// Return a potentially-mapped jQuery.cssProps or vendor prefixed property
	function finalPropName( name ) {
		var final = jQuery.cssProps[ name ] || vendorProps[ name ];

		if ( final ) {
			return final;
		}
		if ( name in emptyStyle ) {
			return name;
		}
		return vendorProps[ name ] = vendorPropName( name ) || name;
	}


	var

		// Swappable if display is none or starts with table
		// except "table", "table-cell", or "table-caption"
		// See here for display values: https://developer.mozilla.org/en-US/docs/CSS/display
		rdisplayswap = /^(none|table(?!-c[ea]).+)/,
		rcustomProp = /^--/,
		cssShow = { position: "absolute", visibility: "hidden", display: "block" },
		cssNormalTransform = {
			letterSpacing: "0",
			fontWeight: "400"
		};

	function setPositiveNumber( _elem, value, subtract ) {

		// Any relative (+/-) values have already been
		// normalized at this point
		var matches = rcssNum.exec( value );
		return matches ?

			// Guard against undefined "subtract", e.g., when used as in cssHooks
			Math.max( 0, matches[ 2 ] - ( subtract || 0 ) ) + ( matches[ 3 ] || "px" ) :
			value;
	}

	function boxModelAdjustment( elem, dimension, box, isBorderBox, styles, computedVal ) {
		var i = dimension === "width" ? 1 : 0,
			extra = 0,
			delta = 0;

		// Adjustment may not be necessary
		if ( box === ( isBorderBox ? "border" : "content" ) ) {
			return 0;
		}

		for ( ; i < 4; i += 2 ) {

			// Both box models exclude margin
			if ( box === "margin" ) {
				delta += jQuery.css( elem, box + cssExpand[ i ], true, styles );
			}

			// If we get here with a content-box, we're seeking "padding" or "border" or "margin"
			if ( !isBorderBox ) {

				// Add padding
				delta += jQuery.css( elem, "padding" + cssExpand[ i ], true, styles );

				// For "border" or "margin", add border
				if ( box !== "padding" ) {
					delta += jQuery.css( elem, "border" + cssExpand[ i ] + "Width", true, styles );

				// But still keep track of it otherwise
				} else {
					extra += jQuery.css( elem, "border" + cssExpand[ i ] + "Width", true, styles );
				}

			// If we get here with a border-box (content + padding + border), we're seeking "content" or
			// "padding" or "margin"
			} else {

				// For "content", subtract padding
				if ( box === "content" ) {
					delta -= jQuery.css( elem, "padding" + cssExpand[ i ], true, styles );
				}

				// For "content" or "padding", subtract border
				if ( box !== "margin" ) {
					delta -= jQuery.css( elem, "border" + cssExpand[ i ] + "Width", true, styles );
				}
			}
		}

		// Account for positive content-box scroll gutter when requested by providing computedVal
		if ( !isBorderBox && computedVal >= 0 ) {

			// offsetWidth/offsetHeight is a rounded sum of content, padding, scroll gutter, and border
			// Assuming integer scroll gutter, subtract the rest and round down
			delta += Math.max( 0, Math.ceil(
				elem[ "offset" + dimension[ 0 ].toUpperCase() + dimension.slice( 1 ) ] -
				computedVal -
				delta -
				extra -
				0.5

			// If offsetWidth/offsetHeight is unknown, then we can't determine content-box scroll gutter
			// Use an explicit zero to avoid NaN (gh-3964)
			) ) || 0;
		}

		return delta;
	}

	function getWidthOrHeight( elem, dimension, extra ) {

		// Start with computed style
		var styles = getStyles( elem ),

			// To avoid forcing a reflow, only fetch boxSizing if we need it (gh-4322).
			// Fake content-box until we know it's needed to know the true value.
			boxSizingNeeded = !support.boxSizingReliable() || extra,
			isBorderBox = boxSizingNeeded &&
				jQuery.css( elem, "boxSizing", false, styles ) === "border-box",
			valueIsBorderBox = isBorderBox,

			val = curCSS( elem, dimension, styles ),
			offsetProp = "offset" + dimension[ 0 ].toUpperCase() + dimension.slice( 1 );

		// Support: Firefox <=54
		// Return a confounding non-pixel value or feign ignorance, as appropriate.
		if ( rnumnonpx.test( val ) ) {
			if ( !extra ) {
				return val;
			}
			val = "auto";
		}


		// Support: IE 9 - 11 only
		// Use offsetWidth/offsetHeight for when box sizing is unreliable.
		// In those cases, the computed value can be trusted to be border-box.
		if ( ( !support.boxSizingReliable() && isBorderBox ||

			// Support: IE 10 - 11+, Edge 15 - 18+
			// IE/Edge misreport `getComputedStyle` of table rows with width/height
			// set in CSS while `offset*` properties report correct values.
			// Interestingly, in some cases IE 9 doesn't suffer from this issue.
			!support.reliableTrDimensions() && nodeName( elem, "tr" ) ||

			// Fall back to offsetWidth/offsetHeight when value is "auto"
			// This happens for inline elements with no explicit setting (gh-3571)
			val === "auto" ||

			// Support: Android <=4.1 - 4.3 only
			// Also use offsetWidth/offsetHeight for misreported inline dimensions (gh-3602)
			!parseFloat( val ) && jQuery.css( elem, "display", false, styles ) === "inline" ) &&

			// Make sure the element is visible & connected
			elem.getClientRects().length ) {

			isBorderBox = jQuery.css( elem, "boxSizing", false, styles ) === "border-box";

			// Where available, offsetWidth/offsetHeight approximate border box dimensions.
			// Where not available (e.g., SVG), assume unreliable box-sizing and interpret the
			// retrieved value as a content box dimension.
			valueIsBorderBox = offsetProp in elem;
			if ( valueIsBorderBox ) {
				val = elem[ offsetProp ];
			}
		}

		// Normalize "" and auto
		val = parseFloat( val ) || 0;

		// Adjust for the element's box model
		return ( val +
			boxModelAdjustment(
				elem,
				dimension,
				extra || ( isBorderBox ? "border" : "content" ),
				valueIsBorderBox,
				styles,

				// Provide the current computed size to request scroll gutter calculation (gh-3589)
				val
			)
		) + "px";
	}

	jQuery.extend( {

		// Add in style property hooks for overriding the default
		// behavior of getting and setting a style property
		cssHooks: {
			opacity: {
				get: function( elem, computed ) {
					if ( computed ) {

						// We should always get a number back from opacity
						var ret = curCSS( elem, "opacity" );
						return ret === "" ? "1" : ret;
					}
				}
			}
		},

		// Don't automatically add "px" to these possibly-unitless properties
		cssNumber: {
			"animationIterationCount": true,
			"columnCount": true,
			"fillOpacity": true,
			"flexGrow": true,
			"flexShrink": true,
			"fontWeight": true,
			"gridArea": true,
			"gridColumn": true,
			"gridColumnEnd": true,
			"gridColumnStart": true,
			"gridRow": true,
			"gridRowEnd": true,
			"gridRowStart": true,
			"lineHeight": true,
			"opacity": true,
			"order": true,
			"orphans": true,
			"widows": true,
			"zIndex": true,
			"zoom": true
		},

		// Add in properties whose names you wish to fix before
		// setting or getting the value
		cssProps: {},

		// Get and set the style property on a DOM Node
		style: function( elem, name, value, extra ) {

			// Don't set styles on text and comment nodes
			if ( !elem || elem.nodeType === 3 || elem.nodeType === 8 || !elem.style ) {
				return;
			}

			// Make sure that we're working with the right name
			var ret, type, hooks,
				origName = camelCase( name ),
				isCustomProp = rcustomProp.test( name ),
				style = elem.style;

			// Make sure that we're working with the right name. We don't
			// want to query the value if it is a CSS custom property
			// since they are user-defined.
			if ( !isCustomProp ) {
				name = finalPropName( origName );
			}

			// Gets hook for the prefixed version, then unprefixed version
			hooks = jQuery.cssHooks[ name ] || jQuery.cssHooks[ origName ];

			// Check if we're setting a value
			if ( value !== undefined ) {
				type = typeof value;

				// Convert "+=" or "-=" to relative numbers (#7345)
				if ( type === "string" && ( ret = rcssNum.exec( value ) ) && ret[ 1 ] ) {
					value = adjustCSS( elem, name, ret );

					// Fixes bug #9237
					type = "number";
				}

				// Make sure that null and NaN values aren't set (#7116)
				if ( value == null || value !== value ) {
					return;
				}

				// If a number was passed in, add the unit (except for certain CSS properties)
				// The isCustomProp check can be removed in jQuery 4.0 when we only auto-append
				// "px" to a few hardcoded values.
				if ( type === "number" && !isCustomProp ) {
					value += ret && ret[ 3 ] || ( jQuery.cssNumber[ origName ] ? "" : "px" );
				}

				// background-* props affect original clone's values
				if ( !support.clearCloneStyle && value === "" && name.indexOf( "background" ) === 0 ) {
					style[ name ] = "inherit";
				}

				// If a hook was provided, use that value, otherwise just set the specified value
				if ( !hooks || !( "set" in hooks ) ||
					( value = hooks.set( elem, value, extra ) ) !== undefined ) {

					if ( isCustomProp ) {
						style.setProperty( name, value );
					} else {
						style[ name ] = value;
					}
				}

			} else {

				// If a hook was provided get the non-computed value from there
				if ( hooks && "get" in hooks &&
					( ret = hooks.get( elem, false, extra ) ) !== undefined ) {

					return ret;
				}

				// Otherwise just get the value from the style object
				return style[ name ];
			}
		},

		css: function( elem, name, extra, styles ) {
			var val, num, hooks,
				origName = camelCase( name ),
				isCustomProp = rcustomProp.test( name );

			// Make sure that we're working with the right name. We don't
			// want to modify the value if it is a CSS custom property
			// since they are user-defined.
			if ( !isCustomProp ) {
				name = finalPropName( origName );
			}

			// Try prefixed name followed by the unprefixed name
			hooks = jQuery.cssHooks[ name ] || jQuery.cssHooks[ origName ];

			// If a hook was provided get the computed value from there
			if ( hooks && "get" in hooks ) {
				val = hooks.get( elem, true, extra );
			}

			// Otherwise, if a way to get the computed value exists, use that
			if ( val === undefined ) {
				val = curCSS( elem, name, styles );
			}

			// Convert "normal" to computed value
			if ( val === "normal" && name in cssNormalTransform ) {
				val = cssNormalTransform[ name ];
			}

			// Make numeric if forced or a qualifier was provided and val looks numeric
			if ( extra === "" || extra ) {
				num = parseFloat( val );
				return extra === true || isFinite( num ) ? num || 0 : val;
			}

			return val;
		}
	} );

	jQuery.each( [ "height", "width" ], function( _i, dimension ) {
		jQuery.cssHooks[ dimension ] = {
			get: function( elem, computed, extra ) {
				if ( computed ) {

					// Certain elements can have dimension info if we invisibly show them
					// but it must have a current display style that would benefit
					return rdisplayswap.test( jQuery.css( elem, "display" ) ) &&

						// Support: Safari 8+
						// Table columns in Safari have non-zero offsetWidth & zero
						// getBoundingClientRect().width unless display is changed.
						// Support: IE <=11 only
						// Running getBoundingClientRect on a disconnected node
						// in IE throws an error.
						( !elem.getClientRects().length || !elem.getBoundingClientRect().width ) ?
							swap( elem, cssShow, function() {
								return getWidthOrHeight( elem, dimension, extra );
							} ) :
							getWidthOrHeight( elem, dimension, extra );
				}
			},

			set: function( elem, value, extra ) {
				var matches,
					styles = getStyles( elem ),

					// Only read styles.position if the test has a chance to fail
					// to avoid forcing a reflow.
					scrollboxSizeBuggy = !support.scrollboxSize() &&
						styles.position === "absolute",

					// To avoid forcing a reflow, only fetch boxSizing if we need it (gh-3991)
					boxSizingNeeded = scrollboxSizeBuggy || extra,
					isBorderBox = boxSizingNeeded &&
						jQuery.css( elem, "boxSizing", false, styles ) === "border-box",
					subtract = extra ?
						boxModelAdjustment(
							elem,
							dimension,
							extra,
							isBorderBox,
							styles
						) :
						0;

				// Account for unreliable border-box dimensions by comparing offset* to computed and
				// faking a content-box to get border and padding (gh-3699)
				if ( isBorderBox && scrollboxSizeBuggy ) {
					subtract -= Math.ceil(
						elem[ "offset" + dimension[ 0 ].toUpperCase() + dimension.slice( 1 ) ] -
						parseFloat( styles[ dimension ] ) -
						boxModelAdjustment( elem, dimension, "border", false, styles ) -
						0.5
					);
				}

				// Convert to pixels if value adjustment is needed
				if ( subtract && ( matches = rcssNum.exec( value ) ) &&
					( matches[ 3 ] || "px" ) !== "px" ) {

					elem.style[ dimension ] = value;
					value = jQuery.css( elem, dimension );
				}

				return setPositiveNumber( elem, value, subtract );
			}
		};
	} );

	jQuery.cssHooks.marginLeft = addGetHookIf( support.reliableMarginLeft,
		function( elem, computed ) {
			if ( computed ) {
				return ( parseFloat( curCSS( elem, "marginLeft" ) ) ||
					elem.getBoundingClientRect().left -
						swap( elem, { marginLeft: 0 }, function() {
							return elem.getBoundingClientRect().left;
						} )
					) + "px";
			}
		}
	);

	// These hooks are used by animate to expand properties
	jQuery.each( {
		margin: "",
		padding: "",
		border: "Width"
	}, function( prefix, suffix ) {
		jQuery.cssHooks[ prefix + suffix ] = {
			expand: function( value ) {
				var i = 0,
					expanded = {},

					// Assumes a single number if not a string
					parts = typeof value === "string" ? value.split( " " ) : [ value ];

				for ( ; i < 4; i++ ) {
					expanded[ prefix + cssExpand[ i ] + suffix ] =
						parts[ i ] || parts[ i - 2 ] || parts[ 0 ];
				}

				return expanded;
			}
		};

		if ( prefix !== "margin" ) {
			jQuery.cssHooks[ prefix + suffix ].set = setPositiveNumber;
		}
	} );

	jQuery.fn.extend( {
		css: function( name, value ) {
			return access( this, function( elem, name, value ) {
				var styles, len,
					map = {},
					i = 0;

				if ( Array.isArray( name ) ) {
					styles = getStyles( elem );
					len = name.length;

					for ( ; i < len; i++ ) {
						map[ name[ i ] ] = jQuery.css( elem, name[ i ], false, styles );
					}

					return map;
				}

				return value !== undefined ?
					jQuery.style( elem, name, value ) :
					jQuery.css( elem, name );
			}, name, value, arguments.length > 1 );
		}
	} );


	function Tween( elem, options, prop, end, easing ) {
		return new Tween.prototype.init( elem, options, prop, end, easing );
	}
	jQuery.Tween = Tween;

	Tween.prototype = {
		constructor: Tween,
		init: function( elem, options, prop, end, easing, unit ) {
			this.elem = elem;
			this.prop = prop;
			this.easing = easing || jQuery.easing._default;
			this.options = options;
			this.start = this.now = this.cur();
			this.end = end;
			this.unit = unit || ( jQuery.cssNumber[ prop ] ? "" : "px" );
		},
		cur: function() {
			var hooks = Tween.propHooks[ this.prop ];

			return hooks && hooks.get ?
				hooks.get( this ) :
				Tween.propHooks._default.get( this );
		},
		run: function( percent ) {
			var eased,
				hooks = Tween.propHooks[ this.prop ];

			if ( this.options.duration ) {
				this.pos = eased = jQuery.easing[ this.easing ](
					percent, this.options.duration * percent, 0, 1, this.options.duration
				);
			} else {
				this.pos = eased = percent;
			}
			this.now = ( this.end - this.start ) * eased + this.start;

			if ( this.options.step ) {
				this.options.step.call( this.elem, this.now, this );
			}

			if ( hooks && hooks.set ) {
				hooks.set( this );
			} else {
				Tween.propHooks._default.set( this );
			}
			return this;
		}
	};

	Tween.prototype.init.prototype = Tween.prototype;

	Tween.propHooks = {
		_default: {
			get: function( tween ) {
				var result;

				// Use a property on the element directly when it is not a DOM element,
				// or when there is no matching style property that exists.
				if ( tween.elem.nodeType !== 1 ||
					tween.elem[ tween.prop ] != null && tween.elem.style[ tween.prop ] == null ) {
					return tween.elem[ tween.prop ];
				}

				// Passing an empty string as a 3rd parameter to .css will automatically
				// attempt a parseFloat and fallback to a string if the parse fails.
				// Simple values such as "10px" are parsed to Float;
				// complex values such as "rotate(1rad)" are returned as-is.
				result = jQuery.css( tween.elem, tween.prop, "" );

				// Empty strings, null, undefined and "auto" are converted to 0.
				return !result || result === "auto" ? 0 : result;
			},
			set: function( tween ) {

				// Use step hook for back compat.
				// Use cssHook if its there.
				// Use .style if available and use plain properties where available.
				if ( jQuery.fx.step[ tween.prop ] ) {
					jQuery.fx.step[ tween.prop ]( tween );
				} else if ( tween.elem.nodeType === 1 && (
						jQuery.cssHooks[ tween.prop ] ||
						tween.elem.style[ finalPropName( tween.prop ) ] != null ) ) {
					jQuery.style( tween.elem, tween.prop, tween.now + tween.unit );
				} else {
					tween.elem[ tween.prop ] = tween.now;
				}
			}
		}
	};

	// Support: IE <=9 only
	// Panic based approach to setting things on disconnected nodes
	Tween.propHooks.scrollTop = Tween.propHooks.scrollLeft = {
		set: function( tween ) {
			if ( tween.elem.nodeType && tween.elem.parentNode ) {
				tween.elem[ tween.prop ] = tween.now;
			}
		}
	};

	jQuery.easing = {
		linear: function( p ) {
			return p;
		},
		swing: function( p ) {
			return 0.5 - Math.cos( p * Math.PI ) / 2;
		},
		_default: "swing"
	};

	jQuery.fx = Tween.prototype.init;

	// Back compat <1.8 extension point
	jQuery.fx.step = {};




	var
		fxNow, inProgress,
		rfxtypes = /^(?:toggle|show|hide)$/,
		rrun = /queueHooks$/;

	function schedule() {
		if ( inProgress ) {
			if ( document.hidden === false && window.requestAnimationFrame ) {
				window.requestAnimationFrame( schedule );
			} else {
				window.setTimeout( schedule, jQuery.fx.interval );
			}

			jQuery.fx.tick();
		}
	}

	// Animations created synchronously will run synchronously
	function createFxNow() {
		window.setTimeout( function() {
			fxNow = undefined;
		} );
		return ( fxNow = Date.now() );
	}

	// Generate parameters to create a standard animation
	function genFx( type, includeWidth ) {
		var which,
			i = 0,
			attrs = { height: type };

		// If we include width, step value is 1 to do all cssExpand values,
		// otherwise step value is 2 to skip over Left and Right
		includeWidth = includeWidth ? 1 : 0;
		for ( ; i < 4; i += 2 - includeWidth ) {
			which = cssExpand[ i ];
			attrs[ "margin" + which ] = attrs[ "padding" + which ] = type;
		}

		if ( includeWidth ) {
			attrs.opacity = attrs.width = type;
		}

		return attrs;
	}

	function createTween( value, prop, animation ) {
		var tween,
			collection = ( Animation.tweeners[ prop ] || [] ).concat( Animation.tweeners[ "*" ] ),
			index = 0,
			length = collection.length;
		for ( ; index < length; index++ ) {
			if ( ( tween = collection[ index ].call( animation, prop, value ) ) ) {

				// We're done with this property
				return tween;
			}
		}
	}

	function defaultPrefilter( elem, props, opts ) {
		var prop, value, toggle, hooks, oldfire, propTween, restoreDisplay, display,
			isBox = "width" in props || "height" in props,
			anim = this,
			orig = {},
			style = elem.style,
			hidden = elem.nodeType && isHiddenWithinTree( elem ),
			dataShow = dataPriv.get( elem, "fxshow" );

		// Queue-skipping animations hijack the fx hooks
		if ( !opts.queue ) {
			hooks = jQuery._queueHooks( elem, "fx" );
			if ( hooks.unqueued == null ) {
				hooks.unqueued = 0;
				oldfire = hooks.empty.fire;
				hooks.empty.fire = function() {
					if ( !hooks.unqueued ) {
						oldfire();
					}
				};
			}
			hooks.unqueued++;

			anim.always( function() {

				// Ensure the complete handler is called before this completes
				anim.always( function() {
					hooks.unqueued--;
					if ( !jQuery.queue( elem, "fx" ).length ) {
						hooks.empty.fire();
					}
				} );
			} );
		}

		// Detect show/hide animations
		for ( prop in props ) {
			value = props[ prop ];
			if ( rfxtypes.test( value ) ) {
				delete props[ prop ];
				toggle = toggle || value === "toggle";
				if ( value === ( hidden ? "hide" : "show" ) ) {

					// Pretend to be hidden if this is a "show" and
					// there is still data from a stopped show/hide
					if ( value === "show" && dataShow && dataShow[ prop ] !== undefined ) {
						hidden = true;

					// Ignore all other no-op show/hide data
					} else {
						continue;
					}
				}
				orig[ prop ] = dataShow && dataShow[ prop ] || jQuery.style( elem, prop );
			}
		}

		// Bail out if this is a no-op like .hide().hide()
		propTween = !jQuery.isEmptyObject( props );
		if ( !propTween && jQuery.isEmptyObject( orig ) ) {
			return;
		}

		// Restrict "overflow" and "display" styles during box animations
		if ( isBox && elem.nodeType === 1 ) {

			// Support: IE <=9 - 11, Edge 12 - 15
			// Record all 3 overflow attributes because IE does not infer the shorthand
			// from identically-valued overflowX and overflowY and Edge just mirrors
			// the overflowX value there.
			opts.overflow = [ style.overflow, style.overflowX, style.overflowY ];

			// Identify a display type, preferring old show/hide data over the CSS cascade
			restoreDisplay = dataShow && dataShow.display;
			if ( restoreDisplay == null ) {
				restoreDisplay = dataPriv.get( elem, "display" );
			}
			display = jQuery.css( elem, "display" );
			if ( display === "none" ) {
				if ( restoreDisplay ) {
					display = restoreDisplay;
				} else {

					// Get nonempty value(s) by temporarily forcing visibility
					showHide( [ elem ], true );
					restoreDisplay = elem.style.display || restoreDisplay;
					display = jQuery.css( elem, "display" );
					showHide( [ elem ] );
				}
			}

			// Animate inline elements as inline-block
			if ( display === "inline" || display === "inline-block" && restoreDisplay != null ) {
				if ( jQuery.css( elem, "float" ) === "none" ) {

					// Restore the original display value at the end of pure show/hide animations
					if ( !propTween ) {
						anim.done( function() {
							style.display = restoreDisplay;
						} );
						if ( restoreDisplay == null ) {
							display = style.display;
							restoreDisplay = display === "none" ? "" : display;
						}
					}
					style.display = "inline-block";
				}
			}
		}

		if ( opts.overflow ) {
			style.overflow = "hidden";
			anim.always( function() {
				style.overflow = opts.overflow[ 0 ];
				style.overflowX = opts.overflow[ 1 ];
				style.overflowY = opts.overflow[ 2 ];
			} );
		}

		// Implement show/hide animations
		propTween = false;
		for ( prop in orig ) {

			// General show/hide setup for this element animation
			if ( !propTween ) {
				if ( dataShow ) {
					if ( "hidden" in dataShow ) {
						hidden = dataShow.hidden;
					}
				} else {
					dataShow = dataPriv.access( elem, "fxshow", { display: restoreDisplay } );
				}

				// Store hidden/visible for toggle so `.stop().toggle()` "reverses"
				if ( toggle ) {
					dataShow.hidden = !hidden;
				}

				// Show elements before animating them
				if ( hidden ) {
					showHide( [ elem ], true );
				}

				/* eslint-disable no-loop-func */

				anim.done( function() {

				/* eslint-enable no-loop-func */

					// The final step of a "hide" animation is actually hiding the element
					if ( !hidden ) {
						showHide( [ elem ] );
					}
					dataPriv.remove( elem, "fxshow" );
					for ( prop in orig ) {
						jQuery.style( elem, prop, orig[ prop ] );
					}
				} );
			}

			// Per-property setup
			propTween = createTween( hidden ? dataShow[ prop ] : 0, prop, anim );
			if ( !( prop in dataShow ) ) {
				dataShow[ prop ] = propTween.start;
				if ( hidden ) {
					propTween.end = propTween.start;
					propTween.start = 0;
				}
			}
		}
	}

	function propFilter( props, specialEasing ) {
		var index, name, easing, value, hooks;

		// camelCase, specialEasing and expand cssHook pass
		for ( index in props ) {
			name = camelCase( index );
			easing = specialEasing[ name ];
			value = props[ index ];
			if ( Array.isArray( value ) ) {
				easing = value[ 1 ];
				value = props[ index ] = value[ 0 ];
			}

			if ( index !== name ) {
				props[ name ] = value;
				delete props[ index ];
			}

			hooks = jQuery.cssHooks[ name ];
			if ( hooks && "expand" in hooks ) {
				value = hooks.expand( value );
				delete props[ name ];

				// Not quite $.extend, this won't overwrite existing keys.
				// Reusing 'index' because we have the correct "name"
				for ( index in value ) {
					if ( !( index in props ) ) {
						props[ index ] = value[ index ];
						specialEasing[ index ] = easing;
					}
				}
			} else {
				specialEasing[ name ] = easing;
			}
		}
	}

	function Animation( elem, properties, options ) {
		var result,
			stopped,
			index = 0,
			length = Animation.prefilters.length,
			deferred = jQuery.Deferred().always( function() {

				// Don't match elem in the :animated selector
				delete tick.elem;
			} ),
			tick = function() {
				if ( stopped ) {
					return false;
				}
				var currentTime = fxNow || createFxNow(),
					remaining = Math.max( 0, animation.startTime + animation.duration - currentTime ),

					// Support: Android 2.3 only
					// Archaic crash bug won't allow us to use `1 - ( 0.5 || 0 )` (#12497)
					temp = remaining / animation.duration || 0,
					percent = 1 - temp,
					index = 0,
					length = animation.tweens.length;

				for ( ; index < length; index++ ) {
					animation.tweens[ index ].run( percent );
				}

				deferred.notifyWith( elem, [ animation, percent, remaining ] );

				// If there's more to do, yield
				if ( percent < 1 && length ) {
					return remaining;
				}

				// If this was an empty animation, synthesize a final progress notification
				if ( !length ) {
					deferred.notifyWith( elem, [ animation, 1, 0 ] );
				}

				// Resolve the animation and report its conclusion
				deferred.resolveWith( elem, [ animation ] );
				return false;
			},
			animation = deferred.promise( {
				elem: elem,
				props: jQuery.extend( {}, properties ),
				opts: jQuery.extend( true, {
					specialEasing: {},
					easing: jQuery.easing._default
				}, options ),
				originalProperties: properties,
				originalOptions: options,
				startTime: fxNow || createFxNow(),
				duration: options.duration,
				tweens: [],
				createTween: function( prop, end ) {
					var tween = jQuery.Tween( elem, animation.opts, prop, end,
							animation.opts.specialEasing[ prop ] || animation.opts.easing );
					animation.tweens.push( tween );
					return tween;
				},
				stop: function( gotoEnd ) {
					var index = 0,

						// If we are going to the end, we want to run all the tweens
						// otherwise we skip this part
						length = gotoEnd ? animation.tweens.length : 0;
					if ( stopped ) {
						return this;
					}
					stopped = true;
					for ( ; index < length; index++ ) {
						animation.tweens[ index ].run( 1 );
					}

					// Resolve when we played the last frame; otherwise, reject
					if ( gotoEnd ) {
						deferred.notifyWith( elem, [ animation, 1, 0 ] );
						deferred.resolveWith( elem, [ animation, gotoEnd ] );
					} else {
						deferred.rejectWith( elem, [ animation, gotoEnd ] );
					}
					return this;
				}
			} ),
			props = animation.props;

		propFilter( props, animation.opts.specialEasing );

		for ( ; index < length; index++ ) {
			result = Animation.prefilters[ index ].call( animation, elem, props, animation.opts );
			if ( result ) {
				if ( isFunction( result.stop ) ) {
					jQuery._queueHooks( animation.elem, animation.opts.queue ).stop =
						result.stop.bind( result );
				}
				return result;
			}
		}

		jQuery.map( props, createTween, animation );

		if ( isFunction( animation.opts.start ) ) {
			animation.opts.start.call( elem, animation );
		}

		// Attach callbacks from options
		animation
			.progress( animation.opts.progress )
			.done( animation.opts.done, animation.opts.complete )
			.fail( animation.opts.fail )
			.always( animation.opts.always );

		jQuery.fx.timer(
			jQuery.extend( tick, {
				elem: elem,
				anim: animation,
				queue: animation.opts.queue
			} )
		);

		return animation;
	}

	jQuery.Animation = jQuery.extend( Animation, {

		tweeners: {
			"*": [ function( prop, value ) {
				var tween = this.createTween( prop, value );
				adjustCSS( tween.elem, prop, rcssNum.exec( value ), tween );
				return tween;
			} ]
		},

		tweener: function( props, callback ) {
			if ( isFunction( props ) ) {
				callback = props;
				props = [ "*" ];
			} else {
				props = props.match( rnothtmlwhite );
			}

			var prop,
				index = 0,
				length = props.length;

			for ( ; index < length; index++ ) {
				prop = props[ index ];
				Animation.tweeners[ prop ] = Animation.tweeners[ prop ] || [];
				Animation.tweeners[ prop ].unshift( callback );
			}
		},

		prefilters: [ defaultPrefilter ],

		prefilter: function( callback, prepend ) {
			if ( prepend ) {
				Animation.prefilters.unshift( callback );
			} else {
				Animation.prefilters.push( callback );
			}
		}
	} );

	jQuery.speed = function( speed, easing, fn ) {
		var opt = speed && typeof speed === "object" ? jQuery.extend( {}, speed ) : {
			complete: fn || !fn && easing ||
				isFunction( speed ) && speed,
			duration: speed,
			easing: fn && easing || easing && !isFunction( easing ) && easing
		};

		// Go to the end state if fx are off
		if ( jQuery.fx.off ) {
			opt.duration = 0;

		} else {
			if ( typeof opt.duration !== "number" ) {
				if ( opt.duration in jQuery.fx.speeds ) {
					opt.duration = jQuery.fx.speeds[ opt.duration ];

				} else {
					opt.duration = jQuery.fx.speeds._default;
				}
			}
		}

		// Normalize opt.queue - true/undefined/null -> "fx"
		if ( opt.queue == null || opt.queue === true ) {
			opt.queue = "fx";
		}

		// Queueing
		opt.old = opt.complete;

		opt.complete = function() {
			if ( isFunction( opt.old ) ) {
				opt.old.call( this );
			}

			if ( opt.queue ) {
				jQuery.dequeue( this, opt.queue );
			}
		};

		return opt;
	};

	jQuery.fn.extend( {
		fadeTo: function( speed, to, easing, callback ) {

			// Show any hidden elements after setting opacity to 0
			return this.filter( isHiddenWithinTree ).css( "opacity", 0 ).show()

				// Animate to the value specified
				.end().animate( { opacity: to }, speed, easing, callback );
		},
		animate: function( prop, speed, easing, callback ) {
			var empty = jQuery.isEmptyObject( prop ),
				optall = jQuery.speed( speed, easing, callback ),
				doAnimation = function() {

					// Operate on a copy of prop so per-property easing won't be lost
					var anim = Animation( this, jQuery.extend( {}, prop ), optall );

					// Empty animations, or finishing resolves immediately
					if ( empty || dataPriv.get( this, "finish" ) ) {
						anim.stop( true );
					}
				};
				doAnimation.finish = doAnimation;

			return empty || optall.queue === false ?
				this.each( doAnimation ) :
				this.queue( optall.queue, doAnimation );
		},
		stop: function( type, clearQueue, gotoEnd ) {
			var stopQueue = function( hooks ) {
				var stop = hooks.stop;
				delete hooks.stop;
				stop( gotoEnd );
			};

			if ( typeof type !== "string" ) {
				gotoEnd = clearQueue;
				clearQueue = type;
				type = undefined;
			}
			if ( clearQueue ) {
				this.queue( type || "fx", [] );
			}

			return this.each( function() {
				var dequeue = true,
					index = type != null && type + "queueHooks",
					timers = jQuery.timers,
					data = dataPriv.get( this );

				if ( index ) {
					if ( data[ index ] && data[ index ].stop ) {
						stopQueue( data[ index ] );
					}
				} else {
					for ( index in data ) {
						if ( data[ index ] && data[ index ].stop && rrun.test( index ) ) {
							stopQueue( data[ index ] );
						}
					}
				}

				for ( index = timers.length; index--; ) {
					if ( timers[ index ].elem === this &&
						( type == null || timers[ index ].queue === type ) ) {

						timers[ index ].anim.stop( gotoEnd );
						dequeue = false;
						timers.splice( index, 1 );
					}
				}

				// Start the next in the queue if the last step wasn't forced.
				// Timers currently will call their complete callbacks, which
				// will dequeue but only if they were gotoEnd.
				if ( dequeue || !gotoEnd ) {
					jQuery.dequeue( this, type );
				}
			} );
		},
		finish: function( type ) {
			if ( type !== false ) {
				type = type || "fx";
			}
			return this.each( function() {
				var index,
					data = dataPriv.get( this ),
					queue = data[ type + "queue" ],
					hooks = data[ type + "queueHooks" ],
					timers = jQuery.timers,
					length = queue ? queue.length : 0;

				// Enable finishing flag on private data
				data.finish = true;

				// Empty the queue first
				jQuery.queue( this, type, [] );

				if ( hooks && hooks.stop ) {
					hooks.stop.call( this, true );
				}

				// Look for any active animations, and finish them
				for ( index = timers.length; index--; ) {
					if ( timers[ index ].elem === this && timers[ index ].queue === type ) {
						timers[ index ].anim.stop( true );
						timers.splice( index, 1 );
					}
				}

				// Look for any animations in the old queue and finish them
				for ( index = 0; index < length; index++ ) {
					if ( queue[ index ] && queue[ index ].finish ) {
						queue[ index ].finish.call( this );
					}
				}

				// Turn off finishing flag
				delete data.finish;
			} );
		}
	} );

	jQuery.each( [ "toggle", "show", "hide" ], function( _i, name ) {
		var cssFn = jQuery.fn[ name ];
		jQuery.fn[ name ] = function( speed, easing, callback ) {
			return speed == null || typeof speed === "boolean" ?
				cssFn.apply( this, arguments ) :
				this.animate( genFx( name, true ), speed, easing, callback );
		};
	} );

	// Generate shortcuts for custom animations
	jQuery.each( {
		slideDown: genFx( "show" ),
		slideUp: genFx( "hide" ),
		slideToggle: genFx( "toggle" ),
		fadeIn: { opacity: "show" },
		fadeOut: { opacity: "hide" },
		fadeToggle: { opacity: "toggle" }
	}, function( name, props ) {
		jQuery.fn[ name ] = function( speed, easing, callback ) {
			return this.animate( props, speed, easing, callback );
		};
	} );

	jQuery.timers = [];
	jQuery.fx.tick = function() {
		var timer,
			i = 0,
			timers = jQuery.timers;

		fxNow = Date.now();

		for ( ; i < timers.length; i++ ) {
			timer = timers[ i ];

			// Run the timer and safely remove it when done (allowing for external removal)
			if ( !timer() && timers[ i ] === timer ) {
				timers.splice( i--, 1 );
			}
		}

		if ( !timers.length ) {
			jQuery.fx.stop();
		}
		fxNow = undefined;
	};

	jQuery.fx.timer = function( timer ) {
		jQuery.timers.push( timer );
		jQuery.fx.start();
	};

	jQuery.fx.interval = 13;
	jQuery.fx.start = function() {
		if ( inProgress ) {
			return;
		}

		inProgress = true;
		schedule();
	};

	jQuery.fx.stop = function() {
		inProgress = null;
	};

	jQuery.fx.speeds = {
		slow: 600,
		fast: 200,

		// Default speed
		_default: 400
	};


	// Based off of the plugin by Clint Helfers, with permission.
	// https://web.archive.org/web/20100324014747/http://blindsignals.com/index.php/2009/07/jquery-delay/
	jQuery.fn.delay = function( time, type ) {
		time = jQuery.fx ? jQuery.fx.speeds[ time ] || time : time;
		type = type || "fx";

		return this.queue( type, function( next, hooks ) {
			var timeout = window.setTimeout( next, time );
			hooks.stop = function() {
				window.clearTimeout( timeout );
			};
		} );
	};


	( function() {
		var input = document.createElement( "input" ),
			select = document.createElement( "select" ),
			opt = select.appendChild( document.createElement( "option" ) );

		input.type = "checkbox";

		// Support: Android <=4.3 only
		// Default value for a checkbox should be "on"
		support.checkOn = input.value !== "";

		// Support: IE <=11 only
		// Must access selectedIndex to make default options select
		support.optSelected = opt.selected;

		// Support: IE <=11 only
		// An input loses its value after becoming a radio
		input = document.createElement( "input" );
		input.value = "t";
		input.type = "radio";
		support.radioValue = input.value === "t";
	} )();


	var boolHook,
		attrHandle = jQuery.expr.attrHandle;

	jQuery.fn.extend( {
		attr: function( name, value ) {
			return access( this, jQuery.attr, name, value, arguments.length > 1 );
		},

		removeAttr: function( name ) {
			return this.each( function() {
				jQuery.removeAttr( this, name );
			} );
		}
	} );

	jQuery.extend( {
		attr: function( elem, name, value ) {
			var ret, hooks,
				nType = elem.nodeType;

			// Don't get/set attributes on text, comment and attribute nodes
			if ( nType === 3 || nType === 8 || nType === 2 ) {
				return;
			}

			// Fallback to prop when attributes are not supported
			if ( typeof elem.getAttribute === "undefined" ) {
				return jQuery.prop( elem, name, value );
			}

			// Attribute hooks are determined by the lowercase version
			// Grab necessary hook if one is defined
			if ( nType !== 1 || !jQuery.isXMLDoc( elem ) ) {
				hooks = jQuery.attrHooks[ name.toLowerCase() ] ||
					( jQuery.expr.match.bool.test( name ) ? boolHook : undefined );
			}

			if ( value !== undefined ) {
				if ( value === null ) {
					jQuery.removeAttr( elem, name );
					return;
				}

				if ( hooks && "set" in hooks &&
					( ret = hooks.set( elem, value, name ) ) !== undefined ) {
					return ret;
				}

				elem.setAttribute( name, value + "" );
				return value;
			}

			if ( hooks && "get" in hooks && ( ret = hooks.get( elem, name ) ) !== null ) {
				return ret;
			}

			ret = jQuery.find.attr( elem, name );

			// Non-existent attributes return null, we normalize to undefined
			return ret == null ? undefined : ret;
		},

		attrHooks: {
			type: {
				set: function( elem, value ) {
					if ( !support.radioValue && value === "radio" &&
						nodeName( elem, "input" ) ) {
						var val = elem.value;
						elem.setAttribute( "type", value );
						if ( val ) {
							elem.value = val;
						}
						return value;
					}
				}
			}
		},

		removeAttr: function( elem, value ) {
			var name,
				i = 0,

				// Attribute names can contain non-HTML whitespace characters
				// https://html.spec.whatwg.org/multipage/syntax.html#attributes-2
				attrNames = value && value.match( rnothtmlwhite );

			if ( attrNames && elem.nodeType === 1 ) {
				while ( ( name = attrNames[ i++ ] ) ) {
					elem.removeAttribute( name );
				}
			}
		}
	} );

	// Hooks for boolean attributes
	boolHook = {
		set: function( elem, value, name ) {
			if ( value === false ) {

				// Remove boolean attributes when set to false
				jQuery.removeAttr( elem, name );
			} else {
				elem.setAttribute( name, name );
			}
			return name;
		}
	};

	jQuery.each( jQuery.expr.match.bool.source.match( /\w+/g ), function( _i, name ) {
		var getter = attrHandle[ name ] || jQuery.find.attr;

		attrHandle[ name ] = function( elem, name, isXML ) {
			var ret, handle,
				lowercaseName = name.toLowerCase();

			if ( !isXML ) {

				// Avoid an infinite loop by temporarily removing this function from the getter
				handle = attrHandle[ lowercaseName ];
				attrHandle[ lowercaseName ] = ret;
				ret = getter( elem, name, isXML ) != null ?
					lowercaseName :
					null;
				attrHandle[ lowercaseName ] = handle;
			}
			return ret;
		};
	} );




	var rfocusable = /^(?:input|select|textarea|button)$/i,
		rclickable = /^(?:a|area)$/i;

	jQuery.fn.extend( {
		prop: function( name, value ) {
			return access( this, jQuery.prop, name, value, arguments.length > 1 );
		},

		removeProp: function( name ) {
			return this.each( function() {
				delete this[ jQuery.propFix[ name ] || name ];
			} );
		}
	} );

	jQuery.extend( {
		prop: function( elem, name, value ) {
			var ret, hooks,
				nType = elem.nodeType;

			// Don't get/set properties on text, comment and attribute nodes
			if ( nType === 3 || nType === 8 || nType === 2 ) {
				return;
			}

			if ( nType !== 1 || !jQuery.isXMLDoc( elem ) ) {

				// Fix name and attach hooks
				name = jQuery.propFix[ name ] || name;
				hooks = jQuery.propHooks[ name ];
			}

			if ( value !== undefined ) {
				if ( hooks && "set" in hooks &&
					( ret = hooks.set( elem, value, name ) ) !== undefined ) {
					return ret;
				}

				return ( elem[ name ] = value );
			}

			if ( hooks && "get" in hooks && ( ret = hooks.get( elem, name ) ) !== null ) {
				return ret;
			}

			return elem[ name ];
		},

		propHooks: {
			tabIndex: {
				get: function( elem ) {

					// Support: IE <=9 - 11 only
					// elem.tabIndex doesn't always return the
					// correct value when it hasn't been explicitly set
					// https://web.archive.org/web/20141116233347/http://fluidproject.org/blog/2008/01/09/getting-setting-and-removing-tabindex-values-with-javascript/
					// Use proper attribute retrieval(#12072)
					var tabindex = jQuery.find.attr( elem, "tabindex" );

					if ( tabindex ) {
						return parseInt( tabindex, 10 );
					}

					if (
						rfocusable.test( elem.nodeName ) ||
						rclickable.test( elem.nodeName ) &&
						elem.href
					) {
						return 0;
					}

					return -1;
				}
			}
		},

		propFix: {
			"for": "htmlFor",
			"class": "className"
		}
	} );

	// Support: IE <=11 only
	// Accessing the selectedIndex property
	// forces the browser to respect setting selected
	// on the option
	// The getter ensures a default option is selected
	// when in an optgroup
	// eslint rule "no-unused-expressions" is disabled for this code
	// since it considers such accessions noop
	if ( !support.optSelected ) {
		jQuery.propHooks.selected = {
			get: function( elem ) {

				/* eslint no-unused-expressions: "off" */

				var parent = elem.parentNode;
				if ( parent && parent.parentNode ) {
					parent.parentNode.selectedIndex;
				}
				return null;
			},
			set: function( elem ) {

				/* eslint no-unused-expressions: "off" */

				var parent = elem.parentNode;
				if ( parent ) {
					parent.selectedIndex;

					if ( parent.parentNode ) {
						parent.parentNode.selectedIndex;
					}
				}
			}
		};
	}

	jQuery.each( [
		"tabIndex",
		"readOnly",
		"maxLength",
		"cellSpacing",
		"cellPadding",
		"rowSpan",
		"colSpan",
		"useMap",
		"frameBorder",
		"contentEditable"
	], function() {
		jQuery.propFix[ this.toLowerCase() ] = this;
	} );




		// Strip and collapse whitespace according to HTML spec
		// https://infra.spec.whatwg.org/#strip-and-collapse-ascii-whitespace
		function stripAndCollapse( value ) {
			var tokens = value.match( rnothtmlwhite ) || [];
			return tokens.join( " " );
		}


	function getClass( elem ) {
		return elem.getAttribute && elem.getAttribute( "class" ) || "";
	}

	function classesToArray( value ) {
		if ( Array.isArray( value ) ) {
			return value;
		}
		if ( typeof value === "string" ) {
			return value.match( rnothtmlwhite ) || [];
		}
		return [];
	}

	jQuery.fn.extend( {
		addClass: function( value ) {
			var classes, elem, cur, curValue, clazz, j, finalValue,
				i = 0;

			if ( isFunction( value ) ) {
				return this.each( function( j ) {
					jQuery( this ).addClass( value.call( this, j, getClass( this ) ) );
				} );
			}

			classes = classesToArray( value );

			if ( classes.length ) {
				while ( ( elem = this[ i++ ] ) ) {
					curValue = getClass( elem );
					cur = elem.nodeType === 1 && ( " " + stripAndCollapse( curValue ) + " " );

					if ( cur ) {
						j = 0;
						while ( ( clazz = classes[ j++ ] ) ) {
							if ( cur.indexOf( " " + clazz + " " ) < 0 ) {
								cur += clazz + " ";
							}
						}

						// Only assign if different to avoid unneeded rendering.
						finalValue = stripAndCollapse( cur );
						if ( curValue !== finalValue ) {
							elem.setAttribute( "class", finalValue );
						}
					}
				}
			}

			return this;
		},

		removeClass: function( value ) {
			var classes, elem, cur, curValue, clazz, j, finalValue,
				i = 0;

			if ( isFunction( value ) ) {
				return this.each( function( j ) {
					jQuery( this ).removeClass( value.call( this, j, getClass( this ) ) );
				} );
			}

			if ( !arguments.length ) {
				return this.attr( "class", "" );
			}

			classes = classesToArray( value );

			if ( classes.length ) {
				while ( ( elem = this[ i++ ] ) ) {
					curValue = getClass( elem );

					// This expression is here for better compressibility (see addClass)
					cur = elem.nodeType === 1 && ( " " + stripAndCollapse( curValue ) + " " );

					if ( cur ) {
						j = 0;
						while ( ( clazz = classes[ j++ ] ) ) {

							// Remove *all* instances
							while ( cur.indexOf( " " + clazz + " " ) > -1 ) {
								cur = cur.replace( " " + clazz + " ", " " );
							}
						}

						// Only assign if different to avoid unneeded rendering.
						finalValue = stripAndCollapse( cur );
						if ( curValue !== finalValue ) {
							elem.setAttribute( "class", finalValue );
						}
					}
				}
			}

			return this;
		},

		toggleClass: function( value, stateVal ) {
			var type = typeof value,
				isValidValue = type === "string" || Array.isArray( value );

			if ( typeof stateVal === "boolean" && isValidValue ) {
				return stateVal ? this.addClass( value ) : this.removeClass( value );
			}

			if ( isFunction( value ) ) {
				return this.each( function( i ) {
					jQuery( this ).toggleClass(
						value.call( this, i, getClass( this ), stateVal ),
						stateVal
					);
				} );
			}

			return this.each( function() {
				var className, i, self, classNames;

				if ( isValidValue ) {

					// Toggle individual class names
					i = 0;
					self = jQuery( this );
					classNames = classesToArray( value );

					while ( ( className = classNames[ i++ ] ) ) {

						// Check each className given, space separated list
						if ( self.hasClass( className ) ) {
							self.removeClass( className );
						} else {
							self.addClass( className );
						}
					}

				// Toggle whole class name
				} else if ( value === undefined || type === "boolean" ) {
					className = getClass( this );
					if ( className ) {

						// Store className if set
						dataPriv.set( this, "__className__", className );
					}

					// If the element has a class name or if we're passed `false`,
					// then remove the whole classname (if there was one, the above saved it).
					// Otherwise bring back whatever was previously saved (if anything),
					// falling back to the empty string if nothing was stored.
					if ( this.setAttribute ) {
						this.setAttribute( "class",
							className || value === false ?
							"" :
							dataPriv.get( this, "__className__" ) || ""
						);
					}
				}
			} );
		},

		hasClass: function( selector ) {
			var className, elem,
				i = 0;

			className = " " + selector + " ";
			while ( ( elem = this[ i++ ] ) ) {
				if ( elem.nodeType === 1 &&
					( " " + stripAndCollapse( getClass( elem ) ) + " " ).indexOf( className ) > -1 ) {
						return true;
				}
			}

			return false;
		}
	} );




	var rreturn = /\r/g;

	jQuery.fn.extend( {
		val: function( value ) {
			var hooks, ret, valueIsFunction,
				elem = this[ 0 ];

			if ( !arguments.length ) {
				if ( elem ) {
					hooks = jQuery.valHooks[ elem.type ] ||
						jQuery.valHooks[ elem.nodeName.toLowerCase() ];

					if ( hooks &&
						"get" in hooks &&
						( ret = hooks.get( elem, "value" ) ) !== undefined
					) {
						return ret;
					}

					ret = elem.value;

					// Handle most common string cases
					if ( typeof ret === "string" ) {
						return ret.replace( rreturn, "" );
					}

					// Handle cases where value is null/undef or number
					return ret == null ? "" : ret;
				}

				return;
			}

			valueIsFunction = isFunction( value );

			return this.each( function( i ) {
				var val;

				if ( this.nodeType !== 1 ) {
					return;
				}

				if ( valueIsFunction ) {
					val = value.call( this, i, jQuery( this ).val() );
				} else {
					val = value;
				}

				// Treat null/undefined as ""; convert numbers to string
				if ( val == null ) {
					val = "";

				} else if ( typeof val === "number" ) {
					val += "";

				} else if ( Array.isArray( val ) ) {
					val = jQuery.map( val, function( value ) {
						return value == null ? "" : value + "";
					} );
				}

				hooks = jQuery.valHooks[ this.type ] || jQuery.valHooks[ this.nodeName.toLowerCase() ];

				// If set returns undefined, fall back to normal setting
				if ( !hooks || !( "set" in hooks ) || hooks.set( this, val, "value" ) === undefined ) {
					this.value = val;
				}
			} );
		}
	} );

	jQuery.extend( {
		valHooks: {
			option: {
				get: function( elem ) {

					var val = jQuery.find.attr( elem, "value" );
					return val != null ?
						val :

						// Support: IE <=10 - 11 only
						// option.text throws exceptions (#14686, #14858)
						// Strip and collapse whitespace
						// https://html.spec.whatwg.org/#strip-and-collapse-whitespace
						stripAndCollapse( jQuery.text( elem ) );
				}
			},
			select: {
				get: function( elem ) {
					var value, option, i,
						options = elem.options,
						index = elem.selectedIndex,
						one = elem.type === "select-one",
						values = one ? null : [],
						max = one ? index + 1 : options.length;

					if ( index < 0 ) {
						i = max;

					} else {
						i = one ? index : 0;
					}

					// Loop through all the selected options
					for ( ; i < max; i++ ) {
						option = options[ i ];

						// Support: IE <=9 only
						// IE8-9 doesn't update selected after form reset (#2551)
						if ( ( option.selected || i === index ) &&

								// Don't return options that are disabled or in a disabled optgroup
								!option.disabled &&
								( !option.parentNode.disabled ||
									!nodeName( option.parentNode, "optgroup" ) ) ) {

							// Get the specific value for the option
							value = jQuery( option ).val();

							// We don't need an array for one selects
							if ( one ) {
								return value;
							}

							// Multi-Selects return an array
							values.push( value );
						}
					}

					return values;
				},

				set: function( elem, value ) {
					var optionSet, option,
						options = elem.options,
						values = jQuery.makeArray( value ),
						i = options.length;

					while ( i-- ) {
						option = options[ i ];

						/* eslint-disable no-cond-assign */

						if ( option.selected =
							jQuery.inArray( jQuery.valHooks.option.get( option ), values ) > -1
						) {
							optionSet = true;
						}

						/* eslint-enable no-cond-assign */
					}

					// Force browsers to behave consistently when non-matching value is set
					if ( !optionSet ) {
						elem.selectedIndex = -1;
					}
					return values;
				}
			}
		}
	} );

	// Radios and checkboxes getter/setter
	jQuery.each( [ "radio", "checkbox" ], function() {
		jQuery.valHooks[ this ] = {
			set: function( elem, value ) {
				if ( Array.isArray( value ) ) {
					return ( elem.checked = jQuery.inArray( jQuery( elem ).val(), value ) > -1 );
				}
			}
		};
		if ( !support.checkOn ) {
			jQuery.valHooks[ this ].get = function( elem ) {
				return elem.getAttribute( "value" ) === null ? "on" : elem.value;
			};
		}
	} );




	// Return jQuery for attributes-only inclusion


	support.focusin = "onfocusin" in window;


	var rfocusMorph = /^(?:focusinfocus|focusoutblur)$/,
		stopPropagationCallback = function( e ) {
			e.stopPropagation();
		};

	jQuery.extend( jQuery.event, {

		trigger: function( event, data, elem, onlyHandlers ) {

			var i, cur, tmp, bubbleType, ontype, handle, special, lastElement,
				eventPath = [ elem || document ],
				type = hasOwn.call( event, "type" ) ? event.type : event,
				namespaces = hasOwn.call( event, "namespace" ) ? event.namespace.split( "." ) : [];

			cur = lastElement = tmp = elem = elem || document;

			// Don't do events on text and comment nodes
			if ( elem.nodeType === 3 || elem.nodeType === 8 ) {
				return;
			}

			// focus/blur morphs to focusin/out; ensure we're not firing them right now
			if ( rfocusMorph.test( type + jQuery.event.triggered ) ) {
				return;
			}

			if ( type.indexOf( "." ) > -1 ) {

				// Namespaced trigger; create a regexp to match event type in handle()
				namespaces = type.split( "." );
				type = namespaces.shift();
				namespaces.sort();
			}
			ontype = type.indexOf( ":" ) < 0 && "on" + type;

			// Caller can pass in a jQuery.Event object, Object, or just an event type string
			event = event[ jQuery.expando ] ?
				event :
				new jQuery.Event( type, typeof event === "object" && event );

			// Trigger bitmask: & 1 for native handlers; & 2 for jQuery (always true)
			event.isTrigger = onlyHandlers ? 2 : 3;
			event.namespace = namespaces.join( "." );
			event.rnamespace = event.namespace ?
				new RegExp( "(^|\\.)" + namespaces.join( "\\.(?:.*\\.|)" ) + "(\\.|$)" ) :
				null;

			// Clean up the event in case it is being reused
			event.result = undefined;
			if ( !event.target ) {
				event.target = elem;
			}

			// Clone any incoming data and prepend the event, creating the handler arg list
			data = data == null ?
				[ event ] :
				jQuery.makeArray( data, [ event ] );

			// Allow special events to draw outside the lines
			special = jQuery.event.special[ type ] || {};
			if ( !onlyHandlers && special.trigger && special.trigger.apply( elem, data ) === false ) {
				return;
			}

			// Determine event propagation path in advance, per W3C events spec (#9951)
			// Bubble up to document, then to window; watch for a global ownerDocument var (#9724)
			if ( !onlyHandlers && !special.noBubble && !isWindow( elem ) ) {

				bubbleType = special.delegateType || type;
				if ( !rfocusMorph.test( bubbleType + type ) ) {
					cur = cur.parentNode;
				}
				for ( ; cur; cur = cur.parentNode ) {
					eventPath.push( cur );
					tmp = cur;
				}

				// Only add window if we got to document (e.g., not plain obj or detached DOM)
				if ( tmp === ( elem.ownerDocument || document ) ) {
					eventPath.push( tmp.defaultView || tmp.parentWindow || window );
				}
			}

			// Fire handlers on the event path
			i = 0;
			while ( ( cur = eventPath[ i++ ] ) && !event.isPropagationStopped() ) {
				lastElement = cur;
				event.type = i > 1 ?
					bubbleType :
					special.bindType || type;

				// jQuery handler
				handle = (
						dataPriv.get( cur, "events" ) || Object.create( null )
					)[ event.type ] &&
					dataPriv.get( cur, "handle" );
				if ( handle ) {
					handle.apply( cur, data );
				}

				// Native handler
				handle = ontype && cur[ ontype ];
				if ( handle && handle.apply && acceptData( cur ) ) {
					event.result = handle.apply( cur, data );
					if ( event.result === false ) {
						event.preventDefault();
					}
				}
			}
			event.type = type;

			// If nobody prevented the default action, do it now
			if ( !onlyHandlers && !event.isDefaultPrevented() ) {

				if ( ( !special._default ||
					special._default.apply( eventPath.pop(), data ) === false ) &&
					acceptData( elem ) ) {

					// Call a native DOM method on the target with the same name as the event.
					// Don't do default actions on window, that's where global variables be (#6170)
					if ( ontype && isFunction( elem[ type ] ) && !isWindow( elem ) ) {

						// Don't re-trigger an onFOO event when we call its FOO() method
						tmp = elem[ ontype ];

						if ( tmp ) {
							elem[ ontype ] = null;
						}

						// Prevent re-triggering of the same event, since we already bubbled it above
						jQuery.event.triggered = type;

						if ( event.isPropagationStopped() ) {
							lastElement.addEventListener( type, stopPropagationCallback );
						}

						elem[ type ]();

						if ( event.isPropagationStopped() ) {
							lastElement.removeEventListener( type, stopPropagationCallback );
						}

						jQuery.event.triggered = undefined;

						if ( tmp ) {
							elem[ ontype ] = tmp;
						}
					}
				}
			}

			return event.result;
		},

		// Piggyback on a donor event to simulate a different one
		// Used only for `focus(in | out)` events
		simulate: function( type, elem, event ) {
			var e = jQuery.extend(
				new jQuery.Event(),
				event,
				{
					type: type,
					isSimulated: true
				}
			);

			jQuery.event.trigger( e, null, elem );
		}

	} );

	jQuery.fn.extend( {

		trigger: function( type, data ) {
			return this.each( function() {
				jQuery.event.trigger( type, data, this );
			} );
		},
		triggerHandler: function( type, data ) {
			var elem = this[ 0 ];
			if ( elem ) {
				return jQuery.event.trigger( type, data, elem, true );
			}
		}
	} );


	// Support: Firefox <=44
	// Firefox doesn't have focus(in | out) events
	// Related ticket - https://bugzilla.mozilla.org/show_bug.cgi?id=687787
	//
	// Support: Chrome <=48 - 49, Safari <=9.0 - 9.1
	// focus(in | out) events fire after focus & blur events,
	// which is spec violation - http://www.w3.org/TR/DOM-Level-3-Events/#events-focusevent-event-order
	// Related ticket - https://bugs.chromium.org/p/chromium/issues/detail?id=449857
	if ( !support.focusin ) {
		jQuery.each( { focus: "focusin", blur: "focusout" }, function( orig, fix ) {

			// Attach a single capturing handler on the document while someone wants focusin/focusout
			var handler = function( event ) {
				jQuery.event.simulate( fix, event.target, jQuery.event.fix( event ) );
			};

			jQuery.event.special[ fix ] = {
				setup: function() {

					// Handle: regular nodes (via `this.ownerDocument`), window
					// (via `this.document`) & document (via `this`).
					var doc = this.ownerDocument || this.document || this,
						attaches = dataPriv.access( doc, fix );

					if ( !attaches ) {
						doc.addEventListener( orig, handler, true );
					}
					dataPriv.access( doc, fix, ( attaches || 0 ) + 1 );
				},
				teardown: function() {
					var doc = this.ownerDocument || this.document || this,
						attaches = dataPriv.access( doc, fix ) - 1;

					if ( !attaches ) {
						doc.removeEventListener( orig, handler, true );
						dataPriv.remove( doc, fix );

					} else {
						dataPriv.access( doc, fix, attaches );
					}
				}
			};
		} );
	}
	var location = window.location;

	var nonce = { guid: Date.now() };

	var rquery = ( /\?/ );



	// Cross-browser xml parsing
	jQuery.parseXML = function( data ) {
		var xml;
		if ( !data || typeof data !== "string" ) {
			return null;
		}

		// Support: IE 9 - 11 only
		// IE throws on parseFromString with invalid input.
		try {
			xml = ( new window.DOMParser() ).parseFromString( data, "text/xml" );
		} catch ( e ) {
			xml = undefined;
		}

		if ( !xml || xml.getElementsByTagName( "parsererror" ).length ) {
			jQuery.error( "Invalid XML: " + data );
		}
		return xml;
	};


	var
		rbracket = /\[\]$/,
		rCRLF = /\r?\n/g,
		rsubmitterTypes = /^(?:submit|button|image|reset|file)$/i,
		rsubmittable = /^(?:input|select|textarea|keygen)/i;

	function buildParams( prefix, obj, traditional, add ) {
		var name;

		if ( Array.isArray( obj ) ) {

			// Serialize array item.
			jQuery.each( obj, function( i, v ) {
				if ( traditional || rbracket.test( prefix ) ) {

					// Treat each array item as a scalar.
					add( prefix, v );

				} else {

					// Item is non-scalar (array or object), encode its numeric index.
					buildParams(
						prefix + "[" + ( typeof v === "object" && v != null ? i : "" ) + "]",
						v,
						traditional,
						add
					);
				}
			} );

		} else if ( !traditional && toType( obj ) === "object" ) {

			// Serialize object item.
			for ( name in obj ) {
				buildParams( prefix + "[" + name + "]", obj[ name ], traditional, add );
			}

		} else {

			// Serialize scalar item.
			add( prefix, obj );
		}
	}

	// Serialize an array of form elements or a set of
	// key/values into a query string
	jQuery.param = function( a, traditional ) {
		var prefix,
			s = [],
			add = function( key, valueOrFunction ) {

				// If value is a function, invoke it and use its return value
				var value = isFunction( valueOrFunction ) ?
					valueOrFunction() :
					valueOrFunction;

				s[ s.length ] = encodeURIComponent( key ) + "=" +
					encodeURIComponent( value == null ? "" : value );
			};

		if ( a == null ) {
			return "";
		}

		// If an array was passed in, assume that it is an array of form elements.
		if ( Array.isArray( a ) || ( a.jquery && !jQuery.isPlainObject( a ) ) ) {

			// Serialize the form elements
			jQuery.each( a, function() {
				add( this.name, this.value );
			} );

		} else {

			// If traditional, encode the "old" way (the way 1.3.2 or older
			// did it), otherwise encode params recursively.
			for ( prefix in a ) {
				buildParams( prefix, a[ prefix ], traditional, add );
			}
		}

		// Return the resulting serialization
		return s.join( "&" );
	};

	jQuery.fn.extend( {
		serialize: function() {
			return jQuery.param( this.serializeArray() );
		},
		serializeArray: function() {
			return this.map( function() {

				// Can add propHook for "elements" to filter or add form elements
				var elements = jQuery.prop( this, "elements" );
				return elements ? jQuery.makeArray( elements ) : this;
			} )
			.filter( function() {
				var type = this.type;

				// Use .is( ":disabled" ) so that fieldset[disabled] works
				return this.name && !jQuery( this ).is( ":disabled" ) &&
					rsubmittable.test( this.nodeName ) && !rsubmitterTypes.test( type ) &&
					( this.checked || !rcheckableType.test( type ) );
			} )
			.map( function( _i, elem ) {
				var val = jQuery( this ).val();

				if ( val == null ) {
					return null;
				}

				if ( Array.isArray( val ) ) {
					return jQuery.map( val, function( val ) {
						return { name: elem.name, value: val.replace( rCRLF, "\r\n" ) };
					} );
				}

				return { name: elem.name, value: val.replace( rCRLF, "\r\n" ) };
			} ).get();
		}
	} );


	var
		r20 = /%20/g,
		rhash = /#.*$/,
		rantiCache = /([?&])_=[^&]*/,
		rheaders = /^(.*?):[ \t]*([^\r\n]*)$/mg,

		// #7653, #8125, #8152: local protocol detection
		rlocalProtocol = /^(?:about|app|app-storage|.+-extension|file|res|widget):$/,
		rnoContent = /^(?:GET|HEAD)$/,
		rprotocol = /^\/\//,

		/* Prefilters
		 * 1) They are useful to introduce custom dataTypes (see ajax/jsonp.js for an example)
		 * 2) These are called:
		 *    - BEFORE asking for a transport
		 *    - AFTER param serialization (s.data is a string if s.processData is true)
		 * 3) key is the dataType
		 * 4) the catchall symbol "*" can be used
		 * 5) execution will start with transport dataType and THEN continue down to "*" if needed
		 */
		prefilters = {},

		/* Transports bindings
		 * 1) key is the dataType
		 * 2) the catchall symbol "*" can be used
		 * 3) selection will start with transport dataType and THEN go to "*" if needed
		 */
		transports = {},

		// Avoid comment-prolog char sequence (#10098); must appease lint and evade compression
		allTypes = "*/".concat( "*" ),

		// Anchor tag for parsing the document origin
		originAnchor = document.createElement( "a" );
		originAnchor.href = location.href;

	// Base "constructor" for jQuery.ajaxPrefilter and jQuery.ajaxTransport
	function addToPrefiltersOrTransports( structure ) {

		// dataTypeExpression is optional and defaults to "*"
		return function( dataTypeExpression, func ) {

			if ( typeof dataTypeExpression !== "string" ) {
				func = dataTypeExpression;
				dataTypeExpression = "*";
			}

			var dataType,
				i = 0,
				dataTypes = dataTypeExpression.toLowerCase().match( rnothtmlwhite ) || [];

			if ( isFunction( func ) ) {

				// For each dataType in the dataTypeExpression
				while ( ( dataType = dataTypes[ i++ ] ) ) {

					// Prepend if requested
					if ( dataType[ 0 ] === "+" ) {
						dataType = dataType.slice( 1 ) || "*";
						( structure[ dataType ] = structure[ dataType ] || [] ).unshift( func );

					// Otherwise append
					} else {
						( structure[ dataType ] = structure[ dataType ] || [] ).push( func );
					}
				}
			}
		};
	}

	// Base inspection function for prefilters and transports
	function inspectPrefiltersOrTransports( structure, options, originalOptions, jqXHR ) {

		var inspected = {},
			seekingTransport = ( structure === transports );

		function inspect( dataType ) {
			var selected;
			inspected[ dataType ] = true;
			jQuery.each( structure[ dataType ] || [], function( _, prefilterOrFactory ) {
				var dataTypeOrTransport = prefilterOrFactory( options, originalOptions, jqXHR );
				if ( typeof dataTypeOrTransport === "string" &&
					!seekingTransport && !inspected[ dataTypeOrTransport ] ) {

					options.dataTypes.unshift( dataTypeOrTransport );
					inspect( dataTypeOrTransport );
					return false;
				} else if ( seekingTransport ) {
					return !( selected = dataTypeOrTransport );
				}
			} );
			return selected;
		}

		return inspect( options.dataTypes[ 0 ] ) || !inspected[ "*" ] && inspect( "*" );
	}

	// A special extend for ajax options
	// that takes "flat" options (not to be deep extended)
	// Fixes #9887
	function ajaxExtend( target, src ) {
		var key, deep,
			flatOptions = jQuery.ajaxSettings.flatOptions || {};

		for ( key in src ) {
			if ( src[ key ] !== undefined ) {
				( flatOptions[ key ] ? target : ( deep || ( deep = {} ) ) )[ key ] = src[ key ];
			}
		}
		if ( deep ) {
			jQuery.extend( true, target, deep );
		}

		return target;
	}

	/* Handles responses to an ajax request:
	 * - finds the right dataType (mediates between content-type and expected dataType)
	 * - returns the corresponding response
	 */
	function ajaxHandleResponses( s, jqXHR, responses ) {

		var ct, type, finalDataType, firstDataType,
			contents = s.contents,
			dataTypes = s.dataTypes;

		// Remove auto dataType and get content-type in the process
		while ( dataTypes[ 0 ] === "*" ) {
			dataTypes.shift();
			if ( ct === undefined ) {
				ct = s.mimeType || jqXHR.getResponseHeader( "Content-Type" );
			}
		}

		// Check if we're dealing with a known content-type
		if ( ct ) {
			for ( type in contents ) {
				if ( contents[ type ] && contents[ type ].test( ct ) ) {
					dataTypes.unshift( type );
					break;
				}
			}
		}

		// Check to see if we have a response for the expected dataType
		if ( dataTypes[ 0 ] in responses ) {
			finalDataType = dataTypes[ 0 ];
		} else {

			// Try convertible dataTypes
			for ( type in responses ) {
				if ( !dataTypes[ 0 ] || s.converters[ type + " " + dataTypes[ 0 ] ] ) {
					finalDataType = type;
					break;
				}
				if ( !firstDataType ) {
					firstDataType = type;
				}
			}

			// Or just use first one
			finalDataType = finalDataType || firstDataType;
		}

		// If we found a dataType
		// We add the dataType to the list if needed
		// and return the corresponding response
		if ( finalDataType ) {
			if ( finalDataType !== dataTypes[ 0 ] ) {
				dataTypes.unshift( finalDataType );
			}
			return responses[ finalDataType ];
		}
	}

	/* Chain conversions given the request and the original response
	 * Also sets the responseXXX fields on the jqXHR instance
	 */
	function ajaxConvert( s, response, jqXHR, isSuccess ) {
		var conv2, current, conv, tmp, prev,
			converters = {},

			// Work with a copy of dataTypes in case we need to modify it for conversion
			dataTypes = s.dataTypes.slice();

		// Create converters map with lowercased keys
		if ( dataTypes[ 1 ] ) {
			for ( conv in s.converters ) {
				converters[ conv.toLowerCase() ] = s.converters[ conv ];
			}
		}

		current = dataTypes.shift();

		// Convert to each sequential dataType
		while ( current ) {

			if ( s.responseFields[ current ] ) {
				jqXHR[ s.responseFields[ current ] ] = response;
			}

			// Apply the dataFilter if provided
			if ( !prev && isSuccess && s.dataFilter ) {
				response = s.dataFilter( response, s.dataType );
			}

			prev = current;
			current = dataTypes.shift();

			if ( current ) {

				// There's only work to do if current dataType is non-auto
				if ( current === "*" ) {

					current = prev;

				// Convert response if prev dataType is non-auto and differs from current
				} else if ( prev !== "*" && prev !== current ) {

					// Seek a direct converter
					conv = converters[ prev + " " + current ] || converters[ "* " + current ];

					// If none found, seek a pair
					if ( !conv ) {
						for ( conv2 in converters ) {

							// If conv2 outputs current
							tmp = conv2.split( " " );
							if ( tmp[ 1 ] === current ) {

								// If prev can be converted to accepted input
								conv = converters[ prev + " " + tmp[ 0 ] ] ||
									converters[ "* " + tmp[ 0 ] ];
								if ( conv ) {

									// Condense equivalence converters
									if ( conv === true ) {
										conv = converters[ conv2 ];

									// Otherwise, insert the intermediate dataType
									} else if ( converters[ conv2 ] !== true ) {
										current = tmp[ 0 ];
										dataTypes.unshift( tmp[ 1 ] );
									}
									break;
								}
							}
						}
					}

					// Apply converter (if not an equivalence)
					if ( conv !== true ) {

						// Unless errors are allowed to bubble, catch and return them
						if ( conv && s.throws ) {
							response = conv( response );
						} else {
							try {
								response = conv( response );
							} catch ( e ) {
								return {
									state: "parsererror",
									error: conv ? e : "No conversion from " + prev + " to " + current
								};
							}
						}
					}
				}
			}
		}

		return { state: "success", data: response };
	}

	jQuery.extend( {

		// Counter for holding the number of active queries
		active: 0,

		// Last-Modified header cache for next request
		lastModified: {},
		etag: {},

		ajaxSettings: {
			url: location.href,
			type: "GET",
			isLocal: rlocalProtocol.test( location.protocol ),
			global: true,
			processData: true,
			async: true,
			contentType: "application/x-www-form-urlencoded; charset=UTF-8",

			/*
			timeout: 0,
			data: null,
			dataType: null,
			username: null,
			password: null,
			cache: null,
			throws: false,
			traditional: false,
			headers: {},
			*/

			accepts: {
				"*": allTypes,
				text: "text/plain",
				html: "text/html",
				xml: "application/xml, text/xml",
				json: "application/json, text/javascript"
			},

			contents: {
				xml: /\bxml\b/,
				html: /\bhtml/,
				json: /\bjson\b/
			},

			responseFields: {
				xml: "responseXML",
				text: "responseText",
				json: "responseJSON"
			},

			// Data converters
			// Keys separate source (or catchall "*") and destination types with a single space
			converters: {

				// Convert anything to text
				"* text": String,

				// Text to html (true = no transformation)
				"text html": true,

				// Evaluate text as a json expression
				"text json": JSON.parse,

				// Parse text as xml
				"text xml": jQuery.parseXML
			},

			// For options that shouldn't be deep extended:
			// you can add your own custom options here if
			// and when you create one that shouldn't be
			// deep extended (see ajaxExtend)
			flatOptions: {
				url: true,
				context: true
			}
		},

		// Creates a full fledged settings object into target
		// with both ajaxSettings and settings fields.
		// If target is omitted, writes into ajaxSettings.
		ajaxSetup: function( target, settings ) {
			return settings ?

				// Building a settings object
				ajaxExtend( ajaxExtend( target, jQuery.ajaxSettings ), settings ) :

				// Extending ajaxSettings
				ajaxExtend( jQuery.ajaxSettings, target );
		},

		ajaxPrefilter: addToPrefiltersOrTransports( prefilters ),
		ajaxTransport: addToPrefiltersOrTransports( transports ),

		// Main method
		ajax: function( url, options ) {

			// If url is an object, simulate pre-1.5 signature
			if ( typeof url === "object" ) {
				options = url;
				url = undefined;
			}

			// Force options to be an object
			options = options || {};

			var transport,

				// URL without anti-cache param
				cacheURL,

				// Response headers
				responseHeadersString,
				responseHeaders,

				// timeout handle
				timeoutTimer,

				// Url cleanup var
				urlAnchor,

				// Request state (becomes false upon send and true upon completion)
				completed,

				// To know if global events are to be dispatched
				fireGlobals,

				// Loop variable
				i,

				// uncached part of the url
				uncached,

				// Create the final options object
				s = jQuery.ajaxSetup( {}, options ),

				// Callbacks context
				callbackContext = s.context || s,

				// Context for global events is callbackContext if it is a DOM node or jQuery collection
				globalEventContext = s.context &&
					( callbackContext.nodeType || callbackContext.jquery ) ?
						jQuery( callbackContext ) :
						jQuery.event,

				// Deferreds
				deferred = jQuery.Deferred(),
				completeDeferred = jQuery.Callbacks( "once memory" ),

				// Status-dependent callbacks
				statusCode = s.statusCode || {},

				// Headers (they are sent all at once)
				requestHeaders = {},
				requestHeadersNames = {},

				// Default abort message
				strAbort = "canceled",

				// Fake xhr
				jqXHR = {
					readyState: 0,

					// Builds headers hashtable if needed
					getResponseHeader: function( key ) {
						var match;
						if ( completed ) {
							if ( !responseHeaders ) {
								responseHeaders = {};
								while ( ( match = rheaders.exec( responseHeadersString ) ) ) {
									responseHeaders[ match[ 1 ].toLowerCase() + " " ] =
										( responseHeaders[ match[ 1 ].toLowerCase() + " " ] || [] )
											.concat( match[ 2 ] );
								}
							}
							match = responseHeaders[ key.toLowerCase() + " " ];
						}
						return match == null ? null : match.join( ", " );
					},

					// Raw string
					getAllResponseHeaders: function() {
						return completed ? responseHeadersString : null;
					},

					// Caches the header
					setRequestHeader: function( name, value ) {
						if ( completed == null ) {
							name = requestHeadersNames[ name.toLowerCase() ] =
								requestHeadersNames[ name.toLowerCase() ] || name;
							requestHeaders[ name ] = value;
						}
						return this;
					},

					// Overrides response content-type header
					overrideMimeType: function( type ) {
						if ( completed == null ) {
							s.mimeType = type;
						}
						return this;
					},

					// Status-dependent callbacks
					statusCode: function( map ) {
						var code;
						if ( map ) {
							if ( completed ) {

								// Execute the appropriate callbacks
								jqXHR.always( map[ jqXHR.status ] );
							} else {

								// Lazy-add the new callbacks in a way that preserves old ones
								for ( code in map ) {
									statusCode[ code ] = [ statusCode[ code ], map[ code ] ];
								}
							}
						}
						return this;
					},

					// Cancel the request
					abort: function( statusText ) {
						var finalText = statusText || strAbort;
						if ( transport ) {
							transport.abort( finalText );
						}
						done( 0, finalText );
						return this;
					}
				};

			// Attach deferreds
			deferred.promise( jqXHR );

			// Add protocol if not provided (prefilters might expect it)
			// Handle falsy url in the settings object (#10093: consistency with old signature)
			// We also use the url parameter if available
			s.url = ( ( url || s.url || location.href ) + "" )
				.replace( rprotocol, location.protocol + "//" );

			// Alias method option to type as per ticket #12004
			s.type = options.method || options.type || s.method || s.type;

			// Extract dataTypes list
			s.dataTypes = ( s.dataType || "*" ).toLowerCase().match( rnothtmlwhite ) || [ "" ];

			// A cross-domain request is in order when the origin doesn't match the current origin.
			if ( s.crossDomain == null ) {
				urlAnchor = document.createElement( "a" );

				// Support: IE <=8 - 11, Edge 12 - 15
				// IE throws exception on accessing the href property if url is malformed,
				// e.g. http://example.com:80x/
				try {
					urlAnchor.href = s.url;

					// Support: IE <=8 - 11 only
					// Anchor's host property isn't correctly set when s.url is relative
					urlAnchor.href = urlAnchor.href;
					s.crossDomain = originAnchor.protocol + "//" + originAnchor.host !==
						urlAnchor.protocol + "//" + urlAnchor.host;
				} catch ( e ) {

					// If there is an error parsing the URL, assume it is crossDomain,
					// it can be rejected by the transport if it is invalid
					s.crossDomain = true;
				}
			}

			// Convert data if not already a string
			if ( s.data && s.processData && typeof s.data !== "string" ) {
				s.data = jQuery.param( s.data, s.traditional );
			}

			// Apply prefilters
			inspectPrefiltersOrTransports( prefilters, s, options, jqXHR );

			// If request was aborted inside a prefilter, stop there
			if ( completed ) {
				return jqXHR;
			}

			// We can fire global events as of now if asked to
			// Don't fire events if jQuery.event is undefined in an AMD-usage scenario (#15118)
			fireGlobals = jQuery.event && s.global;

			// Watch for a new set of requests
			if ( fireGlobals && jQuery.active++ === 0 ) {
				jQuery.event.trigger( "ajaxStart" );
			}

			// Uppercase the type
			s.type = s.type.toUpperCase();

			// Determine if request has content
			s.hasContent = !rnoContent.test( s.type );

			// Save the URL in case we're toying with the If-Modified-Since
			// and/or If-None-Match header later on
			// Remove hash to simplify url manipulation
			cacheURL = s.url.replace( rhash, "" );

			// More options handling for requests with no content
			if ( !s.hasContent ) {

				// Remember the hash so we can put it back
				uncached = s.url.slice( cacheURL.length );

				// If data is available and should be processed, append data to url
				if ( s.data && ( s.processData || typeof s.data === "string" ) ) {
					cacheURL += ( rquery.test( cacheURL ) ? "&" : "?" ) + s.data;

					// #9682: remove data so that it's not used in an eventual retry
					delete s.data;
				}

				// Add or update anti-cache param if needed
				if ( s.cache === false ) {
					cacheURL = cacheURL.replace( rantiCache, "$1" );
					uncached = ( rquery.test( cacheURL ) ? "&" : "?" ) + "_=" + ( nonce.guid++ ) +
						uncached;
				}

				// Put hash and anti-cache on the URL that will be requested (gh-1732)
				s.url = cacheURL + uncached;

			// Change '%20' to '+' if this is encoded form body content (gh-2658)
			} else if ( s.data && s.processData &&
				( s.contentType || "" ).indexOf( "application/x-www-form-urlencoded" ) === 0 ) {
				s.data = s.data.replace( r20, "+" );
			}

			// Set the If-Modified-Since and/or If-None-Match header, if in ifModified mode.
			if ( s.ifModified ) {
				if ( jQuery.lastModified[ cacheURL ] ) {
					jqXHR.setRequestHeader( "If-Modified-Since", jQuery.lastModified[ cacheURL ] );
				}
				if ( jQuery.etag[ cacheURL ] ) {
					jqXHR.setRequestHeader( "If-None-Match", jQuery.etag[ cacheURL ] );
				}
			}

			// Set the correct header, if data is being sent
			if ( s.data && s.hasContent && s.contentType !== false || options.contentType ) {
				jqXHR.setRequestHeader( "Content-Type", s.contentType );
			}

			// Set the Accepts header for the server, depending on the dataType
			jqXHR.setRequestHeader(
				"Accept",
				s.dataTypes[ 0 ] && s.accepts[ s.dataTypes[ 0 ] ] ?
					s.accepts[ s.dataTypes[ 0 ] ] +
						( s.dataTypes[ 0 ] !== "*" ? ", " + allTypes + "; q=0.01" : "" ) :
					s.accepts[ "*" ]
			);

			// Check for headers option
			for ( i in s.headers ) {
				jqXHR.setRequestHeader( i, s.headers[ i ] );
			}

			// Allow custom headers/mimetypes and early abort
			if ( s.beforeSend &&
				( s.beforeSend.call( callbackContext, jqXHR, s ) === false || completed ) ) {

				// Abort if not done already and return
				return jqXHR.abort();
			}

			// Aborting is no longer a cancellation
			strAbort = "abort";

			// Install callbacks on deferreds
			completeDeferred.add( s.complete );
			jqXHR.done( s.success );
			jqXHR.fail( s.error );

			// Get transport
			transport = inspectPrefiltersOrTransports( transports, s, options, jqXHR );

			// If no transport, we auto-abort
			if ( !transport ) {
				done( -1, "No Transport" );
			} else {
				jqXHR.readyState = 1;

				// Send global event
				if ( fireGlobals ) {
					globalEventContext.trigger( "ajaxSend", [ jqXHR, s ] );
				}

				// If request was aborted inside ajaxSend, stop there
				if ( completed ) {
					return jqXHR;
				}

				// Timeout
				if ( s.async && s.timeout > 0 ) {
					timeoutTimer = window.setTimeout( function() {
						jqXHR.abort( "timeout" );
					}, s.timeout );
				}

				try {
					completed = false;
					transport.send( requestHeaders, done );
				} catch ( e ) {

					// Rethrow post-completion exceptions
					if ( completed ) {
						throw e;
					}

					// Propagate others as results
					done( -1, e );
				}
			}

			// Callback for when everything is done
			function done( status, nativeStatusText, responses, headers ) {
				var isSuccess, success, error, response, modified,
					statusText = nativeStatusText;

				// Ignore repeat invocations
				if ( completed ) {
					return;
				}

				completed = true;

				// Clear timeout if it exists
				if ( timeoutTimer ) {
					window.clearTimeout( timeoutTimer );
				}

				// Dereference transport for early garbage collection
				// (no matter how long the jqXHR object will be used)
				transport = undefined;

				// Cache response headers
				responseHeadersString = headers || "";

				// Set readyState
				jqXHR.readyState = status > 0 ? 4 : 0;

				// Determine if successful
				isSuccess = status >= 200 && status < 300 || status === 304;

				// Get response data
				if ( responses ) {
					response = ajaxHandleResponses( s, jqXHR, responses );
				}

				// Use a noop converter for missing script
				if ( !isSuccess && jQuery.inArray( "script", s.dataTypes ) > -1 ) {
					s.converters[ "text script" ] = function() {};
				}

				// Convert no matter what (that way responseXXX fields are always set)
				response = ajaxConvert( s, response, jqXHR, isSuccess );

				// If successful, handle type chaining
				if ( isSuccess ) {

					// Set the If-Modified-Since and/or If-None-Match header, if in ifModified mode.
					if ( s.ifModified ) {
						modified = jqXHR.getResponseHeader( "Last-Modified" );
						if ( modified ) {
							jQuery.lastModified[ cacheURL ] = modified;
						}
						modified = jqXHR.getResponseHeader( "etag" );
						if ( modified ) {
							jQuery.etag[ cacheURL ] = modified;
						}
					}

					// if no content
					if ( status === 204 || s.type === "HEAD" ) {
						statusText = "nocontent";

					// if not modified
					} else if ( status === 304 ) {
						statusText = "notmodified";

					// If we have data, let's convert it
					} else {
						statusText = response.state;
						success = response.data;
						error = response.error;
						isSuccess = !error;
					}
				} else {

					// Extract error from statusText and normalize for non-aborts
					error = statusText;
					if ( status || !statusText ) {
						statusText = "error";
						if ( status < 0 ) {
							status = 0;
						}
					}
				}

				// Set data for the fake xhr object
				jqXHR.status = status;
				jqXHR.statusText = ( nativeStatusText || statusText ) + "";

				// Success/Error
				if ( isSuccess ) {
					deferred.resolveWith( callbackContext, [ success, statusText, jqXHR ] );
				} else {
					deferred.rejectWith( callbackContext, [ jqXHR, statusText, error ] );
				}

				// Status-dependent callbacks
				jqXHR.statusCode( statusCode );
				statusCode = undefined;

				if ( fireGlobals ) {
					globalEventContext.trigger( isSuccess ? "ajaxSuccess" : "ajaxError",
						[ jqXHR, s, isSuccess ? success : error ] );
				}

				// Complete
				completeDeferred.fireWith( callbackContext, [ jqXHR, statusText ] );

				if ( fireGlobals ) {
					globalEventContext.trigger( "ajaxComplete", [ jqXHR, s ] );

					// Handle the global AJAX counter
					if ( !( --jQuery.active ) ) {
						jQuery.event.trigger( "ajaxStop" );
					}
				}
			}

			return jqXHR;
		},

		getJSON: function( url, data, callback ) {
			return jQuery.get( url, data, callback, "json" );
		},

		getScript: function( url, callback ) {
			return jQuery.get( url, undefined, callback, "script" );
		}
	} );

	jQuery.each( [ "get", "post" ], function( _i, method ) {
		jQuery[ method ] = function( url, data, callback, type ) {

			// Shift arguments if data argument was omitted
			if ( isFunction( data ) ) {
				type = type || callback;
				callback = data;
				data = undefined;
			}

			// The url can be an options object (which then must have .url)
			return jQuery.ajax( jQuery.extend( {
				url: url,
				type: method,
				dataType: type,
				data: data,
				success: callback
			}, jQuery.isPlainObject( url ) && url ) );
		};
	} );

	jQuery.ajaxPrefilter( function( s ) {
		var i;
		for ( i in s.headers ) {
			if ( i.toLowerCase() === "content-type" ) {
				s.contentType = s.headers[ i ] || "";
			}
		}
	} );


	jQuery._evalUrl = function( url, options, doc ) {
		return jQuery.ajax( {
			url: url,

			// Make this explicit, since user can override this through ajaxSetup (#11264)
			type: "GET",
			dataType: "script",
			cache: true,
			async: false,
			global: false,

			// Only evaluate the response if it is successful (gh-4126)
			// dataFilter is not invoked for failure responses, so using it instead
			// of the default converter is kludgy but it works.
			converters: {
				"text script": function() {}
			},
			dataFilter: function( response ) {
				jQuery.globalEval( response, options, doc );
			}
		} );
	};


	jQuery.fn.extend( {
		wrapAll: function( html ) {
			var wrap;

			if ( this[ 0 ] ) {
				if ( isFunction( html ) ) {
					html = html.call( this[ 0 ] );
				}

				// The elements to wrap the target around
				wrap = jQuery( html, this[ 0 ].ownerDocument ).eq( 0 ).clone( true );

				if ( this[ 0 ].parentNode ) {
					wrap.insertBefore( this[ 0 ] );
				}

				wrap.map( function() {
					var elem = this;

					while ( elem.firstElementChild ) {
						elem = elem.firstElementChild;
					}

					return elem;
				} ).append( this );
			}

			return this;
		},

		wrapInner: function( html ) {
			if ( isFunction( html ) ) {
				return this.each( function( i ) {
					jQuery( this ).wrapInner( html.call( this, i ) );
				} );
			}

			return this.each( function() {
				var self = jQuery( this ),
					contents = self.contents();

				if ( contents.length ) {
					contents.wrapAll( html );

				} else {
					self.append( html );
				}
			} );
		},

		wrap: function( html ) {
			var htmlIsFunction = isFunction( html );

			return this.each( function( i ) {
				jQuery( this ).wrapAll( htmlIsFunction ? html.call( this, i ) : html );
			} );
		},

		unwrap: function( selector ) {
			this.parent( selector ).not( "body" ).each( function() {
				jQuery( this ).replaceWith( this.childNodes );
			} );
			return this;
		}
	} );


	jQuery.expr.pseudos.hidden = function( elem ) {
		return !jQuery.expr.pseudos.visible( elem );
	};
	jQuery.expr.pseudos.visible = function( elem ) {
		return !!( elem.offsetWidth || elem.offsetHeight || elem.getClientRects().length );
	};




	jQuery.ajaxSettings.xhr = function() {
		try {
			return new window.XMLHttpRequest();
		} catch ( e ) {}
	};

	var xhrSuccessStatus = {

			// File protocol always yields status code 0, assume 200
			0: 200,

			// Support: IE <=9 only
			// #1450: sometimes IE returns 1223 when it should be 204
			1223: 204
		},
		xhrSupported = jQuery.ajaxSettings.xhr();

	support.cors = !!xhrSupported && ( "withCredentials" in xhrSupported );
	support.ajax = xhrSupported = !!xhrSupported;

	jQuery.ajaxTransport( function( options ) {
		var callback, errorCallback;

		// Cross domain only allowed if supported through XMLHttpRequest
		if ( support.cors || xhrSupported && !options.crossDomain ) {
			return {
				send: function( headers, complete ) {
					var i,
						xhr = options.xhr();

					xhr.open(
						options.type,
						options.url,
						options.async,
						options.username,
						options.password
					);

					// Apply custom fields if provided
					if ( options.xhrFields ) {
						for ( i in options.xhrFields ) {
							xhr[ i ] = options.xhrFields[ i ];
						}
					}

					// Override mime type if needed
					if ( options.mimeType && xhr.overrideMimeType ) {
						xhr.overrideMimeType( options.mimeType );
					}

					// X-Requested-With header
					// For cross-domain requests, seeing as conditions for a preflight are
					// akin to a jigsaw puzzle, we simply never set it to be sure.
					// (it can always be set on a per-request basis or even using ajaxSetup)
					// For same-domain requests, won't change header if already provided.
					if ( !options.crossDomain && !headers[ "X-Requested-With" ] ) {
						headers[ "X-Requested-With" ] = "XMLHttpRequest";
					}

					// Set headers
					for ( i in headers ) {
						xhr.setRequestHeader( i, headers[ i ] );
					}

					// Callback
					callback = function( type ) {
						return function() {
							if ( callback ) {
								callback = errorCallback = xhr.onload =
									xhr.onerror = xhr.onabort = xhr.ontimeout =
										xhr.onreadystatechange = null;

								if ( type === "abort" ) {
									xhr.abort();
								} else if ( type === "error" ) {

									// Support: IE <=9 only
									// On a manual native abort, IE9 throws
									// errors on any property access that is not readyState
									if ( typeof xhr.status !== "number" ) {
										complete( 0, "error" );
									} else {
										complete(

											// File: protocol always yields status 0; see #8605, #14207
											xhr.status,
											xhr.statusText
										);
									}
								} else {
									complete(
										xhrSuccessStatus[ xhr.status ] || xhr.status,
										xhr.statusText,

										// Support: IE <=9 only
										// IE9 has no XHR2 but throws on binary (trac-11426)
										// For XHR2 non-text, let the caller handle it (gh-2498)
										( xhr.responseType || "text" ) !== "text"  ||
										typeof xhr.responseText !== "string" ?
											{ binary: xhr.response } :
											{ text: xhr.responseText },
										xhr.getAllResponseHeaders()
									);
								}
							}
						};
					};

					// Listen to events
					xhr.onload = callback();
					errorCallback = xhr.onerror = xhr.ontimeout = callback( "error" );

					// Support: IE 9 only
					// Use onreadystatechange to replace onabort
					// to handle uncaught aborts
					if ( xhr.onabort !== undefined ) {
						xhr.onabort = errorCallback;
					} else {
						xhr.onreadystatechange = function() {

							// Check readyState before timeout as it changes
							if ( xhr.readyState === 4 ) {

								// Allow onerror to be called first,
								// but that will not handle a native abort
								// Also, save errorCallback to a variable
								// as xhr.onerror cannot be accessed
								window.setTimeout( function() {
									if ( callback ) {
										errorCallback();
									}
								} );
							}
						};
					}

					// Create the abort callback
					callback = callback( "abort" );

					try {

						// Do send the request (this may raise an exception)
						xhr.send( options.hasContent && options.data || null );
					} catch ( e ) {

						// #14683: Only rethrow if this hasn't been notified as an error yet
						if ( callback ) {
							throw e;
						}
					}
				},

				abort: function() {
					if ( callback ) {
						callback();
					}
				}
			};
		}
	} );




	// Prevent auto-execution of scripts when no explicit dataType was provided (See gh-2432)
	jQuery.ajaxPrefilter( function( s ) {
		if ( s.crossDomain ) {
			s.contents.script = false;
		}
	} );

	// Install script dataType
	jQuery.ajaxSetup( {
		accepts: {
			script: "text/javascript, application/javascript, " +
				"application/ecmascript, application/x-ecmascript"
		},
		contents: {
			script: /\b(?:java|ecma)script\b/
		},
		converters: {
			"text script": function( text ) {
				jQuery.globalEval( text );
				return text;
			}
		}
	} );

	// Handle cache's special case and crossDomain
	jQuery.ajaxPrefilter( "script", function( s ) {
		if ( s.cache === undefined ) {
			s.cache = false;
		}
		if ( s.crossDomain ) {
			s.type = "GET";
		}
	} );

	// Bind script tag hack transport
	jQuery.ajaxTransport( "script", function( s ) {

		// This transport only deals with cross domain or forced-by-attrs requests
		if ( s.crossDomain || s.scriptAttrs ) {
			var script, callback;
			return {
				send: function( _, complete ) {
					script = jQuery( "<script>" )
						.attr( s.scriptAttrs || {} )
						.prop( { charset: s.scriptCharset, src: s.url } )
						.on( "load error", callback = function( evt ) {
							script.remove();
							callback = null;
							if ( evt ) {
								complete( evt.type === "error" ? 404 : 200, evt.type );
							}
						} );

					// Use native DOM manipulation to avoid our domManip AJAX trickery
					document.head.appendChild( script[ 0 ] );
				},
				abort: function() {
					if ( callback ) {
						callback();
					}
				}
			};
		}
	} );




	var oldCallbacks = [],
		rjsonp = /(=)\?(?=&|$)|\?\?/;

	// Default jsonp settings
	jQuery.ajaxSetup( {
		jsonp: "callback",
		jsonpCallback: function() {
			var callback = oldCallbacks.pop() || ( jQuery.expando + "_" + ( nonce.guid++ ) );
			this[ callback ] = true;
			return callback;
		}
	} );

	// Detect, normalize options and install callbacks for jsonp requests
	jQuery.ajaxPrefilter( "json jsonp", function( s, originalSettings, jqXHR ) {

		var callbackName, overwritten, responseContainer,
			jsonProp = s.jsonp !== false && ( rjsonp.test( s.url ) ?
				"url" :
				typeof s.data === "string" &&
					( s.contentType || "" )
						.indexOf( "application/x-www-form-urlencoded" ) === 0 &&
					rjsonp.test( s.data ) && "data"
			);

		// Handle iff the expected data type is "jsonp" or we have a parameter to set
		if ( jsonProp || s.dataTypes[ 0 ] === "jsonp" ) {

			// Get callback name, remembering preexisting value associated with it
			callbackName = s.jsonpCallback = isFunction( s.jsonpCallback ) ?
				s.jsonpCallback() :
				s.jsonpCallback;

			// Insert callback into url or form data
			if ( jsonProp ) {
				s[ jsonProp ] = s[ jsonProp ].replace( rjsonp, "$1" + callbackName );
			} else if ( s.jsonp !== false ) {
				s.url += ( rquery.test( s.url ) ? "&" : "?" ) + s.jsonp + "=" + callbackName;
			}

			// Use data converter to retrieve json after script execution
			s.converters[ "script json" ] = function() {
				if ( !responseContainer ) {
					jQuery.error( callbackName + " was not called" );
				}
				return responseContainer[ 0 ];
			};

			// Force json dataType
			s.dataTypes[ 0 ] = "json";

			// Install callback
			overwritten = window[ callbackName ];
			window[ callbackName ] = function() {
				responseContainer = arguments;
			};

			// Clean-up function (fires after converters)
			jqXHR.always( function() {

				// If previous value didn't exist - remove it
				if ( overwritten === undefined ) {
					jQuery( window ).removeProp( callbackName );

				// Otherwise restore preexisting value
				} else {
					window[ callbackName ] = overwritten;
				}

				// Save back as free
				if ( s[ callbackName ] ) {

					// Make sure that re-using the options doesn't screw things around
					s.jsonpCallback = originalSettings.jsonpCallback;

					// Save the callback name for future use
					oldCallbacks.push( callbackName );
				}

				// Call if it was a function and we have a response
				if ( responseContainer && isFunction( overwritten ) ) {
					overwritten( responseContainer[ 0 ] );
				}

				responseContainer = overwritten = undefined;
			} );

			// Delegate to script
			return "script";
		}
	} );




	// Support: Safari 8 only
	// In Safari 8 documents created via document.implementation.createHTMLDocument
	// collapse sibling forms: the second one becomes a child of the first one.
	// Because of that, this security measure has to be disabled in Safari 8.
	// https://bugs.webkit.org/show_bug.cgi?id=137337
	support.createHTMLDocument = ( function() {
		var body = document.implementation.createHTMLDocument( "" ).body;
		body.innerHTML = "<form></form><form></form>";
		return body.childNodes.length === 2;
	} )();


	// Argument "data" should be string of html
	// context (optional): If specified, the fragment will be created in this context,
	// defaults to document
	// keepScripts (optional): If true, will include scripts passed in the html string
	jQuery.parseHTML = function( data, context, keepScripts ) {
		if ( typeof data !== "string" ) {
			return [];
		}
		if ( typeof context === "boolean" ) {
			keepScripts = context;
			context = false;
		}

		var base, parsed, scripts;

		if ( !context ) {

			// Stop scripts or inline event handlers from being executed immediately
			// by using document.implementation
			if ( support.createHTMLDocument ) {
				context = document.implementation.createHTMLDocument( "" );

				// Set the base href for the created document
				// so any parsed elements with URLs
				// are based on the document's URL (gh-2965)
				base = context.createElement( "base" );
				base.href = document.location.href;
				context.head.appendChild( base );
			} else {
				context = document;
			}
		}

		parsed = rsingleTag.exec( data );
		scripts = !keepScripts && [];

		// Single tag
		if ( parsed ) {
			return [ context.createElement( parsed[ 1 ] ) ];
		}

		parsed = buildFragment( [ data ], context, scripts );

		if ( scripts && scripts.length ) {
			jQuery( scripts ).remove();
		}

		return jQuery.merge( [], parsed.childNodes );
	};


	/**
	 * Load a url into a page
	 */
	jQuery.fn.load = function( url, params, callback ) {
		var selector, type, response,
			self = this,
			off = url.indexOf( " " );

		if ( off > -1 ) {
			selector = stripAndCollapse( url.slice( off ) );
			url = url.slice( 0, off );
		}

		// If it's a function
		if ( isFunction( params ) ) {

			// We assume that it's the callback
			callback = params;
			params = undefined;

		// Otherwise, build a param string
		} else if ( params && typeof params === "object" ) {
			type = "POST";
		}

		// If we have elements to modify, make the request
		if ( self.length > 0 ) {
			jQuery.ajax( {
				url: url,

				// If "type" variable is undefined, then "GET" method will be used.
				// Make value of this field explicit since
				// user can override it through ajaxSetup method
				type: type || "GET",
				dataType: "html",
				data: params
			} ).done( function( responseText ) {

				// Save response for use in complete callback
				response = arguments;

				self.html( selector ?

					// If a selector was specified, locate the right elements in a dummy div
					// Exclude scripts to avoid IE 'Permission Denied' errors
					jQuery( "<div>" ).append( jQuery.parseHTML( responseText ) ).find( selector ) :

					// Otherwise use the full result
					responseText );

			// If the request succeeds, this function gets "data", "status", "jqXHR"
			// but they are ignored because response was set above.
			// If it fails, this function gets "jqXHR", "status", "error"
			} ).always( callback && function( jqXHR, status ) {
				self.each( function() {
					callback.apply( this, response || [ jqXHR.responseText, status, jqXHR ] );
				} );
			} );
		}

		return this;
	};




	jQuery.expr.pseudos.animated = function( elem ) {
		return jQuery.grep( jQuery.timers, function( fn ) {
			return elem === fn.elem;
		} ).length;
	};




	jQuery.offset = {
		setOffset: function( elem, options, i ) {
			var curPosition, curLeft, curCSSTop, curTop, curOffset, curCSSLeft, calculatePosition,
				position = jQuery.css( elem, "position" ),
				curElem = jQuery( elem ),
				props = {};

			// Set position first, in-case top/left are set even on static elem
			if ( position === "static" ) {
				elem.style.position = "relative";
			}

			curOffset = curElem.offset();
			curCSSTop = jQuery.css( elem, "top" );
			curCSSLeft = jQuery.css( elem, "left" );
			calculatePosition = ( position === "absolute" || position === "fixed" ) &&
				( curCSSTop + curCSSLeft ).indexOf( "auto" ) > -1;

			// Need to be able to calculate position if either
			// top or left is auto and position is either absolute or fixed
			if ( calculatePosition ) {
				curPosition = curElem.position();
				curTop = curPosition.top;
				curLeft = curPosition.left;

			} else {
				curTop = parseFloat( curCSSTop ) || 0;
				curLeft = parseFloat( curCSSLeft ) || 0;
			}

			if ( isFunction( options ) ) {

				// Use jQuery.extend here to allow modification of coordinates argument (gh-1848)
				options = options.call( elem, i, jQuery.extend( {}, curOffset ) );
			}

			if ( options.top != null ) {
				props.top = ( options.top - curOffset.top ) + curTop;
			}
			if ( options.left != null ) {
				props.left = ( options.left - curOffset.left ) + curLeft;
			}

			if ( "using" in options ) {
				options.using.call( elem, props );

			} else {
				if ( typeof props.top === "number" ) {
					props.top += "px";
				}
				if ( typeof props.left === "number" ) {
					props.left += "px";
				}
				curElem.css( props );
			}
		}
	};

	jQuery.fn.extend( {

		// offset() relates an element's border box to the document origin
		offset: function( options ) {

			// Preserve chaining for setter
			if ( arguments.length ) {
				return options === undefined ?
					this :
					this.each( function( i ) {
						jQuery.offset.setOffset( this, options, i );
					} );
			}

			var rect, win,
				elem = this[ 0 ];

			if ( !elem ) {
				return;
			}

			// Return zeros for disconnected and hidden (display: none) elements (gh-2310)
			// Support: IE <=11 only
			// Running getBoundingClientRect on a
			// disconnected node in IE throws an error
			if ( !elem.getClientRects().length ) {
				return { top: 0, left: 0 };
			}

			// Get document-relative position by adding viewport scroll to viewport-relative gBCR
			rect = elem.getBoundingClientRect();
			win = elem.ownerDocument.defaultView;
			return {
				top: rect.top + win.pageYOffset,
				left: rect.left + win.pageXOffset
			};
		},

		// position() relates an element's margin box to its offset parent's padding box
		// This corresponds to the behavior of CSS absolute positioning
		position: function() {
			if ( !this[ 0 ] ) {
				return;
			}

			var offsetParent, offset, doc,
				elem = this[ 0 ],
				parentOffset = { top: 0, left: 0 };

			// position:fixed elements are offset from the viewport, which itself always has zero offset
			if ( jQuery.css( elem, "position" ) === "fixed" ) {

				// Assume position:fixed implies availability of getBoundingClientRect
				offset = elem.getBoundingClientRect();

			} else {
				offset = this.offset();

				// Account for the *real* offset parent, which can be the document or its root element
				// when a statically positioned element is identified
				doc = elem.ownerDocument;
				offsetParent = elem.offsetParent || doc.documentElement;
				while ( offsetParent &&
					( offsetParent === doc.body || offsetParent === doc.documentElement ) &&
					jQuery.css( offsetParent, "position" ) === "static" ) {

					offsetParent = offsetParent.parentNode;
				}
				if ( offsetParent && offsetParent !== elem && offsetParent.nodeType === 1 ) {

					// Incorporate borders into its offset, since they are outside its content origin
					parentOffset = jQuery( offsetParent ).offset();
					parentOffset.top += jQuery.css( offsetParent, "borderTopWidth", true );
					parentOffset.left += jQuery.css( offsetParent, "borderLeftWidth", true );
				}
			}

			// Subtract parent offsets and element margins
			return {
				top: offset.top - parentOffset.top - jQuery.css( elem, "marginTop", true ),
				left: offset.left - parentOffset.left - jQuery.css( elem, "marginLeft", true )
			};
		},

		// This method will return documentElement in the following cases:
		// 1) For the element inside the iframe without offsetParent, this method will return
		//    documentElement of the parent window
		// 2) For the hidden or detached element
		// 3) For body or html element, i.e. in case of the html node - it will return itself
		//
		// but those exceptions were never presented as a real life use-cases
		// and might be considered as more preferable results.
		//
		// This logic, however, is not guaranteed and can change at any point in the future
		offsetParent: function() {
			return this.map( function() {
				var offsetParent = this.offsetParent;

				while ( offsetParent && jQuery.css( offsetParent, "position" ) === "static" ) {
					offsetParent = offsetParent.offsetParent;
				}

				return offsetParent || documentElement;
			} );
		}
	} );

	// Create scrollLeft and scrollTop methods
	jQuery.each( { scrollLeft: "pageXOffset", scrollTop: "pageYOffset" }, function( method, prop ) {
		var top = "pageYOffset" === prop;

		jQuery.fn[ method ] = function( val ) {
			return access( this, function( elem, method, val ) {

				// Coalesce documents and windows
				var win;
				if ( isWindow( elem ) ) {
					win = elem;
				} else if ( elem.nodeType === 9 ) {
					win = elem.defaultView;
				}

				if ( val === undefined ) {
					return win ? win[ prop ] : elem[ method ];
				}

				if ( win ) {
					win.scrollTo(
						!top ? val : win.pageXOffset,
						top ? val : win.pageYOffset
					);

				} else {
					elem[ method ] = val;
				}
			}, method, val, arguments.length );
		};
	} );

	// Support: Safari <=7 - 9.1, Chrome <=37 - 49
	// Add the top/left cssHooks using jQuery.fn.position
	// Webkit bug: https://bugs.webkit.org/show_bug.cgi?id=29084
	// Blink bug: https://bugs.chromium.org/p/chromium/issues/detail?id=589347
	// getComputedStyle returns percent when specified for top/left/bottom/right;
	// rather than make the css module depend on the offset module, just check for it here
	jQuery.each( [ "top", "left" ], function( _i, prop ) {
		jQuery.cssHooks[ prop ] = addGetHookIf( support.pixelPosition,
			function( elem, computed ) {
				if ( computed ) {
					computed = curCSS( elem, prop );

					// If curCSS returns percentage, fallback to offset
					return rnumnonpx.test( computed ) ?
						jQuery( elem ).position()[ prop ] + "px" :
						computed;
				}
			}
		);
	} );


	// Create innerHeight, innerWidth, height, width, outerHeight and outerWidth methods
	jQuery.each( { Height: "height", Width: "width" }, function( name, type ) {
		jQuery.each( { padding: "inner" + name, content: type, "": "outer" + name },
			function( defaultExtra, funcName ) {

			// Margin is only for outerHeight, outerWidth
			jQuery.fn[ funcName ] = function( margin, value ) {
				var chainable = arguments.length && ( defaultExtra || typeof margin !== "boolean" ),
					extra = defaultExtra || ( margin === true || value === true ? "margin" : "border" );

				return access( this, function( elem, type, value ) {
					var doc;

					if ( isWindow( elem ) ) {

						// $( window ).outerWidth/Height return w/h including scrollbars (gh-1729)
						return funcName.indexOf( "outer" ) === 0 ?
							elem[ "inner" + name ] :
							elem.document.documentElement[ "client" + name ];
					}

					// Get document width or height
					if ( elem.nodeType === 9 ) {
						doc = elem.documentElement;

						// Either scroll[Width/Height] or offset[Width/Height] or client[Width/Height],
						// whichever is greatest
						return Math.max(
							elem.body[ "scroll" + name ], doc[ "scroll" + name ],
							elem.body[ "offset" + name ], doc[ "offset" + name ],
							doc[ "client" + name ]
						);
					}

					return value === undefined ?

						// Get width or height on the element, requesting but not forcing parseFloat
						jQuery.css( elem, type, extra ) :

						// Set width or height on the element
						jQuery.style( elem, type, value, extra );
				}, type, chainable ? margin : undefined, chainable );
			};
		} );
	} );


	jQuery.each( [
		"ajaxStart",
		"ajaxStop",
		"ajaxComplete",
		"ajaxError",
		"ajaxSuccess",
		"ajaxSend"
	], function( _i, type ) {
		jQuery.fn[ type ] = function( fn ) {
			return this.on( type, fn );
		};
	} );




	jQuery.fn.extend( {

		bind: function( types, data, fn ) {
			return this.on( types, null, data, fn );
		},
		unbind: function( types, fn ) {
			return this.off( types, null, fn );
		},

		delegate: function( selector, types, data, fn ) {
			return this.on( types, selector, data, fn );
		},
		undelegate: function( selector, types, fn ) {

			// ( namespace ) or ( selector, types [, fn] )
			return arguments.length === 1 ?
				this.off( selector, "**" ) :
				this.off( types, selector || "**", fn );
		},

		hover: function( fnOver, fnOut ) {
			return this.mouseenter( fnOver ).mouseleave( fnOut || fnOver );
		}
	} );

	jQuery.each( ( "blur focus focusin focusout resize scroll click dblclick " +
		"mousedown mouseup mousemove mouseover mouseout mouseenter mouseleave " +
		"change select submit keydown keypress keyup contextmenu" ).split( " " ),
		function( _i, name ) {

			// Handle event binding
			jQuery.fn[ name ] = function( data, fn ) {
				return arguments.length > 0 ?
					this.on( name, null, data, fn ) :
					this.trigger( name );
			};
		} );




	// Support: Android <=4.0 only
	// Make sure we trim BOM and NBSP
	var rtrim = /^[\s\uFEFF\xA0]+|[\s\uFEFF\xA0]+$/g;

	// Bind a function to a context, optionally partially applying any
	// arguments.
	// jQuery.proxy is deprecated to promote standards (specifically Function#bind)
	// However, it is not slated for removal any time soon
	jQuery.proxy = function( fn, context ) {
		var tmp, args, proxy;

		if ( typeof context === "string" ) {
			tmp = fn[ context ];
			context = fn;
			fn = tmp;
		}

		// Quick check to determine if target is callable, in the spec
		// this throws a TypeError, but we will just return undefined.
		if ( !isFunction( fn ) ) {
			return undefined;
		}

		// Simulated bind
		args = slice.call( arguments, 2 );
		proxy = function() {
			return fn.apply( context || this, args.concat( slice.call( arguments ) ) );
		};

		// Set the guid of unique handler to the same of original handler, so it can be removed
		proxy.guid = fn.guid = fn.guid || jQuery.guid++;

		return proxy;
	};

	jQuery.holdReady = function( hold ) {
		if ( hold ) {
			jQuery.readyWait++;
		} else {
			jQuery.ready( true );
		}
	};
	jQuery.isArray = Array.isArray;
	jQuery.parseJSON = JSON.parse;
	jQuery.nodeName = nodeName;
	jQuery.isFunction = isFunction;
	jQuery.isWindow = isWindow;
	jQuery.camelCase = camelCase;
	jQuery.type = toType;

	jQuery.now = Date.now;

	jQuery.isNumeric = function( obj ) {

		// As of jQuery 3.0, isNumeric is limited to
		// strings and numbers (primitives or objects)
		// that can be coerced to finite numbers (gh-2662)
		var type = jQuery.type( obj );
		return ( type === "number" || type === "string" ) &&

			// parseFloat NaNs numeric-cast false positives ("")
			// ...but misinterprets leading-number strings, particularly hex literals ("0x...")
			// subtraction forces infinities to NaN
			!isNaN( obj - parseFloat( obj ) );
	};

	jQuery.trim = function( text ) {
		return text == null ?
			"" :
			( text + "" ).replace( rtrim, "" );
	};



	// Register as a named AMD module, since jQuery can be concatenated with other
	// files that may use define, but not via a proper concatenation script that
	// understands anonymous AMD modules. A named AMD is safest and most robust
	// way to register. Lowercase jquery is used because AMD module names are
	// derived from file names, and jQuery is normally delivered in a lowercase
	// file name. Do this after creating the global so that if an AMD module wants
	// to call noConflict to hide this version of jQuery, it will work.

	// Note that for maximum portability, libraries that are not jQuery should
	// declare themselves as anonymous modules, and avoid setting a global if an
	// AMD loader is present. jQuery is a special case. For more information, see
	// https://github.com/jrburke/requirejs/wiki/Updating-existing-libraries#wiki-anon

	if ( typeof define === "function" && define.amd ) {
		define( "jquery", [], function() {
			return jQuery;
		} );
	}




	var

		// Map over jQuery in case of overwrite
		_jQuery = window.jQuery,

		// Map over the $ in case of overwrite
		_$ = window.$;

	jQuery.noConflict = function( deep ) {
		if ( window.$ === jQuery ) {
			window.$ = _$;
		}

		if ( deep && window.jQuery === jQuery ) {
			window.jQuery = _jQuery;
		}

		return jQuery;
	};

	// Expose jQuery and $ identifiers, even in AMD
	// (#7102#comment:10, https://github.com/jquery/jquery/pull/557)
	// and CommonJS for browser emulators (#13566)
	if ( typeof noGlobal === "undefined" ) {
		window.jQuery = window.$ = jQuery;
	}




	return jQuery;
	} );

	(function(){
	/**
	 * Created by Tivie on 13-07-2015.
	 */

	function getDefaultOpts (simple) {

	  var defaultOptions = {
	    omitExtraWLInCodeBlocks: {
	      defaultValue: false,
	      describe: 'Omit the default extra whiteline added to code blocks',
	      type: 'boolean'
	    },
	    noHeaderId: {
	      defaultValue: false,
	      describe: 'Turn on/off generated header id',
	      type: 'boolean'
	    },
	    prefixHeaderId: {
	      defaultValue: false,
	      describe: 'Add a prefix to the generated header ids. Passing a string will prefix that string to the header id. Setting to true will add a generic \'section-\' prefix',
	      type: 'string'
	    },
	    rawPrefixHeaderId: {
	      defaultValue: false,
	      describe: 'Setting this option to true will prevent showdown from modifying the prefix. This might result in malformed IDs (if, for instance, the " char is used in the prefix)',
	      type: 'boolean'
	    },
	    ghCompatibleHeaderId: {
	      defaultValue: false,
	      describe: 'Generate header ids compatible with github style (spaces are replaced with dashes, a bunch of non alphanumeric chars are removed)',
	      type: 'boolean'
	    },
	    rawHeaderId: {
	      defaultValue: false,
	      describe: 'Remove only spaces, \' and " from generated header ids (including prefixes), replacing them with dashes (-). WARNING: This might result in malformed ids',
	      type: 'boolean'
	    },
	    headerLevelStart: {
	      defaultValue: false,
	      describe: 'The header blocks level start',
	      type: 'integer'
	    },
	    parseImgDimensions: {
	      defaultValue: false,
	      describe: 'Turn on/off image dimension parsing',
	      type: 'boolean'
	    },
	    simplifiedAutoLink: {
	      defaultValue: false,
	      describe: 'Turn on/off GFM autolink style',
	      type: 'boolean'
	    },
	    excludeTrailingPunctuationFromURLs: {
	      defaultValue: false,
	      describe: 'Excludes trailing punctuation from links generated with autoLinking',
	      type: 'boolean'
	    },
	    literalMidWordUnderscores: {
	      defaultValue: false,
	      describe: 'Parse midword underscores as literal underscores',
	      type: 'boolean'
	    },
	    literalMidWordAsterisks: {
	      defaultValue: false,
	      describe: 'Parse midword asterisks as literal asterisks',
	      type: 'boolean'
	    },
	    strikethrough: {
	      defaultValue: false,
	      describe: 'Turn on/off strikethrough support',
	      type: 'boolean'
	    },
	    tables: {
	      defaultValue: false,
	      describe: 'Turn on/off tables support',
	      type: 'boolean'
	    },
	    tablesHeaderId: {
	      defaultValue: false,
	      describe: 'Add an id to table headers',
	      type: 'boolean'
	    },
	    ghCodeBlocks: {
	      defaultValue: true,
	      describe: 'Turn on/off GFM fenced code blocks support',
	      type: 'boolean'
	    },
	    tasklists: {
	      defaultValue: false,
	      describe: 'Turn on/off GFM tasklist support',
	      type: 'boolean'
	    },
	    smoothLivePreview: {
	      defaultValue: false,
	      describe: 'Prevents weird effects in live previews due to incomplete input',
	      type: 'boolean'
	    },
	    smartIndentationFix: {
	      defaultValue: false,
	      description: 'Tries to smartly fix indentation in es6 strings',
	      type: 'boolean'
	    },
	    disableForced4SpacesIndentedSublists: {
	      defaultValue: false,
	      description: 'Disables the requirement of indenting nested sublists by 4 spaces',
	      type: 'boolean'
	    },
	    simpleLineBreaks: {
	      defaultValue: false,
	      description: 'Parses simple line breaks as <br> (GFM Style)',
	      type: 'boolean'
	    },
	    requireSpaceBeforeHeadingText: {
	      defaultValue: false,
	      description: 'Makes adding a space between `#` and the header text mandatory (GFM Style)',
	      type: 'boolean'
	    },
	    ghMentions: {
	      defaultValue: false,
	      description: 'Enables github @mentions',
	      type: 'boolean'
	    },
	    ghMentionsLink: {
	      defaultValue: 'https://github.com/{u}',
	      description: 'Changes the link generated by @mentions. Only applies if ghMentions option is enabled.',
	      type: 'string'
	    },
	    encodeEmails: {
	      defaultValue: true,
	      description: 'Encode e-mail addresses through the use of Character Entities, transforming ASCII e-mail addresses into its equivalent decimal entities',
	      type: 'boolean'
	    },
	    openLinksInNewWindow: {
	      defaultValue: false,
	      description: 'Open all links in new windows',
	      type: 'boolean'
	    },
	    backslashEscapesHTMLTags: {
	      defaultValue: false,
	      description: 'Support for HTML Tag escaping. ex: \<div>foo\</div>',
	      type: 'boolean'
	    },
	    emoji: {
	      defaultValue: false,
	      description: 'Enable emoji support. Ex: `this is a :smile: emoji`',
	      type: 'boolean'
	    },
	    underline: {
	      defaultValue: false,
	      description: 'Enable support for underline. Syntax is double or triple underscores: `__underline word__`. With this option enabled, underscores no longer parses into `<em>` and `<strong>`',
	      type: 'boolean'
	    },
	    completeHTMLDocument: {
	      defaultValue: false,
	      description: 'Outputs a complete html document, including `<html>`, `<head>` and `<body>` tags',
	      type: 'boolean'
	    },
	    metadata: {
	      defaultValue: false,
	      description: 'Enable support for document metadata (defined at the top of the document between `«««` and `»»»` or between `---` and `---`).',
	      type: 'boolean'
	    },
	    splitAdjacentBlockquotes: {
	      defaultValue: false,
	      description: 'Split adjacent blockquote blocks',
	      type: 'boolean'
	    }
	  };
	  if (simple === false) {
	    return JSON.parse(JSON.stringify(defaultOptions));
	  }
	  var ret = {};
	  for (var opt in defaultOptions) {
	    if (defaultOptions.hasOwnProperty(opt)) {
	      ret[opt] = defaultOptions[opt].defaultValue;
	    }
	  }
	  return ret;
	}

	function allOptionsOn () {
	  var options = getDefaultOpts(true),
	      ret = {};
	  for (var opt in options) {
	    if (options.hasOwnProperty(opt)) {
	      ret[opt] = true;
	    }
	  }
	  return ret;
	}

	/**
	 * Created by Tivie on 06-01-2015.
	 */

	// Private properties
	var showdown = {},
	    parsers = {},
	    extensions = {},
	    globalOptions = getDefaultOpts(true),
	    setFlavor = 'vanilla',
	    flavor = {
	      github: {
	        omitExtraWLInCodeBlocks:              true,
	        simplifiedAutoLink:                   true,
	        excludeTrailingPunctuationFromURLs:   true,
	        literalMidWordUnderscores:            true,
	        strikethrough:                        true,
	        tables:                               true,
	        tablesHeaderId:                       true,
	        ghCodeBlocks:                         true,
	        tasklists:                            true,
	        disableForced4SpacesIndentedSublists: true,
	        simpleLineBreaks:                     true,
	        requireSpaceBeforeHeadingText:        true,
	        ghCompatibleHeaderId:                 true,
	        ghMentions:                           true,
	        backslashEscapesHTMLTags:             true,
	        emoji:                                true,
	        splitAdjacentBlockquotes:             true
	      },
	      original: {
	        noHeaderId:                           true,
	        ghCodeBlocks:                         false
	      },
	      ghost: {
	        omitExtraWLInCodeBlocks:              true,
	        parseImgDimensions:                   true,
	        simplifiedAutoLink:                   true,
	        excludeTrailingPunctuationFromURLs:   true,
	        literalMidWordUnderscores:            true,
	        strikethrough:                        true,
	        tables:                               true,
	        tablesHeaderId:                       true,
	        ghCodeBlocks:                         true,
	        tasklists:                            true,
	        smoothLivePreview:                    true,
	        simpleLineBreaks:                     true,
	        requireSpaceBeforeHeadingText:        true,
	        ghMentions:                           false,
	        encodeEmails:                         true
	      },
	      vanilla: getDefaultOpts(true),
	      allOn: allOptionsOn()
	    };

	/**
	 * helper namespace
	 * @type {{}}
	 */
	showdown.helper = {};

	/**
	 * TODO LEGACY SUPPORT CODE
	 * @type {{}}
	 */
	showdown.extensions = {};

	/**
	 * Set a global option
	 * @static
	 * @param {string} key
	 * @param {*} value
	 * @returns {showdown}
	 */
	showdown.setOption = function (key, value) {
	  globalOptions[key] = value;
	  return this;
	};

	/**
	 * Get a global option
	 * @static
	 * @param {string} key
	 * @returns {*}
	 */
	showdown.getOption = function (key) {
	  return globalOptions[key];
	};

	/**
	 * Get the global options
	 * @static
	 * @returns {{}}
	 */
	showdown.getOptions = function () {
	  return globalOptions;
	};

	/**
	 * Reset global options to the default values
	 * @static
	 */
	showdown.resetOptions = function () {
	  globalOptions = getDefaultOpts(true);
	};

	/**
	 * Set the flavor showdown should use as default
	 * @param {string} name
	 */
	showdown.setFlavor = function (name) {
	  if (!flavor.hasOwnProperty(name)) {
	    throw Error(name + ' flavor was not found');
	  }
	  showdown.resetOptions();
	  var preset = flavor[name];
	  setFlavor = name;
	  for (var option in preset) {
	    if (preset.hasOwnProperty(option)) {
	      globalOptions[option] = preset[option];
	    }
	  }
	};

	/**
	 * Get the currently set flavor
	 * @returns {string}
	 */
	showdown.getFlavor = function () {
	  return setFlavor;
	};

	/**
	 * Get the options of a specified flavor. Returns undefined if the flavor was not found
	 * @param {string} name Name of the flavor
	 * @returns {{}|undefined}
	 */
	showdown.getFlavorOptions = function (name) {
	  if (flavor.hasOwnProperty(name)) {
	    return flavor[name];
	  }
	};

	/**
	 * Get the default options
	 * @static
	 * @param {boolean} [simple=true]
	 * @returns {{}}
	 */
	showdown.getDefaultOptions = function (simple) {
	  return getDefaultOpts(simple);
	};

	/**
	 * Get or set a subParser
	 *
	 * subParser(name)       - Get a registered subParser
	 * subParser(name, func) - Register a subParser
	 * @static
	 * @param {string} name
	 * @param {function} [func]
	 * @returns {*}
	 */
	showdown.subParser = function (name, func) {
	  if (showdown.helper.isString(name)) {
	    if (typeof func !== 'undefined') {
	      parsers[name] = func;
	    } else {
	      if (parsers.hasOwnProperty(name)) {
	        return parsers[name];
	      } else {
	        throw Error('SubParser named ' + name + ' not registered!');
	      }
	    }
	  }
	};

	/**
	 * Gets or registers an extension
	 * @static
	 * @param {string} name
	 * @param {object|function=} ext
	 * @returns {*}
	 */
	showdown.extension = function (name, ext) {

	  if (!showdown.helper.isString(name)) {
	    throw Error('Extension \'name\' must be a string');
	  }

	  name = showdown.helper.stdExtName(name);

	  // Getter
	  if (showdown.helper.isUndefined(ext)) {
	    if (!extensions.hasOwnProperty(name)) {
	      throw Error('Extension named ' + name + ' is not registered!');
	    }
	    return extensions[name];

	    // Setter
	  } else {
	    // Expand extension if it's wrapped in a function
	    if (typeof ext === 'function') {
	      ext = ext();
	    }

	    // Ensure extension is an array
	    if (!showdown.helper.isArray(ext)) {
	      ext = [ext];
	    }

	    var validExtension = validate(ext, name);

	    if (validExtension.valid) {
	      extensions[name] = ext;
	    } else {
	      throw Error(validExtension.error);
	    }
	  }
	};

	/**
	 * Gets all extensions registered
	 * @returns {{}}
	 */
	showdown.getAllExtensions = function () {
	  return extensions;
	};

	/**
	 * Remove an extension
	 * @param {string} name
	 */
	showdown.removeExtension = function (name) {
	  delete extensions[name];
	};

	/**
	 * Removes all extensions
	 */
	showdown.resetExtensions = function () {
	  extensions = {};
	};

	/**
	 * Validate extension
	 * @param {array} extension
	 * @param {string} name
	 * @returns {{valid: boolean, error: string}}
	 */
	function validate (extension, name) {

	  var errMsg = (name) ? 'Error in ' + name + ' extension->' : 'Error in unnamed extension',
	      ret = {
	        valid: true,
	        error: ''
	      };

	  if (!showdown.helper.isArray(extension)) {
	    extension = [extension];
	  }

	  for (var i = 0; i < extension.length; ++i) {
	    var baseMsg = errMsg + ' sub-extension ' + i + ': ',
	        ext = extension[i];
	    if (typeof ext !== 'object') {
	      ret.valid = false;
	      ret.error = baseMsg + 'must be an object, but ' + typeof ext + ' given';
	      return ret;
	    }

	    if (!showdown.helper.isString(ext.type)) {
	      ret.valid = false;
	      ret.error = baseMsg + 'property "type" must be a string, but ' + typeof ext.type + ' given';
	      return ret;
	    }

	    var type = ext.type = ext.type.toLowerCase();

	    // normalize extension type
	    if (type === 'language') {
	      type = ext.type = 'lang';
	    }

	    if (type === 'html') {
	      type = ext.type = 'output';
	    }

	    if (type !== 'lang' && type !== 'output' && type !== 'listener') {
	      ret.valid = false;
	      ret.error = baseMsg + 'type ' + type + ' is not recognized. Valid values: "lang/language", "output/html" or "listener"';
	      return ret;
	    }

	    if (type === 'listener') {
	      if (showdown.helper.isUndefined(ext.listeners)) {
	        ret.valid = false;
	        ret.error = baseMsg + '. Extensions of type "listener" must have a property called "listeners"';
	        return ret;
	      }
	    } else {
	      if (showdown.helper.isUndefined(ext.filter) && showdown.helper.isUndefined(ext.regex)) {
	        ret.valid = false;
	        ret.error = baseMsg + type + ' extensions must define either a "regex" property or a "filter" method';
	        return ret;
	      }
	    }

	    if (ext.listeners) {
	      if (typeof ext.listeners !== 'object') {
	        ret.valid = false;
	        ret.error = baseMsg + '"listeners" property must be an object but ' + typeof ext.listeners + ' given';
	        return ret;
	      }
	      for (var ln in ext.listeners) {
	        if (ext.listeners.hasOwnProperty(ln)) {
	          if (typeof ext.listeners[ln] !== 'function') {
	            ret.valid = false;
	            ret.error = baseMsg + '"listeners" property must be an hash of [event name]: [callback]. listeners.' + ln +
	              ' must be a function but ' + typeof ext.listeners[ln] + ' given';
	            return ret;
	          }
	        }
	      }
	    }

	    if (ext.filter) {
	      if (typeof ext.filter !== 'function') {
	        ret.valid = false;
	        ret.error = baseMsg + '"filter" must be a function, but ' + typeof ext.filter + ' given';
	        return ret;
	      }
	    } else if (ext.regex) {
	      if (showdown.helper.isString(ext.regex)) {
	        ext.regex = new RegExp(ext.regex, 'g');
	      }
	      if (!(ext.regex instanceof RegExp)) {
	        ret.valid = false;
	        ret.error = baseMsg + '"regex" property must either be a string or a RegExp object, but ' + typeof ext.regex + ' given';
	        return ret;
	      }
	      if (showdown.helper.isUndefined(ext.replace)) {
	        ret.valid = false;
	        ret.error = baseMsg + '"regex" extensions must implement a replace string or function';
	        return ret;
	      }
	    }
	  }
	  return ret;
	}

	/**
	 * Validate extension
	 * @param {object} ext
	 * @returns {boolean}
	 */
	showdown.validateExtension = function (ext) {

	  var validateExtension = validate(ext, null);
	  if (!validateExtension.valid) {
	    console.warn(validateExtension.error);
	    return false;
	  }
	  return true;
	};

	/**
	 * showdownjs helper functions
	 */

	if (!showdown.hasOwnProperty('helper')) {
	  showdown.helper = {};
	}

	/**
	 * Check if var is string
	 * @static
	 * @param {string} a
	 * @returns {boolean}
	 */
	showdown.helper.isString = function (a) {
	  return (typeof a === 'string' || a instanceof String);
	};

	/**
	 * Check if var is a function
	 * @static
	 * @param {*} a
	 * @returns {boolean}
	 */
	showdown.helper.isFunction = function (a) {
	  var getType = {};
	  return a && getType.toString.call(a) === '[object Function]';
	};

	/**
	 * isArray helper function
	 * @static
	 * @param {*} a
	 * @returns {boolean}
	 */
	showdown.helper.isArray = function (a) {
	  return Array.isArray(a);
	};

	/**
	 * Check if value is undefined
	 * @static
	 * @param {*} value The value to check.
	 * @returns {boolean} Returns `true` if `value` is `undefined`, else `false`.
	 */
	showdown.helper.isUndefined = function (value) {
	  return typeof value === 'undefined';
	};

	/**
	 * ForEach helper function
	 * Iterates over Arrays and Objects (own properties only)
	 * @static
	 * @param {*} obj
	 * @param {function} callback Accepts 3 params: 1. value, 2. key, 3. the original array/object
	 */
	showdown.helper.forEach = function (obj, callback) {
	  // check if obj is defined
	  if (showdown.helper.isUndefined(obj)) {
	    throw new Error('obj param is required');
	  }

	  if (showdown.helper.isUndefined(callback)) {
	    throw new Error('callback param is required');
	  }

	  if (!showdown.helper.isFunction(callback)) {
	    throw new Error('callback param must be a function/closure');
	  }

	  if (typeof obj.forEach === 'function') {
	    obj.forEach(callback);
	  } else if (showdown.helper.isArray(obj)) {
	    for (var i = 0; i < obj.length; i++) {
	      callback(obj[i], i, obj);
	    }
	  } else if (typeof (obj) === 'object') {
	    for (var prop in obj) {
	      if (obj.hasOwnProperty(prop)) {
	        callback(obj[prop], prop, obj);
	      }
	    }
	  } else {
	    throw new Error('obj does not seem to be an array or an iterable object');
	  }
	};

	/**
	 * Standardidize extension name
	 * @static
	 * @param {string} s extension name
	 * @returns {string}
	 */
	showdown.helper.stdExtName = function (s) {
	  return s.replace(/[_?*+\/\\.^-]/g, '').replace(/\s/g, '').toLowerCase();
	};

	function escapeCharactersCallback (wholeMatch, m1) {
	  var charCodeToEscape = m1.charCodeAt(0);
	  return '¨E' + charCodeToEscape + 'E';
	}

	/**
	 * Callback used to escape characters when passing through String.replace
	 * @static
	 * @param {string} wholeMatch
	 * @param {string} m1
	 * @returns {string}
	 */
	showdown.helper.escapeCharactersCallback = escapeCharactersCallback;

	/**
	 * Escape characters in a string
	 * @static
	 * @param {string} text
	 * @param {string} charsToEscape
	 * @param {boolean} afterBackslash
	 * @returns {XML|string|void|*}
	 */
	showdown.helper.escapeCharacters = function (text, charsToEscape, afterBackslash) {
	  // First we have to escape the escape characters so that
	  // we can build a character class out of them
	  var regexString = '([' + charsToEscape.replace(/([\[\]\\])/g, '\\$1') + '])';

	  if (afterBackslash) {
	    regexString = '\\\\' + regexString;
	  }

	  var regex = new RegExp(regexString, 'g');
	  text = text.replace(regex, escapeCharactersCallback);

	  return text;
	};

	/**
	 * Unescape HTML entities
	 * @param txt
	 * @returns {string}
	 */
	showdown.helper.unescapeHTMLEntities = function (txt) {

	  return txt
	    .replace(/&quot;/g, '"')
	    .replace(/&lt;/g, '<')
	    .replace(/&gt;/g, '>')
	    .replace(/&amp;/g, '&');
	};

	var rgxFindMatchPos = function (str, left, right, flags) {
	  var f = flags || '',
	      g = f.indexOf('g') > -1,
	      x = new RegExp(left + '|' + right, 'g' + f.replace(/g/g, '')),
	      l = new RegExp(left, f.replace(/g/g, '')),
	      pos = [],
	      t, s, m, start, end;

	  do {
	    t = 0;
	    while ((m = x.exec(str))) {
	      if (l.test(m[0])) {
	        if (!(t++)) {
	          s = x.lastIndex;
	          start = s - m[0].length;
	        }
	      } else if (t) {
	        if (!--t) {
	          end = m.index + m[0].length;
	          var obj = {
	            left: {start: start, end: s},
	            match: {start: s, end: m.index},
	            right: {start: m.index, end: end},
	            wholeMatch: {start: start, end: end}
	          };
	          pos.push(obj);
	          if (!g) {
	            return pos;
	          }
	        }
	      }
	    }
	  } while (t && (x.lastIndex = s));

	  return pos;
	};

	/**
	 * matchRecursiveRegExp
	 *
	 * (c) 2007 Steven Levithan <stevenlevithan.com>
	 * MIT License
	 *
	 * Accepts a string to search, a left and right format delimiter
	 * as regex patterns, and optional regex flags. Returns an array
	 * of matches, allowing nested instances of left/right delimiters.
	 * Use the "g" flag to return all matches, otherwise only the
	 * first is returned. Be careful to ensure that the left and
	 * right format delimiters produce mutually exclusive matches.
	 * Backreferences are not supported within the right delimiter
	 * due to how it is internally combined with the left delimiter.
	 * When matching strings whose format delimiters are unbalanced
	 * to the left or right, the output is intentionally as a
	 * conventional regex library with recursion support would
	 * produce, e.g. "<<x>" and "<x>>" both produce ["x"] when using
	 * "<" and ">" as the delimiters (both strings contain a single,
	 * balanced instance of "<x>").
	 *
	 * examples:
	 * matchRecursiveRegExp("test", "\\(", "\\)")
	 * returns: []
	 * matchRecursiveRegExp("<t<<e>><s>>t<>", "<", ">", "g")
	 * returns: ["t<<e>><s>", ""]
	 * matchRecursiveRegExp("<div id=\"x\">test</div>", "<div\\b[^>]*>", "</div>", "gi")
	 * returns: ["test"]
	 */
	showdown.helper.matchRecursiveRegExp = function (str, left, right, flags) {

	  var matchPos = rgxFindMatchPos (str, left, right, flags),
	      results = [];

	  for (var i = 0; i < matchPos.length; ++i) {
	    results.push([
	      str.slice(matchPos[i].wholeMatch.start, matchPos[i].wholeMatch.end),
	      str.slice(matchPos[i].match.start, matchPos[i].match.end),
	      str.slice(matchPos[i].left.start, matchPos[i].left.end),
	      str.slice(matchPos[i].right.start, matchPos[i].right.end)
	    ]);
	  }
	  return results;
	};

	/**
	 *
	 * @param {string} str
	 * @param {string|function} replacement
	 * @param {string} left
	 * @param {string} right
	 * @param {string} flags
	 * @returns {string}
	 */
	showdown.helper.replaceRecursiveRegExp = function (str, replacement, left, right, flags) {

	  if (!showdown.helper.isFunction(replacement)) {
	    var repStr = replacement;
	    replacement = function () {
	      return repStr;
	    };
	  }

	  var matchPos = rgxFindMatchPos(str, left, right, flags),
	      finalStr = str,
	      lng = matchPos.length;

	  if (lng > 0) {
	    var bits = [];
	    if (matchPos[0].wholeMatch.start !== 0) {
	      bits.push(str.slice(0, matchPos[0].wholeMatch.start));
	    }
	    for (var i = 0; i < lng; ++i) {
	      bits.push(
	        replacement(
	          str.slice(matchPos[i].wholeMatch.start, matchPos[i].wholeMatch.end),
	          str.slice(matchPos[i].match.start, matchPos[i].match.end),
	          str.slice(matchPos[i].left.start, matchPos[i].left.end),
	          str.slice(matchPos[i].right.start, matchPos[i].right.end)
	        )
	      );
	      if (i < lng - 1) {
	        bits.push(str.slice(matchPos[i].wholeMatch.end, matchPos[i + 1].wholeMatch.start));
	      }
	    }
	    if (matchPos[lng - 1].wholeMatch.end < str.length) {
	      bits.push(str.slice(matchPos[lng - 1].wholeMatch.end));
	    }
	    finalStr = bits.join('');
	  }
	  return finalStr;
	};

	/**
	 * Returns the index within the passed String object of the first occurrence of the specified regex,
	 * starting the search at fromIndex. Returns -1 if the value is not found.
	 *
	 * @param {string} str string to search
	 * @param {RegExp} regex Regular expression to search
	 * @param {int} [fromIndex = 0] Index to start the search
	 * @returns {Number}
	 * @throws InvalidArgumentError
	 */
	showdown.helper.regexIndexOf = function (str, regex, fromIndex) {
	  if (!showdown.helper.isString(str)) {
	    throw 'InvalidArgumentError: first parameter of showdown.helper.regexIndexOf function must be a string';
	  }
	  if (regex instanceof RegExp === false) {
	    throw 'InvalidArgumentError: second parameter of showdown.helper.regexIndexOf function must be an instance of RegExp';
	  }
	  var indexOf = str.substring(fromIndex || 0).search(regex);
	  return (indexOf >= 0) ? (indexOf + (fromIndex || 0)) : indexOf;
	};

	/**
	 * Splits the passed string object at the defined index, and returns an array composed of the two substrings
	 * @param {string} str string to split
	 * @param {int} index index to split string at
	 * @returns {[string,string]}
	 * @throws InvalidArgumentError
	 */
	showdown.helper.splitAtIndex = function (str, index) {
	  if (!showdown.helper.isString(str)) {
	    throw 'InvalidArgumentError: first parameter of showdown.helper.regexIndexOf function must be a string';
	  }
	  return [str.substring(0, index), str.substring(index)];
	};

	/**
	 * Obfuscate an e-mail address through the use of Character Entities,
	 * transforming ASCII characters into their equivalent decimal or hex entities.
	 *
	 * Since it has a random component, subsequent calls to this function produce different results
	 *
	 * @param {string} mail
	 * @returns {string}
	 */
	showdown.helper.encodeEmailAddress = function (mail) {
	  var encode = [
	    function (ch) {
	      return '&#' + ch.charCodeAt(0) + ';';
	    },
	    function (ch) {
	      return '&#x' + ch.charCodeAt(0).toString(16) + ';';
	    },
	    function (ch) {
	      return ch;
	    }
	  ];

	  mail = mail.replace(/./g, function (ch) {
	    if (ch === '@') {
	      // this *must* be encoded. I insist.
	      ch = encode[Math.floor(Math.random() * 2)](ch);
	    } else {
	      var r = Math.random();
	      // roughly 10% raw, 45% hex, 45% dec
	      ch = (
	        r > 0.9 ? encode[2](ch) : r > 0.45 ? encode[1](ch) : encode[0](ch)
	      );
	    }
	    return ch;
	  });

	  return mail;
	};

	/**
	 *
	 * @param str
	 * @param targetLength
	 * @param padString
	 * @returns {string}
	 */
	showdown.helper.padEnd = function padEnd (str, targetLength, padString) {
	  /*jshint bitwise: false*/
	  // eslint-disable-next-line space-infix-ops
	  targetLength = targetLength>>0; //floor if number or convert non-number to 0;
	  /*jshint bitwise: true*/
	  padString = String(padString || ' ');
	  if (str.length > targetLength) {
	    return String(str);
	  } else {
	    targetLength = targetLength - str.length;
	    if (targetLength > padString.length) {
	      padString += padString.repeat(targetLength / padString.length); //append to original to ensure we are longer than needed
	    }
	    return String(str) + padString.slice(0,targetLength);
	  }
	};

	/**
	 * POLYFILLS
	 */
	// use this instead of builtin is undefined for IE8 compatibility
	if (typeof(console) === 'undefined') {
	  console = {
	    warn: function (msg) {
	      alert(msg);
	    },
	    log: function (msg) {
	      alert(msg);
	    },
	    error: function (msg) {
	      throw msg;
	    }
	  };
	}

	/**
	 * Common regexes.
	 * We declare some common regexes to improve performance
	 */
	showdown.helper.regexes = {
	  asteriskDashAndColon: /([*_:~])/g
	};

	/**
	 * EMOJIS LIST
	 */
	showdown.helper.emojis = {
	  '+1':'\ud83d\udc4d',
	  '-1':'\ud83d\udc4e',
	  '100':'\ud83d\udcaf',
	  '1234':'\ud83d\udd22',
	  '1st_place_medal':'\ud83e\udd47',
	  '2nd_place_medal':'\ud83e\udd48',
	  '3rd_place_medal':'\ud83e\udd49',
	  '8ball':'\ud83c\udfb1',
	  'a':'\ud83c\udd70\ufe0f',
	  'ab':'\ud83c\udd8e',
	  'abc':'\ud83d\udd24',
	  'abcd':'\ud83d\udd21',
	  'accept':'\ud83c\ude51',
	  'aerial_tramway':'\ud83d\udea1',
	  'airplane':'\u2708\ufe0f',
	  'alarm_clock':'\u23f0',
	  'alembic':'\u2697\ufe0f',
	  'alien':'\ud83d\udc7d',
	  'ambulance':'\ud83d\ude91',
	  'amphora':'\ud83c\udffa',
	  'anchor':'\u2693\ufe0f',
	  'angel':'\ud83d\udc7c',
	  'anger':'\ud83d\udca2',
	  'angry':'\ud83d\ude20',
	  'anguished':'\ud83d\ude27',
	  'ant':'\ud83d\udc1c',
	  'apple':'\ud83c\udf4e',
	  'aquarius':'\u2652\ufe0f',
	  'aries':'\u2648\ufe0f',
	  'arrow_backward':'\u25c0\ufe0f',
	  'arrow_double_down':'\u23ec',
	  'arrow_double_up':'\u23eb',
	  'arrow_down':'\u2b07\ufe0f',
	  'arrow_down_small':'\ud83d\udd3d',
	  'arrow_forward':'\u25b6\ufe0f',
	  'arrow_heading_down':'\u2935\ufe0f',
	  'arrow_heading_up':'\u2934\ufe0f',
	  'arrow_left':'\u2b05\ufe0f',
	  'arrow_lower_left':'\u2199\ufe0f',
	  'arrow_lower_right':'\u2198\ufe0f',
	  'arrow_right':'\u27a1\ufe0f',
	  'arrow_right_hook':'\u21aa\ufe0f',
	  'arrow_up':'\u2b06\ufe0f',
	  'arrow_up_down':'\u2195\ufe0f',
	  'arrow_up_small':'\ud83d\udd3c',
	  'arrow_upper_left':'\u2196\ufe0f',
	  'arrow_upper_right':'\u2197\ufe0f',
	  'arrows_clockwise':'\ud83d\udd03',
	  'arrows_counterclockwise':'\ud83d\udd04',
	  'art':'\ud83c\udfa8',
	  'articulated_lorry':'\ud83d\ude9b',
	  'artificial_satellite':'\ud83d\udef0',
	  'astonished':'\ud83d\ude32',
	  'athletic_shoe':'\ud83d\udc5f',
	  'atm':'\ud83c\udfe7',
	  'atom_symbol':'\u269b\ufe0f',
	  'avocado':'\ud83e\udd51',
	  'b':'\ud83c\udd71\ufe0f',
	  'baby':'\ud83d\udc76',
	  'baby_bottle':'\ud83c\udf7c',
	  'baby_chick':'\ud83d\udc24',
	  'baby_symbol':'\ud83d\udebc',
	  'back':'\ud83d\udd19',
	  'bacon':'\ud83e\udd53',
	  'badminton':'\ud83c\udff8',
	  'baggage_claim':'\ud83d\udec4',
	  'baguette_bread':'\ud83e\udd56',
	  'balance_scale':'\u2696\ufe0f',
	  'balloon':'\ud83c\udf88',
	  'ballot_box':'\ud83d\uddf3',
	  'ballot_box_with_check':'\u2611\ufe0f',
	  'bamboo':'\ud83c\udf8d',
	  'banana':'\ud83c\udf4c',
	  'bangbang':'\u203c\ufe0f',
	  'bank':'\ud83c\udfe6',
	  'bar_chart':'\ud83d\udcca',
	  'barber':'\ud83d\udc88',
	  'baseball':'\u26be\ufe0f',
	  'basketball':'\ud83c\udfc0',
	  'basketball_man':'\u26f9\ufe0f',
	  'basketball_woman':'\u26f9\ufe0f&zwj;\u2640\ufe0f',
	  'bat':'\ud83e\udd87',
	  'bath':'\ud83d\udec0',
	  'bathtub':'\ud83d\udec1',
	  'battery':'\ud83d\udd0b',
	  'beach_umbrella':'\ud83c\udfd6',
	  'bear':'\ud83d\udc3b',
	  'bed':'\ud83d\udecf',
	  'bee':'\ud83d\udc1d',
	  'beer':'\ud83c\udf7a',
	  'beers':'\ud83c\udf7b',
	  'beetle':'\ud83d\udc1e',
	  'beginner':'\ud83d\udd30',
	  'bell':'\ud83d\udd14',
	  'bellhop_bell':'\ud83d\udece',
	  'bento':'\ud83c\udf71',
	  'biking_man':'\ud83d\udeb4',
	  'bike':'\ud83d\udeb2',
	  'biking_woman':'\ud83d\udeb4&zwj;\u2640\ufe0f',
	  'bikini':'\ud83d\udc59',
	  'biohazard':'\u2623\ufe0f',
	  'bird':'\ud83d\udc26',
	  'birthday':'\ud83c\udf82',
	  'black_circle':'\u26ab\ufe0f',
	  'black_flag':'\ud83c\udff4',
	  'black_heart':'\ud83d\udda4',
	  'black_joker':'\ud83c\udccf',
	  'black_large_square':'\u2b1b\ufe0f',
	  'black_medium_small_square':'\u25fe\ufe0f',
	  'black_medium_square':'\u25fc\ufe0f',
	  'black_nib':'\u2712\ufe0f',
	  'black_small_square':'\u25aa\ufe0f',
	  'black_square_button':'\ud83d\udd32',
	  'blonde_man':'\ud83d\udc71',
	  'blonde_woman':'\ud83d\udc71&zwj;\u2640\ufe0f',
	  'blossom':'\ud83c\udf3c',
	  'blowfish':'\ud83d\udc21',
	  'blue_book':'\ud83d\udcd8',
	  'blue_car':'\ud83d\ude99',
	  'blue_heart':'\ud83d\udc99',
	  'blush':'\ud83d\ude0a',
	  'boar':'\ud83d\udc17',
	  'boat':'\u26f5\ufe0f',
	  'bomb':'\ud83d\udca3',
	  'book':'\ud83d\udcd6',
	  'bookmark':'\ud83d\udd16',
	  'bookmark_tabs':'\ud83d\udcd1',
	  'books':'\ud83d\udcda',
	  'boom':'\ud83d\udca5',
	  'boot':'\ud83d\udc62',
	  'bouquet':'\ud83d\udc90',
	  'bowing_man':'\ud83d\ude47',
	  'bow_and_arrow':'\ud83c\udff9',
	  'bowing_woman':'\ud83d\ude47&zwj;\u2640\ufe0f',
	  'bowling':'\ud83c\udfb3',
	  'boxing_glove':'\ud83e\udd4a',
	  'boy':'\ud83d\udc66',
	  'bread':'\ud83c\udf5e',
	  'bride_with_veil':'\ud83d\udc70',
	  'bridge_at_night':'\ud83c\udf09',
	  'briefcase':'\ud83d\udcbc',
	  'broken_heart':'\ud83d\udc94',
	  'bug':'\ud83d\udc1b',
	  'building_construction':'\ud83c\udfd7',
	  'bulb':'\ud83d\udca1',
	  'bullettrain_front':'\ud83d\ude85',
	  'bullettrain_side':'\ud83d\ude84',
	  'burrito':'\ud83c\udf2f',
	  'bus':'\ud83d\ude8c',
	  'business_suit_levitating':'\ud83d\udd74',
	  'busstop':'\ud83d\ude8f',
	  'bust_in_silhouette':'\ud83d\udc64',
	  'busts_in_silhouette':'\ud83d\udc65',
	  'butterfly':'\ud83e\udd8b',
	  'cactus':'\ud83c\udf35',
	  'cake':'\ud83c\udf70',
	  'calendar':'\ud83d\udcc6',
	  'call_me_hand':'\ud83e\udd19',
	  'calling':'\ud83d\udcf2',
	  'camel':'\ud83d\udc2b',
	  'camera':'\ud83d\udcf7',
	  'camera_flash':'\ud83d\udcf8',
	  'camping':'\ud83c\udfd5',
	  'cancer':'\u264b\ufe0f',
	  'candle':'\ud83d\udd6f',
	  'candy':'\ud83c\udf6c',
	  'canoe':'\ud83d\udef6',
	  'capital_abcd':'\ud83d\udd20',
	  'capricorn':'\u2651\ufe0f',
	  'car':'\ud83d\ude97',
	  'card_file_box':'\ud83d\uddc3',
	  'card_index':'\ud83d\udcc7',
	  'card_index_dividers':'\ud83d\uddc2',
	  'carousel_horse':'\ud83c\udfa0',
	  'carrot':'\ud83e\udd55',
	  'cat':'\ud83d\udc31',
	  'cat2':'\ud83d\udc08',
	  'cd':'\ud83d\udcbf',
	  'chains':'\u26d3',
	  'champagne':'\ud83c\udf7e',
	  'chart':'\ud83d\udcb9',
	  'chart_with_downwards_trend':'\ud83d\udcc9',
	  'chart_with_upwards_trend':'\ud83d\udcc8',
	  'checkered_flag':'\ud83c\udfc1',
	  'cheese':'\ud83e\uddc0',
	  'cherries':'\ud83c\udf52',
	  'cherry_blossom':'\ud83c\udf38',
	  'chestnut':'\ud83c\udf30',
	  'chicken':'\ud83d\udc14',
	  'children_crossing':'\ud83d\udeb8',
	  'chipmunk':'\ud83d\udc3f',
	  'chocolate_bar':'\ud83c\udf6b',
	  'christmas_tree':'\ud83c\udf84',
	  'church':'\u26ea\ufe0f',
	  'cinema':'\ud83c\udfa6',
	  'circus_tent':'\ud83c\udfaa',
	  'city_sunrise':'\ud83c\udf07',
	  'city_sunset':'\ud83c\udf06',
	  'cityscape':'\ud83c\udfd9',
	  'cl':'\ud83c\udd91',
	  'clamp':'\ud83d\udddc',
	  'clap':'\ud83d\udc4f',
	  'clapper':'\ud83c\udfac',
	  'classical_building':'\ud83c\udfdb',
	  'clinking_glasses':'\ud83e\udd42',
	  'clipboard':'\ud83d\udccb',
	  'clock1':'\ud83d\udd50',
	  'clock10':'\ud83d\udd59',
	  'clock1030':'\ud83d\udd65',
	  'clock11':'\ud83d\udd5a',
	  'clock1130':'\ud83d\udd66',
	  'clock12':'\ud83d\udd5b',
	  'clock1230':'\ud83d\udd67',
	  'clock130':'\ud83d\udd5c',
	  'clock2':'\ud83d\udd51',
	  'clock230':'\ud83d\udd5d',
	  'clock3':'\ud83d\udd52',
	  'clock330':'\ud83d\udd5e',
	  'clock4':'\ud83d\udd53',
	  'clock430':'\ud83d\udd5f',
	  'clock5':'\ud83d\udd54',
	  'clock530':'\ud83d\udd60',
	  'clock6':'\ud83d\udd55',
	  'clock630':'\ud83d\udd61',
	  'clock7':'\ud83d\udd56',
	  'clock730':'\ud83d\udd62',
	  'clock8':'\ud83d\udd57',
	  'clock830':'\ud83d\udd63',
	  'clock9':'\ud83d\udd58',
	  'clock930':'\ud83d\udd64',
	  'closed_book':'\ud83d\udcd5',
	  'closed_lock_with_key':'\ud83d\udd10',
	  'closed_umbrella':'\ud83c\udf02',
	  'cloud':'\u2601\ufe0f',
	  'cloud_with_lightning':'\ud83c\udf29',
	  'cloud_with_lightning_and_rain':'\u26c8',
	  'cloud_with_rain':'\ud83c\udf27',
	  'cloud_with_snow':'\ud83c\udf28',
	  'clown_face':'\ud83e\udd21',
	  'clubs':'\u2663\ufe0f',
	  'cocktail':'\ud83c\udf78',
	  'coffee':'\u2615\ufe0f',
	  'coffin':'\u26b0\ufe0f',
	  'cold_sweat':'\ud83d\ude30',
	  'comet':'\u2604\ufe0f',
	  'computer':'\ud83d\udcbb',
	  'computer_mouse':'\ud83d\uddb1',
	  'confetti_ball':'\ud83c\udf8a',
	  'confounded':'\ud83d\ude16',
	  'confused':'\ud83d\ude15',
	  'congratulations':'\u3297\ufe0f',
	  'construction':'\ud83d\udea7',
	  'construction_worker_man':'\ud83d\udc77',
	  'construction_worker_woman':'\ud83d\udc77&zwj;\u2640\ufe0f',
	  'control_knobs':'\ud83c\udf9b',
	  'convenience_store':'\ud83c\udfea',
	  'cookie':'\ud83c\udf6a',
	  'cool':'\ud83c\udd92',
	  'policeman':'\ud83d\udc6e',
	  'copyright':'\u00a9\ufe0f',
	  'corn':'\ud83c\udf3d',
	  'couch_and_lamp':'\ud83d\udecb',
	  'couple':'\ud83d\udc6b',
	  'couple_with_heart_woman_man':'\ud83d\udc91',
	  'couple_with_heart_man_man':'\ud83d\udc68&zwj;\u2764\ufe0f&zwj;\ud83d\udc68',
	  'couple_with_heart_woman_woman':'\ud83d\udc69&zwj;\u2764\ufe0f&zwj;\ud83d\udc69',
	  'couplekiss_man_man':'\ud83d\udc68&zwj;\u2764\ufe0f&zwj;\ud83d\udc8b&zwj;\ud83d\udc68',
	  'couplekiss_man_woman':'\ud83d\udc8f',
	  'couplekiss_woman_woman':'\ud83d\udc69&zwj;\u2764\ufe0f&zwj;\ud83d\udc8b&zwj;\ud83d\udc69',
	  'cow':'\ud83d\udc2e',
	  'cow2':'\ud83d\udc04',
	  'cowboy_hat_face':'\ud83e\udd20',
	  'crab':'\ud83e\udd80',
	  'crayon':'\ud83d\udd8d',
	  'credit_card':'\ud83d\udcb3',
	  'crescent_moon':'\ud83c\udf19',
	  'cricket':'\ud83c\udfcf',
	  'crocodile':'\ud83d\udc0a',
	  'croissant':'\ud83e\udd50',
	  'crossed_fingers':'\ud83e\udd1e',
	  'crossed_flags':'\ud83c\udf8c',
	  'crossed_swords':'\u2694\ufe0f',
	  'crown':'\ud83d\udc51',
	  'cry':'\ud83d\ude22',
	  'crying_cat_face':'\ud83d\ude3f',
	  'crystal_ball':'\ud83d\udd2e',
	  'cucumber':'\ud83e\udd52',
	  'cupid':'\ud83d\udc98',
	  'curly_loop':'\u27b0',
	  'currency_exchange':'\ud83d\udcb1',
	  'curry':'\ud83c\udf5b',
	  'custard':'\ud83c\udf6e',
	  'customs':'\ud83d\udec3',
	  'cyclone':'\ud83c\udf00',
	  'dagger':'\ud83d\udde1',
	  'dancer':'\ud83d\udc83',
	  'dancing_women':'\ud83d\udc6f',
	  'dancing_men':'\ud83d\udc6f&zwj;\u2642\ufe0f',
	  'dango':'\ud83c\udf61',
	  'dark_sunglasses':'\ud83d\udd76',
	  'dart':'\ud83c\udfaf',
	  'dash':'\ud83d\udca8',
	  'date':'\ud83d\udcc5',
	  'deciduous_tree':'\ud83c\udf33',
	  'deer':'\ud83e\udd8c',
	  'department_store':'\ud83c\udfec',
	  'derelict_house':'\ud83c\udfda',
	  'desert':'\ud83c\udfdc',
	  'desert_island':'\ud83c\udfdd',
	  'desktop_computer':'\ud83d\udda5',
	  'male_detective':'\ud83d\udd75\ufe0f',
	  'diamond_shape_with_a_dot_inside':'\ud83d\udca0',
	  'diamonds':'\u2666\ufe0f',
	  'disappointed':'\ud83d\ude1e',
	  'disappointed_relieved':'\ud83d\ude25',
	  'dizzy':'\ud83d\udcab',
	  'dizzy_face':'\ud83d\ude35',
	  'do_not_litter':'\ud83d\udeaf',
	  'dog':'\ud83d\udc36',
	  'dog2':'\ud83d\udc15',
	  'dollar':'\ud83d\udcb5',
	  'dolls':'\ud83c\udf8e',
	  'dolphin':'\ud83d\udc2c',
	  'door':'\ud83d\udeaa',
	  'doughnut':'\ud83c\udf69',
	  'dove':'\ud83d\udd4a',
	  'dragon':'\ud83d\udc09',
	  'dragon_face':'\ud83d\udc32',
	  'dress':'\ud83d\udc57',
	  'dromedary_camel':'\ud83d\udc2a',
	  'drooling_face':'\ud83e\udd24',
	  'droplet':'\ud83d\udca7',
	  'drum':'\ud83e\udd41',
	  'duck':'\ud83e\udd86',
	  'dvd':'\ud83d\udcc0',
	  'e-mail':'\ud83d\udce7',
	  'eagle':'\ud83e\udd85',
	  'ear':'\ud83d\udc42',
	  'ear_of_rice':'\ud83c\udf3e',
	  'earth_africa':'\ud83c\udf0d',
	  'earth_americas':'\ud83c\udf0e',
	  'earth_asia':'\ud83c\udf0f',
	  'egg':'\ud83e\udd5a',
	  'eggplant':'\ud83c\udf46',
	  'eight_pointed_black_star':'\u2734\ufe0f',
	  'eight_spoked_asterisk':'\u2733\ufe0f',
	  'electric_plug':'\ud83d\udd0c',
	  'elephant':'\ud83d\udc18',
	  'email':'\u2709\ufe0f',
	  'end':'\ud83d\udd1a',
	  'envelope_with_arrow':'\ud83d\udce9',
	  'euro':'\ud83d\udcb6',
	  'european_castle':'\ud83c\udff0',
	  'european_post_office':'\ud83c\udfe4',
	  'evergreen_tree':'\ud83c\udf32',
	  'exclamation':'\u2757\ufe0f',
	  'expressionless':'\ud83d\ude11',
	  'eye':'\ud83d\udc41',
	  'eye_speech_bubble':'\ud83d\udc41&zwj;\ud83d\udde8',
	  'eyeglasses':'\ud83d\udc53',
	  'eyes':'\ud83d\udc40',
	  'face_with_head_bandage':'\ud83e\udd15',
	  'face_with_thermometer':'\ud83e\udd12',
	  'fist_oncoming':'\ud83d\udc4a',
	  'factory':'\ud83c\udfed',
	  'fallen_leaf':'\ud83c\udf42',
	  'family_man_woman_boy':'\ud83d\udc6a',
	  'family_man_boy':'\ud83d\udc68&zwj;\ud83d\udc66',
	  'family_man_boy_boy':'\ud83d\udc68&zwj;\ud83d\udc66&zwj;\ud83d\udc66',
	  'family_man_girl':'\ud83d\udc68&zwj;\ud83d\udc67',
	  'family_man_girl_boy':'\ud83d\udc68&zwj;\ud83d\udc67&zwj;\ud83d\udc66',
	  'family_man_girl_girl':'\ud83d\udc68&zwj;\ud83d\udc67&zwj;\ud83d\udc67',
	  'family_man_man_boy':'\ud83d\udc68&zwj;\ud83d\udc68&zwj;\ud83d\udc66',
	  'family_man_man_boy_boy':'\ud83d\udc68&zwj;\ud83d\udc68&zwj;\ud83d\udc66&zwj;\ud83d\udc66',
	  'family_man_man_girl':'\ud83d\udc68&zwj;\ud83d\udc68&zwj;\ud83d\udc67',
	  'family_man_man_girl_boy':'\ud83d\udc68&zwj;\ud83d\udc68&zwj;\ud83d\udc67&zwj;\ud83d\udc66',
	  'family_man_man_girl_girl':'\ud83d\udc68&zwj;\ud83d\udc68&zwj;\ud83d\udc67&zwj;\ud83d\udc67',
	  'family_man_woman_boy_boy':'\ud83d\udc68&zwj;\ud83d\udc69&zwj;\ud83d\udc66&zwj;\ud83d\udc66',
	  'family_man_woman_girl':'\ud83d\udc68&zwj;\ud83d\udc69&zwj;\ud83d\udc67',
	  'family_man_woman_girl_boy':'\ud83d\udc68&zwj;\ud83d\udc69&zwj;\ud83d\udc67&zwj;\ud83d\udc66',
	  'family_man_woman_girl_girl':'\ud83d\udc68&zwj;\ud83d\udc69&zwj;\ud83d\udc67&zwj;\ud83d\udc67',
	  'family_woman_boy':'\ud83d\udc69&zwj;\ud83d\udc66',
	  'family_woman_boy_boy':'\ud83d\udc69&zwj;\ud83d\udc66&zwj;\ud83d\udc66',
	  'family_woman_girl':'\ud83d\udc69&zwj;\ud83d\udc67',
	  'family_woman_girl_boy':'\ud83d\udc69&zwj;\ud83d\udc67&zwj;\ud83d\udc66',
	  'family_woman_girl_girl':'\ud83d\udc69&zwj;\ud83d\udc67&zwj;\ud83d\udc67',
	  'family_woman_woman_boy':'\ud83d\udc69&zwj;\ud83d\udc69&zwj;\ud83d\udc66',
	  'family_woman_woman_boy_boy':'\ud83d\udc69&zwj;\ud83d\udc69&zwj;\ud83d\udc66&zwj;\ud83d\udc66',
	  'family_woman_woman_girl':'\ud83d\udc69&zwj;\ud83d\udc69&zwj;\ud83d\udc67',
	  'family_woman_woman_girl_boy':'\ud83d\udc69&zwj;\ud83d\udc69&zwj;\ud83d\udc67&zwj;\ud83d\udc66',
	  'family_woman_woman_girl_girl':'\ud83d\udc69&zwj;\ud83d\udc69&zwj;\ud83d\udc67&zwj;\ud83d\udc67',
	  'fast_forward':'\u23e9',
	  'fax':'\ud83d\udce0',
	  'fearful':'\ud83d\ude28',
	  'feet':'\ud83d\udc3e',
	  'female_detective':'\ud83d\udd75\ufe0f&zwj;\u2640\ufe0f',
	  'ferris_wheel':'\ud83c\udfa1',
	  'ferry':'\u26f4',
	  'field_hockey':'\ud83c\udfd1',
	  'file_cabinet':'\ud83d\uddc4',
	  'file_folder':'\ud83d\udcc1',
	  'film_projector':'\ud83d\udcfd',
	  'film_strip':'\ud83c\udf9e',
	  'fire':'\ud83d\udd25',
	  'fire_engine':'\ud83d\ude92',
	  'fireworks':'\ud83c\udf86',
	  'first_quarter_moon':'\ud83c\udf13',
	  'first_quarter_moon_with_face':'\ud83c\udf1b',
	  'fish':'\ud83d\udc1f',
	  'fish_cake':'\ud83c\udf65',
	  'fishing_pole_and_fish':'\ud83c\udfa3',
	  'fist_raised':'\u270a',
	  'fist_left':'\ud83e\udd1b',
	  'fist_right':'\ud83e\udd1c',
	  'flags':'\ud83c\udf8f',
	  'flashlight':'\ud83d\udd26',
	  'fleur_de_lis':'\u269c\ufe0f',
	  'flight_arrival':'\ud83d\udeec',
	  'flight_departure':'\ud83d\udeeb',
	  'floppy_disk':'\ud83d\udcbe',
	  'flower_playing_cards':'\ud83c\udfb4',
	  'flushed':'\ud83d\ude33',
	  'fog':'\ud83c\udf2b',
	  'foggy':'\ud83c\udf01',
	  'football':'\ud83c\udfc8',
	  'footprints':'\ud83d\udc63',
	  'fork_and_knife':'\ud83c\udf74',
	  'fountain':'\u26f2\ufe0f',
	  'fountain_pen':'\ud83d\udd8b',
	  'four_leaf_clover':'\ud83c\udf40',
	  'fox_face':'\ud83e\udd8a',
	  'framed_picture':'\ud83d\uddbc',
	  'free':'\ud83c\udd93',
	  'fried_egg':'\ud83c\udf73',
	  'fried_shrimp':'\ud83c\udf64',
	  'fries':'\ud83c\udf5f',
	  'frog':'\ud83d\udc38',
	  'frowning':'\ud83d\ude26',
	  'frowning_face':'\u2639\ufe0f',
	  'frowning_man':'\ud83d\ude4d&zwj;\u2642\ufe0f',
	  'frowning_woman':'\ud83d\ude4d',
	  'middle_finger':'\ud83d\udd95',
	  'fuelpump':'\u26fd\ufe0f',
	  'full_moon':'\ud83c\udf15',
	  'full_moon_with_face':'\ud83c\udf1d',
	  'funeral_urn':'\u26b1\ufe0f',
	  'game_die':'\ud83c\udfb2',
	  'gear':'\u2699\ufe0f',
	  'gem':'\ud83d\udc8e',
	  'gemini':'\u264a\ufe0f',
	  'ghost':'\ud83d\udc7b',
	  'gift':'\ud83c\udf81',
	  'gift_heart':'\ud83d\udc9d',
	  'girl':'\ud83d\udc67',
	  'globe_with_meridians':'\ud83c\udf10',
	  'goal_net':'\ud83e\udd45',
	  'goat':'\ud83d\udc10',
	  'golf':'\u26f3\ufe0f',
	  'golfing_man':'\ud83c\udfcc\ufe0f',
	  'golfing_woman':'\ud83c\udfcc\ufe0f&zwj;\u2640\ufe0f',
	  'gorilla':'\ud83e\udd8d',
	  'grapes':'\ud83c\udf47',
	  'green_apple':'\ud83c\udf4f',
	  'green_book':'\ud83d\udcd7',
	  'green_heart':'\ud83d\udc9a',
	  'green_salad':'\ud83e\udd57',
	  'grey_exclamation':'\u2755',
	  'grey_question':'\u2754',
	  'grimacing':'\ud83d\ude2c',
	  'grin':'\ud83d\ude01',
	  'grinning':'\ud83d\ude00',
	  'guardsman':'\ud83d\udc82',
	  'guardswoman':'\ud83d\udc82&zwj;\u2640\ufe0f',
	  'guitar':'\ud83c\udfb8',
	  'gun':'\ud83d\udd2b',
	  'haircut_woman':'\ud83d\udc87',
	  'haircut_man':'\ud83d\udc87&zwj;\u2642\ufe0f',
	  'hamburger':'\ud83c\udf54',
	  'hammer':'\ud83d\udd28',
	  'hammer_and_pick':'\u2692',
	  'hammer_and_wrench':'\ud83d\udee0',
	  'hamster':'\ud83d\udc39',
	  'hand':'\u270b',
	  'handbag':'\ud83d\udc5c',
	  'handshake':'\ud83e\udd1d',
	  'hankey':'\ud83d\udca9',
	  'hatched_chick':'\ud83d\udc25',
	  'hatching_chick':'\ud83d\udc23',
	  'headphones':'\ud83c\udfa7',
	  'hear_no_evil':'\ud83d\ude49',
	  'heart':'\u2764\ufe0f',
	  'heart_decoration':'\ud83d\udc9f',
	  'heart_eyes':'\ud83d\ude0d',
	  'heart_eyes_cat':'\ud83d\ude3b',
	  'heartbeat':'\ud83d\udc93',
	  'heartpulse':'\ud83d\udc97',
	  'hearts':'\u2665\ufe0f',
	  'heavy_check_mark':'\u2714\ufe0f',
	  'heavy_division_sign':'\u2797',
	  'heavy_dollar_sign':'\ud83d\udcb2',
	  'heavy_heart_exclamation':'\u2763\ufe0f',
	  'heavy_minus_sign':'\u2796',
	  'heavy_multiplication_x':'\u2716\ufe0f',
	  'heavy_plus_sign':'\u2795',
	  'helicopter':'\ud83d\ude81',
	  'herb':'\ud83c\udf3f',
	  'hibiscus':'\ud83c\udf3a',
	  'high_brightness':'\ud83d\udd06',
	  'high_heel':'\ud83d\udc60',
	  'hocho':'\ud83d\udd2a',
	  'hole':'\ud83d\udd73',
	  'honey_pot':'\ud83c\udf6f',
	  'horse':'\ud83d\udc34',
	  'horse_racing':'\ud83c\udfc7',
	  'hospital':'\ud83c\udfe5',
	  'hot_pepper':'\ud83c\udf36',
	  'hotdog':'\ud83c\udf2d',
	  'hotel':'\ud83c\udfe8',
	  'hotsprings':'\u2668\ufe0f',
	  'hourglass':'\u231b\ufe0f',
	  'hourglass_flowing_sand':'\u23f3',
	  'house':'\ud83c\udfe0',
	  'house_with_garden':'\ud83c\udfe1',
	  'houses':'\ud83c\udfd8',
	  'hugs':'\ud83e\udd17',
	  'hushed':'\ud83d\ude2f',
	  'ice_cream':'\ud83c\udf68',
	  'ice_hockey':'\ud83c\udfd2',
	  'ice_skate':'\u26f8',
	  'icecream':'\ud83c\udf66',
	  'id':'\ud83c\udd94',
	  'ideograph_advantage':'\ud83c\ude50',
	  'imp':'\ud83d\udc7f',
	  'inbox_tray':'\ud83d\udce5',
	  'incoming_envelope':'\ud83d\udce8',
	  'tipping_hand_woman':'\ud83d\udc81',
	  'information_source':'\u2139\ufe0f',
	  'innocent':'\ud83d\ude07',
	  'interrobang':'\u2049\ufe0f',
	  'iphone':'\ud83d\udcf1',
	  'izakaya_lantern':'\ud83c\udfee',
	  'jack_o_lantern':'\ud83c\udf83',
	  'japan':'\ud83d\uddfe',
	  'japanese_castle':'\ud83c\udfef',
	  'japanese_goblin':'\ud83d\udc7a',
	  'japanese_ogre':'\ud83d\udc79',
	  'jeans':'\ud83d\udc56',
	  'joy':'\ud83d\ude02',
	  'joy_cat':'\ud83d\ude39',
	  'joystick':'\ud83d\udd79',
	  'kaaba':'\ud83d\udd4b',
	  'key':'\ud83d\udd11',
	  'keyboard':'\u2328\ufe0f',
	  'keycap_ten':'\ud83d\udd1f',
	  'kick_scooter':'\ud83d\udef4',
	  'kimono':'\ud83d\udc58',
	  'kiss':'\ud83d\udc8b',
	  'kissing':'\ud83d\ude17',
	  'kissing_cat':'\ud83d\ude3d',
	  'kissing_closed_eyes':'\ud83d\ude1a',
	  'kissing_heart':'\ud83d\ude18',
	  'kissing_smiling_eyes':'\ud83d\ude19',
	  'kiwi_fruit':'\ud83e\udd5d',
	  'koala':'\ud83d\udc28',
	  'koko':'\ud83c\ude01',
	  'label':'\ud83c\udff7',
	  'large_blue_circle':'\ud83d\udd35',
	  'large_blue_diamond':'\ud83d\udd37',
	  'large_orange_diamond':'\ud83d\udd36',
	  'last_quarter_moon':'\ud83c\udf17',
	  'last_quarter_moon_with_face':'\ud83c\udf1c',
	  'latin_cross':'\u271d\ufe0f',
	  'laughing':'\ud83d\ude06',
	  'leaves':'\ud83c\udf43',
	  'ledger':'\ud83d\udcd2',
	  'left_luggage':'\ud83d\udec5',
	  'left_right_arrow':'\u2194\ufe0f',
	  'leftwards_arrow_with_hook':'\u21a9\ufe0f',
	  'lemon':'\ud83c\udf4b',
	  'leo':'\u264c\ufe0f',
	  'leopard':'\ud83d\udc06',
	  'level_slider':'\ud83c\udf9a',
	  'libra':'\u264e\ufe0f',
	  'light_rail':'\ud83d\ude88',
	  'link':'\ud83d\udd17',
	  'lion':'\ud83e\udd81',
	  'lips':'\ud83d\udc44',
	  'lipstick':'\ud83d\udc84',
	  'lizard':'\ud83e\udd8e',
	  'lock':'\ud83d\udd12',
	  'lock_with_ink_pen':'\ud83d\udd0f',
	  'lollipop':'\ud83c\udf6d',
	  'loop':'\u27bf',
	  'loud_sound':'\ud83d\udd0a',
	  'loudspeaker':'\ud83d\udce2',
	  'love_hotel':'\ud83c\udfe9',
	  'love_letter':'\ud83d\udc8c',
	  'low_brightness':'\ud83d\udd05',
	  'lying_face':'\ud83e\udd25',
	  'm':'\u24c2\ufe0f',
	  'mag':'\ud83d\udd0d',
	  'mag_right':'\ud83d\udd0e',
	  'mahjong':'\ud83c\udc04\ufe0f',
	  'mailbox':'\ud83d\udceb',
	  'mailbox_closed':'\ud83d\udcea',
	  'mailbox_with_mail':'\ud83d\udcec',
	  'mailbox_with_no_mail':'\ud83d\udced',
	  'man':'\ud83d\udc68',
	  'man_artist':'\ud83d\udc68&zwj;\ud83c\udfa8',
	  'man_astronaut':'\ud83d\udc68&zwj;\ud83d\ude80',
	  'man_cartwheeling':'\ud83e\udd38&zwj;\u2642\ufe0f',
	  'man_cook':'\ud83d\udc68&zwj;\ud83c\udf73',
	  'man_dancing':'\ud83d\udd7a',
	  'man_facepalming':'\ud83e\udd26&zwj;\u2642\ufe0f',
	  'man_factory_worker':'\ud83d\udc68&zwj;\ud83c\udfed',
	  'man_farmer':'\ud83d\udc68&zwj;\ud83c\udf3e',
	  'man_firefighter':'\ud83d\udc68&zwj;\ud83d\ude92',
	  'man_health_worker':'\ud83d\udc68&zwj;\u2695\ufe0f',
	  'man_in_tuxedo':'\ud83e\udd35',
	  'man_judge':'\ud83d\udc68&zwj;\u2696\ufe0f',
	  'man_juggling':'\ud83e\udd39&zwj;\u2642\ufe0f',
	  'man_mechanic':'\ud83d\udc68&zwj;\ud83d\udd27',
	  'man_office_worker':'\ud83d\udc68&zwj;\ud83d\udcbc',
	  'man_pilot':'\ud83d\udc68&zwj;\u2708\ufe0f',
	  'man_playing_handball':'\ud83e\udd3e&zwj;\u2642\ufe0f',
	  'man_playing_water_polo':'\ud83e\udd3d&zwj;\u2642\ufe0f',
	  'man_scientist':'\ud83d\udc68&zwj;\ud83d\udd2c',
	  'man_shrugging':'\ud83e\udd37&zwj;\u2642\ufe0f',
	  'man_singer':'\ud83d\udc68&zwj;\ud83c\udfa4',
	  'man_student':'\ud83d\udc68&zwj;\ud83c\udf93',
	  'man_teacher':'\ud83d\udc68&zwj;\ud83c\udfeb',
	  'man_technologist':'\ud83d\udc68&zwj;\ud83d\udcbb',
	  'man_with_gua_pi_mao':'\ud83d\udc72',
	  'man_with_turban':'\ud83d\udc73',
	  'tangerine':'\ud83c\udf4a',
	  'mans_shoe':'\ud83d\udc5e',
	  'mantelpiece_clock':'\ud83d\udd70',
	  'maple_leaf':'\ud83c\udf41',
	  'martial_arts_uniform':'\ud83e\udd4b',
	  'mask':'\ud83d\ude37',
	  'massage_woman':'\ud83d\udc86',
	  'massage_man':'\ud83d\udc86&zwj;\u2642\ufe0f',
	  'meat_on_bone':'\ud83c\udf56',
	  'medal_military':'\ud83c\udf96',
	  'medal_sports':'\ud83c\udfc5',
	  'mega':'\ud83d\udce3',
	  'melon':'\ud83c\udf48',
	  'memo':'\ud83d\udcdd',
	  'men_wrestling':'\ud83e\udd3c&zwj;\u2642\ufe0f',
	  'menorah':'\ud83d\udd4e',
	  'mens':'\ud83d\udeb9',
	  'metal':'\ud83e\udd18',
	  'metro':'\ud83d\ude87',
	  'microphone':'\ud83c\udfa4',
	  'microscope':'\ud83d\udd2c',
	  'milk_glass':'\ud83e\udd5b',
	  'milky_way':'\ud83c\udf0c',
	  'minibus':'\ud83d\ude90',
	  'minidisc':'\ud83d\udcbd',
	  'mobile_phone_off':'\ud83d\udcf4',
	  'money_mouth_face':'\ud83e\udd11',
	  'money_with_wings':'\ud83d\udcb8',
	  'moneybag':'\ud83d\udcb0',
	  'monkey':'\ud83d\udc12',
	  'monkey_face':'\ud83d\udc35',
	  'monorail':'\ud83d\ude9d',
	  'moon':'\ud83c\udf14',
	  'mortar_board':'\ud83c\udf93',
	  'mosque':'\ud83d\udd4c',
	  'motor_boat':'\ud83d\udee5',
	  'motor_scooter':'\ud83d\udef5',
	  'motorcycle':'\ud83c\udfcd',
	  'motorway':'\ud83d\udee3',
	  'mount_fuji':'\ud83d\uddfb',
	  'mountain':'\u26f0',
	  'mountain_biking_man':'\ud83d\udeb5',
	  'mountain_biking_woman':'\ud83d\udeb5&zwj;\u2640\ufe0f',
	  'mountain_cableway':'\ud83d\udea0',
	  'mountain_railway':'\ud83d\ude9e',
	  'mountain_snow':'\ud83c\udfd4',
	  'mouse':'\ud83d\udc2d',
	  'mouse2':'\ud83d\udc01',
	  'movie_camera':'\ud83c\udfa5',
	  'moyai':'\ud83d\uddff',
	  'mrs_claus':'\ud83e\udd36',
	  'muscle':'\ud83d\udcaa',
	  'mushroom':'\ud83c\udf44',
	  'musical_keyboard':'\ud83c\udfb9',
	  'musical_note':'\ud83c\udfb5',
	  'musical_score':'\ud83c\udfbc',
	  'mute':'\ud83d\udd07',
	  'nail_care':'\ud83d\udc85',
	  'name_badge':'\ud83d\udcdb',
	  'national_park':'\ud83c\udfde',
	  'nauseated_face':'\ud83e\udd22',
	  'necktie':'\ud83d\udc54',
	  'negative_squared_cross_mark':'\u274e',
	  'nerd_face':'\ud83e\udd13',
	  'neutral_face':'\ud83d\ude10',
	  'new':'\ud83c\udd95',
	  'new_moon':'\ud83c\udf11',
	  'new_moon_with_face':'\ud83c\udf1a',
	  'newspaper':'\ud83d\udcf0',
	  'newspaper_roll':'\ud83d\uddde',
	  'next_track_button':'\u23ed',
	  'ng':'\ud83c\udd96',
	  'no_good_man':'\ud83d\ude45&zwj;\u2642\ufe0f',
	  'no_good_woman':'\ud83d\ude45',
	  'night_with_stars':'\ud83c\udf03',
	  'no_bell':'\ud83d\udd15',
	  'no_bicycles':'\ud83d\udeb3',
	  'no_entry':'\u26d4\ufe0f',
	  'no_entry_sign':'\ud83d\udeab',
	  'no_mobile_phones':'\ud83d\udcf5',
	  'no_mouth':'\ud83d\ude36',
	  'no_pedestrians':'\ud83d\udeb7',
	  'no_smoking':'\ud83d\udead',
	  'non-potable_water':'\ud83d\udeb1',
	  'nose':'\ud83d\udc43',
	  'notebook':'\ud83d\udcd3',
	  'notebook_with_decorative_cover':'\ud83d\udcd4',
	  'notes':'\ud83c\udfb6',
	  'nut_and_bolt':'\ud83d\udd29',
	  'o':'\u2b55\ufe0f',
	  'o2':'\ud83c\udd7e\ufe0f',
	  'ocean':'\ud83c\udf0a',
	  'octopus':'\ud83d\udc19',
	  'oden':'\ud83c\udf62',
	  'office':'\ud83c\udfe2',
	  'oil_drum':'\ud83d\udee2',
	  'ok':'\ud83c\udd97',
	  'ok_hand':'\ud83d\udc4c',
	  'ok_man':'\ud83d\ude46&zwj;\u2642\ufe0f',
	  'ok_woman':'\ud83d\ude46',
	  'old_key':'\ud83d\udddd',
	  'older_man':'\ud83d\udc74',
	  'older_woman':'\ud83d\udc75',
	  'om':'\ud83d\udd49',
	  'on':'\ud83d\udd1b',
	  'oncoming_automobile':'\ud83d\ude98',
	  'oncoming_bus':'\ud83d\ude8d',
	  'oncoming_police_car':'\ud83d\ude94',
	  'oncoming_taxi':'\ud83d\ude96',
	  'open_file_folder':'\ud83d\udcc2',
	  'open_hands':'\ud83d\udc50',
	  'open_mouth':'\ud83d\ude2e',
	  'open_umbrella':'\u2602\ufe0f',
	  'ophiuchus':'\u26ce',
	  'orange_book':'\ud83d\udcd9',
	  'orthodox_cross':'\u2626\ufe0f',
	  'outbox_tray':'\ud83d\udce4',
	  'owl':'\ud83e\udd89',
	  'ox':'\ud83d\udc02',
	  'package':'\ud83d\udce6',
	  'page_facing_up':'\ud83d\udcc4',
	  'page_with_curl':'\ud83d\udcc3',
	  'pager':'\ud83d\udcdf',
	  'paintbrush':'\ud83d\udd8c',
	  'palm_tree':'\ud83c\udf34',
	  'pancakes':'\ud83e\udd5e',
	  'panda_face':'\ud83d\udc3c',
	  'paperclip':'\ud83d\udcce',
	  'paperclips':'\ud83d\udd87',
	  'parasol_on_ground':'\u26f1',
	  'parking':'\ud83c\udd7f\ufe0f',
	  'part_alternation_mark':'\u303d\ufe0f',
	  'partly_sunny':'\u26c5\ufe0f',
	  'passenger_ship':'\ud83d\udef3',
	  'passport_control':'\ud83d\udec2',
	  'pause_button':'\u23f8',
	  'peace_symbol':'\u262e\ufe0f',
	  'peach':'\ud83c\udf51',
	  'peanuts':'\ud83e\udd5c',
	  'pear':'\ud83c\udf50',
	  'pen':'\ud83d\udd8a',
	  'pencil2':'\u270f\ufe0f',
	  'penguin':'\ud83d\udc27',
	  'pensive':'\ud83d\ude14',
	  'performing_arts':'\ud83c\udfad',
	  'persevere':'\ud83d\ude23',
	  'person_fencing':'\ud83e\udd3a',
	  'pouting_woman':'\ud83d\ude4e',
	  'phone':'\u260e\ufe0f',
	  'pick':'\u26cf',
	  'pig':'\ud83d\udc37',
	  'pig2':'\ud83d\udc16',
	  'pig_nose':'\ud83d\udc3d',
	  'pill':'\ud83d\udc8a',
	  'pineapple':'\ud83c\udf4d',
	  'ping_pong':'\ud83c\udfd3',
	  'pisces':'\u2653\ufe0f',
	  'pizza':'\ud83c\udf55',
	  'place_of_worship':'\ud83d\uded0',
	  'plate_with_cutlery':'\ud83c\udf7d',
	  'play_or_pause_button':'\u23ef',
	  'point_down':'\ud83d\udc47',
	  'point_left':'\ud83d\udc48',
	  'point_right':'\ud83d\udc49',
	  'point_up':'\u261d\ufe0f',
	  'point_up_2':'\ud83d\udc46',
	  'police_car':'\ud83d\ude93',
	  'policewoman':'\ud83d\udc6e&zwj;\u2640\ufe0f',
	  'poodle':'\ud83d\udc29',
	  'popcorn':'\ud83c\udf7f',
	  'post_office':'\ud83c\udfe3',
	  'postal_horn':'\ud83d\udcef',
	  'postbox':'\ud83d\udcee',
	  'potable_water':'\ud83d\udeb0',
	  'potato':'\ud83e\udd54',
	  'pouch':'\ud83d\udc5d',
	  'poultry_leg':'\ud83c\udf57',
	  'pound':'\ud83d\udcb7',
	  'rage':'\ud83d\ude21',
	  'pouting_cat':'\ud83d\ude3e',
	  'pouting_man':'\ud83d\ude4e&zwj;\u2642\ufe0f',
	  'pray':'\ud83d\ude4f',
	  'prayer_beads':'\ud83d\udcff',
	  'pregnant_woman':'\ud83e\udd30',
	  'previous_track_button':'\u23ee',
	  'prince':'\ud83e\udd34',
	  'princess':'\ud83d\udc78',
	  'printer':'\ud83d\udda8',
	  'purple_heart':'\ud83d\udc9c',
	  'purse':'\ud83d\udc5b',
	  'pushpin':'\ud83d\udccc',
	  'put_litter_in_its_place':'\ud83d\udeae',
	  'question':'\u2753',
	  'rabbit':'\ud83d\udc30',
	  'rabbit2':'\ud83d\udc07',
	  'racehorse':'\ud83d\udc0e',
	  'racing_car':'\ud83c\udfce',
	  'radio':'\ud83d\udcfb',
	  'radio_button':'\ud83d\udd18',
	  'radioactive':'\u2622\ufe0f',
	  'railway_car':'\ud83d\ude83',
	  'railway_track':'\ud83d\udee4',
	  'rainbow':'\ud83c\udf08',
	  'rainbow_flag':'\ud83c\udff3\ufe0f&zwj;\ud83c\udf08',
	  'raised_back_of_hand':'\ud83e\udd1a',
	  'raised_hand_with_fingers_splayed':'\ud83d\udd90',
	  'raised_hands':'\ud83d\ude4c',
	  'raising_hand_woman':'\ud83d\ude4b',
	  'raising_hand_man':'\ud83d\ude4b&zwj;\u2642\ufe0f',
	  'ram':'\ud83d\udc0f',
	  'ramen':'\ud83c\udf5c',
	  'rat':'\ud83d\udc00',
	  'record_button':'\u23fa',
	  'recycle':'\u267b\ufe0f',
	  'red_circle':'\ud83d\udd34',
	  'registered':'\u00ae\ufe0f',
	  'relaxed':'\u263a\ufe0f',
	  'relieved':'\ud83d\ude0c',
	  'reminder_ribbon':'\ud83c\udf97',
	  'repeat':'\ud83d\udd01',
	  'repeat_one':'\ud83d\udd02',
	  'rescue_worker_helmet':'\u26d1',
	  'restroom':'\ud83d\udebb',
	  'revolving_hearts':'\ud83d\udc9e',
	  'rewind':'\u23ea',
	  'rhinoceros':'\ud83e\udd8f',
	  'ribbon':'\ud83c\udf80',
	  'rice':'\ud83c\udf5a',
	  'rice_ball':'\ud83c\udf59',
	  'rice_cracker':'\ud83c\udf58',
	  'rice_scene':'\ud83c\udf91',
	  'right_anger_bubble':'\ud83d\uddef',
	  'ring':'\ud83d\udc8d',
	  'robot':'\ud83e\udd16',
	  'rocket':'\ud83d\ude80',
	  'rofl':'\ud83e\udd23',
	  'roll_eyes':'\ud83d\ude44',
	  'roller_coaster':'\ud83c\udfa2',
	  'rooster':'\ud83d\udc13',
	  'rose':'\ud83c\udf39',
	  'rosette':'\ud83c\udff5',
	  'rotating_light':'\ud83d\udea8',
	  'round_pushpin':'\ud83d\udccd',
	  'rowing_man':'\ud83d\udea3',
	  'rowing_woman':'\ud83d\udea3&zwj;\u2640\ufe0f',
	  'rugby_football':'\ud83c\udfc9',
	  'running_man':'\ud83c\udfc3',
	  'running_shirt_with_sash':'\ud83c\udfbd',
	  'running_woman':'\ud83c\udfc3&zwj;\u2640\ufe0f',
	  'sa':'\ud83c\ude02\ufe0f',
	  'sagittarius':'\u2650\ufe0f',
	  'sake':'\ud83c\udf76',
	  'sandal':'\ud83d\udc61',
	  'santa':'\ud83c\udf85',
	  'satellite':'\ud83d\udce1',
	  'saxophone':'\ud83c\udfb7',
	  'school':'\ud83c\udfeb',
	  'school_satchel':'\ud83c\udf92',
	  'scissors':'\u2702\ufe0f',
	  'scorpion':'\ud83e\udd82',
	  'scorpius':'\u264f\ufe0f',
	  'scream':'\ud83d\ude31',
	  'scream_cat':'\ud83d\ude40',
	  'scroll':'\ud83d\udcdc',
	  'seat':'\ud83d\udcba',
	  'secret':'\u3299\ufe0f',
	  'see_no_evil':'\ud83d\ude48',
	  'seedling':'\ud83c\udf31',
	  'selfie':'\ud83e\udd33',
	  'shallow_pan_of_food':'\ud83e\udd58',
	  'shamrock':'\u2618\ufe0f',
	  'shark':'\ud83e\udd88',
	  'shaved_ice':'\ud83c\udf67',
	  'sheep':'\ud83d\udc11',
	  'shell':'\ud83d\udc1a',
	  'shield':'\ud83d\udee1',
	  'shinto_shrine':'\u26e9',
	  'ship':'\ud83d\udea2',
	  'shirt':'\ud83d\udc55',
	  'shopping':'\ud83d\udecd',
	  'shopping_cart':'\ud83d\uded2',
	  'shower':'\ud83d\udebf',
	  'shrimp':'\ud83e\udd90',
	  'signal_strength':'\ud83d\udcf6',
	  'six_pointed_star':'\ud83d\udd2f',
	  'ski':'\ud83c\udfbf',
	  'skier':'\u26f7',
	  'skull':'\ud83d\udc80',
	  'skull_and_crossbones':'\u2620\ufe0f',
	  'sleeping':'\ud83d\ude34',
	  'sleeping_bed':'\ud83d\udecc',
	  'sleepy':'\ud83d\ude2a',
	  'slightly_frowning_face':'\ud83d\ude41',
	  'slightly_smiling_face':'\ud83d\ude42',
	  'slot_machine':'\ud83c\udfb0',
	  'small_airplane':'\ud83d\udee9',
	  'small_blue_diamond':'\ud83d\udd39',
	  'small_orange_diamond':'\ud83d\udd38',
	  'small_red_triangle':'\ud83d\udd3a',
	  'small_red_triangle_down':'\ud83d\udd3b',
	  'smile':'\ud83d\ude04',
	  'smile_cat':'\ud83d\ude38',
	  'smiley':'\ud83d\ude03',
	  'smiley_cat':'\ud83d\ude3a',
	  'smiling_imp':'\ud83d\ude08',
	  'smirk':'\ud83d\ude0f',
	  'smirk_cat':'\ud83d\ude3c',
	  'smoking':'\ud83d\udeac',
	  'snail':'\ud83d\udc0c',
	  'snake':'\ud83d\udc0d',
	  'sneezing_face':'\ud83e\udd27',
	  'snowboarder':'\ud83c\udfc2',
	  'snowflake':'\u2744\ufe0f',
	  'snowman':'\u26c4\ufe0f',
	  'snowman_with_snow':'\u2603\ufe0f',
	  'sob':'\ud83d\ude2d',
	  'soccer':'\u26bd\ufe0f',
	  'soon':'\ud83d\udd1c',
	  'sos':'\ud83c\udd98',
	  'sound':'\ud83d\udd09',
	  'space_invader':'\ud83d\udc7e',
	  'spades':'\u2660\ufe0f',
	  'spaghetti':'\ud83c\udf5d',
	  'sparkle':'\u2747\ufe0f',
	  'sparkler':'\ud83c\udf87',
	  'sparkles':'\u2728',
	  'sparkling_heart':'\ud83d\udc96',
	  'speak_no_evil':'\ud83d\ude4a',
	  'speaker':'\ud83d\udd08',
	  'speaking_head':'\ud83d\udde3',
	  'speech_balloon':'\ud83d\udcac',
	  'speedboat':'\ud83d\udea4',
	  'spider':'\ud83d\udd77',
	  'spider_web':'\ud83d\udd78',
	  'spiral_calendar':'\ud83d\uddd3',
	  'spiral_notepad':'\ud83d\uddd2',
	  'spoon':'\ud83e\udd44',
	  'squid':'\ud83e\udd91',
	  'stadium':'\ud83c\udfdf',
	  'star':'\u2b50\ufe0f',
	  'star2':'\ud83c\udf1f',
	  'star_and_crescent':'\u262a\ufe0f',
	  'star_of_david':'\u2721\ufe0f',
	  'stars':'\ud83c\udf20',
	  'station':'\ud83d\ude89',
	  'statue_of_liberty':'\ud83d\uddfd',
	  'steam_locomotive':'\ud83d\ude82',
	  'stew':'\ud83c\udf72',
	  'stop_button':'\u23f9',
	  'stop_sign':'\ud83d\uded1',
	  'stopwatch':'\u23f1',
	  'straight_ruler':'\ud83d\udccf',
	  'strawberry':'\ud83c\udf53',
	  'stuck_out_tongue':'\ud83d\ude1b',
	  'stuck_out_tongue_closed_eyes':'\ud83d\ude1d',
	  'stuck_out_tongue_winking_eye':'\ud83d\ude1c',
	  'studio_microphone':'\ud83c\udf99',
	  'stuffed_flatbread':'\ud83e\udd59',
	  'sun_behind_large_cloud':'\ud83c\udf25',
	  'sun_behind_rain_cloud':'\ud83c\udf26',
	  'sun_behind_small_cloud':'\ud83c\udf24',
	  'sun_with_face':'\ud83c\udf1e',
	  'sunflower':'\ud83c\udf3b',
	  'sunglasses':'\ud83d\ude0e',
	  'sunny':'\u2600\ufe0f',
	  'sunrise':'\ud83c\udf05',
	  'sunrise_over_mountains':'\ud83c\udf04',
	  'surfing_man':'\ud83c\udfc4',
	  'surfing_woman':'\ud83c\udfc4&zwj;\u2640\ufe0f',
	  'sushi':'\ud83c\udf63',
	  'suspension_railway':'\ud83d\ude9f',
	  'sweat':'\ud83d\ude13',
	  'sweat_drops':'\ud83d\udca6',
	  'sweat_smile':'\ud83d\ude05',
	  'sweet_potato':'\ud83c\udf60',
	  'swimming_man':'\ud83c\udfca',
	  'swimming_woman':'\ud83c\udfca&zwj;\u2640\ufe0f',
	  'symbols':'\ud83d\udd23',
	  'synagogue':'\ud83d\udd4d',
	  'syringe':'\ud83d\udc89',
	  'taco':'\ud83c\udf2e',
	  'tada':'\ud83c\udf89',
	  'tanabata_tree':'\ud83c\udf8b',
	  'taurus':'\u2649\ufe0f',
	  'taxi':'\ud83d\ude95',
	  'tea':'\ud83c\udf75',
	  'telephone_receiver':'\ud83d\udcde',
	  'telescope':'\ud83d\udd2d',
	  'tennis':'\ud83c\udfbe',
	  'tent':'\u26fa\ufe0f',
	  'thermometer':'\ud83c\udf21',
	  'thinking':'\ud83e\udd14',
	  'thought_balloon':'\ud83d\udcad',
	  'ticket':'\ud83c\udfab',
	  'tickets':'\ud83c\udf9f',
	  'tiger':'\ud83d\udc2f',
	  'tiger2':'\ud83d\udc05',
	  'timer_clock':'\u23f2',
	  'tipping_hand_man':'\ud83d\udc81&zwj;\u2642\ufe0f',
	  'tired_face':'\ud83d\ude2b',
	  'tm':'\u2122\ufe0f',
	  'toilet':'\ud83d\udebd',
	  'tokyo_tower':'\ud83d\uddfc',
	  'tomato':'\ud83c\udf45',
	  'tongue':'\ud83d\udc45',
	  'top':'\ud83d\udd1d',
	  'tophat':'\ud83c\udfa9',
	  'tornado':'\ud83c\udf2a',
	  'trackball':'\ud83d\uddb2',
	  'tractor':'\ud83d\ude9c',
	  'traffic_light':'\ud83d\udea5',
	  'train':'\ud83d\ude8b',
	  'train2':'\ud83d\ude86',
	  'tram':'\ud83d\ude8a',
	  'triangular_flag_on_post':'\ud83d\udea9',
	  'triangular_ruler':'\ud83d\udcd0',
	  'trident':'\ud83d\udd31',
	  'triumph':'\ud83d\ude24',
	  'trolleybus':'\ud83d\ude8e',
	  'trophy':'\ud83c\udfc6',
	  'tropical_drink':'\ud83c\udf79',
	  'tropical_fish':'\ud83d\udc20',
	  'truck':'\ud83d\ude9a',
	  'trumpet':'\ud83c\udfba',
	  'tulip':'\ud83c\udf37',
	  'tumbler_glass':'\ud83e\udd43',
	  'turkey':'\ud83e\udd83',
	  'turtle':'\ud83d\udc22',
	  'tv':'\ud83d\udcfa',
	  'twisted_rightwards_arrows':'\ud83d\udd00',
	  'two_hearts':'\ud83d\udc95',
	  'two_men_holding_hands':'\ud83d\udc6c',
	  'two_women_holding_hands':'\ud83d\udc6d',
	  'u5272':'\ud83c\ude39',
	  'u5408':'\ud83c\ude34',
	  'u55b6':'\ud83c\ude3a',
	  'u6307':'\ud83c\ude2f\ufe0f',
	  'u6708':'\ud83c\ude37\ufe0f',
	  'u6709':'\ud83c\ude36',
	  'u6e80':'\ud83c\ude35',
	  'u7121':'\ud83c\ude1a\ufe0f',
	  'u7533':'\ud83c\ude38',
	  'u7981':'\ud83c\ude32',
	  'u7a7a':'\ud83c\ude33',
	  'umbrella':'\u2614\ufe0f',
	  'unamused':'\ud83d\ude12',
	  'underage':'\ud83d\udd1e',
	  'unicorn':'\ud83e\udd84',
	  'unlock':'\ud83d\udd13',
	  'up':'\ud83c\udd99',
	  'upside_down_face':'\ud83d\ude43',
	  'v':'\u270c\ufe0f',
	  'vertical_traffic_light':'\ud83d\udea6',
	  'vhs':'\ud83d\udcfc',
	  'vibration_mode':'\ud83d\udcf3',
	  'video_camera':'\ud83d\udcf9',
	  'video_game':'\ud83c\udfae',
	  'violin':'\ud83c\udfbb',
	  'virgo':'\u264d\ufe0f',
	  'volcano':'\ud83c\udf0b',
	  'volleyball':'\ud83c\udfd0',
	  'vs':'\ud83c\udd9a',
	  'vulcan_salute':'\ud83d\udd96',
	  'walking_man':'\ud83d\udeb6',
	  'walking_woman':'\ud83d\udeb6&zwj;\u2640\ufe0f',
	  'waning_crescent_moon':'\ud83c\udf18',
	  'waning_gibbous_moon':'\ud83c\udf16',
	  'warning':'\u26a0\ufe0f',
	  'wastebasket':'\ud83d\uddd1',
	  'watch':'\u231a\ufe0f',
	  'water_buffalo':'\ud83d\udc03',
	  'watermelon':'\ud83c\udf49',
	  'wave':'\ud83d\udc4b',
	  'wavy_dash':'\u3030\ufe0f',
	  'waxing_crescent_moon':'\ud83c\udf12',
	  'wc':'\ud83d\udebe',
	  'weary':'\ud83d\ude29',
	  'wedding':'\ud83d\udc92',
	  'weight_lifting_man':'\ud83c\udfcb\ufe0f',
	  'weight_lifting_woman':'\ud83c\udfcb\ufe0f&zwj;\u2640\ufe0f',
	  'whale':'\ud83d\udc33',
	  'whale2':'\ud83d\udc0b',
	  'wheel_of_dharma':'\u2638\ufe0f',
	  'wheelchair':'\u267f\ufe0f',
	  'white_check_mark':'\u2705',
	  'white_circle':'\u26aa\ufe0f',
	  'white_flag':'\ud83c\udff3\ufe0f',
	  'white_flower':'\ud83d\udcae',
	  'white_large_square':'\u2b1c\ufe0f',
	  'white_medium_small_square':'\u25fd\ufe0f',
	  'white_medium_square':'\u25fb\ufe0f',
	  'white_small_square':'\u25ab\ufe0f',
	  'white_square_button':'\ud83d\udd33',
	  'wilted_flower':'\ud83e\udd40',
	  'wind_chime':'\ud83c\udf90',
	  'wind_face':'\ud83c\udf2c',
	  'wine_glass':'\ud83c\udf77',
	  'wink':'\ud83d\ude09',
	  'wolf':'\ud83d\udc3a',
	  'woman':'\ud83d\udc69',
	  'woman_artist':'\ud83d\udc69&zwj;\ud83c\udfa8',
	  'woman_astronaut':'\ud83d\udc69&zwj;\ud83d\ude80',
	  'woman_cartwheeling':'\ud83e\udd38&zwj;\u2640\ufe0f',
	  'woman_cook':'\ud83d\udc69&zwj;\ud83c\udf73',
	  'woman_facepalming':'\ud83e\udd26&zwj;\u2640\ufe0f',
	  'woman_factory_worker':'\ud83d\udc69&zwj;\ud83c\udfed',
	  'woman_farmer':'\ud83d\udc69&zwj;\ud83c\udf3e',
	  'woman_firefighter':'\ud83d\udc69&zwj;\ud83d\ude92',
	  'woman_health_worker':'\ud83d\udc69&zwj;\u2695\ufe0f',
	  'woman_judge':'\ud83d\udc69&zwj;\u2696\ufe0f',
	  'woman_juggling':'\ud83e\udd39&zwj;\u2640\ufe0f',
	  'woman_mechanic':'\ud83d\udc69&zwj;\ud83d\udd27',
	  'woman_office_worker':'\ud83d\udc69&zwj;\ud83d\udcbc',
	  'woman_pilot':'\ud83d\udc69&zwj;\u2708\ufe0f',
	  'woman_playing_handball':'\ud83e\udd3e&zwj;\u2640\ufe0f',
	  'woman_playing_water_polo':'\ud83e\udd3d&zwj;\u2640\ufe0f',
	  'woman_scientist':'\ud83d\udc69&zwj;\ud83d\udd2c',
	  'woman_shrugging':'\ud83e\udd37&zwj;\u2640\ufe0f',
	  'woman_singer':'\ud83d\udc69&zwj;\ud83c\udfa4',
	  'woman_student':'\ud83d\udc69&zwj;\ud83c\udf93',
	  'woman_teacher':'\ud83d\udc69&zwj;\ud83c\udfeb',
	  'woman_technologist':'\ud83d\udc69&zwj;\ud83d\udcbb',
	  'woman_with_turban':'\ud83d\udc73&zwj;\u2640\ufe0f',
	  'womans_clothes':'\ud83d\udc5a',
	  'womans_hat':'\ud83d\udc52',
	  'women_wrestling':'\ud83e\udd3c&zwj;\u2640\ufe0f',
	  'womens':'\ud83d\udeba',
	  'world_map':'\ud83d\uddfa',
	  'worried':'\ud83d\ude1f',
	  'wrench':'\ud83d\udd27',
	  'writing_hand':'\u270d\ufe0f',
	  'x':'\u274c',
	  'yellow_heart':'\ud83d\udc9b',
	  'yen':'\ud83d\udcb4',
	  'yin_yang':'\u262f\ufe0f',
	  'yum':'\ud83d\ude0b',
	  'zap':'\u26a1\ufe0f',
	  'zipper_mouth_face':'\ud83e\udd10',
	  'zzz':'\ud83d\udca4',

	  /* special emojis :P */
	  'octocat':  '<img alt=":octocat:" height="20" width="20" align="absmiddle" src="https://assets-cdn.github.com/images/icons/emoji/octocat.png">',
	  'showdown': '<span style="font-family: \'Anonymous Pro\', monospace; text-decoration: underline; text-decoration-style: dashed; text-decoration-color: #3e8b8a;text-underline-position: under;">S</span>'
	};

	/**
	 * Created by Estevao on 31-05-2015.
	 */

	/**
	 * Showdown Converter class
	 * @class
	 * @param {object} [converterOptions]
	 * @returns {Converter}
	 */
	showdown.Converter = function (converterOptions) {

	  var
	      /**
	       * Options used by this converter
	       * @private
	       * @type {{}}
	       */
	      options = {},

	      /**
	       * Language extensions used by this converter
	       * @private
	       * @type {Array}
	       */
	      langExtensions = [],

	      /**
	       * Output modifiers extensions used by this converter
	       * @private
	       * @type {Array}
	       */
	      outputModifiers = [],

	      /**
	       * Event listeners
	       * @private
	       * @type {{}}
	       */
	      listeners = {},

	      /**
	       * The flavor set in this converter
	       */
	      setConvFlavor = setFlavor,

	    /**
	     * Metadata of the document
	     * @type {{parsed: {}, raw: string, format: string}}
	     */
	      metadata = {
	        parsed: {},
	        raw: '',
	        format: ''
	      };

	  _constructor();

	  /**
	   * Converter constructor
	   * @private
	   */
	  function _constructor () {
	    converterOptions = converterOptions || {};

	    for (var gOpt in globalOptions) {
	      if (globalOptions.hasOwnProperty(gOpt)) {
	        options[gOpt] = globalOptions[gOpt];
	      }
	    }

	    // Merge options
	    if (typeof converterOptions === 'object') {
	      for (var opt in converterOptions) {
	        if (converterOptions.hasOwnProperty(opt)) {
	          options[opt] = converterOptions[opt];
	        }
	      }
	    } else {
	      throw Error('Converter expects the passed parameter to be an object, but ' + typeof converterOptions +
	      ' was passed instead.');
	    }

	    if (options.extensions) {
	      showdown.helper.forEach(options.extensions, _parseExtension);
	    }
	  }

	  /**
	   * Parse extension
	   * @param {*} ext
	   * @param {string} [name='']
	   * @private
	   */
	  function _parseExtension (ext, name) {

	    name = name || null;
	    // If it's a string, the extension was previously loaded
	    if (showdown.helper.isString(ext)) {
	      ext = showdown.helper.stdExtName(ext);
	      name = ext;

	      // LEGACY_SUPPORT CODE
	      if (showdown.extensions[ext]) {
	        console.warn('DEPRECATION WARNING: ' + ext + ' is an old extension that uses a deprecated loading method.' +
	          'Please inform the developer that the extension should be updated!');
	        legacyExtensionLoading(showdown.extensions[ext], ext);
	        return;
	      // END LEGACY SUPPORT CODE

	      } else if (!showdown.helper.isUndefined(extensions[ext])) {
	        ext = extensions[ext];

	      } else {
	        throw Error('Extension "' + ext + '" could not be loaded. It was either not found or is not a valid extension.');
	      }
	    }

	    if (typeof ext === 'function') {
	      ext = ext();
	    }

	    if (!showdown.helper.isArray(ext)) {
	      ext = [ext];
	    }

	    var validExt = validate(ext, name);
	    if (!validExt.valid) {
	      throw Error(validExt.error);
	    }

	    for (var i = 0; i < ext.length; ++i) {
	      switch (ext[i].type) {

	        case 'lang':
	          langExtensions.push(ext[i]);
	          break;

	        case 'output':
	          outputModifiers.push(ext[i]);
	          break;
	      }
	      if (ext[i].hasOwnProperty('listeners')) {
	        for (var ln in ext[i].listeners) {
	          if (ext[i].listeners.hasOwnProperty(ln)) {
	            listen(ln, ext[i].listeners[ln]);
	          }
	        }
	      }
	    }

	  }

	  /**
	   * LEGACY_SUPPORT
	   * @param {*} ext
	   * @param {string} name
	   */
	  function legacyExtensionLoading (ext, name) {
	    if (typeof ext === 'function') {
	      ext = ext(new showdown.Converter());
	    }
	    if (!showdown.helper.isArray(ext)) {
	      ext = [ext];
	    }
	    var valid = validate(ext, name);

	    if (!valid.valid) {
	      throw Error(valid.error);
	    }

	    for (var i = 0; i < ext.length; ++i) {
	      switch (ext[i].type) {
	        case 'lang':
	          langExtensions.push(ext[i]);
	          break;
	        case 'output':
	          outputModifiers.push(ext[i]);
	          break;
	        default:// should never reach here
	          throw Error('Extension loader error: Type unrecognized!!!');
	      }
	    }
	  }

	  /**
	   * Listen to an event
	   * @param {string} name
	   * @param {function} callback
	   */
	  function listen (name, callback) {
	    if (!showdown.helper.isString(name)) {
	      throw Error('Invalid argument in converter.listen() method: name must be a string, but ' + typeof name + ' given');
	    }

	    if (typeof callback !== 'function') {
	      throw Error('Invalid argument in converter.listen() method: callback must be a function, but ' + typeof callback + ' given');
	    }

	    if (!listeners.hasOwnProperty(name)) {
	      listeners[name] = [];
	    }
	    listeners[name].push(callback);
	  }

	  function rTrimInputText (text) {
	    var rsp = text.match(/^\s*/)[0].length,
	        rgx = new RegExp('^\\s{0,' + rsp + '}', 'gm');
	    return text.replace(rgx, '');
	  }

	  /**
	   * Dispatch an event
	   * @private
	   * @param {string} evtName Event name
	   * @param {string} text Text
	   * @param {{}} options Converter Options
	   * @param {{}} globals
	   * @returns {string}
	   */
	  this._dispatch = function dispatch (evtName, text, options, globals) {
	    if (listeners.hasOwnProperty(evtName)) {
	      for (var ei = 0; ei < listeners[evtName].length; ++ei) {
	        var nText = listeners[evtName][ei](evtName, text, this, options, globals);
	        if (nText && typeof nText !== 'undefined') {
	          text = nText;
	        }
	      }
	    }
	    return text;
	  };

	  /**
	   * Listen to an event
	   * @param {string} name
	   * @param {function} callback
	   * @returns {showdown.Converter}
	   */
	  this.listen = function (name, callback) {
	    listen(name, callback);
	    return this;
	  };

	  /**
	   * Converts a markdown string into HTML
	   * @param {string} text
	   * @returns {*}
	   */
	  this.makeHtml = function (text) {
	    //check if text is not falsy
	    if (!text) {
	      return text;
	    }

	    var globals = {
	      gHtmlBlocks:     [],
	      gHtmlMdBlocks:   [],
	      gHtmlSpans:      [],
	      gUrls:           {},
	      gTitles:         {},
	      gDimensions:     {},
	      gListLevel:      0,
	      hashLinkCounts:  {},
	      langExtensions:  langExtensions,
	      outputModifiers: outputModifiers,
	      converter:       this,
	      ghCodeBlocks:    [],
	      metadata: {
	        parsed: {},
	        raw: '',
	        format: ''
	      }
	    };

	    // This lets us use ¨ trema as an escape char to avoid md5 hashes
	    // The choice of character is arbitrary; anything that isn't
	    // magic in Markdown will work.
	    text = text.replace(/¨/g, '¨T');

	    // Replace $ with ¨D
	    // RegExp interprets $ as a special character
	    // when it's in a replacement string
	    text = text.replace(/\$/g, '¨D');

	    // Standardize line endings
	    text = text.replace(/\r\n/g, '\n'); // DOS to Unix
	    text = text.replace(/\r/g, '\n'); // Mac to Unix

	    // Stardardize line spaces
	    text = text.replace(/\u00A0/g, '&nbsp;');

	    if (options.smartIndentationFix) {
	      text = rTrimInputText(text);
	    }

	    // Make sure text begins and ends with a couple of newlines:
	    text = '\n\n' + text + '\n\n';

	    // detab
	    text = showdown.subParser('detab')(text, options, globals);

	    /**
	     * Strip any lines consisting only of spaces and tabs.
	     * This makes subsequent regexs easier to write, because we can
	     * match consecutive blank lines with /\n+/ instead of something
	     * contorted like /[ \t]*\n+/
	     */
	    text = text.replace(/^[ \t]+$/mg, '');

	    //run languageExtensions
	    showdown.helper.forEach(langExtensions, function (ext) {
	      text = showdown.subParser('runExtension')(ext, text, options, globals);
	    });

	    // run the sub parsers
	    text = showdown.subParser('metadata')(text, options, globals);
	    text = showdown.subParser('hashPreCodeTags')(text, options, globals);
	    text = showdown.subParser('githubCodeBlocks')(text, options, globals);
	    text = showdown.subParser('hashHTMLBlocks')(text, options, globals);
	    text = showdown.subParser('hashCodeTags')(text, options, globals);
	    text = showdown.subParser('stripLinkDefinitions')(text, options, globals);
	    text = showdown.subParser('blockGamut')(text, options, globals);
	    text = showdown.subParser('unhashHTMLSpans')(text, options, globals);
	    text = showdown.subParser('unescapeSpecialChars')(text, options, globals);

	    // attacklab: Restore dollar signs
	    text = text.replace(/¨D/g, '$$');

	    // attacklab: Restore tremas
	    text = text.replace(/¨T/g, '¨');

	    // render a complete html document instead of a partial if the option is enabled
	    text = showdown.subParser('completeHTMLDocument')(text, options, globals);

	    // Run output modifiers
	    showdown.helper.forEach(outputModifiers, function (ext) {
	      text = showdown.subParser('runExtension')(ext, text, options, globals);
	    });

	    // update metadata
	    metadata = globals.metadata;
	    return text;
	  };

	  /**
	   * Converts an HTML string into a markdown string
	   * @param src
	   * @param [HTMLParser] A WHATWG DOM and HTML parser, such as JSDOM. If none is supplied, window.document will be used.
	   * @returns {string}
	   */
	  this.makeMarkdown = this.makeMd = function (src, HTMLParser) {

	    // replace \r\n with \n
	    src = src.replace(/\r\n/g, '\n');
	    src = src.replace(/\r/g, '\n'); // old macs

	    // due to an edge case, we need to find this: > <
	    // to prevent removing of non silent white spaces
	    // ex: <em>this is</em> <strong>sparta</strong>
	    src = src.replace(/>[ \t]+</, '>¨NBSP;<');

	    if (!HTMLParser) {
	      if (window && window.document) {
	        HTMLParser = window.document;
	      } else {
	        throw new Error('HTMLParser is undefined. If in a webworker or nodejs environment, you need to provide a WHATWG DOM and HTML such as JSDOM');
	      }
	    }

	    var doc = HTMLParser.createElement('div');
	    doc.innerHTML = src;

	    var globals = {
	      preList: substitutePreCodeTags(doc)
	    };

	    // remove all newlines and collapse spaces
	    clean(doc);

	    // some stuff, like accidental reference links must now be escaped
	    // TODO
	    // doc.innerHTML = doc.innerHTML.replace(/\[[\S\t ]]/);

	    var nodes = doc.childNodes,
	        mdDoc = '';

	    for (var i = 0; i < nodes.length; i++) {
	      mdDoc += showdown.subParser('makeMarkdown.node')(nodes[i], globals);
	    }

	    function clean (node) {
	      for (var n = 0; n < node.childNodes.length; ++n) {
	        var child = node.childNodes[n];
	        if (child.nodeType === 3) {
	          if (!/\S/.test(child.nodeValue)) {
	            node.removeChild(child);
	            --n;
	          } else {
	            child.nodeValue = child.nodeValue.split('\n').join(' ');
	            child.nodeValue = child.nodeValue.replace(/(\s)+/g, '$1');
	          }
	        } else if (child.nodeType === 1) {
	          clean(child);
	        }
	      }
	    }

	    // find all pre tags and replace contents with placeholder
	    // we need this so that we can remove all indentation from html
	    // to ease up parsing
	    function substitutePreCodeTags (doc) {

	      var pres = doc.querySelectorAll('pre'),
	          presPH = [];

	      for (var i = 0; i < pres.length; ++i) {

	        if (pres[i].childElementCount === 1 && pres[i].firstChild.tagName.toLowerCase() === 'code') {
	          var content = pres[i].firstChild.innerHTML.trim(),
	              language = pres[i].firstChild.getAttribute('data-language') || '';

	          // if data-language attribute is not defined, then we look for class language-*
	          if (language === '') {
	            var classes = pres[i].firstChild.className.split(' ');
	            for (var c = 0; c < classes.length; ++c) {
	              var matches = classes[c].match(/^language-(.+)$/);
	              if (matches !== null) {
	                language = matches[1];
	                break;
	              }
	            }
	          }

	          // unescape html entities in content
	          content = showdown.helper.unescapeHTMLEntities(content);

	          presPH.push(content);
	          pres[i].outerHTML = '<precode language="' + language + '" precodenum="' + i.toString() + '"></precode>';
	        } else {
	          presPH.push(pres[i].innerHTML);
	          pres[i].innerHTML = '';
	          pres[i].setAttribute('prenum', i.toString());
	        }
	      }
	      return presPH;
	    }

	    return mdDoc;
	  };

	  /**
	   * Set an option of this Converter instance
	   * @param {string} key
	   * @param {*} value
	   */
	  this.setOption = function (key, value) {
	    options[key] = value;
	  };

	  /**
	   * Get the option of this Converter instance
	   * @param {string} key
	   * @returns {*}
	   */
	  this.getOption = function (key) {
	    return options[key];
	  };

	  /**
	   * Get the options of this Converter instance
	   * @returns {{}}
	   */
	  this.getOptions = function () {
	    return options;
	  };

	  /**
	   * Add extension to THIS converter
	   * @param {{}} extension
	   * @param {string} [name=null]
	   */
	  this.addExtension = function (extension, name) {
	    name = name || null;
	    _parseExtension(extension, name);
	  };

	  /**
	   * Use a global registered extension with THIS converter
	   * @param {string} extensionName Name of the previously registered extension
	   */
	  this.useExtension = function (extensionName) {
	    _parseExtension(extensionName);
	  };

	  /**
	   * Set the flavor THIS converter should use
	   * @param {string} name
	   */
	  this.setFlavor = function (name) {
	    if (!flavor.hasOwnProperty(name)) {
	      throw Error(name + ' flavor was not found');
	    }
	    var preset = flavor[name];
	    setConvFlavor = name;
	    for (var option in preset) {
	      if (preset.hasOwnProperty(option)) {
	        options[option] = preset[option];
	      }
	    }
	  };

	  /**
	   * Get the currently set flavor of this converter
	   * @returns {string}
	   */
	  this.getFlavor = function () {
	    return setConvFlavor;
	  };

	  /**
	   * Remove an extension from THIS converter.
	   * Note: This is a costly operation. It's better to initialize a new converter
	   * and specify the extensions you wish to use
	   * @param {Array} extension
	   */
	  this.removeExtension = function (extension) {
	    if (!showdown.helper.isArray(extension)) {
	      extension = [extension];
	    }
	    for (var a = 0; a < extension.length; ++a) {
	      var ext = extension[a];
	      for (var i = 0; i < langExtensions.length; ++i) {
	        if (langExtensions[i] === ext) {
	          langExtensions[i].splice(i, 1);
	        }
	      }
	      for (var ii = 0; ii < outputModifiers.length; ++i) {
	        if (outputModifiers[ii] === ext) {
	          outputModifiers[ii].splice(i, 1);
	        }
	      }
	    }
	  };

	  /**
	   * Get all extension of THIS converter
	   * @returns {{language: Array, output: Array}}
	   */
	  this.getAllExtensions = function () {
	    return {
	      language: langExtensions,
	      output: outputModifiers
	    };
	  };

	  /**
	   * Get the metadata of the previously parsed document
	   * @param raw
	   * @returns {string|{}}
	   */
	  this.getMetadata = function (raw) {
	    if (raw) {
	      return metadata.raw;
	    } else {
	      return metadata.parsed;
	    }
	  };

	  /**
	   * Get the metadata format of the previously parsed document
	   * @returns {string}
	   */
	  this.getMetadataFormat = function () {
	    return metadata.format;
	  };

	  /**
	   * Private: set a single key, value metadata pair
	   * @param {string} key
	   * @param {string} value
	   */
	  this._setMetadataPair = function (key, value) {
	    metadata.parsed[key] = value;
	  };

	  /**
	   * Private: set metadata format
	   * @param {string} format
	   */
	  this._setMetadataFormat = function (format) {
	    metadata.format = format;
	  };

	  /**
	   * Private: set metadata raw text
	   * @param {string} raw
	   */
	  this._setMetadataRaw = function (raw) {
	    metadata.raw = raw;
	  };
	};

	/**
	 * Turn Markdown link shortcuts into XHTML <a> tags.
	 */
	showdown.subParser('anchors', function (text, options, globals) {

	  text = globals.converter._dispatch('anchors.before', text, options, globals);

	  var writeAnchorTag = function (wholeMatch, linkText, linkId, url, m5, m6, title) {
	    if (showdown.helper.isUndefined(title)) {
	      title = '';
	    }
	    linkId = linkId.toLowerCase();

	    // Special case for explicit empty url
	    if (wholeMatch.search(/\(<?\s*>? ?(['"].*['"])?\)$/m) > -1) {
	      url = '';
	    } else if (!url) {
	      if (!linkId) {
	        // lower-case and turn embedded newlines into spaces
	        linkId = linkText.toLowerCase().replace(/ ?\n/g, ' ');
	      }
	      url = '#' + linkId;

	      if (!showdown.helper.isUndefined(globals.gUrls[linkId])) {
	        url = globals.gUrls[linkId];
	        if (!showdown.helper.isUndefined(globals.gTitles[linkId])) {
	          title = globals.gTitles[linkId];
	        }
	      } else {
	        return wholeMatch;
	      }
	    }

	    //url = showdown.helper.escapeCharacters(url, '*_', false); // replaced line to improve performance
	    url = url.replace(showdown.helper.regexes.asteriskDashAndColon, showdown.helper.escapeCharactersCallback);

	    var result = '<a href="' + url + '"';

	    if (title !== '' && title !== null) {
	      title = title.replace(/"/g, '&quot;');
	      //title = showdown.helper.escapeCharacters(title, '*_', false); // replaced line to improve performance
	      title = title.replace(showdown.helper.regexes.asteriskDashAndColon, showdown.helper.escapeCharactersCallback);
	      result += ' title="' + title + '"';
	    }

	    // optionLinksInNewWindow only applies
	    // to external links. Hash links (#) open in same page
	    if (options.openLinksInNewWindow && !/^#/.test(url)) {
	      // escaped _
	      result += ' target="¨E95Eblank"';
	    }

	    result += '>' + linkText + '</a>';

	    return result;
	  };

	  // First, handle reference-style links: [link text] [id]
	  text = text.replace(/\[((?:\[[^\]]*]|[^\[\]])*)] ?(?:\n *)?\[(.*?)]()()()()/g, writeAnchorTag);

	  // Next, inline-style links: [link text](url "optional title")
	  // cases with crazy urls like ./image/cat1).png
	  text = text.replace(/\[((?:\[[^\]]*]|[^\[\]])*)]()[ \t]*\([ \t]?<([^>]*)>(?:[ \t]*((["'])([^"]*?)\5))?[ \t]?\)/g,
	    writeAnchorTag);

	  // normal cases
	  text = text.replace(/\[((?:\[[^\]]*]|[^\[\]])*)]()[ \t]*\([ \t]?<?([\S]+?(?:\([\S]*?\)[\S]*?)?)>?(?:[ \t]*((["'])([^"]*?)\5))?[ \t]?\)/g,
	                      writeAnchorTag);

	  // handle reference-style shortcuts: [link text]
	  // These must come last in case you've also got [link test][1]
	  // or [link test](/foo)
	  text = text.replace(/\[([^\[\]]+)]()()()()()/g, writeAnchorTag);

	  // Lastly handle GithubMentions if option is enabled
	  if (options.ghMentions) {
	    text = text.replace(/(^|\s)(\\)?(@([a-z\d]+(?:[a-z\d.-]+?[a-z\d]+)*))/gmi, function (wm, st, escape, mentions, username) {
	      if (escape === '\\') {
	        return st + mentions;
	      }

	      //check if options.ghMentionsLink is a string
	      if (!showdown.helper.isString(options.ghMentionsLink)) {
	        throw new Error('ghMentionsLink option must be a string');
	      }
	      var lnk = options.ghMentionsLink.replace(/\{u}/g, username),
	          target = '';
	      if (options.openLinksInNewWindow) {
	        target = ' target="¨E95Eblank"';
	      }
	      return st + '<a href="' + lnk + '"' + target + '>' + mentions + '</a>';
	    });
	  }

	  text = globals.converter._dispatch('anchors.after', text, options, globals);
	  return text;
	});

	// url allowed chars [a-z\d_.~:/?#[]@!$&'()*+,;=-]

	var simpleURLRegex  = /([*~_]+|\b)(((https?|ftp|dict):\/\/|www\.)[^'">\s]+?\.[^'">\s]+?)()(\1)?(?=\s|$)(?!["<>])/gi,
	    simpleURLRegex2 = /([*~_]+|\b)(((https?|ftp|dict):\/\/|www\.)[^'">\s]+\.[^'">\s]+?)([.!?,()\[\]])?(\1)?(?=\s|$)(?!["<>])/gi,
	    delimUrlRegex   = /()<(((https?|ftp|dict):\/\/|www\.)[^'">\s]+)()>()/gi,
	    simpleMailRegex = /(^|\s)(?:mailto:)?([A-Za-z0-9!#$%&'*+-/=?^_`{|}~.]+@[-a-z0-9]+(\.[-a-z0-9]+)*\.[a-z]+)(?=$|\s)/gmi,
	    delimMailRegex  = /<()(?:mailto:)?([-.\w]+@[-a-z0-9]+(\.[-a-z0-9]+)*\.[a-z]+)>/gi,

	    replaceLink = function (options) {
	      return function (wm, leadingMagicChars, link, m2, m3, trailingPunctuation, trailingMagicChars) {
	        link = link.replace(showdown.helper.regexes.asteriskDashAndColon, showdown.helper.escapeCharactersCallback);
	        var lnkTxt = link,
	            append = '',
	            target = '',
	            lmc    = leadingMagicChars || '',
	            tmc    = trailingMagicChars || '';
	        if (/^www\./i.test(link)) {
	          link = link.replace(/^www\./i, 'http://www.');
	        }
	        if (options.excludeTrailingPunctuationFromURLs && trailingPunctuation) {
	          append = trailingPunctuation;
	        }
	        if (options.openLinksInNewWindow) {
	          target = ' target="¨E95Eblank"';
	        }
	        return lmc + '<a href="' + link + '"' + target + '>' + lnkTxt + '</a>' + append + tmc;
	      };
	    },

	    replaceMail = function (options, globals) {
	      return function (wholeMatch, b, mail) {
	        var href = 'mailto:';
	        b = b || '';
	        mail = showdown.subParser('unescapeSpecialChars')(mail, options, globals);
	        if (options.encodeEmails) {
	          href = showdown.helper.encodeEmailAddress(href + mail);
	          mail = showdown.helper.encodeEmailAddress(mail);
	        } else {
	          href = href + mail;
	        }
	        return b + '<a href="' + href + '">' + mail + '</a>';
	      };
	    };

	showdown.subParser('autoLinks', function (text, options, globals) {

	  text = globals.converter._dispatch('autoLinks.before', text, options, globals);

	  text = text.replace(delimUrlRegex, replaceLink(options));
	  text = text.replace(delimMailRegex, replaceMail(options, globals));

	  text = globals.converter._dispatch('autoLinks.after', text, options, globals);

	  return text;
	});

	showdown.subParser('simplifiedAutoLinks', function (text, options, globals) {

	  if (!options.simplifiedAutoLink) {
	    return text;
	  }

	  text = globals.converter._dispatch('simplifiedAutoLinks.before', text, options, globals);

	  if (options.excludeTrailingPunctuationFromURLs) {
	    text = text.replace(simpleURLRegex2, replaceLink(options));
	  } else {
	    text = text.replace(simpleURLRegex, replaceLink(options));
	  }
	  text = text.replace(simpleMailRegex, replaceMail(options, globals));

	  text = globals.converter._dispatch('simplifiedAutoLinks.after', text, options, globals);

	  return text;
	});

	/**
	 * These are all the transformations that form block-level
	 * tags like paragraphs, headers, and list items.
	 */
	showdown.subParser('blockGamut', function (text, options, globals) {

	  text = globals.converter._dispatch('blockGamut.before', text, options, globals);

	  // we parse blockquotes first so that we can have headings and hrs
	  // inside blockquotes
	  text = showdown.subParser('blockQuotes')(text, options, globals);
	  text = showdown.subParser('headers')(text, options, globals);

	  // Do Horizontal Rules:
	  text = showdown.subParser('horizontalRule')(text, options, globals);

	  text = showdown.subParser('lists')(text, options, globals);
	  text = showdown.subParser('codeBlocks')(text, options, globals);
	  text = showdown.subParser('tables')(text, options, globals);

	  // We already ran _HashHTMLBlocks() before, in Markdown(), but that
	  // was to escape raw HTML in the original Markdown source. This time,
	  // we're escaping the markup we've just created, so that we don't wrap
	  // <p> tags around block-level tags.
	  text = showdown.subParser('hashHTMLBlocks')(text, options, globals);
	  text = showdown.subParser('paragraphs')(text, options, globals);

	  text = globals.converter._dispatch('blockGamut.after', text, options, globals);

	  return text;
	});

	showdown.subParser('blockQuotes', function (text, options, globals) {

	  text = globals.converter._dispatch('blockQuotes.before', text, options, globals);

	  // add a couple extra lines after the text and endtext mark
	  text = text + '\n\n';

	  var rgx = /(^ {0,3}>[ \t]?.+\n(.+\n)*\n*)+/gm;

	  if (options.splitAdjacentBlockquotes) {
	    rgx = /^ {0,3}>[\s\S]*?(?:\n\n)/gm;
	  }

	  text = text.replace(rgx, function (bq) {
	    // attacklab: hack around Konqueror 3.5.4 bug:
	    // "----------bug".replace(/^-/g,"") == "bug"
	    bq = bq.replace(/^[ \t]*>[ \t]?/gm, ''); // trim one level of quoting

	    // attacklab: clean up hack
	    bq = bq.replace(/¨0/g, '');

	    bq = bq.replace(/^[ \t]+$/gm, ''); // trim whitespace-only lines
	    bq = showdown.subParser('githubCodeBlocks')(bq, options, globals);
	    bq = showdown.subParser('blockGamut')(bq, options, globals); // recurse

	    bq = bq.replace(/(^|\n)/g, '$1  ');
	    // These leading spaces screw with <pre> content, so we need to fix that:
	    bq = bq.replace(/(\s*<pre>[^\r]+?<\/pre>)/gm, function (wholeMatch, m1) {
	      var pre = m1;
	      // attacklab: hack around Konqueror 3.5.4 bug:
	      pre = pre.replace(/^  /mg, '¨0');
	      pre = pre.replace(/¨0/g, '');
	      return pre;
	    });

	    return showdown.subParser('hashBlock')('<blockquote>\n' + bq + '\n</blockquote>', options, globals);
	  });

	  text = globals.converter._dispatch('blockQuotes.after', text, options, globals);
	  return text;
	});

	/**
	 * Process Markdown `<pre><code>` blocks.
	 */
	showdown.subParser('codeBlocks', function (text, options, globals) {

	  text = globals.converter._dispatch('codeBlocks.before', text, options, globals);

	  // sentinel workarounds for lack of \A and \Z, safari\khtml bug
	  text += '¨0';

	  var pattern = /(?:\n\n|^)((?:(?:[ ]{4}|\t).*\n+)+)(\n*[ ]{0,3}[^ \t\n]|(?=¨0))/g;
	  text = text.replace(pattern, function (wholeMatch, m1, m2) {
	    var codeblock = m1,
	        nextChar = m2,
	        end = '\n';

	    codeblock = showdown.subParser('outdent')(codeblock, options, globals);
	    codeblock = showdown.subParser('encodeCode')(codeblock, options, globals);
	    codeblock = showdown.subParser('detab')(codeblock, options, globals);
	    codeblock = codeblock.replace(/^\n+/g, ''); // trim leading newlines
	    codeblock = codeblock.replace(/\n+$/g, ''); // trim trailing newlines

	    if (options.omitExtraWLInCodeBlocks) {
	      end = '';
	    }

	    codeblock = '<pre><code>' + codeblock + end + '</code></pre>';

	    return showdown.subParser('hashBlock')(codeblock, options, globals) + nextChar;
	  });

	  // strip sentinel
	  text = text.replace(/¨0/, '');

	  text = globals.converter._dispatch('codeBlocks.after', text, options, globals);
	  return text;
	});

	/**
	 *
	 *   *  Backtick quotes are used for <code></code> spans.
	 *
	 *   *  You can use multiple backticks as the delimiters if you want to
	 *     include literal backticks in the code span. So, this input:
	 *
	 *         Just type ``foo `bar` baz`` at the prompt.
	 *
	 *       Will translate to:
	 *
	 *         <p>Just type <code>foo `bar` baz</code> at the prompt.</p>
	 *
	 *    There's no arbitrary limit to the number of backticks you
	 *    can use as delimters. If you need three consecutive backticks
	 *    in your code, use four for delimiters, etc.
	 *
	 *  *  You can use spaces to get literal backticks at the edges:
	 *
	 *         ... type `` `bar` `` ...
	 *
	 *       Turns to:
	 *
	 *         ... type <code>`bar`</code> ...
	 */
	showdown.subParser('codeSpans', function (text, options, globals) {

	  text = globals.converter._dispatch('codeSpans.before', text, options, globals);

	  if (typeof(text) === 'undefined') {
	    text = '';
	  }
	  text = text.replace(/(^|[^\\])(`+)([^\r]*?[^`])\2(?!`)/gm,
	    function (wholeMatch, m1, m2, m3) {
	      var c = m3;
	      c = c.replace(/^([ \t]*)/g, '');	// leading whitespace
	      c = c.replace(/[ \t]*$/g, '');	// trailing whitespace
	      c = showdown.subParser('encodeCode')(c, options, globals);
	      c = m1 + '<code>' + c + '</code>';
	      c = showdown.subParser('hashHTMLSpans')(c, options, globals);
	      return c;
	    }
	  );

	  text = globals.converter._dispatch('codeSpans.after', text, options, globals);
	  return text;
	});

	/**
	 * Create a full HTML document from the processed markdown
	 */
	showdown.subParser('completeHTMLDocument', function (text, options, globals) {

	  if (!options.completeHTMLDocument) {
	    return text;
	  }

	  text = globals.converter._dispatch('completeHTMLDocument.before', text, options, globals);

	  var doctype = 'html',
	      doctypeParsed = '<!DOCTYPE HTML>\n',
	      title = '',
	      charset = '<meta charset="utf-8">\n',
	      lang = '',
	      metadata = '';

	  if (typeof globals.metadata.parsed.doctype !== 'undefined') {
	    doctypeParsed = '<!DOCTYPE ' +  globals.metadata.parsed.doctype + '>\n';
	    doctype = globals.metadata.parsed.doctype.toString().toLowerCase();
	    if (doctype === 'html' || doctype === 'html5') {
	      charset = '<meta charset="utf-8">';
	    }
	  }

	  for (var meta in globals.metadata.parsed) {
	    if (globals.metadata.parsed.hasOwnProperty(meta)) {
	      switch (meta.toLowerCase()) {
	        case 'doctype':
	          break;

	        case 'title':
	          title = '<title>' +  globals.metadata.parsed.title + '</title>\n';
	          break;

	        case 'charset':
	          if (doctype === 'html' || doctype === 'html5') {
	            charset = '<meta charset="' + globals.metadata.parsed.charset + '">\n';
	          } else {
	            charset = '<meta name="charset" content="' + globals.metadata.parsed.charset + '">\n';
	          }
	          break;

	        case 'language':
	        case 'lang':
	          lang = ' lang="' + globals.metadata.parsed[meta] + '"';
	          metadata += '<meta name="' + meta + '" content="' + globals.metadata.parsed[meta] + '">\n';
	          break;

	        default:
	          metadata += '<meta name="' + meta + '" content="' + globals.metadata.parsed[meta] + '">\n';
	      }
	    }
	  }

	  text = doctypeParsed + '<html' + lang + '>\n<head>\n' + title + charset + metadata + '</head>\n<body>\n' + text.trim() + '\n</body>\n</html>';

	  text = globals.converter._dispatch('completeHTMLDocument.after', text, options, globals);
	  return text;
	});

	/**
	 * Convert all tabs to spaces
	 */
	showdown.subParser('detab', function (text, options, globals) {
	  text = globals.converter._dispatch('detab.before', text, options, globals);

	  // expand first n-1 tabs
	  text = text.replace(/\t(?=\t)/g, '    '); // g_tab_width

	  // replace the nth with two sentinels
	  text = text.replace(/\t/g, '¨A¨B');

	  // use the sentinel to anchor our regex so it doesn't explode
	  text = text.replace(/¨B(.+?)¨A/g, function (wholeMatch, m1) {
	    var leadingText = m1,
	        numSpaces = 4 - leadingText.length % 4;  // g_tab_width

	    // there *must* be a better way to do this:
	    for (var i = 0; i < numSpaces; i++) {
	      leadingText += ' ';
	    }

	    return leadingText;
	  });

	  // clean up sentinels
	  text = text.replace(/¨A/g, '    ');  // g_tab_width
	  text = text.replace(/¨B/g, '');

	  text = globals.converter._dispatch('detab.after', text, options, globals);
	  return text;
	});

	showdown.subParser('ellipsis', function (text, options, globals) {

	  text = globals.converter._dispatch('ellipsis.before', text, options, globals);

	  text = text.replace(/\.\.\./g, '…');

	  text = globals.converter._dispatch('ellipsis.after', text, options, globals);

	  return text;
	});

	/**
	 * Turn emoji codes into emojis
	 *
	 * List of supported emojis: https://github.com/showdownjs/showdown/wiki/Emojis
	 */
	showdown.subParser('emoji', function (text, options, globals) {

	  if (!options.emoji) {
	    return text;
	  }

	  text = globals.converter._dispatch('emoji.before', text, options, globals);

	  var emojiRgx = /:([\S]+?):/g;

	  text = text.replace(emojiRgx, function (wm, emojiCode) {
	    if (showdown.helper.emojis.hasOwnProperty(emojiCode)) {
	      return showdown.helper.emojis[emojiCode];
	    }
	    return wm;
	  });

	  text = globals.converter._dispatch('emoji.after', text, options, globals);

	  return text;
	});

	/**
	 * Smart processing for ampersands and angle brackets that need to be encoded.
	 */
	showdown.subParser('encodeAmpsAndAngles', function (text, options, globals) {
	  text = globals.converter._dispatch('encodeAmpsAndAngles.before', text, options, globals);

	  // Ampersand-encoding based entirely on Nat Irons's Amputator MT plugin:
	  // http://bumppo.net/projects/amputator/
	  text = text.replace(/&(?!#?[xX]?(?:[0-9a-fA-F]+|\w+);)/g, '&amp;');

	  // Encode naked <'s
	  text = text.replace(/<(?![a-z\/?$!])/gi, '&lt;');

	  // Encode <
	  text = text.replace(/</g, '&lt;');

	  // Encode >
	  text = text.replace(/>/g, '&gt;');

	  text = globals.converter._dispatch('encodeAmpsAndAngles.after', text, options, globals);
	  return text;
	});

	/**
	 * Returns the string, with after processing the following backslash escape sequences.
	 *
	 * attacklab: The polite way to do this is with the new escapeCharacters() function:
	 *
	 *    text = escapeCharacters(text,"\\",true);
	 *    text = escapeCharacters(text,"`*_{}[]()>#+-.!",true);
	 *
	 * ...but we're sidestepping its use of the (slow) RegExp constructor
	 * as an optimization for Firefox.  This function gets called a LOT.
	 */
	showdown.subParser('encodeBackslashEscapes', function (text, options, globals) {
	  text = globals.converter._dispatch('encodeBackslashEscapes.before', text, options, globals);

	  text = text.replace(/\\(\\)/g, showdown.helper.escapeCharactersCallback);
	  text = text.replace(/\\([`*_{}\[\]()>#+.!~=|-])/g, showdown.helper.escapeCharactersCallback);

	  text = globals.converter._dispatch('encodeBackslashEscapes.after', text, options, globals);
	  return text;
	});

	/**
	 * Encode/escape certain characters inside Markdown code runs.
	 * The point is that in code, these characters are literals,
	 * and lose their special Markdown meanings.
	 */
	showdown.subParser('encodeCode', function (text, options, globals) {

	  text = globals.converter._dispatch('encodeCode.before', text, options, globals);

	  // Encode all ampersands; HTML entities are not
	  // entities within a Markdown code span.
	  text = text
	    .replace(/&/g, '&amp;')
	  // Do the angle bracket song and dance:
	    .replace(/</g, '&lt;')
	    .replace(/>/g, '&gt;')
	  // Now, escape characters that are magic in Markdown:
	    .replace(/([*_{}\[\]\\=~-])/g, showdown.helper.escapeCharactersCallback);

	  text = globals.converter._dispatch('encodeCode.after', text, options, globals);
	  return text;
	});

	/**
	 * Within tags -- meaning between < and > -- encode [\ ` * _ ~ =] so they
	 * don't conflict with their use in Markdown for code, italics and strong.
	 */
	showdown.subParser('escapeSpecialCharsWithinTagAttributes', function (text, options, globals) {
	  text = globals.converter._dispatch('escapeSpecialCharsWithinTagAttributes.before', text, options, globals);

	  // Build a regex to find HTML tags.
	  var tags     = /<\/?[a-z\d_:-]+(?:[\s]+[\s\S]+?)?>/gi,
	      comments = /<!(--(?:(?:[^>-]|-[^>])(?:[^-]|-[^-])*)--)>/gi;

	  text = text.replace(tags, function (wholeMatch) {
	    return wholeMatch
	      .replace(/(.)<\/?code>(?=.)/g, '$1`')
	      .replace(/([\\`*_~=|])/g, showdown.helper.escapeCharactersCallback);
	  });

	  text = text.replace(comments, function (wholeMatch) {
	    return wholeMatch
	      .replace(/([\\`*_~=|])/g, showdown.helper.escapeCharactersCallback);
	  });

	  text = globals.converter._dispatch('escapeSpecialCharsWithinTagAttributes.after', text, options, globals);
	  return text;
	});

	/**
	 * Handle github codeblocks prior to running HashHTML so that
	 * HTML contained within the codeblock gets escaped properly
	 * Example:
	 * ```ruby
	 *     def hello_world(x)
	 *       puts "Hello, #{x}"
	 *     end
	 * ```
	 */
	showdown.subParser('githubCodeBlocks', function (text, options, globals) {

	  // early exit if option is not enabled
	  if (!options.ghCodeBlocks) {
	    return text;
	  }

	  text = globals.converter._dispatch('githubCodeBlocks.before', text, options, globals);

	  text += '¨0';

	  text = text.replace(/(?:^|\n)(?: {0,3})(```+|~~~+)(?: *)([^\s`~]*)\n([\s\S]*?)\n(?: {0,3})\1/g, function (wholeMatch, delim, language, codeblock) {
	    var end = (options.omitExtraWLInCodeBlocks) ? '' : '\n';

	    // First parse the github code block
	    codeblock = showdown.subParser('encodeCode')(codeblock, options, globals);
	    codeblock = showdown.subParser('detab')(codeblock, options, globals);
	    codeblock = codeblock.replace(/^\n+/g, ''); // trim leading newlines
	    codeblock = codeblock.replace(/\n+$/g, ''); // trim trailing whitespace

	    codeblock = '<pre><code' + (language ? ' class="' + language + ' language-' + language + '"' : '') + '>' + codeblock + end + '</code></pre>';

	    codeblock = showdown.subParser('hashBlock')(codeblock, options, globals);

	    // Since GHCodeblocks can be false positives, we need to
	    // store the primitive text and the parsed text in a global var,
	    // and then return a token
	    return '\n\n¨G' + (globals.ghCodeBlocks.push({text: wholeMatch, codeblock: codeblock}) - 1) + 'G\n\n';
	  });

	  // attacklab: strip sentinel
	  text = text.replace(/¨0/, '');

	  return globals.converter._dispatch('githubCodeBlocks.after', text, options, globals);
	});

	showdown.subParser('hashBlock', function (text, options, globals) {
	  text = globals.converter._dispatch('hashBlock.before', text, options, globals);
	  text = text.replace(/(^\n+|\n+$)/g, '');
	  text = '\n\n¨K' + (globals.gHtmlBlocks.push(text) - 1) + 'K\n\n';
	  text = globals.converter._dispatch('hashBlock.after', text, options, globals);
	  return text;
	});

	/**
	 * Hash and escape <code> elements that should not be parsed as markdown
	 */
	showdown.subParser('hashCodeTags', function (text, options, globals) {
	  text = globals.converter._dispatch('hashCodeTags.before', text, options, globals);

	  var repFunc = function (wholeMatch, match, left, right) {
	    var codeblock = left + showdown.subParser('encodeCode')(match, options, globals) + right;
	    return '¨C' + (globals.gHtmlSpans.push(codeblock) - 1) + 'C';
	  };

	  // Hash naked <code>
	  text = showdown.helper.replaceRecursiveRegExp(text, repFunc, '<code\\b[^>]*>', '</code>', 'gim');

	  text = globals.converter._dispatch('hashCodeTags.after', text, options, globals);
	  return text;
	});

	showdown.subParser('hashElement', function (text, options, globals) {

	  return function (wholeMatch, m1) {
	    var blockText = m1;

	    // Undo double lines
	    blockText = blockText.replace(/\n\n/g, '\n');
	    blockText = blockText.replace(/^\n/, '');

	    // strip trailing blank lines
	    blockText = blockText.replace(/\n+$/g, '');

	    // Replace the element text with a marker ("¨KxK" where x is its key)
	    blockText = '\n\n¨K' + (globals.gHtmlBlocks.push(blockText) - 1) + 'K\n\n';

	    return blockText;
	  };
	});

	showdown.subParser('hashHTMLBlocks', function (text, options, globals) {
	  text = globals.converter._dispatch('hashHTMLBlocks.before', text, options, globals);

	  var blockTags = [
	        'pre',
	        'div',
	        'h1',
	        'h2',
	        'h3',
	        'h4',
	        'h5',
	        'h6',
	        'blockquote',
	        'table',
	        'dl',
	        'ol',
	        'ul',
	        'script',
	        'noscript',
	        'form',
	        'fieldset',
	        'iframe',
	        'math',
	        'style',
	        'section',
	        'header',
	        'footer',
	        'nav',
	        'article',
	        'aside',
	        'address',
	        'audio',
	        'canvas',
	        'figure',
	        'hgroup',
	        'output',
	        'video',
	        'p'
	      ],
	      repFunc = function (wholeMatch, match, left, right) {
	        var txt = wholeMatch;
	        // check if this html element is marked as markdown
	        // if so, it's contents should be parsed as markdown
	        if (left.search(/\bmarkdown\b/) !== -1) {
	          txt = left + globals.converter.makeHtml(match) + right;
	        }
	        return '\n\n¨K' + (globals.gHtmlBlocks.push(txt) - 1) + 'K\n\n';
	      };

	  if (options.backslashEscapesHTMLTags) {
	    // encode backslash escaped HTML tags
	    text = text.replace(/\\<(\/?[^>]+?)>/g, function (wm, inside) {
	      return '&lt;' + inside + '&gt;';
	    });
	  }

	  // hash HTML Blocks
	  for (var i = 0; i < blockTags.length; ++i) {

	    var opTagPos,
	        rgx1     = new RegExp('^ {0,3}(<' + blockTags[i] + '\\b[^>]*>)', 'im'),
	        patLeft  = '<' + blockTags[i] + '\\b[^>]*>',
	        patRight = '</' + blockTags[i] + '>';
	    // 1. Look for the first position of the first opening HTML tag in the text
	    while ((opTagPos = showdown.helper.regexIndexOf(text, rgx1)) !== -1) {

	      // if the HTML tag is \ escaped, we need to escape it and break


	      //2. Split the text in that position
	      var subTexts = showdown.helper.splitAtIndex(text, opTagPos),
	      //3. Match recursively
	          newSubText1 = showdown.helper.replaceRecursiveRegExp(subTexts[1], repFunc, patLeft, patRight, 'im');

	      // prevent an infinite loop
	      if (newSubText1 === subTexts[1]) {
	        break;
	      }
	      text = subTexts[0].concat(newSubText1);
	    }
	  }
	  // HR SPECIAL CASE
	  text = text.replace(/(\n {0,3}(<(hr)\b([^<>])*?\/?>)[ \t]*(?=\n{2,}))/g,
	    showdown.subParser('hashElement')(text, options, globals));

	  // Special case for standalone HTML comments
	  text = showdown.helper.replaceRecursiveRegExp(text, function (txt) {
	    return '\n\n¨K' + (globals.gHtmlBlocks.push(txt) - 1) + 'K\n\n';
	  }, '^ {0,3}<!--', '-->', 'gm');

	  // PHP and ASP-style processor instructions (<?...?> and <%...%>)
	  text = text.replace(/(?:\n\n)( {0,3}(?:<([?%])[^\r]*?\2>)[ \t]*(?=\n{2,}))/g,
	    showdown.subParser('hashElement')(text, options, globals));

	  text = globals.converter._dispatch('hashHTMLBlocks.after', text, options, globals);
	  return text;
	});

	/**
	 * Hash span elements that should not be parsed as markdown
	 */
	showdown.subParser('hashHTMLSpans', function (text, options, globals) {
	  text = globals.converter._dispatch('hashHTMLSpans.before', text, options, globals);

	  function hashHTMLSpan (html) {
	    return '¨C' + (globals.gHtmlSpans.push(html) - 1) + 'C';
	  }

	  // Hash Self Closing tags
	  text = text.replace(/<[^>]+?\/>/gi, function (wm) {
	    return hashHTMLSpan(wm);
	  });

	  // Hash tags without properties
	  text = text.replace(/<([^>]+?)>[\s\S]*?<\/\1>/g, function (wm) {
	    return hashHTMLSpan(wm);
	  });

	  // Hash tags with properties
	  text = text.replace(/<([^>]+?)\s[^>]+?>[\s\S]*?<\/\1>/g, function (wm) {
	    return hashHTMLSpan(wm);
	  });

	  // Hash self closing tags without />
	  text = text.replace(/<[^>]+?>/gi, function (wm) {
	    return hashHTMLSpan(wm);
	  });

	  /*showdown.helper.matchRecursiveRegExp(text, '<code\\b[^>]*>', '</code>', 'gi');*/

	  text = globals.converter._dispatch('hashHTMLSpans.after', text, options, globals);
	  return text;
	});

	/**
	 * Unhash HTML spans
	 */
	showdown.subParser('unhashHTMLSpans', function (text, options, globals) {
	  text = globals.converter._dispatch('unhashHTMLSpans.before', text, options, globals);

	  for (var i = 0; i < globals.gHtmlSpans.length; ++i) {
	    var repText = globals.gHtmlSpans[i],
	        // limiter to prevent infinite loop (assume 10 as limit for recurse)
	        limit = 0;

	    while (/¨C(\d+)C/.test(repText)) {
	      var num = RegExp.$1;
	      repText = repText.replace('¨C' + num + 'C', globals.gHtmlSpans[num]);
	      if (limit === 10) {
	        console.error('maximum nesting of 10 spans reached!!!');
	        break;
	      }
	      ++limit;
	    }
	    text = text.replace('¨C' + i + 'C', repText);
	  }

	  text = globals.converter._dispatch('unhashHTMLSpans.after', text, options, globals);
	  return text;
	});

	/**
	 * Hash and escape <pre><code> elements that should not be parsed as markdown
	 */
	showdown.subParser('hashPreCodeTags', function (text, options, globals) {
	  text = globals.converter._dispatch('hashPreCodeTags.before', text, options, globals);

	  var repFunc = function (wholeMatch, match, left, right) {
	    // encode html entities
	    var codeblock = left + showdown.subParser('encodeCode')(match, options, globals) + right;
	    return '\n\n¨G' + (globals.ghCodeBlocks.push({text: wholeMatch, codeblock: codeblock}) - 1) + 'G\n\n';
	  };

	  // Hash <pre><code>
	  text = showdown.helper.replaceRecursiveRegExp(text, repFunc, '^ {0,3}<pre\\b[^>]*>\\s*<code\\b[^>]*>', '^ {0,3}</code>\\s*</pre>', 'gim');

	  text = globals.converter._dispatch('hashPreCodeTags.after', text, options, globals);
	  return text;
	});

	showdown.subParser('headers', function (text, options, globals) {

	  text = globals.converter._dispatch('headers.before', text, options, globals);

	  var headerLevelStart = (isNaN(parseInt(options.headerLevelStart))) ? 1 : parseInt(options.headerLevelStart),

	  // Set text-style headers:
	  //	Header 1
	  //	========
	  //
	  //	Header 2
	  //	--------
	  //
	      setextRegexH1 = (options.smoothLivePreview) ? /^(.+)[ \t]*\n={2,}[ \t]*\n+/gm : /^(.+)[ \t]*\n=+[ \t]*\n+/gm,
	      setextRegexH2 = (options.smoothLivePreview) ? /^(.+)[ \t]*\n-{2,}[ \t]*\n+/gm : /^(.+)[ \t]*\n-+[ \t]*\n+/gm;

	  text = text.replace(setextRegexH1, function (wholeMatch, m1) {

	    var spanGamut = showdown.subParser('spanGamut')(m1, options, globals),
	        hID = (options.noHeaderId) ? '' : ' id="' + headerId(m1) + '"',
	        hLevel = headerLevelStart,
	        hashBlock = '<h' + hLevel + hID + '>' + spanGamut + '</h' + hLevel + '>';
	    return showdown.subParser('hashBlock')(hashBlock, options, globals);
	  });

	  text = text.replace(setextRegexH2, function (matchFound, m1) {
	    var spanGamut = showdown.subParser('spanGamut')(m1, options, globals),
	        hID = (options.noHeaderId) ? '' : ' id="' + headerId(m1) + '"',
	        hLevel = headerLevelStart + 1,
	        hashBlock = '<h' + hLevel + hID + '>' + spanGamut + '</h' + hLevel + '>';
	    return showdown.subParser('hashBlock')(hashBlock, options, globals);
	  });

	  // atx-style headers:
	  //  # Header 1
	  //  ## Header 2
	  //  ## Header 2 with closing hashes ##
	  //  ...
	  //  ###### Header 6
	  //
	  var atxStyle = (options.requireSpaceBeforeHeadingText) ? /^(#{1,6})[ \t]+(.+?)[ \t]*#*\n+/gm : /^(#{1,6})[ \t]*(.+?)[ \t]*#*\n+/gm;

	  text = text.replace(atxStyle, function (wholeMatch, m1, m2) {
	    var hText = m2;
	    if (options.customizedHeaderId) {
	      hText = m2.replace(/\s?\{([^{]+?)}\s*$/, '');
	    }

	    var span = showdown.subParser('spanGamut')(hText, options, globals),
	        hID = (options.noHeaderId) ? '' : ' id="' + headerId(m2) + '"',
	        hLevel = headerLevelStart - 1 + m1.length,
	        header = '<h' + hLevel + hID + '>' + span + '</h' + hLevel + '>';

	    return showdown.subParser('hashBlock')(header, options, globals);
	  });

	  function headerId (m) {
	    var title,
	        prefix;

	    // It is separate from other options to allow combining prefix and customized
	    if (options.customizedHeaderId) {
	      var match = m.match(/\{([^{]+?)}\s*$/);
	      if (match && match[1]) {
	        m = match[1];
	      }
	    }

	    title = m;

	    // Prefix id to prevent causing inadvertent pre-existing style matches.
	    if (showdown.helper.isString(options.prefixHeaderId)) {
	      prefix = options.prefixHeaderId;
	    } else if (options.prefixHeaderId === true) {
	      prefix = 'section-';
	    } else {
	      prefix = '';
	    }

	    if (!options.rawPrefixHeaderId) {
	      title = prefix + title;
	    }

	    if (options.ghCompatibleHeaderId) {
	      title = title
	        .replace(/ /g, '-')
	        // replace previously escaped chars (&, ¨ and $)
	        .replace(/&amp;/g, '')
	        .replace(/¨T/g, '')
	        .replace(/¨D/g, '')
	        // replace rest of the chars (&~$ are repeated as they might have been escaped)
	        // borrowed from github's redcarpet (some they should produce similar results)
	        .replace(/[&+$,\/:;=?@"#{}|^¨~\[\]`\\*)(%.!'<>]/g, '')
	        .toLowerCase();
	    } else if (options.rawHeaderId) {
	      title = title
	        .replace(/ /g, '-')
	        // replace previously escaped chars (&, ¨ and $)
	        .replace(/&amp;/g, '&')
	        .replace(/¨T/g, '¨')
	        .replace(/¨D/g, '$')
	        // replace " and '
	        .replace(/["']/g, '-')
	        .toLowerCase();
	    } else {
	      title = title
	        .replace(/[^\w]/g, '')
	        .toLowerCase();
	    }

	    if (options.rawPrefixHeaderId) {
	      title = prefix + title;
	    }

	    if (globals.hashLinkCounts[title]) {
	      title = title + '-' + (globals.hashLinkCounts[title]++);
	    } else {
	      globals.hashLinkCounts[title] = 1;
	    }
	    return title;
	  }

	  text = globals.converter._dispatch('headers.after', text, options, globals);
	  return text;
	});

	/**
	 * Turn Markdown link shortcuts into XHTML <a> tags.
	 */
	showdown.subParser('horizontalRule', function (text, options, globals) {
	  text = globals.converter._dispatch('horizontalRule.before', text, options, globals);

	  var key = showdown.subParser('hashBlock')('<hr />', options, globals);
	  text = text.replace(/^ {0,2}( ?-){3,}[ \t]*$/gm, key);
	  text = text.replace(/^ {0,2}( ?\*){3,}[ \t]*$/gm, key);
	  text = text.replace(/^ {0,2}( ?_){3,}[ \t]*$/gm, key);

	  text = globals.converter._dispatch('horizontalRule.after', text, options, globals);
	  return text;
	});

	/**
	 * Turn Markdown image shortcuts into <img> tags.
	 */
	showdown.subParser('images', function (text, options, globals) {

	  text = globals.converter._dispatch('images.before', text, options, globals);

	  var inlineRegExp      = /!\[([^\]]*?)][ \t]*()\([ \t]?<?([\S]+?(?:\([\S]*?\)[\S]*?)?)>?(?: =([*\d]+[A-Za-z%]{0,4})x([*\d]+[A-Za-z%]{0,4}))?[ \t]*(?:(["'])([^"]*?)\6)?[ \t]?\)/g,
	      crazyRegExp       = /!\[([^\]]*?)][ \t]*()\([ \t]?<([^>]*)>(?: =([*\d]+[A-Za-z%]{0,4})x([*\d]+[A-Za-z%]{0,4}))?[ \t]*(?:(?:(["'])([^"]*?)\6))?[ \t]?\)/g,
	      base64RegExp      = /!\[([^\]]*?)][ \t]*()\([ \t]?<?(data:.+?\/.+?;base64,[A-Za-z0-9+/=\n]+?)>?(?: =([*\d]+[A-Za-z%]{0,4})x([*\d]+[A-Za-z%]{0,4}))?[ \t]*(?:(["'])([^"]*?)\6)?[ \t]?\)/g,
	      referenceRegExp   = /!\[([^\]]*?)] ?(?:\n *)?\[([\s\S]*?)]()()()()()/g,
	      refShortcutRegExp = /!\[([^\[\]]+)]()()()()()/g;

	  function writeImageTagBase64 (wholeMatch, altText, linkId, url, width, height, m5, title) {
	    url = url.replace(/\s/g, '');
	    return writeImageTag (wholeMatch, altText, linkId, url, width, height, m5, title);
	  }

	  function writeImageTag (wholeMatch, altText, linkId, url, width, height, m5, title) {

	    var gUrls   = globals.gUrls,
	        gTitles = globals.gTitles,
	        gDims   = globals.gDimensions;

	    linkId = linkId.toLowerCase();

	    if (!title) {
	      title = '';
	    }
	    // Special case for explicit empty url
	    if (wholeMatch.search(/\(<?\s*>? ?(['"].*['"])?\)$/m) > -1) {
	      url = '';

	    } else if (url === '' || url === null) {
	      if (linkId === '' || linkId === null) {
	        // lower-case and turn embedded newlines into spaces
	        linkId = altText.toLowerCase().replace(/ ?\n/g, ' ');
	      }
	      url = '#' + linkId;

	      if (!showdown.helper.isUndefined(gUrls[linkId])) {
	        url = gUrls[linkId];
	        if (!showdown.helper.isUndefined(gTitles[linkId])) {
	          title = gTitles[linkId];
	        }
	        if (!showdown.helper.isUndefined(gDims[linkId])) {
	          width = gDims[linkId].width;
	          height = gDims[linkId].height;
	        }
	      } else {
	        return wholeMatch;
	      }
	    }

	    altText = altText
	      .replace(/"/g, '&quot;')
	    //altText = showdown.helper.escapeCharacters(altText, '*_', false);
	      .replace(showdown.helper.regexes.asteriskDashAndColon, showdown.helper.escapeCharactersCallback);
	    //url = showdown.helper.escapeCharacters(url, '*_', false);
	    url = url.replace(showdown.helper.regexes.asteriskDashAndColon, showdown.helper.escapeCharactersCallback);
	    var result = '<img src="' + url + '" alt="' + altText + '"';

	    if (title && showdown.helper.isString(title)) {
	      title = title
	        .replace(/"/g, '&quot;')
	      //title = showdown.helper.escapeCharacters(title, '*_', false);
	        .replace(showdown.helper.regexes.asteriskDashAndColon, showdown.helper.escapeCharactersCallback);
	      result += ' title="' + title + '"';
	    }

	    if (width && height) {
	      width  = (width === '*') ? 'auto' : width;
	      height = (height === '*') ? 'auto' : height;

	      result += ' width="' + width + '"';
	      result += ' height="' + height + '"';
	    }

	    result += ' />';

	    return result;
	  }

	  // First, handle reference-style labeled images: ![alt text][id]
	  text = text.replace(referenceRegExp, writeImageTag);

	  // Next, handle inline images:  ![alt text](url =<width>x<height> "optional title")

	  // base64 encoded images
	  text = text.replace(base64RegExp, writeImageTagBase64);

	  // cases with crazy urls like ./image/cat1).png
	  text = text.replace(crazyRegExp, writeImageTag);

	  // normal cases
	  text = text.replace(inlineRegExp, writeImageTag);

	  // handle reference-style shortcuts: ![img text]
	  text = text.replace(refShortcutRegExp, writeImageTag);

	  text = globals.converter._dispatch('images.after', text, options, globals);
	  return text;
	});

	showdown.subParser('italicsAndBold', function (text, options, globals) {

	  text = globals.converter._dispatch('italicsAndBold.before', text, options, globals);

	  // it's faster to have 3 separate regexes for each case than have just one
	  // because of backtracing, in some cases, it could lead to an exponential effect
	  // called "catastrophic backtrace". Ominous!

	  function parseInside (txt, left, right) {
	    /*
	    if (options.simplifiedAutoLink) {
	      txt = showdown.subParser('simplifiedAutoLinks')(txt, options, globals);
	    }
	    */
	    return left + txt + right;
	  }

	  // Parse underscores
	  if (options.literalMidWordUnderscores) {
	    text = text.replace(/\b___(\S[\s\S]*?)___\b/g, function (wm, txt) {
	      return parseInside (txt, '<strong><em>', '</em></strong>');
	    });
	    text = text.replace(/\b__(\S[\s\S]*?)__\b/g, function (wm, txt) {
	      return parseInside (txt, '<strong>', '</strong>');
	    });
	    text = text.replace(/\b_(\S[\s\S]*?)_\b/g, function (wm, txt) {
	      return parseInside (txt, '<em>', '</em>');
	    });
	  } else {
	    text = text.replace(/___(\S[\s\S]*?)___/g, function (wm, m) {
	      return (/\S$/.test(m)) ? parseInside (m, '<strong><em>', '</em></strong>') : wm;
	    });
	    text = text.replace(/__(\S[\s\S]*?)__/g, function (wm, m) {
	      return (/\S$/.test(m)) ? parseInside (m, '<strong>', '</strong>') : wm;
	    });
	    text = text.replace(/_([^\s_][\s\S]*?)_/g, function (wm, m) {
	      // !/^_[^_]/.test(m) - test if it doesn't start with __ (since it seems redundant, we removed it)
	      return (/\S$/.test(m)) ? parseInside (m, '<em>', '</em>') : wm;
	    });
	  }

	  // Now parse asterisks
	  if (options.literalMidWordAsterisks) {
	    text = text.replace(/([^*]|^)\B\*\*\*(\S[\s\S]*?)\*\*\*\B(?!\*)/g, function (wm, lead, txt) {
	      return parseInside (txt, lead + '<strong><em>', '</em></strong>');
	    });
	    text = text.replace(/([^*]|^)\B\*\*(\S[\s\S]*?)\*\*\B(?!\*)/g, function (wm, lead, txt) {
	      return parseInside (txt, lead + '<strong>', '</strong>');
	    });
	    text = text.replace(/([^*]|^)\B\*(\S[\s\S]*?)\*\B(?!\*)/g, function (wm, lead, txt) {
	      return parseInside (txt, lead + '<em>', '</em>');
	    });
	  } else {
	    text = text.replace(/\*\*\*(\S[\s\S]*?)\*\*\*/g, function (wm, m) {
	      return (/\S$/.test(m)) ? parseInside (m, '<strong><em>', '</em></strong>') : wm;
	    });
	    text = text.replace(/\*\*(\S[\s\S]*?)\*\*/g, function (wm, m) {
	      return (/\S$/.test(m)) ? parseInside (m, '<strong>', '</strong>') : wm;
	    });
	    text = text.replace(/\*([^\s*][\s\S]*?)\*/g, function (wm, m) {
	      // !/^\*[^*]/.test(m) - test if it doesn't start with ** (since it seems redundant, we removed it)
	      return (/\S$/.test(m)) ? parseInside (m, '<em>', '</em>') : wm;
	    });
	  }


	  text = globals.converter._dispatch('italicsAndBold.after', text, options, globals);
	  return text;
	});

	/**
	 * Form HTML ordered (numbered) and unordered (bulleted) lists.
	 */
	showdown.subParser('lists', function (text, options, globals) {

	  /**
	   * Process the contents of a single ordered or unordered list, splitting it
	   * into individual list items.
	   * @param {string} listStr
	   * @param {boolean} trimTrailing
	   * @returns {string}
	   */
	  function processListItems (listStr, trimTrailing) {
	    // The $g_list_level global keeps track of when we're inside a list.
	    // Each time we enter a list, we increment it; when we leave a list,
	    // we decrement. If it's zero, we're not in a list anymore.
	    //
	    // We do this because when we're not inside a list, we want to treat
	    // something like this:
	    //
	    //    I recommend upgrading to version
	    //    8. Oops, now this line is treated
	    //    as a sub-list.
	    //
	    // As a single paragraph, despite the fact that the second line starts
	    // with a digit-period-space sequence.
	    //
	    // Whereas when we're inside a list (or sub-list), that line will be
	    // treated as the start of a sub-list. What a kludge, huh? This is
	    // an aspect of Markdown's syntax that's hard to parse perfectly
	    // without resorting to mind-reading. Perhaps the solution is to
	    // change the syntax rules such that sub-lists must start with a
	    // starting cardinal number; e.g. "1." or "a.".
	    globals.gListLevel++;

	    // trim trailing blank lines:
	    listStr = listStr.replace(/\n{2,}$/, '\n');

	    // attacklab: add sentinel to emulate \z
	    listStr += '¨0';

	    var rgx = /(\n)?(^ {0,3})([*+-]|\d+[.])[ \t]+((\[(x|X| )?])?[ \t]*[^\r]+?(\n{1,2}))(?=\n*(¨0| {0,3}([*+-]|\d+[.])[ \t]+))/gm,
	        isParagraphed = (/\n[ \t]*\n(?!¨0)/.test(listStr));

	    // Since version 1.5, nesting sublists requires 4 spaces (or 1 tab) indentation,
	    // which is a syntax breaking change
	    // activating this option reverts to old behavior
	    if (options.disableForced4SpacesIndentedSublists) {
	      rgx = /(\n)?(^ {0,3})([*+-]|\d+[.])[ \t]+((\[(x|X| )?])?[ \t]*[^\r]+?(\n{1,2}))(?=\n*(¨0|\2([*+-]|\d+[.])[ \t]+))/gm;
	    }

	    listStr = listStr.replace(rgx, function (wholeMatch, m1, m2, m3, m4, taskbtn, checked) {
	      checked = (checked && checked.trim() !== '');

	      var item = showdown.subParser('outdent')(m4, options, globals),
	          bulletStyle = '';

	      // Support for github tasklists
	      if (taskbtn && options.tasklists) {
	        bulletStyle = ' class="task-list-item" style="list-style-type: none;"';
	        item = item.replace(/^[ \t]*\[(x|X| )?]/m, function () {
	          var otp = '<input type="checkbox" disabled style="margin: 0px 0.35em 0.25em -1.6em; vertical-align: middle;"';
	          if (checked) {
	            otp += ' checked';
	          }
	          otp += '>';
	          return otp;
	        });
	      }

	      // ISSUE #312
	      // This input: - - - a
	      // causes trouble to the parser, since it interprets it as:
	      // <ul><li><li><li>a</li></li></li></ul>
	      // instead of:
	      // <ul><li>- - a</li></ul>
	      // So, to prevent it, we will put a marker (¨A)in the beginning of the line
	      // Kind of hackish/monkey patching, but seems more effective than overcomplicating the list parser
	      item = item.replace(/^([-*+]|\d\.)[ \t]+[\S\n ]*/g, function (wm2) {
	        return '¨A' + wm2;
	      });

	      // m1 - Leading line or
	      // Has a double return (multi paragraph) or
	      // Has sublist
	      if (m1 || (item.search(/\n{2,}/) > -1)) {
	        item = showdown.subParser('githubCodeBlocks')(item, options, globals);
	        item = showdown.subParser('blockGamut')(item, options, globals);
	      } else {
	        // Recursion for sub-lists:
	        item = showdown.subParser('lists')(item, options, globals);
	        item = item.replace(/\n$/, ''); // chomp(item)
	        item = showdown.subParser('hashHTMLBlocks')(item, options, globals);

	        // Colapse double linebreaks
	        item = item.replace(/\n\n+/g, '\n\n');
	        if (isParagraphed) {
	          item = showdown.subParser('paragraphs')(item, options, globals);
	        } else {
	          item = showdown.subParser('spanGamut')(item, options, globals);
	        }
	      }

	      // now we need to remove the marker (¨A)
	      item = item.replace('¨A', '');
	      // we can finally wrap the line in list item tags
	      item =  '<li' + bulletStyle + '>' + item + '</li>\n';

	      return item;
	    });

	    // attacklab: strip sentinel
	    listStr = listStr.replace(/¨0/g, '');

	    globals.gListLevel--;

	    if (trimTrailing) {
	      listStr = listStr.replace(/\s+$/, '');
	    }

	    return listStr;
	  }

	  function styleStartNumber (list, listType) {
	    // check if ol and starts by a number different than 1
	    if (listType === 'ol') {
	      var res = list.match(/^ *(\d+)\./);
	      if (res && res[1] !== '1') {
	        return ' start="' + res[1] + '"';
	      }
	    }
	    return '';
	  }

	  /**
	   * Check and parse consecutive lists (better fix for issue #142)
	   * @param {string} list
	   * @param {string} listType
	   * @param {boolean} trimTrailing
	   * @returns {string}
	   */
	  function parseConsecutiveLists (list, listType, trimTrailing) {
	    // check if we caught 2 or more consecutive lists by mistake
	    // we use the counterRgx, meaning if listType is UL we look for OL and vice versa
	    var olRgx = (options.disableForced4SpacesIndentedSublists) ? /^ ?\d+\.[ \t]/gm : /^ {0,3}\d+\.[ \t]/gm,
	        ulRgx = (options.disableForced4SpacesIndentedSublists) ? /^ ?[*+-][ \t]/gm : /^ {0,3}[*+-][ \t]/gm,
	        counterRxg = (listType === 'ul') ? olRgx : ulRgx,
	        result = '';

	    if (list.search(counterRxg) !== -1) {
	      (function parseCL (txt) {
	        var pos = txt.search(counterRxg),
	            style = styleStartNumber(list, listType);
	        if (pos !== -1) {
	          // slice
	          result += '\n\n<' + listType + style + '>\n' + processListItems(txt.slice(0, pos), !!trimTrailing) + '</' + listType + '>\n';

	          // invert counterType and listType
	          listType = (listType === 'ul') ? 'ol' : 'ul';
	          counterRxg = (listType === 'ul') ? olRgx : ulRgx;

	          //recurse
	          parseCL(txt.slice(pos));
	        } else {
	          result += '\n\n<' + listType + style + '>\n' + processListItems(txt, !!trimTrailing) + '</' + listType + '>\n';
	        }
	      })(list);
	    } else {
	      var style = styleStartNumber(list, listType);
	      result = '\n\n<' + listType + style + '>\n' + processListItems(list, !!trimTrailing) + '</' + listType + '>\n';
	    }

	    return result;
	  }

	  /** Start of list parsing **/
	  text = globals.converter._dispatch('lists.before', text, options, globals);
	  // add sentinel to hack around khtml/safari bug:
	  // http://bugs.webkit.org/show_bug.cgi?id=11231
	  text += '¨0';

	  if (globals.gListLevel) {
	    text = text.replace(/^(( {0,3}([*+-]|\d+[.])[ \t]+)[^\r]+?(¨0|\n{2,}(?=\S)(?![ \t]*(?:[*+-]|\d+[.])[ \t]+)))/gm,
	      function (wholeMatch, list, m2) {
	        var listType = (m2.search(/[*+-]/g) > -1) ? 'ul' : 'ol';
	        return parseConsecutiveLists(list, listType, true);
	      }
	    );
	  } else {
	    text = text.replace(/(\n\n|^\n?)(( {0,3}([*+-]|\d+[.])[ \t]+)[^\r]+?(¨0|\n{2,}(?=\S)(?![ \t]*(?:[*+-]|\d+[.])[ \t]+)))/gm,
	      function (wholeMatch, m1, list, m3) {
	        var listType = (m3.search(/[*+-]/g) > -1) ? 'ul' : 'ol';
	        return parseConsecutiveLists(list, listType, false);
	      }
	    );
	  }

	  // strip sentinel
	  text = text.replace(/¨0/, '');
	  text = globals.converter._dispatch('lists.after', text, options, globals);
	  return text;
	});

	/**
	 * Parse metadata at the top of the document
	 */
	showdown.subParser('metadata', function (text, options, globals) {

	  if (!options.metadata) {
	    return text;
	  }

	  text = globals.converter._dispatch('metadata.before', text, options, globals);

	  function parseMetadataContents (content) {
	    // raw is raw so it's not changed in any way
	    globals.metadata.raw = content;

	    // escape chars forbidden in html attributes
	    // double quotes
	    content = content
	      // ampersand first
	      .replace(/&/g, '&amp;')
	      // double quotes
	      .replace(/"/g, '&quot;');

	    content = content.replace(/\n {4}/g, ' ');
	    content.replace(/^([\S ]+): +([\s\S]+?)$/gm, function (wm, key, value) {
	      globals.metadata.parsed[key] = value;
	      return '';
	    });
	  }

	  text = text.replace(/^\s*«««+(\S*?)\n([\s\S]+?)\n»»»+\n/, function (wholematch, format, content) {
	    parseMetadataContents(content);
	    return '¨M';
	  });

	  text = text.replace(/^\s*---+(\S*?)\n([\s\S]+?)\n---+\n/, function (wholematch, format, content) {
	    if (format) {
	      globals.metadata.format = format;
	    }
	    parseMetadataContents(content);
	    return '¨M';
	  });

	  text = text.replace(/¨M/g, '');

	  text = globals.converter._dispatch('metadata.after', text, options, globals);
	  return text;
	});

	/**
	 * Remove one level of line-leading tabs or spaces
	 */
	showdown.subParser('outdent', function (text, options, globals) {
	  text = globals.converter._dispatch('outdent.before', text, options, globals);

	  // attacklab: hack around Konqueror 3.5.4 bug:
	  // "----------bug".replace(/^-/g,"") == "bug"
	  text = text.replace(/^(\t|[ ]{1,4})/gm, '¨0'); // attacklab: g_tab_width

	  // attacklab: clean up hack
	  text = text.replace(/¨0/g, '');

	  text = globals.converter._dispatch('outdent.after', text, options, globals);
	  return text;
	});

	/**
	 *
	 */
	showdown.subParser('paragraphs', function (text, options, globals) {

	  text = globals.converter._dispatch('paragraphs.before', text, options, globals);
	  // Strip leading and trailing lines:
	  text = text.replace(/^\n+/g, '');
	  text = text.replace(/\n+$/g, '');

	  var grafs = text.split(/\n{2,}/g),
	      grafsOut = [],
	      end = grafs.length; // Wrap <p> tags

	  for (var i = 0; i < end; i++) {
	    var str = grafs[i];
	    // if this is an HTML marker, copy it
	    if (str.search(/¨(K|G)(\d+)\1/g) >= 0) {
	      grafsOut.push(str);

	    // test for presence of characters to prevent empty lines being parsed
	    // as paragraphs (resulting in undesired extra empty paragraphs)
	    } else if (str.search(/\S/) >= 0) {
	      str = showdown.subParser('spanGamut')(str, options, globals);
	      str = str.replace(/^([ \t]*)/g, '<p>');
	      str += '</p>';
	      grafsOut.push(str);
	    }
	  }

	  /** Unhashify HTML blocks */
	  end = grafsOut.length;
	  for (i = 0; i < end; i++) {
	    var blockText = '',
	        grafsOutIt = grafsOut[i],
	        codeFlag = false;
	    // if this is a marker for an html block...
	    // use RegExp.test instead of string.search because of QML bug
	    while (/¨(K|G)(\d+)\1/.test(grafsOutIt)) {
	      var delim = RegExp.$1,
	          num   = RegExp.$2;

	      if (delim === 'K') {
	        blockText = globals.gHtmlBlocks[num];
	      } else {
	        // we need to check if ghBlock is a false positive
	        if (codeFlag) {
	          // use encoded version of all text
	          blockText = showdown.subParser('encodeCode')(globals.ghCodeBlocks[num].text, options, globals);
	        } else {
	          blockText = globals.ghCodeBlocks[num].codeblock;
	        }
	      }
	      blockText = blockText.replace(/\$/g, '$$$$'); // Escape any dollar signs

	      grafsOutIt = grafsOutIt.replace(/(\n\n)?¨(K|G)\d+\2(\n\n)?/, blockText);
	      // Check if grafsOutIt is a pre->code
	      if (/^<pre\b[^>]*>\s*<code\b[^>]*>/.test(grafsOutIt)) {
	        codeFlag = true;
	      }
	    }
	    grafsOut[i] = grafsOutIt;
	  }
	  text = grafsOut.join('\n');
	  // Strip leading and trailing lines:
	  text = text.replace(/^\n+/g, '');
	  text = text.replace(/\n+$/g, '');
	  return globals.converter._dispatch('paragraphs.after', text, options, globals);
	});

	/**
	 * Run extension
	 */
	showdown.subParser('runExtension', function (ext, text, options, globals) {

	  if (ext.filter) {
	    text = ext.filter(text, globals.converter, options);

	  } else if (ext.regex) {
	    // TODO remove this when old extension loading mechanism is deprecated
	    var re = ext.regex;
	    if (!(re instanceof RegExp)) {
	      re = new RegExp(re, 'g');
	    }
	    text = text.replace(re, ext.replace);
	  }

	  return text;
	});

	/**
	 * These are all the transformations that occur *within* block-level
	 * tags like paragraphs, headers, and list items.
	 */
	showdown.subParser('spanGamut', function (text, options, globals) {

	  text = globals.converter._dispatch('spanGamut.before', text, options, globals);
	  text = showdown.subParser('codeSpans')(text, options, globals);
	  text = showdown.subParser('escapeSpecialCharsWithinTagAttributes')(text, options, globals);
	  text = showdown.subParser('encodeBackslashEscapes')(text, options, globals);

	  // Process anchor and image tags. Images must come first,
	  // because ![foo][f] looks like an anchor.
	  text = showdown.subParser('images')(text, options, globals);
	  text = showdown.subParser('anchors')(text, options, globals);

	  // Make links out of things like `<http://example.com/>`
	  // Must come after anchors, because you can use < and >
	  // delimiters in inline links like [this](<url>).
	  text = showdown.subParser('autoLinks')(text, options, globals);
	  text = showdown.subParser('simplifiedAutoLinks')(text, options, globals);
	  text = showdown.subParser('emoji')(text, options, globals);
	  text = showdown.subParser('underline')(text, options, globals);
	  text = showdown.subParser('italicsAndBold')(text, options, globals);
	  text = showdown.subParser('strikethrough')(text, options, globals);
	  text = showdown.subParser('ellipsis')(text, options, globals);

	  // we need to hash HTML tags inside spans
	  text = showdown.subParser('hashHTMLSpans')(text, options, globals);

	  // now we encode amps and angles
	  text = showdown.subParser('encodeAmpsAndAngles')(text, options, globals);

	  // Do hard breaks
	  if (options.simpleLineBreaks) {
	    // GFM style hard breaks
	    // only add line breaks if the text does not contain a block (special case for lists)
	    if (!/\n\n¨K/.test(text)) {
	      text = text.replace(/\n+/g, '<br />\n');
	    }
	  } else {
	    // Vanilla hard breaks
	    text = text.replace(/  +\n/g, '<br />\n');
	  }

	  text = globals.converter._dispatch('spanGamut.after', text, options, globals);
	  return text;
	});

	showdown.subParser('strikethrough', function (text, options, globals) {

	  function parseInside (txt) {
	    if (options.simplifiedAutoLink) {
	      txt = showdown.subParser('simplifiedAutoLinks')(txt, options, globals);
	    }
	    return '<del>' + txt + '</del>';
	  }

	  if (options.strikethrough) {
	    text = globals.converter._dispatch('strikethrough.before', text, options, globals);
	    text = text.replace(/(?:~){2}([\s\S]+?)(?:~){2}/g, function (wm, txt) { return parseInside(txt); });
	    text = globals.converter._dispatch('strikethrough.after', text, options, globals);
	  }

	  return text;
	});

	/**
	 * Strips link definitions from text, stores the URLs and titles in
	 * hash references.
	 * Link defs are in the form: ^[id]: url "optional title"
	 */
	showdown.subParser('stripLinkDefinitions', function (text, options, globals) {

	  var regex       = /^ {0,3}\[(.+)]:[ \t]*\n?[ \t]*<?([^>\s]+)>?(?: =([*\d]+[A-Za-z%]{0,4})x([*\d]+[A-Za-z%]{0,4}))?[ \t]*\n?[ \t]*(?:(\n*)["|'(](.+?)["|')][ \t]*)?(?:\n+|(?=¨0))/gm,
	      base64Regex = /^ {0,3}\[(.+)]:[ \t]*\n?[ \t]*<?(data:.+?\/.+?;base64,[A-Za-z0-9+/=\n]+?)>?(?: =([*\d]+[A-Za-z%]{0,4})x([*\d]+[A-Za-z%]{0,4}))?[ \t]*\n?[ \t]*(?:(\n*)["|'(](.+?)["|')][ \t]*)?(?:\n\n|(?=¨0)|(?=\n\[))/gm;

	  // attacklab: sentinel workarounds for lack of \A and \Z, safari\khtml bug
	  text += '¨0';

	  var replaceFunc = function (wholeMatch, linkId, url, width, height, blankLines, title) {
	    linkId = linkId.toLowerCase();
	    if (url.match(/^data:.+?\/.+?;base64,/)) {
	      // remove newlines
	      globals.gUrls[linkId] = url.replace(/\s/g, '');
	    } else {
	      globals.gUrls[linkId] = showdown.subParser('encodeAmpsAndAngles')(url, options, globals);  // Link IDs are case-insensitive
	    }

	    if (blankLines) {
	      // Oops, found blank lines, so it's not a title.
	      // Put back the parenthetical statement we stole.
	      return blankLines + title;

	    } else {
	      if (title) {
	        globals.gTitles[linkId] = title.replace(/"|'/g, '&quot;');
	      }
	      if (options.parseImgDimensions && width && height) {
	        globals.gDimensions[linkId] = {
	          width:  width,
	          height: height
	        };
	      }
	    }
	    // Completely remove the definition from the text
	    return '';
	  };

	  // first we try to find base64 link references
	  text = text.replace(base64Regex, replaceFunc);

	  text = text.replace(regex, replaceFunc);

	  // attacklab: strip sentinel
	  text = text.replace(/¨0/, '');

	  return text;
	});

	showdown.subParser('tables', function (text, options, globals) {

	  if (!options.tables) {
	    return text;
	  }

	  var tableRgx       = /^ {0,3}\|?.+\|.+\n {0,3}\|?[ \t]*:?[ \t]*(?:[-=]){2,}[ \t]*:?[ \t]*\|[ \t]*:?[ \t]*(?:[-=]){2,}[\s\S]+?(?:\n\n|¨0)/gm,
	    //singeColTblRgx = /^ {0,3}\|.+\|\n {0,3}\|[ \t]*:?[ \t]*(?:[-=]){2,}[ \t]*:?[ \t]*\|[ \t]*\n(?: {0,3}\|.+\|\n)+(?:\n\n|¨0)/gm;
	      singeColTblRgx = /^ {0,3}\|.+\|[ \t]*\n {0,3}\|[ \t]*:?[ \t]*(?:[-=]){2,}[ \t]*:?[ \t]*\|[ \t]*\n( {0,3}\|.+\|[ \t]*\n)*(?:\n|¨0)/gm;

	  function parseStyles (sLine) {
	    if (/^:[ \t]*--*$/.test(sLine)) {
	      return ' style="text-align:left;"';
	    } else if (/^--*[ \t]*:[ \t]*$/.test(sLine)) {
	      return ' style="text-align:right;"';
	    } else if (/^:[ \t]*--*[ \t]*:$/.test(sLine)) {
	      return ' style="text-align:center;"';
	    } else {
	      return '';
	    }
	  }

	  function parseHeaders (header, style) {
	    var id = '';
	    header = header.trim();
	    // support both tablesHeaderId and tableHeaderId due to error in documentation so we don't break backwards compatibility
	    if (options.tablesHeaderId || options.tableHeaderId) {
	      id = ' id="' + header.replace(/ /g, '_').toLowerCase() + '"';
	    }
	    header = showdown.subParser('spanGamut')(header, options, globals);

	    return '<th' + id + style + '>' + header + '</th>\n';
	  }

	  function parseCells (cell, style) {
	    var subText = showdown.subParser('spanGamut')(cell, options, globals);
	    return '<td' + style + '>' + subText + '</td>\n';
	  }

	  function buildTable (headers, cells) {
	    var tb = '<table>\n<thead>\n<tr>\n',
	        tblLgn = headers.length;

	    for (var i = 0; i < tblLgn; ++i) {
	      tb += headers[i];
	    }
	    tb += '</tr>\n</thead>\n<tbody>\n';

	    for (i = 0; i < cells.length; ++i) {
	      tb += '<tr>\n';
	      for (var ii = 0; ii < tblLgn; ++ii) {
	        tb += cells[i][ii];
	      }
	      tb += '</tr>\n';
	    }
	    tb += '</tbody>\n</table>\n';
	    return tb;
	  }

	  function parseTable (rawTable) {
	    var i, tableLines = rawTable.split('\n');

	    for (i = 0; i < tableLines.length; ++i) {
	      // strip wrong first and last column if wrapped tables are used
	      if (/^ {0,3}\|/.test(tableLines[i])) {
	        tableLines[i] = tableLines[i].replace(/^ {0,3}\|/, '');
	      }
	      if (/\|[ \t]*$/.test(tableLines[i])) {
	        tableLines[i] = tableLines[i].replace(/\|[ \t]*$/, '');
	      }
	      // parse code spans first, but we only support one line code spans
	      tableLines[i] = showdown.subParser('codeSpans')(tableLines[i], options, globals);
	    }

	    var rawHeaders = tableLines[0].split('|').map(function (s) { return s.trim();}),
	        rawStyles = tableLines[1].split('|').map(function (s) { return s.trim();}),
	        rawCells = [],
	        headers = [],
	        styles = [],
	        cells = [];

	    tableLines.shift();
	    tableLines.shift();

	    for (i = 0; i < tableLines.length; ++i) {
	      if (tableLines[i].trim() === '') {
	        continue;
	      }
	      rawCells.push(
	        tableLines[i]
	          .split('|')
	          .map(function (s) {
	            return s.trim();
	          })
	      );
	    }

	    if (rawHeaders.length < rawStyles.length) {
	      return rawTable;
	    }

	    for (i = 0; i < rawStyles.length; ++i) {
	      styles.push(parseStyles(rawStyles[i]));
	    }

	    for (i = 0; i < rawHeaders.length; ++i) {
	      if (showdown.helper.isUndefined(styles[i])) {
	        styles[i] = '';
	      }
	      headers.push(parseHeaders(rawHeaders[i], styles[i]));
	    }

	    for (i = 0; i < rawCells.length; ++i) {
	      var row = [];
	      for (var ii = 0; ii < headers.length; ++ii) {
	        if (showdown.helper.isUndefined(rawCells[i][ii])) ;
	        row.push(parseCells(rawCells[i][ii], styles[ii]));
	      }
	      cells.push(row);
	    }

	    return buildTable(headers, cells);
	  }

	  text = globals.converter._dispatch('tables.before', text, options, globals);

	  // find escaped pipe characters
	  text = text.replace(/\\(\|)/g, showdown.helper.escapeCharactersCallback);

	  // parse multi column tables
	  text = text.replace(tableRgx, parseTable);

	  // parse one column tables
	  text = text.replace(singeColTblRgx, parseTable);

	  text = globals.converter._dispatch('tables.after', text, options, globals);

	  return text;
	});

	showdown.subParser('underline', function (text, options, globals) {

	  if (!options.underline) {
	    return text;
	  }

	  text = globals.converter._dispatch('underline.before', text, options, globals);

	  if (options.literalMidWordUnderscores) {
	    text = text.replace(/\b___(\S[\s\S]*?)___\b/g, function (wm, txt) {
	      return '<u>' + txt + '</u>';
	    });
	    text = text.replace(/\b__(\S[\s\S]*?)__\b/g, function (wm, txt) {
	      return '<u>' + txt + '</u>';
	    });
	  } else {
	    text = text.replace(/___(\S[\s\S]*?)___/g, function (wm, m) {
	      return (/\S$/.test(m)) ? '<u>' + m + '</u>' : wm;
	    });
	    text = text.replace(/__(\S[\s\S]*?)__/g, function (wm, m) {
	      return (/\S$/.test(m)) ? '<u>' + m + '</u>' : wm;
	    });
	  }

	  // escape remaining underscores to prevent them being parsed by italic and bold
	  text = text.replace(/(_)/g, showdown.helper.escapeCharactersCallback);

	  text = globals.converter._dispatch('underline.after', text, options, globals);

	  return text;
	});

	/**
	 * Swap back in all the special characters we've hidden.
	 */
	showdown.subParser('unescapeSpecialChars', function (text, options, globals) {
	  text = globals.converter._dispatch('unescapeSpecialChars.before', text, options, globals);

	  text = text.replace(/¨E(\d+)E/g, function (wholeMatch, m1) {
	    var charCodeToReplace = parseInt(m1);
	    return String.fromCharCode(charCodeToReplace);
	  });

	  text = globals.converter._dispatch('unescapeSpecialChars.after', text, options, globals);
	  return text;
	});

	showdown.subParser('makeMarkdown.blockquote', function (node, globals) {

	  var txt = '';
	  if (node.hasChildNodes()) {
	    var children = node.childNodes,
	        childrenLength = children.length;

	    for (var i = 0; i < childrenLength; ++i) {
	      var innerTxt = showdown.subParser('makeMarkdown.node')(children[i], globals);

	      if (innerTxt === '') {
	        continue;
	      }
	      txt += innerTxt;
	    }
	  }
	  // cleanup
	  txt = txt.trim();
	  txt = '> ' + txt.split('\n').join('\n> ');
	  return txt;
	});

	showdown.subParser('makeMarkdown.codeBlock', function (node, globals) {

	  var lang = node.getAttribute('language'),
	      num  = node.getAttribute('precodenum');
	  return '```' + lang + '\n' + globals.preList[num] + '\n```';
	});

	showdown.subParser('makeMarkdown.codeSpan', function (node) {

	  return '`' + node.innerHTML + '`';
	});

	showdown.subParser('makeMarkdown.emphasis', function (node, globals) {

	  var txt = '';
	  if (node.hasChildNodes()) {
	    txt += '*';
	    var children = node.childNodes,
	        childrenLength = children.length;
	    for (var i = 0; i < childrenLength; ++i) {
	      txt += showdown.subParser('makeMarkdown.node')(children[i], globals);
	    }
	    txt += '*';
	  }
	  return txt;
	});

	showdown.subParser('makeMarkdown.header', function (node, globals, headerLevel) {

	  var headerMark = new Array(headerLevel + 1).join('#'),
	      txt = '';

	  if (node.hasChildNodes()) {
	    txt = headerMark + ' ';
	    var children = node.childNodes,
	        childrenLength = children.length;

	    for (var i = 0; i < childrenLength; ++i) {
	      txt += showdown.subParser('makeMarkdown.node')(children[i], globals);
	    }
	  }
	  return txt;
	});

	showdown.subParser('makeMarkdown.hr', function () {

	  return '---';
	});

	showdown.subParser('makeMarkdown.image', function (node) {

	  var txt = '';
	  if (node.hasAttribute('src')) {
	    txt += '![' + node.getAttribute('alt') + '](';
	    txt += '<' + node.getAttribute('src') + '>';
	    if (node.hasAttribute('width') && node.hasAttribute('height')) {
	      txt += ' =' + node.getAttribute('width') + 'x' + node.getAttribute('height');
	    }

	    if (node.hasAttribute('title')) {
	      txt += ' "' + node.getAttribute('title') + '"';
	    }
	    txt += ')';
	  }
	  return txt;
	});

	showdown.subParser('makeMarkdown.links', function (node, globals) {

	  var txt = '';
	  if (node.hasChildNodes() && node.hasAttribute('href')) {
	    var children = node.childNodes,
	        childrenLength = children.length;
	    txt = '[';
	    for (var i = 0; i < childrenLength; ++i) {
	      txt += showdown.subParser('makeMarkdown.node')(children[i], globals);
	    }
	    txt += '](';
	    txt += '<' + node.getAttribute('href') + '>';
	    if (node.hasAttribute('title')) {
	      txt += ' "' + node.getAttribute('title') + '"';
	    }
	    txt += ')';
	  }
	  return txt;
	});

	showdown.subParser('makeMarkdown.list', function (node, globals, type) {

	  var txt = '';
	  if (!node.hasChildNodes()) {
	    return '';
	  }
	  var listItems       = node.childNodes,
	      listItemsLenght = listItems.length,
	      listNum = node.getAttribute('start') || 1;

	  for (var i = 0; i < listItemsLenght; ++i) {
	    if (typeof listItems[i].tagName === 'undefined' || listItems[i].tagName.toLowerCase() !== 'li') {
	      continue;
	    }

	    // define the bullet to use in list
	    var bullet = '';
	    if (type === 'ol') {
	      bullet = listNum.toString() + '. ';
	    } else {
	      bullet = '- ';
	    }

	    // parse list item
	    txt += bullet + showdown.subParser('makeMarkdown.listItem')(listItems[i], globals);
	    ++listNum;
	  }

	  // add comment at the end to prevent consecutive lists to be parsed as one
	  txt += '\n<!-- -->\n';
	  return txt.trim();
	});

	showdown.subParser('makeMarkdown.listItem', function (node, globals) {

	  var listItemTxt = '';

	  var children = node.childNodes,
	      childrenLenght = children.length;

	  for (var i = 0; i < childrenLenght; ++i) {
	    listItemTxt += showdown.subParser('makeMarkdown.node')(children[i], globals);
	  }
	  // if it's only one liner, we need to add a newline at the end
	  if (!/\n$/.test(listItemTxt)) {
	    listItemTxt += '\n';
	  } else {
	    // it's multiparagraph, so we need to indent
	    listItemTxt = listItemTxt
	      .split('\n')
	      .join('\n    ')
	      .replace(/^ {4}$/gm, '')
	      .replace(/\n\n+/g, '\n\n');
	  }

	  return listItemTxt;
	});



	showdown.subParser('makeMarkdown.node', function (node, globals, spansOnly) {

	  spansOnly = spansOnly || false;

	  var txt = '';

	  // edge case of text without wrapper paragraph
	  if (node.nodeType === 3) {
	    return showdown.subParser('makeMarkdown.txt')(node, globals);
	  }

	  // HTML comment
	  if (node.nodeType === 8) {
	    return '<!--' + node.data + '-->\n\n';
	  }

	  // process only node elements
	  if (node.nodeType !== 1) {
	    return '';
	  }

	  var tagName = node.tagName.toLowerCase();

	  switch (tagName) {

	    //
	    // BLOCKS
	    //
	    case 'h1':
	      if (!spansOnly) { txt = showdown.subParser('makeMarkdown.header')(node, globals, 1) + '\n\n'; }
	      break;
	    case 'h2':
	      if (!spansOnly) { txt = showdown.subParser('makeMarkdown.header')(node, globals, 2) + '\n\n'; }
	      break;
	    case 'h3':
	      if (!spansOnly) { txt = showdown.subParser('makeMarkdown.header')(node, globals, 3) + '\n\n'; }
	      break;
	    case 'h4':
	      if (!spansOnly) { txt = showdown.subParser('makeMarkdown.header')(node, globals, 4) + '\n\n'; }
	      break;
	    case 'h5':
	      if (!spansOnly) { txt = showdown.subParser('makeMarkdown.header')(node, globals, 5) + '\n\n'; }
	      break;
	    case 'h6':
	      if (!spansOnly) { txt = showdown.subParser('makeMarkdown.header')(node, globals, 6) + '\n\n'; }
	      break;

	    case 'p':
	      if (!spansOnly) { txt = showdown.subParser('makeMarkdown.paragraph')(node, globals) + '\n\n'; }
	      break;

	    case 'blockquote':
	      if (!spansOnly) { txt = showdown.subParser('makeMarkdown.blockquote')(node, globals) + '\n\n'; }
	      break;

	    case 'hr':
	      if (!spansOnly) { txt = showdown.subParser('makeMarkdown.hr')(node, globals) + '\n\n'; }
	      break;

	    case 'ol':
	      if (!spansOnly) { txt = showdown.subParser('makeMarkdown.list')(node, globals, 'ol') + '\n\n'; }
	      break;

	    case 'ul':
	      if (!spansOnly) { txt = showdown.subParser('makeMarkdown.list')(node, globals, 'ul') + '\n\n'; }
	      break;

	    case 'precode':
	      if (!spansOnly) { txt = showdown.subParser('makeMarkdown.codeBlock')(node, globals) + '\n\n'; }
	      break;

	    case 'pre':
	      if (!spansOnly) { txt = showdown.subParser('makeMarkdown.pre')(node, globals) + '\n\n'; }
	      break;

	    case 'table':
	      if (!spansOnly) { txt = showdown.subParser('makeMarkdown.table')(node, globals) + '\n\n'; }
	      break;

	    //
	    // SPANS
	    //
	    case 'code':
	      txt = showdown.subParser('makeMarkdown.codeSpan')(node, globals);
	      break;

	    case 'em':
	    case 'i':
	      txt = showdown.subParser('makeMarkdown.emphasis')(node, globals);
	      break;

	    case 'strong':
	    case 'b':
	      txt = showdown.subParser('makeMarkdown.strong')(node, globals);
	      break;

	    case 'del':
	      txt = showdown.subParser('makeMarkdown.strikethrough')(node, globals);
	      break;

	    case 'a':
	      txt = showdown.subParser('makeMarkdown.links')(node, globals);
	      break;

	    case 'img':
	      txt = showdown.subParser('makeMarkdown.image')(node, globals);
	      break;

	    default:
	      txt = node.outerHTML + '\n\n';
	  }

	  // common normalization
	  // TODO eventually

	  return txt;
	});

	showdown.subParser('makeMarkdown.paragraph', function (node, globals) {

	  var txt = '';
	  if (node.hasChildNodes()) {
	    var children = node.childNodes,
	        childrenLength = children.length;
	    for (var i = 0; i < childrenLength; ++i) {
	      txt += showdown.subParser('makeMarkdown.node')(children[i], globals);
	    }
	  }

	  // some text normalization
	  txt = txt.trim();

	  return txt;
	});

	showdown.subParser('makeMarkdown.pre', function (node, globals) {

	  var num  = node.getAttribute('prenum');
	  return '<pre>' + globals.preList[num] + '</pre>';
	});

	showdown.subParser('makeMarkdown.strikethrough', function (node, globals) {

	  var txt = '';
	  if (node.hasChildNodes()) {
	    txt += '~~';
	    var children = node.childNodes,
	        childrenLength = children.length;
	    for (var i = 0; i < childrenLength; ++i) {
	      txt += showdown.subParser('makeMarkdown.node')(children[i], globals);
	    }
	    txt += '~~';
	  }
	  return txt;
	});

	showdown.subParser('makeMarkdown.strong', function (node, globals) {

	  var txt = '';
	  if (node.hasChildNodes()) {
	    txt += '**';
	    var children = node.childNodes,
	        childrenLength = children.length;
	    for (var i = 0; i < childrenLength; ++i) {
	      txt += showdown.subParser('makeMarkdown.node')(children[i], globals);
	    }
	    txt += '**';
	  }
	  return txt;
	});

	showdown.subParser('makeMarkdown.table', function (node, globals) {

	  var txt = '',
	      tableArray = [[], []],
	      headings   = node.querySelectorAll('thead>tr>th'),
	      rows       = node.querySelectorAll('tbody>tr'),
	      i, ii;
	  for (i = 0; i < headings.length; ++i) {
	    var headContent = showdown.subParser('makeMarkdown.tableCell')(headings[i], globals),
	        allign = '---';

	    if (headings[i].hasAttribute('style')) {
	      var style = headings[i].getAttribute('style').toLowerCase().replace(/\s/g, '');
	      switch (style) {
	        case 'text-align:left;':
	          allign = ':---';
	          break;
	        case 'text-align:right;':
	          allign = '---:';
	          break;
	        case 'text-align:center;':
	          allign = ':---:';
	          break;
	      }
	    }
	    tableArray[0][i] = headContent.trim();
	    tableArray[1][i] = allign;
	  }

	  for (i = 0; i < rows.length; ++i) {
	    var r = tableArray.push([]) - 1,
	        cols = rows[i].getElementsByTagName('td');

	    for (ii = 0; ii < headings.length; ++ii) {
	      var cellContent = ' ';
	      if (typeof cols[ii] !== 'undefined') {
	        cellContent = showdown.subParser('makeMarkdown.tableCell')(cols[ii], globals);
	      }
	      tableArray[r].push(cellContent);
	    }
	  }

	  var cellSpacesCount = 3;
	  for (i = 0; i < tableArray.length; ++i) {
	    for (ii = 0; ii < tableArray[i].length; ++ii) {
	      var strLen = tableArray[i][ii].length;
	      if (strLen > cellSpacesCount) {
	        cellSpacesCount = strLen;
	      }
	    }
	  }

	  for (i = 0; i < tableArray.length; ++i) {
	    for (ii = 0; ii < tableArray[i].length; ++ii) {
	      if (i === 1) {
	        if (tableArray[i][ii].slice(-1) === ':') {
	          tableArray[i][ii] = showdown.helper.padEnd(tableArray[i][ii].slice(-1), cellSpacesCount - 1, '-') + ':';
	        } else {
	          tableArray[i][ii] = showdown.helper.padEnd(tableArray[i][ii], cellSpacesCount, '-');
	        }
	      } else {
	        tableArray[i][ii] = showdown.helper.padEnd(tableArray[i][ii], cellSpacesCount);
	      }
	    }
	    txt += '| ' + tableArray[i].join(' | ') + ' |\n';
	  }

	  return txt.trim();
	});

	showdown.subParser('makeMarkdown.tableCell', function (node, globals) {

	  var txt = '';
	  if (!node.hasChildNodes()) {
	    return '';
	  }
	  var children = node.childNodes,
	      childrenLength = children.length;

	  for (var i = 0; i < childrenLength; ++i) {
	    txt += showdown.subParser('makeMarkdown.node')(children[i], globals, true);
	  }
	  return txt.trim();
	});

	showdown.subParser('makeMarkdown.txt', function (node) {

	  var txt = node.nodeValue;

	  // multiple spaces are collapsed
	  txt = txt.replace(/ +/g, ' ');

	  // replace the custom ¨NBSP; with a space
	  txt = txt.replace(/¨NBSP;/g, ' ');

	  // ", <, > and & should replace escaped html entities
	  txt = showdown.helper.unescapeHTMLEntities(txt);

	  // escape markdown magic characters
	  // emphasis, strong and strikethrough - can appear everywhere
	  // we also escape pipe (|) because of tables
	  // and escape ` because of code blocks and spans
	  txt = txt.replace(/([*_~|`])/g, '\\$1');

	  // escape > because of blockquotes
	  txt = txt.replace(/^(\s*)>/g, '\\$1>');

	  // hash character, only troublesome at the beginning of a line because of headers
	  txt = txt.replace(/^#/gm, '\\#');

	  // horizontal rules
	  txt = txt.replace(/^(\s*)([-=]{3,})(\s*)$/, '$1\\$2$3');

	  // dot, because of ordered lists, only troublesome at the beginning of a line when preceded by an integer
	  txt = txt.replace(/^( {0,3}\d+)\./gm, '$1\\.');

	  // +, * and -, at the beginning of a line becomes a list, so we need to escape them also (asterisk was already escaped)
	  txt = txt.replace(/^( {0,3})([+-])/gm, '$1\\$2');

	  // images and links, ] followed by ( is problematic, so we escape it
	  txt = txt.replace(/]([\s]*)\(/g, '\\]$1\\(');

	  // reference URIs must also be escaped
	  txt = txt.replace(/^ {0,3}\[([\S \t]*?)]:/gm, '\\[$1]:');

	  return txt;
	});

	var root = this;

	// AMD Loader
	if (typeof define === 'function' && define.amd) {
	  define(function () {
	    return showdown;
	  });

	// CommonJS/nodeJS Loader
	} else if (typeof module !== 'undefined' && module.exports) {
	  module.exports = showdown;

	// Regular Browser loader
	} else {
	  root.showdown = showdown;
	}
	}).call(undefined);

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

	const util = require('util');

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

	  $('#swagger-editor').fadeIn(2500);

	  function generateCurl(obj) {
	    const domain = $('body').find('.servers :selected').text();
	    const ep_id = $(obj).parents('.opblock-post:first').attr('id');
	    const ep = util.format("/%s", ep_id.substr(ep_id.indexOf("_") + 1).replace("_", "/"));
	    const par_node = $(obj).parents('.opblock-body:first');
	    const exampleBody = par_node.find('.body-param__example');
	    const textBody = exampleBody.length > 0 ? exampleBody.text() : par_node.find('.body-param__text').text();
	    const params = textBody.replace(/\s/g,'');

	    par_node.find('.curl').remove();
	    par_node.find('.execute-wrapper').append(util.format('<p class="curl">Use the following command to make a request to the <strong>%s</strong> endpoint based on the data set above:</p>', ep));

	    const authVal = par_node.find('[placeholder^=Authorization]').val();
	    const interestedProgramsVal = par_node.find('[placeholder^=interestedPrograms]').val();
	    const query = interestedProgramsVal ? util.format("?interestedPrograms=%s", interestedProgramsVal) : "";
	    if (ep_id.includes('Authentication')) {
	      const authenticationCurl = util.format('curl -X POST "%s%s" \
=======
>>>>>>> ee68aa6... Integrating jquery via a CDN
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
          $(this).parent().addClass('error');
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
        })
        .catch((error) => {
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
    'https://raw.githubusercontent.com/CityOfNewYork/screeningapi-docs/content/' ;

  new Icons('svg/icons.svg');
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
      converter = new showdown.Converter({tables: true}),
      html      = converter.makeHtml(data);

      target.append(html)
        .hide()
        .fadeIn(250);

    }, 'text');
  });

}());
>>>>>>> 481c593... Replaced compiled file from main.js to source.js
