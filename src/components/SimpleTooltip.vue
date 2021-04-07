<template>
  <v-tooltip
      :top="top"
      :bottom="bottom"
      :max-width="max_width"
  >
    <template v-slot:activator="{ on, attrs }">
      <v-icon
          :class="icon_class"
          :x-small="x_small"
          :small="small"
          :medium="medium"
          :large="large"
          :x-large="x_large"
          v-bind="attrs"
          v-on="on">{{ icon }}</v-icon>
    </template>
    <span role="tooltip">{{ message }}</span>
  </v-tooltip>
</template>

<script>
export default {
  name: "SimpleTooltip",
  props: {
    message: Text,
    max_width: {
      default: "30em"
    },
    icon: {
      default: "info"
    },
    icon_class: {
      default: ""
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
  }
}
</script>

<style scoped>

</style>