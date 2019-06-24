import Forms from 'nyco-patterns-framework/dist/forms/forms.common';
import { setErrors, displayErrors, sendPostRequest } from './utils';

export default function() {
  const SELECTOR = '[data-js*="change-password"]'

  const Form = new Forms(document.querySelector(SELECTOR));

  const responseHandler = (req) => {
    if (req.readyState === 4) {
      const status = req.status.toString()
      if (status[0] === '4' || status[0] === '5') {
        displayErrors(req.responseText, false)
      } 
      // should display a success message here?
    }
  }

  const submit = (event) => {
    const baseurl = event.target.action;
    const username = document.getElementById('username').value
    const password = document.getElementById('password').value
    const newPassword = document.getElementById('newPassword').value

    var url = baseurl + 'authToken'
    var headersObject = {
      'Content-type': 'application/json',
      'Access-Control-Allow-Origin': '*'
    }

    const authPayload = { username, password, newPassword }

    sendPostRequest(url, headersObject, responseHandler,
      JSON.stringify(authPayload))
  };

  Form.watch();
  Form.submit = submit;
}