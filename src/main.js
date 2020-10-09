import Vue from 'vue'
import './utils';

import App from './App.vue'
import VueRouter from "vue-router"
import 'vuetify/dist/vuetify.min.css'
import store from "./store"
import MakeModelRun from "@/components/MakeModelRun";
import ListModelRuns from "@/components/ListModelRuns";
import DataViewer from "@/components/DataViewer";
const ModelRun = () => import(/* webpackPrefetch: true */ "@/components/ModelRun");  // we load this this way so that it can lazy load it on demand
import 'material-design-icons-iconfont/dist/material-design-icons.css' // need this for material design icons

import vuetify from '@/plugins/vuetify' // path to vuetify export

Vue.use(VueRouter)
Vue.config.productionTip = false

const routes = [
  { path: '/make-model-run', name:'make-model-run', component: MakeModelRun },
  { path: '/model-runs', name:'list-model-runs', component: ListModelRuns },
  { path: '/model-run/:id', name:'model-run', component: ModelRun },
  { path: '/data-viewer/', name:'data-viewer', component: DataViewer },
]

const router = new VueRouter({
  routes // short for `routes: routes`
})

const stormchaser = new Vue({
  store,
  router,
  vuetify,
  render: h => h(App),
}).$mount('#app')

window.stormchaser = stormchaser;  // log it to the window so we can debug with it.

