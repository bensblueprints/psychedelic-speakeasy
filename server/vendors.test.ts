import { describe, expect, it } from "vitest";
import { appRouter } from "./routers";
import type { TrpcContext } from "./_core/context";

type AuthenticatedUser = NonNullable<TrpcContext["user"]>;

function createAdminContext(): TrpcContext {
  const user: AuthenticatedUser = {
    id: 1,
    openId: "admin-user",
    email: "admin@example.com",
    name: "Admin User",
    loginMethod: "manus",
    role: "admin",
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
      clearCookie: () => {},
    } as TrpcContext["res"],
  };
}

function createUserContext(): TrpcContext {
  const user: AuthenticatedUser = {
    id: 2,
    openId: "regular-user",
    email: "user@example.com",
    name: "Regular User",
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
      clearCookie: () => {},
    } as TrpcContext["res"],
  };
}

describe("vendorCategories", () => {
  it("lists vendor categories", async () => {
    const ctx = createUserContext();
    const caller = appRouter.createCaller(ctx);
    
    const categories = await caller.vendorCategories.list();
    
    expect(Array.isArray(categories)).toBe(true);
  });
});

describe("resourceCategories", () => {
  it("lists resource categories", async () => {
    const ctx = createUserContext();
    const caller = appRouter.createCaller(ctx);
    
    const categories = await caller.resourceCategories.list();
    
    expect(Array.isArray(categories)).toBe(true);
  });
});

describe("vendors", () => {
  it("lists verified vendors for admin", async () => {
    const ctx = createAdminContext();
    const caller = appRouter.createCaller(ctx);
    
    const vendors = await caller.vendors.verified();
    
    expect(Array.isArray(vendors)).toBe(true);
  });
  
  it("requires membership for regular users", async () => {
    const ctx = createUserContext();
    const caller = appRouter.createCaller(ctx);
    
    await expect(caller.vendors.verified()).rejects.toThrow('Active membership required');
  });
});

describe("resources", () => {
  it("lists featured resources", async () => {
    const ctx = createUserContext();
    const caller = appRouter.createCaller(ctx);
    
    const resources = await caller.resources.featured();
    
    expect(Array.isArray(resources)).toBe(true);
  });
  
  it("lists all resources", async () => {
    const ctx = createUserContext();
    const caller = appRouter.createCaller(ctx);
    
    const resources = await caller.resources.list();
    
    expect(Array.isArray(resources)).toBe(true);
  });
});
