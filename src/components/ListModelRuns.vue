<template>
    <v-container style="margin:auto">
        <v-row>
            <h2>Model Runs</h2>
        </v-row>
        <v-row>
          <v-btn-toggle v-model="button_toggle_not_used">
            <v-btn v-on:click="create_new_run">
              <v-icon>mdi-plus</v-icon> Create New Model Run
            </v-btn>

            <v-btn v-on:click="refresh_model_runs">
              <v-icon>mdi-refresh</v-icon> Update
            </v-btn>
          </v-btn-toggle>
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
        computed: {
          model_runs: function(){
            let all_runs = Object.values(this.$store.getters.current_model_area.model_runs);
            if(this.$store.state.user_profile.show_organization_model_runs === false){
              let _this = this;
              return all_runs.filter(run => run.user_id === _this.$store.state.user_profile.user.id)
            }
            return all_runs
          }
        }
    }
</script>

<style>
  /* Not scoped because scoped classed incur a performance hit because of the way they use id selectors - using a class instead */
  div.v-data-table.model_run_listing{
    cursor: pointer;
  }
</style>