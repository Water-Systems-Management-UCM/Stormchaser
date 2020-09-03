<template>
  <v-flex row class="results_visualizer">
    <v-snackbar
        v-model="visualizer_info_snackbar"
        top
        timeout="15000"
    >
      {{ visualizer_info_snackbar_text }}

      <template v-slot:action="{ attrs }">
        <v-btn
            color="pink"
            text
            v-bind="attrs"
            @click="visualizer_info_snackbar = false"
        >
          Close
        </v-btn>
      </template>
    </v-snackbar>
    <v-autocomplete
        v-model="color_by_attribute"
        :items="color_attributes"
        label="Color by Attribute"
        clearable
        return-object
        persistent-hint
        solo
    ></v-autocomplete>
    <v-autocomplete
        v-model="selected_years"
        :items="years"
        clearable
        deletable-chips
        chips
        small-chips
        label="Filter Years"
        return-object
        persistent-hint
        multiple
        solo
    ></v-autocomplete>
    <v-autocomplete
        v-model="selected_regions"
        :items="regions"
        item-text="name"
        item-value="id"
        clearable
        deletable-chips
        chips
        small-chips
        label="Filter Regions"
        persistent-hint
        multiple
        solo
    ></v-autocomplete>
    <v-switch
        v-model="pin_plot_axis_bounds"
        label="Pin Axis Extent"
    ></v-switch>
    <Plotly :data="result_scatter_data" :layout="basic_result_scatter_layout"></Plotly>
  </v-flex>
</template>

<script>
import { Plotly } from 'vue-plotly'

export default {
  name: "ResultsVisualizer",
  components: { Plotly },
  props:{
    model_data: Object,
    regions: Array
  },
  data: function(){
    return {
      years: [],
      selected_years: [],
      selected_regions: [],
      color_by_attribute: null,
      color_attributes: ["Years", "Regions"],
      setup_running: false,  // to avoid race conditions where two copies of set_up_component run at the same time when props are set
      x_axis_attribute: "xlandsc",
      x_axis_title: "Land",
      x_axis_max_value: 0, // just make it something - it'll get set automatically
      y_axis_attribute: "xwatersc",
      y_axis_title: "Water",
      y_axis_max_value: 0, // just make it something - it'll get set automatically
      pin_plot_axis_bounds: true,  // when true, keeps plotly from updating the chart extent when we filter data so you can see how things change better

      visualizer_info_snackbar: false,
      visualizer_info_snackbar_text: "",
    }
  },
  watch: {
    model_data: {
      immediate: true,
      handler: function() {
        this.set_up_component();
      }
    },
    x_axis_attribute: function(){
      this.set_up_xaxis()
    },
    y_axis_attribute: function(){
      this.set_up_yaxis()
    }
  },
  mounted: function(){
    this.set_up_component();
  },
  methods: {
    get_series_data: function(options){
      if (options === undefined){
        options = {};
      }
      let selected_years = options.selected_years;
      let selected_regions = options.selected_regions;
      if (selected_years === undefined){
        selected_years = this.selected_years;
      }
      if (selected_regions === undefined){
        selected_regions = this.selected_regions;
      }

      let x = [];
      let y = [];

      let filtered_data = this.model_data.results.result_set

      if(selected_years.length > 0) {
        filtered_data = filtered_data.filter(result => selected_years.includes(result.year))  // filter by year first
      }

      if(selected_regions.length > 0){
        filtered_data = filtered_data.filter(result => selected_regions.includes(result.region))
      }

      let x_axis_attribute = this.x_axis_attribute;
      let y_axis_attribute = this.y_axis_attribute;
      filtered_data.forEach(function(result){
        x.push(result[x_axis_attribute]);
        y.push(result[y_axis_attribute]);
      });  // can probably do this with a map instead?
      return {
        x: x,
        y: y,
        mode: "markers",
        type: "scatter"
      }
    },
    set_up_xaxis: function(){
      this.x_axis_max_value = this.get_min_or_max_of_values(Math.max, this.model_data.results.result_set, this.x_axis_attribute)
    },
    set_up_yaxis: function(){
      this.y_axis_max_value = this.get_min_or_max_of_values(Math.max, this.model_data.results.result_set, this.y_axis_attribute)
    },
    get_min_or_max_of_values: function(func, array, attribute){
      return func.apply(Math, array.map(function(o) { return o[attribute]; }))
    },
    set_up_years: function () {
      if (this.has_results) { // if we have results
        console.log("Calculating years")
        // get the distinct set of years that the model results cover
        this.years = [...new Set(this.model_data.results.result_set.map(result => result.year))];
      }else {
        console.log("Skipping Year Calculation")
      }
    },
    set_up_component: function() {
      if (!this.setup_running) {
        this.setup_running = true;
        this.set_up_years();
        this.set_up_xaxis();
        this.set_up_yaxis();
        this.setup_running = false;
      }
    },
    visualizer_notice: function(message){
      this.visualizer_info_snackbar_text = message;
      this.visualizer_info_snackbar = true;
    }
  },
  computed: {
    has_results: function(){
      return this.model_data.results !== undefined && this.model_data.results !== null;
    },
    result_scatter_data: function(){
      if (!this.color_by_attribute){  // if we're not trying to create separate series (with separate colors by a specific attribute)
        return [this.get_series_data()];  // then just get the normal series data and pop it in a list
      } else {  // otherwise, we want to create separate series by one of the items

        // First, try to use only the selected items for this attribute
        let data_series = [];
        let color_attribute = "selected_" + this.color_by_attribute.toLowerCase();
        let items_to_color = this[color_attribute];
        if(items_to_color.length === 0){  // if there aren't any selected items, then just use all of the items
          items_to_color = this[this.color_by_attribute.toLowerCase()]
        }

        if(items_to_color.length > 12){
          this.visualizer_notice("Too many items to color - can only color when filtered to 12 or fewer items");
          return [this.get_series_data()];
        }

        // get a series object for every individual item_to_color
        let _this = this;
        items_to_color.forEach(function(value){
          let options = {};
          options[color_attribute] = [value];
          data_series.push(_this.get_series_data(options));
        })
        return data_series
      }
    },
    basic_result_scatter_layout: function(){
      let layout = {
        xaxis: {
          title:'Land'
        },
        yaxis: {
          title:'Water'
        }
      }

      if(this.pin_plot_axis_bounds){ // we want to fix the extent of the plot, so we need to get the actual maximum values - we'll pin the mins at 0 for now
        layout.xaxis.range = [-0.02 * this.x_axis_max_value, this.x_axis_max_value + (0.05 * this.x_axis_max_value)]
        layout.yaxis.range = [-0.02 * this.y_axis_max_value, this.y_axis_max_value + (0.05 * this.y_axis_max_value)]
      }
      return layout;
    }
  }
};
</script>

<style lang="stylus">
.plot-container.plotly
  min-height: 500px;
  width: 100%;
</style>