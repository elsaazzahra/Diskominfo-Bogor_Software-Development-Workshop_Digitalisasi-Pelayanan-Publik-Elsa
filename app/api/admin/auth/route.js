import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { Admin, initializeDatabase } from "@/lib/sequelize";

export async function POST(request) {
  try {
    // Ensure DB is initialized (matches other API routes)
    await initializeDatabase();

    const { email, password } = await request.json();
    const identifier = (email || "").trim();
    
    console.log("🔐 Login attempt:", { identifier, password: "***" });

    // Validate input
    if (!identifier || !password) {
      console.log("❌ Missing username or password");
      return NextResponse.json(
        { message: "Email/Username dan password wajib diisi" },
        { status: 400 }
      );
    }

    // Find admin by email first, then fallback to username
    console.log("🔍 Searching for admin with email or username:", identifier);
    const admin = await Admin.findOne({
      where: { email: identifier },
      attributes: ["email", "password"],
    });

    console.log("👤 Admin found:", admin ? "Yes" : "No");
    if (admin) {
      console.log("📋 Admin details:", {
        id: admin.id,
        username: admin.username,
        email: admin.email,
        password_length: admin.password ? admin.password.length : 0,
      });
    }

    if (!admin) {
      console.log("❌ Admin not found or inactive");
      return NextResponse.json(
        { message: "Kredensial tidak valid" },
        { status: 401 }
      );
    }

    // Verify password: bcrypt if looks like hash, else plaintext
    let isMatch = false;
    const stored = admin.password || "";
    const looksLikeBcrypt = /^\$2[aby]?\$\d{2}\$/.test(stored);
    if (looksLikeBcrypt) {
      try {
        isMatch = await bcrypt.compare(password, stored);
      } catch (e) {
        console.log("⚠️ Bcrypt compare failed, falling back to plaintext compare");
        isMatch = stored === password;
      }
    } else {
      isMatch = stored === password;
    }
    console.log("🔑 Password matched:", isMatch);

    if (!isMatch) {
      console.log("❌ Password mismatch");
      return NextResponse.json(
        { message: "Kredensial tidak valid" },
        { status: 401 }
      );
    }

    console.log("✅ Login successful for:", admin.email);

    // Return success response (without password)
    const { password: _, ...adminWithoutPassword } = admin.toJSON();

    return NextResponse.json({
      message: "Login berhasil",
      admin: adminWithoutPassword,
    });
  } catch (error) {
    console.error("❌ Admin login error:", error);
    return NextResponse.json(
      { message: "Terjadi kesalahan server" },
      { status: 500 }
    );
  }
}
