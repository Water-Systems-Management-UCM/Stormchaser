<template>
  <v-row id="main_row">
    <v-col id="app_body" class="login col-6">
      <router-link :to="{name: 'home'}"><v-btn type="submit" id="home-btn">Home</v-btn></router-link>
      <v-row class="row">
        <v-col class="col-12">
          <h1>Reset Password</h1>
        </v-col>
      </v-row>
      <v-row v-if="!is_logged_in()" id="middle_col" class="col-1 row">
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
            <p id="email_sent"> <b>{{ instructionsText }}</b> </p>
          </v-form>
        </v-col>
      </v-row>
      <v-row v-if="is_logged_in()" id="middle_col">
        <v-col>
          <notification-snackbar
            v-model="login_failed_snackbar"
            constant_snackbar_text="Error"
            :error_text="login_failed_text"
          ></notification-snackbar>
          <div v-if="!temp_token">
            <h2 v-if="!temp_token">Enter Old Password</h2>
              <v-text-field
                v-model="old_password"
                id="old_password"
                label=" Password"
                required
                :rules="password_rules"
              >
              </v-text-field>
          </div>

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

    </v-col>
  </v-row>
  <v-row>
    <div style="padding-bottom: 100px"></div>
  </v-row>

</template>

<script>
import NotificationSnackbar from "./NotificationSnackbar.vue";
import {tr} from "vuetify/locale";
export default {
  name: "PasswordReset",
  components: { NotificationSnackbar },
  data: function () {
    return {
      username: null,
      password: null,
      old_password: null,
      encoded_pk: null,
      temp_token: null,
      is_temp_login: false,
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
  watch: {
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
            this.instructionsText = "Reset link has been sent. Please also check your spam folder.";
          }
        }))
        .catch(response => {
          this.login_failed_text = "Email not found"
          this.login_failed_snackbar = true;
      })
    },
    do_password_reset(){
      // Check if encoded_pk and token is empty if so,
      // this could mean the user is performing a password change
      if( this.encoded_pk === null || this.encoded_pk === undefined &&
          this.temp_token === null || this.temp_token === undefined && this.is_logged_in()){
            this.do_password_change();
      } else {
        let login_promise = this.$store.dispatch("do_password_reset", {
          password: this.password,
          encoded_pk: this.encoded_pk,
          token: this.temp_token
        })
          login_promise
            .then(response => {
              console.log("Response object:", response);
              if(response.ok){
                this.instructionsText = "Password has been reset";
              }
              else{
                console.log("Error:", response.status)
                this.login_failed_text = "Check token"
                this.login_failed_snackbar = true;
              }
              return response.json();
            })
      }
    },
    do_password_change(){
      // Created a different endpoint for alt flow of user already signed in
      const payload = {
        password: this.password,
        old_password: this.old_password,
        token: this.$store.state.user_api_token
      }
      let password_change_promise = this.$store.dispatch("do_password_change", payload)
      password_change_promise
          .then((response) => {
            if(response.status === 200){
              this.instructionsText = "Password has been changed";
            } else {
              console.log(response)
              this.instructionsText = "Error: Check your password";
            }
          })
    },

    is_logged_in: function(){ // url parser to check if user is logged in or using reset link
      let token = this.$store.state.user_api_token;

      // Parse the url for params
      this.encoded_pk = this.$route.query.encoded_pk;
      this.temp_token = this.$route.query.token;

      if (this.encoded_pk !== null && this.encoded_pk !== '' && this.encoded_pk !== undefined &&
          this.temp_token !== null && this.temp_token !== '' && this.temp_token !== undefined) {
        return true;
      }

      if (token !== null && token !== undefined && token !== ""){
        return true; // return quickly if we're logged in, otherwise, check sessionStorage first, then return false
      }

      // now see if we have it in storage
      this.get_token_from_storage();
      token = this.$store.state.user_api_token;  // get it again, it might have changed
      this.temp_token = token
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
#home-btn
  background-color: #2a76d2
#email_sent
    padding-top: 5px;
    text-align center

div#main_row
  margin-top: 5%;
  border-radius: 10px;
  width 80%
  padding-left 20%

div#app_body
  margin-top: 1%;
  border-radius: 10px;
  font-family: "Source Sans Pro", Helvetica, Arial, sans-serif
  font-size: 1.15em;
  -webkit-font-smoothing: antialiased
  -moz-osx-font-smoothing: grayscale
  background-color: rgba(255,255,255,0.8);
  padding: 1em

  h3, h4
    font-weight: normal;

  h4
    font-variant: small-caps


.loading_icon
  position: absolute;
  -webkit-animation:spin 1.5s linear infinite;
  -moz-animation:spin 1.5s linear infinite;
  animation:spin 1.5s linear infinite;


</style>