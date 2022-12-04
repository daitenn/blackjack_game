function startGame(userName, gameType, aiTurnDelay) {
  let theTable = new Table(userName, gameType);

  RenderTools.renderTable(Dealer.processTurn(theTable), aiTurnDelay * 1000);
}


function randomIntInRange(min, max) {
  return Math.floor(Math.random() * (max - min) + min);
}


function synchroSleep(milliseconds) {
  const date = Date.now();
  let currentDate = null;
  do {
    currentDate = Date.now();
  } while (currentDate - date < milliseconds);
}


function promiseSleep(milliseconds) {
  return new Promise(resolve => setTimeout(resolve, milliseconds));
}


class RenderTools {

  static renderLandingPage() {
    let gameDiv = document.querySelector("#gameDiv");
    gameDiv.innerHTML = '';
    gameDiv.className = '';
    gameDiv.classList.add("d-flex", "justify-content-center", "align-items-center", "vh-100");
    gameDiv.style.bgColor = '#1D4434'
    gameDiv.aiTurnDelay = 1;
    let formDiv = `
        <div>
            <p class="h5 text-white">Welcome! Enter name 'ai' to initiate AI game or enter your name and select turn speed in seconds then submit</p>
            <div>
                <label class="text-white"> Name:
                    <input id="nameInput" type="text">
                </label>
            </div>
            <div>
                <label class="text-white"> Game Type:
                    <select id="gameSelector">
                        <option value="blackjack">Blackjack</option>
                        <option value="poker">Poker</option>
                    </select>
                </label>
            </div>
            <div class="d-flex flex-row">
                <div class="text-white">
                    AI turn speed
                </div>
                <div class="d-flex flex-row">
                    <div id="minusSpeedButton" class="btn btn-danger">-</div>
                    <div id="speedlabel" class="bg-white">1</div>
                    <div id="plusSpeedButton" class="btn btn-success">+</div>
                </div>
            </div>
            <div id="submitDiv" class="btn btn-success">
                Submit
            </div>
        </div>
        `;

    gameDiv.innerHTML += formDiv;

    gameDiv.querySelector("#minusSpeedButton").addEventListener("click", function () {
      if (gameDiv.aiTurnDelay - .1 > 0) {
        gameDiv.aiTurnDelay -= .1;
        gameDiv.aiTurnDelay = Math.round(gameDiv.aiTurnDelay * 10) / 10;
        gameDiv.querySelector("#speedLabel").textContent = gameDiv.aiTurnDelay;
      }
    })
    gameDiv.querySelector("#plusSpeedButton").addEventListener("click", function () {
      gameDiv.aiTurnDelay += .1;
      gameDiv.aiTurnDelay = Math.round(gameDiv.aiTurnDelay * 10) / 10;
      gameDiv.querySelector("#speedLabel").textContent = gameDiv.aiTurnDelay;
    })
    gameDiv.querySelector("#submitDiv").addEventListener("click", function () {
      let userName = document.querySelector("#nameInput").value;
      let gameSelection = document.querySelector("#gameSelector").value;
      startGame(userName, gameSelection, gameDiv.aiTurnDelay);
    })

  }


  static renderTable(table, aiTurnDelay) {

    let gameDiv = document.querySelector("#gameDiv");
    gameDiv.innerHTML = '';
    gameDiv.className = '';
    gameDiv.classList.add("vh-100", "d-flex", "flex-column");

    //create and append row with house's cards
    let houseRowDiv = document.createElement("div");
    houseRowDiv.classList.add("d-flex", "flex-row", "justify-content-center");
    let housePlayerDiv = RenderTools.playerDiv(table.house);
    houseRowDiv.append(housePlayerDiv);
    houseRowDiv.id = "houseRowDiv";
    gameDiv.append(houseRowDiv);

    //create and append row with each player's cards
    let playerRowDiv = RenderTools.playerRowDiv(table);

    gameDiv.append(playerRowDiv);

    //create and append row for either a betsDiv or actionsDiv
    let actionsAndBetsRowDiv = document.createElement("div");
    actionsAndBetsRowDiv.classList.add("d-flex", "justify-content-center", "mt-3");
    actionsAndBetsRowDiv.id = "actionsAndBetsRowDiv";
    gameDiv.append(actionsAndBetsRowDiv);


    //show the history
    let resultsLogRowDiv = document.createElement("div")
    resultsLogRowDiv.classList.add("d-flex", "flex-row", "justify-content-center");
    resultsLogRowDiv.style.overflow = 'auto';
    resultsLogRowDiv.id = 'resultsLogRowDiv';
    gameDiv.append(resultsLogRowDiv);
    resultsLogRowDiv.append(RenderTools.blackjackResultsLogDiv(table.resultsArray));



    if (table.gamePhase == 'endOfGame') RenderTools.renderEndGamePage(table);
    else if (table.getTurnPlayer().type == "user" && table.gamePhase == 'betting') actionsAndBetsRowDiv.append(RenderTools.betsDiv(table, aiTurnDelay));
    else if (table.getTurnPlayer().type == "user" && table.gamePhase == 'acting') actionsAndBetsRowDiv.append(RenderTools.actionsDiv(table, aiTurnDelay));
    else if (table.getTurnPlayer().type == "house" && table.gamePhase == 'roundOver') {
      actionsAndBetsRowDiv.innerHTML =
        `
                <div id="okButton" class="btn bg-primary"> OK </div>
                `
      actionsAndBetsRowDiv.querySelector("#okButton").addEventListener("click", function () { RenderTools.renderTable(Dealer.processTurn(table), aiTurnDelay) })
    }
    else setTimeout(function () { RenderTools.renderTable(Dealer.processTurn(table), aiTurnDelay) }, aiTurnDelay);


  }



