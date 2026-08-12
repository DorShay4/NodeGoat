/* The BenefitsDAO must be constructed with a connected database object */
function BenefitsDAO(db) {

    "use strict";

    /* If this constructor is called without the "new" operator, "this" points
     * to the global object. Log a warning and call it correctly. */
    if (false === (this instanceof BenefitsDAO)) {
        console.log("Warning: BenefitsDAO constructor called without 'new' operator");
        return new BenefitsDAO(db);
    }

    const usersCol = db.collection("users");

    const normalizeBenefitStartDate = startDate => {
        const trimmedStartDate = String(startDate || "").trim();
        if (!/^\d{4}-\d{2}-\d{2}$/.test(trimmedStartDate)) {
            throw new Error("Invalid benefit start date");
        }

        const parsedDate = new Date(`${trimmedStartDate}T00:00:00.000Z`);
        if (Number.isNaN(parsedDate.getTime()) ||
            parsedDate.toISOString().slice(0, 10) !== trimmedStartDate) {
            throw new Error("Invalid benefit start date");
        }

        return trimmedStartDate;
    };

    this.getAllNonAdminUsers = callback => {
        usersCol.find({
            "isAdmin": {
                $ne: true
            }
        }).toArray((err, users) => callback(null, users));
    };

    this.updateBenefits = (userId, startDate, callback) => {
        const normalizedStartDate = normalizeBenefitStartDate(startDate);

        usersCol.update({
                _id: parseInt(userId, 10)
            }, {
                $set: {
                    benefitStartDate: normalizedStartDate
                }
            },
            (err, result) => {
                if (!err) {
                    console.log("Updated benefits");
                    return callback(null, result);
                }

                return callback(err, null);
            }
        );
    };
}

module.exports = { BenefitsDAO };
