const ResearchDAO = require("../data/research-dao").ResearchDAO;
const needle = require("needle");
const {
    environmentalScripts
} = require("../../config/config");

const YAHOO_FINANCE_QUOTE_URL = "https://finance.yahoo.com/q?s=";
const STOCK_SYMBOL_PATTERN = /^[A-Za-z0-9.-]{1,10}$/;

function ResearchHandler(db) {
    "use strict";

    const researchDAO = new ResearchDAO(db);

    this.displayResearch = (req, res) => {

        if (req.query.symbol) {
            const symbol = String(req.query.symbol).trim();

            if (!STOCK_SYMBOL_PATTERN.test(symbol)) {
                return res.status(400).send("Invalid symbol");
            }

            const url = YAHOO_FINANCE_QUOTE_URL + encodeURIComponent(symbol);
            return needle.get(url, (error, newResponse, body) => {
                if (!error && newResponse.statusCode === 200) {
                    res.writeHead(200, {
                        "Content-Type": "text/html"
                    });
                }
                res.write("<h1>The following is the stock information you requested.</h1>\n\n");
                res.write("\n\n");
                if (body) {
                    res.write(body);
                }
                return res.end();
            });
        }

        return res.render("research", {
            environmentalScripts
        });
    };

}

module.exports = ResearchHandler;
