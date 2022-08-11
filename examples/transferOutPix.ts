import NubankTS from '../src';
import path from 'path';
import fs from 'fs';

const USERNAME = process.env.NUBANK_USERNAME || '';
const PASSWORD = process.env.NUBANK_PASSWORD || '';
const CARD_PASSWORD = process.env.NUBANK_CARD_PASSWORD || '';

const cert = fs.readFileSync(path.join(__dirname, '..', 'cert.p12'));
const nubank = new NubankTS(USERNAME, PASSWORD, cert);

async function run(pixKey: string, value: number) {
  const { data } = await nubank.addPixContact(pixKey);

  const account = data.bankAccount;
  const transferOutRequest = await nubank.transferOutPix(account.id, value, CARD_PASSWORD);
  
  const success = transferOutRequest.__typename === 'TransferOutRequestSuccess';
  let error;

  if (!success) {
    console.log(transferOutRequest);
    error = transferOutRequest.errorHandler.description;
  }

  const result = {
    success,
    bank: account.singleBank.number,
    bankName: account.singleBank.shortName,
    agency: account.branch,
    account: account.number,
    digit: account.digit,
    destinatary: account.name,
    error
  };

  console.log(result);
}

run('11999999999', 0.01);