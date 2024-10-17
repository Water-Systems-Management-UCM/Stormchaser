<template>
  <v-container class="mx-auto">
    <h1>{{ $store.getters.current_model_area.name }} Home</h1>
    <v-row class="mx-auto">
      <v-col class="col-12 col-md-4" v-if="$store.getters.current_model_area.preferences.create_or_modify_model_runs">
        <v-card class="home_card">
          <RouterLink :to="{ name: 'make-model-run'}"><v-icon>mdi-account-hard-hat</v-icon> Make a New Model Run</RouterLink>
        </v-card>
      </v-col>
      <v-col class="mx-auto">
        <v-card class="home_card">
          <RouterLink :to="{ name: 'list-model-runs'}"><v-icon>mdi-format-list-text</v-icon> View Existing Model Runs</RouterLink>
        </v-card>
      </v-col>
      <v-col class="col-12 col-md-4" v-if="$store.getters.current_model_area.length > 0">
        <v-card class="home_card">
          <RouterLink :to="{ name: 'input-data-viewer'}"><v-icon>mdi-database</v-icon> Input Data Viewer</RouterLink>
        </v-card>
      </v-col>
    </v-row>
    <v-row >
      <InputDataViewer></InputDataViewer>
    </v-row>
  </v-container>
</template>

<script>
import { defineComponent } from 'vue';

import InputDataViewer from './InputDataViewer.vue';
export default defineComponent({
  name: 'AppHome',
  components: {InputDataViewer},
});
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