import { useState, useEffect, useRef } from "react";

const Select = ({
  label,
  options = [],
  value,
  onChange,
  multi = false,
  searchable = false,
  serverSearch = false,
  onSearch,
  placeholder = "Select...",
  disabled = false,
  compact = false,
}) => {
  const [open, setOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const dropdownRef = useRef(null);
  const inputRef = useRef(null);

  // FIX 1: Only sync searchTerm for single-select
  // For multi, searchTerm is an independent filter — never overwrite it from value
  useEffect(() => {
    if (!multi) {
      setSearchTerm(value ? value.label || "" : "");
    }
  }, [value, multi]);

  useEffect(() => {
    if (searchable && serverSearch && onSearch && open) {
      onSearch(searchTerm);
    }
  }, [searchTerm, open]);

  useEffect(() => {
    const handler = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setOpen(false);
        if (!multi && value) setSearchTerm(value.label);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [value, multi]);

  const filteredOptions =
    searchable && !serverSearch
      ? options.filter((o) =>
          o.label.toLowerCase().includes(searchTerm.toLowerCase())
        )
      : options;

  const handleSelect = (opt) => {
    if (multi) {
      const arr = Array.isArray(value) ? value : [];
      if (arr.some((v) => v.value === opt.value)) {
        onChange(arr.filter((v) => v.value !== opt.value));
      } else {
        onChange([...arr, opt]);
      }
      setSearchTerm(""); // clear filter text after picking, keep dropdown open
      inputRef.current?.focus();
    } else {
      onChange(opt);
      setSearchTerm(opt.label);
      setOpen(false);
    }
  };

  const removeTag = (e, opt) => {
    e.stopPropagation();
    onChange((Array.isArray(value) ? value : []).filter((v) => v.value !== opt.value));
  };

  const clearAll = (e) => {
    e.stopPropagation();
    onChange(multi ? [] : null);
    setSearchTerm("");
    setOpen(false);
  };

  const selectedArr = Array.isArray(value) ? value : [];
  const hasValue = multi ? selectedArr.length > 0 : !!value;

  return (
    <div className="relative w-full" ref={dropdownRef}>
      {label && (
        <label className="block mb-1 font-medium text-[#222831]">{label}</label>
      )}

      {/* FIX 2: Multi-select shows tags inside the box */}
      <div
        onClick={() => { if (!disabled) { setOpen(true); inputRef.current?.focus(); } }}
        className={`flex flex-wrap items-center gap-1.5 px-2.5 ${compact ? "py-1" : "py-1.5"} pr-9 ${compact ? "rounded" : "rounded-2xl"} border border-[#393E46] bg-[#DFD0B8] ${compact ? "min-h-[30px]" : "min-h-[42px]"} relative cursor-text ${disabled ? "opacity-60 cursor-not-allowed" : ""}`}
      >
        {/* Render tags for multi */}
        {selectedArr.map((opt) => (
          <span
            key={opt.value}
            className="inline-flex items-center gap-1 bg-[#948979] text-white text-xs font-medium px-2 py-0.5 rounded"
          >
            {opt.label}
            {!disabled && (
              <span
                onClick={(e) => removeTag(e, opt)}
                className="cursor-pointer text-sm leading-none opacity-85 hover:opacity-100"
              >
                ×
              </span>
            )}
          </span>
        ))}

        <input
          ref={inputRef}
          type="text"
          value={searchTerm}
          placeholder={hasValue && multi ? "" : placeholder}
          onFocus={() => { if (!disabled) setOpen(true); }}
          onChange={(e) => { if (!disabled) { setSearchTerm(e.target.value); setOpen(true); } }}
          disabled={disabled}
          className={`flex-1 ${compact ? "min-w-[40px] text-xs" : "min-w-[80px] text-sm"} border-none outline-none bg-transparent text-[#222831] p-0 disabled:cursor-not-allowed`}
        />

        {/* Clear button */}
        {hasValue && !disabled && (
          <span
            onClick={clearAll}
            className="absolute right-3 top-1/2 -translate-y-1/2 cursor-pointer text-[#222831] opacity-50 hover:opacity-80 text-base leading-none"
          >
            ×
          </span>
        )}
      </div>

      {open && filteredOptions.length > 0 && (
        <ul className="absolute w-full mt-1 bg-[#DFD0B8] border border-[#393E46] rounded-xl max-h-48 overflow-y-auto z-50 shadow-lg">
          {filteredOptions.map((opt) => {
            const isSelected = multi
              ? selectedArr.some((v) => v.value === opt.value)
              : value?.value === opt.value;

            return (
              <li
                key={opt.value}
                onClick={() => handleSelect(opt)}
                className={`px-3 py-2 cursor-pointer transition-colors ${
                  isSelected
                    ? "bg-[#948979] text-white"
                    : "hover:bg-[#393E46] hover:text-white"
                }`}
              >
                {opt.label}
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
};

export default Select;