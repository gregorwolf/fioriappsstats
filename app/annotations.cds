using {db} from '../db/data-model';

annotate db.RequiredODataServices with @(UI : {
  Identification      : [{Value : TechnicalName}],
  SelectionFields     : [
    fioriId,
    releaseId,
    AppName,
    TechnicalName,
    NameSpace,
    Version,
    isAdditional,
    PFCGRole,
    SoftwareComponentName,
  ],
  LineItem            : [
    {Value : fioriId},
    {Value : releaseId},
    {Value : AppName},
    {Value : TechnicalName},
    {Value : NameSpace},
    {Value : Version},
    {Value : isAdditional},
    {Value : PFCGRole},
    {Value : SoftwareComponentName},
  ],
  HeaderInfo          : {
    TypeName       : 'OData Service',
    TypeNamePlural : 'OData Servicess',
    Title          : {Value : TechnicalName},
  },
  Facets              : [{
    $Type  : 'UI.ReferenceFacet',
    Label  : '{i18n>Details}',
    Target : '@UI.FieldGroup#Details'
  }, ],
  FieldGroup #Details : {Data : [
    {Value : fioriId},
    {Value : releaseId},
    {Value : AppName},
    {Value : NameSpace},
    {Value : TechnicalName},
    {Value : Version},
  ]},
});
