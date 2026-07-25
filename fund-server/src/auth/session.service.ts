import { Injectable } from "@nestjs/common";

/**
 * In-memory session storage
 * In production, use Redis or a database for distributed systems
 */
interface UserSession {
  userId: string;
  email: string;
  token: string;
  loginTime: Date;
  lastActivity: Date;
}

@Injectable()
export class SessionService {
  // Map: email -> active session
  private activeSessions = new Map<string, UserSession>();

  // Map: token -> email (for quick lookup)
  private tokenToEmail = new Map<string, string>();

  /**
   * Check if user is already logged in
   */
  isUserLoggedIn(email: string): boolean {
    return this.activeSessions.has(email);
  }

  /**
   * Get active session for user
   */
  getActiveSession(email: string): UserSession | null {
    return this.activeSessions.get(email) || null;
  }

  /**
   * Create new session (invalidates old one if exists)
   */
  createSession(
    email: string,
    userId: string,
    token: string
  ): { invalidatedOld: boolean; oldToken?: string } {
    const existingSession = this.activeSessions.get(email);
    let oldToken: string | undefined;

    // If user already has an active session, invalidate it
    if (existingSession) {
      oldToken = existingSession.token;
      this.tokenToEmail.delete(oldToken);
    }

    // Create new session
    const newSession: UserSession = {
      userId,
      email,
      token,
      loginTime: new Date(),
      lastActivity: new Date(),
    };

    this.activeSessions.set(email, newSession);
    this.tokenToEmail.set(token, email);

    return {
      invalidatedOld: !!existingSession,
      oldToken,
    };
  }

  /**
   * Remove session (logout)
   */
  removeSession(emailOrToken: string): boolean {
    // Try as email first
    if (this.activeSessions.has(emailOrToken)) {
      const session = this.activeSessions.get(emailOrToken);
      if (session) {
        this.tokenToEmail.delete(session.token);
      }
      this.activeSessions.delete(emailOrToken);
      return true;
    }

    // Try as token
    const email = this.tokenToEmail.get(emailOrToken);
    if (email) {
      this.activeSessions.delete(email);
      this.tokenToEmail.delete(emailOrToken);
      return true;
    }

    return false;
  }

  /**
   * Validate token is still active
   */
  isTokenValid(token: string): boolean {
    return this.tokenToEmail.has(token);
  }

  /**
   * Get session by token
   */
  getSessionByToken(token: string): UserSession | null {
    const email = this.tokenToEmail.get(token);
    if (!email) return null;
    return this.activeSessions.get(email) || null;
  }

  /**
   * Update last activity time
   */
  updateActivity(email: string): void {
    const session = this.activeSessions.get(email);
    if (session) {
      session.lastActivity = new Date();
    }
  }

  /**
   * Get all active sessions (for admin purposes)
   */
  getAllActiveSessions(): UserSession[] {
    return Array.from(this.activeSessions.values());
  }

  /**
   * Clean up expired sessions (optional: implement TTL cleanup)
   */
  cleanupExpiredSessions(maxAge: number = 24 * 60 * 60 * 1000): void {
    const now = Date.now();
    for (const [email, session] of this.activeSessions.entries()) {
      const age = now - session.lastActivity.getTime();
      if (age > maxAge) {
        this.removeSession(email);
      }
    }
  }
}
