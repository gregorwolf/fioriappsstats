var DetailsData = require("./data/Details.json");
DetailsData.d.results.forEach(cleanObject);
var RequiredODataServicessData = require("./data/RequiredODataServices.json");
RequiredODataServicessData.d.results.forEach(cleanObject);

module.exports = (db) => {
  const { Details, RequiredODataServices } = db.entities;

  return cds.run([
    DELETE.from(Details).where("1 = 1"),
    INSERT.into(Details).rows(DetailsData.d.results),
    DELETE.from(RequiredODataServices).where("1 = 1"),
    INSERT.into(RequiredODataServices).rows(
      RequiredODataServicessData.d.results
    ),
  ]);
};

function cleanObject(obj) {
  Object.keys(obj).forEach((key) => {
    const value = obj[key];
    if (typeof value === "object") {
      delete obj[key];
    } else if (typeof value === "string") {
      // match the common sap odata date format like "/Date(1603065600000)/"
      // also matches the more uncommon "/Date(253402300799000+0000)/". But this will only work correctly for utc! (+0000)
      const matchDate = value.match(/\/Date\((-*\d+)\+?\d*\)\//);
      if (matchDate) {
        obj[key] = format(new Date(Number(matchDate[1])), "yyyy-MM-dd");
      }
      // match the sap odata time format like "PT09H50M58S"
      const matchTime = value.match(/^PT(\d\d)H(\d\d)M(\d\d)S/);
      if (matchTime) {
        obj[key] =
          matchTime[1] + ":" + matchTime[2] + ":" + matchTime[3] + ".00";
      }
    }
  });
}
