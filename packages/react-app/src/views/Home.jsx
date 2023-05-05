import { useContractReader } from "eth-hooks";
import { ethers } from "ethers";
import React, { useEffect, useState } from "react";
import { QuestionCircleOutlined } from "@ant-design/icons";
import { Link } from "react-router-dom";
import { Col, Divider, Row, Space, Image, Button } from "antd";
import { CenterContent, ContentRow, ContentCol } from "../components";
import { useHistory } from "react-router-dom";

import { ethImg, mhLogo, searchImg } from "../img";

function Home({ loadWeb3Modal, injectedProvider }) {
  let history = useHistory();
  const getStarted = route => {
    if (injectedProvider) {
      history.push(route);
    } else {
      loadWeb3Modal();
    }
  };

  return (
    <div className="home">
      <CenterContent>
        <div >
          <ContentRow margin={"0 0 250px 0"}>
            <ContentCol>
              <h1 style={{ fontSize: 50, fontWeight: 700, margin: "82px 0px 85px" }}>
                ENS <span style={{ color: "#FFB44F" }}>YOLO</span>
              </h1>
              <p style={{ fontSize: 21, fontWeight: 400, margin: "0 0px 25px 0" }}>
                eXperince web3 the fun way through social sharing and education
              </p>
              <p style={{ marginBottom: 85, padding: "20px 50px 20px 50px", fontWeight: 300, fontSize: 16 }}>
                ENS is a decentralized domain name system built on the Ethereum blockchain. ENS provides a user-friendly
                way to assign human-readable names to Ethereum addresses, making it easier for people to send and
                receive payments, participate in decentralized applications, and interact with the blockchain ecosystem.
              </p>
              <QuestionCircleOutlined style={{ fontSize: "66px", color: "#08c" }} />
            </ContentCol>
          </ContentRow>
          <ContentRow margin={"0 0 250px 0"}>
            <ContentCol colLg={4}>
              <Image preview={false} width={200} src={ethImg} />
            </ContentCol>
            {/* <ContentCol textAlign={"left"} padding={"0 0 0 100px"} flex={3}> */}
            <ContentCol colLg={8} textLg={"start"}>
              <div>
                <h3 style={{ fontSize: 19 }}>What is ENS YOLO</h3>
                <p style={{ color: "#b1a8a8", fontSize: 14 }}>
                  ENS.YOLO is a fun experiment to onboard new users to web3. With ENS YOLO users who own or purchases an
                  ENS NFT can gift the ENS name to someone else along with some ETH. If the recipient claims the ENS
                  name, they receive the ENS name and associated ETH.
                </p>
                <Button
                  onClick={() => {
                    getStarted("/dashboard");
                  }}
                  style={{ marginTop: 13 }}
                  shape="round"
                  size={"large"}
                >
                  {injectedProvider ? "Get started" : "Enter App"}
                </Button>
              </div>
            </ContentCol>
          </ContentRow>
          <ContentRow reverseCol={true} margin={"30px 0 250px 0"}>
            {/* <ContentCol textAlign={"left"} padding={"0 135px 0 0"} flex={3}> */}
            <ContentCol colLg={8} textLg={"start"}>
              <h3 style={{ fontSize: 19 }}>Why ENS YOLO?</h3>

              <div>
                <p style={{ textAlign: "left", color: "#b1a8a8", fontSize: 14 }}>
                  Despite the benefits of ENS and web3 many people are still unfamiliar with blockchain technology and
                  hesitant to use it. ENS YOLO is a project that aims to onboard new users to web3 and encourage them to
                  interact with the blockchain ecosystem in a fun and engaging way.
                </p>
                <Button
                  onClick={() => {
                    getStarted("/dashboard/");
                    // history.push("/dashboard/");
                  }}
                  style={{ marginTop: 13 }}
                  shape="round"
                  size={"large"}
                >
                  {injectedProvider ? "Enter App" : "Connect Wallet"}
                </Button>
              </div>
            </ContentCol>
            <ContentCol mb={5} mbLg={0} colLg={4}>
              <Image preview={false} width={200} src={searchImg} />
            </ContentCol>
          </ContentRow>
          <ContentRow>
            <ContentCol>
              <span style={{ display: "inline-block", fontSize: 75, marginBottom: 40 }}>💡</span>
              <div style={{ padding: "0 100px 250px 100px" }}>
                <h3 style={{ color: "#b1a8a8", fontSize: 14 }}>
                  ENS YOLO encourages social sharing, users get to show off their newly acquired ENS names on their
                  social media handles. This can lead to increased exposure for blockchain technology and demonstrate
                  the potential of web3 beyond just payments as more people become aware, curious interested in the
                  technology through the power of incentives, engagement and social sharing.
                </h3>
                <Button
                  onClick={() => {
                    getStarted("/dashboard/");
                  }}
                  style={{ marginTop: 13 }}
                  shape="round"
                  size={"large"}
                >
                  {injectedProvider ? "Dashboard" : "Connect Wallet"}
                </Button>
              </div>
            </ContentCol>
          </ContentRow>
        </div>
      </CenterContent>
    </div>
  );
}

export default Home;
