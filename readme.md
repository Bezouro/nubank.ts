# Nubank.JS
Realize operações que você faz no app do nubank pelo node.js Baseado na ([versão python](https://github.com/Astrocoders/nubank-api) que é baseada nessa outra [versão js](https://github.com/Astrocoders/nubank-api))

## Instalação
Instale por meio do npm:

`npm install nubank.js`

> AVISO: Este não é um modulo oficial de Nu Pagamentos S.A, Este modulo utiliza da [API Publica do Nubank](https://twitter.com/nubank/status/766665014161932288)

> AVISO²: Este projeto ainda está em desenvolvimento e podem ocorrer mudanças na estrutura do codigo

# Exemplo

```typescript
import NubankJS from 'nubank.js';
import path from 'path';
import fs from 'fs';

const USERNAME = process.env.NUBANK_USERNAME || '';
const PASSWORD = process.env.NUBANK_PASSWORD || '';

const cert = fs.readFileSync(path.join(__dirname, '..', 'cert.p12'));
const nubankjs = new NubankJS(USERNAME, PASSWORD, cert);

async function run(pixKey: string, value: number) {
  const { data } = await nubankjs.addPixContact(pixKey);

  const account = data.bankAccount;
  const transferOutRequest = await nubankjs.transferOutPix(account.id, value);
  
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
```

Output:
```js
{
  success: true,
  bank: null,
  bankName: 'NEON PAGAMENTOS',
  agency: '0000',
  account: '123456',
  digit: '7',
  destinatary: 'Bruno Bezouro',
  error: undefined
}
```