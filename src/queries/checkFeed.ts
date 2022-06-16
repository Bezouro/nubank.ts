import INubankQueryObject from '../interfaces/INubankQuery';

export default function (limit: string): INubankQueryObject {
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