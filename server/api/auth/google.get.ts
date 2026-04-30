// server/api/auth/google.get.ts
import { db } from "../../../server/database/db";
import { users, wallets } from "../../../server/database/schema";
import { eq } from "drizzle-orm";
import { generateToken } from "../../utils/auth"; // Import util untuk JWT

// Gunakan fungsi bawaan dari nuxt-auth-utils
export default defineOAuthGoogleEventHandler({
  async onSuccess(event, { user }) {
    // "user" berisi data dari Google (email, name, picture)

    // 1. Cek apakah user sudah ada di Postgres
    let existingUser = await db.query.users.findFirst({
      where: eq(users.email, user.email), // Menggunakan operator eq dari drizzle-orm
    });

    // 2. Jika belum ada, Register (Insert via Drizzle)
    if (!existingUser) {
      const insertedUsers = await db
        .insert(users)
        .values({
          email: user.email,
          fullName: user.name,
          authProvider: "google",
        })
        .returning();

      existingUser = insertedUsers[0];
      try {
        await db.insert(wallets).values({
          userId: existingUser!.id,
          balance: 3,
        });
      } catch (error) {
        console.error("Error creating wallet:", error);
      }
    }
    // 3. Set Sesi Login via nuxt-auth-utils
    await setUserSession(event, {
      user: {
        id: existingUser!.id,
        email: existingUser!.email,
        fullName: existingUser!.fullName,
      },
      loggedInAt: new Date().toISOString(),
    });

    // Generate token JWT untuk sinkronisasi dengan metode auth kita
    const token = generateToken({
      userId: existingUser!.id,
      email: existingUser!.email,
      fullName: existingUser!.fullName,
    });

    // 4. Kembalikan user ke Halaman Login untuk diproses client lalu ke /dashboard
    return sendRedirect(event, `/login?token=${token}`);
  },

  // Jika gagal
  onError(event, error) {
    console.error("Google OAuth error:", error);
    return sendRedirect(event, "/login?error=" + encodeURIComponent(error.message || "Google_Auth_Failed"));
  },
});
