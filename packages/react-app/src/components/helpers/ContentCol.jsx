import React from "react";

function ContentCol({ mb, mbLg, colLg, colSm, colMd, textLg, padding, ...props }) {
  return (
    <div
      className={`
      mb-${mb} 
      mb-lg-${mbLg} 
      col-12 col-sm-${colSm} 
      col-lg-${colLg} 
      col-md-${colMd} 
      text-center text-lg-${textLg ? textLg : "center"}
      `}
      style={{
        padding: padding,
      }}
    >
      {props.children}
    </div>
  );
}

export default ContentCol;
