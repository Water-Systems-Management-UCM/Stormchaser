(function(e){function t(t){for(var o,i,s=t[0],l=t[1],c=t[2],_=0,d=[];_<s.length;_++)i=s[_],Object.prototype.hasOwnProperty.call(a,i)&&a[i]&&d.push(a[i][0]),a[i]=0;for(o in l)Object.prototype.hasOwnProperty.call(l,o)&&(e[o]=l[o]);u&&u(t);while(d.length)d.shift()();return r.push.apply(r,c||[]),n()}function n(){for(var e,t=0;t<r.length;t++){for(var n=r[t],o=!0,s=1;s<n.length;s++){var l=n[s];0!==a[l]&&(o=!1)}o&&(r.splice(t--,1),e=i(i.s=n[0]))}return e}var o={},a={app:0},r=[];function i(t){if(o[t])return o[t].exports;var n=o[t]={i:t,l:!1,exports:{}};return e[t].call(n.exports,n,n.exports,i),n.l=!0,n.exports}i.m=e,i.c=o,i.d=function(e,t,n){i.o(e,t)||Object.defineProperty(e,t,{enumerable:!0,get:n})},i.r=function(e){"undefined"!==typeof Symbol&&Symbol.toStringTag&&Object.defineProperty(e,Symbol.toStringTag,{value:"Module"}),Object.defineProperty(e,"__esModule",{value:!0})},i.t=function(e,t){if(1&t&&(e=i(e)),8&t)return e;if(4&t&&"object"===typeof e&&e&&e.__esModule)return e;var n=Object.create(null);if(i.r(n),Object.defineProperty(n,"default",{enumerable:!0,value:e}),2&t&&"string"!=typeof e)for(var o in e)i.d(n,o,function(t){return e[t]}.bind(null,o));return n},i.n=function(e){var t=e&&e.__esModule?function(){return e["default"]}:function(){return e};return i.d(t,"a",t),t},i.o=function(e,t){return Object.prototype.hasOwnProperty.call(e,t)},i.p="/";var s=window["webpackJsonp"]=window["webpackJsonp"]||[],l=s.push.bind(s);s.push=t,s=s.slice();for(var c=0;c<s.length;c++)t(s[c]);var u=l;r.push([0,"chunk-vendors"]),n()})({0:function(e,t,n){e.exports=n("56d7")},"1a8b":function(e,t,n){},"4cab":function(e,t,n){},"56d7":function(e,t,n){"use strict";n.r(t);n("e260"),n("e6cf"),n("cca6"),n("a79d");var o=n("2b0e"),a=function(){var e=this,t=e.$createElement,n=e._self._c||t;return n("div",{attrs:{id:"stormchaser"}},[n("v-app",[n("v-container",{attrs:{fluid:""}},[n("v-navigation-drawer",{attrs:{clipped:"",absolute:"",temporary:"",color:"primary",dark:"","mini-variant.sync":"true"},model:{value:e.nav_drawer,callback:function(t){e.nav_drawer=t},expression:"nav_drawer"}},[n("v-list",{staticClass:"navigation_items",attrs:{nav:""}},[n("v-list-item",{attrs:{link:""},on:{click:function(t){return e.navigate({name:"make-model-run"})}}},[n("v-list-item-icon",[n("v-icon",[e._v("mdi-account-hard-hat")])],1),n("v-list-item-content",[e._v(" New Model Run ")])],1),n("v-list-item",{attrs:{link:""},on:{click:function(t){return e.navigate({name:"list-model-runs"})}}},[n("v-list-item-icon",[n("v-icon",[e._v("mdi-format-list-text")])],1),n("v-list-item-content",[e._v(" My Model Runs ")])],1)],1)],1),n("v-btn",{attrs:{color:"pink",dark:"",icon:""},on:{click:function(t){t.stopPropagation(),e.nav_drawer=!e.nav_drawer}}},[n("v-icon",[e._v("menu")])],1),n("router-view")],1)],1)],1)},r=[],i=n("ce5b"),s=n.n(i);n("bf40");o["default"].use(s.a);var l={},c=new s.a(l),u={name:"stormchaser",components:{},vuetify:c,data:function(){return{nav_drawer:null}},beforeMount:function(){console.log("Fetching variables"),this.$store.dispatch("fetch_variables")},methods:{load:function(){console.log("Variables fetched"),this.$store.dispatch("fetch_regions")},load_failed:function(){console.log("Failed to fetch variables")},navigate:function(e){this.$router.push(e)}}},_=u,d=(n("7faf"),n("2877")),m=Object(d["a"])(_,a,r,!1,null,null,null),p=m.exports,f=n("8c4f"),v=(n("4160"),n("d3b7"),n("159b"),n("96cf"),n("1da1")),h=n("2f62");o["default"].use(h["a"]);var g=new h["a"].Store({state:{regions:[],model_runs:[],user_api_token:null,api_server_url:"http://localhost:8000",api_url_variables:"http://localhost:8080/application-variables",api_url_model_runs:null,api_url_regions:null,organization_id:1,calibration_set_id:1},getters:{},mutations:{set_regions:function(e,t){console.log(t),e.regions=t},set_model_runs:function(e,t){console.log(t),e.model_runs=t},set_single_model_run:function(e,t){console.log("Updating data for model run "+t.id),e.model_runs[t.id]=t},append_model_run:function(e,t){console.log("Appending Model Run"),e.model_runs.push(t)},set_application_variables:function(e,t){console.log("Yo"),console.log(t),e.user_api_token=t.user_api_token,e.api_url_model_runs=t.api_url_model_runs,e.api_url_regions=t.api_url_regions,console.log(e.user_api_token)}},actions:{set_model_runs:function(e,t){var n={};t.results.forEach((function(e){n[e.id]=e})),e.commit("set_model_runs",n)},fetch_model_runs:function(e){console.log("Fetching Model Runs"),console.log(e.state.api_url_model_runs),fetch(e.state.api_url_model_runs).then((function(e){return e.json()})).then((function(t){return e.dispatch("set_model_runs",t)}))},update_model_run:function(){var e=Object(v["a"])(regeneratorRuntime.mark((function e(t,n){return regeneratorRuntime.wrap((function(e){while(1)switch(e.prev=e.next){case 0:return console.log("Updating model run and results for model run ".concat(n)),e.next=3,fetch(t.state.api_url_model_runs+"/"+n).then((function(e){return e.json()})).then((function(e){return t.commit("set_single_model_run",e)}));case 3:return e.abrupt("return",t.state.model_runs[n]);case 4:case"end":return e.stop()}}),e)})));function t(t,n){return e.apply(this,arguments)}return t}(),get_model_run_with_results:function(){var e=Object(v["a"])(regeneratorRuntime.mark((function e(t,n){var o,a,r;return regeneratorRuntime.wrap((function(e){while(1)switch(e.prev=e.next){case 0:o=function(e){return new Promise((function(t){return setTimeout(t,e)}))},a=void 0,r=0;case 3:if(void 0!==a){e.next=14;break}if(a=t.state.model_runs[n],null!==a&&void 0!==a){e.next=8;break}return e.next=8,o(100);case 8:if(r+=1,!(r>150)){e.next=12;break}return console.log("Failed to wait for model runs to be initialized - couldn't retrieve model run with ID "+n+" from application state"),e.abrupt("break",14);case 12:e.next=3;break;case 14:if(null!==a.results&&void 0!==a.results){e.next=19;break}return console.log("Fetching model run update and any results"),e.next=18,t.dispatch("update_model_run",a.id);case 18:a=e.sent;case 19:return e.abrupt("return",a);case 20:case"end":return e.stop()}}),e)})));function t(t,n){return e.apply(this,arguments)}return t}(),set_regions:function(e,t){t.results.forEach((function(e,n){t.results[n].active=!1,t.results[n].water_proportion=100,t.results[n].land_proportion=100})),e.commit("set_regions",t.results)},fetch_regions:function(e){console.log("Fetching Regions"),console.log(e.state.api_url_regions),fetch(e.state.api_url_regions).then((function(e){return e.json()})).then((function(t){return e.dispatch("set_regions",t)}))},fetch_variables:function(e){fetch(e.state.api_url_variables).then((function(e){return e.json()})).then((function(t){return e.commit("set_application_variables",t)}),(function(){console.log("Failed during loading application variables")})).then((function(){e.dispatch("fetch_regions").catch(console.log("Failed to load regions"))})).then((function(){e.dispatch("fetch_model_runs").catch(console.log("Failed to load model runs"))})).catch((function(){console.log("Failed during loading")}))}}}),b=function(){var e=this,t=e.$createElement,n=e._self._c||t;return n("v-layout",{attrs:{row:""}},[n("v-flex",{attrs:{xs12:"",lg9:"",id:"new_model_run"}},[n("h2",[e._v("New Model Run")]),n("v-stepper",{model:{value:e.model_creation_step,callback:function(t){e.model_creation_step=t},expression:"model_creation_step"}},[n("v-flex",{attrs:{xs12:""}},[n("v-stepper-header",[[n("v-stepper-step",{key:"1-step",attrs:{complete:e.model_creation_step>e.n,step:"1",editable:""}},[e._v(" Region Modifications ")]),n("v-stepper-step",{key:"2-step",attrs:{complete:e.model_creation_step>e.n,step:"2",editable:""}},[e._v(" Crop Modifications ")]),n("v-stepper-step",{key:"3-step",attrs:{complete:e.model_creation_step>e.n,step:"3",editable:""}},[e._v(" Model Details ")]),e.n!==e.steps?n("v-divider",{key:e.n}):e._e()]],2)],1),n("v-stepper-items",[n("v-stepper-content",{key:"`1-content`",attrs:{step:"1"}},[n("v-flex",{attrs:{xs12:"",md6:""}},[n("h3",[e._v("Add Region Modifications")]),n("v-autocomplete",{attrs:{items:e.allRegions,"item-text":"name",clearable:"","deletable-chips":"",chips:"","small-chips":"",label:"Add Regions","return-object":"","persistent-hint":"",multiple:"",solo:""},model:{value:e.selected_regions,callback:function(t){e.selected_regions=t},expression:"selected_regions"}}),n("v-flex",e._l(e.selected_regions,(function(t){return n("Region",{key:t.id,attrs:{region:t},on:{"region-deactivate":e.deactivate_region}})})),1),n("v-btn",{attrs:{color:"primary"},on:{click:function(t){return e.next_step(1)}}},[e._v(" Continue ")])],1),n("v-flex",{attrs:{xs12:"",md6:""}},[e._v(" Yo, I'm a map ")])],1),n("v-stepper-content",{key:"`2-content`",attrs:{step:"2"}},[n("h3",[e._v("Add Crop Modifications")]),n("v-btn",{attrs:{color:"primary"},on:{click:function(t){return e.next_step(2)}}},[e._v(" Continue ")])],1),n("v-stepper-content",{key:"`3-content`",attrs:{step:"3"}},[n("h3",[e._v("Add Model Details")]),n("v-snackbar",{attrs:{top:"",timeout:"-1"},scopedSlots:e._u([{key:"action",fn:function(t){var o=t.attrs;return[n("v-btn",e._b({attrs:{color:"pink",text:""},on:{click:function(t){e.model_created_snackbar=!1}}},"v-btn",o,!1),[e._v(" Close ")])]}}]),model:{value:e.model_created_snackbar,callback:function(t){e.model_created_snackbar=t},expression:"model_created_snackbar"}},[e._v(" Model Run Created. "),n("v-btn",{attrs:{color:"pink",text:"",to:{name:"model-run",params:{id:this.last_model_run.id}}}},[e._v(" Go to Model Run ")])],1),n("v-snackbar",{attrs:{top:"",timeout:"-1"},scopedSlots:e._u([{key:"action",fn:function(t){var o=t.attrs;return[n("v-btn",e._b({attrs:{color:"pink",text:""},on:{click:function(t){e.model_creation_failed_snackbar=!1}}},"v-btn",o,!1),[e._v(" Close ")])]}}]),model:{value:e.model_creation_failed_snackbar,callback:function(t){e.model_creation_failed_snackbar=t},expression:"model_creation_failed_snackbar"}},[e._v(" Could Not Create Model Run: "+e._s(e.model_creation_failed_text)+" ")]),n("v-text-field",{attrs:{label:"Model Run Name"},model:{value:e.new_model_run_name,callback:function(t){e.new_model_run_name=t},expression:"new_model_run_name"}}),n("v-textarea",{attrs:{label:"Description or Metadata",hint:"Include any details here that help you remember the intent or purpose of this model run. Input parameters will be automatically captured and shown with results."},model:{value:e.new_model_run_description,callback:function(t){e.new_model_run_description=t},expression:"new_model_run_description"}}),n("v-btn",{on:{click:e.run_model}},[e._v("Run Model")]),this.last_model_run.id?n("v-btn",{attrs:{href:e.results_download_url,download:""}},[e._v("Download Results")]):e._e(),this.last_model_run.id?n("v-btn",{attrs:{to:{name:"model-run",params:{id:this.last_model_run.id}}}},[e._v("Go to Model Run")]):e._e()],1)],1)],1)],1)],1)},x=[],y=(n("99af"),n("4de4"),n("caad"),n("2532"),n("ddb0"),function(){var e=this,t=e.$createElement,n=e._self._c||t;return n("StormCard",{attrs:{class_name:"region",title:e.region.name,card_item:e.region},on:{"card-activate":e.activate,"card-deactivate":e.deactivate}},[n("h4",[e._v(e._s(e.region.internal_id)+": "+e._s(e.region.name))]),e.region.active?n("div",{staticClass:"region_params"},[n("StormCardSlider",{attrs:{initial_value:100,min:e.min_water,max:e.max_water,label:"Water Availability (%)"},model:{value:e.region.water_proportion,callback:function(t){e.$set(e.region,"water_proportion",t)},expression:"region.water_proportion"}}),n("StormCardSlider",{attrs:{initial_value:100,min:e.min_water,max:e.max_water,label:"Land Availability (%)"},model:{value:e.region.land_proportion,callback:function(t){e.$set(e.region,"land_proportion",t)},expression:"region.land_proportion"}})],1):e._e()])}),w=[],k=(n("b0c0"),function(){var e=this,t=e.$createElement,n=e._self._c||t;return n("v-card",{staticClass:"storm_card",class:e.class_name,attrs:{elevation:"5","min-width":"100","max-width":"500",title:e.title}},[e._t("default"),this.card_item.active?e._e():n("button",{staticClass:"add_card",on:{click:function(t){return e.$emit("card-activate")}}},[e._v("Add")]),this.card_item.active?n("button",{staticClass:"remove_card",on:{click:function(t){return e.$emit("card-deactivate")}}},[e._v("X")]):e._e()],2)}),R=[],C={name:"StormCard",props:{title:String,class_name:String,card_item:Object}},M=C,$=Object(d["a"])(M,k,R,!1,null,"a71d31b0",null),j=$.exports,S=function(){var e=this,t=e.$createElement,n=e._self._c||t;return n("div",{staticClass:"stormcard_slider"},[n("span",{domProps:{textContent:e._s(e.slider_value)}}),n("v-slider",{attrs:{label:e.label,min:e.min,max:e.max,value:e.initial_value,color:"blue","track-color":"grey"},scopedSlots:e._u([{key:"prepend",fn:function(){return[n("v-icon",{on:{click:e.decrement_slider_value}},[e._v(" remove ")])]},proxy:!0},{key:"append",fn:function(){return[n("v-icon",{on:{click:e.increment_slider_value}},[e._v(" add ")])]},proxy:!0}]),model:{value:e.slider_value,callback:function(t){e.slider_value=t},expression:"slider_value"}})],1)},O=[],z=(n("a9e3"),{name:"StormCardSlider",props:{value:Number,label:String,min:Number,max:Number,initial_value:Number},data:function(){return{slider_value:this.initial_value}},methods:{increment_slider_value:function(){this.slider_value++},decrement_slider_value:function(){this.slider_value--}},watch:{slider_value:function(){this.$emit("input",this.slider_value)}}}),P=z,E=Object(d["a"])(P,S,O,!1,null,"67ce6650",null),N=E.exports,A={name:"Region",components:{StormCard:j,StormCardSlider:N},props:{region:Object},methods:{activate:function(){console.log("activating region"),this.region.active=!0,this.$emit("region-activate")},deactivate:function(){console.log("deactivating region"),this.region.active=!1,this.$emit("region-deactivate")}},computed:{text:function(){return"".concat(this.region.internal_id,": ").concat(this.region.name)},min_water:function(){return 50},max_water:function(){return 120}}},D=A,F=Object(d["a"])(D,y,w,!1,null,"7d3c179e",null),L=F.exports,T={components:{Region:L},name:"MakeModelRun",data:function(){return{selected_regions:[],last_model_run:{},model_creation_step:1,new_model_run_name:null,new_model_run_description:null,model_created_snackbar:!1,model_creation_failed_snackbar:!1,model_creation_failed_text:null}},watch:{selected_regions:function(e,t){var n=e.filter((function(e){return!t.includes(e)})),o=t.filter((function(t){return!e.includes(t)}));n.forEach((function(e){e.active=!0})),o.forEach((function(e){e.active=!1}))}},methods:{next_step:function(e){this.model_creation_step=e+1},deactivate_region:function(){console.log("Deactivating"),this.selected_regions=this.activeRegions},activateRegion:function(e){console.log(e),e.active=!e.active},get_header:function(){var e=new Headers;return e.append("Authorization","Token ".concat(this.$store.state.user_api_token)),e.append("Content-Type","application/json"),e},set_model_run:function(e){console.log("1"),console.log(e),this.last_model_run=e,console.log("2"),console.log(this.last_model_run),console.log("3"),console.log(e),this.results_download_url="/model_run/csv/".concat(e.id,"/"),console.log("4"),console.log(this.results_download_url)},reset_model:function(){this.new_model_run_name=null,this.new_model_run_description=null},run_model:function(){console.log("Creating Model Run");var e=this.get_header();console.log(e.values());var t=this.activeRegions,n=[];t.forEach((function(e){var t={region:e.id,water_proportion:e.water_proportion/100,land_proportion:e.land_proportion/100};n.push(t)}));var o=this.new_model_run_name?'"'.concat(this.new_model_run_name,'"'):null,a=this.new_model_run_description?'"'.concat(this.new_model_run_description,'"'):null,r='{\n                            "name": '.concat(o,',\n                            "description": ').concat(a,',\n                            "ready": true,\n                            "organization": ').concat(this.$store.state.organization_id,',\n                            "calibration_set": ').concat(this.$store.state.calibration_set_id,',\n                            "region_modifications": ').concat(JSON.stringify(n),"\n                        }");console.log(r);var i=this;return fetch(this.$store.state.api_url_model_runs,{method:"POST",headers:e,body:r}).then((function(e){return console.log(e),e.json().then((function(t){e.ok?(console.log("JSON data"),console.log(t),i.last_model_run=t,i.$store.commit("append_model_run",t),i.model_created_snackbar=!0,i.reset_model()):(i.model_creation_failed_snackbar=!0,console.log(e),console.log(t),i.model_creation_failed_text="Server rejected model creation. See console for details.")}))})).catch((function(e){i.model_creation_failed_snackbar=!0,i.model_creation_failed_text="Unknown network error - please try again later: ".concat(e)}))}},computed:{activeRegions:function(){return this.$store.state.regions.filter((function(e){return!0===e.active}))},inactiveRegions:function(){return this.$store.state.regions.filter((function(e){return!1===e.active}))},allRegions:function(){return this.$store.state.regions},results_download_url:function(){return"".concat(this.$store.state.api_server_url,"/api/model_runs/").concat(this.last_model_run.id,"/csv/")}}},I=T,Y=(n("81f9"),Object(d["a"])(I,b,x,!1,null,null,null)),J=Y.exports,V=function(){var e=this,t=e.$createElement,n=e._self._c||t;return n("v-layout",{attrs:{row:""}},[n("v-flex",{staticStyle:{margin:"auto"},attrs:{xs12:"",lg9:""}},[n("h2",[e._v("Model Runs")]),n("v-data-table",{staticClass:"elevation-1 model_run_listing",attrs:{headers:e.headers,items:e.model_runs,"item-key":"id","show-select":"","multi-sort":"","sort-by":"date_submitted","sort-desc":"","items-per-page":"20"},on:{"click:row":e.view_model_run},model:{value:e.selected,callback:function(t){e.selected=t},expression:"selected"}})],1)],1)},W=[],U=(n("07ac"),{name:"ListModelRuns",data:function(){return{headers:[{text:"Run Name",value:"name"},{text:"Description",value:"description"},{text:"Date",value:"date_submitted"},{text:"Status",value:"complete"}]}},methods:{view_model_run:function(e){this.$router.push({name:"model-run",params:{id:e.id}})}},computed:{model_runs:function(){return Object.values(this.$store.state.model_runs)}}}),G=U,H=(n("8d5e"),Object(d["a"])(G,V,W,!1,null,null,null)),X=H.exports,q=function(){var e=this,t=e.$createElement,n=e._self._c||t;return n("v-layout",{attrs:{row:""}},[e.model_loaded?n("v-flex",{attrs:{xs12:"",lg9:"",id:"model_run_container"}},[n("h2",[e._v("Model Run "+e._s(e.$route.params.id)+": "+e._s(e.waterspout_data.name))]),n("v-btn",{attrs:{color:"primary",to:{name:"list-model-runs"}}},[e._v("< Return to list")]),n("p",[n("ul",[n("li",[e._v("ID: "+e._s(e.waterspout_data.id))]),n("li",[e._v("Results Ready: "+e._s(e.waterspout_data.complete?"yes":"no"))])])]),e.has_modifications?n("h3",[e._v("Modifications")]):e._e(),e.has_modifications?n("v-data-table",{staticClass:"elevation-1",attrs:{headers:e.modifications_headers,items:e.waterspout_data.region_modifications,"item-key":"id","multi-sort":"","disable-pagination":""},scopedSlots:e._u([{key:"item.name",fn:function(t){var o=t.item;return[n("span",{staticClass:"region_name"},[e._v(e._s(e.get_region_name_by_id(o.region)))])]}}],null,!1,3859410579),model:{value:e.selected,callback:function(t){e.selected=t},expression:"selected"}}):e._e(),e.has_modifications?e._e():n("p",[e._v("No modifications to the model in this run.")]),n("p",[!0===e.waterspout_data.complete?n("v-btn",{attrs:{href:e.results_download_url,download:""}},[e._v("Download Results")]):e._e()],1),n("Plotly",{attrs:{data:e.modification_scatter_data}}),n("ResultsVisualizer",{attrs:{model_data:e.waterspout_data,regions:e.$store.state.regions}})],1):e._e(),e.model_loaded?e._e():n("v-flex",{staticClass:"loading",attrs:{xs9:"",id:"model_run_container"}},[e._v(" Loading... ")])],1)},B=[],K=(n("7db0"),n("04d1")),Q=function(){var e=this,t=e.$createElement,n=e._self._c||t;return n("v-flex",{staticClass:"results_visualizer",attrs:{row:""}},[n("v-snackbar",{attrs:{top:"",timeout:"15000"},scopedSlots:e._u([{key:"action",fn:function(t){var o=t.attrs;return[n("v-btn",e._b({attrs:{color:"pink",text:""},on:{click:function(t){e.visualizer_info_snackbar=!1}}},"v-btn",o,!1),[e._v(" Close ")])]}}]),model:{value:e.visualizer_info_snackbar,callback:function(t){e.visualizer_info_snackbar=t},expression:"visualizer_info_snackbar"}},[e._v(" "+e._s(e.visualizer_info_snackbar_text)+" ")]),n("v-autocomplete",{attrs:{items:e.color_attributes,label:"Color Attribute",clearable:"","return-object":"","persistent-hint":"",solo:""},model:{value:e.color_by_attribute,callback:function(t){e.color_by_attribute=t},expression:"color_by_attribute"}}),n("v-autocomplete",{attrs:{items:e.years,clearable:"","deletable-chips":"",chips:"","small-chips":"",label:"Years","return-object":"","persistent-hint":"",multiple:"",solo:""},model:{value:e.selected_years,callback:function(t){e.selected_years=t},expression:"selected_years"}}),n("v-autocomplete",{attrs:{items:e.regions,"item-text":"name","item-value":"id",clearable:"","deletable-chips":"",chips:"","small-chips":"",label:"Add Regions","persistent-hint":"",multiple:"",solo:""},model:{value:e.selected_regions,callback:function(t){e.selected_regions=t},expression:"selected_regions"}}),n("v-switch",{attrs:{label:"Pin Axis Extent"},model:{value:e.pin_plot_axis_bounds,callback:function(t){e.pin_plot_axis_bounds=t},expression:"pin_plot_axis_bounds"}}),n("Plotly",{attrs:{data:e.result_scatter_data,layout:e.basic_result_scatter_layout}})],1)},Z=[],ee=(n("d81d"),n("6062"),n("3ca3"),n("2909")),te={name:"ResultsVisualizer",components:{Plotly:K["Plotly"]},props:{model_data:Object,regions:Array},data:function(){return{years:[],selected_years:[],selected_regions:[],color_by_attribute:null,color_attributes:["Years","Regions"],setup_running:!1,x_axis_attribute:"xlandsc",x_axis_title:"Land",x_axis_max_value:0,y_axis_attribute:"xwatersc",y_axis_title:"Water",y_axis_max_value:0,pin_plot_axis_bounds:!0,visualizer_info_snackbar:!1,visualizer_info_snackbar_text:""}},watch:{model_data:{immediate:!0,handler:function(){this.set_up_component()}},x_axis_attribute:function(){this.set_up_xaxis()},y_axis_attribute:function(){this.set_up_yaxis()}},mounted:function(){this.set_up_component()},methods:{get_series_data:function(e){void 0===e&&(e={});var t=e.selected_years,n=e.selected_regions;void 0===t&&(t=this.selected_years),void 0===n&&(n=this.selected_regions);var o=[],a=[],r=this.model_data.results.result_set;t.length>0&&(r=r.filter((function(e){return t.includes(e.year)}))),n.length>0&&(r=r.filter((function(e){return n.includes(e.region)})));var i=this.x_axis_attribute,s=this.y_axis_attribute;return r.forEach((function(e){o.push(e[i]),a.push(e[s])})),{x:o,y:a,mode:"markers",type:"scatter"}},set_up_xaxis:function(){this.x_axis_max_value=this.get_min_or_max_of_values(Math.max,this.model_data.results.result_set,this.x_axis_attribute)},set_up_yaxis:function(){this.y_axis_max_value=this.get_min_or_max_of_values(Math.max,this.model_data.results.result_set,this.y_axis_attribute)},get_min_or_max_of_values:function(e,t,n){return e.apply(Math,t.map((function(e){return e[n]})))},set_up_years:function(){this.has_results?(console.log("Calculating years"),this.years=Object(ee["a"])(new Set(this.model_data.results.result_set.map((function(e){return e.year}))))):console.log("Skipping Year Calculation")},set_up_component:function(){this.setup_running||(this.setup_running=!0,this.set_up_years(),this.set_up_xaxis(),this.set_up_yaxis(),this.setup_running=!1)},visualizer_notice:function(e){this.visualizer_info_snackbar_text=e,this.visualizer_info_snackbar=!0}},computed:{has_results:function(){return void 0!==this.model_data.results&&null!==this.model_data.results},result_scatter_data:function(){if(this.color_by_attribute){var e=[],t="selected_"+this.color_by_attribute.toLowerCase(),n=this[t];if(0===n.length&&(n=this[this.color_by_attribute.toLowerCase()]),n.length>12)return this.visualizer_notice("Too many items to color - can only color when filtered to 12 or fewer items"),[this.get_series_data()];var o=this;return n.forEach((function(n){var a={};a[t]=[n],e.push(o.get_series_data(a))})),e}return[this.get_series_data()]},basic_result_scatter_layout:function(){var e={xaxis:{title:"Land"},yaxis:{title:"Water"}};return this.pin_plot_axis_bounds&&(e.xaxis.range=[-.02*this.x_axis_max_value,this.x_axis_max_value+.05*this.x_axis_max_value],e.yaxis.range=[-.02*this.y_axis_max_value,this.y_axis_max_value+.05*this.y_axis_max_value]),e}}},ne=te,oe=(n("9eaa"),Object(d["a"])(ne,Q,Z,!1,null,null,null)),ae=oe.exports,re={name:"ModelRun",components:{Plotly:K["Plotly"],ResultsVisualizer:ae},data:function(){return{model_loaded:!1,waterspout_data:{region_modifications:[]},modifications_headers:[{text:"Region Name",value:"name"},{text:"Land Proportion",value:"land_proportion"},{text:"Water Proportion",value:"water_proportion"}]}},beforeRouteEnter:function(e,t,n){n((function(t){t.model_loaded=!1,console.log("Changing to Model Run ".concat(e.params.id," via beforeRouteEnter")),t.$store.dispatch("get_model_run_with_results",e.params.id).then((function(e){t.waterspout_data=e,console.log(e),t.model_loaded=!0}))}))},methods:{get_region_name_by_id:function(e){return this.$store.state.regions.find((function(t){return Number(t.id)===Number(e)})).name}},computed:{has_modifications:function(){return this.waterspout_data.region_modifications.length>0},has_results:function(){return void 0!==this.waterspout_data.results&&null!==this.waterspout_data.results},results_download_url:function(){return"".concat(this.$store.state.api_server_url,"/api/model_runs/").concat(this.waterspout_data.id,"/csv/")},modification_scatter_data:function(){var e=[],t=[];return this.waterspout_data.region_modifications.forEach((function(n){e.push(n.land_proportion),t.push(n.water_proportion)})),[{x:e,y:t,mode:"markers",type:"scatter"}]}}},ie=re,se=(n("70ef"),Object(d["a"])(ie,q,B,!1,null,null,null)),le=se.exports;n("d1e78");o["default"].use(f["a"]),o["default"].config.productionTip=!1;var ce=[{path:"/make-model-run",name:"make-model-run",component:J},{path:"/model-runs",name:"list-model-runs",component:X},{path:"/model-run/:id",name:"model-run",component:le}],ue=new f["a"]({routes:ce}),_e=new o["default"]({store:g,router:ue,vuetify:c,render:function(e){return e(p)}}).$mount("#app");console.log(_e)},"70ef":function(e,t,n){"use strict";var o=n("4cab"),a=n.n(o);a.a},"7faf":function(e,t,n){"use strict";var o=n("b8ff"),a=n.n(o);a.a},"81f9":function(e,t,n){"use strict";var o=n("eb10"),a=n.n(o);a.a},"8d5e":function(e,t,n){"use strict";var o=n("f364"),a=n.n(o);a.a},"9eaa":function(e,t,n){"use strict";var o=n("1a8b"),a=n.n(o);a.a},b8ff:function(e,t,n){},eb10:function(e,t,n){},f364:function(e,t,n){}});
//# sourceMappingURL=app.0e817d97.js.map