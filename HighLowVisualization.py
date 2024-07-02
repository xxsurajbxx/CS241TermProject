import json
import matplotlib.pyplot as plt
import numpy as np

with open('HighLowCardCountingData.json', 'r') as file:
    data = json.load(file)
    resultsDictionary = data['resultsDictionary']
    results = data['results']
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


    fig, (ax1, ax2) = plt.subplots(2, 1, figsize=(8, 8), sharey=True)
    ax1.plot(np.arange(len(results)), results)
    ax1.set_xlabel('Time')
    ax1.set_ylabel('Results')
    ax1.set_title('Results vs Time')
    ax2.scatter(overallRunningCount, results)
    ax2.set_xlabel('Count')
    ax2.set_ylabel('Results')
    ax2.set_title('Results vs Count')

plt.subplots_adjust(hspace=0.5)
plt.show()