export default INubankQueryObject;

interface INubankQueryObject {
  data: INubankQuery;
  path: string;
}

interface INubankQuery {
  query: string;
  variables?: unknown;
}