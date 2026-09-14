# Native source fixture

One authored skill, one arithmetic script, one inert hook and provider-native metadata.
The Codex manifest/marketplace started from the installed Plugin Creator scaffold;
the Claude compatibility manifest/catalog use the official native format.
`personal` here is an isolated fixture marketplace name, never the owner's profile.

Do not enable this fixture outside ignored `.lab-runs/f-*` repositories. Its hook
refuses other working directories. Installers, updates, and cache mutation run
only with disposable child-process config directories. No real authentication is copied.

All fixture source is synthetic; SPDX-License-Identifier: MIT. Native harness binaries
retain their upstream licenses. Test artifacts must distinguish loader/CLI checks
from model dispatch and hook trust enforcement.
