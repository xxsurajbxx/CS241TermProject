const seedrandom = require('seedrandom');
const fs = require('fs');

class Card {
    constructor(cardVal, suit) {
        this.string = cardVal+suit;
        this.value = cardVal;
        this.suit = suit;
    }
    toString() {
        let str = "";
        switch(this.value) {
            case 'A':
                str = "Ace";
                break;
            case 'J':
                str = "Jack";
                break;
            case 'Q':
                str = "Queen";
                break;
            case 'K':
                str = "King";
                break;
            default:
                str = this.value.toString();
                break;
        }
        str += " of ";
        switch(this.suit) {
            case 'S':
                str += "Spades";
                break;
            case 'D':
                str += "Diamonds";
                break;
            case 'C':
                str += "Clubs";
                break;
            case 'H':
                str += "Hearts";
                break;
        }
        return str;
    }
    getValue() {
        return this.value;
    }
    getSuit() {
        return this.suit;
    }
}

class Deck {
    constructor(numOfDecks) {
        this.numCards = numOfDecks*52;
        this.numOfDecks = numOfDecks;
        this.drawnCards = [];
        this.cards = [];
        for(let i=0; i<numOfDecks; i++) {
            for(let c=1; c<=13; c++) {
                for(let suit=0; suit<4; suit++) {
                    var v;
                    var s;
                    switch(c) {
                        case 1:
                            v = 'A';
                            break;
                        case 11:
                            v = 'J';
                            break;
                        case 12:
                            v = 'Q';
                            break;
                        case 13:
                            v = 'K';
                            break;
                        default:
                            v = c.toString();;
                            break
                    }
                    switch(suit) {
                        case 0:
                            s = 'S';
                            break;
                        case 1:
                            s = 'D';
                            break;
                        case 2:
                            s = 'C';
                            break;
                        case 3:
                            s = 'H';
                            break;
                    }
                    this.cards.push(new Card(v, s));
                }
            }
        }
    }
    draw(count=null) {
        this.numCards-=1;
        var rm = this.cards.pop();
        if(count!=null) {
            switch(rm.value) {
                case '2':
                case '3':
                case '4':
                case '5':
                case '6':
                    count.value +=1;
                    //console.log(rm.value + ': +1');
                    break;
                case '10':
                case 'J':
                case 'Q':
                case 'K':
                case 'A':
                    count.value -=1;
                    //console.log(rm.value + ': -1');
                    break;
                default:
                    //console.log(rm.value + ': 0');
            }
        }
        this.drawnCards.push(rm);
        return rm;
    }
    shuffle() {
        this.bridgeShuffle();
        this.bridgeShuffle();
        this.cutShuffle();
        this.bridgeShuffle();
        this.bridgeShuffle();
        this.cutShuffle();
        this.bridgeShuffle();
        this.bridgeShuffle();
    }
    bridgeShuffle() {
        var half = (this.cards.length/2) + Math.floor(Math.random()*10);
        var l1 = this.cards.slice(0,half);
        var l2 = this.cards.slice(half,this.cards.length);
        var f = true;
        var cntr=0;
        while(l1.length!=0 || l2.length!=0) {
            for(var i=0; i<Math.ceil(Math.random()*(Math.ceil(Math.random()*2))); i++) {
                if(f && l1.length>0) {
                    this.cards[cntr++] = l1.shift();
                }
                if(!f && l2.length>0) {
                    this.cards[cntr++] = l2.shift();
                }
            }
            f = !f;
        }
    }
    cutShuffle() {
        var half = (this.cards.length/2) + Math.floor(Math.random()*10);
        var l1 = this.cards.slice(0,half);
        var l2 = this.cards.slice(half,this.cards.length);
        var cntr=0;
        while(cntr!=l2.length-1) {
            this.cards[cntr++] = l2[cntr];
        }
        while(cntr-l2.length!=l1.length-1) {
            this.cards[cntr++] = l1[cntr-l2.length];
        }
    }
}

function dealCards(dealer, player, d, count=null) {
    dealer.push(d.draw(count));
    player.push(d.draw(count));
    dealer.push(d.draw(count));
    player.push(d.draw(count));
}

