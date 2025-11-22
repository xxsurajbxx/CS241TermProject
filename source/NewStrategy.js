const seedrandom = require('seedrandom');
const fs = require('fs');
const header = require('./header.js');

const rounds = 1000;
const bet = 1;
seedrandom('abc', { global: true });
// we only play when the true count is at or above this threshold otherwise we let the dealer simulate hands by himself
const trueCountThreshold=-2;

const cardValues = ['2', '3', '4', '5', '6', '7', '8', '9', '10', 'J', 'Q', 'K', 'A'];
const countValues = [];
for (let i = 4; i <= 20; i++) {countValues.push(String(i));}
hardTable = {};
softTable = {};
for(let i=0; i<cardValues.length; i++) {
    let mp1 = {};
    let mp2 = {}; //first value in that last list is returns and second is number of hands played
    for(let j=0; j<countValues; j++) {mp1[countValues[j]] = {'H': [0,0], 'S': [0,0], 'D':[0,0]}; mp2[countValues[j]] = {'H': [0,0], 'S': [0,0], 'D':[0,0]};}
    hardTable[cardValues[i]] = mp1;
    softTable[cardValues[i]] = mp2;
}
table = {'Hard': hardTable, 'Soft': softTable};

function blackjackSimulation(deck, betAmount, count, countThreshold=500) {
    var dealerHand = [];
    var trueCount = count.value/(deck.numCards/52);
    if(trueCount > countThreshold) {
        dealerHand.push(deck.draw(count));
        dealerHand.push(deck.draw(count));
        dealerStrategy(deck, dealerHand, count);
        return null;
    }
    var playerHand = [];
    dealCards(dealerHand, playerHand, deck, count);
    if(header.calcValues(dealerHand)[0]==21) {
        if(header.calcValues(playerHand)[0]==21) {
            return 0;
        }
        return -1*betAmount;
    }
    var handVals = playOutHand(playerHand, dealerHand[0].value, deck, count);
    var dHandVal = dealerStrategy(deck, dealerHand, count);
    var totalReturn = 0;
    for(let i=0; i<handVals.length; i++) {
        var ret = evaluateReturn(handVals[i][0], dHandVal[0], handVals[i][1], dHandVal[1], handVals[i][2], handVals[i][3])*betAmount;
        totalReturn += ret;
    }
    return totalReturn;
}

function playOutHand(playersHand, dealerUpcard, deck, count, split=0) {
    if(playersHand.length==2 && split<3 && playersHand[0].value==playersHand[1].value && shouldSplit(playersHand[0].value, dealerUpcard)) {
        var retVal = [];
        retVal = retVal.concat(playOutHand([playersHand[0], deck.draw(count)], dealerUpcard, deck, count, split+1));
        retVal = retVal.concat(playOutHand([playersHand[1], deck.draw(count)], dealerUpcard, deck, count, split+1));
        return retVal;
    }
    else {
        if(split>0 && playersHand[0].value=='A') {
            handVal = header.calcValues(playersHand);
            return [[handVal[0], playersHand.length, false, true]];
        }
        let action=null;
        let val = header.calcValues(playersHand);
        if(table[val[1]][dealerUpcard][val[0]]['H'][1] < rounds) {action='H';}
        else if(table[val[1]][dealerUpcard][val[0]]['S'][1] < rounds) {action='S';}
        else if(table[val[1]][dealerUpcard][val[0]]['D'][1] < rounds) {action='D';}

        //PICK IT UP FROM HERE
        result = [runBasicStrategy(deck, playersHand, dealerUpcard, count).concat(split>0)];
        table["FIGURE OUT IF HARD OR SOFT"][dealerUpcard][header.calcValues(playersHand)[]]
        return result;
    }
}

var runningCount = new header.counter();
let d = new header.Deck(8);

while(numberOfRounds<rounds) {
    d.shuffle();
    const shoe = Math.floor(Math.random()*27)+45;
    runningCount.value = 0;
    while() { // need to define the while condition
        blackjackSimulation(d, bet, runningCount, trueCountThreshold);
    }
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
fs.writeFile('BasicStrategyData.json', jsonData, (err) => {
  if (err) throw err;
});