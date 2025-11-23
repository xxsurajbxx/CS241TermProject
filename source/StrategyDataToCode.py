import json
import matplotlib.pyplot as plt
import numpy as np
import sys

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
                linesOfCode.append("\t"*tabs+f"case '{j}':")
                tabs+=1
                d = hardData[j][str(i)]
                m = 'H' if d['H'][0]>=d['S'][0] else 'S'
                m = m if d[m][0]>d['D'][0] else f'd{m}'
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
                linesOfCode.append("\t"*tabs+f"case '{j}':")
                tabs+=1
                s = softData[j][str(i)]
                m = 'H' if s['H'][0]>=s['S'][0] else 'S'
                m = m if s[m][0]>s['D'][0] else f'd{m}'
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