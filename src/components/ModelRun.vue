<template>
    <v-layout row >
        <v-flex xs12 lg9 id="model_run_container" v-if="model_loaded">
          <h2>Model Run {{ $route.params.id }}: {{ waterspout_data.name }}</h2>
            <v-btn color="primary" :to="{name: 'list-model-runs'}">&lt; Return to list</v-btn>
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

          <v-autocomplete
              v-model="selected_years"
              :items="years"
              clearable
              deletable-chips
              chips
              small-chips
              label="Years"
              return-object
              persisten-hint
              multiple
              solo
          ></v-autocomplete>
            <Plotly :data="basic_result_scatter_data" :layout="basic_result_scatter_layout"></Plotly>
        </v-flex>
        <vflex xs9 id="model_run_container" v-if="!model_loaded">
          Loading...
        </vflex>
    </v-layout>
</template>

<script>
    import { Plotly } from 'vue-plotly';
    export default {
        name: "ModelRun",
        components: { Plotly },
        data: function() {
            return {
                years: [],
                selected_years: [],
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
                                vm.set_up_component();
                                vm.model_loaded = true;
                              });


            })
        },
        //beforeRouteUpdate(to, from, next){
        //  this.waterspout_data = this.$store.dispatch("get_model_run_with_results", to.params.id);
        //  next();
       // },
        methods:{
            set_up_component: function(){
              if(this.has_results){ // if we have results
                console.log("Calculating years")
                // get the distinct set of years that the model results cover
                this.years = [...new Set(this.waterspout_data.results.result_set.map(result => result.year))];
                this.selected_years = this.years;
              }
            },
            get_region_name_by_id: function(id){
                return this.$store.state.regions.find(r => Number(r.id) === Number(id)).name
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
            },
            basic_result_scatter_data: function(){
              let x = [];
              let y = [];

              this.waterspout_data.results.result_set
                  .filter(result => this.selected_years.includes(result.year))  // filter by year first
                  .forEach(function(result){
                      x.push(result.xlandsc);
                      y.push(result.xwatersc);
              });
              return [{
                x: x,
                y: y,
                mode: "markers",
                type: "scatter"
              }]
            },
            basic_result_scatter_layout: function(){
              return {
                xaxis: {
                  title:'Land'
                },
                yaxis: {
                  title:'Water'
                }
              }
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

  button.v-btn.primary
    a
      color: #fff;
      text-decoration: none;
</style>