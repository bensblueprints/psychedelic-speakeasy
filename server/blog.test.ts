import { describe, expect, it, vi, beforeEach } from "vitest";
import { appRouter } from "./routers";
import type { TrpcContext } from "./_core/context";

// Mock the database functions
vi.mock("./db", () => ({
  getPublishedBlogPosts: vi.fn().mockResolvedValue([
    {
      id: 1,
      title: "Test Blog Post",
      slug: "test-blog-post",
      excerpt: "This is a test excerpt",
      content: "# Test Content\n\nThis is test content.",
      category: "Research",
      isPublished: true,
      viewCount: 10,
      publishedAt: new Date(),
      createdAt: new Date(),
      updatedAt: new Date(),
    },
  ]),
  getBlogPostBySlug: vi.fn().mockResolvedValue({
    id: 1,
    title: "Test Blog Post",
    slug: "test-blog-post",
    excerpt: "This is a test excerpt",
    content: "# Test Content\n\nThis is test content.",
    category: "Research",
    isPublished: true,
    viewCount: 10,
    publishedAt: new Date(),
    createdAt: new Date(),
    updatedAt: new Date(),
  }),
  incrementBlogViewCount: vi.fn().mockResolvedValue(undefined),
  addEmailSubscriber: vi.fn().mockResolvedValue({ success: true }),
  getActiveMembership: vi.fn().mockResolvedValue(null),
}));

type AuthenticatedUser = NonNullable<TrpcContext["user"]>;

function createPublicContext(): TrpcContext {
  return {
    user: null,
    req: {
      protocol: "https",
      headers: {},
    } as TrpcContext["req"],
    res: {
      clearCookie: vi.fn(),
    } as unknown as TrpcContext["res"],
  };
}

function createAuthContext(): TrpcContext {
  const user: AuthenticatedUser = {
    id: 1,
    openId: "test-user",
    email: "test@example.com",
    name: "Test User",
    loginMethod: "manus",
    role: "user",
    createdAt: new Date(),
    updatedAt: new Date(),
    lastSignedIn: new Date(),
  };

  return {
    user,
    req: {
      protocol: "https",
      headers: {},
    } as TrpcContext["req"],
    res: {
      clearCookie: vi.fn(),
    } as unknown as TrpcContext["res"],
  };
}

describe("blog.list", () => {
  it("returns published blog posts", async () => {
    const ctx = createPublicContext();
    const caller = appRouter.createCaller(ctx);

    const result = await caller.blog.list();

    expect(result).toBeInstanceOf(Array);
    expect(result.length).toBeGreaterThan(0);
    expect(result[0]).toHaveProperty("title");
    expect(result[0]).toHaveProperty("slug");
    expect(result[0]).toHaveProperty("isPublished", true);
  });
});

describe("blog.bySlug", () => {
  it("returns a blog post by slug", async () => {
    const ctx = createPublicContext();
    const caller = appRouter.createCaller(ctx);

    const result = await caller.blog.bySlug({ slug: "test-blog-post" });

    expect(result).toHaveProperty("title", "Test Blog Post");
    expect(result).toHaveProperty("slug", "test-blog-post");
    expect(result).toHaveProperty("content");
  });
});

describe("subscriber.subscribe", () => {
  it("subscribes a new email address", async () => {
    const ctx = createPublicContext();
    const caller = appRouter.createCaller(ctx);

    const result = await caller.subscriber.subscribe({
      email: "newuser@example.com",
      source: "test",
    });

    expect(result).toHaveProperty("success", true);
  });

  it("requires a valid email format", async () => {
    const ctx = createPublicContext();
    const caller = appRouter.createCaller(ctx);

    await expect(
      caller.subscriber.subscribe({
        email: "invalid-email",
        source: "test",
      })
    ).rejects.toThrow();
  });
});

describe("membership.status", () => {
  it("requires authentication", async () => {
    const ctx = createPublicContext();
    const caller = appRouter.createCaller(ctx);

    await expect(caller.membership.status()).rejects.toThrow();
  });

  it("returns membership status for authenticated user", async () => {
    const ctx = createAuthContext();
    const caller = appRouter.createCaller(ctx);

    const result = await caller.membership.status();

    expect(result).toHaveProperty("hasMembership");
    expect(result).toHaveProperty("isAdmin");
  });
});