  static playerDiv(player) {
    let playerDiv = document.createElement("div");
    let namePar = document.createElement("p");
    let statusPar = document.createElement("p");
    let cardsDiv = document.createElement("div");

    playerDiv.classList.add("flex-column", "w-25");

    namePar.classList.add("m-0", "text-white", "text-center", "h2");
    namePar.textContent = player.name;
    playerDiv.append(namePar);

    statusPar.classList.add("m-0", "text-white", "text-center", "h6");
    if (player.type == 'house') {
      statusPar.textContent = `S: ${player.gameStatus}`;
    }
    else {
      statusPar.textContent = `S: ${player.gameStatus} B: ${player.bet} C: ${player.chips}`;
    }
    playerDiv.append(statusPar);

    cardsDiv.classList.add("d-flex", "justify-content-center");
    for (var i = 0; i < player.hand.length; i++) {
      cardsDiv.append(RenderTools.cardDiv(player.hand[i]));
    }
    playerDiv.append(cardsDiv);

    return playerDiv
  }

  static playerRowDiv(table) {
    let playerRowDiv = document.createElement("div");
    playerRowDiv.classList.add("d-flex", "flex-row", "justify-content-between", "w-100");

    for (var i = 0; i < table.players.length; i++) {
      playerRowDiv.append(RenderTools.playerDiv(table.players[i]));
    }
    playerRowDiv.id = "playerRowDiv";

    return playerRowDiv
  }


  static cardDiv(card) {
    let suitToImageName = { 'S': 'spade', 'C': 'clover', 'H': 'heart', 'D': 'diamond', '?': 'questionMark' };

    let cardDiv = document.createElement("div");
    let imgDiv = document.createElement("div");
    let img = document.createElement("img");
    let textDiv = document.createElement("div");
    let textPar = document.createElement("p");

    cardDiv.classList.add("bg-white", "d-flex", "flex-column", "border", "mx-2");

    imgDiv.classList.add("text-center");
    img = document.createElement("img");
    img.src = `./image/${suitToImageName[card.suit]}.png`;
    img.style.width = "50px";
    img.style.height = "50px";
    imgDiv.append(img);
    cardDiv.append(imgDiv);

    textPar.classList.add("m-0", "text-center", "font-weight-bold");
    textPar.textContent = card.rank;
    cardDiv.append(textPar);

    return cardDiv;
  }


  static betsDiv(table, aiTurnDelay) {
    let betsDiv = document.createElement("div");
    betsDiv.id = "betsDiv";
    betsDiv.classList.add("w-50", "d-flex", "flex-column");
    betsDiv.chipCountDict = {}
    table.betDenominations.forEach(x => betsDiv.chipCountDict[x] = 0)
    betsDiv.curChips = table.getTurnPlayer().chips;

    let betsChooseDiv = document.createElement("div");
    betsChooseDiv.classList.add("d-flex", "justify-content-around");
    betsDiv.append(betsChooseDiv);

    let submitDiv = document.createElement("div");
    submitDiv.classList.add("btn", "bg-primary");
    submitDiv.id = "submitDiv"
    submitDiv.textContent = "submit your bet!";

    for (var i = 0; i < table.betDenominations.length; i++) {
      let curD = table.betDenominations[i];
      let betDenominationDiv = RenderTools.betDenominationDiv(curD, betsDiv);
      betsChooseDiv.append(betDenominationDiv);
    }

    betsDiv.getCurBet = function () {
      let total = 0;
      for (const denomKey in betsDiv.chipCountDict) {
        total += denomKey * betsDiv.chipCountDict[denomKey]
      }
      return total
    }

    submitDiv.addEventListener("click", function () { RenderTools.renderTable(Dealer.processTurn(table, betsDiv.getCurBet()), aiTurnDelay) });

    betsDiv.append(submitDiv);

    return betsDiv;

  }

