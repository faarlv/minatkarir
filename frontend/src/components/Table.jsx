import { useEffect, useState } from "react";
import { axiosInstance } from "../lib/axios";
import { MinusCircleOutlined, PlusOutlined } from "@ant-design/icons";
import {
  Table,
  Button,
  Modal,
  Form,
  Input,
  Select,
  Space,
  Radio,
  message,
} from "antd";
import { DeleteOutlined, EditOutlined } from "@ant-design/icons";
import "../style/table.css";

const { Option } = Select;

const TableList = ({ onAdd }) => {
  const options = [{ value: "Minatkarir", label: "Minat Karir Test" }];

  return (
    <div className="table-list">
      <h4 style={{ width: 90 }}>Daftar Isi</h4>
      <div className="container-list">
        <Select
          defaultValue={"Minat Karir"}
          options={options}
          style={{ width: 200 }}
        />
        <Button type="primary" htmlType="submit" onClick={onAdd}>
          Tambah Soal
        </Button>
      </div>
    </div>
  );
};

export default function CustomTable() {
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [editingRecord, setEditingRecord] = useState(null);
  const [isEditMode, setIsEditMode] = useState(false);
  const [soal, setSoal] = useState([]);

  const [form] = Form.useForm();

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setTimeout(async () => {
        const response = await axiosInstance.get(
          "http://localhost:5000/Minatkarir"
        );
        setSoal(response.data);
      }, 1500);
    } catch (error) {
      console.error("Error fetching data:", error);
    }
  };

  const showAddModal = () => {
    setIsEditMode(false);
    form.resetFields();
    setIsModalVisible(true);
  };
  const showEditModal = (record) => {
    setIsEditMode(true);
    setEditingRecord(record);
    form.setFieldsValue({
      ...record,
      waktu: record.waktu.toString(), // Convert number to string for form input
    });
    setIsModalVisible(true);
  };

  const handleSubmit = (values) => {
    if (isEditMode) {
      handleEdit(values);
    } else {
      handleAddQuestion(values);
    }
  };

  const deleteRow = async (id) => {
    try {
      await axiosInstance.delete(`http://localhost:5000/Minatkarir/${id}`);
      fetchData();
    } catch (error) {
      console.error("Error deleting data:", error);
    }
  };

  const handleEdit = async (values) => {
    try {
      const response = await axiosInstance.put(
        `http://localhost:5000/Minatkarir/${editingRecord._id}`,
        values
      );
      if (response.status === 200) {
        message.success("Question updated successfully!");
        setIsModalVisible(false);
        fetchData();
        // Optionally, refresh your data here
      }
    } catch (error) {
      message.error(
        `Failed to update question. ${
          error.response?.data?.message || "Please try again."
        }`
      );
      console.error("Error updating row:", error);
    }
  };

  //render

  const renderCheckboxes = (options) => {
    return (
      <Radio.Group>
        {options.map((option, index) => (
          <Radio key={index} value={option} disabled={true}>
            {option}
          </Radio>
        ))}
      </Radio.Group>
    );
  };

  const handleCancel = () => {
    setIsModalVisible(false);
    form.resetFields();
  };

  const handleAddQuestion = async (values) => {
    try {
      await axiosInstance.post("http://localhost:5000/Minatkarir", values);
      fetchData();
      setIsModalVisible(false);
      form.resetFields();
    } catch (error) {
      console.error("Error adding data:", error);
    }
  };

  const columns = [
    {
      title: "Halaman",
      dataIndex: "page",
      key: "page",
      align: "center",
      width: 50,
    },
    {
      title: "Soal",
      dataIndex: "soal_pertanyaan",
      key: "_id",
      align: "center",
      width: 500,
    },
    {
      title: "pilihan Jawaban",
      key: "_id",
      dataIndex: "pilihan_jawaban",
      align: "center",
      render: renderCheckboxes,
    },
    {
      title: "Minat Karir Tipe",
      dataIndex: "tipe_soal",
      key: "_id",
      align: "center",
      width: 150,
    },
    {
      title: "Waktu (Detik)",
      dataIndex: "waktu",
      key: "_id",
      align: "center",
      width: 70,
    },
    {
      title: "Action",
      key: "action",
      render: (text, record) => (
        <>
          <Button
            icon={<DeleteOutlined />}
            onClick={() => deleteRow(record._id)}
          >
            Delete
          </Button>
          <Button icon={<EditOutlined />} onClick={() => showEditModal(record)}>
            Edit
          </Button>
        </>
      ),
      align: "center",
    },
  ];

  return (
    <div className="table-container">
      <TableList onAdd={showAddModal} />
      <Table
        columns={columns}
        dataSource={soal}
        rowKey="id"
        pagination={{ pageSize: 10 }}
        bordered
      />
      <Modal
        title="Tambah Soal"
        visible={isModalVisible}
        onCancel={handleCancel}
        footer={null}
      >
        <Form form={form} layout="vertical" onFinish={handleSubmit}>
          <Form.Item
            name="page"
            label="Halaman"
            rules={[
              { required: true, message: "Please input the page number!" },
            ]}
          >
            <Input />
          </Form.Item>
          <Form.Item
            name="soal_pertanyaan"
            label="Soal"
            rules={[{ required: true, message: "Please input the question!" }]}
          >
            <Input />
          </Form.Item>

          <Form.List name="pilihan_jawaban">
            {(fields, { add, remove }) => (
              <>
                {fields.map(({ key, name, fieldKey, ...restField }) => (
                  <Space
                    key={key}
                    style={{ display: "flex", marginBottom: 8 }}
                    align="baseline"
                  >
                    <Form.Item
                      {...restField}
                      name={[name]}
                      fieldKey={[fieldKey]}
                      rules={[
                        { required: true, message: "Missing answer option" },
                      ]}
                    >
                      <Input placeholder="Answer option" />
                    </Form.Item>
                    <MinusCircleOutlined onClick={() => remove(name)} />
                  </Space>
                ))}
                <Form.Item>
                  <Button
                    type="dashed"
                    onClick={() => add()}
                    block
                    icon={<PlusOutlined />}
                  >
                    Add Answer Option
                  </Button>
                </Form.Item>
              </>
            )}
          </Form.List>

          <Form.Item
            name="tipe_soal"
            label="Minat Karir Tipe"
            rules={[
              {
                required: true,
                message: "Please select the career interest type!",
              },
            ]}
          >
            <Select placeholder="Select a career interest type">
              <Option value="realistic">Realistic</Option>
              <Option value="artistic">Artistic</Option>
              <Option value="enterpreneur">Enterpreneur</Option>
              <Option value="investigative">Investigative</Option>
              <Option value="social">Social</Option>
              <Option value="conventional">Conventional</Option>
            </Select>
          </Form.Item>
          <Form.Item
            name="waktu"
            label="Waktu (Detik)"
            rules={[
              { required: true, message: "Please input the time in seconds!" },
            ]}
          >
            <Input />
          </Form.Item>
          <Form.Item>
            <Button type="primary" htmlType="submit">
              Tambah
            </Button>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
}
