import INubankQueryObject from '../interfaces/INubankQuery';

export default function (amount: number, transactionId: string, message: string, pixAlias: string, savingsAccountId: string): INubankQueryObject {
  const query = `
    mutation createPaymentRequest($createPaymentRequestInput: CreatePaymentRequestInput) {
      createPaymentRequest(input: $createPaymentRequestInput) {
        paymentRequest {
          id
          amount
          message
          url
          transactionId
          pixAlias
          brcode
        }
      }
    }
  `;
  const variables = {
    createPaymentRequestInput: {
      amount,
      pixAlias,
      savingsAccountId,
      message,
      transactionId
    }
  };

  return { data: { query, variables }, path: 'createPaymentRequest.paymentRequest' };
}