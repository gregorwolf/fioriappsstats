using {FioriAppsLibrary as external} from '../srv/external/SingleApp';

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
  to_Details     : Association to one Details;
}

annotate RequiredODataServices with {
  fioriId               @title : 'Fiori ID';
  releaseId             @title : 'Release ID';
  AppName               @title : 'App Name';
  TechnicalName         @title : 'Technical Name';
  NameSpace             @title : 'Name Space';
  Version               @title : 'Version';
  isAdditional          @title : 'is Additional';
  PFCGRole              @title : 'PFCG Role';
  SoftwareComponentName @title : 'Software Component Name';
};
