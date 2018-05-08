# authclient

This is a client for [authserver](https://github.com/ccojocar/authserver) identity provider. It can be used to validate the authorization code grant flow and also to retrieve the user details with an access token.

## Usage

After [registering a client](https://github.com/ccojocar/authserver#client-registration) with the `authserver`, you can start the `authclient` as follows:

```bash
export CLIENT_ID=<CLIENT ID>
export CLIENT_SECRET=<CLIENT_SECRET>
npm install
node app.js
```

The authorization code grant flow can be initiated by opening the `http://localhost:3001/userinfo` URL in a browser. The `authclient` will acquire an access token, and then it will retrieve the user details from `authserver` identity provider.
