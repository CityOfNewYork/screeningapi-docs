import Forms from '@nycopportunity/pttrn-scripts/src/forms/forms';
import { displayErrors, displayInfo, sendPostRequest } from './util';

export default function() {
  const SELECTOR = '[data-js*="change-password"]'

  const Form = new Forms(document.querySelector(SELECTOR));

  const responseHandler = (req) => {
    if (req.readyState === 4) {
      const status = req.status.toString() 
      if (status[0] === '4' || status[0] === '5') {
        displayErrors(req.responseText, false)
      } else if (status[0] === '2') {
        displayInfo('Password updated')
      }
    }
  }
  

  const submit = (event) => {
    const domain = document.getElementById('domain').value
    const username = document.getElementById('username').value
    const password = document.getElementById('password').value
    const newPassword = document.getElementById('newpassword').value

    var url = domain + 'authToken'
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
