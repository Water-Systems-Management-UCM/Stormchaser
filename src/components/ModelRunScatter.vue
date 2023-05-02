<template>
  <v-container>
    <v-row>
      <v-col class="col-12 col-md-3">
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
          <p>Visualize your model runs by the averaged magnitude of input modification in each category. This scatter
            does not show results, but instead provides a view of inputs to help you find or choose model runs.
            Select variables above to change which modifications are shown in the plot for each model run.</p>
        </div>
      </v-col>
      <v-col class="col-12 col-md-9">
        <Plotly :data="scatter_data" :layout="scatter_layout"
        @click="handle_plotly_click"></Plotly>
      </v-col>
    </v-row>
  </v-container>
</template>

<script>
import { Plotly } from '@wellcaffeinated/vue-plotly'

export default {
  name: "ModelRunScatter",
  components: {Plotly },
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
    handle_plotly_click(data){
      let model_run_id = data.points[0].data.model_run_ids[data.points[0].pointIndex];
      console.log("Switching to model run ${model_run_id} based on plotly click")
      this.$router.push({name: "model-run", params: {id: model_run_id}})
    }
  },
  computed: {
    scatter_data: function () {
      let _this = this;
      let x = [];
      let y = [];
      let item_name = [];
      let model_run_ids = [];

      // we could just return-object on the dropdown, but then setting the defaults is kind of a pain
      let x_axis_object = this.scatter_options.find(option => option.value === _this.var_x_axis)
      let y_axis_object = this.scatter_options.find(option => option.value === _this.var_y_axis)

      Object.values(this.$store.getters.current_model_area.model_runs).forEach(model_run => {
        if ("sum_vars" in x_axis_object) {
          _this.plot_average_items(x_axis_object, model_run, x);
        } else {
          x.push(model_run[_this.var_x_axis])
        }
        if ("sum_vars" in y_axis_object) {
          _this.plot_average_items(y_axis_object, model_run, y);
        } else {
          y.push(model_run[_this.var_y_axis])
        }
        item_name.push(model_run.name)
        model_run_ids.push(model_run.id)
      })
      return [{
        x: x,
        y: y,
        text: item_name,
        model_run_ids: model_run_ids,
        marker: {size: 12},
        mode: "markers",
        type: "scatter",
      }]
    },
    scatter_layout: function () {
      let _this = this;
      return {
        hovermode: 'closest', // make it snap to the nearest point
        xaxis: {
          title: this.scatter_options.find(option => option.value === _this.var_x_axis).text
        },
        yaxis: {
          title: this.scatter_options.find(option => option.value === _this.var_y_axis).text
        },
        margin: {
          t: 15,
        }
      }
    }
  }
}
</script>

<style scoped>

</style>