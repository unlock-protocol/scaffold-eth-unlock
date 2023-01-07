import React, { useEffect } from "react";
import { Typography, Button, Avatar } from "antd";
import {
  HomeOutlined,
  LoadingOutlined,
  SettingFilled,
  SmileOutlined,
  SyncOutlined,
  QuestionCircleOutlined,
} from "@ant-design/icons";

// @notice displays a page header

const { Title, Text } = Typography;

export default function Header({ link, title, subTitle, ...props }) {
  return (
    <div style={{ display: "flex", justifyContent: "space-between", padding: "1.2rem", margin: "0 15px" }}>
      <div style={{ display: "flex", flexDirection: "column", flex: 1, alignItems: "start" }}>
        <a href={link} rel="noopener noreferrer" style={{ display: "flex", alignItems: "center" }}>
          <Avatar
            size={40}
            src={
              "data:image/png;base64,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"
            }
          />
          <Title level={4} style={{ margin: "0 0.5rem 0 0.5rem" }}>
            {title}
          </Title>
        </a>
        <Text type="secondary" style={{ textAlign: "left" }}>
          {subTitle}
        </Text>
      </div>
      {props.children}
    </div>
  );
}

Header.defaultProps = {
  link: "/#",
  title: "M | H",
  subTitle: "Discover communities",
};
