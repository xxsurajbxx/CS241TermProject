import json
import matplotlib.pyplot as plt
import numpy as np

with open('BasicStrategyData.json', 'r') as file:
    data = json.load(file)
    resultsDictionary = data['resultsDictionary']
    results = data['results']
    totalRunningResults = data['totalRunningResults']
    totalRunningResultsPerGame = data['totalRunningResultsPerGame']
    overallRunningCount = data['overallRunningCount']
    numberOfRounds = data['numberOfRounds']
    totalResults = data['totalResults']

    print(f'Final Results: {totalResults}')
    wPercent = (resultsDictionary['wins']/numberOfRounds)*100
    lPercent = (resultsDictionary['losses']/numberOfRounds)*100
    dPercent = (resultsDictionary['draws']/numberOfRounds)*100
    print(f'win percentage: {wPercent}')
    print(f'loss percentage: {lPercent}')
    print(f'draw percentage: {dPercent}')


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
    groupings = 100
    xAxis = range(groupings+1)
    yAxis = [0]
    prevResult=0
    avgLine = [0 for i in range(groupings+1)]
    for i in range(len(totalRunningResults)):
        if i%groupings==0 and len(yAxis)==groupings+1:
            plt.plot(xAxis, yAxis, color='blue')
            prevResult=totalRunningResults[i]
            yAxis=[0]
        yAxis.append(totalRunningResults[i]-prevResult)
        avgLine[(i%groupings)+1] += totalRunningResults[i]-prevResult
    plt.plot(xAxis, avgLine, color='red') # this is supposed to visualize the average return per hand per grouping
    plt.xlim(0, groupings)

# plt.subplots_adjust(hspace=0.5)
plt.show()