require("dotenv").config({ path: "../../.env" });

const db = require("./knex"); // thay bằng đường dẫn thực tế nếu file config nằm ở nơi khác
console.log("DB_PASS =", process.env.DB_PASS);

async function checkConnection() {
  try {
    const result = await db.raw("SELECT 1+1 AS result");
    console.log("✅ Kết nối thành công:", result.rows || result);
    process.exit(0);
  } catch (err) {
    console.error("❌ Lỗi kết nối cơ sở dữ liệu:", err.message);
    process.exit(1);
  }
}

checkConnection();
