<template>
  <v-app :class="background_code_class">
    <div id="stormchaser">
      <div v-if="is_logged_in">
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
                  v-if="is_loaded && Object.keys(model_area_selector_items).length > 1"
              >
                <v-select
                    :items="model_area_selector_items"
                    item-title="name"
                    item-value="id"
                    v-model="selected_model_area"
                    label="Model Area"
                    @click="selected_model_area"
                ></v-select>
              </v-list-item>
              <v-list-item
                  link
                  @click="navigate({name: 'home'})"
              >
                <v-list-item>
                  <v-icon>mdi-home</v-icon>
                </v-list-item>
                <v-list-item>
                  Home
                </v-list-item>
              </v-list-item>
              <v-list-item
                  link
                  @click="navigate({name: 'make-model-run'})"
                  v-if="$store.getters.current_model_area && $store.getters.current_model_area.preferences.create_or_modify_model_runs"
              >
                  <v-list-item>
                    <v-icon>mdi-account-hard-hat</v-icon>
                  </v-list-item>
                  <v-list-item>
                    New Model Run
                  </v-list-item>
              </v-list-item>
              <v-list-item
                  link
                  @click="navigate({name: 'list-model-runs'})"
              >
                  <v-list-item>
                    <v-icon>mdi-format-list-text</v-icon>
                  </v-list-item>
                  <v-list-item>
                      Model Runs
                  </v-list-item>
              </v-list-item>

              <v-list-item
                  link
                  @click="navigate({name: 'input-data-viewer'})"
                  v-if="$store.getters.current_model_area  > 0"
              >
                <v-list-item>
                  <v-icon>mdi-database</v-icon>
                </v-list-item>
                <v-list-item>
                  Data Viewer
                </v-list-item>
              </v-list-item>

              <!--<v-list-item
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
            -->

              <v-list-item
                  link
                  @click="navigate({name: 'settings'})"
              >
                <v-list-item>
                  <v-icon>mdi-account-cog</v-icon>
                </v-list-item>
                <v-list-item>
                  Settings
                </v-list-item>
              </v-list-item>

              <v-list-item
                  link
                  @click="navigate({name: 'help'})"
              >
                <v-list-item>
                  <v-icon>mdi-help</v-icon>
                </v-list-item>
                <v-list-item>
                  Help and Tutorials
                </v-list-item>
              </v-list-item>

              <v-list-item
                  link
                  @click="logout"
              >
                <v-list-item>
                  <v-icon>mdi-logout</v-icon>
                </v-list-item>
                <v-list-item>
                  Logout
                </v-list-item>
              </v-list-item>
            </v-list>
          </v-navigation-drawer>
        <v-row id="nav_button_container">
          <v-btn  class="mx-1"
                  fab
                  color="primary"
                  id="nav_drawer_toggle"
                  @click.stop="nav_drawer = !nav_drawer"
          >
            <v-icon>menu</v-icon>
          </v-btn>
        </v-row>
        <v-row id="stormchaser_app_body" >
          <v-col
              class="col-12 col-md-9"
              id="app_body"
              v-if="is_loaded"
          >
            <router-view></router-view>
          </v-col>
          <v-col id="app_body" class="loading col-12 col-md-9" v-if="!is_loaded">
            <p v-if="!show_model_area_selector"><v-icon class="loading_icon">mdi-loading</v-icon> Loading...</p>

            <v-row v-if="show_model_area_selector">
              <v-col class="col-4 offset-4">
                <p>You have access to multiple model areas - please choose which one to load:</p>
                <v-select
                    :items="model_area_selector_items"
                    item-title="name"
                    item-value="id"
                    v-model="selected_model_area"
                    label="Model Area"
                    @click="selected_model_area"
                ></v-select>
              </v-col>
            </v-row>
          </v-col>
        </v-row>
      </div>
      <v-row v-if="!is_logged_in && $route.path.indexOf('/pages') === 0">
        <v-col
            class="col-12 col-md-9"
            id="app_body"
        >
          <router-view></router-view>
        </v-col>
      </v-row>
      <v-row v-if="!is_logged_in && $route.path.indexOf('/pages') !== 0" fluid>
        <v-col class="col-12">
          <AppLogin></AppLogin>
        </v-col>
      </v-row>
      <v-row v-if="is_logged_in" id="footer_row"> <!-- footer -->
        <v-col class="col-12 col-md-9 no-gutters" style="padding:0" id="footer">
          <div class="footer_text">
            <p>Copyright {{ new Date().getYear() + 1900 }}, Regents of the University of California.</p>
            <p>Developed by the <a href="http://wsm.ucmerced.edu">Water Systems Management Lab</a>, <a href="https://vicelab.ucmerced.edu">ViceLab</a>,
              and the <a href="https://citris.ucmerced.edu">Center for Information Technology
                Research in the Interest of Society</a> (CITRIS) at UC Merced.</p>
            <p>Background image by <a v-if="background_code_class !== 'washington'" href="https://www.flickr.com/photos/winecountrymedia/23304697052/">WineCountryMedia</a>
              <a v-if="background_code_class === 'washington'" href="https://www.flickr.com/photos/lightsamples/27722831971/">Malcolm Carlaw</a></p>
          </div>
        </v-col>
      </v-row>
      <v-row v-if="is_logged_in" >
        <v-col class="col-12 col-md-9">
          <!-- just here to make flexbox not go to the bottom -->
        </v-col>
      </v-row>
      <v-snackbar
          v-model="$store.state.app_notice_snackbar"
          top
          :timeout="$store.state.app_notice_snackbar_timeout"
      >
        {{ $store.state.app_notice_snackbar_text }}

        <template #actions="{ attrs }">
          <v-btn
              v-bind="attrs"
              text="{{ $store.state.app_notice_snackbar_text }}"
              @click="$store.commit('close_app_notice_snackbar')"
          >
            Close
          </v-btn>
        </template>
      </v-snackbar>
    </div>
  </v-app>