  static actionsDiv(table, aiTurnDelay) {
    let actionsDiv = document.createElement("div");
    actionsDiv.classList.add("d-flex");

    actionsDiv.innerHTML =
      `
        <div class="btn btn-light" id="surrenderButton">surrender</div>
        <div class="btn btn-success" id="standButton">stand</div>
        <div class="btn btn-warning" id="hitButton">hit</div>
        <div class="btn btn-danger" id="doubleButton">double</div>
        `

    if (table.getTurnPlayer().gameStatus == 'bet') {
      if (table.getTurnPlayer().bet * 2 > table.getTurnPlayer().chips) actionsDiv.querySelector("#doubleButton").classList.add("disabled");
      actionsDiv.querySelector("#surrenderButton").addEventListener("click", function () { RenderTools.renderTable(Dealer.processTurn(table, 0), aiTurnDelay) })
      actionsDiv.querySelector("#standButton").addEventListener("click", function () { RenderTools.renderTable(Dealer.processTurn(table, 1), aiTurnDelay) })
      actionsDiv.querySelector("#hitButton").addEventListener("click", function () { RenderTools.renderTable(Dealer.processTurn(table, 2), aiTurnDelay) })

      actionsDiv.querySelector("#doubleButton").addEventListener("click", function () {
        if (table.getTurnPlayer().bet * 2 <= table.getTurnPlayer().chips) RenderTools.renderTable(Dealer.processTurn(table, 3), aiTurnDelay)
      });
    }
    else if (table.getTurnPlayer().gameStatus == 'hit') {

      actionsDiv.querySelector("#surrenderButton").classList.add("disabled");
      actionsDiv.querySelector("#doubleButton").classList.add("disabled");
      actionsDiv.querySelector("#standButton").addEventListener("click", function () { RenderTools.renderTable(Dealer.processTurn(table, 1), aiTurnDelay) })
      actionsDiv.querySelector("#hitButton").addEventListener("click", function () { RenderTools.renderTable(Dealer.processTurn(table, 2), aiTurnDelay) })
    }
    else {
      actionsDiv.querySelector("#surrenderButton").classList.add("disabled");
      actionsDiv.querySelector("#doubleButton").classList.add("disabled");
      actionsDiv.querySelector("#surrenderButton").classList.add("disabled");
      actionsDiv.querySelector("#doubleButton").classList.add("disabled");
      //don't need userdata since next turn will be AI
      RenderTools.renderTable(Dealer.processTurn(table), aiTurnDelay);
    }

    return actionsDiv;
  }

  static betDenominationDiv(d, betsDiv) {
    let betDenominationDiv = document.createElement("div");
    betDenominationDiv.classList.add("d-flex", "flex-column");
    betDenominationDiv.innerHTML =
      `
        <div>
            <div class="input-group" >
                <span class="input-group-btn">
                    <button type="button" class="btn btn-danger btn-number" id="minusButton">
                        -
                    </button>
                </span>
                <span id="denominationLabel" class="bg-white">0</span>
                <span class="input-group-btn">
                    <button type="button" class="btn btn-success btn-number" id="plusButton">
                        +
                    </button>
                </span>
            </div>
            <p class="text-white text-center">${d}</p>
        </div>
        `
    let betDenominationLabel = betDenominationDiv.querySelector("#denominationLabel");
    betDenominationDiv.querySelector("#plusButton").addEventListener("click", function () {
      if (betsDiv.getCurBet() + d <= betsDiv.curChips) {
        betsDiv.chipCountDict[d] += 1
        betDenominationLabel.textContent = betsDiv.chipCountDict[d]
        betsDiv.querySelector("#submitDiv").textContent = "submit your bet for " + betsDiv.getCurBet() + "!";
      }
    })
    betDenominationDiv.querySelector("#minusButton").addEventListener("click", function () {
      if (betsDiv.getCurBet() - d >= 0 && betsDiv.chipCountDict[d] - 1 >= 0) {
        betsDiv.chipCountDict[d] -= 1
        betDenominationLabel.textContent = betsDiv.chipCountDict[d]
        betsDiv.querySelector("#submitDiv").textContent = "submit your bet for " + betsDiv.getCurBet() + "!";
      }
    })


    return betDenominationDiv;
  }


