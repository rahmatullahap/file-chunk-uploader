import * as express from "express";
import * as http from "http";
import * as WebSocket from "ws";
import * as fs from "fs";
import { random } from "faker/locale/id_ID";
import { config } from "./config";

const { LOG_LEVEL, PORT, TEMP_DIR } = config;

export interface UploadFileRequest {
  id: string;
  type: string;
  data: string;
  size: number;
  filename: string;
}

const app = express();

app.get("/", (req, res) => {
  res.send("Hello...");
});

// initialize a simple http server
const server = http.createServer(app);
const wss = new WebSocket.Server({ server });
wss.on("connection", (ws: WebSocket, req) => {
  let filename = "";
  let writer: fs.WriteStream;
  let totalSize = 0;
  let ext = "";
  ws.on("message", (message: string) => {
    const request: UploadFileRequest = JSON.parse(message);
    if (request.type === "end") {
      ws.send(
        JSON.stringify({
          data: {
            file_url: filename,
          },
        })
      );
      writer.close();
    } else {
      if (request.type === "start") {
        totalSize = 0;
        filename = request.filename;
        ext = "." + filename.split(".").pop();
        const tempname = random.alphaNumeric(40); // temporary file, read file purpose
        filename = tempname + ext;
        writer = fs.createWriteStream(TEMP_DIR + '/' + filename);
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
    writer.close();
    // remove file
    fs.unlink(TEMP_DIR + '/' + filename, () => {});
  });

  ws.on("close", () => {
    writer.close();
    // remove file
    fs.unlink(TEMP_DIR + '/' + filename, () => {});
  });
});

server.listen(PORT, () => {
  console.log(`Server is running in http://localhost:${PORT}`);
});
