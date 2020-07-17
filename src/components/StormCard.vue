<template>
    <v-card
            class="storm_card"
            :class="class_name"
            elevation="5"
            min-width=100
            max-width=500
            :title="title">
        <slot></slot>
        <button class="add_card" v-if="!this.card_item.active" @click="$emit('card-activate')">Add</button>
        <button class="remove_card" v-if="this.card_item.active" @click="$emit('card-deactivate')">X</button>
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