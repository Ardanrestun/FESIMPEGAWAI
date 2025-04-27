"use client";

import { useState, useEffect } from "react";
import { Card, Form, Select, Button, Table, Popconfirm, message } from "antd";
import axios from "axios";
import api from "../setting/api";

const AssignTaskToEmployees = () => {
  const [tasks, setTasks] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [assignedEmployees, setAssignedEmployees] = useState([]);
  const [selectedTask, setSelectedTask] = useState(null);
  const [selectedEmployees, setSelectedEmployees] = useState([]);
  const [form] = Form.useForm();

  useEffect(() => {
    fetchTasks();
    fetchEmployees();
  }, []);

  useEffect(() => {
    if (selectedTask) {
      fetchAssignedEmployees(selectedTask);
    } else {
      setAssignedEmployees([]);
    }
  }, [selectedTask]);

  const fetchTasks = async () => {
    try {
      const res = await api.get("/api/task");
      setTasks(res.data.data);
    } catch (error) {
      console.error(error);
      message.error("Failed to fetch tasks");
    }
  };

  const fetchEmployees = async () => {
    try {
      const res = await api.get("/api/employee");
      setEmployees(res.data.data);
    } catch (error) {
      console.error(error);
      message.error("Failed to fetch employees");
    }
  };

  const fetchAssignedEmployees = async (taskId) => {
    try {
      const res = await api.get(`/api/employee-task/${taskId}`);
      setAssignedEmployees(res.data);
    } catch (error) {
      console.error(error);
      message.error("Failed to fetch assigned employees");
    }
  };

  const handleAssign = async () => {
    if (!selectedTask || selectedEmployees.length === 0) {
      message.warning("Please select employees to assign");
      return;
    }

    try {
      await api.post("api/employee-task", {
        task_id: selectedTask,
        employee_ids: selectedEmployees,
      });
      message.success("Employees assigned successfully");
      setSelectedEmployees([]);
      fetchAssignedEmployees(selectedTask);
    } catch (error) {
      console.error(error);
      message.error("Failed to assign employees");
    }
  };

  const handleRemove = async (employeeTaskId) => {
    try {
      await api.delete(`/api/employee-task/${employeeTaskId}`);
      message.success("Employee removed from task");
      fetchAssignedEmployees(selectedTask);
    } catch (error) {
      console.error(error);
      message.error("Failed to remove employee");
    }
  };

  const columns = [
    {
      title: "Employee Name",
      dataIndex: ["employee", "name"],
      key: "name",
    },
    {
      title: "Action",
      key: "action",
      render: (_, record) => (
        <Popconfirm
          title="Remove Employee?"
          onConfirm={() => handleRemove(record.id)}
          okText="Yes"
          cancelText="No"
        >
          <Button danger size="small">
            Remove
          </Button>
        </Popconfirm>
      ),
    },
  ];

  return (
    <Card
      title="Assign Task to Employees"
      className="w-full max-w-4xl mx-auto my-6"
    >
      <Form form={form} layout="vertical">
        <Form.Item label="Select Task" name="task">
          <Select
            placeholder="Select a task"
            options={tasks.map((task) => ({
              label: task.title,
              value: task.id,
            }))}
            value={selectedTask}
            onChange={(value) => {
              setSelectedTask(value);
              setSelectedEmployees([]);
            }}
          />
        </Form.Item>

        {selectedTask && (
          <>
            <Table
              dataSource={assignedEmployees}
              columns={columns}
              rowKey="id"
              pagination={false}
              className="mb-4"
            />

            <Form.Item label="Add Employees">
              <Select
                mode="multiple"
                placeholder="Select employees to add"
                options={employees.map((employee) => ({
                  label: employee.name,
                  value: employee.id,
                }))}
                value={selectedEmployees}
                onChange={setSelectedEmployees}
              />
            </Form.Item>

            <Form.Item>
              <Button
                type="primary"
                onClick={handleAssign}
                disabled={selectedEmployees.length === 0}
                className="w-full"
              >
                Assign Selected Employees
              </Button>
            </Form.Item>
          </>
        )}
      </Form>
    </Card>
  );
};

export default AssignTaskToEmployees;
