README for NybleSoft Test API by Andrei Besedin

email: andrewprog97@gmail.com

.env configuration: 
    APP_PORT - port that API listens (default: 3000)
    DB_HOST - hostname of the Postgres server
    DB_PORT - port of the Postgres server
    DB_USERNAME - Postgres username
    DB_PASSWORD - Postgres password
    DB_NAME - Postgres database name
    EMAIL_HOST - hostname of the email service used in API
    EMAIL_PORT - port of the email service
    EMAIL_USER - email service username (sending email)
    EMAIL_PASSWORD - password for email service username

Start API with "npm run start"

Main API path: /api 


Auth functionalities: /api/auth
    /register-user (POST) - register user request (sends message to email with register comfirmation link)
        request body example: 
        {
            "firstName": "Ivan",
            "lastName": "Ivanov",
            "email": "ivan@mail.com"
        }
    /login-user (POST) - login user request (sends message to email with login comfirmation link)
        request body example:
        {
            "email": "ivan@mail.com"
        }
    /verify-auth (GET) - request in reference that is sent to email both while reg and login; returns HTML page with JS script to ask auth token and add it to localStorage
        URL example: http://localhost:3000/api/auth/verify-auth?type=reg&code=jfd743hHf7s2
    /get-auth-token (GET) - request to get token and to put it into localStorage
        URL example: http://localhost:3000/api/auth/get-auth-token?type=reg&code=jfd743hHf7s2


Data exchagning functionalities: /api/data
    /get-user-info (POST) - get user info request (only for authorized user)
        request body example:
        {
            "token": "jfd743hHf7s2jfd743hHf7s2"
        }
    /upload-image (PUT) - upload image request (only for authorized user)
        request body example:
        {
            "token": "jfd743hHf7s2jfd743hHf7s2",
            "img": "data:image/png;base64,R0lGO..."
        }
    /generate-pdf (POST) - generate PDF file for user by its email (for all users)
        request body example:
        {
            "email": "ivan@mail.com"
        }
        response example:
        {
            "ok": true,
            "pdf": [Blob in text]
        }
    /change-name (PUT) - change first and last name of user (only for authorized user) 
        request body example:
        {
            "firstName": "Vasya",
            "lastName": "Vasiliev",
            "token": "jfd743hHf7s2jfd743hHf7s2"
        }
    /delete-user (DELETE) - detele user (only for authorized user)
        request body example:
        {
            "token": "jfd743hHf7s2jfd743hHf7s2"
        }