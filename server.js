const bodyParser = require('body-parser');
const express = require('express');
const axios = require('axios');
const Redmine = require('node-redmine');
const config = require('./config/keys.js');

const app = express();

var reqBody = {};

app.use(bodyParser.urlencoded({ extended: false }));

app.use(function (req, res) {
    //check if request came from the Slack team specified in config
    if ('token' in req.body && req.body.token == config.POST_TOKEN) {
        //check if message exists and not empty
        if ('text' in req.body && req.body.text.length > 0) {
            reqBody = req.body;
            //call the correct function based on message
            if (config.HELP_KEYWORD.indexOf(reqBody.text.toLowerCase()) >= 0) {
                sendHelpMessage(res);
            } else {
                if (reqBody.text.length < 15) {
                    returnIssueData(res);
                } else {
                    //pretty sure that will be an API-key
                    registerApiKey(res);
                }
            }
        } else {
            res.send('Missing or empty request parameter (text)');
        }
    } else {
        res.send('Missing or wrong config parameter (POST_TOKEN)!');
    }
});

const port = config.PORT;

app.listen(port);

function sendHelpMessage(res) {
    var helpMsgArr = config.HELP_CONFIG.text;
    var helpMsg = helpMsgArr.join('\n');

    var helpMessage = {
        "attachments": [
            {
                "color": config.HELP_CONFIG.color,
                "title": config.HELP_CONFIG.title,
                "title_link": config.HELP_CONFIG.title_link,
                "text": helpMsg,
                "mrkdwn": true
            }
        ],
        "response_type": "ephemeral"
    };

    var headers = {
        'Content-type': 'application/json;charset=utf-8',
    };

    axios.post(reqBody.response_url, helpMessage, { headers: headers })
        .then((res) => {
            console.log(`statuscode: ${res.statusCode}`);
        })
        .catch((error) => {
            console.log(error);
        });

}

//registers a new API-key to the DB
function registerApiKey() {

}

//returns information about the requested task
function returnIssueData(res) {
    var hostname = config.RM_HOST;
    var rmConfig = {
        apiKey: config.RM_DEFAULT_API_KEY
    };

    var rm = new Redmine(hostname, rmConfig);

    var issueData = {};
    var dump_issue = function (issue) {
        for (var item in issue) {
            issueData[item] = JSON.stringify(issue[item]);
        }
    }

    rm.get_issue_by_id(parseInt(reqBody.text), {}, function (err, data) {
        if (err) {
            //very basic error handling
            //TODO: make it better
            res.send(err);
            return;
        }


        dump_issue(data.issue);
        var issueResponse = createIssueResponse(issueData);

        var headers = {
            'Content-type': 'application/json;charset=utf-8',
        };

        axios.post(reqBody.response_url, issueResponse, { headers: headers })
            .then((res) => {
                console.log(`statuscode: ${res.statusCode}`);
            })
            .catch((error) => {
                console.log(error);
            });
    });

    //res.send('ok');
}

function createIssueResponse(issueData) {
    var helpMessage = {
        "attachments": [
            {
                "color": config.HELP_CONFIG.color,
                "title": config.HELP_CONFIG.title,
                "title_link": config.HELP_CONFIG.title_link,
                "text": "asdasdsad",
                "mrkdwn": true
            }
        ],
        "response_type": "in_channel"
    };

    return helpMessage;
}