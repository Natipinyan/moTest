// Runs once on first startup (empty volume), against MONGO_INITDB_DATABASE.
db = db.getSiblingDB(process.env.MONGO_INITDB_DATABASE || "appdb");

// ---------- users ----------
db.createCollection("users", {
  validator: {
    $jsonSchema: {
      bsonType: "object",
      required: ["name", "email", "createdAt"],
      properties: {
        name: { bsonType: "string" },
        email: { bsonType: "string", pattern: "^.+@.+$" },
        age: { bsonType: "int", minimum: 0 },
        createdAt: { bsonType: "date" },
      },
    },
  },
});
db.users.createIndex({ email: 1 }, { unique: true });

// ---------- products ----------
db.createCollection("products", {
  validator: {
    $jsonSchema: {
      bsonType: "object",
      required: ["name", "price", "stock"],
      properties: {
        name: { bsonType: "string" },
        price: { bsonType: ["double", "int"], minimum: 0 },
        stock: { bsonType: "int", minimum: 0 },
        tags: { bsonType: "array", items: { bsonType: "string" } },
      },
    },
  },
});
db.products.createIndex({ name: 1 });

// ---------- orders ----------
db.createCollection("orders", {
  validator: {
    $jsonSchema: {
      bsonType: "object",
      required: ["userId", "items", "status", "createdAt"],
      properties: {
        userId: { bsonType: "objectId" },
        status: { enum: ["pending", "paid", "shipped", "cancelled"] },
        items: {
          bsonType: "array",
          minItems: 1,
          items: {
            bsonType: "object",
            required: ["productId", "quantity", "price"],
            properties: {
              productId: { bsonType: "objectId" },
              quantity: { bsonType: "int", minimum: 1 },
              price: { bsonType: ["double", "int"] },
            },
          },
        },
        createdAt: { bsonType: "date" },
      },
    },
  },
});
db.orders.createIndex({ userId: 1, createdAt: -1 });

// ---------- seed data ----------
const users = db.users.insertMany([
  { name: "Dana Cohen", email: "dana@example.com", age: NumberInt(29), createdAt: new Date() },
  { name: "Yossi Levi", email: "yossi@example.com", age: NumberInt(35), createdAt: new Date() },
  { name: "Noa Mizrahi", email: "noa@example.com", age: NumberInt(24), createdAt: new Date() },
]).insertedIds;

const products = db.products.insertMany([
  { name: "Laptop", price: 3999.9, stock: NumberInt(10), tags: ["electronics", "computers"] },
  { name: "Mouse", price: 89.9, stock: NumberInt(150), tags: ["electronics", "accessories"] },
  { name: "Coffee Mug", price: 35, stock: NumberInt(60), tags: ["kitchen"] },
  { name: "Notebook", price: 15.5, stock: NumberInt(300), tags: ["office"] },
]).insertedIds;

db.orders.insertMany([
  {
    userId: users[0],
    status: "paid",
    items: [
      { productId: products[0], quantity: NumberInt(1), price: 3999.9 },
      { productId: products[1], quantity: NumberInt(1), price: 89.9 },
    ],
    createdAt: new Date(),
  },
  {
    userId: users[1],
    status: "pending",
    items: [{ productId: products[2], quantity: NumberInt(2), price: 35 }],
    createdAt: new Date(),
  },
  {
    userId: users[2],
    status: "shipped",
    items: [{ productId: products[3], quantity: NumberInt(5), price: 15.5 }],
    createdAt: new Date(),
  },
]);

print("appdb initialized: users, products, orders");
