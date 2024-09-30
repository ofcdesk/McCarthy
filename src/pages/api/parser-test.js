const fs = require("fs");
import { parse } from "csv-parse";

const processRecords = (data) => {
  return new Promise((resolve, reject) => {
    try {
      let records = [];
      // Initialize the parser
      const parser = parse({
        delimiter: ",",
        columns: true,
      });

      parser.on("readable", () => {
        let record;
        while ((record = parser.read()) !== null) {
          records.push(record);
        }
      });
      // Catch any error
      parser.on("error", (err) => {
        console.error(err.message);
      });
      // Test that the parsed records matched the expected records
      parser.on("end", () => {
        records = records.filter(
          (record) =>
            record.bim360_project_id !== undefined &&
            record.role_oxygen_id !== undefined &&
            record.name !== undefined
        );
        resolve(records);
      });

      parser.write(data);

      parser.end();
    } catch (err) {
      console.error(err);
      reject(err);
    }
  });
};

const handler = async (req, res) => {
  const fileName = "admin_project_roles.csv";

  try {
    const fileData = await fs.promises.readFile(fileName);
    const data = fileData.toString();

    const records = await processRecords(data);
    console.log(records[0]);
    console.log("finish");
  } catch (err) {
    console.error(err);
  }

  res.end();
  console.log("res send");
};

export default handler;
