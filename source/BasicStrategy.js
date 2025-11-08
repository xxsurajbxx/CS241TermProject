const seedrandom = require('seedrandom');
const fs = require('fs');
const header = require('./header.js')

const rounds = 1000000;
const bet = 1;
seedrandom('abc', { global: true });

/*

Dealer Strategy:

Dealer hits on anything under 17
Dealer stands on anything 17 and up
In this implementation, dealer stands on soft 17 (Ace + 6)
Dealer cannot split
Dealer cannot double

*/


//run this multiple times with different seeds to be able to compare results on a larger scale


/*
//this code tests this code

let d = new Deck(8);
d.shuffle();
console.log(blackjackSimulation(d, bet));
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
        const count = runningCount.value/(d.numCards/52);
        const result = header.blackjackSimulation(d, bet, runningCount);
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
fs.writeFile('BasicStrategyData.json', jsonData, (err) => {
  if (err) throw err;
});
//graph the wins/losses/draws over time
//note the avg percentage of wins/losses/draws
//note the standard deviation of wins/losses/draws between games
//graph the wins/losses/draws over number of high/low cards
//graph the wins/losses/draws over running/true count