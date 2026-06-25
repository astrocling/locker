"use server";

import { requireAuthSession } from "@/lib/session";
import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

export async function updateItemQuantity(itemId: string, quantity: number) {
  const session = await requireAuthSession();
  if (!session) {
    throw new Error("Unauthorized");
  }

  if (quantity < 0) {
    throw new Error("Quantity cannot be negative");
  }

  await prisma.item.update({
    where: { id: itemId },
    data: {
      quantity,
      updatedBy: session.name,
      updatedByEmail: session.email,
    },
  });

  revalidatePath("/inventory");
}
