<template>
  <div>
    <v-autocomplete
        v-model="value"
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
        v-model="filter_mode_exclude"
        v-if="excludable"
        :label="`Exclude Selected ${base_label_text}`"
    >
      <template v-slot:label>
        Exclude Selected Regions
        <SimpleTooltip
            message="By default, the chart shows the results of all regions, and if you choose one or more regions, it
                    shows the aggregated results of those regions. By activating this toggle (switch), you invert the regions it shows.
                    When nothing is selected, it will still show everything, but as you choose regions with this toggle activated, it will remove those regions
                    from the results shown in the chart, so the chart shows all regions except those you have chosen. Can be useful
                    for looking at the impact of a few regions, then switching the toggle on so you can see what the rest of the modeled area
                    looks like without those same regions."
        ></SimpleTooltip></template>
    </v-switch>
  </div>
</template>

<script>
import SimpleTooltip from "@/components/SimpleTooltip";

export default {
  name: "MultiItemFilter",
  components: {
    SimpleTooltip,
  },
  props: {
    value: Array,
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
      default: "Any"
    }
  },
  data: function(){
    return {
      filter_selected_exclude: [],
      filter_mode_exclude: false,
    }
  },
  watch: {
    value: {
      handler: function() {
        this.run_update()
      },
    },
    filter_mode_exclude: {
      handler: function () {
        this.run_update()
      }
    }
  },
  methods: {
    run_update(){
      this.update_excluded()
      this.$emit('input',this.filter_mode_exclude ? this.filter_selected_exclude : this.value)
      this.$emit('stormchaser-multi-item-select-info', {
        exclude_mode: this.filter_mode_exclude,
        selection_length: this.value.length
      })
    },
    update_excluded(){
      // if filter_chart_selected_regions_mode is false, we're in include mode not exclude mode.
      if(!this.filter_mode_exclude){
        return;
      }

      // created the inverted selection = filter all the regions and find the ones that aren't in the selected regions list
      this.filter_selected_exclude = this.input_rows.filter(reg => !this.value.some(sel_reg => sel_reg.id === reg.id))
    },
  },
  computed:{
    get_label: function(){
      if(this.value.length === 0 && this.empty_text){
        return this.empty_text
      }
      return this.filter_mode_exclude ? `Exclude these ${this.base_label_text}` : `Include these ${this.base_label_text}`
    }
  }
}
</script>

<style scoped>

</style>