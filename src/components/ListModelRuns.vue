<template>
    <v-layout row >
        <v-flex xs12 lg9 style="margin:auto">
            <h2>Model Runs</h2>
              <v-btn v-on:click="refresh_model_runs">
                <v-icon>mdi-refresh</v-icon> Update
              </v-btn>
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
                    items-per-page="20"
                    @click:row="view_model_run"
            >
              <template v-slot:item.complete="{ item }">
                <span>{{ $stormchaser_utils.model_run_status_text(item) }}</span>
              </template>
            </v-data-table>
        </v-flex>
    </v-layout>
</template>

<script>
    export default {
        name: "ListModelRuns",
        data: function(){
            return {
                headers: [
                    {text: 'Run Name', value: 'name' },
                    {text: 'Description', value: 'description' },
                    {text: 'Date', value: 'date_submitted' },
                    {text: 'Status', value: 'complete' },
                ]
            }
        },
        methods: {
          view_model_run: function(item){
            this.$router.push({name: "model-run", params: {id: item.id}})
          },
          refresh_model_runs: function(){
            this.$store.dispatch("fetch_model_runs")
          },
        },
        computed: {
          model_runs: function(){
            return Object.values(this.$store.state.model_runs);
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