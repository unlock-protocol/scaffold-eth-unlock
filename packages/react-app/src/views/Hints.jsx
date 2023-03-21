import React, { useEffect, useState } from "react";
import { QuestionCircleOutlined } from "@ant-design/icons";
// import { Link } from "react-router-dom";
// import { Col, Divider, Row, Space, Image, Button } from "antd";
import { CenterContent, ContentRow, ContentCol } from "../components";
// import { useHistory } from "react-router-dom";

function Hints() {

  return (
    <div className="home">
      <CenterContent left={320} right={320}>
        <div style={{ margin: 32 }}>
          <ContentRow margin={"0 0 250px 0"}>
            <ContentCol>
              <h1 style={{ fontSize: 50, fontWeight: 700, margin: "42px 0px 65px" }}>
                How It <span style={{ color: "#FFB44F" }}>Works</span>
              </h1>
              <p style={{ fontSize: 21, fontWeight: 400, margin: "0 0px 25px 0" }}>
                eXperince web3 the fun way through social sharing and education
              </p>
              <p style={{ marginBottom: 85, padding: "20px 50px 20px 50px", fontWeight: 300, fontSize: 16 }}>
                ENS is a decentralized domain name system built on the Ethereum blockchain. ENS provides a user-friendly
                way to assign human-readable names to Ethereum addresses, making it easier for people to send and
                receive payments, participate in decentralized applications, and interact with the blockchain ecosystem.
              </p>
            </ContentCol>
          </ContentRow>
        </div>
      </CenterContent>
    </div>
  );
}

export default Hints;
