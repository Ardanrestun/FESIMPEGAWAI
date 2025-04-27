"use client";

import React, { useEffect, useState } from "react";
import {
  Table,
  Button,
  Modal,
  Form,
  Input,
  DatePicker,
  message,
  Switch,
  Popconfirm,
  Collapse,
  Select,
  Typography,
} from "antd";
import { PlusOutlined } from "@ant-design/icons";
import dayjs from "dayjs";
import api from "../setting/api";
import { showError, showSuccess } from "@/utils/showAlert";

const { Panel } = Collapse;
const { Text } = Typography;

const TaskCrud = () => {
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(false);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [form] = Form.useForm();
  const [editingTask, setEditingTask] = useState(null);
  const [searchText, setSearchText] = useState("");
  const [employeeOptions, setEmployeeOptions] = useState([]);
  const [selectedEmployees, setSelectedEmployees] = useState([]);
  const [assignments, setAssignments] = useState({});

  const fetchTask = async () => {
    setLoading(true);
    try {
      const res = await api.get("/api/task");
      setTasks(res.data.data);
    } catch {
      message.error("Failed to fetch tasks");
    } finally {
      setLoading(false);
    }
  };

  const fetchEmployees = async () => {
    try {
      const res = await api.get("/api/employee");
      setEmployeeOptions(res.data.data);
    } catch {
      message.error("Failed to fetch employees");
    }
  };

  const fetchAssignments = async (taskId) => {
    try {
      const res = await api.get(`/api/employee-task/${taskId}`);
      setAssignments((prev) => ({
        ...prev,
        [taskId]: res.data,
      }));
    } catch {
      message.error("Failed to fetch assignments");
    }
  };

  useEffect(() => {
    fetchTask();
    fetchEmployees();
  }, []);

  const handleEdit = (task) => {
    setEditingTask(task);
    setIsModalVisible(true);
    setTimeout(() => {
      form.setFieldsValue({
        ...task,
        due_date: task.due_date ? dayjs(task.due_date) : undefined,
        deadline_date: task.deadline_date
          ? dayjs(task.deadline_date)
          : undefined,
        status: !!task.status,
      });
    }, 0);
  };

  const handleDelete = async (id) => {
    try {
      await api.delete(`/api/task/${id}`);
      showSuccess("Task deleted");
      fetchTask();
    } catch {
      showError("Delete failed");
    }
  };

  const handleFinish = async (values) => {
    try {
      const payload = {
        ...values,
        due_date: values.due_date?.format("YYYY-MM-DD"),
        deadline_date: values.deadline_date?.format("YYYY-MM-DD"),
        status: values.status,
      };

      const url = editingTask ? `/api/task/${editingTask.id}` : "/api/task";
      const method = editingTask ? "put" : "post";
      await api[method](url, payload);
      showSuccess(`Task ${editingTask ? "updated" : "created"}`);
      setIsModalVisible(false);
      form.resetFields();
      setEditingTask(null);
      fetchTask();
    } catch (error) {
      showError("Operation failed");
    }
  };

  const handleAssignEmployees = async (taskId) => {
    try {
      await api.post(`/api/employee-task`, {
        task_id: taskId,
        employee_ids: selectedEmployees,
      });
      showSuccess("Employees assigned successfully");
      setSelectedEmployees([]);
      fetchAssignments(taskId);
    } catch (error) {
      showError("Assign failed");
    }
  };

  const handleRemoveEmployee = async (employeeTaskId, taskId) => {
    try {
      await api.delete(`/api/employee-task/${employeeTaskId}`);
      showSuccess("Employee unassigned successfully");
      fetchAssignments(taskId);
    } catch (error) {
      showError("Failed to unassign employee");
    }
  };

  const filteredTask = tasks.filter(
    (t) =>
      t.title.toLowerCase().includes(searchText.toLowerCase()) ||
      t.description.toLowerCase().includes(searchText.toLowerCase())
  );

  const employeeColumns = (taskId) => [
    {
      title: "Employee Name",
      dataIndex: ["employee", "name"],
      key: "employee_name",
    },
    {
      title: "Position",
      dataIndex: ["employee", "position"],
      key: "employee_position",
    },
    {
      title: "Hours Spent",
      dataIndex: "hours_spent",
      key: "hours_spent",
    },
    {
      title: "Hourly Rate",
      dataIndex: "hourly_rate",
      key: "hourly_rate",
    },
    {
      title: "Additional Charges",
      dataIndex: "additional_charges",
      key: "additional_charges",
    },
    {
      title: "Prorated Remuneration",
      dataIndex: "prorated_remuneration",
      key: "prorated_remuneration",
      render: (value) => `Rp ${(value || 0).toLocaleString("id-ID")}`,
    },
    {
      title: "Action",
      render: (_, record) => (
        <Popconfirm
          title="Remove this employee from task?"
          onConfirm={() => handleRemoveEmployee(record.id, taskId)}
          okText="Yes"
          cancelText="No"
        >
          <Button type="link" danger size="small">
            Remove
          </Button>
        </Popconfirm>
      ),
    },
  ];

  return (
    <div className="p-4">
      <div className="flex justify-between mb-4">
        <h2 className="text-xl font-bold">Task Management</h2>
        <div className="flex gap-2">
          <Input.Search
            placeholder="Search title or description"
            onSearch={(value) => setSearchText(value)}
            onChange={(e) => setSearchText(e.target.value)}
            style={{ width: 200 }}
            allowClear
          />
          <Button
            icon={<PlusOutlined />}
            type="primary"
            onClick={() => {
              setEditingTask(null);
              setIsModalVisible(true);
              form.resetFields();
            }}
          >
            Add Task
          </Button>
        </div>
      </div>

      <Table
        rowKey="id"
        loading={loading}
        dataSource={filteredTask}
        columns={[
          { title: "Title", dataIndex: "title" },
          { title: "Description", dataIndex: "description" },
          { title: "Due Date", dataIndex: "due_date" },
          { title: "Deadline", dataIndex: "deadline_date" },
          {
            title: "Status",
            dataIndex: "status",
            render: (value) => (value ? "Active" : "Inactive"),
          },
          {
            title: "Actions",
            render: (_, record) => (
              <>
                <Button type="link" onClick={() => handleEdit(record)}>
                  Edit
                </Button>
                <Popconfirm
                  title="Remove Task?"
                  onConfirm={() => handleDelete(record.id)}
                  okText="Yes"
                  cancelText="No"
                >
                  <Button type="link" danger>
                    Delete
                  </Button>
                </Popconfirm>
              </>
            ),
          },
        ]}
        expandable={{
          expandedRowRender: (record) => {
            const assignment = assignments[record.id] || {};
            const employees = assignment.employees || [];

            return (
              <Collapse
                onChange={(key) => {
                  if (key.length > 0 && !assignments[record.id]) {
                    fetchAssignments(record.id);
                  }
                }}
                ghost
              >
                <Panel header="View and Assign Employees" key="1">
                  <div className="mb-4">
                    <Select
                      mode="multiple"
                      allowClear
                      style={{ width: "100%" }}
                      placeholder="Select employees to assign"
                      options={employeeOptions
                        .filter(
                          (emp) =>
                            !employees.some((a) => a.employee_id === emp.id)
                        )
                        .map((emp) => ({
                          label: emp.name,
                          value: emp.id,
                        }))}
                      value={selectedEmployees}
                      onChange={(values) => setSelectedEmployees(values)}
                    />
                    <Button
                      type="primary"
                      className="mt-2"
                      onClick={() => handleAssignEmployees(record.id)}
                      disabled={!selectedEmployees.length}
                    >
                      Assign Selected Employees
                    </Button>
                  </div>

                  <Table
                    dataSource={employees}
                    columns={employeeColumns(record.id)}
                    rowKey="id"
                    pagination={false}
                    size="small"
                    summary={() => (
                      <Table.Summary.Row>
                        <Table.Summary.Cell index={0} colSpan={6}>
                          <Text strong>Total Remuneration</Text>
                        </Table.Summary.Cell>
                        <Table.Summary.Cell index={1}>
                          <Text strong>
                            {assignment.task_total_remuneration
                              ? `Rp ${assignment.task_total_remuneration.toLocaleString(
                                  "id-ID"
                                )}`
                              : "Rp 0"}
                          </Text>
                        </Table.Summary.Cell>
                      </Table.Summary.Row>
                    )}
                  />
                </Panel>
              </Collapse>
            );
          },
          onExpand: (expanded, record) => {
            if (expanded && !assignments[record.id]) {
              fetchAssignments(record.id);
            }
          },
          rowExpandable: () => true,
        }}
        pagination={{ pageSize: 5 }}
      />

      <Modal
        title={`${editingTask ? "Edit" : "Add"} Task`}
        open={isModalVisible}
        onCancel={() => {
          setIsModalVisible(false);
          setEditingTask(null);
          form.resetFields();
        }}
        onOk={() => form.submit()}
      >
        <Form form={form} layout="vertical" onFinish={handleFinish}>
          <Form.Item name="title" label="Title" rules={[{ required: true }]}>
            <Input />
          </Form.Item>
          <Form.Item
            name="description"
            label="Description"
            rules={[{ required: true }]}
          >
            <Input.TextArea rows={3} />
          </Form.Item>
          <Form.Item name="due_date" label="Due Date">
            <DatePicker style={{ width: "100%" }} />
          </Form.Item>
          <Form.Item name="deadline_date" label="Deadline">
            <DatePicker style={{ width: "100%" }} />
          </Form.Item>
          <Form.Item name="status" label="Status" valuePropName="checked">
            <Switch checkedChildren="Active" unCheckedChildren="Inactive" />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default TaskCrud;
