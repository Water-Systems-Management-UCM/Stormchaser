<template>
<!--  <v-row>-->
    <p class="display_map_item">{{legend_display}}</p>
    <div >
      <Plotly ref="plot" :data="chart_data" :layout="plot_layout"></Plotly>
    </div>
<!--  </v-row>-->

</template>

<script>

import {defineComponent} from "vue";
import Plotly from "@aurium/vue-plotly";

export default  defineComponent({
  name: "ReferenceChart",

  components: {
    Plotly,
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
  },
  data(){
    return{
      base_case: this.$store.getters.base_case_results,
      visualize_attribute: [
        {text:'Land (ac land)', value: 'xlandsc', key: 'xlandsc', metric: 'ac land'},
        {text:'Water (ac-ft/ac) (Only correct for single crop)', value: 'xwatersc', key: 'xwatersc', metric: 'ac-ft'},
        {text:'Gross Revenue ($ gross)', value: 'gross_revenue', key: 'gross_revenue', metric: '$ gross'},
      ],
      chart_data: [],
      test_data: [],
    }
  },


  mounted() {
  },

  computed: {
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
      // if(this.model_data.length === 1){
      //   // if we have just one series, it's the current model run - make sure it's always orange. When we
      //   // have two or more, base is always blue
      //   layout['marker'] = {color: this.plot_colors}
      // }
      // if (this.stacked){
      //   layout['barmode'] = 'stack';
      // }
      return layout;
    },
    y_axis_title: function (){
      this.y_axis_title = this.map_selected_variable
    },
    check_data: function (){
      console.log("DEBUG", this.chart_data)
      if(this.model_data){

        return this.chart_data[0].y !== null && this.chart_data[1].y !== null
      }
    },
  },

  watch:{
    model_data: function (){
      this.test_data = {... this.model_data}
      if(this.model_data){
        return this.plot_data(this.model_data);
      }
    },
  },

  methods: {
    plot_data(model_run_data){
      let region_info = this.base_case.filter(item => item.region === model_run_data.region);
      let filtered_regions;
      // if(this.crop_year_filter) {
      //   for(let i = 0; i < this.crop_year_filter.length; i++){
      //     console.log("DEBUGGIN IN FOR", this.crop_year_filter[i][0])
      //     region_info = this.base_case.filter(item => item.crop === this.crop_year_filter[i][0] || item.year === this.crop_year_filter[i][0]);
      //   }
      // }

      let region_value = 0;
      let variable = this.map_selected_variable;

      for (let i = 0; i < region_info.length; i++) {
        region_value += Number(region_info[i][variable]);
      }

      region_info[this.map_selected_variable] = Number(region_value);



      //find out how to compare elements of an array
      if(this.full_model_data === this.base_case){
        console.log("DEBUG IN IF")
        this.chart_data = [
        {
          // x: ["Model Run"], // Regions on x-axis
          y: [model_run_data[variable]], // Model scenario value
          type: "bar",
          name: "Model Scenario",
        },
        // {
        //   // x: ["Base Case"], // Same x-axis value
        //   y: [region_value], // Base case value
        //   type: "bar",
        //   name: "Base Case",
        // },
        ];
      } else{

        this.chart_data = [
          {
            // x: ["Model Run"], // Regions on x-axis
            y: [Number(model_run_data[variable])], // Model scenario value
            type: "bar",
            name: "Model Scenario",
          },
          {
            // x: ["Base Case"], // Same x-axis value
            y: [Number(region_value)], // Base case value
            type: "bar",
            name: "Base Case",
          },
        ];
        console.log("DEBUG IN ELSE", this.chart_data, region_value)
      }

      return this.chart_data;

      // return {
      //   // x: ["Model Scenario", "Base Case"],
      //   y: [Number(model_run_data[variable]), this.chart_data],  // Ensure numeric values
      //   type: 'bar',
      //   name: this.$store.getters.get_region_name_by_id(model_run_data.id),
      // };
    },



    map_info_popup(region_id, model_data, crop_id){
      let info = {}
      if(!crop_id){
        info = this.base_case.filter(item => item.region === this.model_data.region)
        if(info && info.length !== 0){
          info = info.reduce((accumulator, item) => {
            if (item) {
              if(item.hasOwnProperty("xwatersc" || item.hasOwnProperty("xlandsc"))){
                return {
                  ...accumulator,
                  xwatersc: (parseFloat(accumulator.xwatersc) || 0) + (parseFloat(item.xwatersc) || 0),
                  xlandsc: (parseFloat(accumulator.xlandsc) || 0) + (parseFloat(item.xlandsc) || 0),
                  gross_revenue: (parseFloat(accumulator.gross_revenue) || 0) + (parseFloat(item.gross_revenue) || 0),
                  net_revenue: (parseFloat(accumulator.net_revenue) || 0) + (parseFloat(item.net_revenue) || 0),
                };
              } else{
                return {
                  ...accumulator,
                  xwater: (parseFloat(accumulator.xwater) || 0) + (parseFloat(item.xwater) || 0),
                  xland: (parseFloat(accumulator.xland) || 0) + (parseFloat(item.xland) || 0),
                };
              }
            }
            return accumulator;
          });
        }
      }
      return info
    },

    region_filter(data_series){
      if(this.filter_regions.length === 0){
        return data_series
      }

      let region_data_series = data_series.filter(item => this.filter_regions.findIndex(region => Number(region.id) === item.region) > -1)
      return region_data_series
    },
    current_model_run_data: function(){
      let model_run_name = this.is_base_case ? 'Base case' : this.chart_model_run_name
      return this.get_crop_sums_for_results(this.region_filter(this.model_data), model_run_name)
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

    get_crop_sums_for_results(results, name){
      let crop_values = {};
      results.reduce(this.reduce_by_crop, crop_values)
      return {
        x: Object.keys(crop_values),
        y: Object.values(crop_values),  //.map(function(value){  // this map rounds each value to the specified number of decimal places
                                              // return Math.round(value)  // round to the nearest whole dollar
                                        //}),
        type: 'bar',
        name: name,
      };
    },
  },

})


</script>

<style scoped lang="stylus">

</style>