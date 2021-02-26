<template>
    <StormCard class_name="crop"
               :title="title_text"
               @card-activate="activate"
               @card-deactivate="deactivate"
               :card_item="crop"
    ><h4>{{ crop.crop.name }}</h4>
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
            // values in the mounted() function
            min_price: 0,
            min_yield: 0,
          }
        },
        mounted(){
          this.min_price = this.default_limits.min_price
          this.min_yield = this.default_limits.min_yield
        },
        components: {
            StormCard,
            StormCardSlider,
            StormCardRangeSlider
        },
        props: {
            crop: Object,
            default_limits: Object,
            price_yield_correction_param: Number
        },
        watch:{
            crop: {
              // we want to watch the crop price/yield proportions to make sure we won't end up with negative profits
              deep: true,
              handler(value){
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

                // if the current configuration would generate negative profits, take corrective action
                if(price_proportion * yield_proportion < price_yield_correction_param){
                  //if(price_changed){
                    // if they changed the price, then we need to bump it back up to the level that when combined with yield,
                    // it's greater than the correction param, then set both price and yield's current values as the minimum
                    this.crop.price_proportion = (price_yield_correction_param / yield_proportion) * 100
                  //}else if(yield_changed){
                    this.crop.yield_proportion = (price_yield_correction_param / price_proportion) * 100
                  //}
                  this.min_price = this.crop.price_proportion;
                  this.min_yield = this.crop.yield_proportion;
                }else{
                  // if it won't generate negative profits, allow the values to be modified further, up to the
                  // default limits - basically, just recalculate the limits if we're not already at a negative value.
                  // this is a bit tricky since they're not going to be equal values, so we can't just calculate one item

                  if(this.min_price === this.default_limits.min_price &&
                      this.min_yield === this.default_limits.min_yield){
                    // if they're at their defaults and profits aren't negative, short circuit and return now
                    return;
                  }

                  // > 1 means yield_proportion is larger, otherwise price proportion is larger - we have more space
                  // to adjust the larger value's slider downward if we're currently locked
                  let adjustment_skew = value.yield_proportion / value.price_proportion
                  let allowable_amount = price_yield_correction_param - price_proportion * yield_proportion;

                  this.min_price = Math.max(this.default_limits.min_price / 100, price_proportion * (allowable_amount / adjustment_skew)) * 100
                  this.min_yield = Math.max(this.default_limits.min_yield / 100, yield_proportion * (allowable_amount * adjustment_skew)) * 100
                }
              }
            }
        },
        methods: {
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
        }
    }
</script>

<style scoped>

</style>