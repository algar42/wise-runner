const fs = require("fs");
const nexline = require("nexline");

class logChecker {
  constructor(fileId, path, callback) {
    this.fileId = fileId;
    this.path = path;
    this.callback = callback;
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

    this.checkLog();
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

  async checkLog() {
    try {
      const reader = nexline({
        input: fs.createReadStream(this.path),
        lineSeparator: ["\n", "\r\n"],
        autoCloseFile: true,
      });
      while (true) {
        const line = await reader.next();
        if (line === null) break; // line is null if we reach the end
        if (line.length === 0) continue; // Ignore empty lines

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
        this.callback(this.result);
      }
    } catch (error) {
      console.log("error: " + error);
      this.result.error = true;
      this.callback(this.result);
    }
  }

  getState() {
    return this.result;
  }
}

module.exports = logChecker;
