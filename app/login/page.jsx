'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Cookies from 'js-cookie'
import { Form, Input, Button, Card, message, notification } from 'antd';
import axios from 'axios';
import { showSuccess, showError } from '@/utils/showAlert';

export default function Login() {
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const [form] = Form.useForm();
  const [token, setToken] = useState('');



  const onFinish = async (values) => {
    setLoading(true);


    const formData = new FormData();

    formData.append('email', values.email);
    formData.append('password', values.password);



    try {
      const url = `${process.env.NEXT_PUBLIC_API_URL}/login`;
      const method = axios.post;

      await method(url, formData)
        .then((response) => {
          setToken(response.data.token);
          localStorage.setItem("token", response.data.token);
          Cookies.set("role", response.data.user.role, { expires: 1 });
          Cookies.set("menus", JSON.stringify(response.data.user.menus), {
            expires: 1,
          });

          showSuccess("Login Berhasil", "Selamat Datang Kembali!");
          router.push("/");
        })
        .catch((error) => {
          const message =
            error?.response?.data?.message || "Terjadi kesalahan saat login.";
          showError("Login Gagal", message);
        });
    } catch (err) {
      message.error('Login gagal');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100">
      <Card title="Login" className="w-96">
        <Form layout="vertical" onFinish={onFinish}>
          <Form.Item label="Email" name="email" rules={[{ required: true }]}>
            <Input />
          </Form.Item>
          <Form.Item label="Password" name="password" rules={[{ required: true }]}>
            <Input.Password />
          </Form.Item>
          <Form.Item>
            <Button type="primary" htmlType="submit" loading={loading} block>
              Login
            </Button>
          </Form.Item>
        </Form>
      </Card>
    </div>
  );
}