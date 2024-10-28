<template>
  <v-snackbar
      v-model="modelValue"
      top
      :timeout="timeout"
  >
    {{ constant_snackbar_text }}: {{ error_text }}

    <template v-slot:actions="{ attrs }">
      <v-btn
          v-bind="attrs"
          color="pink"
          text="{{error_text}}"
          @click="modelValue = null"
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
      default: 10000
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