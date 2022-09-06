import React, { useEffect, useState } from "react";

function ContentCol({ alignItems, flex, ...props }) {
  return (
    <div style={{ display: "flex", flexDirection: "column", flex: flex, alignItems: alignItems }}>{props.children}</div>
  );
}

export default ContentCol;
