/*
	Kurve

	Version: 1.0
	Author: David Laurell <david@laurell.nu>
	License: GPLv3

    This program is free software: you can redistribute it and/or modify
    it under the terms of the GNU General Public License as published by
    the Free Software Foundation, either version 3 of the License, or
    (at your option) any later version.

    This program is distributed in the hope that it will be useful,
    but WITHOUT ANY WARRANTY; without even the implied warranty of
    MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
    GNU General Public License for more details.

    You should have received a copy of the GNU General Public License
    along with this program.  If not, see <http://www.gnu.org/licenses/>.
 */

/**
 * Check the length between the points x,y and x2,y2
 */
function len(x,y,x2,y2) {
	return Math.sqrt(Math.pow(x2-x, 2)+Math.pow(y2-y, 2));
}

/**
 * Check if a line that starts in l1x1,l1y1 and ends in l1x2,l1y2 intersects with a line that
 * starts in l2x1,l2x2 and ends in l2x2,l2y2.
 */
function intersects(l1x1,l1y1,l1x2,l1y2,l2x1,l2y1,l2x2,l2y2) {
	var a1 = l1y2-l1y1;
	var b1 = l1x1-l1x2;
	var c1 = a1*l1x1+b1*l1y1;
	
	var a2 = l2y2-l2y1;
	var b2 = l2x1-l2x2;
	var c2 = a2*l2x1+b2*l2y1;
	
	var det = a1*b2 - a2*b1;
	
	if(det != 0) {
		var x = (b2*c1-b1*c2) / det;
		var y = (a1*c2-a2*c1) / det;
		
		if(x >= Math.min(l1x1,l1x2) && x <= Math.max(l1x1,l1x2) &&
				y >= Math.min(l1y1,l1y2) && y <= Math.max(l1y1,l1y2) &&
				x >= Math.min(l2x1,l2x2) && x <= Math.max(l2x1,l2x2) &&
				y >= Math.min(l2y1,l2y2) && y <= Math.max(l2y1,l2y2)) {
			return true;
		}
	}
	
	return false;
}

/**
 * Constructor for a Player
 */
function Player(color, leftKey, rightKey, canvas) {
	this.enabled = false;
	this.dead = false;
	this.x = 0;
	this.y = 0;
	this.dir = 0;
	this.score = 0;
	this.color = color;
	this.tail = [];
	this.speed = 0.07;
	this.rotSpeed = 0.15;
	this.leftKey = leftKey;
	this.rightKey = rightKey;
	this.canvas = canvas;
	this.lineLength = 0;
}

/**
 * This method for moves the player witch a specified delta.
 */
Player.prototype.move = function(delta) {
	if(this.leftKey.down)
		this.dir += this.rotSpeed * delta;
	if(this.rightKey.down)
		this.dir -= this.rotSpeed * delta;
	
	this.x += Math.sin(this.dir * Math.PI / 180) * this.speed * delta;
	this.y += Math.cos(this.dir * Math.PI / 180) * this.speed * delta;
	
	if(this.tail.length == 0 || len(this.tail[this.tail.length-1].x,
			this.tail[this.tail.length-1].y,
			this.x,
			this.y) > 10) {
		var hole = false;
		
		if(this.lineLength > 5 && Math.round(Math.random() * 3) == 3) {
			this.lineLength = 0;
			hole = true;
		}
		
		this.tail.push({x: this.x, y: this.y, hole: hole});
		this.lineLength++;
	}
};

/**
 * This method checks if the player collides with player p2
 */
Player.prototype.collideWith = function(p2) {
	if(this.tail.length > 1 && p2.tail.length > 1) {
		var p1x1 = this.tail[this.tail.length-2].x;
		var p1y1 = this.tail[this.tail.length-2].y;
		var p1x2 = this.tail[this.tail.length-1].x;
		var p1y2 = this.tail[this.tail.length-1].y;
		
		for(var i=1;i<p2.tail.length;i++) {
			if(!p2.tail[i].hole) {
				var p2x1 = p2.tail[i-1].x;
				var p2y1 = p2.tail[i-1].y;
				var p2x2 = p2.tail[i].x;
				var p2y2 = p2.tail[i].y;
				
				if(intersects(p1x1,p1y1,p1x2,p1y2,p2x1,p2y1,p2x2,p2y2))
					return true;
			}
		}
	}
	
	return false;
};

/**
 * This checks if the player is making suicide by going into itself or outside the room.
 */
