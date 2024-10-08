<template>
    <v-container style="margin: auto">
      <v-row>
        <h2  class="test">Model Runs</h2>
      </v-row>
      <v-row style="padding-bottom: 15px">
        <v-tabs>
          <v-tab>Model Run Listing</v-tab>
          <v-tab>Model Run Plotted by Modifications</v-tab>

         <v-tab >
           <v-row>
             <v-col class="col-12 col-sm-6 sc-button_row">
                <v-btn-toggle v-model="button_toggle_not_used">
                  <v-btn v-on:click="create_new_run" v-if="$store.getters.current_model_area.preferences.create_or_modify_model_runs">
                    <v-icon>mdi-plus</v-icon> Create New Model Run
                  </v-btn>

                  <v-btn v-on:click="refresh_model_runs">
                    <v-icon>mdi-refresh</v-icon> Update
                  </v-btn>
                  <v-btn
                    v-if="this.selected_row_counter >= 1"
                    v-bind="$attrs"
                    @click="
                      confirm_delete_dialog
                        ? perform_delete_self()
                        : begin_delete_self()
                    "
                    :class="{
                      active: confirm_delete_dialog,
                      sc_model_run_delete: true,
                    }"
                  >
                    <v-icon>mdi-delete</v-icon>
                    <span id="sc_delete_placeholder"></span>
                  </v-btn>
                </v-btn-toggle>
              </v-col>
             <v-card>
               <v-col class="col-12 col-sm-6 sc-listing_filter">

                <v-select
                    v-model="listing_types"
                    label="Filter model runs:"
                    :items="available_listing_types"
                    item-title="value"
                    multiple
                    chips
                >
                </v-select>

              </v-col>
            </v-card>
           </v-row>
         </v-tab>
        </v-tabs>
      </v-row>

      <v-stepper>
        <v-stepper-window>
          <v-data-table
            :headers="headers"
            item-key="name"
            v-model="selected"
            :items="model_runs"
            show-select
            multi-sort
            @click:row="view_model_run"
            :dense="$store.getters.user_settings('dense_tables')"
            class="elevation-1 model_run_listing"
            :items-per-page="20"
            sort-desc
          >

            <template v-slot:item="{ item, select }">
              <tr @click="view_model_run(item)">
                 <td>
                  <v-checkbox
                    v-model="item.selected"
                    @change="checkbox_toggle(item)"
                  />
                </td>
                <td>{{ item.name }}</td>
                <td>{{ item.description ? item.description : "-" }}</td>
                <td>{{ item.region_modifications.length }}</td>
                <td>{{ item.crop_modifications.length }}</td>
                <td>{{ item.user_id in $store.state.users ? $store.state.users[item.user_id].username : null }}</td>
                <td>{{ new Date(item.date_submitted).toLocaleString() }}</td>
              </tr>
            </template>
          </v-data-table>
          <ModelRunScatter></ModelRunScatter>
        </v-stepper-window>
      </v-stepper>
    </v-container>
</template>

<script>
import {defineComponent, toRaw, ref} from 'vue';

