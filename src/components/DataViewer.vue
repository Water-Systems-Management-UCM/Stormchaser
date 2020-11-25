<template>
  <v-container>
    <v-row>
      <h2>Model Input Data</h2>
    </v-row>
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
        <template v-slot:item.p="{ item }"> <!-- `$${Number(Math.round(Number(item.p + "e2")) + "e-2")}` -->
          <span class="price">{{ `$${Math.round(Number(item.p))}` }}</span>
        </template>
        <template v-slot:item.omegaland="{ item }"> <!-- `$${Number(Math.round(Number(item.p + "e2")) + "e-2")}` -->
          <span class="price">{{ `$${Math.round(Number(item.omegaland))}` }}</span>
        </template>
        <template v-slot:item.omegasupply="{ item }"> <!-- `$${Number(Math.round(Number(item.p + "e2")) + "e-2")}` -->
          <span class="price">{{ `$${Math.round(Number(item.omegasupply))}` }}</span>
        </template>
        <template v-slot:item.omegalabor="{ item }"> <!-- `$${Number(Math.round(Number(item.p + "e2")) + "e-2")}` -->
          <span class="price">{{ `$${Math.round(Number(item.omegalabor))}` }}</span>
        </template>
        <template v-slot:item.omegatotal="{ item }"> <!-- `$${Number(Math.round(Number(item.p + "e2")) + "e-2")}` -->
          <span class="price">{{ `$${Math.round(Number(item.omegatotal))}` }}</span>
        </template>
        <template v-slot:item.y="{ item }"> <!--  -->
          <span class="yield">{{ `${Number(Math.round(Number(item.y + "e2")) + "e-2")}` }}</span>
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
          {text: "Region", value:"region" //, filter: function(value){
              //if (value === null){
              //  return true
              //}
              //return value.toLowerCase() === window.stormchaser.$store.getters.current_model_area.regions[this.region].name.toLowerCase()
            //}
          }, //, filter: function(value){
              //return value === window.stormchaser.$store.getters.get_region_name_by_id(this.region).toLowerCase();
            //}},
          {text: "Crop Group", value:"crop"},
          {text: "Year", value:"year"},
          {text: "Price ($/ton)", value:"p", filterable: false},
          {text: "Yield (ton/ac)", value:"y", filterable: false},
          {text: "Land Cost ($/ac)", value:"omegaland", filterable: false},
          {text: "Supply Cost ($/ac)", value:"omegasupply", filterable: false},
          {text: "Labor Cost ($/ac)", value:"omegalabor", filterable: false},
          {text: "Total Cost ($/ac)", value:"omegatotal", filterable: false},
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