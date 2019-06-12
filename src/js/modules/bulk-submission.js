export default function() {
	const filename = 'response.csv'
	const toTitleCase = (string) => {
	    return string.charAt(0).toUpperCase() + string.slice(1);
	}

	const setErrors = (messageString, errorState) => {
	    var ele = document.getElementById('errors');
	        ele.innerHTML = '<ul class="error">' + toTitleCase(messageString.trim()) + '</ul>';
	        ele.style.display = errorState;
	}

	const sendPostRequest = (url, headersObject, responseHandler, requestPayload) => {
	    setErrors('', 'none')
	    document.getElementById('loader').style.display = 'block'
	    var req = new XMLHttpRequest();
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

	const displayErrors = (responseText, showPath) => {
	    var errorJSON
	    var errorsArray = []
	    try {
	        errorJSON = JSON.parse(responseText).errors
	        errorsArray = errorJSON.map(function(error) {
	            const { elementPath, message } = error
	            const errorMsg = elementPath && showPath ? message + ' Element Path: ' + elementPath + '.' : message
	            return '<li>' + toTitleCase(errorMsg) + '</li>'
	        })
	    }
	    catch (err) {}
	    setErrors(errorsArray.join(''), 'block');
	}

	const bulkSubmissionHandler = (req) => {
	    if (req.readyState === 4) {
	        const status = req.status.toString()
	        if (status.startsWith('4') || status.startsWith('5')) {
	            displayErrors(req.responseText, true)
	        }
	        else if (status.startsWith('2')) {
	            const blob = new Blob([req.response], {type : 'text/csv'})
	            if (typeof window.navigator.msSaveBlob !== 'undefined') {
	                window.navigator.msSaveBlob(blob, filename)
	            }
	            else {
	                const URL = window.URL || window.webkitURL
	                const downloadUrl = URL.createObjectURL(blob)

	                const a = document.createElement('a')
	                if (typeof a.download === 'undefined') {
	                    window.location = downloadUrl
	                }
	                else {
	                    a.href = downloadUrl
	                    a.download = filename
	                    document.body.appendChild(a)
	                    a.click()
	                }
	                setTimeout(() => {
	                    URL.revokeObjectURL(downloadUrl)
	                }, 100) // cleanup
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
	        Authorization : token,
	    }
	    var formData = new FormData();
	    formData.append("file", csvFile);
	    sendPostRequest(url, headersObject, bulkSubmissionHandler, formData)
	}

	const authResponseHandler = (formValues) => (req) => {
	    if(req.readyState === 4) {
	        const status = req.status.toString()
	        if (status.startsWith('4') || status.startsWith('5')) {
	            displayErrors(req.responseText, false)
	        }
	        else if (status.startsWith('2')) {
	            sendBulkSubmissionRequest(formValues, JSON.parse(req.responseText).token)
	        }
	    }
	}

	document.getElementById('bulkSubmissionSubmit').addEventListener('click', function () {
	    const baseurl = document.getElementById("baseurl").value
	    const username = document.getElementById("username").value
	    const password = document.getElementById("password").value
	    const newPassword = document.getElementById("newpassword").value
	    const programs = document.getElementById("newpassword").programs
	    const csvFileInput = document.getElementById("csv_upload")
	    const csvFile = csvFileInput.files && csvFileInput.files.length > 0 && csvFileInput.files[0]
	    let formValues = {
	    	baseurl: baseurl,
	    	username: username,
	    	password: password,
	    	csvFile: csvFile
	    }
	    if (newpassword) {
	    	formValues.newPassword = newPassword
	    }
	    if (programs) {
	    	formValues.programs = programs
	    }

	    console.log('csvFile: ', csvFile)
	    var url = baseurl + 'authToken'
	    var headersObject = {
	        'Content-type': 'application/json',
	        'Access-Control-Allow-Origin': '*',
	    }
	    const authPayload = { username, password }
	    if (newPassword) {
	        authPayload.newPassword = newPassword
	    }
	    sendPostRequest(url, headersObject, authResponseHandler(formValues), JSON.stringify(authPayload))
	});
}