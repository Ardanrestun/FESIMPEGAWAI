"use client";

import { useState, useEffect } from "react";
import { Card, Table, Button, Collapse, message } from "antd";
import axios from "axios";

const { Panel } = Collapse;

const ManageTasksAndAssignments = () => {
  const [tasks, setTasks] = useState([]);
  const [assignments, setAssignments] = useState({});
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchTasks();
  }, []);

  const fetchTasks = async () => {
    setLoading(true);
    try {
      const res = await axios.get("/api/task");
      setTasks(res.data.data);
    } catch (error) {
      console.error(error);
      message.error("Failed to fetch tasks");
    } finally {
      setLoading(false);
    }
  };

  const fetchAssignments = async (taskId) => {
    try {
      const res = await axios.get(`/api/employee-task/task/${taskId}`);
      setAssignments((prev) => ({
        ...prev,
        [taskId]: res.data,
      }));
    } catch (error) {
      console.error(error);
      message.error("Failed to fetch assignments");
    }
  };

  const taskColumns = [
    {
      title: "Task Title",
      dataIndex: "title",
      key: "title",
    },
    {
      title: "Due Date",
      dataIndex: "due_date",
      key: "due_date",
      render: (date) => new Date(date).toLocaleDateString(),
    },
    {
      title: "Deadline",
      dataIndex: "deadline_date",
      key: "deadline_date",
      render: (date) => new Date(date).toLocaleDateString(),
    },
  ];

  const employeeColumns = [
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
      title: "Notes",
      dataIndex: "note",
      key: "note",
    },
  ];

  return (
    <Card
      title="Manage Tasks and Assignments"
      className="w-full max-w-6xl mx-auto my-6"
    >
      <Table
        loading={loading}
        dataSource={tasks}
        columns={taskColumns}
        rowKey="id"
        expandable={{
          expandedRowRender: (record) => (
            <Collapse
              onChange={(key) => {
                if (key.length > 0 && !assignments[record.id]) {
                  fetchAssignments(record.id);
                }
              }}
              ghost
            >
              <Panel header="View Assigned Employees" key="1">
                <Table
                  dataSource={assignments[record.id] || []}
                  columns={employeeColumns}
                  rowKey="id"
                  pagination={false}
                  size="small"
                />
              </Panel>
            </Collapse>
          ),
          rowExpandable: (record) => true,
        }}
        pagination={{ pageSize: 5 }}
      />
    </Card>
  );
};

export default ManageTasksAndAssignments;
