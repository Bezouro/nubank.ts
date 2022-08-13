interface INubankQueryObject {
  data: INubankQuery;
  path: string;
}

interface INubankQuery {
  query: string;
  variables?: unknown;
}

export default INubankQueryObject;