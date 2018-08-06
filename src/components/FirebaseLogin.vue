<template>
  <div>
    <v-card class="elevation-12">
      <v-card-text>
        <v-form ref="form" v-model="valid" lazy-validation>
          <v-text-field
            prepend-icon="email"
            v-model="email"
            :rules="emailRules"
            label="e-mail"
            required
          ></v-text-field>
          <v-text-field
            prepend-icon="lock"
            v-model="password"
            type="password"
            :rules="passwordRules"
            label="password"
            required
          ></v-text-field>
          <v-checkbox
            v-model="terms"
            :rules="[v => !!v || 'You must agree to continue!']"
            label="I agree with the Terms and Conditions"
            required
          ></v-checkbox>

          <v-btn
            :disabled="!valid"
            color="green"
            @click="submit"
          >
          submit
          </v-btn>
          <v-btn @click="clear">clear</v-btn>
        </v-form>
      </v-card-text>
    </v-card>
    <div class="pt-3"><span>Need an account? <router-link to="/sign-up">Sign Up</router-link>.</span></div>
    <div class="pt-3"><router-link to="/terms">Terms and Conditions</router-link></div>
  </div>
</template>

<script>
import firebase from "firebase";

export default {
  name: "login",
  data: function() {
    return {
      valid: true,
      name: "",
      passwordRules: [v => !!v || "Password is required"],
      email: "",
      password: "",
      emailRules: [
        v => !!v || "E-mail is required",
        v => /.+@.+/.test(v) || "E-mail must be valid"
      ],
      select: null,
      terms: false
    };
  },
  methods: {
    submit() {
      if (this.$refs.form.validate()) {
        this.signIn();
      }
    },
    clear() {
      this.$refs.form.reset();
    },
    signIn: function() {
      firebase
        .auth()
        .signInWithEmailAndPassword(this.email, this.password)
        .then(
          user => {
            this.logSession(user);
            //this.$router.replace("splash");
          },
          err => {
            alert("Oops. " + err.message);
          }
        );
    },
    logSession: function(user) {
      console.log("logSession user", user);
      this.$store.commit("user", user);
    }
  }
};
</script>

<style scoped>
/* "scoped" attribute limit the CSS to this component only */
.login {
  margin-top: 40px;
}
input {
  margin: 10px 0;
  width: 20%;
  padding: 15px;
}
button {
  margin-top: 20px;
  width: 10%;
  cursor: pointer;
}
p {
  margin-top: 40px;
  font-size: 13px;
}
p a {
  text-decoration: underline;
  cursor: pointer;
}
</style>
