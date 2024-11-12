<template>
  <v-tooltip
      :text="text"
      width="450px"
  >
    <template #activator="{ props }">
      <span v-if="!text_only">
        <a v-if="link"
           :href="link"
           target="_blank"
        >
        <v-icon
          icon="mdi-information"
          :class="icon_class"
          :style="icon_style"
          :x-small="x_small"
          :small="small"
          :medium="medium"
          :large="large"
          :x-large="x_large"
          v-bind="props">
        </v-icon>
        </a>

        <v-icon
            v-if="!link"
            :style="icon_style"
            :class="icon_class"
            :x-small="x_small"
            :small="small"
            :medium="medium"
            :large="large"
            :x-large="x_large"
            >
        </v-icon>
      </span>
      <span v-if="text_only" v-on="on">
        <v-icon
          icon="mdi-information"
          v-bind="props">
        </v-icon>
        {{ text }}
      </span>
    </template>
    <span role="tooltip"><slot></slot><span v-if="link"> Click for more information in a new tab.</span></span>
  </v-tooltip>
</template>

<script>
import { defineComponent } from 'vue';

export default defineComponent({
  name: 'SimpleTooltip',

  props: {
    max_width: {
      default: '30em'
    },
    icon: {
      default: 'mdi-infomation'
    },
    text: {
      type: String,
      default: ''
    },
    text_only: {
      default: false
    },
    link: String,
    icon_class: {
      default: ''
    },
    icon_style: {
      default: ''
    },
    top: {
      default: false
    },
    bottom: {
      default: true
    },
    x_small: {
      default: false
    },
    small: {
      default: true
    },
    medium: {
      default: false
    },
    large: {
      default: false
    },
    x_large: {
      default: false
    },
  },
});
</script>

<style scoped>
</style>