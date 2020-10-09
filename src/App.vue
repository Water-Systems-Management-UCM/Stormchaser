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
                @click="logout"
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
        <v-layout row>
          <v-flex id="app_body" xs12 md9 lg9 >
            <router-view></router-view>
          </v-flex>
        </v-layout>
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
    logout: function(){
      // clear the session data first or else we might create a race condition where it gets retrieved from here before we clear it
      let session_data = window.sessionStorage;
      session_data.setItem("waterspout_token", "");

      // then clear the stored token
      this.$store.commit("set_api_token", "");

      // then reset the application state so that we don't have any leftovers if someone logs into a new organization
      this.$store.commit("reset_state");
    },
    load: function(){
      console.log("Variables fetched");
      this.$store.dispatch("fetch_regions");
    },
    load_failed: function(){
      console.log("Failed to fetch variables");
    },
    navigate: function(params){
      this.$router.push(params);
    },
    get_token_from_storage(){
      let session_data = window.sessionStorage;
      this.$store.commit("set_api_token", session_data.getItem("waterspout_token")); // set the value, then return
      if (this.$store.state.user_api_token !== null && this.$store.state.user_api_token !== undefined && this.$store.state.user_api_token !== ""){ // we might not want to do this here - creates a side effect?
        this.$store.dispatch("fetch_variables");  // get the application data then - currently will fill in the token *again*, but this basically triggers application setup
      }
    }
  },
  computed: {
    is_logged_in: function(){
      let token = this.$store.state.user_api_token;
      if (token !== null && token !== undefined && token !== ""){
        return true; // return quickly if we're logged in, otherwise, check sessionStorage first, then return false
      }
      // now see if we have it in storage
      this.get_token_from_storage();
      token = this.$store.state.user_api_token;  // get it again, it might have changed
      return token !== null && token !== undefined && token !== "";
    }
  }
}
</script>

<style lang="stylus">
#app.theme--light.v-application
  background-color: #eee

  #app_body
    margin-left: auto
    margin-right: auto
    background-color: #fff

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
