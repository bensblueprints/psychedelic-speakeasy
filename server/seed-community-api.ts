import { Router } from "express";
import { getDb } from "./db";
import { communitySpaces, memberProfiles, communityPosts, postComments } from "../drizzle/schema";
import * as fs from "fs";
import * as path from "path";

const router = Router();

router.post("/api/seed-community", async (req, res) => {
  try {
    const db = await getDb();
    if (!db) {
      return res.status(500).json({ error: "Database not available" });
    }

    // Read the seed data
    const seedDataPath = path.join(process.cwd(), "community-seed-data.json");
    if (!fs.existsSync(seedDataPath)) {
      return res.status(404).json({ error: "Seed data file not found. Run 'node seed-community.mjs > community-seed-data.json' first." });
    }

    const seedData = JSON.parse(fs.readFileSync(seedDataPath, "utf-8"));

    // Seed spaces
    let spacesCreated = 0;
    for (const space of seedData.spaces) {
      try {
        await db.insert(communitySpaces).values({
          name: space.name,
          slug: space.slug,
          description: space.description,
          color: space.color,
          icon: space.icon,
          sortOrder: space.sortOrder,
          postCount: space.postCount || 0,
        }).onDuplicateKeyUpdate({
          set: {
            name: space.name,
            description: space.description,
            color: space.color,
            icon: space.icon,
            sortOrder: space.sortOrder,
            postCount: space.postCount || 0,
          }
        });
        spacesCreated++;
      } catch (e) {
        console.log(`Space ${space.slug} error:`, e);
      }
    }

    // Seed profiles (fake users for demo)
    let profilesCreated = 0;
    for (const profile of seedData.profiles) {
      try {
        await db.insert(memberProfiles).values({
          userId: profile.userId,
          displayName: profile.displayName,
          avatarIcon: profile.avatarIcon,
          avatarColor: profile.avatarColor,
          bio: profile.bio,
          journeyStage: profile.journeyStage,
          joinReasons: profile.joinReasons,
          isPublic: profile.isPublic,
        }).onDuplicateKeyUpdate({
          set: {
            displayName: profile.displayName,
            avatarIcon: profile.avatarIcon,
            avatarColor: profile.avatarColor,
          }
        });
        profilesCreated++;
      } catch (e) {
        // Skip duplicates
      }
    }

    // Seed posts
    let postsCreated = 0;
    for (const post of seedData.posts) {
      try {
        await db.insert(communityPosts).values({
          spaceId: post.spaceId,
          authorId: post.authorId,
          title: post.title,
          content: post.content,
          isPinned: post.isPinned || false,
          likeCount: post.likeCount || 0,
          commentCount: post.commentCount || 0,
          viewCount: post.viewCount || 0,
          createdAt: new Date(post.createdAt),
        });
        postsCreated++;
      } catch (e) {
        console.log(`Post error:`, e);
      }
    }

    // Seed comments
    let commentsCreated = 0;
    for (const comment of seedData.comments) {
      try {
        await db.insert(postComments).values({
          postId: comment.postId,
          authorId: comment.authorId,
          content: comment.content,
          likeCount: comment.likeCount || 0,
          createdAt: new Date(comment.createdAt),
        });
        commentsCreated++;
      } catch (e) {
        // Skip errors
      }
    }

    res.json({
      success: true,
      spacesCreated,
      profilesCreated,
      postsCreated,
      commentsCreated,
    });
  } catch (error) {
    console.error("Seed error:", error);
    res.status(500).json({ error: String(error) });
  }
});

export default router;
