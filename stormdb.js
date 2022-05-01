const stormDB = require("stormdb");
const path = require("path");

class stormdb {
  constructor(dbPath, dbName, defaults) {
    const engine = new stormDB.localFileEngine(path.resolve(dbPath, dbName));
    this.db = new stormDB(engine);
    this.db.default(defaults || {});
  }
}

module.exports = stormdb;
