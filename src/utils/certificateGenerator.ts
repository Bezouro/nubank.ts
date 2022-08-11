import Axios, { AxiosInstance } from 'axios';
import fs from 'fs';
import { IncomingMessage } from 'http';
import Forge, { asn1, pki } from 'node-forge';
import Discovery from './discovery';

interface IPayload {
  login: string,
  password: string,
  public_key: string,
  public_key_crypto: string,
  model: string,
  device_id: string,
  code?: string,
  'encrypted-code'?: string,
}

export default class CertificateGenerator {
  login: string;
  password: string;
  device_id: string;
  encrypted_code: string;
  partialEmail: string;
  key1: pki.rsa.KeyPair;
  key2: pki.rsa.KeyPair;
  discovery: Discovery;
  url: string;
  client: AxiosInstance;
  codeSentAt: Date;
  expiresAt: Date;

  static fromState(discovery: Discovery, password: string) {
    const state = fs.readFileSync('.loginstate', 'utf8');
    const parsed = JSON.parse(CertificateGenerator.decryptString(state, Buffer.from(password + password).toString('base64')));
    if (new Date(parsed.expiresAt).getTime() > new Date().getTime()) {
      const cergen = new CertificateGenerator(discovery, parsed.login, password, parsed.device_id, parsed.encrypted_code);
      cergen.key1 = cergen.loadSerializedKey(parsed.pubKey1, parsed.privKey1);
      cergen.key2 = cergen.loadSerializedKey(parsed.pubKey2, parsed.privKey2);
      cergen.partialEmail = parsed.partialEmail;
      cergen.codeSentAt = new Date(parsed.codeSentAt);
      cergen.expiresAt = new Date(parsed.expiresAt);
      cergen.password = password;
      console.log('Loaded login state from file.');
      return cergen;
    }
    console.log('Login state expired. Requesting new code.');
    return new CertificateGenerator(discovery, parsed.cpf, password, parsed.device_id);

  }

  constructor(discovery: Discovery, login: string, password: string, device_id: string, encrypted_code?: string) {
    this.client = Axios.create({
      baseURL: 'https://prod-s0-webapp-proxy.nubank.com.br/api/',
      headers: {
        'Content-Type': 'application/json',
        'X-Correlation-Id': 'and-7-0-0',
        'User-Agent': 'nubank.js',
      },
    });

    this.login = login;
    this.password = password;
    this.device_id = device_id;
    this.encrypted_code = encrypted_code;
    this.key1 = this.generateKey();
    this.key2 = this.generateKey();
    this.discovery = discovery;
    this.url = this.discovery.getAppUrl('gen_certificate');
  }

  saveState() {
    const state = JSON.stringify({
      login: this.login,
      device_id: this.device_id,
      partialEmail: this.partialEmail,
      encrypted_code: this.encrypted_code,
      pubKey1: this.serializePublicKey(this.key1),
      pubKey2: this.serializePublicKey(this.key2),
      privKey1: this.serializePrivateKey(this.key1),
      privKey2: this.serializePrivateKey(this.key2),
      codeSentAt: this.codeSentAt,
      expiresAt: this.expiresAt
    });

    const pw = Buffer.from(this.password + this.password).toString('base64');
    fs.writeFileSync('.loginstate', CertificateGenerator.encryptString(state, pw));
  }

  static encryptString(str: string, key: string): string {
    const cipher = Forge.cipher.createCipher('AES-CBC', key);
    cipher.start({ iv: '00000000000000000000000000000000' });
    cipher.update(Forge.util.createBuffer(str));
    cipher.finish();
    return cipher.output.toHex();
  }

  static decryptString(encrypted: string, key: string): string {
    const cipher = Forge.cipher.createDecipher('AES-CBC', key);
    cipher.start({ iv: '00000000000000000000000000000000' });
    const str = Forge.util.hexToBytes(encrypted);
    cipher.update(Forge.util.createBuffer(str, 'raw'));
    cipher.finish();
    return cipher.output.toString();
  }

  async requestCode() {
    if (!this.encrypted_code) {
      try {
        console.log('Requesting code...');
        await this.client.post(this.url, this.getPayload());
      } catch (error) {
        const response: IncomingMessage = error.request.res;

        if (response.statusCode != 401 || !response.headers['www-authenticate']) {
          throw new Error('Authentication code request failed.');
        }

        const parsed = this.parseAuthenticateHeaders(response.headers['www-authenticate'] as string);
        this.codeSentAt = new Date();
        this.expiresAt = new Date(parsed['expires-at']);
        this.encrypted_code = parsed['device-authorization_encrypted-code'];
        this.partialEmail = parsed['sent-to'];
        this.saveState();
      }

    }

    return { email: this.partialEmail, expiresAt: this.expiresAt, codeSentAt: this.codeSentAt };
  }

  async exchangeCerts(code: string) {
    if (!this.encrypted_code) {
      throw new Error('No encrypted code found. Did you call `request_code` before exchanging certs ?');
    }

    const payload = this.getPayload();
    payload['code'] = code;
    payload['encrypted-code'] = this.encrypted_code;

    const response = await this.client.post(this.url, payload);

    if (response.status != 200) {
      throw new Error('The code was invalid. Please try again.');
    }

    const { data } = response;

    const cert1 = this.parseCert(data['certificate']);
    const cert2 = this.parseCert(data['certificate_crypto']);

    return {
      cert1: this.genCert(this.key1, cert1),
      cert2: this.genCert(this.key2, cert2)
    };
  }

  getPayload(): IPayload {
    return {
      login: this.login,
      password: this.password,
      public_key: this.serializePublicKey(this.key1),
      public_key_crypto: this.serializePublicKey(this.key2),
      model: `Nubank.JS (${this.device_id})`,
      device_id: this.device_id
    };
  }

  parseCert(content: pki.PEM): pki.Certificate {
    return Forge.pki.certificateFromPem(content);
  }

  genCert(key: pki.rsa.KeyPair, cert: pki.Certificate): asn1.Asn1 {
    return Forge.pkcs12.toPkcs12Asn1(key.privateKey, cert, '', { algorithm: '3des' });
  }

  generateKey(): pki.rsa.KeyPair {
    return Forge.pki.rsa.generateKeyPair({ bits: 2048, e: 0x10001 });
  }

  serializePublicKey(key: pki.rsa.KeyPair): string {
    const pkey = pki.publicKeyToPem(key.publicKey).split('\r\n').join('\n');
    return pkey;
  }

  serializePrivateKey(key: pki.rsa.KeyPair): string {
    return pki.privateKeyToPem(key.privateKey).split('\r\n').join('\n');
  }

  loadSerializedKey(pubKey: string, privKey: string): pki.rsa.KeyPair {
    const publicKey = pki.publicKeyFromPem(pubKey.split('\n').join('\r\n'));
    const privateKey = pki.privateKeyFromPem(privKey.split('\n').join('\r\n'));
    return { publicKey, privateKey };
  }

  parseAuthenticateHeaders(headers: string) {
    const chunks = headers.split(',');
    const parsed: { [key:string]: string } = {};
    for (const chunk of chunks) {
      let [key, value] = chunk.split('=');
      key = key.trim().split(' ').join('_');
      value = value.split('"').join('');
      parsed[key] = value;
    }

    return parsed;
  }
}