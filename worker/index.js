import { onRequestGet as getGithubBriefing } from "../functions/api/github-briefing.js";

function json(data, init = {}) {
  return Response.json(data, init);
}

export default {
  async fetch(request, env) {
    const url = new URL(request.url);

    if (url.pathname === "/api/github-briefing") {
      if (request.method !== "GET") {
        return json({ error: "method_not_allowed" }, { status: 405 });
      }

      return getGithubBriefing({ env });
    }

    if (url.pathname.startsWith("/api/")) {
      return json({ error: "not_found" }, { status: 404 });
    }

    return env.ASSETS.fetch(request);
  },
};
