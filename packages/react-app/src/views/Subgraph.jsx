import { gql, useQuery } from "@apollo/client";
import { Button, Input, Table, Typography } from "antd";
import "antd/dist/antd.css";
import GraphiQL from "graphiql";
import "graphiql/graphiql.min.css";
import fetch from "isomorphic-fetch";
import React, { useState, useEffect } from "react";
import { Address } from "../components";
import { subgraphURI } from "../helpers/graphQueryData";

const highlight = {
  marginLeft: 4,
  marginRight: 8,
  /* backgroundColor: "#f9f9f9", */ padding: 4,
  borderRadius: 4,
  fontWeight: "bolder",
};

// Subgraph endpoints:
// Queries (HTTP):     "https://api.thegraph.com/subgraphs/name/blahkheart/members-hub-polygon"
// Subscriptions (WS): http://localhost:8001/subgraphs/name/scaffold-eth/your-contract

function Subgraph(props) {
  function graphQLFetcher(graphQLParams) {
    // return fetch(props.subgraphUri, {
    return fetch(subgraphURI, {
      method: "post",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(graphQLParams),
    }).then(response => response.json());
  }

  const EXAMPLE_GRAPHQL = `
  {
    tags(first: 25, orderBy: createdAt, orderDirection: desc) {
      id
      createdAt
      creator {
        address
      }
    }
    tagCreators {
      id
      address
    }
  }
  `;
  const EXAMPLE_GQL = gql(EXAMPLE_GRAPHQL);
  const { loading, data } = useQuery(EXAMPLE_GQL, { pollInterval: 2500 });

  useEffect(() => {
    const test = async () => {
      console.log("test test test", data);
    };
    test();
  }, [data]);
  const purposeColumns = [
    {
      // title: "Purpose",
      // dataIndex: "purpose",
      // key: "purpose",
      title: "Tag",
      dataIndex: "id",
      key: "id",
    },
    {
      title: "Creator",
      key: "id",
      // render: record => <Address value={record.sender.id} ensProvider={props.mainnetProvider} fontSize={16} />,
      render: record => <Address value={record.creator.address} ensProvider={props.mainnetProvider} fontSize={16} />,
    },
    {
      title: "createdAt",
      key: "createdAt",
      dataIndex: "createdAt",
      render: d => new Date(d * 1000).toISOString(),
    },
  ];

  const [newPurpose, setNewPurpose] = useState("loading...");

  const deployWarning = (
    <div style={{ marginTop: 8, padding: 8 }}>Warning: 🤔 Have you deployed your subgraph yet?</div>
  );

  return (
    <>
      <div style={{ margin: "auto", marginTop: 32 }}>
        You will find that parsing/tracking events with the{" "}
        <span className="highlight" style={highlight}>
          useEventListener
        </span>{" "}
        hook becomes a chore for every new project.
      </div>
      <div style={{ margin: "auto", marginTop: 32 }}>
        Instead, you can use{" "}
        <a href="https://thegraph.com/docs/about/introduction" target="_blank" rel="noopener noreferrer">
          The Graph
        </a>{" "}
        with 🏗 scaffold-eth (
        <a href="https://youtu.be/T5ylzOTkn-Q" target="_blank" rel="noopener noreferrer">
          learn more
        </a>
        ):
      </div>

      <div style={{ margin: 32 }}>
        <span style={{ marginRight: 8 }}>⛓️</span>
        Make sure your local chain is running first:
        <span className="highlight" style={highlight}>
          yarn chain
        </span>
      </div>

      <div style={{ margin: 32 }}>
        <span style={{ marginRight: 8 }}>🚮</span>
        Clean up previous data, if there is any:
        <span className="highlight" style={highlight}>
          yarn clean-graph-node
        </span>
      </div>

      <div style={{ margin: 32 }}>
        <span style={{ marginRight: 8 }}>📡</span>
        Spin up a local graph node by running
        <span className="highlight" style={highlight}>
          yarn run-graph-node
        </span>
        <span style={{ marginLeft: 4 }}>
          {" "}
          (requires{" "}
          <a href="https://www.docker.com/products/docker-desktop" target="_blank" rel="noopener noreferrer">
            {" "}
            Docker
          </a>
          ){" "}
        </span>
      </div>

      <div style={{ margin: 32 }}>
        <span style={{ marginRight: 8 }}>📝</span>
        Create your <b>local subgraph</b> by running
        <span className="highlight" style={highlight}>
          yarn graph-create-local
        </span>
        (only required once!)
      </div>

      <div style={{ margin: 32 }}>
        <span style={{ marginRight: 8 }}>🚢</span>
        Deploy your <b>local subgraph</b> by running
        <span className="highlight" style={highlight}>
          yarn graph-ship-local
        </span>
      </div>

      <div style={{ margin: 32 }}>
        <span style={{ marginRight: 8 }}>🖍️</span>
        Edit your <b>local subgraph</b> in
        <span className="highlight" style={highlight}>
          packages/subgraph/src
        </span>
        (learn more about subgraph definition{" "}
        <a
          href="https://thegraph.com/docs/en/developer/define-subgraph-hosted/"
          target="_blank"
          rel="noopener noreferrer"
        >
          here
        </a>
        )
      </div>

      <div style={{ margin: 32 }}>
        <span style={{ marginRight: 8 }}>🤩</span>
        Deploy your <b>contracts and your subgraph</b> in one go by running
        <span className="highlight" style={highlight}>
          yarn deploy-and-graph
        </span>
      </div>

      <div style={{ width: 780, margin: "auto", paddingBottom: 64 }}>
        <div style={{ margin: 32, textAlign: "right" }}>
          <Input
            onChange={e => {
              setNewPurpose(e.target.value);
            }}
          />
          <Button
            onClick={() => {
              console.log("newPurpose", newPurpose);
              /* look how you call setPurpose on your contract: */
              // props.tx(props.writeContracts.YourContract.setPurpose(newPurpose));
              props.tx(props.writeContracts.MembersHub.addTag(newPurpose));
            }}
          >
            {/* Set Purpose */}
            Add Tag
          </Button>
        </div>

        {data ? (
          <Table dataSource={data.tags} columns={purposeColumns} rowKey="id" />
        ) : (
          // <Table dataSource={data.purposes} columns={purposeColumns} rowKey="id" />
          <Typography>{loading ? "Loading..." : deployWarning}</Typography>
        )}

        <div style={{ margin: 32, height: 400, border: "1px solid #888888", textAlign: "left" }}>
          <GraphiQL fetcher={graphQLFetcher} docExplorerOpen query={EXAMPLE_GRAPHQL} />
        </div>
      </div>

      <div style={{ padding: 64 }}>...</div>
    </>
  );
}

export default Subgraph;
