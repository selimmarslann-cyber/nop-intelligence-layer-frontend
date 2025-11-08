import type { NextApiRequest, NextApiResponse } from "next";
import PDFDocument from "pdfkit";

type Section = {
  title: string;
  paragraphs: string[];
  bullets?: string[];
};

const sections: Section[] = [
  {
    title: "1. Introduction & Vision",
    paragraphs: [
      "The NOP Intelligence Layer represents a new paradigm at the intersection of Web3, Artificial Intelligence, and Social Finance (SocialFi). It is a next-generation ecosystem where human contribution becomes measurable, valuable, and rewardable through transparent, decentralized social infrastructure.",
      "Unlike traditional platforms that monetize engagement without rewarding creators, NOP quantifies the intellectual and social value of every interaction. Users are stakeholders of a growing intelligence network where data, contribution, and engagement generate measurable economic and reputational outcomes.",
      "Vision Statement: We redefine digital contribution as an economic asset. Every opinion, post, rating, and participation feeds an AI-driven intelligence model, forming an evolving collective mind.",
    ],
    bullets: [
      "Transform social activity into tokenized intelligence.",
      "Create a unified scoring framework reflecting knowledge, influence, and trust.",
      "Establish a reward loop that turns attention, insight, and engagement into tangible NOP value.",
      "Bridge AI analytics with social data to empower community-driven decision-making.",
    ],
  },
  {
    title: "1.3 Core Philosophy",
    paragraphs: [
      '"The most valuable currency of the digital age is verified intelligence." In a landscape dominated by noise and bots, NOP measures authenticity through human validation, AI-based credibility, and transparent incentives. Truth, engagement, and expertise are rewarded, forming the foundation of Intelligence as a Service (IaaS).',
    ],
  },
  {
    title: "1.4 Mission",
    paragraphs: [
      "Our mission is to build an equitable intelligence economy that rewards meaningful human input and amplifies high-value content within a transparent, community-driven ecosystem.",
    ],
    bullets: [
      "Build the world’s first AI-powered social scoring protocol.",
      "Reward meaningful human input with blockchain-backed proof.",
      "Provide fair visibility for quality content.",
      "Foster collective intelligence that evolves through feedback loops.",
    ],
  },
  {
    title: "2. Problem Statement",
    paragraphs: [
      "Social platforms have become powerful economic ecosystems, yet the individuals creating the value receive almost nothing. Three core issues persist: value inequality, lack of data ownership, and manipulation or trust deficiency.",
      "Centralized systems are opaque—users cannot see how rankings, visibility, or engagement logic work. Intelligent, high-quality contributions remain unseen while noise dominates.",
      "The rise of AI compounds trust crises. Deepfakes and misinformation erode authenticity. What is missing is an Intelligence Layer that measures contribution, establishes trust, and rewards genuine participation.",
    ],
  },
  {
    title: "3. The Solution: NOP Intelligence Layer",
    paragraphs: [
      "NOP introduces a decentralized, AI-driven protocol to quantify, evaluate, and reward human contribution. Engagement becomes tokenized intelligence stored and validated on-chain. Rather than measuring popularity, NOP measures value.",
      "Each user action contributes to the NOP Intelligence Score, linking directly to rewards, visibility, and influence.",
    ],
    bullets: [
      "User Layer: Social graph, profiles, and interactions.",
      "AI Scoring Layer: Evaluation engine and scoring algorithms.",
      "Blockchain Layer: Immutable records via smart contracts.",
      "Reward Layer: Token distribution based on verified intelligence.",
      "Governance Layer: DAO-driven control and proposals.",
    ],
  },
  {
    title: "3.3 AI-Driven Scoring Model",
    paragraphs: [
      "Every contribution is evaluated across relevance, authenticity, impact, and credibility. Scores range from 0–100 and determine earned value. The model adapts continuously to community behavior for fairness.",
    ],
  },
  {
    title: "3.4 Blockchain Integration",
    paragraphs: [
      "All actions—posting, rating, rewarding—are recorded on a zkSync-compatible chain for transparency and immutability. Smart contracts prevent manipulation and fraudulent reputation boosts.",
    ],
  },
  {
    title: "4. Architecture Overview",
    paragraphs: [
      "The system combines frontend interaction, backend computation, AI analytics, and blockchain verification. It is transparent, scalable, interoperable, and secure.",
    ],
    bullets: [
      "Frontend: Next.js, React, TailwindCSS, TypeScript.",
      "Backend API: Express, PostgreSQL, JWT.",
      "AI Layer: Python services, TensorFlow/OpenAI, Intelligence Engine.",
      "Blockchain Layer: zkSync/Ethereum Layer-2 smart contracts.",
      "Storage: Render PostgreSQL, IPFS/Arweave.",
      "Governance: DAO smart contracts.",
    ],
  },
  {
    title: "4.3 Data Flow",
    paragraphs: [
      "End-to-end data movement is fully traceable, ensuring each interaction is validated, scored, and rewarded with minimal latency.",
    ],
    bullets: [
      "User interaction captured via frontend.",
      "Backend validates, authenticates, and stores data.",
      "AI scores content for relevance, originality, impact, and credibility.",
      "Verified scores registered on-chain; rewards distributed.",
      "Wallet updates reflect balances in real time.",
    ],
  },
  {
    title: "4.4 Security Framework",
    paragraphs: [
      "Security spans every layer of the stack—from authentication and storage to AI fairness and governance oversight.",
    ],
    bullets: [
      "Authentication via JWT with bcrypt-hashed credentials.",
      "Data integrity ensured through hashing and audit trails.",
      "Smart contracts follow audited OpenZeppelin patterns.",
      "Explainable AI (XAI) provides scoring transparency.",
    ],
  },
  {
    title: "5. Tokenomics (NOP Token Economy)",
    paragraphs: [
      "The NOP Token is the utility and governance token that captures the economic value of verified intelligence. Every meaningful action yields NOP rewards, reflecting social credibility and trust.",
    ],
    bullets: [
      "Utility: rewards, governance, staking, fee reduction, ecosystem access.",
      "Supply Allocation: Community 40%, Team 15%, Treasury 15%, Staking 10%, Marketing 10%, Advisors 5%, Reserve 5%.",
      "Total Supply: 1,000,000,000 NOP; deflation via burn events.",
      "Rewards scale with Intelligence Score, engagement weight, and token multipliers from staking.",
      "Burn mechanics remove 1–2% from boosted events, 0.5% from withdrawals, plus DAO-directed burns.",
    ],
  },
  {
    title: "6. Earning Mechanism & Scoring",
    paragraphs: [
      "The earning loop converts contributions into rewards via AI evaluation and blockchain verification.",
      "Intelligence Score (IS) combines relevance, authenticity, impact, and credibility.",
    ],
    bullets: [
      "Rewards distributed proportionally to IS across active users.",
      "Contribution weights: Knowledge 35%, Social Validation 25%, Engagement 20%, Curation 10%, Events 10%.",
      "Boosted events provide temporary multipliers (e.g., governance participation, ratings streaks).",
      "Anti-manipulation protocols detect spam, bots, and repetitive behavior.",
      "Wallet integration offers real-time balance, staking, and withdrawal management.",
    ],
  },
  {
    title: "7. Governance & DAO",
    paragraphs: [
      "Decentralized governance ensures legitimacy and adaptability. NOP DAO manages economics, protocol rules, and community empowerment.",
    ],
    bullets: [
      "NOP token doubles as governance power; one token equals one vote.",
      "Proposal lifecycle: submission (≥10,000 NOP), review, and on-chain voting.",
      "Treasury funds rewards, burns, audits, and grants with transparent smart contracts.",
      "AI-assisted governance scores proposal quality and sentiment.",
      "Voting uses snapshot balances, supports approve/reject/abstain, and stores results on-chain.",
    ],
  },
  {
    title: "8. Security & Transparency",
    paragraphs: [
      "Security combines cryptography, AI transparency, and on-chain auditability. Every action is verifiable by users, AI, and blockchain.",
    ],
    bullets: [
      "Multi-layer security: application, database, AI, blockchain, network, and governance.",
      "Explainable AI logs scoring decisions and allows appeals.",
      "Smart contracts secured with multi-sig, time locks, and audits.",
      "Data privacy honors user ownership, minimal collection, GDPR compliance, and decentralized storage.",
      "Continuous monitoring with anomaly detection and emergency DAO controls.",
    ],
  },
  {
    title: "9. Roadmap & Future Development",
    paragraphs: [
      "The roadmap progresses through Foundation, Decentralization, and Intelligence Expansion.",
    ],
    bullets: [
      "Phase I (Q4 2024 – Q2 2025): Beta launch, wallet integration, AI scoring v1, reward distribution v1, Render PostgreSQL, first user milestone.",
      "Phase II (Q3 2025 – Q1 2026): DAO smart contracts, treasury protocol, staking, AI governance assistant, first burn vote.",
      "Phase III (Q2 2026 – Q4 2026): Multi-chain interoperability, AI scoring v2, external scoring API, reputation oracle, NFT identity, partnerships.",
      "Long-term goals: AI marketplace, data monetization hub, cross-chain expansion, Intelligence Fund, ChainOpera AI integration.",
      "Targets: 1M users by 2026, majority DAO governance, intelligence scores as Web3 standard, external IaaS integrations.",
    ],
  },
  {
    title: "Closing Statement",
    paragraphs: [
      "NOP Intelligence Layer transforms engagement into an economy of verified intelligence. Every click, comment, and contribution becomes a data point in the world’s first decentralized Intelligence Economy.",
      '"In NOP, intelligence is not only measured — it is rewarded."',
    ],
  },
];

