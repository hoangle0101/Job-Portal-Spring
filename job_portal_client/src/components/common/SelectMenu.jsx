import { useState } from 'react';
import Icon from './Icon';

export default function SelectMenu({ value, options, onChange, icon = 'location', ariaLabel = 'Chọn một giá trị' }) {
    const [open, setOpen] = useState(false);
    const selected = options.find((option) => option.value === value) || options[0];

    return (
        <div className={`select-menu ${open ? 'is-open' : ''}`}>
            <button type="button" className="select-menu-trigger" onClick={() => setOpen((current) => !current)} aria-expanded={open} aria-haspopup="listbox" aria-label={ariaLabel}>
                <Icon name={icon} size={17} />
                <span>{selected?.label}</span>
                <Icon name="chevronDown" size={15} className="select-menu-chevron" />
            </button>
            {open && (
                <div className="select-menu-options" role="listbox" aria-label={ariaLabel}>
                    {options.map((option) => (
                        <button type="button" role="option" aria-selected={option.value === value} className={option.value === value ? 'is-selected' : ''} key={option.value} onClick={() => { onChange(option.value); setOpen(false); }}>
                            <span>{option.label}</span>
                            {option.value === value && <span className="select-menu-check">✓</span>}
                        </button>
                    ))}
                </div>
            )}
        </div>
    );
}
