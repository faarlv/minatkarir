import { Button, Form, Input, message, Table, Radio, Flex } from "antd";
import { useState, useEffect, useCallback } from "react";
import "../style/userform.css";
import { axiosInstance } from "../lib/axios";

const FormUser = () => {
  const [form] = Form.useForm();
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [questions, setQuestions] = useState([]);
  const [currentPage, setCurrentPage] = useState(0);
  const [userAnswers, setUserAnswers] = useState({});
  const [timeLeft, setTimeLeft] = useState(7);
  const [scores, setScores] = useState(null);
  const [highestScoreType, setHighestScoreType] = useState(null);
  const [showDetailedScores, setShowDetailedScores] = useState(false);
  const [showDescription, setShowDescription] = useState(false);

  const pageSize = 5;
  const countdownTime = 7;
  const timerInterval = 1000;

  const validateToken = useCallback(
    async ({ token }) => {
      if (token === "admin") {
        message.success("Berhasil masuk");
        setIsAuthenticated(true);
        await fetchQuestions();
      } else {
        message.error("Token salah");
        form.resetFields();
      }
    },
    [form]
  );

  const fetchQuestions = useCallback(async () => {
    try {
      const { data } = await axiosInstance.get(
        "http://localhost:5000/Minatkarir"
      );
      setQuestions(data);
    } catch (error) {
      console.error("Error fetching data:", error);
    }
  }, []);

  const handleOptionChange = useCallback((questionId, value) => {
    setUserAnswers((prevAnswers) => ({
      ...prevAnswers,
      [questionId]: value,
    }));
  }, []);

  const calculateScores = useCallback(() => {
    const calculatedScores = questions.reduce((acc, { _id, tipe_soal }) => {
      acc[tipe_soal] = acc[tipe_soal] || 0;
      if (userAnswers[_id] === "yes") {
        acc[tipe_soal] += 1;
      }
      return acc;
    }, {});

    setScores(calculatedScores);
  }, [questions, userAnswers]);

  const findHighestScoreType = useCallback(() => {
    if (scores) {
      const highestScore = Math.max(...Object.values(scores));
      const highestType = Object.keys(scores).find(
        (key) => scores[key] === highestScore
      );
      setHighestScoreType(highestType);
    }
  }, [scores]);

  const toggleDetailedScores = useCallback(() => {
    setShowDetailedScores((prev) => !prev);
  }, []);

  const toggleDescription = useCallback(() => {
    setShowDescription((prev) => !prev);
  }, []);

  useEffect(() => {
    if (isAuthenticated) {
      const interval = setInterval(() => {
        setTimeLeft((prevTime) => {
          if (prevTime === 1) {
            setCurrentPage((prevPage) => {
              const nextPage = prevPage + 1;
              if (nextPage * pageSize >= questions.length) {
                clearInterval(interval);
                setTimeout(calculateScores, 0);
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
  }, [isAuthenticated, questions.length, calculateScores]);

  useEffect(() => {
    if (scores !== null) {
      findHighestScoreType();
    }
  }, [scores, findHighestScoreType]);

  const renderRadioOptions = (options, questionId) => (
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
      render: (options, record) => renderRadioOptions(options, record._id),
    },
  ];

  const detailedScoresColumns = [
    {
      title: "Nomer Soal",
      dataIndex: "nomer_soal",
      key: "nomer_soal",
      align: "center",
      render: (_, record, index) => index + 1,
      width: 20,
      height: 30,
    },
    {
      title: "Tipe Soal",
      dataIndex: "tipe_soal",
      key: "tipe_soal",
      align: "center",
      width: 300,
    },
    {
      title: "Skor",
      dataIndex: "score",
      key: "score",
      align: "center",
    },
  ];

  const detailedScoresData = Object.entries(scores || {}).map(
    ([tipe_soal, score]) => ({
      key: tipe_soal,
      tipe_soal,
      score,
    })
  );

  const currentData = questions.slice(
    currentPage * pageSize,
    (currentPage + 1) * pageSize
  );

  const tipeKarir = {
    realistic: {
      description:
        "Menyukai pekerjaan realistis seperti mekanik otomotif dan diterangkan sebagai figure yang sedikit bersosialisasi, penurut, terbuka, kurang fleksibel, dan tekun. Orang dengan karier realistik seperti mekanik, ATC (air traffic controller), surveyor, ahli elektronik, dan petani. Tipe R biasanya memiliki keahlian atletik atau mekanik dan menyukai kegiatan luar ruangan dengan peralatan atau mesin. Lebih menyenangi bekerja dengan alat daripada dengan orang lain, diterangkan sebagai pribadi yang mudah menyesuaikan diri, tenang, orisinal, teguh dalam pendirian, sabar, tenang, alami, gigih, praktis, pemalu, dan cenderung hati-hati.",
      recommendedEducation:
        "Tipe Realistic apabila akan meneruskan pendidikan ke perguruan tinggi, disarankan untuk mengambil jurusan Desain Produk, Desain Interior, Arsitektur, Teknik Sipil, DKV, Teknik Industri, dan Teknik Elektro. Sedangkan untuk jenis pekerjaan yang cocok, Tipe realistic ini lebih disarankan untuk bekerja pada bidang-bidang seperti: Tukang Kayu, Juru Masak, Teknisi Listrik, Guru Seni, Industri, Insinyur, Supervisor bengkel, atau paramedis. ",
    },
    investigative: {
      description:
        "Menyukai pekerjaan investigatif seperti penelitian biologi, kimia, antropologi. Figure investigatif bercirikan analitis, ingin tahu, hati-hati, berpikir kompleks, dan ketepatan, serta tidak terlalu menonjolkan diri. Orang dengan karier investigatif seperti ahli biologi, kimia, fisika, geologi, laboratorium, dan penelitian termasuk teknisi medis.",
      recommendedEducation:
        "Tipe I biasanya memiliki keahlian sains dan matematika, menyukai kesendirian dalam pekerjaan maupun memecahkan masalah. Tipe I menyukai eksplorasi dan berusaha memahami sesuatu atau kejadian dibandingkan memaksakan sesuatu kepada orang lain. Tipe I diterangkan sebagai pribadi yang analitis, hati-hati, cenderung kompleks, kritis, ingin tahu tinggi, independen, intelektual, tertutup, metodologis atau prosedural, sopan, pesimis, ketepatan, menggunakan rasio, dan tertutup. Tipe Investigative apabila akan meneruskan pendidikan ke perguruan tinggi, disarankan untuk mengambil jurusan Fisika, Matematika, Teknik Pangan, Biologi, Sistem Informatika, Kedokteran, Teknik Komputer, Hukum, Psikologi, atau Akuntansi.Sedangkan untuk jenis pekerjaan yang cocok, Tipe Investigative ini lebih disarankan untuk bekerja pada bidang-bidang seperti: Ahli teknik kimia, Programmer Komputer, Juru Gambar, Asisten Laboratorium, Apoteker, Ahli Bedah, Periset, Investigator, atau Wartawan.",
    },
    artistic: {
      description:
        "Menyukai pekerjaan seni seperti komposer, musikus, penulis, aktor atau aktris dan dicirikan sebagai pribadi yang kompleks, emosional, ekspresif, daya imajinasi tinggi, dan impulsif. Orang dengan tipe artistic seperti composer, musisi, pengarah panggung, penari, dekorator, aktor atau aktris, dan penulis. Biasanya tipe A memiliki keahlian seni, menyenangi pekerjaan orisinal dan memiliki imajinasi tinggi. Tipe A menyukai pekerjaan yang mengandung unsur ide kreativitas dan ekspresi diri daripada keteraturan atau rutinitas. Pribadi artistik dapat diterangkan sebagai gambaran rumit, kurang teratur, emosional, ekspresif, idealistik, mengkhayal, tidak praktis, impulsif, mandiri, introspektif, intuitif, sulit akur, terbuka dan tampil apa adanya.",
      recommendedEducation:
        "Tipe Artistic apabila akan meneruskan pendidikan ke perguruan tinggi, disarankan untuk mengambil jurusan Arsitektur, Desain Interior, Desain Produk, Teknik Sipil, DKV, Musik, atau Bahasa dan Sastra. Sedangkan untuk jenis pekerjaan yang cocok, Tipe Artistic ini lebih disarankan untuk bekerja pada bidang-bidang seperti: Eksekutiv Periklanan, Arsitek, Pengarang, Guru Bahasa, Editor Film, Desainer Interior, Pemusik, Fotografer, atau Penulis Fiksi.",
    },
    social: {
      description:
        "Menyukai pekerjaan yang melibatkan sosialisasi seperti guru, konselor, psikolog, public relation, dan dicirikan sebagai pekerjasama, empatik, bersahabat, mudah membantu, sabar, dan bertanggung jawab secara sosial. Tipe karir sosial seperti guru, terapis, pekerja religious, konselor, psikolog, perawat, manajer personalia, polisi, ilmuwan politik. Tipe S biasanya menyenangi keberadaan diri dalam sosial, tertarik bagaimana bergaul dengan situasi sosial dan suka membantu permasalahan orang lain. Pribadi S diterangkan sebagai terbuka, bekerja sama, ramah, sopan, ringan tangan untuk membantu, sabar, tanggap secara sosial, simpatik, hangat dan mudah memahami.",
      recommendedEducation:
        "Tipe Social apabila akan meneruskan pendidikan ke perguruan tinggi, disarankan untuk mengambil jurusan Managemen, Psikologi, Komunikasi, Hubungan Industri, Hukum, Bahasa dan Sastra, Perhotelan, atau Usaha Wisata. Sedangkan untuk jenis pekerjaan yang cocok, Tipe Social ini lebih disarankan untuk bekerja pada bidang-bidang seperti: Konselor, Guru, Perawat, Terapis, Manajer personalia, Polisi, atau Ilmuwan Politik.",
    },
    enterpreneur: {
      description:
        "Menyukai pekerjaan kreatif, inovatif, dan menghibur seperti penjual, manajer, usahawan dan diterangkan sebagai petualang, ambisius, dominan, energetik, dan terbuka secara pribadi. Karir enterprising seperti pedagang, pialang, promotor, produser acara, eksekutif dalam dunia bisnis, penjual, supervisor, dan manajer. Tipe E biasanya memiliki jiwa kepemimpinan, kemampuan berbicara di depan umum, tertarik dengan uang dan politik, serta senang untuk mempengaruhi secara langsung, petualang, ambisius, menyenangi perhatian, dominasi energik, terbuka, impulsif, optimistis, mencari kesenangan, popularitas, kepercayaan diri dan berjiwa sosial.",
      recommendedEducation:
        "Tipe Enterprising apabila akan meneruskan pendidikan ke perguruan tinggi, disarankan untuk mengambil jurusan Managemen, Komunikasi, Hubungan Internasional, Musik, bahasa dan sastra, perhotelan, atau Usaha Wisata. Sedangkan untuk jenis pekerjaan yang cocok, Tipe Enterprising ini lebih disarankan untuk bekerja pada bidang-bidang seperti: Perencana Keuangan, Hakim, Pengacara, Managemen Trainee, Manager Operasi, Direktur Proyek, atau manager Sales.",
    },
    conventional: {
      description:
        "Orang dengan karir conventional seperti analis keuangan, pegawai perpustakaan, banking, ahli pajak, sekretaris, korespondensi, akunting. Tipe C memiliki keahlian klerikal dan matematika, menyukai pekerjaan dalam ruangan dan mengelola sesuatu agar rapi. Tipe C ini secara pribadi menyukai rutinitas yang teratur, bekerja sesuai standar jelas, menghindari pekerjaan yang kurang jelas. Pribadi senang dengan kepatuhan, kesadaran, kehati-hatian, efisiensi, sesuai aturan, tetap, dan konstan. ",
      recommendedEducation:
        "Tipe Conventional apabila akan meneruskan pendidikan ke perguruan tinggi, disarankan untuk mengambil jurusan Akuntansi, Sistem Informasi, Teknik Komputer, Teknik Informatika, Fisika, Matematika, Biologi. Sedangkan untuk jenis pekerjaan yang cocok, Tipe Conventional ini lebih disarankan untuk bekerja pada bidang-bidang seperti: Akuntan, Petugas Pembukuan, Inspektor Bangunan, Asisten Editorial, Analis Investasi, Admin Payrol, atau Editor Website.",
    },
  };

  const tipeDescription = () => {
    if (highestScoreType === "social") {
      return tipeKarir.social.description;
    }
    if (highestScoreType === "investigate") {
      return tipeKarir.investigative.description;
    }
    if (highestScoreType === "enterpreneur") {
      return tipeKarir.enterpreneur.description;
    }
    if (highestScoreType === "artistic") {
      return tipeKarir.artistic.description;
    }
    if (highestScoreType === "conventional") {
      return tipeKarir.conventional.description;
    }
    if (highestScoreType === "realistic") {
      return tipeKarir.realistic.description;
    }
  };

  return (
    <div className="container">
      <div className="container-form">
        {!isAuthenticated ? (
          <div className="form">
            <Form form={form} onFinish={validateToken}>
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
            {scores === null ? (
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
              <>
                <div className="container-hasil">
                  <h3>Hasil Perhitungan Poin:</h3>
                  {highestScoreType && (
                    <p style={{ margin: 10 }}>
                      Tipe Soal dengan skor tertinggi: {highestScoreType}
                    </p>
                  )}
                  <Button
                    onClick={toggleDetailedScores}
                    style={{ margin: 20 }}
                    type="primary"
                  >
                    {showDetailedScores ? "Sembunyikan" : "Tampilkan"} Skor
                    Detail
                  </Button>
                  <Button
                    onClick={toggleDescription}
                    type="primary"
                    style={{ marginBottom: 10 }}
                  >
                    {showDetailedScores ? "Sembunyikan" : "Tampilkan"} Hasil
                    Interpretasi
                  </Button>
                  {showDescription && (
                    <>
                      <div className="container-interpretasi">
                        <h3>Hasil Interpretasi</h3>
                        <h4>{highestScoreType}</h4>
                        <p>{tipeDescription()}</p>
                      </div>
                    </>
                  )}
                  {showDetailedScores && (
                    <>
                      <Table
                        dataSource={detailedScoresData}
                        columns={detailedScoresColumns}
                        pagination={false}
                      />
                    </>
                  )}
                </div>
              </>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default FormUser;
