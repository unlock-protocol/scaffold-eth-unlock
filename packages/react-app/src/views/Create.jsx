// import { useContractReader } from "eth-hooks";
// import { QuestionCircleOutlined, LikeOutlined, MessageOutlined, StarOutlined } from "@ant-design/icons";
// import { Link } from "react-router-dom";
// import { ethImg, mhLogo, searchImg } from "../img";
import React, { useEffect, useRef, useState } from "react";
import { ethers } from "ethers";
// import { Image, Avatar, Button, List, Skeleton, Space, Divider } from "antd";
import { PlusOutlined, PlusCircleOutlined } from "@ant-design/icons";
import {
  Input,
  Tag,
  Button,
  Space,
  Typography,
  Form,
  Radio,
  Select,
  Cascader,
  DatePicker,
  InputNumber,
  TreeSelect,
  Switch,
  Checkbox,
  Upload,
} from "antd";
// import { TweenOneGroup } from "rc-tween-one";
import { CenterContent, ContentRow, ContentCol } from "../components";

const { Title } = Typography;
const { RangePicker } = DatePicker;
const { TextArea } = Input;

function Create({ address, loadWeb3Modal, userSigner }) {
  const [creating, setCreating] = useState(false);

  const [componentDisabled, setComponentDisabled] = useState(true);

  //   const onFinish = fieldsValue => {
  //     // Should format date value before submit.
  //     const rangeValue = fieldsValue["range-picker"];
  //     const rangeTimeValue = fieldsValue["range-time-picker"];
  //     const values = {
  //       ...fieldsValue,
  //       fieldsValue,
  //       "date-picker": fieldsValue["date-picker"].format("YYYY-MM-DD"),
  //       "input-number": fieldsValue["input-number"],
  //       "select": fieldsValue["select"],
  //       "text-area": fieldsValue["text-area"],
  //   "range-time-picker": [
  //     rangeTimeValue[0].format("YYYY-MM-DD HH:mm:ss"),
  //     rangeTimeValue[1].format("YYYY-MM-DD HH:mm:ss"),
  //   ],
  //   "time-picker": fieldsValue["time-picker"].format("HH:mm:ss"),
  //     };
  //     console.log("Received values of form: ", fieldsValue);
  //   };

  const onFinish = values => {
    console.log("Received values of form: ", values);
  };

  const onValuesChange = ({ value }) => {
    // setComponentDisabled(disabled);
    console.log(value);
  };

  const normFile = e => {
    console.log("Upload event:", e);

    if (Array.isArray(e)) {
      return e;
    }

    return e?.fileList;
  };

  const createMembershipButton = (
    <div style={{ textAlign: "center", marginTop: 40 }}>
      <Button
        onClick={() => {
          setCreating(true);
        }}
        type="primary"
        shape="circle"
        icon={<PlusOutlined />}
        size={"large"}
      />
      <p style={{ marginTop: 15, fontWeight: 300 }}>Create Membership</p>
    </div>
  );

  const createMembershipForm = (
    <div>
      <Title level={3} style={{ textAlign: "center", marginBottom: 30 }}>
        Broadcast Community / Membership
      </Title>
      {/* <Checkbox checked={componentDisabled} onChange={e => setComponentDisabled(e.target.checked)}>
        Form disabled
      </Checkbox> */}
      <Form
        labelCol={{
          span: 4,
        }}
        wrapperCol={{
          span: 14,
        }}
        layout="horizontal"
        onValuesChange={onValuesChange}
        onFinish={onFinish}
        // disabled={componentDisabled}
      >
        <Form.Item name="upload" label="Upload" valuePropName="fileList" getValueFromEvent={normFile}>
          <Upload name="logo" action="/upload.do" listType="picture-card">
            <div>
              <PlusOutlined />
              <div
                style={{
                  marginTop: 8,
                }}
              >
                Image
              </div>
            </div>
          </Upload>
        </Form.Item>
        {/* <Form.Item label="Radio">
          <Radio.Group>
            <Radio value="apple"> Apple </Radio>
            <Radio value="pear"> Pear </Radio>
          </Radio.Group>
        </Form.Item> */}
        <Form.Item name="input" label="Name">
          <Input />
        </Form.Item>
        <Form.Item name="text-area" label="Description">
          <TextArea rows={4} />
        </Form.Item>
        <Form.Item name="select" label="Select">
          <Select>
            <Select.Option value="demo">Demo</Select.Option>
          </Select>
        </Form.Item>
        <Form.Item name="switch" label="Token gated" valuePropName="checked">
          <Switch />
        </Form.Item>
        <Form.Item name="date-picker" label="DatePicker">
          <DatePicker />
        </Form.Item>
        <Form.Item name="input-number" label="InputNumber">
          <InputNumber />
        </Form.Item>
        <Form.Item label=" " colon={false}>
          <Button htmlType="submit">Broadcast</Button>
        </Form.Item>
      </Form>
    </div>
  );

  return (
    <CenterContent right={50} left={50}>
      <ContentRow>
        <ContentCol flex={1}>
          <div className="mh-dashboard-content">{!creating ? createMembershipButton : createMembershipForm}</div>
        </ContentCol>
      </ContentRow>
    </CenterContent>
  );
}

export default Create;
