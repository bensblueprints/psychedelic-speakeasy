import { Router } from "express";
import bcrypt from "bcryptjs";
import { nanoid } from "nanoid";
import * as db from "./db";

const seedAllRouter = Router();

// One-time setup endpoint - creates admin and seeds all data
seedAllRouter.post("/api/setup", async (req, res) => {
  try {
    console.log("[Setup] Starting initial setup...");
    const results: string[] = [];

    // 1. Create admin user (ben@justfeatured.com)
    const adminEmail = "ben@justfeatured.com";
    let adminUser = await db.getUserByEmail(adminEmail);

    if (!adminUser) {
      const hashedPassword = await bcrypt.hash("JEsus777$$!", 10);
      const openId = `email_${nanoid()}`;
      await db.upsertUser({
        openId,
        email: adminEmail,
        name: "Ben",
        password: hashedPassword,
        loginMethod: "email",
        role: "admin",
        lastSignedIn: new Date(),
      });
      results.push("Created admin user: ben@justfeatured.com");
    } else {
      // Make sure they're admin
      await db.updateUserRole(adminUser.id, "admin");
      results.push("Admin user already exists, ensured admin role");
    }

    // 2. Seed vendor categories
    const vendorCategories = [
      { name: "Psilocybin", slug: "psilocybin", description: "Trusted psilocybin mushroom vendors", icon: "mushroom", sortOrder: 1 },
      { name: "Amanita Muscaria", slug: "amanita", description: "Quality Amanita Muscaria suppliers", icon: "circle", sortOrder: 2 },
      { name: "Microdosing Supplies", slug: "microdosing", description: "Microdosing products and capsules", icon: "pill", sortOrder: 3 },
      { name: "Integration Services", slug: "integration", description: "Therapists and integration coaches", icon: "brain", sortOrder: 4 },
      { name: "Retreat Centers", slug: "retreats", description: "Psychedelic retreat experiences", icon: "mountain", sortOrder: 5 },
    ];

    for (const cat of vendorCategories) {
      try {
        await db.createVendorCategory(cat);
      } catch (e) { /* already exists */ }
    }
    results.push(`Seeded ${vendorCategories.length} vendor categories`);

    // 3. Seed some sample vendors
    const vendors = [
      {
        categoryId: 1,
        name: "Fungi Friends Collective",
        slug: "fungi-friends",
        description: "Premium organic psilocybin mushrooms grown with care",
        longDescription: "Fungi Friends Collective has been serving the community for over 5 years with the highest quality organic psilocybin mushrooms. All products are lab-tested for purity and potency.",
        telegram: "@fungifriends",
        verificationStatus: "verified" as const,
        isPremiumOnly: true,
        isActive: true,
        sortOrder: 1,
      },
      {
        categoryId: 2,
        name: "Amanita Apothecary",
        slug: "amanita-apothecary",
        description: "Ethically sourced Amanita Muscaria products",
        longDescription: "We specialize in carefully prepared Amanita Muscaria products, following traditional preparation methods to ensure safety and efficacy.",
        website: "https://example.com",
        verificationStatus: "verified" as const,
        isPremiumOnly: true,
        isActive: true,
        sortOrder: 1,
      },
      {
        categoryId: 3,
        name: "MicroMind Labs",
        slug: "micromind-labs",
        description: "Precision microdosing capsules and protocols",
        longDescription: "MicroMind Labs provides precisely measured microdosing capsules with consistent potency. Our protocols are designed by researchers and practitioners.",
        email: "info@example.com",
        verificationStatus: "featured" as const,
        isPremiumOnly: true,
        isActive: true,
        sortOrder: 1,
      },
    ];

    for (const vendor of vendors) {
      try {
        await db.createVendor(vendor);
      } catch (e) { /* already exists */ }
    }
    results.push(`Seeded ${vendors.length} vendors`);

    // 4. Seed community spaces
    const communitySpaces = [
      { name: "Introductions", slug: "introductions", description: "Welcome! Share your story and why you're here.", icon: "wave", color: "#10B981", sortOrder: 1 },
      { name: "Microdosing Journey", slug: "microdosing", description: "Share your microdosing experiences and protocols.", icon: "sparkles", color: "#8B5CF6", sortOrder: 2 },
      { name: "Amanita Experiences", slug: "amanita", description: "Discuss Amanita Muscaria experiences and preparation.", icon: "flame", color: "#EF4444", sortOrder: 3 },
      { name: "Psilocybin Stories", slug: "psilocybin", description: "Share psilocybin journeys and insights.", icon: "moon", color: "#3B82F6", sortOrder: 4 },
      { name: "Recovery & Healing", slug: "recovery", description: "Support for addiction recovery and trauma healing.", icon: "heart", color: "#F59E0B", sortOrder: 5 },
      { name: "Integration", slug: "integration", description: "How to integrate psychedelic experiences into daily life.", icon: "sun", color: "#06B6D4", sortOrder: 6 },
      { name: "Questions & Answers", slug: "questions", description: "Ask questions and get answers from the community.", icon: "help", color: "#EC4899", sortOrder: 7 },
    ];

    for (const space of communitySpaces) {
      try {
        await db.createCommunitySpace(space);
      } catch (e) { /* already exists */ }
    }
    results.push(`Seeded ${communitySpaces.length} community spaces`);

    // 5. Seed resource categories
    const resourceCategories = [
      { name: "Books", slug: "books", description: "Essential reading for psychedelic education", icon: "book", sortOrder: 1 },
      { name: "Research", slug: "research", description: "Scientific studies and clinical trials", icon: "flask", sortOrder: 2 },
      { name: "Guides", slug: "guides", description: "How-to guides and protocols", icon: "clipboard", sortOrder: 3 },
      { name: "Videos", slug: "videos", description: "Documentaries and educational videos", icon: "video", sortOrder: 4 },
      { name: "Podcasts", slug: "podcasts", description: "Audio content and interviews", icon: "mic", sortOrder: 5 },
    ];

    for (const cat of resourceCategories) {
      try {
        await db.createResourceCategory(cat);
      } catch (e) { /* already exists */ }
    }
    results.push(`Seeded ${resourceCategories.length} resource categories`);

    // 6. Seed some resources
    const resources = [
      {
        categoryId: 1,
        title: "How to Change Your Mind",
        slug: "how-to-change-your-mind",
        description: "Michael Pollan's exploration of the new science of psychedelics",
        author: "Michael Pollan",
        resourceType: "book" as const,
        isFeatured: true,
        isActive: true,
        sortOrder: 1,
      },
      {
        categoryId: 1,
        title: "The Psychedelic Explorer's Guide",
        slug: "psychedelic-explorers-guide",
        description: "Safe, therapeutic, and sacred journeys by James Fadiman",
        author: "James Fadiman",
        resourceType: "book" as const,
        isFeatured: true,
        isActive: true,
        sortOrder: 2,
      },
      {
        categoryId: 3,
        title: "Microdosing Protocol Guide",
        slug: "microdosing-protocol-guide",
        description: "Comprehensive guide to different microdosing protocols",
        resourceType: "guide" as const,
        isFeatured: true,
        isActive: true,
        sortOrder: 1,
      },
    ];

    for (const resource of resources) {
      try {
        await db.createResource(resource);
      } catch (e) { /* already exists */ }
    }
    results.push(`Seeded ${resources.length} resources`);

    // 7. Seed blog posts
    const blogPosts = [
      {
        slug: "beginners-guide-microdosing",
        title: "The Beginner's Guide to Microdosing Psilocybin",
        excerpt: "Everything you need to know about starting your microdosing journey safely and effectively.",
        content: `<h2>What is Microdosing?</h2>
<p>Microdosing involves taking very small amounts of psychedelic substances - typically 1/10th to 1/20th of a regular dose. At these levels, users don't experience hallucinations or significant altered states, but many report subtle improvements in mood, creativity, and focus.</p>

<h2>Why People Microdose</h2>
<p>Research and anecdotal reports suggest potential benefits including:</p>
<ul>
<li>Enhanced creativity and problem-solving</li>
<li>Improved mood and reduced anxiety</li>
<li>Increased energy and focus</li>
<li>Greater emotional awareness</li>
</ul>

<h2>Getting Started Safely</h2>
<p>If you're considering microdosing, it's essential to:</p>
<ol>
<li>Research thoroughly and understand the legal status in your area</li>
<li>Start with the lowest possible dose</li>
<li>Keep a detailed journal of your experiences</li>
<li>Have a trusted person aware of your practice</li>
</ol>

<p>Remember, psychedelics are powerful tools that deserve respect. Always prioritize safety and harm reduction.</p>`,
        category: "Microdosing",
        isPublished: true,
        publishedAt: new Date(),
      },
      {
        slug: "healing-trauma-with-psychedelics",
        title: "How Psychedelics Are Revolutionizing Trauma Treatment",
        excerpt: "The latest research on using psilocybin and MDMA to treat PTSD, depression, and addiction.",
        content: `<h2>A New Paradigm in Mental Health</h2>
<p>Traditional mental health treatments don't work for everyone. Millions suffer from treatment-resistant depression, PTSD, and addiction. But a revolution is underway.</p>

<h2>The Research</h2>
<p>Clinical trials at Johns Hopkins, NYU, and Imperial College London have shown remarkable results:</p>
<ul>
<li>Up to 80% of participants showed significant reduction in depression symptoms</li>
<li>Many patients achieved lasting relief after just 1-2 sessions</li>
<li>MDMA-assisted therapy has been shown highly effective for PTSD</li>
</ul>

<h2>How It Works</h2>
<p>Psychedelics appear to work differently than traditional medications. Rather than masking symptoms, they seem to facilitate profound psychological insights and emotional processing, often in just a few sessions.</p>

<p>The key seems to be the combination of the psychedelic experience with skilled therapeutic support - helping patients process difficult memories and emotions in a safe container.</p>`,
        category: "Research",
        isPublished: true,
        publishedAt: new Date(Date.now() - 86400000), // 1 day ago
      },
      {
        slug: "amanita-muscaria-guide",
        title: "Understanding Amanita Muscaria: History, Preparation, and Effects",
        excerpt: "A comprehensive guide to the iconic red-and-white mushroom and its unique properties.",
        content: `<h2>The Most Recognizable Mushroom</h2>
<p>Amanita Muscaria, with its distinctive red cap and white spots, is perhaps the most iconic mushroom in the world. It has been used for thousands of years across various cultures for its psychoactive properties.</p>

<h2>Key Differences from Psilocybin</h2>
<p>Unlike psilocybin mushrooms, Amanita Muscaria contains muscimol and ibotenic acid as its primary active compounds. This creates a very different experience:</p>
<ul>
<li>Effects are more sedating and dream-like</li>
<li>Proper preparation is essential for safety</li>
<li>The experience typically lasts longer</li>
</ul>

<h2>Safe Preparation Methods</h2>
<p>Raw Amanita Muscaria contains higher levels of ibotenic acid, which can cause unpleasant side effects. Traditional preparation methods involve:</p>
<ol>
<li>Drying the mushrooms thoroughly</li>
<li>Applying heat to convert ibotenic acid to muscimol</li>
<li>Starting with very small doses</li>
</ol>

<p><strong>Important:</strong> Always source from trusted vendors and never consume wild-foraged specimens unless you're an expert mycologist.</p>`,
        category: "Education",
        isPublished: true,
        publishedAt: new Date(Date.now() - 172800000), // 2 days ago
      },
    ];

    for (const post of blogPosts) {
      try {
        await db.createBlogPost(post);
      } catch (e) { /* already exists */ }
    }
    results.push(`Seeded ${blogPosts.length} blog posts`);

    console.log("[Setup] Setup completed successfully");
    return res.json({
      success: true,
      message: "Initial setup completed",
      results,
      adminLogin: {
        email: "ben@justfeatured.com",
        password: "JEsus777$$!",
        note: "Please change this password after logging in"
      }
    });

  } catch (error: any) {
    console.error("[Setup] Error:", error);
    return res.status(500).json({ error: error.message || "Setup failed" });
  }
});

export default seedAllRouter;
