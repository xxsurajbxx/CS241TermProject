const seedrandom = require('seedrandom');
const fs = require('fs');
const header = require('./header.js')

const rounds = 1000000;
const bet = 1;
seedrandom('abc', { global: true });
// we only play when the true count is at or above this threshold otherwise we let the dealer simulate hands by himself
const trueCountThreshold=1;


//this code tests this strategy
/*
let d = new Deck(8);
d.shuffle();

for(i=0; i<10; i++) {
    console.log('running count: ' + runningCount.value);
    console.log('true count: ' + runningCount.value/(d.numCards/52.0) + '\n\n\n');
}
*/
/*

Counting Strategy:

10, jack, queen, king, and ace are -1

2, 3, 4, 5, and 6 are +1

7, 8, 9 are 0


a positive count is better for the player

count per deck or true count is (running count) / (#of decks left)

test the running count right now to ensure that it is working properly
(also move the shared code over to the other programs and ensure that it still works) (GIVE IT A ONCE OVER BEFORE COPYING IT TO THE OTHER FILES)


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
        const result = header.blackjackSimulation(d, bet, runningCount, trueCountThreshold);
        if(result==null) {continue;}
        results.push(result);
        overallRunningCount.push(Math.floor(count/(d.numCards/52)));
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
fs.writeFile('HighLowCardCountingData.json', jsonData, (err) => {
  if (err) throw err;
});


//note the standard deviation of wins/losses/draws between games