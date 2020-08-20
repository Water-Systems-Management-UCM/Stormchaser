<template>
    <v-layout row >
        <v-flex xs12 lg9 style="margin:auto">
            <h2>Model Runs</h2>
            <!--<ul>
                <li v-for="m in $store.state.model_runs"
                v-bind:key="m.id"
                ><router-link :to="{name:'model-run', params:{id: m.id}}">{{ m.name }} - {{ m.date_submitted }}</router-link> </li>
            </ul>
            <p style="height:800px">&nbsp;</p>-->
            <v-data-table
                    v-model="selected"
                    :headers="headers"
                    :items="$store.state.model_runs"
                    item-key="name"
                    show-select
                    multi-sort
                    sort-by="date_submitted"
                    sort-desc
                    class="elevation-1 model_run_listing"
                    items-per-page="20"
                    @click:row="view_model_run"
            >
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