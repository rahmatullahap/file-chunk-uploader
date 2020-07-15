import * as express from "express";
import * as http from "http";
import * as WebSocket from "ws";
import * as fs from "fs";
import { random } from "faker";
import { config } from "./config";
import { MinioConnection } from "./minio";
import { createNodeLogger } from "./logger";

const { LOG_LEVEL, PORT, TEMP_DIR, STORAGE_URL } = config;

export interface UploadFileRequest {
  id: string;
  type: string;
  data: string;
  size: number;
  filename: string;
}
const logger = createNodeLogger(LOG_LEVEL);
const app = express();

app.get("/", (req, res) => {
  res.send("Hello...");
});

// initialize a simple http server
const server = http.createServer(app);
const wss = new WebSocket.Server({ server });
wss.on("connection", (ws: WebSocket, req) => {
  let url = req.url;
  const token = url.substr(url.indexOf("access_token") + 13, url.length);
  let filename = "";
  let writer: fs.WriteStream;
  let totalSize = 0;
  let ext = "";
  ws.on("message", async (message: string) => {
    const request: UploadFileRequest = JSON.parse(message);
    if (request.type === "end") {
      writer.close();
      const minio = new MinioConnection(logger, token);
      let result = '';
      try {
        const file = await fs.promises.readFile(TEMP_DIR + "/" + filename);
        const resultName = await minio.putObject(file, filename);
        result = STORAGE_URL + "/" + resultName;
        fs.unlink(TEMP_DIR + "/" + filename, () => {});
      } catch (error) {
        ws.close(1001, error);
        fs.unlink(TEMP_DIR + "/" + filename, () => {});
      }
      ws.send(
        JSON.stringify({
          data: {
            file_url: result,
          },
        })
      );
    } else {
      if (request.type === "start") {
        totalSize = 0;
        filename = request.filename;
        ext = "." + filename.split(".").pop();
        const tempname = random.alphaNumeric(40); // temporary file, read file purpose
        filename = tempname + ext;
        writer = fs.createWriteStream(TEMP_DIR + "/" + filename);
      }
      let buf: ArrayBuffer;
      if (typeof Buffer.from === "function") {
        buf = Buffer.from(request.data, "base64");
      } else {
        buf = new Buffer(request.data, "base64");
      }
      totalSize += buf.byteLength;
      writer.write(buf);
    }
  });

  ws.on("error", () => {
    if (writer) {
      writer.close();
    }
    // remove file
    fs.unlink(TEMP_DIR + "/" + filename, () => {});
  });

  ws.on("close", () => {
    if (writer) {
      writer.close();
    }
    // remove file
    fs.unlink(TEMP_DIR + "/" + filename, () => {});
  });
});

server.listen(PORT, () => {
  logger.debug(`Server is running in http://localhost:${PORT}`)
});
