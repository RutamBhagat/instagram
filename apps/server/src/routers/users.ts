import { Hono } from "hono";
import { countDistinct, db, desc, eq, lte, sql } from "@instagram/db";
import { captionTagsTable, commentLikesTable, photoTagsTable, postLikesTable, usersTable } from "@instagram/db/schema";

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
            postLikes: countDistinct(postLikesTable.postId).as("postLikes"),
            commentLikes: countDistinct(commentLikesTable.commentId).as("commentLikes"),
            numberOfLikes: sql<number>`(${countDistinct(postLikesTable.postId)} + ${countDistinct(commentLikesTable.commentId)})::int`.as("numberOfLikes"),
        })
        .from(usersTable)
        .leftJoin(postLikesTable, eq(usersTable.id, postLikesTable.userId))
        .leftJoin(commentLikesTable, eq(usersTable.id, commentLikesTable.userId))
        .groupBy(usersTable.id)
        .orderBy(desc(sql<number>`(${countDistinct(postLikesTable.postId)} + ${countDistinct(commentLikesTable.commentId)})::int`.as("numberOfLikes")));


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

usersRouter.get("/tags", async (c) => {
    try {
        const cutoffDate = new Date("2030-07-01");
        const tagUsers = db
            .select({
                userId: photoTagsTable.userId,
                tagDate: photoTagsTable.createdAt,
            })
            .from(photoTagsTable)
            .where(lte(photoTagsTable.createdAt, cutoffDate))
            .union(
                db
                    .select({
                        userId: captionTagsTable.userId,
                        tagDate: captionTagsTable.createdAt,
                    })
                    .from(captionTagsTable)
                    .where(lte(captionTagsTable.createdAt, cutoffDate)),
            )
            .as("tag_users");

        const tags = await db
            .select({
                username: usersTable.username,
                tagDate: tagUsers.tagDate,
            })
            .from(tagUsers)
            .innerJoin(usersTable, eq(usersTable.id, tagUsers.userId))
            .orderBy(usersTable.username, tagUsers.tagDate);

        if (tags.length === 0) {
            return c.json({
                success: false,
                error: "No tags found",
                message: "No tags found",
            }, 404);
        }

        return c.json({
            success: true,
            data: tags,
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

usersRouter.get("/tags-with-simple-cte", async (c) => {
    try {
        const cutoffDate = new Date("2030-07-01");
        const tagUsersCte = db.$with("tag_users").as(
            db
                .select({
                    userId: photoTagsTable.userId,
                    tagDate: photoTagsTable.createdAt,
                })
                .from(photoTagsTable)
                .where(lte(photoTagsTable.createdAt, cutoffDate))
                .union(
                    db
                        .select({
                            userId: captionTagsTable.userId,
                            tagDate: captionTagsTable.createdAt,
                        })
                        .from(captionTagsTable)
                        .where(lte(captionTagsTable.createdAt, cutoffDate)),
                ),
        );

        const tags = await db
            .with(tagUsersCte)
            .select({
                username: usersTable.username,
                tagDate: tagUsersCte.tagDate,
            })
            .from(tagUsersCte)
            .innerJoin(usersTable, eq(usersTable.id, tagUsersCte.userId))
            .orderBy(usersTable.username, tagUsersCte.tagDate);

        if (tags.length === 0) {
            return c.json({
                success: false,
                error: "No tags found",
                message: "No tags found",
            }, 404);
        }

        return c.json({
            success: true,
            data: tags,
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
