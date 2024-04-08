<template>
  <v-snackbar
      v-model="modelValue"
      top
      :timeout="timeout"
  >
    {{ constant_snackbar_text }}: {{ error_text }}

    <template v-slot:action="{ attrs }">
      <v-btn
          v-bind="attrs"
          color="pink"
          text
          @click="modelValue = false"
      >
        Close
      </v-btn>
    </template>
  </v-snackbar>
</template>

<script>
import { defineComponent } from 'vue';
/* METAMORPH_START */





















export default defineComponent({
  name: 'NotificationSnackbar',

  props: {
    modelValue: Boolean,
    timeout: {
      type: Number,
      default: -1
    },
    constant_snackbar_text: String,
    error_text: String
  },

  watch: {
    value(){
      this.$emit('update:modelValue', this.modelValue);
    },
  },
});
</script>

<style scoped>


</style>