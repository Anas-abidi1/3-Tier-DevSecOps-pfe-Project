# Complete Jenkins-Slack Integration via Webhook

## PART 1: Create Slack App and Webhook URL

**Step 1: Create Slack App**
1. Go to https://api.slack.com/apps
2. Click **"Create New App"**
3. Choose **"From scratch"**
4. Enter an App Name and select your Workspace
5. Click **Create App**

**Step 2: Enable Webhooks**
1. In the left sidebar → Click **"Incoming Webhooks"**
2. Toggle **"Activate Incoming Webhooks"**

**Step 3: Add Webhook to a Channel**
1. Scroll to the bottom → Click **"Add New Webhook to Workspace"**
2. Select a channel (e.g. `#general`)
3. Click **Allow**
4. Copy the generated Webhook URL, e.g.:
   ```
   https://hooks.slack.com/services/T0XXXX/B0YYYY/ZZZZZ
   ```

> ⚠️ **Never paste the real webhook URL or bot token into a shared doc, PDF, chat, or git repo.**
> Store it only in Jenkins Credentials (see Part 3) or a secrets manager.
> If a token/webhook was ever exposed this way, treat it as compromised and regenerate it immediately in Slack's app settings.

## PART 2: OAuth Scopes Required (only if using bot/token integration, not needed for webhook-only)

If you're **not** using the incoming webhook and want bot integration via token instead, add these scopes:

| OAuth Scope | Description |
|---|---|
| `chat:write` | Send messages as the bot |
| `chat:write.public` | Send messages to public channels not joined |
| `channels:read` | Read public channels |
| `groups:read` | Read private channels |
| `users:read` | Read user info (optional, for mentions) |

To add: **OAuth & Permissions** → **Scopes** → **Add an OAuth Scope** → add the ones you need → **Reinstall to Workspace**.

## PART 3: Store the Webhook URL in Jenkins Credentials

1. Jenkins → **Manage Jenkins** → **Credentials**
2. Add a new **Secret text** credential
3. Set the **ID** to `slack-webhook`
4. Paste the real webhook URL as the **Secret** value (only here — never in a file in the repo)

This matches the `credentialsId: 'slack-webhook'` used in `Jenkinsfile-slack_notifications`.

## PART 4: Run and Verify

**Step 5: Trigger Build**
- Trigger a build in Jenkins
- The Slack channel will show:
  - ✅ Build Passed
  - ❌ Build Failed
