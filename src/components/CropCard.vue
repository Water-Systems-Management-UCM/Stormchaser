<template>
    <StormCard class_name="crop"
               :title="title_text"
               @card-activate="activate"
               @card-deactivate="deactivate"
               :is_deletable="is_deletable"
               :card_item="crop"
    >
      <h4 style="display:inline-block">{{ crop.crop.name }}

      </h4>        <v-row
        v-if="crop.auto_created === true"
        class="auto_added primary"
    >Automatically Added
      <v-tooltip top
                 max-width="30em"
      >
        <template v-slot:activator="{ on, attrs }">
          <v-icon
              small
              style="margin-top:-0.25em;color: #fff"
              v-bind="attrs"
              v-on="on">info</v-icon>
        </template>
        <span role="tooltip">This crop was automatically added to ensure its values stay within the calibrated range of results.
          The lower limit of the price and yield sliders varies by crop and interactions between their values. When you adjust
          the "All Crops" card values, if you exceed the limits of a crop, the crop is added automatically as a card here with
          its minimum values as you set them.
        </span>
      </v-tooltip>
    </v-row>

        <div class="crop_params" v-if="crop.active">
            <StormCardSlider
                v-model="crop.price_proportion"
                :initial_value="crop.price_proportion"
                :min="min_price"
                :max="default_limits.max_price"
                label="Price (%)"
            >
            </StormCardSlider>
            <StormCardSlider
                    v-model="crop.yield_proportion"
                    :initial_value="crop.yield_proportion"
                    :min="min_yield"
                    :max="default_limits.max_yield"
                    label="Yield (%)"
            >
            </StormCardSlider>
            <StormCardRangeSlider
                v-model="crop.area_restrictions"
                :initial_value="[default_limits.min_crop_area,default_limits.max_crop_area]"
                :min="default_limits.min_crop_area"
                :max="default_limits.max_crop_area"
                label="Crop Area Restrictions (% of Calibrated)">

            </StormCardRangeSlider>
        </div>
    </StormCard>
</template>

<script>
    import StormCard from "@/components/StormCard";
    import StormCardSlider from "@/components/StormCardSlider";
    import StormCardRangeSlider from "@/components/StormCardRangeSlider";

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
            process_price_yield_changes: false
          }
        },
        mounted() {
          this.min_price = this.default_limits.min_price
          this.min_yield = this.default_limits.min_yield
          this.balance_price_and_yield(true)
        },
        updated(){
          // soooo, this is an anti-pattern. Shouldn't be modifying a prop here - do we want to bubble up an event?
          this.crop.is_deletable = this.is_deletable  // sync the value to the crop itself so that we can check on it outside
        },
        components: {
            StormCard,
            StormCardSlider,
            StormCardRangeSlider
        },
        props: {
            crop: Object,
            region: Object,
            default_limits: Object,
            deletion_threshold: Number,
        },
        watch:{
            crop: {
              // we want to watch the crop price/yield proportions to make sure we won't end up with negative profits
              deep: true,
              handler(){ //(value){
                this.balance_price_and_yield()
              }
            },
            is_deletable: function(){
              // soooo, this is an anti-pattern. Shouldn't be modifying a prop here - do we want to bubble up an event?
              this.crop.is_deletable = this.is_deletable  // sync the value to the crop itself so that we can check on it outside
            }
        },
        methods: {
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
            title_text: function() {
                return `${this.crop.crop.name}`
            },
            price_yield_correction_param: function(){
              let crop_id = this.crop.crop.id;
              if(crop_id === null){
                // this would be the all crops card
                return this.$store.getters.current_model_area.price_yield_corrections.default
              }

              if(this.region === undefined){
                // if it's not region-linked
                return this.$store.getters.current_model_area.price_yield_corrections[this.crop.crop.id].default
              }

              // we'll need to check on this once we actually have region links
              return this.$store.getters.current_model_area.price_yield_corrections[this.crop.crop.id][this.region.id]
            },
            is_all_crops_card: function(){
              return this.crop.crop.id === null
            },
            is_deletable: function(){
              return this.price_yield_correction_param < this.deletion_threshold
            }
        }
    }
</script>

<style scoped lang="stylus">
.auto_added
  display: inline-block;
  font-size:0.8em;
  padding:0.25em 1em;
  margin-left: 1em;
  text-align:center;
  color:#fff;
</style>