<template>
  <div class="sc_summary_container">
    <div class="sc_summary_table" v-if="has_multipliers">
      <p class="warning stormchaser_missing_multipliers_warning"
         v-if="records_missing_multipliers > 0"
      >
        <v-icon>warning</v-icon>
        Warning: Some records do not have indirect, value add, or employment data. Estimates may be lowered as a result.
      </p>
      <v-row>
        <v-col class="col-12 sc-help_block sc-help_tall" v-if="filter_region_selection_info.selected_rows.length > 0">
          Note: You have filtered the results to specific regions, region
          groups, or crops and the summary values shown here reflect those filters. To see summary totals
          for the entire model, remove all filters.
        </v-col>
        <v-col class="col-12">
          <v-table
              class="elevation-1"
              id="sc_results_summary_table">
            <thead>
            <tr style="line-height:1" class="sc_results_summary_header_1">
              <th>Model Run</th>
              <th colspan="2">Revenue</th>
              <th colspan="2">Value Add</th>
              <th colspan="2">Jobs</th>
              <th>Land</th>
              <th>Water</th>
            </tr>
            <tr class="sc_results_summary_header_2">
              <th></th>
              <th>Direct</th>
              <th>Total</th>
              <th>Direct</th>
              <th>Total</th>
              <th>Direct</th>
              <th>Total</th>
              <th>(acres)</th>
              <th>(acre-feet)</th>
            </tr>
            </thead>
            <tbody>
            <tr>
              <td>This Model Run</td>
              <td>{{ format_currency(summary_data.gross_revenue) }}</td>
              <td>{{ format_currency(summary_data.total_revenue) }}</td>
              <td>{{ format_currency(summary_data.direct_value_add) }}</td>
              <td>{{ format_currency(summary_data.total_value_add) }}</td>
              <td>{{ no_fractions_number_formatter.format(summary_data.direct_jobs) }}</td>
              <td>{{ no_fractions_number_formatter.format(summary_data.total_jobs) }}</td>
              <td>{{ no_fractions_number_formatter.format(summary_variable_data.xlandsc) }}</td>
              <td>{{ no_fractions_number_formatter.format(summary_variable_data.xwatersc) }}</td>
            </tr>

            <tr v-for="model_run in selected_comparisons"
                :key="model_run.id">
              <td>Compared to <em>{{ model_run.name }}</em></td>
              <td v-for='attr in [["gross_revenue", "direct gross revenue", format_currency],
                                  ["total_revenue", "total gross revenue", format_currency],
                                  ["direct_value_add", "direct value add", format_currency],
                                  ["total_value_add", "total value add", format_currency],
                                  ["direct_jobs", "direct jobs", format_no_fractions],
                                  ["total_jobs", "total jobs", format_no_fractions],
                                  ["xlandsc", "land in production", format_no_fractions],
                                  ["xwatersc", "applied water", format_no_fractions]]
                         '
                  :key="attr[0]">
                <SimpleTooltip :text="get_and_format_comparison_value(attr[0], model_run.id, attr[2])"
                               :text_only="true">{{ get_comparison_text(attr[0], model_run, attr[2], attr[1])}}</SimpleTooltip>
              </td>
            </tr>
            </tbody>

          </v-table>

        </v-col>
      </v-row>
    </div>
    <div class="sc_summary" v-if="!has_multipliers"> <!-- if we don't have multipliers, still show them revenues -->
      <p>Total Gross Revenue: {{ format_currency(summary_data[0].direct) }}</p>
    </div>
  </div>
</template>
<script>
import { defineComponent } from 'vue';

import SimpleTooltip from './SimpleTooltip.vue';

