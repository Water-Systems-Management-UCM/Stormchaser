<template>
  <v-container>
    <div style="padding: 10px" v-html="$store.getters.current_model_area.main_help_page_content">
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
  h2{
    text-align: center;
  }
</style>