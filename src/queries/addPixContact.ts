import INubankQueryObject from '../interfaces/INubankQuery';

export default function (pixKey: string): INubankQueryObject {
  const query = `
    mutation createExternalBankAccountForTransferOut($input: ExternalBankAccountInput!) {
        createExternalBankAccountForTransferOut(input: $input) {
            bankAccount {
                id
                number
                digit
                branch
                cpf
                personIdentifier
                name
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
            pixAlias {
                id
            }
        }
    }
`;
  const variables = {
    input: {
      dictInput: {
        dictKey: pixKey,
      },
    },
  };

  return { data: { query, variables }, path: 'createExternalBankAccountForTransferOut' };
}
