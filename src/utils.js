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
        return "Waiting to run"
        /*return `<v-tooltip bottom :open-on-click="true">
                    <template v-slot:activator="{ on, attrs }">
                        <span v-bind="attrs" v-on="on">Waiting to run</span>
                    </template>
                    <span>The model runner is either currently running another model, or is offline - this will run
                    once the model runner has available capacity.</span>
                    </v-tooltip>`;*/
    }
}

function regions_as_geojson(regions, inject_value_as_property){
    // We need to make sure that the region ID gets injected into the geojson properties
    // so that we can do joins back to other data for map displays. This function both makes sure that the data coming
    // back has been parsed from a string (it'd be nice not to have to do that - we'll need to test other ways), and
    // that each region's ID is associated with it in properties
    if(typeof(regions) === "object"){
        regions = Object.values(regions)
    }

    return {
        type: "FeatureCollection",
        features: regions.map(function (region) {
            let as_object = JSON.parse(region.geometry);
            if(inject_value_as_property !== undefined){
              as_object.properties[inject_value_as_property] = region[inject_value_as_property]
            }
            return as_object
        })
    }
}

function convert_array_of_objects_to_csv(args) {
    /* Shamelessly adapted and commented from
     https://www.developintelligence.com/blog/2017/04/use-javascript-to-export-your-data-as-csv/-

     This is adapted to use a Vuex store as the lookup function - the lookup code may need to be adapted if not using
     Vue/Vuex
     */
    let result, keys, column_delimiter, line_delimiter, data, lookups, drop_fields;

    data = args.data || null;  // make sure we have input data
    if (data == null || !data.length) {
        return null;
    }
    lookups = args.lookups || {};
    drop_fields = args.drop_fields || [];

    column_delimiter = args.column_delimiter || ',';
    line_delimiter = args.line_delimiter || '\n';

    let raw_keys = Object.keys(data[0]);  // pull the headers off the first object
    keys = []
    raw_keys.forEach(function(key){
        if(drop_fields.indexOf(key) !== -1){
            return // if the current key is in the array of fields to drop, then skip adding it to the headers
        }
        if(key in lookups){  // otherwise, if we should use a lookup instead of the raw value, then loop through the lookups for this key and add a header for each
            lookups[key].forEach(function(lookup){
               keys.push(`${key}${lookup.suffix}`)
            });
        }
        keys.push(key)
    })

    result = '';
    result += keys.join(column_delimiter);  // add the header
    result += line_delimiter;

    let add_delim = false;
    data.forEach(function(item) {  // iterate through the data in order, appending the results. Seems like there's probably a more efficient way to do this
        add_delim = false;
        raw_keys.forEach(function(key) {
            if (add_delim) result += column_delimiter;

            if(drop_fields.indexOf(key) !== -1){
                add_delim = false;  // we just added a delimiter and didn't use it, so skip the next one
                return // if the current key is in the array of fields to drop, then skip it
            }
            if(key in lookups){  // otherwise, if we should use a lookup instead of the raw value
                lookups[key].forEach(function(lookup) {  // lookups are an array because we might have more than one
                    result += `${lookup.func_object(item[key])}${column_delimiter}`;  // call the specified lookup function with the raw value
                })
            }
            result += item[key];
            add_delim = true;
        });
        result += line_delimiter;
    });

    return result;
}

function download_array_as_csv(args) {
    /* Also shamelessly adapted and commented from
     https://www.developintelligence.com/blog/2017/04/use-javascript-to-export-your-data-as-csv/- */
    let output_data, filename, link;
    let csv = convert_array_of_objects_to_csv({  // get the CSV representation of the data
        data: args.data,
        lookups: args.lookups,
        drop_fields: args.drop_fields
    });
    if (csv == null) return;

    filename = args.filename || 'export.csv';  // set the filename

    if (!csv.match(/^data:text\/csv/i)) {
        csv = 'data:text/csv;charset=utf-8,' + csv;
    }
    output_data = encodeURI(csv);  // get the URI the browser will use to download the data

    link = document.createElement('a');  // attach the URI to the document, hide it, and click it
    link.style.display = "none";
    link.setAttribute('href', output_data);
    link.setAttribute('download', filename);
    link.click();
}

let utils = {
    model_run_status_text,
    regions_as_geojson,
    download_array_as_csv
}

// make the function available within Vue objects
Object.defineProperty(Vue.prototype, '$stormchaser_utils', {value: utils});

