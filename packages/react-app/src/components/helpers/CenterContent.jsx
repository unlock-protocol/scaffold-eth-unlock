import React, { useEffect, useState } from "react";

function CenterContent({ left, right, ...props }) {
  //   const [posts, setPosts] = useState([]);

  //   const signIn = async () => {
  //     try {
  //       if (!web3Modal?.cachedProvider) {
  //         return alert("Please connect your wallet first");
  //       }
  //       const challenge = await generateChallenge(address);
  //       const signature = await userSigner.signMessage(challenge);
  //       const accessToken = await authenticate(address, signature);
  //       // console.log("rxdfcd", { accessToken });
  //       window.sessionStorage.setItem("accessToken", accessToken);
  //       // console.log({ challenge });
  //       // console.log("signature", signature);
  //     } catch (error) {
  //       console.error(error);
  //       alert("Error signing in");
  //     }
  //   };

  return <div style={{ marginLeft: left, marginRight: right }}>{props.children}</div>;
}

export default CenterContent;
