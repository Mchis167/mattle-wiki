import BookLayout from "@/components/layout/BookLayout";
import PageControlButton from "@/components/ui/PageControlButton";

export default function TestPaginationPage() {
  return (
    <BookLayout>
      <div className="flex flex-col items-center justify-center h-full gap-8 p-10 bg-wiki-bg font-pixel">
        <h1 className="text-2xl text-wiki-gold">PageControlButton Testing</h1>
        
        <div className="flex flex-col gap-6">
          <div className="flex items-center gap-10">
            <div className="flex flex-col items-center gap-2">
              <span className="text-xs text-wiki-text-muted">Default Left</span>
              <PageControlButton direction="left" />
            </div>
            <div className="flex flex-col items-center gap-2">
              <span className="text-xs text-wiki-text-muted">Default Right</span>
              <PageControlButton direction="right" />
            </div>
          </div>

          <div className="flex items-center gap-10">
            <div className="flex flex-col items-center gap-2">
              <span className="text-xs text-wiki-text-muted">Disabled Left</span>
              <PageControlButton direction="left" disabled />
            </div>
            <div className="flex flex-col items-center gap-2">
              <span className="text-xs text-wiki-text-muted">Disabled Right</span>
              <PageControlButton direction="right" disabled />
            </div>
          </div>
        </div>

        <div className="mt-10 p-4 border border-wiki-border rounded bg-wiki-surface text-wiki-text text-sm max-w-md">
          <p>
            <strong>Note:</strong> Since we are in a headless environment, we cannot see the 
            visuals directly. This page serves as a target for manual verification by the user 
            or for confirming build compatibility.
          </p>
        </div>
      </div>
    </BookLayout>
  );
}
