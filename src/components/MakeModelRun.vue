<template>
    <v-layout row>
        <v-flex xs12 md3>
            <button v-on:click="run_model">Run</button>
            <h2>Active Regions</h2>
            <div>
                <Region
                        v-for="r in activeRegions"
                        v-bind:region="r"
                        v-bind:key="r.id"
                ></Region>
            </div>

            <v-dialog
                    v-model="dialog"
                    width="500"
            >
                <template v-slot:activator="{ on, attrs }">
                    <v-btn
                            color="red lighten-2"
                            dark
                            v-bind="attrs"
                            v-on="on"
                    >
                        Add Region
                    </v-btn>
                </template>

                <h2>Add Region to Make Changes</h2>
                <div>
                    <Region
                            v-for="r in inactiveRegions"
                            v-bind:region="r"
                            v-bind:key="r.id"
                    ></Region>
                </div>
            </v-dialog>
        </v-flex>
        <v-flex xs12 md9>
            Yo, I'm a map
        </v-flex>
    </v-layout>
</template>

<script>
    import Region from "@/components/Region";

    export default {
        components: {
            Region
        },
        name: "MakeModelRun",
        data: function(){
            return {}
        },
        methods: {
            get_header: function() {
                let headers = new Headers();
                headers.append("Authorization", `Token ${this.$store.state.user_api_token}`);
                headers.append('Content-Type', 'application/json');
                return headers;
            },
            run_model: function(){
                  console.log("Creating Model Run");
                  let headers = this.get_header();
                  console.log(headers.values());

                  let regions = this.activeRegions;
                  let scaled_down_regions = [];
                  regions.forEach(function(region){
                      let new_region = {
                          "region": region.id,
                          "water_proportion": region.water_proportion / 100 // API deals in proportions, not percents
                      };
                      scaled_down_regions.push(new_region);
                  });

                  let body = `{
                                "name": "test",
                                "ready": true,
                                "organization": ${this.$store.state.organization_id},
                                "calibration_set": ${this.$store.state.calibration_set_id},
                                "region_modifications": ${JSON.stringify(scaled_down_regions)}
                            }`;

                  console.log(body);
                  fetch(this.$store.state.api_url_model_runs, {
                      method: 'POST',
                      headers: headers,
                      body: body
                  }).then((response) => { console.log(response); response.text().then(function(text){console.log(text)}) })
                  //.then(response => response.json())
                  //.then(data => set_regions(data));
            }
        },
        computed: {
            activeRegions: function() {
                console.log("Getting active regions")
                console.log(this.$store.state.regions.filter(region => region.active === true))
                return this.$store.state.regions.filter(region => region.active === true);
            },
            inactiveRegions: function() {
                console.log("Getting inactive regions")
                console.log(this.$store.state.regions.filter(region => region.active === false))
                return this.$store.state.regions.filter(region => region.active === false);
            }

        }
        }
</script>

<style scoped>

</style>