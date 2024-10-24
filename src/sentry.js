import Vue from 'vue'

// Set up Sentry first, according to its instructions
import * as Sentry from "@sentry/browser";
import { Vue as VueIntegration } from "@sentry/integrations";
import { Integrations } from "@sentry/tracing";

if(window.location.hostname.indexOf("localhost") === -1){  // if we're not running some local dev server, log errors to Sentry
    Sentry.init({
        dsn: "https://a39545e9b4c940c18e62629856dedaed@o462396.ingest.sentry.io/5465746",
        integrations: [
            new VueIntegration({
                Vue,
                tracing: true,
                logErrors: true // make sure that errors still show in the console
            }),
            new Integrations.BrowserTracing(),
        ],

        // We recommend adjusting this value in production, or using tracesSampler
        // for finer control
        tracesSampleRate: 1.0,
    });
}