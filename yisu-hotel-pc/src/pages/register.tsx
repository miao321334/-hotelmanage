import { useState } from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';
import { register } from '../lib/api';
import { setToken, setUser } from '../lib/auth';
import {
  Form, Input, Button, Card, Typography,
  Layout, Alert, Space, Radio
} from 'antd';
import { UserOutlined, LockOutlined, MailOutlined } from '@ant-design/icons';

const { Title } = Typography;
const { Content } = Layout;

export default function Register() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [form] = Form.useForm();

  const handleSubmit = async (values: {
    name: string;
    email: string;
    password: string;
    role: 'merchant' | 'admin'
  }) => {
    setLoading(true);
    setError('');
    try {
      const data = await register(values);
      setToken(data.token);
      setUser(data.user);
      // 根据角色跳转到对应页面
      if (values.role === 'merchant') {
        router.push('/merchant/hotels');
      } else {
        router.push('/admin/audits');
      }
    } catch (err: any) {
      setError(err.response?.data?.message || '注册失败，请检查信息');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Layout style={{ minHeight: '100vh', background: '#fafafa' }}>
      <Content style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '50px 0'
      }}>
        <Card
          style={{ width: 400, boxShadow: '0 8px 24px rgba(0,0,0,0.12)' }}
          title={<Title level={2} style={{ textAlign: 'center' }}>易宿酒店管理系统</Title>}
        >
          <Title level={4} style={{ marginBottom: 24, textAlign: 'center' }}>注册</Title>

          {error && (
            <Alert
              message={error}
              type="error"
              showIcon
              style={{ marginBottom: 16 }}
            />
          )}

          <Form
            form={form}
            name="register"
            onFinish={handleSubmit}
            layout="vertical"
            initialValues={{ role: 'merchant' }} // 默认选择商户
          >
            <Form.Item
              name="name"
              rules={[{ required: true, message: '请输入姓名!' }]}
              label="姓名"
            >
              <Input
                prefix={<UserOutlined className="site-form-item-icon" />}
                placeholder="请输入您的姓名"
              />
            </Form.Item>

            <Form.Item
              name="email"
              rules={[
                { required: true, message: '请输入邮箱!' },
                { type: 'email', message: '请输入有效的邮箱!' }
              ]}
              label="邮箱"
            >
              <Input
                prefix={<MailOutlined className="site-form-item-icon" />}
                placeholder="请输入您的邮箱"
                autoComplete="email"
              />
            </Form.Item>

            <Form.Item
              name="password"
              rules={[
                { required: true, message: '请输入密码!' },
                { min: 6, message: '密码长度不能少于6位!' }
              ]}
              label="密码"
            >
              <Input.Password
                prefix={<LockOutlined className="site-form-item-icon" />}
                placeholder="请输入密码"
                autoComplete="new-password"
              />
            </Form.Item>

            {/* 新增：角色选择（商户/管理员） */}
            <Form.Item
              name="role"
              rules={[{ required: true, message: '请选择身份类型!' }]}
              label="身份类型"
            >
              <Radio.Group buttonStyle="solid">
                <Radio.Button value="merchant">
                  商户
                </Radio.Button>
                <Radio.Button value="admin">
                  管理员
                </Radio.Button>
              </Radio.Group>
            </Form.Item>

            <Form.Item>
              <Button
                type="primary"
                htmlType="submit"
                loading={loading}
                block
                size="large"
              >
                注册
              </Button>
            </Form.Item>
          </Form>

          <Space style={{ display: 'flex', justifyContent: 'center' }}>
            <span>已有账号？</span>
            <Link href="/login">
              <Button type="text">立即登录</Button>
            </Link>
          </Space>
        </Card>
      </Content>
    </Layout>
  );
}