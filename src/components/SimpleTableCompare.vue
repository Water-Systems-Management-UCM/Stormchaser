<template>

  <div>
      <div style="width: 100%">
<!--        <select v-model="chart_variable">-->
          <v-autocomplete
            v-model="chart_variable"
            :items="chart_options"
            label="Chart Variable"
            item-value="value"
            item-title="text"
            persistent-hint
          ></v-autocomplete>

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
    chart_options: Array,
    selected_variable: String,
    region_filters: Array,
  },

  data: function (){
    return{
      options: {
        responsive: true,
        plugins: {
          tooltip: {
            callbacks: {
              label: function (context) {
                const label = context.dataset.label || ''
                const value = context.raw
                return `${label}: ${value.toLocaleString()}`
              }
            }
          },
          legend: {
            position: "top" as const,
          }
        },
        scales: {
          y: {
            beginAtZero: true
          }
        }
      },
      chart_variable: 'gross_revenue',

    }
  },

  watch:{
    chart_variable(){
      this.get_plot()
    },
    region_filters(){
      this.get_plot();
    }
  },

  methods:{
    get_plot(){
     return this.plot_data()
    },
    plot_data() {
      if (!Array.isArray(this.model_data)) return {labels: [], datasets: []}

      // Group and sum model_data by crop_code
      const grouped = {}

      // Gather all crop related values and regions if needed
      this.model_data.forEach(region => {
        if (this.region_filters.length > 0) {
          if(this.region_filters.some(ele => ele.id === region.region)){
            const crop = this.$store.getters.get_crop_name_by_id(region.crop) || 'Unknown'
            if (!grouped[crop]) {
              grouped[crop] = 0
            }
            grouped[crop] += Number(region[this.chart_variable] || 0)
          }
        } else {

          const crop = this.$store.getters.get_crop_name_by_id(region.crop) || 'Unknown'
          if (!grouped[crop]) {
            grouped[crop] = 0
          }
          grouped[crop] += Number(region[this.chart_variable] || 0)
        }
      })

      const labels = Object.keys(grouped)
      const primaryData = Object.values(grouped)

      // Add to dataset to display on chart
      const datasets = []


      const compare_grouped = {}

      // Used currently for base case, gather related info
      this.compare_data.forEach(region => {
        // console.log("DEBUG", region)
        if (this.region_filters.length > 0) {
          if (this.region_filters.some(ele => ele.id === region.region)) {
            const crop = this.$store.getters.get_crop_name_by_id(region.crop) || 'Unknown'
            if (!compare_grouped[crop]) {
              compare_grouped[crop] = 0
            }
            compare_grouped[crop] += Number(region[this.chart_variable] || 0)
          }
        } else {
          const crop = this.$store.getters.get_crop_name_by_id(region.crop) || 'Unknown'
          if (!compare_grouped[crop]) {
            compare_grouped[crop] = 0
          }
          compare_grouped[crop] += Number(region[this.chart_variable] || 0)
        }
      })


      const compareData = labels.map(label => compare_grouped[label] || 0)

      datasets.push({
        label: `No Cutbacks`,
        data: compareData,
        backgroundColor: '#1F77B4'
      })

      datasets.push(
        {
          label: `Cutback of ${((this.model_data[0]?.['Shortage_%'] - 1) * 100).toFixed(0)}%`,
          data: primaryData,
          backgroundColor: '#FF7F0E'
        }
      )


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