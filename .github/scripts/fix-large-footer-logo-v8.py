from pathlib import Path
import re

CSS_PATH = Path("footer-signature.css")
START = "/* Footer logo balance v8 — start */"
END = "/* Footer logo balance v8 — end */"

css = CSS_PATH.read_text(encoding="utf-8")

# Keep this migration idempotent if it is ever re-run.
if START in css and END in css:
    before, rest = css.split(START, 1)
    _, after = rest.split(END, 1)
    css = before.rstrip() + after.lstrip()

override = r'''
/* Footer logo balance v8 — start */
/* Keep the accepted compact header/footer marks unchanged; refine only the large signature emblem. */
.signature-wordmark-wrap {
  width: min(100%, 1120px);
  grid-template-columns: clamp(8.25rem, 9.5vw, 10.5rem) max-content;
  column-gap: clamp(1.15rem, 1.8vw, 1.9rem);
  padding-top: clamp(.65rem, 1.1vw, .95rem);
}

.signature-wordmark-wrap::before {
  border-radius: 50%;
  clip-path: circle(49% at 50% 50%);
  background-position: center;
  background-size: 108% 108%;
  box-shadow:
    0 0 0 1px color-mix(in srgb, var(--accent) 18%, transparent),
    inset 0 0 24px rgba(4, 17, 31, .2);
  filter:
    drop-shadow(0 20px 40px rgba(0, 0, 0, .3))
    drop-shadow(0 0 22px color-mix(in srgb, var(--accent) 24%, transparent));
}

.signature-wordmark-wrap::after {
  width: clamp(11rem, 17vw, 18rem);
  height: clamp(11rem, 17vw, 18rem);
  opacity: .72;
  filter: blur(16px);
}

.signature-wordmark {
  padding-left: clamp(1.25rem, 2vw, 2rem);
}

@media (max-width: 1180px) {
  .signature-wordmark-wrap {
    width: min(100%, 930px);
    grid-template-columns: clamp(7.25rem, 10vw, 9rem) max-content;
    column-gap: clamp(1rem, 1.8vw, 1.55rem);
  }

  .signature-wordmark {
    padding-left: clamp(1.1rem, 1.9vw, 1.7rem);
  }
}

@media (max-width: 900px) {
  .signature-wordmark-wrap {
    width: min(100%, 740px);
    grid-template-columns: clamp(6rem, 12vw, 7.4rem) max-content;
    column-gap: clamp(.85rem, 1.7vw, 1.25rem);
  }

  .signature-wordmark {
    padding-left: clamp(.9rem, 1.8vw, 1.25rem);
  }
}

@media (max-width: 700px) {
  .signature-wordmark-wrap {
    width: 100%;
    grid-template-columns: 1fr;
    row-gap: .9rem;
  }

  .signature-wordmark-wrap::before {
    width: clamp(6.75rem, 27vw, 8.4rem);
    background-size: 108% 108%;
  }

  .signature-wordmark-wrap::after {
    width: 12rem;
    height: 12rem;
  }

  .signature-wordmark {
    padding-top: 1rem;
    padding-left: 0;
  }
}
/* Footer logo balance v8 — end */
'''.strip()

CSS_PATH.write_text(css.rstrip() + "\n\n" + override + "\n", encoding="utf-8")

# Force browsers to request the corrected footer stylesheet instead of a cached copy.
for html_path in (
    Path("index.html"),
    Path("case-studies/index.html"),
    Path("photo-gallery/index.html"),
):
    text = html_path.read_text(encoding="utf-8")
    updated, count = re.subn(
        r"footer-signature\.css\?v=\d+",
        "footer-signature.css?v=8",
        text,
    )
    if count != 1:
        raise SystemExit(f"Expected one footer stylesheet reference in {html_path}, found {count}")
    html_path.write_text(updated, encoding="utf-8")

# Ensure this change stays scoped to the large lockup only.
final_css = CSS_PATH.read_text(encoding="utf-8")
if 'site-header .brand-mark' not in final_css or 'footer-brand .brand-mark' not in final_css:
    raise SystemExit("Compact-logo rules were unexpectedly removed")
if 'clip-path: circle(49% at 50% 50%)' not in final_css:
    raise SystemExit("Circular crop was not applied")
