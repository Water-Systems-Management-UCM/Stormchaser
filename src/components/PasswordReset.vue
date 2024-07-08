<template>
  <v-row>
    <v-col id="middle_col" class="login col-10 offset-1 col-md-6 offset-md-3">
      <v-row>
        <v-col class="col-12">
          <h1>Reset Password</h1>
        </v-col>
      </v-row>
      <v-row v-if="!is_logged_in() === true" id="middle_col" class="">
        <v-col class="">
          <notification-snackbar
            v-model="login_failed_snackbar"
            constant_snackbar_text="Failed to log you in"
            :error_text="login_failed_text"
          ></notification-snackbar>
          <h2>Account Info</h2>
          <v-form @submit.prevent="do_reset">
            <v-text-field
              v-model="username"
              id="email"
              label="Email"
              required
              :rules="username_rules"
            >
            </v-text-field>

            <v-btn type="submit" :disabled="!form_valid_email" id="log_in_button">Submit</v-btn>
            <p id="emailSent">{{ instructionsText }}</p>
          </v-form>
        </v-col>
      </v-row>
      <v-row v-if="is_logged_in()" id="middle_col" class="">
        <v-col class="">
          <notification-snackbar
            v-model="login_failed_snackbar"
            constant_snackbar_text="Failed to log you in"
            :error_text="login_failed_text"
          ></notification-snackbar>
          <h2>New Password</h2>
          <v-form @submit.prevent="do_reset">
            <v-text-field
              v-model="password"
              id="password"
              label=" Password"
              required
              :rules="password_rules"
            >
            </v-text-field>
            <v-text-field
              v-model="confirm_password"
              id="confirm_password"
              label="Confirm Password"
              required
              :rules="confirm_password_rules"
            >
            </v-text-field>

            <v-btn type="submit" :disabled="!form_valid_password" id="log_in_button">Submit</v-btn>
<!--            <p id="emailSent">{{ instructionsText }}</p>-->
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
import NotificationSnackbar from "./NotificationSnackbar.vue";
export default {
  name: "PasswordReset",
  components: { NotificationSnackbar },
  data: function () {
    return {
      username: null,
      password: null,
      confirm_password: null,
      instructionsText: '',
      login_failed_snackbar: false,
      login_failed_text: "",
      username_rules: [
        (v) => !!v || "email is required",
        (v) => v.includes('@') || "Email must contain @",
      ],
      password_rules: [
          (v) => !!v || "Password is required",
          (v) => v != null,
        ],
      confirm_password_rules: [
        v => !!v || 'Confirmation password is required',
        v => v === this.password || 'Passwords must match',
        (v) => v != null,
      ],
    };
  },
  methods: {
    get_token_from_storage(){
      let session_data = window.sessionStorage;
      this.$store.commit("set_api_token", session_data.getItem("waterspout_token")); // set the value, then return
      if (this.$store.state.user_api_token !== null && this.$store.state.user_api_token !== undefined && this.$store.state.user_api_token !== ""){ // we might not want to do this here - creates a side effect?
        this.$store.dispatch("fetch_variables");  // get the application data then - currently will fill in the token *again*, but this basically triggers application setup
      }
    },
    do_reset() {                                      // replace after creating endpoint
      let login_promise = this.$store.dispatch("do_password_reset", {
        username: this.username,
        // password: this.password,
        instructionsText: "Email sent"
      });

      login_promise
        .then((response) => {
          if ("non_field_errors" in response) {
            this.login_failed_text = response.non_field_errors[0]; // show just the first item - it'll be a list, but let's just tell them one by one right now
            this.login_failed_snackbar = true;

          }
        })
        .catch(() => {
          this.login_failed_text = "Failed to communicate with server for login";
          this.login_failed_snackbar = true;
        });
    },
    is_logged_in: function(){
      let token = this.$store.state.user_api_token;
      if (token !== null && token !== undefined && token !== ""){
        return true; // return quickly if we're logged in, otherwise, check sessionStorage first, then return false
      }

      // now see if we have it in storage
      this.get_token_from_storage();
      token = this.$store.state.user_api_token;  // get it again, it might have changed
      return token !== null && token !== undefined && token !== "";
    },
  },
  computed: {
    form_valid_password: function () {
      return this.password === this.confirm_password && this.password != null;
    },
    form_valid_email: function () {
      return this.username;
    },

  },
};
</script>

<style scoped lang="stylus">
#middle_col
  div.row
    margin-top: 5%;
    background-color: rgba(255,255,255,0.75);
    border-radius: 10px;
</style>