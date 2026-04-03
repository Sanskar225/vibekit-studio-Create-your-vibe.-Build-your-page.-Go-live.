// scripts/seed.js
require("dotenv").config({ path: ".env" });
const { Pool } = require("pg");
const bcrypt   = require("bcryptjs");

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.NODE_ENV === "production" ? { rejectUnauthorized: false } : false,
});

const TEST = { name: "Demo User", email: "demo@vibekit.studio", password: "Demo1234!" };

const PAGES = [
  { title: "Minimal Portfolio", slug: "minimal-portfolio", theme: "minimal", status: "published",
    sections: [
      { type:"hero", order:0, content:{ title:"Hi, I'm a Designer", subtitle:"Crafting clean, thoughtful digital experiences.", buttonText:"View Work", buttonUrl:"#features" }},
      { type:"features", order:1, content:{ cards:[
        { title:"UI Design", description:"Clean interfaces that put users first." },
        { title:"Brand Identity", description:"Logos and systems that tell your story." },
        { title:"Web Dev", description:"Fast, responsive sites built to last." },
      ]}},
      { type:"gallery", order:2, content:{ images:[
        "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800",
        "https://images.unsplash.com/photo-1469474968028-56623f02e42e?w=800",
        "https://images.unsplash.com/photo-1441974231531-c6227db76b6e?w=800",
      ]}},
      { type:"contact", order:3, content:{} },
    ]
  },
  { title: "Dark Neon Agency", slug: "dark-neon-agency", theme: "dark-neon", status: "draft",
    sections: [
      { type:"hero", order:0, content:{ title:"We Build the Future", subtitle:"Next-gen digital experiences.", buttonText:"Start Project", buttonUrl:"#contact" }},
      { type:"features", order:1, content:{ cards:[
        { title:"Web3", description:"Decentralised apps and smart contracts." },
        { title:"AI", description:"Embed intelligence into your product." },
        { title:"Motion", description:"Animations that make users say wow." },
      ]}},
      { type:"gallery", order:2, content:{ images:[
        "https://images.unsplash.com/photo-1518770660439-4636190af475?w=800",
        "https://images.unsplash.com/photo-1550745165-9bc0b252726f?w=800",
        "https://images.unsplash.com/photo-1563089145-599997674d42?w=800",
      ]}},
      { type:"contact", order:3, content:{} },
    ]
  },
];

async function seed() {
  const client = await pool.connect();
  try {
    console.log("🌱 Seeding...\n");
    const hash = await bcrypt.hash(TEST.password, 12);
    const { rows } = await client.query(
      `INSERT INTO users(name,email,password_hash) VALUES($1,$2,$3)
       ON CONFLICT(email) DO UPDATE SET name=EXCLUDED.name, password_hash=EXCLUDED.password_hash
       RETURNING id,email`,
      [TEST.name, TEST.email, hash]
    );
    const user = rows[0];
    console.log(`✓ User: ${user.email}`);
    for (const p of PAGES) {
      await client.query(
        `INSERT INTO pages(user_id,title,slug,theme,sections,status,published_at)
         VALUES($1,$2,$3,$4,$5,$6,$7)
         ON CONFLICT(slug) DO UPDATE SET title=EXCLUDED.title,sections=EXCLUDED.sections,status=EXCLUDED.status`,
        [user.id, p.title, p.slug, p.theme, JSON.stringify(p.sections), p.status,
         p.status==="published" ? new Date() : null]
      );
      console.log(`✓ Page: ${p.title} [${p.status}]`);
    }
    console.log(`\n✅ Done!\n  Email: ${TEST.email}\n  Password: ${TEST.password}\n  Preview: /p/minimal-portfolio`);
  } finally {
    client.release();
    await pool.end();
  }
}

seed().catch((e) => { console.error(e); process.exit(1); });
