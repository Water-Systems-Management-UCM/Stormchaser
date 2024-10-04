import {createApp, configureCompat} from 'vue'
import { createStore } from "vuex";
import store from "./store/index.js";
import { stormchaser_utils } from "./utils.js";

import App from './App.vue'
import { createRouter, createWebHistory, createWebHashHistory } from "vue-router"
import 'vuetify/dist/vuetify.min.css'
import MakeModelRun from "./components/MakeModelRun.vue";
import AppHome from "./components/AppHome.vue";
import ListModelRuns from "./components/ListModelRuns.vue";
import InputDataViewer from "./components/InputDataViewer.vue";
import Settings from "./components/Settings.vue";
import About from "./components/About.vue";
import Help from "./components/Help.vue";
const ModelRun = () => import(/* webpackPrefetch: true */ "./components/ModelRun.vue");  // we load this this way so that it can lazy load it on demand
import 'material-design-icons-iconfont/dist/material-design-icons.css' // need this for material design icons
import 'leaflet/dist/leaflet.css';
import {createVuetify} from 'vuetify';
import './sentry.js';
// import './assets/global.styl'
// initialize a11y features
// Now init the application itself
const vuetify = createVuetify({
})

const routes = [
  { path: '/', name:'home', component: AppHome, meta: {title: "Home"} },
  { path: '/make-model-run', name:'make-model-run', component: MakeModelRun, meta: {title: "Make New Model Run"} },
  { path: '/model-runs', name:'list-model-runs', component: ListModelRuns, meta: {title: "My Model Runs"}},
  { path: '/model-run/:id', name:'model-run', component: ModelRun, meta: {title: "View Model Run"} },
  { path: '/input-data-viewer/', name:'input-data-viewer', component: InputDataViewer, meta: {title: "View Input Data"} },
  { path: '/help/', name:'help', component: Help, meta: {title: "Help and Tutorials"} },
  { path: '/settings/', name:'settings', component: Settings, meta: {title: "Settings"} },
  { path: '/pages/about/', name:'about', component: About, meta: {title: "About OpenAg"} },
]

configureCompat({
  MODE: 3
})

const router = createRouter({
  history: createWebHashHistory(),
  routes, // short for `routes: routes`
});
// const store = createStore(router);
const app = createApp(App).use(vuetify).use(store).use(router);

// app.config.errorHandler = (err, vm, info) => {
//   console.error("Error:", err);
//   console.error("Vue component:", vm);
//   console.error("Additional info:", info);
// };
//

app.mount('#app')

// Register the utilities globally on the app instance
app.config.globalProperties.$stormchaser_utils = stormchaser_utils;

let default_title_getter = function(){return this.$store.getters.current_model_area.name};
// function set_window_title(title){
//   document.title = `${default_title_getter()}: ${title}` || default_title_getter();
// }

// router.afterEach((to ) => {
//   // Use next tick to handle router history correctly
//   // see: https://github.com/vuejs/vue-router/issues/914#issuecomment-384477609
//   Vue.nextTick(() => {
//     set_window_title(to.meta.title)
//   });
// });

// Update for Vue 3 without nextTick
// https://github.com/vuejs/vue-router/issues/914#issuecomment-1837544335
// router.beforeEach((to, from, next) => {
//     // document.title = `${to.meta.PageTitle}`;
//     set_window_title(to);
//     next();
// })

/*
  We have an autologin system for washington that bypasses the need to create or manage user accounts - a bit of a distinction
  without a difference in some ways because it's actually that we'll have a single user account and log them in automatically.
  This next function will set up the check that runs when the application first loads to see if it's an auto-login
  deployment of the application. It hits an API endpoint that either tells us that it's not an auto-login version
  or that it is and provides the credentials to use and the auto login user info.

  We have a flag here at the top to set whether to try it just to prevent an unnecessary request from happening
  in deployments that don't need it. We'll build it special when we send deployments that need auto-login.
 */
let try_auto_login = false;
if(try_auto_login === true){
// when the DOM is loaded, then check if we're running an auto-login setup
  document.addEventListener("DOMContentLoaded", function() {
    fetch("/auto-login/", {method: 'GET', credentials: 'omit'}).then((response) => {
      response.json().then(
          function(response_data){
            if("auto_login_allowed" in response_data && response_data.auto_login_allowed === true) {
              this.$store.dispatch("check_and_set_token", {token: response_data.auto_login_token, user_info: response_data.user_info})
            }
          }
      )
    })
  });
}

window.app = app;  // log it to the window so we can debug with it.

