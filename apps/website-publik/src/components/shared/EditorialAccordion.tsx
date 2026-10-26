import React, { useId, useState } from 'react';
import { ChevronDown } from 'lucide-react';

type AccordionItem = {
  id: string;
  title: string;
  eyebrow?: string;
  content: React.ReactNode;
};

type EditorialAccordionProps = {
  items: AccordionItem[];
  initialOpen?: string | null;
  className?: string;
  headingLevel?: 'h2' | 'h3' | 'h4';
};

/**
 * Accordion satu-panel yang bisa dioperasikan dengan keyboard.
 * Pemisahan heading, tombol dan panel membuat pola yang sama dapat digunakan
 * pada sejarah, layanan, arsip publik, dan pusat bantuan.
 */
export const EditorialAccordion: React.FC<EditorialAccordionProps> = ({
  items,
  initialOpen = null,
  className = '',
  headingLevel: Heading = 'h3',
}) => {
  const [openId, setOpenId] = useState<string | null>(initialOpen);
  const reactId = useId().replace(/:/g, '');

  return (
    <div className={`divide-y divide-[#dae4eb] border-y border-[#dae4eb] bg-white ${className}`}>
      {items.map((item) => {
        const expanded = openId === item.id;
        const buttonId = `accordion-trigger-${reactId}-${item.id}`;
        const panelId = `accordion-panel-${reactId}-${item.id}`;
        return (
          <section key={item.id}>
            <Heading className="m-0">
              <button
                id={buttonId}
                type="button"
                aria-expanded={expanded}
                aria-controls={panelId}
                onClick={() => setOpenId(expanded ? null : item.id)}
                className="group flex min-h-[68px] w-full items-center justify-between gap-5 px-4 py-4 text-left transition-colors hover:bg-[#f3f7fa] focus-visible:outline focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-[#005BAC] sm:px-6"
              >
                <span className="block min-w-0">
                  {item.eyebrow && <span className="mb-1 block text-[11px] font-semibold uppercase tracking-[0.075em] text-black">{item.eyebrow}</span>}
                  <span className="block text-[15px] font-semibold leading-6 text-[#1b384e] sm:text-base">{item.title}</span>
                </span>
                <ChevronDown aria-hidden="true" size={19} className={`shrink-0 text-[#47738d] transition-transform duration-150 ${expanded ? 'rotate-180' : ''}`} />
              </button>
            </Heading>
            <div id={panelId} role="region" aria-labelledby={buttonId} hidden={!expanded} className="border-t border-[#e9eff3] bg-[#fafcfd] px-4 py-5 text-[14px] leading-7 text-black sm:px-6 sm:py-6">
              {item.content}
            </div>
          </section>
        );
      })}
    </div>
  );
};

