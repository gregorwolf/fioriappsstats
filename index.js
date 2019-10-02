const odata = require('odata-client')
const XLSX = require('xlsx')

// For testing 3, later 100
const top = 100
const odataParams = {
  service: 'https://fioriappslibrary.hana.ondemand.com/sap/fix/externalViewer/services/SingleApp.xsodata', 
  resources: "InputFilterParam(InpFilterValue='1NA')/Results",
  format: "json"
}
// /InputFilterParam(InpFilterValue='1NA')/Results
var q = odata(odataParams)

// all Fiori Apps
var filter = "$filter=(substringof('$SAP Fiori (SAPUI5)$',UITechnologyCombined)" 
+ " or substringof('$SAP Fiori app variant$',UITechnologyCombined)" 
+ " or substringof('$SAP Fiori elements$',UITechnologyCombined)" 
+ " or substringof('$SAP Fiori elements for CoPilot$',UITechnologyCombined)" 
+ " or substringof('$SAP Fiori elements: Overview Page$',UITechnologyCombined)" 
+ " or substringof('$SAP Fiori: Analysis Path Framework (APF)$',UITechnologyCombined)" 
+ " or substringof('$SAP Fiori: Design Studio$',UITechnologyCombined)" 
+ " or substringof('$SAP Fiori: Generic Application Log Framework$',UITechnologyCombined)" 
+ " or substringof('$SAP Fiori: Generic Configuration Framework$',UITechnologyCombined)" 
+ " or substringof('$SAP Fiori: Generic Job Scheduling Framework$',UITechnologyCombined)" 
+ " or substringof('$SAP Fiori: Manage Workflow$',UITechnologyCombined)" 
+ " or substringof('$SAP Fiori: My Inbox$',UITechnologyCombined)" 
+ " or substringof('$SAP Fiori: SAP Smart Business generic drill down app$',UITechnologyCombined)" 
+ " or substringof('$SAP Fiori: SAP Smart Business tile & custom drill down app$',UITechnologyCombined))"

function getData(i) {
  var query = odata(odataParams)
  return query.top(top).skip(i).custom(filter).get()
}

function generateAppsCSV(apps) {
  var header = []
  for (var prop in apps[0]) {
    if (prop !== "__metadata") {
      header.push(prop)
    }
  }
  // console.log(header)
  const wb = XLSX.utils.book_new()
  options = {header: header}
  var ws = XLSX.utils.json_to_sheet(apps, options)
  XLSX.utils.book_append_sheet(wb, ws, 'test')
  XLSX.writeFile(wb, 'gen/apps.csv', {FS: ";"})
}

q.custom(filter).count().get().then(function(response) {
  var lines = response.body
  // For testing
  // lines = 5
  var apps = []
  for(i = 0; i < lines; i += top) {
    var response = getData(i)
    response.then(function(response) {
      var results = JSON.parse(response.body).d.results
      results.forEach(function (item) {
        apps.push(item)
      })
      if(apps.length >= lines) {
        generateAppsCSV(apps)
      } 
    })
  }
})
