import React, { useEffect, useState } from "react";

function ContentCol({ alignItems, flex, textAlign, padding, ...props }) {
  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        flex: flex,
        alignItems: alignItems,
        textAlign: textAlign,
        padding: padding,
      }}
    >
      {props.children}
    </div>
  );
}

export default ContentCol;
