const express = require("express");
const router = express.Router();
const { getSession } = require("../config/db");

// Helper to get unique array
const unique = (arr, key) => {
  const seen = new Set();
  return arr.filter((item) => {
    const k = key ? item[key] : item;
    if (seen.has(k)) return false;
    seen.add(k);
    return true;
  });
};

// Query 1: AI Market Investor Exposure
router.get("/investor-market-exposure", async (req, res, next) => {
  const session = getSession();
  try {
    const result = await session.run(
      `MATCH (i:Investor)-[:INVESTED_IN]->(:FundingRound)<-[:RAISED]-(s:Startup)-[:OPERATES_IN]->(m:Market)
       WHERE m.name = 'Artificial Intelligence'
       RETURN i.name as investor, i.type as type, s.name as company, s.id as sid`,
    );

    // Aggregate in JS
    const grouped = {};
    for (const record of result.records) {
      const name = record.get("investor");
      if (!grouped[name]) {
        grouped[name] = {
          investor: name,
          type: record.get("type"),
          aiCompanies: [],
          aiPortfolioCount: 0,
        };
      }
      grouped[name].aiCompanies.push(record.get("company"));
      grouped[name].aiPortfolioCount++;
    }

    const data = Object.values(grouped)
      .map((g) => ({
        ...g,
        aiCompanies: [...new Set(g.aiCompanies)],
      }))
      .sort((a, b) => b.aiPortfolioCount - a.aiPortfolioCount);

    res.json({
      query: "Investor exposure to AI market (2-hop traversal)",
      description:
        "Finds which investors have portfolio companies operating in AI",
      cypher: `MATCH (i:Investor)-[:INVESTED_IN]->(:FundingRound)<-[:RAISED]-(s:Startup)-[:OPERATES_IN]->(m:Market) WHERE m.name = 'Artificial Intelligence'`,
      result: data,
    });
  } catch (err) {
    next(err);
  } finally {
    await session.close();
  }
});

// Query 2: Founder-Advisor Conflicts
router.get("/founder-advisor-conflicts", async (req, res, next) => {
  const session = getSession();
  try {
    const result = await session.run(
      `MATCH (f:Founder)-[:FOUNDED]->(s:Startup)-[:COMPETES_WITH]->(competitor:Startup)<-[:ADVISOR]-(f)
       RETURN f.name as founder, f.background as background, s.name as foundedCompany, 
              competitor.name as competitorCompany, s.logo as foundedLogo, competitor.logo as competitorLogo`,
    );

    const data = result.records.map((r) => ({
      founder: r.get("founder"),
      background: r.get("background"),
      foundedCompany: r.get("foundedCompany"),
      competitorCompany: r.get("competitorCompany"),
      foundedLogo: r.get("foundedLogo"),
      competitorLogo: r.get("competitorLogo"),
    }));

    res.json({
      query: "Founders advising competitors (3-hop traversal)",
      description:
        "Finds founders who advise startups competing with their own companies",
      cypher: `MATCH (f:Founder)-[:FOUNDED]->(s:Startup)-[:COMPETES_WITH]->(competitor:Startup)<-[:ADVISOR]-(f)`,
      result: data,
    });
  } catch (err) {
    next(err);
  } finally {
    await session.close();
  }
});

// Query 3: Warm Introduction Paths
router.get("/warm-introductions", async (req, res, next) => {
  const session = getSession();
  try {
    // Simple path query without shortestPath (may not be supported)
    const result = await session.run(
      `MATCH (i:Investor {name: 'Sequoia Capital'})-[:CO_INVESTOR|INVESTED_IN*1..3]-(target:Startup {name: 'DataPulse'})
       RETURN [node in nodes(path) | node.name] as pathNames,
              [rel in relationships(path) | type(rel)] as pathTypes,
              length(path) as hops
       LIMIT 5`,
    );

    const data = result.records.map((r) => ({
      path: r.get("pathNames"),
      relationshipTypes: r.get("pathTypes"),
      hops: Number(r.get("hops")),
    }));

    res.json({
      query: "Warm introduction paths",
      description:
        "Finds paths for warm introductions between investors and startups",
      cypher: `MATCH (i:Investor)-[:CO_INVESTOR|INVESTED_IN*1..3]-(target:Startup)`,
      result: data,
    });
  } catch (err) {
    next(err);
  } finally {
    await session.close();
  }
});

// Query 4: Portfolio Diversification
router.get("/portfolio-diversification", async (req, res, next) => {
  const session = getSession();
  try {
    const result = await session.run(
      `MATCH (i:Investor)-[:INVESTED_IN]->(:FundingRound)<-[:RAISED]-(s:Startup)-[:OPERATES_IN]->(m:Market)
       RETURN i.name as investor, i.type as type, m.name as market, s.name as company`,
    );

    const grouped = {};
    for (const record of result.records) {
      const name = record.get("investor");
      if (!grouped[name]) {
        grouped[name] = {
          investor: name,
          type: record.get("type"),
          markets: [],
          companies: [],
        };
      }
      grouped[name].markets.push(record.get("market"));
      grouped[name].companies.push(record.get("company"));
    }

    const data = Object.values(grouped)
      .map((g) => ({
        investor: g.investor,
        type: g.type,
        marketCount: [...new Set(g.markets)].length,
        markets: [...new Set(g.markets)],
        companyCount: [...new Set(g.companies)].length,
      }))
      .filter((g) => g.marketCount >= 2)
      .sort((a, b) => b.marketCount - a.marketCount);

    res.json({
      query: "Portfolio diversification analysis",
      description:
        "Finds investors with the most diversified portfolios across markets",
      cypher: `MATCH (i:Investor)-[:INVESTED_IN]->(:FundingRound)<-[:RAISED]-(s:Startup)-[:OPERATES_IN]->(m:Market)`,
      result: data,
    });
  } catch (err) {
    next(err);
  } finally {
    await session.close();
  }
});

