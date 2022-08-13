export default IPixAddedContact;

export interface IContact {
  id: string;
  name: string;
  isMe: boolean;
  personIdentifier: string;
  hasNubankAccount: boolean;
}

interface IPixAddedContact {
  bankAccount: IContactAccount;
  pixAlias: { 
    id: string;
  }
}

export interface IContactAccount {
  personIdentifier: string;
  cpf: null;
  singleBank: {
    ispb: string;
    shortName: string;
    number: unknown;
    isNubank: boolean;
    supportsPix: boolean;
    supportsTed: boolean;
    defaultTransferType: string; // PIX
    pixNotAvailableReason: unknown
  },
  number: string,
  name: string,
  id: string,
  accountType: string; // 'CHECKING',
  branch: string;
  digit: string;
}

export interface IContactAccountList {
  id: string;
  name: string;
  personIdentifier: string;
  isMe: boolean;
  bankAccounts: IBankAccount[];
}

interface IBankAccount {
  id: string;
  branch: string;
  number: string;
  checkDigit: string;
  createdAt: Date;
  accountType: string; // 'CHECKING'
  singleBank: {
    ispb: string;
    shortName: string;
    number: string;
    isNubank: boolean;
    supportsPix: boolean;
    supportsTed: boolean;
    defaultTransferType: string; // 'PIX'
    pixNotAvailableReason: string | null;
  }
}