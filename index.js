const odata = require('odata-client')
// /InputFilterParam(InpFilterValue='1NA')/Results
var q = odata({
  service: 'https://fioriappslibrary.hana.ondemand.com/sap/fix/externalViewer/services/SingleApp.xsodata', 
  resources: "InputFilterParam(InpFilterValue='1NA')/Results",
  format: "json"
})

q.top(5).skip(0).custom("$filter=(substringof('$SAP Fiori (SAPUI5)$',UITechnologyCombined) or substringof('$SAP Fiori app variant$',UITechnologyCombined) or substringof('$SAP Fiori elements$',UITechnologyCombined) or substringof('$SAP Fiori elements for CoPilot$',UITechnologyCombined) or substringof('$SAP Fiori elements: Overview Page$',UITechnologyCombined) or substringof('$SAP Fiori: Analysis Path Framework (APF)$',UITechnologyCombined) or substringof('$SAP Fiori: Design Studio$',UITechnologyCombined) or substringof('$SAP Fiori: Generic Application Log Framework$',UITechnologyCombined) or substringof('$SAP Fiori: Generic Configuration Framework$',UITechnologyCombined) or substringof('$SAP Fiori: Generic Job Scheduling Framework$',UITechnologyCombined) or substringof('$SAP Fiori: Manage Workflow$',UITechnologyCombined) or substringof('$SAP Fiori: My Inbox$',UITechnologyCombined) or substringof('$SAP Fiori: SAP Smart Business generic drill down app$',UITechnologyCombined) or substringof('$SAP Fiori: SAP Smart Business tile & custom drill down app$',UITechnologyCombined))")
.get()
.then(function(response) {
  var results = JSON.parse(response.body).d.results;
  console.log(results)
});