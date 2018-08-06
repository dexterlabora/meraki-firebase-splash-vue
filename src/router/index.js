import Vue from "vue";
import Router from "vue-router";

//import Hello from "@/components/Hello";
import Splash from "@/components/Splash";
import FirebaseLogin from "@/components/FirebaseLogin";
import SignUp from "@/components/SignUp";
import LoggedOut from "@/components/LoggedOut";
import Terms from "@/components/Terms";
import firebase from "firebase";

Vue.use(Router);

let router = new Router({
  mode: "history",
  routes: [
    {
      path: "*",
      redirect: "/splash"
    },
    {
      path: "/",
      redirect: "/splash"
    },
    {
      path: "/splash",
      name: "Splash",
      component: Splash
    },
    {
      path: "/login",
      name: "Login",
      component: FirebaseLogin
    },
    {
      path: "/sign-up",
      name: "SignUp",
      component: SignUp
    },
    {
      path: "/logged-out",
      name: "LoggedOut",
      component: LoggedOut
    },
    {
      path: "/terms",
      name: "Terms",
      component: Terms
    }
  ]
});

// Protect routes
/*
router.beforeEach((to, from, next) => {
  let currentUser = firebase.auth().currentUser;
  let requiresAuth = to.matched.some(record => record.meta.requiresAuth);

  if (requiresAuth && !currentUser) next("splash");
  else if (!requiresAuth && currentUser) next("hello");
  else next();
});
*/

export default router;
