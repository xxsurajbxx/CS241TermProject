const seedrandom = require('seedrandom');
const fs = require('fs');
const header = require('./header.js')

const rounds = 1000;
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

/*
//this code tests this strategy

let d = new Deck(8);
d.shuffle();
console.log(blackjackSimulation(d, bet));
*/
/*

Dealer Strategy:

Dealer hits on anything under 17
Dealer stands on anything 17 and up
In this implementation, dealer stands on soft 17 (Ace + 6)
Dealer cannot split
Dealer cannot double

*/

let totalResults = 0;
let totalRunningResults = [];
let totalRunningResultsPerGame = [];
let results = [];
let resultsPerGame = [];
let resultsDictionary = {"wins":0, "losses":0, "draws":0};
let numberOfRounds = 0;
let overallRunningCount = [];
var runningCount = new header.counter();

while(numberOfRounds<rounds) {
    let d = new header.Deck(8);
    d.shuffle();
    const shoe = Math.floor(Math.random()*27)+45;
    runningCount.value = 0;
    var gameResult = [];
    var gameRunningResult = 0;
    var gameRunningResults = [];
    while(d.cards.length>shoe) {
        const count = runningCount.value;
        const result = blackjackSimulation(d, bet);
        results.push(result);
        overallRunningCount.push(count);
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
    totalRunningResultsPerGame.push(gameRunningResults);
}

const finalData = {
    "totalResults": totalResults,
    "numberOfRounds": numberOfRounds,
    "resultsDictionary": resultsDictionary,
    "totalRunningResults": totalRunningResults,
    "results": results,
    "totalRunningResultsPerGame": totalRunningResultsPerGame,
    "resultsPerGame": resultsPerGame,
    "overallRunningCount": overallRunningCount
};
const jsonData = JSON.stringify(finalData, null, 2);
fs.writeFile('DealerStrategyData.json', jsonData, (err) => {
  if (err) throw err;
});
//graph the wins/losses/draws over time
//note the avg percentage of wins/losses/draws
//note the standard deviation of wins/losses/draws between games
//graph the wins/losses/draws over number of high/low cards
//graph the wins/losses/draws over running/true count