</template>

<script>
// import MakeModelRun from "@/components/MakeModelRun";
import vuetify from './plugins/vuetify.js' // path to vuetify export
import AppLogin from './components/AppLogin.vue'
import Vue, { defineComponent } from 'vue';

export default {
  compatConfig: {
    MODE: 3, // opt-in to Vue 3 behavior for this component only
  },
  name: 'stormchaser',
  components: { AppLogin },
  vuetify: vuetify,

  data(){
    return {
      'nav_drawer': null,
      'selected_model_area': null,
    };
  },

  beforeMount(){ // https://stackoverflow.com/questions/40714319/how-to-call-a-vue-js-function-on-page-load
    // console.log("Fetching variables");
    // this.$store.dispatch("fetch_variables") // .then(this.load, this.load_failed);
  },

  mounted(){
    // Vue.$stormchaser_utils.set_window_title()
  },

  watch:{
    state_model_area_id: function(value){  // for initialization of the model area selector
      this.selected_model_area = value
    },
    selected_model_area: function(value){
      if (!(value === null)) {  // old note, for archival purpose - we used check the old value because otherwise we double up requests - change_model_area already gets triggered when the original model area is assigned for the user - we changed this behavior when we added the selector for model areas if people have access to multiple
        this.$router.push({name: 'home'}) // force them home because they might not be on something within the new model area after changing1
        this.$store.commit('change_model_area', {id: value})
        // this.is_loaded();
      }
    },

    // is_loaded: function() {
    //   return this.$store.getters.app_is_loaded
    // },
  },

  methods: {
    logout: function(){
      // clear the session data first or else we might create a race condition where it gets retrieved from here before we clear it
      this.$store.dispatch('do_logout');
    },
    load: function(){
      console.log('Variables fetched');
      this.$store.dispatch('fetch_regions');
    },
    load_failed: function(){
      console.log('Failed to fetch variables');
    },
    navigate: function(params){
      this.$router.push(params);
    },
    get_token_from_storage(){
      let session_data = window.sessionStorage;
      this.$store.commit('set_api_token', session_data.getItem('waterspout_token')); // set the value, then return
      if (this.$store.state.user_api_token !== null && this.$store.state.user_api_token !== undefined && this.$store.state.user_api_token !== ''){ // we might not want to do this here - creates a side effect?
        this.$store.dispatch('fetch_variables');  // get the application data then - currently will fill in the token *again*, but this basically triggers application setup
      }
    },
  },

  computed: {
    is_logged_in: function(){
      let token = this.$store.state.user_api_token;
      if (token !== null && token !== undefined && token !== ''){
        return true; // return quickly if we're logged in, otherwise, check sessionStorage first, then return false
      }

      // now see if we have it in storage
      this.get_token_from_storage();
      token = this.$store.state.user_api_token;  // get it again, it might have changed
      return token !== null && token !== undefined && token !== '';
    },
    is_loaded: function(){
      return this.$store.getters.app_is_loaded
    },
    state_model_area_id: function(){
      return this.$store.state.model_area_id;
    },
    model_area_selector_items: function(){
      return Object.values(this.$store.state.model_areas)
    },
    show_model_area_selector: function(){
      return this.is_logged_in && this.state_model_area_id === null && Object.keys(this.$store.state.model_areas).length > 0;
    },
    background_code_class: function(){
      if('current_model_area' in this.$store.getters && this.$store.getters.current_model_area !== undefined){
        return this.$store.getters.current_model_area.background_code
      }else{
        return '';
      }
    }
  },
};
</script>

<style lang="stylus">
@import url('https://fonts.googleapis.com/css2?family=Source+Sans+Pro:ital,wght@0,400;0,700;1,400&display=swap');

#app
  background-image: url('assets/napa_background_2.jpg');

#app.washington
  background-image: url('assets/palouse_winter_wheat.jpg');

#app.theme--light.v-application
  /*background-color: #eee*/
  background-size: cover
  background-repeat: no-repeat
  #nav_button_container
    padding-left:1em;

    button#nav_drawer_toggle.mx-1
      margin: 1em !important

  #stormchaser_app_body

    margin-bottom: 0 !important; /* override a vuetify inline style that causes negative footer margin */

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
  //color: #2c3e50

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

#footer_row
  margin-top: 0 !important; /* override a vuetify style that moves it up with a negative margin */

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
