'use client';
import React, { useEffect, useState } from 'react';
import { Layout, Menu } from 'antd';
import * as Icons from '@ant-design/icons';

import { usePathname, useRouter } from 'next/navigation';
import Link from 'next/link';
import { showSuccess } from '@/utils/showAlert';
import api from "./setting/api";

const { Sider } = Layout;
const { SubMenu } = Menu;

const getIcon = (iconName) => {
  const IconComponent = Icons[iconName];
  return IconComponent ? <IconComponent /> : null;
};

const SideNavbar = () => {
  const [menus, setMenus] = useState([]);
  const [collapsed, setCollapsed] = useState(false);
  const pathname = usePathname();
  const router = useRouter();

  useEffect(() => {
    const fetchMenu = async () => {
      try {
        const res = await api.get("/api/menurole");
        setMenus(res.data);
      } catch (err) {
        console.error("Error fetching menu:", err);
        router.push("/login");
      }
    };

    fetchMenu();
  }, []);

  const logout = async () => {
    const token = localStorage.getItem("token");
    await api.post("/api/logout");
    localStorage.removeItem("token");
    showSuccess("Logout Berhasil!");
    router.push("/login");
  };

  const getSelectedKey = () => {
    const allRoutes = [];

    menus.forEach((menu) => {
      if (menu.children?.length) {
        menu.children.forEach((child) => {
          if (child.route) {
            allRoutes.push(child.route);
          }
        });
      } else if (menu.route) {
        allRoutes.push(menu.route);
      }
    });

    const matched = allRoutes
      .filter((route) => pathname.startsWith(route))
      .sort((a, b) => b.length - a.length);

    return matched.length > 0 ? matched[0] : "";
  };

  const renderMenuItems = (items) =>
    items.map((item) => {
      if (item.children && item.children.length > 0) {
        return (
          <SubMenu
            key={item.id}
            title={
              <span>
                {item.icon && getIcon(item.icon)}
                <span>{item.name}</span>
              </span>
            }
          >
            {item.children.map((child) => (
              <Menu.Item
                key={child.route}
                icon={child.icon && getIcon(child.icon)}
              >
                <Link href={child.route}>{child.name}</Link>
              </Menu.Item>
            ))}
          </SubMenu>
        );
      }
      return (
        <Menu.Item key={item.route} icon={item.icon && getIcon(item.icon)}>
          <Link href={item.route || ""}>{item.name}</Link>
        </Menu.Item>
      );
    });

  return (
    <Sider
      collapsible
      collapsed={collapsed}
      onCollapse={(value) => setCollapsed(value)}
      width={200}
      theme="dark"
    >
      <div className="p-4 text-center font-bold">My App</div>
      <Menu
        theme="dark"
        mode="inline"
        selectedKeys={getSelectedKey()}
        defaultOpenKeys={menus
          .filter((item) =>
            item.children?.some((child) => pathname.startsWith(child.route))
          )
          .map((item) => item.id.toString())}
      >
        {renderMenuItems(menus)}
        <Menu.Item
          key="logout"
          icon={<Icons.LogoutOutlined />}
          onClick={logout}
        >
          Logout
        </Menu.Item>
      </Menu>
    </Sider>
  );
};

export default SideNavbar