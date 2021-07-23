using {SingleApp.fix.externalViewer.services.SingleApp as external} from '../srv/external/SingleApp';

namespace db;

@cds.persistence.table
@cds.persistence.skip : false
entity Details : external.Details {
  RequiredODataServices : Association to many RequiredODataServices
                            on  RequiredODataServices.fioriId   = $self.fioriId
                            and RequiredODataServices.releaseId = $self.releaseId
}

@cds.persistence.table
@cds.persistence.skip                            : false
@Aggregation.ApplySupported.PropertyRestrictions : true
entity RequiredODataServices : external.RequiredODataServices {
  @Analytics.Measure   : true
  @Aggregation.default : #SUM
  serviceCounter : Integer default 1;
}
