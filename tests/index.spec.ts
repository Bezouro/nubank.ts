import Axios from 'axios';
import NubankTS from '../src/index';
import INubankQueryObject from '../src/interfaces/INubankQuery';

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
  transferOut,
  transferOutInit
} from '../src/queries';

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

const MOCKED_MICROSERVICE_URL = 'https://prod-s0-microservice.nubank.com.br/api/route';

function mockGraphQLResponse(query: INubankQueryObject, data: unknown) {
  let mockedResponse = data;
  const path = ['data', 'data', ...query.path.split('.')];
  while (path.length > 0) {
    const key = path.pop();
    if(!key) break;
    mockedResponse = { [key]: mockedResponse };
  }

  return mockedResponse;
}

function getGQLDefaultRequestParams(query: INubankQueryObject){
  return {
    'data': query.data,
    'headers': {
      'Authorization':
      'Bearer fake-token',
      'Content-Type': 'application/json',
      'User-Agent': 'nubank.ts',
      'X-Correlation-Id': 'and-7-0-0',
      'accept': 'application/json'
    },
    'method': 'POST',
    'url': MOCKED_MICROSERVICE_URL
  };
}

const MOCKED_NU_USER = '12345678901';
const MOCKED_NU_PASSWORD = '12345678';
const MOCKED_NU_CERTIFICATE = Buffer.from('', 'base64');
const MOCKED_ACCOUNT_OWNER = {
  name: 'John Doe',
  id: 'personId',
  savingsAccount: {
    id: 'accountId',
    dict: {
      keys: [
        {
          id: 'keyId',
          value: 'keyValue',
        }
      ]
    }
  }
};

jest.mock('axios', () => ({
  create: jest.fn(),
  get: jest.fn(),
  post: jest.fn(),
  request: jest.fn().mockResolvedValue({ data: {} }),
}));

jest.mock('../src/utils/discovery',  () => {
  return jest.fn().mockImplementation(() => ({
    updateProxyUrls: jest.fn(),
    getAppUrl: jest.fn().mockReturnValue('localhost'),
  }));
});

