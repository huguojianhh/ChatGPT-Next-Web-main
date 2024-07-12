import styles from "./auth.module.scss";
import { useAccessStore } from "../store";
import { useState } from "react";
import { UploadOutlined } from "@ant-design/icons";
import type { TableColumnsType } from "antd";
import {
  Popconfirm,
  Upload,
  Table,
  Button,
  Form,
  Input,
  Select,
  Space,
  Tooltip,
  Typography,
} from "antd";
import { LockOutlined, UserOutlined } from "@ant-design/icons";
import { Checkbox } from "antd";
const { Option } = Select;

const onFinish = (values: any) => {
  console.log("Received values of form: ", values);
};

interface DataType {
  key: React.Key;
  name: string;
  age: number;
  address: string;
}

const columns: TableColumnsType<DataType> = [
  {
    title: "Name",
    dataIndex: "name",
  },
  {
    title: "Age",
    dataIndex: "age",
  },
  {
    title: "Address",
    dataIndex: "address",
  },
];

const data: DataType[] = [];
for (let i = 0; i < 46; i++) {
  data.push({
    key: i,
    name: `Edward King ${i}`,
    age: 32,
    address: `London, Park Lane no. ${i}`,
  });
}

export function AuthPage() {
  const [selectedRowKeys, setSelectedRowKeys] = useState<React.Key[]>([]);
  const [loading, setLoading] = useState(false);

  const aa = (url: any) => {
    const parsedURL = /^(\w+):\/\/([^/]+)\/(.*)$/.exec(url);
    if (!parsedURL) {
      return false;
    }
    console.log(parsedURL);
    // ["https://developer.mozilla.org/zh-CN/docs/Web/JavaScript",
    // "https", "developer.mozilla.org", "zh-CN/docs/Web/JavaScript"]

    const [, protocol, fullhost, fullpath] = parsedURL;
    return protocol;
  };

  console.log(aa("https://developer.mozilla.org/zh-CN/docs/Web/JavaScript"));
  // "https"

  function drawChart({
    size = "big",
    coords = { x: 0, y: 0 },
    radius = 25,
  } = {}) {
    console.log(size, coords, radius);
    // do some chart drawing
  }

  drawChart({
    coords: { x: 18, y: 30 },
    radius: 30,
  });

  drawChart();

  const start = () => {
    setLoading(true);
    // ajax request after empty completing
    setTimeout(() => {
      setSelectedRowKeys([]);
      setLoading(false);
    }, 1000);
  };

  const onSelectChange = (newSelectedRowKeys: React.Key[]) => {
    console.log("selectedRowKeys changed: ", newSelectedRowKeys);
    setSelectedRowKeys(newSelectedRowKeys);
  };

  const rowSelection = {
    selectedRowKeys,
    onChange: onSelectChange,
  };
  const hasSelected = selectedRowKeys.length > 0;

  return (
    <>
      <Form
        name="normal_login"
        className="login-form"
        initialValues={{ remember: true }}
        onFinish={onFinish}
      >
        <Form.Item
          name="username"
          rules={[{ required: true, message: "Please input your Username!" }]}
        >
          <Input
            prefix={<UserOutlined className="site-form-item-icon" />}
            placeholder="Username"
          />
        </Form.Item>
        <Form.Item
          name="password"
          rules={[{ required: true, message: "Please input your Password!" }]}
        >
          <Input
            prefix={<LockOutlined className="site-form-item-icon" />}
            type="password"
            placeholder="Password"
          />
        </Form.Item>
        <Form.Item>
          <Form.Item name="remember" valuePropName="checked" noStyle>
            <Checkbox>Remember me</Checkbox>
          </Form.Item>

          <a className="login-form-forgot" href="">
            Forgot password
          </a>
        </Form.Item>

        <Form.Item>
          <Button
            type="primary"
            htmlType="submit"
            className="login-form-button"
          >
            Log in
          </Button>
          Or <a href="">register now!</a>
        </Form.Item>
      </Form>

      <Form
        name="complex-form"
        onFinish={onFinish}
        labelCol={{ span: 8 }}
        wrapperCol={{ span: 16 }}
        style={{ maxWidth: 1200 }}
      >
        <Form.Item label="Username">
          <Space>
            <Form.Item
              name="username"
              noStyle
              rules={[{ required: true, message: "Username is required" }]}
            >
              <Input style={{ width: 160 }} placeholder="Please input" />
            </Form.Item>
            <Tooltip title="Useful information">
              <Typography.Link href="#API">Need Help?</Typography.Link>
            </Tooltip>
          </Space>
        </Form.Item>
        <Form.Item label="Address">
          <Space.Compact>
            <Form.Item
              name={["address", "province"]}
              noStyle
              rules={[{ required: true, message: "Province is required" }]}
            >
              <Select placeholder="Select province">
                <Option value="Zhejiang">Zhejiang</Option>
                <Option value="Jiangsu">Jiangsu</Option>
              </Select>
            </Form.Item>
            <Form.Item
              name={["address", "street"]}
              noStyle
              rules={[{ required: true, message: "Street is required" }]}
            >
              <Input style={{ width: "50%" }} placeholder="Input street" />
            </Form.Item>
          </Space.Compact>
        </Form.Item>
        <Form.Item label="BirthDate" style={{ marginBottom: 0 }}>
          <Form.Item
            name="year"
            rules={[{ required: true }]}
            style={{ display: "inline-block", width: "calc(50% - 8px)" }}
          >
            <Input placeholder="Input birth year" />
          </Form.Item>
          <Form.Item
            name="month"
            rules={[{ required: true }]}
            style={{
              display: "inline-block",
              width: "calc(50% - 8px)",
              margin: "0 8px",
            }}
          >
            <Input placeholder="Input birth month" />
          </Form.Item>
        </Form.Item>
        <Form.Item label=" " colon={false}>
          <Button type="primary" htmlType="submit">
            Submit
          </Button>
        </Form.Item>
      </Form>
      <div className={styles["auth-page"]} style={{ marginBottom: 16 }}>
        {/* <Space>
        Space
        <Button type="primary">Button</Button>
        <Upload>
          <Button icon={<UploadOutlined />}>Click to Upload</Button>
        </Upload>
        <Popconfirm title="Are you sure delete this task?" okText="Yes" cancelText="No">
          <Button>Confirm</Button>
        </Popconfirm>
      </Space>
      <Button type="primary">Button</Button> */}
        <Button
          type="primary"
          onClick={start}
          disabled={!hasSelected}
          loading={loading}
        >
          Reload
        </Button>
        <span style={{ marginLeft: 8 }}>
          {hasSelected ? `Selected ${selectedRowKeys.length} items` : ""}
        </span>
        <Table
          pagination={{ position: ["bottomCenter"] }}
          rowSelection={rowSelection}
          columns={columns}
          dataSource={data}
        />
      </div>
    </>
  );
}
