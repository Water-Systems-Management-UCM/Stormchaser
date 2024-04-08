<template>
  <v-row>
    <v-col id="middle_col" class="login col-10 offset-1 col-md-6 offset-md-3">
      <v-row>
        <v-col class="col-12">
          <h1>OpenAg</h1>
          <p>OpenAg is a web application and API for drought assessment and hydroeconomic decisions.
            It includes user choices for changing economic conditions, yield, land, and water policies and helps users
            understand impact of water reductions and recognize potential drought responses including changes in regional
            cropping patterns, water use, gross revenues, employment and value added.</p>
          <p><router-link :to="{name: 'about'}">Learn More</router-link></p>
        </v-col>
      </v-row>
      <v-row class="login_container">
        <v-col class="col-12">
          <notification-snackbar
            v-model="login_failed_snackbar"
            constant_snackbar_text="Failed to log you in"
            :error_text="login_failed_text"
          ></notification-snackbar>
          <h2 id="login_text">Login</h2>
          <v-form @submit.prevent="do_login">
            <v-text-field
              v-model="username"
              id="username"
              label="Username"
              :rules="username_rules"
            >
            </v-text-field>
            <v-text-field
              v-model="password"
              label="Password"
              id="password"
              type="password"
              :rules="password_rules"
            >
            </v-text-field>
            <v-btn type="submit" :disabled="!form_valid" id="log_in_button">Log In</v-btn>
          </v-form>
        </v-col>
      </v-row>
      <v-row>
        <v-col class="col-12">
          <p>Copyright {{ new Date().getYear() + 1900 }}, Regents of the University of California.</p>
          <p>Developed by the <a href="http://wsm.ucmerced.edu">Water Systems Management Lab</a>, <a href="https://vicelab.ucmerced.edu">ViceLab</a>,
            and the <a href="https://citris.ucmerced.edu">Center for Information Technology
              Research in the Interest of Society</a> (CITRIS) at UC Merced.</p>
        </v-col>
      </v-row>
    </v-col>
  </v-row>
</template>

<script>
import { defineComponent } from 'vue';
/* METAMORPH_START */























































import NotificationSnackbar from './NotificationSnackbar.vue';
export default defineComponent({
  name: 'AppLogin',
  components: { NotificationSnackbar },

  data: function () {
    return {
      username: null,
      password: null,
      login_failed_snackbar: false,
      login_failed_text: '',
      username_rules: [
        (v) => !!v || 'Username is required',
        (v) => v.length >= 3 || 'Invalid username',
      ],
      password_rules: [(v) => !!v || 'Password is required'],
    };
  },

  computed: {
    form_valid: function () {
      return this.username && this.password;
    },
  },

  methods: {
    do_login() {
      let login_promise = this.$store.dispatch('do_login', {
        username: this.username,
        password: this.password,
      });

      login_promise
        .then((response) => {
          if ('non_field_errors' in response) {
            this.login_failed_text = response.non_field_errors[0]; // show just the first item - it'll be a list, but let's just tell them one by one right now
            this.login_failed_snackbar = true;
          }
        })
        .catch(() => {
          this.login_failed_text = 'Failed to communicate with server for login';
          this.login_failed_snackbar = true;
        });

      // try the login

      // if it works, set the token
      // then clear the username and password variables so they're not hanging around

      // If it doesn't work, then handle the error by reading the JSON and setting the snack bar error message

      // If it doesn't work and we can't read the JSON, note that an unknown error occurred (and an admin is notified??)
    },
  },
});
</script>

<style lang="stylus" scoped>

#middle_col
  div.row
    margin-top: 5%;
    background-color: rgba(255,255,255,0.75);
    border-radius: 10px;

#login_text
  color: #333;

</style>