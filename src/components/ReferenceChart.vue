<template>
    <p class="display_map_item">{{legend_display}}</p>
    <div>
      <div style="padding-top: 15px; padding-bottom: 15px" v-if="!is_base_case" v-html="get_comparison_text((this.chart_diff_value[0]))"></div>
      <div v-if="!is_base_case && this.chart_diff_value.length > 1" v-html="get_comparison_text(this.chart_diff_value[1])"></div>

      <div style="width: 300px; height: 220px; border-radius: 2px">
        <Bar  :data="get_plot()"></Bar>
      </div>
      <CropListDisplay
        :region_data="model_data"
        :map_variable="map_selected_variable"
      ></CropListDisplay>
    </div>

</template>

<script>

import {defineComponent, reactive} from "vue";
import Plotly from "@aurium/vue-plotly";
import {toString} from "lodash";
import { Bar } from "vue-chartjs"
import CropListDisplay from "./CropListDisplay.vue";
import {
  Chart as ChartJS,
  Title,
  Tooltip,
  Legend,
  BarElement,
  CategoryScale,
  LinearScale
} from 'chart.js'

ChartJS.register(CategoryScale, BarElement, LinearScale)

export default  defineComponent({
  name: "ReferenceChart",

  components: {
    Plotly,
    Bar,
    CropListDisplay,
  },
  props:{
    legend_display: String,
    min_value: Number,
    max_value: Number,
    model_data: Object,
    is_base_case: {
      type: Boolean,
      default: false
    },
    // y_axis_title: String,
    map_selected_variable: String,
    full_model_data: Array,
    crop_year_filter: Array,
    compare_data: Object,
  },
  data(){
    return{
      base_case: this.$store.getters.base_case_results,
      visualize_attribute: [
        {text:'Land (ac land)', value: 'xlandsc', key: 'xlandsc', metric: 'ac land'},
        {text:'Water (ac-ft/ac) (Only correct for single crop)', value: 'xwatersc', key: 'xwatersc', metric: 'ac-ft'},
        {text:'Gross Revenue ($ gross)', value: 'gross_revenue', key: 'gross_revenue', metric: '$ gross'},
      ],
      chart_data: reactive([]),
      test_data: [],
      chart_diff_value: [],
      no_fractions_number_formatter: new Intl.NumberFormat(navigator.languages, { maximumFractionDigits: 0, maximumSignificantDigits: 1}),
      compare_model_data: [],
      region_crop_data: []
    }
  },


  // mounted() {
  //   this.plot_data(this.model_data)
  // },

  computed: {
    get_metric(){
      let val;
      for(let i in this.visualize_attribute){
        if(this.visualize_attribute[i].value === this.map_selected_variable){
          val = this.visualize_attribute[i].metric;
        }
      }
      return val
    },
    set_base_case_results(){
      const baseRunId = this.$store.getters.current_model_area.base_model_run?.id
      const hasBaseRun = baseRunId &&
      this.comparison_items.findIndex(mr => mr.id === baseRunId) !== -1


      // Create a map of crop -> value for base run
      const baseMap = new Map()
      if (base?.x && base?.y) {
        base.x.forEach((crop, index) => {
          baseMap.set(crop, base.y[index])
        })
      }
    },
    plot_layout: function(){
      let layout = {
        width: 260,  // Set custom width
        height: 280, // Set custom height
        margin: { t: 30, l: 40, r: 30, b: 40 }, // Adjust margins to fit content
        type: 'bar',
        xaxis: {
          hoverformat: '.4s'
        },
        yaxis: {
          hoverformat: '.4s',

        },
      };
      if(this.full_model_data.length === 1){
        // if we have just one series, it's the current model run - make sure it's always orange. When we
        // have two or more, base is always blue
        layout['marker'] = {color: this.plot_colors}
      }

      return layout;
    },
    plot_colors: function(){
      let base_case_blue = '#1F77B4'
      let current_run_orange = '#FF7F0E'
      let colors = [base_case_blue, current_run_orange, '#17BECF', '#BCBD22', '#E377C2', '#8C564B',
        '#9467BD', '#D62728', '#2CA02C', '#7F7F7F'
      ]

      if(!this.stacked && this.comparison_items.findIndex(mr => mr.id === this.$store.getters.current_model_area.base_model_run.id) === -1 && this.is_base_case === false){
        // if the base case isn't included in comparisons and we're not in stacked mode, and we're not currently looking
        // at the base case, then remove the color for the base case so it's not used on another model run
        colors = colors.slice(1)
      }else if(!this.stacked && this.is_base_case === true){
        // but when it *is* base, we're already getting it to the correct color as the blue - skip adding the normal "this
        // model run" color to the color set so that people aren't confused
        colors.splice(1, 1) // note that we're not assigning. It operates in place, returning what was removed
      }
      return colors
    },
  },

  watch:{
    model_run_data: {
      handler(newVal) {
        if (newVal && newVal.region && this.base_case.length) {
          this.get_plot()
        }
      },
      immediate: true
    },
    compare_data: function(){
      if(this.compare_data){
        let data = Object.values(
          this.compare_data.results[0].result_set.reduce((acc, obj) => { // Accumulating to region to access later for comparing
              const key = `${obj.region}`; // Unique key based on region and crop
              if (!acc[key]) {
                  acc[key] = { ...obj }; // Initialize the group
              } else {
                  // Sum up values
                  acc[key].gross_revenue = parseFloat(obj.gross_revenue) + parseFloat(acc[key].gross_revenue);
                  acc[key].xwatersc = parseFloat(obj.xwatersc) + parseFloat(acc[key].xwatersc);
                  acc[key].xlandsc = parseFloat(obj.xlandsc) + parseFloat(acc[key].xlandsc);
              }

              return acc;
            }, {})
        );
        this.compare_model_data = data;



        // return data
      }
    },
  },

  methods: {
    get_comparison_text(item){
      let compare_text = ""
      if(item === this.chart_diff_value[1]){
       if(item > 0){

        return  `
           This model run is greater than ${this.compare_data.name} by<pre> <b> ${Math.round(this.chart_diff_value[1]).toLocaleString()} ${this.get_metric} </b></pre><br />
        `
        } else if(item < 0){
          return  `
            This model run is less than ${this.compare_data.name} by<pre> <b> ${Math.round(Math.abs(this.chart_diff_value[1])).toLocaleString()} ${this.get_metric} </b></pre><br />
          `
        } else if(item === 0){
          return  `This model run has no difference with the imported model run`
        } else if (item === null){
          return ''
        }
      }
      if(item > 0){
        compare_text += `
           This model run is greater than the Base Case by<pre> <b> ${Math.round(this.chart_diff_value[0]).toLocaleString()} ${this.get_metric} </b></pre>
        `
      } else if(item < 0){
        compare_text += `
          This model run is less than the Base Case by<pre> <b> ${Math.round(Math.abs(this.chart_diff_value[0])).toLocaleString()} ${this.get_metric} </b></pre>
        `
      } else if(item === 0){
        compare_text += `This model run is has no difference`
      } else if (item === null){
        compare_text += ''
      }
      return compare_text
    },

    get_plot(){
      return this.plot_data(this.model_data)
    },

    plot_data(model_run_data) {
      const region_info = this.base_case.filter(item => item.region === model_run_data.region);
      const variable = this.map_selected_variable;

      let region_value = 0;
      for (let i = 0; i < region_info.length; i++) {
        region_value += Number(region_info[i][variable]);
      }

      const datasets = [];
      let x_label;
      for (let i = 0; i < this.visualize_attribute.length; i++) { // Replace text with formatted label
        if(this.visualize_attribute[i].key === this.map_selected_variable ||
            this.visualize_attribute[i].key.slice(0,-2) === this.map_selected_variable){ // We have a substring here to handle xlandsc / xland. We can use the same label for both
            x_label = this.visualize_attribute[i].text;
        }
      }

      const labels = [x_label];

      if (this.is_base_case) {
        datasets.push({
          label: 'Base Case',
          backgroundColor: '#1F77B4',
          data: [Number(model_run_data[variable])]
        });
        this.chart_diff_value = null;
      } else {
        datasets.push({
          label: 'Base Case',
          backgroundColor: '#1F77B4',
          data: [Number(region_value)]
        });

        // labels.push('Model Scenario');
        datasets.push({
          label: 'Model Scenario',
          backgroundColor: '#FF7F0E',
          data: [Number(model_run_data[variable])]
        });

        this.chart_diff_value[0] = Number(model_run_data[variable]) - Number(region_value);
      }

      if (this.compare_data) {
        const compare_info = this.compare_model_data.filter(item => item.region === model_run_data.region);

        let region_value_compare = 0;
        for (let i = 0; i < compare_info.length; i++) {
          region_value_compare += Number(compare_info[i][variable]);
        }

        const compare_label = this.compare_data.name.substring(0, 9) + '...';
        labels.push(compare_label);
        datasets.push({
          label: compare_label,
          backgroundColor: '#E377C2',
          data: [Number(region_value_compare)]
        });

        this.chart_diff_value[1] = Number(region_value) - Number(region_value_compare);
        this.get_comparison_text(this.chart_diff_value[1]);
      }

      this.chart_data = {
        labels,
        datasets
      };

      return this.chart_data;
    },

    reduce_by_crop(accumulator, raw_value){  // sums values for a crop across region results
      let crop = this.$store.getters.get_crop_name_by_id(raw_value.crop);
      if (!(crop in accumulator)){
        accumulator[crop] = Number(raw_value[this.visualize_attribute]);
      }else{
        accumulator[crop] = accumulator[crop] + Number(raw_value[this.visualize_attribute]);
      }
      return accumulator;
    },
  },

})


</script>

<style scoped lang="stylus">

</style>