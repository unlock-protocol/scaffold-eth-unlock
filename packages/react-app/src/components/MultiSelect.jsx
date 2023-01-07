import React, { useState } from "react";
import { Select, Spin } from "antd";
import { useQuery } from "@apollo/client";
import { gqlTagsQuery } from "../helpers/graphQueryData";

const { Option } = Select;

const MultiSelect = props => {
  const { data, isloading, error } = useQuery(gqlTagsQuery, {
    pollInterval: 2500,
  });

  return !error && !isloading ? (
    <Select
      // status={selectedTags && selectedTags.length < 1 ? "error" : "success"}
      status={props.status}
      mode="multiple"
      allowClear
      size={props.size}
      style={{
        width: "100%",
        marginTop: props.marginTop,
      }}
      placeholder={props.placeholder}
      onChange={value => {
        props.onChange(value);
      }}
    >
      {data && data ? data.tags.map(item => <Option key={item.id}>{item.id}</Option>) : null}
    </Select>
  ) : (
    <div style={{ textAlign: "center" }}>
      <Spin />
    </div>
  );
};

export default MultiSelect;
