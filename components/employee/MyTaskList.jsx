"use client";

import React, { useEffect, useState } from "react";
import {
  Table,
  Input,
  InputNumber,
  Button,
  Collapse,
  Typography,
  message,
} from "antd";
import dayjs from "dayjs";
import api from "../setting/api";
import { showError, showSuccess } from "@/utils/showAlert";

const { Panel } = Collapse;
const { Text } = Typography;

const MyTaskList = () => {
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(false);
  const [assignments, setAssignments] = useState({});
  const [searchText, setSearchText] = useState("");
  const [currentUserId, setCurrentUserId] = useState(null);

  useEffect(() => {
    fetchCurrentUser();
    fetchTasks();
  }, []);

  const fetchCurrentUser = async () => {
    try {
      const res = await api.get("/api/getIdEmployee");
      setCurrentUserId(res.data.id);
    } catch (error) {
      message.error("Failed to fetch current user");
    }
  };

  const fetchTasks = async () => {
    setLoading(true);
    try {
      const res = await api.get("/api/my-tasks");
      setTasks(res.data);
    } catch (error) {
      message.error("Failed to fetch tasks");
    } finally {
      setLoading(false);
    }
  };

  const fetchAssignments = async (taskId) => {
    try {
      const res = await api.get(`/api/employee-task/${taskId}`);
      setAssignments((prev) => ({
        ...prev,
        [taskId]: res.data,
      }));
    } catch (error) {
      message.error("Failed to fetch task assignments");
    }
  };

  const handleSave = async (taskId, record) => {
    try {
      await api.put(`/api/my-tasks/${record.id}`, {
        hours_spent: record.hours_spent,
        hourly_rate: record.hourly_rate,
        additional_charges: record.additional_charges,
      });
      showSuccess("Updated successfully");
      fetchAssignments(taskId);
    } catch (error) {
      showError("Failed to update data");
    }
  };

  const handleInputChange = (taskId, recordId, field, value) => {
    setAssignments((prev) => {
      const updatedEmployees = prev[taskId]?.employees.map((emp) => {
        if (emp.id === recordId) {
          return { ...emp, [field]: value };
        }
        return emp;
      });
      return {
        ...prev,
        [taskId]: {
          ...prev[taskId],
          employees: updatedEmployees,
        },
      };
    });
  };

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
      render: (value, record) =>
        record.employee_id === currentUserId ? (
          <InputNumber
            min={0}
            value={value}
            onChange={(val) =>
              handleInputChange(taskId, record.id, "hours_spent", val)
            }
          />
        ) : (
          value
        ),
    },
    {
      title: "Hourly Rate",
      dataIndex: "hourly_rate",
      key: "hourly_rate",
      render: (value, record) =>
        record.employee_id === currentUserId ? (
          <InputNumber
            min={0}
            value={value}
            onChange={(val) =>
              handleInputChange(taskId, record.id, "hourly_rate", val)
            }
          />
        ) : (
          `Rp ${value?.toLocaleString("id-ID")}`
        ),
    },
    {
      title: "Additional Charges",
      dataIndex: "additional_charges",
      key: "additional_charges",
      render: (value, record) =>
        record.employee_id === currentUserId ? (
          <InputNumber
            min={0}
            value={value}
            onChange={(val) =>
              handleInputChange(taskId, record.id, "additional_charges", val)
            }
          />
        ) : (
          `Rp ${value?.toLocaleString("id-ID")}`
        ),
    },
    {
      title: "Prorated Remuneration",
      dataIndex: "prorated_remuneration",
      key: "prorated_remuneration",
      render: (value) => `Rp ${(value || 0).toLocaleString("id-ID")}`,
    },
    {
      title: "Action",
      key: "action",
      render: (_, record) =>
        record.employee_id === currentUserId ? (
          <Button type="link" onClick={() => handleSave(taskId, record)}>
            Save
          </Button>
        ) : null,
    },
  ];

  const filteredTasks = tasks.filter(
    (task) =>
      task.title.toLowerCase().includes(searchText.toLowerCase()) ||
      task.description.toLowerCase().includes(searchText.toLowerCase())
  );

  return (
    <div className="p-4">
      <div className="flex justify-between mb-4">
        <h2 className="text-xl font-bold">My Tasks</h2>
        <Input.Search
          placeholder="Search title or description"
          onSearch={(value) => setSearchText(value)}
          onChange={(e) => setSearchText(e.target.value)}
          style={{ width: 200 }}
          allowClear
        />
      </div>

      <Table
        rowKey="id"
        loading={loading}
        dataSource={tasks}
        pagination={{ pageSize: 5 }}
        columns={[
          { title: "Title", dataIndex: "title", key: "title" },
          {
            title: "Description",
            dataIndex: "description",
            key: "description",
          },
          {
            title: "Due Date",
            dataIndex: "due_date",
            key: "due_date",
            render: (date) => (date ? dayjs(date).format("YYYY-MM-DD") : "-"),
          },
          {
            title: "Deadline",
            dataIndex: "deadline_date",
            key: "deadline_date",
            render: (date) => (date ? dayjs(date).format("YYYY-MM-DD") : "-"),
          },
          {
            title: "Status",
            dataIndex: "is_completed",
            key: "status",
            render: (value) => (value ? "Active" : "Inactive"),
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
                <Panel header="Employee Assignment" key="1">
                  <Table
                    dataSource={employees}
                    columns={employeeColumns(record.id)}
                    rowKey="id"
                    size="small"
                    pagination={false}
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
      />
    </div>
  );
};

export default MyTaskList;
