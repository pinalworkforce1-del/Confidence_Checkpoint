# Level Up - Confidence Checkpoint

GitHub Pages package for the 16-scene Confidence Checkpoint experience.

## Recommended repository name

Create a public repository named exactly:

`Confidence_Checkpoint`

That produces this GitHub Pages address:

`https://pinalworkforce1-del.github.io/Confidence_Checkpoint/`

## Upload and deploy

1. Extract the ZIP package.
2. Upload the extracted files and folders to the root of the new repository. Do not upload the ZIP itself.
3. If GitHub does not accept the hidden `.github` folder, open the included `deploy-pages.yml`, then use **Add file -> Create new file** and name the file `.github/workflows/deploy-pages.yml`. Paste the contents and commit it.
4. Open **Settings -> Pages** and set **Source** to **GitHub Actions**.
5. Open **Actions -> Deploy Confidence Checkpoint** and confirm that the workflow completes successfully.

No GitHub secrets are required. The browser uses the existing Supabase publishable key; participant rows remain protected by Row Level Security.

## Supabase connection

- Module ID: `confidence-checkpoint`
- Profile source: `profiles.display_name`
- Progress table: `module_progress`
- Prerequisites: completed `discovery` and `resume-district` rows
- Saved fields: `journey_state`, `xp`, `is_complete`, `updated_at`, and `completed_at`
- Completion returns to the Level Up Portal with `completed=confidence-checkpoint&next=interview-arena`.

The module reads the existing Supabase session shared across the `pinalworkforce1-del.github.io` origin. If the session has expired, it refreshes it using the stored refresh token. Unsigned participants are routed back to My Journey to sign in.

## Portal routing update

After this repository is deployed, update the portal's progression query to include `confidence-checkpoint`. The routing order becomes:

1. Discovery
2. Resume District
3. Confidence Checkpoint
4. Interview Arena

A framework-neutral reference is included in `integration/portal-routing-reference.js`. The final portal patch should be applied to the portal's existing component rather than copying the file blindly.

## Resume District behavior

Resume District does not need a database schema change. It should continue saving `resume-district` and return to My Journey when complete. The portal then sees that Resume District is complete and opens Confidence Checkpoint as the next step.

## Configuration

`config.js` contains the public Supabase project URL, publishable key, module IDs, and Level Up route URLs. Never place a Supabase secret or service-role key in this repository.
