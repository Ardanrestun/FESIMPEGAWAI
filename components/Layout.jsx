'use client';
import { Layout, Menu, notification } from 'antd';
import {
  UserOutlined,
  DashboardOutlined,
  LogoutOutlined,
} from '@ant-design/icons';
import { useRouter, usePathname } from 'next/navigation';
import { useEffect, useState } from 'react';
import axios from 'axios';
import { showError, showSuccess } from '@/utils/showAlert';
import SideNavbar from './SideNavbar';
const { Header, Content, Footer, Sider } = Layout;


const AppLayout = ({ children }) => {
  const router = useRouter();
  const pathname = usePathname();


  const publicRoute = '/login';

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token && pathname !== publicRoute) {
      showError('Access Denied')
      router.push('/login');
    };
    if (token && pathname === publicRoute) {
      router.push('/');
    }
  }, [pathname]);


  if (pathname === '/login') {
    return <>{children}</>;
  }

  return (
    <Layout style={{ minHeight: '100vh' }}>
      <SideNavbar />
      <Layout>
        <Header className="bg-white px-4 shadow" />
        <Content className="m-4 p-4 bg-white rounded shadow">{children}</Content>
        <Footer style={{ textAlign: 'center' }}>MyApp ©2025</Footer>
      </Layout>
    </Layout>
  );




}

export default AppLayout