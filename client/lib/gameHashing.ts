/**
 * Generate a random salt for commit-reveal protocol
 */
export function generateSalt(): string {
  const array = new Uint8Array(16);
  crypto.getRandomValues(array);
  return Array.from(array, (byte) => byte.toString(16).padStart(2, '0')).join('');
}

/**
 * Hash choice with salt using SHA-256
 * Returns hex string of the hash
 */
export async function hashChoice(choice: string, salt: string): Promise<string> {
  const message = JSON.stringify({ choice, salt });
  const encoder = new TextEncoder();
  const data = encoder.encode(message);
  const hashBuffer = await crypto.subtle.digest('SHA-256', data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  const hashHex = hashArray.map((b) => b.toString(16).padStart(2, '0')).join('');
  return hashHex;
}

/**
 * Generate commit hash for a given choice
 * Returns { commitHash, salt } which should be stored for reveal phase
 */
export async function generateCommit(choice: string): Promise<{ commitHash: string; salt: string }> {
  const salt = generateSalt();
  const commitHash = await hashChoice(choice, salt);
  return { commitHash, salt };
}

/**
 * Verify a reveal by re-hashing and comparing with commitment
 */
export async function verifyReveal(
  choice: string,
  salt: string,
  commitHash: string
): Promise<boolean> {
  const computedHash = await hashChoice(choice, salt);
  return computedHash === commitHash;
}
