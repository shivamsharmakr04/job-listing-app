// src/Components/SocialAuthButtons.jsx
import React, { useState } from "react";
import { apiSocialAuth } from "../api";
import "./SocialAuthButtons.css";

export default function SocialAuthButtons({
  role = "jobseeker",
  mode = "signin", // "signin" | "signup"
  onSuccess,
  onError,
}) {
  const [loadingProvider, setLoadingProvider] = useState(null);
  const [modalProvider, setModalProvider] = useState(null);
  const [inputEmail, setInputEmail] = useState("");
  const [inputName, setInputName] = useState("");

  const googleClientId = import.meta.env.VITE_GOOGLE_CLIENT_ID;
  const linkedinClientId = import.meta.env.VITE_LINKEDIN_CLIENT_ID;

  async function handleSocialLogin(provider, email, name, avatar = "", socialId = "") {
    setLoadingProvider(provider);
    if (onError) onError("");

    try {
      const res = await apiSocialAuth({
        email,
        name: name || (provider === "google" ? "Google User" : "LinkedIn Professional"),
        avatar: avatar || (provider === "google" ? "https://cdn-icons-png.flaticon.com/512/300/300221.png" : "https://cdn-icons-png.flaticon.com/512/3536/3536505.png"),
        provider,
        googleId: provider === "google" ? (socialId || `goog_${Date.now()}`) : "",
        linkedinId: provider === "linkedin" ? (socialId || `link_${Date.now()}`) : "",
        role,
      });

      if (!res || !res.token) {
        throw new Error(res?.message || `${provider} authentication failed.`);
      }

      // Save token and user details to localStorage
      localStorage.setItem("jb_token", res.token);
      localStorage.setItem(
        "jb_user",
        JSON.stringify({
          name: res.user.name,
          email: res.user.email,
          id: res.user.id,
          avatar: res.user.avatar,
        })
      );
      localStorage.setItem(
        "jb_auth",
        JSON.stringify({
          role: res.user.role,
          email: res.user.email,
          provider: res.user.provider || provider,
        })
      );

      // Trigger auth event so navigation/header updates state
      window.dispatchEvent(new Event("jb_auth_change"));

      if (onSuccess) {
        onSuccess(res.user);
      }
    } catch (err) {
      console.error(`${provider} auth error:`, err);
      if (onError) {
        onError(err.message || `Failed to sign in with ${provider}.`);
      }
    } finally {
      setLoadingProvider(null);
      setModalProvider(null);
    }
  }

  function triggerProviderFlow(provider) {
    if (provider === "google") {
      if (googleClientId && window.google?.accounts?.id) {
        // Real Google Identity Services client ID configured
        try {
          window.google.accounts.id.initialize({
            client_id: googleClientId,
            callback: (response) => {
              try {
                const payload = JSON.parse(atob(response.credential.split(".")[1]));
                handleSocialLogin("google", payload.email, payload.name, payload.picture, payload.sub);
              } catch {
                handleSocialLogin("google", "user@gmail.com", "Google User");
              }
            },
          });
          window.google.accounts.id.prompt();
          return;
        } catch (e) {
          console.warn("GSI Prompt failed, falling back:", e);
        }
      }

      // Fallback/Demo interactive prompt
      setInputEmail(role === "admin" ? "admin.tech@gmail.com" : "alex.rivers@gmail.com");
      setInputName(role === "admin" ? "Alex Rivers (Admin)" : "Alex Rivers");
      setModalProvider("google");
    } else if (provider === "linkedin") {
      if (linkedinClientId) {
        // LinkedIn OAuth Redirect URL
        const redirectUri = encodeURIComponent(window.location.origin + "/signin");
        const linkedinUrl = `https://www.linkedin.com/oauth/v2/authorization?response_type=code&client_id=${linkedinClientId}&redirect_uri=${redirectUri}&scope=r_liteprofile%20r_emailaddress`;
        window.location.href = linkedinUrl;
        return;
      }

      // Fallback/Demo interactive prompt
      setInputEmail(role === "admin" ? "admin.recruiter@linkedin.com" : "alex.rivers@linkedin.com");
      setInputName(role === "admin" ? "Alex Rivers (Lead Recruiter)" : "Alex Rivers");
      setModalProvider("linkedin");
    }
  }

  function handleModalSubmit(e) {
    e.preventDefault();
    if (!inputEmail.trim()) return;
    handleSocialLogin(modalProvider, inputEmail.trim(), inputName.trim());
  }

  return (
    <div className="social-auth-wrapper">
      <div className="social-divider">
        <span>or continue with social</span>
      </div>

      <div className="social-buttons-row">
        <button
          type="button"
          className="btn-social-auth btn-google"
          onClick={() => triggerProviderFlow("google")}
          disabled={loadingProvider !== null}
        >
          {loadingProvider === "google" ? (
            <span className="social-spinner"></span>
          ) : (
            <svg className="social-icon" viewBox="0 0 24 24">
              <path
                fill="#4285F4"
                d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.82-2.4 3.68v3.05h3.88c2.27-2.09 3.665-5.17 3.665-9.17z"
              />
              <path
                fill="#34A853"
                d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.05c-1.08.72-2.45 1.16-4.05 1.16-3.12 0-5.77-2.1-6.72-4.93H1.27v3.15C3.25 21.3 7.31 24 12 24z"
              />
              <path
                fill="#FBBC05"
                d="M5.28 14.27c-.25-.72-.38-1.49-.38-2.27s.13-1.55.38-2.27V6.58H1.27C.46 8.2.0 10.04.0 12c0 1.96.46 3.8 1.27 5.42l4.01-3.15z"
              />
              <path
                fill="#EA4335"
                d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.31 0 3.25 2.7 1.27 6.58l4.01 3.15c.95-2.83 3.6-4.98 6.72-4.98z"
              />
            </svg>
          )}
          <span>{mode === "signup" ? "Sign up with Google" : "Google / Gmail"}</span>
        </button>

        <button
          type="button"
          className="btn-social-auth btn-linkedin"
          onClick={() => triggerProviderFlow("linkedin")}
          disabled={loadingProvider !== null}
        >
          {loadingProvider === "linkedin" ? (
            <span className="social-spinner"></span>
          ) : (
            <svg className="social-icon" viewBox="0 0 24 24">
              <path
                fill="#0A66C2"
                d="M19 3a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h14m-.5 15.5v-5.3a3.26 3.26 0 0 0-3.26-3.26c-.85 0-1.84.52-2.28 1.3v-1.11h-2.79v8.37h2.79v-4.93c0-.77.62-1.4 1.39-1.4a1.4 1.4 0 0 1 1.4 1.4v4.93h2.75M6.88 8.56a1.68 1.68 0 0 0 1.68-1.68c0-.93-.75-1.69-1.68-1.69a1.69 1.69 0 0 0-1.69 1.69c0 .93.76 1.68 1.69 1.68m1.39 9.94v-8.37H5.5v8.37h2.77z"
              />
            </svg>
          )}
          <span>{mode === "signup" ? "Sign up with LinkedIn" : "LinkedIn"}</span>
        </button>
      </div>

      {/* Social Modal for email confirm */}
      {modalProvider && (
        <div className="social-modal-overlay" onClick={() => setModalProvider(null)}>
          <div className="social-modal-card" onClick={(e) => e.stopPropagation()}>
            <div className="social-modal-header">
              <h3>
                {modalProvider === "google" ? "🌐 Connect Google Account" : "💼 Connect LinkedIn Account"}
              </h3>
              <button
                type="button"
                className="social-modal-close"
                onClick={() => setModalProvider(null)}
              >
                ✕
              </button>
            </div>
            <p className="social-modal-sub">
              Authenticate via {modalProvider === "google" ? "Google / Gmail" : "LinkedIn"} to sign {mode === "signup" ? "up" : "in"} as <strong>{role === "admin" ? "Admin / Employer" : "Job Seeker"}</strong>.
            </p>

            <form onSubmit={handleModalSubmit} className="social-modal-form">
              <div className="input-field">
                <label>Full Name</label>
                <input
                  type="text"
                  value={inputName}
                  onChange={(e) => setInputName(e.target.value)}
                  placeholder="Your Name"
                  required
                />
              </div>

              <div className="input-field">
                <label>{modalProvider === "google" ? "Google / Gmail Address" : "LinkedIn Work Email"}</label>
                <input
                  type="email"
                  value={inputEmail}
                  onChange={(e) => setInputEmail(e.target.value)}
                  placeholder="name@gmail.com"
                  required
                />
              </div>

              <div className="social-modal-actions">
                <button
                  type="button"
                  className="btn-modal-cancel"
                  onClick={() => setModalProvider(null)}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className={`btn-modal-confirm ${modalProvider === "google" ? "google-bg" : "linkedin-bg"}`}
                  disabled={loadingProvider !== null}
                >
                  {loadingProvider ? "Connecting..." : `Confirm ${modalProvider === "google" ? "Google" : "LinkedIn"} Login ➔`}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
