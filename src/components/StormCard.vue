<template>
    <v-card
            class="storm_card"
            :class="class_name"
            elevation="5"
            min-width=100
            :title="title">
        <slot></slot>
        <!-- when the card_item id is null, it means it's the default item - don't let them deactivate those -->
        <button class="remove_card"
                v-if="item_is_deletable" @click="$emit('card-deactivate')">X</button>
        <v-tooltip
            v-if="!item_is_deletable && !card_item.default"
            top
            max-width="30em"
        >
          <template v-slot:activator="{ on, attrs }">
            <v-icon
                class="remove_card"
                small
                v-bind="attrs"
                v-on="on">info</v-icon>
          </template>
          <span role="tooltip">You cannot remove this card right now - for crops, removal is typically disabled because the current "All Crops" settings
            are invalid (too low) for this crop.
          </span>
        </v-tooltip>
    </v-card>
</template>

<script>
    export default {
        name: "StormCard",
        props: {title: String,
            class_name: String,
            card_item: Object,
            is_deletable: Boolean,
        },
        computed: {
          item_is_deletable: function(){
            return this.card_item.active && this.card_item.default !== true && this.is_deletable
          }
        }
    }
</script>

<style scoped lang="stylus">
/* Cards */
.storm_card
  margin: 0.5em 1em
  padding: 1em

  .remove_card
    position:absolute
    top: 1em
    right: 1em
</style>