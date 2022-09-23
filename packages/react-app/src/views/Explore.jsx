import React, { useEffect, useState } from "react";
import { ethers } from "ethers";
import { Image, Avatar, Button, List, Skeleton, Space, Divider } from "antd";
import { CenterContent, ContentRow, ContentCol, MultiSelect } from "../components";
import { apolloClient, membershipQuery, subgraphURI } from "../helpers/graphQueryData";
import { gql } from "@apollo/client";
import fetch from "isomorphic-fetch";
// unlock contract abis
const abis = require("@unlock-protocol/contracts");
// async function membershipsList(tagName) {
//   console.log("fetching tag", tagName);
//   const { data } = await apolloClient.query({
//     query: gql(membershipQuery),
//   });
//   console.log("grrrrr", data);
// }
// membershipsList();

const count = 3;
const fakeDataUrl = `https://randomuser.me/api/?results=${count}&inc=name,gender,email,nat,picture&noinfo`;

const IconText = ({ icon, text }) => (
  <Space>
    {React.createElement(icon)}
    {text}
  </Space>
);

function Home({ address, loadWeb3Modal, userSigner }) {
  const [initLoading, setInitLoading] = useState(true);
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState([]);
  const [list, setList] = useState([]);
  const [memberships, setMemberships] = useState();
  useEffect(() => {
    fetch(fakeDataUrl)
      .then(res => res.json())
      .then(res => {
        setInitLoading(false);
        setData(res.results);
        setList(res.results);
      });
  }, []);

  useEffect(() => {
    async function getMembershipsList() {
      const { data } = await apolloClient.query({
        query: gql(membershipQuery),
      });
      setMemberships(data.memberships);
    }
    getMembershipsList();
  }, []);
  console.log("grrrrr", memberships);
  console.log("grrlll", list);

  ////////////////Unlock Protocol///////////////////
  const unlockData = JSON.parse(window.localStorage.getItem("unlock"));
  const publicLockData = JSON.parse(window.localStorage.getItem("publicLock"));
  useEffect(() => {
    if (unlockData && publicLockData) {
      const unlockAddress = unlockData.unlockAddress;
      const publicLockAddress = publicLockData.publicLockAddress;
      setDeployedUnlockAddress(unlockAddress);
      setPublicLockAddress(publicLockAddress);
    }
  }, []);

  const [deployedUnlockAddress, setDeployedUnlockAddress] = useState();
  const [publicLockAddress, setPublicLockAddress] = useState();
  const [publicLock, setPublicLock] = useState();
  const [unlock, setUnlock] = useState();

  useEffect(() => {
    const readyUnlock = () => {
      let unlockContract;
      let publicLockContract;
      try {
        if (deployedUnlockAddress) {
          unlockContract = new ethers.Contract(deployedUnlockAddress, abis.UnlockV11.abi, userSigner);
        }
        if (publicLockAddress) {
          publicLockContract = new ethers.Contract(publicLockAddress, abis.PublicLockV10.abi, userSigner);
        }
      } catch (e) {
        console.log(e);
      }
      setUnlock(unlockContract);
      setPublicLock(publicLockContract);
    };
    readyUnlock();
  }, [address]);
  ////////////// UNLOCK PROTOCOL: THE END /////////////

  const onLoadMore = () => {
    setLoading(true);
    setList(
      data.concat(
        [...new Array(count)].map(() => ({
          loading: true,
          name: {},
          picture: {},
        })),
      ),
    );
    fetch(fakeDataUrl)
      .then(res => res.json())
      .then(res => {
        const newData = data.concat(res.results);
        setData(newData);
        setList(newData);
        setLoading(false); // Resetting window's offsetTop so as to display react-virtualized demo underfloor.
        // In real scene, you can using public method of react-virtualized:
        // https://stackoverflow.com/questions/46700726/how-to-use-public-method-updateposition-of-react-virtualized
        window.dispatchEvent(new Event("resize"));
      });
  };

  const loadMore =
    !initLoading && !loading ? (
      <div
        style={{
          textAlign: "center",
          marginTop: 12,
          height: 32,
          lineHeight: "32px",
        }}
      >
        <Button onClick={onLoadMore}>load more</Button>
      </div>
    ) : null;

  return (
    // <div>
    <CenterContent right={50} left={50}>
      <ContentRow>
        <ContentCol flex={1}>
          <div style={{ alignSelf: "center" }}>
            <MultiSelect />
          </div>
        </ContentCol>
      </ContentRow>
      <ContentRow>
        <ContentCol flex={1}>
          <div className="mh-dashboard-content">
            <List
              className="demo-loadmore-list"
              loading={initLoading}
              itemLayout="horizontal"
              // loadMore={loadMore}
              // dataSource={data2}
              dataSource={memberships}
              renderItem={item => (
                <List.Item actions={[<a key="list-loadmore-more">Details</a>]}>
                  <Skeleton avatar title={false} loading={item.loading} active>
                    <List.Item.Meta
                      // avatar={<Avatar size={50} src={item.picture.large} />}
                      title={<a href="https://ant.design">{item.membershipAddress}</a>}
                      description="Ant Design, a design language for background applications, is refined by Ant UED Team"
                    />
                    {/* <div>content</div> */}
                  </Skeleton>
                </List.Item>
              )}
            />

            {/* <Divider />
            <List
              itemLayout="vertical"
              size="large"
              dataSource={data2}
              footer={<div>{loadMore}</div>}
              renderItem={item => (
                <List.Item
                  key={item.title}
                  actions={[
                    <IconText icon={StarOutlined} text="156" key="list-vertical-star-o" />,
                    <IconText icon={LikeOutlined} text="156" key="list-vertical-like-o" />,
                    <IconText icon={MessageOutlined} text="2" key="list-vertical-message" />,
                  ]}
                  extra={
                    <img
                      width={272}
                      alt="logo"
                      src="https://gw.alipayobjects.com/zos/rmsportal/mqaQswcyDLcXyDKnZfES.png"
                    />
                  }
                >
                  <List.Item.Meta
                    avatar={<Avatar src={item.avatar} />}
                    title={<a href={item.href}>{item.title}</a>}
                    description={item.description}
                  />
                  {item.content}
                </List.Item>
              )}
            /> */}
          </div>
        </ContentCol>
      </ContentRow>
    </CenterContent>
    // </div>
  );
}

export default Home;
