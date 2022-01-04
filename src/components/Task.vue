<template>
  <div class="task-card" @mouseleave="editingDuration = false">
    <div v-if="!editingDurationDetail" class="container">
      <div class="left-item flex-center">
        <div v-bind:class="{'task-card-text-edit': true, flexable: editingText}">
          <div v-if="!editingText" class="task-card-text flex-center" @click="startEditingText">
            <div class="truncate">
              {{textSummary}}
            </div>
          </div>
          <div v-if="editingText" class="task-card-textarea">
            <div>
              <textarea
                ref="textarea"
                v-model="text" 
                @input="resizeTextarea"
              ></textarea>
            </div>
            <div>
              <button @click="editingText = false">done</button>
            </div>
          </div>
        </div>
      </div>
      <div class="right-item" v-if="!editingText">
        <div class=task-card-ctrls>
          <div class="task-card-ctrl">
            <button v-if="!editingDuration" @click="editingDuration = true; editingDurationDetail = false" v-bind:class="{warning: estimateDisplay == '?'}">{{estimateDisplay}}</button>
            <div v-if="editingDuration && !editingDurationDetail" class="task-card-duration-buttons">
              <button @click="editingDurationDetail = true">&lt;&lt;</button>
              <button @click="expected = '1 dy'; editingDuration = false">1 dy</button>
              <button @click="expected = '1 wk'; editingDuration = false">1 wk</button>
              <button @click="expected = '1 mo'; editingDuration = false">1 mo</button>
              <button @click="expected = '3 mo'; editingDuration = false">3 mo</button>
              <button @click="expected = '6 mo'; editingDuration = false">6 mo</button>
            </div>
          </div>
          <div id="task-delete-button" class="task-card-ctrl" v-if="!editingDuration">
            <button @click="deleteTask(id)">X</button>
          </div>
        </div>
      </div>
    </div>

    <div v-if="editingDurationDetail">
      {{textSummary}}
      <div class="duration-details-editor">
        <div>
          <div>
            <div v-bind:class="{'duration-detail-desc-active': editingDurationDetailTarget == 'earliest', 'duration-detail-desc': true}">
              <p>Earliest: <button class="dark-button" @click="editingDurationDetailTarget = 'earliest'">{{earliest}}</button></p>
            </div>
            <div v-bind:class="{'duration-detail-desc-active': editingDurationDetailTarget == 'expected', 'duration-detail-desc': true}">
              <p>Expected: <button class="dark-button" @click="editingDurationDetailTarget = 'expected'">{{expected}}</button></p>
            </div>
            <div v-bind:class="{'duration-detail-desc-active': editingDurationDetailTarget == 'latest', 'duration-detail-desc': true}">
              <p>Latest: <button class="dark-button" @click="editingDurationDetailTarget = 'latest'">{{latest}}</button></p>
            </div>
          </div>
        </div>
        <div>
          <DetailedInput v-if="editingDurationDetailTarget" :durationInit="currentDurationTargetValue" :updateDuration="updateDuration"></DetailedInput>
        </div>
        <div style="grid-column: 1 / 3">
          <button style="width: 100%" @click="editingDurationDetail = false; editingDuration = false" v-if="!editingDurationDetailTarget">done</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import DetailedInput from './DetailedInput.vue'
import utils from '../utils'

