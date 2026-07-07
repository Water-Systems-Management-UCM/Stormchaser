<template>
<div>
   <div class="crop-list">

    <!-- TOP 3 WITH BARS -->
    <div
      v-for="item in top_crops"
      :key="item.crop"
      class="crop-row top"
    >
      <span class="crop-name">
        {{ item.crop }}
      </span>

      <div class="bar-container">
        <div
          class="bar"
          :style="{ width: get_bar_width(item.value) }"
        >
        </div>
      </div>

      <span class="crop-value">
        {{ no_fractions_number_formatter.format(item.value) }}
        {{ get_variable_units() }}
      </span>
    </div>

    <!-- OTHER CROPS (TEXT ONLY) -->
    <div
      v-for="item in other_crops"
      :key="item.crop"
      class="crop-row simple"
    >
      <span class="crop-name">
        {{ item.crop }}
      </span>

      <span class="crop-value">
        {{ no_fractions_number_formatter.format(item.value) }}
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
      const source = region_arr || this.region_data;
      const cropMap = new Map();

      for (const item of source) {
        const cropName = this.$store.getters.get_crop_name_by_id(item.crop);
        const value = Number(item[this.map_variable]) || 0;

        cropMap.set(
          cropName,
          (cropMap.get(cropName) || 0) + value
        );
      }

      this.crops_data = Array.from(cropMap, ([crop, value]) => ({
        crop,
        value
      })).sort((a, b) => b.value - a.value);
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
    top_crops() {
      return this.crops_data.slice(0, 3);
    },
    other_crops() {
      return this.crops_data.slice(3);
    },
    max_value() {
      if (!this.top_crops.length) return 1;
      return Math.max(...this.top_crops.map(c => c.value));
    }
  },


})

</script>

<style scoped lang="stylus">
  .compact-list .row {
    display: grid;
    grid-template-columns: repeat(2, 2fr); /* 2 columns */
    gap: 4px 12px;
    font-size: 12px;
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
    grid-template-columns: 1fr 120px 140px;
    align-items: center;
    gap: 15px;
    font-size: 12px;

  }

  .crop-row.simple {
    grid-template-columns: 1fr 140px;
    text-decoration underline
  }

  .crop-value {
    text-align: right;
    font-size: 12px;
    font-weight: 600;
    white-space: nowrap;
  }



    /* TOP 3 */
  .crop-row.top .bar-container {
    width: 100%;
    height: 8px;
    background: #e0e0e0;
    border-radius: 4px;
    overflow: hidden;

  }

  .crop-row.top .bar {
    height: 100%;
    background: #4CAF50;
  }



  .crop-name {
    font-weight: 500;
  }

  .bar-container {
    height: 8px;
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



</style>