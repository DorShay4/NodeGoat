const {
    BenefitsDAO
} = require("../data/benefits-dao");
const UserDAO = require("../data/user-dao").UserDAO;
const {
    environmentalScripts
} = require("../../config/config");

function BenefitsHandler(db) {
    "use strict";

    const benefitsDAO = new BenefitsDAO(db);
    const userDAO = new UserDAO(db);

    this.displayBenefits = (req, res, next) => {

        benefitsDAO.getAllNonAdminUsers((error, users) => {

            if (error) return next(error);

            return res.render("benefits", {
                users,
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

        return userDAO.getUserById(req.session.userId, (error, actor) => {
            if (error) return next(error);

            benefitsDAO.updateBenefits(userId, benefitStartDate, (error) => {

                if (error) return next(error);

                benefitsDAO.getAllNonAdminUsers((error, users) => {
                    if (error) return next(error);

                    const data = {
                        users,
                        user: {
                            isAdmin: true
                        },
                        updateSuccess: true,
                        environmentalScripts
                    };

                    return res.render("benefits", data);
                });
            }, actor);
        });
    };
}

module.exports = BenefitsHandler;
