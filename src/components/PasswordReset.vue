<template>
  <v-row>
    <v-col id="middle_col" class="login col-10 offset-1 col-md-6 offset-md-3">
      <v-row>
        <v-col class="col-12">
          <h1>Reset Password</h1>
        </v-col>
      </v-row>
      <v-row v-if="!is_logged_in()" id="middle_col">
        <v-col>
          <notification-snackbar
            v-model="login_failed_snackbar"
            constant_snackbar_text="Failed to log you in"
            :error_text="login_failed_text"
          ></notification-snackbar>
          <h2>Account Info</h2>
          <v-form @submit.prevent="get_reset_link">
            <v-text-field
              v-model="username"
              id="email"
              label="Email"
              required
              :rules="username_rules"
            >
            </v-text-field>

            <v-btn type="submit" :disabled="!form_valid_email" id="log_in_button">Submit</v-btn>
            <p id="email_sent">{{ instructionsText }}</p>
          </v-form>
        </v-col>
      </v-row>
      <v-row v-if="is_logged_in()" id="middle_col">
        <v-col>
          <notification-snackbar
            v-model="login_failed_snackbar"
            constant_snackbar_text="Failed to log you in"
            :error_text="login_failed_text"
          ></notification-snackbar>
          <h2>New Password</h2>
          <v-form @submit.prevent="do_password_reset">
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
            <p id="email_sent"> <b>{{ instructionsText }}</b> </p>
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
      encoded_pk: null,
      temp_token: null,
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
    get_reset_link() {
      let login_promise = this.$store.dispatch("get_password_reset_link", {
        email: this.username,
      })

      login_promise
        .then((response => {
          if (response.message.length > 0){
            this.instructionsText += "Reset link has been sent, please check your email.";
          }
        }))
        .catch(response => {
          this.login_failed_text = "Email not found"
          this.login_failed_snackbar = true;
      })
    },
    do_password_reset(){
      let login_promise = this.$store.dispatch("do_password_reset", {
        password: this.password,
        encoded_pk: this.encoded_pk,
        token: this.temp_token
      })
        login_promise
          .then((response) =>{
              if(response.status === 200){
                this.instructionsText += "Password has been changed, redirecting to login."
              }
          });
    },

    is_logged_in: function(){ // url parser to check if user is logged in or using reset link
      let token = this.$store.state.user_api_token;

      // Split the path to extract parameters
      const path = window.location.hash;
      let pathSegments = path.split('#');

      if (pathSegments.length > 2 ) {
        pathSegments = pathSegments[2].split("/")
        this.encoded_pk = pathSegments[0];
        this.temp_token = pathSegments[1];
        return true
      }

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

#email_sent
    padding-top: 5px;
    text-decoration: bold;
    text-emphasis: #0d0d0d;
</style>