# Set Password and Token Based Authentication

Once you have [requested an account](/request-account-form) and received your username and temporary password, you will be able to set your password for making additional requests. This requires the use of the `authToken` endpoint which accepts a JSON payload with your username, temporary password, and new password. The new password field is not required on subsequent `authToken` requests but if populated your password will update. Below is a full example of a curl request of this method. The values within double brackets (`{{ value }}`) are variables where you would provide your information:

```
curl -X POST \
  'https://{{ domain }}/access-nyc-rest/authToken' \
  -H 'Content-Type: application/json' \
  -H 'cache-control: no-cache' \
  -d '{
    "username" : "{{ username }}",
    "password": "{{ temporary password }}",
    "newPassword": "{{ new password }}"
  }'
```

## Response

A successful request will return a `token` in the response which means your password has been set. 

```
{
  "type": "SUCCESS",
  "token": "{{ your new token will here }}"
}
```
Be sure to keep track of your password as it can only be done once. If, for any reason, you need to reset your password or update your account information please contact us through Support.

## Tokens

Once you have a token, you can use it along with your username to make requests to other endpoints. Tokens are set to expire every hour (or `3600` seconds) so you will need to keep track of the expiration to regenerate your token. Retrieving a new token can be done using the same `authToken` endpoint. All that’s needed is your username and password.

```
curl -X POST \
  'https://{{ domain }}/access-nyc-rest/authToken' \
  -H 'Content-Type: application/json' \
  -H 'cache-control: no-cache' \
  -d '{
    "username" : "{{ username }}",
    "password": "{{ temporary password }}"
  }'
```

## Forgot Password

If you forget your password, you can reset it with the `/forgotPassword` and `/confirmPassword` endpoints. 

```
curl -X POST \
  'https://{{ domain }}/access-nyc-rest/authToken' \
  -H 'Content-Type: application/json' \
  -H 'cache-control: no-cache' \
  -d '{
    "username" : "{{ username }}",
    "password": "{{ temporary password }}"
  }'
```

## Summary

Setting your new password can only be done once.

* Contact us through [Support](/feedback-and-support) if you need to update your account information.
* The `authToken` endpoint is used to set your new password using your username and temporary password.
* The `authToken` endpoint responds with a token that expires after 1 hour (`3600` seconds).
* The `authToken` endpoint is also used to retrieve new tokens.

<br>
<hr>

# Next

[Making a Request](/making-a-request).
