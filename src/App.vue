<template>
  <div id="stormchaser">
    <v-app>
      <v-container fluid>
        <v-navigation-drawer
                v-model="nav_drawer"
                clipped
                absolute
                color="primary"
                dark
                temporary>
          <v-list class="navigation_items">
            <v-list-item tile>
              <router-link :to="{name: 'make-model-run'}">
                <v-list-item-icon>
                  <v-icon>mdi-account-hard-hat</v-icon>
                </v-list-item-icon>
                New Model Run
              </router-link>
            </v-list-item>
            <v-list-item tile>
              <router-link :to="{name: 'list-model-runs'}">
                <v-list-item-icon>
                  <v-icon>mdi-format-list-text</v-icon>
                </v-list-item-icon>
                My Model Runs
              </router-link>
            </v-list-item>
          </v-list>
        </v-navigation-drawer>
        <v-btn
                color="pink"
                dark
                icon
                @click.stop="nav_drawer = !nav_drawer"
        >
          <v-icon>menu</v-icon>
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

<style lang="stylus">
#app
  font-family: Avenir, Helvetica, Arial, sans-serif
  -webkit-font-smoothing: antialiased
  -moz-osx-font-smoothing: grayscale
  color: #2c3e50

/* Navigation */
aside.v-navigation-drawer

  div.navigation_items
    div.v-list-item
      padding: 0

    a
      display: block
      width: 100%
      padding: 0 1em
      margin-top: 0
      border-bottom: 2px solid rgba(0,0,0,0.1)
      text-decoration: none
      color: #fff

    a.router-link-active
      background-color: rgba(255,255,255, 0.25)

/* Cards */
.storm_card
  margin: 0.5em 1em
  padding: 1em

  .remove_card
    position:absolute
    top: 1em
    right: 1em

</style>