function calcValues(hand) {
    let total = 0;
    let numAces = 0;
    for(let i=0; i<hand.length; i++) {
        switch(hand[i].getValue()) {
            case 'A':
                numAces += 1;
                break;
            case 'J':
            case 'Q':
            case 'K':
                total += 10;
                break;
            default:
                total += parseInt(hand[i].getValue());
                break;
        }
    }
    total+=numAces;
    stiffness = 'Hard';
    if(numAces!=0) {
        for(let i=1; i<=numAces; i++) {
            if(total+(10*i)>21) {
                return [total, stiffness];
            }
            else {
                total += 10*i;
                stiffness = 'Soft';
            }
        }
    }
    return [total, stiffness];
}

function dealerStrategy(deck, hand, count=null) {
    var handVal = calcValues(hand)[0];
    while(handVal<17) {
        hand.push(deck.draw(count));
        handVal = calcValues(hand)[0];
    }
    return handVal;
}

function evaluateReturn(pHandVal, dHandVal, doubled=false) {
    var multiplier = 1;
    if(doubled) {multiplier=2;}
    if(pHandVal>21) {return -1*multiplier;}
    if(dHandVal>21) {
        if(pHandVal==21) {
            return 1.5*multiplier;
        }
        return 1*multiplier;
    }
    if(pHandVal>dHandVal) {
        if(pHandVal==21) {return 1.5*multiplier;}
        return 1*multiplier;
    }
    if(pHandVal==dHandVal) {return 0*multiplier;}
    return -1*multiplier;
}

class counter {
    constructor(initialValue=0) {
        this.value = initialValue;
    }
}
var runningCount = new counter();

//this code is standard in every file. I'll try to find a way to modularize this code if I have time



function runBasicStrategy(deck, hand, dealerCard, canDouble) {
    var handVal = calcValues(hand);
    var decision;
    while(handVal[0]<21 && decision!='s') {
        //console.log(hand);
        //console.log('value: ' + handVal[0] + ' stiffness: ' + handVal[1]);
        decision = basicStrategy(dealerCard.value, handVal[0], handVal[1]);
        switch(decision) {
            case 'h':
                //console.log('hit');
                hand.push(deck.draw(runningCount));
                //console.log(hand);
                canDouble = false;
                break;
            case 'dh':
                //console.log('hit');
                hand.push(deck.draw(runningCount));
                if(canDouble) {
                    //console.log('double');
                    handVal = calcValues(hand);
                    //console.log(hand);
                    return [handVal[0], true];
                }
                break;

            case 'ds':
                if(canDouble) {
                    //console.log('double');
                    hand.push(deck.draw(runningCount));
                    handVal = calcValues(hand);
                    //console.log(hand);
                    return [handVal[0], true];
                }
                decision = 's';
                break;
        }
        handVal = calcValues(hand);
    }
    //console.log('stand');
    //console.log(hand);
    return [handVal[0], false];
}

function basicStrategy(dCard, handVal, stiffness) {
    switch(stiffness) {
        case 'Hard':
            switch(handVal) {
                case 4:
                case 5:
                case 6:
                case 7:
                case 8:
                    return 'h';
                case 9:
                    switch(dCard) {
                        case '3':
                        case '4':
                        case '5':
                        case '6':
                            return 'dh';
                        default:
                            return 'h';
                    }
                case 10:
                    switch(dCard) {
                        case '10':
                        case 'A':
                            return 'h';
                        default:
                            return 'dh';
                    }
                case 11:
                    switch(dCard) {
                        case 'A':
                            return 'h';
                        default:
                            return 'dh';
                    }
                case 12:
                    switch(dCard) {
                        case '4':
                        case '5':
                        case '6':
                            return 's';
                        default:
                            return 'h';
                    }
                case 13:
                case 14:
                case 15:
                case 16:
                    switch(dCard) {
                        case '2':
                        case '3':
                        case '4':
                        case '5':
                        case '6':
                            return 's';
                        default:
                            return 'h';
                    }
                default:
                    return 's';
            }
        case 'Soft':
            switch(handVal) {
                case 13:
                case 14:
                    switch(dCard) {
                        case '5':
                        case '6':
                            return 'dh';
                        default:
                            return 'h';
                    }
                case 15:
                case 16:
                    switch(dCard) {
                        case '4':
                        case '5':
                        case '6':
                            return 'dh';
                        default:
                            return 'h';
                    }
                case 17:
                    switch(dCard) {
                        case '3':
                        case '4':
                        case '5':
                        case '6':
                            return 'dh';
                        default:
                            return 'h';
                    }
                case 18:
                    switch(dCard) {
                        case '2':
                        case '7':
                        case '8':
                            return 's';
                        case '9':
                        case '10':
                        case 'A':
                            return 'h';
                        default:
                            return 'ds';
                    }
                default:
                    return 's';
            }
    }
}