Player.prototype.suicide = function() {
	if(this.x < 0 || this.y < 0 || this.x > this.canvas.width - 120 || this.y > this.canvas.height) {
		return true;
	}
	
	if(this.tail.length > 2) {
		var p1x1 = this.tail[this.tail.length-2].x;
		var p1y1 = this.tail[this.tail.length-2].y;
		var p1x2 = this.tail[this.tail.length-1].x;
		var p1y2 = this.tail[this.tail.length-1].y;
		
		for(var i=1;i<this.tail.length-2;i++) { //-2 = dont compare same lines
			if(!this.tail[i].hole) {
				var p2x1 = this.tail[i-1].x;
				var p2y1 = this.tail[i-1].y;
				var p2x2 = this.tail[i].x;
				var p2y2 = this.tail[i].y;
				
				if(intersects(p1x1,p1y1,p1x2,p1y2,p2x1,p2y1,p2x2,p2y2)) {
					return true;
				}
			}
		}
	}
	
	return false;
};

/**
 * This method resets the player at a random location.
 */
Player.prototype.reset = function() {
	this.tail = [];
	this.x = Math.random() * (this.canvas.width-120);
	this.y = Math.random() * this.canvas.height;
	this.dir = Math.random() * 360;
	this.dead = false;
	this.rightKey.down = false;
	this.leftKey.down = false;
};

/**
 * Constructor for making a game state
 */
function State() {
	this.ondraw = function(delta){};
	this.onupdate = function(ctx){};
	this.onkeyup = function(event){};
	this.onkeydown = function(event){};

	var s = this;

	this.update = function(delta) {
		s.onupdate(delta);
	};
	this.draw = function(ctx){
		s.ondraw(ctx);
	};
	this.keyDown = function(event) {
		s.onkeydown(event);
	};
	this.keyUp = function(event){
		s.onkeyup(event);
	};
}

/**
 * Get the game size of the canvas.
 */
function getGameSize(canvas) {
	var h;
	var w;
	var ratio = canvas.width / canvas.height;
	var whd = w/h;

	if(window.innerWidth > window.innerHeight) {
		w = window.innerHeight * ratio;
		h = window.innerHeight;
	}
	else {
		w = window.innerWidth;
		h = window.innerWidth / ratio;
	}

	return {width: w, height: h};
}

/**
 * Starts the game
 */
