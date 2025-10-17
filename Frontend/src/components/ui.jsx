import React, { useEffect, useRef, useState, useMemo } from "react";

/* Layout */
export const Container = ({ children }) => <div className="max-w-7xl mx-auto p-4 md:p-8 space-y-6">{children}</div>;
export const Card = ({ className = "", children }) => <div className={`rounded-2xl border border-black/5 dark:border-white/10 bg-white/70 dark:bg-white/5 backdrop-blur shadow-sm ${className}`}>{children}</div>;
export const SectionTitle = ({ title, right }) => (<div className="flex items-center justify-between gap-4"><h3 className="text-lg font-semibold tracking-tight">{title}</h3>{right}</div>);

export const Table = ({ className = "", children }) => <div className="w-full overflow-auto"><table className={`w-full caption-bottom text-sm border border-gray-200 ${className}`}>{children}</table></div>;
export const TableHeadGroup = ({ className = "", children }) => <thead className={`${className}`}>{children}</thead>;
export const TableBody = ({ className = "", children }) => <tbody className={className}>{children}</tbody>;
export const TableRow = ({ className = "", children }) => <tr className={`transition-colors hover:bg-muted/50 data-[state=selected]:bg-muted ${className}`}>{children}</tr>;
export const TableTh = ({ className = "", children, ...props }) => <th className={`h-12 px-4 text-left align-middle font-medium text-muted-foreground [&:has([role=checkbox])]:pr-0 border border-gray-200 ${className}`} {...props}>{children}</th>;
export const TableCell = ({ className = "", children, ...props }) => <td className={`p-4 align-middle [&:has([role=checkbox])]:pr-0 border border-gray-200 ${className}`} {...props}>{children}</td>;

/* Controls */
export const Button = ({ variant = "primary", className = "", disabled, isLoading, children, ...props }) => {
  const base = "inline-flex items-center justify-center gap-2 rounded-xl px-3 py-2 text-sm font-medium transition active:scale-[.98] disabled:opacity-60 disabled:cursor-not-allowed";
  const style = variant === "primary"
    ? "bg-gradient-to-r from-indigo-500 to-violet-500 text-white shadow hover:opacity-95"
    : variant === "soft"
    ? "bg-gray-100 dark:bg-white/10 text-gray-800 dark:text-gray-100 border border-black/5 dark:border-white/10 hover:bg-gray-200/70 dark:hover:bg-white/15"
    : "border border-black/10 dark:border-white/10 bg-transparent hover:bg-black/5 dark:hover:bg-white/5";
  return <button className={`${base} ${style} ${className}`} disabled={disabled || isLoading} {...props}>{isLoading ? <Spinner /> : children}</button>;
};
export const Badge = ({ children }) => <span className="inline-flex items-center px-2 py-0.5 rounded-lg text-xs border border-black/10 dark:border-white/10 bg-gray-50 dark:bg-white/10">{children}</span>;
export const Spinner = ({ label }) => (<div className="flex items-center gap-2 text-sm opacity-80">
  <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="none">
    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"></path>
  </svg>{label ? <span>{label}</span> : null}
</div>);

export const Checkbox = ({ id, label, checked, onChange, className = "", ...props }) => {
  return (
    <label htmlFor={id} className="flex items-center space-x-2 cursor-pointer">
      <input
        type="checkbox"
        id={id}
        checked={checked}
        onChange={onChange}
        className={`form-checkbox h-4 w-4 text-indigo-600 transition duration-150 ease-in-out ${className}`}
        {...props}
      />
      {label && <span className="text-sm text-gray-900 dark:text-gray-100">{label}</span>}
    </label>
  );
};

export const EmptyState = ({ title = "Tidak ada data.", desc = "Silakan tambah data baru atau muat ulang.", children }) => (
  <div className="text-center py-14">
    <div className="mx-auto w-14 h-14 rounded-2xl flex items-center justify-center border border-dashed border-black/10 dark:border-white/10 mb-3">📭</div>
    <div className="font-medium">{title}</div>
    <div className="text-sm opacity-70">{desc}</div>
    {children}
  </div>
);

/* Modal */
export const Modal = ({ isOpen, onClose, title, children, footer }) => {
  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <Card className="max-w-xl w-full p-0 overflow-hidden">
        <div className="flex items-center justify-between px-6 py-4 border-b border-black/5 dark:border-white/10 bg-gradient-to-r from-indigo-600/5 to-violet-600/5">
          <div className="text-base font-semibold">{title}</div>
          <button onClick={onClose} className="p-2 rounded-lg hover:bg-black/5 dark:hover:bg-white/10" aria-label="Tutup modal">✕</button>
        </div>
        <div className="p-6">{children}</div>
        {footer ? <div className="px-6 py-4 border-t border-black/5 dark:border-white/10 bg-gray-50/60 dark:bg-white/5">{footer}</div> : null}
      </Card>
    </div>
  );
};

