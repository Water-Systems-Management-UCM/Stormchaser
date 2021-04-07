<template>
  <v-container>
    <div v-html="$store.getters.current_model_area.main_help_page_content">
    </div>
  </v-container>
</template>

<script>
export default {
  name: "Help"
}
</script>

<style scoped>

</style>