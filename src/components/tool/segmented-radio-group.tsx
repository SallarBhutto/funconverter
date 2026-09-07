import { useId } from "react";

export interface SegmentedOption<T extends string> {
  id: T;
  label: string;
  description?: string;
}

interface SegmentedRadioGroupProps<T extends string> {
  legend: string;
  options: readonly SegmentedOption<T>[];
  value: T;
  onChange: (value: T) => void;
  disabled?: boolean;
  /** Shown under the group instead of the selected option's description. */
  hint?: string;
}

/**
 * Three-ish way segmented control built on native radios, so keyboard
 * behaviour and form semantics come for free. Used for quality presets and
 * page settings.
 */
export function SegmentedRadioGroup<T extends string>({
  legend,
  options,
  value,
  onChange,
  disabled = false,
  hint,
}: SegmentedRadioGroupProps<T>) {
  const name = useId();
  const selected = options.find((option) => option.id === value);
  const description = hint ?? selected?.description;

  return (
    <fieldset disabled={disabled} className="min-w-0">
      <legend className="text-sm font-medium text-zinc-900">{legend}</legend>
      <div
        className="mt-2 grid gap-2"
        style={{ gridTemplateColumns: `repeat(${options.length}, minmax(0, 1fr))` }}
      >
        {options.map((option) => (
          <label key={option.id} className="cursor-pointer">
            <input
              type="radio"
              name={name}
              value={option.id}
              checked={option.id === value}
              onChange={() => onChange(option.id)}
              className="peer sr-only"
            />
            <span className="flex min-h-11 items-center justify-center rounded-md border border-zinc-300 bg-white px-2 text-center text-sm font-medium text-zinc-700 transition-colors peer-checked:border-accent peer-checked:bg-accent-soft peer-checked:text-accent peer-focus-visible:outline-2 peer-focus-visible:outline-offset-2 peer-focus-visible:outline-accent peer-disabled:cursor-not-allowed peer-disabled:opacity-50">
              {option.label}
            </span>
          </label>
        ))}
      </div>
      {description ? <p className="mt-2 text-sm text-zinc-600">{description}</p> : null}
    </fieldset>
  );
}
