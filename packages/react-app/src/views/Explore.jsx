import React, { useEffect, useState } from "react";
import { ethers } from "ethers";
import { Button, List, Skeleton, Spin } from "antd";
import { CenterContent, ContentRow, ContentCol, MultiSelect, UnlockPaywall } from "../components";
import { apolloClient, membershipQuery } from "../helpers/graphQueryData";
import { gql, useQuery, useLazyQuery } from "@apollo/client";

// unlock contract abis
const abis = require("@unlock-protocol/contracts");

function Home({ address, userSigner, targetNetwork }) {
  const [initLoading, setInitLoading] = useState(true);
  const [memberships, setMemberships] = useState();
  const [membershipsData, setMembershipsData] = useState([]);
  const [publicLockContracts, setPublicLockContracts] = useState([]);
  const [fetching, setFetching] = useState();
  const [selectedTags, setSelectedTags] = useState();

  const SEARCH_BY_TAGS = gql`
    query ($where: Membership_filter) {
      memberships(first: 20, where: $where) {
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

  const { data, isloading, error, refetch } = useQuery(SEARCH_BY_TAGS, {
    pollInterval: 2500,
    variables: {
      where: { relatedTags_contains: selectedTags },
    },
  });

  useEffect(() => {
    if (isloading) {
      setInitLoading(true);
    } else if (data) {
      setMemberships(data.memberships);
      setInitLoading(false);
    } else {
      console.log("q error getting data from the graph", error);
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
    refetch({ relatedTags_contains: selectedTags });
  };

  return (
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
          </div>
        </ContentCol>
      </ContentRow>
    </CenterContent>
  );
}

export default Home;
