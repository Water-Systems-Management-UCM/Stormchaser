<template>
    <StormCard class_name="region"
               :aria-describedby="'Modifications card for ' + text"
               @card-activate="activate"
               @card-deactivate="deactivate"
               :card_item="region"
               :is_deletable="true"
    >
        <v-row no-gutters>
          <h4><span v-if="region.region.internal_id">{{ region.region.internal_id }}: </span>{{ text }}</h4>
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
            :value="modeled_type_adjusted === true ? 0 : null"
        > <!-- the "value" key there opens the advanced panel (key 0) if our modeled_type isn't "MODELED" - the modeled type will be automatically adjusted and the flag
            set on component mount. Otherwise, if it's not adjusted, then setting it to null, which keeps it closed when the card is created
            this way, we show people that something isn't normally modeled when we create the card.
        -->
          <v-expansion-panel>
            <v-expansion-panel-header style="min-height: unset;">Advanced</v-expansion-panel-header>
            <v-expansion-panel-content>
              <label class="v-label theme--light" style="">Region Modeling Type <SimpleTooltip :link="$store.state.docs_urls.make_model_runs.advanced_region_options">Controls how the region is modeled - potential options may include "Full" modeling (PMP + rainfall where applicable), "Simple" modeling (inputs result in a linear change in outputs), or "No production", where it is assumed the region contains no agriculture in the model and it is excluded from production and results.</SimpleTooltip></label>
              <v-btn-toggle
                  dense
                  style="margin-left: 1em;"
                  mandatory
                  :value="modeled_type_index"
              >
                <v-btn
                    @click="change_modeled_type(0)"
                    :value="0"
                  >{{ $store.state.terms.get_term_for_locale("model_runs.types.full") }}</v-btn>
                <v-btn
                    @click="change_modeled_type(1)"
                    v-if="preferences.allow_static_regions || region.region.default_behavior === 1"
                    class="sc_static"
                    :value="1"
                  >{{ $store.state.terms.get_term_for_locale("model_runs.types.hold_to_base") }}</v-btn>
                <v-btn
                    @click="change_modeled_type(3)"
                    v-if="preferences.allow_linear_scaled_regions || region.region.default_behavior === 3"
                    class="sc_linear_scaling"
                    :value="3"
                >{{ $store.state.terms.get_term_for_locale("model_runs.types.simple") }}</v-btn>
                <v-btn
                    @click="change_modeled_type(2)"
                    v-if="preferences.allow_removed_regions || region.region.default_behavior === 2"
                     class="sc_no_production"
                     :value="2"
                  >{{ $store.state.terms.get_term_for_locale("model_runs.types.no_production") }}</v-btn>
              </v-btn-toggle>
            </v-expansion-panel-content>
          </v-expansion-panel>
          <v-expansion-panel
              v-if="region.is_group">
            <v-expansion-panel-header style="min-height: unset;">Regions in Group</v-expansion-panel-header>
            <v-expansion-panel-content>
              <ul>
                <li v-for="r in region.regions_in_group"
                    :key="r.internal_id"
                >{{ r.name }}</li>
              </ul>
            </v-expansion-panel-content>
          </v-expansion-panel>
        </v-expansion-panels>
    </StormCard>
</template>

<script>
    import StormCard from "./StormCard.vue";
    import StormCardSlider from "./StormCardSlider.vue";
    import SimpleTooltip from "./SimpleTooltip.vue";

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
            modeled_type_adjusted: false,  // we'll track if the user has clicked
          }
        },
        mounted(){
          // when the component is loaded, sync up the UI and the make model runs component with what its default modeling state should be
          if(this.$store.getters.current_model_area.preferences.use_default_region_behaviors){
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
              case this.region.region.LINEAR_SCALED:
                this.change_modeled_type(3)
                break;
            }
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
              if(new_type !== 0){
                this.modeled_type_adjusted = true;  // indicate that the modeled type has been changed so we keep it open even after they click
              }

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
                case 3:
                  this.$emit('region-model-type', {region: this.region, type:'linear_scaled'})
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
          },
        },
        computed: {
            text: function() {
                return this.region.is_group ? `${this.region.region_group.name}` : `${this.region.region.name}`
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
              return this.region.is_group ? this.show_rainfall : this.force_rainfall || this.region.region.supports_rainfall
            },
            show_irrigation(){
              /* if the model area doesn't support it, then we won't even show the placeholder for it */
              return this.force_irrigation || this.$store.getters.current_model_area.supports_irrigation
            },
            show_irrigation_slider(){
              /* But if the model area supports it, and a subregion doesn't, then we just disable it so that it's not confusing */
              return this.region.is_group ? this.show_irrigation : this.force_irrigation || this.region.region.supports_irrigation
            },
            modeled_type_index(){
              // modeled_types display in a different order than their values, so we need to interpret this here
              let region_modeling_types = this.$store.getters.region_modeling_types
              let mapping = {}
              mapping[region_modeling_types.MODELED] = 0
              mapping[region_modeling_types.REMOVED] = 2
              mapping[region_modeling_types.FIXED] = 1
              mapping[region_modeling_types.LINEAR_SCALED] = 3

              return mapping[this.region.modeled_type]
            }
        }
    }
</script>

<style lang="stylus">
sc_button_selected
  background-color: rgba(0,0,0,0.12)
</style>