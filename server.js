const bodyParser = require('body-parser');
const express = require('express');
const axios = require('axios');
const Redmine = require('promised-redmine');
const mongoose = require('mongoose');
const isHex = require('is-hex');
const moment = require('moment');

const keys = require('./config/keys.js');
const config = require('./config/config.js');
const User = require('./models/User');

const app = express();

var reqBody = {};

app.use(bodyParser.urlencoded({ extended: false }));

app.get('/', function (req, res) {
    res.status(200).send('OK');
})

app.use(function (req, res) {
    //check if request came from the Slack team specified in keys
    if ('token' in req.body && req.body.token == keys.POST_TOKEN) {
        //We won't get timeout errors this way
        res.status(200).send('');
        //check if message exists and not empty
        if ('text' in req.body && req.body.text.length > 0) {
            reqBody = req.body;
            //call the correct function based on message
            if (config.HELP_KEYWORD.indexOf(reqBody.text.toLowerCase()) >= 0) {
                sendHelpMessage(res);
            } else if (config.DELETE_KEYWORD.indexOf(reqBody.text.toLowerCase()) >= 0) {
                deleteUser(res);
            } else {
                if (reqBody.text.length < 15) {
                    if (Number.isInteger(parseInt(reqBody.text))) {
                        returnIssueData(res);
                    } else {
                        sendMessage('Wrong parameter, issue number must be a number', res, true);
                    }
                } else {
                    //pretty sure that will be an API-key
                    //but check anyway
                    if (isHex(reqBody.text)) {
                        registerApiKey(res);
                    } else {
                        sendMessage('Invalid API-key', res, true);
                    }
                }
            }
        } else {
            sendMessage('Missing or empty request parameter (text)', res, true);
        }
    } else {
        sendMessage('Missing or wrong keys parameter (POST_TOKEN)!', res, true);
    }
});

const port = keys.PORT;

app.listen(port);

function sendHelpMessage(res) {
    var helpMsg = config.HELP_CONFIG.text.join('\n');

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

    sendMessage(helpMessage, res);
}

function deleteUser(res) {
    mongoose.connect(keys.DB_ADDRESS, { useNewUrlParser: true })
        .then(() => console.log('db connected'))
        .catch((err) => console.log(err));

    User.findOne({ userid: reqBody.user_id }, function (err, currentUser) {
        if (err) console.log(err);
        if (currentUser === null) {
            sendMessage('There\'s nothing to delete; you\'re not registered', res, true);
        } else {
            currentUser.delete();
            sendMessage('User deleted', res);
        }
    });
}

//registers a new API-key to the DB
function registerApiKey(res) {
    mongoose.connect(keys.DB_ADDRESS, { useNewUrlParser: true })
        .then(() => console.log('db connected'))
        .catch((err) => console.log(err));
    User.findOne({ userid: reqBody.user_id }, function (err, currentUser) {
        if (err) console.log(err);
        if (currentUser === null) {
            //create the new user
            currentUser = new User();
            currentUser.userid = reqBody.user_id;
            currentUser.apikey = reqBody.text;
            currentUser.request_count = 0;

            currentUser.save(function (err) {
                if (!err) {
                    var message = 'Sikeres regisztráció';
                    sendMessage(message, res);
                } else {
                    console.log(err);
                }
            });
        } else {
            if (reqBody.text === currentUser.apikey) {
                sendMessage('User already registered, API key stays the same', res);
            } else {
                //update the key
                currentUser.apikey = reqBody.text;
                currentUser.save();
                sendMessage('User already registered, API key updated', res);
            }
        }
    });
}

//returns information about the requested task
function returnIssueData(res) {
    mongoose.connect(keys.DB_ADDRESS, { useNewUrlParser: true })
        .then(() => console.log('db connected'))
        .catch((err) => console.log(err));

    User.findOne({ userid: reqBody.user_id }, function (err, currentUser) {
        var userApiKey = keys.RM_DEFAULT_API_KEY;
        if (currentUser) {
            userApiKey = currentUser.apikey;
        }

        //TODO: error handling
        var rmConfig = {
            host: keys.RM_HOST_WITHOUT_PROTOCOL,
            apiKey: userApiKey,
            protocol: "https",
            verbose: true
        };


        var redmine = new Redmine(rmConfig);
        redmine.setVerbose(true);

        var issueData = {};
        redmine.getIssue(parseInt(reqBody.text)).success(function (issue) {
            for (var item in issue) {
                issueData[item] = issue[item];
            }
            var issueResponse = createIssueResponse(issueData);

            currentUser.request_count++;
            currentUser.save(function (err) {
                if (!err) {
                    sendMessage(issueResponse, res);
                } else {
                    res.send(err);
                }
            });
        });
    });
}

function createIssueResponse(issueData) {
    moment.locale('hu');
    var createDate = moment(issueData.created_on).format("YYYY-MM-DD");
    var updateDate = moment(issueData.updated_on).unix();
    var colors = config.PRIORITY_COLORS;
    var messageBody = {
        "attachments": [
            {
                "color": issueData.closed_on ? colors.closed : colors[issueData.priority.id], //if closed, apply another color
                "author_name": issueData.project.name,
                "author_link": keys.RM_HOST + "/projects/" + issueData.project.id,
                "author_icon": "http://flickr.com/icons/bobby.jpg",
                "title": "#" + issueData.id + " - " + issueData.subject,
                "title_link": keys.RM_HOST + "/issues/" + issueData.id,
                "text": issueData.description,
                "fields": [
                    {
                        "title": "Felvette",
                        "value": issueData.author.name,
                        "short": true
                    },
                    {
                        "title": "Felelős",
                        "value": issueData.assigned_to.name,
                        "short": true
                    },
                    {
                        "title": "Státusz",
                        "value": issueData.status.name,
                        "short": true
                    },
                    {
                        "title": "Prioritás",
                        "value": issueData.priority.name,
                        "short": true
                    },
                    {
                        "title": "Felvétel időpontja",
                        "value": createDate,
                        "short": true
                    },
                    {
                        "title": "Készültség",
                        "value": issueData.done_ratio + "%",
                        "short": true
                    }
                ],
                "image_url": "http://my-website.com/path/to/image.jpg",
                "thumb_url": "http://example.com/path/to/thumb.png",
                "footer": "Utolsó frissítés időpontja:",
                "ts": updateDate,
                "mrkdwn_in": ["text"]
            }
        ],
        "response_type": "in_channel"
    };

    return messageBody;
}

//Create &send a message about successful API-key registration
//It should only be visible for the user that sent the request
function sendMessage(message, res, error = false) {
    if (typeof message !== 'object') {
        var messageBody = {
            "attachments": [
                {
                    "color": error ? "#FF0000" : "#00ff00",
                    "title": error ? "Hiba" : "Siker",
                    "text": message
                }
            ],
            "response_type": "ephemeral"
        };
    } else {
        var messageBody = message;
    }

    var headers = {
        'Content-type': 'application/json;charset=utf-8',
    };

    axios.post(reqBody.response_url, messageBody, { headers: headers })
        .then((res) => {
            console.log(`statuscode: ${res}`);
        })
        .catch((error) => {
            console.log(error);
        });
}