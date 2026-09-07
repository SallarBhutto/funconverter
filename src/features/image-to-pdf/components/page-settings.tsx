import { SegmentedRadioGroup } from "@/components/tool/segmented-radio-group";

import {
  MARGIN_OPTIONS,
  ORIENTATION_OPTIONS,
  PAGE_SIZE_OPTIONS,
  type PageSettings,
} from "../layout";

interface PageSettingsPanelProps {
  settings: PageSettings;
  onChange: (patch: Partial<PageSettings>) => void;
  disabled?: boolean;
}

export function PageSettingsPanel({ settings, onChange, disabled = false }: PageSettingsPanelProps) {
  const fitToImage = settings.pageSize === "fit";

  return (
    <div className="grid gap-5 sm:grid-cols-3">
      <SegmentedRadioGroup
        legend="Page size"
        options={PAGE_SIZE_OPTIONS}
        value={settings.pageSize}
        onChange={(pageSize) => onChange({ pageSize })}
        disabled={disabled}
      />
      <SegmentedRadioGroup
        legend="Orientation"
        options={ORIENTATION_OPTIONS}
        value={settings.orientation}
        onChange={(orientation) => onChange({ orientation })}
        disabled={disabled || fitToImage}
        hint={fitToImage ? "Follows each image when the page fits the image." : undefined}
      />
      <SegmentedRadioGroup
        legend="Margin"
        options={MARGIN_OPTIONS}
        value={settings.margin}
        onChange={(margin) => onChange({ margin })}
        disabled={disabled}
      />
    </div>
  );
}
