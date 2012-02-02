Two player Pong using WebScokets.
=================================

Demo
----

http://jonnyboris.dyndns.org:1337/

Send the URL of the page to the person you want to challenge. Whoever starts the game will be the player on the left, leaving the second player on the right. You can add spin to the ball, just like in the original pong, by moving your paddle just as the ball hits.

You will likely encounter some lag when playing, so if it looks like your opponent was miles off, the chances are the server is just lagging. 

Works best in Chrome, but will work in Firefox.

Install
-------

### Requirements

* [npm](http://npmjs.org/)

* [express](http://expressjs.com/)

* [socket.io](http://socket.io/)

### Installation

Install [npm](http://npmjs.org/). Download or clone the PONG repository and uncompress it if needed. Then grab the dependancies with npm

    npm install socket.io express

Currently the port is hard coded to 1337, but you can change this on line 8 of pong.js. Start the game with:

    node pong.js
	
To start playing, open up [localhost:1337](localhost:1337) or host:port

### License

PONG - Affero GNU General Public License.
socket.io - MIT License
jQuery - [jquery.org/license](http://jquery.org/license/)
jQuery URL Parser plugin - [unlicense.org](http://unlicense.org/)