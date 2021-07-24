const { cleanObject } = require("./helper");

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