describe('Nubank.TS', () => {
  let axios: { [key: string]: jest.SpyInstance };
  let nubank: NubankTS;

  beforeEach(() => {
    axios = {
      create: Axios.create as unknown as jest.SpyInstance,
      get: Axios.get as unknown as jest.SpyInstance,
      post: Axios.post as unknown as jest.SpyInstance,
      request: Axios.request as unknown as jest.SpyInstance,
    };
    axios.create.mockReturnThis();
    axios.request.mockResolvedValueOnce( { data: { access_token: 'fake-token', _links: { savings_account: { href: MOCKED_MICROSERVICE_URL } } } });
    axios.request.mockResolvedValueOnce( { data: { data:{ viewer: MOCKED_ACCOUNT_OWNER } } });
    nubank = new NubankTS(MOCKED_NU_USER, MOCKED_NU_PASSWORD, MOCKED_NU_CERTIFICATE);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('constructor', () => {
    expect(nubank).toBeInstanceOf(NubankTS);
  });

  describe('accountBalance', () => {
    it('execute query', async () => {
      const query = accountBalance();

      axios.request.mockResolvedValueOnce( mockGraphQLResponse(query, { batatinhaFrita: 123 }) );
      await nubank.accountBalance();

      expect(axios.request).toHaveBeenLastCalledWith(getGQLDefaultRequestParams(query));
    });
  });

  describe('getAccountId', () => {
    it('execute query', async () => {
      const query = getAccountId();

      axios.request.mockResolvedValueOnce( mockGraphQLResponse(query, { batatinhaFrita: 123 }) );
      await nubank.getAccountId();

      expect(axios.request).toHaveBeenLastCalledWith(getGQLDefaultRequestParams(query));
    });
  });

  describe('addPixContact', () => {
    it('execute query', async () => {
      const query = addPixContact('12345678901');

      axios.request.mockResolvedValueOnce( mockGraphQLResponse(query, { batatinhaFrita: 123 }) );
      await nubank.addPixContact('12345678901');

      expect(axios.request).toHaveBeenLastCalledWith(getGQLDefaultRequestParams(query));
    });
  });

  describe('checkFeed', () => {
    it('execute query', async () => {
      const query = checkFeed(1);

      axios.request.mockResolvedValueOnce( mockGraphQLResponse(query, { batatinhaFrita: 123 }) );
      await nubank.checkFeed(1);

      expect(axios.request).toHaveBeenLastCalledWith(getGQLDefaultRequestParams(query));
    });
  });

  describe('feedItems', () => {
    it('execute query', async () => {
      const query = feedItems();

      axios.request.mockResolvedValueOnce( mockGraphQLResponse(query, { batatinhaFrita: 123 }) );
      await nubank.feedItems();

      expect(axios.request).toHaveBeenLastCalledWith(getGQLDefaultRequestParams(query));
    });
    
    it('check feed items with cursor', async () => {
      const query = feedItems('cursor');

      axios.request.mockResolvedValueOnce( mockGraphQLResponse(query, { batatinhaFrita: 123 }) );
      await nubank.feedItems('cursor');

      expect(axios.request).toHaveBeenLastCalledWith(getGQLDefaultRequestParams(query));
    });
  });

  describe('generatePixQr', () => {
    it('execute query', async () => {
      const amount = 1;
      const transactionId = 'transactionId';
      const message = 'message';
      const pixAlias = 'pixAlias';
      const query = generatePixQr(amount, transactionId, message, pixAlias, MOCKED_ACCOUNT_OWNER.savingsAccount.id);
      
      axios.request.mockResolvedValueOnce( mockGraphQLResponse(query, { batatinhaFrita: 123 }) );
      await nubank.generatePixQr(amount, transactionId, message, pixAlias);

      expect(axios.request).toHaveBeenLastCalledWith(getGQLDefaultRequestParams(query));
    });
  });

  describe('getContactAccounts', () => {
    it('execute query', async () => {
      const query = getContactAccounts('pixContact');

      axios.request.mockResolvedValueOnce( mockGraphQLResponse(query, { batatinhaFrita: 123 }) );
      await nubank.getContactAccounts('pixContact');

      expect(axios.request).toHaveBeenLastCalledWith(getGQLDefaultRequestParams(query));
    });
  });

  describe('getContacts', () => {
    it('execute query', async () => {
      const query = getContacts();
      
      axios.request.mockResolvedValueOnce( mockGraphQLResponse(query, { batatinhaFrita: 123 }) );
      await nubank.getContacts();
      
      expect(axios.request).toHaveBeenLastCalledWith(getGQLDefaultRequestParams(query));
    });
  });

  describe('getPhoneRechargeDetails', () => {
    it('execute query', async () => {
      const query = getPhoneRechargeDetails('phoneNumber');
      
      axios.request.mockResolvedValueOnce( mockGraphQLResponse(query, { batatinhaFrita: 123 }) );
      await nubank.getPhoneRechargeDetails('phoneNumber');
      
      expect(axios.request).toHaveBeenLastCalledWith(getGQLDefaultRequestParams(query));
    });
  });

  describe('getPixAliases', () => {
    it('execute query', async () => {
      const query = getPixAliases();
      
      axios.request.mockResolvedValueOnce( mockGraphQLResponse(query, { batatinhaFrita: 123 }) );
      await nubank.getPixAliases();
      
      expect(axios.request).toHaveBeenLastCalledWith(getGQLDefaultRequestParams(query));
    });
  });

  describe('getTransferInDetails', () => {
    it('execute query', async () => {
      const query = getTransferInDetails('transferId');
      
      axios.request.mockResolvedValueOnce( mockGraphQLResponse(query, { batatinhaFrita: 123 }) );
      await nubank.getTransferInDetails('transferId');
      
      expect(axios.request).toHaveBeenLastCalledWith(getGQLDefaultRequestParams(query));
    });
  });

  describe('transferOutInit', () => {
    it('execute query', async () => {
      const response = { headers: { 'www-authenticate': 'verify-pin proof="something", location="http://not-a-real-server.com/api"' } };
      const query = transferOutInit('11999999999', 1);
      
      axios.request.mockRejectedValueOnce({ response });
      const transferInitResponse = await nubank.transferOutInit('11999999999', 1);
      
      expect(axios.request).toHaveBeenLastCalledWith(getGQLDefaultRequestParams(query));
      expect(transferInitResponse).toEqual({
        location: 'http://not-a-real-server.com/api',
        verifyPinProof: 'something',
      });
    });
  });

  describe('transferOutPix', () => {
    it('execute query', async () => {
      const query = transferOut('11999999999', 1);
      
      axios.request.mockRejectedValueOnce({ response: { headers: { 'www-authenticate': 'verify-pin proof="something", location="http://not-a-real-server.com/api"' } } });
      axios.request.mockResolvedValueOnce( { data: { access_token: 'fake-token' } } );
      axios.request.mockResolvedValueOnce( mockGraphQLResponse(query, { batatinhaFrita: 123 }) );
      await nubank.transferOutPix('11999999999', 1, 'not-a-real-password');
      
      expect(axios.request).toHaveBeenLastCalledWith(getGQLDefaultRequestParams(query));
    });

    it('nubank.ts doesnt have details of current user account, so it will call loadMe', async () => {
      const query = transferOut('11999999999', 1);
      
      axios.request.mockRejectedValueOnce({ response: { headers: { 'www-authenticate': 'verify-pin proof="something", location="http://not-a-real-server.com/api"' } } });
      axios.request.mockResolvedValueOnce( { data: { access_token: 'fake-token' } } );
      axios.request.mockResolvedValueOnce( mockGraphQLResponse(query, { batatinhaFrita: 123 }) );
      nubank.me = undefined as unknown as IAccountOwner;
      nubank.loadMe = jest.fn();
      await nubank.transferOutPix('11999999999', 1, 'not-a-real-password');
      
      expect(nubank.loadMe).toHaveBeenCalled();
    });

    it('untrusted certificate should fail', async () => {
      axios.request.mockRejectedValueOnce({ response: { headers: { 'www-authenticate': 'certificate-pending-validation url="http://not-a-real-server.com/api"' } } });
      const result = nubank.transferOutPix('11999999999', 1, 'not-a-real-password');
      
      await expect(result).rejects.toThrow('Certificate pending validation');
    });
  });

});