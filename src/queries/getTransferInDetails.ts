import INubankQueryObject from '../interfaces/INubankQuery';

export default function (id: string): INubankQueryObject {
  const query = `
    {
      viewer {
        savingsAccount {
          getGenericReceiptScreen(type: "TRANSFER_IN", id: "${id}") {
            screenType
            screenPieces {
              ... on ReceiptTablePiece {
                tableItems {
                  label
                  value
                }
              }
            }
          }
        }
      }
    }
      
  `;

  return { data: { query }, path: 'viewer.savingsAccount.getGenericReceiptScreen' };
}