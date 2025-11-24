const seedrandom = require('seedrandom');
const fs = require('fs');
const header = require('./header.js');

const rounds = 1000000;
const bet = 1;
seedrandom('abc', { global: true });

let totalResults = 0;
let totalRunningResults = [];
let results = [];
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

    d.resetDeck();
}

const finalData = {
    "totalResults": totalResults,
    "numberOfRounds": numberOfRounds,
    "resultsDictionary": resultsDictionary,
    "totalRunningResults": totalRunningResults,
    "results": results,
    "overallRunningCount": overallRunningCount
};
const jsonData = JSON.stringify(finalData, null, 2);
fs.writeFile('BasicStrategyData.json', jsonData, (err) => {
  if (err) throw err;
});