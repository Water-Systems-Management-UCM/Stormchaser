<template>
  <v-flex>
    <v-flex style="margin: auto">
      <h2>Model Runs</h2>
      <div class="row" style="padding: 1%">
        <div class="col-md-1" id="left-col">
          <v-btn @click="refresh_model_runs">
            <v-icon>mdi-refresh</v-icon> Update
          </v-btn>
        </div>
        <div class="col-md-1" id="left-col">
          <v-btn dark v-bind="attrs" @click="confirm_delete_dialog = true">
            <v-icon>mdi-delete</v-icon> Delete
          </v-btn>
          <v-dialog v-model="confirm_delete_dialog" persistent max-width="30%">
            <v-card>
              <v-card-title class="headline"> Delete model runs? </v-card-title>
              <v-card-text
                >Would you like to delete the selected runs?</v-card-text
              >
              <v-card-actions>
                <v-spacer></v-spacer>
                <v-btn color="black" text @click="confirm_delete_dialog = false">
                  Cancel
                </v-btn>
                <v-btn color="red" text @click="delete_model_runs">
                  Confirm
                </v-btn>
              </v-card-actions>
            </v-card>
          </v-dialog>
        </div>
      </div>

      <!--<ul>
                <li v-for="m in $store.state.model_runs"
                v-bind:key="m.id"
                ><router-link :to="{name:'model-run', params:{id: m.id}}">{{ m.name }} - {{ m.date_submitted }}</router-link> </li>
            </ul>
            <p style="height:800px">&nbsp;</p>-->
      <v-data-table
        v-model="selected"
        :headers="headers"
        :items="model_runs"
        item-key="id"
        show-select
        multi-sort
        sort-by="date_submitted"
        sort-desc
        class="elevation-1 model_run_listing"
        items-per-page="20"
        @click:row="view_model_run"
      >
        <template v-slot:item.complete="{ item }">
          <span>{{ $stormchaser_utils.model_run_status_text(item) }}</span>
        </template>
      </v-data-table>
    </v-flex>
  </v-flex>
</template>

<script>
export default {
  name: "ListModelRuns",
  data: function () {
    return {
      confirm_delete_dialog: false,
      headers: [
        { text: "Run Name", value: "name" },
        { text: "Description", value: "description" },
        { text: "Date", value: "date_submitted" },
        { text: "Status", value: "complete" },
      ],
      selected: [

      ],
    };
  },
  methods: {
    view_model_run: function (item) {
      this.$router.push({ name: "model-run", params: { id: item.id } });
    },
    refresh_model_runs: function () {
      this.$store.dispatch("fetch_model_runs");
    },
    delete_model_runs: function () {
      this.confirm_delete_dialog = false;
      this.selected.forEach(model_run_data => {
        this.$store.dispatch("delete_model_run", model_run_data); 
      });
      this.$store.dispatch("fetch_model_runs");
    },
  },
  computed: {
    model_runs: function () {
      return Object.values(this.$store.getters.current_model_area.model_runs);
    },
  },
};
</script>

<style>
/* Not scoped because scoped classed incur a performance hit because of the way they use id selectors - using a class instead */
div.v-data-table.model_run_listing {
  cursor: pointer;
}
</style>