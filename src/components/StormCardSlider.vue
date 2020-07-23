<template>
    <div class="stormcard_slider">
        <span v-text="slider_value"></span>
        <v-slider
                v-model="slider_value"
                :label="label"
                :min="min"
                :max="max"
                :value=initial_value
                color="blue"
                track-color="grey"
        >
            <!-- prepend and append templates taken from the v-slider doc examples -->
            <template v-slot:prepend>
                <v-icon
                        @click="decrement_slider_value"
                >
                    remove
                </v-icon>
            </template>

            <template v-slot:append>
                <v-icon
                        @click="increment_slider_value"
                >
                    add
                </v-icon>
            </template>
        </v-slider>
    </div>
</template>

<script>
    export default {
        name: "StormCardSlider",
        props:{
            value: Number,  // for v-model support, named it value
            label: String,
            min: Number,
            max: Number,
            initial_value: Number,
        },
        data: function(){
            return {
                slider_value: this.initial_value
            }
        },
        methods:{
            increment_slider_value: function(){
                this.slider_value++;
            },
            decrement_slider_value: function(){
                this.slider_value--;
            },
        },
        watch: {
            slider_value() {
                this.$emit('input', this.slider_value);
            }
        }
    }
</script>

<style scoped>

</style>