using {db} from '../db/data-model';

service CatalogService {

  entity Apps as projection on db.Apps;

}
