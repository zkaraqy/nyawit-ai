// server/api/auth/google.get.ts
import { db } from "../../../server/database/db"; // Pastikan path ke db.ts Anda sesuai
import { users } from "../../../server/database/schema"; // Import schema tabel users
import { eq } from "drizzle-orm"; // Import operator Drizzle

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
          // Karena kita sudah buat passwordHash jadi nullable, tidak perlu diisi.
        })
        .returning();

      existingUser = insertedUsers[0];
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

    // 4. Kembalikan user ke Halaman Utama / Dashboard
    return sendRedirect(event, "/dashboard");
  },

  // Jika gagal
  onError(event, error) {
    console.error("Google OAuth error:", error);
    return sendRedirect(event, "/login?error=Google_Auth_Failed");
  },
});
