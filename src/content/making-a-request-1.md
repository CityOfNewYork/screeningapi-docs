# Making a Request

There are two steps to making a request which includes (1) getting a token and (2) making the request. Your api key and token are required for all requests. Your api key is sent to you when your [account is created](/request-account-form). Getting a token is described in [Set Password and Token Based Authentication](/set-password-and-token-based-on-authentication). The request body and response are sent as JSON so the `Content-Type` header must be set to `application/json`. Below is an example of the format for requests. The values within double brackets (`{{ value }}`) are variables where you would provide your information:

```
curl -X POST \
  'https://{{ domain }}/{{ endpoint }}' \
  -H 'Content-Type: application/json' \
  -H 'cache-control: no-cache' \
  -H 'x-api-key: {{ api-key }}' \
  -H 'Authorization: {{ token }}' \
  -d '{{ request body }}'
```

# Headers

Here is a full list of headers required for each request.

| Header | Value |
|--------|-------|
| Content-Type | application/json |
| x-api-key    | Your api key.|
| Authorization|A valid token retrieved via the `authToken` endpoint.

## Testing

Please note, there are two domains for sending requests, one for testing and one for production level applications. Please use the appropriate domain during testing and application development, as well as the production domain for production level applications.

## Request Body (Household Composition Data)

The request for each endpoint should contain certain datum pertinent to the household of the client for which eligibility is being evaluated. We refer to this as Household Composition Data. The entire dataset is made up of two distinct types:  Household and Person(s). Each type has different attributes that must be filled out as completely as possible for the most accurate eligibility evaluation. There can only be one type of Household and there can be more than one Person associated with each household.

Below is a list of all parameters and their description. For a description of how to structure the data for each endpoint, please refer to the [endpoint documentation](/swagger).