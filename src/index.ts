import https from 'https';
import axios, { AxiosInstance } from 'axios';

import accountBalance from './queries/accountBalance';
import getAccountId from './queries/accountId';
import addPixContact from './queries/addPixContact';
import checkFeed from './queries/checkFeed';
import feedItems from './queries/feedItems';
import generatePixQr from './queries/generatePixQr';
import getContactAccounts from './queries/getContactAccounts';
import getContacts from './queries/getContacts';
import getPhoneRechargeDetails from './queries/getPhoneRechargeDetails';
import getTransferInDetails from './queries/getTransferInDetails';
import transferOut from './queries/transferOut';
import transferOutInit from './queries/transferOutInit';
import INubankQueryObject from './interfaces/INubankQuery';
import Discovery from './utils/discovery';

const BASE_HEADERS = {
  'Content-Type': 'application/json',
  'X-Correlation-Id': 'WEB-APP.pewW9',
  'User-Agent': 'nubank.js'
};

interface INubankJS {
  user: string;
  password: string;
  certificate: Buffer;
  client: AxiosInstance;
}

export default class NubankJS implements INubankJS {

  readonly NUBANK_TRANSFERAUTH_HOST = 'https://prod-s4-piv.nubank.com.br/';

  user: string;
  password: string;
  token: string;
  certificate: Buffer;
  client: AxiosInstance;
  discovery: Discovery;
  accountId: string;

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
    
    this.getAccountId().then(({data}) => {
      this.accountId = data.id;
    });
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

  async GraphQLRequest(query: INubankQueryObject, bearerToken?: string) {
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

    return { headers: request.headers, data: request.data };
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
    return await this.GraphQLRequest(accountBalance());
  }

  async getAccountId() {
    return await this.GraphQLRequest(getAccountId());
  }

  async addPixContact(pixKey: string) {
    return await this.GraphQLRequest(addPixContact(pixKey));
  }

  async checkFeed(limit: string) {
    return await this.GraphQLRequest(checkFeed(limit));
  }

  async feedItems(cursor?: string) {
    return await this.GraphQLRequest(feedItems(cursor));
  }

  async generatePixQr(amount: number, transactionId: string, message: string) {
    return await this.GraphQLRequest(generatePixQr(amount, transactionId, message));
  }

  async getContactAccounts(contactID: string) {
    return await this.GraphQLRequest(getContactAccounts(contactID));
  }

  async getContacts() {
    return await this.GraphQLRequest(getContacts());
  }

  async getPhoneRechargeDetails(phoneRechargeRequestId: string) {
    return await this.GraphQLRequest(getPhoneRechargeDetails(phoneRechargeRequestId));
  }

  async getTransferInDetails(id: string) {
    return await this.GraphQLRequest(getTransferInDetails(id));
  }

  async rawTransferOut(bankAccountId: string, amount: number, bearerToken: string) {
    return await this.GraphQLRequest(transferOut(bankAccountId, amount), bearerToken);
  }

  async transferOutInit(bankAccountId: string, amount: number) {
    try {
      await this.GraphQLRequest(transferOutInit(bankAccountId, amount));
    } catch (error) {
      return error.response;
    }
  }

  async transferOutPix(account: string, value: number) {
    let response = await this.transferOutInit(account, value);
    const proof = response.headers['www-authenticate'].substring(18, 458);

    if(!this.accountId) {
      const { data } = await this.getAccountId();
      this.accountId = data.id;
    }
  
    response = await this.NubankPostRequest(`${this.NUBANK_TRANSFERAUTH_HOST}api/customers/${this.accountId}/unencrypted-lift`, {
      acl: [],
      input: String(process.env.NUBANK_CARD_PASSWORD),
      proof
    });
  
    const bearerToken = response.data['access_token'];
    response = await this.rawTransferOut(account, value, bearerToken);
  
    return response.data;
  }
}