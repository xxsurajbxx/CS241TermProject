import json
import matplotlib.pyplot as plt
import numpy as np
import sys
import statistics

if len(sys.argv) !=2:
    print('please supply the path of the data file to visualize')

else:
    with open(sys.argv[1], 'r') as file:
        data = json.load(file)
        resultsDictionary = data['resultsDictionary']
        results = data['results']
        totalRunningResults = data['totalRunningResults']
        totalRunningResultsPerGame = data['totalRunningResultsPerGame']
        overallRunningCount = data['overallRunningCount']
        numberOfRounds = data['numberOfRounds']
        totalResults = data['totalResults']

        # Graphing returns from Monte Carlo Simulation
        avgReturnVsCount = {}
        plt.figure(2)
        groupings = 100000
        xAxis = range(groupings+1)
        groupedResults = []
        yAxis = [0]
        prevResult=0
        avgLine = [0 for i in range(groupings+1)]
        plt.figure(1)
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
                plt.plot(xAxis, yAxis, color='blue')
                prevResult=totalRunningResults[i]
                yAxis=[0]
            yAxis.append(totalRunningResults[i]-prevResult)
            avgLine[(i%groupings)+1] += totalRunningResults[i]-prevResult
            if i>=numberOfRounds-groupings:
                avgLine[(i%groupings)+1]/=(numberOfRounds/groupings)
        plt.plot(xAxis, avgLine, color='red') # this visualizes the average return per hand per grouping
        plt.xlim(0, groupings)
        
        #Linear Regression
        plt.figure(2)
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
        plt.plot(xAxis, yAxis)
        regressionCoefficients = np.polyfit(xAxis, yAxis, 1)
        r_squared = np.corrcoef(xAxis, yAxis)[0, 1]**2
        regressionFunction = np.poly1d(regressionCoefficients)
        plt.plot(np.linspace(min(xAxis), max(xAxis), 100), regressionFunction(np.linspace(min(xAxis), max(xAxis), 100)))
        plt.errorbar(xAxis, yAxis, yerr=standardErrorPerCount, fmt='-o')
        #plt.ylim(-0.25, 0.25)
        plt.plot(np.linspace(min(xAxis), max(xAxis), 2), [0, 0])
        print(f'r^2: {r_squared}')

        #Box and Whisker Plot
        plt.figure(3)
        returnPerGroup = [g[-1] for g in groupedResults]
        plt.boxplot(returnPerGroup)

        # Basic Statistics
        percentageReturns=totalResults/numberOfRounds
        print(f'Final Results: {totalResults}')
        print(f'House Edge: {-1*percentageReturns}')
        wPercent = (resultsDictionary['wins']/numberOfRounds)*100
        lPercent = (resultsDictionary['losses']/numberOfRounds)*100
        dPercent = (resultsDictionary['draws']/numberOfRounds)*100
        print(f'win percentage: {wPercent: .2f}')
        print(f'loss percentage: {lPercent: .2f}')
        print(f'draw percentage: {dPercent: .2f}')
        print(f'Slope of our regression line (expected increase in avg return per increase in count): {regressionCoefficients[0]}')
        print(f'lowest our bankroll went: {min([min(g) for g in groupedResults])}')
        print(f'Sharpe Ratio: {percentageReturns/statistics.stdev(results)}')
    plt.show()