const fs = require("fs");
const nexline = require("nexline");

class logChecker {
  constructor(fileId, path, callback) {
    this.fileId = fileId;
    this.path = path;
    this.callback = callback;
    this.line = 0;
    this.end = false;
    this.mis = 1;
    this.result = {
      fileId: this.fileId,
      error: null,
      end: this.end,
      e: 0,
      eq: 0,
      em: 0,
      eo: 0,
      w: 0,
      wq: 0,
      wm: 0,
      n: 0,
      nr: 0,
      np: 0,
      nq: 0,
      nm: 0,
    };

    //this.checkLog();
  }

  reg = {
    r_e: /(^ERROR\s*\d*\s*[-]*\s*\d*:|^FATAL\s*\d*\s*[-]*\s*\d*:)/,
    r_eq: /(^ERROR\s*\d*\s*[-]*\s*\d*:\s*\[[Qq][Cc]\]|^ERROR\s*\d*\s*[-]*\s*\d*:\s*QC\s*|^ERROR\s*\d*\s*[-]*\s*\d*:\s*QC$|^Error:|^error:)/,
    r_em: /(^ERROR\s*\d*\s*[-]*\s*\d*:\s*\[[a-zA-Z_]+\])/,
    r_w: /(^WARNING\s*\d*\s*[-]*\s*\d*:)/,
    r_wq: /(^WARNING\s*\d*\s*[-]*\s*\d*:\s*\[[Qq][Cc]\]|^WARNING\s*\d*\s*[-]*\s*\d*:\s*QC\s*|^WARNING\s*\d*\s*[-]*\s*\d*:\s*QC$|^Warning:|^warning:)/,
    r_wm: /(^WARNING\s*\d*\s*[-]*\s*\d*:\s*\[[a-zA-Z_]+\])/,
    r_n: /(^NOTE\s*\d*\s*[-]*\s*\d*:)/,
    r_nq: /(^NOTE\s*\d*\s*[-]*\s*\d*:\s*\[[Qq][Cc]\]|^NOTE\s*\d*\s*[-]*\s*\d*:\s*QC\s*|^NOTE\s*\d*\s*[-]*\s*\d*:\s*QC$|^Note:|^note:)/,
    r_nm: /(^NOTE\s*\d*\s*[-]*\s*\d*:\s*\[[a-zA-Z_]+\])/,
    r_np: /(MERGE statement|The SAS System stopped)/,
    r_nr: /(No observations|no observations|is uninitialized|axis range|values have been converted|too small|Invalid data|was not found or could not be loaded|unable |truncated|Invalid\s+[^\s]*\s*argument|Invalid \(or missing\)\s+[^\s]*\s*argument)/,
    r_no: /(Division by zero|could not be performed|No variables|Missing value|repeats of BY values|has the same name|were 0 observations|Interactivity disabled|hardware font was specified|does not exist|will continue to check)/,
    r_nmis: /(SAS Campus Drive)/,
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
        this.line++;

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
          if (this.reg.r_nr.test(line)) {
            this.result.n++;
            this.result.nr++;
          } else if (this.reg.r_np.test(line)) {
            this.result.n++;
            this.result.np++;
          } else if (this.reg.r_no.test(line)) {
            this.result.n++;
          } else if (this.reg.r_nmis.test(line)) {
            this.mis = 0;
          }
        }
        if (this.line % 15000 === 0) this.callback(this.result);
      }
      if (this.mis === 1) {
        this.result.eo++;
      }
      this.result.end = true;
      this.callback(this.result);
      //console.log(this.result);
    } catch (error) {
      this.result.end = true;
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
