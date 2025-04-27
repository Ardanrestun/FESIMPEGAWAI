import React, { useEffect, useState } from 'react';
import { Table, Button, Modal, Form, Input, Select, message } from 'antd';
import { PlusOutlined } from "@ant-design/icons";
import api from './api';
import { showError, showSuccess } from '@/utils/showAlert';

const { Option } = Select;

const UserCrud = () => {
    const [users, setUsers] = useState([]);
    const [roles, setRoles] = useState([]);
    const [loading, setLoading] = useState(false);
    const [isModalVisible, setIsModalVisible] = useState(false);
    const [form] = Form.useForm();
    const [editingUser, setEditingUser] = useState(null);
    const [searchText, setSearchText] = useState('');


    const fetchUsers = async () => {
        setLoading(true);
        try {
            const res = await api.get('/api/user');
            setUsers(res.data.data);
        } catch {
            message.error('Failed to fetch users');
        } finally {
            setLoading(false);
        }
    };

    const fetchRoles = async () => {
        try {
            const res = await api.get('/api/role');
            setRoles(res.data.data);
        } catch {
            message.error('Failed to fetch roles');
        }
    };

    useEffect(() => {
        fetchUsers();
        fetchRoles();
    }, []);

    const handleEdit = (item) => {
        setEditingUser(item);
        setIsModalVisible(true);
        setTimeout(() => {
            form.setFieldsValue({ ...item, role_id: item.role?.id });
        }, 0);
    };

    const handleDelete = async (id) => {
        try {
            await api.delete(`/api/user/${id}`);
            showSuccess('User deleted');
            fetchUsers();
        } catch {
            showError('Delete failed');
        }
    };

    const handleFinish = async (values) => {
        try {
            const url = editingUser ? `/api/user/${editingUser.id}` : '/api/user';
            const method = editingUser ? 'put' : 'post';
            await api[method](url, values);
            showSuccess(`User ${editingUser ? 'updated' : 'created'}`)
            setIsModalVisible(false);
            form.resetFields();
            setEditingUser(null);
            fetchUsers();
        } catch {
            showError('Operation failed');
        }
    };

    const filteredUsers = users.filter(user =>
        user.name.toLowerCase().includes(searchText.toLowerCase()) ||
        user.email.toLowerCase().includes(searchText.toLowerCase())
    );

    const columns = [
        { title: 'Name', dataIndex: 'name' },
        { title: 'Email', dataIndex: 'email' },
        { title: 'Role', dataIndex: ['role', 'name'] },
        {
            title: 'Actions',
            render: (_, record) => (
                <>
                    <Button type="link" onClick={() => handleEdit(record)}>Edit</Button>
                    <Button type="link" danger onClick={() => handleDelete(record.id)}>Delete</Button>
                </>
            )
        }
    ];

    return (
        <div className="p-4">
            <div className="flex justify-between mb-4">
                <h2 className="text-xl font-bold">User Management</h2>
                <div className="flex gap-2">
                    <Input.Search
                        placeholder="Search users"
                        onSearch={value => setSearchText(value)}
                        onChange={e => setSearchText(e.target.value)}
                        style={{ width: 200 }}
                        allowClear
                    />
                    <Button icon={<PlusOutlined />} type="primary" onClick={() => { setEditingUser(null); setIsModalVisible(true); }}>Add User</Button>
                </div>
            </div>
            <Table
                rowKey="id"
                loading={loading}
                dataSource={filteredUsers}
                columns={columns}
                pagination={{ pageSize: 5 }}
            />
            <Modal
                title={`${editingUser ? 'Edit' : 'Add'} User`}
                open={isModalVisible}
                onCancel={() => { setIsModalVisible(false); setEditingUser(null); form.resetFields(); }}
                onOk={() => form.submit()}
            >
                <Form form={form} layout="vertical" onFinish={handleFinish}>
                    <Form.Item name="name" label="Name" rules={[{ required: true }]}><Input /></Form.Item>
                    <Form.Item name="email" label="Email" rules={[{ required: true }]}><Input /></Form.Item>
                    {editingUser ? <Form.Item name="password" label="Password" rules={[{ required: true, type: 'password' }]}>
                        <Input.Password />
                    </Form.Item> :
                        <Form.Item name="password" label="Password" rules={[{ required: true, type: 'password' }]}>
                            <Input.Password />
                        </Form.Item>
                    }
                    <Form.Item name="role_id" label="Role" rules={[{ required: true }]}>
                        <Select placeholder="Select role">
                            {roles.map(role => <Option key={role.id} value={role.id}>{role.name}</Option>)}
                        </Select>
                    </Form.Item>
                </Form>
            </Modal>
        </div>
    );
};

export default UserCrud;