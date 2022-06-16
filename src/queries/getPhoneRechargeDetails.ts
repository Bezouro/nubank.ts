import INubankQueryObject from '../interfaces/INubankQuery';

export default function (phoneRechargeRequestId: string): INubankQueryObject {
  const query = `
    query getPhoneRechargeStatus($phoneRechargeRequestId: ID!) {
      viewer {
        phoneRechargeStatus(phoneRechargeRequestId: $phoneRechargeRequestId) {
          id
          createdAt
          customerId
          offerId
          phoneNumber
          paymentMethod
          amount
          success {
            succeededAt
            nsu
          }
          failure {
            failedAt
            reason
            nsu
          }
          moneyRetrieved {
            retrievedAt
            amount
          }
          moneyNotRetrieved {
            retrievedAt
            amount
            reason
          }
          moneyReturned {
            id
            returnedAt
            amount
          }
          offer {
            carrierDisplayName
          }
        }
        featureFlags {
          splitTransaction
        }
      }
    }
  `;

  const variables = {
    phoneRechargeRequestId
  };

  return { data: { query, variables }, path: 'viewer.phoneRechargeStatus' };
}