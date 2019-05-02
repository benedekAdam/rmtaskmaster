const bodyParser = require('body-parser');
const express = require('express');
const redmine = require('node-redmine');

const app = express();

app.use(bodyParser.urlencoded({ extended: false }));

app.use(function (req, res) {
    res.setHeader('Content-Type', 'text/plain');
    res.write('body content:');
    res.end(JSON.stringify(req.body, null, 2));
});

app.listen(3000);