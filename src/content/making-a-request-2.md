## Response (Program Codes)
Successful responses will return a list of program names and codes of all of the programs and benefits the submitted household may be eligible for. These codes can be directly mapped to additional content hosted in the [Benefits and Programs API](https://data.cityofnewyork.us/Social-Services/Benefits-and-Programs-API/2j8u-wtju) which includes the description, how to apply, links to downloadable applications, etc. Below are a few examples of codes and their corresponding programs. For a description of how the response is structured for each endpoint, please refer to the [endpoint documentation](/swagger).

|Program Code|Program Name|
|--|--|
|S2R010|Cash Assistance|
|S2R001|Child and Dependent Care Tax Credit|
|S2R004|Child Tax Credit|
|...|...|

See the full list on the [Benefits and Programs API](https://data.cityofnewyork.us/Social-Services/Benefits-and-Programs-API/2j8u-wtju) page.

## Summary
* Your api key and a valid token is required for making a request.
* Set the `Content-Type` to `application/json`.
* The request body must be in JSON format.
* Use the testing domain for sample requests and development and the production domain for production level applications.
* The request body should include Household Composition Data that includes the household and person datatypes with as many of the available parameters filled out possible for the most accurate eligibility evaluation.
* The request response will contain a list of program names and codes
* Program codes can be mapped to additional content in the [Benefits and Programs API](https://data.cityofnewyork.us/Social-Services/Benefits-and-Programs-API/2j8u-wtju).

## Next

[Endpoints](/endpoints)

<br>
<br>