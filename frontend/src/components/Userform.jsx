import { Button, Form, Input, message, Table, Radio } from "antd";
import { useState, useEffect } from "react";
import "../style/userform.css";
import { axiosInstance } from "../lib/axios";

const Formuser = () => {
  const [form] = Form.useForm();
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [soal, setSoal] = useState([]);
  const [currentPage, setCurrentPage] = useState(0);
  const [userAnswers, setUserAnswers] = useState({});
  const [timeLeft, setTimeLeft] = useState(7);
  const [points, setPoints] = useState(null);
  const [highestScoreTipeSoal, setHighestScoreTipeSoal] = useState(null); // State to store the highest scoring tipe_soal
  const [showDetailedScores, setShowDetailedScores] = useState(false); // State to toggle detailed scores visibility
  const pageSize = 5;

  const countdownTime = 7;
  const timerInterval = 1000;

  const cektoken = ({ token }) => {
    if (token === "admin") {
      message.success("Berhasil masuk");
      setIsAuthenticated(true);
      fetchData();
    } else {
      message.error("Token salah");
      form.resetFields();
    }
  };

  const fetchData = async () => {
    try {
      const response = await axiosInstance.get(
        "http://localhost:5000/Minatkarir"
      );
      setSoal(response.data);
    } catch (error) {
      console.error("Error fetching data:", error);
    }
  };

  const handleOptionChange = (questionId, value) => {
    setUserAnswers((prevAnswers) => {
      const updatedAnswers = {
        ...prevAnswers,
        [questionId]: value,
      };
      return updatedAnswers;
    });
  };

  const renderCheckboxes = (options, questionId) => {
    return (
      <Radio.Group
        onChange={(e) => handleOptionChange(questionId, e.target.value)}
        value={userAnswers[questionId]}
      >
        {options.map((option, index) => (
          <Radio key={index} value={option}>
            {option}
          </Radio>
        ))}
      </Radio.Group>
    );
  };

  useEffect(() => {
    if (isAuthenticated) {
      const interval = setInterval(() => {
        setTimeLeft((prevTime) => {
          if (prevTime === 1) {
            setCurrentPage((prevPage) => {
              const nextPage = prevPage + 1;
              if (nextPage * pageSize >= soal.length) {
                clearInterval(interval);
                setTimeout(calculatePoints, 0);
                return prevPage;
              }
              return nextPage;
            });
            return countdownTime;
          }
          return prevTime - 1;
        });
      }, timerInterval);

      return () => clearInterval(interval);
    }
  }, [isAuthenticated, soal.length]);

  useEffect(() => {
    if (points !== null) {
      calculateHighestScoreTipeSoal(); // Calculate the highest scoring tipe_soal
    }
  }, [points]);

  const calculatePoints = () => {
    const calculatedPoints = {};

    soal.forEach(({ tipe_soal }) => {
      if (!calculatedPoints[tipe_soal]) {
        calculatedPoints[tipe_soal] = 0;
      }
    });

    soal.forEach(({ _id, tipe_soal }) => {
      const userChoice = userAnswers[_id];

      if (userChoice === "yes") {
        calculatedPoints[tipe_soal] += 1;
      }
    });

    setPoints(calculatedPoints);
  };

  const calculateHighestScoreTipeSoal = () => {
    if (points) {
      const highestScore = Math.max(...Object.values(points));
      const highestTipeSoal = Object.keys(points).find(
        (key) => points[key] === highestScore
      );
      setHighestScoreTipeSoal(highestTipeSoal);
    }
  };

  const handleShowDetailedScores = () => {
    setShowDetailedScores((prev) => !prev);
  };

  const columns = [
    {
      title: "Halaman",
      dataIndex: "page",
      key: "page",
      align: "center",
      width: 150,
      render: (_, __, index) => currentPage * pageSize + index + 1,
    },
    {
      title: "Soal",
      dataIndex: "soal_pertanyaan",
      key: "_id",
      align: "center",
      width: 500,
    },
    {
      title: "Pilihan Jawaban",
      key: "_id",
      dataIndex: "pilihan_jawaban",
      align: "center",
      render: (options, record) => renderCheckboxes(options, record._id),
    },
  ];

  const currentData = soal.slice(
    currentPage * pageSize,
    (currentPage + 1) * pageSize
  );

  return (
    <div className="container">
      <div className="container-form">
        {!isAuthenticated ? (
          <div className="form">
            <Form form={form} onFinish={cektoken}>
              <h3 style={{ paddingBottom: 10 }}>Masukan Token Ujian</h3>
              <Form.Item
                name="token"
                rules={[{ required: true, message: "Please input the token!" }]}
              >
                <Input />
              </Form.Item>
              <Form.Item>
                <Button type="primary" htmlType="submit">
                  Submit
                </Button>
              </Form.Item>
            </Form>
          </div>
        ) : (
          <>
            {points === null ? (
              <>
                <div
                  style={{
                    textAlign: "center",
                    marginBottom: 20,
                    backgroundColor: "rgb(24, 40, 72)",
                    color: "white",
                    width: 100,
                    borderRadius: 10,
                  }}
                >
                  <h2>{timeLeft}</h2>
                </div>
                <Table
                  dataSource={currentData}
                  columns={columns}
                  pagination={false}
                />
              </>
            ) : (
              <div>
                <h3>Hasil Perhitungan Poin:</h3>
                {highestScoreTipeSoal && (
                  <p>Tipe Soal dengan skor tertinggi: {highestScoreTipeSoal}</p>
                )}
                <Button onClick={handleShowDetailedScores}>
                  {showDetailedScores ? "Sembunyikan" : "Tampilkan"} Skor Detail
                </Button>
                {showDetailedScores && (
                  <ul>
                    {Object.entries(points).map(([tipe_soal, score]) => (
                      <li key={tipe_soal}>
                        {tipe_soal}: {score} poin
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default Formuser;
