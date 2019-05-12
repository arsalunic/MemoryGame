var user,
	board,
	boardSize,
	cardFaceUp1 = null,
	cardFaceUp2 = null,
	cardFaceUpValue1 = null,
	cardFaceUpValue2 = null,
	numberOfTry = 0;

$(document).ready(function(){

	user = window.prompt("What is your name?");
	startGame();
});

function chooseTile(){

	var selected = $(this);

	$.ajax({
  		method:"GET",
  		url:"/memory/card",
  		data: {'username':user, 'choice':selected.data('index')},
  		success: displayGameConcentration, 
  		dataType:'json'
	});	
}


function displayGameConcentration(data){
	$("#memoryMatchGameBoard").empty();
	var gameComplete = false;
	
	for (var i=0; i<data.boardSize; i++){
		
		var row = $("<tr></tr>");

		for(var j=0; j<data.boardSize; j++){

			if(data.lastCard != null && board[i][j] != null){
				var div = $("<div id='"+i+j+"' class='tile' data-index='"+i+j+"'></div>");
				div = $("<div id='"+i+j+"' class='tile' data-index='"+i+j+"'><span>"+board[i][j]+"</span></div>");
				div.css("backgroundColor", "#22640A");
			} else if(cardFaceUp1 == null){
				// no cards are face up yet store the index of the card that is going to be face up
				cardFaceUp1 = data.lastCard;
				cardFaceUpValue1 = data.lastCardValue;
				var div = $("<div id='"+i+j+"' class='tile' data-index='"+i+j+"'></div>");
				
				if(data.lastCard == ""+i+j+""){
					div = $("<div id='"+i+j+"' class='tile' data-index='"+i+j+"'><span>"+data.lastCardValue+"</span></div>");
					div.css("backgroundColor", "#22640A");
				}else{
					div.css("backgroundColor", "#8B0000");
					div.click(chooseTile);
				}

			}else if(cardFaceUp2 == null && cardFaceUp1 != data.lastCard){
				cardFaceUp2 = data.lastCard;
				cardFaceUpValue2 = data.lastCardValue;
				var div = $("<div id='"+i+j+"' class='tile' data-index='"+i+j+"'></div>");
				if(data.lastCard == ""+i+j+""){
					div = $("<div id='"+i+j+"' class='tile' data-index='"+i+j+"'><span>"+data.lastCardValue+"</span></div>");
					div.css("backgroundColor", "#22640A");
				}else if(cardFaceUp1 == ""+i+j+""){
					div = $("<div id='"+i+j+"' class='tile' data-index='"+i+j+"'><span>"+cardFaceUpValue1+"</span></div>");
					div.css("backgroundColor", "#22640A");
				}else{
					div.css("backgroundColor", "#8B0000");
					div.click(chooseTile);
				}
			}else{
				
				var div = $("<div id='"+i+j+"' class='tile' data-index='"+i+j+"'></div>");
				if(cardFaceUp1 == ""+i+j+""){
					div = $("<div id='"+i+j+"' class='tile' data-index='"+i+j+"'><span>"+cardFaceUpValue1+"</span></div>");
					div.css("backgroundColor", "#22640A");
				}else if(cardFaceUp2 == ""+i+j+""){
					div = $("<div id='"+i+j+"' class='tile' data-index='"+i+j+"'><span>"+cardFaceUpValue2+"</span></div>");
					div.css("backgroundColor", "#22640A");
				}else if(data.lastCard == ""+i+j+""){
					div = $("<div id='"+i+j+"' class='tile' data-index='"+i+j+"'><span>"+data.lastCardValue+"</span></div>");
					div.css("backgroundColor", "#22640A");
				}else{
					div.css("backgroundColor", "#8B0000");
					div.click(chooseTile);
				}				
			}
			
			row.append(div);
		}
		$("#memoryMatchGameBoard").append(row);
	}
	if(cardFaceUp1 != null && cardFaceUp2 != null ){
		if(cardFaceUpValue1 == cardFaceUpValue2){
			console.log("its a match");
			board[cardFaceUp1.charAt(0)][cardFaceUp1.charAt(1)] = cardFaceUpValue1;
			board[cardFaceUp2.charAt(0)][cardFaceUp2.charAt(1)] = cardFaceUpValue2;
			//check if game complete 
			gameComplete = true;
			for (var i=0; i<data.boardSize; i++){
				for(var j=0; j<data.boardSize; j++){
					if(board[i][j] == null){
						gameComplete = false;
					}
				}
			}
			
		}else{
			console.log("it was not a match sleep for a few milliseconds and then reset the tiles");
			numberOfTry++;
			setTimeout(resetTiles.bind(null, cardFaceUp1,cardFaceUp2), 800);
		}
		cardFaceUp1 = null;
		cardFaceUpValue1 = null;
		cardFaceUp2 = null;
		cardFaceUpValue2 = null;
	}
	if(gameComplete){
		alert("you completed the game with: " + numberOfTry + " wrong guesses.");
		startGame();
	}
}

function makeEmptyBoard(size){
	items = [];
	for(var i=0;i<(size*size)/2;i++){
		items.push(i);
		items.push(i);
	}

	
	board = [];
	for(var i=0;i<size;i++){
		board[i]=[]
		for(var j=0;j<size;j++){
			board[i][j]= null;  //put null values in the board initially
			
		}
	}
	return board;
}

function startGame(){
	do{
    	boardSize = parseInt(window.prompt("Please enter an even number that is greater than 1 for the size of your board", ""), 10);
	}while(isNaN(boardSize) || boardSize < 2 || boardSize%2 != 0);
	board = makeEmptyBoard(boardSize);
	numberOfTry = 0;
	$.ajax({
  		method:"GET",
  		url:"/memory/intro",
  		data: {'username':user, "boardSize":boardSize},
  		success: displayGameConcentration,
  		dataType:'json'
	});
}

function resetTiles(cardFaceUp1,cardFaceUp2){
	$("#"+cardFaceUp1+"").replaceWith("<div id='"+cardFaceUp1+"' class='tile' data-index='"+cardFaceUp1+"'></div>");
	$("#"+cardFaceUp1+"").css("backgroundColor", "#8B0000");
	$("#"+cardFaceUp1+"").click(chooseTile);

	$("#"+cardFaceUp2+"").replaceWith("<div id='"+cardFaceUp2+"' class='tile' data-index='"+cardFaceUp2+"'></div>");
	$("#"+cardFaceUp2+"").css("backgroundColor", "#8B0000");
	$("#"+cardFaceUp2+"").click(chooseTile);
}