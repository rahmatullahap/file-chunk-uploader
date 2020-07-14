import * as rc from 'rc';
type DebugLevel = 'trace' | 'debug' | 'info' | 'warn' | 'error' | 'fatal';

export interface Config {
  LOG_LEVEL: DebugLevel;
  PORT: string;
  TEMP_DIR: string;
}

export const configDefault: Config = {
  LOG_LEVEL: 'info',
  PORT: '7223',
  TEMP_DIR: './temp'
};

export const config: Config = rc('config', configDefault) as Config;
