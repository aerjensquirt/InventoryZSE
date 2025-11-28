import express from "express";
import cors from "cors";
import bodyParser from "body-parser";
import fetch from "node-fetch";
import multer from 'multer';
const upload = multer();
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

app.post("/api/test-login", async (req, res) => {
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
        "x_frontend_url",
        "x_frontend_group",
        "x_frontend_category",
        "categ_id"],
    });
    res.json(products);
  } catch (error) {
    console.error("Error fetching products:", error.message);
    res.status(500).json({ success: false, message: error.message });
  }
});

app.post("/api/createProduct", upload.single('image'), async (req, res) => {
  try {
    const { name, default_code, list_price, x_frontend_url, qty_available, category_id} = req.body;
    let x_frontend_group = null;
    let x_frontend_category = null;

    if (category_id) {
      const category = await odooRpc("x_item_category", "read", [[Number(category_id)], ["x_name", "x_group_id"]]);
      if (category.length > 0) {
        x_frontend_category = category[0].x_name;
        const groupId = category[0].x_group_id?.[0];
        if (groupId) {
          const group = await odooRpc("x_item_group", "read", [[groupId], ["x_name"]]);
          if (group.length > 0) {
            x_frontend_group = group[0].x_name;
          }
        }
      }
    }

    let image_1920 = undefined;
    if (req.file) {
      image_1920 = req.file.buffer.toString('base64');
    }
    const productId = await odooRpc("product.product", "create", [{
      name,
      default_code,
      list_price: parseFloat(list_price),
      x_frontend_url,
      image_1920,
      x_frontend_group,
      x_frontend_category,
      is_storable: true

    }]);

    if (qty_available !== undefined) {

      const qty = Number(qty_available);

      const stockLocation = await odooRpc(
        "stock.location",
        "search",
        [[["usage", "=", "internal"]]],
        { limit: 1 }
      );

      if (stockLocation.length > 0) {
        const existing = await odooRpc(
          "stock.quant",
          "search_read",
          [[
            ["product_id", "=", productId],
            ["location_id", "=", stockLocation[0]]
          ]],
          { fields: ["id"] }
        );

        if (existing.length > 0) {
          await odooRpc("stock.quant", "write", [
            [existing[0].id],
            { quantity: qty }
          ]);
        } else {
          await odooRpc("stock.quant", "create", [{
            product_id: productId,
            location_id: stockLocation[0],
            quantity: qty
          }]);
        }
      }
    }



    res.json({ success: true, productId });
  } catch (error) {
    console.error("Error creating product:", error.message);
    res.status(500).json({ success: false, message: error.message });
  }
});

app.get("/api/groups", async (req, res) => {
  try {
    const groups = await odooRpc("x_item_group", "search_read", [[]], { fields: ["id", "x_name", "x_prefix"] });
    res.json(groups);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }

});

app.get("/api/categorys", async (req, res) => {
  try {
    const categories = await odooRpc("x_item_category", "search_read", [[]], { fields: ["id", "x_name", "x_group_id"] });
    res.json(categories);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post("/api/createCategory", upload.none(), async (req, res) => {
  try {
    const { name, group_id } = req.body;

    if (!name?.trim()) return res.status(400).json({ success: false, error: "Naam verplicht" });
    if (!group_id) return res.status(400).json({ success: false, error: "Groep verplicht" });

    const newId = await odooRpc("x_item_category", "create", [{
      x_name: name,
      x_group_id: Number(group_id)
    }]);

    const newRec = await odooRpc("x_item_category", "read", [
      [newId],
      ["id", "x_name", "x_group_id"]
    ]);

    res.json({ success: true, category: newRec[0] });

  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

app.post("/api/createGroup", upload.none(), async (req, res) => {
  try {
    const { name } = req.body;

    if (!name?.trim()) return res.status(400).json({ success: false, error: "Naam verplicht" });

    const prefix = String(Math.floor(Math.random() * 90000) + 10000);

    const newId = await odooRpc("x_item_group", "create", [{
      x_name: name,
      x_prefix: prefix
    }]);

    const newRec = await odooRpc("x_item_group", "read", [
      [newId],
      ["id", "x_name", "x_prefix"]
    ]);

    res.json({ success: true, group: newRec[0] });

  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

app.post("/api/archiveProducts", upload.none(), async (req, res) => {
  try {
    const ids = JSON.parse(req.body.ids || "[]");

    if (!Array.isArray(ids) || ids.length === 0) {
      return res.status(400).json({ error: "Geen geldige IDs ontvangen." });
    }
    await odooRpc("product.product", "write", [ids, { active: false }]);
    const products = await odooRpc(
      "product.product",
      "read",
      [ids, ["product_tmpl_id"]]
    );
    const tmplIds = products
      .map(p => p.product_tmpl_id?.[0])
      .filter(id => id);
    if (tmplIds.length > 0) {
      await odooRpc("product.template", "write", [tmplIds, { active: false }]);
    }
    res.json({ success: true });
  } catch (err) {
    console.error("Error archiving product:", err);
    res.status(500).json({ error: err.message });
  }
})




app.listen(5000, () => {
  console.log("Server is running on port 5000");
});
