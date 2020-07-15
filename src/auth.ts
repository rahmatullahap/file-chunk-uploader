import { sign, verify } from 'jsonwebtoken';
import { config } from './config';
const { SECRET } = config;

/**
 * token information
 *
 * @export
 * @interface TokenClaim
 */
export interface TokenClaim {
  device_id?: string;
  provider_id?: string;
}

/**
 * create provider spesific access token
 *
 * @export
 * @returns
 */
export function createToken(payload: TokenClaim): string {
  return sign(payload, SECRET);
}

/**
 * verify and decode access token
 *
 * @export
 * @param {string} token
 * @returns {TokenClaim}
 */
export function verifyToken(token: string): TokenClaim {
  return verify(token, SECRET) as TokenClaim;
}
