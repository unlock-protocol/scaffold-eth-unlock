import React from "react";
import { Card, Button } from "antd";
// import { useHistory } from "react-router-dom";

export default function ButtonCard(props) {
  //   const history = useHistory();

  const iconButtonStyle = {
    width: props.width,
    height: props.height,
    fontSize: props.fontSize,
    background: props.background,
    borderColor: props.borderColor,
  };
  return (
    <Card
      hoverable
      style={{ padding: 10, cursor: "initial", marginLeft: props.marginLeft, marginRight: props.marginRight }}
    >
      <Button
        onClick={() => {
          props.onClick();
          //   history.push(props.onClick);
        }}
        className={iconButtonStyle}
        style={iconButtonStyle}
        type="primary"
        shape="circle"
        icon={props.icon}
        size={props.size}
      />
      <p style={{ marginTop: 15, fontWeight: 300 }}>{props.text}</p>
    </Card>
  );
}
