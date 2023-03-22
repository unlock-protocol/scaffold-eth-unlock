import React, { useEffect, useState } from "react";

function ContentRow({ margin, padding, ...props }) {
  return (
    <div className="mh-row" style={{ display: "flex", alignItems: "center", margin: margin, padding: padding }}>
      {props.children}
    </div>
  );
}

export default ContentRow;
