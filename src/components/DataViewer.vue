<template>
  <v-container>
    <v-row>
      <v-data-table
          :headers="table_headers"
          :items="model_data"
          item-key="id"
          multi-sort
          sort-by="region,crop,year"
          sort-desc
          class="elevation-1"
          :search="table_search"
          items-per-page=50
      >
        <template v-slot:top>
          <v-text-field
              v-model="table_search"
              label="Search"
              class="mx-4"
          ></v-text-field>
        </template>
        <template v-slot:item.region="{ item }">
          <span class="region_name">{{ $store.getters.get_region_name_by_id(item.region) }}</span>
        </template>
        <template v-slot:item.crop="{ item }">
          <span class="crop_name">{{ $store.getters.get_crop_name_by_id(item.crop) }}</span>
        </template>
        <template v-slot:item.p="{ item }">
          <span class="price">{{ `$${Number(Math.round(Number(item.p + "e2")) + "e-2")}` }}</span>
        </template>
      </v-data-table>
    </v-row>
  </v-container>
</template>

<script>
export default {
  name: "DataViewer",
  props:{
    model_area_id: Number,
  },
  data: function(){
      return {
        table_search: "",
        table_headers: [
          {text: "Region", value:"region"}, //, filter: function(value){
              //return value === window.stormchaser.$store.getters.get_region_name_by_id(this.region).toLowerCase();
            //}},
          {text: "Crop", value:"crop"},
          {text: "Year", value:"year"},
          {text: "Price", value:"p", filterable: false},
          {text: "Yield", value:"y", filterable: false},
          {text: "Total Cost", value:"omegatotal", filterable: false},
          {text: "Land Cost", value:"omegaland", filterable: false},
          {text: "Supply Cost", value:"omegasupply", filterable: false},
          {text: "Labor Cost", value:"omegalabor", filterable: false},
          {text: "Establishment Cost", value:"omegaestablish", filterable: false},
        ]
      }
  },
  computed: {
    model_data: function(){
      return this.$store.getters.current_model_area.input_data[0].input_data_set
    }
  }
}

</script>

<style >

</style>