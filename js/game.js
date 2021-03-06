(function() {
	var player,
		opponent,
		right,
		left,
		offsetTop,
		gameBottom,
		can, 
		ctx, 
		cWidth = 800, 
		cHeight = 400,
		pi = Math.PI*2,
		leftLimit = 10,
		rightLimit = cWidth - 10,
		ball,
		time,
		reset = false,
		count = 0,
		peer = false,
		waiting = false,
		latestEvent = null,
		latestType = 0,
		playerToUpdate,
		lEv = false,
		hostBoxMsg = "<h2>You have started a new game!</h2><p>Send this URL: <input id='bUrl' onClick='this.select();' size=20 /> to someone in order to challenge them to a game.</p><p style='padding-top 3px'>You are playing from the left </p><p> <img class='left' src='assets/arrow.png' /></p><p><a class='' href='/'>How to play?!</a></p><p><a class='close ok' style='font-size:20pt; text-decoration: none;' href='/'>OK</a></p>",
		peerBoxMsg = "<h2>You have joined a game!</h2> <p>You are playing from the right </p><p> <img  src='assets/arrow.png' /></p><p><a class='' href='/'>How to play?!</a></p><p><a class='pclose' style='font-size:20pt; text-decoration: none;' href='/'>OK</a></p>";

	//some code adapted from share.gun.io
	socket.on('connect', function(data){
		socket.emit('joiner', $.url().segment(1));
	});
	
	socket.on('host', function(data){
		var l = ((window.innerWidth /2) - 200);
		console.log("You're hosting this party!");
		$('#stBox').remove();
		player = new Player(0, 0);
		opponent = new Player(1, 790);			
		left = player;
		right = opponent;
		
		$("#msgBox").html(hostBoxMsg);
		$("#msgBox").offset({left: l}).slideFadeToggle(function() { 
				//$("#bUrl").val(document.location.href);
				document.getElementById('bUrl').value = document.location.href;
				console.log(1);
        });
	});
	
	socket.on('peer', function(data){
		var l = ((window.innerWidth /2) - 200);
		console.log("You're not hosting.");
		peer = true;
		
		$("#msgBox").html(peerBoxMsg);
		$("#msgBox").offset({left: l}).slideFadeToggle();
		
		$('#stBox').dblclick(function() {
			ball = new Ball(400, 200);
			socket.emit('ready', JSON.stringify(ball));
			$('#stBox').hide();
		});

		player = new Player(1, 790);
		opponent = new Player(0, 0);			
		left = opponent;
		right = player;
	});
	
	socket.on('start', function(data){
		$('#wBox').hide();
		ball = JSON.parse(data);
		time = setInterval(step, 20);
	});
	
	socket.on('newBall', function(data){
		ball = JSON.parse(data);
	});
	
	socket.on('opponentMove', function(data){
		opponent.y = JSON.parse(data);
	});

	socket.on('rMsg', function(data){
		$("#chat").append("Opponent: " + data + "\n");	
		$("#chat").scrollTop(99999);
	

		//#7AF619.animate({ opacity: 'toggle', height: 'toggle' }, "fast", easing, callback);
	})

	socket.on('rEvent', function(data){
		latestEvent = JSON.parse(data);
		lEv = true;
		
	});
	
	socket.on('reset', function(data){
			doReset();
	});
	
	$(document).ready(function() {
		
		offsetTop = $("#cnvs").offset().top;
		gameBottom = (offsetTop + 350);
		can = document.getElementById("cnvs");
		ctx = can.getContext('2d');
		bindMouse();
		$("#url").html(document.location.href);
		
		
		$('#tMsg').keydown(function(event) {
			if (event.keyCode == '13') {
				event.preventDefault();
				var dMsg = $("#tMsg").val();
				socket.emit('msg', JSON.stringify(dMsg));			
				$("#chat").append("You: " + dMsg + "\n");	
				$("#tMsg").val("");
				$("#chat").scrollTop(99999);
			}
		});
		
		if (ctx){
			ctx.fillStyle = "#fff";
			ctx.strokeStyle = "#fff";
			ctx.lineWidth   = 4;
			ctx.font = "30pt Lucida Console";
			ctx.textAlign = "center";
			ctx.textBaseline = "middle";
			ctx.fillStyle = "#fff";			
			$('#ld').hide();			
		} else {
			alert("something went wrong, are you using an old/IE browser?");
		}
	});
	
	$(".close").live('click', function() {
            $("#msgBox").slideFadeToggle();
			$('#wBox').show();
            return false;
    });
	
	$(".pclose").live('click', function() {
            $("#msgBox").slideFadeToggle();
			$('#stBox').show();
            return false;
    });
	
	function step() {
		if(!reset) {
			if(!waiting) {
					handleMouse();
					ballLogic();					
					socket.emit('move', JSON.stringify(player.y));
					draw();
			} else {
				console.log("waiting...");
				if(lEv) {					
					if(latestEvent.type == 1) {
						ball.dX = -ball.dX;
						ball.dY = latestEvent.ndY;
						//console.log("opponent hit");
					} else {
						//opponent missed
						socket.emit("ack");
					}
					waiting = false;
					latestEvent = null;
					lEv = false;
				}
			}
		} else {
			count++;
			if(count >= 35) {
				count = 0;
				reset = false;
				waiting = false;
			} else if(count === 1) {
				playerToUpdate.score++;	
				if(peer) {
					ball = new Ball(400, 200);
					socket.emit("resetBall", JSON.stringify(ball));
				}
			}
		}
	}
	
	function handleMouse() {
		player.ppY = player.y;
		player.y = player.mouseY;
		console.log(player.y - player.ppY);
	
		if(player.y <= 24) {
			player.y = 25;
		}
		
		if(player.y >= 374) {
			player.y = 375;
		}
	}
	
	function ballLogic() {
		var d;
		ball.X += ball.dX;
		ball.Y += ball.dY;

		if (ball.X > rightLimit) {
			if(ball.Y > (right.y - 30) && (ball.Y < (right.y + 30))) {
				if(player == right) {
					var diff = player.y - player.ppY,
						nBallY = 0;
					
					if(diff > 16) {
						nBallY = 16;
					} else if (diff < -16) {
						nBallY = -16;
					} else if (diff ===0){
						nBallY = ball.dY;
					} else {
						nBallY = diff;
					}
					
					
					ball.dX = -ball.dX;
					ball.dY = nBallY;
					var eData = {
						ballY: ball.Y,
						playerY: player.Y,
						ndY: nBallY,
						type: 1
					};
					socket.emit("event", JSON.stringify(eData));
				} else {
					waiting = true;
					latestType = 1;
					playerToUpdate = left;	
				}
			} else {
					if(player == right) {
						var eData = {
								ballY: ball.Y,
								playerY: player.Y, 
								type: 0
						};
						socket.emit("event", JSON.stringify(eData));
						playerToUpdate = left;
						waiting = true;
						//left.score++;
						//console.log("P: " + player.score + " O:" + opponent.score); 
						//doReset();
						//console.log("p miss");
					} else {
						
						waiting = true;
						latestType = 0;
						playerToUpdate = left;
					}
				
			}	
		} else if (ball.X < leftLimit) {
			if(ball.Y > (left.y - 30) && (ball.Y < (left.y + 30))) {
				//ball.dX = -ball.dX;
				
				if(player == left) {
					
					var diff = player.y - player.ppY,
						nBallY = 0;
					//console.log("diff: " + diff);
					if(diff > 16) {
						nBallY = 16;
					} else if (diff < -16) {
						nBallY = -16;
					} else if (diff ===0){
						nBallY = ball.dY;
					} else {
						nBallY = diff;
					}
					ball.dX = -ball.dX;
					ball.dY = nBallY;
					
					var eData = {
						ballY: ball.Y,
						playerY: player.Y,
						ndY: nBallY,
						type: 1
					};
					socket.emit("event", JSON.stringify(eData));
					//console.log("p hit");
				} else {
					waiting = true;
					latestType = 1;
					playerToUpdate = right;						
				}		
			} else {
					if(player == left) {
						var eData = {
							ballY: ball.Y,
							playerY: player.Y, 
							type: 0
						};
						socket.emit("event", JSON.stringify(eData));
						waiting = true;
						//console.log("p miss");
						//right.score++;
						playerToUpdate = right;
						//console.log("P: " + player.score + " O:" + opponent.score); 
						//doReset();
					} else {			
						waiting = true;
						latestType = 0;
						playerToUpdate = right;
					}	
				
			}			
		}
		
        if (ball.Y + ball.dY > cHeight || ball.Y + ball.dY < 0) {			
			ball.dY = -ball.dY;
			//console.log(ball.dY); //pos down, neg up
		}
	}
	
	function doReset() {
		reset = true;
	}
	
	function drawPlayer(o) {	
		ctx.fillRect(o.x, (o.y - 25), 10, 50);
	}
	
	function drawBall() {
		ctx.beginPath();
		ctx.arc(ball.X, ball.Y, 5, 0, Math.PI*2,true); // Outer circle
		ctx.fill();
	}
	
	function drawLine() {
		var y = 0;
		
		ctx.beginPath();
		
		ctx.moveTo(400, 0);
		
		while(y < 400) {
			y += 20;
			ctx.lineTo(400, y);
			y += 10;
			ctx.moveTo(400, y);
		}
		
		ctx.closePath();
		ctx.stroke();
	}
	
	function drawScore() {
		ctx.fillText(left.score, 350, 40);	
		ctx.fillText(right.score, 450, 40);
	}
	
	function draw() {
		ctx.clearRect(0, 0, cWidth, cHeight);
		drawPlayer(player);
		drawPlayer(opponent);
		drawBall();
		drawLine();
		drawScore();
	}
	
	function bindMouse() {
		$("body").mousemove(function(e){
			//player.ppY = player.pY;
			//player.pY = player.y;
			player.mouseY = e.clientY;
		});
	}
	
	function Player(s, l) {
		this.mouseX = 0;
		this.mouseY = 0;
		
		this.y = 175;
		this.x = l;
		this.pY = 175;
		this.ppY = 175; //previous previos Y
		this.count;
		this.side = s; 
		this.score = 0;
	}
	
	function Ball(X, Y) 
	{
		var dX = 0, dY = 0;
		
		if(Math.floor(Math.random()* 100) > 50) {
			dX = 8;
		} else {
			dX = -8;
		}
		
		while(dY === 0)
		{
			dY = (Math.floor(Math.random()* 16)) - 8;                                    
		}
		this.X = X; 
		this.Y = Y; 		
		this.dX = dX;
		this.dY = dY; 
	}
	
	$.fn.slideFadeToggle = function(easing, callback) {
        return this.animate({ opacity: 'toggle', height: 'toggle' }, "fast", easing, callback);
    };
	
})();
