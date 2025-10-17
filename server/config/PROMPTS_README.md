# AI Prompts Configuration Guide

This guide explains how to customize the AI prompts used throughout Aurora Journal.

## Overview

All AI prompts are stored in `prompts.json` in this directory. The prompts control how the AI assistant:
- Generates reflection questions
- Enhances journal entries
- Integrates user answers
- And more (future features)

## Configuration File Structure

The `prompts.json` file contains:

```json
{
  "promptName": {
    "systemPrompt": "Role/context for the AI",
    "template": "The actual prompt with {placeholders}",
    "temperature": 0.5,
    "maxOutputTokens": 1024,
    "description": "What this prompt does"
  }
}
```

## Currently Active Prompts

### 1. Question Generation (`questionGeneration`)

**Purpose**: Generates 2-3 thoughtful questions to help users reflect deeper on their writing.

**Placeholders**:
- `{customInstructions}` - User's custom AI instructions from settings
- `{entryExcerpt}` - Last 200-300 characters of the journal entry

**Settings**:
- Temperature: `0.7` (moderately creative)
- Max tokens: `200`

**Customization Tips**:
- Adjust temperature higher (0.8-0.9) for more creative, varied questions
- Adjust temperature lower (0.5-0.6) for more predictable, focused questions
- Modify the template to change the style of questions (e.g., more casual, more formal)
- Edit `fallbackQuestions` array for default questions when AI fails

### 2. Entry Enhancement (`entryEnhancement`)

**Purpose**: Rewrites journal entries for better coherence while preserving authenticity.

**Placeholders**:
- `{customInstructions}` - User's custom AI instructions
- `{content}` - The full journal entry text

**Settings**:
- Temperature: `0.5` (balanced, consistent)
- Max tokens: `2048`

**Customization Tips**:
- Lower temperature (0.3-0.4) for more conservative, minimal changes
- Higher temperature (0.6-0.7) for more creative rewrites
- Modify template to emphasize specific aspects (e.g., "preserve humor", "add transitions")

## How to Edit Prompts

### Step 1: Open the Configuration File

```bash
code server/config/prompts.json
```

Or use any text editor:
```bash
notepad server/config/prompts.json
```

### Step 2: Modify the Prompt Template

Find the prompt you want to change and edit the `template` field. Use `{placeholders}` for dynamic content.

**Example - Making questions more casual:**

Before:
```json
"template": "Based on this journal entry excerpt, generate 2-3 thoughtful, empathetic questions..."
```

After:
```json
"template": "Hey! Check out this journal entry. Come up with 2-3 fun, friendly questions that'll help dig deeper into what they wrote..."
```

### Step 3: Adjust AI Parameters

**Temperature** (0.0 - 1.0):
- `0.0-0.3`: Very focused and deterministic (same input → same output)
- `0.4-0.7`: Balanced creativity and consistency (recommended)
- `0.8-1.0`: Highly creative and varied (unpredictable)

**Max Output Tokens**:
- `50-200`: Short responses (questions, summaries)
- `500-1000`: Medium responses (paragraph insights)
- `1000-2048`: Long responses (full entry rewrites)

### Step 4: Restart the Server

Changes take effect on server restart:

```bash
npm start
```

The server automatically reloads the configuration on startup.

## Advanced Customization

### Adding Custom Instructions Integration

User custom instructions are automatically prepended to all prompts when the `{customInstructions}` placeholder is used.

**Example**: If a user sets custom instructions to "Always write in a poetic style", the AI will receive:

```
Always write in a poetic style

[Your prompt template here...]
```

### Creating Prompts for Future Features

The configuration includes templates for future features:
- `questionAnswering` - Integrating user answers into entries
- `entrySummarization` - Creating brief summaries
- `moodDetection` - Analyzing emotional tone
- `writingPrompts` - Generating creative prompts
- `weeklyInsights` - Analyzing weekly patterns

These aren't used yet but are ready for implementation.

## Testing Your Prompt Changes

1. **Edit the prompt** in `prompts.json`
2. **Restart the server**: `npm start`
3. **Test in the app**:
   - For question generation: Write an entry and pause for 2-3 seconds
   - For enhancement: Click the "Enhance" button
4. **Iterate**: Adjust based on the quality of AI responses

## Best Practices

### ✅ DO:
- Keep prompts clear and specific
- Use {placeholders} for dynamic content
- Test changes with real journal entries
- Adjust temperature based on desired creativity
- Document your changes in comments

### ❌ DON'T:
- Remove required placeholders (the code expects them)
- Set temperature above 1.0 or below 0.0
- Make prompts too long (wastes tokens and time)
- Forget to restart the server after changes
- Remove the fallback questions array

## Example Prompt Modifications

### Make Questions More Specific

**Before**:
```json
"Focus on emotions, details, and thoughts."
```

**After**:
```json
"Focus specifically on sensory details (what they saw, heard, felt), emotional reactions, and the impact of this moment on their day."
```

### Add Personality to Enhancement

**Before**:
```json
"Rewrite this journal entry to be more coherent..."
```

**After**:
```json
"Polish this journal entry like a skilled editor would - fix awkward phrasing, add smooth transitions, and organize thoughts clearly, but keep every bit of personality and authenticity intact..."
```

### Adjust for Different Writing Styles

You can create style-specific instructions:

```json
"template": "{customInstructions}\n\nIMPORTANT: The user prefers {writingStyle} writing. Adjust your tone accordingly.\n\n[rest of prompt]"
```

## Troubleshooting

### AI Returns Unexpected Format
- Check that your prompt includes clear formatting instructions
- Add example output in the prompt
- Lower the temperature for more consistent formatting

### AI Ignores Instructions
- Make instructions more explicit and specific
- Place critical instructions at the start and end of prompt
- Reduce prompt complexity - simpler is often better

### Responses Too Similar
- Increase temperature (0.1-0.2 higher)
- Add variety instructions: "Vary your approach each time"

### Responses Too Random
- Decrease temperature (0.1-0.2 lower)
- Add consistency instructions: "Maintain a consistent style"

## Need Help?

- **Review examples**: See the default prompts in the config file
- **Test incrementally**: Change one thing at a time
- **Check logs**: Server console shows errors if config is invalid
- **Restore defaults**: Keep a backup of original `prompts.json`

---

**Configuration Version**: 1.0.0
**Last Updated**: October 17, 2025
**Model**: gemini-2.0-flash-exp
