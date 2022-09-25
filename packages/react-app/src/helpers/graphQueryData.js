import { gql, ApolloClient, InMemoryCache } from "@apollo/client";
// export const subgraphURI = "http://localhost:8000/subgraphs/name/scaffold-eth/your-contract";
export const subgraphURI = "https://api.thegraph.com/subgraphs/name/blahkheart/members-hub";

export const apolloClient = new ApolloClient({
  uri: subgraphURI,
  cache: new InMemoryCache(),
});

export const tagQuery = `
  {
    tags {
      id
      name
      creator {
        address
      }
      memberships {
        id
        membershipAddress
        creator
      }
    }
  }
  `;

export const membershipQuery = `
  {
    memberships(first: 25, orderBy: createdAt, orderDirection: asc) {
      id
      membershipAddress
      relatedTags {
        id
        name
      }
      creator {
        address
      }
    }
  }
  `;

const tagCreatorQuery = `
  {
    tagCreators(first: 25, orderBy: createdAt, orderDirection: asc) {
      id
      address
      tagsCount 
    }
  }
  `;

const broadcasterQuery = `
  {
    broadcasters(first: 25, orderBy: createdAt, orderDirection: asc) {
      id
      address
      membershipCount
      memberships {
        membershipAddress
      } 
    }
  }
  `;

// Get challenge query
// const GET_CHALLENGE = `
//     query($request: ChallengeRequest!) {
//         challenge(request: $request) { text }
//     }
// `;

// // Generate challenge function
// export const generateChallenge = async address => {
//   const res = await apolloClient.query({
//     query: gql(GET_CHALLENGE),
//     variables: {
//       request: {
//         address,
//       },
//     },
//   });
//   return res.data.challenge.text;
// };
export const tagsQuery = gql`
  {
    tags {
      id
      name
      creator {
        address
      }
      memberships {
        id
        membershipAddress
        creator
      }
    }
  }
`;

const varQuery = `
query($first: Int, $orderBy: BigInt, $orderDirection: String) {
    memberships(where: {relatedTags_contains: ["NFT"]}, orderBy: createdAt, orderDirection: desc) {
      id
      createdAt
      creator {
        address
      }
    }
  }`;

export const testVarQuery = gql`
  query ($where: String) {
    memberships(where: { relatedTags_contains: [$where] }) {
      id
      membershipAddress
      relatedTags {
        id
        name
      }
      creator {
        address
      }
    }
  }
`;

// memberships(
// skip: Int = 0
// first: Int = 100
// orderBy: Membership_orderBy
// orderDirection: OrderDirection
// where: Membership_filter
// block: Block_height
// subgraphError: _SubgraphErrorPolicy_! = deny
// ): [Membership!]!

// const testVarQueryx = gql`
//   query ($where: String) {
//    {
//     memberships(where: { relatedTags_contains: [$where] }) {
//       id
//       membershipAddress
//       relatedTags {
//         id
//         name
//       }
//       creator {
//         address
//       }
//     }
//   }
// `;
