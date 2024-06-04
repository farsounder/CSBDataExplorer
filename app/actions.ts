"use server";
import db from "@/lib/db";

export async function createUniqueIdAction({
  platformId,
}: {
  platformId: string;
}) {
  try {
    const { id } = await db.platformIdentifier.create({
      data: {
        platformId,
      },
    });
    return id;
  } catch (error) {
    // log error
    console.error(error);
  }
}
