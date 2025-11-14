import json
import matplotlib.pyplot as plt
import numpy as np
import sys
import statistics
import re

if len(sys.argv) < 2:
    print('please supply the path of the data file to visualize')

else:
    for i in range(1, len(sys.argv)):
        file = str(sys.argv[i])
        with open(file, 'r') as f:
            data = json.load(f)
            resultsDictionary = data['resultsDictionary']
            results = data['results']
            totalRunningResults = data['totalRunningResults']
            overallRunningCount = data['overallRunningCount']
            numberOfRounds = data['numberOfRounds']
            totalResults = data['totalResults']

            fig, axs = plt.subplots(nrows=2, ncols=2, figsize=(10, 8))

            # Graphing returns from Monte Carlo Simulation
            avgReturnVsCount = {}
            groupings = 100000
            xAxis = range(groupings+1)
            groupedResults = []
            yAxis = [0]
            prevResult=0
            avgLine = [0 for i in range(groupings+1)]
            stdDevPerCount = {}
            for i in range(len(totalRunningResults)):
                if overallRunningCount[i] in avgReturnVsCount:
                    avgReturnVsCount[overallRunningCount[i]][0] += results[i]
                    avgReturnVsCount[overallRunningCount[i]][1] += 1
                else:
                    avgReturnVsCount[overallRunningCount[i]] = []
                    avgReturnVsCount[overallRunningCount[i]].append(results[i])
                    avgReturnVsCount[overallRunningCount[i]].append(1)
                
                if overallRunningCount[i] in stdDevPerCount:
                    stdDevPerCount[overallRunningCount[i]] += results[i]**2
                else:
                    stdDevPerCount[overallRunningCount[i]] = results[i]**2
                
                if i%groupings==0 and len(yAxis)==groupings+1:
                    groupedResults.append(yAxis[:])
                    axs[0, 0].plot(xAxis, yAxis, color='gray')
                    prevResult=totalRunningResults[i]
                    yAxis=[0]
                yAxis.append(totalRunningResults[i]-prevResult)
                avgLine[(i%groupings)+1] += totalRunningResults[i]-prevResult
                if i>=numberOfRounds-groupings:
                    avgLine[(i%groupings)+1]/=(numberOfRounds/groupings)
            axs[0, 0].plot(xAxis, avgLine, color=('green' if totalResults>=0 else 'red')) # this visualizes the average return per hand per grouping
            axs[0, 0].set_xlim(0, groupings)
            
            #Linear Regression
            xAxis = np.array(list(avgReturnVsCount.keys()))
            yAxis = np.array(list(avgReturnVsCount.values()))
            stdDevPerCount = np.array(list(stdDevPerCount.values()))
            sortedIndexes = np.argsort(xAxis)
            xAxis = xAxis[sortedIndexes]
            yAxis = yAxis[sortedIndexes]
            stdDevPerCount = stdDevPerCount[sortedIndexes]
            stdDevPerCount = np.sqrt((stdDevPerCount/yAxis[:, 1])- ((yAxis[:, 0]/yAxis[:, 1])**2))
            standardErrorPerCount = stdDevPerCount / np.sqrt(yAxis[:, 1])
            boolMask = ((standardErrorPerCount[:] < 0.01) & (yAxis[:, 1] >= 1000)) # here i filter by the amount of std error and data per count
            xAxis = xAxis[boolMask]
            yAxis = yAxis[boolMask]
            stdDevPerCount = stdDevPerCount[boolMask]
            standardErrorPerCount = standardErrorPerCount[boolMask]
            yAxis = yAxis[:, 0]/yAxis[:, 1]
            axs[0, 1].plot(xAxis, yAxis)
            regressionCoefficients = np.polyfit(xAxis, yAxis, 1)
            r_squared = np.corrcoef(xAxis, yAxis)[0, 1]**2
            regressionFunction = np.poly1d(regressionCoefficients)
            axs[0, 1].errorbar(xAxis, yAxis, yerr=standardErrorPerCount, fmt='-o', color='gray')
            axs[0, 1].plot(np.linspace(min(xAxis), max(xAxis), 2), [0, 0], color='red')
            axs[0, 1].plot(np.linspace(min(xAxis), max(xAxis), 100), regressionFunction(np.linspace(min(xAxis), max(xAxis), 100)), color='green' if regressionCoefficients[0]>=0 else 'red')

            #Box and Whisker Plot
            returnPerGroup = [g[-1] for g in groupedResults]
            axs[1, 0].boxplot(returnPerGroup)

        # Basic Statistics
        percentageReturns=(totalResults/numberOfRounds)*100
        wPercent = (resultsDictionary['wins']/numberOfRounds)*100
        lPercent = (resultsDictionary['losses']/numberOfRounds)*100
        dPercent = (resultsDictionary['draws']/numberOfRounds)*100
        chartStatistics = f'Final Results: {totalResults}\nEdge: {-1*percentageReturns: .2f}%\nWin Percentage: {wPercent: .2f}\nLoss Percentage: {lPercent: .2f}\nDraw Percentage: {dPercent: .2f}\nr^2: {r_squared: .4f}\nSlope: {regressionCoefficients[0]: .4f}\nBankroll Minimum(per {groupings} hands): {min([min(g) for g in groupedResults])}\nSharpe Ratio: {percentageReturns/statistics.stdev(results): .4f}\n'
        table_data = [
            ["Final Results:", f"{totalResults}"],
            ["Edge:", f"{-1*percentageReturns:.2f}%"],
            ["Win Percentage:", f"{wPercent:.2f}"],
            ["Loss Percentage:", f"{lPercent:.2f}"],
            ["Draw Percentage:", f"{dPercent:.2f}"],
            ["r^2:", f"{r_squared:.4f}"],
            ["Slope:", f"{regressionCoefficients[0]:.4f}"],
            [f"Bankroll Minimum:", f"{min([min(g) for g in groupedResults])}"],
            ["Sharpe Ratio:", f"{percentageReturns/statistics.stdev(results):.4f}"]
        ]
        table_ax = axs[1, 1]
        table_ax.axis('off')
        table = table_ax.table(cellText=table_data, loc='center', cellLoc='left', colWidths=[0.6, 0.4])
        table.auto_set_font_size(False)
        table.set_fontsize(10) 
        table.scale(1, 1.5)
        plotName = file.split(".")[0][:-4]
        plt.suptitle(f'{plotName} Data Visualized', fontsize=16)
        plt.tight_layout(rect=[0, 0, 1, 0.96])
        fig.savefig(plotName, dpi=300, bbox_inches='tight')
    plt.show()