  static blackjackResultsLogDiv(resultsArray) {
    let resultsLogDiv = document.createElement("div");
    resultsLogDiv.classList.add("text-white", "w-50")
    for (let i = 0; i < resultsArray.length; i++) {
      let roundPar = document.createElement("p");
      roundPar.textContent = `round ${1 + i}:`;
      resultsLogDiv.append(roundPar);
      let list = document.createElement("ul");
      for (let j = 0; j < resultsArray[i].length; j++) {
        let playerListItem = document.createElement("li")
        playerListItem.textContent = `name: ${resultsArray[i][j]['name']}, action: ${resultsArray[i][j]['action']}, bet: ${resultsArray[i][j]['bet']}, won: ${resultsArray[i][j]['won']}`
        list.append(playerListItem);
      }
      resultsLogDiv.append(list);
    }
    return resultsLogDiv;
  }


  static renderEndGamePage(table) {
    document.querySelector("#gameDiv").innerHTML = '';

    let endGameDiv = document.createElement('div');
    endGameDiv.classList.add("d-flex", "flexRow");
    endGameDiv.innerHTML =
      `
        <div class="w-50 h-100 m-0" id="leftPanel">
            <p class="text-white h1 text-center"> GAME OVER </p>
            <div class="d-flex flex-row" id="finalPlayersState"></div>
            <div class="d-flex flex-row justify-content-center">
                <div class="btn bg-primary" id="submitButton"> Start Another Game </div>
            </div>
        </div>
        <div class="w-50 h-100 m-0" id="rightPanel">
        </div>
        `
    endGameDiv.querySelector("#rightPanel").append(RenderTools.blackjackResultsLogDiv(table.resultsArray));
    endGameDiv.querySelector("#finalPlayersState").append(RenderTools.playerRowDiv(table));
    endGameDiv.querySelector("#submitButton").addEventListener("click", function () { RenderTools.renderLandingPage() });

    document.querySelector("#gameDiv").append(endGameDiv);
  }
}



//stateless controller to update Table data
class Dealer {

  static processTurn(table, userData) {
    table.haveTurn(userData);
    return table;
  }

}




class Table {
  constructor(_userName, _gameType, _betDenominations = [5, 20, 50, 100]) {
    this.betDenominations = _betDenominations;
    this.house = new Player("house", "house", 0);
    this.players = [];
    this.resultsArray = [];

    this.players.push(new Player('ai', 'AI1'));
    if (_userName == 'ai') {
      this.players.push(new Player('ai', 'AI2'));
    }
    else {
      this.players.push(new Player('user', _userName));
    }

    this.players.push(new Player('ai', 'AI3'));

    this.deck = new Deck(_gameType);
    this.deck.shuffle();
    this.gameType = _gameType;
    if (this.gameType == 'blackjack') this.gamePhase = 'betting'
    this.turnCounter = 0;
  }




  resetAndShuffleDeck() {
    this.deck = new Deck()
    this.deck.shuffle()
  }

  blackjackAssignHands() {
    this.house.hand = []
    this.house.hand.push(this.deck.drawOne());
    this.house.holeCard = this.deck.drawOne();
    for (var i = 0; i < this.players.length; i++) {
      this.players[i].hand = [];
      this.players[i].hand.push(this.deck.drawOne());
      this.players[i].hand.push(this.deck.drawOne());
    }

  }


  resetShuffleDeckAssignHands() {
    this.resetAndShuffleDeck();
    this.blackjackAssignHands();
  }
  blackjackAssignHands() {
    this.house.hand = []
    this.house.hand.push(this.deck.drawOne());
    this.house.holeCard = this.deck.drawOne();
    for (var i = 0; i < this.players.length; i++) {

      if (this.players[i].gameStatus == "broke") {
        this.players[i].bet = 0;
        this.winAmount = 0;
        this.players[i].hand = [];
        this.players[i].hand.push(new Card("?", "?"));
        this.players[i].hand.push(new Card("?", "?"));

      }
      else {
        this.players[i].hand = [];
        this.players[i].hand.push(this.deck.drawOne());
        this.players[i].hand.push(this.deck.drawOne());
      }
    }

  }

