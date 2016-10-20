var express = require('express')
var bodyParser = require('body-parser')
var request = require('request')
var app = express()

app.set('port', (process.env.PORT || 5000))

// Process application/x-www-form-urlencoded
app.use(bodyParser.urlencoded({ extended: false }))

// Process application/json
app.use(bodyParser.json())

// Index route
app.get('/', function (req, res) {
    res.send('Hello world, I am a chat bot')
})

// for Facebook verification
app.get('/webhook/', function (req, res) {
    if (req.query['hub.verify_token'] === 'my_voice_is_my_password_verify_me') {
        res.send(req.query['hub.challenge'])
    }
    res.send('Error, wrong token')
})

// handler receiving messages
app.post('/webhook', function (req, res) {
    var events = req.body.entry[0].messaging;
    for (i = 0; i < events.length; i++) {
        var event = events[i];
        if (event.message && event.message.text) {
            if (event.message.text == "What is my checking account balance") {
                sendMessage(event.sender.id, { text: "Checking account balance is $50" });
            }
            else if (event.message.text == "send $50 to Joey") {
                sendMessage(event.sender.id, { text: "Transfer completed successfully" });
            }
            else if (event.message.text == "pay $500 to AT&T") {
                sendMessage(event.sender.id, { text: "Payment completed successfully" });
            }
            else 
            {
                sendGenericMessage(event.sender.id);
            }

        }
    }
    res.sendStatus(200);
});

// generic function sending messages
function sendMessage(recipientId, message) {
    request({
        url: 'https://graph.facebook.com/v2.6/me/messages',
        qs: { access_token: process.env.PAGE_ACCESS_TOKEN },
        method: 'POST',
        json: {
            recipient: { id: recipientId },
            message: message,
        }
    }, function (error, response, body) {
        if (error) {
            console.log('Error sending message: ', error);
        } else if (response.body.error) {
            console.log('Error: ', response.body.error);
        }
    });
};


function sendGenericMessage(sender) {
    messageData = {
        attachment: {
            type: 'template',
            payload: {
                template_type: 'generic',
                elements: [
                    {
                        title: '24th Street',
                        'subtitle': '43 mins, 9 cars. 58 mins, 9 cars. 73 mins, 9 cars.'
                    },
                    {
                        title: 'Daly City',
                        'subtitle': '43 mins, 9 cars. 58 mins, 9 cars. 73 mins, 9 cars. 1 min, 9 cars. 4 mins, 9 cars.'
                    },
                    {
                        title: 'Millbrae',
                        'subtitle': '8 mins, 4 cars. 23 mins, 4 cars. 38 mins, 4 cars. 13 mins, 5 cars.'
                    }
                ]
            }
        }
    };
    request({
        url: 'https://graph.facebook.com/v2.6/me/messages',
        qs: { access_token: process.env.PAGE_ACCESS_TOKEN },
        method: 'POST',
        json: {
            recipient: { id: sender },
            message: messageData,
        }
    }, function (error, response, body) {
        if (error) {
            console.log('Error sending messages: ', error)
        } else if (response.body.error) {
            console.log('Error: ', response.body.error)
        }
    });
};


// Spin up the server
app.listen(app.get('port'), function () {
    console.log('running on port', app.get('port'))
})