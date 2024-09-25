const path = require("path");
const fs = require("fs");
const crypto = require("crypto");
const zlib = require("zlib");

class HashObjectCommand {
  constructor(flag, filePath) {
    this.flag = flag;
    this.filePath = filePath;
  }

  execute() {
    //1. make sure the file is there
    const filePath = path.resolve(this.filePath);
    if (!fs.existsSync(filePath)) {
      throw new Error(`File '${this.filePath}' does not exist`);
    }

    //2. read the file
    const fileContent = fs.readFileSync(filePath);
    const fileSize = fileContent.length;

    //3. create the blob object
    const header = `blob ${fileSize}\0`;
    const blob = Buffer.concat([Buffer.from(header), fileContent]);

    //4. calculate the hash
    const hash = crypto.createHash("sha1").update(blob).digest("hex");

    //5. if -w then write file also(compress)
    if (this.flag && this.flag === "-w") {
      const folder = hash.slice(0, 2);
      const fileName = hash.slice(2);

      const completeFolderPath = path.join(
        process.cwd(),
        ".git",
        "objects",
        folder
      );

      if (!fs.existsSync(completeFolderPath)) fs.mkdirSync(completeFolderPath);
        const compressedData = zlib.deflateSync(blob);
        fs.writeFileSync(
          path.join(completeFolderPath, fileName),compressedData);
      

        }
        process.stdout.write(hash);
  }
}

module.exports = HashObjectCommand;
