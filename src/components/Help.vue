<template>
  <v-container>
    <div v-html="$store.getters.current_model_area.main_help_page_content">
    </div>
  </v-container>
</template>

<script>
import { defineComponent } from 'vue';

export default defineComponent({
  name: 'Help',
});
</script>

<style scoped>
</style>