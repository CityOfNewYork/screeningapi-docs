import Forms from 'nyco-patterns-framework/dist/forms/forms.common';
import { displayErrors, sendPostRequest } from './util';

export default function() {
  const SELECTOR = '[data-js*="bulk-submission"]'

  const filename = 'response.csv'

  const Form = new Forms(document.querySelector(SELECTOR));

  const bulkSubmissionHandler = (req) => {
    if (req.readyState === 4) {
      const status = req.status.toString()
      if (status[0] === '4' || status[0] === '5') {
        displayErrors(req.responseText, true)
      } else if (status[0] === '2') {
        const blob = new Blob([req.response], {type : 'text/csv'})
        if (typeof window.navigator.msSaveBlob !== 'undefined') {
          window.navigator.msSaveBlob(blob, filename)
        } else {
          const URL = window.URL || window.webkitURL
          const downloadUrl = URL.createObjectURL(blob)

          const a = document.createElement('a')

          if (typeof a.download === 'undefined') {
            window.location = downloadUrl
          } else {
            a.href = downloadUrl
            a.download = filename
            document.body.appendChild(a)
            a.click()
          }

          setTimeout(() => {
            URL.revokeObjectURL(downloadUrl)
          }, 100)
        }
      }
    }
  }

  const sendBulkSubmissionRequest = (formValues, token) => {
    const { baseurl, username, csvFile } = formValues
    var url = baseurl + 'bulkSubmission/import'
    if (formValues.programs) {
      var programs = formValues.programs.split(',').map(p => p.trim()).join(',')
      url = url + '?interestedPrograms=' + programs
    }
    var headersObject = {
      'Authorization': token
    }
    var formData = new FormData();
    formData.append('file', csvFile);
    sendPostRequest(url, headersObject, bulkSubmissionHandler, formData)
  }

  const authResponseHandler = (formValues) => (req) => {
    if (req.readyState === 4) {
      const status = req.status.toString()
      if (status[0] === '4' || status[0] === '5') {
        displayErrors(req.responseText, false)
      } else if (status[0] === '2') {
        sendBulkSubmissionRequest(formValues,
          JSON.parse(req.responseText).token)
      }
    }
  }

  const submit = (event) => {
    const baseurl = event.target.action;
    const username = document.getElementById('username').value
    const password = document.getElementById('password').value
    const programs = document.getElementById('programs').value
    const csvFileInput = document.getElementById('csv-upload')

    const csvFile = csvFileInput.files &&
      csvFileInput.files.length > 0 &&
      csvFileInput.files[0]

    let formValues = {
      baseurl: baseurl,
      username: username,
      password: password,
      csvFile: csvFile
    }

    if (programs !== '') formValues.programs = programs

    var url = baseurl + 'authToken'
    var headersObject = {
      'Content-type': 'application/json',
      'Access-Control-Allow-Origin': '*'
    }

    const authPayload = { username, password }

    sendPostRequest(url, headersObject, authResponseHandler(formValues),
      JSON.stringify(authPayload))
  };

  Form.watch();
  Form.submit = submit;
}