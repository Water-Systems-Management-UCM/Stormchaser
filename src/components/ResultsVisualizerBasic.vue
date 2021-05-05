<template>
  <v-container>
    <v-row>
      <v-col class="col-12">
        <Plotly :data="result_data" :layout="plot_layout"></Plotly>
      </v-col>
    </v-row>
  </v-container>
</template>

<script>
import { Plotly } from 'vue-plotly'

export default {
  name: "ResultsVisualizerBasic",
  components: { Plotly },
  props:{
    model_data: Array,
    filter_regions: Array,
    visualize_attribute: String,
    stacked: Boolean,
    comparison_items: Array,
    normalize_to_model_run: Object,
    //visualize_attribute_options: Array,
  },
  //mounted() {
  //  this.visualize_attribute = this.default_visualize_attribute;
  //},
  methods: {
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
        type: "bar",
        name: name,
      };
    },
    find_same_crop_value: function(r, crop_name){ // first make a function that looks up a crop's value in the results - we could make it a keyed object, but this is fine
      /*for(let i=0; i < r.x.length; i++){
        if(r.x[i] === crop_name){
          return r.y[i]
        }
      }*/
      let index = r.x.findIndex(item => item === crop_name)
      return r.y[index]

    },
    stacked_transform(results){
      // when we want stacked bar charts, we need to go from a series per model to a series per crop - this is only
      // triggered when we set the barmode=stack setting in plotly, so it'll come out as two stacked bars, even though
      // our output here will be a series for every crop

      let output_series = []
      for(let i=0; i<results[0].x.length; i++){  // now, go through the input data by x value and create an output crop data object
        let crop_data = {                         // where we use the model name of each as the x value
          x: results.map((result)=>{return result.name}),
          y: [results[0].y[i], ...results.slice(1).map((result)=>{return this.find_same_crop_value(result, results[0].x[i])})],  // and the actual value for the crop as the y value
          type: "bar",
          name: results[0].x[i]  // and then make the series name the crop name
        }
        output_series.push(crop_data)  // add the series to the outputs
      }

      return output_series;
    },
    set_colors: function(series){
      let _this = this;
      return series.map(function(each_series, index){
        each_series.marker = {'color': _this.plot_colors[index]}
        return each_series;
      })
    },
    normalize_results(data_series, base){
      let _this = this;
      return data_series.map(function(series){
        series.y = series.x.map(function(crop_data, index){
          let matching_data = _this.find_same_crop_value(base, crop_data)
          return series.y[index] - matching_data
        })
        return series
      })
    },
    region_filter(data_series){
      if(this.filter_regions.length === 0){
        return data_series
      }

      let region_data_series = data_series.filter(item => this.filter_regions.findIndex(region => Number(region.id) === item.region) > -1)
      return region_data_series
    }
  },
  computed: {
    result_data: function(){
      let viz_data = [this.get_crop_sums_for_results(this.region_filter(this.model_data), "This model run")];
      if(this.model_data.id !== this.$store.getters.current_model_area.base_model_run.id){  // if this *is* the base case, then don't plot anything else
        // Add the Base Case to the items to plot
        // doing a weird lookup here because $store.state.base_model_run doesn't seem to have results, so looking up the model run using that ID instead
        // add it to the beginning of the array so the base case always shows first
        let _this = this;
        this.comparison_items.forEach(function(item){
          if(item.is_base === true){
            // we might not need this split anymore because we retrieve the results in DataViewer
            viz_data.unshift(_this.get_crop_sums_for_results(_this.region_filter(item.results[0].result_set), "Base case"));
          }else{
            // we need to fetch the actual results for any model runs selected for comparison - we can't do that in
            // here though because it's async and the computer property finishes updating before the data changes
            // so nothing in the chart changes. Instead, we have a watcher that checks for changes to the comparison
            // selections, then triggers the results retrieval and then pushes the model runs to the complete array.
            viz_data.push(_this.get_crop_sums_for_results(_this.region_filter(item.results[0].result_set), item.name))
          }
        })
      }

      if(this.normalize_to_model_run !== undefined && this.normalize_to_model_run !== null){
        let normalization_sums = this.get_crop_sums_for_results(this.region_filter(this.normalize_to_model_run.results[0].result_set), "normalized")
        viz_data = this.normalize_results(viz_data, normalization_sums)
      }

      if(this.stacked){
        viz_data = this.stacked_transform(viz_data);
      }else{
        viz_data = this.set_colors(viz_data)
      }

      return viz_data;
    },
    plot_layout: function(){
      let layout = {
        xaxis: {
          hoverformat: ".4s"
        },
        yaxis: {
          hoverformat: ".4s"
        },
        margin:{
          l: 50,
          t: 15,
        }
      };
      if(this.result_data.length === 1){
        // if we have just one series, it's the current model run - make sure it's always orange. When we
        // have two or more, base is always blue
        layout["marker"] = {color: this.plot_colors}
      }
      if (this.stacked){
        layout["barmode"] = "stack";
      }
      return layout;
    },
    plot_colors: function(){
      let base_case_blue = "#1F77B4"
      let current_run_orange = '#FF7F0E'
      let colors = [base_case_blue, current_run_orange, '#17BECF', '#BCBD22', '#E377C2', '#8C564B',
        '#9467BD', '#D62728', '#2CA02C', '#7F7F7F'
      ]

      if(!this.stacked && this.comparison_items.findIndex(mr => mr.id === this.$store.getters.current_model_area.base_model_run.id) === -1){
        // if the base case isn't included in comparisons and we're not in stacked mode, then remove the color for
        // the base case so it's not used on another model run
        colors = colors.slice(1)
      }
      return colors
    }
  }
}
</script>

<style>

</style>