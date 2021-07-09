const cds = require("@sap/cds");
const { cleanObject } = require("./helper");
const thisApplication = "fioriappsstats";
const DEBUG = cds.debug(thisApplication);

module.exports = cds.service.impl(async (srv) => {
  const fioriAppsLibrary = await cds.connect.to("FioriAppsLibrary");

  const db = await cds.connect.to("db");
  const { Details, RequiredODataServices } = db.entities;

  srv.on("loadDataFromSAP", async (req) => {
    db.run(DELETE.from(Details));
    db.run(DELETE.from(RequiredODataServices));
    try {
      const apps = await fioriAppsLibrary.send({
        method: "GET",
        path:
          "InputFilterParam(InpFilterValue='1NA')/Results" +
          "?$format=json" +
          "&$top=100" +
          "&$inlinecount=allpages" +
          "&$selext=appId,releaseId" +
          "&$filter=(substringof('$SAP Fiori (SAPUI5)$',UITechnologyCombined) or substringof('$SAP Fiori app variant$',UITechnologyCombined) or substringof('$SAP Fiori elements$',UITechnologyCombined) or substringof('$SAP Fiori elements for CoPilot$',UITechnologyCombined) or substringof('$SAP Fiori elements: Overview Page$',UITechnologyCombined) or substringof('$SAP Fiori: Analysis Path Framework (APF)$',UITechnologyCombined) or substringof('$SAP Fiori: Design Studio$',UITechnologyCombined) or substringof('$SAP Fiori: Generic Application Log Framework$',UITechnologyCombined) or substringof('$SAP Fiori: Generic Configuration Framework$',UITechnologyCombined) or substringof('$SAP Fiori: Generic Job Scheduling Framework$',UITechnologyCombined) or substringof('$SAP Fiori: Manage Workflow$',UITechnologyCombined) or substringof('$SAP Fiori: My Inbox$',UITechnologyCombined) or substringof('$SAP Fiori: SAP Smart Business generic drill down app$',UITechnologyCombined) or substringof('$SAP Fiori: SAP Smart Business tile %26 custom drill down app$',UITechnologyCombined))",
      });
      for (let index = 0; index < apps.length; index++) {
        const element = apps[index];
        //
        /*
        const details = await fioriAppsLibrary
          .read(Details)
          .columns("fioriId", "releaseId", "AppName")
          .where({ fioriId: element.appId, releaseId: element.releaseId });
          */
        const details = await fioriAppsLibrary.send({
          method: "GET",
          path:
            `Details(fioriId='${element.appId}',releaseId='${element.releaseId}')` +
            "?$format=json" +
            "&$expand=RequiredODataServices",
        });
        if (details.RequiredODataServices.length > 0) {
          const result = await cds.run([
            INSERT.into(RequiredODataServices).entries(
              details.RequiredODataServices
            ),
          ]);
        }
        // console.log(details.RequiredODataServices);
        cleanObject(details);
        // console.log(details);
        const resultDetails = await cds.run([
          INSERT.into(Details).entries(details),
        ]);
      }
    } catch (error) {
      console.log(error);
    }
  });
});
