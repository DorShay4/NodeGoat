const {
    BenefitsDAO
} = require("../data/benefits-dao");
const {
    environmentalScripts
} = require("../../config/config");

function BenefitsHandler(db) {
    "use strict";

    const benefitsDAO = new BenefitsDAO(db);
    const escapeHtml = (value) => String(value === undefined || value === null ? "" : value)
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#39;");
    const escapeUsers = (users) => (users || []).map(user => Object.assign({}, user, {
        firstName: escapeHtml(user.firstName),
        lastName: escapeHtml(user.lastName)
    }));

    this.displayBenefits = (req, res, next) => {

        benefitsDAO.getAllNonAdminUsers((error, users) => {

            if (error) return next(error);

            return res.render("benefits", {
                users: escapeUsers(users),
                user: {
                    isAdmin: true
                },
                environmentalScripts
            });
        });
    };

    this.updateBenefits = (req, res, next) => {
        const {
            userId,
            benefitStartDate
        } = req.body;

        benefitsDAO.updateBenefits(userId, benefitStartDate, (error) => {

            if (error) return next(error);

            benefitsDAO.getAllNonAdminUsers((error, users) => {
                if (error) return next(error);

                const data = {
                    users: escapeUsers(users),
                    user: {
                        isAdmin: true
                    },
                    updateSuccess: true,
                    environmentalScripts
                };

                return res.render("benefits", data);
            });
        });
    };
}

module.exports = BenefitsHandler;
