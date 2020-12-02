<template>
    <StormCard class_name="crop"
               :title="title_text"
               @card-activate="activate"
               @card-deactivate="deactivate"
               :card_item="crop"
    ><h4>{{ crop.crop.name }}</h4>
        <div class="crop_params" v-if="crop.active">
            <StormCardSlider
                v-model="crop.price_proportion"
                :initial_value=100
                :min="default_limits.min_price"
                :max="default_limits.max_price"
                label="Price (%)"
            >
            </StormCardSlider>
            <StormCardSlider
                    v-model="crop.yield_proportion"
                    :initial_value=100
                    :min="default_limits.min_yield"
                    :max="default_limits.max_yield"
                    label="Yield (%)"
            >
            </StormCardSlider>
            <StormCardRangeSlider
                v-model="crop.area_restrictions"
                :initial_value="[default_limits.min_crop_area,default_limits.max_crop_area]"
                :min="default_limits.min_crop_area"
                :max="default_limits.max_crop_area"
                label="Crop Area Restrictions (% of Calibrated)">

            </StormCardRangeSlider>
        </div>
    </StormCard>
</template>

<script>
    import StormCard from "@/components/StormCard";
    import StormCardSlider from "@/components/StormCardSlider";
    import StormCardRangeSlider from "@/components/StormCardRangeSlider";

    export default {
        name: "CropCard",
        components: {
            StormCard,
            StormCardSlider,
            StormCardRangeSlider
        },
        props: {
            crop: Object,
            default_limits: Object,
        },
        methods: {
            activate: function (){
                console.log("activating crop")
                this.crop.active = true;
                this.$emit("crop-activate")
            },
            deactivate: function(){
                console.log("deactivating crop")
                this.crop.active = false;
                this.$emit("crop-deactivate")
            },
        },
        computed: {
            title_text: function() {
                return `${this.crop.crop.crop_code}: ${this.crop.crop.name}`
            },
        }
    }
</script>

<style scoped>

</style>