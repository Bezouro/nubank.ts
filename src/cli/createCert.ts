import { createInterface } from 'readline';
import Forge, { asn1 } from 'node-forge';
import fs, { unlinkSync } from 'fs';
import Discovery from '../utils/discovery';
import Axios from 'axios';
import CertificateGenerator from '../utils/certificateGenerator';

const rl = createInterface({ input: process.stdin, output: process.stdout });
function prompt(question: string): Promise<string> {
  return new Promise(resolve => rl.question(question, resolve));
}

const client = Axios.create({
  baseURL: 'https://prod-s0-webapp-proxy.nubank.com.br/api/',
  headers: {
    'Content-Type': 'application/json',
    'X-Correlation-Id': 'and-7-0-0',
    'User-Agent': 'nubank.js',
  },
});

function generateRandomId() {
  return Math.random().toString(36).substring(2, 15);
}

function saveCert(cert: asn1.Asn1, name: string) {
  const path = `${process.cwd()}/${name}`;
  const cert_file = fs.createWriteStream(path);
  cert_file.write(Forge.asn1.toDer(cert).getBytes(), 'binary');
}

export default async function run() {
  try {
    console.log('Starting Nubank.JS certificate creation...');

    const discovery = new Discovery(client);
    await discovery.updateProxyUrls();
    const cpf = await prompt('CPF (only numbers): ');
    const password = await prompt('Password (same used in app): ');

    const certificateGenerator = (fs.existsSync('.loginstate')) ?
      CertificateGenerator.fromState(discovery, password)
      : new CertificateGenerator(discovery, cpf, password, generateRandomId());

    const { email, expiresAt, codeSentAt } = await certificateGenerator.requestCode();
    console.log(`Email sent to ${email} at ${codeSentAt}`);
    console.log(`Valid until ${expiresAt}`);

    const code = await prompt('Code: ');
    const { cert1 } = await certificateGenerator.exchangeCerts(code);
    saveCert(cert1, 'cert.p12');
    unlinkSync('.loginstate');
    console.log(`Logged successfully. Certificate saved to ${process.cwd()}/cert.p12`);
  } catch (e) {
    console.error(e.message);
  }
  rl.close();
}