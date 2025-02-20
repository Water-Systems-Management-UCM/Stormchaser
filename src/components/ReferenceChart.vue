<template>
  <v-row>

    <h3 id="legend_title"><b>Reference Chart</b></h3>
    <p class="display_map_item">{{legend_display}}</p>
    <div class="value_content">
      <span id="min_value" class="map_min">{{min_value}}</span>
      <span id="max_value" class="map_max">{{max_value}}</span>
    </div><br>
    <div>
      <Plotly ref="plot" :data="md" :layout="plot_layout"></Plotly>
    </div>
    <!--    <div class="gradient-bar" :style="{ background: gradientStyle }" ></div>-->
  </v-row>

</template>

<script>

import {defineComponent} from "vue";
import Plotly from "@aurium/vue-plotly";

export default  defineComponent({
  name: "ReferenceChart",

  components: {
    Plotly,
  },
  props:{
    legend_display: String,
    min_value: Number,
    max_value: Number,
    md: Array,
  },
  data(){
    return{
      base_case: this.$store.getters.base_case_results,
    }
  },


  mounted() {
  },

  computed: {
    plot_layout: function(){
      let layout = {
        type: 'bar',
        xaxis: {
          hoverformat: '.4s'
        },
        yaxis: {
          hoverformat: '.4s',
          title: {
            text: "this.y_axis_title", // Add the title for the Y-axis here
            }
        },
        margin:{
          l: 50,
          t: this.chart_title === null ? 15 : 50,
        },
        title: {
          text: this.chart_title,
        },
      };
      if(this.md.length === 1){
        // if we have just one series, it's the current model run - make sure it's always orange. When we
        // have two or more, base is always blue
        layout['marker'] = {color: this.plot_colors}
      }
      if (this.stacked){
        layout['barmode'] = 'stack';
      }
      return layout;
    },
  },

  watch:{},

  methods: {},

})


</script>

<style scoped lang="stylus">

</style>