using {db} from '../db/data-model';

service CatalogService {

  entity Details               as projection on db.Details;
  entity RequiredODataServices as projection on db.RequiredODataServices;
  action loadDataFromSAP();
}
