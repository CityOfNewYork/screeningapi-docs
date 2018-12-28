# Making a Request

There are two steps to making a request which includes (1) getting a token and (2) making the request. Your username and token is required for all requests. Your username is sent to you when your [account is created](/request-account-form). Getting a token is described in [Set Password and Token Based Authentication](/set-password-and-token-based-on-authentication). The request body and response are sent as JSON so the `Content-Type` header must be set to `application/json`. Below is an example of the format for requests. The values within double brackets (`{{ value }}`) are variables where you would provide your information:

```
curl -X POST \
  'https://{{ domain }}/access-nyc-rest/{{ endpoint }}' \
  -H 'Content-Type: application/json' \
  -H 'cache-control: no-cache' \
  -H 'username: {{ username }}' \
  -H 'Authorization: {{ token }}' \
  -d '{{ request body }}'
```

# Headers

Here is a full list of headers required for each request.

| Header | Value |
|--------|-------|
| Content-Type | application/json |
| username     | Your account username.|
| Authorization|A valid token retrieved via the `authToken` endpoint.

## Testing

Please note, there are two domains for sending requests, one for testing and one for production level applications. Please use the appropriate domain during testing and application development, as well as the production domain for production level applications.

## Request Body (Household Composition Data)

The request for each endpoint should contain certain datum pertinent to the household of the client for which eligibility is being evaluated. We refer to this as Household Composition Data. The entire dataset is made up of two distinct types:  Household and Person(s). Each type has different attributes that must be filled out as completely as possible for the most accurate eligibility evaluation. There can only be one type of Household and there can be more than one Person associated with each household.

Below is a list of all parameters and their description. For a description of how to structure the data for each endpoint, please refer to the [endpoint documentation](/swagger).

### Household
|Name|Description|Data Attribute|Possible Value|
| ----- | ----- | ----- | ----- |
|Members|Number of People in the household. Directly related to the number of Person types. Minimum is 1 and maximum value is 8. |members|Integer|Integer greater than 0 <br> Example: 1|
| Cash On Hand | How much does your whole household has right now in; cash on hand, checking or saving accounts, stocks, bonds or mutual funds.| cashOnHand | Numeric value greater than or equal to 0. <br> Example: 2000.00
|Renting | Renting the current living situation.| livingRenting | true/false|
|Housing Rental Type |The type of rental, if renting. |livingRentalType|String |Blank (“”) or one of the strings below below.|
||Non-Regulated or Market Rate apartment.||MarketRate|
||Rent controlled or rent stabilized apartment.||RentControlled|
||Family Home.||FamilyHome|
||Condo.||Condo|
||NYCHA Housing.||NYCHA|
||Rent Regulated Hotel/Single Room.||RentRegulatedHotel|
||Section 213 apartments.||Section213|
||Limited Dividend development apartments.||LimitedDividendDevelopment|
||Mitchell-Lama apartments.||MitchellLama|
||Redevelopment Company apartments.||RedevelopmentCompany|
||Housing Development Fund Company (HDFC) Cooperative.||HDFC|
|Owner of the Home or Apt.|A household member owns the home or apartment.|livingOwner|true/false|
|Staying with a Friend|Staying with a friend|livingStayingWithFriend|true/false|
|Hotel|In a hotel.|livingHotel|true/false|
|Shelter or Homeless|In a shelter or homeless.|livingShelter|true/false|
|Prefer not to Say|Preference to not disclose housing.|livingPreferNotToSay|true/false|

