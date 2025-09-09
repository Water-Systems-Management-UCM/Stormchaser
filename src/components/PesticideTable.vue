<template>
  <v-container>
    <v-card
      title="Pesticide Data for crop by county"
      flat
    >
      <template v-slot:text>
        <v-text-field
          v-model="table_search"
          label="County Name"
          prepend-inner-icon="mdi-magnify"
          variant="outlined"
          hide-details
        ></v-text-field>
      </template>

      <v-data-table
        :density="density_toggle"
        :headers="table_headers"
        :items="filtered_table_data"
        :search="table_search"
        :items-per-page="10"
        class="elevation-1"
        sort-desc
        multi-sort
        :sort-by="sort_arr"
        hover
      ></v-data-table>
    </v-card>
  </v-container>

</template>

<script>
import {defineComponent} from 'vue'
import SimpleTooltip from "./SimpleTooltip.vue";
import pesticide_data from '../assets/pest_crop_groups_090825.json'

export default defineComponent({
  name: "PesticideTable",
  components: {SimpleTooltip},
  props: {
    density_toggle: String,
    filters: Array, // [Crops, Data include, Region]
  },
  data(){
    return {
      table_headers: [
        {title: "County", value: "county"},
        {title: "Crop Group", value: "crop_group"},
        {title: "Amount Used (lbs)", value: "amount_used_lbs"}
      ],
      county_list: pesticide_data["county"],
      filtered_table_data: pesticide_data,
      table_search: "",
      sort_arr: ['county', 'crop_group', 'amount_used_lbs']
    }
  },
  watch: {
    filters(){
      if(this.filters[0].length > 0){
        this.filtered_table_data = []; // reset the already showing results

        for(let i = 0; i < pesticide_data.length; i++){
          // Look through the pesticide data for matching results of what is selected in filters
          if(this.filters[0].find(filter => {
            // console.log("DEBUG", filter.text, pesticide_data[i].crop_group)
            if( (filter.text === 'Almonds' || filter.text === 'Pistachios') && (pesticide_data[i].crop_group === 'Almonds and Pistachios') ){
              return true
            } else if(filter.text === pesticide_data[i].crop_group){
              return true
            }
          })){
            this.filtered_table_data.push(pesticide_data[i]);
          }
        }
      }else {
        this.filtered_table_data = pesticide_data;
      }

    },
  },
})
</script>
<style scoped lang="stylus">

</style>