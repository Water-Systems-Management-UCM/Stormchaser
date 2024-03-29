<template>
  <v-row>
        <NotificationSnackbar
          v-model="model_run_info_snackbar"
          :error_text="model_run_info_snackbar_text"
          :constant_snackbar_text="model_run_info_snackbar_constant_text"
        >
        </NotificationSnackbar>

        <v-col id="model_run_container" v-if="!is_loading" class="col-12">
          <v-row>
            <h2>Model Run: <span id="model_run_name" :contenteditable="model_run_editable" @blur="update_title_and_description">{{ waterspout_data.name }}</span>
              <v-icon v-if="model_run_editable"
                      class="sc_edit_icon"
                      @click="start_editing_element('model_run_name')">edit</v-icon></h2>
          </v-row>
          <v-row>
            <v-btn-toggle v-model="button_toggle_not_used">
              <v-btn
                  tile
                  outlined
                  color="primary"
                  :to="{name: 'list-model-runs'}">&lt; Return to list</v-btn>

              <v-btn
                  v-if="model_run_editable"
                  tile
                  outlined
                  @click="delete_process_active ? perform_delete_self() : begin_delete_self()"
                  :class="{active: delete_process_active, sc_model_run_delete: true}">
                <v-icon>mdi-delete</v-icon>
                <span id="sc_delete_placeholder"></span></v-btn>

              <v-btn v-on:click="update_model_run"
                     v-if="!has_results"
                     tile
                     outlined>
                <v-icon>mdi-refresh</v-icon> Update
              </v-btn>
              <v-menu
                  offset-y
                  v-if="has_results"
              > <!-- Downloads -->
                <template v-slot:activator="{ on, attrs }">
                  <v-btn
                      v-bind="attrs"
                      v-on="on"
                  >
                    <v-icon>mdi-download</v-icon> Downloads
                  </v-btn>
                </template>
                <v-list>
                  <v-list-item v-if="has_rainfall_data">
                    <v-list-item-title class="download_link"><a @click="download_csv_rainfall">Nonirrigated Results</a></v-list-item-title>
                  </v-list-item>
                  <v-list-item>
                    <v-list-item-title class="download_link"><a @click="download_csv_results">Irrigated Results</a></v-list-item-title>
                  </v-list-item>
                  <v-list-item>
                    <v-list-item-title class="download_link"><a @click="download_csv_input_regions">Input: Region Modifications</a></v-list-item-title>
                  </v-list-item>
                  <v-list-item>
                    <v-list-item-title class="download_link"><a @click="download_csv_input_crops">Input: Crop Modifications</a></v-list-item-title>
                  </v-list-item>
                </v-list>
              </v-menu>
            </v-btn-toggle>
          </v-row>

          <v-row id="model_info">
            <v-col class="col-12 col-md-4">
                  <v-card tile>
                    <h3>Description <v-icon v-if="model_run_editable"
                                            class="sc_edit_icon"
                                             @click="start_editing_element('model_run_description')">edit</v-icon>
                    </h3>
                    <div :contenteditable="model_run_editable"
                         id="model_run_description"
                         @blur="update_title_and_description"
                        v-if="waterspout_data.description">
                          <p v-for="paragraph in new Set(waterspout_data.description.split('\n\n'))" :key="paragraph">{{ paragraph }}</p>
                    </div>
                    <div :contenteditable="model_run_editable"
                         id="model_run_description"
                         @blur="update_title_and_description"
                         v-if="!waterspout_data.description && !waterspout_data.is_base">
                      <p>No Description</p>
                    </div>
                    <p v-if="waterspout_data.is_base">Base-Case with no modifications</p>
                  </v-card>
            </v-col>

            <v-col class="col-12 col-md-4">
              <v-card tile id="model_status">
                <h3>Status</h3>
                <p :class="status_classes"><span>{{ $stormchaser_utils.model_run_status_text(this) }}</span></p>
                <v-row v-if="has_results && waterspout_data.results.length > 1"
                  style="padding:0 1em;"
                >
                  <v-row style="margin:0;display:block;width:100%;">
                    <h4 style="display:inline-block">Use Results From</h4>
                    <SimpleTooltip
                      :link="$store.state.docs_urls.model_runs.multiple_results_sets"
                    >When we update the underlying model, we re-run all existing model runs to make sure they have the best results. By default you will see the newest results (and should only use these), but you can view previous results to understand what may have changed. Results are named by date run and you can choose which one you want to display from the dropdown. Note that selecting a different date only loads those results for this model run and not for any comparison runs in the chart, which will show the newest version of the model run only.</SimpleTooltip>
                  </v-row>
                  <v-autocomplete
                      v-model="results_index"
                      :items="results_choices"
                      label="Use Results From"
                      persistent-hint
                      solo
                  ></v-autocomplete>
                </v-row>
                <v-row v-if="has_results">
                  <v-col class="col-12" style="margin-top: 0; margin-bottom:0; padding-top:0">
                    <p style="font-size:0.75em;margin-top: 0; margin-bottom:0; ">Results from model version {{ results.dapper_version }}</p>
                  </v-col>
                </v-row>
              </v-card>
            </v-col>
            <v-col class="col-12 col-md-4">
              <v-card tile>
                <h3>Created by</h3>
                <p>{{ created_by_user }}</p>
                <h3>Run Created</h3>
                <p>{{ new Date(waterspout_data.date_submitted).toLocaleString() }}</p>
              </v-card>
            </v-col>
          </v-row>

          <v-row>
            <v-col class="col-12">
              <v-tabs>
                <v-tab v-if="has_results">Results</v-tab>
                <v-tab>Inputs</v-tab>
                <v-tab v-if="has_infeasibilities">Issues and Infeasibilities</v-tab>
                <v-tab-item v-if="has_results">
                      <h3>Results</h3>
                      <v-row v-if="has_results" class="stormchaser_resultsviz">
                        <v-col class="col-12">
                          <DataViewer
                              :model_data="results.result_set"
                              :rainfall_data="results.rainfall_result_set"
                              :regions="$store.getters.current_model_area.regions"
                              :multipliers="$store.getters.current_model_area.multipliers"
                              default_chart_attribute="gross_revenue"
                              :table_headers="table_headers"
                              map_default_variable="gross_revenue"
                              :map_variables="visualize_attribute_options"
                              :default_tab=0
                              :chart_attribute_options="visualize_attribute_options"
                              :comparison_options="comparison_model_runs"
                              :preferences="$store.getters.current_model_area.preferences"
                              :is_base_case="waterspout_data.is_base"
                              :model_run="waterspout_data"
                          ></DataViewer>
                        </v-col>
                      </v-row>
                      <v-row class="stormchaser_resultsviz"
                              v-if="!has_results">
                        <p>No results available yet.</p>
                      </v-row>
                </v-tab-item>
                <v-tab-item>
                  <h3>Inputs</h3>
                  <h4>Region Modifications</h4>
                  <v-tabs
                      v-if="has_region_modifications">
                    <v-tab>Table</v-tab>
                    <v-tab>Scatterplot</v-tab>
                    <v-tab-item>
                      <v-data-table
                          :dense="$store.getters.user_settings('dense_tables')"
                          v-model="selected"
                          :headers="region_modifications_headers"
                          :items="waterspout_data.region_modifications"
                          item-key="id"
                          multi-sort
                          disable-pagination
                          class="elevation-1"
                      >
                        <template v-slot:item.name="{ item }">
                          <span class="region_name" v-if="item.region || (!item.region && !item.region_group)">{{ $store.getters.get_region_name_by_id(item.region) }}</span>
                          <span class="region_name" v-if="item.region_group">Group: {{ $store.getters.get_region_group_name_by_id(item.region_group) }}</span>
                        </template>
                        <template v-slot:item.model_type="{ item }">
                          <span v-if="item.modeled_type === $store.getters.region_modeling_types.MODELED || item.modeled_type === undefined">{{ $store.state.terms.get_term_for_locale("model_runs.types.full") }}</span>
                          <span v-if="item.modeled_type === $store.getters.region_modeling_types.FIXED">{{ $store.state.terms.get_term_for_locale("model_runs.types.hold_to_base") }}</span>
                          <span v-if="item.modeled_type === $store.getters.region_modeling_types.REMOVED">{{ $store.state.terms.get_term_for_locale("model_runs.types.no_production") }}</span>
                          <span v-if="item.modeled_type === $store.getters.region_modeling_types.LINEAR_SCALED">{{ $store.state.terms.get_term_for_locale("model_runs.types.simple") }}</span>
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
                          :dense="$store.getters.user_settings('dense_tables')"
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
                        <template v-slot:item.region="{ item }">
                          <span v-if="item.region !== null && item.region !== undefined">{{ $store.getters.get_region_name_by_id(item.region) }}</span>
                        </template>
                        <template v-slot:item.max_land_area_proportion="{ item }">
                          <span v-if="item.max_land_area_proportion === null">No Limit</span>
                          <span v-if="item.max_land_area_proportion >= 0">{{ item.max_land_area_proportion }}</span>
                        </template>
                      </v-data-table>
                    </v-tab-item>
                    <v-tab-item>
                      <Plotly :data="crop_scatter_data" :layout="crop_scatter_layout"></Plotly>
                    </v-tab-item>
                  </v-tabs>
                  <p v-if="!has_crop_modifications">No modifications to the model's crop settings in this run.</p>
                </v-tab-item>
                <v-tab-item v-if="has_infeasibilities">
                  <h3>Infeasibilities</h3>
                  <p v-if="results.infeasibilities_text">Crops and how often they each appear in infeasible regions: {{ results.infeasibilities_text }}</p>
                  <v-data-table
                      :dense="$store.getters.user_settings('dense_tables')"
                      :headers="infeasibilities_headers"
                      :items="results.infeasibilities"
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
                </v-col>
            </v-row>
        </v-col>
    </v-row>
