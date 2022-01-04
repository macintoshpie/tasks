<script>
import { Line, mixins } from 'vue-chartjs'
const { reactiveProp } = mixins

export default {
  extends: Line,
  name: 'Chart',
  props: ['chartData', 'options'],
  mixins: [reactiveProp],
  mounted () {
    this.renderChart(this.chartData, this.options)
  }
}
</script>

<style>
canvas {
    height: 80vh !important;
}
</style>