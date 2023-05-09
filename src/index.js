const { indievoxTicketScraper } = require("./indievox/script");

const commandToFunction = {
  indievoxTicketScraper: indievoxTicketScraper,
};

(async () => {
  const command = process.argv[2];

  await commandToFunction[command]();
})();

module.exports = {
  indievoxTicketScraper,
};
