using { procurement.masterdata as db } from '../db/schema';

@path: '/master'
service MasterDataService {

    entity OrganizationalUnits as projection on db.OrganizationalUnits;

    entity CostCentres as projection on db.CostCentres;

    entity PurchaseCategories as projection on db.PurchaseCategories;

    entity Budgets as projection on db.Budgets;

    entity ApprovalMatrix as projection on db.ApprovalMatrix;

    entity DeliveryLocations as projection on db.DeliveryLocations;

    entity ProjectReferences as projection on db.ProjectReferences;

}