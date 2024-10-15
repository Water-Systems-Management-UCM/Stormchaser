<template>
    <div class="stormcard_range_slider">
      <span class="v-label theme--light">
        {{ label }}
        <SimpleTooltip
          v-if="tooltip_message"
        >{{ tooltip_message }}</SimpleTooltip>
      </span>
        <v-slider
            v-if="!upper_limit"
            v-model="slider_value[0]"
            :label="label"
            :modelValue="initial_value[0]"
            :min="min"
            :max="max"
            color="blue"
            tick-size="5"
            track-fill-color="grey"
            track-color="blue"
        >
          <template v-slot:prepend>
            <v-icon
                @click="decrement_lower_slider_value"
                :title="`Decrement Lower Value for ${label}`"
                :alt="`Decrement Lower Value for ${label}`"
            >
              mdi-minus
            </v-icon>
            <v-text-field
                :label="label"
                v-model="slider_value_input[0]"
                class="sc_slider_value_input"
                @blur="update_slider"
            ></v-text-field>
            <v-icon
                @click="increment_lower_slider_value"
                :title="`Increment Lower Value for ${label}`"
                :alt="`Increment Lower Value for ${label}`"
            >
              mdi-plus
            </v-icon>
          </template>
          <template v-slot:append>
            <a @click="activate_upper_limit">Add Upper Limit</a>
          </template>
        </v-slider>
        <v-range-slider
                v-if="upper_limit"
                v-model="slider_value"
                :label="label"
                :min="min"
                :max="current_max"
                :modelValue=initial_value
                color="blue"
                track-color="grey"
        >
            <!-- prepend and append templates taken from the v-slider doc examples -->
            <template v-slot:prepend>
              <v-icon
                  @click="decrement_lower_slider_value"
                  :title="`Decrement Lower Value for ${label}`"
                  :alt="`Decrement Lower Value for ${label}`"
              >
                mdi-minus
              </v-icon>
              <v-text-field
                  :label="label"
                  v-model="slider_value_input[0]"
                  class="sc_slider_value_input"
                  @blur="update_slider"
                  :rules="[is_numeric]"
              ></v-text-field>
              <v-icon
                  @click="increment_lower_slider_value"
                  :title="`Increment Lower Value for ${label}`"
                  :alt="`Increment Lower Value for ${label}`"
              >
                mdi-plus
              </v-icon>
            </template>
            <template v-slot:append>
              <v-icon
                  @click="decrement_upper_slider_value"
                  :title="`Decrement Upper Value for ${label}`"
                  :alt="`Decrement Upper Value for ${label}`"
              >
                mdi-minus
              </v-icon>
              <v-text-field
                  v-model="slider_value_input[1]"
                  class="sc_slider_value_input"
                  @blur="update_slider"
                  :rules="[is_numeric]"
              ></v-text-field>
                <v-icon
                        @click="increment_upper_slider_value"
                        :title="`Increment Upper Value for ${label}`"
                        :alt="`Increment Upper Value for ${label}`"
                >
                    mdi-plus
                </v-icon>
                <v-icon
                    @click="remove_upper_limit"
                    :title="`Remove Upper Limit for ${label}`"
                    :alt="`Remove Upper Limit for ${label}`"
                >
                  mdi-delete
                </v-icon>
            </template>
        </v-range-slider>
    </div>
</template>

<script>
import { defineComponent } from 'vue';

import SimpleTooltip from './SimpleTooltip.vue';
export default defineComponent({
  name: 'StormCardRangeSlider',
  components: { SimpleTooltip, },

  props:{
      modelValue: Array,  // for v-model support, named it value
      label: String,
      tooltip_message: String,
      min: Number,
      max: Number,
      initial_value: Array,
  },

  data: function(){
      return {
          slider_value: this.initial_value,
          slider_value_input: this.initial_value,
          upper_limit: false,
          current_max: null,
      };
  },

  methods:{
      is_numeric: function(n){ // via http://stackoverflow.com/questions/9716468/ddg#9716488
        return !isNaN(parseFloat(n)) && isFinite(n);
      },
      update_slider: function(){
        // we really just need to copy the input values to the slider values, but we'll do some validation first
        // to make sure the input is numeric, and that it's in bounds - otherwise weird things happen
        if(!this.is_numeric(this.slider_value_input[0]) || this.slider_value_input[0] < this.min || this.slider_value_input[0] > this.max) {
          this.slider_value_input[0] = this.slider_value[0]
        }
        if(!this.is_numeric(this.slider_value_input[1]) || this.slider_value_input[1] < this.min || this.slider_value_input[1] > this.max){
          this.slider_value_input[1] = this.slider_value[1]
        }

        this.slider_value = this.slider_value_input;
      },
      activate_upper_limit: function(){
        this.slider_value = [this.slider_value[0], this.max] // set the whole array to trigger the watcher
        //this.slider_value_input = [this.slider_value[0], this.slider_value[1]];
        this.current_max = this.max
        this.upper_limit = true
      },
      remove_upper_limit: function(){
        this.upper_limit = false
        this.slider_value = [this.slider_value[0], null]  // set the whole array to trigger the watcher
        //this.slider_value_input = [this.slider_value[0], this.slider_value[1]];
        this.current_max = null
      },
      increment_lower_slider_value: function(){
          // can't just increment/decrement - the watchers don't get updated then. Could probably do object.assign or something instead though
          this.slider_value = [this.slider_value[0]+1, this.slider_value[1]];
          //this.slider_value_input = [this.slider_value[0], this.slider_value[1]];
      },
      decrement_lower_slider_value: function(){
          this.slider_value = [this.slider_value[0]-1, this.slider_value[1]];
          //this.slider_value_input = [this.slider_value[0], this.slider_value[1]];
      },
      increment_upper_slider_value: function(){
          this.slider_value = [this.slider_value[0], this.slider_value[1]+1];
          //this.slider_value_input = [this.slider_value[0], this.slider_value[1]];
      },
      decrement_upper_slider_value: function(){
          this.slider_value = [this.slider_value[0], this.slider_value[1]-1];
      },
  },

  watch: {
      slider_value() {
          this.slider_value_input = [this.slider_value[0], this.slider_value[1]];
          this.$emit('update:modelValue', this.slider_value);
          this.$emit('userchanged');
      }
  },
});
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