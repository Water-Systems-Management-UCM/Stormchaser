

/*
 *  Gets the locale-specific version of a term. Will retrieve the value of the provided term for the provided locale,
 *  defaulting to the browser-provided locale (navigator.language) if no locale is provided. If the term is not
 *  available in that locale, falls back to en-US. If the term is invalid, throws an exception.
 */
export function get_term_for_locale(term, locale){
    console.log("in terms.js", term, locale)
    let terms = {
        'model_runs': {
            'types': {
                'full': {
                    'en-US': "Full"
                },
                'simple': {
                    'en-US': "Simple"
                },
                'no_production':{
                    'en-US': "No Production"
                },
                'hold_to_base':{
                    'en-US': "Hold to Base Case"
                }
            }
        }
    }
    if (locale === null || locale === undefined){
        locale = navigator.language;  // get the browser locale if no locale was provided
    }
    console.log("locale " + locale)
    let term_parts = term.split(".")
    let term_value = terms;  // start with the full term tree

    for(let i=0; i<term_parts.length; i++){  // go through all of the term parts traversing down the term tree to find the one we're looking for
        // console.log("in for loop terms", term_parts[i])
        if (term_parts[i] in term_value){
            term_value = term_value[term_parts[i]];
        }else{
            throw "Invalid term string - could not find term [" + term_parts[i] + "] as part of lookup for full term [" + term;
        }
    }

    if(locale in term_value){  // check if we have the term in the specified locale, otherwise fall back to en-US
        return term_value[locale]
    }else{
        return term_value["en-US"]
    }
}

export default {get_term_for_locale}