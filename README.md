# node-gameapi

> Based on [Game Servers and Couchbase with Node.js](blog.couchbase.com/game-servers-and-couchbase-nodejs-part-1)

Simple data storage API concept project with support for:
* Session management via **Authorization** header
* Session renewal
* Lazy loading and optimistic locking
* CORS

To get started:
```bash
$ cd gameapi
gameapi$ npm install .
gameapi$ node lib/app.js
```

# gameapi-client
Javascript demo client included (/client/gameapi-client.html) will prompt for authentication and save cursor position using a custom onMouseStop listener every 15ms.
