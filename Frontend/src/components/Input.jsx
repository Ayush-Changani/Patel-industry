import { useRef, useEffect, forwardRef } from "react";

const Input = forwardRef(
  (
    {
      label,
      placeholder,
      type = "text",
      required = false,
      multiline = false,
      rows = 1,
      previewUrl,
      options = [],
      accept,
      maxSizeMB,
      ...props
    },
    ref,
  ) => {
    const textareaRef = useRef(null);

    const adjustHeight = () => {
      if (textareaRef.current) {
        textareaRef.current.style.height = "auto";
        textareaRef.current.style.height =
          textareaRef.current.scrollHeight + "px";
      }
    };

    useEffect(() => {
      adjustHeight();
    }, [props.value]);

    const handleNumericChange = (e) => {
      const value = e.target.value.replace(/\D/g, "");
      props.onChange?.({ ...e, target: { ...e.target, value } });
    };

    const handleKeyDown = (e) => {
      if (type === "number") {
        const allowedKeys = [
          "Backspace",
          "Delete",
          "ArrowLeft",
          "ArrowRight",
          "ArrowUp",
          "ArrowDown",
          "Tab",
        ];
        if (!allowedKeys.includes(e.key) && !/^\d$/.test(e.key))
          e.preventDefault();
      }
    };

    const handleFileChange = (e) => {
      const file = e.target.files[0];
      if (!file) return;
      if (maxSizeMB && file.size > maxSizeMB * 1024 * 1024) {
        alert(`File size must be less than ${maxSizeMB} MB`);
        e.target.value = "";
        return;
      }
      props.onChange?.(e);
    };

    const baseInputClass =
      "px-3 py-2 rounded-2xl border border-[#393E46] focus:border-[#948979] focus:ring-1 focus:ring-[#948979] bg-[#DFD0B8] text-[#222831] placeholder-[#393E46] transition-all duration-200 w-full";

    // CASE 1: Checkbox
    if (type === "checkbox") {
      return (
        <div className="flex items-center space-x-2 py-2">
          <input
            ref={ref}
            type="checkbox"
            id={props.id || label}
            className="w-4 h-4 cursor-pointer accent-[#948979]"
            {...props}
          />
          {label && (
            <label
              htmlFor={props.id || label}
              className="font-medium text-[#222831] cursor-pointer"
            >
              {label} {required && <span className="text-[#948979]">*</span>}
            </label>
          )}
        </div>
      );
    }

    // CASE 2: Radio Group
    if (type === "radio") {
      return (
        <div className="flex flex-col space-y-1 w-full py-1">
          {label && (
            <label className="text-[#222831] font-medium mb-1">
              {label} {required && <span className="text-[#948979]">*</span>}
            </label>
          )}
          <div className="flex flex-wrap gap-6 items-center">
            {options.map((option) => (
              <label
                key={option.value}
                className="flex items-center gap-2 cursor-pointer group"
              >
                <input
                  type="radio"
                  name={props.name}
                  value={option.value}
                  checked={props.value === option.value}
                  className="w-4 h-4 accent-[#948979] cursor-pointer"
                  onChange={() => props.onChange?.(option.value)}
                  disabled={props.disabled}
                />
                <span className="text-sm font-medium text-[#222831] group-hover:text-black transition-colors">
                  {option.label}
                </span>
              </label>
            ))}
          </div>
        </div>
      );
    }

    // CASE 3: Multiline, File, and Standard Text/Number/Date Inputs
    return (
      <div className="flex flex-col space-y-1 w-full">
        {label && (
          <label className="text-[#222831] font-medium">
            {label} {required && <span className="text-[#948979]">*</span>}
          </label>
        )}

        {multiline ? (
          <textarea
            ref={textareaRef}
            rows={rows}
            className={`${baseInputClass} resize-none overflow-hidden`}
            onChange={(e) => {
              adjustHeight();
              props.onChange?.(e);
            }}
            {...props}
          />
        ) : type === "file" ? (
          <div className="flex flex-col gap-2">
            <input
              ref={ref}
              type="file"
              accept={accept}
              className={`${baseInputClass} cursor-pointer file:mr-4 file:py-1 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold`}
              onChange={handleFileChange}
              {...props}
            />
            {previewUrl && (
              <div className="flex items-center">
                <button
                  type="button"
                  className="text-sm font-bold text-[#393E46] hover:underline whitespace-nowrap px-2"
                  onClick={() => window.open(previewUrl, "_blank")}
                >
                  View
                </button>
              </div>
            )}
          </div>
        ) : (
          <input
            ref={ref}
            type={type}
            className={`${baseInputClass} ${type === "date" ? "date-input-dark" : ""}`}
            onChange={type === "number" ? handleNumericChange : props.onChange}
            onKeyDown={handleKeyDown}
            {...props}
          />
        )}

        <style>{`
          input[type="date"].date-input-dark { color-scheme: dark; }
          input[type="date"].date-input-dark::-webkit-calendar-picker-indicator { filter: invert(45%); cursor: pointer; }
        `}</style>
      </div>
    );
  },
);

export default Input;