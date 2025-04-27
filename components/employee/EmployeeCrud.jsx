import React, { useEffect, useState } from "react";
import { Table, Button, Modal, Form, Input, Select, message } from "antd";
import { PlusOutlined } from "@ant-design/icons";
import { showError, showSuccess } from "@/utils/showAlert";
import api from "../setting/api";

const { Option } = Select;

const EmployeeCrud = () => {
  const [users, setUsers] = useState([]);
  const [employee, setEmployee] = useState([]);
  const [loading, setLoading] = useState(false);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [form] = Form.useForm();
  const [editingUser, setEditingUser] = useState(null);
  const [searchText, setSearchText] = useState("");

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const res = await api.get("/api/useremployees");
      setUsers(res.data.data);
    } catch {
      message.error("Failed to fetch users");
    } finally {
      setLoading(false);
    }
  };

  const fetchEmploye = async () => {
    setLoading(true);
    try {
      const res = await api.get("/api/employee");
      setEmployee(res.data.data);
    } catch {
      message.error("Failed to fetch users");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEmploye();
    fetchUsers();
  }, []);

  const handleEdit = (item) => {
    setEditingUser(item);
    setIsModalVisible(true);
    setTimeout(() => {
      form.setFieldsValue(item);
    }, 0);
  };

  const handleDelete = async (id) => {
    try {
      await api.delete(`/api/employee/${id}`);
      showSuccess("Employee deleted");
      fetchEmploye();
    } catch {
      showError("Delete failed");
    }
  };

  const handleFinish = async (values) => {
    try {
      const url = editingUser
        ? `/api/employee/${editingUser.id}`
        : "/api/employee";
      const method = editingUser ? "put" : "post";
      await api[method](url, values);
      showSuccess(`User ${editingUser ? "updated" : "created"}`);
      setIsModalVisible(false);
      form.resetFields();
      setEditingUser(null);
      fetchEmploye();
    } catch (error) {
      showError("Operation failed");
    }
  };

  const filteredEmployee = employee.filter(
    (employees) =>
      employees.name.toLowerCase().includes(searchText.toLowerCase()) ||
      employees.position.toLowerCase().includes(searchText.toLowerCase())
  );

  const columns = [
    { title: "Name", dataIndex: "name" },
    { title: "Position", dataIndex: "position" },
    {
      title: "Actions",
      render: (_, record) => (
        <>
          <Button type="link" onClick={() => handleEdit(record)}>
            Edit
          </Button>
          <Button type="link" danger onClick={() => handleDelete(record.id)}>
            Delete
          </Button>
        </>
      ),
    },
  ];

  return (
    <div className="p-4">
      <div className="flex justify-between mb-4">
        <h2 className="text-xl font-bold">Employee Management</h2>
        <div className="flex gap-2">
          <Input.Search
            placeholder="Search employee name or position"
            onSearch={(value) => setSearchText(value)}
            onChange={(e) => setSearchText(e.target.value)}
            style={{ width: 200 }}
            allowClear
          />
          <Button
            icon={<PlusOutlined />}
            type="primary"
            onClick={() => {
              setEditingUser(null);
              setIsModalVisible(true);
            }}
          >
            Add Employee
          </Button>
        </div>
      </div>
      <Table
        rowKey="id"
        loading={loading}
        dataSource={filteredEmployee}
        columns={columns}
        pagination={{ pageSize: 5 }}
      />
      <Modal
        title={`${editingUser ? "Edit" : "Add"} Employee`}
        open={isModalVisible}
        onCancel={() => {
          setIsModalVisible(false);
          setEditingUser(null);
          form.resetFields();
        }}
        onOk={() => form.submit()}
      >
        <Form form={form} layout="vertical" onFinish={handleFinish}>
          <Form.Item name="name" label="Name" rules={[{ required: true }]}>
            <Input />
          </Form.Item>
          <Form.Item
            name="position"
            label="Position"
            rules={[{ required: true }]}
          >
            <Input />
          </Form.Item>

          <Form.Item name="user_id" label="User " rules={[{ required: true }]}>
            <Select placeholder="Select User">
              {users.map((user) => (
                <Option key={user.id} value={user.id}>
                  {user.name}
                </Option>
              ))}
            </Select>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default EmployeeCrud;
