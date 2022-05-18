const fs = require("fs");

const readline = require("readline");

class logChecker {
  constructor(fileId, path, callback) {
    this.fileId = fileId;
    this.path = path;
    this.callback = callback;
    this.stream = null;
    this.result = {
      fileId: this.fileId,
      error: null,
      e: 0,
      eq: 0,
      em: 0,
      w: 0,
      wq: 0,
      wm: 0,
      n: 0,
      nq: 0,
      nm: 0,
    };

    //this.checkLog();
  }

  reg = {
    r_e: /(^ERROR\s*\d*\s*[-]*\s*\d*:|^FATAL\s*\d*\s*[-]*\s*\d*:)/,
    r_eq: /(^ERROR\s*\d*\s*[-]*\s*\d*:\s*\[[Qq][Cc]\]|^ERROR\s*\d*\s*[-]*\s*\d*:\s*QC\s+|^ERROR\s*\d*\s*[-]*\s*\d*:\s*QC$|^Error:|^error:)/,
    r_em: /(^ERROR\s*\d*\s*[-]*\s*\d*:\s*\[[a-zA-Z_]+\])/,
    r_w: /(^WARNING\s*\d*\s*[-]*\s*\d*:)/,
    r_wq: /(^WARNING\s*\d*\s*[-]*\s*\d*:\s*\[[Qq][Cc]\]|^WARNING\s*\d*\s*[-]*\s*\d*:\s*QC\s+|^WARNING\s*\d*\s*[-]*\s*\d*:\s*QC$|^Warning:|^warning:)/,
    r_wm: /(^WARNING\s*\d*\s*[-]*\s*\d*:\s*\[[a-zA-Z_]+\])/,
    r_n: /(^NOTE\s*\d*\s*[-]*\s*\d*:)/,
    r_nq: /(^NOTE\s*\d*\s*[-]*\s*\d*:\s*\[[Qq][Cc]\]|^NOTE\s*\d*\s*[-]*\s*\d*:\s*QC\s+|^NOTE\s*\d*\s*[-]*\s*\d*:\s*QC$|Note:|note:)/,
    r_nm: /(^NOTE\s*\d*\s*[-]*\s*\d*:\s*\[[a-zA-Z_]+\])/,
    r_nr: /(The SAS System stopped|Division by zero|could not be performed|No variables|No observations|no observations|Invalid data|Missing value|repeats of BY values|is uninitialized|has the same name|were 0 observations|values have been converted|truncated|Invalid\s+[^\s]*\s*argument|Invalid \(or missing\)\s+[^\s]*\s*argument|Interactivity disabled|hardware font was specified|does not exist|unable |too small|axis range|was not found or could not be loaded)/,
  };

  checkLog() {
    const instream = fs.createReadStream(this.path);
    this.stream = readline.createInterface({
      input: instream,
      terminal: false,
    });

    this.stream.on("line", (line) => {
      if (this.reg.r_eq.test(line)) {
        this.result.eq++;
      } else if (this.reg.r_em.test(line)) {
        this.result.em++;
      } else if (this.reg.r_e.test(line)) {
        this.result.e++;
      } else if (this.reg.r_wq.test(line)) {
        this.result.wq++;
      } else if (this.reg.r_wm.test(line)) {
        this.result.wm++;
      } else if (this.reg.r_w.test(line)) {
        this.result.w++;
      } else if (this.reg.r_nq.test(line)) {
        this.result.nq++;
      } else if (this.reg.r_nm.test(line)) {
        this.result.nm++;
      } else if (this.reg.r_n.test(line)) {
        if (this.reg.r_nr.test(line)) this.result.n++;
      }
    });
    this.stream.on("close", () => {
      this.callback(this.result);
    });
  }

  getState() {
    return this.result;
  }
}

module.exports = logChecker;
