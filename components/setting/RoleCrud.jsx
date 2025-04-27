import React, { useEffect, useState } from 'react';
import { Table, Button, Modal, Form, Input, message } from 'antd';
import { PlusOutlined } from '@ant-design/icons';
import api from './api';
import { showError, showSuccess } from '@/utils/showAlert';

const RoleCrud = () => {
  const [roles, setRoles] = useState([]);
  const [loading, setLoading] = useState(false);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [form] = Form.useForm();
  const [editingRole, setEditingRole] = useState(null);
  const [searchText, setSearchText] = useState('');

  const fetchRoles = async () => {
    setLoading(true);
    try {
      const res = await api.get('/api/role');
      setRoles(res.data.data);
    } catch {
      message.error('Failed to fetch roles');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRoles();
  }, []);

  const handleEdit = (item) => {
    setEditingRole(item);
    setIsModalVisible(true);
    setTimeout(() => form.setFieldsValue(item), 0);
  };

  const handleDelete = async (id) => {
    try {
      await api.delete(`/api/role/${id}`);
      showSuccess('Role deleted');
      fetchRoles();
    } catch {
      showError('Delete failed');
    }
  };

  const handleFinish = async (values) => {
    try {
      const url = editingRole ? `/api/role/${editingRole.id}` : '/api/role';
      const method = editingRole ? 'put' : 'post';
      await api[method](url, values);
      showSuccess(`Role ${editingRole ? 'updated' : 'created'}`);
      setIsModalVisible(false);
      form.resetFields();
      setEditingRole(null);
      fetchRoles();
    } catch {
      showError('Operation failed');
    }
  };

  const filteredRoles = roles.filter(role =>
    role.name.toLowerCase().includes(searchText.toLowerCase())
  );

  const columns = [
    { title: 'Name', dataIndex: 'name' },
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
        <h2 className="text-xl font-bold">Role Management</h2>
        <div className="flex gap-2">
          <Input.Search
            placeholder="Search roles"
            onSearch={value => setSearchText(value)}
            onChange={e => setSearchText(e.target.value)}
            style={{ width: 200 }}
            allowClear
          />
          <Button icon={<PlusOutlined />} type="primary" onClick={() => { setEditingRole(null); setIsModalVisible(true); }}>Add Role</Button>
        </div>
      </div>
      <Table
        rowKey="id"
        loading={loading}
        dataSource={filteredRoles}
        columns={columns}
        pagination={{ pageSize: 5 }}
      />
      <Modal
        title={`${editingRole ? 'Edit' : 'Add'} Role`}
        open={isModalVisible}
        onCancel={() => { setIsModalVisible(false); setEditingRole(null); form.resetFields(); }}
        onOk={() => form.submit()}
      >
        <Form form={form} layout="vertical" onFinish={handleFinish}>
          <Form.Item name="name" label="Name" rules={[{ required: true }]}><Input /></Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default RoleCrud;