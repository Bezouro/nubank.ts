export default INuAccountID;

interface INuAccountID {
  id: string,
  savingsAccount: {
    id: string,
  }
}

export interface IPixAlias {
  id: string;
  kind: string; // 'EMAIL'
  value: string;
  formattedValue: string;
  itemDeepLink: string;
  badge: unknown
}