import { Select } from "antd";
import React, { useEffect } from "react";
import { gql, ApolloClient, InMemoryCache, useQuery } from "@apollo/client";
import fetch from "isomorphic-fetch";
const { Option } = Select;
const children = [];

let subgraphURI = "https://api.thegraph.com/subgraphs/name/blahkheart/members-hub-polygon";
// function graphQLFetcher(graphQLParams) {
//   // return fetch(props.subgraphUri, {
//   return fetch(subgraphURI, {
//     method: "post",
//     headers: { "Content-Type": "application/json" },
//     body: JSON.stringify(graphQLParams),
//   }).then(response => response.json());
// }
const client = new ApolloClient({
  uri: subgraphURI,
  cache: new InMemoryCache(),
});
const EXAMPLE_GRAPHQL = `
  {
    tags(first: 25, orderBy: createdAt, orderDirection: asc) {
      id
      name
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
// client
//   .query({
//     query: gql(EXAMPLE_GRAPHQL),
//   })
//   // .then(data => data.tags.map(item => children.push(<Option key={item.id}>item.name</Option>)))
//   .then(data => data.tags.map(item => console.log("fffffffff",item)))
//   .catch(err => {
//     console.log("Error fetching data: ", err);
//   });
// for (let i = 10; i < 36; i++) {
//   children.push(<Option key={i.toString(36) + i}>{i.toString(36) + i}</Option>);
// }
const getTags = async () => {
  const { data } = await client.query({
    query: gql(EXAMPLE_GRAPHQL),
  });
  return data.tags.map(item => children.push(<Option key={item.id}>{item.id}</Option>));
};
getTags();

const handleChange = value => {
  console.log(`selected ${value}`);
};

const SearchInput = ({ size, placeholder, width }) => {
  // const EXAMPLE_GQL = gql(EXAMPLE_GRAPHQL);
  // const { loading, data } = useQuery(EXAMPLE_GQL, { pollInterval: 2500 });

  // useEffect(() => {
  // getTags();
  // console.log("datataa", data);
  // }, [data]);

  return (
    <div>
      <Select
        mode="multiple"
        allowClear
        size={size}
        style={{
          width: width,
        }}
        placeholder={placeholder}
        onChange={handleChange}
      >
        {children}
      </Select>
    </div>
  );
};

export default SearchInput;
