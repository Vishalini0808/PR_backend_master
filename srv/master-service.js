
const cds = require("@sap/cds");

module.exports = cds.service.impl(function () {

    const {
        ApprovalMatrix,
        OrganizationalUnits,
        PurchaseCategories
    } = this.entities;

    // CREATE Approval Matrix
    this.before("CREATE", "ApprovalMatrix", async (req) => {
        await validateApprovalMatrix(req);
    });

    // UPDATE Approval Matrix
    this.before("UPDATE", "ApprovalMatrix", async (req) => {
        await validateApprovalMatrix(req);
    });

    async function validateApprovalMatrix(req) {

        const {
            matrixCode,
            approvalLevel,
            sequenceNumber,
            minimumAmount,
            maximumAmount,
            currency,
            approverRole,
            organizationalUnit_ID,
            purchaseCategory_ID
        } = req.data;

        // 1. Matrix code validation
        if (!matrixCode || !matrixCode.trim()) {
            req.error(400, "Matrix code is required.", "matrixCode");
        }

        // 2. Approval level validation
        if (!Number.isInteger(approvalLevel) ||
            approvalLevel < 1 || approvalLevel > 10) {
            req.error(400, "Approval level must be between 1 and 10.", "approvalLevel");
        }

        // 3. Sequence number validation
        if (!Number.isInteger(sequenceNumber) ||
            sequenceNumber < 1 || sequenceNumber > 10) {
            req.error(400, "Sequence number must be between 1 and 10.", "sequenceNumber");
        }

        // 4. Minimum amount validation
        if (minimumAmount == null || Number(minimumAmount) < 0) {
            req.error(400, "Minimum amount cannot be negative or empty.", "minimumAmount");
        }

        // 5. Maximum amount validation
        if (maximumAmount == null ||
            Number(maximumAmount) < Number(minimumAmount)) {
            req.error(400, "Maximum amount must be greater than or equal to minimum amount.", "maximumAmount");
        }

        // 6. Currency validation
        if (!currency || !/^[A-Z]{3}$/.test(currency)) {
            req.error(400, "Currency must be a valid 3-letter uppercase code.", "currency");
        }

        // 7. Approver role validation
        const allowedRoles = [
            "DepartmentManager",
            "FinanceApprover",
            "ProcurementOfficer"
        ];

        if (!allowedRoles.includes(approverRole)) {
            req.error(400, "Invalid approver role.", "approverRole");
        }

        // 8. Organizational Unit validation
        if (organizationalUnit_ID) {

            const unit = await SELECT.one
                .from(OrganizationalUnits)
                .where({
                    ID: organizationalUnit_ID,
                    status: "ACTIVE"
                });

            if (!unit) {
                req.error(400, "Organizational Unit does not exist or is inactive.", "organizationalUnit_ID");
            }
        }

        // 9. Purchase Category validation
        if (purchaseCategory_ID) {

            const category = await SELECT.one
                .from(PurchaseCategories)
                .where({
                    ID: purchaseCategory_ID,
                    status: "ACTIVE"
                });

            if (!category) {
                req.error(400, "Purchase Category does not exist or is inactive.", "purchaseCategory_ID");
            }
        }


        // 10. Check overlapping amount ranges
        const existingRules = await SELECT.from(ApprovalMatrix).where({
            approvalLevel: Number(approvalLevel),
            sequenceNumber: Number(sequenceNumber),
            currency: currency,
            status: "ACTIVE"
        });

        // Exclude the current record during UPDATE
        const conflictingRule = existingRules.find(rule => {

            if (req.event === "UPDATE" && rule.ID === data.ID) {
                return false;
            }

            // Compare organizational unit scope
            const sameOrganizationalUnit =
                (rule.organizationalUnit_ID || null) ===
                (organizationalUnit_ID || null);

            // Compare purchase category scope
            const samePurchaseCategory =
                (rule.purchaseCategory_ID || null) ===
                (purchaseCategory_ID || null);

            // Check whether amount ranges overlap
            const rangesOverlap =
                Number(minimumAmount) <= Number(rule.maximumAmount) &&
                Number(maximumAmount) >= Number(rule.minimumAmount);

            return (
                sameOrganizationalUnit &&
                samePurchaseCategory &&
                rangesOverlap
            );
        });

        if (conflictingRule) {
            req.error(
                400,
                `Amount range conflicts with existing approval rule ${conflictingRule.matrixCode}.`,
                "minimumAmount"
            );
        }

    }

});
