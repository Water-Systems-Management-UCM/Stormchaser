<template>
  <v-container class="mx-auto">
    <h1>{{ $store.getters.current_model_area.name }} Home</h1>
    <v-row class="mx-auto">
                                                                                                                          <!-- This should be temporary  -->
      <v-col class="col-12 col-md-4" v-if="$store.getters.current_model_area.preferences.create_or_modify_model_runs && !$store.getters.current_model_area.background_code === 'cali'">
<!--        <v-card class="home_card" >-->
          <RouterLink :to="{ name: 'make-model-run'}">
            <v-card class="home_card">
              <v-icon>mdi-account-hard-hat</v-icon> Make a New Model Run
            </v-card>
          </RouterLink>

<!--        </v-card>-->
      </v-col>
      <v-col class="mx-auto" v-if="!$store.getters.current_model_area.background_code === 'cali'">
          <RouterLink :to="{ name: 'list-model-runs'}">
            <v-card class="home_card">
              <v-icon>mdi-format-list-text</v-icon> View Existing Model Runs
            </v-card>
          </RouterLink>
      </v-col>
      <v-col class="mx-auto" v-if="$store.getters.current_model_area.background_code === 'cali'">
          <RouterLink :to="{ name: 'model-run-parse'}">
            <v-card class="home_card">
              <v-icon>mdi-format-list-text</v-icon> Table View
            </v-card>
          </RouterLink>
      </v-col>
<!--      <v-col class="col-12 col-md-4" v-if="$store.getters.current_model_area.length > 0">-->
<!--        <v-card class="home_card">-->
<!--          <RouterLink :to="{ name: 'input-data-viewer'}"><v-icon>mdi-database</v-icon> Input Data Viewer</RouterLink>-->
<!--        </v-card>-->
<!--      </v-col>-->
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
    margin: 0
    padding:4em
    text-align: center
    font-size: 1.35em

  a
    text-decoration: none
  .v-col a div i{
    padding: 1em
  }
h1, h2
  font-weight: normal
</style>