<template>
  <v-container>
    <v-row>
      <h2>Settings</h2>
    </v-row>
    <v-row>
      <h3>Model Run Lists</h3>
    </v-row>
    <v-row v-if="ready">
      <v-col class="col-11 col-md-6">
        <v-switch
          v-model="settings.show_organization_model_runs"
          label="Show model runs created by anyone in my organization"
        >
        </v-switch>
      </v-col>
      <v-col class="col-1 col-md-6">
        <v-tooltip
            text="By default, the application shows all model runs from within your organization and gives you the option to temporarily show only your model runs.
            This setting changes that behavior so that, by default, you only see model runs that you created yourself and then you can temporarily change the listing to see all model runs in your organization."
            width="450px"
        >
          <template v-slot:activator="{ props }">
              <v-icon
                icon="mdi-information"
                v-bind="props">
              </v-icon>
          </template>
        </v-tooltip>
      </v-col>

      <v-col class="col-11 col-md-6">
          <v-switch
              v-model="settings.dense_tables"
              label="Reduce spacing in tables"
          >
          </v-switch>
      </v-col>
      <v-col class="col-1 col-md-6">
          <v-tooltip
            text="Use less spacing in tables to see more data on screen at the same time"
            width="450px"
          >
            <template v-slot:activator="{ props }">
              <v-icon
                  icon="mdi-information"
                  v-bind="props">
              </v-icon>
            </template>
          </v-tooltip>
      </v-col>

      <v-col class="col-1 col-md-6">
          <SimpleTooltip>{{ settings.dense_tables_tooltip }}</SimpleTooltip>
      </v-col>

    </v-row>

    <v-row>
       <v-col class="col-12 col-md-6">
        <v-switch
            v-model="settings.show_map_popup"
            label="Display map information on a text popup when hovering over a region."
        >
        </v-switch>
      </v-col>
      <v-col class="col-1 col-md-6">

      </v-col>
    </v-row>

    <v-row
        v-if="net_revenue_available_on_a_model_area">
        <!-- WARNING! Need to change this v-if if we add more settings that aren't related to net revenue below it -->
      <h3>Model Run Display</h3>
    </v-row>
    <v-expansion-panels
        accordion
        style="margin-top: 1em;"
        v-if="net_revenue_available_on_a_model_area"
    >
      <v-expansion-panel>
        <v-expansion-panel-title>Display Net Revenue</v-expansion-panel-title>
        <v-expansion-panel-text>

          <v-row v-if="ready && !show_net_revenue_settings" style="padding:1em">
            <p>OpenAg is designed to output gross revenues for comparisons to their base case. While the model does take into
            account profitability when estimating cropping decisions and revenues, net revenues are calculated <em>after</em>
            the model is run and may include artifacts or inaccuracies due to the method of calculation. Extreme care should
            be used in interpreting the results, and you should read the full documentation about how net revenues are
            calculated and the limitations in interpretation of the values before enabling display of net revenue data.</p>

            <p><a :href="$store.state.docs_urls.model_runs.net_revenue_limitations" target="_blank">Open Net Revenue Limitations Documentation</a></p>
          </v-row>
          <v-row v-if="ready && !show_net_revenue_settings" style="padding:1em">
            <p>
            <v-btn v-if="ready && !show_net_revenue_settings"
              @click="enable_net_revenue_settings = true"
            >I Have Read the Documentation Page. Show Net Revenue Settings.
            </v-btn>
            </p>
          </v-row>
          <v-row v-if="ready && show_net_revenue_settings">
            <v-col class="col-11 col-md-6">
              <v-switch
                  v-model="settings.show_net_revenues"
                  label="Show net revenue in results, when available"
              >
              </v-switch>
            </v-col>
            <v-col class="col-1 col-md-6" >
              <v-tooltip
                  text="Display net revenues in model results when available for a model.
                      Net revenues are difficult to interpret correctly. See documentation for more before using net revenue data."
                  width="450px"
              >
                <template v-slot:activator="{ props }">
                    <v-icon
                      icon="mdi-information"
                      v-bind="props">
                    </v-icon>
                </template>
              </v-tooltip>
            </v-col>
          </v-row>
        </v-expansion-panel-text>
      </v-expansion-panel>

    </v-expansion-panels>
<!--    <v-col class="col-6 col-md-6">-->
<!--        <v-switch-->
<!--          v-model="settings.bulk_create"-->
<!--          label="Enable bulk create model runs"-->
<!--        >-->
<!--        </v-switch>-->

<!--      </v-col>-->
<!--    <v-col class="col-11 col-md-6">-->

<!--      </v-col>-->
    <v-row style="padding-top: 20px; padding-bottom: 20px">
        <!-- WARNING! Need to change this v-if if we add more settings that aren't related to net revenue below it -->
      <h3>Reset Password</h3>
    </v-row>
        <v-btn
          ><router-link :to="{name: 'Reset-Password'}">Change Password</router-link>
        </v-btn>
  </v-container>
</template>

<script>
import { defineComponent } from 'vue';

import SimpleTooltip from './SimpleTooltip.vue';

export default defineComponent({
  name: 'Settings',
  components: {SimpleTooltip},

  data: function(){
    return {
      ready: false,
      settings: {},
      enable_net_revenue_settings: false,
      show_map_popup: Boolean,
    };
  },

  mounted(){
    let _this = this;
    Object.keys(this.$store.state.user_profile).forEach(function(key){
      _this.settings[key] = _this.$store.state.user_profile[key];
    })
    setTimeout(function(){_this.ready = true;}, 200)
    _this.show_map_popup = _this.$store.getters.map_popup_enabled
  },

  computed:{
    net_revenue_available_on_a_model_area: function(){
      /* Check if any model areas have net revenue enabled so that we only show those settings if they're relevant to the user */
      return Object.values(this.$store.state.model_areas).some(ma => ma.preferences.include_net_revenue)
    },
    show_net_revenue_settings: function(){
      return this.enable_net_revenue_settings || this.$store.getters.net_revenue_enabled
    },
  },

  watch:{
    settings: {
      deep: true,
      handler() {
        if (this.ready) {  // don't save/update user profile data when this changes during setup
          console.log("in settings saving", this.ready)
          this.$store.commit('set_user_profile', this.settings);
          this.$store.dispatch('save_user_profile');
        }
      }
    }
  },
});
</script>

<style scoped>
</style>