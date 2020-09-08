<template>
  <v-snackbar
      v-model="value"
      top
      :timeout="timeout"
  >
    {{ constant_snackbar_text }}: {{ error_text }}

    <template v-slot:action="{ attrs }">
      <v-btn
          color="pink"
          text
          v-bind="attrs"
          @click="value = false"
      >
        Close
      </v-btn>
    </template>
  </v-snackbar>
</template>

<script>
export default {
  name: "NotificationSnackbar",
  props: {
    value: Boolean,
    timeout: {
      type: Number,
      default: -1
    },
    constant_snackbar_text: String,
    error_text: String
  },
  watch: {
    value(){
      this.$emit('input', this.value);
    },
  }
}
</script>

<style scoped>

</style>