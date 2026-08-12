const ProfileDAO = require("../data/profile-dao").ProfileDAO;
const ESAPI = require("node-esapi");
const {
    environmentalScripts
} = require("../../config/config");

/* The ProfileHandler must be constructed with a connected db */
function ProfileHandler(db) {
    "use strict";

    const profile = new ProfileDAO(db);
    const encodeForHTML = (value) => ESAPI.encoder().encodeForHTML(String(value || ""));
    const encodeProfileViewModel = (profileDoc) => ({
        ...profileDoc,
        firstName: encodeForHTML(profileDoc.firstName),
        firstNameSafeString: encodeForHTML(profileDoc.firstName),
        lastName: encodeForHTML(profileDoc.lastName),
        ssn: encodeForHTML(profileDoc.ssn),
        dob: encodeForHTML(profileDoc.dob),
        address: encodeForHTML(profileDoc.address),
        bankAcc: encodeForHTML(profileDoc.bankAcc),
        bankRouting: encodeForHTML(profileDoc.bankRouting),
        website: encodeForHTML(profileDoc.website)
    });

    this.displayProfile = (req, res, next) => {
        const {
            userId
        } = req.session;



        profile.getByUserId(parseInt(userId), (err, doc) => {
            if (err) return next(err);
            doc.userId = userId;

            return res.render("profile", {
                ...encodeProfileViewModel(doc),
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
                ...encodeProfileViewModel({
                    firstName,
                    lastName,
                    ssn,
                    dob,
                    address,
                    bankAcc,
                    bankRouting
                }),
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
                    ...encodeProfileViewModel(user),
                    environmentalScripts
                });
            }
        );

    };

}

module.exports = ProfileHandler;
