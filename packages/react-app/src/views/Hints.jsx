import { useContractReader } from "eth-hooks";
import { ethers } from "ethers";
import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Avatar, Button, Card, Divider, Skeleton } from "antd";
import { generateChallenge, authenticate, getPublications } from "../helpers/lens/lens-utils";

function Home({ yourLocalBalance, readContracts, address, web3Modal, userSigner, logoutOfWeb3Modal, loadWeb3Modal }) {
  const [posts, setPosts] = useState([]);

  const signIn = async () => {
    try {
      if (!web3Modal?.cachedProvider) {
        return alert("Please connect your wallet first");
      }
      const challenge = await generateChallenge(address);
      const signature = await userSigner.signMessage(challenge);
      const accessToken = await authenticate(address, signature);
      // console.log("rxdfcd", { accessToken });
      window.sessionStorage.setItem("accessToken", accessToken);
      // console.log({ challenge });
      // console.log("signature", signature);
    } catch (error) {
      console.error(error);
      alert("Error signing in");
    }
  };
  console.log("xxx", posts);
  useEffect(() => {
    getPublications().then(setPosts);
  }, []);
  console.log("test", posts);
  return (
    <div>
      <div style={{ margin: 32 }}>
        Lorem ipsum dolor sit amet consectetur adipisicing elit. Expedita earum sint dolorem asperiores ipsa provident
        fuga enim repellendus, aspernatur, voluptate mollitia corrupti eius cumque deserunt doloribus. Obcaecati beatae
        veritatis voluptas!
        <div>
          <Button onClick={signIn}>Login with Lens</Button>
        </div>
      </div>
      <div>
        <Card>
          {posts &&
            posts
              .filter(post => post.__typename === "Post") // we need to filter the list to make sure we are not rendering anything other than Posts, like comments and other formats.
              .map(post => {
                return (
                  <div key={post.id}>
                    <div>
                      {/* <Avatar src={post.profile.picture?.original.url} /> */}
                      <Avatar />
                      <p>{post.profile?.handle || post.profile?.id}</p>
                    </div>
                    <p>{post.metadata?.content}</p>
                    <div style={{ fontColor: "gray", fontWeight: 400 }}>
                      <p>{post.stats?.totalAmountOfComments} comments,</p>
                      <p>{post.stats?.totalAmountOfMirrors} mirrors,</p>
                      <p>{post.stats?.totalAmountOfCollects} collects</p>
                    </div>
                    <Divider />
                  </div>
                );
              })}
          {posts.length === 0 || !posts ? (
            <Skeleton
              avatar
              paragraph={{
                rows: 4,
              }}
            />
          ) : null}
        </Card>
      </div>
    </div>
  );
}

export default Home;
