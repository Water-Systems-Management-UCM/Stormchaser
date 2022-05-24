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
        <SimpleTooltip>{{ settings.show_organization_model_runs_tooltip }}</SimpleTooltip>
      </v-col>
      <v-col class="col-11 col-md-6">
          <v-switch
              v-model="settings.dense_tables"
              label="Reduce spacing in tables"
          >
          </v-switch>
      </v-col>
      <v-col class="col-1 col-md-6">
          <SimpleTooltip>{{ settings.dense_tables_tooltip }}</SimpleTooltip>
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
        <v-expansion-panel-header>Display Net Revenue</v-expansion-panel-header>
        <v-expansion-panel-content>
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
            <v-btn
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
            <v-col class="col-1 col-md-6">
              <SimpleTooltip>{{ settings.show_net_revenues_tooltip }}</SimpleTooltip>
            </v-col>
          </v-row>
        </v-expansion-panel-content>
      </v-expansion-panel>
    </v-expansion-panels>
  </v-container>
</template>

<script>

import SimpleTooltip from "@/components/SimpleTooltip";1

export default {
  name: "Settings",
  components: {SimpleTooltip},
  data: function(){
    return {
      ready: false,
      settings: {},
      enable_net_revenue_settings: false
    }
  },
  mounted(){
    let _this = this;
    Object.keys(this.$store.state.user_profile).forEach(function(key){
      _this.$set(_this.settings, key, _this.$store.state.user_profile[key]);
    })
    setTimeout(function(){_this.ready = true;}, 200)
  },
  computed:{
    net_revenue_available_on_a_model_area: function(){
      /* Check if any model areas have net revenue enabled so that we only show those settings if they're relevant to the user */
      return Object.values(this.$store.state.model_areas).some(ma => ma.preferences.include_net_revenue)
    },
    show_net_revenue_settings: function(){
      return this.enable_net_revenue_settings || this.$store.getters.net_revenue_enabled
    }
  },
  watch:{
    settings: {
      deep: true,
      handler() {
        if (this.ready) {  // don't save/update user profile data when this changes during setup
          this.$store.commit("set_user_profile", this.settings);
          this.$store.dispatch("save_user_profile");
        }
      }
    }
  }
}
</script>

<style scoped>

</style>