  blackjackClearBetsAndHands() {
    this.house.hand = []
    this.house.hand.push(new Card("?", "?"));
    this.house.holeCard = new Card("?", "?");
    for (var i = 0; i < this.players.length; i++) {
      if (this.players[i].gameStatus != "broke") this.players[i].gameStatus = 'betting';
      this.players[i].bet = 0;
      this.winAmount = 0;
      this.players[i].hand = [];
      this.players[i].hand.push(new Card("?", "?"));
      this.players[i].hand.push(new Card("?", "?"));
    }

  }


  getTurnPlayer() {
    let roundIndex = this.turnCounter % (this.players.length + 1)
    let turnPlayer = {};
    if (roundIndex == 0) {
      turnPlayer = this.house;
    }
    else {
      turnPlayer = this.players[roundIndex - 1]
    }

    //console.log(`TURNPLAYER:: name:${turnPlayer.name}, type:${turnPlayer.type}`);
    return turnPlayer;
  }



  onLastPlayer() {
    return this.turnCounter % (this.players.length + 1) == this.players.length;
  }


  onFirstPlayer() {
    return this.turnCounter % (this.players.length + 1) == 1
  }


  /*
      NAME:
          haveTurn(userData)
      SIGNATURE:
          Number userData : to be used by promptPlayer method to return the appropriate gameDecision
          return Table : return updated table state
      NOTES:
          This is a general purpose method for controlling the game flow and updating the table state for any 'round robin' card game.
          It updates the the state of the table by checking:
              1. Table.gameType: from {'blackjack', 'poker'}
              2. Table.gamePhase: from {'betting', 'acting', 'roundOver'}
              3. The Player.type of the current player from {'house', 'ai', 'user'}
          Then potentially updating:
              1. Table.gamePhase to choices from {'betting', 'acting', 'roundOver'}
              2. The current player's state by calling that player's Player.promptPlayer() and passing in userData on user turn
              3. Table.turnCounter by incrementing by 1
              If we were implementing this in Java or C++, this would be the only externally facing public method.
          Other parts of our program could not access any of the other methods (such as those built into the Player model).
  */

  haveTurn(userData) {
    //tp stands for "turn player". This is a reference to the Player object that is playing on this particular turn.
    let tp = this.getTurnPlayer();
    //console.log(`HAVETURN:: type: ${this.gameType}, phase:${this.gamePhase}, player: ${tp.name}, gameStatus = ${tp.gameStatus}, turn: ${this.turnCounter}`);
    if (this.gameType == 'blackjack') {

      //if we are in end-game state we are on a house turn and can skip this turn entirely and have the results displayed from RenderTools.renderTable()
      if (this.blackjackIsEndOfGame()) this.gamePhase = 'endOfGame';

      /*
         In betting phase check the user's type
      */
      if (this.gamePhase == 'betting') {
        if (tp.type == 'house') {
          this.house.gameStatus = 'waitingForBets';
          this.blackjackClearBetsAndHands();
        }
        else if (tp.type == 'user' || tp.type == 'ai') this.evaluateMove(tp.promptPlayer(this, userData), tp);
        else console.log(`Table.haveTurn()->blackjack->betting invalid player type: ${tp.type}`);

        if (this.onLastPlayer()) {
          this.gamePhase = 'acting';
          this.house.gameStatus = 'waitingForActions';
        }
      }
      else if (this.gamePhase == 'acting') {

        if ((tp.type == 'user' || tp.type == 'ai') && this.onFirstPlayer() && this.blackjackReadyToAct()) {
          this.resetShuffleDeckAssignHands();
          this.evaluateMove(tp.promptPlayer(this, userData), tp);
        }
        else this.evaluateMove(tp.promptPlayer(this, userData), tp);

        if (this.onLastPlayer() && this.blackjackAllActionsComplete()) {
          this.resultsArray.push(this.blackjackEvaluateWinnersAndUpdateChips());
          this.gamePhase = 'roundOver';
        }
      }
      //this gets triggered on last player turn so subsequent house turn will display results and reset gamePhase
      else if (this.gamePhase == 'roundOver') {
        this.gamePhase = 'betting'
        this.house.gameStatus = 'waitingForBets'
        this.blackjackClearBetsAndHands();
      }
      else if (this.gamePhase == 'endOfGame') { } //do nothing and let RenderTools.renderTable() show end screen.

      else console.log("Table.haveTurn::-> blackjack invalid gamePhase");
    }

    else {
      console.log("this.haveTurn:: gameTypes besides blackjack are not coded yet.");
    }

    this.turnCounter++;
  }



