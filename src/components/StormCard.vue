<template>
    <v-card
            class="storm_card"
            :class="class_name"
            elevation="5"
            min-width=100
            max-width=500
            :title="title">
        <slot></slot>
        <!-- when the card_item id is null, it means it's the default item - don't let them deactivate those -->
        <button class="remove_card" v-if="this.card_item.active && this.card_item.default !== true" @click="$emit('card-deactivate')">X</button>
    </v-card>
</template>

<script>
    export default {
        name: "StormCard",
        props: {'title': String,
            'class_name': String,
            'card_item': Object
        },
    }
</script>

<style scoped>

</style>