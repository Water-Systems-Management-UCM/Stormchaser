<template>
    <v-flex>
        <NotificationSnackbar
          v-model="model_run_info_snackbar"
          :error_text="model_run_info_snackbar_text"
          :constant_snackbar_text="model_run_info_snackbar_constant_text"
        >
        </NotificationSnackbar>

        <v-flex id="model_run_container" v-if="!is_loading">
          <h2>Model Run: {{ waterspout_data.name }}</h2>
            <v-btn
                tile
                outlined
                color="primary"
                :to="{name: 'list-model-runs'}">&lt; Return to list</v-btn>
            <v-btn
                  v-if="!waterspout_data.is_base"
                  tile
                   outlined
                   color="delete"
                    @click="delete_process_active ? perform_delete_self() : begin_delete_self()"
                    :class="{active: delete_process_active, sc_model_run_delete: true}">
                    <v-icon>mdi-trash</v-icon>
                   <span id="sc_delete_placeholder"></span></v-btn>

            <v-btn v-on:click="update_model_run">
              <v-icon>mdi-refresh</v-icon> Update
            </v-btn>
                  <v-card tile id="model_info">
                    <ul>
                        <li v-if="waterspout_data.description">{{ waterspout_data.description }}</li>
                        <li v-if="waterspout_data.is_base">Base-Case with no modifications</li>
                        <li>ID: {{ waterspout_data.id }}</li>
                        <li>Status: <span>{{ $stormchaser_utils.model_run_status_text(this.waterspout_data) }}
                                      <span v-if="waterspout_data.complete===true"><br/>(<a @click.prevent="get_csv">Download CSV</a>)</span></span></li>
                        <li>Created by: {{ $store.state.users[waterspout_data.user_id].username }}</li>
                    </ul>
                  </v-card>

                  <v-tabs>
                    <v-tab>Results</v-tab>
                    <v-tab>Inputs</v-tab>
                    <v-tab v-if="waterspout_data.results.infeasibilities">Infeasibilities</v-tab>
                    <v-tab-item>
                      <h3>Results</h3>
                      <v-btn
                          tile
                          outlined
                          v-if="waterspout_data.complete===true"
                          @click.prevent="get_csv">Download Results as CSV</v-btn>
                      <v-tabs>
                        <v-tab>Summary Data</v-tab>
                        <v-tab>All Data</v-tab>
                        <v-tab-item>
                          <ResultsVisualizerBasic :model_data="waterspout_data" :regions="$store.getters.current_model_area.regions"></ResultsVisualizerBasic>
                        </v-tab-item>
                        <v-tab-item>
                          <ResultsVisualizer :model_data="waterspout_data" :regions="$store.getters.current_model_area.regions"></ResultsVisualizer>
                        </v-tab-item>
                      </v-tabs></v-tab-item>
                    <v-tab-item>
                      <h3>Inputs</h3>
                      <h4>Region Modifications</h4>
                      <v-tabs
                          v-if="has_region_modifications">
                        <v-tab>Table</v-tab>
                        <v-tab>Scatterplot</v-tab>
                        <v-tab-item>
                          <v-data-table
                              v-model="selected"
                              :headers="region_modifications_headers"
                              :items="waterspout_data.region_modifications"
                              item-key="id"
                              multi-sort
                              disable-pagination
                              class="elevation-1"
                          >
                            <template v-slot:item.name="{ item }">
                              <span class="region_name">{{ $store.getters.get_region_name_by_id(item.region) }}</span>
                            </template>
                          </v-data-table>
                        </v-tab-item>
                        <v-tab-item>
                          <Plotly :data="modification_scatter_data" :layout="modification_scatter_layout"></Plotly>
                        </v-tab-item>
                      </v-tabs>
                      <p v-if="!has_region_modifications">No modifications to the model's region settings in this run.</p>

                      <h4>Crop Modifications</h4>
                      <v-tabs
                          v-if="has_crop_modifications">
                        <v-tab>Table</v-tab>
                        <v-tab>Scatterplot</v-tab>
                        <v-tab-item>
                          <v-data-table
                              v-model="selected"
                              :headers="crop_modifications_headers"
                              :items="waterspout_data.crop_modifications"
                              item-key="id"
                              multi-sort
                              disable-pagination
                              class="elevation-1"
                          >
                            <template v-slot:item.crop_code="{ item }">
                              <span class="crop_code">{{ get_crop_code_by_id(item.crop) }}</span>
                            </template>
                            <template v-slot:item.name="{ item }">
                              <span class="crop_name">{{ get_crop_name_by_id(item.crop) }}</span>
                            </template>
                          </v-data-table>
                        </v-tab-item>
                        <v-tab-item>
                          <Plotly :data="crop_scatter_data" :layout="crop_scatter_layout"></Plotly>
                        </v-tab-item>
                      </v-tabs>
                      <p v-if="!has_crop_modifications">No modifications to the model's crop settings in this run.</p>
                    </v-tab-item>
                    <v-tab-item v-if="waterspout_data.results.infeasibilities">
                      <h3>Infeasibilities</h3>
                      <p v-if="waterspout_data.results.infeasibilities_text">Crops and how often they each appear in infeasible regions: {{ waterspout_data.results.infeasibilities_text }}</p>
                      <v-data-table
                          :headers="infeasibilities_headers"
                          :items="waterspout_data.results.infeasibilities"
                          item-key="id"
                          multi-sort
                          disable-pagination
                          class="elevation-1"
                      >
                        <template v-slot:item.name="{ item }">
                          <span class="region_name">{{ $store.getters.get_region_name_by_id(item.region) }}</span>
                        </template>
                      </v-data-table>
                    </v-tab-item>
                  </v-tabs>
        </v-flex>
    </v-flex>
