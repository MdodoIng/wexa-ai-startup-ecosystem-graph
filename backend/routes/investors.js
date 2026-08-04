const express = require("express");
const router = express.Router();
const { getSession } = require("../config/db");
const { nodeProps, toNative } = require("../utils/neo4jHelpers");

// Get all investors
router.get("/", async (req, res, next) => {
  const session = getSession();
  try {
    const { type, search } = req.query;
    const whereConditions = [];
    const params = {};

    if (type) {
      whereConditions.push("i.type = $type");
      params.type = type;
    }
    if (search) {
      whereConditions.push(
        "(toLower(i.name) CONTAINS toLower($search) OR toLower(i.focus) CONTAINS toLower($search))",
      );
      params.search = search;
    }

    let query = "MATCH (i:Investor) ";
    if (whereConditions.length > 0) {
      query += "WHERE " + whereConditions.join(" AND ") + " ";
    }
    query += "RETURN i ORDER BY i.aum DESC";

    const result = await session.run(query, params);

    const investors = [];
    for (const record of result.records) {
      const i = nodeProps(record.get("i"));

      const portfolioRes = await session.run(
        "MATCH (i:Investor {id: $id})-[:INVESTED_IN]->(:FundingRound)<-[:RAISED]-(s:Startup) RETURN DISTINCT s",
        { id: i.id },
      );
      const portfolio = portfolioRes.records.map((r) => {
        const p = nodeProps(r.get("s"));
        return { id: p.id, name: p.name, stage: p.stage, logo: p.logo };
      });

      const investedRes = await session.run(
        "MATCH (i:Investor {id: $id})-[inv:INVESTED_IN]->(:FundingRound) RETURN inv.amount as amount",
        { id: i.id },
      );
      const totalInvested = investedRes.records.reduce(
        (sum, r) => sum + (toNative(r.get("amount")) || 0),
        0,
      );

      investors.push({
        ...i,
        portfolioSize: portfolio.length,
        totalInvested,
        portfolio,
      });
    }

    res.json({ count: investors.length, investors });
  } catch (err) {
    next(err);
  } finally {
    await session.close();
  }
});

// Get investor by ID
router.get("/:id", async (req, res, next) => {
  const session = getSession();
  try {
    const result = await session.run("MATCH (i:Investor {id: $id}) RETURN i", {
      id: req.params.id,
    });

    if (result.records.length === 0) {
      return res.status(404).json({ error: "Investor not found" });
    }

    const i = nodeProps(result.records[0].get("i"));

    const portfolioRes = await session.run(
      `MATCH (i:Investor {id: $id})-[inv:INVESTED_IN]->(r:FundingRound)<-[:RAISED]-(s:Startup)
       RETURN s, r, inv.amount as investmentAmount`,
      { id: req.params.id },
    );

    const portfolioMap = {};
    for (const record of portfolioRes.records) {
      const s = nodeProps(record.get("s"));
      const r = nodeProps(record.get("r"));
      const amount = toNative(record.get("investmentAmount"));

      if (!portfolioMap[s.id]) {
        portfolioMap[s.id] = { ...s, rounds: [] };
      }
      portfolioMap[s.id].rounds.push({ ...r, investmentAmount: amount });
    }

    const coInvestorsRes = await session.run(
      `MATCH (i:Investor {id: $id})-[:CO_INVESTOR]-(co:Investor) RETURN co`,
      { id: req.params.id },
    );
    const coInvestors = coInvestorsRes.records.map((r) => {
      const p = nodeProps(r.get("co"));
      return { id: p.id, name: p.name, logo: p.logo };
    });

    const totalRes = await session.run(
      "MATCH (i:Investor {id: $id})-[inv:INVESTED_IN]->(:FundingRound) RETURN inv.amount as amount",
      { id: req.params.id },
    );
    const totalInvested = totalRes.records.reduce(
      (sum, r) => sum + (toNative(r.get("amount")) || 0),
      0,
    );

    res.json({
      ...i,
      portfolio: Object.values(portfolioMap),
      coInvestors,
      totalInvested,
    });
  } catch (err) {
    next(err);
  } finally {
    await session.close();
  }
});

router.post("/", async (req, res, next) => {
  const session = getSession();
  try {
    const { id, name, type, aum, founded, headquarters, focus, logo } =
      req.body;

    if (!id || !name) {
      return res.status(400).json({ error: "id and name are required" });
    }

    const existing = await session.run(
      "MATCH (i:Investor {id: $id}) RETURN i",
      { id },
    );
    if (existing.records.length > 0) {
      return res.status(409).json({ error: "Investor with this id already exists" });
    }

    await session.run(
      `CREATE (i:Investor {
        id: $id, name: $name, type: $type, aum: $aum,
        founded: $founded, headquarters: $headquarters, focus: $focus, logo: $logo
      })`,
      {
        id: String(id),
        name: String(name),
        type: type || "Venture Capital",
        aum: parseInt(aum, 10) || 0,
        founded: parseInt(founded, 10) || 2000,
        headquarters: headquarters || "",
        focus: focus || "",
        logo: (logo || "").toUpperCase().slice(0, 4),
      },
    );
    res.status(201).json({ message: "Investor created", id });
  } catch (err) {
    next(err);
  } finally {
    await session.close();
  }
});

router.put("/:id", async (req, res, next) => {
  const session = getSession();
  try {
    const { name, type, aum, founded, headquarters, focus, logo } = req.body;

    const result = await session.run(
      `MATCH (i:Investor {id: $id})
       SET i.name = $name, i.type = $type, i.aum = $aum,
           i.founded = $founded, i.headquarters = $headquarters, i.focus = $focus, i.logo = $logo
       RETURN i`,
      {
        id: req.params.id,
        name,
        type,
        aum: parseInt(aum, 10) || 0,
        founded: parseInt(founded, 10) || 2000,
        headquarters: headquarters || "",
        focus: focus || "",
        logo: (logo || "").toUpperCase().slice(0, 4),
      },
    );

    if (result.records.length === 0) {
      return res.status(404).json({ error: "Investor not found" });
    }

    res.json({ message: "Investor updated", investor: nodeProps(result.records[0].get("i")) });
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
      "MATCH (i:Investor {id: $id}) DETACH DELETE i RETURN count(*) as deleted",
      { id: req.params.id },
    );
    const deleted = toNative(result.records[0]?.get("deleted")) || 0;
    if (!deleted) {
      return res.status(404).json({ error: "Investor not found" });
    }
    res.json({ message: "Investor deleted" });
  } catch (err) {
    next(err);
  } finally {
    await session.close();
  }
});

module.exports = router;
