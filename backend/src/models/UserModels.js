import mongoose from "mongoose";

const User = new mongoose.Schema(
  {
    page: {
      type: String,
      required: true,
    },
    soal_pertanyaan: {
      type: String,
      required: true,
    },
    pilihan_jawaban: {
      type: [String],
      required: true,
    },
    tipe_soal: {
      type: String,
      required: true,
    },
    waktu: {
      type: Number,
      required: true,
    },
  },
  { collection: "Minatkarirsoal" }
);

export default mongoose.model("Minatkarir", User);
