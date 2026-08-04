const express = require("express");
const router = express.Router();
const { getSession } = require("../config/db");

// Get all startups
router.get("/", async (req, res, next) => {
  const session = getSession();
  try {
    const { stage, market, minValuation, search } = req.query;
    let whereConditions = [];
    let params = {};

    if (stage) {
      whereConditions.push("s.stage = $stage");
      params.stage = stage;
    }
    if (minValuation) {
      whereConditions.push("s.valuation >= $minValuation");
      params.minValuation = parseInt(minValuation);
    }
    if (search) {
      whereConditions.push(
        "(s.name CONTAINS $search OR s.description CONTAINS $search)",
      );
      params.search = search;
    }

    let query = "MATCH (s:Startup) ";
    if (whereConditions.length > 0) {
      query += "WHERE " + whereConditions.join(" AND ") + " ";
    }
    query += "RETURN s ORDER BY s.valuation DESC";

    const result = await session.run(query, params);

    // Fetch related data for each startup separately
    const startups = [];
    for (const record of result.records) {
      const s = record.get("s").properties;

      // Get markets
      const marketsRes = await session.run(
        "MATCH (s:Startup {id: $id})-[:OPERATES_IN]->(m:Market) RETURN m.name as name",
        { id: s.id },
      );
      const markets = marketsRes.records.map((r) => r.get("name"));

      // Get total raised
      const raisedRes = await session.run(
        "MATCH (s:Startup {id: $id})-[:RAISED]->(r:FundingRound) RETURN r.amount as amount",
        { id: s.id },
      );
      const totalRaised = raisedRes.records.reduce(
        (sum, r) => sum + (r.get("amount") || 0),
        0,
      );

      // Get founders
      const foundersRes = await session.run(
        "MATCH (f:Founder)-[:FOUNDED]->(s:Startup {id: $id}) RETURN f.name as name, f.role as role",
        { id: s.id },
      );
      const founders = foundersRes.records.map((r) => ({
        name: r.get("name"),
        role: r.get("role"),
      }));

      startups.push({
        ...s,
        markets,
        totalRaised,
        founders,
      });
    }

    res.json({ count: startups.length, startups });
  } catch (err) {
    next(err);
  } finally {
    await session.close();
  }
});

// Get startup by ID
router.get("/:id", async (req, res, next) => {
  const session = getSession();
  try {
    const result = await session.run("MATCH (s:Startup {id: $id}) RETURN s", {
      id: req.params.id,
    });

    if (result.records.length === 0) {
      return res.status(404).json({ error: "Startup not found" });
    }

    const s = result.records[0].get("s").properties;

    // Get markets
    const marketsRes = await session.run(
      "MATCH (s:Startup {id: $id})-[:OPERATES_IN]->(m:Market) RETURN m.name as name",
      { id: req.params.id },
    );
    const markets = marketsRes.records.map((r) => r.get("name"));

    // Get funding rounds
    const roundsRes = await session.run(
      "MATCH (s:Startup {id: $id})-[:RAISED]->(r:FundingRound) RETURN r ORDER BY r.date",
      { id: req.params.id },
    );
    const fundingRounds = roundsRes.records.map((r) => r.get("r").properties);

    // Get investors
    const investorsRes = await session.run(
      "MATCH (s:Startup {id: $id})-[:RAISED]->(:FundingRound)<-[:INVESTED_IN]-(i:Investor) RETURN DISTINCT i",
      { id: req.params.id },
    );
    const investors = investorsRes.records.map((r) => {
      const p = r.get("i").properties;
      return { id: p.id, name: p.name, type: p.type, logo: p.logo };
    });

    // Get founders
    const foundersRes = await session.run(
      "MATCH (f:Founder)-[:FOUNDED]->(s:Startup {id: $id}) RETURN f",
      { id: req.params.id },
    );
    const founders = foundersRes.records.map((r) => r.get("f").properties);

    // Get competitors
    const competitorsRes = await session.run(
      "MATCH (s:Startup {id: $id})-[:COMPETES_WITH]->(c:Startup) RETURN c",
      { id: req.params.id },
    );
    const competitors = competitorsRes.records.map((r) => {
      const p = r.get("c").properties;
      return { id: p.id, name: p.name, logo: p.logo };
    });

    res.json({
      ...s,
      markets,
      fundingRounds,
      investors,
      founders,
      competitors,
    });
  } catch (err) {
    next(err);
  } finally {
    await session.close();
  }
});

// CREATE startup
router.post("/", async (req, res, next) => {
  const session = getSession();
  try {
    const {
      id,
      name,
      description,
      stage,
      valuation,
      employees,
      founded,
      headquarters,
      website,
      logo,
      markets,
    } = req.body;

    await session.run(
      `CREATE (s:Startup {
        id: $id, name: $name, description: $description, stage: $stage,
        valuation: $valuation, employees: $employees, founded: $founded,
        headquarters: $headquarters, website: $website, logo: $logo
      })`,
      {
        id,
        name,
        description,
        stage,
        valuation: parseInt(valuation),
        employees: parseInt(employees),
        founded,
        headquarters,
        website,
        logo,
      },
    );

    // Link markets
    if (markets && markets.length > 0) {
      for (const marketName of markets) {
        await session.run(
          `MATCH (s:Startup {id: $id}), (m:Market {name: $name})
           CREATE (s)-[:OPERATES_IN]->(m)`,
          { id, name: marketName },
        );
      }
    }

    res.status(201).json({ message: "Startup created", id });
  } catch (err) {
    next(err);
  } finally {
    await session.close();
  }
});

// UPDATE startup
router.put("/:id", async (req, res, next) => {
  const session = getSession();
  try {
    const {
      name,
      description,
      stage,
      valuation,
      employees,
      founded,
      headquarters,
      website,
      logo,
    } = req.body;

    await session.run(
      `MATCH (s:Startup {id: $id})
       SET s.name = $name, s.description = $description, s.stage = $stage,
           s.valuation = $valuation, s.employees = $employees, s.founded = $founded,
           s.headquarters = $headquarters, s.website = $website, s.logo = $logo`,
      {
        id: req.params.id,
        name,
        description,
        stage,
        valuation: parseInt(valuation),
        employees: parseInt(employees),
        founded,
        headquarters,
        website,
        logo,
      },
    );

    res.json({ message: "Startup updated" });
  } catch (err) {
    next(err);
  } finally {
    await session.close();
  }
});

// DELETE startup
router.delete("/:id", async (req, res, next) => {
  const session = getSession();
  try {
    await session.run("MATCH (s:Startup {id: $id}) DETACH DELETE s", {
      id: req.params.id,
    });
    res.json({ message: "Startup deleted" });
  } catch (err) {
    next(err);
  } finally {
    await session.close();
  }
});

module.exports = router;
