<template>

  <div>
      <div style="width: 100%">
        <select v-model="selected_variable">
        <option value="gross_revenue">Gross Revenue</option>
        <option value="xwatersc">Water Used</option>
        <option value="xlandsc">Land Used</option>
      </select>
        <Bar  :data="get_plot()" :options="options"></Bar>
      </div>
  </div>




</template>

<script lang="ts">
import { Bar } from "vue-chartjs"

import {
  Chart as ChartJS,
  BarElement,
  CategoryScale,
  LinearScale,
  Tooltip
} from 'chart.js'
import {defineComponent, reactive} from "vue";
import Plotly from "@aurium/vue-plotly";

ChartJS.register(CategoryScale, BarElement, LinearScale, Tooltip)

export default  defineComponent({
  name: "ReferenceChart",

  components: {
    Plotly,
    Bar,
  },
  props:{
    model_data: reactive(Array),
    is_base_case: {
      type: Boolean,
      default: false
    },
    compare_data: Array,
    crop_list: Array,
    chart_variable: String,
    chart_options: Array,
    selected_variable: {
      type: String,
      default: 'xlandsc'
    }
  },

  data: function (){
    return{
      options: {
        responsive: true,
        plugins: {
          tooltip: {
            callbacks: {
              label: function (context) {
                // context.dataset.label = "Model: gross_revenue"
                // context.raw = actual number
                const label = context.dataset.label || ''
                const value = context.raw
                return `${label}: ${value.toLocaleString()}`
              }
            }
          },
          legend: {
            position: 'top'
          }
        },
        scales: {
          y: {
            beginAtZero: true
          }
        }
      }

    }
  },

  watch:{
    selected_variable(){
      this.get_plot()
    },
  },

  methods:{
    get_plot(){
     return this.plot_data()
    },
    plot_data() {
  if (!Array.isArray(this.model_data)) return { labels: [], datasets: [] }

  // Group and sum model_data by crop_code
  const grouped = {}

  this.model_data.forEach(region => {
    const crop = this.$store.getters.get_crop_name_by_id(region.crop) || 'Unknown'
    if (!grouped[crop]) {
      grouped[crop] = 0
    }
    grouped[crop] += Number(region[this.selected_variable] || 0)
  })

  const labels = Object.keys(grouped)
  const primaryData = Object.values(grouped)

  const datasets = [
    {
      label: `Metric: ${this.selected_variable}`,
      data: primaryData,
      backgroundColor: '#42A5F5'
    }
  ]

  // Handle compare_data if provided
  if (Array.isArray(this.compare_data)) {
    const compare_grouped = {}

    this.compare_data.forEach(region => {
      const crop = this.$store.getters.get_crop_name_by_id(region.crop) || 'Unknown'
      if (!compare_grouped[crop]) {
        compare_grouped[crop] = 0
      }
      compare_grouped[crop] += Number(region[this.selected_variable] || 0)
    })

    // Ensure compare data matches same label order
    const compareData = labels.map(label => compare_grouped[label] || 0)

    datasets.push({
      label: `Compare: ${this.selected_variable}`,
      data: compareData,
      backgroundColor: '#d6497b'
    })
  }

  return {
    labels,
    datasets
  }
}
  },

})
</script>

<style scoped lang="stylus">

</style>