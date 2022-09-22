// import { useContractReader } from "eth-hooks";
import { QuestionCircleOutlined, LikeOutlined, MessageOutlined, StarOutlined } from "@ant-design/icons";
// import { Link } from "react-router-dom";
// import { ethImg, mhLogo, searchImg } from "../img";
import React, { useEffect, useState } from "react";
import { ethers } from "ethers";
import { Image, Avatar, Button, List, Skeleton, Space, Divider } from "antd";
import { CenterContent, ContentRow, ContentCol } from "../components";

const hd = {
  results: [
    {
      gender: "female",
      name: { title: "Ms", first: "Josefina", last: "Lozano" },
      // email: "josefina.lozano@example.com",
      picture: {
        large: "https://randomuser.me/api/portraits/women/78.jpg",
        medium: "https://randomuser.me/api/portraits/med/women/78.jpg",
        thumbnail: "https://randomuser.me/api/portraits/thumb/women/78.jpg",
      },
      // nat: "ES",
    },
  ],
};

const count = 3;
const fakeDataUrl = `https://randomuser.me/api/?results=${count}&inc=name,gender,email,nat,picture&noinfo`;
const data2 = Array.from({
  length: 1,
}).map((_, i) => ({
  // gender: "female",
  name: { title: "Ms", first: "Josefina", last: "Lozano" },
  // email: "josefina.lozano@example.com",
  picture: {
    large: "https://randomuser.me/api/portraits/women/78.jpg",
    medium: "https://randomuser.me/api/portraits/med/women/78.jpg",
    thumbnail: "https://randomuser.me/api/portraits/thumb/women/78.jpg",
  },
  // nat: "ES",
  href: "https://ant.design",
  title: `ant design part ${i}`,
  avatar: "https://joeschmoe.io/api/v1/random",
  description: "Ant Design, a design language for background applications, is refined by Ant UED Team.",
  content:
    "We supply a series of design principles, practical patterns and high quality design resources (Sketch and Axure), to help people create their product prototypes beautifully and efficiently.",
}));

const IconText = ({ icon, text }) => (
  <Space>
    {React.createElement(icon)}
    {text}
  </Space>
);

function Home({ address, loadWeb3Modal }) {
  const [initLoading, setInitLoading] = useState(true);
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState([]);
  const [list, setList] = useState([]);

  useEffect(() => {
    fetch(fakeDataUrl)
      .then(res => res.json())
      .then(res => {
        setInitLoading(false);
        setData(res.results);
        setList(res.results);
      });
  }, []);

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
          <div className="mh-dashboard-content">
            <List
              className="demo-loadmore-list"
              loading={initLoading}
              itemLayout="horizontal"
              // loadMore={loadMore}
              // dataSource={data2}
              dataSource={list}
              renderItem={item => (
                <List.Item actions={[<a key="list-loadmore-edit">Follow</a>, <a key="list-loadmore-more">Details</a>]}>
                  <Skeleton avatar title={false} loading={item.loading} active>
                    <List.Item.Meta
                      avatar={<Avatar size={50} src={item.picture.large} />}
                      title={<a href="https://ant.design">{item.name?.last}</a>}
                      description="Ant Design, a design language for background applications, is refined by Ant UED Team"
                    />
                    {/* <div>content</div> */}
                  </Skeleton>
                </List.Item>
              )}
            />
            <Divider />
            <List
              itemLayout="vertical"
              size="large"
              // pagination={{
              //   onChange: page => {
              //     console.log(page);
              //   },
              //   pageSize: 1,
              // }}
              dataSource={data2}
              footer={
                <div>
                  {/* <Button onClick={loadMore}>Load more</Button> */}
                  {loadMore}
                </div>
              }
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
            />
          </div>
        </ContentCol>
      </ContentRow>
    </CenterContent>
    // </div>
  );
}

export default Home;
