interface IFeedItems {
  pageInfo: {
    hasNextPage: boolean;
  };
  edges: IFeedItemsEdge[]
}

export interface IFeedItemsEdge {
  cursor: string;
  node: IFeedItemsEdgeNode;
}

export interface IFeedItemsEdgeNode {
  tags: string[];
  displayDate: string,
  footer: string | null;
  title: string;
  detailsDeeplink: string;
  id: string;
  kind: string;
  iconKey: string;
  postDate: string;
  detail: string;
}

export default IFeedItems;