export default {
  name: 'Task',
  components: {
    DetailedInput
  },
  props: {
    id: Number,
    description: String,
    earliestEstimate: String,
    expectedEstimate: String,
    latestEstimate: String,
    deleteTask: Function,
    updateTask: Function,
  },
  data: function() {
    return {
      text: this.description,
      earliest: this.earliestEstimate || '?',
      expected: this.expectedEstimate,
      latest: this.latestEstimate || '?',
      editingText: false,
      editingDuration: false,
      editingDurationDetail: false,
      editingDurationDetailTarget: null
    }
  },
  computed: {
    textSummary: function() {
      const firstLine = this.text.split('\n')[0]
      return firstLine
    },
    estimateDisplay: function() {
      if (this.earliest != '?' && this.latest != '?') {
        return `${this.earliest} - ${this.latest}`
      }
      return this.expected
    },
    currentDurationTargetValue: function() {
      // returns an integer where first two digits are months, second two digis are weeks, last two are days
      const selectedEstimate = (
        this.editingDurationDetailTarget == 'earliest' ?
          this.earliest
          : (
            this.editingDurationDetailTarget == 'expected' ?
              this.expected
              : this.latest
          )
      )
      const { months, weeks, days } = utils.parseEstimate(selectedEstimate)
      return (
        ((months || 0) * 100**2)
        + ((weeks || 0) * 100**1)
        + (days || 0)
      )
    }
  },
  methods: {
    resizeTextarea: function() {
      const { textarea } = this.$refs
      textarea.style.height = textarea.scrollHeight + 1.5 + "px"
    },
    startEditingText: function() {
      this.editingText = true
      this.$nextTick(() => this.resizeTextarea())
    },
    updateDuration: function(duration) {
      if (this.editingDurationDetailTarget == 'earliest') {
        this.earliest = duration
      }
      if (this.editingDurationDetailTarget == 'expected') {
        this.expected = duration
      }
      if (this.editingDurationDetailTarget == 'latest') {
        this.latest = duration
      }

      this.editingDurationDetailTarget = null
    },
    emitUpdate: function() {
      this.$emit(
        'update',
        {
          description: this.text,
          earliest: this.earliest,
          expected: this.expected,
          latest: this.latest,
          id: this.id
        }
      )
    }
  },
  watch: {
    text: function() {
      this.emitUpdate()
    },
    expected: function() {
      this.emitUpdate()
    },
    earliest: function() {
      this.emitUpdate()
    },
    latest: function() {
      this.emitUpdate()
    }
  }
}
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>
textarea {
  resize: vertical;
  width: 100%;
  box-sizing: border-box;
}

p {
  margin: 0;
}

.task-card {
  /* background-color: #FCE4D8; */
  background-color: #161616;
  padding: 10px;
  border-radius: 7px;
  margin: 7px;
  border: 1.5px solid #6b6b6b;
  color: white;
}

.task-card:hover {
  background-color: #1d1d1d;
  cursor: move;
}

.container {
  display: flex;
  justify-content: space-between;
  flex-direction: horizontal;
}

.left-item {
  flex-grow: 1;
}

.right-item {
  display: contents;
}

.task-card-ctrls {
  opacity: 40%;
  width: 260px;
  text-align: right;
}

.task-card-ctrls button {
  background: none;
  background-color: #414141 !important;
  color: white;
  padding: 5px;
}

.task-card-ctrls button:hover {
  background-color: #333333 !important;
}

.task-card-ctrls button.warning {
  background-color: rgb(247, 85, 144) !important;
}


.task-card-ctrl {
  display: inline-block;
  padding: 1px;
}

.task-card:hover .task-card-ctrls {
  opacity: 100%;
}

.task-card-text:hover {
  cursor: pointer;
  text-decoration: underline;
}

.task-card-text-edit {
  /* flex: 1; */
  width: 300px;
}

#task-delete-button {
  visibility: hidden;
}

.task-card:hover #task-delete-button {
  visibility: unset;
}

.truncate {
  white-space: nowrap;
  height: 1.25em;
  overflow: hidden;
  text-overflow: ellipsis;
}

.flex-center {
  display: flex;
  align-items: center;
}

.task-card-textarea button {
  width: 100%;
}

.flexable {
  flex: 1;
}

.duration-details-editor {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  grid-template-rows: 1fr, 100px;
  grid-column-gap: 0px;
  grid-row-gap: 10px;
}

.duration-detail-desc {
  border: 1.5px solid transparent;
  border-radius: 7px;
  padding: 5px;
  width: fit-content;
}

.duration-detail-desc-active {
  border: 1.5px solid #6b6b6b;
  background-color: #000000
}
</style>
