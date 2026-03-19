<template>
<v-card class="pa-4">
      <v-row align="center" no-gutters>
        <v-col>
          <v-row>
            <v-file-input
                label="Upload CSV"
                chips
                prepend-icon="mdi-upload"
                variant="filled"
                max-width="40%"
                height="117px"
                accept="application/csv, .csv"
                v-model="uploaded_file_modifications"
            >
            </v-file-input>
             <v-tooltip width="450" interactive>
              <template #activator="{ props }">
                <v-icon v-bind="props">
                  mdi-help-circle
                </v-icon>
              </template>

              <div class="pa-3">
                To apply modifications from a file, it must follow the required CSV format.

                <br><br>

                The headers must be:
                <strong>
                  type, name, region, price_shortage_%, yield_shortage_%,
                  land_shortage_%, rainfall_shortage_%, irrigation_shortage_%
                </strong>

                <br><br>

                <strong>type</strong>: Specify whether the modification applies to a <em>region</em> or a <em>crop</em>.<br>
                <strong>name</strong>: The specific crop or region name, or use <em>all</em> to apply globally.<br>
                <strong>region</strong>: The target region, or <em>all</em> to apply to every region.<br>
                <strong>*_shortage_%</strong>: Enter the percentage increase or decrease to apply.
                Use positive values to increase and negative values to decrease.
                Leave blank if no modification is needed.

                <br><br>

                You can download a template file using the button below to ensure the correct format.
              </div>
            </v-tooltip>

          </v-row>
          <v-btn
              variant="text"
              @click="download_template"

          >
            Download CSV Template
          </v-btn>

        </v-col>
        <v-row>
          <v-col v-if="uploaded_file_modifications">
            <v-sheet border rounded>
              <v-data-table
                  :headers="upload_headers"
                  :items="table_items"
                  :hide-default-footer="table_items.length < 11"
                  item-key="name"
              >
                <!-- Toolbar -->
                <template #top>
                  <v-toolbar flat>
                    <v-toolbar-title>
                      <v-icon icon="mdi-file-table" start size="small"></v-icon>
                      Uploaded Modifications
                    </v-toolbar-title>

                    <v-spacer />

                    <v-btn
                        prepend-icon="mdi-refresh"
                        rounded="lg"
                        border
                        text="Re-Parse"
                        @click="parseFile"
                    />
                  </v-toolbar>
                </template>

                <template #item.type="{ value }">
                  <v-chip
                      :text="value"
                      border="thin opacity-25"
                      prepend-icon="mdi-shape"
                      label
                  />
                </template>

                <!-- Actions column -->
                <template #item.actions="{ item }">
                  <div class="d-flex ga-2 justify-end">
                    <v-icon
                        icon="mdi-pencil"
                        size="small"
                        @click="edit(item)"
                    />
                    <v-icon
                        icon="mdi-delete"
                        size="small"
                        @click="remove(item)"
                    />
                  </div>
                </template>

                <!-- No data -->
                <template #no-data>
                  <v-btn
                      prepend-icon="mdi-refresh"
                      text="Re-Parse File"
                      variant="text"
                      border
                      @click="parseFile"
                  />
                </template>
              </v-data-table>
              <v-dialog v-model="dialog" max-width="300">
                <v-card :title="isEditing ? 'Edit Row' : 'Add Row'">
                  <v-card-text>
                    <v-text-field v-model="formModel.type" label="Type" />
                    <v-text-field v-model="formModel.name" label="Name" />
                    <v-text-field v-model="formModel.region" label="Region" />

                    <v-text-field v-model="formModel['price_shortage_%']" label="Price %" />
                    <v-text-field v-model="formModel['yield_shortage_%']" label="Yield %" />
                    <v-text-field v-model="formModel['land_shortage_%']" label="Land %" />
                    <v-text-field v-model="formModel['rainfall_shortage_%']" label="Rainfall %" />
                    <v-text-field v-model="formModel['irrigation_shortage_%']" label="Irrigation %" />
                  </v-card-text>

                  <v-card-actions>
                    <v-spacer />
                    <v-btn text="Cancel" @click="dialog = false" />
                    <v-btn text="Save" @click="save" />
                  </v-card-actions>
                </v-card>
              </v-dialog>
            </v-sheet>
          </v-col>

        </v-row>

      </v-row>
      <v-alert
          title="CSV data applied"
          text="The model run has been auto-filled using the uploaded file. Please review the values and make any necessary changes by going back to Region/Crop modifications. Please note you may experience some freezing if the file you uploaded includes a lot of changes."
          type="warning"
          v-if="uploaded_file_modifications"
      ></v-alert>
