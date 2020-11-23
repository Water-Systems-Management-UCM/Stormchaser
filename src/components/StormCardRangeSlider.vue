<template>
    <div class="stormcard_range_slider">
      <span class="v-label theme--light">{{ label }}</span>
        <v-range-slider
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
                  @click="decrement_lower_slider_value"
              >
                remove
              </v-icon>
              <v-text-field
                  :label="label"
                  v-model="slider_value[0]"
                  class="sc_slider_value_input"></v-text-field>
              <v-icon
                  @click="increment_lower_slider_value"
              >
                add
              </v-icon>
            </template>
            <template v-slot:append>
              <v-icon
                  @click="decrement_upper_slider_value"
              >
                remove
              </v-icon>
              <v-text-field
                  v-model="slider_value[1]"
                  class="sc_slider_value_input"></v-text-field>

                <v-icon
                        @click="increment_upper_slider_value"
                >
                    add
                </v-icon>
            </template>
        </v-range-slider>
    </div>
</template>

<script>
    export default {
        name: "StormCardRangeSlider",
        props:{
            value: Array,  // for v-model support, named it value
            label: String,
            min: Number,
            max: Number,
            initial_value: Array,
        },
        data: function(){
            return {
                slider_value: this.initial_value
            }
        },
        methods:{
            increment_lower_slider_value: function(){
                // can't just increment/decrement - the watchers don't get updated then. Could probably do object.assign or something instead though
                this.slider_value = [this.slider_value[0]+1, this.slider_value[1]];
            },
            decrement_lower_slider_value: function(){
                this.slider_value = [this.slider_value[0]-1, this.slider_value[1]];
            },
            increment_upper_slider_value: function(){
              this.slider_value = [this.slider_value[0], this.slider_value[1]+1];
            },
            decrement_upper_slider_value: function(){
              this.slider_value = [this.slider_value[0], this.slider_value[1]-1];
            },
        },
        watch: {
            slider_value() {
                this.$emit('input', this.slider_value);
            }
        }
    }
</script>

<style lang="stylus">
hide_accessibly()
  /* Position offscreen, rather than displaying None so that screen readers still see it */
  position: absolute !important;
  top: -9999px !important;
  left: -9999px !important;

.stormcard_range_slider
  label.v-label
    /* get rid of the field's help text - it's a tiny field that's associated with the slider. We still attach a label
    to the input field though for accessibility reasons*/
    hide_accessibly()

  .v-input.v-input--range-slider .v-input__slot,
  .v-input.v-input--range-slider .v-input__prepend-outer,
  .v-input.v-input--range-slider .v-input__append-outer
    margin-top: 0 !important
    margin-bottom: 0 !important

  .sc_slider_value_input, .v-input__control
    width:3em
    margin: 0
    padding: 0

    div.v-text-field__details
      display:none

    div, input
      /* get rid of extra spacing so that this and the -/+ buttons for incrementing it align */
      margin: 0
      padding: 0
      text-align: center

  div.v-messages
    /* We won't be using messages on each item here, so let's hide it to avoid the extra spacing it creates */
    display: none

</style>