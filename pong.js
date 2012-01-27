var app = require('express').createServer()
  , express = require('express')
  , io = require('socket.io').listen(app)
  , clients = {};

var tb = false;

app.use('/js', express.static(__dirname + '/js'));
app.use('/assets', express.static(__dirname + '/assets'));
app.listen(1337);
app.set("view engine", "html");
app.set("view options", {layout: false});

app.get('/', function (req, res) {
  res.redirect('/' + randomString());
});

app.get('/:hash', function (req, res) {
	res.sendfile(__dirname + '/index.html');
});

io.sockets.on('connection', function (socket) {
  	
	socket.on('move', function(data){
		//console.log(data);
		if(socket.isHost) {
			socket.peer.emit('opponentMove', data);
		} else {
			socket.hoster.emit('opponentMove', data);
		}
	});

	socket.on('msg', function(data){
		//console.log(data);
		if(socket.isHost) {
			socket.peer.emit('rMsg', data);
		} else {
			socket.hoster.emit('rMsg', data);
		}
	});

	socket.on('event', function(data){
		//console.log(data);
		if(socket.isHost) {
			socket.peer.emit('rEvent', data);
		} else {
			socket.hoster.emit('rEvent', data);
		}
	});
	socket.on('ready', function(data){
		//console.log("ready");	
		socket.emit('start', data);
		socket.hoster.emit('start', data);
	});

	socket.on('resetBall', function(data) {
		socket.hoster.emit('newBall', data);
	});
	
	socket.on('ack', function() {
		console.log("restart");
		if(socket.isHost) {
			socket.peer.emit('reset', 0);
			socket.emit('reset', 0);
		} else {
			socket.hoster.emit('reset', 0);
			socket.emit('reset', 0);
		}
		
	});

	socket.on('joiner', function (data) {

		len = io.sockets.clients(data).length;

		if(len == undefined || len == 0){
			socket.emit('host');
			socket.join(data);
			socket.isHost = true;
			socket.isPeer = false;
			socket.room = data;
			//console.log("joined");
		}
		else if(len == 1){
			socket.emit('peer');
			socket.join(data);
			socket.isHost = false;
			socket.isPeer = true;
			socket.room = data;
			socket.hoster = io.sockets.clients(data)[0];
			io.sockets.clients(data)[0].peer = socket;
			
			if(socket.hoster != undefined){
				socket.hoster.emit('rMsg', "HAS CONNECTED");
			}
		}
		else{
			socket.emit('warn', "This connection is full. Please try later.");
		}

		//io.sockets.in(data).emit('info', socket.id + " joined!");

	});	
});

function randomString() {
	var chars = "0123456789ABCDEFGHIJKLMNOPQRSTUVWXTZabcdefghijklmnopqrstuvwxyz";
	var string_length = 8;
	var randomstring = '';
	for (var i=0; i<string_length; i++) {
		var rnum = Math.floor(Math.random() * chars.length);
		randomstring += chars.substring(rnum,rnum+1);
	}
	return randomstring;
}
