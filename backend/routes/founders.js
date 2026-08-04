const express = require("express");
const router = express.Router();
const { getSession } = require("../config/db");

// Get all founders
router.get("/", async (req, res, next) => {
  const session = getSession();
  try {
    const { search } = req.query;
    let query = "MATCH (f:Founder) ";
    let params = {};

    if (search) {
      query +=
        "WHERE f.name CONTAINS $search OR f.background CONTAINS $search ";
      params.search = search;
    }
    query += "RETURN f ORDER BY f.name";

    const result = await session.run(query, params);

    const founders = [];
    for (const record of result.records) {
      const f = record.get("f").properties;

      const companiesRes = await session.run(
        "MATCH (f:Founder {id: $id})-[:FOUNDED]->(s:Startup) RETURN s",
        { id: f.id },
      );
      const companies = companiesRes.records.map((r) => {
        const p = r.get("s").properties;
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

    const f = result.records[0].get("f").properties;

    // Get founded companies
    const foundedRes = await session.run(
      "MATCH (f:Founder {id: $id})-[:FOUNDED]->(s:Startup) RETURN s",
      { id: req.params.id },
    );
    const founded = foundedRes.records.map((r) => r.get("s").properties);

    // Get advisory roles
    const advisoryRes = await session.run(
      "MATCH (f:Founder {id: $id})-[:ADVISOR]->(s:Startup) RETURN s",
      { id: req.params.id },
    );
    const advisory = advisoryRes.records.map((r) => r.get("s").properties);

    // Get co-founders
    const coFoundersRes = await session.run(
      `MATCH (f:Founder {id: $id})-[:FOUNDED]->(s:Startup)<-[:FOUNDED]-(co:Founder)
       WHERE co.id <> $id RETURN DISTINCT co`,
      { id: req.params.id },
    );
    const coFounders = coFoundersRes.records.map((r) => r.get("co").properties);

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
    await session.run(
      `CREATE (f:Founder {
        id: $id, name: $name, role: $role, background: $background,
        linkedin: $linkedin, email: $email
      })`,
      { id, name, role, background, linkedin, email },
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
    await session.run(
      `MATCH (f:Founder {id: $id})
       SET f.name = $name, f.role = $role, f.background = $background,
           f.linkedin = $linkedin, f.email = $email`,
      { id: req.params.id, name, role, background, linkedin, email },
    );
    res.json({ message: "Founder updated" });
  } catch (err) {
    next(err);
  } finally {
    await session.close();
  }
});

router.delete("/:id", async (req, res, next) => {
  const session = getSession();
  try {
    await session.run("MATCH (f:Founder {id: $id}) DETACH DELETE f", {
      id: req.params.id,
    });
    res.json({ message: "Founder deleted" });
  } catch (err) {
    next(err);
  } finally {
    await session.close();
  }
});

module.exports = router;
