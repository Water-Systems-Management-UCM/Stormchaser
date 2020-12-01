<template>
  <div id="stormchaser">
    <v-app>
      <div
          v-if="is_logged_in">
        <v-row>
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
                  @click="navigate({name: 'home'})"
              >
                <v-list-item-icon>
                  <v-icon>mdi-home</v-icon>
                </v-list-item-icon>
                <v-list-item-content>
                  Home
                </v-list-item-content>
              </v-list-item>
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
                      Model Runs
                  </v-list-item-content>
              </v-list-item>

              <v-list-item
                  link
                  @click="navigate({name: 'input-data-viewer'})"
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
          <v-btn  class="mx-1"
                  fab
                  color="primary"
                  id="nav_drawer_toggle"
                  @click.stop="nav_drawer = !nav_drawer"
          >
            <v-icon
            large>menu</v-icon>
          </v-btn>
        </v-row>
        <v-row>
          <v-col
              class="col-xs-12 col-md-9"
              id="app_body"
              v-if="is_loaded"
          >
            <router-view></router-view>
          </v-col>
          <v-col id="app_body" class="loading col-xs-12 col-md-9" v-if="!is_loaded">
            <p><v-icon class="loading_icon">mdi-loading</v-icon> Loading...</p>
          </v-col>
        </v-row>
      </div>
      <v-row v-if="!is_logged_in" fluid>
        <v-col>
          <AppLogin></AppLogin>
        </v-col>
      </v-row>
      <v-row v-if="is_logged_in" >
        <v-col class="col-xs-12 col-md-9 no-gutters" style="padding:0" id="footer">
          <div class="footer_text">
            <p>Copyright 2020, Regents of the University of California.</p>
            <p>Developed by the <a href="https://wsm.ucmerced.edu">Water Systems Management Lab</a>, <a href="https://vicelab.ucmerced.edu">ViceLab</a>,
              and the <a href="https://citris.ucmerced.edu">Center for Information Technology
                Research in the Interest of Society</a> (CITRIS) at UC Merced.</p>
            <p>Background image by <a href="https://www.flickr.com/photos/winecountrymedia/23304697052/">WineCountryMedia</a></p>
          </div>
        </v-col>
      </v-row>
      <v-row v-if="is_logged_in" >
        <v-col class="col-xs-12 col-md-9">
          <!-- just here to make flexbox not go to the bottom -->
        </v-col>
      </v-row>
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
      this.$store.dispatch("do_logout");
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
    },
    is_loaded: function(){
      return this.$store.getters.app_is_loaded
    }
  }
}
</script>

<style lang="stylus">
@import url('https://fonts.googleapis.com/css2?family=Source+Sans+Pro:ital,wght@0,400;0,700;1,400&display=swap');
#app.theme--light.v-application
  /*background-color: #eee*/
  background-image: url('assets/napa_background_2.jpg');
  background-size: cover
  background-repeat: no-repeat


  button#nav_drawer_toggle.mx-1
    margin: 1em !important

  #app_body
    margin-left: auto
    margin-right: auto
    background-color: rgba(255,255,255,0.8);
    padding: 1em

  #app_body.loading
    text-align: center

#app
  font-family: "Source Sans Pro", Helvetica, Arial, sans-serif
  font-size: 1.15em;
  -webkit-font-smoothing: antialiased
  -moz-osx-font-smoothing: grayscale
  color: #2c3e50

  .v-window-item h3:first-child /* When an h3 is at the top of a tab group or window, don't make it have a margin */
    margin-top: 0

  .v-window-item
    padding: 1em

  h3, h4
    font-weight: normal;

  h4
    font-variant: small-caps

.loading_icon
  position: absolute;
  -webkit-animation:spin 1.5s linear infinite;
  -moz-animation:spin 1.5s linear infinite;
  animation:spin 1.5s linear infinite;

@-moz-keyframes spin
  100%
    -moz-transform: rotate(360deg);

@-webkit-keyframes spin
  100%
    -webkit-transform: rotate(360deg);

@keyframes spin
  100%
    -webkit-transform: rotate(360deg);
    transform:rotate(360deg);

/* Navigation */
aside.v-navigation-drawer

  div.navigation_items
    a
      border-bottom: 2px solid rgba(0,0,0,0.1)
      color: #fff

    a.router-link-active
      background-color: rgba(255,255,255, 0.25)

.sc-help_text
  font-style: italic

.sc-help_block
  font-style: italic
  font-size:0.9em;
  display: block
  padding: 1em
  padding-left: 100px
  min-height: 100px;
  background-color: #eee
  background-image: url("assets/help_box_bg_small.png");
  background-position: bottom left;

.sc-help_block.sc-help_tall
  padding-left: 1em;
  padding-bottom: 80px;


/* Cards */
.storm_card
  margin: 0.5em 1em
  padding: 1em

  .remove_card
    position:absolute
    top: 1em
    right: 1em

#footer
  margin-left: auto
  margin-right: auto
  font-size: 0.75em
  text-align: center
  padding: 1em
  border-top: 1px solid #aaa;

  .footer_text
    background-color: rgba(230,230,230,0.8);
    padding: 1em;

  p
    display: block
    width: 100%
    margin:0

</style>
