import { Hono } from "hono";
import { db, desc, eq, sql } from "@instagram/db";
import { commentLikesTable, postLikesTable, usersTable } from "@instagram/db/schema";

export const usersRouter = new Hono();

usersRouter.get("/top-3", async (c) => {
  try {
    const users = await db.query.usersTable.findMany({
      columns: {
        id: true,
        username: true,
        bio: true,
        avatarUrl: true,
        phoneNumber: true,
        email: true,
        status: true,
        createdAt: true,
        updatedAt: true,
      },
      orderBy: (usersTable, { desc }) => desc(usersTable.id),
      limit: 3,
    });

    if (users.length === 0) {
      return c.json(
        {
          success: false,
          error: "No users found",
          message: "No users found",
        },
        404,
      );
    }

    return c.json({
      success: true,
      data: users,
    }, 200);
  } catch (error) {
    return c.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Internal server error",
        message: "Internal server error",
      },
      500,
    );
  }
});

usersRouter.get("/user-with-posts", async(c) => {
    try {
        const user = await db.query.usersTable.findFirst({
            columns: {
                id: true,
                username: true,
            },
            where: {
                id: 200,
            },
            with: {
                posts: {
                    columns: {
                        caption: true,
                    },
                },
            },
        });

        if (!user) {
            return c.json({
                success: false,
                error: "User not found",
                message: "User not found",
            }, 404);
        }

        return c.json({
            success: true,
            data: user,
        }, 200);
    } catch (error) {
        return c.json(
            {
                success: false,
                error: error instanceof Error ? error.message : "Internal server error",
                message: "Internal server error",
            },
            500,
        );
    }
})

usersRouter.get("/users-with-number-of-likes", async(c) => {
    try {
        const users = await db.select({
            username: usersTable.username,
            postLikes: sql<number>`COUNT(${postLikesTable.userId})`.as("postLikes"),
            commentLikes: sql<number>`COUNT(${commentLikesTable.userId})`.as("commentLikes"),
            numberOfLikes: sql<number>`COUNT(${postLikesTable.userId}) + COUNT(${commentLikesTable.userId})`.as("numberOfLikes"),
        })
        .from(usersTable)
        .leftJoin(postLikesTable, eq(usersTable.id, postLikesTable.userId))
        .leftJoin(commentLikesTable, eq(usersTable.id, commentLikesTable.userId))
        .groupBy(usersTable.id)
        .orderBy(desc(sql<number>`COUNT(${postLikesTable.userId}) + COUNT(${commentLikesTable.userId})`.as("numberOfLikes")))

        if (users.length === 0) {
            return c.json({
                success: false,
                error: "No users found",
                message: "No users found",
            }, 404);
        }

        return c.json(
            {
                success: true,
                data: users,
            },
            200,
        );
    } catch (error) {
        return c.json(
            {
                success: false,
                error: error instanceof Error ? error.message : "Internal server error",
                message: "Internal server error",
            },
            500,
        );
    }
})