<template>
  <v-snackbar
      :value="value"
      @input="$event"
      top
      :timeout="timeout"
  >
    {{ constant_snackbar_text }}: {{ error_text }}

    <template v-slot:action="{ attrs }">
      <v-btn
          v-bind="attrs"
          color="pink"
          text
          @click="value = false"
      >
        Close
      </v-btn>
    </template>
  </v-snackbar>
</template>

<script>
import { ref } from 'vue';
export default {
  name: "NotificationSnackbar",
  setup(){
    const value = ref(false);
    const timeout = 5000;
  },
  // props: {
  //   value: Boolean,
  //   timeout: {
  //     type: Number,
  //     default: -1
  //   },
  //   constant_snackbar_text: String,
  //   error_text: String
  // },
  // watch: {
  //   value(){
  //     this.$emit('input', this.value);
  //   },
  // }
}
</script>

<style scoped>

</style>