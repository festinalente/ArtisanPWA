const server_port = process.env.PORT || 8080;
console.log('Process env: ' + process.env.NODE_ENV);
const app = require('./server.js').startApp(server_port);
