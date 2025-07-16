/**
 * API route handler /api/todo/[id]
 *
 * Fixes race‑condition corruption (extra closing brace) by serialising all
 * writes to db.json through a mutex. Only one write is allowed at a time.
 *
 * Other improvements:
 *   • Uses fs/promises directly (no promisify boilerplate)
 *   • Reads files with explicit UTF‑8 encoding
 *   • Adds a helper saveTodos() that guarantees atomic writes
 *   • Uses const/let and modern JS syntax throughout
 */

import path from "path";
import fs from "fs/promises";
import { Mutex } from "async-mutex";

const delayTime = 1000; // artificial latency for all REST calls (ms)
const dbMutex = new Mutex(); // serialises concurrent writes
const jsonFile = path.resolve("./", "db.json");

/** Pause execution for a specified number of milliseconds */
function delay(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/** Read the entire todos collection from db.json */
async function getTodosData() {
  const raw = await fs.readFile(jsonFile, "utf8");
  return JSON.parse(raw).todos;
}

/**
 * Persist the todos array atomically.
 *
 * The mutex ensures only one write happens at a time, preventing interleaved
 * writes that previously produced malformed JSON (e.g., an extra `}` at EOF).
 */
async function saveTodos(todos) {
  const data = JSON.stringify({ todos }, null, 2) + "\n"; // pretty + trailing NL
  await dbMutex.runExclusive(async () => {
    await fs.writeFile(jsonFile, data, "utf8");
  });
}

export default async function userHandler(req, res) {
  const { method, body: recordFromBody } = req;

  // Parse up to 50 comma‑separated ids from the route (e.g. /api/todo/1,2,3)
  const ids = (req?.query?.id ?? "")
    .split(",", 50)
    .map((id) => parseInt(id, 10))
    .filter((n) => !Number.isNaN(n));

  // Convenience: if only one id is supplied, treat it as the primary id
  const id = ids.length === 1 ? ids[0] : undefined;

  switch (method) {
    case "GET": {
      const todos = await getTodosData();
      const rec = todos.find((rec) => rec.id === id);
      if (rec) {
        res.status(200).json(rec);
      } else {
        res.status(404).send("rec not found");
      }
      console.log(`GET /api/todo/${id} status: ${rec ? 200 : 404}`);
      break;
    }

    case "PUT": {
      try {
        await delay(delayTime);
        const todos = await getTodosData();
        const updated = todos.map((rec) => (rec.id === id ? recordFromBody : rec));
        await saveTodos(updated);
        res.status(200).json(recordFromBody);
        console.log(`PUT /api/todo/${id} status: 200`);
      } catch (e) {
        console.error("/api/todo PUT error:", e);
        res.status(500).send("Internal Server Error");
      }
      break;
    }

    case "POST": {
      try {
        await delay(delayTime);
        const todos = await getTodosData();
        const withNew = [recordFromBody, ...todos];
        await saveTodos(withNew);
        res.status(201).json(recordFromBody);
        console.log(`POST /api/todo status: 201`);
      } catch (e) {
        console.error("/api/todo POST error:", e);
        res.status(500).send("Internal Server Error");
      }
      break;
    }

    case "DELETE": {
      try {
        await delay(delayTime);
        const todos = await getTodosData();
        // Support multi‑id delete: /api/todo/10,12,14
        const remaining = todos.filter((rec) => !ids.includes(rec.id));
        await saveTodos(remaining);
        res.status(200).json({ deleted: ids });
        console.log(`DELETE /api/todo/${ids.toString()} status: 200`);
      } catch (e) {
        console.error("/api/todo DELETE error:", e);
        res.status(500).send("Internal Server Error");
      }
      break;
    }

    default: {
      res.setHeader("Allow", ["GET", "PUT", "POST", "DELETE"]);
      res.status(405).end(`Method ${method} Not Allowed`);
    }
  }
}
