import React, { useEffect, useState } from "react";

function ContentRow({ margin, ...props }) {
  return <div style={{ display: "flex", alignItems: "center", margin: margin }}>{props.children}</div>;
}

export default ContentRow;
