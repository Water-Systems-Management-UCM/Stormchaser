import Vue from 'vue'
import './utils';

import App from './App.vue'
import VueRouter from "vue-router"
import 'vuetify/dist/vuetify.min.css'
import store from "./store"
import MakeModelRun from "@/components/MakeModelRun";
import AppHome from "@/components/AppHome";
import ListModelRuns from "@/components/ListModelRuns";
import InputDataViewer from "@/components/InputDataViewer";
import Settings from "@/components/Settings";
import Help from "@/components/Help";
const ModelRun = () => import(/* webpackPrefetch: true */ "@/components/ModelRun");  // we load this this way so that it can lazy load it on demand
import 'material-design-icons-iconfont/dist/material-design-icons.css' // need this for material design icons

import 'leaflet/dist/leaflet.css';

import vuetify from '@/plugins/vuetify' // path to vuetify export
import '@/sentry';

// initialize a11y features

// Now init the application itself
Vue.use(VueRouter)
Vue.config.productionTip = false

const routes = [
  { path: '/', name:'home', component: AppHome, meta: {title: "Home"} },
  { path: '/make-model-run', name:'make-model-run', component: MakeModelRun, meta: {title: "Make New Model Run"} },
  { path: '/model-runs', name:'list-model-runs', component: ListModelRuns, meta: {title: "My Model Runs"}},
  { path: '/model-run/:id', name:'model-run', component: ModelRun, meta: {title: "View Model Run"} },
  { path: '/input-data-viewer/', name:'input-data-viewer', component: InputDataViewer, meta: {title: "View Input Data"} },
  { path: '/help/', name:'help', component: Help, meta: {title: "Help and Tutorials"} },
  { path: '/settings/', name:'settings', component: Settings, meta: {title: "Settings"} },
]

const router = new VueRouter({
  routes // short for `routes: routes`
});

const stormchaser = new Vue({
  store,
  router,
  vuetify,
  render: h => h(App),
}).$mount('#app')

let default_title_getter = function(){return stormchaser.$store.getters.current_model_area.name};
function set_window_title(title){
  document.title = `${default_title_getter()}: ${title}` || default_title_getter();
}
router.afterEach((to ) => {
  // Use next tick to handle router history correctly
  // see: https://github.com/vuejs/vue-router/issues/914#issuecomment-384477609
  Vue.nextTick(() => {
    set_window_title(to.meta.title)
  });
});

window.stormchaser = stormchaser;  // log it to the window so we can debug with it.