function play() {
	var canvas = document.getElementById("game");
	var s = getGameSize(canvas);
	canvas.style.height = s.height + "px";
	canvas.style.width = s.width + "px";

	window.onresize = function(event) {
		var s = getGameSize(canvas);
		canvas.style.height = s.height + "px";
		canvas.style.width = s.width + "px";
	};
	
	var ctx = canvas.getContext("2d");
	var players = [
		new Player("#33f", {code: 65, down: false, name: "A"}, {code: 68, down: false, name: "D"}, canvas),
		new Player("#f3f", {code: 74, down: false, name: "J"}, {code: 76, down: false, name: "L"}, canvas),
		new Player("#f33", {code: 37, down: false, name: "L arrow"}, {code: 39, down: false, name: "R arrow"}, canvas),
		new Player("#3f3", {code: 97, down: false, name: "Num 1"}, {code: 99, down: false, name: "Num 3"}, canvas)
	];
	
	var menuState = new State();
	var gameState = new State();
	var currentState = menuState;

	var drawPlayer = function(player) {
		ctx.lineJoin = "round";
		ctx.lineWidth = 4;
		ctx.strokeStyle = player.color;
		ctx.beginPath();
		for(var i=1;i<player.tail.length; i++) {
			if(!player.tail[i].hole) {
				ctx.moveTo(player.tail[i-1].x,player.tail[i-1].y);
				ctx.lineTo(player.tail[i].x,player.tail[i].y);
			}
		}
		if(player.tail.length > 0) {
			var last = player.tail.length - 1;
			ctx.moveTo(player.tail[last].x,player.tail[last].y);
			ctx.lineTo(player.x, player.y);
		}
		ctx.closePath();
		ctx.stroke();
	};

	gameState.onupdate = function(delta) {
		for(var i=0;i<players.length;i++) {
			if(players[i].enabled && !players[i].dead)
				players[i].move(delta);
		}
		
		var alive = 0;
		var dead = 0;
		for(var i=0;i<players.length;i++) {
			if(players[i].enabled && players[i].dead)
				dead++;
			if(players[i].enabled && !players[i].dead)
				alive++;
		}

		for(var i=0;i<players.length;i++) {
			if(players[i].enabled && !players[i].dead && players[i].suicide()) {
				players[i].score+=dead;
				players[i].dead = true;
				continue;
			}
			for(var j=0;j<players.length;j++) {
				if(i != j && players[i].enabled && !players[i].dead && players[i].collideWith(players[j])) {
					players[i].score+=dead;
					players[i].dead = true;
				}
			}
		}

		if(alive <= 1) {
			for(var i=0;i<players.length;i++) {
				if(players[i].enabled && !players[i].dead)
					players[i].score += dead;

				players[i].reset();
			}
		}
	};

	gameState.ondraw = function(ctx) {
		ctx.save();
		ctx.fillStyle = "#111";
		ctx.fillRect(canvas.width-120,0,canvas.width,canvas.height);

		for(var i=0;i<players.length;i++) {
			if(players[i].enabled) {
				drawPlayer(players[i]);
			}
			
			if(players[i].enabled)
				ctx.fillStyle = players[i].color;
			else
				ctx.fillStyle = "#ccc";

			ctx.textAlign = "center";
			ctx.textBaseline = "middle";
			ctx.font = "60px sans-serif";
			ctx.fillText(players[i].score, canvas.width - 80, canvas.height/8 + i * (canvas.height/4));
		}
		ctx.restore();
	};

	gameState.onkeydown = function(event) {
		for(var i=0; i<players.length;i++) {
			if(players[i].enabled && !players[i].dead && event.keyCode == players[i].leftKey.code)
				players[i].leftKey.down = true;

			if(players[i].enabled && !players[i].dead && event.keyCode == players[i].rightKey.code)
				players[i].rightKey.down = true;
		}
	};

	gameState.onkeyup = function(event) {
		for(var i=0; i<players.length;i++) {
			if(players[i].enabled && !players[i].dead && event.keyCode == players[i].leftKey.code)
				players[i].leftKey.down = false;

			if(players[i].enabled && !players[i].dead && event.keyCode == players[i].rightKey.code)
				players[i].rightKey.down = false;
		}

		if(event.keyCode == 27) {
			currentState = menuState;
			for(var i=0;players.length;i++) {
				players[i].enabled = false;
				players[i].score = 0;
			}
		}
	};

	var noEnabled = 0;
	menuState.onkeyup = function(event) {
		noEnabled = 0;
		for(var i=0; i<players.length;i++) {
			if(event.keyCode == players[i].leftKey.code || event.keyCode == players[i].rightKey.code)
				players[i].enabled = true;

			if(players[i].enabled)
				noEnabled++;
		}

		if(event.keyCode == 13 && noEnabled > 1) {
			currentState = gameState;

			for(var i=0;i<players.length;i++) {
				if(players[i].enabled)
					players[i].reset();
			}
		}
		if(event.keyCode == 27) {
			for(var i=0;players.length;i++) {
				players[i].enabled = false;
				noEnabled = 0;
			}
		}
	};

	menuState.ondraw = function(ctx) {
		ctx.save();
		ctx.fillStyle = "#800";
		ctx.textAlign = "center";
		ctx.textBaseline = "middle";
		ctx.font = "120px sans-serif";
		ctx.fillText("Kurve", canvas.width/2, canvas.height/3);

		ctx.fillStyle = "#ccc";
		ctx.textAlign = "center";
		ctx.textBaseline = "middle";
		ctx.font = "20px sans-serif";
		if(noEnabled > 1)
			ctx.fillText("Press enter to start game", canvas.width/2, canvas.height/2);
		else
			ctx.fillText("Select at least 2 users to play.", canvas.width/2, canvas.height/2);


		for(var i=0;i<players.length;i++) {
			ctx.fillStyle = players[i].color;
			ctx.textAlign = "center";
			ctx.textBaseline = "top";
			ctx.font = "30px sans-serif";
			ctx.fillText("Player " + (i+1), (canvas.width / 8) + (canvas.width / 4) * i, (canvas.height/3) * 2);

			ctx.font = "20px sans-serif";
			ctx.fillStyle = "#ccc";
			ctx.fillText(players[i].leftKey.name + " and " + players[i].rightKey.name, (canvas.width / 8) + (canvas.width / 4) * i, (canvas.height/3) * 2 + 60);

			if(!players[i].enabled) {
				ctx.font = "12px sans-serif";
				ctx.fillStyle = "#eee";
				ctx.fillText("Press key to play!", (canvas.width / 8) + (canvas.width / 4) * i, (canvas.height/3) * 2 + 100);
			}
			else {
				ctx.font = "16px sans-serif";
				ctx.fillStyle = "#aea";
				ctx.fillText("Ready", (canvas.width / 8) + (canvas.width / 4) * i, (canvas.height/3) * 2 + 100);
			}
		}
		ctx.restore();
	};

	var lastTime = new Date().getTime();
	
	document.onkeydown = function(event) {
		currentState.keyDown(event);
	};
	document.onkeyup = function(event) {
		currentState.keyUp(event);
	};

	setInterval(function() {
		var delta = new Date().getTime() - lastTime;
		//document.title = Math.round(1000/delta) + "fps";

		currentState.update(delta);

		lastTime = new Date().getTime();
	},1000/30);

	setInterval(function() {
		ctx.clearRect(0,0,canvas.width, canvas.height);
		currentState.draw(ctx);
	},1000/30);
}
