<template>
    <StormCard class_name="region"
               :aria-describedby="'Modifications card for ' + region.region.name"
               @card-activate="activate"
               @card-deactivate="deactivate"
               :card_item="region"
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
                v-model="region.water_proportion"
                :initial_value=100
                :min="default_limits.min_water"
                :max="default_limits.max_water"
                label="Water Availability (%)"
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
    </StormCard>
</template>

<script>
    import StormCard from "@/components/StormCard";
    import StormCardSlider from "@/components/StormCardSlider";

    export default {
        name: "RegionCard",
        components: {
            StormCard,
            StormCardSlider
        },
        props: {
            region: Object,
            default_limits: Object,
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
        },
        watch: {
          "region.water_proportion": function(){
            this.$emit("region_modification_value_change")
          },
          "region.land_proportion": function(){
            this.$emit("region_modification_value_change")
          }
        },
        computed: {
            text: function() {
                return `${this.region.region.internal_id}: ${this.region.region.name}`
            },
        }
    }
</script>

<style scoped>

</style>