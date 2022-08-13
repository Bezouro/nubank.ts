interface ITransferInDetails {
  screenType: string;
  screenPieces: IScreenPiece[];
}

export interface IScreenPiece {
  tableHeader?: string;
  tableItems?: ITableItem[];
}

export interface ITableItem {
  label: string;
  value: string;
}

export default ITransferInDetails;