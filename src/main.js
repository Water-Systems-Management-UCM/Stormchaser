import Vue from 'vue'
import App from './App.vue'
import VueRouter from "vue-router"
import 'vuetify/dist/vuetify.min.css'
import MakeModelRun from "@/components/MakeModelRun";

import store from "./store"

Vue.use(VueRouter)
Vue.config.productionTip = false

const routes = [
  { path: '/make-model-run', component: MakeModelRun },
]

const router = new VueRouter({
  routes // short for `routes: routes`
})

const stormchaser = new Vue({
  store,
  router,
  render: h => h(App),
}).$mount('#app')

console.log(stormchaser)