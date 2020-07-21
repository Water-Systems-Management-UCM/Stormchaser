<template>
    <v-layout row >
        <v-flex xs12 lg12>
            <h2>Model Run {{ $route.params.id }} {{ waterspout_data.name }}</h2>
            <p>
                <ul>
                    <li>ID: {{ waterspout_data.id }}</li>
                    <li>Results Ready: {{ waterspout_data.complete? "yes" : "no"}}</li>
                    <li> Modifications:
                        <ul>
                            <li style="text-transform:capitalize"
                                    v-for="mod in waterspout_data.region_modifications"
                                v-bind:key="mod.id">
                                {{ get_region_name_by_id(mod.region) }}:
                                    <ul>
                                        <li>Water: {{ mod.water_proportion }}</li>
                                        <li>Land: {{ mod.land_proportion }}</li>
                                    </ul>
                            </li>
                        </ul>
                    </li>
                </ul>
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
            results_download_url: function(){
                return `${this.$store.state.api_server_url}/api/model_runs/${this.waterspout_data.id}/csv/`;
            }
        }
    }
</script>

<style scoped>

</style>