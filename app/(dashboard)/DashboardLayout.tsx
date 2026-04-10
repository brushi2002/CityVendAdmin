'use client';

import { useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { Layout, Menu, Dropdown, Button, theme } from 'antd';
import {
  ShopOutlined,
  UserOutlined,
  DeleteOutlined,
  LogoutOutlined,
  SettingOutlined,
  MenuFoldOutlined,
  MenuUnfoldOutlined,
} from '@ant-design/icons';
import Link from 'next/link';
import { logout } from '../actions';

const { Header, Sider, Content } = Layout;

export default function DashboardLayout({ children, email }: { children: React.ReactNode; email: string }) {
  const [collapsed, setCollapsed] = useState(false);
  const router = useRouter();
  const pathname = usePathname();
  const { token: themeToken } = theme.useToken();

  const selectedKey =
    pathname.startsWith('/deleted-businesses') ? 'deleted-businesses' :
    pathname.startsWith('/users') ? 'users' :
    pathname.startsWith('/business') ? 'business' : '';

  const handleLogout = async () => {
    await logout();
  };

  const userMenuItems = [
    {
      key: 'change-password',
      icon: <SettingOutlined />,
      label: 'Change Password',
      onClick: () => router.push('/settings'),
    },
    {
      key: 'logout',
      icon: <LogoutOutlined />,
      label: 'Logout',
      onClick: handleLogout,
    },
  ];

  return (
    <Layout style={{ minHeight: '100vh' }}>
      <Sider trigger={null} collapsible collapsed={collapsed}>
        <div style={{
          height: 48,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: 'rgba(255,255,255,0.65)',
          fontSize: 12,
          textTransform: 'uppercase',
          letterSpacing: '1px',
          borderBottom: '1px solid rgba(255,255,255,0.1)',
        }}>
          {collapsed ? '' : 'Navigation'}
        </div>
        <Menu
          theme="dark"
          mode="inline"
          selectedKeys={[selectedKey]}
          items={[
            {
              key: 'business',
              icon: <ShopOutlined />,
              label: <Link href="/business">Business</Link>,
            },
            {
              key: 'deleted-businesses',
              icon: <DeleteOutlined />,
              label: <Link href="/deleted-businesses">Deleted Businesses</Link>,
            },
            {
              key: 'users',
              icon: <UserOutlined />,
              label: <Link href="/users">Users</Link>,
            },
          ]}
        />
      </Sider>
      <Layout>
        <Header style={{
          padding: '0 24px',
          background: themeToken.colorBgContainer,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          borderBottom: '1px solid #f0f0f0',
          boxShadow: '0 1px 4px rgba(0,0,0,0.04)',
        }}>
          <Button
            type="text"
            icon={collapsed ? <MenuUnfoldOutlined /> : <MenuFoldOutlined />}
            onClick={() => setCollapsed(!collapsed)}
          />
          <Dropdown menu={{ items: userMenuItems }} placement="bottomRight">
            <Button type="text" icon={<UserOutlined />}>
              {email}
            </Button>
          </Dropdown>
        </Header>
        <Content style={{ margin: 24, padding: 24, background: themeToken.colorBgContainer, borderRadius: 8 }}>
          {children}
        </Content>
      </Layout>
    </Layout>
  );
}
