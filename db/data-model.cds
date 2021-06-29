using {SingleApp.fix.externalViewer.services.SingleApp as external} from '../srv/external/SingleApp';

namespace db;

@cds.persistence.table
entity Apps : external.Apps {

}
