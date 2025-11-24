const seedrandom = require('seedrandom');
const fs = require('fs');
const header = require('./header.js');

const rounds = 1000000;
const bet = 1;
seedrandom('abc', { global: true });
// we only play when the true count is at or above this threshold otherwise we let the dealer simulate hands by himself
const trueCountThreshold=-2;

function blackjackSimulation(deck, betAmount, count, countThreshold=-500, shoe) {
    var dealerHand = [];
    var trueCount = count.value/(deck.numCards/52);
    if(trueCount > countThreshold) {
        while(trueCount > countThreshold) {
            deck.draw(count);
            trueCount = count.value/(deck.numCards/52);
            if(d.cards.length<=shoe) {
                d.resetDeck();
                d.shuffle();
                count.value=0
            }
        }
    }

    var playerHand = [];
    header.dealCards(dealerHand, playerHand, deck, count);
    //console.log(count.value);
    if(header.calcValues(dealerHand)[0]==21) {
        //console.log('Dealer Blackjack');
        if(header.calcValues(playerHand)[0]==21) {
            //console.log('Player Blackjack');
            //console.log('Dealer hand: ' + dealerHand);
            //console.log('Player hand: ' + playerHand);
            return 0;
        }
        //console.log('dealer hand: ' + dealerHand);
        //console.log('player hand: ' + playerHand);
        return -1*betAmount;
    }

    //console.log("Dealer Card: " + dealerHand[0].value);
    var handVals = playOutHand(playerHand, dealerHand[0].value, deck, count);
    //console.log('player hand vals: ' + handVals);
    var dHandVal = header.dealerStrategy(deck, dealerHand, count);
    //console.log('Dealer hand: ' + dealerHand);
    //console.log('Player hand: ' + playerHand);
    //console.log('Dealer Hand Value: ' + dHandVal);
    var totalReturn = 0;
    for(let i=0; i<handVals.length; i++) {
        var ret = header.evaluateReturn(handVals[i][0], dHandVal[0], handVals[i][1], dHandVal[1], handVals[i][2], handVals[i][3])*betAmount;
        //console.log('return: ' + ret);
        totalReturn += ret;
    }
    //console.log('total return: ' + totalReturn);
    return totalReturn;
}

function playOutHand(playersHand, dealerUpcard, deck, count, split=0) {
    //console.log('Current Hand: ' + playersHand);
    if(playersHand.length==2 && split<3 && playersHand[0].value==playersHand[1].value && header.shouldSplit(playersHand[0].value, dealerUpcard)) {
        var retVal = [];
        //console.log('splitting');
        retVal = retVal.concat(playOutHand([playersHand[0], deck.draw(count)], dealerUpcard, deck, count, split+1));
        retVal = retVal.concat(playOutHand([playersHand[1], deck.draw(count)], dealerUpcard, deck, count, split+1));
        return retVal;
    }
    else {
        if(split>0 && playersHand[0].value=='A') {
            handVal = header.calcValues(playersHand);
            return [[handVal[0], playersHand.length, false, true]];
        }
        return [header.runStrategy(deck, playersHand, dealerUpcard, count, header.basicStrategy).concat(split>0)];
    }
}

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
        const result = blackjackSimulation(d, bet, runningCount, trueCountThreshold, shoe);
        if(result==null) {continue;}
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
fs.writeFile('LowCountBasicStrategy.json', jsonData, (err) => {
  if (err) throw err;
});