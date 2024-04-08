<template>

</template>

<script>
// import MakeModelRun from "@/components/MakeModelRun";
import vuetify from './plugins/vuetify.js' // path to vuetify export
import AppLogin from "./components/AppLogin.vue"

export default {
  name: 'stormchaser',
  components: { AppLogin },
  vuetify: vuetify,
  data: function() {
    return {
      "nav_drawer": null,
      "selected_model_area": null,
    }
  },
  beforeMount(){ // https://stackoverflow.com/questions/40714319/how-to-call-a-vue-js-function-on-page-load
    //console.log("Fetching variables");
    //this.$store.dispatch("fetch_variables") // .then(this.load, this.load_failed);
  },
  //mounted(){
  //  Vue.$stormchaser_utils.set_window_title()
  //},
  watch:{
    state_model_area_id: function(value){  // for initialization of the model area selector
      this.selected_model_area = value
    },
    selected_model_area: function(value){
      if (!(value === null)) {  // old note, for archival purpose - we used check the old value because otherwise we double up requests - change_model_area already gets triggered when the original model area is assigned for the user - we changed this behavior when we added the selector for model areas if people have access to multiple
        this.$router.push({name: 'home'}) // force them home because they might not be on something within the new model area after changing1
        this.$store.commit("change_model_area", {id: value})
      }
    }
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
    },
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
      if("current_model_area" in this.$store.getters && this.$store.getters.current_model_area !== undefined){
        return this.$store.getters.current_model_area.background_code
      }else{
        return ""
      }
    }
  }
}
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
