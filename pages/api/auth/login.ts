import { NextApiRequest, NextApiResponse } from "next";
import {
  getUsername,
  getThumbnail,
  getDisplayName,
} from "@/utils/userinfoEngine";
import bcryptjs from "bcryptjs";
import * as noblox from "noblox.js";
import prisma from "@/utils/database";
import { createSession } from "@/utils/session";
import cache from "@/utils/cache";

const rateLimitStore = new Map<string, { count: number; resetAt: number }>();
const RATE_LIMIT_WINDOW = 15 * 60 * 1000;
const RATE_LIMIT_MAX = 30;

function getRateLimitKey(req: NextApiRequest): string {
  return (
    (req.headers["cf-connecting-ip"] as string) ||
    (req.headers["x-real-ip"] as string) ||
    (req.headers["x-forwarded-for"] as string)?.split(",")[0] ||
    req.socket.remoteAddress ||
    "unknown"
  );
}

function applyRateLimit(req: NextApiRequest, res: NextApiResponse): boolean {
  const key = getRateLimitKey(req);
  const now = Date.now();
  const entry = rateLimitStore.get(key);
  if (entry && now < entry.resetAt) {
    entry.count++;
    if (entry.count > RATE_LIMIT_MAX) {
      return false;
    }
  } else {
    rateLimitStore.set(key, { count: 1, resetAt: now + RATE_LIMIT_WINDOW });
  }
  return true;
}

type User = {
  userId: number;
  username: string;
  displayname: string;
  thumbnail: string;
  isOwner: boolean;
};

type DatabaseUser = {
  info: { passwordhash: string } | null;
  roles: { workspaceGroupId: number }[];
  isOwner: boolean;
};

type DatabaseResponse = DatabaseUser | { error: string };

type Response = {
  success: boolean;
  error?: string;
  user?: User;
  workspaces?: {
    groupId: number;
    groupthumbnail: string;
    groupname: string;
  }[];
};

async function safeBcryptCompare(
  password: string,
  hash: string,
): Promise<boolean> {
  try {
    return await bcryptjs.compare(password, hash);
  } catch (error) {
    console.error("Error comparing passwords:", error);
    return false;
  }
}

async function handler(req: NextApiRequest, res: NextApiResponse<Response>) {
  if (!applyRateLimit(req, res)) {
    return res.status(429).json({
      success: false,
      error: "Slow down! Too many login attempts, please try again later.",
    });
  }
  try {
    if (req.method !== "POST") {
      return res.status(405).json({
        success: false,
        error: "Method not allowed",
      });
    }

    if (!req.body.username || !req.body.password) {
      return res.status(400).json({
        success: false,
        error: "Username and password are required",
      });
    }

    const usernameKey = req.body.username.toLowerCase();

    let id = await cache.get<number>(`roblox:id:${usernameKey}`);

    if (!id) {
      try {
        id = await lookupRobloxUserId(req.body.username);

        if (id) {
          await cache.set(`roblox:id:${usernameKey}`, id, 3600);
        }
      } catch (error) {
        console.error("[Roblox] Login username lookup failed:", {
          username: req.body.username,
          error,
        });


        if (error instanceof Error && error.message.includes("429")) {
          return res.status(503).json({
            success: false,
            error:
              "Roblox is temporarily limiting requests. Please wait a moment and try again.",
          });
        }

        return res.status(502).json({
          success: false,
          error:
            "We couldn't contact Roblox to verify your username. Please try again in a moment.",
        });
      }
    }

    if (!id) {
      return res.status(401).json({
        success: false,
        error: "Invalid username or password",
      });
    }

    let user = await cache.get<DatabaseUser>(`login:user:${id}`);

    if (!user) {
      user = (await prisma.user
        .findUnique({
          where: {
            userid: id,
          },
          select: {
            info: true,
            roles: true,
            isOwner: true,
          },
        })
        .catch((error) => {
          console.error("Database error:", error);

          if (error.name === "PrismaClientInitializationError") {
            return {
              error: "Database connection error",
            } as DatabaseResponse;
          }

          return null;
        })) as DatabaseUser | null;

      if (user && !("error" in user)) {
        await cache.set(`login:user:${id}`, user, 300);
      }
    }

    if (user && "error" in user) {
      return res.status(503).json({
        success: false,
        error:
          "Database service is temporarily unavailable. Please try again later.",
      });
    }

    if (!user || !user.info?.passwordhash) {
      return res.status(401).json({
        success: false,
        error: "Invalid username or password",
      });
    }

    const valid = await safeBcryptCompare(
      req.body.password,
      user.info.passwordhash,
    );

    if (!valid) {
      return res.status(401).json({
        success: false,
        error: "Invalid username or password",
      });
    }

    const ipAddress = (req.headers["cf-connecting-ip"] ||
      req.headers["x-real-ip"] ||
      (req.headers["x-forwarded-for"] as string)?.split(",")[0] ||
      req.socket.remoteAddress) as string;

    const session = await createSession(
      BigInt(id),
      ipAddress,
      req.headers["user-agent"],
    );

    res.setHeader(
      "Set-Cookie",
      `session_token=${session.token}; Path=/; HttpOnly; SameSite=lax; Max-Age=${60 * 60 * 24 * 30}`,
    );

    let username = await cache.get<string>(`roblox:username:${id}`);

    if (!username) {
      username = await getUsername(id);
      await cache.set(`roblox:username:${id}`, username, 3600);
    }

    let displayname = await cache.get<string>(`roblox:displayname:${id}`);

    if (!displayname) {
      displayname = await getDisplayName(id);
      await cache.set(`roblox:displayname:${id}`, displayname, 3600);
    }

    let thumbnail = await cache.get<string>(`roblox:thumbnail:${id}`);

    if (!thumbnail) {
      thumbnail = getThumbnail(id);
      await cache.set(`roblox:thumbnail:${id}`, thumbnail, 3600);
    }

    const tovyuser: User = {
      userId: id,
      username,
      displayname,
      thumbnail,
      isOwner: user.isOwner || false,
    };

    let roles: any[] = [];

    if (user.roles.length) {
      try {
        roles = await Promise.all(
          user.roles.map(async (role) => {
            const { logo, group } = await getCachedGroupInfo(
              role.workspaceGroupId,
            );

            return {
              groupId: role.workspaceGroupId,
              groupThumbnail: logo,
              groupName: group.name,
            };
          }),
        );
      } catch (error) {
        console.error("Error fetching group information:", error);

        roles = user.roles.map((role) => ({
          groupId: role.workspaceGroupId,
          groupThumbnail: "/default-group-logo.svg",
          groupName: `Group ${role.workspaceGroupId}`,
        }));
      }
    }

    return res.status(200).json({
      success: true,
      user: tovyuser,
      workspaces: roles,
    });
  } catch (error) {
    console.error("Login error:", error);

    return res.status(500).json({
      success: false,
      error: "An unexpected error occurred during login",
    });
  }
}

export default handler;
