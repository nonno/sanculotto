require('dotenv-extended').load();
var builder      = require('botbuilder');
var restify      = require('restify');
var http         = require('https');
var connector    = new builder.ChatConnector({appId: process.env.MICROSOFT_APP_ID, appPassword: process.env.MICROSOFT_APP_PASSWORD});
var bot          = new builder.UniversalBot(connector);

var formatAnswer = function(answer){
    var json = JSON.parse(answer);
    var res = '';
    
    if (!json.Message){
        res += json.Day + ' ' + json.MonthName + ' (' + json.Month + ') ' + json.Year + ', ' + json.DayName;
        if (json.Hour || json.Minute || json.Second){
            res += '. Ore ' + json.Hour + ' e ' + json.Minute;
        }
    } else {
        res = 'Scusa ma non ho capito, te lo spiego in inglese che è meglio: "' + json.Message + '"';
    }

    return res;
};

bot.dialog('/', [
    function(session) {
        var path = '/api/datetime';
        if (session.message && session.message.text){
            path += ('/' + encodeURI(session.message.text));
        }

        var options = {
            host: 'revolutionary-datetime-api.azurewebsites.net',
            method: 'GET',
            path: path
        };
        callback = function(response) {
            var answer = '';
            response.on('data', function (chunk) {
                answer += chunk;
            });
            response.on('end', function () {
                session.send(formatAnswer(answer));
            });
        };

        http.request(options, callback).end();
    },
]);

/* LISTEN IN THE CHAT CONNECTOR */
var server = restify.createServer();
server.listen(process.env.port || process.env.PORT || 3978, function () {
   console.log('%s listening to %s', server.name, server.url); 
});
server.post('/api/messages', connector.listen());