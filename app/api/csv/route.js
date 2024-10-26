import { NextResponse } from "next/server";
import path from "path";
import { promises as fs } from "fs";
import Papa from "papaparse";

export async function GET() {
  try {
    const dataDirectory = path.join(process.cwd(), "public", "data-to-visualize");
    
    // path.join(process.cwd(), "data-to-visualize");
    const filePath = path.join(
      dataDirectory,
      "Electric_Vehicle_Population_Data.csv"
    );

    try {
      await fs.access(filePath);
    } catch (error) {
      console.error("File does not exist:", filePath);
      return NextResponse.json(
        { error: "CSV file not found" },
        { status: 404 }
      );
    }

    const fileContent = await fs.readFile(filePath, "utf-8");

    const results = Papa.parse(fileContent, {
      header: true,
      skipEmptyLines: true,
    });

    if (results.errors.length > 0) {
      console.error("CSV parsing errors:", results.errors);
      return NextResponse.json(
        { error: "CSV parsing failed" },
        { status: 500 }
      );
    }

    return NextResponse.json(results.data);
  } catch (error) {
    console.error("Server error:", error);
    return NextResponse.json(
      { error: "Internal server error: " + error.message },
      { status: 500 }
    );
  }
}
