const odata = require("@odata/client");
const XLSX = require("xlsx");
const fs = require("fs");
const { decode } = require("html-entities");
const dustfs = require("dustfs");
dustfs.dirs("templates");

var test = true;
var top = 100;
// For testing 3, later 100
if (test) {
  top = 5;
}
const odataParams = {
  service:
    "https://fioriappslibrary.hana.ondemand.com/sap/fix/externalViewer/services/SingleApp.xsodata",
  resources: "InputFilterParam(InpFilterValue='1NA')/Results",
  format: "json",
};
// /InputFilterParam(InpFilterValue='1NA')/Results
var q = odata(odataParams);

// all Fiori Apps
var filter =
  "$filter=(substringof('$SAP Fiori (SAPUI5)$',UITechnologyCombined)" +
  " or substringof('$SAP Fiori app variant$',UITechnologyCombined)" +
  " or substringof('$SAP Fiori elements$',UITechnologyCombined)" +
  " or substringof('$SAP Fiori elements for CoPilot$',UITechnologyCombined)" +
  " or substringof('$SAP Fiori elements: Overview Page$',UITechnologyCombined)" +
  " or substringof('$SAP Fiori: Analysis Path Framework (APF)$',UITechnologyCombined)" +
  " or substringof('$SAP Fiori: Design Studio$',UITechnologyCombined)" +
  " or substringof('$SAP Fiori: Generic Application Log Framework$',UITechnologyCombined)" +
  " or substringof('$SAP Fiori: Generic Configuration Framework$',UITechnologyCombined)" +
  " or substringof('$SAP Fiori: Generic Job Scheduling Framework$',UITechnologyCombined)" +
  " or substringof('$SAP Fiori: Manage Workflow$',UITechnologyCombined)" +
  " or substringof('$SAP Fiori: My Inbox$',UITechnologyCombined)" +
  " or substringof('$SAP Fiori: SAP Smart Business generic drill down app$',UITechnologyCombined)" +
  " or substringof('$SAP Fiori: SAP Smart Business tile & custom drill down app$',UITechnologyCombined))";

function getData(i) {
  var query = odata(odataParams);
  return query.top(top).skip(i).custom(filter).get();
}

function createFileFromTemplate(template, datamodel, filename) {
  dustfs.render(template, datamodel, function (err, out) {
    if (err) {
      console.log("Error: " + err);
    } else {
      fs.writeFile(filename, out, function (err, file) {
        if (err) throw err;
        console.log("Saved template " + template + " at " + filename);
      });
    }
  });
}

function generateAppsCSV(apps) {
  var header = [];
  var datamodel = { fields: [] };
  var abapPosition = 1;
  for (var prop in apps[0]) {
    abapPosition++;
    header.push(prop);
    var field = {};
    field.type = "String";
    field.abapPosition = abapPosition;
    field.abapRollname = "RMPSPEDESCR";
    field.abapAs = prop.substr(0, 30);
    /*
    field.abapInttype = 'g'
    field.abapType = 'SSTR'
    field.abapLength = '00040'
    */
    field.analytics = "@Analytics.Dimension: true\n";
    if (prop === "Id") {
      field.key = "key";
      field.abapAs = "Identification";
      field.abapRollname = "TCVERSION";
      field.abapNotnull = "<NOTNULL>X</NOTNULL>";
      field.abapKey = "<KEYFLAG>X</KEYFLAG>";
      /*
      field.abapType = 'CHAR'
      field.abapInttype = 'C'
      field.abapLength = '000020'
      */
      delete field.analytics;
    }
    field.type = "String";
    if (prop === "count") {
      field.analytics =
        "  @Analytics.Measure: true\n  @Aggregation.default: #SUM\n";
      field.type = "Integer";
      field.abapAs = "Apps";
      field.abapRollname = "BCA_REL_DTE_COUNT";
      field.abapLineItem =
        "@UI.lineItem: [{position: " + abapPosition * 10 + " }]";
      field.abapDefaultAggregation = "@DefaultAggregation: #SUM";
      /*
      field.abapType = 'INT4'
      field.abapInttype = 'X'
      field.abapLength = '000010'
      */
    }
    if (prop === "DatabaseName") {
      field.abapSelectionField =
        "@UI.selectionField: [{position: " + abapPosition * 10 + " }]";
      field.abapLineItem =
        "@UI.lineItem: [{position: " + abapPosition * 10 + " }]";
    }
    field.column = prop;
    field.abapColumn = prop.toUpperCase().substr(0, 30);
    datamodel.fields.push(field);
  }
  const wb = XLSX.utils.book_new();
  options = { header: header };
  var ws = XLSX.utils.json_to_sheet(apps, options);
  XLSX.utils.book_append_sheet(wb, ws, "test");
  XLSX.writeFile(wb, "gen/db/csv/com.sap.sapmentors.fioriappstats-Apps.csv", {
    FS: ";",
  });

  createFileFromTemplate("data-model.dust", datamodel, "gen/db/data-model.cds");
  createFileFromTemplate(
    "zfas_apps.tabl.xml.dust",
    datamodel,
    "gen/abap/zfas_apps.tabl.xml"
  );
  createFileFromTemplate(
    "zfas_fill_apps.abap.dust",
    datamodel,
    "gen/abap/zfas_fill_apps.abap"
  );
  createFileFromTemplate(
    "zfas_apps_dd.abapcdsdd.dust",
    datamodel,
    "gen/abap/zfas_apps_dd.abapcdsdd"
  );
}

q.custom(filter)
  .count()
  .get()
  .then(function (response) {
    var lines = response.body;
    // For testing
    if (test) {
      lines = 5;
    }
    var apps = [];
    for (i = 0; i < lines; i += top) {
      var response = getData(i);
      response.then(function (response) {
        var results = JSON.parse(decode(response.body)).d.results;
        results.forEach(function (item) {
          delete item.__metadata;
          delete item.RoleDescription;
          delete item.RoleCombinedToolTipDescription;
          item.DatabaseName = item.Database;
          delete item.Database;
          item.counter = 1;
          apps.push(item);
        });
        if (apps.length >= lines) {
          generateAppsCSV(apps);
        }
      });
    }
  });