<!--      <v-alert-->
<!--          title="Limits Exceeded"-->
<!--          text="One or more of the values from the file exceeded the minimum or maximum limit. Min/max value was applied instead of the file input."-->
<!--          type="info"-->
<!--          v-if="limits_exceeded"-->
<!--      >-->
<!--        <v-data-table-->
<!--          :items="limits_exceeded_list"-->
<!--        >-->
<!--        </v-data-table>-->
<!--      </v-alert>-->
    </v-card>
</template>

<script>
import {defineComponent, toRaw} from 'vue'
import SimpleTooltip from "./SimpleTooltip.vue";
import Papa from 'papaparse';

export default defineComponent({
  name: "FileUploader",
  components: {SimpleTooltip},
  data: function(){
    return{
      uploaded_file_modifications: null,
      upload_headers: [
        { title: 'Type', key: 'type' },
        { title: 'Name', key: 'name' },
        { title: 'Price %', key: 'price_shortage_%' },
        { title: 'Yield %', key: 'yield_shortage_%' },
        { title: 'Land %', key: 'land_shortage_%' },
        { title: 'Irrigation %', key: 'irrigation_shortage_%' },
        { title: 'Rainfall %', key: 'rainfall_shortage_%' },
        { title: 'Region', key: 'region' },
        { title: 'Min Area', key: 'minArea' },
        { title: 'Max Area', key: 'maxArea' },
        // { title: 'Actions', key: 'actions', sortable: false }
      ],
      table_items: [],
      dialog: false,
      isEditing: false,
      editedIndex: -1,
      formModel: {
        type: '',
        name: '',
        region: '',
        'price_shortage_%': '',
        'yield_shortage_%': '',
        'land_shortage_%': '',
        'rainfall_shortage_%': '',
        'irrigation_shortage_%': ''
      },
      limits_exceeded: false,
      limits_exceeded_list: [],
    }
  },
  props: {
    default_region: Object,
    default_crop: Object,
    selected_crops: Array,
    selected_regions: Array,
    available_crops: Array,
    available_regions: Array,
    model_creation_step: Number,
  },
  watch: {
    uploaded_file_modifications() {
      const required_headers = [
        'type',
        'name',
        'region',
        'price_shortage_%',
        'yield_shortage_%',
        'land_shortage_%',
        'rainfall_shortage_%',
        'irrigation_shortage_%',
        'minArea',
        'maxArea',
      ]

      if (!this.uploaded_file_modifications) return

      Papa.parse(this.uploaded_file_modifications, {
        header: true,
        complete: (result) => {

          const headers = result.meta.fields

          // Validate headers
          const missing = required_headers.filter(h => !headers.includes(h))
          if (missing.length > 0) {
            console.error(`Missing required headers: ${missing.join(', ')}`)
            return
          }

          for (let row of result.data) {

            // skip incomplete data
            if (!row.type || !row.name) continue

            // Apply case safe
            const type = row.type.toLowerCase().trim()

            if (type === 'region') {
              this.apply_region_row(row)
            }

            else if (type === 'crop') {
              this.apply_crop_row(row)
            }

            else {
              console.warn(`Unknown type: ${row.type}`)
            }
          }
          // Emitting here to update model creation page. MakeModelRun has a method to check if this has been changed
          this.parseFile();
          this.$emit("update_creation_step", this.uploaded_file_modifications);
          this.$emit('refresh_crop_regions', this.uploaded_file_modifications)
        }
      })
    },
  },
  methods: {
    download_template() {
      const template = `type,name,price_shortage_%,yield_shortage_%,minArea,maxArea,region,land_shortage_%,rainfall_shortage_%,irrigation_shortage_%\nregion,all,all,,,,,\ncrop,all,all,,,,,`

      const blob = new Blob([template], { type: 'text/csv;charset=utf-8;' })
      const link = document.createElement('a')
      link.href = URL.createObjectURL(blob)
      link.download = 'model_modifications_template.csv'
      link.click()
    },
    reset_model_details(){
      console.log("DEBUG - resetting");
      this.default_crop = {
          'waterspout_data': {crop_id: null, name: 'All Crops', crop_code: null, id: null},
          'crop_code': null,
          'yield_proportion': 100,
          'price_proportion': 100,
          'area_restrictions': [0, null], // 0 and -1 means no upper limit.
          'default': true,
          'active': true, // active by default - we need to make it unremovable too
        };
      this.default_region = {
          'region': {id: null, name: 'All Regions', internal_id: null, external_id: null},
          'land_proportion': 100,  // not actually proportions right now - they're percents and we'll make them proportions when we send them
          'water_proportion': 100,
          'rainfall_proportion': 100,
          'default': true,
          'active': true, // active by default - we need to make it unremovable too
        };

      for(let i = 0; i < this.selected_crops.length; i++){
        if(this.selected_crops[i].active){
          this.selected_crops[i].active = false;
        }
      }
      for(let i = 0; i < this.selected_regions.length; i++){
        if(this.selected_regions[i].active){
          this.selected_regions[i].active = false;
          this.selected_regions = this.selected_regions.splice(i, 1);
        }
      }

      this.selected_crops = this.default_settings.selected_crops;
      this.selected_regions = this.default_settings.selected_region;
      this.uploaded_file_modifications = null;
    },
    parseFile() { // Handles how the upload table is populated.
      if (!this.uploaded_file_modifications) return

      const required_headers = [
        'type',
        'name',
        'region',
        'price_shortage_%',
        'yield_shortage_%',
        'land_shortage_%',
        'rainfall_shortage_%',
        'irrigation_shortage_%',
        'minArea',
        'maxArea'
      ]

      Papa.parse(this.uploaded_file_modifications, {
        header: true,
        skipEmptyLines: true,
        complete: (result) => {
          const headers = result.meta.fields || []

          // Validate headers
          const invalid = headers.filter(
            h => !required_headers.includes(h)
          )

          if (invalid.length > 0) {
            console.error(`Invalid headers: ${invalid.join(', ')}`)
            return
          }

          this.table_items = result.data.map(row => ({
            type: row.type,
            name: row.name,
            region: row.region,
            'price_shortage_%': row['price_shortage_%'],
            'yield_shortage_%': row['yield_shortage_%'],
            'land_shortage_%': row['land_shortage_%'],
            'rainfall_shortage_%': row['rainfall_shortage_%'],
            'irrigation_shortage_%': row['irrigation_shortage_%'],
            'minArea': row['minArea'],
            'maxArea': row['maxArea']
          }))
        }
      })
    },
    edit(row) {
      this.isEditing = true
      this.editedIndex = this.table_items.indexOf(row)
      this.formModel = { ...row } // clone row
      this.dialog = true
    },
    save() {
      if (this.isEditing && this.editedIndex > -1) {
        this.table_items[this.editedIndex] = { ...this.formModel }
      }

      this.dialog = false
      this.isEditing = false
      this.editedIndex = -1
    },
    remove(row) {
      this.table_items = this.table_items.filter(
        r => r.name !== row.name
      )
    },
    check_limits(val, limits, type){
      if(val < limits[0] || val > limits[1]){
        this.limits_exceeded = true;
      }
      if(type){
        this.limits_exceeded_list.push(type);
      }
    },

    modelDefaults() {
      return this.$store.getters.current_model_area.model_defaults;
    },

    clamp(value, min, max) {
      return Math.min(Math.max(value, min), max);
    },

    applyProportion(target, prop, rawValue, minKey, maxKey) {
      if (isNaN(rawValue) || rawValue === null || rawValue === undefined) return;

      const defaults = this.modelDefaults();
      const min = defaults[minKey];
      const max = defaults[maxKey];
      const check_val = 100 + rawValue;
      const clamped = this.clamp(check_val, min, max);

      if (clamped !== check_val) {
        console.log(`DEBUG - applying ${clamped === min ? 'min' : 'max'}`);
      }

      target[prop] = clamped;
      this.check_limits(check_val, [min, max]);
    },

    apply_all_region_row(row) {
      const { land, rainfall, irrigation } = this.parseShortages(row);

      this.applyProportion(this.default_region, 'land_proportion',     land,      'min_land',     'max_land');
      this.applyProportion(this.default_region, 'rainfall_proportion', rainfall,  'min_rainfall', 'max_rainfall');
      this.applyProportion(this.default_region, 'water_proportion',    irrigation,'min_water','max_water');
    },

    apply_region_row(row) {
      const name = row.name.toLowerCase().trim();
      const { land, rainfall, irrigation } = this.parseShortages(row);

      if (name === 'all') {
        this.apply_all_region_row(row);
        return;
      }

      const region = this.available_regions.find(r =>
        r.region.name.toLowerCase().includes(name)
      );

      if (!region) {
        console.warn(`Region not found: ${name}`);
        return;
      }

      this.applyProportion(region, 'land_proportion',     land,      'min_land',     'max_land');
      this.applyProportion(region, 'rainfall_proportion', rainfall,  'min_rainfall', 'max_rainfall');
      this.applyProportion(region, 'water_proportion',    irrigation,'min_water',    'max_water');

      this.selected_regions.push(region);
    },

    apply_all_crop_row(row) {
      const { price, yieldVal } = this.parseCropShortages(row);

      this.applyProportion(this.default_crop, 'price_proportion', price,    'min_price', 'max_price');
      this.applyProportion(this.default_crop, 'yield_proportion', yieldVal, 'min_yield', 'max_yield');
    },

    apply_crop_row(row) {
      const name = row.name.toLowerCase().trim();

      const { price, yieldVal } = this.parseCropShortages(row);
      let region_linked = null

      const normalize = (str) =>
        str
          .toLowerCase()
          .replace(/[^a-z0-9]/gi, '') // remove everything except letters & numbers
          .trim();

      if (row?.region) {
        const target = normalize(row.region);

        const match = this.available_regions.find(r => {
          const regionName = normalize(r.region.name);
          return regionName.includes(target);
        });

        if (match) {
          region_linked = match;
        }
      }


      if (row?.region) {
        const match = this.available_regions.find(r =>
          r.region.name.toLowerCase().includes(row.region.toLowerCase().trim())
        );
        if (match) {
          region_linked = match;
        }
      }
      if (name === 'all') {
        this.apply_all_crop_row(row);
        return;
      }

      const crop = this.available_crops.find(c =>
        c.name.toLowerCase() === name || c.crop_code.toLowerCase() === name
      );

      if (!crop) {
        console.warn(`Crop not found: ${name}`, row);
        return;
      }

      this.applyProportion(crop, 'price_proportion', price,    'min_price', 'max_price');
      this.applyProportion(crop, 'yield_proportion', yieldVal, 'min_yield', 'max_yield');

      let min_area = 0
      if(row?.minArea && row?.minArea !== ""){
        min_area = row?.minArea
      }

      let max_area = null;
      if(row?.maxArea && row?.maxArea !== ""){
        max_area = row?.maxArea
      }

      if (!crop.active && !this.selected_crops.find(sc =>
          sc.crop_code === crop.crop_code &&
          sc.region?.name === region_linked?.region?.name
        )) {
        this.activate_crop({
          crop_code: crop.crop_code,
          price: crop.price_proportion,
          yield: crop.yield_proportion,
          region: toRaw(region_linked).region,
          area_restrictions: [min_area, max_area]
        });
      }
    },

    parseShortages(row) {
      return {
        land:       parseFloat(row['land_shortage_%']),
        rainfall:   parseFloat(row['rainfall_shortage_%']),
        irrigation: parseFloat(row['irrigation_shortage_%']),
      };
    },

    parseCropShortages(row) {
      return {
        price:    parseFloat(row['price_shortage_%']),
        yieldVal: parseFloat(row['yield_shortage_%']),
      };
    },
    activate_region: function(event){
        console.log(event);
        event.active = !event.active;
    },
    activate_crop: function(crop_info){
      // debugger
        let crop_code = crop_info.crop_code;
        let base_crop = this.available_crops.find(a_crop => a_crop.crop_code === crop_code);
        let crop = { ...base_crop }; // clone

        crop.active = true

        // in some cases, we'll create the new card with the settings of an existing card
        'price' in crop_info ? crop.price_proportion = crop_info.price : null;
        'yield' in crop_info ? crop.yield_proportion = crop_info.yield : null;
        'auto_created' in crop_info ? crop.auto_created = crop_info.auto_created : null;
        'constraint_toggle' in crop_info ? crop.constraint_toggle = crop_info.constraint_toggle : null;
        'region' in crop_info ? crop.region = crop_info.region : null;
        'name' in crop_info ? crop.name = crop_info.name : null;
        'is_original_crop' in crop_info ? crop.is_original_crop = crop_info.is_original_crop : null;
      // if(crop_info.is_original_crop){
      //   crop.region = null;
      // }
        if(crop_info?.area_restrictions){
          crop.area_restrictions = [crop_info.area_restrictions[0], crop_info.area_restrictions[1]];

        }
        this.selected_crops.push(crop)  // toggles the active flag for us
    },

  },
  // computed: {
  // },
})
</script>

<style scoped lang="stylus">

  upload_row
    display: flex;
    align-items: center;
  reset_btn
    margin-left: auto;

</style>
