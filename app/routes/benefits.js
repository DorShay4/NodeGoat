const {
    BenefitsDAO
} = require("../data/benefits-dao");
const {
    UserDAO
} = require("../data/user-dao");
const {
    environmentalScripts
} = require("../../config/config");

function BenefitsHandler(db) {
    "use strict";

    const benefitsDAO = new BenefitsDAO(db);
    const userDAO = new UserDAO(db);

    // Resolve the acting user from the session and refuse non-admins.
    // This backs up the isAdmin route middleware, so the handler is safe even
    // if it is ever mounted without it.
    const getAuthorizedAdmin = (req, res, next, callback) => {
        return userDAO.getUserById(req.session.userId, (error, user) => {
            if (error) return next(error);
            if (!user || !user.isAdmin) {
                return res.redirect("/login");
            }

            return callback(user);
        });
    };

    this.displayBenefits = (req, res, next) => {

        return getAuthorizedAdmin(req, res, next, admin => {
            benefitsDAO.getAllNonAdminUsers(admin, (error, users) => {

                if (error) return next(error);

                return res.render("benefits", {
                    users,
                    user: admin,
                    environmentalScripts
                });
            });
        });
    };

    this.updateBenefits = (req, res, next) => {
        const {
            userId,
            benefitStartDate
        } = req.body;

        return getAuthorizedAdmin(req, res, next, admin => {
            // updateBenefits validates benefitStartDate and throws on bad input.
            // We are inside an async callback, so Express cannot catch that
            // throw automatically; forward it to the error handler explicitly.
            try {
                benefitsDAO.updateBenefits(userId, benefitStartDate, (error) => {

                    if (error) return next(error);

                    benefitsDAO.getAllNonAdminUsers(admin, (error, users) => {
                        if (error) return next(error);

                        const data = {
                            users,
                            user: admin,
                            updateSuccess: true,
                            environmentalScripts
                        };

                        return res.render("benefits", data);
                    });
                }, admin);
            } catch (error) {
                return next(error);
            }
        });
    };
}

module.exports = BenefitsHandler;
