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

<script setup>
const modelValue = defineModel();
const timeout = 5000;
</script>

<style scoped>
</style>