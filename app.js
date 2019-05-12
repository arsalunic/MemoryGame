/*

	@author Syed Arsal Abbas

*/
//An asynchronous server that serves static files

// load necessary modules
var http = require('http'),
	fs = require('fs'),
	mime = require('mime-types'),
	url = require('url'),
	hex = require('./res/hexcodes');

const ROOT = "./public_html";

var users = {},
	clients = {};

// create http server
var server = http.createServer(handleRequest); 
server.listen(2406);
console.log('Server listening on port 2406');

function handleRequest(req, res) {
	
	//process the request
	console.log(req.method+" request for: "+req.url);
	
	//parse the url
	var urlObj = url.parse(req.url,true);
	var filename = ROOT+urlObj.pathname;

	if(urlObj.pathname === "/memory/intro"){
		
		var client = {board:makeBoard(urlObj.query.boardSize), boardSize: urlObj.query.boardSize};
		
		client.lastCard = null;
		users[urlObj.query.username] = client;
		
		respond(200, JSON.stringify({boardSize: urlObj.query.boardSize, lastCard: client.lastCard}));
	}
	
	else if (urlObj.pathname === "/memory/card"){

		
		var client = users[urlObj.query.username];
		client.tryCounter++;
		console.log("urlObj.query.choice : " + urlObj.query.choice);
		console.log("urlObj.query.choice.charAt(0) : " + urlObj.query.choice.charAt(0));
		console.log("urlObj.query.choice.charAt(1) : " + urlObj.query.choice.charAt(1));
		console.log("card value on the board is : " + client.board[urlObj.query.choice.charAt(0)][urlObj.query.choice.charAt(1)]);
		
		client.lastCard = urlObj.query.choice;
		client.lastCardValue = client.board[urlObj.query.choice.charAt(0)][urlObj.query.choice.charAt(1)];		
		users[urlObj.query.username] = client; 

		respond(200, JSON.stringify({boardSize: client.boardSize, lastCard: client.lastCard, lastCardValue: client.lastCardValue}));
	} 

	else{// static server
	//the callback sequence for static serving...
		fs.stat(filename,function(err, stats){
			if(err){   //try and open the file and handle the error, handle the error
				respondErr(err);
			}else{
				if(stats.isDirectory())	filename+="/index.html";
		
				fs.readFile(filename,"utf8",function(err, data){
					if(err)respondErr(err);
					else respond(200,data);
				});
			}
		});
	}			
	
	//locally defined helper function
	//serves 404 files 
	function serve404(){
		fs.readFile(ROOT+"/404.html","utf8",function(err,data){ //async
			if(err)respond(500,err.message);
			else respond(404,data);
		});
	}
		
	//locally defined helper function
	//responds in error, and outputs to the console
	function respondErr(err){
		console.log("Handling error: ",err);
		if(err.code==="ENOENT"){
			serve404();
		}else{
			respond(500,err.message);
		}
	}
		
	//locally defined helper function
	//sends off the response message
	function respond(code, data){
		// content header
		res.writeHead(code, {'content-type': mime.lookup(filename)|| 'text/html'});
		// write message and signal communication is complete
		res.end(data);
	}	
	
};//end handle request



function randEle(list){ // returns a random element from the list that was passed in
	return list[Math.floor(Math.random()*list.length)];
}

function makeBoard(size){
	//assume size%2==0
	
	items = [];
	for(var i=0;i<(size*size)/2;i++){
		items.push(i);
		items.push(i);
	}

	
	board = [];
	for(var i=0;i<size;i++){
		board[i]=[]
		for(var j=0;j<size;j++){
			var r = (Math.floor(Math.random()*items.length));
			board[i][j]= items.splice(r,1)[0];  //remove item r from the array
			
		}
	}
	return board;
}