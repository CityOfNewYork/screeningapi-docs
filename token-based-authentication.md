Once you have <a href="http://eepurl.com/gfLTuH" target="_blank">requested an account</a> and set your username and password (see [Getting Started](getting-started)), you will be able to retrieve a token for making additional requests. This requires the use of the `authToken` endpoint which accepts a JSON payload with your username and password. Below is a full example of a curl request of this method. The values within double brackets (`{{ value }}`) are variables where you would provide your information:

<div class="code-block"><pre>
curl -X POST \
  'https://screeningapi.cityofnewyork.us/authToken' \
  -H 'Content-Type: application/json' \
  -H 'cache-control: no-cache' \
  -d '{
    "username": "{{ username }}",
    "password": "{{ password }}"
  }'</pre></div>

## Response

A successful request will return a `token` in the response which means your password has been set.

<div class="code-block"><pre>
{
  "type": "SUCCESS",
  "token": "{{ your new token will here }}"
}</pre></div>

## Tokens

Once you have a token, you can use it along with your username to make requests to other endpoints. Tokens are set to expire every hour (or `3600` seconds) so you will need to keep track of the expiration to regenerate your token. Retrieving a new token can be done using the same `authToken` endpoint. All that’s needed is your username and password.

<div class="code-block"><pre>
curl -X POST \
  'https://screeningapi.cityofnewyork.us/authToken' \
  -H 'Content-Type: application/json' \
  -H 'cache-control: no-cache' \
  -d '{
    "username": "{{ username }}",
    "password": "{{ temporary password }}"
  }'</pre></div>

## Summary

* Contact us through [Support](mailto:screeningapi@nycopportunity.nyc.gov) if you need to update your account information.

* The `authToken` endpoint responds with a token that expires after 1 hour (`3600` seconds).

* The `authToken` endpoint is also used to retrieve new tokens.


## Next

<a href="making-a-request" title="Making a Request" class="btn">Making a Request <svg aria-hidden="true" class="icon-ui mis-1"><use xlink:href="#feather-arrow-right"></use></svg></a>