  evaluateMove(gameDecision, player) {
    player.gameStatus = gameDecision.action;
    player.bet = gameDecision.amount;
    let handScore = 0;

    switch (gameDecision.action) {
      case "bet":
        break;
      case "surrenderFirstTime":
        player.winAmount = (-1) * Math.round(.5 * player.bet)
        player.chips += player.winAmount;
        player.gameStatus = 'surrender';
        break;
      case "surrender":
        break;
      case "stand":
        break;
      case "blackjack":
        break;
      case "broke":
        break;
      case "bust":
        break;
      case "hit":
        player.hand.push(this.deck.drawOne());
        if (this.getHandScore(player) > 21) {
          player.winAmount = (-1) * player.bet;
          player.chips += player.winAmount;
          player.gameStatus = 'bust';
        }
        //don't update gameStatus so we have option to hit again.
        break;
      case "doubleFirstTime":
        player.hand.push(this.deck.drawOne());
        if (this.getHandScore(player) > 21) {
          player.winAmount = (-2) * player.bet;
          player.chips += player.winAmount;
          player.gameStatus = 'bust';
        }
        else player.gameStatus = 'doubleBust';
        break;
      case "double":
        break;

      default:
        console.log("Dealer.evaluateMove:: invalid gamedecision.action");
    }
  }


  blackjackPlayerActionsComplete() {
    for (let i = 0; i < this.players.length; i++) {
      if (this.players[i].gameStatus == 'hit') return false;
    }
    return true;
  }



  blackjackHouseActionsComplete() {
    return this.house.gameStatus != 'hit' && this.house.gameStatus != 'waitingForActions';
  }


  blackjackPlayersStillBetting() {
    for (let i = 0; i < this.players.length; i++) {
      if (this.players[i].gameStatus == 'bet') return true;
    }
    return false;
  }



  blackjackAllActionsComplete() {
    return this.blackjackHouseActionsComplete() && this.blackjackPlayerActionsComplete();
  }


  blackjackReadyToAct() {
    for (let i = 0; i < this.players.length; i++) {
      if ((this.players[i].gameStatus != 'broke') && (this.players[i].gameStatus != 'bet')) {
        return false;
      }
    }
    return true;
  }




  getHandScore(player) {
    let handScore = 0;
    if (this.gameType == 'blackjack') {
      for (let i = 0; i < player.hand.length; i++) {
        handScore += player.hand[i].getRankNumber();
      }
      for (let i = 0; i < player.hand.length && handScore > 21; i++) {
        if (player.hand[i].rank == 'A') {
          handScore -= 10;
        }
      }
    }
    return handScore;
  }


  blackjackEvaluateWinnersAndUpdateChips() {
    let roundResultsArray = [];
    for (let i = 0; i < this.players.length; i++) {
      let player = this.players[i];

      //players with these gameStatuses have already had their round evaluation finish and chips updated, so skip any updates to their Player.winAmount
      if (player.gameStatus == "broke" || player.gameStatus == 'bust' || player.gameStatus == 'surrender' || player.gameStatus == 'doubleBust') { }

      //if house gets blackjack, player loses unless they also get blackjack, in which case, it is a tie and nothing is won or lost.
      else if (this.house.gameStatus == 'blackjack') {
        if (player.gameStatus != 'blackjack') player.winAmount = this.blackjackGetPlayerLoseAmount(player, "lost");
        else player.gameStatus = 'push';
      }
      else if (this.house.gameStatus == 'bust' || this.getHandScore(player) > this.getHandScore(this.house)) player.winAmount = this.blackjackGetPlayerWinAmount(player, "won");
      else if (this.house.gameStatus != 'bust' && this.getHandScore(player) < this.getHandScore(this.house)) player.winAmount = this.blackjackGetPlayerWinAmount(player, "lost");
      else if (this.getHandScore(player) == this.getHandScore(this.house)) player.gameStatus = 'push';
      else console.log(`table.blackjackEvaluateWinnersAndUpdateChips:: player updated chips before win phase? status combinaton house: ${this.house.gameStatus}, player: ${player.gameStatus}`)

      //if the handscores between player and dealer were even, then there is nothing lost or won
      if (player.gameStatus == 'push') player.winAmount = 0;

      // if chips for the round have not been updated, update the chips using the determined winAmount
      if (player.gameStatus != 'broke' && player.gameStatus != 'bust' && player.gameStatus != 'surrender' && player.gameStatus != 'doubleBust') player.chips += player.winAmount;

      //for each player push their results into the array that will be returned by this method
      roundResultsArray.push({ 'name': player.name, 'action': player.gameStatus, 'bet': player.bet, 'won': player.winAmount });

      //finally set player's gameStatus to 'broke' if they are out of chips. this will ensure they will be skipped in future rounds and that the game can conclude when only 1 player is left or user is broke.
      if (player.chips == 0) player.gameStatus = 'broke';
    }

    return roundResultsArray
  }



