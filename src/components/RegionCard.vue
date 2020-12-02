<template>
    <StormCard class_name="region"
               :title="region.region.name"
               @card-activate="activate"
               @card-deactivate="deactivate"
               :card_item="region"
    ><h4><span v-if="region.region.internal_id">{{ region.region.internal_id }}: </span>{{ region.region.name }}</h4>
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