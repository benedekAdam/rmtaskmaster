const bodyParser = require('body-parser');
const express = require('express');
const axios = require('axios');
const config = require('./config/keys.js');

const rmPromise = require('promised-redmine');

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
    //So we won't get a timeout error
    res.status(200).send('');
    var hostname = config.RM_HOST;
    var rmConfig = {
        host: config.RM_HOST_WITHOUT_PROTOCOL,
        apiKey: config.RM_DEFAULT_API_KEY,
        protocol: "https",
        verbose: true
    };

    var rm2 = new rmPromise(rmConfig);
    rm2.setVerbose(true);

    var issueData = {};

    rm2.getIssue(parseInt(reqBody.text)).success(function (issue) {
        console.log(issue);
        for (var item in issue) {
            issueData[item] = issue[item];
        }
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
}

function createIssueResponse(issueData) {
    console.log(issueData);
    var messageBody = {
        "attachments": [
            {
                "color": config.PRIORITY_COLORS[issueData.priority.id],
                "author_name": issueData.project.name,
                "author_link": config.RM_HOST + "/projects/" + issueData.project.id,
                "author_icon": "http://flickr.com/icons/bobby.jpg",
                "title": "#" + issueData.id + " - " + issueData.subject,
                "title_link": config.RM_HOST + "/issues/" + issueData.id,
                "text": "Optional text that appears within the attachment",
                "fields": [
                    {
                        "title": "Priority",
                        "value": "High",
                        "short": false
                    }
                ],
                "image_url": "http://my-website.com/path/to/image.jpg",
                "thumb_url": "http://example.com/path/to/thumb.png",
                "footer": "Slack API",
                "footer_icon": "https://platform.slack-edge.com/img/default_application_icon.png",
                "ts": 123456789
            }
        ],
        "response_type": "in_channel"
    };

    return messageBody;
}