</template>

<script>
    import { Plotly } from '@wellcaffeinated/vue-plotly'
    import NotificationSnackbar from "@/components/NotificationSnackbar";
    import DataViewer from "@/components/DataViewer";
    import SimpleTooltip from "@/components/SimpleTooltip";

    export default {
        name: "ModelRun",
        components: {DataViewer, SimpleTooltip, NotificationSnackbar, Plotly },
        data: function() {
            return {
                waterspout_data: {"region_modifications": [], "crop_modifications": []},
                model_run_info_snackbar: false,
                model_run_info_snackbar_constant_text: "",
                model_run_info_snackbar_text: "",
                button_toggle_not_used: [],
                delete_process_active: false,
                is_loading: true,
                results_index: 0,  // which set of results should be used - default to index 0, which will be the newest run when multiple runs exist.
                visualize_attribute_options: [
                    {text:"Gross Revenue", value: "gross_revenue", key: "gross_revenue", metric: "$ gross"},
                    //{text:"Net Revenue", value: "net_revenue", key: "net_revenue", metric: "$ net"},
                    {text:"Land", value: "xlandsc", key: "xlandsc", metric: "ac land"},
                    {text:"Water", value: "xwatersc", key: "xwatersc", metric: "ac-ft"},
                    //{text:"Water Per Acre", value: "water_per_acre", key: "water_per_acre", metric: "ac-ft/ac"},
                ],
                table_extra_headers: [
                  {text:"Region", value:"region"},
                  {text:"Crop", value:"crop"},
                ],
                region_modifications_headers: [
                  {text: 'Region Name', value: 'name' },
                  {text: 'Rainfall Proportion', value: 'rainfall_proportion' },
                  {text: 'Irrigation Proportion', value: 'water_proportion' },
                  {text: 'Land Proportion', value: 'land_proportion' },
                  {text: 'Modeling Type', value: 'model_type' },
                ],
                infeasibilities_headers: [
                  {text: 'Region Name', value: 'name' },
                  {text: 'Year', value: 'year' },
                  {text: 'Description', value: 'description' },
                ],
                crop_modifications_headers: [
                  {text: 'Crop', value: 'name' },
                  this.$store.getters.current_model_area.preferences.region_linked_crops ? {text: 'Region', value: 'region' } : null,
                  {text: 'Price Proportion', value: 'price_proportion' },
                  {text: 'Yield Proportion', value: 'yield_proportion' },
                  {text: 'Min Land Area Proportion', value: 'min_land_area_proportion' },
                  {text: 'Max Land Area Proportion', value: 'max_land_area_proportion' },
                ].filter(item => item !== null),  // do it this way so we only show the region header when it's available
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
        mounted(){
          if(!this.has_results){
            this.update_loop()
          }

          if(this.$store.getters.net_revenue_enabled === true){
            this.visualize_attribute_options.push({text:"Net Revenue", value: "net_revenue", key: "net_revenue", metric: "$ net"});
          }
        },
        methods: {
          start_editing_element(element){
            document.getElementById(element).focus()
          },
          async update_title_and_description(){
            console.log("title or description edited");

            // get the title field DOM element
            let title_field = document.getElementById("model_run_name");
            let new_name = title_field.textContent  // get the text content for the field
            title_field.innerText = this.waterspout_data.name;  // replace it with the new name as text so that any newlines are removed and it's consistent with what's sent to the server

            // get the description - we'll do this as HTML
            let new_description = document.getElementById("model_run_description").innerText;

            await this.$store.dispatch("update_model_run_name_and_description", {id: this.waterspout_data.id, name: new_name, description: new_description})
            this.update_model_run()  // after it's done, update the model run again from the server to make sure we show
                                    // the user what's consistent with what's on the server (e.g. if the update succeeds/fails
                                    // we can do this a different way where we check what's coming back, but this is easiest to code/maintain

          },
          update_loop(){
            let _this = this;
            this.update_model_run()
            setTimeout(function() {
              if (!_this.has_results) {
                _this.update_loop()
              }
            }, 10000) // wait 10 seconds so we can get results back and not hit the server repeatedly. Then check if we already have results and run an update if not
          },
          edit_text(text_choice, text_key){
            console.log("edit text executed")
            let new_text = this.$event.target.value

            this[text_choice] = false;

            this.$store.dispatch("save_text_edit", this.waterspout_data.id, text_key, new_text)
          },
          // these aren't great ways to handle this - we should have these get stored in a Object keyed by ID or something
          download_csv_results(){
            let drop_fields = ["year"]
            if(this.$store.getters.net_revenue_enabled === false){
              drop_fields.push("net_revenue");
            }
            this.$stormchaser_utils.download_array_as_csv({data: this.results.result_set,
              filename: this.download_name,
              lookups: this.download_results_lookups,
              drop_fields: drop_fields,
            })
          },
          download_csv_rainfall(){
            this.$stormchaser_utils.download_array_as_csv({data: this.results.rainfall_result_set,
              filename: "rainfall_" + this.download_name,
              lookups: this.download_results_lookups,
            })
          },
          download_csv_input_regions(){
            this.$stormchaser_utils.download_array_as_csv({data: this.waterspout_data.region_modifications,
              filename: this.download_name_region_mods,
              lookups: this.download_results_lookups,
              drop_fields: ["id"],
            })
          },
          download_csv_input_crops(){
            this.$stormchaser_utils.download_array_as_csv({data: this.waterspout_data.crop_modifications,
              filename: this.download_name_crop_mods,
              lookups: this.download_results_lookups,
              drop_fields: ["id"],
            })
          },
          get_crop_name_by_id: function (id) {
            return this.$store.getters.get_crop_name_by_id(id)
          },
          get_crop_code_by_id: function (id) {
            if (id === null){
              return "All Crops";
            }
            return this.$store.getters.current_model_area.crops[id].crop_code
          },
          update_model_run: function () {
            // re-fetches this model run from the server in case we have new results - doesn't run automatically,
            // but is used in a polling fashion
            let _this = this;
            this.$store.dispatch("get_model_run_with_results", this.waterspout_data.id)
                .then(function (model_run) {
                  _this.waterspout_data = model_run;
                });
            setTimeout(function(){  // clear the toggle so it doesn't keep this highlighted
              _this.button_toggle_not_used = []
            }, 500)
          },
          begin_delete_self: function() {
            // first handler for deleting the run - sets a flag that makes the CSS change and makes a second click of
            // the button use perform_delete_self. After a timeout of 5 seconds, resets the flag so the CSS returns to
            // its base state and this function becomes the handler again
            this.delete_process_active = true;
            let _this = this;
            setTimeout(function(){
              _this.delete_process_active = false
              _this.button_toggle_not_used = []
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
                    _this.$store.dispatch("fetch_model_runs")  // refresh the model run list if we delete one
                    _this.$router.push({name: "list-model-runs"})  // then go to the list
                  } else {
                    console.log(response);
                    console.log(response.json());
                    _this.model_run_info_snackbar_text = "Server rejected model deletion. See console (F12) for details. This error has been reported."
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
              },
              margin: {
                t: 15,
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
            results: function(){
              if(!this.has_results){
                return null;
              }
              return this.waterspout_data.results[this.results_index];  // temporary fix - just return the first item
            },
            table_headers: function(){
              let headers = this.table_extra_headers.concat(this.visualize_attribute_options); // merge the additional table headers in with the options
              headers = headers.map(function(item){  // then make sure the units get added to the item text for the table headers
                if(item.metric) {  // if it has units, merge it in, otherwise skip it
                  item.text = `${item.text} (${item.metric})`
                }
                return item
              })
              return headers
            },
            has_region_modifications: function(){
                return this.waterspout_data.region_modifications.length > 0;
            },
            has_crop_modifications: function(){
              return this.waterspout_data["crop_modifications"] !== undefined && this.waterspout_data.crop_modifications.length > 0;
            },
            has_results: function(){
              return this.waterspout_data.complete === true && "results" in this.waterspout_data && this.waterspout_data.results.length > 0 && this.waterspout_data.results[0] !== null && this.waterspout_data.results[0] !== undefined;
            },
            has_infeasibilities: function(){
              return this.has_results && this.results.infeasibilities.length > 0
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
                lookup_function: this.$store.getters.get_crop_name_by_id,  // we can change this to crop_name_by_id once we have a way to load crop names
                lookup_attribute: "crop"
              })
            },
            modification_scatter_layout: function(){
              return this.get_generic_scatter_layout("Land Proportion", "Water Proportion")
            },
            crop_scatter_layout: function(){
              return this.get_generic_scatter_layout("Price Proportion", "Yield Proportion")
            },
            download_name: function(){
              let date_string = this.results.date_run.replace(/T.*$/, "");  // Append the date of this particular set of results so that downloads of the same model run can be differentiated. Get rid of the time portion of the date run field
              return `${this.$store.getters.current_model_area.name}_results_${this.waterspout_data.id}_${this.waterspout_data.name.replace(/\s/g, "_")}_${date_string}.csv`
            },
            download_name_region_mods: function(){
              return `${this.$store.getters.current_model_area.name}_region_mods_${this.waterspout_data.id}_${this.waterspout_data.name.replace(/\s/g, "_")}.csv`
            },
            download_name_crop_mods: function(){
              return `${this.$store.getters.current_model_area.name}_crop_mods_${this.waterspout_data.id}_${this.waterspout_data.name.replace(/\s/g, "_")}.csv`
            },
            /*
             * Populate the dropdown that lets people choose which version of the results they're showing
             */
            results_choices: function(){
              return this.waterspout_data.results.map(function(result_set, index){
                return {text: result_set.date_run.replace(/T.*/, ""), value: index}
              })
            },
            download_results_lookups: function(){
              return {
                "region": [{
                  func_object: this.$store.getters.get_region_name_by_id,
                  suffix: "_name",
                },
                  {
                    func_object: this.$store.getters.get_region_code_by_id,
                    suffix: "_code",
                  },
                ],
                "crop": [
                  {
                    func_object: this.$store.getters.get_crop_name_by_id,
                    suffix: "_name"
                  }
                ],
              }
            },
            status_classes: function(){
              /* Returns classes to attach to the status text */
              let classes = "status"
              if (this.waterspout_data.complete){
                classes += " complete"
                if(this.results.in_calibration === false){
                  classes += " out_of_bounds"
                }
                return this.has_infeasibilities ? classes + " infeasibilities" : classes
              }else if(this.waterspout_data.running){
                return "status running"
              }else{
                return "status waiting"
              }
            },
            model_run_editable: function(){
              return !this.waterspout_data.is_base && this.$store.getters.current_model_area.preferences.create_or_modify_model_runs
            },
            created_by_user: function(){
              if(!(this.waterspout_data.user_id in this.$store.state.users)){
                /* if we can't find the user info, it typically means the user isn't in the same organization as the
                  user that created the model run. This shouldn't happen, but it can if we move model runs around
                  and forget to change the user that made it. Giving a message is better than making the page fail!
                 */
                this.$store.commit("app_notice", {
                  message: "Couldn't look up user account for this " +
                      "model run. The user is likely not in the same organization as you. An admin will need to fix this.",
                  timeout: 20000,  // make it ephemeral since we're going to proceed anyway
                })
                return "Unknown"  // if they had permission to load this model, but the user isn't in the same org, keep going
              }
              return this.$store.state.users[this.waterspout_data.user_id].username
            },
            comparison_model_runs: function(){
              // get all the model runs and filter it to only the ones that aren't the current one
              return Object.values(this.$store.getters.current_model_area.model_runs).filter(model_run => model_run.id !== this.waterspout_data.id)
            },
            has_rainfall_data: function(){
              return this.results.rainfall_result_set !== null && this.results.rainfall_result_set !== undefined && this.results.rainfall_result_set.length > 0
            },
        }
    }
</script>

<style lang="stylus">
  h3
    margin-top: 1em

  .region_name
    text-transform: capitalize;

  #model_run_container
    #model_run_name:focus
      background-color: white;
      border: 1px solid #666

    #model_run_description:focus
      background-color: white;
      border: 1px solid #666

    .sc_edit_icon
      margin-left: 0.25em;
      margin-bottom: 3px;

    .sc_model_run_delete
      #sc_delete_placeholder:after
        content: "Delete this Model Run"

    .sc_model_run_delete.active, .v-btn.v-btn--flat.v-btn--outlined.sc_model_run_delete.active
      #sc_delete_placeholder:after
        /* Change text after the active toggle is switched */
        content: "Click to Confirm Deletion"

      background-color: #bb3333;
      color: #fff;

    .loading
      text-align: center;

    #model_info
      div.v-card
        padding: 1em

      h3
        margin: 0


  button.v-btn.primary
    a
      color: #fff;
      text-decoration: none;

  div.v-list-item__title.download_link
    width:100%;
    height:100%;

    a
      display:block;
      width:100%;
      height:100%

  #model_status
    .status.complete
      color: #00890c

    .status.complete.out_of_bounds
      color: #00890c

    .status.complete.infeasibilities, .status.complete.infeasibilities.out_of_bounds
      color: #9e5313

    .status.running
      color: #9d9e1e

    .status.waiting
      color: #666666

</style>