function evaluateSplitReturn(hand1, h1Doubled, hand2, h2Doubled, dHandVal) { //need to fill out logic for if the player doubles
    var return1=evaluateReturn(hand1, dHandVal, h1Doubled);
    var return2=evaluateReturn(hand2, dHandVal, h2Doubled);
    return return1*0.5+return2*0.5;
}

function shouldSplit(pCard, dCard) {
    switch(pCard) {
        case '4':
            switch(dCard) {
                case '5':
                case '6':
                    return true;
                default:
                    return false;
            }
        case '6':
            switch(dCard) {
                case '7':
                case '8':
                case '9':
                case '10':
                case 'A':
                    return false;
                default:
                    return true;
            }
        case '2':
        case '3':
        case '7':
            switch(dCard) {
                case '8':
                case '9':
                case '10':
                case 'A':
                    return false;
                default:
                    return true;
            }
        case '8':
        case 'A':
            return true;
        case '9':
            switch(dCard) {
                case '7':
                case '10':
                case 'A':
                    return false;
                default:
                    return true;
            }
        case 'A':
            return true;
    }
}

function blackjackSimulation(deck, betAmount) { //this code seems perfect (havent tested it though)
    var dealerHand = [];
    var playerHand = [];
    dealCards(dealerHand, playerHand, deck, runningCount);
    if(calcValues(dealerHand)[0]==21) {
        if(calcValues(playerHand)[0]==21) {
            return 0;
        }
        return -1*betAmount;
    }

    //console.log("Dealer Card: " + dealerHand[0]);
    if(playerHand[0].value === playerHand[1].value && shouldSplit(playerHand[0].value, dealerHand[0].value)) {
        //console.log('splitting');
        var h1 = [playerHand[0], deck.draw(runningCount)];
        //console.log('hand 1: ' + h1);
        var handVal1 = runBasicStrategy(deck, h1, dealerHand[0], false);
        var h2 = [playerHand[1], deck.draw(runningCount)];
        //console.log('hand 2: ' + h2);
        var handVal2 = runBasicStrategy(deck, h2, dealerHand[0], false);
        var dHandVal = dealerStrategy(deck, dealerHand);

        //console.log('Player Hand Value: ' + handVal1[0]);
        //console.log('Player Hand Value: ' + handVal2[0]);
        //console.log('Dealer Hand Value: ' + dHandVal);

        return betAmount*evaluateSplitReturn(handVal1[0], handVal1[1], handVal2[0], handVal2[1], dHandVal);
    }
    else {
        var pHandVal = runBasicStrategy(deck, playerHand, dealerHand[0], true);
        //console.log('Player Hand Value: ' + pHandVal[0]);
        var dHandVal = dealerStrategy(deck, dealerHand);
        //console.log('Dealer Hand Value: ' + dHandVal);
        return evaluateReturn(pHandVal[0], dHandVal, pHandVal[1])*betAmount;
    }
}

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

const rounds = 100;
const bet = 1;
var played = true;
seedrandom('69', { global: true });

let totalResults = 0;
let results = [];
let resultsPerGame = [];
let resultsDictionary = {"wins":0, "losses":0, "draws":0};
let numberOfRounds = 0;
let overallRunningCount = [];

while(numberOfRounds<rounds) {
    let d = new Deck(8);
    d.shuffle();
    const shoe = Math.floor(Math.random()*27)+45;
    var gameResult = [];
    while(d.cards.length>shoe) {
        const count = runningCount.value;
        const result = blackjackSimulation(d, bet);
        if(played) {
            results.push(result);
            overallRunningCount.push(count);
            totalResults += result;
            if(result>0) {resultsDictionary["wins"] += 1;}
            else if(result<0) {resultsDictionary["losses"] += 1;}
            else if(result==0) {resultsDictionary["draws"] += 1;}
            numberOfRounds+=1;
            gameResult.push(result);
        }
        if(numberOfRounds==rounds) {break;}
    }
    resultsPerGame.push(gameResult);
    runningCount.value = 0;
}

const finalData = {
    "totalResults": totalResults,
    "numberOfRounds": numberOfRounds,
    "resultsDictionary": resultsDictionary,
    "results": results,
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