import type { PlatformOption, PlatformId } from '../../config/product'
import './PlatformSelector.css'

interface Props<T extends string> {
  label: string
  name: string
  options: { id: T; label: string; logo?: string; note?: string; disabled?: boolean }[]
  value: T
  onChange: (id: T) => void
}

/** Accessible single-choice selector (native radios, custom skin). */
export function OptionSelector<T extends string>({ label, name, options, value, onChange }: Props<T>) {
  return (
    <fieldset className="selector">
      <legend className="eyebrow">{label}</legend>
      <div className="selector__options">
        {options.map((o) => (
          <label key={o.id} className={`selector__option${o.logo ? ' has-logo' : ''}`}>
            <input
              type="radio"
              name={name}
              value={o.id}
              checked={value === o.id}
              disabled={o.disabled}
              onChange={() => onChange(o.id)}
            />
            <span className="selector__face">
              {o.logo ? (
                <>
                  <img src={o.logo} alt="" aria-hidden="true" />
                  <span className="visually-hidden">{o.label}</span>
                </>
              ) : (
                o.label
              )}
            </span>
          </label>
        ))}
      </div>
    </fieldset>
  )
}

export function PlatformSelector(props: {
  label: string
  platforms: PlatformOption[]
  value: PlatformId
  onChange: (id: PlatformId) => void
}) {
  return (
    <OptionSelector
      label={props.label}
      name="platform"
      options={props.platforms.map((p) => ({ id: p.id, label: p.label, logo: p.logo }))}
      value={props.value}
      onChange={props.onChange}
    />
  )
}
