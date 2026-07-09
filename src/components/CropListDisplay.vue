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
          :class="item.percent_change >= 0 ? 'bar-positive' : 'bar-negative'"
          :style="{ width: get_bar_width(item.percent_change) }"
        >
        </div>
      </div>

      <span class="crop-value">
        {{ no_fractions_number_formatter.format(item.value) }}
        {{ get_variable_units() }}
        <span
          class="crop-change"
          :class="item.percent_change >= 0 ? 'change-positive' : 'change-negative'"
        >
          {{ get_percent_display(item) }}
        </span>
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
        <span
          class="crop-change"
          :class="item.percent_change >= 0 ? 'change-positive' : 'change-negative'"
        >
          {{ get_percent_display(item) }}
        </span>
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
    base_case_data: {
      type: Array,
      default: () => []
    },
  },

  data(){
    return {
      crops_data: [],
      base_crop_data: [],
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
        this.get_base_case_region_crop()

        this.crops_data.sort((a, b) => b.value - a.value)
      }
    },
    base_case_data: {
      deep: true,
      immediate: true,
      handler() {
        this.get_base_case_region_crop()
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
    get_crop_breakdown_base_case(region_arr){
      // Clearing to get latest region's crop list
      this.base_crop_data = []
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

      this.base_crop_data = Array.from(cropMap, ([crop, value]) => ({
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
    get_bar_width(percent_change) {
      // Bar fills based on magnitude of change, capped at 100%
      const magnitude = Math.min(Math.abs(percent_change), 100);
      return `${magnitude}%`;
    },
    get_percent_display(item) {
      if (item.is_new) return 'New';
      if (item.is_removed) return '-100%';
      const sign = item.percent_change >= 0 ? '+' : '';
      return `${sign}${item.percent_change.toFixed(1)}%`;
    },
    get_base_case_region_crop(){
      this.get_crop_breakdown_base_case(this.base_case_data)
    },
  },

  computed:{
    region_value() {
      if (!this.crops_data.length) return 1;
        return this.crops_data.reduce((sum, crop) => sum + Number(crop.value), 0);
    },
    crop_diff(){
      // Merge current crops with base case values and compute percent change
      return this.crops_data.map(item => {
        const base = this.base_crop_data.find(b => b.crop === item.crop);
        const base_value = base ? Number(base.value) : 0;
        const current_value = Number(item.value);

        let percent_change = 0;
        let is_new = false;
        let is_removed = false;

        if (base_value === 0) {
          if (current_value === 0) {
            percent_change = 0;
          } else {
            percent_change = 100;
            is_new = true;
          }
        } else if (current_value === 0) {
          percent_change = -100;
          is_removed = true;
        } else {
          percent_change = ((current_value - base_value) / base_value) * 100;
        }

        return {
          crop: item.crop,
          value: item.value,
          base_value,
          percent_change,
          is_new,
          is_removed,
        };
      });
    },
    top_crops() {
      return this.crop_diff.slice(0, 3);
    },
    other_crops() {
      return this.crop_diff.slice(3);
    },
    max_value() {
      if (!this.top_crops.length) return 1;
      return Math.max(...this.top_crops.map(c => c.value));
    },
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
    display: flex;
    align-items: center;
    justify-content: flex-end;
    gap: 6px;
  }

  .crop-change {
    font-size: 11px;
    font-weight: 700;
    padding: 1px 6px;
    border-radius: 10px;
    white-space: nowrap;
  }

  .change-positive {
    color: #1b7a1b;
    background: rgba(76, 175, 80, 0.15);
  }

  .change-negative {
    color: #c62828;
    background: rgba(244, 67, 54, 0.15);
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
    border-radius: 4px;
    transition: width 0.3s ease;
  }

  .bar-positive {
    background: #4CAF50;
  }

  .bar-negative {
    background: #f44336;
  }



</style>