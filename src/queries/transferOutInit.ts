import INubankQueryObject from '../interfaces/INubankQuery';

export default function (bankAccountId: string, amount: number): INubankQueryObject {
  const query = `
    mutation($input: TransferOutRequestInput!) {
      transferOutRequest(input: $input) {
        __typename
      }
    }
  `;
  const variables = {
    input: {
      bankAccountId,
      amount,
      transferType: 'PIX'
    }
  };

  return { data: { query, variables }, path: 'transferOutRequest' };
}