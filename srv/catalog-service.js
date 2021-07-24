const cds = require("@sap/cds");
// const { cleanObject } = require("./helper");
const thisApplication = "fioriappsstats";
const DEBUG = cds.debug(thisApplication);

// Does need destination service
// const cdse = require("cdse")

module.exports = cds.service.impl(async (srv) => {
  const fioriAppsLibrary = await cds.connect.to("FioriAppsLibrary");

  const db = await cds.connect.to("db");
  const { Details, RequiredODataServices } = db.entities;

  async function loadAppsFromSAP(req) {
    try {
      db.run(DELETE.from(Details));
      const filter =
        "$filter=(substringof('$SAP Fiori (SAPUI5)$',UITechnologyCombined) or substringof('$SAP Fiori app variant$',UITechnologyCombined) or substringof('$SAP Fiori elements$',UITechnologyCombined) or substringof('$SAP Fiori elements for CoPilot$',UITechnologyCombined) or substringof('$SAP Fiori elements: Overview Page$',UITechnologyCombined) or substringof('$SAP Fiori: Analysis Path Framework (APF)$',UITechnologyCombined) or substringof('$SAP Fiori: Design Studio$',UITechnologyCombined) or substringof('$SAP Fiori: Generic Application Log Framework$',UITechnologyCombined) or substringof('$SAP Fiori: Generic Configuration Framework$',UITechnologyCombined) or substringof('$SAP Fiori: Generic Job Scheduling Framework$',UITechnologyCombined) or substringof('$SAP Fiori: Manage Workflow$',UITechnologyCombined) or substringof('$SAP Fiori: My Inbox$',UITechnologyCombined) or substringof('$SAP Fiori: SAP Smart Business generic drill down app$',UITechnologyCombined) or substringof('$SAP Fiori: SAP Smart Business tile %26 custom drill down app$',UITechnologyCombined))";
      const appsCount = await fioriAppsLibrary
        .tx(req)
        .get(
          "/InputFilterParam(InpFilterValue='1NA')/Results/$count" +
            "?" +
            filter
        );
      console.log("There are ", appsCount, " matching Apps");
      const apps = await fioriAppsLibrary.tx(req).get(
        "/InputFilterParam(InpFilterValue='1NA')/Results" +
          "?" +
          filter +
          "&$select=appId,releaseId,AppNameAll"
        // + "&$top=10"
      );
      console.log("Number of result for detail read: ", apps.length);
      for (let index = 0; index < apps.length; index++) {
        const app = apps[index];
        const insertDetailsResult = await db.run(
          INSERT.into(Details).rows({
            fioriId: app.appId,
            releaseId: app.releaseId,
            AppName: app.AppNameAll,
          })
        );
      }
      console.log("Load finished");
      db.tx(req).commit();
    } catch (error) {
      console.log(error);
    }
  }

  async function loadServicesFromSAP(req) {
    try {
      console.log("Start to load Services from SAP");
      db.run(DELETE.from(RequiredODataServices));
      const services = await fioriAppsLibrary.tx(req).get(
        "/RequiredODataServices"
        // + "?$filter=fioriId eq 'F2335' and releaseId eq 'S18OP'"
      );
      console.log("Number of result for services read: ", services.length);
      try {
        const insertServicesResult = await db.run(
          INSERT.into(RequiredODataServices).rows(services)
        );
        // console.log("Added", service.AppName);
      } catch (error) {
        console.log(error);
      }
      db.tx(req).commit();
      console.log("Load finished");
    } catch (error) {
      console.log(error);
      db.tx(req).commit();
    }
  }

  srv.on("loadAppsFromSAP", async (req) => {
    loadAppsFromSAP(req);
  });

  srv.on("loadServicesFromSAP", async (req) => {
    loadServicesFromSAP(req);
  });
});
