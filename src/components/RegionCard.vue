<template>
    <StormCard class_name="region"
               :title="region.region.name"
               @card-activate="activate"
               @card-deactivate="deactivate"
               :card_item="region"
    ><h4>{{ region.region.internal_id }}: {{ region.region.name }}</h4>
        <div class="region_params" v-if="region.active">
            <StormCardSlider
                v-model="region.water_proportion"
                :initial_value=100
                :min="min_water_and_land"
                :max="max_water_and_land"
                label="Water Availability (%)"
            >
            </StormCardSlider>
            <StormCardSlider
                    v-model="region.land_proportion"
                    :initial_value=100
                    :min="min_water_and_land"
                    :max="max_water_and_land"
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
        computed: {
            text: function() {
                return `${this.region.region.internal_id}: ${this.region.region.name}`
            },
            min_water_and_land: function(){
                return 50
            },
            max_water_and_land: function(){
                // this is a function in part because we'll later want to adjust this down to 100 again
                // due to model construction later. This will be set elsewhere at some point - this is temporary
                return 120
            }
        }
    }
</script>

<style scoped>

</style>