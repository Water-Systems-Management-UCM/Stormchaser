<template>
  <v-container>
    <h1>{{ $store.getters.current_model_area.name }} Home</h1>
    <v-row row>
      <v-col class="col-xs-12 col-md-6">
        <v-card class="home_card">
          <router-link :to="{ name: 'make-model-run'}">Make a New Model Run</router-link>
        </v-card>
      </v-col>
      <v-col class="col-xs-12 col-md-6">
        <v-card class="home_card">
          <router-link :to="{ name: 'list-model-runs'}">View Existing Model Runs</router-link>
        </v-card>
      </v-col>
    </v-row>
    <v-row row>
      <v-col class="col-xs-12 col-md-6">
        <v-card class="home_card">
          <router-link :to="{ name: 'input-data-viewer'}">Input Data Viewer</router-link>
        </v-card>
      </v-col>
    </v-row>
    <v-tabs style="margin-top:2em;">
      <v-tab>Model Runs Plotted by Modifications</v-tab>
      <v-tab>Model Run Listing</v-tab>
      <v-tab-item>
        <v-row>
          <v-col class="col-xs-12">
            <h2>Model Runs by Modifications</h2>
          </v-col>
        </v-row>
        <v-row>
          <v-col class="col-xs-12 col-md-3">
            <v-select
                v-model="var_x_axis"
                :items="scatter_options"
                label="X Axis Variable"
            >
            </v-select>
            <v-select
                v-model="var_y_axis"
                :items="scatter_options"
                label="Y Axis Variable"
            >
            </v-select>
            <div class="sc-help_block sc-help_tall">
              <p>Visualize your model runs by the averaged magnitude of modification in each category.
                Select variables above to change which modifications are shown in the plot for each model run.</p>
            </div>
          </v-col>
          <v-col class="col-xs-12 col-md-9">
            <Plotly :data="scatter_data" :layout="scatter_layout"></Plotly>
          </v-col>
        </v-row>
      </v-tab-item>
      <v-tab-item>
        <ListModelRuns></ListModelRuns>
      </v-tab-item>
    </v-tabs>
  </v-container>
</template>

<script>
import { Plotly } from 'vue-plotly'
import ListModelRuns from "./ListModelRuns";

export default {
  name: "AppHome",
  components: {ListModelRuns, Plotly },
  data: function(){
    return {
      scatter_options: [
        {text:"Water Modifications Average", value: "water_modifications_average"},
        {text:"Land Modifications Average", value:"land_modifications_average"},
        {text:"Price Modifications Average", value:"price_modifications_average"},
        {text:"Yield Modifications Average", value:"yield_modifications_average"},
        {text:"Region Modifications (Water & Land) Average", value:"region_modifications_average", sum_vars: ["water_modifications_average", "land_modifications_average"]},
        {text:"Crop Modifications (Price & Yield) Average", value:"crop_modifications_average", sum_vars: ["price_modifications_average", "yield_modifications_average"]},
      ],
      var_x_axis: "region_modifications_average",
      var_y_axis: "crop_modifications_average",
    }
  },
  methods:{
    plot_average_items: function (x_axis_object, model_run, x) {
      let x_vals = x_axis_object.sum_vars.map(sum_var => {
        return model_run[sum_var]
      })
      x.push(x_vals.reduce(function (total, current_val) {
        return total + current_val
      }) / x_vals.length)
    },
  },
  computed:{
    scatter_data: function(){
      let _this = this;
      let x = [];
      let y = [];
      let item_name = [];

      // we could just return-object on the dropdown, but then setting the defaults is kind of a pain
      let x_axis_object = this.scatter_options.find(option => option.value === _this.var_x_axis)
      let y_axis_object = this.scatter_options.find(option => option.value === _this.var_y_axis)

      Object.values(this.$store.getters.current_model_area.model_runs).forEach(model_run => {
        if ("sum_vars" in x_axis_object){
          _this.plot_average_items(x_axis_object, model_run, x);
        }else {
          x.push(model_run[_this.var_x_axis])
        }
        if ("sum_vars" in y_axis_object){
          _this.plot_average_items(y_axis_object, model_run, y);
        }else {
          y.push(model_run[_this.var_y_axis])
        }
        item_name.push(model_run.name)
      })
      return [{
        x: x,
        y: y,
        text: item_name,
        marker: {size: 12},
        mode: "markers",
        type: "scatter",
      }]
    },
    scatter_layout: function(){
      let _this = this;
      return {
        hovermode: 'closest', // make it snap to the nearest point
        xaxis: {
          title: this.scatter_options.find(option => option.value===_this.var_x_axis).text
        },
        yaxis: {
          title: this.scatter_options.find(option => option.value===_this.var_y_axis).text
        },
        margin: {
          t: 15,
        }
      }
    }
  }
}
</script>

<style lang="stylus">
.home_card
  margin: 0em
  padding:1em
  text-align: center
  font-size: 1.15em

h1, h2
  font-weight: normal
</style>