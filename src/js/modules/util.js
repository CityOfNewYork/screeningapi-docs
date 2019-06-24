
const errorBoxId = 'errors'
const infoBoxId = 'info'

const toTitleCase = (string) => {
  console.log('in title case')
  return string.charAt(0).toUpperCase() + string.slice(1);
}

const setTextBox = (messageString, displayState, boxId) => {
  var ele = document.getElementById(boxId);
  ele.innerHTML = '<ul class="m-0 px-2">' +
    toTitleCase(messageString.trim()) + '</ul>';

  ele.style.display = displayState;

  if (displayState === 'none') {
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
  setTextBox('', 'none', errorBoxId)
  setTextBox('', 'none', infoBoxId)

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

const displayListText = (responseText, showPath, id) => {

}

export const displayErrors = (responseText, showPath) => {
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
  setTextBox(errorsArray.join(''), 'block', errorBoxId);
}

export const displayInfo = (infoText) => {
  const infoHTML = '<li>' + infoText + '</li>'
  setTextBox(infoHTML, 'block', infoBoxId);
}