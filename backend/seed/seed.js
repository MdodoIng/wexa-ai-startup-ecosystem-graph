const { getSession, closeDriver } = require("../config/db");

const seedData = async () => {
  const session = getSession();

  try {
    console.log("Clearing existing data...");
    await session.run("MATCH (n) DETACH DELETE n");

    console.log("Creating constraints and indexes...");
    try {
      await session.run(
        "CREATE CONSTRAINT startup_id IF NOT EXISTS FOR (s:Startup) REQUIRE s.id IS UNIQUE",
      );
      await session.run(
        "CREATE CONSTRAINT investor_id IF NOT EXISTS FOR (i:Investor) REQUIRE i.id IS UNIQUE",
      );
      await session.run(
        "CREATE CONSTRAINT founder_id IF NOT EXISTS FOR (f:Founder) REQUIRE f.id IS UNIQUE",
      );
      await session.run(
        "CREATE CONSTRAINT fundinground_id IF NOT EXISTS FOR (fr:FundingRound) REQUIRE fr.id IS UNIQUE",
      );
      await session.run(
        "CREATE CONSTRAINT market_id IF NOT EXISTS FOR (m:Market) REQUIRE m.id IS UNIQUE",
      );
    } catch (e) {
      console.log("Constraints may already exist, continuing...");
    }

    console.log("Creating startups...");
    const startups = [
      {
        id: "s1",
        name: "NeuralFlow",
        description: "AI-powered workflow automation platform",
        stage: "Series B",
        valuation: 450000000,
        employees: 120,
        founded: 2019,
        headquarters: "San Francisco, CA",
        website: "neuralflow.ai",
        logo: "NF",
      },
      {
        id: "s2",
        name: "GreenGrid",
        description: "Smart energy grid optimization for renewables",
        stage: "Series A",
        valuation: 85000000,
        employees: 45,
        founded: 2020,
        headquarters: "Austin, TX",
        website: "greengrid.io",
        logo: "GG",
      },
      {
        id: "s3",
        name: "MediSync",
        description: "Real-time patient data synchronization for hospitals",
        stage: "Series C",
        valuation: 1200000000,
        employees: 280,
        founded: 2017,
        headquarters: "Boston, MA",
        website: "medisync.health",
        logo: "MS",
      },
      {
        id: "s4",
        name: "CryptoVault",
        description: "Institutional-grade crypto custody solution",
        stage: "Series A",
        valuation: 120000000,
        employees: 35,
        founded: 2021,
        headquarters: "New York, NY",
        website: "cryptovault.finance",
        logo: "CV",
      },
      {
        id: "s5",
        name: "CloudNative",
        description: "Kubernetes-native application platform",
        stage: "Series D",
        valuation: 3200000000,
        employees: 520,
        founded: 2015,
        headquarters: "Seattle, WA",
        website: "cloudnative.dev",
        logo: "CN",
      },
      {
        id: "s6",
        name: "DataPulse",
        description: "Real-time analytics for e-commerce",
        stage: "Seed",
        valuation: 15000000,
        employees: 12,
        founded: 2023,
        headquarters: "Berlin, Germany",
        website: "datapulse.io",
        logo: "DP",
      },
      {
        id: "s7",
        name: "RoboFarm",
        description: "Autonomous agricultural robotics",
        stage: "Series B",
        valuation: 280000000,
        employees: 95,
        founded: 2018,
        headquarters: "Tel Aviv, Israel",
        website: "robofarm.ag",
        logo: "RF",
      },
      {
        id: "s8",
        name: "CyberShield",
        description: "AI-driven threat detection platform",
        stage: "Series C",
        valuation: 900000000,
        employees: 340,
        founded: 2016,
        headquarters: "London, UK",
        website: "cybershield.security",
        logo: "CS",
      },
      {
        id: "s9",
        name: "EdTech Plus",
        description: "Personalized learning with AI tutors",
        stage: "Series A",
        valuation: 60000000,
        employees: 55,
        founded: 2020,
        headquarters: "Bangalore, India",
        website: "edtechplus.in",
        logo: "EP",
      },
      {
        id: "s10",
        name: "SpaceLink",
        description: "Satellite communication for IoT devices",
        stage: "Series B",
        valuation: 380000000,
        employees: 150,
        founded: 2018,
        headquarters: "Denver, CO",
        website: "spacelink.space",
        logo: "SL",
      },
    ];

    for (const s of startups) {
      await session.run(
        `CREATE (s:Startup {
          id: $id, name: $name, description: $description, stage: $stage,
          valuation: $valuation, employees: $employees, founded: $founded,
          headquarters: $headquarters, website: $website, logo: $logo
        })`,
        s,
      );
    }

    console.log("Creating investors...");
    const investors = [
      {
        id: "i1",
        name: "Accel Partners",
        type: "Venture Capital",
        aum: 15000000000,
        founded: 1983,
        headquarters: "Palo Alto, CA",
        focus: "Enterprise Software",
        logo: "AP",
      },
      {
        id: "i2",
        name: "Sequoia Capital",
        type: "Venture Capital",
        aum: 85000000000,
        founded: 1972,
        headquarters: "Menlo Park, CA",
        focus: "Multi-sector",
        logo: "SC",
      },
      {
        id: "i3",
        name: "Andreessen Horowitz",
        type: "Venture Capital",
        aum: 35000000000,
        founded: 2009,
        headquarters: "Menlo Park, CA",
        focus: "Crypto, AI, Bio",
        logo: "a16z",
      },
      {
        id: "i4",
        name: "Bessemer Venture Partners",
        type: "Venture Capital",
        aum: 20000000000,
        founded: 1911,
        headquarters: "San Francisco, CA",
        focus: "Cloud, Healthcare",
        logo: "BVP",
      },
      {
        id: "i5",
        name: "Khosla Ventures",
        type: "Venture Capital",
        aum: 15000000000,
        founded: 2004,
        headquarters: "Menlo Park, CA",
        focus: "CleanTech, AI",
        logo: "KV",
      },
      {
        id: "i6",
        name: "Index Ventures",
        type: "Venture Capital",
        aum: 12000000000,
        founded: 1996,
        headquarters: "London, UK / San Francisco, CA",
        focus: "Consumer, Enterprise",
        logo: "IV",
      },
      {
        id: "i7",
        name: "Tiger Global",
        type: "Hedge Fund / Growth",
        aum: 65000000000,
        founded: 2001,
        headquarters: "New York, NY",
        focus: "Growth-stage Tech",
        logo: "TG",
      },
      {
        id: "i8",
        name: "Y Combinator",
        type: "Accelerator",
        aum: 2000000000,
        founded: 2005,
        headquarters: "Mountain View, CA",
        focus: "Early-stage",
        logo: "YC",
      },
      {
        id: "i9",
        name: "Lightspeed Venture Partners",
        type: "Venture Capital",
        aum: 25000000000,
        founded: 2000,
        headquarters: "Menlo Park, CA",
        focus: "Consumer, Enterprise",
        logo: "LS",
      },
      {
        id: "i10",
        name: "Founders Fund",
        type: "Venture Capital",
        aum: 12000000000,
        founded: 2005,
        headquarters: "San Francisco, CA",
        focus: "Deep Tech",
        logo: "FF",
      },
    ];

    for (const i of investors) {
      await session.run(
        `CREATE (i:Investor {
          id: $id, name: $name, type: $type, aum: $aum,
          founded: $founded, headquarters: $headquarters, focus: $focus, logo: $logo
        })`,
        i,
      );
    }

    console.log("Creating founders...");
    const founders = [
      {
        id: "f1",
        name: "Sarah Chen",
        role: "CEO",
        background: "Stanford CS, ex-Google Brain",
        linkedin: "sarahchen",
        email: "sarah@neuralflow.ai",
      },
      {
        id: "f2",
        name: "Marcus Johnson",
        role: "CTO",
        background: "MIT EECS, ex-OpenAI",
        linkedin: "mjohnson",
        email: "marcus@neuralflow.ai",
      },
      {
        id: "f3",
        name: "Elena Rodriguez",
        role: "CEO",
        background: "Harvard MBA, ex-Tesla Energy",
        linkedin: "elena-r",
        email: "elena@greengrid.io",
      },
      {
        id: "f4",
        name: "Dr. James Park",
        role: "CEO",
        background: "Johns Hopkins MD, ex-Apple Health",
        linkedin: "jpark",
        email: "james@medisync.health",
      },
      {
        id: "f5",
        name: "Aisha Patel",
        role: "CTO",
        background: "CMU, ex-Coinbase",
        linkedin: "apatel",
        email: "aisha@cryptovault.finance",
      },
      {
        id: "f6",
        name: "David Kim",
        role: "CEO",
        background: "Berkeley, ex-VMware",
        linkedin: "dkim",
        email: "david@cloudnative.dev",
      },
      {
        id: "f7",
        name: "Lisa Wang",
        role: "CEO",
        background: "Tsinghua, ex-Alibaba",
        linkedin: "lwang",
        email: "lisa@datapulse.io",
      },
      {
        id: "f8",
        name: "Omar Hassan",
        role: "CEO",
        background: "Technion, ex-Bosch",
        linkedin: "ohassan",
        email: "omar@robofarm.ag",
      },
      {
        id: "f9",
        name: "Tom Bradley",
        role: "CEO",
        background: "Oxford, ex-GCHQ",
        linkedin: "tbradley",
        email: "tom@cybershield.security",
      },
      {
        id: "f10",
        name: "Priya Sharma",
        role: "CEO",
        background: "IIT Bombay, ex-Byjus",
        linkedin: "psharma",
        email: "priya@edtechplus.in",
      },
      {
        id: "f11",
        name: "Alex Turner",
        role: "CTO",
        background: "Caltech, ex-SpaceX",
        linkedin: "aturner",
        email: "alex@spacelink.space",
      },
      {
        id: "f12",
        name: "Nina Kowalski",
        role: "COO",
        background: "Warsaw Polytechnic, ex-SAP",
        linkedin: "nkowalski",
        email: "nina@datapulse.io",
      },
    ];

    for (const f of founders) {
      await session.run(
        `CREATE (f:Founder {
          id: $id, name: $name, role: $role, background: $background,
          linkedin: $linkedin, email: $email
        })`,
        f,
      );
    }

    console.log("Creating funding rounds...");
    const rounds = [
      {
        id: "r1",
        type: "Seed",
        amount: 2000000,
        date: "2019-03-15",
        valuation: 8000000,
      },
      {
        id: "r2",
        type: "Series A",
        amount: 15000000,
        date: "2020-07-22",
        valuation: 60000000,
      },
      {
        id: "r3",
        type: "Series B",
        amount: 50000000,
        date: "2022-01-10",
        valuation: 450000000,
      },
      {
        id: "r4",
        type: "Seed",
        amount: 1500000,
        date: "2020-01-20",
        valuation: 6000000,
      },
      {
        id: "r5",
        type: "Series A",
        amount: 20000000,
        date: "2021-11-05",
        valuation: 85000000,
      },
      {
        id: "r6",
        type: "Seed",
        amount: 3000000,
        date: "2017-06-10",
        valuation: 12000000,
      },
      {
        id: "r7",
        type: "Series A",
        amount: 25000000,
        date: "2019-02-14",
        valuation: 100000000,
      },
      {
        id: "r8",
        type: "Series B",
        amount: 80000000,
        date: "2020-09-30",
        valuation: 400000000,
      },
      {
        id: "r9",
        type: "Series C",
        amount: 200000000,
        date: "2022-05-15",
        valuation: 1200000000,
      },
      {
        id: "r10",
        type: "Seed",
        amount: 3500000,
        date: "2021-03-01",
        valuation: 15000000,
      },
      {
        id: "r11",
        type: "Series A",
        amount: 18000000,
        date: "2022-08-20",
        valuation: 120000000,
      },
      {
        id: "r12",
        type: "Seed",
        amount: 1000000,
        date: "2023-01-15",
        valuation: 5000000,
      },
      {
        id: "r13",
        type: "Pre-seed",
        amount: 500000,
        date: "2022-06-01",
        valuation: 2500000,
      },
      {
        id: "r14",
        type: "Seed",
        amount: 2500000,
        date: "2018-04-10",
        valuation: 10000000,
      },
      {
        id: "r15",
        type: "Series A",
        amount: 30000000,
        date: "2020-03-22",
        valuation: 150000000,
      },
      {
        id: "r16",
        type: "Series B",
        amount: 75000000,
        date: "2022-07-18",
        valuation: 280000000,
      },
      {
        id: "r17",
        type: "Seed",
        amount: 2000000,
        date: "2016-09-05",
        valuation: 8000000,
      },
      {
        id: "r18",
        type: "Series A",
        amount: 22000000,
        date: "2018-04-20",
        valuation: 90000000,
      },
      {
        id: "r19",
        type: "Series B",
        amount: 60000000,
        date: "2020-11-10",
        valuation: 350000000,
      },
      {
        id: "r20",
        type: "Series C",
        amount: 150000000,
        date: "2022-02-28",
        valuation: 900000000,
      },
      {
        id: "r21",
        type: "Seed",
        amount: 1200000,
        date: "2020-05-12",
        valuation: 6000000,
      },
      {
        id: "r22",
        type: "Series A",
        amount: 16000000,
        date: "2021-09-01",
        valuation: 60000000,
      },
      {
        id: "r23",
        type: "Seed",
        amount: 4000000,
        date: "2018-02-01",
        valuation: 16000000,
      },
      {
        id: "r24",
        type: "Series A",
        amount: 35000000,
        date: "2019-11-15",
        valuation: 180000000,
      },
      {
        id: "r25",
        type: "Series B",
        amount: 90000000,
        date: "2021-06-20",
        valuation: 380000000,
      },
    ];

    for (const r of rounds) {
      await session.run(
        `CREATE (r:FundingRound {
          id: $id, type: $type, amount: $amount, date: $date, valuation: $valuation
        })`,
        r,
      );
    }

    console.log("Creating markets...");
    const markets = [
      {
        id: "m1",
        name: "Artificial Intelligence",
        size: 1500000000000,
        growth: 38.1,
      },
      { id: "m2", name: "Clean Energy", size: 980000000000, growth: 17.5 },
      { id: "m3", name: "Digital Health", size: 240000000000, growth: 25.3 },
      { id: "m4", name: "Fintech / Crypto", size: 180000000000, growth: 23.7 },
      {
        id: "m5",
        name: "Cloud Infrastructure",
        size: 600000000000,
        growth: 20.4,
      },
      { id: "m6", name: "Cybersecurity", size: 180000000000, growth: 14.5 },
      { id: "m7", name: "EdTech", size: 140000000000, growth: 16.2 },
      { id: "m8", name: "AgTech", size: 22000000000, growth: 12.8 },
      { id: "m9", name: "Space Tech", size: 440000000000, growth: 7.4 },
      {
        id: "m10",
        name: "E-commerce Analytics",
        size: 12000000000,
        growth: 22.1,
      },
    ];

    for (const m of markets) {
      await session.run(
        `CREATE (m:Market { id: $id, name: $name, size: $size, growth: $growth })`,
        m,
      );
    }

    console.log("Creating relationships...");

    // FOUNDED relationships
    const foundedRels = [
      ["f1", "s1", "2020-01-15"],
      ["f2", "s1", "2020-01-15"],
      ["f3", "s2", "2020-02-01"],
      ["f4", "s3", "2017-06-10"],
      ["f12", "s3", "2017-06-10"],
      ["f5", "s4", "2021-03-01"],
      ["f6", "s5", "2015-08-20"],
      ["f7", "s6", "2023-01-15"],
      ["f12", "s6", "2023-01-15"],
      ["f8", "s7", "2018-04-10"],
      ["f9", "s8", "2016-09-05"],
      ["f10", "s9", "2020-05-12"],
      ["f11", "s10", "2018-02-01"],
    ];

    for (const [fid, sid, date] of foundedRels) {
      await session.run(
        `MATCH (f:Founder {id: $fid}), (s:Startup {id: $sid})
         CREATE (f)-[:FOUNDED {date: $date}]->(s)`,
        { fid, sid, date },
      );
    }

    // INVESTED_IN relationships (Investor -> FundingRound)
    const investedRels = [
      ["i8", "r1", 2000000],
      ["i2", "r2", 8000000],
      ["i1", "r2", 4000000],
      ["i9", "r2", 3000000],
      ["i2", "r3", 20000000],
      ["i7", "r3", 15000000],
      ["i1", "r3", 10000000],
      ["i6", "r3", 5000000],
      ["i8", "r4", 1500000],
      ["i5", "r5", 10000000],
      ["i1", "r5", 5000000],
      ["i9", "r5", 5000000],
      ["i8", "r6", 3000000],
      ["i2", "r7", 12000000],
      ["i4", "r7", 8000000],
      ["i9", "r7", 5000000],
      ["i2", "r8", 30000000],
      ["i7", "r8", 25000000],
      ["i4", "r8", 15000000],
      ["i6", "r8", 10000000],
      ["i2", "r9", 80000000],
      ["i7", "r9", 50000000],
      ["i4", "r9", 40000000],
      ["i1", "r9", 30000000],
      ["i8", "r10", 3500000],
      ["i3", "r11", 10000000],
      ["i10", "r11", 5000000],
      ["i6", "r11", 3000000],
      ["i8", "r12", 1000000],
      ["i6", "r13", 500000],
      ["i5", "r14", 2000000],
      ["i2", "r15", 15000000],
      ["i6", "r15", 8000000],
      ["i9", "r15", 7000000],
      ["i2", "r16", 30000000],
      ["i7", "r16", 25000000],
      ["i5", "r16", 20000000],
      ["i10", "r17", 2000000],
      ["i2", "r18", 12000000],
      ["i4", "r18", 6000000],
      ["i6", "r18", 4000000],
      ["i2", "r19", 25000000],
      ["i7", "r19", 20000000],
      ["i10", "r19", 15000000],
      ["i2", "r20", 50000000],
      ["i7", "r20", 40000000],
      ["i4", "r20", 30000000],
      ["i1", "r20", 30000000],
      ["i8", "r21", 1200000],
      ["i6", "r22", 8000000],
      ["i9", "r22", 5000000],
      ["i3", "r22", 3000000],
      ["i10", "r23", 4000000],
      ["i2", "r24", 20000000],
      ["i7", "r24", 10000000],
      ["i6", "r24", 5000000],
      ["i2", "r25", 35000000],
      ["i7", "r25", 30000000],
      ["i10", "r25", 25000000],
    ];

    for (const [iid, rid, amount] of investedRels) {
      await session.run(
        `MATCH (i:Investor {id: $iid}), (r:FundingRound {id: $rid})
         CREATE (i)-[:INVESTED_IN {amount: $amount}]->(r)`,
        { iid, rid, amount },
      );
    }

    // RAISED relationships (Startup -> FundingRound)
    const raisedRels = [
      ["s1", "r1"],
      ["s1", "r2"],
      ["s1", "r3"],
      ["s2", "r4"],
      ["s2", "r5"],
      ["s3", "r6"],
      ["s3", "r7"],
      ["s3", "r8"],
      ["s3", "r9"],
      ["s4", "r10"],
      ["s4", "r11"],
      ["s5", "r12"],
      ["s5", "r13"],
      ["s6", "r14"],
      ["s6", "r15"],
      ["s6", "r16"],
      ["s7", "r17"],
      ["s7", "r18"],
      ["s7", "r19"],
      ["s7", "r20"],
      ["s8", "r21"],
      ["s8", "r22"],
      ["s9", "r23"],
      ["s9", "r24"],
      ["s9", "r25"],
    ];

    for (const [sid, rid] of raisedRels) {
      await session.run(
        `MATCH (s:Startup {id: $sid}), (r:FundingRound {id: $rid})
         CREATE (s)-[:RAISED]->(r)`,
        { sid, rid },
      );
    }

    // OPERATES_IN relationships (Startup -> Market)
    const marketRels = [
      ["s1", "m1"],
      ["s1", "m5"],
      ["s2", "m2"],
      ["s2", "m5"],
      ["s3", "m3"],
      ["s3", "m1"],
      ["s4", "m4"],
      ["s5", "m5"],
      ["s5", "m1"],
      ["s6", "m10"],
      ["s6", "m1"],
      ["s7", "m8"],
      ["s7", "m2"],
      ["s8", "m6"],
      ["s8", "m1"],
      ["s9", "m7"],
      ["s9", "m1"],
      ["s10", "m9"],
      ["s10", "m5"],
    ];

    for (const [sid, mid] of marketRels) {
      await session.run(
        `MATCH (s:Startup {id: $sid}), (m:Market {id: $mid})
         CREATE (s)-[:OPERATES_IN]->(m)`,
        { sid, mid },
      );
    }

    // CO_INVESTOR relationships (Investor -> Investor) - based on shared rounds
    const coInvestorRels = [
      ["i2", "i7", 5],
      ["i2", "i1", 3],
      ["i2", "i4", 4],
      ["i2", "i6", 3],
      ["i7", "i4", 2],
      ["i7", "i1", 2],
      ["i7", "i10", 3],
      ["i1", "i9", 2],
      ["i1", "i4", 2],
      ["i6", "i9", 2],
      ["i6", "i3", 1],
      ["i6", "i5", 1],
      ["i5", "i10", 2],
      ["i3", "i10", 1],
    ];

    for (const [i1id, i2id, strength] of coInvestorRels) {
      await session.run(
        `MATCH (a:Investor {id: $i1id}), (b:Investor {id: $i2id})
         CREATE (a)-[:CO_INVESTOR {sharedRounds: $strength, strength: $strength}]->(b)`,
        { i1id, i2id, strength },
      );
    }

    // ADVISOR relationships (Founder -> Startup)
    const advisorRels = [
      ["f4", "s6", "Healthcare AI Strategy"],
      ["f6", "s1", "Cloud Architecture"],
      ["f9", "s4", "Security Architecture"],
      ["f11", "s7", "Robotics Navigation"],
      ["f3", "s10", "Energy Systems"],
    ];

    for (const [fid, sid, expertise] of advisorRels) {
      await session.run(
        `MATCH (f:Founder {id: $fid}), (s:Startup {id: $sid})
         CREATE (f)-[:ADVISOR {expertise: $expertise}]->(s)`,
        { fid, sid, expertise },
      );
    }

    console.log("Creating some competitive relationships...");
    await session.run(
      `MATCH (s1:Startup {id: 's1'}), (s6:Startup {id: 's6'}) CREATE (s1)-[:COMPETES_WITH {market: 'AI Analytics'}]->(s6)`,
    );
    await session.run(
      `MATCH (s2:Startup {id: 's2'}), (s7:Startup {id: 's7'}) CREATE (s2)-[:COMPETES_WITH {market: 'Clean Energy'}]->(s7)`,
    );
    await session.run(
      `MATCH (s3:Startup {id: 's3'}), (s9:Startup {id: 's9'}) CREATE (s3)-[:COMPETES_WITH {market: 'Digital Health'}]->(s9)`,
    );

    console.log("Seed data created successfully!");
    console.log(
      `Created: ${startups.length} startups, ${investors.length} investors, ${founders.length} founders, ${rounds.length} funding rounds, ${markets.length} markets`,
    );
  } catch (error) {
    console.error("Error seeding data:", error);
    process.exit(1);
  } finally {
    await session.close();
    await closeDriver();
  }
};

seedData();
