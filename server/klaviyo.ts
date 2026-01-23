import { Router } from "express";

const klaviyoRouter = Router();

// Klaviyo API endpoint for subscribing users
klaviyoRouter.post("/subscribe", async (req, res) => {
  try {
    const { email, firstName, source } = req.body;

    if (!email) {
      return res.status(400).json({ error: "Email is required" });
    }

    // Check if Klaviyo API key is configured
    const klaviyoApiKey = process.env.KLAVIYO_API_KEY;
    const klaviyoListId = process.env.KLAVIYO_LIST_ID;

    if (!klaviyoApiKey || !klaviyoListId) {
      // Klaviyo not configured, just return success (email already saved to our DB)
      console.log("[Klaviyo] API key not configured, skipping Klaviyo sync");
      return res.json({ success: true, message: "Subscribed (Klaviyo not configured)" });
    }

    // Subscribe to Klaviyo list using their API v3
    const response = await fetch("https://a.klaviyo.com/api/profile-subscription-bulk-create-jobs/", {
      method: "POST",
      headers: {
        "Authorization": `Klaviyo-API-Key ${klaviyoApiKey}`,
        "Content-Type": "application/json",
        "revision": "2024-02-15",
      },
      body: JSON.stringify({
        data: {
          type: "profile-subscription-bulk-create-job",
          attributes: {
            profiles: {
              data: [
                {
                  type: "profile",
                  attributes: {
                    email: email,
                    first_name: firstName || undefined,
                    properties: {
                      source: source || "website",
                      signup_date: new Date().toISOString(),
                    },
                  },
                },
              ],
            },
            historical_import: false,
          },
          relationships: {
            list: {
              data: {
                type: "list",
                id: klaviyoListId,
              },
            },
          },
        },
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("[Klaviyo] API error:", errorText);
      // Don't fail the request, email is already in our database
      return res.json({ success: true, message: "Subscribed (Klaviyo sync failed)" });
    }

    console.log("[Klaviyo] Successfully subscribed:", email);
    return res.json({ success: true, message: "Subscribed to Klaviyo" });
  } catch (error) {
    console.error("[Klaviyo] Error:", error);
    // Don't fail the request, email is already in our database
    return res.json({ success: true, message: "Subscribed (Klaviyo error)" });
  }
});

export default klaviyoRouter;
