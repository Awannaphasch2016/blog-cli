import { createHash } from 'node:crypto';

export function sha256(content) {
  return createHash('sha256').update(content, 'utf-8').digest('hex');
}
