## Response (Program Codes)
Successful responses will return a list of program names and codes of all of the programs and benefits the submitted household may be eligible for. These codes can be directly mapped to additional content hosted in the [Benefits and Programs API](https://data.cityofnewyork.us/Social-Services/Benefits-and-Programs-API/kvhd-5fmu) which includes the description, how to apply, links to downloadable applications, etc. Below are a few examples of codes and their corresponding programs. For a description of how the response is structured for each endpoint, please refer to the [endpoint documentation](endpoints).
  
|Program Code|Program Name|
|---|---|
| <b>S2R010</b> | Cash Assistance |
| <b>S2R001</b> | Child and Dependent Care Tax Credit |
| <b>S2R004</b> | Child Tax Credit |
| <b>S2R004</b> | Home Energy Assistance Program (HEAP) |
|…|…|

<div class="mb-2"></div>

See the full list on the [Benefits and Programs API](https://data.cityofnewyork.us/Social-Services/Benefits-and-Programs-API/kvhd-5fmu) page.

## Summary
* Your token is required for making a request.

* Use the testing domain for sample requests and development and the production domain for production level applications.

* The request body should include Household Composition Data that includes the household and person datatypes with as many of the available
parameters filled out possible for the most accurate eligibility evaluation.

* The request response will contain a list of program names and codes.

* Program codes can be mapped to additional content in the [Benefits and Programs API](https://data.cityofnewyork.us/Social-Services/Benefits-and-Programs-API/kvhd-5fmu).

## Next

<a href="endpoints" title="Endpoints" class="btn color-secondary-button">Endpoints&nbsp;&nbsp;❯</a>
