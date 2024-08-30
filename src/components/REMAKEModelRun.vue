<template>
  <NotificationSnackbar
    v-model="model_run_info_snackbar"
    :aria-errormessage="model_run_info_snackbar_text"
    :constant_snackbard_text="model_run_info_snackbar_constant_text">
  </NotificationSnackbar>

  <div>
    testing div
  </div>

</template>

<script setup>
import { defineComponent, onMounted, computed, ref } from 'vue';
import NotificationSnackbar from './NotificationSnackbar.vue';
import SimpleTooltip from './SimpleTooltip.vue';

export default {
  name: 'ModelRuns',
  props: [],

  setup(context){
    const model_run_info_snackbar = ref(false);
    const model_run_info_snackbar_constant_text = ref('');
    const model_run_info_snackbar_text = ref('')
    return {
      model_run_info_snackbar,
      model_run_info_snackbar_constant_text,
      model_run_info_snackbar_text
    }
  },

  methods: {
    start_editing_element(element){
      document.getElementById(element).focus()
    },
    async update_title_and_description(){
      console.log('title or description edited');

      // get the title field DOM element
      let title_field = document.getElementById('model_run_name');
      let new_name = title_field.textContent  // get the text content for the field
      title_field.innerText = this.waterspout_data.name;  // replace it with the new name as text so that any newlines are removed and it's consistent with what's sent to the server

      // get the description - we'll do this as HTML
      let new_description = document.getElementById('model_run_description').innerText;

      await this.$store.dispatch('update_model_run_name_and_description', {id: this.waterspout_data.id, name: new_name, description: new_description})
      this.update_model_run()  // after it's done, update the model run again from the server to make sure we show
                              // the user what's consistent with what's on the server (e.g. if the update succeeds/fails
                              // we can do this a different way where we check what's coming back, but this is easiest to code/maintain

    },
    update_loop(){
      let _this = this;
      this.update_model_run()
      setTimeout(function() {
        if (!_this.has_results) {
          _this.update_loop()
        }
      }, 10000) // wait 10 seconds so we can get results back and not hit the server repeatedly. Then check if we already have results and run an update if not
    },
    edit_text(text_choice, text_key){
      console.log('edit text executed')
      let new_text = this.$event.target.value

      this[text_choice] = false;

      this.$store.dispatch('save_text_edit', this.waterspout_data.id, text_key, new_text)
    },
    // these aren't great ways to handle this - we should have these get stored in a Object keyed by ID or something
    download_csv_results(){
      let drop_fields = ['year']
      if(this.$store.getters.net_revenue_enabled === false){
        drop_fields.push('net_revenue');
      }
      this.$stormchaser_utils.download_array_as_csv({data: this.results.result_set,
        filename: this.context.download_name,
        lookups: this.context.download_results_lookups,
        drop_fields: drop_fields,
      })
    },
    download_csv_rainfall(){
      this.$stormchaser_utils.download_array_as_csv({data: this.results.rainfall_result_set,
        filename: 'rainfall_' + this.download_name,
        lookups: this.download_results_lookups,
      })
    },
    download_csv_input_regions(){
      this.$stormchaser_utils.download_array_as_csv({data: this.waterspout_data.region_modifications,
        filename: this.download_name_region_mods,
        lookups: this.download_results_lookups,
        drop_fields: ['id'],
      })
    },
    download_csv_input_crops(){
      this.$stormchaser_utils.download_array_as_csv({data: this.waterspout_data.crop_modifications,
        filename: this.download_name_crop_mods,
        lookups: this.download_results_lookups,
        drop_fields: ['id'],
      })
    },
    get_crop_name_by_id: function (id) {
      return this.$store.getters.get_crop_name_by_id(id)
    },
    get_crop_code_by_id: function (id) {
      if (id === null){
        return 'All Crops';
      }
      return this.$store.getters.current_model_area.crops[id].crop_code
    },
    update_model_run: function () {
      // re-fetches this model run from the server in case we have new results - doesn't run automatically,
      // but is used in a polling fashion
      let _this = this;
      this.$store.dispatch('get_model_run_with_results', this.waterspout_data.id)
          .then(function (model_run) {
            _this.waterspout_data = model_run;
          });
      setTimeout(function(){  // clear the toggle so it doesn't keep this highlighted
        _this.button_toggle_not_used = []
      }, 500)
    },
    begin_delete_self: function() {
      // first handler for deleting the run - sets a flag that makes the CSS change and makes a second click of
      // the button use perform_delete_self. After a timeout of 5 seconds, resets the flag so the CSS returns to
      // its base state and this function becomes the handler again
      this.delete_process_active = true;
      let _this = this;
      setTimeout(function(){
        _this.delete_process_active = false
        _this.button_toggle_not_used = []
      }, 5000);
    },
    perform_delete_self: function () {
      // Runs the actual deletion of model runs - only triggered if begin_delete_self has already been run (which
      // makes this the handler for the next click

      // set up the snackbar
      this.model_run_info_snackbar_constant_text = 'Failed to delete model run'

      // Don't even try to delete base cases
      if (this.waterspout_data.is_base) {
        this.model_run_info_snackbar_text = 'Can\'t delete base cases'
        this.model_run_info_snackbar = true;
        return;
      }

      // otherwise, try to delete it
      let _this = this;
      let request = this.$store.dispatch('delete_model_run', this.waterspout_data);
      request.then(response => {
            if (response.ok) {
              _this.$store.dispatch('fetch_model_runs')  // refresh the model run list if we delete one
              _this.$router.push({name: 'list-model-runs'})  // then go to the list
            } else {
              console.log(response);
              console.log(response.json());
              _this.model_run_info_snackbar_text = 'Server rejected model deletion. See console (F12) for details. This error has been reported.'
              _this.model_run_info_snackbar = true;
            }
          }
      ).catch(error => {
        _this.model_run_info_snackbar_text = `Unknown error - please try again later: ${error}`;
        _this.model_run_info_snackbar = true;
      })
    },
    get_generic_scatter_layout: function(x_title, y_title){
      return {
        hovermode: 'closest', // make it snap to the nearest point
        xaxis: {
          title: x_title
        },
        yaxis: {
          title: y_title
        },
        margin: {
          t: 15,
        }
      };
    },
    get_scatter_data: function(params){
        let x = [];
        let y = [];
        let item_name = [];

        params.modifications.forEach(function(item){
          x.push(item[params.x_value]);
          y.push(item[params.y_value]);
          item_name.push(params.lookup_function(item[params.lookup_attribute]));
        });
        return [{
          x: x,
          y: y,
          text: item_name,
          marker: {size: 12},
          mode: 'markers',
          type: 'scatter',
          hovertemplate: '<b>%{text}</b><br>' +   // make it display the region name and both value
              '<b>' + params.x_title + '</b>: %{x}<br>' +
              '<b>' + params.y_title + '</b>: %{y}<extra></extra>',  // the extra tag prevents it from labeling traces on hover
        }];
      },
  },
  update_loop(){
      let _this = this;
      this.update_model_run()
      setTimeout(function() {
        if (!_this.has_results) {
          _this.update_loop()
        }
      }, 10000) // wait 10 seconds so we can get results back and not hit the server repeatedly. Then check if we already have results and run an update if not
    },

}


</script>

<style scoped lang="stylus">

</style>