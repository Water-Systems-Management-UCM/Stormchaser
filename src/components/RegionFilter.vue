<template>
  <div class="sc_region_filter">
    <h4>Filter Regions</h4>
    <v-expansion-panels accordion>
      <v-expansion-panel>
        <v-expansion-panel-title>
          Regions&nbsp;<span v-if="region_selection_info.selected_rows.length > 0">({{ region_selection_info.selected_rows.length }})</span>
        </v-expansion-panel-title>
        <v-expansion-panel-text>
          <MultiItemFilter
              :shared_state="region_selection_info"
              :input_rows="regions"
              item_text="name"
              item_value="id"
              base_label_text="Regions"
              :solo="false"
              :excludable="false"
          ></MultiItemFilter>
        </v-expansion-panel-text>
      </v-expansion-panel>
      <v-expansion-panel
        v-if="$store.getters.current_model_area.region_group_sets.length > 0"
      >
        <v-expansion-panel-title>
          Region Groups&nbsp;<span v-if="region_group_selection_info.selected_rows.length > 0">({{ region_group_selection_info.selected_rows.length }})</span>
        </v-expansion-panel-title>
        <v-expansion-panel-text>
          <MultiItemFilter
              :shared_state="region_group_selection_info"
              :input_rows="Object.values($store.getters.current_model_area.region_groups)"
              item_text="name"
              item_value="id"
              base_label_text="Region Groups"
              :solo="false"
              :excludable="false"
          ></MultiItemFilter>
        </v-expansion-panel-text>
      </v-expansion-panel>
      <v-expansion-panel>
        <v-expansion-panel-title>
          <span v-if="region_selection_info.filter_mode_exclude === false"><em>Inclusion</em>/Exclusion Mode</span>
          <span v-if="region_selection_info.filter_mode_exclude === true">Inclusion/<em>Exclusion</em> Mode</span>
        </v-expansion-panel-title>
        <v-expansion-panel-text>
          <v-switch
              v-model="region_selection_info.filter_mode_exclude"
              label="Exclude Selected Regions"
          >
            <template v-slot:label>
              Exclude Selected Regions
              <SimpleTooltip>
                By default, the chart shows the results of all regions, and if you choose one or more regions, it
                shows the aggregated results of those regions. By activating this toggle (switch), you invert the regions it shows.
                When nothing is selected, it will still show everything, but as you choose regions with this toggle activated, it will remove those regions
                from the results shown in the chart, so the chart shows all regions except those you have chosen. Can be useful
                for looking at the impact of a few regions, then switching the toggle on so you can see what the rest of the modeled area
                looks like without those same regions.</SimpleTooltip>
            </template>
          </v-switch>
        </v-expansion-panel-text>
      </v-expansion-panel>
    </v-expansion-panels>
  </div>
</template>

<script>
import { defineComponent } from 'vue';

import MultiItemFilter from './MultiItemFilter.vue';
import SimpleTooltip from './SimpleTooltip.vue';
import clonedeep from 'lodash';

export default defineComponent({
  name: 'RegionFilter',

  components: {
    MultiItemFilter,
    SimpleTooltip
  },

  props: {
    region_selection_info: Object,
    regions: Array,
    region_groups: Array,
  },

  data: function(){
    return {
      region_group_selection_info: {
        selected_rows: [],
        filter_selected_exclude: [],
        filter_mode_exclude: false,
        current_selection: function(){
          return this.filter_mode_exclude ? this.filter_selected_exclude : this.selected_rows
        }
      }
    };
  },

  watch: {
    'region_group_selection_info.selected_rows': {
      handler: function(new_version, old_version){
        // when it changes, we need to update the selected regions accordingly

        console.log('Old selection')
        console.log(old_version)
        console.log('New selection')
        console.log(new_version)

        // find the ones that are added - find the ones in the new version that weren't in the old version
        let adds = new_version.filter(item => old_version.findIndex(old_item => item.id === old_item.id) < 0)

        // same with removes - find the ones in the old version that aren't in the new version
        let removes = old_version.filter(item => new_version.findIndex(new_item => item.id === new_item.id) < 0)

        // This may all be the super wrong way to do this - might not trigger anything reactive. May need
        // to bubble changes up with events, etc, because otherwise watchers don't notice? The "shared_state" object
        // is a bit bad here and might be strained to its limits...
        // it could be that we end up with a similar function that starts with the selected regions (copied to a new object),
        // then does everything here, then emits an event with the new set of selected regions attached - then DataViewer sets
        // that value?
        let selected_regions = clonedeep(this.region_selection_info.selected_rows)

        console.log('Initial Selected Regions')
        console.log(selected_regions)

        console.log('Removes')
        console.log(removes)
        console.log('Adds')
        console.log(adds)

        let _this = this;
        // process removes first, then add any "adds" back in
        // removes should deselect regions that were in the groups being removed.
        if(removes){
          removes.forEach(function(group){
            let group_members = _this.$store.getters.current_model_area.region_groups[group.id].regions
            group_members.forEach(function(remove_region){
              let location = selected_regions.findIndex(region => region.id === remove_region.id)
              selected_regions.splice(location, 1);
            })

          })
        }

        // adds should select regions in the groups we're adding
        if(adds){
          adds.forEach(function(group){
            let group_members = _this.$store.getters.current_model_area.region_groups[group.id].regions
            group_members.forEach(function(add_region){
              if(!selected_regions.includes(add_region)){
                selected_regions.push(_this.$store.getters.current_model_area.regions[add_region])
              }
            })
          })
        }

        console.log('Final Selected Regions')
        console.log(selected_regions)

        this.$emit('selected-regions', selected_regions)
        // if all regions are selected, set it so no regions are selected for simplicity of the filter,
        // but will this create problems if they then go remove a group? Yes, it will...
        //if(this.region_selection_info.selected_rows.length === this.$store.getters.current_model_area.region_set.length){
        //  _this.region_selection_info.selected_rows = []; //
        //}
      }
    }
  },
});
</script>

<style scoped>
</style>