import NubankTS from '../src';
import path from 'path';
import fs from 'fs';

const USERNAME = process.env.NUBANK_USERNAME || '';
const PASSWORD = process.env.NUBANK_PASSWORD || '';

const cert = fs.readFileSync(path.join(__dirname, '..', 'cert.p12'));
const nubank = new NubankTS(USERNAME, PASSWORD, cert);

async function run() {
  const { data } = await nubank.accountBalance();
  console.log(`Saldo atual: ${data.netAmount}`);
}

run();