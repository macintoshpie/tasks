<template>
  <div id="app">
    <div id="tasks-container">
      <TaskCreator :createTask="createTask"/>
      <draggable v-model="tasks" group="people" @start="drag = true" @end="drag = false">
        <transition-group name="list" tag="p">
        <Task
          v-for="task in tasks"
          :key="task.id"
          :id="task.id"
          :description="task.description"
          :expectedEstimate="task.expected"
          :deleteTask="deleteTask"
          @update="updateTask"
        />
        </transition-group>
      </draggable>
    </div>
    <div id="chart-container">
      <button @click="simulate" id="simulate-button" :disabled="!canSimulate">Simulate</button>
      <div v-if="chartdata" class="chartdata">
        <Chart :chartData="chartdata" :options="chartoptions" :key="units"/>
        <div class="chart-buttons">
          <button class="dark-button" @click="units = 'hr'">Hours</button>
          <button class="dark-button" @click="units = 'dy'">Days</button>
          <button class="dark-button" @click="units = 'wk'">Weeks</button>
          <button class="dark-button" @click="units = 'mo'">Months</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import Vue from 'vue'
import draggable from 'vuedraggable'

import utils from './utils.js'
import Chart from './components/Chart.vue'
import Task from './components/Task.vue'
import TaskCreator from './components/TaskCreator.vue'

const hoursMap = {
  hr: 1,
  dy: 24,
  wk: 168,
  mo: 730
}

const NUM_BINS = 40
const NUM_SAMPLES = 100000

export default {
  name: 'App',
  components: {
    draggable,
    Chart,
    Task,
    TaskCreator
  },
  data: function() {
    return {
      currentId: 100,
      tasks: [],
      simBinned: null,
      simMin: null,
      simMax: null,
      units: 'dy'
    }
  },
  methods: {
    createTask: function({ description, expected }) {
      this.tasks.unshift({ description, expected, earliest: '?', latest: '?', id: this.currentId })
      this.currentId += 1
    },
    deleteTask: function(id) {
      const taskIndex = this.tasks.findIndex(task => task.id == id)
      Vue.delete(this.tasks, taskIndex)
    },
    updateTask: function(updatedTask) {
      const taskIndex = this.tasks.findIndex(task => task.id == updatedTask.id)
      Vue.set(this.tasks, taskIndex, updatedTask)
    },
    simulate: function() {
      this.done = true
      const fixEstimates = ({earliest, expected, latest}) => {
        if (earliest != 0 && expected != 0 && latest != 0) {
          return { earliest, expected, latest }
        }

        if (earliest != 0 && expected != 0 && latest == 0) {
          return {earliest, expected, latest: expected + (expected - earliest)}
        }

        if (earliest != 0 && expected == 0 && latest != 0) {
          return {earliest, expected: (latest + earliest) / 2, latest}
        }

        if (earliest != 0 && expected == 0 && latest == 0) {
          latest = earliest * 2
          return {earliest, expected: (latest + earliest) / 2, latest}
        }

        if (earliest == 0 && expected != 0 && latest == 0) {
          const halfExpected = Math.floor(expected / 2)
          console.log('half', halfExpected)
          return {earliest: expected - halfExpected, expected, latest: expected + halfExpected}
        }

        if (earliest == 0 && expected != 0 && latest != 0) {
          return {earliest: expected - (latest - expected), expected, latest}
        }

        if (earliest == 0 && expected == 0 && latest != 0) {
          const quarterLatest = Math.floor(latest / 4)
          return {earliest: latest - (quarterLatest * 2), expected: latest - quarterLatest, latest}
        }

        throw 'Oops'
      }
      const estimateSamples = this.estimateHours.map(estimate => {
        const {earliest, expected, latest} = fixEstimates(estimate)
        console.log('ayo')
        console.log(earliest, expected, latest)
        return utils.sample(earliest, latest, expected, NUM_SAMPLES)
      })


      // add up each "column" in our samples
      const sampleTotals = []
      for (let i=0; i < NUM_SAMPLES; i++) {
        const sampleTotal = estimateSamples.map(samples => samples[i])
          .reduce((prev, cur) => prev + cur, 0)
        sampleTotals.push(sampleTotal)
      }
      const totalMin = Math.floor(Math.min(...sampleTotals))
      const totalMax = Math.ceil(Math.max(...sampleTotals))
      const binnedSamples = utils.bin(
        sampleTotals,
        totalMin,
        totalMax,
        NUM_BINS
      )

      Object.keys(binnedSamples).forEach(k => binnedSamples[k] = binnedSamples[k] / NUM_SAMPLES)

      // turn the keys into "ordering" (currently they represent the bin starting range value)
      const binnedSamplesList = Object.keys(binnedSamples)
        .map(x => parseInt(x))
        .sort((a, b) => a - b)
        .map((key, idx) => ({x: idx, y: binnedSamples[key]}))

      this.simBinned = binnedSamplesList
      this.numBins = binnedSamplesList.length
      this.simMin = totalMin
      this.simMax = totalMax
    }
  },
  computed: {
    canSimulate: function() {
      return this.estimateHours.some(estimates => estimates.earliest || estimates.expected || estimates.latest)
    },
    estimateHours: function() {
      
      const estimateToHours = (estimate) => {
        const { months, weeks, days } = utils.parseEstimate(estimate)
        console.log(months, weeks, days)
        return (
          (months || 0 ) * hoursMap['mo']
          + (weeks || 0 ) * hoursMap['wk']
          + (days || 0 ) * hoursMap['dy']
        )
      }
      return this.tasks.map(task => {
        return {
          earliest: estimateToHours(task.earliest),
          expected: estimateToHours(task.expected),
          latest: estimateToHours(task.latest),
        }
      })
    },
    labels: function() {
      if (this.simMin == null || this.simMax == null) {
        return []
      }
      const labelNames = []
      const factor = hoursMap[this.units]
      // Intuitively, you'd think you should start at simMin, however this can result in
      // distributions heavily shifted to the left, i.e. making "optimistic" estimates
      // We shift off by one factor to handle this. (not sure why it's happening though)
      const start = this.simMin + factor
      const end = this.simMax
      for (let i=start; i <= end; i += factor) {
        const timeInUnits = i / factor
        const roundedTime = Math.round(timeInUnits*2)/2;
        labelNames.push(`${roundedTime}`)
      }

      return labelNames
    },
    chartdata: function() {
      if (!this.simBinned) {
        return null
      }

      return {
        labels: this.labels,
        datasets: [{
          label: 'My Chart',
          steppedLine: 'after',
          backgroundColor: 'rgb(247, 85, 144)',
          borderColor: 'rgb(247, 85, 144)',
          data: this.simBinned,
          barPercentage: 1,
          categoryPercentage: 1,
          xAxisID: 'my-x-axis',
          pointRadius: 0,
        }]
      }
    },
    chartoptions: function() {
      return {
        responsive: true,
        maintainAspectRatio: false,
        legend: {
          display: false
        },
        scales: {
          xAxes: [
          {
            gridLines: {
              display: false,
              offsetGridLines: false,
            },
            scaleLabel: {
              display: true,
              labelString: this.units,
              fontSize: 30
            },
            ticks: {
              maxTicksLimit: 10,
              fontSize: 15
            }
          },
          {
            id: 'my-x-axis',
            type: 'linear',
            position: 'bottom',
            display: false,
            ticks: {
              max: this.numBins,
              min: 0
            }
          }],
          yAxes: [{
            ticks: {
              beginAtZero: true,
              fontSize: 15
            },
            gridLines: {
              color: "#262626"
            }
          }]
        }
      }
    }
  }
}
</script>

