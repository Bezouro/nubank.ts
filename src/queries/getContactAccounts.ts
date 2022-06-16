import INubankQueryObject from '../interfaces/INubankQuery';

export default function (contactID: string): INubankQueryObject {
  const query = `
    query contactBankAccounts {
      viewer {
        savingsAccount {
          contact(id: "${contactID}") {
            id
            name
            personIdentifier
            isMe
            bankAccounts {
              id
              branch
              number
              checkDigit
              createdAt
              accountType
              singleBank {
                ispb
                shortName
                number
                isNubank
                supportsPix
                supportsTed
                defaultTransferType
                pixNotAvailableReason
              }
            }
          }
        }
      }
    }
  `;

  return { data: { query }, path: 'viewer.savingsAccount.contact' };
}