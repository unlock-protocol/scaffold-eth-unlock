import React from "react";
import { Input, Space } from "antd";
const { Search } = Input;

// const onSearch = (value) => console.log(value);

const SearchInput = ({ placeholder, width, onSearch }) => (
  <Space direction="vertical">
    <Search
      placeholder={placeholder}
      onSearch={onSearch}
      style={{
        width: width,
      }}
    />
  </Space>
);

export default SearchInput;
