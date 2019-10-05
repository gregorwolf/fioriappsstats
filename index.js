const odata = require('odata-client')
const XLSX = require('xlsx')
const fs = require('fs')
const dustfs = require('dustfs')
dustfs.dirs('templates')

// For testing 3, later 100
const top = 3
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

function createFileFromTemplate(template, datamodel, filename) {
  dustfs.render(template, datamodel, function(err, out) {
    if(err) {
      console.log('Error: '+err);
    } else {
      fs.writeFile(filename, out, function (err, file) {
        if (err) throw err
        console.log('Saved template ' + template + ' at ' + filename)
      })
    }
  })
}

function generateAppsCSV(apps) {
  var header = []
  var datamodel = { fields: [] }
  var abapPosition = 1
  for (var prop in apps[0]) {
    abapPosition++
    header.push(prop)
    var field = {}
    field.type = 'String'
    field.abapPosition = abapPosition
    field.abapInttype = 'g'
    field.abapType = 'SSTR'
    field.abapLength = '<LENG>00040</LENG>'
    field.analytics = "@Analytics.Dimension: true\n"
    if(prop === 'Id') {
      field.key = 'key'
      field.abapType = 'CHAR'
      field.abapInttype = 'C'
      field.abapKey = '<KEYFLAG>X</KEYFLAG>'
      field.abapLength = '<LENG>000020</LENG>'
      field.abapNotnull = '<NOTNULL>X</NOTNULL>'
      delete field.analytics
    }
    if(prop === 'counter') {
      field.analytics = "@Analytics.Measure: true\n@Aggregation.default: #SUM\n"
      field.type = 'Integer'
      field.abapType = 'INT4'
      field.abapInttype = 'X'
      field.abapLength = '<LENG>000010</LENG>'
    }
    field.column = prop
    field.abapColumn = prop.toUpperCase()
    datamodel.fields.push(field)
  }
  console.log(header.length)
  const wb = XLSX.utils.book_new()
  options = {header: header}
  var ws = XLSX.utils.json_to_sheet(apps, options)
  XLSX.utils.book_append_sheet(wb, ws, 'test')
  XLSX.writeFile(wb, 'gen/db/csv/com.sap.sapmentors.fioriappstats-Apps.csv', {FS: ";"})

  createFileFromTemplate('data-model.dust', datamodel, 'gen/db/data-model.cds')
  createFileFromTemplate('zfas_apps.tabl.xml.dust', datamodel, 'gen/abap/zfas_apps.tabl.xml')
}

q.custom(filter).count().get().then(function(response) {
  var lines = response.body
  // For testing
  lines = 5
  var apps = []
  for(i = 0; i < lines; i += top) {
    var response = getData(i)
    response.then(function(response) {
      var results = JSON.parse(response.body).d.results
      results.forEach(function (item) {
        delete item.__metadata
        delete item.RoleDescription
        delete item.RoleCombinedToolTipDescription
        item.DatabaseName = item.Database
        delete item.Database
        item.counter = 1
        apps.push(item)
      })
      if(apps.length >= lines) {
        generateAppsCSV(apps)
      } 
    })
  }
})
