"use client";

import { ExternalLink, Info } from "lucide-react";
import { useState } from "react";
import { Modal } from "@/components/Modal";
import { t, type Locale } from "@/lib/i18n";
import { SITE } from "@/lib/site";

/** Opens the project story in a modal, from anywhere in the app. */
export function AboutButton({ locale }: { locale: Locale }) {
  const [open, setOpen] = useState(false);
  const dict = t(locale);
  const about = dict.ui.about;

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        aria-label={dict.ui.aboutButton}
        className="inline-flex h-9 items-center gap-1.5 rounded-full border border-neutral-300 px-2.5 text-sm font-medium text-neutral-700 hover:border-brand hover:text-brand-text dark:border-neutral-700 dark:text-neutral-200"
      >
        <Info size={16} aria-hidden="true" />
        <span className="hidden lg:inline">{dict.ui.aboutButton}</span>
      </button>
      <Modal open={open} onClose={() => setOpen(false)} title={about.title} closeLabel={dict.ui.close}>
        <div className="space-y-5">
          {[
            [about.goalTitle, about.goal],
            [about.authorTitle, about.author],
            [about.aiTitle, about.ai],
            [about.togetherTitle, about.together],
          ].map(([heading, body]) => (
            <section key={heading} className="space-y-1">
              <h3 className="font-semibold text-brand-text">{heading}</h3>
              <p className="text-neutral-700 dark:text-neutral-300">{body}</p>
            </section>
          ))}
          <a
            href={SITE.github}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex h-10 items-center gap-2 rounded-lg bg-brand px-4 font-semibold text-on-brand hover:bg-emerald-800"
          >
            {about.github}
            <ExternalLink size={16} aria-hidden="true" />
          </a>
        </div>
      </Modal>
    </>
  );
}
