# OpenAI API Setup Guide

This guide will walk you through setting up your OpenAI API key in the Ai Writer extension.

## Step 1: Get Your OpenAI API Key

If you haven't already:
1. Go to [https://platform.openai.com/api-keys](https://platform.openai.com/api-keys)
2. Sign in or create an account
3. Click **"Create new secret key"**
4. Give it a name (e.g., "Ai Writer Extension")
5. **Copy the key immediately** - you won't be able to see it again!
   - It should look like: `sk-proj-...` or `sk-...`

⚠️ **Important**: Keep your API key secret! Never share it publicly.

## Step 2: Load the Extension in Chrome

1. Open Chrome browser
2. Go to `chrome://extensions/` (paste this in the address bar)
3. Enable **Developer mode** (toggle switch in the top-right corner)
4. Click **"Load unpacked"** button
5. Navigate to and select the `Ai Writer` folder
6. The extension should now appear in your extensions list

## Step 3: Open Extension Settings

You have two ways to open the settings:

**Method A: From Extension Icon**
1. Click the Ai Writer extension icon in Chrome's toolbar
2. Click the settings (⚙️) button in the popup

**Method B: Right-click Extension**
1. Right-click the Ai Writer extension icon
2. Select **"Options"**

## Step 4: Configure Your API Settings

In the settings page, you'll see three fields:

### API Key *
- **Paste your OpenAI API key here**
- Example: `sk-proj-abc123...`
- This field is required

### API Endpoint
- **Default value**: `https://api.openai.com/v1/chat/completions`
- **You can leave this as-is** for standard OpenAI
- Only change if you're using Azure OpenAI or another provider

### Model
- **Default value**: `gpt-4o-mini`
- **Recommended models**:
  - `gpt-4o-mini` - Fast and affordable (recommended)
  - `gpt-4o` - More capable, higher cost
  - `gpt-4-turbo` - Very capable
  - `gpt-3.5-turbo` - Older, cheaper option

## Step 5: Save and Test

1. **Click "Save Settings"** button
   - You should see a green "Settings saved successfully!" message

2. **Click "Test Connection"** button
   - This will verify your API key works
   - You should see "Connection successful! API is working correctly."
   - If you see an error, check the troubleshooting section below

## Step 6: Start Using the Extension!

### Using Context Menu (Right-click):
1. Select any text on a webpage
2. Right-click
3. Choose an option:
   - "Rewrite (Professional)"
   - "Fix grammar & spelling"
   - "Shorten"
   - "Expand"
   - "Make it friendly"
   - "Translate"

### Using Extension Popup:
1. Select text on a webpage
2. Click the Ai Writer extension icon
3. Choose a mode and click "Rewrite"

## Troubleshooting

### "Connection failed" Error

**Check these:**
1. ✅ API key is correct (starts with `sk-`)
2. ✅ No extra spaces before/after the API key
3. ✅ You have credits/billing set up on your OpenAI account
4. ✅ Internet connection is working
5. ✅ API endpoint URL is correct

**Common Error Messages:**

- **"Invalid API key"**: Your API key is wrong or expired
  - Solution: Generate a new key at platform.openai.com

- **"Insufficient quota"**: You've run out of credits
  - Solution: Add billing info at platform.openai.com/billing

- **"Rate limit exceeded"**: Too many requests
  - Solution: Wait a moment and try again

- **"Model not found"**: The model name is incorrect
  - Solution: Use `gpt-4o-mini`, `gpt-4o`, or `gpt-3.5-turbo`

### "API key not configured" Error

- Go back to settings and make sure you clicked "Save Settings"
- The key should be saved in Chrome's storage

### Extension Not Working

1. Refresh the page you're trying to use it on
2. Check that the extension is enabled in `chrome://extensions/`
3. Try reloading the extension (click the refresh icon on the extension card)

## OpenAI Pricing (as of 2024)

- **gpt-4o-mini**: ~$0.15 per 1M input tokens, ~$0.60 per 1M output tokens
- **gpt-4o**: ~$2.50 per 1M input tokens, ~$10 per 1M output tokens
- **gpt-3.5-turbo**: ~$0.50 per 1M input tokens, ~$1.50 per 1M output tokens

*Prices may vary. Check [OpenAI Pricing](https://openai.com/pricing) for current rates.*

**Tip**: For most text rewriting tasks, `gpt-4o-mini` is perfect and very affordable!

## Security Notes

- ✅ Your API key is stored **locally** in Chrome (not sent to any server)
- ✅ Only your configured API endpoint receives your text
- ✅ The extension doesn't collect or store your data
- ⚠️ Keep your API key secret - don't share it or commit it to public repositories

## Need Help?

- Check OpenAI API documentation: [https://platform.openai.com/docs](https://platform.openai.com/docs)
- OpenAI Support: [https://help.openai.com](https://help.openai.com)
- Check your API usage: [https://platform.openai.com/usage](https://platform.openai.com/usage)

---

**You're all set!** 🎉 Start selecting text and rewriting with AI!
