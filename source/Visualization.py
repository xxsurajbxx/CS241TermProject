import json
import matplotlib.pyplot as plt
import numpy as np
import sys

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

        print(f'Final Results: {totalResults}')
        print(f'House Edge: {-1*(totalResults/numberOfRounds)}')
        wPercent = (resultsDictionary['wins']/numberOfRounds)*100
        lPercent = (resultsDictionary['losses']/numberOfRounds)*100
        dPercent = (resultsDictionary['draws']/numberOfRounds)*100
        print(f'win percentage: {wPercent: .2f}')
        print(f'loss percentage: {lPercent: .2f}')
        print(f'draw percentage: {dPercent: .2f}')


        #"resultsPerGame": resultsPerGame, still need to do something with this
        """
        fig, (ax1, ax2) = plt.subplots(2, 1, figsize=(8, 8), sharey=True)
        ax1.plot(np.arange(len(results)), results)
        ax1.set_xlabel('Time')
        ax1.set_ylabel('Results')
        ax1.set_title('Results vs Time')
        ax2.scatter(overallRunningCount, results)
        ax2.set_xlabel('Count')
        ax2.set_ylabel('Results')
        ax2.set_title('Results vs Count')
        """

        # Regression
        #plt.figure(1)
        #npOverallRunningCount = np.array(overallRunningCount)
        #npResults = np.array(results)

        #coefficients = np.polyfit(npOverallRunningCount, npResults, 10)
        #r_squared = np.corrcoef(npOverallRunningCount, np.array(results))[0, 1]**2
        #regression = np.poly1d(coefficients)
        #plt.plot(range(min(npOverallRunningCount), max(npOverallRunningCount)+1), regression(range(min(npOverallRunningCount), max(npOverallRunningCount)+1)))
        #print(f'r^2: {r_squared}')
        #plt.scatter(overallRunningCount, npResults)

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
                groupedResults.append(yAxis)
                plt.plot(xAxis, yAxis, color='blue')
                prevResult=totalRunningResults[i]
                yAxis=[0]
            yAxis.append(totalRunningResults[i]-prevResult)
            avgLine[(i%groupings)+1] += totalRunningResults[i]-prevResult
            if i>=numberOfRounds-groupings:
                avgLine[(i%groupings)+1]/=(numberOfRounds/groupings)
        plt.plot(xAxis, avgLine, color='red') # this is supposed to visualize the average return per hand per grouping
        plt.xlim(0, groupings)
        
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
        boolMask = yAxis[:, 1] >= 10000 # here i filter by the number of occurances of each count (to remove outliers)
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
        
    #plt.yscale('log')
    plt.show()