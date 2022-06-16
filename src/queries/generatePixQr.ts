import INubankQueryObject from '../interfaces/INubankQuery';

export default function (amount: number, transactionId: string, message: string): INubankQueryObject {
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
      pixAlias: 'bruno@bezouro.com.br',
      savingsAccountId: '5ad78c63-9e90-4d93-a03c-65bbdca1bba0',
      message,
      transactionId
    }
  };

  return { data: { query, variables }, path: 'createPaymentRequest' };
}