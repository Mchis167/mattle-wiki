"use client";

import BookLayout from "@/components/layout/BookLayout";
import MainCardCharacter from "@/components/detail/MainCardCharacter";

// Figma asset URLs (valid for 7 days — replace with permanent paths)
const CHAR_IMAGE = "https://www.figma.com/api/mcp/asset/9b7b6743-b694-4998-a4b5-6f060c6cc821";

export default function SandboxPage() {
  return (
    <BookLayout>
      <div className="flex flex-col items-center gap-16 py-10 overflow-visible">
        <h1 className="text-4xl font-pixel text-wiki-gold shadow-sm">Component Sandbox</h1>

        <div className="flex flex-wrap gap-16 justify-center items-end px-5">
          {/* Desktop default (hover to see hover state) */}
          <div className="flex flex-col items-center gap-4">
            <MainCardCharacter
              charName="Mchi Do"
              energyCost={7}
              characterImage={CHAR_IMAGE}
              variant="desktop-default"
            />
            <span className="text-wiki-text-muted font-pixel text-[10px] bg-wiki-deep px-3 py-1">
              desktop-default (hover me)
            </span>
          </div>

          {/* Desktop hover (forced) */}
          <div className="flex flex-col items-center gap-4">
            <MainCardCharacter
              charName="Mattle"
              energyCost={7}
              characterImage={CHAR_IMAGE}
              variant="desktop-hover"
            />
            <span className="text-wiki-text-muted font-pixel text-[10px] bg-wiki-deep px-3 py-1">
              desktop-hover (forced)
            </span>
          </div>

          {/* Mobile */}
          <div className="flex flex-col items-center gap-4">
            <MainCardCharacter
              charName="Mchi Do"
              energyCost={7}
              characterImage={CHAR_IMAGE}
              variant="mobile"
            />
            <span className="text-wiki-text-muted font-pixel text-[10px] bg-wiki-deep px-3 py-1">
              mobile
            </span>
          </div>
        </div>

        <div className="mt-10 p-5 bg-wiki-deep/50 border-t border-wiki-divider w-full text-center">
          <p className="text-wiki-text-dimmed font-pixel text-xs">
            MattleWiki Design System - Sandbox v1.0
          </p>
        </div>
      </div>
    </BookLayout>
  );
}
