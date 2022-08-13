export default IPaymentRequest;

interface IPaymentRequest {
  id: string;
  amount: number;
  message: string;
  url: string;
  transactionId: string;
  pixAlias: string;
  brcode: string;
}