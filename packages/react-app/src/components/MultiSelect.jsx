import { Select, Spin } from "antd";
import debounce from "lodash/debounce";
import React, { useMemo, useRef, useState } from "react";
import { gql, ApolloClient, InMemoryCache } from "@apollo/client";
import { tagQuery, subgraphURI, apolloClient } from "../helpers/graphQueryData";

// import fetch from "isomorphic-fetch";

function DebounceSelect({ fetchOptions, debounceTimeout = 1000, ...props }) {
  const [fetching, setFetching] = useState(false);
  const [options, setOptions] = useState([]);
  const fetchRef = useRef(0);
  const debounceFetcher = useMemo(() => {
    const loadOptions = value => {
      fetchRef.current += 1;
      const fetchId = fetchRef.current;
      setOptions([]);
      setFetching(true);
      fetchOptions(value).then(newOptions => {
        if (fetchId !== fetchRef.current) {
          // for fetch callback order
          return;
        }
        setOptions(newOptions);
        setFetching(false);
      });
    };

    return debounce(loadOptions, debounceTimeout);
  }, [fetchOptions, debounceTimeout]);
  return (
    <Select
      labelInValue
      filterOption={true}
      onSearch={debounceFetcher}
      notFoundContent={fetching ? <Spin size="small" /> : null}
      {...props}
      options={options}
      // filterOption={true}
    />
  );
} // Usage of DebounceSelect

const client = new ApolloClient({
  uri: subgraphURI,
  cache: new InMemoryCache(),
});

(async function () {
  const { data } = await apolloClient.query({
    query: gql(tagQuery),
  });
  console.log("TAAA", data);
})();

async function fetchTagList(tagName) {
  console.log("fetching tag", tagName);
  const { data } = await client.query({
    query: gql(tagQuery),
  });
  return data.tags.map(item => ({
    label: item.id,
    value: item.name,
  }));
}

// const MultiSelect = ({placeholder, xfetchOptions, onChange}) => {
const MultiSelect = props => {
  const [value, setValue] = useState([]);
  return (
    <DebounceSelect
      mode="multiple"
      allowClear
      value={value}
      placeholder="Search Memberships"
      fetchOptions={fetchTagList}
      onChange={newValue => {
        setValue(newValue);
        props.onChange(newValue);
      }}
      // value={value}
      // placeholder={placeholder}
      // fetchOptions={xfetchOptions}
      // onChange={onChange}
      style={{
        width: 450,
      }}
    />
  );
};

export default MultiSelect;