import ModelRunScatter from './ModelRunScatter.vue';
export default defineComponent({
  name: 'ListModelRuns',
  components: {ModelRunScatter},

  data: function(){
        return {
            button_toggle_not_used: [],
            listing_types: ['base', 'user'],
            confirm_delete_dialog: false,
            available_listing_types: [
              {text: 'Base runs', value: 'base'},
              {text: 'Prepopulated runs', value: 'system'},
              {text: 'Runs I created', value: 'user'},
              {text: 'Runs created by others in my organization', value: 'organization'}
            ],
            headers: [
                {title: 'Run Name', key: 'name', align: 'start' },
                {title: 'Description', key: 'description' },
                {title: '# Region Modifications', key: 'region_modifications'},
                {title: '# Crop Modifications', key: 'crop_modifications'},
                {title: 'Created By', key: 'user_id'},
                {title: 'Date Created', key: 'date_submitted' },
                {title: 'Status', key: 'complete' },
            ],
            selected: [],
            selected_row_counter: ref(0),
            current_runs: [],
        };
  },

  methods: {
    view_model_run: function(row){
      row = toRaw(row)
      console.log("item in view: ", row)

      this.$router.push({name: 'model-run', params: {id: row.id}})
    }, // look here for page linking  Look into v data table
    create_new_run: function(){
      this.$router.push({name:'make-model-run'})
    },
    refresh_model_runs: function(){
      this.$store.dispatch('fetch_model_runs')
      let _this = this;
      setTimeout(function(){  // clear the toggle so it doesn't keep this highlighted
        _this.button_toggle_not_used = []
      }, 500)
    },
    checkbox_toggle: function(row) {
      if (row.selected){
        this.selected_row_counter++;
        this.selected.push(row);
      } else {
        this.selected_row_counter--;
        this.selected.pop()
      }
    },
    begin_delete_self: function () {
      this.confirm_delete_dialog = true;
      let _this = this;
      setTimeout(function () {
        _this.confirm_delete_dialog = false;
      }, 5000);
    },
    perform_delete_self: function () {
      // Runs the actual deletion of model runs - only triggered if begin_delete_self has already been run (which
      // makes this the handler for the next click
      // set up the snackbar
      // Don't even try to delete base cases
      // otherwise, try to delete it
      this.selected.forEach((model_run_data) => {
        if (model_run_data.is_base) {
          this.$store.commit('app_notice', {message: 'Can\'t delete base cases', timeout: 10000})
        }else{
          this.$store.dispatch('delete_model_run', model_run_data);
        }
      });
      setTimeout(this.$store.dispatch, 500, 'fetch_model_runs')
      this.selected = []
    },
  },



  computed: {
    model_runs: function(){ // handles filtering the list of model runs - as currently written, "all runs" overrides the others
      let all_runs = Object.values(toRaw(this.$store.getters.current_model_area.model_runs));

      let selected_runs = [];
      let _this = this;

      if(this.listing_types.length === this.available_listing_types.length){
        this.items = all_runs
        return all_runs;  // have a shortcut for when we want everything since a few filtering options could be expensive
      }

      let search_user_ids = [];  // we're going to keep an array of user ids to search for here so we can do one .find for model runs that match
      let system_user_id = toRaw(Object.values(_this.$store.state.users).find(user => user.username === 'system').id)
      if (this.listing_types.indexOf('system') !== -1){
        search_user_ids.push(system_user_id)  // this is a terrible way to handle this, but there's not another decent way right now
      }else if(this.listing_types.indexOf('base') !== -1) {  // if they want to see the base run - run as else because the system check will pick it up anyway. Don't double up
        selected_runs.push(toRaw(this.$store.getters.current_model_area.base_model_run))
      }

      // if they want to see their own runs
      if (this.listing_types.indexOf('user') !== -1) {
        search_user_ids.push(_this.$store.state.user_profile.user.id)
      }



      selected_runs.push(...all_runs.filter(run => search_user_ids.indexOf(run.user_id) !== -1))  // now add the model runs that match the user ids we're searching for here

      // if they want to see the rest of the runs in the org that aren't theirs or a base run
      if (this.listing_types.indexOf('organization') !== -1){
        selected_runs.push(...all_runs.filter(run => run.user_id !== _this.$store.state.user_profile.user.id && run.is_base === false && run.user_id !== system_user_id))
      }
      // console.log("sel runs: ", selected_runs)
      // for (let i = 0; i < selected_runs.length; i++){
      //   console.log(i, toRaw(selected_runs[i]))
      // }
      // console.log(selected_runs[19])
      return selected_runs
    }
  },
  mounted(){
    if(this.$store.state.user_profile.show_organization_model_runs){
      console.log(this.$store.state.user_profile.show_organization_model_runs)
      this.listing_types.push('organization')
      this.listing_types.push('system')
    }
    // this.model_runs()
  },
});
</script>

<style lang="stylus">
  /* Not scoped because scoped classed incur a performance hit because of the way they use id selectors - using a class instead */
  td
    div.v-selection-control
      right  7.45px
      color black
  div.v-data-table.model_run_listing
    cursor: pointer;

  /* the next two items are meant to get the button bar and filters closer to the listing */
  .col.sc-button_row
    padding-top: 0
    padding-left: 0
    padding-bottom: 0

    .v-item-group
      margin-top:12px

  .col.sc-listing_filter
    padding-bottom: 0
    padding-top: 0

    .v-text-field__details
      display: none

  .sc_model_run_delete, #sc_delete_placeholder:after
    content: 'Delete';

  .sc_model_run_delete.active, .v-btn.v-btn--flat.v-btn--outlined.sc_model_run_delete.actives
    background-color: #bb3333;
    color: #fff;

    #sc_delete_placeholder:after
      /* Change text acter the active toggle is switched */
      content: 'Click to Confirm Deletion';

  #sc_model_run_listing .v-window.theme--light.v-tabs-items, #sc_model_run_listing .theme--light.v-tabs > .v-tabs-bar
    background-color: transparent

</style>