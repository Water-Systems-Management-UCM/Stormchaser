<template>
  <v-row>
    <v-col>

      <h1 id="top">About OpenAg</h1>
      <v-btn style="margin: 1em 0;"><router-link to="/">Back to Home</router-link></v-btn>
      <ul>
        <li><router-link to="#introduction">Introduction</router-link></li>
        <li><router-link to="#model_description">Model Description</router-link></li>
        <li><router-link to="#modeled_areas">Modeled Areas</router-link>
          <ul>
            <li><router-link to="#kern">Applications in Kern County</router-link></li>
            <li><router-link to="#delta">Applications in the Delta</router-link></li>
            <li><router-link to="#washington">Applications in Washington State</router-link></li>
          </ul>
        </li>
        <li><router-link to="#regions">Web Application</router-link></li>
        <li><router-link to="#references">References</router-link></li>

      </ul>
      <h2 id="introduction" style="margin-top:1em">INTRODUCTION</h2>
      <p>Irrigated agricultural production is likely to adapt to climate change and water uncertainty in unprecedented ways, especially within California's Central Valley and the adjacent agricultural regions. Important regions like the Sacramento-San Joaquin Delta in California serve as the hub for the state’s intertied water supply system while hosting irrigated agriculture, urban areas, aging and highly vulnerable levee infrastructure, and a fragile ecosystem. Those seeking sustainability and growth of these elements often find themselves with conflicting objectives which have for long lead to combative science and siloed environmental modeling efforts. Our research presents an integrated framework for modeling agricultural production’s response to irrigation and land constraints that provide practical results for a variety of management decisions, supporting multiple objectives, and can be implemented across the State. Previous efforts on agricultural modeling in the delta (Medellin-Azuara et al. 2012) have culminated in a model that runs on a Python platform and predicts cropping patterns, water use and economic gross revenues resulting from water and economic constraints representing changes in water availability, climate conditions, or salinity in irrigation water. Results from the framework help improve quantitative understanding of impacts to agriculture from sea level rise, water management and operation decisions, increased soil salinity from irrigation and drainage, and predictions from existing hydrodynamic models. This model is the backbone for our open web applications capable of assessing the economic value of agriculture on a fine scale, as well as the ability to compare different potential outcomes of crop choice adaptation for studied regions.</p>
      <p style="text-align:center; display:none;">
        <img src="@/static/about/delta.png" style="max-width:100%"><br>
        Photo from waterfoundation.org
      </p>

      <h2 id="model_description">MODEL DESCRIPTION</h2>
      <p><router-link to="#top">Back to Top</router-link></p>
      <p>The Open Agricultural Production Model employs data on land use, production costs, price, yield and applied water to estimate profit-maximizing patterns of crops under varying conditions (Medellin-Azuara et al., 2018). Data for these inputs in California are available from various state and federal agencies and University of California studies such as the <a href="https://coststudies.ucdavis.edu/en/" target="_blank">UC Davis Crop Cost and Return Studies</a>, US Department of Agriculture <a href="https://www.nass.usda.gov/" target="_blank">National Agricultural Statistics Service</a>, and the California <a href="https://water.ca.gov/" target="_blank">Department of Water Resources</a>. Model subregions allow for finer spatial control over available land and water resources and provide spatial resolution to potential cropping adaptations predicted by the model. The web application allows open access for non-academic users to the model. Web applications will be open access and modular in nature so they can be connected to other water management and environmental modeling platforms. This approach seeks to improve transparency through open access of model components, inputs and outputs, data documentation, and platform connectivity options.</p>
      <p>Our models are based on Positive Mathematical Programming (PMP). Positive Mathematical Programming is a calibration technique for mathematical modeling which allows for exact calibration to observed conditions during the reference period, along with avoiding overspecialization in model decisions (Howitt, 1995). The benefit of using PMP in production modeling is the ability to capture underlying conditions faced by farmers that are unrepresented in a strict economic analysis, such as risk assessment, limitations in soil properties, and other factors. Traditional methods may predict overspecialization into profit-rich commodities, which is inconsistent with observed practices, which is the essence of PMP. These methods do not require reliance on large datasets and can be flexibly formulated based on the system to be modeled. Figure 1 demonstrates the calibration process under the PMP framework, for which input data is used to generate a “base case” under typical or low-stress conditions (normally a wet water year for crop systems). Following this, constrained linear optimization is used to derive parameters for non-linear cost or production functions. Finally, the calibrated model is used in scenario analysis by varying model parameters to reflect expected changes in resource availability, markets, biophysical characteristics, or other factors.</p>
      <p style="text-align:center;">
          <img src="@/static/about/pmp_flow.png" style="max-width:100%" alt="Generalized model flowchart for Positive Mathematical Programming."><br>
          Generalized model flowchart for Positive Mathematical Programming.
      </p>

      <h2 id="modeled_areas">MODELED AREAS</h2>
      <p><router-link to="#top">Back to Top</router-link></p>

      <h3 id="kern">Applications in Kern County</h3>
      <p>The greater Kern county area is among the most agriculturally productive regions in the country by value, making it a choice location for studying the adaptation of agriculture to drought, policy, and economic markets. Our applications in Kern county focus on more detailed aspects of water management and production factors. These include impacts of groundwater banking, drought adaptation strategies, and dynamic groundwater levels on agriculture. We have implemented groundwater response functions trained using C2VSIM data to forecast changes in aquifer depths under different hydrologic conditions. Changes in groundwater levels are integrated into agricultural production decisions through a recursive pumping cost equation which is updated as depths change over time. The models for this region are built at a water district scale, allowing for integration of more detailed data pertaining to water rates, surface water availability, and groundwater reliance.</p>

      <h3 id="delta">Applications in the Delta</h3>
      <p><router-link to="#top">Back to Top</router-link></p>
      <p>The Sacramento-San Joaquin Delta lies at the heart of California’s water management system and is expected to face many challenges in the face of uncertainties posed by climate change. Open Delta Agricultural Production Model (OpenDAP) builds upon previous agricultural modeling in the Delta to update economic values associated with production and is supported by a web platform designed around using the model as a decision-support tool. This model is built at the island scale and can be used to explore scenarios surrounding Delta agriculture including salinity, sea level rise, water availability, and economic markets. OpenDAP has been utilized in collaboration with The Nature Conservancy, San Francisco Estuary Institute, and the Delta Stewardship Council to assess expansion of wetlands and other sustainable land use options on Staten Island.</p>
      <p style="text-align:center;">
        <img src="@/static/about/delta_ag_production.png" style="max-width:100%" alt="Sacramento-San Joaquin Delta Cropping Patterns utilized as inputs for OpenAg."><br>
        Sacramento-San Joaquin Delta Cropping Patterns utilized as inputs for OpenAg.
      </p>

      <h3 id="washington">Applications in Washington State</h3>
      <p><router-link to="#top">Back to Top</router-link></p>
      <p>Our agricultural modeling has extended beyond the borders of California into Washington and the Pacific Northwest. Much of the agriculture in Washington is rain-fed, meaning that crops depend directly on precipitation to provide soil water, as opposed to complex irrigation systems and conveyance infrastructure. We are currently developing models to assess the economic impacts of drought in the state of Washington which implement precipitation-driven water scarcity and crop yield response. The Open Ag in Washington model will be delivered through a web platform as well.</p>

      <h2 id="web_app">WEB APPLICATION</h2>
      <p><router-link to="#top">Back to Top</router-link></p>
      <p>OpenAg provides a unified web platform for building, running, managing, and viewing agroeconomic model scenarios. It provides a web application and programming interface for hydroeconomic decisions under changing environmental and economic conditions. Users develop model runs in a user-friendly graphical interface, with choices to adjust crop prices and yields as well as land and water policies for each modeled region. Model runs are processed in a few seconds on the OpenAg server, making the entire workflow available in the web browser. Results are displayed in a decision-support interface, showing maps, tables and charts by crop and region and allowing for comparisons between model runs to assess the impacts of different model input choices. Output variables include changes in regional cropping patterns, water use, gross revenues, employment and value added. With these tools, users of OpenAg can model the economic impacts of water transfers, salinity intrusion, and increasing temperatures and view results in the browser, connect from the programming language of their choice, or download tables for further analysis.</p>
      <p style="text-align:center">
        <video src="@/static/about/WA_36s_Demo.mp4"
        controls
               style="max-width:100%" alt="demonstration of the web application"></video>
      </p>

      <h2 id="references">REFERENCES</h2>
      <p><router-link to="#top">Back to Top</router-link></p>
      <p>Howitt, R. E. (1995). Positive mathematical programming. American journal of agricultural economics, 77(2), 329-342.</p>
      <p>Howitt, R. E., Medellín-Azuara, J., MacEwan, D., & Lund, J. R. (2012). Calibrating disaggregate economic models of agricultural production and water management. Environmental Modelling & Software, 38, 244-258.</p>
      <p>Medellín-Azuara, J., Howitt, R.E. and Harou, J.J. (2012). Predicting farmer responses to water pricing, rationing and subsidies assuming profit maximizing investment in irrigation technology. Agricultural Water Management, 108:73-82</p>
      <p>Medellín-Azuara, J., Howitt, R. E., Hanak, E., Lund, J. R., & Fleenor, W. E. (2014). Agricultural Losses from Salinity in California’s Sacramento-San Joaquin Delta. San Francisco Estuary and Watershed Science, 12(1).</p>
      <p>Medellín-Azuara, J., Paw U, K.T., Jin, Y. Jankowski, J., Bell, A.M., Kent, E., Clay, J., Wong, A., Alexander, N., Santos, N., Badillo, J., Hart, Q., Leinfelder-Miles, M., Merz, J., Lund, J.R., Anderson, A., Anderson, M., Chen, Y., Edgar, D., Eching, S., Freiberg, S., Gong, R., Guzmán, A., Howes, D., Johnson, L., Kadir, T., Lambert, J.J., Liang, L., Little, C., Melton, F., Metz, M., Morandé, J.A., Orang, M., Pyles, R.D., Post, K., Rosevelt, C., Sarreshteh, S., Snyder, R.L., Trezza, R., Temegsen, B., Viers, J.H. (2018). A Comparative Study for Estimating Crop Evapotranspiration in the Sacramento-San Joaquin Delta. Center for Watershed Sciences, University of California Davis. <a href="https://watershed.ucdavis.edu/project/delta-et" target="_blank">https://watershed.ucdavis.edu/project/delta-et</a></p>

      <v-btn style="margin: 1em 0;"><router-link to="/">Back to Home</router-link></v-btn>
    </v-col>
  </v-row>
</template>
<script>

</script>