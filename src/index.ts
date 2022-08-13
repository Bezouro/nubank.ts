import https from 'https';
import axios, { AxiosInstance } from 'axios';
import INubankQueryObject from './interfaces/INubankQuery';
import Discovery from './utils/discovery';
import { parseWwwAuthHeader } from './utils/utils';
import { 
  accountBalance,
  getAccountId,
  addPixContact,
  checkFeed,
  feedItems,
  generatePixQr,
  getContactAccounts,
  getContacts,
  getPhoneRechargeDetails,
  getPixAliases,
  getTransferInDetails,
  nubankSetup,
  transferOut,
  transferOutInit
} from './queries';
import IFeedItems from './interfaces/IFeedItems';
import ITransferInDetails from './interfaces/ITransferInDetails';
import IGraphQLResponse from './interfaces/IGraphQLRequest';
import { ITransferOutRequestSuccess } from './interfaces/ITransferOut';
import IPixAddedContact, { IContact, IContactAccountList } from './interfaces/IContacts';
import INuAccountID, { IPixAlias } from './interfaces/IAccount';
import IPaymentRequest from './interfaces/IPaymentRequest';

const BASE_HEADERS = {
  'Content-Type': 'application/json',
  'X-Correlation-Id': 'and-7-0-0',
  'User-Agent': 'nubank.ts'
};

interface INubankTS {
  user: string;
  password: string;
  certificate: Buffer;
  client: AxiosInstance;
}

interface IAccountOwner {
  name: string,
  id: string,
  savingsAccount: {
    id: string,
    dict: { 
      keys: [
        {
          id: string,
          value: string,
        }
      ] 
    }
  }
}

interface ITransferAuthProof {
  certificatePendingValidationUrl?: string,
  verifyPinProof?: string;
  location?: string;
}

export default class NubankTS implements INubankTS {

  readonly NUBANK_TRANSFERAUTH_HOST = 'https://prod-s4-piv.nubank.com.br/';

  user: string;
  password: string;
  token: string;
  certificate: Buffer;
  client: AxiosInstance;
  discovery: Discovery;
  me: IAccountOwner;

  constructor(user: string, password: string, certificate: Buffer) {
    this.user = user;
    this.password = password;
    this.certificate = certificate;
    this.client = axios.create({
      httpsAgent: new https.Agent({
        pfx: certificate,
        passphrase: ''
      })
    });

    this.discovery = new Discovery(this.client);
    this.loadMe();
  }

  async loadMe() {
    const { data } = await this.graphQLRequest<IAccountOwner>(nubankSetup());
    this.me = data;
  }

  async getBearerToken() {
    if (!this.token) {
      if(!this.discovery.proxyListAppUrl) await this.discovery.updateProxyUrls();
      const { data: { access_token } } = await this.client.request({
        method: 'POST',
        url: this.discovery.getAppUrl('token'),
        headers: BASE_HEADERS,
        data: {
          grant_type: 'password',
          client_id: 'legacy_client_id',
          client_secret: 'legacy_client_secret',
          login: this.user,
          password: this.password
        }
      });
      this.token = `Bearer ${access_token}`;
    }
    return this.token;
  }

  async graphQLRequest<T>(query: INubankQueryObject, bearerToken?: string): Promise<IGraphQLResponse<T>> {
    const Authorization = bearerToken ? `Bearer ${bearerToken}` : await this.getBearerToken();
    const { data, path } = query;

    const request = await this.client.request({
      method: 'POST',
      url: 'https://prod-s4-stormshield.nubank.com.br/api/query',
      headers: {
        ...BASE_HEADERS,
        accept: 'application/json',
        Authorization,
      },
      data
    });

    const pathArr = ['data', ...path.split('.')].reverse();
    while (pathArr.length > 0) {
      const key = pathArr.pop();
      request.data = request.data[key];
    }

    const keyName = request.data.__typename === 'RequestError' ? 'error' : 'data';

    return { headers: request.headers, [keyName]: request.data };
  }

  async NubankPostRequest(url: string, body: unknown) {
    const request = await this.client.request({
      method: 'POST',
      url,
      headers: {
        ...BASE_HEADERS,
        accept: 'application/json',
        Authorization: await this.getBearerToken(),
      },
      data: body
    });

    return request;
  }

  async accountBalance() {
    return await this.graphQLRequest<number>(accountBalance());
  }

  async getAccountId() {
    return await this.graphQLRequest<INuAccountID>(getAccountId());
  }

  async addPixContact(pixKey: string) {
    return await this.graphQLRequest<IPixAddedContact>(addPixContact(pixKey));
  }

  async checkFeed(limit: number) { // TODO: add return type
    return await this.graphQLRequest(checkFeed(limit));
  }

  async feedItems(cursor?: string) {
    return await this.graphQLRequest<IFeedItems>(feedItems(cursor));
  }

  async generatePixQr(amount: number, transactionId: string, message: string, pixAlias?: string) {
    if(!this.me) await this.loadMe();

    if (!this.me.savingsAccount.id) throw new Error('No savings account found');
    if (!this.me.savingsAccount.dict.keys.length) throw new Error('No PIX keys found');
    if (pixAlias && !this.me.savingsAccount.dict.keys.findIndex(key => key.value === pixAlias)) throw new Error('PIX key not found');

    const pixKey = pixAlias || this.me.savingsAccount.dict.keys[0].value;

    return await this.graphQLRequest<IPaymentRequest>(generatePixQr(amount, transactionId, message, pixKey, this.me.savingsAccount.id));
  }

  async getContactAccounts(contactID: string) {
    return await this.graphQLRequest<IContactAccountList>(getContactAccounts(contactID));
  }

  async getContacts() {
    return await this.graphQLRequest<IContact[]>(getContacts());
  }

  async getPhoneRechargeDetails(phoneRechargeRequestId: string) { // TODO: add return type
    return await this.graphQLRequest(getPhoneRechargeDetails(phoneRechargeRequestId));
  }

  async getPixAliases() {
    return await this.graphQLRequest<IPixAlias[]>(getPixAliases());
  }

  async getTransferInDetails(id: string) {
    return await this.graphQLRequest<ITransferInDetails>(getTransferInDetails(id));
  }

  async rawTransferOut(bankAccountId: string, amount: number, bearerToken: string) {
    return await this.graphQLRequest<ITransferOutRequestSuccess>(transferOut(bankAccountId, amount), bearerToken);
  }

  async transferOutInit(bankAccountId: string, amount: number) {
    try {
      await this.graphQLRequest(transferOutInit(bankAccountId, amount));
    } catch (error) {
      return parseWwwAuthHeader<ITransferAuthProof>(error.response.headers['www-authenticate']);
    }
  }

  async transferOutPix(account: string, value: number, cardPassword: string) {
    if(!this.me) await this.loadMe();
    const proof = await this.transferOutInit(account, value);

    if(!proof.verifyPinProof || !proof.location) throw new Error('Certificate pending validation');

    const response = await this.NubankPostRequest(proof.location, {
      acl: [],
      input: cardPassword,
      proof: proof.verifyPinProof
    });
  
    const bearerToken = response.data['access_token'];
    const transferOutResponse = await this.rawTransferOut(account, value, bearerToken);
  
    return transferOutResponse.data || transferOutResponse.error;
  }
}