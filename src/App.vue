<template>
  <div id="stormchaser">
    <v-app>

      <v-container
          v-if="is_logged_in"
          fluid>
        <v-navigation-drawer
                v-model="nav_drawer"
                clipped
                absolute
                temporary
                color="primary"
                dark
                mini-variant.sync="true"
        >
          <v-list nav class="navigation_items">
            <v-list-item
                link
                @click="navigate({name: 'make-model-run'})"
            >
                <v-list-item-icon>
                  <v-icon>mdi-account-hard-hat</v-icon>
                </v-list-item-icon>
                <v-list-item-content>
                  New Model Run
                </v-list-item-content>
            </v-list-item>
            <v-list-item
                link
                @click="navigate({name: 'list-model-runs'})"
            >
                <v-list-item-icon>
                  <v-icon>mdi-format-list-text</v-icon>
                </v-list-item-icon>
                <v-list-item-content>
                    My Model Runs
                </v-list-item-content>
            </v-list-item>

            <v-list-item
                link
                @click="navigate({name: 'data-viewer'})"
            >
              <v-list-item-icon>
                <v-icon>mdi-database</v-icon>
              </v-list-item-icon>
              <v-list-item-content>
                Data Viewer
              </v-list-item-content>
            </v-list-item>

            <v-list-item
                link
                @click="navigate({name: 'log'})"
            >
              <v-list-item-icon>
                <v-icon>mdi-console</v-icon>
              </v-list-item-icon>
              <v-list-item-content>
                Application Log
              </v-list-item-content>
            </v-list-item>

            <v-list-item
                link
                @click="navigate({name: 'help'})"
            >
                <v-list-item-icon>
                  <v-icon>mdi-help</v-icon>
                </v-list-item-icon>
                <v-list-item-content>
                    Help
                </v-list-item-content>
            </v-list-item>

            <v-list-item
                link
                @click="navigate({name: 'settings'})"
            >
              <v-list-item-icon>
                <v-icon>mdi-account-cog</v-icon>
              </v-list-item-icon>
              <v-list-item-content>
                Settings
              </v-list-item-content>
            </v-list-item>

            <v-list-item
                link
                @click="navigate({name: 'logout'})"
            >
              <v-list-item-icon>
                <v-icon>mdi-logout</v-icon>
              </v-list-item-icon>
              <v-list-item-content>
                Logout
              </v-list-item-content>
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
      <v-container v-if="!is_logged_in" fluid>
        <AppLogin></AppLogin>
      </v-container>
    </v-app>
  </div>
</template>

<script>
// import MakeModelRun from "@/components/MakeModelRun";
import vuetify from '@/plugins/vuetify' // path to vuetify export
import AppLogin from "@/components/AppLogin"

export default {
  name: 'stormchaser',
  components: { AppLogin },
  vuetify: vuetify,
  data: function() {
    return {
      "nav_drawer": null,
    }
  },
  beforeMount(){ // https://stackoverflow.com/questions/40714319/how-to-call-a-vue-js-function-on-page-load
    //console.log("Fetching variables");
    //this.$store.dispatch("fetch_variables") // .then(this.load, this.load_failed);
  },
  methods: {
    load: function(){
      console.log("Variables fetched");
      this.$store.dispatch("fetch_regions");
    },
    load_failed: function(){
      console.log("Failed to fetch variables");
    },
    navigate: function(params){
      this.$router.push(params);
    }
  },
  computed: {
    is_logged_in: function(){
      let token = this.$store.state.user_api_token;
      return token !== null && token !== undefined && token !== "";
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
    a
      border-bottom: 2px solid rgba(0,0,0,0.1)
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
