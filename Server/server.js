import express from "express";
import cors from "cors";
import bodyParser from "body-parser";
import fetch from "node-fetch";

const app = express();
app.use(cors());
app.use(bodyParser.json());


const ODOO_URL = "https://testdatabase12.odoo.com/jsonrpc";
const ODOO_DB = "testdatabase12";
const ODOO_USER = 2;
const ODOO_API_KEY = "b598d0bab47bd771ec86824e1cf6e10d3f634378";

async function odooRpc(model, method, args = [], kwargs = {}) {
  const body = {
    jsonrpc: "2.0",
    method: "call",
    params: {
      service: "object",
      method: "execute_kw",
      args: [ODOO_DB, ODOO_USER, ODOO_API_KEY, model, method, args, kwargs],
    },
    id: Date.now(),
  };

  const response = await fetch(ODOO_URL, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });

  const data = await response.json();
  if (data.error) {
    console.error("Odoo Error:", data.error);
    throw new Error(data.error.data?.message || "Odoo Server Error");
  }
  return data.result;
}

app.get("/api/test-login", async (req, res) => {
  try {
    console.log("Test");

    const result = await odooRpc("res.partner", "search_read", [], { limit: 1 });

    console.log(" Connection successful ", result);
    res.json({ success: true, message: "Connection success", sampleData: result });
  } catch (error) {
    console.error("Connection failed", error.message);
    res.status(500).json({ success: false, message: error.message });
  }
});
app.get("/api/products", async (req, res) => {
  try {
    const products = await odooRpc("product.product", "search_read", [[]], {
      fields: [
        "id",
        "name",
        "default_code",
        "qty_available",
        "image_1920",
        "product_tmpl_id",
        "list_price",
        "x_frontend_url" ],
    });
    res.json(products);
  } catch (error) {
    console.error("Error fetching products:", error.message);
    res.status(500).json({ success: false, message: error.message });
  }
});

app.listen(5000, () => {
  console.log("Server is running on port 5000");
});
