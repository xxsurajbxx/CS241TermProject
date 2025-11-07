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
    if(numAces==0 || total+10>21) {return [total, 'Hard'];}
    for(let i=1; i<=numAces; i++) {
        if(total+10<=21) {total+=10;}
        else {break;}
    }
    return [total, 'Soft'];
}

function dealerStrategy(deck, hand, count=null) {
    var handVal = calcValues(hand);
    while(handVal[0]<17 || handVal[1]=='Soft') {
        hand.push(deck.draw(count));
        handVal = calcValues(hand);
    }
    return handVal[0];
}

function evaluateReturn(pHandVal, dHandVal, doubled=false) {
    //console.log('Player hand value: ' + pHandVal);
    //console.log('Dealer hand value: ' + dHandVal);
    var multiplier = 1;
    if(doubled) {multiplier=2;}
    if(pHandVal>21) {
        //console.log('Player Busted');
        return -1*multiplier;
    }
    if(dHandVal>21) {
        //console.log('Dealer Busted');
        if(pHandVal==21 && pHandVal.length==2) {
            //console.log('Player Blackjack');
            return 1.5*multiplier;
        }
        return 1*multiplier;
    }
    if(pHandVal>dHandVal) {
        //console.log('Player beat dealer');
        if(pHandVal==21 && pHandVal.length==2) {
            //console.log('Player Blackjack');
            return 1.5*multiplier;
        }
        return 1*multiplier;
    }
    if(pHandVal==dHandVal) {
        //console.log('Push');
        return 0;
    }
    //console.log('Dealer beat Player');
    return -1*multiplier;
}

class counter {
    constructor(initialValue=0) {
        this.value = initialValue;
    }
}

function runBasicStrategy(deck, hand, dealerCard, count) {
    var handVal = calcValues(hand);
    var decision=null;
    while(handVal[0]<21 && decision!='s') {
        //console.log(hand);
        //console.log('value: ' + handVal[0] + ' stiffness: ' + handVal[1]);
        decision = basicStrategy(dealerCard, handVal[0], handVal[1]);
        //console.log('decision: ' + decision);
        switch(decision) {
            case 'h':
                //console.log('hit');
                hand.push(deck.draw(count));
                //console.log(hand);
                break;
            case 'dh':
                //console.log('hit');
                if(hand.length==2) {
                    hand.push(deck.draw(count));
                    //console.log('double');
                    handVal = calcValues(hand);
                    //console.log(hand);
                    return [handVal[0], true];
                }
                hand.push(deck.draw(count));
                break;

            case 'ds':
                if(hand.length==2) {
                    //console.log('double');
                    hand.push(deck.draw(count));
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
    //console.log('dCard: '+dCard);
    //console.log('handVal: '+handVal);
    //console.log('stiffness: '+stiffness);
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
                        case 'J':
                        case 'Q':
                        case 'K':
                        case 'A':
                            return 'h';
                        default:
                            return 'dh';
                    }
                case 11:
                    return 'dh';
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
                case 12:
                    return 'h';
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
                case 19:
                    switch(dCard) {
                        case '6':
                            return 'ds';
                        default:
                            return 's';
                    }
                default:
                    return 's';
            }
    }
}

function shouldSplit(pCard, dCard) {
    switch(pCard) {
        case '8':
        case 'A':
            return true;
        case '5':
        case '10':
        case 'J':
        case 'Q':
        case 'K':
            return false;
        case '9':
            switch(dCard) {
                case '7':
                case '10':
                case 'J':
                case 'Q':
                case 'K':
                case 'A':
                    return false
                default:
                    return true;
            }
        case '7':
            switch(dCard) {
                case '8':
                case '9':
                case '10':
                case 'J':
                case 'Q':
                case 'K':
                case 'A':
                    return false;
                default:
                    return true;
            }
        case '6':
            switch(dCard) {
                case '2':
                case '3':
                case '4':
                case '5':
                case '6':
                    return true;
                default:
                    return false;
            }
        case '4':
            switch(dCard) {
                case '5':
                case '6':
                    return true;
                default:
                    return false;
            }
        case '3':
        case '2':
            switch(dCard) {
                case '2':
                case '3':
                case '4':
                case '5':
                case '6':
                case '7':
                    return true;
                default:
                    return false;
            }
    }
}

function playOutHand(playersHand, dealerUpcard, deck, count, split=0) {
    //console.log('Current Hand: ' + playersHand);
    if(playersHand.length==2 && split<3 && playersHand[0]==playersHand[1] && shouldSplit(playersHand[0].value, dealerUpcard)) {
        var retVal = [];
        //console.log('splitting');
        retVal.concat(playOutHand([playersHand[0], deck.draw(count)], dealerUpcard, deck, count, split+1));
        retVal.concat(playOutHand([playersHand[1], deck.draw(count)], dealerUpcard, deck, count, split+1));
        return retVal;
    }
    else {
        return [runBasicStrategy(deck, playersHand, dealerUpcard, count)];
    }
}

function blackjackSimulation(deck, betAmount, count, countThreshold=-500) {
    var dealerHand = [];
    var trueCount = count.value/(deck.numCards/52);
    if(trueCount < countThreshold) {
        dealerHand.push(deck.draw(count));
        dealerHand.push(deck.draw(count));
        dealerStrategy(deck, dealerHand, count);
        return null;
    }

    var playerHand = [];
    dealCards(dealerHand, playerHand, deck, count);
    //console.log(count.value);
    if(calcValues(dealerHand)[0]==21) {
        if(calcValues(playerHand)[0]==21) {
            //console.log('dealer hand: ' + dealerHand);
            //console.log('player hand: ' + playerHand);
            return 0;
        }
        //console.log('dealer hand: ' + dealerHand);
        //console.log('player hand: ' + playerHand);
        return -1*betAmount;
    }

    //console.log("Dealer Card: " + dealerHand[0].value);
    var handVals = playOutHand(playerHand, dealerHand[0].value, deck, count);
    //console.log('player hand vals: ' + handVals);
    var dHandVal = dealerStrategy(deck, dealerHand, count);
    //console.log('dealer hand: ' + dealerHand);
    //console.log('Dealer Hand Value: ' + dHandVal);
    var totalReturn = 0;
    for(let i=0; i<handVals.length; i++) {
        //console.log('player hand: ' + handVals[i]);
        var ret = evaluateReturn(handVals[i][0], dHandVal, handVals[i][1])*betAmount;
        //console.log('return: ' + ret);
        totalReturn += ret;
    }
    //console.log('total return: ' + totalReturn);
    return totalReturn;
}

module.exports = {
  Card,
  Deck,
  dealCards,
  calcValues,
  dealerStrategy,
  evaluateReturn,
  counter,
  runBasicStrategy,
  basicStrategy,
  shouldSplit,
  blackjackSimulation
};