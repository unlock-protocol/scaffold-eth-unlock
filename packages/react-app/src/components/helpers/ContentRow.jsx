import React, { useEffect, useState } from "react";

function ContentRow({ reverseCol, margin, padding, ...props }) {
  return (
    <div
      className={`row ${reverseCol ? "flex-wrap-reverse" : ""} justify-content-md-center`}
      style={{ display: "flex", alignItems: "center", margin: margin, padding: padding }}
    >
      {props.children}
    </div>
  );
}

export default ContentRow;
