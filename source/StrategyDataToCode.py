import json
import matplotlib.pyplot as plt
import numpy as np
import sys
import statistics

if len(sys.argv) < 2:
    print('please supply the path of the data file to parse')

else:
    file = str(sys.argv[1])
    with open(file, 'r') as f:
        data = json.load(f)
        hardData = data['Hard']
        softData = data['Soft']
        dealerCards = ['2', '3', '4', '5', '6', '7', '8', '9', '10', 'J', 'Q', 'K', 'A']
        linesOfCode = []
        code = "\n"
        linesOfCode.append("switch(stiffness) {")
        tabs = 1
        linesOfCode.append("\t"*tabs+"case 'Hard':")
        tabs+=1
        linesOfCode.append("\t"*tabs+"switch(handVal) {")
        tabs+=1
        for i in range(4, 21): #player card total
            linesOfCode.append("\t"*tabs+f"case {i}:")
            tabs+=1
            linesOfCode.append("\t"*tabs+"switch(dCard) {")
            tabs+=1
            for j in dealerCards:
                linesOfCode.append("\t"*tabs+f"case {j}:")
                tabs+=1
                d = hardData[j][str(i)]
                m = 'H' if d['H'][0]>=d['S'][0] else 'S'
                m = m if d[m][0]>d['D'][0] else f'D{m}'
                decision = m.lower()
                linesOfCode.append("\t"*tabs+f"return '{decision}';")
                tabs-=1
            tabs-=1
            linesOfCode.append("\t"*tabs+"}")
            tabs-=1
        tabs-=1
        linesOfCode.append("\t"*tabs+"}")
        tabs-=1

        linesOfCode.append("\t"*tabs+"case 'Soft':")
        tabs+=1
        linesOfCode.append("\t"*tabs+"switch(handVal) {")
        tabs+=1
        for i in range(12, 21): #player card total
            linesOfCode.append("\t"*tabs+f"case {i}:")
            tabs+=1
            linesOfCode.append("\t"*tabs+"switch(dCard) {")
            tabs+=1
            for j in dealerCards:
                linesOfCode.append("\t"*tabs+f"case {j}:")
                tabs+=1
                s = softData[j][str(i)]
                m = 'H' if s['H'][0]>=s['S'][0] else 'S'
                m = m if s[m][0]>s['D'][0] else f'D{m}'
                decision = m.lower()
                linesOfCode.append("\t"*tabs+f"return '{decision}';")
                tabs-=1
            tabs-=1
            linesOfCode.append("\t"*tabs+"}")
            tabs-=1
        tabs-=1
        linesOfCode.append("\t"*tabs+"}")
        tabs-=1
        tabs-=1
        linesOfCode.append("\t"*tabs+"}")
        code = code.join(linesOfCode)
        print(code)






"""
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
"""