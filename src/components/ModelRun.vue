<template>
    <v-layout row >
        <v-flex xs12 lg9 id="model_run_container" v-if="model_loaded">
          <h2>Model Run {{ $route.params.id }}: {{ waterspout_data.name }}</h2>
            <v-btn color="primary" :to="{name: 'list-model-runs'}">&lt; Return to list</v-btn>
            <!--<v-btn v-on:click="update_model_run">
              <v-icon>mdi-refresh</v-icon> Update Results
            </v-btn>-->
              <p>
                  <ul>
                      <li>ID: {{ waterspout_data.id }}</li>
                      <li>Results Ready: {{ waterspout_data.complete? "yes" : "no"}}</li>
                  </ul>
                      <h3 v-if="has_modifications">Modifications</h3>
                      <v-data-table
                          v-if="has_modifications"
                          v-model="selected"
                          :headers="modifications_headers"
                          :items="waterspout_data.region_modifications"
                          item-key="id"
                          multi-sort
                          disable-pagination
                          class="elevation-1"
                      >
                        <template v-slot:item.name="{ item }">
                          <span class="region_name">{{ get_region_name_by_id(item.region) }}</span>
                        </template>
                      </v-data-table>
                    <p v-if="!has_modifications">No modifications to the model in this run.</p>
            <p>
                  <v-btn
                          v-if="waterspout_data.complete===true"
                          :href="results_download_url" download>Download Results</v-btn>

              </p>
            <Plotly :data="modification_scatter_data"></Plotly>
            <ResultsVisualizer :model_data="waterspout_data" :regions="$store.state.regions"></ResultsVisualizer>
        </v-flex>
        <v-flex xs9 id="model_run_container" class="loading" v-if="!model_loaded">
          Loading...
        </v-flex>
    </v-layout>
</template>

<script>
    import { Plotly } from 'vue-plotly'
    import ResultsVisualizer from "@/components/ResultsVisualizer"
    export default {
        name: "ModelRun",
        components: { Plotly, ResultsVisualizer },
        data: function() {
            return {
                model_loaded: false, // this will be false, then we'll set it to true once we're done loading everything
                waterspout_data: {"region_modifications": []},
                modifications_headers: [
                  {text: 'Region Name', value: 'name' },
                  {text: 'Land Proportion', value: 'land_proportion' },
                  {text: 'Water Proportion', value: 'water_proportion' },
                ]
            }
        },
        beforeRouteEnter (to, from, next) {
            next(vm => { // set the model run data that we're using in this component as we enter the route that uses it

                vm.model_loaded = false;
                console.log(`Changing to Model Run ${to.params.id} via beforeRouteEnter`);
                // Get the model run - it will automatically update the model run to get the results if they're missing
                vm.$store.dispatch("get_model_run_with_results", to.params.id)
                              .then(function(model_run){
                                vm.waterspout_data = model_run;
                                console.log(model_run);
                                vm.model_loaded = true;
                              });


            })
        },
        //beforeRouteUpdate(to, from, next){
        //  this.waterspout_data = this.$store.dispatch("get_model_run_with_results", to.params.id);
        //  next();
       // },
        methods:{
            get_region_name_by_id: function(id){
                return this.$store.state.regions.find(r => Number(r.id) === Number(id)).name
            },
            update_model_run: function(){
              // re-fetches this model run from the server in case we have new results - doesn't run automatically,
              // but could be used in a polling fashion
              let _this = this;
              this.$store.dispatch("get_model_run_with_results", this.waterspout_data.id)
                  .then(function(model_run){
                    _this.waterspout_data = model_run;
                    console.log(model_run);
                  });
            }

        },
        computed: {
            has_modifications: function(){
                return this.waterspout_data.region_modifications.length > 0;
            },
            has_results: function(){
              return this.waterspout_data.results !== undefined && this.waterspout_data.results !== null;
            },
            results_download_url: function(){
                return `${this.$store.state.api_server_url}/api/model_runs/${this.waterspout_data.id}/csv/`;
            },
            modification_scatter_data: function(){
              let x = [];
              let y = [];
              this.waterspout_data.region_modifications.forEach(function(region){
                x.push(region.land_proportion);
                y.push(region.water_proportion);
              });
              return [{
                x: x,
                y: y,
                mode: "markers",
                type: "scatter"
              }]
            }
        }
    }
</script>

<style lang="stylus">
  .region_name
    text-transform: capitalize;

  #model_run_container
    margin-left: auto;
    margin-right: auto;

    .loading
      text-align: center;

  button.v-btn.primary
    a
      color: #fff;
      text-decoration: none;
</style>