export default defineComponent({
  name: 'SummaryTable',
  components: {SimpleTooltip},

  props: {
    filter_region_selection_info: {},
    format_currency: {},
    no_fractions_number_formatter: {},
    multipliers: {},
    map_variables: {},
    full_data_filtered: {},
    selected_comparisons: {},
    selected_comparisons_full_filtered: {},
    model_run: {
      default: {},
    }
  },

  data(){
    return {
      records_missing_multipliers: 0,  // how many records don't have multiplier values?
      multiplier_names: ['gross_revenue', 'total_revenue', 'direct_value_add', 'total_value_add', 'direct_jobs', 'total_jobs'],
    };
  },

  methods: {
    format_no_fractions(value){
      return this.no_fractions_number_formatter.format(value)
    },
    get_comparison_value(attribute, model_run_id){
      console.log("summ ", this.summary_comparison_data[model_run_id])
      if(['xlandsc', 'xwatersc'].includes(attribute)){
        return this.summary_variable_data[attribute] - this.summary_variable_comparison_data[model_run_id][attribute]
      }
      return this.summary_data[attribute] - this.summary_comparison_data[model_run_id][attribute]
    },
    get_and_format_comparison_value(attribute, model_run_id, formatter){
      return formatter(this.get_comparison_value(attribute, model_run_id))
    },
    get_comparison_text(attribute, model_run, formatter, label){
      let val = this.get_comparison_value(attribute, model_run.id)
      if (val < 0){
        return `This model run, "${this.model_run.name}", has ${formatter(Math.abs(val))} less ${label} than the model run "${model_run.name}" (considering active filters)`
      }else if(val > 0){
        return `This model run, "${this.model_run.name}", has ${formatter(Math.abs(val))} more ${label} than the model run "${model_run.name}" (considering active filters)`
      }else{
        return `This model run, "${this.model_run.name}", has the same ${label} as the model run "${model_run.name}" (considering active filters)`
      }
    },
    get_empty_region_multipliers(){
      // return an empty object of multipliers if they weren't found at all
      let mults = this.multiplier_names.reduce((mults, name) => (mults[name] = 0, mults), {})
      mults['gross_revenue'] = 1
      return mults
    },
    get_multipliers(region_id, crop_id){
      let region_multipliers = this.multipliers[region_id]  // get the multipliers for the region
      if(region_multipliers === null || region_multipliers === undefined){
        this.records_missing_multipliers++;
        return this.get_empty_region_multipliers()
      }

      let crop_keys = Object.keys(region_multipliers);
      let multipliers;  // now, if we only have one item and its key is undefined, then the model area has region-level multipliers. If it has more keys, then they're region and crop keyed
      if(crop_keys.length < 2 && ('undefined' in region_multipliers || 'null' in region_multipliers)){  // note the keys are strings
        multipliers = region_multipliers['null'];
      }else{
        multipliers = region_multipliers[crop_id]
      }

      let _this = this;
      multipliers['gross_revenue'] = 1;

      // make sure they're all numerical
      this.multiplier_names.forEach(function(mult){
        if(multipliers[mult] !== null && multipliers[mult] !== undefined) {
          multipliers[mult] = Number(multipliers[mult])  // set a value here so that a missing record isn't invalidating the rest of the math, we'll display a warning message
        }
      })

      // now check that all the individual keys are defined - if not, we'll mark a missing multiplier before returning
      this.multiplier_names.forEach(function(mult){
        if(multipliers[mult] === null || multipliers[mult] === undefined) {
          _this.records_missing_multipliers++;
          multipliers[mult] = 0  // set a value here so that a missing record isn't invalidating the rest of the math, we'll display a warning message
          return multipliers; // return immediately so that we only mark it as missing once for the record
        }
      })

      return multipliers
    },
    get_summary_for_filtered_records(results){
      /* this function is similar to the accumulator that breaks things out by region in DataViewer, but just gives a total instead,
      * which nets a much simpler bit of code because we're just summing the variables independently
       */
      let accumulator = {}

      // console.log("results",results)
      // console.log("testing [23][0]", results[23][0].rainfall_set);

      this.map_variables.forEach(function(variable){ // initialize the accumulator. We can simplify this expression
        accumulator[variable.key] = results[23][0].rainfall_set.reduce((total, obj) => Number(obj[variable.key]) + total, 0)
      })
      return accumulator //results.reduce(this.reduce_results_to_totals, accumulator)
    },
    get_summary_data: function(data){
      let result_accumulator = this.get_empty_region_multipliers()

      let _this = this;
      data.reduce(function(accumulator, result){
        let multipliers = _this.get_multipliers(result.region, result.crop);
        _this.multiplier_names.forEach(function(mult){
          accumulator[mult] += result.gross_revenue * multipliers[mult]
        })
        return accumulator
      }, result_accumulator)


      /*  The following was how we returned it when using the v-data-table component. Now we're doing it manually, so
          take a different approach

        let revenues = {name: "Revenue", direct: result_accumulator["gross_revenue"], indirect: result_accumulator["total_revenue"]}
        let value_add = {name: "Value Add", direct: result_accumulator["direct_value_add"], indirect: result_accumulator["total_value_add"]}
        let employment = {name: "Jobs", direct: result_accumulator["direct_jobs"], indirect: result_accumulator["total_jobs"]}

        return [revenues, value_add, employment]
       */
      return result_accumulator;

    }
  },

  computed: {
    has_multipliers: function(){
      return this.$store.getters.current_model_area.region_set.some(region => 'multipliers' in region && region.multipliers !== null);
    },
    summary_data: function(){
      return this.get_summary_data(this.full_data_filtered)
    },
    summary_comparison_data: function(){
      let _this = this;
      let obj = {}
      this.selected_comparisons_full_filtered.forEach(function(model_run){
        let filtered = model_run.results[0].result_set;
        obj[model_run.id] = _this.get_summary_data(filtered);
      })
      return obj
    },
    summary_variable_data: function(){  // land and water summaries for summary tab
      return this.get_summary_for_filtered_records(this.full_data_filtered)
    },

    summary_variable_comparison_data: function(){
      let _this = this;
      let obj = {}
      this.selected_comparisons_full_filtered.forEach(function(model_run){
        let filtered = model_run.results[0].result_set;
        obj[model_run.id] = _this.get_summary_for_filtered_records(filtered);
      })
      return obj
    },
  },
});
</script>
<style lang="stylus">
hide_accessibly()
  /* Position offscreen, rather than displaying None so that screen readers still see it */
  position: absolute !important;
  top: -9999px !important;
  left: -9999px !important;

.warning.stormchaser_missing_multipliers_warning
  padding: 1em
  background-color: #fcee22 !important
  border: 1px solid #baa923 !important

#sc_results_summary_table
  th
    height:auto;

  th, td
    text-align:center;

  .sc_results_summary_header_1
    th
      padding:1em !important;
  .sc_results_summary_header_2
    th
      padding-bottom: 1em;


</style>