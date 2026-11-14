
namespace procurement.masterdata;

using { cuid, managed } from '@sap/cds/common';

// COMMON TYPES

type Amount       : Decimal(15,2);
type CurrencyCode : String(3);
type Percentage   : Decimal(5,2);

// ENUMS

type MasterStatus : String enum {
    Active   = 'ACTIVE';
    Inactive = 'INACTIVE';
};

// COMMON STATUS ASPECT

aspect HasStatus {
    status : MasterStatus default #Active;
};

// ORGANIZATIONAL UNITS

entity OrganizationalUnits : cuid, managed, HasStatus {

    unitCode    : String(20) not null;
    unitName    : String(100) not null;
    description : String(255);

}

annotate OrganizationalUnits with
    @assert.unique.unitCode: [unitCode];


// COST CENTRES

entity CostCentres : cuid, managed, HasStatus {

    costCentreCode : String(30) not null;
    costCentreName : String(100) not null;
    description    : String(255);

    organizationalUnit : Association to one OrganizationalUnits
        not null @assert.target;

}

annotate CostCentres with
    @assert.unique.costCentreCode: [costCentreCode];


// PURCHASE CATEGORIES

entity PurchaseCategories : cuid, managed, HasStatus {

    categoryCode  : String(20) not null;
    categoryName  : String(100) not null;
    description   : String(255);

}

annotate PurchaseCategories with
    @assert.unique.categoryCode: [categoryCode];


// BUDGETS

entity Budgets : cuid, managed, HasStatus {

    budgetCode        : String(30) not null;
    financialYear     : Integer not null;

    allocatedAmount   : Amount not null
        @assert.range: [0, 9999999999999.99];

    committedAmount   : Amount default 0
        @assert.range: [0, 9999999999999.99];

    actualSpentAmount : Amount default 0
        @assert.range: [0, 9999999999999.99];

    currency          : CurrencyCode default 'INR';

    costCentre : Association to one CostCentres
        not null @assert.target;

}

annotate Budgets with
    @assert.unique.budgetCode: [budgetCode];


// APPROVAL MATRIX

entity ApprovalMatrix : cuid, managed, HasStatus {

    matrixCode     : String(30) not null;

    approvalLevel  : Integer not null
        @assert.range: [1, 10];

    sequenceNumber : Integer not null
        @assert.range: [1, 10];

    minimumAmount  : Amount not null
        @assert.range: [0, 9999999999999.99];

    maximumAmount  : Amount
        @assert.range: [0, 9999999999999.99];

    currency       : CurrencyCode default 'INR';

    approverRole   : String(50) not null;

    organizationalUnit : Association to one OrganizationalUnits
        @assert.target;

    purchaseCategory : Association to one PurchaseCategories
        @assert.target;

}

annotate ApprovalMatrix with
    @assert.unique.matrixCode: [matrixCode];


// DELIVERY LOCATIONS

entity DeliveryLocations : cuid, managed, HasStatus {

    locationCode : String(20) not null;
    locationName : String(100) not null;

    address      : String(255);
    city         : String(100);
    state        : String(100);
    postalCode   : String(20);
    country      : String(100);

}

annotate DeliveryLocations with
    @assert.unique.locationCode: [locationCode];


// PROJECT REFERENCES

entity ProjectReferences : cuid, managed, HasStatus {

    projectCode : String(30) not null;
    projectName : String(150) not null;
    description : String(500);

}

annotate ProjectReferences with
    @assert.unique.projectCode: [projectCode];
