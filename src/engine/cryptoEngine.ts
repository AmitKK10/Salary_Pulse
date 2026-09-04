// ============================================================================
// SALARYPULSE — CRYPTOGRAPHIC & INTEGRITY ENGINE (WEB CRYPTO API)
// SHA-256 Checksums, PBKDF2 Key Derivation, and AES-GCM-256 Encryption
// ============================================================================

export class CryptoEngine {
  /**
   * Compute a deterministic SHA-256 hex string for any string payload
   */
  static async computeSHA256(payload: string): Promise<string> {
    if (typeof window === 'undefined' || !window.crypto || !window.crypto.subtle) {
      // Fallback simple hash for non-browser/test environments
      return this.simpleHashFallback(payload);
    }

    try {
      const encoder = new TextEncoder();
      const data = encoder.encode(payload);
      const hashBuffer = await window.crypto.subtle.digest('SHA-256', data);
      const hashArray = Array.from(new Uint8Array(hashBuffer));
      const hex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
      return hex;
    } catch (e) {
      console.warn('CryptoEngine: SubtleCrypto digest failed, falling back to string hash', e);
      return this.simpleHashFallback(payload);
    }
  }

  /**
   * Encrypt a JSON string using AES-GCM 256-bit with PBKDF2 (100,000 iterations)
   */
  static async encrypt(
    plainText: string,
    password: string
  ): Promise<{ ciphertext: string; salt: string; iv: string }> {
    if (!password || password.trim().length === 0) {
      throw new Error('Password cannot be empty.');
    }

    if (typeof window === 'undefined' || !window.crypto || !window.crypto.subtle) {
      throw new Error('Web Cryptography API is unavailable in this environment.');
    }

    const encoder = new TextEncoder();
    const data = encoder.encode(plainText);

    // Generate 16 bytes cryptographically strong random salt
    const salt = window.crypto.getRandomValues(new Uint8Array(16));
    // Generate 12 bytes IV for AES-GCM
    const iv = window.crypto.getRandomValues(new Uint8Array(12));

    // Import the password string as key material
    const passwordKey = await window.crypto.subtle.importKey(
      'raw',
      encoder.encode(password),
      { name: 'PBKDF2' },
      false,
      ['deriveKey']
    );

    // Derive AES-GCM 256-bit encryption key using PBKDF2 (SHA-256, 100k iterations)
    const aesKey = await window.crypto.subtle.deriveKey(
      {
        name: 'PBKDF2',
        salt,
        iterations: 100000,
        hash: 'SHA-256',
      },
      passwordKey,
      { name: 'AES-GCM', length: 256 },
      false,
      ['encrypt', 'decrypt']
    );

    // Encrypt the plain text bytes
    const encryptedBuffer = await window.crypto.subtle.encrypt(
      {
        name: 'AES-GCM',
        iv,
      },
      aesKey,
      data
    );

    return {
      ciphertext: this.bufferToBase64(new Uint8Array(encryptedBuffer)),
      salt: this.bufferToBase64(salt),
      iv: this.bufferToBase64(iv),
    };
  }

  /**
   * Decrypt AES-GCM 256-bit ciphertext with password, salt and IV
   */
  static async decrypt(
    ciphertextBase64: string,
    password: string,
    saltBase64: string,
    ivBase64: string
  ): Promise<string> {
    if (!password || password.trim().length === 0) {
      throw new Error('Password cannot be empty.');
    }

    if (typeof window === 'undefined' || !window.crypto || !window.crypto.subtle) {
      throw new Error('Web Cryptography API is unavailable in this environment.');
    }

    const encoder = new TextEncoder();
    const decoder = new TextDecoder();

    const ciphertext = this.base64ToBuffer(ciphertextBase64);
    const salt = this.base64ToBuffer(saltBase64);
    const iv = this.base64ToBuffer(ivBase64);

    const passwordKey = await window.crypto.subtle.importKey(
      'raw',
      encoder.encode(password),
      { name: 'PBKDF2' },
      false,
      ['deriveKey']
    );

    const aesKey = await window.crypto.subtle.deriveKey(
      {
        name: 'PBKDF2',
        salt,
        iterations: 100000,
        hash: 'SHA-256',
      },
      passwordKey,
      { name: 'AES-GCM', length: 256 },
      false,
      ['decrypt']
    );

    try {
      const decryptedBuffer = await window.crypto.subtle.decrypt(
        {
          name: 'AES-GCM',
          iv,
        },
        aesKey,
        ciphertext
      );

      return decoder.decode(decryptedBuffer);
    } catch {
      throw new Error('Incorrect password or corrupted encrypted backup data.');
    }
  }

  // --- Base64 Helpers ---
  private static bufferToBase64(buffer: Uint8Array): string {
    let binary = '';
    const len = buffer.byteLength;
    for (let i = 0; i < len; i++) {
      binary += String.fromCharCode(buffer[i]);
    }
    return window.btoa(binary);
  }

  private static base64ToBuffer(base64: string): Uint8Array {
    const binary = window.atob(base64);
    const len = binary.length;
    const bytes = new Uint8Array(len);
    for (let i = 0; i < len; i++) {
      bytes[i] = binary.charCodeAt(i);
    }
    return bytes;
  }

  private static simpleHashFallback(str: string): string {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      const chr = str.charCodeAt(i);
      hash = ((hash << 5) - hash) + chr;
      hash |= 0;
    }
    return `fallback-${Math.abs(hash).toString(16).padStart(16, '0')}`;
  }
}
