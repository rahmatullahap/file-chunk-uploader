import Logger, { LogLevel, createLogger } from 'bunyan';
import * as PrettyStream from 'bunyan-prettystream';

export function createNodeLogger(level: LogLevel): Logger {
  const prettyStdOut = new PrettyStream();
  prettyStdOut.pipe(process.stdout);

  return createLogger({
    name: 'file-chunk-uploader',
    level,
    streams: [
      {
        level: 'debug',
        type: 'raw',
        stream: prettyStdOut
      }
    ]
  });
}
