<template>
    <StormCard :class_name="crop.waterspout_data.name + ' crop'"
               :title="title_text"
               @card-activate="activate"
               @card-deactivate="deactivate"
               :is_deletable="is_deletable"
               :side_banner="region_linked_text"
               :card_item="crop"
    >
      <h4 style="display:inline-block">{{ card_name }}

      </h4>        <v-row
        v-if="crop.auto_created === true"
        class="auto_added primary"
    >Automatically Added
      <SimpleTooltip
          :link="$store.state.docs_urls.make_model_runs.automatic_crop_card_addition"
          icon_style="margin-top:-0.25em;color: #fff"
        style="max-width:30em;"
      >This crop was automatically added to ensure its values stay within the calibrated range of results.
          The lower limit of the price and yield sliders varies by crop and interactions between their values. When you adjust
          the "All Crops" card values, if you exceed the limits of a crop, the crop is added automatically as a card here with
          its minimum values as you set them. You may still adjust the crop values - in some cases, further decreases in price
          or yield here will force an increase in the other slider, but in other cases, the addition of the card is advisory, but
          you may still adjust the values as desired.
      </SimpleTooltip>
    </v-row>

        <div class="crop_params" v-if="crop.active">
            <StormCardSlider
                v-model="crop.price_proportion"
                :initial_value="crop.price_proportion"
                :min="min_price"
                :max="default_limits.max_price"
                label="Price (%)"
                @userchanged="user_changed"
            >
            </StormCardSlider>
            <StormCardSlider
                    v-model="crop.yield_proportion"
                    :initial_value="crop.yield_proportion"
                    :min="min_yield"
                    :max="default_limits.max_yield"
                    label="Yield (%)"
                    @userchanged="user_changed"
            >
            </StormCardSlider>
            <StormCardRangeSlider
                v-model="crop.area_restrictions"
                :initial_value="[default_limits.min_crop_area, null]"
                :min="default_limits.min_crop_area"
                :max="default_limits.max_crop_area"
                label="Crop Area Restrictions (% of Calibrated)"
                tooltip_message="Set limits on the amount any given crop can change relative to its calibrated value during the optimization. For example, raising the minimum value of the slider to 50 means that as the model reallocates a crop within the region, it can't remove more than 50% of that crop's planted area. Raising it to 100% means that crop cannot lose acreage and can only gain acreage (note that land isn't added to total cropped area, but that a crop can add area in exchange for the loss of area in another crop). If you wish to add an upper limit to the crop to limit its growth, click Add Upper Limit, then adjust that end of the slider."
                @userchanged="user_changed"
            >
            </StormCardRangeSlider>

          <v-expansion-panels
              v-if="!is_all_crops_card && advanced_options_available"
              accordion
              flat
              tile
              style="border-top: 2px solid #ccc;"
              class="crop_card_advanced_options"
              :value="is_region_linked ? 0 : null"
          > <!-- the "value" item automatically expands the first panel so the dropdown is shown if the card is region linked -->
            <v-expansion-panel>
              <v-expansion-panel-header style="min-height: unset;">Advanced</v-expansion-panel-header>
              <v-expansion-panel-content>
                <div v-if="enable_region_linking">
                  <v-autocomplete
                      v-model="region"
                      :items="region_options"
                      item-text="name"
                      label="Link to Region"
                      return-object
                      class="sc_region_link_selection"
                  >
                    <template v-slot:prepend>
                      <p>Link to Region</p>
                      <SimpleTooltip
                          :link="$store.state.docs_urls.make_model_runs.region_linked_crop_cards"
                      >If you wish to make the changes in this crop card apply only to a single region, specify the region here.
                        If you wish for it
                        to apply to multiple regions, create separate cards for each - to create another card for a second
                        region, add the card for the original crop again and specify the region and the settings there.
                      </SimpleTooltip></template>

                  </v-autocomplete>
                </div>
              </v-expansion-panel-content>
            </v-expansion-panel>
          </v-expansion-panels>
        </div>
    </StormCard>
</template>

