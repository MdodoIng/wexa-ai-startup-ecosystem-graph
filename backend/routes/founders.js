const express = require("express");
const router = express.Router();
const { getSession } = require("../config/db");
const { nodeProps, toNative } = require("../utils/neo4jHelpers");

// Get all founders
router.get("/", async (req, res, next) => {
  const session = getSession();
  try {
    const { search } = req.query;
    let query = "MATCH (f:Founder) ";
    const params = {};

    if (search) {
      query +=
        "WHERE toLower(f.name) CONTAINS toLower($search) OR toLower(f.background) CONTAINS toLower($search) ";
      params.search = search;
    }
    query += "RETURN f ORDER BY f.name";

    const result = await session.run(query, params);

    const founders = [];
    for (const record of result.records) {
      const f = nodeProps(record.get("f"));

      const companiesRes = await session.run(
        "MATCH (f:Founder {id: $id})-[:FOUNDED]->(s:Startup) RETURN s",
        { id: f.id },
      );
      const companies = companiesRes.records.map((r) => {
        const p = nodeProps(r.get("s"));
        return { id: p.id, name: p.name, stage: p.stage, logo: p.logo };
      });

      founders.push({ ...f, companies });
    }

    res.json({ count: founders.length, founders });
  } catch (err) {
    next(err);
  } finally {
    await session.close();
  }
});

// Get founder by ID
router.get("/:id", async (req, res, next) => {
  const session = getSession();
  try {
    const result = await session.run("MATCH (f:Founder {id: $id}) RETURN f", {
      id: req.params.id,
    });

    if (result.records.length === 0) {
      return res.status(404).json({ error: "Founder not found" });
    }

    const f = nodeProps(result.records[0].get("f"));

    const foundedRes = await session.run(
      "MATCH (f:Founder {id: $id})-[:FOUNDED]->(s:Startup) RETURN s",
      { id: req.params.id },
    );
    const founded = foundedRes.records.map((r) => nodeProps(r.get("s")));

    const advisoryRes = await session.run(
      "MATCH (f:Founder {id: $id})-[:ADVISOR]->(s:Startup) RETURN s",
      { id: req.params.id },
    );
    const advisory = advisoryRes.records.map((r) => nodeProps(r.get("s")));

    const coFoundersRes = await session.run(
      `MATCH (f:Founder {id: $id})-[:FOUNDED]->(s:Startup)<-[:FOUNDED]-(co:Founder)
       WHERE co.id <> $id RETURN DISTINCT co`,
      { id: req.params.id },
    );
    const coFounders = coFoundersRes.records.map((r) => nodeProps(r.get("co")));

    res.json({ ...f, founded, advisory, coFounders });
  } catch (err) {
    next(err);
  } finally {
    await session.close();
  }
});

router.post("/", async (req, res, next) => {
  const session = getSession();
  try {
    const { id, name, role, background, linkedin, email } = req.body;

    if (!id || !name) {
      return res.status(400).json({ error: "id and name are required" });
    }

    // Check duplicate
    const existing = await session.run("MATCH (f:Founder {id: $id}) RETURN f", {
      id,
    });
    if (existing.records.length > 0) {
      return res
        .status(409)
        .json({ error: "Founder with this id already exists" });
    }

    await session.run(
      `CREATE (f:Founder {
        id: $id, name: $name, role: $role, background: $background,
        linkedin: $linkedin, email: $email
      })`,
      {
        id: String(id),
        name: String(name),
        role: role || "CEO",
        background: background || "",
        linkedin: linkedin || "",
        email: email || "",
      },
    );
    res.status(201).json({ message: "Founder created", id });
  } catch (err) {
    next(err);
  } finally {
    await session.close();
  }
});

router.put("/:id", async (req, res, next) => {
  const session = getSession();
  try {
    const { name, role, background, linkedin, email } = req.body;

    const result = await session.run(
      `MATCH (f:Founder {id: $id})
       SET f.name = $name, f.role = $role, f.background = $background,
           f.linkedin = $linkedin, f.email = $email
       RETURN f`,
      {
        id: req.params.id,
        name,
        role,
        background,
        linkedin: linkedin || "",
        email: email || "",
      },
    );

    if (result.records.length === 0) {
      return res.status(404).json({ error: "Founder not found" });
    }

    res.json({
      message: "Founder updated",
      founder: nodeProps(result.records[0].get("f")),
    });
  } catch (err) {
    next(err);
  } finally {
    await session.close();
  }
});

router.delete("/:id", async (req, res, next) => {
  const session = getSession();
  try {
    const result = await session.run(
      "MATCH (f:Founder {id: $id}) DETACH DELETE f RETURN count(*) as deleted",
      { id: req.params.id },
    );
    const deleted = toNative(result.records[0]?.get("deleted")) || 0;
    if (!deleted) {
      return res.status(404).json({ error: "Founder not found" });
    }
    res.json({ message: "Founder deleted" });
  } catch (err) {
    next(err);
  } finally {
    await session.close();
  }
});

module.exports = router;
