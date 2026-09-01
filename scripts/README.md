# Asset-authoring utilities

These optional Python utilities reproduce the alignment analysis and landing
scene composites. They are not used by the Next.js runtime or required for
ordinary application development.

Create a disposable virtual environment, then install the isolated authoring
dependencies:

```bash
python3 -m venv .venv-assets
source .venv-assets/bin/activate
python -m pip install -r scripts/requirements.txt
```

The repository's VS Code settings point the Python extension at this isolated
environment. Reload the editor window after creating it if an older interpreter
was already selected for the workspace.

Analyze two source renders:

```bash
python scripts/analyze_scene.py /path/to/main.png /path/to/floor.png
```

Rebuild the committed desktop and mobile WebP assets:

```bash
python scripts/build_landing_composites.py /path/to/main.png /path/to/floor.png
```

Run either command with `--help` for configurable output, alignment, scene
height, and mobile-crop options. Source renders are intentionally supplied as
arguments and are not committed to this repository.
