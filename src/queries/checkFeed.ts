import INubankQueryObject from '../interfaces/INubankQuery';

export default function (limit: number): INubankQueryObject {
  const query = `
    {
      viewer {
        savingsAccount {
          feed(limit: ${limit}) {
            id
            __typename
            ... on TransferInEvent {
              amount
            }
          }
        }
      }
    }
  `;

  return { data: { query }, path: 'viewer.savingsAccount.feed' };
}