### Person
|Name|Description|Data Attribute|Value|
|-|-|-|-|
|Age|The age of the person.|age|Integer|Integer greater than 0. <br>Example: 31|
|Student|Whether the person is a student or not.|student|true/false|
|Full-time Student|Whether the person is a full-time student or not.|studentFulltime|true/false|
Pregnant|Whether the person is pregnant or not.|pregnant|true/false|
Unemployed|Whether the person is employed or not.|unemployed|true/false|
Unemployed and Worked in the Last 18 Months|Whether the person is unemployed and worked within the last 18 months.|unemployedWorkedLast18Months|true/false|
Is Blind|Whether the person is blind or not.|blind|true/false|
Has any Disabilities|Whether the person has disabilities or not.|disabled|true/false|
|Veteran|Whether the person is a veteran or not.|veteran|true/false|
|Receives Medicaid Benefits|Whether the person receives medicaid benefits or not.|benefitsMedicaid|true/false|
|Receives Disability-related Medicaid Benefits|Whether the person receives disability-related medicaid benefits or not.|benefitsMedicaidDisability|true/false|
|Is the Head of the Household.|Whether the person is the head of household or not. Note, only one person can be the head of household.|headOfHousehold|true/false|
|Relation to the Head of Household|If person isn’t the head of household, what is their relation to the head of household (see below).|
headOfHouseholdRelation|
String|Blank (“”) or one of the strings below below.|
||Child||Child
||Foster Child||FosterChild
||Step-child||StepChild
||Grandchild||Grandchild
||Spouse||Spouse
||Parent||Parent
||Foster Parent||FosterParent
||Step-parent||StepParent
||Grandparent||Grandparent
||Sister/Brother||SisterBrother
||Step-sister/Step-brother||StepSisterStepBrother
||Boyfriend/Girlfriend||BoyfriendGirlfriend
||Domestic Partner||DomesticPartner
||Unrelated||Unrelated
||Related in some other way||Other
|Owner or on deed|If the household owns the home, is the person the owner or on the deed.|livingOwnerOnDeed|true/false|
|Renting and on the Rental Lease.|If the household rental is renting, whether the person on the lease or not.|livingRentalOnLease|true/false|
|Income|A collection of one or more income objects.|incomes|`[{ “amount”: “200.00”, “type”: “Veteran”, “frequency”: “monthly”}, ...]`
||**Income amount.** The dollar amount of the income.|amount|Value greater than or equal to 0.<br>Example: 200.00|
||**Income type.** The type of the income (see below).|type|One of the strings below.|
||Wages, salaries, tips.||Wages|
||Self-employment income.||SelfEmployment|
||Unemployment benefits.||Unemployment|
||Cash Assistance grant.||CashAssistance|
||Child support (received).||ChildSupport|
||Disability-related Medicaid.||DisabilityMedicaid|
||Supplemental Security Income (SSI).||SSI|
||Social Security Dependent benefits.||SSDependent|
||Social Security Disability benefits.||SSDisability|
||Social Security Survivor’s benefits.||SSSurvivor|
||Social Security Retirement benefits.||SSRetirement|
||New York State Disability benefits.||NYSDisability|
||Veteran’s Pension or benefits.||Veteran|
||Government or Private Pension.||Pension|
||Withdrawals from Deferred Compensation (IRA, Keogh, etc.).||DeferredComp|
||Worker’s Compensation.||WorkersComp|
||Alimony (received).||Alimony|
||Boarder or lodger.||Boarder|
||Gifts/contributions (received)||Gifts|
||Rental income.||Rental|
||Investment income (interest, dividends, and profit from selling stocks).||Investment|
||**Income frequency.** How often the income is received.|frequency|One of the strings below.|
||Every week.||weekly|
||Every 2 weeks.||biweekly|
||Monthly||monthly|
||Twice a month.||semimonthly|
||Every year.||yearly||
Expenses| A collection of one or more expense objects. | expenses|`[{ “amount”: ”50.00”, “type”: ”Medical”, “frequency”: ”weekly”}, ...]`|
||**Expense amount.** The dollar amount of the expense.|amount|Value greater than or equal to 0.|Example: 50.00|
||**Expense type.** The type of the expense (see below).|type|One of the strings below.|
||Child care.||ChildCare|
||Child Support (paid).||ChildSupport|
||Dependent Care.||DependentCare|
||Rent||Rent|
||Medical expense||Medical|
||Heating||Heating|
||Cooling||Cooling|
||Mortgage||Mortgage|
||Utilities||Utilities|
||Telephone||Telephone|
||Third party insurance premiums.||InsurancePremiums|
||**Expense frequency.** How often the expense is paid (see below).|frequency|One of the strings below.|
||Every week.||weekly|
||Every 2 weeks.||biweekly|
||Monthly||monthly|
||Twice a month.||semimonthly|
||Every year.||yearly|

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
* Your username and a valid token is required for making a request.
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
