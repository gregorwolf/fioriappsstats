using {SingleApp.fix.externalViewer.services.SingleApp as external} from '../srv/external/SingleApp';

namespace db;

@cds.persistence.table
entity Details : external.Details {
  RequiredODataServices : Association to many RequiredODataServices
                            on  RequiredODataServices.fioriId   = $self.fioriId
                            and RequiredODataServices.releaseId = $self.releaseId
}

entity RequiredODataServices : external.RequiredODataServices {

}
