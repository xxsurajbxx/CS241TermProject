const seedrandom = require('seedrandom');
const fs = require('fs');
const header = require('./header.js');

const rounds = 1000000;
const bet = 1;
seedrandom('abc', { global: true });

function blackjackSimulation(deck, betAmount, count) {
    var dealerHand = [];
    var playerHand = [];
    header.dealCards(dealerHand, playerHand, deck, count);
    if(header.calcValues(dealerHand)[0]==21) {
        //console.log("dealer hand: " + dealerHand); //testing code
        //console.log("player hand: " + playerHand); //testing code
        if(header.calcValues(playerHand)[0]==21) {return 0;}
        return -1*betAmount;
    }
    //console.log("dealer hand: " + dealerHand); //testing code
    //console.log("player hand: " + playerHand); //testing code
    var pHandVal = header.dealerStrategy(deck, playerHand, count);
    var dHandVal = header.dealerStrategy(deck, dealerHand, count);
    //console.log("dealer hand: " + dealerHand); //testing code
    //console.log("value: " + dHandVal);
    //console.log("player hand: " + playerHand); //testing code
    //console.log("value: " + pHandVal);
    return header.evaluateReturn(pHandVal, dHandVal)*betAmount;
}

let totalResults = 0;
let totalRunningResults = [];
let results = [];
let resultsPerGame = [];
let resultsDictionary = {"wins":0, "losses":0, "draws":0};
let numberOfRounds = 0;
let overallRunningCount = [];
var runningCount = new header.counter();
let d = new header.Deck(8);

while(numberOfRounds<rounds) {
    d.shuffle();
    const shoe = Math.floor(Math.random()*27)+45;
    runningCount.value = 0;
    var gameResult = [];
    var gameRunningResult = 0;
    var gameRunningResults = [];
    while(d.cards.length>shoe) {
        const count = runningCount.value/(d.numCards/52);
        const result = blackjackSimulation(d, bet, runningCount);
        results.push(result);
        overallRunningCount.push(Math.floor(count));
        totalResults += result;
        totalRunningResults.push(totalResults);
        gameRunningResult += result;
        gameRunningResults.push(gameRunningResult);
        if(result>0) {resultsDictionary["wins"] += 1;}
        else if(result<0) {resultsDictionary["losses"] += 1;}
        else if(result==0) {resultsDictionary["draws"] += 1;}
        numberOfRounds+=1;
        gameResult.push(result);
        if(numberOfRounds==rounds) {break;}
    }
    resultsPerGame.push(gameResult);
    d.resetDeck();
}

const finalData = {
    "totalResults": totalResults,
    "numberOfRounds": numberOfRounds,
    "resultsDictionary": resultsDictionary,
    "totalRunningResults": totalRunningResults,
    "results": results,
    "resultsPerGame": resultsPerGame,
    "overallRunningCount": overallRunningCount
};
const jsonData = JSON.stringify(finalData, null, 2);
fs.writeFile('DealerStrategyData.json', jsonData, (err) => {
  if (err) throw err;
});