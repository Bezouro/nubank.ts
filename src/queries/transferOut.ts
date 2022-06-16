import INubankQueryObject from '../interfaces/INubankQuery';

export default function (bankAccountId: string, amount: number): INubankQueryObject {
  const query = `
    mutation($input: TransferOutRequestInput!) {
      transferOutRequest(input: $input) {
        __typename
        ... on TransferOutRequestSuccess {
          id
          transferType
          nudge {
            deeplink
          }
        }
        ... on RequestError {
          ...requestError
        }
      }
    }
    
    fragment requestError on RequestError {
      errorReason
      errorHandler {
        __typename
        ... on ShowToast {
          text
        }
        ... on Redirect {
          href
          popParent
        }
        ... on ShowBottomSheet {
          title
          description
          buttonLabel
          retriable
          popParentOnDismiss
          closeFlow
        }
      }
    }
  `;
  const variables = {
    input: {
      bankAccountId,
      amount,
      transferType: 'PIX'
    }
  };

  return { data: { query, variables }, path: 'transferOutRequest' };
}