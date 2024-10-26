import { NextResponse } from "next/server";
import path from "path";
import { promises as fs } from "fs";
import Papa from "papaparse";
import { gzip } from "zlib";
import { promisify } from "util";

const gzipAsync = promisify(gzip);

export async function GET() {
  try {
    const dataDirectory = path.join(process.cwd(), "public", "data-to-visualize");
    const filePath = path.join(
      dataDirectory,
      "Electric_Vehicle_Population_Data.csv"
    );

    const fileContent = await fs.readFile(filePath, "utf-8");

    return new Promise((resolve) => {
      Papa.parse(fileContent, {
        header: true,
        skipEmptyLines: true,
        complete: async (results) => {
          const allData = results.data;
          const compressedData = await gzipAsync(JSON.stringify(allData));
          resolve(new NextResponse(compressedData, {
            status: 200,
            headers: {
              'Content-Type': 'application/json',
              'Content-Encoding': 'gzip'
            }
          }));
        },
        error: (error) => {
          console.error("CSV parsing error:", error);
          resolve(NextResponse.json(
            { error: "CSV parsing failed" },
            { status: 500 }
          ));
        }
      });
    });

  } catch (error) {
    console.error("Server error:", error);
    return NextResponse.json(
      { error: "Internal server error: " + error.message },
      { status: 500 }
    );
  }
}