  blackjackGetPlayerWinAmount(player, wonOrLost) {
    let winAmount = 0;
    if (player.gameStatus == 'blackjack') winAmount = Math.round(player.bet * 1.5)
    else if (player.gameStatus == 'stand' || player.gameStatus == 'hit') winAmount = player.bet;
    else if (player.gameStatus == 'double') winAmount = player.bet * 2;
    else console.log('Table.blackjackPlayerWinAmount:: invalid gameStatus');
    //if you didn't win, convert your win amount to negative
    if (wonOrLost == "lost") winAmount *= -1;

    return winAmount;
  }


  playerHandIsBlackjack(player) {
    if (player.hand.length != 2) return false;
    if (player.hand[0].rank == 'A') {
      if (player.hand[1].rank == 'J' || player.hand[1].rank == 'K' || player.hand[1].rank == 'Q')
        return true;
    }
    if (player.hand[1].rank == 'A') {
      if (player.hand[0].rank == 'J' || player.hand[0].rank == 'K' || player.hand[0].rank == 'Q')
        return true;
    }
    return false;
  }

  blackjackIsEndOfGame() {
    let remainingPlayers = 0;
    for (var i = 0; i < this.players.length; i++) {
      let player = this.players[i];
      if (player.type == 'user' && player.gameStatus == 'broke') return true
      if (player.gameStatus != 'broke') remainingPlayers++;
    }

    return remainingPlayers <= 1;
  }

}



//represents a player. can represent AI or user players.
class Player {


  constructor(_type, _name, _chips = 400) {
    this.type = _type;
    this.name = _name;
    this.gameStatus = 'ready';
    this.hand = [];
    this.bet = 0;
    this.winAmount = 0;
    this.chips = _chips;
  }


  promptPlayer(table, userData) {
    let gameDecision = {}
    if (table.gameType == "blackjack" && table.gamePhase == "betting") {
      //if ai bet turn, choose random bet less than current chips from Table.betDenominations
      if (this.type == "ai") gameDecision = this.blackjackGetAIBetGameDecision(table);
      //if user turn, take bet choice from the userData passed in from the view
      else gameDecision = new GameDecision("bet", userData);
    }
    else if (table.gameType == "blackjack" && table.gamePhase == "acting") {
      //if ai action turn, choose random action, and only choose 'double' if there are enough chips
      if (this.type == "ai") gameDecision = this.blackjackGetAIActionGameDecision(table);
      //if user action turn, take action choice from userData passed in from the view
      else if (this.type == "user") gameDecision = this.blackjackGetUserActionGameDecision(table, userData);
      //if house action turn, wait until all player turns are complete, reveal hole card once, then hit until handScore >= 17, then stand
      else gameDecision = this.blackjackGetHouseActionGameDecision(table);
    }
    else console.log("Player.promptPlayer():: invalid table.GameType/table.gamePhase combination");

    return gameDecision;
  }

  blackjackGetAIBetGameDecision(table) {
    let availableDenominations = table.betDenominations.filter(x => (x <= this.chips));
    let betAmount = availableDenominations[randomIntInRange(0, availableDenominations.length)];
    return new GameDecision('bet', betAmount);
  }


  blackjackGetAIActionGameDecision(table) {
    //if the player has blackjack, no further actions or evaluations are needed.
    if (table.playerHandIsBlackjack(this)) return new GameDecision("blackjack", this.bet);

    let gameDecision = {};
    if (this.gameStatus == 'bet') {
      let availableActions = ["hit", "stand", "surrenderFirstTime"];
      if (this.chips >= this.bet * 2) availableActions.push("doubleFirstTime");
      gameDecision = new GameDecision(availableActions[randomIntInRange(0, availableActions.length)], this.bet);
    }
    else if (this.gameStatus == 'hit') {
      let availableActions = ["hit", "stand"];
      gameDecision = new GameDecision(availableActions[randomIntInRange(0, availableActions.length)], this.bet);
    }
    //if current gameStatus requires no further action, IE: bust, broke etc
    else gameDecision = new GameDecision(this.gameStatus, this.bet);

    return gameDecision;
  }


