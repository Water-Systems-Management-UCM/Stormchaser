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
          <div v-if="this.selected.length >= 1">
            <v-btn
              dark
              color="delete"
              v-bind="attrs"
              @click="
                confirm_delete_dialog
                  ? perform_delete_self()
                  : begin_delete_self()
              "
              :class="{
                active: confirm_delete_dialog,
                sc_model_run_delete: true,
              }"
            >
              <v-icon>mdi-delete</v-icon>
              <span id="sc_delete_placeholder"></span>
            </v-btn>
          </div>
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
      selected: [],
    };
  },
  methods: {
    view_model_run: function (item) {
      this.$router.push({ name: "model-run", params: { id: item.id } });
    },
    refresh_model_runs: function () {
      this.$store.dispatch("fetch_model_runs");
    },
    begin_delete_self: function () {
      this.confirm_delete_dialog = true;
      let _this = this;
      setTimeout(function () {
        _this.confirm_delete_dialog = false;
      }, 5000);
    },
    perform_delete_self: function () {
      // Runs the actual deletion of model runs - only triggered if begin_delete_self has already been run (which
      // makes this the handler for the next click

      // set up the snackbar
      this.model_run_info_snackbar_constant_text = "Failed to delete model run";

      // Don't even try to delete base cases
      if (this.model_runs.is_base) {
        this.model_run_info_snackbar_text = "Can't delete base cases";
        this.model_run_info_snackbar = true;
        return;
      }

      // otherwise, try to delete it
      this.selected.forEach((model_run_data) => {
        this.$store.dispatch("delete_model_run", model_run_data);
      });

      this.$store.dispatch("fetch_model_runs");
      this.selected = 0
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

<style lang="stylus">
.sc_model_run_delete, #sc_delete_placeholder:after {
  content: 'Delete';
}

.sc_model_run_delete.active, .v-btn.v-btn--flat.v-btn--outlined.sc_model_run_delete.active {
  #sc_delete_placeholder:after {
    /* Change text acter the active toggle is switched */
    content: 'Click to Confirm Deletion';
  }
}
</style>