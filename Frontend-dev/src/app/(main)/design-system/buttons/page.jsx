"use client";

import React, { useState, useEffect, useRef } from "react";
import { 
  Edit, Trash2, Download, Upload, Search, 
  Plus, X, Check, ChevronDown, Loader2,
  Settings, Heart, Star, Share2, MoreVertical,
  Bell, User, Mail, MessageCircle, AlertCircle,
  CheckCircle, XCircle, Info, Clock, Command
} from "lucide-react";
import { motion } from "framer-motion";

export default function ButtonDesignSystemPage() {
  const [toggleState, setToggleState] = useState(false);
  const [checkboxState, setCheckboxState] = useState(false);
  const [radioValue, setRadioValue] = useState("option1");
  const [segmentedValue, setSegmentedValue] = useState("active");
  const [toggleGroupValue, setToggleGroupValue] = useState(["option1"]);
  const [loading, setLoading] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [chipItems, setChipItems] = useState(["Design", "System", "Buttons"]);
  const [splitDropdownOpen, setSplitDropdownOpen] = useState(false);
  const [tooltipVisible, setTooltipVisible] = useState(false);
  const [buttonState, setButtonState] = useState("default"); // default, success, error, warning
  const splitDropdownRef = useRef(null);
  const dropdownRef = useRef(null);

  // Close dropdowns when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (splitDropdownRef.current && !splitDropdownRef.current.contains(event.target)) {
        setSplitDropdownOpen(false);
      }
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setDropdownOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const handleLoading = () => {
    setLoading(true);
    setTimeout(() => setLoading(false), 2000);
  };

  const removeChip = (index) => {
    setChipItems(chipItems.filter((_, i) => i !== index));
  };

  const ButtonSection = ({ title, description, children }) => (
    <div className="mb-12">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">{title}</h2>
        <p className="text-gray-600">{description}</p>
      </div>
      <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
        <div className="flex flex-wrap gap-4 items-center">
          {children}
        </div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-12 text-center">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Design System - Buttons
          </h1>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Koleksi lengkap berbagai jenis button dan komponen interaktif untuk digunakan dalam aplikasi
          </p>
        </div>

        {/* 1. Toggle Switch */}
        <ButtonSection
          title="1. Toggle Switch"
          description="Switch on/off dengan animasi smooth"
        >
          <label className="relative inline-flex items-center cursor-pointer group">
            <input
              type="checkbox"
              checked={toggleState}
              onChange={(e) => setToggleState(e.target.checked)}
              className="sr-only peer"
            />
            <div className={`w-12 h-6 bg-gray-300 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#0384d6]`}></div>
            <span className="ml-3 text-sm font-medium text-gray-700">
              {toggleState ? "Aktif" : "Nonaktif"}
            </span>
          </label>

          <label className="relative inline-flex items-center cursor-pointer group">
            <input
              type="checkbox"
              checked={!toggleState}
              onChange={(e) => setToggleState(!e.target.checked)}
              className="sr-only peer"
            />
            <div className={`w-12 h-6 bg-gray-300 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#0384d6]`}></div>
            <span className="ml-3 text-sm font-medium text-gray-700">
              Tampilkan Dihapus
            </span>
          </label>
        </ButtonSection>

        {/* 2. Checkbox */}
        <ButtonSection
          title="2. Checkbox"
          description="Pilihan multiple selection"
        >
          <label className="flex items-center cursor-pointer group">
            <input
              type="checkbox"
              checked={checkboxState}
              onChange={(e) => setCheckboxState(e.target.checked)}
              className="w-4 h-4 text-[#0384d6] bg-gray-100 border-gray-300 rounded focus:ring-[#0384d6] focus:ring-2"
            />
            <span className="ml-2 text-sm font-medium text-gray-700">
              Pilihan 1
            </span>
          </label>

          <label className="flex items-center cursor-pointer group">
            <input
              type="checkbox"
              checked={!checkboxState}
              onChange={(e) => setCheckboxState(!e.target.checked)}
              className="w-4 h-4 text-[#0384d6] bg-gray-100 border-gray-300 rounded focus:ring-[#0384d6] focus:ring-2"
            />
            <span className="ml-2 text-sm font-medium text-gray-700">
              Pilihan 2
            </span>
          </label>

          <label className="flex items-center cursor-pointer group">
            <input
              type="checkbox"
              defaultChecked
              className="w-4 h-4 text-[#0384d6] bg-gray-100 border-gray-300 rounded focus:ring-[#0384d6] focus:ring-2"
            />
            <span className="ml-2 text-sm font-medium text-gray-700">
              Pilihan 3 (Checked)
            </span>
          </label>
        </ButtonSection>

        {/* 3. Radio Button */}
        <ButtonSection
          title="3. Radio Button"
          description="Pilihan single selection"
        >
          <label className="flex items-center cursor-pointer">
            <input
              type="radio"
              name="radio-group"
              value="option1"
              checked={radioValue === "option1"}
              onChange={(e) => setRadioValue(e.target.value)}
              className="w-4 h-4 text-[#0384d6] bg-gray-100 border-gray-300 focus:ring-[#0384d6] focus:ring-2"
            />
            <span className="ml-2 text-sm font-medium text-gray-700">
              Opsi 1
            </span>
          </label>

          <label className="flex items-center cursor-pointer">
            <input
              type="radio"
              name="radio-group"
              value="option2"
              checked={radioValue === "option2"}
              onChange={(e) => setRadioValue(e.target.value)}
              className="w-4 h-4 text-[#0384d6] bg-gray-100 border-gray-300 focus:ring-[#0384d6] focus:ring-2"
            />
            <span className="ml-2 text-sm font-medium text-gray-700">
              Opsi 2
            </span>
          </label>

          <label className="flex items-center cursor-pointer">
            <input
              type="radio"
              name="radio-group"
              value="option3"
              checked={radioValue === "option3"}
              onChange={(e) => setRadioValue(e.target.value)}
              className="w-4 h-4 text-[#0384d6] bg-gray-100 border-gray-300 focus:ring-[#0384d6] focus:ring-2"
            />
            <span className="ml-2 text-sm font-medium text-gray-700">
              Opsi 3
            </span>
          </label>
        </ButtonSection>

        {/* 4. Primary/Secondary/Danger Buttons */}
        <ButtonSection
          title="4. Primary, Secondary & Danger Buttons"
          description="Button dengan berbagai variasi warna dan ukuran"
        >
          <button className="px-4 py-2 bg-[#0384d6] text-white rounded-lg font-medium hover:bg-[#0273b8] transition-colors duration-200 shadow-sm hover:shadow-md">
            Primary Button
          </button>

          <button className="px-4 py-2 bg-white text-[#0384d6] border-2 border-[#0384d6] rounded-lg font-medium hover:bg-blue-50 transition-colors duration-200 shadow-sm hover:shadow-md">
            Secondary Button
          </button>

          <button className="px-4 py-2 bg-red-600 text-white rounded-lg font-medium hover:bg-red-700 transition-colors duration-200 shadow-sm hover:shadow-md">
            Danger Button
          </button>

          <button className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg font-medium hover:bg-gray-300 transition-colors duration-200 shadow-sm hover:shadow-md">
            Disabled
          </button>

          <button className="px-6 py-3 bg-[#0384d6] text-white rounded-lg font-semibold hover:bg-[#0273b8] transition-colors duration-200 shadow-md hover:shadow-lg">
            Large Button
          </button>

          <button className="px-3 py-1.5 bg-[#0384d6] text-white text-sm rounded-lg font-medium hover:bg-[#0273b8] transition-colors duration-200 shadow-sm hover:shadow-md">
            Small Button
          </button>
        </ButtonSection>

        {/* 5. Icon Button */}
        <ButtonSection
          title="5. Icon Button"
          description="Button dengan icon saja atau icon + text"
        >
          <button className="p-2 bg-white text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors duration-200 shadow-sm hover:shadow-md">
            <Edit size={20} />
          </button>

          <button className="p-2 bg-white text-red-600 border border-red-300 rounded-lg hover:bg-red-50 transition-colors duration-200 shadow-sm hover:shadow-md">
            <Trash2 size={20} />
          </button>

          <button className="p-2 bg-[#0384d6] text-white rounded-lg hover:bg-[#0273b8] transition-colors duration-200 shadow-sm hover:shadow-md">
            <Download size={20} />
          </button>

          <button className="flex items-center gap-2 px-4 py-2 bg-[#0384d6] text-white rounded-lg font-medium hover:bg-[#0273b8] transition-colors duration-200 shadow-sm hover:shadow-md">
            <Upload size={18} />
            <span>Upload</span>
          </button>

          <button className="flex items-center gap-2 px-4 py-2 bg-white text-gray-700 border border-gray-300 rounded-lg font-medium hover:bg-gray-50 transition-colors duration-200 shadow-sm hover:shadow-md">
            <Search size={18} />
            <span>Search</span>
          </button>
        </ButtonSection>

        {/* 6. Floating Action Button (FAB) */}
        <ButtonSection
          title="6. Floating Action Button (FAB)"
          description="Button mengambang untuk aksi utama"
        >
          <div className="relative w-16 h-16">
            <button className="absolute w-14 h-14 bg-[#0384d6] text-white rounded-full shadow-lg hover:shadow-xl hover:bg-[#0273b8] transition-all duration-200 flex items-center justify-center">
              <Plus size={24} />
            </button>
          </div>

          <div className="relative w-16 h-16">
            <button className="absolute w-14 h-14 bg-green-500 text-white rounded-full shadow-lg hover:shadow-xl hover:bg-green-600 transition-all duration-200 flex items-center justify-center">
              <Check size={24} />
            </button>
          </div>
        </ButtonSection>

        {/* 7. Dropdown Button */}
        <ButtonSection
          title="7. Dropdown Button"
          description="Button dengan menu dropdown"
        >
          <div className="relative" ref={dropdownRef}>
            <button
              onClick={() => setDropdownOpen(!dropdownOpen)}
              className="flex items-center gap-2 px-4 py-2 bg-white text-gray-700 border border-gray-300 rounded-lg font-medium hover:bg-gray-50 transition-colors duration-200 shadow-sm hover:shadow-md"
            >
              <span>Actions</span>
              <ChevronDown size={18} className={`transition-transform duration-200 ${dropdownOpen ? 'rotate-180' : ''}`} />
            </button>
            {dropdownOpen && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="absolute top-full left-0 mt-2 w-48 bg-white border border-gray-200 rounded-lg shadow-lg z-10"
              >
                <button className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 rounded-t-lg">
                  Edit
                </button>
                <button className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50">
                  Duplicate
                </button>
                <button className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 rounded-b-lg">
                  Delete
                </button>
              </motion.div>
            )}
          </div>
        </ButtonSection>

        {/* 8. Chip/Tag Button */}
        <ButtonSection
          title="8. Chip/Tag Button"
          description="Badge kecil untuk kategori atau tag"
        >
          {chipItems.map((item, index) => (
            <div
              key={index}
              className="inline-flex items-center gap-2 px-3 py-1.5 bg-blue-100 text-blue-700 rounded-full text-sm font-medium"
            >
              <span>{item}</span>
              <button
                onClick={() => removeChip(index)}
                className="hover:bg-blue-200 rounded-full p-0.5 transition-colors"
              >
                <X size={14} />
              </button>
            </div>
          ))}

          <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-green-100 text-green-700 rounded-full text-sm font-medium">
            <span>Success</span>
          </div>

          <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-yellow-100 text-yellow-700 rounded-full text-sm font-medium">
            <span>Warning</span>
          </div>

          <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-red-100 text-red-700 rounded-full text-sm font-medium">
            <span>Error</span>
          </div>
        </ButtonSection>

        {/* 9. Segmented Control */}
        <ButtonSection
          title="9. Segmented Control"
          description="Beberapa opsi dalam satu baris, hanya satu aktif"
        >
          <div className="inline-flex bg-gray-100 rounded-lg p-1">
            <button
              onClick={() => setSegmentedValue("active")}
              className={`px-4 py-2 rounded-md text-sm font-medium transition-all duration-200 ${
                segmentedValue === "active"
                  ? "bg-white text-[#0384d6] shadow-sm"
                  : "text-gray-600 hover:text-gray-900"
              }`}
            >
              Aktif
            </button>
            <button
              onClick={() => setSegmentedValue("deleted")}
              className={`px-4 py-2 rounded-md text-sm font-medium transition-all duration-200 ${
                segmentedValue === "deleted"
                  ? "bg-white text-[#0384d6] shadow-sm"
                  : "text-gray-600 hover:text-gray-900"
              }`}
            >
              Dihapus
            </button>
            <button
              onClick={() => setSegmentedValue("all")}
              className={`px-4 py-2 rounded-md text-sm font-medium transition-all duration-200 ${
                segmentedValue === "all"
                  ? "bg-white text-[#0384d6] shadow-sm"
                  : "text-gray-600 hover:text-gray-900"
              }`}
            >
              Semua
            </button>
          </div>
        </ButtonSection>

        {/* 10. Switch (iOS Style) */}
        <ButtonSection
          title="10. Switch (iOS Style)"
          description="Switch dengan style iOS, lebih besar"
        >
          <label className="relative inline-flex items-center cursor-pointer">
            <input
              type="checkbox"
              checked={toggleState}
              onChange={(e) => setToggleState(e.target.checked)}
              className="sr-only peer"
            />
            <div className="w-14 h-8 bg-gray-300 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[4px] after:left-[4px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-6 after:w-6 after:transition-all peer-checked:bg-green-500"></div>
            <span className="ml-3 text-sm font-medium text-gray-700">
              iOS Style Switch
            </span>
          </label>
        </ButtonSection>

        {/* 11. Toggle Button Group */}
        <ButtonSection
          title="11. Toggle Button Group"
          description="Beberapa button dalam grup, bisa single atau multiple selection"
        >
          <div className="inline-flex border border-gray-300 rounded-lg overflow-hidden">
            <button
              onClick={() => {
                if (toggleGroupValue.includes("option1")) {
                  setToggleGroupValue(toggleGroupValue.filter(v => v !== "option1"));
                } else {
                  setToggleGroupValue([...toggleGroupValue, "option1"]);
                }
              }}
              className={`px-4 py-2 text-sm font-medium transition-colors duration-200 border-r border-gray-300 ${
                toggleGroupValue.includes("option1")
                  ? "bg-[#0384d6] text-white"
                  : "bg-white text-gray-700 hover:bg-gray-50"
              }`}
            >
              Option 1
            </button>
            <button
              onClick={() => {
                if (toggleGroupValue.includes("option2")) {
                  setToggleGroupValue(toggleGroupValue.filter(v => v !== "option2"));
                } else {
                  setToggleGroupValue([...toggleGroupValue, "option2"]);
                }
              }}
              className={`px-4 py-2 text-sm font-medium transition-colors duration-200 border-r border-gray-300 ${
                toggleGroupValue.includes("option2")
                  ? "bg-[#0384d6] text-white"
                  : "bg-white text-gray-700 hover:bg-gray-50"
              }`}
            >
              Option 2
            </button>
            <button
              onClick={() => {
                if (toggleGroupValue.includes("option3")) {
                  setToggleGroupValue(toggleGroupValue.filter(v => v !== "option3"));
                } else {
                  setToggleGroupValue([...toggleGroupValue, "option3"]);
                }
              }}
              className={`px-4 py-2 text-sm font-medium transition-colors duration-200 ${
                toggleGroupValue.includes("option3")
                  ? "bg-[#0384d6] text-white"
                  : "bg-white text-gray-700 hover:bg-gray-50"
              }`}
            >
              Option 3
            </button>
          </div>
        </ButtonSection>

        {/* 12. Loading Button */}
        <ButtonSection
          title="12. Loading Button"
          description="Button dengan loading state"
        >
          <button
            onClick={handleLoading}
            disabled={loading}
            className="flex items-center gap-2 px-4 py-2 bg-[#0384d6] text-white rounded-lg font-medium hover:bg-[#0273b8] transition-colors duration-200 shadow-sm hover:shadow-md disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading && <Loader2 size={18} className="animate-spin" />}
            <span>{loading ? "Loading..." : "Submit"}</span>
          </button>

          <button
            disabled
            className="flex items-center gap-2 px-4 py-2 bg-gray-200 text-gray-500 rounded-lg font-medium cursor-not-allowed"
          >
            <Loader2 size={18} className="animate-spin" />
            <span>Processing...</span>
          </button>
        </ButtonSection>

        {/* 13. Button dengan Variasi */}
        <ButtonSection
          title="13. Button dengan Variasi Lainnya"
          description="Button dengan outline, ghost, dan link style"
        >
          <button className="px-4 py-2 bg-transparent text-[#0384d6] border-2 border-[#0384d6] rounded-lg font-medium hover:bg-blue-50 transition-colors duration-200">
            Outline Button
          </button>

          <button className="px-4 py-2 bg-transparent text-[#0384d6] rounded-lg font-medium hover:bg-blue-50 transition-colors duration-200">
            Ghost Button
          </button>

          <button className="px-4 py-2 text-[#0384d6] underline font-medium hover:text-[#0273b8] transition-colors duration-200">
            Link Button
          </button>

          <button className="px-4 py-2 bg-gradient-to-r from-[#0384d6] to-[#043975] text-white rounded-lg font-medium hover:from-[#0273b8] hover:to-[#032d5f] transition-all duration-200 shadow-md hover:shadow-lg">
            Gradient Button
          </button>
        </ButtonSection>

        {/* 14. Split Button */}
        <ButtonSection
          title="14. Split Button"
          description="Button dengan aksi utama dan dropdown terpisah"
        >
          <div className="relative inline-flex" ref={splitDropdownRef}>
            <button className="px-4 py-2 bg-[#0384d6] text-white rounded-l-lg font-medium hover:bg-[#0273b8] transition-colors duration-200">
              Save
            </button>
            <div className="relative">
              <button
                onClick={() => setSplitDropdownOpen(!splitDropdownOpen)}
                className="px-2 py-2 bg-[#0384d6] text-white rounded-r-lg font-medium hover:bg-[#0273b8] transition-colors duration-200 border-l border-blue-400"
              >
                <ChevronDown size={16} />
              </button>
              {splitDropdownOpen && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="absolute top-full right-0 mt-2 w-40 bg-white border border-gray-200 rounded-lg shadow-lg z-10"
                >
                  <button className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 rounded-t-lg">
                    Save As...
                  </button>
                  <button className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 rounded-b-lg">
                    Save All
                  </button>
                </motion.div>
              )}
            </div>
          </div>
        </ButtonSection>

        {/* 15. Badge Button */}
        <ButtonSection
          title="15. Badge Button"
          description="Button dengan badge/counter untuk notifikasi"
        >
          <button className="relative px-4 py-2 bg-[#0384d6] text-white rounded-lg font-medium hover:bg-[#0273b8] transition-colors duration-200">
            <Bell size={18} className="inline mr-2" />
            Notifications
            <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center">
              3
            </span>
          </button>

          <button className="relative px-4 py-2 bg-white text-gray-700 border border-gray-300 rounded-lg font-medium hover:bg-gray-50 transition-colors duration-200">
            <Mail size={18} className="inline mr-2" />
            Messages
            <span className="absolute -top-2 -right-2 bg-green-500 text-white text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center">
              12
            </span>
          </button>

          <button className="relative px-4 py-2 bg-white text-gray-700 border border-gray-300 rounded-lg font-medium hover:bg-gray-50 transition-colors duration-200">
            <MessageCircle size={18} className="inline mr-2" />
            Comments
            <span className="absolute -top-2 -right-2 bg-yellow-500 text-white text-xs font-bold rounded-full w-6 h-5 flex items-center justify-center">
              99+
            </span>
          </button>
        </ButtonSection>

        {/* 16. Pill Button */}
        <ButtonSection
          title="16. Pill Button"
          description="Button dengan bentuk rounded-full (pill shape)"
        >
          <button className="px-6 py-2 bg-[#0384d6] text-white rounded-full font-medium hover:bg-[#0273b8] transition-colors duration-200 shadow-sm hover:shadow-md">
            Pill Button
          </button>

          <button className="px-6 py-2 bg-white text-[#0384d6] border-2 border-[#0384d6] rounded-full font-medium hover:bg-blue-50 transition-colors duration-200 shadow-sm hover:shadow-md">
            Outline Pill
          </button>

          <button className="px-6 py-2 bg-green-500 text-white rounded-full font-medium hover:bg-green-600 transition-colors duration-200 shadow-sm hover:shadow-md">
            Success Pill
          </button>

          <button className="px-6 py-2 bg-red-500 text-white rounded-full font-medium hover:bg-red-600 transition-colors duration-200 shadow-sm hover:shadow-md">
            Danger Pill
          </button>
        </ButtonSection>

        {/* 17. Button dengan Status Indicator */}
        <ButtonSection
          title="17. Button dengan Status Indicator"
          description="Button yang menampilkan status (success, error, warning, info)"
        >
          <button
            onClick={() => setButtonState(buttonState === "success" ? "default" : "success")}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-all duration-200 ${
              buttonState === "success"
                ? "bg-green-500 text-white hover:bg-green-600"
                : "bg-[#0384d6] text-white hover:bg-[#0273b8]"
            }`}
          >
            {buttonState === "success" ? (
              <>
                <CheckCircle size={18} />
                <span>Success</span>
              </>
            ) : (
              <>
                <CheckCircle size={18} />
                <span>Submit</span>
              </>
            )}
          </button>

          <button className="flex items-center gap-2 px-4 py-2 bg-red-500 text-white rounded-lg font-medium hover:bg-red-600 transition-colors duration-200">
            <XCircle size={18} />
            <span>Error</span>
          </button>

          <button className="flex items-center gap-2 px-4 py-2 bg-yellow-500 text-white rounded-lg font-medium hover:bg-yellow-600 transition-colors duration-200">
            <AlertCircle size={18} />
            <span>Warning</span>
          </button>

          <button className="flex items-center gap-2 px-4 py-2 bg-blue-500 text-white rounded-lg font-medium hover:bg-blue-600 transition-colors duration-200">
            <Info size={18} />
            <span>Info</span>
          </button>
        </ButtonSection>

        {/* 18. Button dengan Tooltip */}
        <ButtonSection
          title="18. Button dengan Tooltip"
          description="Button dengan tooltip untuk informasi tambahan"
        >
          <div className="relative inline-block">
            <button
              onMouseEnter={() => setTooltipVisible(true)}
              onMouseLeave={() => setTooltipVisible(false)}
              className="px-4 py-2 bg-[#0384d6] text-white rounded-lg font-medium hover:bg-[#0273b8] transition-colors duration-200"
            >
              Hover Me
            </button>
            {tooltipVisible && (
              <motion.div
                initial={{ opacity: 0, y: 5 }}
                animate={{ opacity: 1, y: 0 }}
                className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-3 py-2 bg-gray-900 text-white text-sm rounded-lg whitespace-nowrap z-20"
              >
                Ini adalah tooltip
                <div className="absolute top-full left-1/2 transform -translate-x-1/2 -mt-1 border-4 border-transparent border-t-gray-900"></div>
              </motion.div>
            )}
          </div>

          <div className="relative inline-block">
            <button className="px-4 py-2 bg-white text-gray-700 border border-gray-300 rounded-lg font-medium hover:bg-gray-50 transition-colors duration-200">
              <Settings size={18} />
            </button>
            <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-3 py-2 bg-gray-900 text-white text-sm rounded-lg whitespace-nowrap opacity-0 hover:opacity-100 transition-opacity duration-200 pointer-events-none">
              Settings
              <div className="absolute top-full left-1/2 transform -translate-x-1/2 -mt-1 border-4 border-transparent border-t-gray-900"></div>
            </div>
          </div>
        </ButtonSection>

        {/* 19. Button dengan Avatar */}
        <ButtonSection
          title="19. Button dengan Avatar"
          description="Button yang menampilkan avatar user"
        >
          <button className="flex items-center gap-3 px-4 py-2 bg-white text-gray-700 border border-gray-300 rounded-lg font-medium hover:bg-gray-50 transition-colors duration-200">
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[#0384d6] to-[#043975] flex items-center justify-center text-white font-bold text-sm">
              U
            </div>
            <span>User Profile</span>
          </button>

          <button className="flex items-center gap-3 px-4 py-2 bg-[#0384d6] text-white rounded-lg font-medium hover:bg-[#0273b8] transition-colors duration-200">
            <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center text-white font-bold text-sm">
              A
            </div>
            <span>Admin</span>
          </button>
        </ButtonSection>

        {/* 20. Button dengan Keyboard Shortcut */}
        <ButtonSection
          title="20. Button dengan Keyboard Shortcut"
          description="Button yang menampilkan shortcut keyboard"
        >
          <button className="flex items-center gap-2 px-4 py-2 bg-[#0384d6] text-white rounded-lg font-medium hover:bg-[#0273b8] transition-colors duration-200">
            <span>Save</span>
            <kbd className="px-2 py-1 bg-white/20 rounded text-xs font-mono">Ctrl+S</kbd>
          </button>

          <button className="flex items-center gap-2 px-4 py-2 bg-white text-gray-700 border border-gray-300 rounded-lg font-medium hover:bg-gray-50 transition-colors duration-200">
            <span>New</span>
            <kbd className="px-2 py-1 bg-gray-100 rounded text-xs font-mono">⌘N</kbd>
          </button>

          <button className="flex items-center gap-2 px-4 py-2 bg-white text-gray-700 border border-gray-300 rounded-lg font-medium hover:bg-gray-50 transition-colors duration-200">
            <span>Search</span>
            <kbd className="px-2 py-1 bg-gray-100 rounded text-xs font-mono">⌘K</kbd>
          </button>
        </ButtonSection>

        {/* 21. Button dengan Description */}
        <ButtonSection
          title="21. Button dengan Description"
          description="Button dengan teks deskripsi tambahan"
        >
          <button className="text-left px-4 py-3 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors duration-200 shadow-sm hover:shadow-md">
            <div className="font-semibold text-gray-900">Primary Action</div>
            <div className="text-xs text-gray-500 mt-1">Klik untuk melakukan aksi utama</div>
          </button>

          <button className="text-left px-4 py-3 bg-[#0384d6] text-white rounded-lg hover:bg-[#0273b8] transition-colors duration-200 shadow-sm hover:shadow-md">
            <div className="font-semibold">Save Changes</div>
            <div className="text-xs text-blue-100 mt-1">Simpan semua perubahan yang telah dibuat</div>
          </button>
        </ButtonSection>

        {/* 22. Button dengan Progress Indicator */}
        <ButtonSection
          title="22. Button dengan Progress Indicator"
          description="Button yang menampilkan progress bar"
        >
          <button className="relative px-4 py-2 bg-[#0384d6] text-white rounded-lg font-medium hover:bg-[#0273b8] transition-colors duration-200 overflow-hidden">
            <span className="relative z-10">Upload 75%</span>
            <div className="absolute bottom-0 left-0 h-1 bg-white/30" style={{ width: '75%' }}></div>
          </button>

          <button className="relative px-4 py-2 bg-green-500 text-white rounded-lg font-medium hover:bg-green-600 transition-colors duration-200 overflow-hidden">
            <span className="relative z-10">Processing...</span>
            <div className="absolute bottom-0 left-0 h-1 bg-white/30 animate-pulse" style={{ width: '100%' }}></div>
          </button>
        </ButtonSection>

        {/* 23. Button dengan Animation */}
        <ButtonSection
          title="23. Button dengan Animation"
          description="Button dengan efek animasi (pulse, bounce, dll)"
        >
          <button className="px-4 py-2 bg-[#0384d6] text-white rounded-lg font-medium hover:bg-[#0273b8] transition-colors duration-200 animate-pulse">
            Pulse Animation
          </button>

          <button className="px-4 py-2 bg-green-500 text-white rounded-lg font-medium hover:bg-green-600 transition-colors duration-200 hover:animate-bounce">
            Bounce on Hover
          </button>

          <button className="px-4 py-2 bg-purple-500 text-white rounded-lg font-medium hover:bg-purple-600 transition-all duration-200 hover:scale-110 hover:rotate-2">
            Scale & Rotate
          </button>

          <button className="px-4 py-2 bg-orange-500 text-white rounded-lg font-medium hover:bg-orange-600 transition-all duration-200 hover:shadow-lg hover:shadow-orange-500/50">
            Glow Effect
          </button>
        </ButtonSection>

        {/* 24. Button dengan Icon Position */}
        <ButtonSection
          title="24. Button dengan Icon Position"
          description="Button dengan icon di kiri, kanan, atau kedua sisi"
        >
          <button className="flex items-center gap-2 px-4 py-2 bg-[#0384d6] text-white rounded-lg font-medium hover:bg-[#0273b8] transition-colors duration-200">
            <Download size={18} />
            <span>Download</span>
          </button>

          <button className="flex items-center gap-2 px-4 py-2 bg-[#0384d6] text-white rounded-lg font-medium hover:bg-[#0273b8] transition-colors duration-200">
            <span>Upload</span>
            <Upload size={18} />
          </button>

          <button className="flex items-center gap-2 px-4 py-2 bg-[#0384d6] text-white rounded-lg font-medium hover:bg-[#0273b8] transition-colors duration-200">
            <Download size={18} />
            <span>Export</span>
            <ChevronDown size={16} />
          </button>
        </ButtonSection>

        {/* 25. Button dengan Ripple Effect */}
        <ButtonSection
          title="25. Button dengan Ripple Effect"
          description="Button dengan efek ripple saat diklik (Material Design style)"
        >
          <button className="relative px-4 py-2 bg-[#0384d6] text-white rounded-lg font-medium hover:bg-[#0273b8] transition-colors duration-200 overflow-hidden active:scale-95">
            <span className="relative z-10">Click Me</span>
            <span className="absolute inset-0 bg-white/20 rounded-full scale-0 animate-ping opacity-75"></span>
          </button>

          <button className="relative px-4 py-2 bg-purple-500 text-white rounded-lg font-medium hover:bg-purple-600 transition-colors duration-200 overflow-hidden active:scale-95">
            <span className="relative z-10">Ripple Effect</span>
          </button>
        </ButtonSection>

        {/* 26. Button Group */}
        <ButtonSection
          title="26. Button Group"
          description="Beberapa button dalam satu grup tanpa toggle"
        >
          <div className="inline-flex border border-gray-300 rounded-lg overflow-hidden">
            <button className="px-4 py-2 bg-white text-gray-700 font-medium hover:bg-gray-50 transition-colors duration-200 border-r border-gray-300">
              Left
            </button>
            <button className="px-4 py-2 bg-white text-gray-700 font-medium hover:bg-gray-50 transition-colors duration-200 border-r border-gray-300">
              Center
            </button>
            <button className="px-4 py-2 bg-white text-gray-700 font-medium hover:bg-gray-50 transition-colors duration-200">
              Right
            </button>
          </div>

          <div className="inline-flex flex-col border border-gray-300 rounded-lg overflow-hidden">
            <button className="px-4 py-2 bg-white text-gray-700 font-medium hover:bg-gray-50 transition-colors duration-200 border-b border-gray-300">
              Top
            </button>
            <button className="px-4 py-2 bg-white text-gray-700 font-medium hover:bg-gray-50 transition-colors duration-200">
              Bottom
            </button>
          </div>
        </ButtonSection>

        {/* Footer */}
        <div className="mt-16 text-center text-gray-600">
          <p>Design System - Portal Mutu</p>
          <p className="text-sm mt-2">Gunakan komponen-komponen ini sebagai referensi untuk konsistensi desain</p>
        </div>
      </div>
    </div>
  );
}

