import React, { useEffect, useState } from "react";
import { CaretLeftOutlined, TagOutlined, DeleteOutlined } from "@ant-design/icons";
import { Input, Card, Button, Typography, Select, Skeleton, Spin } from "antd";

import { CenterContent, ContentRow, ContentCol, ButtonCard } from "../components";

function Create({ writeContracts, txn }) {
  const [isLoading, setIsLoading] = useState(false);
  const [tagOperation, setTagOperation] = useState(0);
  const [tag, setTag] = useState();

  const goBack = () => {
    setTagOperation(0);
    setIsLoading(false);
  };

  const addTagForm = (
    <ContentRow>
      <ContentCol flex={1} alignItems={"center"}>
        <div style={{ padding: 8, marginTop: 32, maxWidth: 592, width: "100%" }}>
          <Button onClick={goBack} style={{ position: "relative", top: -10 }}>
            <CaretLeftOutlined />
            Back
          </Button>
          <Card headStyle={{ textAlign: "center" }} title="Add New Tag">
            <div style={{ padding: 8 }}>
              <Input
                style={{ textAlign: "left", marginBottom: 15 }}
                placeholder={"Enter tag"}
                size="large"
                onChange={e => {
                  const newValue = e.target.value;
                  setTag(newValue);
                }}
              />
              <div style={{ padding: 8, textAlign: "center", marginTop: 25 }}>
                <Button
                  shape="round"
                  type="primary"
                  size="large"
                  loading={isLoading}
                  onClick={() => {
                    setIsLoading(true);
                    (async function () {
                      try {
                        let tagTX = await txn(writeContracts.MembersHub.addTag(tag));
                        console.log("add tag tx ", tagTX);
                        setIsLoading(false);
                        return tagTX;
                      } catch (e) {
                        console.log("error adding tag", e);
                      }
                    })(tag);
                  }}
                  disabled={isLoading}
                >
                  Add Tag
                </Button>
              </div>
            </div>
          </Card>
        </div>
      </ContentCol>
    </ContentRow>
  );
  const removeTagForm = (
    <ContentRow>
      <ContentCol flex={1} alignItems={"center"}>
        <div style={{ padding: 8, marginTop: 32, maxWidth: 592, width: "100%" }}>
          <Button onClick={goBack} style={{ position: "relative", top: -10 }}>
            <CaretLeftOutlined />
            Back
          </Button>
          <Card headStyle={{ textAlign: "center" }} title="Remove Tag">
            <div style={{ padding: 8 }}>
              <Input
                style={{ textAlign: "left", marginBottom: 15 }}
                placeholder={"Enter tag"}
                size="large"
                onChange={e => {
                  const newValue = e.target.value;
                  setTag(newValue);
                }}
              />
              <div style={{ padding: 8, textAlign: "center", marginTop: 25 }}>
                <Button
                  shape="round"
                  type="primary"
                  size="large"
                  loading={isLoading}
                  onClick={() => {
                    setIsLoading(true);
                    (async function () {
                      try {
                        let tagTX = await txn(writeContracts.MembersHub.removeTag(tag));
                        setIsLoading(false);
                        return tagTX;
                      } catch (e) {
                        console.log("error adding tag", e);
                      }
                    })(tag);
                  }}
                  disabled={isLoading}
                >
                  Remove Tag
                </Button>
              </div>
            </div>
          </Card>
        </div>
      </ContentCol>
    </ContentRow>
  );
  const manageTags = (
    <div style={{ textAlign: "center", marginTop: 40, display: "flex" }}>
      <ButtonCard
        onClick={() => {
          setTagOperation(1);
        }}
        padding={10}
        background={"#9010b7"}
        borderColor={"#9010b7"}
        width={45}
        height={45}
        fontSize={17}
        text={"Add New Tag 🏷️"}
        size={"large"}
        icon={<TagOutlined style={{ fontSize: 24 }} />}
      />
      <ButtonCard
        marginLeft={60}
        onClick={() => {
          setTagOperation(2);
        }}
        padding={10}
        background={"#1ad8d8"}
        borderColor={"#1ad8d8"}
        width={45}
        height={45}
        fontSize={17}
        text={"Remove Tag 🗑️"}
        size={"large"}
        icon={<DeleteOutlined style={{ fontSize: 24 }} />}
      />
    </div>
  );

  function switchForms() {
    let formToDisplay;
    switch (tagOperation) {
      case 1:
        formToDisplay = addTagForm;
        break;
      case 2:
        formToDisplay = removeTagForm;
        break;
      default:
        formToDisplay = manageTags;
    }
    return formToDisplay;
  }
  return (
    <CenterContent right={50} left={50}>
      <ContentRow>
        <ContentCol flex={1} alignItems={"center"}>
          {switchForms()}
        </ContentCol>
      </ContentRow>
    </CenterContent>
  );
}

export default Create;
