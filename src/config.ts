import * as rc from 'rc';
type DebugLevel = 'trace' | 'debug' | 'info' | 'warn' | 'error' | 'fatal';

export interface Config {
  LOG_LEVEL: DebugLevel;
  PORT: string;
  TEMP_DIR: string;
  MINIO_ENDPOINT: string;
	MINIO_ACCESS_ID: string;
	MINIO_ACCESS_SECRET: string;
  MINIO_SSL: string;
  SECRET: string;
}

export const configDefault: Config = {
  LOG_LEVEL: 'info',
  PORT: '7223',
  TEMP_DIR: './temp',
  MINIO_ENDPOINT: 'localhost:9000',
	MINIO_ACCESS_ID: '',
	MINIO_ACCESS_SECRET: '',
  MINIO_SSL: '',
  SECRET: ''
};

export const config: Config = rc('config', configDefault) as Config;
