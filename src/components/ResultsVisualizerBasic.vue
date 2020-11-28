<template>
  <v-container>
    <!--<v-row>
      <v-col class="col-xs-12 col-md-9">
        <v-autocomplete
            v-model="visualize_attribute"
            :items="visualize_attribute_options"
            label="Value to Plot"
            persistent-hint
            solo
        ></v-autocomplete>
      </v-col>
      <v-col class="col-xs-12 col-md-3">
        <v-switch
            v-model="stacked"
            label="Stack Bars by Crop"
        ></v-switch>
      </v-col>
    </v-row> -->
    <v-row>
      <v-col class="col-xs-12">
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
    regions: Object,
    visualize_attribute: String,
    stacked: Boolean,
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
    stacked_transform(results){
      // when we want stacked bar charts, we need to go from a series per model to a series per crop - this is only
      // triggered when we set the barmode=stack setting in plotly, so it'll come out as two stacked bars, even though
      // our output here will be a series for every crop

      let find_same_crop_value = function(r, crop_name){ // first make a function that looks up a crop's value in the results - we could make it a keyed object, but this is fine
        for(let i=0; i < r.x.length; i++){
          if(r.x[i] === crop_name){
            return r.y[i]
          }
        }
      }

      let output_series = []
      for(let i=0; i<results[0].x.length; i++){  // now, go through the input data by x value and create an output crop data object
        let crop_data = {                         // where we use the model name of each as the x value
          x: [results[0].name, results[1].name],
          y: [results[0].y[i], find_same_crop_value(results[1], results[0].x[i])],  // and the actual value for the crop as the y value
          type: "bar",
          name: results[0].x[i]  // and then make the series name the crop name
        }
        output_series.push(crop_data)  // add the series to the outputs
      }

      return output_series;
    }
  },
  computed: {
    result_data: function(){
      let viz_data = [this.get_crop_sums_for_results(this.model_data, "This model run")];
      if(this.model_data.id !== this.$store.getters.current_model_area.base_model_run.id){  // if this *is* the base case, then don't plot anything else
        // Add the Base Case to the items to plot
        // doing a weird lookup here because $store.state.base_model_run doesn't seem to have results, so looking up the model run using that ID instead
        // add it to the beginning of the array so the base case always shows first
        viz_data.unshift(this.get_crop_sums_for_results(this.$store.getters.current_model_area.model_runs[this.$store.getters.current_model_area.base_model_run.id].results.result_set, "Base case"));
      }
      if(this.stacked){
        viz_data = this.stacked_transform(viz_data);
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
          t: 0,
        }
      };
      if (this.stacked){
        layout["barmode"] = "stack";
      }
      return layout;
    }
  }
}
</script>

<style>

</style>