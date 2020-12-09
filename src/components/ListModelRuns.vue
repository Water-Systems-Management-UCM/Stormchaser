<template>
    <v-container style="margin:auto">
        <v-row>
            <h2>Model Runs</h2>
        </v-row>
        <v-row>
          <v-col class="col-12 col-sm-6 sc-button_row">
            <v-btn-toggle v-model="button_toggle_not_used">
              <v-btn v-on:click="create_new_run">
                <v-icon>mdi-plus</v-icon> Create New Model Run
              </v-btn>

              <v-btn v-on:click="refresh_model_runs">
                <v-icon>mdi-refresh</v-icon> Update
              </v-btn>
            </v-btn-toggle>
          </v-col>
          <v-col class="col-12 col-sm-6 sc-listing_filter">
            <v-select
                v-model="listing_types"
                label="Filter model runs:"
                :items="available_listing_types"
                multiple
                chips
                deletable-chips
            >
            </v-select>
          </v-col>
        </v-row>
        <v-row>
          <!--<ul>
              <li v-for="m in $store.state.model_runs"
              v-bind:key="m.id"
              ><router-link :to="{name:'model-run', params:{id: m.id}}">{{ m.name }} - {{ m.date_submitted }}</router-link> </li>
          </ul>
          <p style="height:800px">&nbsp;</p>-->
          <v-data-table
                  v-model="selected"
                  :headers="headers"
                  :items="model_runs"
                  item-key="id"
                  show-select
                  multi-sort
                  sort-by="date_submitted"
                  sort-desc
                  class="elevation-1 model_run_listing"
                  :items-per-page=20
                  @click:row="view_model_run"
          >
            <template v-slot:item.complete="{ item }">
              <span>{{ $stormchaser_utils.model_run_status_text(item) }}</span>
            </template>
            <template v-slot:item.region_modifications="{ item }">
              <span>{{ item.region_modifications.length }}</span>
            </template>
            <template v-slot:item.crop_modifications="{ item }">
              <span>{{ item.crop_modifications.length }}</span>
            </template>
            <template v-slot:item.date_submitted="{ item }">
              <span>{{ new Date(item.date_submitted).toLocaleString() }}</span>
            </template>
          </v-data-table>
        </v-row>
    </v-container>
</template>

<script>
    export default {
        name: "ListModelRuns",
        data: function(){
            return {
                button_toggle_not_used: [],
                listing_types: ["base", "user"],
                available_listing_types: [
                  {text: "Base runs", value: "base"},
                  {text: "Prepopulated runs", value: "system"},
                  {text: "Runs I created", value: "user"},
                  {text: "Runs created by others in my organization", value: "organization"}
                ],
                headers: [
                    {text: 'Run Name', value: 'name' },
                    {text: 'Description', value: 'description' },
                    {text: '# Region Modifications', value: 'region_modifications'},
                    {text: '# Crop Modifications', value: 'crop_modifications'},
                    {text: 'Date Created', value: 'date_submitted' },
                    {text: 'Status', value: 'complete' },
                ]
            }
        },
        methods: {
          view_model_run: function(item){
            this.$router.push({name: "model-run", params: {id: item.id}})
          },
          create_new_run: function(){
            this.$router.push({name:"make-model-run"})
          },
          refresh_model_runs: function(){
            this.$store.dispatch("fetch_model_runs")
            let _this = this;
            setTimeout(function(){  // clear the toggle so it doesn't keep this highlighted
              _this.button_toggle_not_used = []
            }, 500)
          },
        },
        mounted(){
          if(this.$store.state.user_profile.show_organization_model_runs){
            this.listing_types.push("organization")
            this.listing_types.push("system")
          }

        },
        computed: {
          model_runs: function(){ // handles filtering the list of model runs - as currently written, "all runs" overrides the others
            let all_runs = Object.values(this.$store.getters.current_model_area.model_runs);
            let selected_runs = []
            let _this = this;

            if(this.listing_types.length === this.available_listing_types.length){
              return all_runs;  // have a shortcut for when we want everything since a few filtering options could be expensive
            }

            let search_user_ids = [];  // we're going to keep an array of user ids to search for here so we can do one .find for model runs that match
            if (this.listing_types.indexOf("system") !== -1){
              search_user_ids.push(Object.values(_this.$store.state.users).find(user => user.username === "system").id)  // this is a terrible way to handle this, but there's not another decent way right now
            }else if(this.listing_types.indexOf("base") !== -1) {  // if they want to see the base run - run as else because the system check will pick it up anyway. Don't double up
              selected_runs.push(this.$store.getters.current_model_area.base_model_run)
            }

            // if they want to see their own runs
            if (this.listing_types.indexOf("user") !== -1) {
              search_user_ids.push(_this.$store.state.user_profile.user.id)
            }

            selected_runs.push(...all_runs.filter(run => search_user_ids.indexOf(run.user_id) !== -1))  // now add the model runs that match the user ids we're searching for here

            // if they want to see the rest of the runs in the org that aren't theirs or a base run
            if (this.listing_types.indexOf("organization") !== -1){
              selected_runs.push(...all_runs.filter(run => run.user_id !== _this.$store.state.user_profile.user.id && run.is_base === false))
            }

            return selected_runs
          }

        }
    }
</script>

<style lang="stylus">
  /* Not scoped because scoped classed incur a performance hit because of the way they use id selectors - using a class instead */
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

</style>