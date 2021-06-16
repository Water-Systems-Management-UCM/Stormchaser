<template>
    <StormCard class_name="region"
               :aria-describedby="'Modifications card for ' + region.region.name"
               @card-activate="activate"
               @card-deactivate="deactivate"
               :card_item="region"
               :is_deletable="true"
    >
        <v-row no-gutters>
          <h4><span v-if="region.region.internal_id">{{ region.region.internal_id }}: </span>{{ region.region.name }}</h4>
          <v-tooltip bottom
                     v-if="region.region.description"
                     max-width="30em"
          >
            <template v-slot:activator="{ on, attrs }">
              <v-icon
                  style="margin-left: 0.5em"
                  v-bind="attrs"
                  v-on="on">info</v-icon>
            </template>
            <span role="tooltip">{{ region.region.description }}</span>
          </v-tooltip>
        </v-row>
        <div class="region_params" v-if="region.active">

            <StormCardSlider
                v-if="show_rainfall"
                v-model="region.rainfall_proportion"
                :initial_value=100
                :min="default_limits.min_rainfall"
                :max="default_limits.max_rainfall"
                label="Rainfall (%)"
                :disabled="!show_rainfall_slider"
                disabled_message="Insufficient nonirrigated land to adjust rainfall"
                :disabled_message_if="$store.getters.current_model_area.supports_rainfall"
            >
            </StormCardSlider>
            <StormCardSlider
                v-if="show_irrigation"
                v-model="region.water_proportion"
                :initial_value=100
                :min="default_limits.min_water"
                :max="default_limits.max_water"
                label="Irrigation Availability (%)"
                :disabled="!show_irrigation_slider"
                disabled_message="Insufficient irrigated land to adjust irrigation"
                :disabled_message_if="$store.getters.current_model_area.supports_irrigation"
            >
            </StormCardSlider>
            <StormCardSlider
                v-model="region.land_proportion"
                :initial_value=100
                :min="default_limits.min_land"
                :max="default_limits.max_land"
                label="Land Availability (%)"
            >
            </StormCardSlider>
        </div>
        <v-expansion-panels
            v-if="allow_advanced"
            accordion
            flat
            tile
            style="border-top: 2px solid #ccc;"
            :value="modeled_type > 0 ? 0 : null"
        > <!-- the "value" key there opens the advanced panel (key 0) if our modeled_type isn't "MODELED", otherwise, setting it to null, which keeps it closed when the card is created
            this way, we show people that something isn't normally modeled when we create the card.
        -->
          <v-expansion-panel>
            <v-expansion-panel-header style="min-height: unset;">Advanced</v-expansion-panel-header>
            <v-expansion-panel-content>
              <label class="v-label theme--light" style="">Region Modeling Type <SimpleTooltip :link="$store.state.docs_urls.make_model_runs.advanced_region_options">Controls how the region is modeled - potential options may include normal modeling (PMP + rainfall where applicable), holding the model to the base case, where the region is not modeled, but instead the base case results are substituted, or removing the region from production, where it is assumed the region contains no agriculture in the model and it is excluded from production and results.</SimpleTooltip></label>
              <v-btn-toggle
                  v-model="modeled_type"
                  dense
                  style="margin-left: 1em;"
                  mandatory
              >
                <v-btn @click="change_modeled_type(0)" class="sc_modeled">Modeled</v-btn>
                <v-btn @click="change_modeled_type(1)" v-if="preferences.allow_static_regions" class="sc_static">Hold to Base Case</v-btn>
                <v-btn @click="change_modeled_type(2)" v-if="preferences.allow_removed_regions" class="sc_no_production">No Production</v-btn>
              </v-btn-toggle>
            </v-expansion-panel-content>
          </v-expansion-panel>
        </v-expansion-panels>

    </StormCard>
</template>

<script>
    import StormCard from "@/components/StormCard";
    import StormCardSlider from "@/components/StormCardSlider";
    import SimpleTooltip from "@/components/SimpleTooltip";

    export default {
        name: "RegionCard",
        components: {
          SimpleTooltip,
            StormCard,
            StormCardSlider
        },
        props: {
            region: Object,
            default_limits: Object,
            preferences: Object,
            force_rainfall: {
              type: Boolean,
              default: false
            },
            force_irrigation: {
              type: Boolean,
              default: false
            },
        },
        data: function(){
          return {
            modeled_type: 0 // we don't actually read this - it's just for vuetify to keep track
          }
        },
        mounted(){

          // when the component is loaded, sync up the UI and the make model runs component with what its default modeling state should be
          switch(this.region.region.default_behavior){
            case this.region.region.MODELED:
              this.change_modeled_type(0)
              break;
            case this.region.region.FIXED:
              this.change_modeled_type(1)
              break;
            case this.region.region.REMOVED:
              this.change_modeled_type(2)
              break;
          }
        },
        methods: {
            activate: function (){
                console.log("activating region")
                this.region.active = true;
                this.$emit("region-activate")
            },
            deactivate: function(){
                console.log("deactivating region")
                this.region.active = false;
                this.$emit("region-deactivate")
            },
            change_modeled_type(new_type){
              this.modeled_type = new_type;

              switch(new_type){
                case 0:
                  this.$emit('region-model-type', {region: this.region, type:'modeled'});
                  break;
                case 1:
                  this.$emit('region-model-type', {region: this.region, type:'static'});
                  break;
                case 2:
                  this.$emit('region-model-type', {region: this.region, type:'removed'})
                  break;
              }
            }
        },
        watch: {
          "region.water_proportion": function(){
            this.$emit("region_modification_value_change")
          },
          "region.rainfall_proportion": function(){
            this.$emit("region_modification_value_change")
          },
          "region.land_proportion": function(){
            this.$emit("region_modification_value_change")
          }
        },
        computed: {
            text: function() {
                return `${this.region.region.name}`
            },
            allow_advanced(){
              return this.preferences !== undefined ? this.preferences.allow_static_regions || this.preferences.allow_removed_regions : false
            },
            is_all_regions_card(){
              return this.region.default === true
            },
            show_rainfall(){
              return this.force_rainfall || this.$store.getters.current_model_area.supports_rainfall
            },
            show_rainfall_slider(){
              return this.force_rainfall || this.region.region.supports_rainfall
            },
            show_irrigation(){
              return this.force_irrigation || this.$store.getters.current_model_area.supports_rainfall
            },
            show_irrigation_slider(){
              return this.force_irrigation || this.region.region.supports_irrigation
            }
        }
    }
</script>

<style scoped>

</style>