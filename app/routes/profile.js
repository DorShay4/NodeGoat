const ProfileDAO = require("../data/profile-dao").ProfileDAO;
const {
    environmentalScripts
} = require("../../config/config");

/* The ProfileHandler must be constructed with a connected db */
function ProfileHandler(db) {
    "use strict";

    const profile = new ProfileDAO(db);
    // HTML escaping is handled by the template engine (swig autoescape).
    // The profile search link is a URL context, which autoescape does not cover.
    const profileSearchUrl = (firstName) =>
        `https://www.google.com/search?q=${encodeURIComponent(String(firstName || ""))}`;

    this.displayProfile = (req, res, next) => {
        const {
            userId
        } = req.session;



        profile.getByUserId(parseInt(userId), (err, doc) => {
            if (err) return next(err);
            doc.userId = userId;

            return res.render("profile", {
                ...doc,
                firstNameSafeString: doc.firstName,
                firstNameSearchUrl: profileSearchUrl(doc.firstName),
                environmentalScripts
            });
        });
    };

    this.handleProfileUpdate = (req, res, next) => {

        const {
            firstName,
            lastName,
            ssn,
            dob,
            address,
            bankAcc,
            bankRouting
        } = req.body;

        // Fix for Section: ReDoS attack
        // The following regexPattern that is used to validate the bankRouting number is insecure and vulnerable to
        // catastrophic backtracking which means that specific type of input may cause it to consume all CPU resources
        // with an exponential time until it completes
        // --
        // The Fix: Use a linear regex that only accepts digits followed by a trailing #.
        const regexPattern = /^[0-9]+#$/;
        // Allow only numbers with a suffix of the letter #, for example: 'XXXXXX#'
        const testComplyWithRequirements =
            typeof bankRouting === "string" && regexPattern.test(bankRouting);
        // if the regex test fails we do not allow saving
        if (testComplyWithRequirements !== true) {
            return res.render("profile", {
                firstNameSafeString: firstName,
                firstNameSearchUrl: profileSearchUrl(firstName),
                lastName,
                ssn,
                dob,
                address,
                bankAcc,
                bankRouting,
                updateError: "Bank Routing number does not comply with requirements for format specified",
                environmentalScripts
            });
        }

        const {
            userId
        } = req.session;

        profile.updateUser(
            parseInt(userId),
            firstName,
            lastName,
            ssn,
            dob,
            address,
            bankAcc,
            bankRouting,
            (err, user) => {

                if (err) return next(err);

                // WARN: Applying any sting specific methods here w/o checking type of inputs could lead to DoS by HPP
                //firstName = firstName.trim();
                user.updateSuccess = true;
                user.userId = userId;

                return res.render("profile", {
                    ...user,
                    firstNameSafeString: user.firstName,
                    firstNameSearchUrl: profileSearchUrl(user.firstName),
                    environmentalScripts
                });
            }
        );

    };

}

module.exports = ProfileHandler;
