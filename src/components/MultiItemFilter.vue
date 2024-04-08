<template>
  <div>
    <v-autocomplete
        v-model="shared_state.selected_rows"
        :items="input_rows"
        :label="get_label"
        :item-value="item_value"
        :item-text="item_text"
        return-object
        persistent-hint
        clearable
        multiple
        chips
        deletable-chips
        small-chips
        :solo="solo"
    ></v-autocomplete>
    <v-switch
        v-model="shared_state.filter_mode_exclude"
        v-if="excludable"
        :label="`Exclude Selected ${base_label_text}`"
    >
      <template v-slot:label>
        Exclude Selected Regions
        <SimpleTooltip
        >By default, the chart shows the results of all regions, and if you choose one or more regions, it
          shows the aggregated results of those regions. By activating this toggle (switch), you invert the regions it shows.
          When nothing is selected, it will still show everything, but as you choose regions with this toggle activated, it will remove those regions
          from the results shown in the chart, so the chart shows all regions except those you have chosen. Can be useful
          for looking at the impact of a few regions, then switching the toggle on so you can see what the rest of the modeled area
          looks like without those same regions.</SimpleTooltip></template>
    </v-switch>
  </div>
</template>

<script>
import { defineComponent } from 'vue';
/* METAMORPH_START */



































import SimpleTooltip from './SimpleTooltip.vue';
//import _ from "lodash";

export default defineComponent({
  name: 'MultiItemFilter',

  components: {
    SimpleTooltip,
  },

  props: {
    shared_state: { // So, this looks bad and like the wrong way to do this (as opposed to bubbling data to parent component with events), but my recollection is that I tried that for this and it didn't work (but maybe I then did it wrong?) - wish I'd commented then!
      type: Object,
      default: function(){
        return {
          selected_rows: [],
          filter_mode_exclude: false,
        };
      }
    },
    input_rows: Array,
    item_text: String,
    item_value: String,
    base_label_text: String,
    solo: {
      type: Boolean,
      default: true
    },
    excludable: {
      type:Boolean,
      default: true
    },
    empty_text: {
      type: String,
      default: 'Any'
    }
  },

  data:function(){
    return {
      updating: false
    };
  },

  watch: {
    shared_state: {
      deep:true,
      handler: function(){
        if(this.updating === false){  // basically a debounce to prevent infinite loops of updates
          this.updating = true;
          this.update_excluded()
          let _this = this;
          setTimeout(function(){_this.updating = false;}, 500); // I don't like this, it feels wrong, but the multiple instances with shared states feed back on each other otherwise. Seems like there should be a better way
        }
      }
    }
  },

  methods: {
    run_update(){
      this.update_excluded()
    },
    update_excluded(){
      // if filter_chart_selected_regions_mode is false, we're in include mode not exclude mode.
      if(this.shared_state.filter_mode_exclude === false){
        this.shared_state.filter_selected_exclude = []
        return;
      }

      // created the inverted selection = filter all the regions and find the ones that aren't in the selected regions list
      this.shared_state.filter_selected_exclude = this.input_rows.filter(reg => !this.shared_state.selected_rows.some(sel_reg => sel_reg.id === reg.id))
    },
  },

  computed:{
    get_label: function(){
      if(this.shared_state.selected_rows.length === 0 && this.empty_text){
        return this.empty_text
      }
      return this.shared_state.filter_mode_exclude ? `Exclude these ${this.base_label_text}` : `Include these ${this.base_label_text}`
    },
  },
});
</script>

<style scoped>


</style>