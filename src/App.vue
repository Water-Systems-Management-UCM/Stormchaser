<template>
  <div id="stormchaser">
    <v-app>
      <v-container fluid>
          <MakeModelRun></MakeModelRun>
      </v-container>
    </v-app>
  </div>
</template>

<script>
import MakeModelRun from "@/components/MakeModelRun";
import Vue from 'vue';
import Vuetify from "vuetify";

Vue.use(Vuetify)


export default {
  name: 'stormchaser',
  components: {
    MakeModelRun,
  },
  vuetify: new Vuetify(),
  data: function() {
    return {}
  },
  beforeMount(){ // https://stackoverflow.com/questions/40714319/how-to-call-a-vue-js-function-on-page-load
    console.log("Fetching variables");
    this.$store.dispatch("fetch_variables") // .then(this.load, this.load_failed);
  },
  methods: {
    load: function(){
      console.log("Variables fetched");
      this.$store.dispatch("fetch_regions");
    },
    load_failed: function(){
      console.log("Failed to fetch variables");
    }
  }
}
</script>

<style>
#app {
  font-family: Avenir, Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  color: #2c3e50;
}
</style>
