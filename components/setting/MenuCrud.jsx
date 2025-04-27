import React, { useEffect, useState } from 'react';
import { Table, Button, Modal, Form, Input, Select, message } from 'antd';
import { PlusOutlined } from '@ant-design/icons';
import api from './api';
import { showError, showSuccess } from '@/utils/showAlert';

const { Option } = Select;

const MenuCrud = () => {
    const [menus, setMenus] = useState([]);
    const [roles, setRoles] = useState([])

    const [loading, setLoading] = useState(false);
    const [isModalVisible, setIsModalVisible] = useState(false);
    const [form] = Form.useForm();
    const [editingMenu, setEditingMenu] = useState(null);
    const [searchText, setSearchText] = useState('');

    const fetchMenus = async () => {
        setLoading(true);
        try {
            const res = await api.get('/api/menu');
            setMenus(res.data.data);
        } catch {
            message.error('Failed to fetch menus');
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
        fetchMenus();
        fetchRoles();
    }, []);

    const handleEdit = (item) => {
        setEditingMenu(item);
        setIsModalVisible(true);
        setTimeout(() => form.setFieldsValue({
            ...item,
            roles: item.roles || [],
            parent_id: item.parent_id || null,
        }), 0);
    };

    const handleDelete = async (id) => {
        try {
            await api.delete(`/api/menu/${id}`);
            showSuccess('Menu deleted');
            fetchMenus();
        } catch {
            showError('Delete failed');
        }
    };

    const handleFinish = async (values) => {
        try {
            const url = editingMenu ? `/api/menu/${editingMenu.id}` : '/api/menu';
            const method = editingMenu ? 'put' : 'post';
            await api[method](url, values);
            showSuccess(`Menu ${editingMenu ? 'updated' : 'created'}`);
            setIsModalVisible(false);
            form.resetFields();
            setEditingMenu(null);
            fetchMenus();
        } catch {
            showError('Operation failed');
        }
    };

    const filteredMenus = menus.filter(menu =>
        menu.name.toLowerCase().includes(searchText.toLowerCase())
    );

    const columns = [
        { title: 'Name', dataIndex: 'name' },
        { title: 'URL', dataIndex: 'url' },
        { title: 'Icon', dataIndex: 'icon' },
        { title: 'Order', dataIndex: 'order' },
        {
            title: 'Roles',
            dataIndex: 'roles',
            render: (roles) => roles?.join(', '),
        },
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
                <h2 className="text-xl font-bold">Menu Management</h2>
                <div className="flex gap-2">
                    <Input.Search
                        placeholder="Search menus"
                        onSearch={value => setSearchText(value)}
                        onChange={e => setSearchText(e.target.value)}
                        style={{ width: 200 }}
                        allowClear
                    />
                    <Button icon={<PlusOutlined />} type="primary" onClick={() => { setEditingMenu(null); setIsModalVisible(true); }}>Add Menu</Button>
                </div>
            </div>
            <Table
                rowKey="id"
                loading={loading}
                dataSource={filteredMenus}
                columns={columns}
                pagination={{ pageSize: 5 }}
            />
            <Modal
                title={`${editingMenu ? 'Edit' : 'Add'} Menu`}
                open={isModalVisible}
                onCancel={() => { setIsModalVisible(false); setEditingMenu(null); form.resetFields(); }}
                onOk={() => form.submit()}
            >
                <Form form={form} layout="vertical" onFinish={handleFinish}>
                    <Form.Item name="name" label="Name" rules={[{ required: true }]}><Input /></Form.Item>
                    <Form.Item name="url" label="URL"><Input /></Form.Item>
                    <Form.Item name="parent_id" label="Parent Menu">
                        <Select allowClear placeholder="(Optional)">
                            {menus
                                .filter((m) => !m.parent_id)
                                .map((menu) => (
                                    <Select.Option key={menu.id} value={menu.id}>
                                        {menu.name}
                                    </Select.Option>
                                ))}

                        </Select>
                    </Form.Item>
                    <Form.Item name="icon" label="Icon"><Input /></Form.Item>
                    <Form.Item name="order" label="order"><Input /></Form.Item>
                    <Form.Item name="roles" label="Roles">
                        <Select mode="multiple" placeholder="Choose Role">
                            {roles.map((role) => (
                                <Select.Option key={role.id} value={role.name}>
                                    {role.name}
                                </Select.Option>
                            ))}
                        </Select>
                    </Form.Item>
                    

                </Form>
            </Modal>
        </div>
    );
};

export default MenuCrud;