</template>

<script>
    import { Plotly } from 'vue-plotly'
    import ResultsVisualizer from "@/components/ResultsVisualizer"
    import NotificationSnackbar from "@/components/NotificationSnackbar";
    import ResultsVisualizerBasic from "@/components/ResultsVisualizerBasic";

    export default {
        name: "ModelRun",
        components: {ResultsVisualizerBasic, NotificationSnackbar, ResultsVisualizer, Plotly },
        data: function() {
            return {
                waterspout_data: {"region_modifications": [], "crop_modifications": []},
                model_run_info_snackbar: false,
                model_run_info_snackbar_constant_text: "",
                model_run_info_snackbar_text: "",
                delete_process_active: false,
                is_loading: true,
                region_modifications_headers: [
                  {text: 'Region Name', value: 'name' },
                  {text: 'Land Proportion', value: 'land_proportion' },
                  {text: 'Water Proportion', value: 'water_proportion' },
                ],
                infeasibilities_headers: [
                  {text: 'Region Name', value: 'name' },
                  {text: 'Year', value: 'year' },
                  {text: 'Description', value: 'description' },
                ],
                crop_modifications_headers: [
                  {text: 'Crop', value: 'name' },
                  {text: 'ID', value: 'crop_code'},
                  {text: 'Price Proportion', value: 'price_proportion' },
                  {text: 'Yield Proportion', value: 'yield_proportion' },
                  {text: 'Min Land Area Proportion', value: 'min_land_area_proportion' },
                  {text: 'Max Land Area Proportion', value: 'max_land_area_proportion' },
                ]
            }
        },
        beforeRouteEnter (to, from, next) {
            next(vm => { // set the model run data that we're using in this component as we enter the route that uses it

                vm.is_loading = true;
                console.log(`Changing to Model Run ${to.params.id} via beforeRouteEnter`);
                // Get the model run - it will automatically update the model run to get the results if they're missing
                vm.$store.dispatch("get_model_run_with_results", to.params.id)
                              .then(function(model_run){
                                vm.waterspout_data = model_run;
                                vm.is_loading = false;
                              });


            })
        },
        //beforeRouteUpdate(to, from, next){
        //  this.waterspout_data = this.$store.dispatch("get_model_run_with_results", to.params.id);
        //  next();
       // },
        methods: {
          // these aren't great ways to handle this - we should have these get stored in a Object keyed by ID or something

          get_crop_name_by_id: function (id) {
            if (id === null){
              return "All Crops";
            }
            return this.$store.getters.current_model_area.crops[id].name
          },
          get_crop_code_by_id: function (id) {
            if (id === null){
              return "All Crops";
            }
            return this.$store.getters.current_model_area.crops[id].crop_code
          },
          update_model_run: function () {
            // re-fetches this model run from the server in case we have new results - doesn't run automatically,
            // but could be used in a polling fashion
            let _this = this;
            this.$store.dispatch("get_model_run_with_results", this.waterspout_data.id)
                .then(function (model_run) {
                  _this.waterspout_data = model_run;
                  console.log(model_run);
                });
          },
          get_csv: function() {
            // adapted from https://stackoverflow.com/a/43133108 - we need this code to proxy
            // the CSV downloads so we can send the authorization headers.
            let anchor = document.createElement("a");
            document.body.appendChild(anchor);

            let headers = this.$store.getters.basic_auth_headers;
            headers.append("Accept", "text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8");
            fetch(this.results_download_url, { headers: headers })
                .then(response => response.blob())
                .then(csv_data => {
                  let objectUrl = window.URL.createObjectURL(csv_data);

                  anchor.href = objectUrl;
                  anchor.download = `results_${this.waterspout_data.id}.csv`
                  anchor.click();

                  window.URL.revokeObjectURL(objectUrl);
                });
          },
          begin_delete_self: function() {
            // first handler for deleting the run - sets a flag that makes the CSS change and makes a second click of
            // the button use perform_delete_self. After a timeout of 5 seconds, resets the flag so the CSS returns to
            // its base state and this function becomes the handler again
            this.delete_process_active = true;
            let _this = this;
            setTimeout(function(){
              _this.delete_process_active = false
            }, 5000);
          },
          perform_delete_self: function () {
            // Runs the actual deletion of model runs - only triggered if begin_delete_self has already been run (which
            // makes this the handler for the next click

            // set up the snackbar
            this.model_run_info_snackbar_constant_text = "Failed to delete model run"

            // Don't even try to delete base cases
            if (this.waterspout_data.is_base) {
              this.model_run_info_snackbar_text = "Can't delete base cases"
              this.model_run_info_snackbar = true;
              return;
            }

            // otherwise, try to delete it
            let _this = this;
            let request = this.$store.dispatch("delete_model_run", this.waterspout_data);
            request.then(response => {
                  if (response.ok) {
                    _this.$router.push({name: "list-model-runs"})
                  } else {
                    console.log(response);
                    console.log(response.json());
                    _this.model_run_info_snackbar_text = "Server rejected model deletion. See console for details."
                    _this.model_run_info_snackbar = true;
                  }
                }
            ).catch(error => {
              _this.model_run_info_snackbar_text = `Unknown error - please try again later: ${error}`;
              _this.model_run_info_snackbar = true;
            })
          },
          get_generic_scatter_layout: function(x_title, y_title){
            return {
              hovermode: 'closest', // make it snap to the nearest point
              xaxis: {
                title: x_title
              },
              yaxis: {
                title: y_title
              }
            };
          },
          get_scatter_data: function(params){
              let x = [];
              let y = [];
              let item_name = [];

              params.modifications.forEach(function(item){
                x.push(item[params.x_value]);
                y.push(item[params.y_value]);
                item_name.push(params.lookup_function(item[params.lookup_attribute]));
              });
              return [{
                x: x,
                y: y,
                text: item_name,
                marker: {size: 12},
                mode: "markers",
                type: "scatter",
                hovertemplate: '<b>%{text}</b><br>' +   // make it display the region name and both value
                    '<b>' + params.x_title + '</b>: %{x}<br>' +
                    '<b>' + params.y_title + '</b>: %{y}<extra></extra>',  // the extra tag prevents it from labeling traces on hover
              }]
            },
        },
        computed: {
            has_region_modifications: function(){
                return this.waterspout_data.region_modifications.length > 0;
            },
            has_crop_modifications: function(){
              return this.waterspout_data["crop_modifications"] !== undefined && this.waterspout_data.crop_modifications.length > 0;
            },
            has_results: function(){
              return this.waterspout_data.results !== undefined && this.waterspout_data.results !== null;
            },
            results_download_url: function(){
                // typically, you won't want to access this directly because just accessing the link won't send the token
                // for authentication. Use the get_csv method to actually trigger a CSV download
                return `${this.$store.state.api_server_url}/api/model_runs/${this.waterspout_data.id}/csv/`;
            },
            modification_scatter_data: function(){
              return this.get_scatter_data({
                x_title: "Land Proportion",
                x_value: "land_proportion",
                y_title: "Water Proportion",
                y_value: "water_proportion",
                modifications: this.waterspout_data.region_modifications,
                lookup_function: this.$store.getters.get_region_name_by_id,
                lookup_attribute: "region"
              })
            },
            crop_scatter_data: function(){
              return this.get_scatter_data({
                x_title: "Price Proportion",
                x_value: "price_proportion",
                y_title: "Yield Proportion",
                y_value: "yield_proportion",
                modifications: this.waterspout_data.crop_modifications,
                lookup_function: this.get_crop_code_by_id,  // we can change this to crop_name_by_id once we have a way to load crop names
                lookup_attribute: "crop"
              })
            },
            modification_scatter_layout: function(){
              return this.get_generic_scatter_layout("Land Proportion", "Water Proportion")
            },
            crop_scatter_layout: function(){
              return this.get_generic_scatter_layout("Price Proportion", "Yield Proportion")
            }
        }
    }
</script>

<style lang="stylus">
  h3
    margin-top: 1em

  .region_name
    text-transform: capitalize;

  #model_run_container
    margin-left: auto;
    margin-right: auto;

    .sc_model_run_delete
      #sc_delete_placeholder:after
        content: "Delete this Model Run"

    .sc_model_run_delete.active, .v-btn.v-btn--flat.v-btn--outlined.sc_model_run_delete.active
      #sc_delete_placeholder:after
        /* Change text acter the active toggle is switched */
        content: "Click to Confirm Deletion"

      background-color: #bb3333;
      color: #fff;

    .loading
      text-align: center;

    #model_info
      max-width: 20em
      margin-top: 1em

      ul
        list-style-type: none
        margin: 0
        padding: 0

        li
          margin: 0
          padding: 0.75em
          border-bottom: 1px solid #ccc

  button.v-btn.primary
    a
      color: #fff;
      text-decoration: none;
</style>