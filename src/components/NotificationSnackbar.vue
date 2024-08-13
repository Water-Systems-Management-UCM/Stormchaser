<template>
  <v-snackbar
      :modelValue="modelValue"
      @update:modelValue="$event"
      top
      :timeout="timeout"
  >
    {{ constant_snackbar_text }}: {{ error_text }}

    <template v-slot:action="{ attrs }">
      <v-btn
          v-bind="attrs"
          color="pink"
          text
          @click="modelValue = null"
      >
        Close
      </v-btn>
    </template>
  </v-snackbar>
</template>

<script>
import { ref, defineComponent } from 'vue';
export default defineComponent({
  name: 'NotificationSnackbar',

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
  setup(){
    const value = ref(false);
    const timeout = 5000;
  },
});
</script>

<style scoped>
</style>