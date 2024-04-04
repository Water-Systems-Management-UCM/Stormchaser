<template>
  <v-container>
    <h1>{{ $store.getters.current_model_area.name }} Home</h1>
    <v-row row>
      <v-col class="col-12 col-md-4" v-if="$store.getters.current_model_area.preferences.create_or_modify_model_runs">
        <v-card class="home_card">
          <router-link :to="{ name: 'make-model-run'}"><v-icon>mdi-account-hard-hat</v-icon> Make a New Model Run</router-link>
        </v-card>
      </v-col>
      <v-col class="col-12 col-md-4">
        <v-card class="home_card">
          <router-link :to="{ name: 'list-model-runs'}"><v-icon>mdi-format-list-text</v-icon> View Existing Model Runs</router-link>
        </v-card>
      </v-col>
      <v-col class="col-12 col-md-4" v-if="$store.getters.current_model_area.input_data.length > 0">
        <v-card class="home_card">
          <router-link :to="{ name: 'input-data-viewer'}"><v-icon>mdi-database</v-icon> Input Data Viewer</router-link>
        </v-card>o
      </v-col>
    </v-row>
    <v-row v-if="$store.getters.current_model_area.input_data.length > 0">
      <InputDataViewer></InputDataViewer>
    </v-row>
  </v-container>
</template>

<script>
import InputDataViewer from "./InputDataViewer.vue";
export default {
  name: "AppHome",
  components: {InputDataViewer},
}
</script>

<style lang="stylus">
.home_card
  margin: 0em
  padding:1em
  text-align: center
  font-size: 1.15em

  a
    text-decoration: none

h1, h2
  font-weight: normal
</style>