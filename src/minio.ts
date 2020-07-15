import * as Minio from "minio";
import { config } from "./config";
import { verifyToken } from "./auth";
import sha1 = require("sha1");
import Logger = require("bunyan");

const {
  MINIO_ENDPOINT,
  MINIO_ACCESS_ID,
  MINIO_ACCESS_SECRET,
  MINIO_SSL,
} = config;

const endpoints = MINIO_ENDPOINT.split(":");

const MINIO_PORT = endpoints.pop();
const MINIO_URL = endpoints.join(':');

export class MinioConnection {
  minioClient = new Minio.Client({
    endPoint: MINIO_URL,
    port: parseInt(MINIO_PORT, 10),
    accessKey: MINIO_ACCESS_ID,
    secretKey: MINIO_ACCESS_SECRET,
    useSSL: MINIO_SSL === "true" ? true : false,
  });

  provider_id: string = "";

  constructor(private logger: Logger, private token: string) {
    const { provider_id } = verifyToken(token);
    this.provider_id = sha1(provider_id);
    if (!provider_id) {
      this.provider_id = "public";
    }
  }

  async putObject(file: Buffer, filename: string) {
    let exist = false;
    try {
      const exist = await this.minioClient.bucketExists(this.provider_id);
      if (!exist) {
        await this.minioClient.makeBucket(this.provider_id, "");
      }
      const result = await this.minioClient.putObject(
        this.provider_id,
        filename,
        file
      );
      return filename;
    } catch (error) {
      this.logger.error(error);
    }

    return null;
  }
}
