import React from "react";

const Modal = ({
  isOpen,
  title,
  children,
  onClose,
  footer,
  width = "max-w-2xl",
}) => { 
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/60"
        onClick={onClose}
      ></div>

      {/* Modal Container */}
      <div
        className={`relative bg-[#222831] text-[#DFD0B8] rounded-xl shadow-xl w-full ${width} mx-4`}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-[#393E46]">
          <h2 className="text-lg font-semibold">{title}</h2>
          <button
            onClick={onClose}
            className="text-[#948979] hover:text-[#DFD0B8] text-xl"
          >
            ✕
          </button>
        </div>

        {/* Body */}
        <div className="p-5">{children}</div>

        {/* Footer */}
        {footer && (
          <div className="flex justify-end gap-3 px-5 py-4 border-t border-[#393E46]">
            {footer}
          </div>
        )}
      </div>
    </div>
  );
};

export default Modal;
