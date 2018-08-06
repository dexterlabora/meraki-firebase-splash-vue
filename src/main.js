// The Vue build version to load with the `import` command
// (runtime-only or standalone) has been set in webpack.base.conf with an alias.
import Vue from "vue";
import App from "./App";
import router from "./router";
import firebase from "firebase";
import Vuex from "vuex";
import axios from "axios";
import VueAxios from "vue-axios";
import Vuetify from "vuetify";
import "vuetify/dist/vuetify.min.css";
import "material-design-icons-iconfont/dist/material-design-icons.css";
import firebaseConfigs from "./firebaseConfigs";
let app;

// UPDATE YOUR FIREBASE CONFIGURATIONS
/*
let fbconfig = {
  apiKey: "AIzaSyAMHRT0FLqlum3dCwm8Fn3FVenYZJOL4b4",
  authDomain: "merakicaptiveportal-vuejs.firebaseapp.com",
  databaseURL: "https://merakicaptiveportal-vuejs.firebaseio.com",
  projectId: "merakicaptiveportal-vuejs",
  storageBucket: "merakicaptiveportal-vuejs.appspot.com",
  messagingSenderId: "541143828942"
};
*/
firebase.initializeApp(firebaseConfigs);

axios.defaults.headers.post["Content-Type"] = "application/json";

Vue.use(Vuex);
Vue.use(VueAxios, axios);
Vue.use(Vuetify);
Vue.config.productionTip = false;

const store = new Vuex.Store({
  state: {
    clientMac: "",
    baseGrantUrl: "",
    userContinueUrl: "",
    clientIp: "",
    nodeMac: "",
    user: {},
    merakiDetails: {}
  },
  mutations: {
    clientMac: (state, payload) => (state.clientMac = payload),
    baseGrantUrl: (state, payload) => (state.baseGrantUrl = payload),
    userContinueUrl: (state, payload) => (state.userContinueUrl = payload),
    clientIp: (state, payload) => (state.clientIp = payload),
    setClients: (state, payload) => (state.setClients = payload),
    nodeMac: (state, payload) => (state.nodeMac = payload),
    user: (state, payload) => (state.user = payload),
    merakiDetails: (state, payload) => (state.merakiDetails = payload)
  }
  //plugins: [createPersistedState()]
});

firebase.auth().onAuthStateChanged(function(user) {
  if (!app) {
    /* eslint-disable no-new */
    app = new Vue({
      el: "#app",
      template: "<App/>",
      components: { App },
      router,
      store
    });
  }
});
