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
        <v-tooltip bottom
                   max-width="30em"
        >
          <template v-slot:activator="{ on, attrs }">
            <v-icon
                style="margin-left: 0.5em"
                v-bind="attrs"
                v-on="on">info</v-icon>
          </template>
          <span role="tooltip">{{ settings.show_organization_model_runs_tooltip }}</span>
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
          <v-tooltip bottom
                     max-width="30em"
          >
            <template v-slot:activator="{ on, attrs }">
              <v-icon
                  style="margin-left: 0.5em"
                  v-bind="attrs"
                  v-on="on">info</v-icon>
            </template>
            <span role="tooltip">{{ settings.dense_tables_tooltip }}</span>
          </v-tooltip>
      </v-col>

    </v-row>
  </v-container>
</template>

<script>

export default {
  name: "Settings",
  data: function(){
    return {
      ready: false,
      settings: {}
    }
  },
  mounted(){
    let _this = this;
    Object.keys(this.$store.state.user_profile).forEach(function(key){
      _this.$set(_this.settings, key, _this.$store.state.user_profile[key]);
    })
    setTimeout(function(){_this.ready = true;}, 200)
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