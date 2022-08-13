import { AxiosResponseHeaders } from 'axios';

export default IGraphQLResponse;

interface IGraphQLResponse<T> {
  headers: AxiosResponseHeaders,
  data?: T;
  error?: IRequestError;
}

export interface IRequestError {
  __typename: string, // 'RequestError'
  errorReason: 'TRANSFER_OUT_FAILED',
  errorHandler: IShowBottomSheet | IRedirect | IShowToast;
}

interface IShowToast {
  text: string;
}

interface IRedirect {
  href: unknown;
  popParent: unknown;
}

interface IShowBottomSheet {
  __typename: string,
  title: string,
  description: string,
  buttonLabel: string,
  retriable: boolean | null,
  popParentOnDismiss: unknown,
  closeFlow: boolean
}