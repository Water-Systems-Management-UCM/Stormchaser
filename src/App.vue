<template>
  <div id="stormchaser">
    <v-app>
      <v-container fluid>
        <v-navigation-drawer
                v-model="nav_drawer"
                clipped
                floating
                light
                absolute
                temporary>
          <v-list>
            <v-list tile><router-link :to="{name: 'make-model-run'}">New Model Run</router-link></v-list>
            <v-list tile><router-link :to="{name: 'list-model-runs'}">My Model Runs</router-link></v-list>
          </v-list>
        </v-navigation-drawer>
        <v-btn
                color="pink"
                dark
                icon
                @click.stop="nav_drawer = !nav_drawer"
        >
          menu
        </v-btn>
        <router-view></router-view>
      </v-container>
    </v-app>
  </div>
</template>

<script>
// import MakeModelRun from "@/components/MakeModelRun";
import vuetify from '@/plugins/vuetify' // path to vuetify export

export default {
  name: 'stormchaser',
  components: {  },
  vuetify: vuetify,
  data: function() {
    return {
      "nav_drawer": null,
    }
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
