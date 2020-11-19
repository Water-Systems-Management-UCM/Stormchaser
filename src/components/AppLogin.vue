<template>
  <v-layout row class="login_container">
    <v-row>
      <v-col id="middle_col" class="login col-md-6 offset-md-3">
        <notification-snackbar
          v-model="login_failed_snackbar"
          constant_snackbar_text="Failed to log you in"
          :error_text="login_failed_text"
        ></notification-snackbar>
        <h1 id="login_text">Login</h1>
        <v-form @submit.prevent="do_login">
          <v-text-field
            v-model="username"
            label="Username"
            required
            :rules="username_rules"
          >
          </v-text-field>
          <v-text-field
            v-model="password"
            label="Password"
            type="password"
            required
            :rules="password_rules"
          >
          </v-text-field>
          <v-btn type="submit" :disabled="!form_valid">Log In</v-btn>
        </v-form>
      </v-col>
    </v-row>
  </v-layout>
</template>

<script>
import NotificationSnackbar from "@/components/NotificationSnackbar";
export default {
  name: "AppLogin",
  components: { NotificationSnackbar },
  data: function () {
    return {
      username: null,
      password: null,
      login_failed_snackbar: false,
      login_failed_text: "",
      username_rules: [
        (v) => !!v || "Username is required",
        (v) => v.length >= 3 || "Invalid username",
      ],
      password_rules: [(v) => !!v || "Password is required"],
    };
  },
  computed: {
    form_valid: function () {
      return this.username && this.password;
    },
  },
  methods: {
    do_login() {
      let login_promise = this.$store.dispatch("do_login", {
        username: this.username,
        password: this.password,
      });

      login_promise
        .then((response) => {
          if ("non_field_errors" in response) {
            this.login_failed_text = response.non_field_errors[0]; // show just the first item - it'll be a list, but let's just tell them one by one right now
            this.login_failed_snackbar = true;
          }
        })
        .catch(() => {
          this.login_failed_text = "Unknown login error";
          this.login_failed_snackbar = true;
        });

      // try the login

      // if it works, set the token
      // then clear the username and password variables so they're not hanging around

      // If it doesn't work, then handle the error by reading the JSON and setting the snack bar error message

      // If it doesn't work and we can't read the JSON, note that an unknown error occurred (and an admin is notified??)
    },
  },
};
</script>

<style scoped>

.login_container{
  width: 100%;
}

#middle_col {
  margin-top: 10%;
  background-color: rgba(255,255,255,0.75);
  padding: 2%;
  border-radius: 10px;
}

#login_text {
  color: #333;
}
</style>