function addHeading(doc: PDFDocument, text: string) {
  doc.moveDown(0.8);
  doc.font("Helvetica-Bold").fontSize(15).text(text, { underline: true });
  doc.moveDown(0.4);
  doc.font("Helvetica").fontSize(11);
}

function addParagraphs(doc: PDFDocument, paragraphs: string[]) {
  paragraphs.forEach((paragraph) => {
    doc.text(paragraph, { align: "justify" });
    doc.moveDown(0.4);
  });
}

function addBullets(doc: PDFDocument, bullets?: string[]) {
  if (!bullets) return;
  bullets.forEach((bullet) => {
    doc.text(`• ${bullet}`, {
      indent: 14,
      align: "left",
    });
    doc.moveDown(0.2);
  });
  doc.moveDown(0.2);
}

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  res.setHeader("Content-Type", "application/pdf");
  res.setHeader(
    "Content-Disposition",
    'inline; filename="nop-intelligence-layer-whitepaper.pdf"',
  );

  const doc = new PDFDocument({ size: "A4", margin: 50 });

  doc.on("error", (err) => {
    console.error("PDF generation failed:", err);
    if (!res.headersSent) {
      res.status(500).json({ error: "Failed to generate whitepaper" });
    }
  });

  doc.pipe(res);

  doc.font("Helvetica-Bold").fontSize(18).text("NOP Intelligence Layer — Whitepaper", {
    align: "center",
  });
  doc.moveDown(0.5);
  doc
    .font("Helvetica")
    .fontSize(11)
    .text("Version 1.0 • Render PostgreSQL Integration • Web3 × AI × SocialFi", {
      align: "center",
    });
  doc.moveDown(1);

  sections.forEach((section) => {
    addHeading(doc, section.title);
    addParagraphs(doc, section.paragraphs);
    addBullets(doc, section.bullets);
  });

  doc.moveDown(1);
  doc.font("Helvetica-Oblique").text("© NOP Intelligence Layer — Intelligence becomes value.");

  doc.end();
}


