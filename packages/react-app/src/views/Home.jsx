import { useContractReader } from "eth-hooks";
import { ethers } from "ethers";
import React, { useEffect, useState } from "react";
import { QuestionCircleOutlined } from "@ant-design/icons";
import { Link } from "react-router-dom";
import { Col, Divider, Row, Space, Image } from "antd";
import { CenterContent, ContentRow, ContentCol } from "../components";
import ethImg from "../img/eth-mh.svg";

function Home({ yourLocalBalance }) {
  const [loading, setLoading] = useState([]);

  return (
    <div>
      <CenterContent>
        <div style={{ margin: 32 }}>
          <ContentRow margin={"0 0 150px 0"}>
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
          <ContentRow margin={"50px 0 150px 0"}>
            <ContentCol flex={2}>
              <Image width={200} src={ethImg} />
            </ContentCol>
            <ContentCol flex={3}>
              <div style={{ textAlign: "left", paddingLeft: 50 }}>
                <h3>Obsqurity</h3>
                <p style={{ color: "#b1a8a8", fontSize: 14 }}>
                  We don't know about them! We simply do not know they exist!!! Finding communities and projects or
                  services that excites us can be a daunting task in web3 simply becuase of how fast things are moving,
                  it's difficult to keep track or keep up with everything.
                </p>
              </div>
            </ContentCol>
          </ContentRow>
          <h3>What if we could change that?</h3>
          <ContentRow margin={"50px 0 150px 0"}>
            <ContentCol flex={3}>
              <p>
                Members Hub try to solve this by providing a platform where communities can broadcast their existence so
                people who are interested can find them
              </p>
              <p>
                Simply publish your community and people would be able to find you by searching the memberships explorer
              </p>
            </ContentCol>
            <ContentCol flex={2}>2 / 5</ContentCol>
          </ContentRow>
        </div>
      </CenterContent>
    </div>
  );
}

export default Home;
