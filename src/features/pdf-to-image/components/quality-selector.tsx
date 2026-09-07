import { SegmentedRadioGroup } from "@/components/tool/segmented-radio-group";

import type { QualityPreset, QualityPresetDefinition } from "../formats";

interface QualitySelectorProps {
  presets: readonly QualityPresetDefinition[];
  /** Short format label for the legend, e.g. "JPG" → "JPG quality". */
  formatLabel: string;
  value: QualityPreset;
  onChange: (preset: QualityPreset) => void;
  disabled?: boolean;
}

export function QualitySelector({
  presets,
  formatLabel,
  value,
  onChange,
  disabled = false,
}: QualitySelectorProps) {
  return (
    <SegmentedRadioGroup
      legend={`${formatLabel} quality`}
      options={presets}
      value={value}
      onChange={onChange}
      disabled={disabled}
    />
  );
}
