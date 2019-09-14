const express = require('express');
const log = require('./utils/log');

const PORT = process.env.port || 8000

const app = express();

app.use(express.static('./public'));

app.listen(PORT, function() {
  log('[ EXPRESS ] - Serving web app on port:', PORT);
})