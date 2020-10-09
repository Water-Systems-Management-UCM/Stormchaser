import Vue from 'vue';

function model_run_status_text(model_run){
    // gives human readable status information for a model run
    if(model_run.complete === true){
        return "Results Available";
    } else if (model_run.running === true){
        return "Running";
    } else {
        return "Waiting";
    }
}

let utils = {
    model_run_status_text
}

// make the function available within Vue objects
Object.defineProperty(Vue.prototype, '$stormchaser_utils', {value: utils});