/* Select & Input */
export const Select = ({ value, onChange, options, placeholder = "Pilih...", name, ...props }) => {
  const [isOpen, setIsOpen] = useState(false); const ref = useRef(null);
  const selectedOption = options.find(option => option.value == value);
  const displayValue = selectedOption ? selectedOption.label : placeholder;

  const handleOptionClick = (optionValue) => { onChange({ target: { name: name, value: optionValue } }); setIsOpen(false); };
  useEffect(() => { const handleClickOutside = (event) => { if (ref.current && !ref.current.contains(event.target)) setIsOpen(false); };
    document.addEventListener("mousedown", handleClickOutside); return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div className="relative" ref={ref}>
      <div className="w-full p-3 rounded-2xl border border-black/10 dark:border-white/10 bg-gray-50 dark:bg-white/10 shadow-sm outline-none focus:ring-4 focus:ring-indigo-200/60 dark:focus:ring-indigo-500/20 flex justify-between items-center cursor-pointer"
        onClick={() => setIsOpen(!isOpen)} tabIndex="0" onKeyDown={(e) => { if (e.key === "Enter" || e.key === " ") setIsOpen(!isOpen); }}>
        <span>{displayValue}</span>
        <svg className={`w-4 h-4 text-gray-700 dark:text-gray-300 transform transition-transform ${isOpen ? "rotate-180" : "rotate-0"}`} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path></svg>
      </div>
      {isOpen && (
        <ul className="absolute z-10 w-full mt-1 rounded-2xl border border-black/10 dark:border-white/10 bg-white dark:bg-gray-800 shadow-lg max-h-60 overflow-y-auto">
          <li className="px-4 py-2 cursor-pointer text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-700 dark:text-gray-300" onClick={() => handleOptionClick("")}>{placeholder}</li>
          {options.map((option) => (
            <li key={option.value} className="px-4 py-2 cursor-pointer hover:bg-indigo-50 dark:hover:bg-indigo-900/40 text-gray-900 dark:text-gray-100" onClick={() => handleOptionClick(option.value)}>{option.label}</li>
          ))}
        </ul>
      )}
    </div>
  );
};

export const InputField = ({ label, type = "text", value, onChange, options = [], textarea, ...props }) => (
  <div>
    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">{label}</label>
    {type === "select" ? (
      <Select value={value} onChange={onChange} options={options} placeholder={props.placeholder || "Pilih..."} {...props} />
    ) : textarea ? (
      <textarea className="w-full p-3 rounded-2xl border border-black/10 dark:border-white/10 bg-white/80 dark:bg-white/5 outline-none focus:ring-4 focus:ring-indigo-200/60 dark:focus:ring-indigo-500/20" value={value} onChange={onChange} {...props} />
    ) : (
      <input type={type} className="w-full p-3 rounded-2xl border border-black/10 dark:border-white/10 bg-white/80 dark:bg-white/5 outline-none focus:ring-4 focus:ring-indigo-200/60 dark:focus:ring-indigo-500/20" value={value} onChange={onChange} {...props} />
    )}
  </div>
);

export const SearchableSelect = ({ value, onChange, options, placeholder = "Pilih...", name, multiple = false, ...props }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const ref = useRef(null);

  const filteredOptions = options.filter(option =>
    option.label.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const selectedOptions = useMemo(() => {
    if (multiple && Array.isArray(value)) {
      return options.filter(option => value.includes(option.value));
    } else if (!multiple && value !== undefined && value !== null && value !== "") {
      const singleSelected = options.find(option => String(option.value) === String(value));
      return singleSelected ? [singleSelected] : [];
    }
    return [];
  }, [value, options, multiple]);

  const handleOptionClick = (optionValue) => {
    if (multiple) {
      // Ensure value is an array for multiple selection
      const currentValue = Array.isArray(value) ? value : [];
      const newValue = currentValue.includes(optionValue)
        ? currentValue.filter((val) => val !== optionValue)
        : [...currentValue, optionValue];
      onChange({ target: { name: name, value: newValue } });
    } else {
      // For single select, ensure name and value are passed correctly
      onChange({ target: { name: name, value: optionValue } });
      setIsOpen(false);
    }
    setSearchTerm(""); // Clear search term on select or multiselect
  };

  const handleRemoveTag = (optionValue) => {
    if (multiple) {
      const currentValue = Array.isArray(value) ? value : [];
      const newValue = currentValue.filter((val) => val !== optionValue);
      onChange({ target: { name: name, value: newValue } });
    }
  };

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (ref.current && !ref.current.contains(event.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const displaySelectedTags = selectedOptions.map(option => (
    <span key={option.value} className="flex items-center gap-1 bg-indigo-100 dark:bg-indigo-700 text-indigo-800 dark:text-indigo-100 text-xs font-medium px-2.5 py-0.5 rounded-full">
      {option.label}
      <button type="button" onClick={(e) => { e.stopPropagation(); handleRemoveTag(option.value); }} className="ml-1 text-indigo-500 hover:text-indigo-800 dark:text-indigo-300 dark:hover:text-indigo-100 focus:outline-none">
        &times;
      </button>
    </span>
  ));

  return (
    <div className="relative" ref={ref}>
      <div
        className="w-full p-3 rounded-2xl border border-black/10 dark:border-white/10 bg-gray-50 dark:bg-white/10 shadow-sm outline-none focus:ring-4 focus:ring-indigo-200/60 dark:focus:ring-indigo-500/20 flex flex-wrap gap-2 items-center cursor-pointer min-h-[42px]"
        onClick={() => setIsOpen(!isOpen)}
        tabIndex="0"
        onKeyDown={(e) => { if (e.key === "Enter" || e.key === " ") setIsOpen(!isOpen); }}
      >
        {multiple && selectedOptions.length > 0 ? (
          displaySelectedTags
        ) : !multiple && selectedOptions.length > 0 ? (
          selectedOptions[0].label // Display plain text for single select
        ) : (
          <span className="text-gray-500 dark:text-gray-400">{placeholder}</span>
        )}
        <svg className={`w-4 h-4 text-gray-700 dark:text-gray-300 transform transition-transform ${isOpen ? "rotate-180" : "rotate-0"} ml-auto`} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path></svg>
      </div>
      {isOpen && (
        <div className="absolute z-10 w-full mt-1 rounded-2xl border border-black/10 dark:border-white/10 bg-white dark:bg-gray-800 shadow-lg">
          <input
            type="text"
            className="w-full p-3 border-b border-black/10 dark:border-white/10 rounded-t-2xl bg-white/80 dark:bg-white/5 outline-none focus:ring-0 text-sm"
            placeholder="Cari..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            onClick={(e) => e.stopPropagation()} // Prevent closing dropdown when clicking search input
          />
          <ul className="max-h-60 overflow-y-auto">
            {filteredOptions.length === 0 ? (
              <li className="px-4 py-2 text-gray-500 dark:text-gray-300">Tidak ada hasil</li>
            ) : (
              filteredOptions.map((option) => (
                <li key={option.value}
                    className={`px-4 py-2 cursor-pointer ${multiple && Array.isArray(value) && value.includes(option.value) ? 'bg-indigo-100 dark:bg-indigo-900/40' : 'hover:bg-indigo-50 dark:hover:bg-indigo-900/40'} text-gray-900 dark:text-gray-100`}
                  onClick={() => {
                    handleOptionClick(option.value);
                  }}>{option.label}</li>
              ))
            )}
          </ul>
        </div>
      )}
    </div>
  );
};

/* JSON editor & relational cell */
export function JSONEditor({ value, onChange }) {
  const [text, setText] = useState(() => { try { return JSON.stringify(value ?? {}, null, 2); } catch { return "{}"; } });
  useEffect(() => { try { const nxt = JSON.stringify(value ?? {}, null, 2); if (nxt !== text) setText(nxt); } catch {} }, [value]); // eslint-disable-line
  return (
    <div className="flex flex-col gap-2">
      <textarea className="w-full h-60 p-4 rounded-2xl border border-black/10 dark:border-white/10 bg-white/80 dark:bg-white/5 outline-none focus:ring-4 focus:ring-indigo-200/60 dark:focus:ring-indigo-500/20 text-sm font-mono" value={text} onChange={(e) => setText(e.target.value)} />
      <div className="flex gap-2">
        <Button variant="primary" onClick={() => { try { onChange?.(JSON.parse(text)); } catch (e) { alert("JSON tidak valid: " + e.message); } }}>Terapkan</Button>
        <Button variant="soft" onClick={() => { try { setText(JSON.stringify(JSON.parse(text), null, 2)); } catch (e) { alert("JSON tidak valid: " + e.message); } }}>Rapikan JSON</Button>
      </div>
    </div>
  );
}

export function RelationalCell({ value }) {
  const [open, setOpen] = useState(false);
  if (value == null) return <span className="opacity-60">—</span>;
  if (typeof value !== "object") return <span>{String(value)}</span>;
  const preview = Array.isArray(value) ? `Array(${value.length})` : `Object(${Object.keys(value).length})`;
  return (
    <div className="space-y-1">
      <button className="text-xs underline opacity-80 hover:opacity-100" onClick={() => setOpen(!open)}>{open ? "Sembunyikan" : "Lihat"} {preview}</button>
      {open && (<pre className="text-xs whitespace-pre-wrap break-words bg-gray-50 dark:bg-white/5 p-2 rounded-xl border border-black/5 dark:border-white/10 max-h-64 overflow-auto">{JSON.stringify(value, null, 2)}</pre>)}
    </div>
  );
}
