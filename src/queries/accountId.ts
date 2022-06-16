import INubankQueryObject from '../interfaces/INubankQuery';

export default function (): INubankQueryObject {
  const query = `
    query RequestMoney_Query {
      viewer {
        ...RequestMoney_viewer
        id
      }
    }
    
    fragment RequestMoney_viewer on Customer {
      savingsAccount {
        id
      }
    }
  `;

  return { data: { query }, path: 'viewer' };
}