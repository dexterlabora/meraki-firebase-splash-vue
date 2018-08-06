<template>
  <div>
  <v-container wrap fill-height>
        <v-layout align-center justify-center>
          
          <template v-if="!user">
            <v-flex xs12 md12>
              <!-- Firebase Authentication -->
                  <login></login>
                  {{loginMsg}}
            </v-flex>
          </template>

          <template v-if="user">
            <v-layout align-center justify-center column fill-height>    
              <!-- WiFi Login -->      
              <v-flex xs12 sm12 md12>
                <v-btn large outline color="green" @click="loginMeraki">Connect to WiFi</v-btn>
              </v-flex>
              <v-spacer></v-spacer>
              <v-spacer></v-spacer>
              <v-flex xs12 md12>
              </v-flex>

              <!-- User Info -->
               <v-flex xs12 md12>
                <p class="pt-5"><span> <v-icon>person</v-icon> {{user.email}}</span></p>               
              </v-flex>

              <!-- Loader -->
              <v-dialog
              v-model="loading"             
              persistent              
              >
              <v-card
                color="gray"
                dark  
                >
                <v-card-text>
                  <v-progress-linear
                    indeterminate
                    color="green"
                    class="mb-0"
                   ></v-progress-linear>
                </v-card-text>
              </v-card>
            </v-dialog>

            </v-layout>
          </template>

        </v-layout>
      </v-container>       
  </div>
</template>

<script>
import firebase from "firebase";
import Login from "./FirebaseLogin.vue";

export default {
  name: "splash",
  components: {
    Login
  },
  data() {
    return {
      autoLoginDelay: 3, // seconds
      authStatus: {},
      loginMsg: "",
      policyApplied: {},
      loading: false
    };
  },
  methods: {
    loginMeraki() {
      this.loading = true;
      this.authWifi()
        .then(res => {
          return this.applyPolicy();
        })
        .then(res => {
          return this.writeSessionData();
        })
        .then(res => {
          // Redirect to baseGrantUrl as failsafe login.
          window.location.replace(this.baseGrantUrl);
        })
        .catch(e => {
          console.log("loginMeraki error", e);
          // Redirect to baseGrantUrl as failsafe login.
          window.location.replace(this.baseGrantUrl);
          return e;
        });
    },
    writeSessionData() {
      const database = firebase.database();
      const timestamp = new Date().getTime();
      const data = {
        user: JSON.parse(JSON.stringify(this.user)), // trick to avoid undefined properties in the object, which breaks firebase db
        merakiAuthStatus: this.authStatus,
        clientMac: this.clientMac,
        clientIp: this.clientIp,
        nodeMac: this.nodeMac,
        userContinueUrl: this.userContinueUrl,
        policy: this.policyApplied
      };
      return database.ref("wifiLogins/" + timestamp).set(data);
    },
    applyPolicy() {
      const data = {
        networkId: this.netId,
        clientMac: this.clientMac
      };
      return this.axios
        .post("/merakiPolicy", data)
        .then(res => {
          this.policyApplied = res.data;
          console.log("Meraki Policy applied", this.policyApplied);
        })
        .catch(e => {
          console.log("failed to apply policy ", e);
          this.policyApplied = false;
        });
    },
    authWifi() {
      const data = {
        networkId: this.netId,
        ssidNum: this.ssidNum,
        clientMac: this.clientMac,
        isAuthorized: true
      };
      return this.axios
        .post("/merakiAuth", data)
        .then(res => {
          console.log("meraki auth", res.data);
          // Save auth session
          this.authStatus = res.data;
          this.loginMsg =
            "Authenticated with Meraki \n" + String(this.authStatus);
        })
        .catch(e => {
          this.loginMsg = "splash auth error:" + e;
          this.authStatus = e;
          console.log("splash error", e);
        });
    }
  },
  computed: {
    baseGrantUrl() {
      return this.$store.state.baseGrantUrl;
    },
    clientMac() {
      return this.$store.state.clientMac;
    },
    nodeMac() {
      return this.$store.state.nodeMac;
    },
    clientIp() {
      return this.$store.state.clientIp;
    },
    userContinueUrl() {
      return this.$store.state.userContinueUrl;
    },
    user() {
      return this.$store.state.user;
    },
    merakiDetails() {
      return this.$store.state.merakiDetails;
    },
    netId() {
      return this.$store.state.merakiDetails["netId"];
    },
    ssidNum() {
      return this.merakiDetails["ssidNum"];
    }
  }
};
</script>
