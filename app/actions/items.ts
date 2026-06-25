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

  const existing = await prisma.item.findUnique({ where: { id: itemId } });
  if (!existing) {
    throw new Error("Item not found");
  }

  if (existing.quantity === quantity) {
    return;
  }

  await prisma.$transaction(async (tx) => {
    await tx.item.update({
      where: { id: itemId },
      data: {
        quantity,
        updatedBy: session.name,
        updatedByEmail: session.email,
      },
    });

    await tx.activityLog.create({
      data: {
        action: "UPDATED",
        itemId: existing.id,
        itemName: existing.name,
        userEmail: session.email,
        userName: session.name,
        detail: `set quantity to ${quantity}`,
      },
    });
  });

  revalidatePath("/inventory");
  revalidatePath("/restock");
  revalidatePath("/activity");
}
