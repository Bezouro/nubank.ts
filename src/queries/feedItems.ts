import INubankQueryObject from '../interfaces/INubankQuery';

export default function (feedCursor?: string): INubankQueryObject {
  const cursor = feedCursor ? feedCursor : null;
  const query = `
    {
      viewer {
        savingsAccount {
          feedItems(cursor: ${cursor}) {
            pageInfo {
              hasNextPage
            }
            edges {
              cursor
              node {
                id
                title
                detail
                postDate
                displayDate
                footer
                iconKey
                detailsDeeplink
                tags
                kind
              }
            }
          }
        }
      }
    }
  `;

  return { data: { query }, path: 'viewer.savingsAccount.feedItems' };
}