  blackjackGetUserActionGameDecision(table, userData) {
    if (table.playerHandIsBlackjack(this)) return new GameDecision("blackjack", this.bet)

    let gameDecision = {}
    if (this.gameStatus == 'bet' || this.gameStatus == 'hit') {
      let choiceKey = ["surrenderFirstTime", "stand", "hit", "doubleFirstTime"]
      gameDecision = new GameDecision(choiceKey[userData], this.bet);
    }
    //if no action is needed. for example when 'broke'
    else gameDecision = new GameDecision(this.gameStatus, this.bet);

    return gameDecision;
  }


  blackjackGetHouseActionGameDecision(table) {
    let gameDecision = {}

    //only once, when all players have finished and it is the first house turn do we reveal hole card and check if house got a natural blackjack
    //the next time it is the house's turn this round their gameStatus will have been updated and we will skip these statements.
    //again, if the house got blackjack, no further evaluation
    if (table.blackjackPlayerActionsComplete() && !table.blackjackPlayersStillBetting() && this.gameStatus == 'waitingForActions') {
      this.hand.push(this.holeCard);
      if (table.playerHandIsBlackjack(this)) return new GameDecision("blackjack", this.bet)
    }

    //if all player actions are complete, hit if less than 17, otherwise stand
    if (table.blackjackPlayerActionsComplete() && !table.blackjackPlayersStillBetting()) {
      if (table.getHandScore(this) < 17) gameDecision = new GameDecision("hit", -1);
      else gameDecision = new GameDecision("stand", -1);
    }
    //most of the time, just maintain a gameStatus of 'waitingForActions' without making any changes.
    else gameDecision = new GameDecision(this.gameStatus, -1);

    return gameDecision;
  }
}


class GameDecision {
  constructor(_action = 'unchosen', _amount = -1) {
    this.action = _action;
    this.amount = _amount;
  }
}



class Deck {
  /*
      String gameMode : from set {'blackjack', 'poker'}
      return Deck : constructor returns Deck with unshuffled .cardList member
  */
  constructor(gameMode = 'none') {
    this.cardList = [];
    let suitChoices = ['S', 'C', 'H', 'D'];
    let rankChoices = ['A', '2', '3', '4', '5', '6', '7', '8', '9', '10', 'J', 'K', 'Q'];

    for (let s = 0; s < suitChoices.length; s++) {
      for (let r = 0; r < rankChoices.length; r++) {
        this.cardList.push(new Card(suitChoices[s], rankChoices[r]));
      }
    }

  }

  /*
      return null : shuffles this deck using fisher/yates shuffling algorithm
  */
  shuffle() {
    for (var i = 0; i < this.cardList.length; i++) {
      let randomIndex = randomIntInRange(0, this.cardList.length)
      let storedFirstCard = new Card(this.cardList[i].suit, this.cardList[i].rank);
      this.cardList[i] = this.cardList[randomIndex]
      this.cardList[randomIndex] = storedFirstCard
    }
  }


  drawOne() {
    if (this.isEmpty()) {
      alert("no more cards left. refresh to start new game.");
      return null;
    }
    else {
      return this.cardList.pop();
    }
  }

  /*
     return Boolean : true if there are no cards in the deck, false if there are cards in the deck
  */
  isEmpty() {
    return this.cardList.length == 0
  }
}


//represents suit and rank of an individual card from standard 52 card deck
class Card {
  /*
      String _suit : single element from the following characters {'S','C','H','D'}
      String _rank : from {'A','2','3','4','5','6','7','8','9','10','J','K','Q'}
      return Card : returns Card object
  */
  constructor(_suit, _rank) {
    this.suit = _suit;
    this.rank = _rank;
  }

  /*
      NAME:
          getRankNumber()
      SIGNATURE:
          return Number: numeric value matching rank of card. Ace starts as 11 and is adjusted by dealer if need be.
  */
  getRankNumber() {
    let rankToNum = { 'A': 11, '2': 2, '3': 3, '4': 4, '5': 5, '6': 6, '7': 7, '8': 8, '9': 9, '10': 10, 'J': 10, 'K': 10, 'Q': 10 };
    return rankToNum[this.rank];
  }
}
RenderTools.renderLandingPage();
