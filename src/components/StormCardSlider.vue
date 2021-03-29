<template>
    <div class="stormcard_slider">
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
            <template v-slot:append>
              <v-icon
                  @click="decrement_slider_value"
              >
                remove
              </v-icon>
              <v-text-field
                  :label="label"
                  v-model="slider_value_input"
                  type="Number"
                  @blur="update_slider"
                  class="sc_slider_value_input"></v-text-field>

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
                slider_value: this.initial_value,
                slider_value_input: this.initial_value,
            }
        },
        methods:{
            increment_slider_value: function(){
                this.slider_value++;
            },
            decrement_slider_value: function(){
                this.slider_value--;
            },
            /*
             * Handles updating the slider from the text box. Hooking the text box directly up to slider_value has some
             * problems since frequently while typing something like "90" we end up out of bounds after typing the "9".
             * So now we hook up the text box to its own variable, then call this function to update the slider_value
             * only on blur.
             */
            update_slider: function(){
              this.slider_value = this.slider_value_input;
            }
        },
        watch: {
            slider_value() {
                this.$emit('input', this.slider_value);
                this.slider_value_input = this.slider_value;
            },
            initial_value: function(){
              this.slider_value = this.initial_value;
            },
        }
    }
</script>

<style lang="stylus">
hide_accessibly()
  /* Position offscreen, rather than displaying None so that screen readers still see it */
  position: absolute !important;
  top: -9999px !important;
  left: -9999px !important;

.stormcard_slider
  .sc_slider_value_input
    width:3em
    margin: 0
    padding: 0

    div, input
      /* get rid of extra spacing so that this and the -/+ buttons for incrementing it align */
      margin: 0
      padding: 0
      text-align: center

    div.v-text-field__details, label
      /* get rid of the field's help text - it's a tiny field that's associated with the slider. We still attach a label
      to the input field though for accessibility reasons*/
      hide_accessibly()

  /* remove the up/down arrows on number inputs on webkit browsers */
  .sc_slider_value_input input[type="number"]::-webkit-outer-spin-button,
  .sc_slider_value_input input[type="number"]::-webkit-inner-spin-button
    -webkit-appearance:none;
    margin: 0;

  /* remove the up/down arrows on number inputs on mozilla/gecko browsers */
  .sc_slider_value_input input[type="number"]
    -moz-appearance: textfield;


  div.v-messages
    /* We won't be using messages on each item here, so let's hide it to avoid the extra spacing it creates */
    display: none

</style>