<style>

body {
  margin: 0;
  font-size: 17px;
  background-color: black;
  font-family: Arial, Helvetica, sans-serif;
}

#app {
  display: flex;
  height: 100vh;
  /* padding: 3px; */
}

#tasks-container {
  min-width: 600px;
  max-width: 600px;
  display: flex;
  flex-direction: column;
  overflow-y: scroll;
  border: 1.5px solid rgb(230, 230, 230);
  border-radius: 7px;
  margin: 10px;
  background-color: #2b2b2b;
}

#chart-container {
  /* min-width: 600px; */
  flex-grow: 1;
  height: 100vh;
  margin: 10px;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
}

button {
  border: 1px solid transparent;
  border-radius: 5px;
  padding: 6px;
  margin: 1px;
  background-color: #efefef;
  min-width: 2em;
}

button:hover:enabled {
  /* border: 1px solid; */
  cursor: pointer;
  background-color: #dddddd;
}

.sortable-ghost {
  visibility: hidden;
}

.dark-button {
  background-color: #414141 !important;
  color: white;
}

.dark-button:hover {
  background-color: #333333 !important;
}

.chart-buttons {
    display: flex;
    justify-content: center;
    column-gap: 3px;
}

textarea {
  padding: 5px;
  border-radius: 5px;
}

.chartdata {
  flex: 1;
}

#simulate-button {
  margin-bottom: 20px;
}

.list-enter-active {
  transition: all 0.5s;
}

.list-enter {
  opacity: 0;
  transform: translateY(-30px);
}
</style>
