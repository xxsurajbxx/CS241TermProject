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
        const rm = this.cards.pop();
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
        let currentIndex = this.cards.length;
        let randomIndex;
        while (currentIndex !== 0) {
            randomIndex = Math.floor(Math.random() * currentIndex);
            currentIndex--;
            [this.cards[currentIndex], this.cards[randomIndex]] = [this.cards[randomIndex], this.cards[currentIndex]];
        }
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
            for(var i=0; i<Math.ceil(Math.random()*2); i++) {
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
        this.cards = []
        this.cards = this.cards.concat(l2);
        this.cards = this.cards.concat(l1);
    }
    resetDeck() {
        this.numCards = this.numOfDecks*52;
        this.cards = this.cards.concat(this.drawnCards);
        this.drawnCards = [];
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
    while(handVal[0]<17 || (handVal[1]=='Soft' && handVal[0]==17)) {
        hand.push(deck.draw(count));
        handVal = calcValues(hand);
    }
    return [handVal[0], hand.length];
}

function evaluateReturn(pHandVal, dHandVal, pNumOfCards, dNumOfCards, doubled=false, split=false) {
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
        if(pHandVal==21 && pNumOfCards==2 && !split) {
            //console.log('Player Blackjack');
            return 1.5*multiplier;
        }
        return 1*multiplier;
    }
    if(pHandVal>dHandVal) {
        //console.log('Player beat dealer');
        if(pHandVal==21 && pNumOfCards==2 && !split) {
            //console.log('Player Blackjack');
            return 1.5*multiplier;
        }
        return 1*multiplier;
    }
    if(pHandVal==dHandVal) {
        if(pHandVal==21 && pNumOfCards==2 && !split && dNumOfCards>2) {
            //console.log('Player Blackjack');
            return 1.5*multiplier;
        }
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

function runStrategy(deck, hand, dealerCard, count, strategy) {
    var handVal = calcValues(hand);
    var decision=null;
    while(handVal[0]<21 && decision!='s') {
        //console.log(hand);
        //console.log('value: ' + handVal[0] + ' stiffness: ' + handVal[1]);
        decision = strategy(dealerCard, handVal[0], handVal[1]);
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
                    return [handVal[0], hand.length, true];
                }
                hand.push(deck.draw(count));
                break;

            case 'ds':
                if(hand.length==2) {
                    //console.log('double');
                    hand.push(deck.draw(count));
                    handVal = calcValues(hand);
                    //console.log(hand);
                    return [handVal[0], hand.length, true];
                }
                decision = 's';
                break;
        }
        handVal = calcValues(hand);
    }
    //console.log('stand');
    //console.log(hand);
    return [handVal[0], hand.length, false];
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
                        case 'J':
                        case 'Q':
                        case 'K':
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
    if(playersHand.length==2 && split<3 && playersHand[0].value==playersHand[1].value && shouldSplit(playersHand[0].value, dealerUpcard)) {
        var retVal = [];
        //console.log('splitting');
        retVal = retVal.concat(playOutHand([playersHand[0], deck.draw(count)], dealerUpcard, deck, count, split+1));
        retVal = retVal.concat(playOutHand([playersHand[1], deck.draw(count)], dealerUpcard, deck, count, split+1));
        return retVal;
    }
    else {
        if(split>0 && playersHand[0].value=='A') {
            handVal = calcValues(playersHand);
            return [[handVal[0], playersHand.length, false, true]];
        }
        return [runStrategy(deck, playersHand, dealerUpcard, count, basicStrategy).concat(split>0)];
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
        //console.log('Dealer Blackjack');
        if(calcValues(playerHand)[0]==21) {
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
    var dHandVal = dealerStrategy(deck, dealerHand, count);
    //console.log('Dealer hand: ' + dealerHand);
    //console.log('Player hand: ' + playerHand);
    //console.log('Dealer Hand Value: ' + dHandVal);
    var totalReturn = 0;
    for(let i=0; i<handVals.length; i++) {
        var ret = evaluateReturn(handVals[i][0], dHandVal[0], handVals[i][1], dHandVal[1], handVals[i][2], handVals[i][3])*betAmount;
        //console.log('return: ' + ret);
        totalReturn += ret;
    }
    //console.log('total return: ' + totalReturn);
    return totalReturn;
}

function betSpread(count) {
    return 9.5/(1+19*Math.exp(-0.75*count));
}

module.exports = {
  Card,
  Deck,
  dealCards,
  calcValues,
  dealerStrategy,
  evaluateReturn,
  counter,
  runStrategy,
  basicStrategy,
  shouldSplit,
  blackjackSimulation,
  betSpread
};