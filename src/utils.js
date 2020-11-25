import Vue from 'vue';

function model_run_status_text(model_run){
    // gives human readable status information for a model run
    if(model_run.complete === true){
        let value = "Results Available";
        if ("results" in model_run && model_run.results.infeasibilities.length > 0){
            value = value + " - Contains Infeasibilities"
        }
        return value
    } else if (model_run.running === true){
        return "Running";
    } else {
        return "Waiting";
    }
}

function regions_as_geojson(regions, inject_value_as_property){
    // We need to make sure that the region ID gets injected into the geojson properties
    // so that we can do joins back to other data for map displays. This function both makes sure that the data coming
    // back has been parsed from a string (it'd be nice not to have to do that - we'll need to test other ways), and
    // that each region's ID is associated with it in properties
    return {
        type: "FeatureCollection",
        features: regions.map(function (region) {
            let as_object = JSON.parse(region.region.geometry);
            if(inject_value_as_property !== undefined){
              as_object.properties[inject_value_as_property] = region.region[inject_value_as_property]
            }
            return as_object
        })
    }
}

let utils = {
    model_run_status_text,
    regions_as_geojson
}

// make the function available within Vue objects
Object.defineProperty(Vue.prototype, '$stormchaser_utils', {value: utils});