// Query 5: Founder Ecosystem
router.get("/founder-ecosystem", async (req, res, next) => {
  const session = getSession();
  try {
    const result = await session.run(
      `MATCH (f1:Founder)-[:FOUNDED|ADVISOR]->(s:Startup)<-[:FOUNDED|ADVISOR]-(f2:Founder)
       WHERE f1.id <> f2.id
       RETURN f1.name as founder1, f2.name as founder2, s.name as company`,
    );

    const grouped = {};
    for (const record of result.records) {
      const key = [record.get("founder1"), record.get("founder2")]
        .sort()
        .join("|");
      if (!grouped[key]) {
        grouped[key] = {
          founder1: record.get("founder1"),
          founder2: record.get("founder2"),
          sharedConnections: 0,
          sharedCompanies: [],
        };
      }
      grouped[key].sharedConnections++;
      grouped[key].sharedCompanies.push(record.get("company"));
    }

    const data = Object.values(grouped)
      .map((g) => ({ ...g, sharedCompanies: [...new Set(g.sharedCompanies)] }))
      .sort((a, b) => b.sharedConnections - a.sharedConnections)
      .slice(0, 15);

    res.json({
      query: "Founder ecosystem connections",
      description: "Finds founders connected through shared companies",
      cypher: `MATCH (f1:Founder)-[:FOUNDED|ADVISOR]->(s:Startup)<-[:FOUNDED|ADVISOR]-(f2:Founder)`,
      result: data,
    });
  } catch (err) {
    next(err);
  } finally {
    await session.close();
  }
});

// Query 6: Competitive Investor Overlap
router.get("/competitive-investor-overlap", async (req, res, next) => {
  const session = getSession();
  try {
    const result = await session.run(
      `MATCH (s1:Startup)-[:COMPETES_WITH]->(s2:Startup)
       MATCH (s1)-[:RAISED]->(:FundingRound)<-[:INVESTED_IN]-(i:Investor)-[:INVESTED_IN]->(:FundingRound)<-[:RAISED]-(s2)
       RETURN s1.name as company1, s2.name as company2, i.name as investor, i.logo as logo`,
    );

    const grouped = {};
    for (const record of result.records) {
      const key = [record.get("company1"), record.get("company2")]
        .sort()
        .join("|");
      if (!grouped[key]) {
        grouped[key] = {
          company1: record.get("company1"),
          company2: record.get("company2"),
          sharedInvestors: [],
          investorOverlap: 0,
        };
      }
      grouped[key].sharedInvestors.push({
        name: record.get("investor"),
        logo: record.get("logo"),
      });
      grouped[key].investorOverlap++;
    }

    const data = Object.values(grouped)
      .map((g) => ({
        ...g,
        sharedInvestors: unique(g.sharedInvestors, "name"),
      }))
      .sort((a, b) => b.investorOverlap - a.investorOverlap);

    res.json({
      query: "Competitive investor overlap",
      description: "Finds competing startups that share investors",
      cypher: `MATCH (s1:Startup)-[:COMPETES_WITH]->(s2:Startup) MATCH (s1)-[:RAISED]->(:FundingRound)<-[:INVESTED_IN]-(i:Investor)-[:INVESTED_IN]->(:FundingRound)<-[:RAISED]-(s2)`,
      result: data,
    });
  } catch (err) {
    next(err);
  } finally {
    await session.close();
  }
});

// Query 7: Adjacent Markets
router.get("/adjacent-markets", async (req, res, next) => {
  const session = getSession();
  try {
    const result = await session.run(
      `MATCH (s:Startup {name: 'NeuralFlow'})-[:OPERATES_IN]->(current:Market)
       MATCH (s)-[:RAISED]->(:FundingRound)<-[:INVESTED_IN]-(i:Investor)
       MATCH (i)-[:INVESTED_IN]->(:FundingRound)<-[:RAISED]-(other:Startup)-[:OPERATES_IN]->(adjacent:Market)
       WHERE current <> adjacent
       RETURN adjacent.name as market, adjacent.growth as growth, other.name as startup, i.name as investor`,
    );

    const grouped = {};
    for (const record of result.records) {
      const name = record.get("market");
      if (!grouped[name]) {
        grouped[name] = {
          market: name,
          growth: record.get("growth"),
          exampleStartups: [],
          investorCount: 0,
        };
      }
      grouped[name].exampleStartups.push(record.get("startup"));
      grouped[name].investorCount++;
    }

    const data = Object.values(grouped)
      .map((g) => ({
        ...g,
        exampleStartups: [...new Set(g.exampleStartups)].slice(0, 5),
        startupCount: [...new Set(g.exampleStartups)].length,
      }))
      .sort((a, b) => b.startupCount - a.startupCount);

    res.json({
      query: "Adjacent market opportunities",
      description:
        "Finds adjacent markets that a startup's investors also invest in",
      cypher: `MATCH (s:Startup)-[:RAISED]->(:FundingRound)<-[:INVESTED_IN]-(i:Investor)-[:INVESTED_IN]->(:FundingRound)<-[:RAISED]-(other:Startup)-[:OPERATES_IN]->(adjacent:Market)`,
      result: data,
    });
  } catch (err) {
    next(err);
  } finally {
    await session.close();
  }
});

module.exports = router;
