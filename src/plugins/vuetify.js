import Vue from 'vue';
import 'vuetify/dist/vuetify.min.css'
import {createVuetify} from "vuetify";

import * as components from "vuetify/components";
import * as directives from "vuetify/directives";
import "vuetify/styles";

/* // Commented out for V3 migration test
const opts =   {
    theme: {
        themes: {
            light: {
                info: "#ffffff",
            },
        },
    }
}
*/

const vuetify = createVuetify({components, directives });
export default vuetify