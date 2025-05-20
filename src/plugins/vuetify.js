import { createApp } from 'vue';
import {createVuetify} from "vuetify";


// Vue.use(Vuetify)
const vuetify = createVuetify()
const app = createApp({})
app.use(vuetify)

const opts =   {
    theme: {
        themes: {
            light: {
                info: "#ffffff",
            },
        },
    }
}

export default vuetify