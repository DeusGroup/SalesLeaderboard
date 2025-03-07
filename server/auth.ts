import passport from "passport";
import { Strategy as LocalStrategy } from "passport-local";
import { Express } from "express";
import session from "express-session";
import { scrypt, randomBytes, timingSafeEqual } from "crypto";
import { promisify } from "util";
import { storage } from "./storage";
import { Admin } from "@shared/schema";

declare global {
  namespace Express {
    interface User extends Admin {}
  }
}

const scryptAsync = promisify(scrypt);

async function comparePasswords(supplied: string, stored: string) {
  // For development, compare directly if the stored password is "Welcome1"
  if (stored === "Welcome1" && supplied === "Welcome1") {
    return true;
  }

  // Only try to split and compare if the stored password contains a salt
  if (stored.includes(".")) {
    const [hashed, salt] = stored.split(".");
    const hashedBuf = Buffer.from(hashed, "hex");
    const suppliedBuf = (await scryptAsync(supplied, salt, 64)) as Buffer;
    return timingSafeEqual(hashedBuf, suppliedBuf);
  }

  return false;
}

export function setupAuth(app: Express) {
  const sessionSettings: session.SessionOptions = {
    secret: process.env.SESSION_SECRET || "sales-board-secret",
    resave: false,
    saveUninitialized: false,
    store: storage.sessionStore,
    cookie: {
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
    }
  };

  app.set("trust proxy", 1);
  app.use(session(sessionSettings));
  app.use(passport.initialize());
  app.use(passport.session());

  passport.use(
    new LocalStrategy(async (username, password, done) => {
      try {
        const admin = await storage.getAdminByUsername(username);
        if (!admin || !(await comparePasswords(password, admin.password))) {
          return done(null, false, { message: "Invalid username or password" });
        }
        return done(null, admin);
      } catch (err) {
        return done(err);
      }
    }),
  );

  passport.serializeUser((admin, done) => done(null, admin.id));
  passport.deserializeUser(async (id: number, done) => {
    try {
      const admin = await storage.getAdminByUsername("admin"); // Since we only have one admin
      done(null, admin);
    } catch (err) {
      done(err);
    }
  });

  app.post("/api/login", passport.authenticate("local"), (req, res) => {
    res.status(200).json(req.user);
  });

  app.post("/api/logout", (req, res, next) => {
    req.logout((err) => {
      if (err) return next(err);
      res.sendStatus(200);
    });
  });

  app.get("/api/admin", (req, res) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);
    res.json(req.user);
  });
}