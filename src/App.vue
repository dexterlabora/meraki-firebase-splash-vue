
<template>
<v-app>
  <v-toolbar color="indigo" dark fixed app>
    <v-toolbar-title>Meraki Wireless Network Login</v-toolbar-title>
    <v-spacer></v-spacer>
    <v-toolbar-items class="hidden-sm-and-down">
      
      <v-btn v-if="user['email']" flat @click="signOut()">Sign Out</v-btn>
    </v-toolbar-items>
  </v-toolbar>
    <v-content>
      <v-container>

        <v-layout align-center justify-center column fill-height>
          <v-flex xs12 sm8 md12 lg12>
            <img src="./assets/logo.png">
            <h1>Solutions WiFi!</h1>
          </v-flex>

        <v-flex xs12 sm12 md4>
          <router-view></router-view>
          </v-flex>
        </v-layout>
    </v-container>
  </v-content>
  <v-footer app height="auto">
     <v-btn @click="devMode = !devMode"><v-icon>info</v-icon></v-btn>
      <div v-if="devMode">
          <v-spacer></v-spacer>
          <p>clientMac {{clientMac}}</p>
          <p>nodeMac {{nodeMac}}</p>
          <p>baseGrantUrl {{baseGrantUrl}}</p>
          <p>userContinueUrl {{userContinueUrl}}</p>
          <p>clientIp {{clientIp}}</p>    
          <div v-for="(value, key) in merakiDetails" :key="key">
            <p>{{ key }}: {{ value }}</p>
          </div>
          <p v-if="user">user {{user['email']}}</p>
      </div>
  </v-footer>
</v-app>
</template>

<script>
import firebase from "firebase";
export default {
  name: "app",
  data() {
    return {
      clientMac: "",
      baseGrantUrl: "",
      userContinueUrl: "",
      clientIp: "",
      nodeMac: "",
      merakiDetails: {},
      devMode: false
    };
  },
  mounted() {
    // Parse Query String
    console.log("App.vue route query", this.$route.query);
    this.clientMac = this.$route.query.client_mac;
    this.baseGrantUrl = this.$route.query.base_grant_url;
    this.userContinueUrl = this.$route.query.user_continue_url;
    this.clientIp = this.$route.query.client_ip;
    this.nodeMac = this.$route.query.node_mac;
    this.devMode = this.$route.query.devMode;

    // Get Meraki Session Details
    /*
    this.getMerakiDetails(this.clientMac, this.nodeMac).then(data => {
      this.merakiDetails = data;
      this.$store.commit("merakiDetails", this.merakiDetails);
    });
    */
    this.axios
      .post("/merakiDetails", {
        clientMac: this.clientMac,
        nodeMac: this.nodeMac
      })
      .then(res => {
        this.merakiDetails = res.data;
        console.log(this.merakiDetails);
        this.$store.commit("merakiDetails", this.merakiDetails);
      })
      .catch(e => {
        console.log("error getting Meraki Details", e);
        return "error getting Meraki Details" + e;
      });

    // Store Query Parameters to State
    this.$store.commit("clientMac", this.clientMac);
    this.$store.commit("baseGrantUrl", this.baseGrantUrl);
    this.$store.commit("userContinueUrl", this.userContinueUrl);
    this.$store.commit("clientIp", this.clientIp);
    this.$store.commit("nodeMac", this.nodeMac);

    // Set current Firebase Auth user to State
    firebase.auth().onAuthStateChanged(user => {
      this.$store.commit("user", user);
    });
  },
  computed: {
    user() {
      return this.$store.state.user || {};
    }
  },
  methods: {
    async getMerakiDetails(clientMac, nodeMac) {
      const data = await this.axios
        .post("/merakiDetails", { clientMac, nodeMac })
        .then(res => {
          return res.data;
        })
        .catch(e => {
          console.log("error getting Meraki Details", e);
          return "error getting Meraki Details" + e;
        });
      return data;
    },
    firebaseLogout() {
      return firebase
        .auth()
        .signOut()
        .then(() => {
          this.$store.commit("user", {});
        });
    },
    merakiLogout() {
      const data = {
        networkId: this.netId,
        ssidNum: this.ssidNum,
        clientMac: this.clientMac,
        isAuthorized: false
      };
      return this.axios
        .post("/merakiAuth", data)
        .then(res => {
          console.log("meraki auth", res.data);
          // Save auth session
          this.authStatus = res.data;
          this.loginMsg =
            "Deauthenticated from Meraki \n" + String(this.authStatus);
        })
        .catch(e => {
          this.loginMsg = "meraki logout error:" + e;
          this.authStatus = e;
          console.log("meraki logout error", e);
        });
    },
    signOut() {
      this.firebaseLogout()
        .then(res => {
          return this.merakiLogout();
        })
        .then(res => {
          this.$router.replace("logged-out");
        });
    }
  }
};
</script>

 