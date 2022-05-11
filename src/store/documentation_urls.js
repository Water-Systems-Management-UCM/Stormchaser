const BASE_DOCS_URL = "https://openag_docs.readthedocs.org/en/latest"

const DOCS = {
    'make_model_runs': {
        'advanced_region_options': `${BASE_DOCS_URL}/MakeModelRun/region_modifications.html#advanced-region-options`,
        'automatic_crop_card_addition': `${BASE_DOCS_URL}/MakeModelRun/crop_modifications.html#automatic-addition-of-crop-modification-cards`,
        'region_linked_crop_cards': `${BASE_DOCS_URL}/MakeModelRun/crop_modifications.html#region-linked-crops`,
    },
    'model_runs':{
        'multiple_results_sets': `${BASE_DOCS_URL}/ModelRuns/model_runs.html#multiple-results-sets`,
        'net_revenue_limitations': `${BASE_DOCS_URL}/Dapper/net_revenues.html`
    },
}

module.exports = {docs_urls: DOCS}