import { AxiosInstance } from 'axios';

interface IUrlList {
  [key: string]: string;
}

export default class Discovery {
  client: AxiosInstance;
  proxyListUrl: IUrlList;
  proxyListAppUrl: IUrlList;

  DISCOVERY_URL = 'https://prod-s0-webapp-proxy.nubank.com.br/api/discovery';
  DISCOVERY_APP_URL = 'https://prod-s0-webapp-proxy.nubank.com.br/api/app/discovery';

  constructor(client: AxiosInstance) {
    this.client = client;
    this.updateProxyUrls();
  }

  getUrl(name: string, target?: IUrlList): string {
    const urlList = (target || this.proxyListUrl);
    const url: string = urlList[name];

    if (!url) {
      throw new Error(`There is no URL discovered for ${name}`);
    }

    return url;
  }

  getAppUrl(name: string): string {
    return this.getUrl(name, this.proxyListAppUrl);
  }

  async updateProxyUrls() {
    this.proxyListUrl = (await this.client.get(this.DISCOVERY_URL)).data;
    this.proxyListAppUrl = (await this.client.get(this.DISCOVERY_APP_URL)).data;
  }

}