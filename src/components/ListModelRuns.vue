<template>
    <v-layout row >
        <v-flex xs12 lg12>
            <h2>Model Runs</h2>
            <ul>
                <li v-for="m in $store.state.model_runs"
                v-bind:key="m.id"
                ><router-link :to="{name:'model-run', params:{id: m.id}}">{{ m.name }} - {{ m.date_submitted }}</router-link> </li>
            </ul>
            <p style="height:800px">&nbsp;</p>
            <v-data-table
                    v-model="selected"
                    :headers="headers"
                    :items="$store.state.model_runs"
                    item-key="name"
                    show-select
                    class="elevation-1"
            >
            </v-data-table>
        </v-flex>
    </v-layout>
</template>

<script>
    export default {
        name: "ListModelRuns",
        data: function(){
            return {
                headers: [
                    {text: 'Run Name', value: 'name' },
                    {text: 'Date', value: 'date_submitted' },
                ]
            }
        }
    }
</script>

<style scoped>

</style>