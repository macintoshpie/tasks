<template>
  <div class="detail-container">
    <div class="display">{{durationDisplay}}</div>
    <button @click="addDigit(1)" class="dark-button button-1">1</button>
    <button @click="addDigit(2)" class="dark-button button-2">2</button>
    <button @click="addDigit(3)" class="dark-button button-3">3</button>
    <button @click="addDigit(4)" class="dark-button button-4">4</button>
    <button @click="addDigit(5)" class="dark-button button-5">5</button>
    <button @click="addDigit(6)" class="dark-button button-6">6</button>
    <button @click="addDigit(7)" class="dark-button button-7">7</button>
    <button @click="addDigit(8)" class="dark-button button-8">8</button>
    <button @click="addDigit(9)" class="dark-button button-9">9</button>
    <button @click="shift(2)" class="dark-button button-00">00</button>
    <button @click="shift(1)" class="dark-button button-0">0</button>
    <button @click="backspace" class="dark-button button-backspace">&lt;</button>
    <button @click="finishUnknown" class="unknown">?</button>
    <button @click="finish" class="ok">ok</button>
  </div>
</template>

<script>
export default {
  name: 'DetailedInput',
  props: {
    updateDuration: Function,
    durationInit: Number,
  },
  data: function() {
    return {
      duration: this.durationInit,
    }
  },
  methods: {
    segmentDuration: function() {
      let currentVal = this.duration
      const days = currentVal % 100
      currentVal = Math.floor(currentVal / 100)
      const weeks = currentVal % 100
      currentVal = Math.floor(currentVal / 100)
      const months = currentVal % 100
      return { months, weeks, days }
    },
    addDigit: function(digit) {
      this.duration = this.duration * 10 + digit
    },
    shift: function(places) {
      this.duration = this.duration * (10**places)
    },
    backspace: function() {
      this.duration = Math.floor(this.duration / 10)
    },
    finish: function() {
      const { months, weeks, days } = this.segmentDuration()
      let overflowWeeks = Math.floor(days / 7)
      let normalizedDays = days % 7
      let overflowMonths = Math.floor((weeks + overflowWeeks) / 4)
      let normalizedWeeks = (weeks + overflowWeeks) % 4
      let normalizedMonths = months + overflowMonths
      let result = ''
      if (normalizedMonths) {
        result += ` ${normalizedMonths} mo`
      }
      if (normalizedWeeks) {
        result += ` ${normalizedWeeks} wk`
      }
      if (normalizedDays) {
        result += ` ${normalizedDays} dy`
      }

      this.updateDuration(result.trim() || '?')
    },
    finishUnknown: function() {
      this.updateDuration('?')
    }
  },
  computed: {
    durationDisplay: function() {
      const {months, weeks, days} = this.segmentDuration()
      const format = (num) => num.toString().padStart(2, '0')
      return `${format(months)}mo ${format(weeks)}wk ${format(days)}dy`
    }
  }
}
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>
button {
  border-radius: 12px;
}
/* https://grid.layoutit.com/ */
.detail-container {
  display: grid; 
  grid-template-columns: 1fr 1fr 1fr 1fr 1fr 1fr; 
  grid-template-rows: 1fr 1fr 1fr 1fr 1fr 1fr; 
  gap: 5px 5px; 
  grid-template-areas: 
    "display display display display display display"
    "button-1 button-1 button-2 button-2 button-3 button-3"
    "button-4 button-4 button-5 button-5 button-6 button-6"
    "button-7 button-7 button-8 button-8 button-9 button-9"
    "button-00 button-00 button-0 button-0 button-backspace button-backspace"
    "unknown unknown unknown ok ok ok"; 
}
.display {
  grid-area: display;
  font-size: 30px;
  font-family: monospace;
}
.button-1 { grid-area: button-1; }
.button-2 { grid-area: button-2; }
.button-3 { grid-area: button-3; }
.button-4 { grid-area: button-4; }
.button-5 { grid-area: button-5; }
.button-6 { grid-area: button-6; }
.button-7 { grid-area: button-7; }
.button-8 { grid-area: button-8; }
.button-9 { grid-area: button-9; }
.button-00 { grid-area: button-00; }
.button-0 { grid-area: button-0; }
.button-backspace { grid-area: button-backspace; }
.unknown { grid-area: unknown; }
.ok { grid-area: ok; }
</style>
