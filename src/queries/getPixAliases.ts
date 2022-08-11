import INubankQueryObject from '../interfaces/INubankQuery';

export default function (): INubankQueryObject {
  const query = `
    {
      viewer {
        savingsAccount {
          dict {
            keys(onlyActive: true) {
              id
              kind
              value
              formattedValue
              itemDeepLink
              badge
            }
          }
        }
      }
    }
  `;

  return { data: { query }, path: 'viewer.savingsAccount.dict.keys' };
}