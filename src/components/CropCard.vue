<template>
    <StormCard class_name="crop"
               :title="title_text"
               @card-activate="activate"
               @card-deactivate="deactivate"
               :card_item="crop"
    ><h4>{{ crop.crop_code }}</h4>
        <div class="crop_params" v-if="crop.active">
            <StormCardSlider
                v-model="crop.price_proportion"
                :initial_value=100
                :min="80"
                :max="120"
                label="Price (%)"
            >
            </StormCardSlider>
            <StormCardSlider
                    v-model="crop.yield_proportion"
                    :initial_value=100
                    :min="80"
                    :max="120"
                    label="Yield (%)"
            >
            </StormCardSlider>
        </div>
    </StormCard>
</template>

<script>
    import StormCard from "@/components/StormCard";
    import StormCardSlider from "@/components/StormCardSlider";

    export default {
        name: "CropCard",
        components: {
            StormCard,
            StormCardSlider
        },
        props: {
            crop: Object,
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
                return `${this.crop.crop_code}: ${this.crop.name}`
            },
        }
    }
</script>

<style scoped>

</style>