const MemosDAO = require("../data/memos-dao").MemosDAO;
const {
    environmentalScripts
} = require("../../config/config");

function MemosHandler(db) {
    "use strict";

    const MAX_MEMO_LENGTH = 4096;
    const memosDAO = new MemosDAO(db);
    const getExpectedOrigin = (req) => `${req.protocol}://${req.get("host")}`;

    const isSameOriginRequest = (req) => {
        const expectedOrigin = getExpectedOrigin(req);
        const origin = req.get("origin");
        const referer = req.get("referer");

        if (origin) {
            return origin === expectedOrigin;
        }

        if (referer) {
            return referer === expectedOrigin || referer.indexOf(`${expectedOrigin}/`) === 0;
        }

        return false;
    };

    this.addMemos = (req, res, next) => {

        if (!isSameOriginRequest(req)) {
            const err = new Error("Cross-site memo submission rejected");
            err.status = 403;
            return next(err);
        }

        const memo = typeof req.body.memo === "string" ? req.body.memo : "";

        if (memo.length > MAX_MEMO_LENGTH) {
            const err = new Error("Memo exceeds maximum length");
            err.status = 400;
            return next(err);
        }

        memosDAO.insert(memo, (err, docs) => {
            if (err) return next(err);
            this.displayMemos(req, res, next);
        });
    };

    this.displayMemos = (req, res, next) => {

        const {
            userId
        } = req.session;

        memosDAO.getAllMemos((err, docs) => {
            if (err) return next(err);
            return res.render("memos", {
                memosList: docs,
                userId: userId,
                environmentalScripts
            });
        });
    };

}

module.exports = MemosHandler;
