import { ProgressBar } from "@/components/tool/progress-bar";
import { Button } from "@/components/ui/button";

import { progressLabel, progressPercent, type ConversionProgress } from "../progress";

interface ConversionProgressProps {
  progress: ConversionProgress;
  onCancel: () => void;
}

export function ConversionProgressPanel({ progress, onCancel }: ConversionProgressProps) {
  const label = progressLabel(progress);
  const percent = progressPercent(progress);

  return (
    <div className="rounded-lg border border-zinc-200 bg-zinc-50 p-4">
      <div className="flex items-center justify-between gap-4">
        <p aria-live="polite" aria-atomic="true" className="text-sm font-medium text-zinc-900">
          {label}
        </p>
        <span className="text-sm tabular-nums text-zinc-600">{percent}%</span>
      </div>
      <ProgressBar value={percent} label={label} className="mt-3" />
      <Button variant="secondary" onClick={onCancel} className="mt-4">
        Cancel
      </Button>
    </div>
  );
}
