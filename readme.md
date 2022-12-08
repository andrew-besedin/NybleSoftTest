# NybleSoft Test API
Test task for NybleSoft internship.

By Andrei Besedin (email: andrewprog97@gmail.com)

<h2>.env configuration</h2>

```env
APP_PORT=""         # port that API listens (default: 3000)
DB_HOST=""          # hostname of the Postgres server
DB_PORT=""          # port of the Postgres server
DB_USERNAME=""      # Postgres username
DB_PASSWORD=""      # Postgres password
DB_NAME=""          # Postgres database name
EMAIL_HOST=""       # hostname of the email service used in API
EMAIL_PORT=""       # port of the email service
EMAIL_USER=""       # email service username (sending email)
EMAIL_PASSWORD=""   # password for email service username
```

<h2>Start API</h2>

```sh
npm run start
```

<h2>API Functionalities (/api)</h2>

<h3>Auth funcitonalities (/api/auth)</h3>

<hr></hr>

<b>(POST) api/auth/register</b>

Register user request (sends message to email with register comfirmation link)

<h5>Request body example</h5>

```json
{
    "firstName": "Ivan",
    "lastName": "Ivanov",
    "email": "ivan@mail.com"
}
```

<h5>Response example</h5>

```json
{
    "ok": false,
    "message": "invalidInput"
}
```
<hr></hr>

<b>(POST) api/auth/login</b>

Login user request (sends message to email with login comfirmation link)

<h5>Request body example</h5>

```json
{
    "email": "ivan@mail.com"
}
```

<h5>Response example</h5>

```json
{
    "ok": false,
    "message": "invalidInput"
}
```

<hr></hr>

<b>(GET) api/auth/verify-auth</b>

Request in reference that is sent to email both while reg and login; returns HTML page with JS script to ask auth token and add it to localStorage

<h5>URL example</h5>

```url
http://localhost:3000/api/auth/verify?type=reg&code=jfd743hHf7s2
```

<hr></hr>

<b>(GET) api/auth/token</b>

Get token and to put it into client localStorage

<h5>URL example</h5>

```url
http://localhost:3000/api/auth/token?type=reg&code=jfd743hHf7s2
```

<h5>Response example</h5>

```json
{
    "ok": false,
    "message": "invalidType"
}
```

<hr></hr>

<h3>Data exchanging funcitonalities (/api/data)</h3>

<hr></hr>

<b>(POST) api/data/info</b>

Get user info request (only for authorized user)

<h5>Request body example</h5>

```json
{
    "token": "jfd743hHf7s2jfd743hHf7s2"
}
```

<h5>Response example</h5>

```json
{
    "ok": true,
    "data": {
        "firstName": "Ivan",
        "lastName": "Ivanov",
        "email": "ivan@mail.com",
        "img": "data:image/png;base64,R0lGO..."
    }
}
```

<hr></hr>

<b>(PUT) api/data/image</b>

Upload image request (only for authorized user)

<h5>Request body example</h5>

```json
{
    "token": "jfd743hHf7s2jfd743hHf7s2",
    "img": "data:image/png;base64,R0lGO..."
}
```

<h5>Response example</h5>

```json
{
    "ok": false,
    "message": "invalidInput"
}
```

<hr></hr>

<b>(POST) api/data/pdf</b>

Generate PDF file for user by his email (for all users)

<h5>Request body example</h5>

```json
{
    "email": "ivan@mail.com"
}
```

<h5>Response example</h5>

```json
{
    "ok": true,
    "pdf": "[Blob in text]"
}
```

<hr></hr>

<b>(PUT) api/data/rename</b>

Change first and last name of user (only for authorized user) 

<h5>Request body example</h5>

```json
{
    "firstName": "Vasya",
    "lastName": "Vasiliev",
    "token": "jfd743hHf7s2jfd743hHf7s2"
}
```

<h5>Response example</h5>

```json
{
    "ok": false,
    "message": "invalidInput"
}
```

<hr></hr>

<b>(DELETE) api/data/delete</b>

Detele user (only for authorized user)

<h5>Request body example</h5>

```json
{
    "token": "jfd743hHf7s2jfd743hHf7s2"
}
```

<h5>Response example</h5>

```json
{
    "ok": false,
    "message": "invalidInput"
}
```

<hr></hr>