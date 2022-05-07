const { spawn } = require("child_process");

class appRunner {
  constructor(fileId, args, callback) {
    this.fileId = fileId;
    this.child = null;
    this.pid = null;
    this.exitCode = null;
    this.error = null;
    this.callback = callback;
    this.app = args[0];
    this.args = args.slice(1);
    this.runApp();
  }
  runApp() {
    try {
      this.child = spawn(this.app, this.args, {
        windowsVerbatimArguments: true,
        shell: false,
        windowsHide: false,
      });
      this.pid = this.child.pid;
      this.child.on("error", (err) => {
        this.error = err.errno;
        console.log(err);
        this.callback({
          exitCode: this.exitCode,
          fileIds: [this.fileId],
          pid: this.pid,
          error: this.error,
        });
      });
      this.child.on("exit", (exitCode) => {
        this.exitCode = exitCode;

        this.callback({
          exitCode,
          fileIds: [this.fileId],
          pid: this.pid,
          error: null,
        });
      });
    } catch (error) {
      console.log("Error", error);
      this.error = error;
    }
  }

  getState() {
    return {
      fileIds: [this.fileId],
      pid: this.pid,
      exitCode: this.exitCode,
      error: this.error,
    };
  }
}

module.exports = appRunner;
