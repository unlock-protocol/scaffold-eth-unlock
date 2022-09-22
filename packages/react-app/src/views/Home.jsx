import { useContractReader } from "eth-hooks";
import { ethers } from "ethers";
import React, { useEffect, useState } from "react";
import { QuestionCircleOutlined } from "@ant-design/icons";
import { Link } from "react-router-dom";
import { Col, Divider, Row, Space, Image, Button } from "antd";
import { CenterContent, ContentRow, ContentCol } from "../components";
import { ethImg, mhLogo, searchImg } from "../img";

function Home({ address, loadWeb3Modal, yourLocalBalance }) {
  const [loading, setLoading] = useState([]);

  return (
    <div className="home">
      <CenterContent left={320} right={320}>
        <div style={{ margin: 32 }}>
          <ContentRow margin={"0 0 250px 0"}>
            <ContentCol>
              <h1 style={{ fontSize: 50, fontWeight: 700, margin: "82px 0px 85px" }}>
                The Members <span style={{ color: "#FFB44F" }}>Hub</span>
              </h1>
              <p style={{ fontSize: 21, fontWeight: 400, margin: "0 0px 25px 0" }}>All aboard the member ship 🚢</p>
              <p style={{ marginBottom: 85, padding: "20px 50px 20px 50px", fontWeight: 300, fontSize: 16 }}>
                As we explore the ever expansive brave new world of web3, new and exciting communities spawn up almost
                on a daily basis, some of which may align with our values and interests but there's one problem.
              </p>
              <QuestionCircleOutlined style={{ fontSize: "66px", color: "#08c" }} />
            </ContentCol>
          </ContentRow>
          <ContentRow margin={"0 0 250px 0"}>
            <ContentCol flex={2}>
              <Image preview={false} width={200} src={ethImg} />
            </ContentCol>
            <ContentCol textAlign={"left"} padding={"0 0 0 100px"} flex={3}>
              <div>
                {/* <div style={{ textAlign: "left", paddingLeft: 50 }}> */}
                <h3 style={{ fontSize: 19 }}>Obsqurity</h3>
                <p style={{ color: "#b1a8a8", fontSize: 14 }}>
                  We don't know about them! We simply do not know they exist!!! Finding communities and projects or
                  services that excites us can be a daunting task in web3 simply becuase of how fast things are moving,
                  it's difficult to keep track or keep up with everything.
                </p>
                <Button style={{ marginTop: 13 }} shape="round" size={"large"}>
                  Discover
                </Button>
              </div>
            </ContentCol>
          </ContentRow>
          <h3 style={{ fontSize: 21, fontWeight: 400 }}>What if we could change that?</h3>
          <ContentRow margin={"30px 0 250px 0"}>
            <ContentCol textAlign={"right"} padding={"0 135px 0 0"} flex={3}>
              <div>
                <p style={{ textAlign: "right", color: "#b1a8a8", fontSize: 14 }}>
                  Members Hub try to solve this by providing a platform where communities can broadcast their existence
                  so people who are interested can find them
                </p>
                <Button style={{ marginTop: 13 }} shape="round" size={"large"}>
                  Get started
                </Button>
              </div>
            </ContentCol>
            <ContentCol flex={2}>
              <Image preview={false} width={200} src={searchImg} />
            </ContentCol>
          </ContentRow>
          <ContentRow>
            <ContentCol>
              <span style={{ fontSize: 75, marginBottom: 40 }}>💡</span>
              <div style={{ padding: "0 100px 250px 100px" }}>
                <h3 style={{ color: "#b1a8a8", fontSize: 14 }}>
                  Simply publish your community and people would be able to find you by searching the memberships
                  explorer
                </h3>
                <Button style={{ marginTop: 13 }} shape="round" size={"large"}>
                  Connect wallet
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
