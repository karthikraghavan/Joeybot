var express = require('express')
var bodyParser = require('body-parser')
var request = require('request')
var app = express()

var welcomeMessage = {
    "setting_type": 'greeting',
    "greeting": {
        'text': 'Hello {{user_first_name}}, I am the Joey bot - I can help you with your Banking & Financial needs!'
    }
}
var messageData = {
    attachment: {
        type: 'template',
        payload: {
            template_type: 'generic',
            elements: [
                {
                     title: 'Hulu',
                    'subtitle': 'Earn $7.99 cash back with your subscription to Hulu. Stream original series, hit shows, movies & more!',
                    'image_url': 'https://www.android.com/intl/zh-TW_hk/new/images/tv/apps/hulu-plus.png',
                    'buttons': [
                          {
                              "type": "web_url",
                              "url": "https://bankofamerica.com/mobile",
                              "title": "Show Website"
                          },
                          {
                              'type': 'postback',
                              'title': 'Select',
                              'payload': 'postback deal 1'
                          }
                    ]
                },
                {
                    title: 'Chuck E. Cheese',
                    'subtitle': 'Try Chuck E.Cheese amazing Thin and Crispy pizza. Earn 10% cash back on your purchase',
                    'image_url': 'http://www.bbbsnwfl.org/atf/cf/%7B699040E0-8300-400C-BC25-DBDFE2E82B09%7D/Chuck%20E.%20Cheese%20Building.jpg',
                    'buttons': [
                          {
                              'type': 'postback',
                              'title': 'Select',
                              'payload': 'postback deal 2'
                          }
                    ]
                }
            ]
        }
    }
}
var persistantMenu = {
    "setting_type": "call_to_actions",
    "thread_state": "existing_thread",
    "call_to_actions": [
      {
          "type": "postback",
          "title": "Help",
          "payload": "DEVELOPER_DEFINED_PAYLOAD_FOR_HELP"
      },
      {
          "type": "postback",
          "title": "Start a New Order",
          "payload": "DEVELOPER_DEFINED_PAYLOAD_FOR_START_ORDER"
      },
      {
          "type": "web_url",
          "title": "Checkout",
          "url": "http://petersapparel.parseapp.com/checkout",
          "webview_height_ratio": "full",
          "messenger_extensions": true
      },
      {
          "type": "web_url",
          "title": "View Website",
          "url": "http://petersapparel.parseapp.com/"
      }
    ]
}


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
        res.send(req.query['hub.challenge']);
        sendWelcomeMessage();
    }
    res.send('Error, wrong token')
})

// handler receiving messages
app.post('/webhook', function (req, res) {
    var events = req.body.entry[0].messaging;
    
    for (i = 0; i < events.length; i++) {
        var event = events[i];
        if (event.message && event.message.text) {
           
            if (event.message.text == "Deals") {
                   sendGenericMessage(event.sender.id);
            }
            else if (event.message.text == "appointment") {
                sendMessage(event.sender.id, persistantMenu);
            }
        }
        else if (event.postback && event.postback.payload) {
            var text = JSON.stringify(event.postback);
            console.log(text);
            if (event.postback.payload.indexOf('postback') > -1) {
                sendMessage(event.sender.id, { text: "This deal is now active and ready for you to use. Just shop with any of your eligible credit/debit cards." });
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

// generic function sending messages
function sendWelcomeMessage() {
    request({
        url: 'https://graph.facebook.com/v2.6/me/thread_settings',
        qs: { access_token: process.env.PAGE_ACCESS_TOKEN },
        method: 'POST',
        json: {
            message: welcomeMessage
        }
    }, function (error, response, body) {
        if (error) {
            console.log('Error sending message: ', error);
        } else if (response.body.error) {
            console.log('Error: ', response.body.error);
        }
    });
};


// Spin up the server
app.listen(app.get('port'), function () {
    console.log('running on port', app.get('port'))
})

