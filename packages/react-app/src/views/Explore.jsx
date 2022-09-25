import React, { useEffect, useState } from "react";
import { ethers } from "ethers";
import { Image, Avatar, Button, List, Skeleton, Space, Divider, Spin } from "antd";
import { CenterContent, ContentRow, ContentCol, MultiSelect, UnlockPaywall } from "../components";
import { apolloClient, membershipQuery } from "../helpers/graphQueryData";
import { gql, useQuery } from "@apollo/client";
// import fetch from "isomorphic-fetch";
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

// const count = 3;
// const fakeDataUrl = `https://randomuser.me/api/?results=${count}&inc=name,gender,email,nat,picture&noinfo`;

// const IconText = ({ icon, text }) => (
//   <Space>
//     {React.createElement(icon)}
//     {text}
//   </Space>
// );

function Home({ address, userSigner, targetNetwork }) {
  const [initLoading, setInitLoading] = useState(true);
  // const [loading, setLoading] = useState(false);
  // const [data, setData] = useState([]);
  // const [list, setList] = useState([]);
  const [memberships, setMemberships] = useState();
  const [membershipsData, setMembershipsData] = useState([]);
  const [publicLockContracts, setPublicLockContracts] = useState([]);
  const [fetching, setFetching] = useState();
  const [selectedTags, setSelectedTags] = useState();

  // const [unlock, setUnlock] = useState();

  const testQuery = gql`
    {
      memberships(first: 20, orderBy: createdAt, orderDirection: asc) {
        id
        membershipAddress
        relatedTags {
          id
          name
        }
        creator {
          address
        }
      }
    }
  `;
  const { data, isloading, error, refetch } = useQuery(testQuery, { pollInterval: 2500 });

  useEffect(() => {
    if (isloading) {
      setInitLoading(true);
    } else if (data) {
      setMemberships(data.memberships);
      setInitLoading(false);
    } else {
      console.log("error getting data from the graph", error);
    }
  }, [data, isloading, error]);

  useEffect(() => {
    let publicLocks = [];
    const getPublicLockContracts = () => {
      if (userSigner) {
        try {
          for (let i = 0; i < memberships.length; i++) {
            publicLocks.push(new ethers.Contract(memberships[i].membershipAddress, abis.PublicLockV10.abi, userSigner));
          }
        } catch (e) {
          console.log("error getting data", e);
        }
      }
    };
    getPublicLockContracts();
    setPublicLockContracts(publicLocks);
  }, [memberships, userSigner]);

  useEffect(() => {
    setFetching(true);
    let myArr = [];
    const getLockDataFromPublicLockContracts = () => {
      if (publicLockContracts) {
        try {
          let info = async () => {
            for (let i = 0; i < publicLockContracts.length; i++) {
              let obj = {
                name: await publicLockContracts[i].name(),
                symbol: await publicLockContracts[i].symbol(),
                address: await publicLockContracts[i].address,
                maxKeys: await publicLockContracts[i].maxNumberOfKeys(),
                totalSupply: await publicLockContracts[i].totalSupply(),
                publicLock: publicLockContracts[i],
              };
              myArr.push(obj);
            }
          };
          info();
        } catch (e) {
          console.log("error getting data", e);
        }
      }
    };
    getLockDataFromPublicLockContracts();
    setMembershipsData(myArr);
    setTimeout(() => {
      setFetching(false);
    }, 5000);
  }, [publicLockContracts, memberships]);

  // const onLoadMore = () => {
  //   setLoading(true);
  // setList(
  //   data.concat(
  //     [...new Array(count)].map(() => ({
  //       loading: true,
  //       name: {},
  //       picture: {},
  //     })),
  //   ),
  // );
  // fetch(fakeDataUrl)
  //   .then(res => res.json())
  //   .then(res => {
  //     const newData = data.concat(res.results);
  //     setData(newData);
  //     setList(newData);
  //     setLoading(false); // Resetting window's offsetTop so as to display react-virtualized demo underfloor.
  //     // In real scene, you can using public method of react-virtualized:
  //     // https://stackoverflow.com/questions/46700726/how-to-use-public-method-updateposition-of-react-virtualized
  //     window.dispatchEvent(new Event("resize"));
  //   });
  // };
  const onLoadMore = async () => {
    console.log("loading more...");
  };
  const loadMore =
    !initLoading && !fetching ? (
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
  const handleSelect = opt => {
    let chosenTags = [];
    opt.map(item => chosenTags.push(item.value));
    setSelectedTags(chosenTags);
  };
  console.log("qqqqq", selectedTags);

  return (
    // <div>
    <CenterContent right={50} left={50}>
      <ContentRow>
        <ContentCol flex={1}>
          <div style={{ alignSelf: "center" }}>
            <MultiSelect onChange={handleSelect} />
          </div>
        </ContentCol>
      </ContentRow>
      <ContentRow>
        <ContentCol flex={1}>
          <div className="mh-dashboard-content">
            {membershipsData && membershipsData ? (
              <List
                className="demo-loadmore-list"
                loading={fetching}
                itemLayout="horizontal"
                loadMore={loadMore}
                dataSource={membershipsData}
                renderItem={item => (
                  <List.Item
                    key={item.address}
                    actions={[
                      <UnlockPaywall
                        targetNetwork={targetNetwork}
                        displayText={"Join"}
                        publicLock={item.publicLock}
                        key="list-loadmore-more"
                      ></UnlockPaywall>,
                    ]}
                  >
                    <Skeleton avatar title={false} loading={item.loading} active>
                      <List.Item.Meta
                        // avatar={<Avatar size={50} src={item.picture.large} />}
                        title={<a href="#">{item.name}</a>}
                        description={`Members: ${item.totalSupply} / ${item.maxKeys ? item.maxKeys : "♾️"} 🧑‍🤝‍🧑`}
                      />
                      {/* <div>content</div> */}
                    </Skeleton>
                  </List.Item>
                )}
              />
            ) : (
              <Spin></Spin>
            )}
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
