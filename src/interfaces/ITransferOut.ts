export interface ITransferOutRequestSuccess {
  __typename: string; // 'TransferOutRequestSuccess'
  id: string;         // '5e8f8f8f-8f8f-8f8f-8f8f-8f8f8f8f8f8f'
  transferType: string; // PIX
  nudge: {
    deeplink: string;
  }
}