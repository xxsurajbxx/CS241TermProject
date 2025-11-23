const seedrandom = require('seedrandom');
const fs = require('fs');
const header = require('./header.js');

const rounds = 1000;
const bet = 1;
seedrandom('abc', { global: true });
// we only play when the true count is at or above this threshold otherwise we let the dealer simulate hands by himself
const trueCountThreshold=-2;

const cardValues = ['2', '3', '4', '5', '6', '7', '8', '9', '10', 'J', 'Q', 'K', 'A'];
const playerTotals = [];
for (let i = 4; i <= 20; i++) {playerTotals.push(String(i));}
hardTable = {};
softTable = {};
hardTruthTable = {};
softTruthTable = {};
let t=0;
for(let i=0; i<cardValues.length; i++) {
    let mp1 = {};
    let mp2 = {};
    let t1 = {};
    let t2 = {};
    for(let j=0; j<playerTotals.length; j++) {
        //first value in the list corresponding to the move ('H', 'S', 'D') is returns and second is number of hands played
        mp1[playerTotals[j]] = {'H': [0,0], 'S': [0,0], 'D':[0,0]};
        t+=1;
        t1[playerTotals[j]] = false;
        if((Number(playerTotals[j]))>11) {
            mp2[playerTotals[j]] = {'H': [0,0], 'S': [0,0], 'D':[0,0]};
            t2[playerTotals[j]] = false;
            t+=1;
        }
    }
    hardTable[cardValues[i]] = mp1;
    softTable[cardValues[i]] = mp2;
    hardTruthTable[cardValues[i]] = t1;
    softTruthTable[cardValues[i]] = t2;
}
table = {'Hard': hardTable, 'Soft': softTable};
truthTable = {'Hard': hardTruthTable, 'Soft': softTruthTable};
const numRoundsTotal = t*rounds*3;

let move = null;
function blackjackSimulation(deck, betAmount, count, countThreshold=500, shoe=null) {
    var dealerHand = [];
    var trueCount = count.value/(deck.numCards/52);
    if(trueCount > countThreshold) {
        while(trueCount > countThreshold && d.cards.length>shoe) {deck.draw(count); trueCount = count.value/(deck.numCards/52);}
        return null;
    }
    var playerHand = [];
    header.dealCards(dealerHand, playerHand, deck, count);
    if(header.calcValues(dealerHand)[0]==21) {
        if(header.calcValues(playerHand)[0]==21) {return null;}
        return null;
    }
    var handVals = monteCarloOptiamalStrategySimulation(playerHand, dealerHand[0].value, deck, count);
    var dHandVal = header.dealerStrategy(deck, dealerHand, count);
    var totalReturn = header.evaluateReturn(handVals[0][0], dHandVal[0], handVals[0][1], dHandVal[1], handVals[0][2], handVals[0][3])*betAmount;
    if(move!=null) {
        table[move[0]][move[1]][move[2]][move[3]][0] += totalReturn;
        table[move[0]][move[1]][move[2]][move[3]][1] += 1;
        return totalReturn;
    }
    else{return null;}
}

function monteCarloOptiamalStrategySimulation(playersHand, dealerUpcard, deck, count, split=0) {
    let action=null;
    let val = header.calcValues(playersHand);
    var result;
    let played = false;
    move = null;
    if(val[0]!='21') {
        played=true;
        if(table[val[1]][dealerUpcard][val[0]]['H'][1] < rounds) {action='H'; playersHand.push(deck.draw(count)); result = [header.runStrategy(deck, playersHand, dealerUpcard, count, header.basicStrategy).concat(split>0)];}
        else if(table[val[1]][dealerUpcard][val[0]]['S'][1] < rounds) {action='S'; result = [[header.calcValues(playersHand)[0], playersHand.length, false, false]]}
        else if(table[val[1]][dealerUpcard][val[0]]['D'][1] < rounds) {action='D'; playersHand.push(deck.draw(count)); result = [[header.calcValues(playersHand)[0], playersHand.length, true, false]];}
        else {played=false;}
    }
    if(played) {move=[val[1], dealerUpcard, val[0], action];}
    else {result = [[header.calcValues(playersHand)[0], playersHand.length, true, false]];}

    return result;
}

var runningCount = new header.counter();
let d = new header.Deck(8);
let roundsCounter = 0;
while(roundsCounter<numRoundsTotal) {
    d.shuffle();
    const shoe = Math.floor(Math.random()*27)+45;
    runningCount.value = 0;
    while(d.cards.length>shoe && roundsCounter<numRoundsTotal) {
        if(blackjackSimulation(d, bet, runningCount, trueCountThreshold, shoe)!=null) {
            roundsCounter+=1;
        }
    }
    d.resetDeck();
}

const finalData = table;
const jsonData = JSON.stringify(finalData, null, 2);
fs.writeFile('NewStrategyData.json', jsonData, (err) => {
  if (err) throw err;
});