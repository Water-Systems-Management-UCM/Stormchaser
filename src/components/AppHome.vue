<template>
  <v-flex row>
    <v-flex xs12 lg6>
      <v-card class="home_card">
        <router-link :to="{ name: 'make-model-run'}">Make a New Model Run</router-link>
      </v-card>
    </v-flex>
    <v-flex xs12 lg6>
      <v-card class="home_card">
        <router-link :to="{ name: 'list-model-runs'}">View Existing Model Runs</router-link>
      </v-card>
    </v-flex>
  </v-flex>
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