<script>
    import StormCard from "@/components/StormCard";
    import StormCardSlider from "@/components/StormCardSlider";
    import StormCardRangeSlider from "@/components/StormCardRangeSlider";
    import SimpleTooltip from "@/components/SimpleTooltip";

    export default {
        name: "CropCard",
        data() {
          return {
            // we define min price and yield here, even though they're actually props, because we're going to dynamically
            // alter them on the basis of what the user selects. We'll set these to their real model_area-specific default
            // values in the mounted() function - they should not be computed because we want to dynamically set them
            // as a parameter changes (*could* work to compute them, but would want to do some testing)
            min_price: 0,
            min_yield: 0,
            process_price_yield_changes: false,
            region: null,
            show_advanced:false,
          }
        },
        mounted() {
          this.min_price = this.default_limits.min_price
          this.min_yield = this.default_limits.min_yield
          this.balance_price_and_yield(true)
          if (this.crop.region){
            this.region = this.crop.region  // make the dropdown show the region if it's a regionlinked card on creation
          }
        },
        updated(){
          // soooo, this is an anti-pattern. Shouldn't be modifying a prop here - do we want to bubble up an event?
          this.crop.is_deletable = this.is_deletable  // sync the value to the crop itself so that we can check on it outside
        },
        components: {
          SimpleTooltip,
            StormCard,
            StormCardSlider,
            StormCardRangeSlider
        },
        props: {
            crop: Object,
            default_limits: Object,
            deletion_threshold: Number,
            region_options: Array,
            enable_region_linking: Boolean,
        },
        watch:{
            crop: {
              // we want to watch the crop price/yield proportions to make sure we won't end up with negative profits
              deep: true,
              handler(){ //(value){
                this.balance_price_and_yield()
                if(this.crop.region !== null && this.crop.region !== undefined){
                  this.region = this.crop.region;
                }
              }
            },
            is_deletable: function(){
              // soooo, this is an anti-pattern. Shouldn't be modifying a prop here - do we want to bubble up an event?
              this.crop.is_deletable = this.is_deletable  // sync the value to the crop itself so that we can check on it outside
            },
            region: function(new_val){ //, old_val){
              if(this.crop.is_original_crop){  // we'll send a signal up the ladder to create another generic card now that this one
                                      // is region linked, but only do it if this one was previously not linked.
                this.make_region_linked_card(new_val)
              }else{
                let crop_update = {
                  "crop_code": this.crop.crop_code,
                  "region": this.region,
                  "id": this.crop.waterspout_data.id,
                  //"name = this.crop.waterspout_data.name + " - " + this.crop.region.name;
                  //this.crop.crop_code = this.crop.waterspout_data.id + " - " + this.crop.region.id;
                }
                this.$emit("update-crop", crop_update)
              }
            }
        },
        methods: {
            make_region_linked_card: function(region){
              this.$emit("region-link", {crop: this.crop, region: region})
              if(this.crop.auto_created === true){  // if it was auto-created, then we want to keep things as they are, so create the region-linked card, then reset this card's options
                this.region = null;
                this.show_advanced = false;
              }
            },
            user_changed: function(){
              this.crop.auto_created = false;
            },
            balance_price_and_yield: function(is_auto_create){
              if(!(is_auto_create === true || this.process_price_yield_changes === true)){ // prevent it from running twice when it's created
                return
              }

              this.process_price_yield_changes = true;

              /*let price_changed = false;
                let yield_changed = false;

                // get the new version of value so we can figure out which slider changed
                if(value.yield_proportion - this.crop.yield_proportion != 0){ // this is float math, so we might want to multiply by 100 and round for the comparison
                  yield_changed = true;
                }else if(value.price_proportion - this.crop.price_proportion != 0){
                  price_changed = true;
                }else{
                  // none of the above - no change
                  return;
                }
                */

              let price_yield_correction_param = this.price_yield_correction_param
              let price_proportion = this.crop.price_proportion / 100
              let yield_proportion = this.crop.yield_proportion / 100

              // if they change crop values, remove the auto_created banner - they've now made it their own.
              // commented out 3/18/2021 because it was getting removed whenever we automatically created cards with sliders
              // that were way out of bounds. Need to resolve that before removing the flag
              //if(is_auto_create === undefined || is_auto_create === false){
              //  this.crop.auto_created = false;
              //}

              if(this.is_all_crops_card) {  // if it's the all_crops_card, we want to notify the parent of the current value when it changes
                this.$emit("price-yield-threshold", {price: price_proportion, yield: yield_proportion})
                return  // for all crops, we won't follow the rules - we're going to notify the parent of the current value, where it will create new cards for crops that dip below the threshold
              }

              if(!this.is_all_crops_card && !this.$store.getters.current_model_area.preferences.lock_price_yield_ratio){
                // if the model area has a preference set to not force price/yield upward when
                // we cross the threshold, then return. This should happen after the all crops checks
                return
              }

              // if the current configuration would generate negative profits, take corrective action
              if(price_proportion * yield_proportion < price_yield_correction_param){
                //if(price_changed){
                // if they changed the price, then we need to bump it back up to the level that when combined with yield,
                // it's greater than the correction param, then set both price and yield's current values as the minimum
                this.crop.price_proportion = (price_yield_correction_param / yield_proportion) * 100
                if(is_auto_create) { // when creating it, we want to update this proportion because it could be way out of whack
                  price_proportion = this.crop.price_proportion / 100  // update price_proportion so that yield proportion is properly set
                }
                //}else if(yield_changed){
                this.crop.yield_proportion = (price_yield_correction_param / price_proportion) * 100
                //}
                //this.min_price = this.crop.price_proportion;
                //this.min_yield = this.crop.yield_proportion;
              }else{
                // this is all commented out for now because we won't adjust the min values right now - I think it's
                // a confusing UX when those are changing - having the other slider forced upward is enough.


                // if it won't generate negative profits, allow the values to be modified further, up to the
                // default limits - basically, just recalculate the limits if we're not already at a negative value.
                // this is a bit tricky since they're not going to be equal values, so we can't just calculate one item

                //if(this.min_price === this.default_limits.min_price &&
                //    this.min_yield === this.default_limits.min_yield){
                // if they're at their defaults and profits aren't negative, short circuit and return now
                //  return;
                //}

                // > 1 means yield_proportion is larger, otherwise price proportion is larger - we have more space
                // to adjust the larger value's slider downward if we're currently locked
                //let adjustment_skew = value.yield_proportion / value.price_proportion
                //let allowable_amount = price_yield_correction_param - price_proportion * yield_proportion;

                //this.min_price = Math.max(this.default_limits.min_price / 100, price_proportion * (allowable_amount / adjustment_skew)) * 100
                //this.min_yield = Math.max(this.default_limits.min_yield / 100, yield_proportion * (allowable_amount * adjustment_skew)) * 100
              }
            },
            activate: function (){
                console.log("activating crop")
                this.crop.active = true;
                this.$emit("crop-activate")
            },
            deactivate: function(){
                console.log("deactivating crop")
                this.crop.active = false;
                this.$emit("crop-deactivate")
            },
        },
        computed: {
            is_region_linked: function(){
              return this.crop.region !== null && this.crop.region !== undefined;
            },
            region_linked_text: function(){
              if(this.is_region_linked){
                return "Region Linked";
              }
              return null;
            },
            advanced_options_available: function(){
              return this.enable_region_linking
            },
            title_text: function() {
                return `${this.crop.name}`
            },
            price_yield_correction_param: function(){
              let crop_id = this.crop.waterspout_data.id;
              if(crop_id === null){
                // this would be the all crops card
                return this.$store.getters.current_model_area.price_yield_corrections.default
              }

              if(!(this.crop.waterspout_data.id in this.$store.getters.current_model_area.price_yield_corrections)){
                // if the crop isn't in price_yield_corrections, then it's likely not in the calibrated dataset.
                // simplest option is to return 0 - let them make any modifications to it
                return 0
              }

              if(this.region === undefined || this.region === null || !(this.region.id in this.$store.getters.current_model_area.price_yield_corrections[this.crop.waterspout_data.id])){
                // if it's not region-linked, or it *is* region-linked and the crop isn't actually in that region (we don't have a price_yield correction for it)
                return this.$store.getters.current_model_area.price_yield_corrections[this.crop.waterspout_data.id].default
              }

              // we'll need to check on this once we actually have region links
              return this.$store.getters.current_model_area.price_yield_corrections[this.crop.waterspout_data.id][this.region.id]
            },
            is_all_crops_card: function(){
              return this.crop.waterspout_data.id === null
            },
            is_deletable: function(){
              // check if active is false - sometimes a race condition means that as it's being destroyed
              // it gets caught because the actual check for deletability is no longer valid
              return this.active === false || (this.region !== null && this.region !== undefined) || this.price_yield_correction_param <= this.deletion_threshold
            },
            card_name: function(){
              /*if("region" in this.crop) {
                return this.crop.waterspout_data.name + " - " + this.crop.region.name
              }else{*/
              return this.is_all_crops_card ? "All Crops" : this.crop.name
              //}
            }
        }
    }
</script>

<style lang="stylus">
.auto_added
  display: inline-block;
  font-size:0.8em;
  padding:0.25em 1em;
  margin-left: 1em;
  text-align:center;
  color:#fff;

.crop_card_advanced_options
  margin-top: 0.5em;

hide_accessibly()
  /* Position offscreen, rather than displaying None so that screen readers still see it */
  position: absolute !important;
  top: -9999px !important;
  left: -9999px !important;

div.v-input.v-autocomplete.sc_region_link_selection label.v-label
  hide_accessibly()

</style>