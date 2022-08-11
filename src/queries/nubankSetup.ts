import INubankQueryObject from '../interfaces/INubankQuery';

export default function (): INubankQueryObject {
  const query = `
    {
      viewer {
        name
        id
        savingsAccount {
          id
          dict {
            keys(onlyActive: true) {
              id
              value
            }
          }
        }
      }
    }
  `;

  return { data: { query }, path: 'viewer' };
}