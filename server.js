// require('coffee-script');
// require('./app');

var express = require('express'),
    app = express(),
    server = require('http').createServer(app);

    app.use('/assets', express.static(__dirname + '/assets'));
    app.use('/static', express.static(__dirname + '/static'));
    app.use(express.bodyParser());
    app.use(app.router);

app.get('/', function(req, res){
    require('fs').readFile(__dirname + '/assets/index.html', 'utf-8', 
        function(err, text) {
             res.send(text);
        });
});

app.listen(3000);
console.log("Server listen on port 3000");
