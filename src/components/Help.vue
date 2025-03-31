<template>
  <v-container>
    <div class="styled-content" id="content" style="padding: 10px" v-html="$store.getters.current_model_area.main_help_page_content">
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
  div#app_body div#content.styled-content p a.primary{
    background-color: pink;
  }

</style>