const express = require("express");
const router = express.Router();
const { getSession } = require("../config/db");
const { nodeProps, toNative } = require("../utils/neo4jHelpers");

// Get full network graph data
router.get("/graph", async (req, res, next) => {
  const session = getSession();
  try {
    const { type = "all" } = req.query;

    let nodeQuery, relQuery;

    if (type === "investment") {
      nodeQuery = `
        MATCH (n)
        WHERE n:Startup OR n:Investor OR n:FundingRound
        RETURN id(n) as nodeId, labels(n)[0] as label, n as properties
      `;
      relQuery = `
        MATCH (a:Investor)-[r:INVESTED_IN]->(fr:FundingRound)<-[:RAISED]-(b:Startup)
        RETURN id(a) as source, id(b) as target, 'INVESTED_IN' as type, r as properties
      `;
    } else if (type === "founder") {
      nodeQuery = `
        MATCH (n)
        WHERE n:Startup OR n:Founder
        RETURN id(n) as nodeId, labels(n)[0] as label, n as properties
      `;
      relQuery = `
        MATCH (a:Founder)-[r:FOUNDED]->(b:Startup)
        RETURN id(a) as source, id(b) as target, 'FOUNDED' as type, r as properties
      `;
    } else {
      nodeQuery = `
        MATCH (n)
        RETURN id(n) as nodeId, labels(n)[0] as label, n as properties LIMIT 500
      `;
      relQuery = `
        MATCH (a)-[r]->(b)
        RETURN id(a) as source, id(b) as target, type(r) as type, r as properties LIMIT 1000
      `;
    }

    const nodesResult = await session.run(nodeQuery);
    const relsResult = await session.run(relQuery);

    const nodes = nodesResult.records.map((r) => {
      const props = nodeProps(r.get("properties"));
      return {
        id: toNative(r.get("nodeId")),
        label: r.get("label"),
        ...props,
      };
    });

    const nodeIds = new Set(nodes.map((n) => n.id));

    const links = relsResult.records
      .map((r) => {
        const props = nodeProps(r.get("properties"));
        return {
          source: toNative(r.get("source")),
          target: toNative(r.get("target")),
          type: r.get("type"),
          ...props,
        };
      })
      .filter((l) => nodeIds.has(l.source) && nodeIds.has(l.target));

    res.json({ nodes, links });
  } catch (err) {
    next(err);
  } finally {
    await session.close();
  }
});

// Network statistics
router.get("/stats", async (req, res, next) => {
  const session = getSession();
  try {
    const startupRes = await session.run(
      "MATCH (s:Startup) RETURN count(s) as c",
    );
    const investorRes = await session.run(
      "MATCH (i:Investor) RETURN count(i) as c",
    );
    const founderRes = await session.run(
      "MATCH (f:Founder) RETURN count(f) as c",
    );
    const fundingRes = await session.run(
      "MATCH (r:FundingRound) RETURN r.amount as amount",
    );

    const totalFunding = fundingRes.records.reduce(
      (sum, r) => sum + (toNative(r.get("amount")) || 0),
      0,
    );

    const investmentRes = await session.run(
      "MATCH ()-[r:INVESTED_IN]->() RETURN count(r) as c",
    );

    res.json({
      startups: toNative(startupRes.records[0].get("c")),
      investors: toNative(investorRes.records[0].get("c")),
      founders: toNative(founderRes.records[0].get("c")),
      totalFunding,
      totalInvestments: toNative(investmentRes.records[0].get("c")),
    });
  } catch (err) {
    next(err);
  } finally {
    await session.close();
  }
});

module.exports = router;
