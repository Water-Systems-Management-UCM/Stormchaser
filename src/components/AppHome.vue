<template>
  <v-container>
    <v-row row>
      <v-col class="col-xs-12 col-md-6">
        <v-card class="home_card">
          <router-link :to="{ name: 'make-model-run'}">Make a New Model Run</router-link>
        </v-card>
      </v-col>
      <v-col class="col-xs-12 col-md-6">
        <v-card class="home_card">
          <router-link :to="{ name: 'list-model-runs'}">View Existing Model Runs</router-link>
        </v-card>
      </v-col>
    </v-row>
    <v-row row>
      <v-col class="col-xs-12 col-md-6">
        <v-card class="home_card">
          <router-link :to="{ name: 'data-viewer'}">Input Data Viewer</router-link>
        </v-card>
      </v-col>
    </v-row>
  </v-container>
</template>

<script>
export default {
name: "AppHome"
}
</script>

<style lang="stylus">
.home_card
  margin: 1em
  padding:2em
  text-align: center
  font-size: 1.15em

</style>