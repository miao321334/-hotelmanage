import Link from 'next/link';
import { useRouter } from 'next/router';
import { useEffect, useState } from 'react';
import { logout, getUser } from '../lib/auth';
import { User } from '../types';
import { Layout, Menu, Button, Typography, Avatar, Dropdown, Space } from 'antd';
import {
  LogoutOutlined,
  HomeOutlined,
  PlusOutlined,
  AuditOutlined,
  UnorderedListOutlined,
} from '@ant-design/icons';

const { Header, Sider, Content } = Layout;
const { Title } = Typography;

export default function MainLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [collapsed, setCollapsed] = useState(false);

  useEffect(() => {
    setUser(getUser());
  }, []);

  const handleLogout = () => {
    logout();
  };

  // 菜单配置
  const menuItems = [];
  if (user?.role === 'merchant') {
    menuItems.push(
      {
        key: '/merchant/hotels',
        icon: <HomeOutlined />,
        label: <Link href="/merchant/hotels">我的酒店</Link>,
      },
      {
        key: '/merchant/hotels/new',
        icon: <PlusOutlined />,
        label: <Link href="/merchant/hotels/new">新增酒店</Link>,
      },
    );
  }

  if (user?.role === 'admin') {
    menuItems.push(
      {
        key: '/admin/audits',
        icon: <AuditOutlined />,
        label: <Link href="/admin/audits">待审核酒店</Link>,
      },
      {
        key: '/admin/hotels',
        icon: <UnorderedListOutlined />,
        label: <Link href="/admin/hotels">所有酒店</Link>,
      }
    );
  }

  // 用户下拉菜单
  const userMenu = [
    {
      key: 'logout',
      icon: <LogoutOutlined />,
      label: <Button type="text" onClick={handleLogout}>退出登录</Button>,
    },
  ];

  return (
    <Layout style={{ minHeight: '100vh' }}>
      <Sider
        collapsible
        collapsed={collapsed}
        onCollapse={setCollapsed}
        theme="dark"
      >
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '20px 16px',
          borderBottom: '1px solid #303030'
        }}>
          <Space align="center">
            <img src="/易宿平台logo.png" alt="logo" width={32} height={32} />
            {!collapsed && <Title level={4} style={{ color: '#fff', margin: 0 }}>易宿酒店管理</Title>}
          </Space>
        </div>
        <Menu
          theme="dark"
          mode="inline"
          selectedKeys={[router.pathname]}
          items={menuItems}
          style={{ borderRight: 'none' }}
        />
      </Sider>
      <Layout>
        <Header style={{
          background: 'white',
          padding: '0 24px',
          display: 'flex',
          justifyContent: 'flex-end',
          alignItems: 'center'
        }}>
          {user && (
            <Space>
              <span style={{ marginRight: 8 }}>欢迎, {user.name}</span>
              <Dropdown menu={{ items: userMenu }} placement="bottomRight">
                <Button type="text" icon={<Avatar>{user.name.charAt(0)}</Avatar>} />
              </Dropdown>
            </Space>
          )}
        </Header>
        <Content style={{ margin: '24px 16px', padding: 24, background: '#fff', minHeight: 280 }}>
          {children}
        </Content>
      </Layout>
    </Layout>
  );
}