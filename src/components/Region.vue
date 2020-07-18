<template>
    <StormCard class_name="region"
               :title="region.name"
               @card-activate="activate"
               @card-deactivate="deactivate"
               :card_item="region"
    ><h4>{{ region.internal_id }}: {{ region.name }}</h4>
        <div class="region_params" v-if="region.active">
            <span v-text="region.water_proportion"></span>
            <v-slider
                    v-model="region.water_proportion"
                    label="Water"
                    min=0
                    max=100
                    value=100
                    color="blue"
                    track-color="grey"
            >
                <!-- prepend and append templates taken from the v-slider doc examples -->
                <template v-slot:prepend>
                    <v-icon
                            @click="decrement_water"
                    >
                        mdi-minus
                    </v-icon>
                </template>

                <template v-slot:append>
                    <v-icon
                            @click="increment_water"
                    >
                        mdi-plus
                    </v-icon>
                </template>
            </v-slider>
        </div>
    </StormCard>
</template>

<script>
    import StormCard from "@/components/StormCard";

    export default {
        name: "Region",
        props: {
            region: Object,
        },
        methods: {
            activate: function (){
                console.log("activating")
                this.region.active = true;
                this.$emit("region-activate")
            },
            deactivate: function(){
                console.log("deactivating")
                this.region.active = false;
                this.$emit("region-deactivate")
            },
            increment_water: function(){
                this.region.water_proportion++;
            },
            decrement_water: function(){
                this.region.water_proportion--;
            },
        },
        computed: {
            text: function(){
                return `${this.region.internal_id}: ${this.region.name}`
            }
        },
        components: {
            StormCard
        }
    }
</script>

<style scoped>

</style>