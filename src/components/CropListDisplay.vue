<template>
<div class="compact-list">
  <div class="crop-list">
    <div
      v-for="item in crops_data"
      :key="item.crop"
      class="crop-row"
    >
      <span class="crop-name">{{ item.crop }}</span>

      <div class="bar-container">
        <div
          class="bar"
          :style="{ width: get_bar_width(item.value) }"
        >
        </div>
      </div>

      <span class="crop-value">
        {{ no_fractions_number_formatter.format(item.value) }}
<!--        {{get_percent(item.value)}}-->
        {{ get_variable_units() }}
      </span>
    </div>
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
      crops_data: [],
      no_fractions_number_formatter: new Intl.NumberFormat(navigator.languages, { maximumFractionDigits: 0, maximumSignificantDigits: 1}),
    }
  },

  watch: {
    region_data: {
      deep: true,
      immediate: true,
      handler(newVal) {
        if (!Array.isArray(newVal) || newVal.length === 0) {
          this.crops_data = []
          return
        }

        this.get_crop_breakdown(newVal)

        this.crops_data.sort((a, b) => b.value - a.value)
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
    get_variable_units: function(){
      // Display units used in crop value pair
      switch (this.map_variable) {
        case 'net_revenue':
        case 'gross_revenue':
          return '$ USD';

        case 'xland':
        case 'xlandsc':
          return 'ac'

        case 'xwater':
        case 'xwatersc':
          return '(ac/ft)'
      }
      return ''
    },
      get_bar_width(value) {
        if (!this.region_value) return "0%";
          return `${(value / this.region_value) * 100}%`;
      },
      get_percent(value) {
        if (!this.region_value) return "0%";
        return `${((value / this.region_value) * 100).toFixed(1)}%`;
      }
  },

  computed:{
    region_value() {
      if (!this.crops_data.length) return 1;
        return this.crops_data.reduce((sum, crop) => sum + Number(crop.value), 0);
    },
  },


})

</script>

<style scoped lang="stylus">
  .compact-list .row {
    display: grid;
    grid-template-columns: repeat(3, 1fr); /* 2 columns */
    gap: 4px 12px;
    font-size: 12px;
    text-decoration: underline
  }
  .row {
    display: flex;
    justify-content: space-between;
  }
  .crop-list {
    display: flex;
    flex-direction: column;
    gap: 8px;
    width: 100%;
  }

  .crop-row {
    display: grid;
    grid-template-columns: 90px 1fr 80px;
    align-items: center;
    gap: 10px;
  }

  .crop-name {
    font-weight: 500;
  }

  .bar-container {
    height: 8px;
    width: 110px;
    background: #989393;
    border-radius: 4px;
    overflow: hidden;
  }

  .bar {
    height: 100%;
    background: #070505;
    border-radius: 4px;
    transition: width 0.3s ease;
  }

  .crop-value {
    text-align: right;
    font-size: 12px;
    font-weight: 600;
  }

</style>