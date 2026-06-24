<template>
<!--  <v-list density="compact">-->
<!--    <v-list-item-->
<!--      v-for="item in crops_data"-->
<!--      :key="item.crop"-->
<!--    >-->
<!--      <v-list-item-title class="d-flex justify-space-between">-->
<!--        <span>{{ item.crop }}</span>-->
<!--        <span>{{ item.value.toLocaleString() }}</span>-->
<!--      </v-list-item-title>-->
<!--    </v-list-item>-->
<!--  </v-list>-->
  <div class="compact-list">
  <div
    v-for="item in crops_data"
    :key="item.crop"
    class="row"
  >
    <span>{{ item.crop }}</span>
<!--    <span>{{ item.value.toLocaleString() }}</span>-->
  </div>
</div>


</template>

<script>

import {defineComponent} from "vue";

export default defineComponent({
  name: 'CropListDisplay',

  props: {
    region_data: {
      type: Array,
      default: () => []
    },
    map_variable: String,
  },

  data(){
    return {
      crops_data: []
    }
  },

  watch: {
    region_data: {
      deep: true,
      immediate: true,
      handler(newVal) {
        console.log("DEB region_data", newVal, "isArray:", Array.isArray(newVal))

        if (!Array.isArray(newVal) || newVal.length === 0) {
          this.crops_data = []
          return
        }

        this.get_crop_breakdown(newVal)
      }
    },
  },

  methods:{
    get_crop_breakdown(region_arr){
      // Clearing to get latest region's crop list
      this.crops_data = []
      if(region_arr){
        for( let i = 0; i < region_arr.length; i++){
          const crop_pair = {'crop': this.$store.getters.get_crop_name_by_id(region_arr[i].crop), 'value': region_arr[i][this.map_variable]};
          this.crops_data.push(crop_pair)
        }
      } else{
        for( let i = 0; i < this.region_data.length; i++){
          const crop_pair = {'crop': this.$store.getters.get_crop_name_by_id(this.region_data[i].crop), 'value': this.region_data[i][this.map_variable]};
          this.crops_data.push(crop_pair)
        }
      }
    },
  },

  computed:{

  },


})

</script>

<style scoped lang="stylus">
  .compact-list .row {
    display: grid;
    grid-template-columns: repeat(2, 1fr); /* 2 columns */
    gap: 4px 12px;
    font-size: 12px;
  }
  .row {
    display: flex;
    justify-content: space-between;
  }

</style>