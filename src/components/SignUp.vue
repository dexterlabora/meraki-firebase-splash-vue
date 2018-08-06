
<template>
  <div>

            <h1>New Account Registration</h1>
            <p>Provide an email and password to access this network.</p>
            <v-card class="elevation-12">
              <v-card-text>
                <v-form ref="form" v-model="valid" lazy-validation>
                  <v-text-field
                    prepend-icon="email"
                    v-model="email"
                    :rules="emailRules"
                    label="E-mail"
                    required
                  ></v-text-field>
                  <v-text-field
                    prepend-icon="lock"
                    v-model="password"
                    :rules="passwordRules"
                    label="password"
                    required
                  ></v-text-field>
                  <!--v-checkbox
                    v-model="terms"
                    :rules="[v => !!v || 'You must agree to continue!']"
                    label="T&Cs"
                    required
                  ><a href="/terms">Read More</a></v-checkbox -->

                  <v-btn
                    :disabled="!valid"
                    color="green"
                    @click="submit"
                  >
                    Register
                  </v-btn>
                </v-form>
               
              </v-card-text>
            </v-card>
             <div class="pt-3"><span>or go back to <router-link to="/">login</router-link>.</span></div>
             <div class="pt-3"><router-link to="/terms">Terms and Conditions</router-link></div>

   </div>
</template>

<script>
import firebase from "firebase";

export default {
  name: "signUp",
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
      select: null
    };
  },
  methods: {
    submit() {
      if (this.$refs.form.validate()) {
        this.signUp();
      }
    },
    signUp: function() {
      firebase
        .auth()
        .createUserWithEmailAndPassword(this.email, this.password)
        .then(
          user => {
            this.$store.commit("user", user);
            this.$router.replace("hello");
          },
          err => {
            alert("Oops. " + err.message);
          }
        );
    }
  }
};
</script>

