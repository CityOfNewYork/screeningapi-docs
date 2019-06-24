
export const setErrors = (messageString, errorState) => {
  var ele = document.getElementById('errors');
  ele.innerHTML = '<ul class="m-0 px-2">' +
    toTitleCase(messageString.trim()) + '</ul>';

  ele.style.display = errorState;

  if (errorState === 'none') {
    ele.removeAttribute('aria-live', 'polite')
    ele.classList.remove('animated')
    ele.classList.remove('fadeInUp')
  } else {
    ele.setAttribute('aria-live', 'polite')
    ele.classList.add('animated')
    ele.classList.add('fadeInUp')
  }
}

export const sendPostRequest = (url, headersObject, responseHandler, requestPayload) => {
  setErrors('', 'none')

  document.getElementById('loader').style.display = 'block'

  var req = new XMLHttpRequest()

  req.open('POST', url, true);

  Object.keys(headersObject).forEach(function(key) {
    req.setRequestHeader(key, headersObject[key]);
  });

  req.onreadystatechange = function() {
    document.getElementById('loader').style.display = 'none'
    responseHandler(req)
  }

  req.send(requestPayload)
}

exportconst displayErrors = (responseText, showPath) => {
  var errorJSON
  var errorsArray = []
  try {
    errorJSON = JSON.parse(responseText).errors
    errorsArray = errorJSON.map(function(error) {
      const { elementPath, message } = error
      const errorMsg = elementPath && showPath ?
        message + ' Element Path: ' + elementPath + '.' : message
      return '<li>' + toTitleCase(errorMsg) + '</li>'
    })
  } catch (err) {}
  setErrors(errorsArray.join(''), 'block');
}