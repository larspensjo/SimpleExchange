module.exports = {
  build: {
    "index.html": "index.html",
    "order.html": "order.html",
    "app.js": [
      "javascripts/app.js"
    ],
    "app.css": [
      "stylesheets/app.css"
    ],
    "images/": "images/"
  },
  deploy: [
    "SimpleExchange"
  ],
  rpc: {
    host: "localhost",
    port: 8545
  }
};
