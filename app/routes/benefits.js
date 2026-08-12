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

    const getRequester = (req, callback) => userDAO.getUserById(req.session.userId, callback);

    this.displayBenefits = (req, res, next) => {

        getRequester(req, (error, requester) => {
            if (error) return next(error);

            benefitsDAO.getAllNonAdminUsers(requester, (error, users) => {

                if (error) return next(error);

                return res.render("benefits", {
                    users,
                    user: requester,
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

        benefitsDAO.updateBenefits(userId, benefitStartDate, (error) => {

            if (error) return next(error);

            getRequester(req, (error, requester) => {
                if (error) return next(error);

                benefitsDAO.getAllNonAdminUsers(requester, (error, users) => {
                    if (error) return next(error);

                    const data = {
                        users,
                        user: requester,
                        updateSuccess: true,
                        environmentalScripts
                    };

                    return res.render("benefits", data);
                });
            });
        });
    };
}

module.exports = BenefitsHandler;
