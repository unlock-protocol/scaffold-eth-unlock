import React from "react";
import { Link } from "react-router-dom";
import { Image } from "antd";
import { CenterContent, ContentRow, ContentCol } from "../components";
import { hintImg1, ensYolo } from "../img";

function Hints() {
  return (
    <div className="hints">
      <CenterContent>
        <div style={{ margin: 32 }}>
          <ContentRow reverseCol={true} margin={"0 0 80px 0"}>
            <ContentCol colLg={8} textLg={"start"}>
              <h1 style={{ fontSize: 50, fontWeight: 700, margin: "42px 0px 65px" }}>
                How It <span style={{ color: "#5e17eb" }}>Works</span>
              </h1>
              <p>🗒️ Purchase an ENS name or use an existing one however, you must be the owner and controller.</p>
              <p>
                🗒️ Create a free lock smart contract{" "}
                <a target="_blank" rel="noreferrer" href="https://app.unlock-protocol.com/locks">
                  here
                </a>{" "}
                or use an existing one if you already have one.
              </p>
              <p>🗒️ Copy the lock's address.</p>
              <p>
                🗒️ Head over to <Link to="/dashboard/yolo">YOLO</Link> tab and enter the ENS name, ETH amount you want
                attached to the ENS name and the lock address.
              </p>
              <p>🗒️ Approve ENS YOLO to make transactions on the ENS contracts on your behalf.</p>
              <p>
                🗒️ Hit the YOLO ENS button, wait for the wallet confirmation pop up, review and confirm the transaction
              </p>
              <p>That's it!!! You did it 🎉 🎉 🎉</p>
            </ContentCol>
            <ContentCol colLg={4}>
              <Image preview={false} className="img-fluid" src={hintImg1} />
            </ContentCol>
          </ContentRow>
          <ContentRow padding={"0 0 250px 0"}>
            <ContentCol colLg={4}>
              <Image preview={false} width={200} src={ensYolo} />
            </ContentCol>
            <ContentCol colLg={8} textLg={"start"}>
              <h2 style={{ fontSize: 30, fontWeight: 700, margin: "42px 0px 65px" }}>
                What <span style={{ color: "#FFB44F" }}>Next?</span>
              </h2>
              <p>
                🧑‍✈️ Airdrop a key for the lock smart contract to whoever you want to claim it or create a{" "}
                <Link to="/dashboard/quest">QUEST</Link> for others to contest for the key.
              </p>
              <p>🎁 When they claim it, the ENS name and ETH is transferred to the user</p>
              <p>
                📑 Wanna change something? Not to worry, you can <Link to="dashboard/cancel">CANCEL</Link> YOLO if it's
                unclaimed.
              </p>
              <p>That's about it for now! 🎇 Have fun with it 🚀🚀</p>
            </ContentCol>
          </ContentRow>
        </div>
      </CenterContent>
    </div>
  );
}

export default Hints;
