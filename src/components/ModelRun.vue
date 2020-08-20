<template>
    <v-layout row >
        <v-flex xs12 lg12>
            <h2>Model Run {{ $route.params.id }} {{ waterspout_data.name }}</h2>
          <p><router-link :to="{name: 'list-model-runs'}">&lt; Return to list</router-link></p>
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
        </v-flex>
    </v-layout>
</template>

<script>
    export default {
        name: "ModelRun",
        data: function() {
            return {
                waterspout_data: {},
                modifications_headers: [
                  {text: 'Region Name', value: 'name' },
                  {text: 'Land Proportion', value: 'land_proportion' },
                  {text: 'Water Proportion', value: 'water_proportion' },
                ]
            }
        },
        beforeRouteEnter (to, from, next) {
            next(vm => {
                console.log(`Changing to Model Run ${to.params.id} via beforeRouteEnter`);
                vm.waterspout_data = vm.$store.state.model_runs.find(single_run => single_run.id === to.params.id);
                // access to component instance via `vm`
            })
        },
        methods:{
            set_up_component: function(id){
                this.waterspout_data = this.$store.state.model_runs.find(single_run => single_run.id === id);
            },
            get_region_name_by_id: function(id){
                return this.$store.state.regions.find(r => Number(r.id) === Number(id)).name
            }
        },
        watch: {
            '$route'(from, to){
                this.set_up_component(to.params.id);
                console.log(from);
            },
        },
        computed: {
            has_modifications: function(){
                return this.waterspout_data.region_modifications.length > 0;
            },
            results_download_url: function(){
                return `${this.$store.state.api_server_url}/api/model_runs/${this.waterspout_data.id}/csv/`;
            }
        }
    }
</script>

<style scoped>
  .region_name{
    text-transform: capitalize;
  }
</style>