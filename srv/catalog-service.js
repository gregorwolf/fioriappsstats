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

  srv.on("loadDataFromSAP", async (req) => {
    db.run(DELETE.from(Details));
    db.run(DELETE.from(RequiredODataServices));
    try {
      const details = await fioriAppsLibrary
        .tx(req)
        .read(Details)
        .columns("fioriId", "releaseId", "AppName")
        .where({ fioriId: "F0862", releaseId: "S20OP" });
      console.log(details);
    } catch (error) {
      console.log(error);
    }
  });
});
