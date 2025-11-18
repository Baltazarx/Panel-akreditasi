"use client";

import React, { useState, useEffect, useRef } from "react";
import { 
  Edit, Trash2, Download, Upload, Search, 
  Plus, X, Check, ChevronDown, Loader2,
  Settings, Heart, Star, Share2, MoreVertical,
  Bell, User, Mail, MessageCircle, AlertCircle,
  CheckCircle, XCircle, Info, Clock, Command,
  Save, RefreshCw, Filter, Eye, EyeOff, Calendar,
  FileText, Image, Video, Music, File, Folder,
  Home, ChevronRight, ChevronLeft, Menu, Grid,
  List, Sliders, Minus, Maximize2,
  Minimize2, Copy, Link, ExternalLink, Lock,
  Unlock, Shield, Key, LogOut, LogIn, UserPlus,
  Users, Building, MapPin, Phone, Globe, Zap,
  TrendingUp, TrendingDown, BarChart, PieChart,
  LineChart, Activity, Target, Award, Trophy,
  Gift, ShoppingCart, CreditCard, Wallet, DollarSign,
  Upload as UploadIcon, Download as DownloadIcon, FileUp, FileDown,
  Image as ImageIcon, Play, Pause, SkipForward, SkipBack,
  Volume2, VolumeX, Mic, MicOff, Video as VideoIcon,
  Camera, Film, Music2, Headphones, Radio,
  Bookmark, BookmarkCheck, Tag, Tags, Hash,
  AtSign, Hashtag, Percent, DollarSign as Dollar,
  TrendingUp as TrendUp, TrendingDown as TrendDown,
  ArrowUp, ArrowDown, ArrowLeft, ArrowRight,
  Move, MoveUp, MoveDown, RotateCw, RotateCcw,
  ZoomIn, ZoomOut, Maximize, Minimize,
  XCircle as XCircleIcon, CheckCircle2, AlertTriangle,
  HelpCircle, Lightbulb, Sparkles, Flame,
  Droplet, Cloud, CloudRain, Sun, Moon,
  Star as StarIcon, Heart as HeartIcon, ThumbsUp, ThumbsDown,
  MessageSquare, MessageCircle as MessageCircleIcon,
  Send, Reply, Forward,
  BookOpen, Book, Library, GraduationCap,
  Briefcase, Building2, Factory, Store,
  MapPin as MapPinIcon, Navigation, Compass,
  Globe as GlobeIcon, Wifi, WifiOff, Signal,
  Battery, BatteryCharging, Power, Zap as ZapIcon,
  Cpu, HardDrive, Server, Database,
  Code, Terminal, Brackets, Braces,
  Layers, Box, Package, Archive,
  FolderOpen, FolderPlus, FolderMinus,
  FileCheck, FileX, FileSearch, FileCode,
  Clipboard, ClipboardCheck, ClipboardCopy,
  Scissors, Copy as CopyIcon, Paste,
  Undo, Redo, Repeat, RefreshCw as Refresh,
  RotateCcw as Rotate, FlipHorizontal, FlipVertical
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
  const [activeSection, setActiveSection] = useState("");
  const [activeTab, setActiveTab] = useState("tab1");
  const [accordionOpen, setAccordionOpen] = useState(null);
  const [progressValue, setProgressValue] = useState(65);
  const [sliderValue, setSliderValue] = useState(50);
  const [currentPage, setCurrentPage] = useState(1);
  const [dateValue, setDateValue] = useState("");
  const [timeValue, setTimeValue] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedFile, setSelectedFile] = useState(null);
  const [stepperStep, setStepperStep] = useState(1);
  const [rating, setRating] = useState(0);
  const [switchState, setSwitchState] = useState(false);
  const splitDropdownRef = useRef(null);
  const dropdownRef = useRef(null);

  // Navigation items - defined outside to avoid dependency issues
  const navItems = [
    { id: "buttons", label: "Buttons", icon: Settings },
    { id: "inputs", label: "Input Fields", icon: FileText },
    { id: "modals", label: "Modal & Dialog", icon: Info },
    { id: "cards", label: "Cards", icon: File },
    { id: "tables", label: "Tables", icon: FileText },
    { id: "forms", label: "Forms", icon: FileText },
    { id: "alerts", label: "Alerts", icon: AlertCircle },
    { id: "badges", label: "Badges & Tags", icon: Star },
    { id: "tooltips", label: "Tooltips", icon: Info },
    { id: "pagination", label: "Pagination", icon: ChevronRight },
    { id: "tabs", label: "Tabs", icon: Grid },
    { id: "breadcrumbs", label: "Breadcrumbs", icon: Home },
    { id: "progress", label: "Progress Bars", icon: Activity },
    { id: "sliders", label: "Sliders", icon: Sliders },
    { id: "accordion", label: "Accordion", icon: ChevronDown },
    { id: "dropdowns", label: "Dropdowns", icon: ChevronDown },
    { id: "avatars", label: "Avatars", icon: User },
    { id: "icons", label: "Icons", icon: Star },
    { id: "empty", label: "Empty States", icon: File },
    { id: "dividers", label: "Dividers", icon: Minus },
    { id: "spacing", label: "Spacing", icon: Grid },
    { id: "shadows", label: "Shadows", icon: Zap },
    { id: "datepicker", label: "Date Picker", icon: Calendar },
    { id: "timepicker", label: "Time Picker", icon: Clock },
    { id: "fileupload", label: "File Upload", icon: UploadIcon },
    { id: "search", label: "Search Bars", icon: Search },
    { id: "navigation", label: "Navigation", icon: Menu },
    { id: "sidebar", label: "Sidebar", icon: List },
    { id: "popover", label: "Popover", icon: Info },
    { id: "toast", label: "Toast", icon: Bell },
    { id: "stepper", label: "Stepper", icon: ChevronRight },
    { id: "rating", label: "Rating", icon: Star },
    { id: "switch", label: "Switch", icon: Zap },
    { id: "statistics", label: "Statistics", icon: BarChart },
    { id: "timeline", label: "Timeline", icon: Clock },
    { id: "listgroup", label: "List Group", icon: List },
    { id: "header", label: "Header", icon: Menu },
    { id: "footer", label: "Footer", icon: Home },
    { id: "contextmenu", label: "Context Menu", icon: MoreVertical },
    { id: "command", label: "Command Palette", icon: Command },
    { id: "carousel", label: "Carousel", icon: Play },
    { id: "gallery", label: "Image Gallery", icon: ImageIcon },
    { id: "charts", label: "Charts", icon: PieChart },
    { id: "loading", label: "Loading", icon: Loader2 },
    { id: "typography", label: "Typography", icon: FileText },
    { id: "colors", label: "Colors", icon: Heart },
  ];

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

  // Scroll to section handler
  const scrollToSection = (id) => {
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: "smooth", block: "start" });
      setActiveSection(id);
    }
  };

  // Track active section on scroll
  useEffect(() => {
    const handleScroll = () => {
      const sections = navItems.map(item => document.getElementById(item.id)).filter(Boolean);
      const scrollPosition = window.scrollY + 200;

      for (let i = sections.length - 1; i >= 0; i--) {
        const section = sections[i];
        if (section && section.offsetTop <= scrollPosition) {
          setActiveSection(navItems[i].id);
          break;
        }
      }
    };

    // Set initial active section
    handleScroll();
    
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const ButtonSection = ({ title, description, children, id }) => (
    <div className="mb-12" id={id}>
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
      <div className="max-w-7xl mx-auto flex gap-8">
        {/* Sticky Navigation Sidebar */}
        <aside className="hidden lg:block w-64 flex-shrink-0">
          <div className="sticky top-8">
            <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-4">
              <h3 className="text-sm font-semibold text-gray-900 mb-4 uppercase tracking-wide">Navigasi</h3>
              <nav className="space-y-1">
                {navItems.map((item) => {
                  const Icon = item.icon;
                  return (
                    <button
                      key={item.id}
                      onClick={() => scrollToSection(item.id)}
                      className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                        activeSection === item.id
                          ? "bg-[#0384d6] text-white"
                          : "text-gray-700 hover:bg-gray-100"
                      }`}
                    >
                      <Icon size={16} />
                      <span>{item.label}</span>
                    </button>
                  );
                })}
              </nav>
            </div>
          </div>
        </aside>

        {/* Main Content */}
        <div className="flex-1 min-w-0">
          {/* Header */}
          <div className="mb-12 text-center">
            <h1 className="text-4xl font-bold text-gray-900 mb-4">
              Design System - Portal Mutu
            </h1>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Koleksi lengkap semua komponen design system yang digunakan dalam aplikasi Portal Mutu
            </p>
          </div>

        {/* 1. Toggle Switch */}
        <div id="buttons" className="mb-12">
          <div className="mb-6">
            <h2 className="text-3xl font-bold text-gray-900 mb-2">Buttons</h2>
            <p className="text-gray-600">Berbagai jenis button dan komponen interaktif</p>
          </div>
        </div>

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

        {/* 27. Segmented Control - Data/Terhapus */}
        <ButtonSection
          title="27. Segmented Control - Data/Terhapus"
          description="Segmented control khusus untuk toggle data aktif dan terhapus (seperti di tabel)"
        >
          <div className="inline-flex bg-gray-100 rounded-lg p-1">
            <button
              onClick={() => setSegmentedValue("active")}
              disabled={loading}
              className={`px-4 py-2 rounded-md text-sm font-medium transition-all duration-200 ${
                segmentedValue === "active"
                  ? "bg-white text-[#0384d6] shadow-sm"
                  : "text-gray-600 hover:text-gray-900"
              } ${loading ? "opacity-50 cursor-not-allowed" : "cursor-pointer"}`}
              aria-label="Tampilkan data aktif"
            >
              Data
            </button>
            <button
              onClick={() => setSegmentedValue("deleted")}
              disabled={loading}
              className={`px-4 py-2 rounded-md text-sm font-medium transition-all duration-200 ${
                segmentedValue === "deleted"
                  ? "bg-white text-[#0384d6] shadow-sm"
                  : "text-gray-600 hover:text-gray-900"
              } ${loading ? "opacity-50 cursor-not-allowed" : "cursor-pointer"}`}
              aria-label="Tampilkan data terhapus"
            >
              Data Terhapus
            </button>
          </div>
        </ButtonSection>

        {/* 28. Button dengan Shadow Variants */}
        <ButtonSection
          title="28. Button dengan Shadow Variants"
          description="Button dengan berbagai variasi shadow untuk depth effect"
        >
          <button className="px-4 py-2 bg-[#0384d6] text-white rounded-lg font-medium hover:bg-[#0273b8] transition-all duration-200 shadow-sm">
            Shadow Small
          </button>

          <button className="px-4 py-2 bg-[#0384d6] text-white rounded-lg font-medium hover:bg-[#0273b8] transition-all duration-200 shadow-md">
            Shadow Medium
          </button>

          <button className="px-4 py-2 bg-[#0384d6] text-white rounded-lg font-medium hover:bg-[#0273b8] transition-all duration-200 shadow-lg">
            Shadow Large
          </button>

          <button className="px-4 py-2 bg-[#0384d6] text-white rounded-lg font-medium hover:bg-[#0273b8] transition-all duration-200 shadow-xl">
            Shadow XL
          </button>

          <button className="px-4 py-2 bg-[#0384d6] text-white rounded-lg font-medium hover:bg-[#0273b8] transition-all duration-200 shadow-2xl">
            Shadow 2XL
          </button>

          <button className="px-4 py-2 bg-[#0384d6] text-white rounded-lg font-medium hover:bg-[#0273b8] transition-all duration-200 shadow-[#0384d6]/50 shadow-lg">
            Colored Shadow
          </button>
        </ButtonSection>

        {/* 29. Button dengan Glassmorphism Effect */}
        <ButtonSection
          title="29. Button dengan Glassmorphism Effect"
          description="Button dengan efek kaca transparan (glassmorphism)"
        >
          <div className="relative w-full h-32 bg-gradient-to-br from-blue-400 via-purple-500 to-pink-500 rounded-xl p-4 flex items-center gap-4">
            <button className="px-4 py-2 bg-white/20 backdrop-blur-md text-white rounded-lg font-medium border border-white/30 hover:bg-white/30 transition-all duration-200 shadow-lg">
              Glass Button
            </button>

            <button className="px-4 py-2 bg-white/10 backdrop-blur-lg text-white rounded-lg font-medium border border-white/20 hover:bg-white/20 transition-all duration-200 shadow-lg">
              Light Glass
            </button>

            <button className="px-4 py-2 bg-black/20 backdrop-blur-md text-white rounded-lg font-medium border border-white/10 hover:bg-black/30 transition-all duration-200 shadow-lg">
              Dark Glass
            </button>
          </div>
        </ButtonSection>

        {/* 30. Button dengan Neumorphism Effect */}
        <ButtonSection
          title="30. Button dengan Neumorphism Effect"
          description="Button dengan efek neumorphism (soft UI)"
        >
          <div className="p-6 bg-gray-200 rounded-xl">
            <button className="px-6 py-3 bg-gray-200 text-gray-700 rounded-xl font-medium shadow-[4px_4px_8px_rgba(0,0,0,0.1),-4px_-4px_8px_rgba(255,255,255,0.8)] hover:shadow-[2px_2px_4px_rgba(0,0,0,0.1),-2px_-2px_4px_rgba(255,255,255,0.8)] active:shadow-[inset_2px_2px_4px_rgba(0,0,0,0.1),inset_-2px_-2px_4px_rgba(255,255,255,0.8)] transition-all duration-200">
              Neumorphic Button
            </button>
          </div>
        </ButtonSection>

        {/* 31. Button dengan 3D Effect */}
        <ButtonSection
          title="31. Button dengan 3D Effect"
          description="Button dengan efek 3D untuk depth perception"
        >
          <button className="px-6 py-3 bg-[#0384d6] text-white rounded-lg font-medium transform hover:translate-y-[-2px] hover:shadow-[0_10px_20px_rgba(3,132,214,0.3)] active:translate-y-[0px] active:shadow-[0_5px_10px_rgba(3,132,214,0.2)] transition-all duration-200 border-b-4 border-[#0273b8]">
            3D Button
          </button>

          <button className="px-6 py-3 bg-green-500 text-white rounded-lg font-medium transform hover:translate-y-[-2px] hover:shadow-[0_10px_20px_rgba(34,197,94,0.3)] active:translate-y-[0px] active:shadow-[0_5px_10px_rgba(34,197,94,0.2)] transition-all duration-200 border-b-4 border-green-600">
            3D Success
          </button>

          <button className="px-6 py-3 bg-red-500 text-white rounded-lg font-medium transform hover:translate-y-[-2px] hover:shadow-[0_10px_20px_rgba(239,68,68,0.3)] active:translate-y-[0px] active:shadow-[0_5px_10px_rgba(239,68,68,0.2)] transition-all duration-200 border-b-4 border-red-600">
            3D Danger
          </button>
        </ButtonSection>

        {/* 32. Button dengan Shimmer Effect */}
        <ButtonSection
          title="32. Button dengan Shimmer Effect"
          description="Button dengan efek shimmer/glow untuk menarik perhatian"
        >
          <button className="relative px-6 py-3 bg-gradient-to-r from-[#0384d6] via-blue-500 to-[#0384d6] text-white rounded-lg font-medium overflow-hidden group">
            <span className="relative z-10">Shimmer Button</span>
            <span className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000"></span>
          </button>

          <button className="relative px-6 py-3 bg-gradient-to-r from-purple-500 via-pink-500 to-purple-500 text-white rounded-lg font-medium overflow-hidden group">
            <span className="relative z-10">Gradient Shimmer</span>
            <span className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000"></span>
          </button>
        </ButtonSection>

        {/* 33. Button dengan Social Media Colors */}
        <ButtonSection
          title="33. Button dengan Social Media Colors"
          description="Button dengan warna khas platform sosial media"
        >
          <button className="px-4 py-2 bg-[#1877F2] text-white rounded-lg font-medium hover:bg-[#166FE5] transition-colors duration-200 shadow-sm hover:shadow-md">
            <span className="flex items-center gap-2">
              <span>Facebook</span>
            </span>
          </button>

          <button className="px-4 py-2 bg-[#1DA1F2] text-white rounded-lg font-medium hover:bg-[#1A91DA] transition-colors duration-200 shadow-sm hover:shadow-md">
            Twitter
          </button>

          <button className="px-4 py-2 bg-[#E4405F] text-white rounded-lg font-medium hover:bg-[#D32E4A] transition-colors duration-200 shadow-sm hover:shadow-md">
            Instagram
          </button>

          <button className="px-4 py-2 bg-[#0077B5] text-white rounded-lg font-medium hover:bg-[#006399] transition-colors duration-200 shadow-sm hover:shadow-md">
            LinkedIn
          </button>

          <button className="px-4 py-2 bg-[#FF0000] text-white rounded-lg font-medium hover:bg-[#CC0000] transition-colors duration-200 shadow-sm hover:shadow-md">
            YouTube
          </button>

          <button className="px-4 py-2 bg-[#000000] text-white rounded-lg font-medium hover:bg-[#1A1A1A] transition-colors duration-200 shadow-sm hover:shadow-md">
            GitHub
          </button>
        </ButtonSection>

        {/* 34. Button dengan Size Variants Lengkap */}
        <ButtonSection
          title="34. Button dengan Size Variants Lengkap"
          description="Button dengan berbagai ukuran dari extra small hingga extra large"
        >
          <button className="px-2 py-1 text-xs bg-[#0384d6] text-white rounded font-medium hover:bg-[#0273b8] transition-colors duration-200">
            XS Button
          </button>

          <button className="px-3 py-1.5 text-sm bg-[#0384d6] text-white rounded-md font-medium hover:bg-[#0273b8] transition-colors duration-200">
            SM Button
          </button>

          <button className="px-4 py-2 text-base bg-[#0384d6] text-white rounded-lg font-medium hover:bg-[#0273b8] transition-colors duration-200">
            MD Button
          </button>

          <button className="px-5 py-2.5 text-lg bg-[#0384d6] text-white rounded-lg font-medium hover:bg-[#0273b8] transition-colors duration-200">
            LG Button
          </button>

          <button className="px-6 py-3 text-xl bg-[#0384d6] text-white rounded-lg font-semibold hover:bg-[#0273b8] transition-colors duration-200">
            XL Button
          </button>
        </ButtonSection>

        {/* 35. Button dengan Border Variants */}
        <ButtonSection
          title="35. Button dengan Border Variants"
          description="Button dengan berbagai variasi border width dan style"
        >
          <button className="px-4 py-2 bg-white text-[#0384d6] border border-[#0384d6] rounded-lg font-medium hover:bg-blue-50 transition-colors duration-200">
            Border 1px
          </button>

          <button className="px-4 py-2 bg-white text-[#0384d6] border-2 border-[#0384d6] rounded-lg font-medium hover:bg-blue-50 transition-colors duration-200">
            Border 2px
          </button>

          <button className="px-4 py-2 bg-white text-[#0384d6] border-4 border-[#0384d6] rounded-lg font-medium hover:bg-blue-50 transition-colors duration-200">
            Border 4px
          </button>

          <button className="px-4 py-2 bg-white text-[#0384d6] border-2 border-dashed border-[#0384d6] rounded-lg font-medium hover:bg-blue-50 transition-colors duration-200">
            Dashed Border
          </button>

          <button className="px-4 py-2 bg-white text-[#0384d6] border-2 border-dotted border-[#0384d6] rounded-lg font-medium hover:bg-blue-50 transition-colors duration-200">
            Dotted Border
          </button>
        </ButtonSection>

        {/* 36. Button dengan State Variants */}
        <ButtonSection
          title="36. Button dengan State Variants"
          description="Button dengan berbagai state: default, hover, active, focus, disabled"
        >
          <button className="px-4 py-2 bg-[#0384d6] text-white rounded-lg font-medium">
            Default State
          </button>

          <button className="px-4 py-2 bg-[#0384d6] text-white rounded-lg font-medium hover:bg-[#0273b8] hover:scale-105 transition-all duration-200">
            Hover State
          </button>

          <button className="px-4 py-2 bg-[#0384d6] text-white rounded-lg font-medium active:bg-[#025a94] active:scale-95 transition-all duration-200">
            Active State
          </button>

          <button className="px-4 py-2 bg-[#0384d6] text-white rounded-lg font-medium focus:outline-none focus:ring-4 focus:ring-[#0384d6]/50 transition-all duration-200">
            Focus State
          </button>

          <button className="px-4 py-2 bg-gray-300 text-gray-500 rounded-lg font-medium cursor-not-allowed opacity-50">
            Disabled State
          </button>
        </ButtonSection>

        {/* 37. Button dengan Icon Variants */}
        <ButtonSection
          title="37. Button dengan Icon Variants"
          description="Button dengan berbagai kombinasi icon dan text"
        >
          <button className="flex items-center gap-2 px-4 py-2 bg-[#0384d6] text-white rounded-lg font-medium hover:bg-[#0273b8] transition-colors duration-200">
            <Save size={18} />
            <span>Save</span>
          </button>

          <button className="flex items-center gap-2 px-4 py-2 bg-green-500 text-white rounded-lg font-medium hover:bg-green-600 transition-colors duration-200">
            <RefreshCw size={18} />
            <span>Refresh</span>
          </button>

          <button className="flex items-center gap-2 px-4 py-2 bg-white text-gray-700 border border-gray-300 rounded-lg font-medium hover:bg-gray-50 transition-colors duration-200">
            <Filter size={18} />
            <span>Filter</span>
          </button>

          <button className="flex items-center gap-2 px-4 py-2 bg-white text-gray-700 border border-gray-300 rounded-lg font-medium hover:bg-gray-50 transition-colors duration-200">
            <Eye size={18} />
            <span>View</span>
          </button>

          <button className="flex items-center gap-2 px-4 py-2 bg-white text-gray-700 border border-gray-300 rounded-lg font-medium hover:bg-gray-50 transition-colors duration-200">
            <EyeOff size={18} />
            <span>Hide</span>
          </button>

          <button className="flex items-center gap-2 px-4 py-2 bg-white text-gray-700 border border-gray-300 rounded-lg font-medium hover:bg-gray-50 transition-colors duration-200">
            <Calendar size={18} />
            <span>Calendar</span>
          </button>
        </ButtonSection>

        {/* 38. Button dengan File Type Icons */}
        <ButtonSection
          title="38. Button dengan File Type Icons"
          description="Button dengan icon sesuai tipe file"
        >
          <button className="flex items-center gap-2 px-4 py-2 bg-white text-gray-700 border border-gray-300 rounded-lg font-medium hover:bg-gray-50 transition-colors duration-200">
            <FileText size={18} className="text-blue-500" />
            <span>Document</span>
          </button>

          <button className="flex items-center gap-2 px-4 py-2 bg-white text-gray-700 border border-gray-300 rounded-lg font-medium hover:bg-gray-50 transition-colors duration-200">
            <Image size={18} className="text-green-500" />
            <span>Image</span>
          </button>

          <button className="flex items-center gap-2 px-4 py-2 bg-white text-gray-700 border border-gray-300 rounded-lg font-medium hover:bg-gray-50 transition-colors duration-200">
            <Video size={18} className="text-red-500" />
            <span>Video</span>
          </button>

          <button className="flex items-center gap-2 px-4 py-2 bg-white text-gray-700 border border-gray-300 rounded-lg font-medium hover:bg-gray-50 transition-colors duration-200">
            <Music size={18} className="text-purple-500" />
            <span>Audio</span>
          </button>

          <button className="flex items-center gap-2 px-4 py-2 bg-white text-gray-700 border border-gray-300 rounded-lg font-medium hover:bg-gray-50 transition-colors duration-200">
            <File size={18} className="text-gray-500" />
            <span>File</span>
          </button>

          <button className="flex items-center gap-2 px-4 py-2 bg-white text-gray-700 border border-gray-300 rounded-lg font-medium hover:bg-gray-50 transition-colors duration-200">
            <Folder size={18} className="text-yellow-500" />
            <span>Folder</span>
          </button>
        </ButtonSection>

        {/* 39. Button dengan Confirmation States */}
        <ButtonSection
          title="39. Button dengan Confirmation States"
          description="Button yang berubah state setelah diklik (confirmation feedback)"
        >
          <button
            onClick={(e) => {
              const btn = e.target;
              const originalText = btn.textContent;
              btn.textContent = "Saved!";
              btn.className = "px-4 py-2 bg-green-500 text-white rounded-lg font-medium transition-all duration-200";
              setTimeout(() => {
                btn.textContent = originalText;
                btn.className = "px-4 py-2 bg-[#0384d6] text-white rounded-lg font-medium hover:bg-[#0273b8] transition-all duration-200";
              }, 2000);
            }}
            className="px-4 py-2 bg-[#0384d6] text-white rounded-lg font-medium hover:bg-[#0273b8] transition-all duration-200"
          >
            Click to Save
          </button>

          <button
            onClick={(e) => {
              const btn = e.target;
              const originalText = btn.textContent;
              btn.textContent = "✓ Copied!";
              btn.className = "px-4 py-2 bg-green-500 text-white rounded-lg font-medium transition-all duration-200";
              setTimeout(() => {
                btn.textContent = originalText;
                btn.className = "px-4 py-2 bg-white text-[#0384d6] border-2 border-[#0384d6] rounded-lg font-medium hover:bg-blue-50 transition-all duration-200";
              }, 2000);
            }}
            className="px-4 py-2 bg-white text-[#0384d6] border-2 border-[#0384d6] rounded-lg font-medium hover:bg-blue-50 transition-all duration-200"
          >
            Copy
          </button>
        </ButtonSection>

        {/* 40. Button dengan Color Palette Lengkap */}
        <ButtonSection
          title="40. Button dengan Color Palette Lengkap"
          description="Button dengan berbagai warna dari palette design system"
        >
          <button className="px-4 py-2 bg-blue-500 text-white rounded-lg font-medium hover:bg-blue-600 transition-colors duration-200">
            Blue
          </button>

          <button className="px-4 py-2 bg-indigo-500 text-white rounded-lg font-medium hover:bg-indigo-600 transition-colors duration-200">
            Indigo
          </button>

          <button className="px-4 py-2 bg-purple-500 text-white rounded-lg font-medium hover:bg-purple-600 transition-colors duration-200">
            Purple
          </button>

          <button className="px-4 py-2 bg-pink-500 text-white rounded-lg font-medium hover:bg-pink-600 transition-colors duration-200">
            Pink
          </button>

          <button className="px-4 py-2 bg-red-500 text-white rounded-lg font-medium hover:bg-red-600 transition-colors duration-200">
            Red
          </button>

          <button className="px-4 py-2 bg-orange-500 text-white rounded-lg font-medium hover:bg-orange-600 transition-colors duration-200">
            Orange
          </button>

          <button className="px-4 py-2 bg-yellow-500 text-white rounded-lg font-medium hover:bg-yellow-600 transition-colors duration-200">
            Yellow
          </button>

          <button className="px-4 py-2 bg-green-500 text-white rounded-lg font-medium hover:bg-green-600 transition-colors duration-200">
            Green
          </button>

          <button className="px-4 py-2 bg-teal-500 text-white rounded-lg font-medium hover:bg-teal-600 transition-colors duration-200">
            Teal
          </button>

          <button className="px-4 py-2 bg-cyan-500 text-white rounded-lg font-medium hover:bg-cyan-600 transition-colors duration-200">
            Cyan
          </button>

          <button className="px-4 py-2 bg-gray-500 text-white rounded-lg font-medium hover:bg-gray-600 transition-colors duration-200">
            Gray
          </button>

          <button className="px-4 py-2 bg-slate-500 text-white rounded-lg font-medium hover:bg-slate-600 transition-colors duration-200">
            Slate
          </button>
        </ButtonSection>

        {/* ========== INPUT FIELDS ========== */}
        <div className="mb-12" id="inputs">
          <div className="mb-6">
            <h2 className="text-3xl font-bold text-gray-900 mb-2">Input Fields</h2>
            <p className="text-gray-600">Berbagai jenis input field yang digunakan dalam form</p>
          </div>
        </div>

        <ButtonSection
          title="41. Text Input"
          description="Input field untuk teks biasa"
        >
          <div className="w-full space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Label Input</label>
              <input
                type="text"
                placeholder="Masukkan teks..."
                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg text-gray-700 focus:outline-none focus:ring-2 focus:ring-[#0384d6] focus:border-[#0384d6] transition"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Input dengan Icon</label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
                <input
                  type="text"
                  placeholder="Cari..."
                  className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg text-gray-700 focus:outline-none focus:ring-2 focus:ring-[#0384d6] focus:border-[#0384d6] transition"
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Input Disabled</label>
              <input
                type="text"
                placeholder="Disabled input"
                disabled
                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg bg-gray-100 text-gray-500 cursor-not-allowed"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Input dengan Error</label>
              <input
                type="text"
                placeholder="Input dengan error"
                className="w-full px-4 py-2.5 border border-red-300 rounded-lg text-gray-700 focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-red-500 transition"
              />
              <p className="mt-1 text-sm text-red-600">Field ini wajib diisi</p>
            </div>
          </div>
        </ButtonSection>

        <ButtonSection
          title="42. Number Input"
          description="Input field untuk angka"
        >
          <div className="w-full space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Number Input</label>
              <input
                type="number"
                placeholder="0"
                min="0"
                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg text-gray-700 focus:outline-none focus:ring-2 focus:ring-[#0384d6] focus:border-[#0384d6] transition"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Number dengan Min/Max</label>
              <input
                type="number"
                placeholder="0"
                min="0"
                max="100"
                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg text-gray-700 focus:outline-none focus:ring-2 focus:ring-[#0384d6] focus:border-[#0384d6] transition"
              />
            </div>
          </div>
        </ButtonSection>

        <ButtonSection
          title="43. Password Input"
          description="Input field untuk password"
        >
          <div className="w-full space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Password Input</label>
              <input
                type="password"
                placeholder="Masukkan password"
                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg text-gray-700 focus:outline-none focus:ring-2 focus:ring-[#0384d6] focus:border-[#0384d6] transition"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Password dengan Show/Hide</label>
              <div className="relative">
                <input
                  type="password"
                  placeholder="Masukkan password"
                  className="w-full px-4 py-2.5 pr-10 border border-gray-300 rounded-lg text-gray-700 focus:outline-none focus:ring-2 focus:ring-[#0384d6] focus:border-[#0384d6] transition"
                />
                <Eye className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 cursor-pointer" size={18} />
              </div>
            </div>
          </div>
        </ButtonSection>

        <ButtonSection
          title="44. Email & URL Input"
          description="Input field khusus untuk email dan URL"
        >
          <div className="w-full space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Email Input</label>
              <input
                type="email"
                placeholder="nama@example.com"
                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg text-gray-700 focus:outline-none focus:ring-2 focus:ring-[#0384d6] focus:border-[#0384d6] transition"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">URL Input</label>
              <input
                type="url"
                placeholder="https://example.com"
                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg text-gray-700 focus:outline-none focus:ring-2 focus:ring-[#0384d6] focus:border-[#0384d6] transition"
              />
            </div>
          </div>
        </ButtonSection>

        <ButtonSection
          title="45. Textarea"
          description="Input field untuk teks panjang"
        >
          <div className="w-full space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Textarea Standard</label>
              <textarea
                rows="4"
                placeholder="Masukkan teks panjang..."
                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg text-gray-700 focus:outline-none focus:ring-2 focus:ring-[#0384d6] focus:border-[#0384d6] transition resize-none"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Textarea dengan Resize</label>
              <textarea
                rows="4"
                placeholder="Textarea dengan resize..."
                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg text-gray-700 focus:outline-none focus:ring-2 focus:ring-[#0384d6] focus:border-[#0384d6] transition"
              />
            </div>
          </div>
        </ButtonSection>

        <ButtonSection
          title="46. Select/Dropdown"
          description="Dropdown untuk pilihan single atau multiple"
        >
          <div className="w-full space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Select Standard</label>
              <select className="w-full px-4 py-2.5 border border-gray-300 rounded-lg text-gray-700 bg-white focus:outline-none focus:ring-2 focus:ring-[#0384d6] focus:border-[#0384d6] transition">
                <option value="">-- Pilih Opsi --</option>
                <option value="1">Opsi 1</option>
                <option value="2">Opsi 2</option>
                <option value="3">Opsi 3</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Select dengan Icon</label>
              <div className="relative">
                <ChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 pointer-events-none" size={18} />
                <select className="w-full px-4 py-2.5 pr-10 border border-gray-300 rounded-lg text-gray-700 bg-white focus:outline-none focus:ring-2 focus:ring-[#0384d6] focus:border-[#0384d6] transition appearance-none">
                  <option value="">-- Pilih Opsi --</option>
                  <option value="1">Opsi 1</option>
                  <option value="2">Opsi 2</option>
                  <option value="3">Opsi 3</option>
                </select>
              </div>
            </div>
          </div>
        </ButtonSection>

        {/* ========== MODAL/DIALOG ========== */}
        <div className="mb-12" id="modals">
          <div className="mb-6">
            <h2 className="text-3xl font-bold text-gray-900 mb-2">Modal & Dialog</h2>
            <p className="text-gray-600">Komponen modal untuk dialog dan form</p>
          </div>
        </div>

        <ButtonSection
          title="47. Modal Standard"
          description="Modal dengan header, body, dan footer"
        >
          <button
            onClick={() => setDropdownOpen(true)}
            className="px-4 py-2 bg-[#0384d6] text-white rounded-lg font-medium hover:bg-[#0273b8] transition-colors duration-200"
          >
            Buka Modal
          </button>
          {dropdownOpen && (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm" onClick={() => setDropdownOpen(false)}>
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                onClick={(e) => e.stopPropagation()}
                className="bg-white rounded-xl shadow-xl max-w-md w-full overflow-hidden"
              >
                <div className="p-6 border-b border-gray-200 bg-gradient-to-r from-blue-50 to-indigo-50">
                  <h3 className="text-lg font-semibold text-gray-900">Modal Title</h3>
                  <p className="text-sm text-gray-600 mt-1">Deskripsi modal</p>
                </div>
                <div className="p-6">
                  <p className="text-gray-700">Konten modal di sini...</p>
                </div>
                <div className="p-6 bg-gray-50 border-t border-gray-200 flex justify-end gap-3">
                  <button
                    onClick={() => setDropdownOpen(false)}
                    className="px-4 py-2 bg-white text-gray-700 border border-gray-300 rounded-lg font-medium hover:bg-gray-50 transition-colors"
                  >
                    Batal
                  </button>
                  <button
                    onClick={() => setDropdownOpen(false)}
                    className="px-4 py-2 bg-[#0384d6] text-white rounded-lg font-medium hover:bg-[#0273b8] transition-colors"
                  >
                    Simpan
                  </button>
                </div>
              </motion.div>
            </div>
          )}
        </ButtonSection>

        {/* ========== CARDS ========== */}
        <div className="mb-12" id="cards">
          <div className="mb-6">
            <h2 className="text-3xl font-bold text-gray-900 mb-2">Cards</h2>
            <p className="text-gray-600">Komponen card untuk menampilkan konten</p>
          </div>
        </div>

        <ButtonSection
          title="48. Card Standard"
          description="Card dengan berbagai variasi"
        >
          <div className="w-full grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <h4 className="font-semibold text-gray-900 mb-2">Card Standard</h4>
              <p className="text-sm text-gray-600">Konten card di sini</p>
            </div>
            <div className="bg-white rounded-xl shadow-md border border-gray-200 p-6">
              <h4 className="font-semibold text-gray-900 mb-2">Card dengan Shadow</h4>
              <p className="text-sm text-gray-600">Konten card di sini</p>
            </div>
            <div className="bg-gradient-to-br from-[#0384d6] to-[#043975] rounded-xl shadow-lg p-6 text-white">
              <h4 className="font-semibold mb-2">Card Gradient</h4>
              <p className="text-sm text-white/80">Konten card di sini</p>
            </div>
          </div>
        </ButtonSection>

        {/* ========== TABLES ========== */}
        <div className="mb-12" id="tables">
          <div className="mb-6">
            <h2 className="text-3xl font-bold text-gray-900 mb-2">Tables</h2>
            <p className="text-gray-600">Komponen table untuk menampilkan data</p>
          </div>
        </div>

        <ButtonSection
          title="49. Table Standard"
          description="Table dengan header gradient dan styling konsisten"
        >
          <div className="w-full overflow-x-auto rounded-lg border border-slate-200 shadow-md">
            <table className="w-full text-sm text-left border-collapse">
              <thead className="bg-gradient-to-r from-[#043975] to-[#0384d6] text-white">
                <tr>
                  <th className="px-6 py-4 text-xs font-semibold tracking-wide uppercase text-center border border-white/20">No</th>
                  <th className="px-6 py-4 text-xs font-semibold tracking-wide uppercase text-center border border-white/20">Nama</th>
                  <th className="px-6 py-4 text-xs font-semibold tracking-wide uppercase text-center border border-white/20">Email</th>
                  <th className="px-6 py-4 text-xs font-semibold tracking-wide uppercase text-center border border-white/20">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                <tr className="hover:bg-gray-50 transition-colors">
                  <td className="px-6 py-4 text-center border border-slate-200">1</td>
                  <td className="px-6 py-4 text-center border border-slate-200">John Doe</td>
                  <td className="px-6 py-4 text-center border border-slate-200">john@example.com</td>
                  <td className="px-6 py-4 text-center border border-slate-200">
                    <div className="flex justify-center gap-2">
                      <button className="p-1 text-blue-600 hover:bg-blue-50 rounded">
                        <Edit size={16} />
                      </button>
                      <button className="p-1 text-red-600 hover:bg-red-50 rounded">
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </td>
                </tr>
                <tr className="hover:bg-gray-50 transition-colors">
                  <td className="px-6 py-4 text-center border border-slate-200">2</td>
                  <td className="px-6 py-4 text-center border border-slate-200">Jane Smith</td>
                  <td className="px-6 py-4 text-center border border-slate-200">jane@example.com</td>
                  <td className="px-6 py-4 text-center border border-slate-200">
                    <div className="flex justify-center gap-2">
                      <button className="p-1 text-blue-600 hover:bg-blue-50 rounded">
                        <Edit size={16} />
                      </button>
                      <button className="p-1 text-red-600 hover:bg-red-50 rounded">
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </ButtonSection>

        {/* ========== FORMS ========== */}
        <div className="mb-12" id="forms">
          <div className="mb-6">
            <h2 className="text-3xl font-bold text-gray-900 mb-2">Forms</h2>
            <p className="text-gray-600">Layout form dan form groups</p>
          </div>
        </div>

        <ButtonSection
          title="50. Form Layout"
          description="Layout form dengan grid dan spacing"
        >
          <div className="w-full bg-white rounded-xl border border-gray-200 p-6">
            <form className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">Nama Lengkap</label>
                  <input
                    type="text"
                    placeholder="Masukkan nama"
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg text-gray-700 focus:outline-none focus:ring-2 focus:ring-[#0384d6] focus:border-[#0384d6] transition"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">Email</label>
                  <input
                    type="email"
                    placeholder="nama@example.com"
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg text-gray-700 focus:outline-none focus:ring-2 focus:ring-[#0384d6] focus:border-[#0384d6] transition"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Pesan</label>
                <textarea
                  rows="4"
                  placeholder="Masukkan pesan"
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg text-gray-700 focus:outline-none focus:ring-2 focus:ring-[#0384d6] focus:border-[#0384d6] transition resize-none"
                />
              </div>
              <div className="flex justify-end gap-3 pt-6 mt-6 border-t border-gray-200">
                <button
                  type="button"
                  className="relative px-6 py-2.5 rounded-lg text-sm font-medium text-white bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 transition-all duration-200 overflow-hidden group"
                >
                  <span className="relative z-10">Batal</span>
                  <span className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000"></span>
                </button>
                <button
                  type="submit"
                  className="relative px-6 py-2.5 rounded-lg text-sm font-medium text-white bg-gradient-to-r from-[#0384d6] to-blue-600 hover:from-[#0273b8] hover:to-blue-700 transition-all duration-200 overflow-hidden group"
                >
                  <span className="relative z-10">Simpan</span>
                  <span className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000"></span>
                </button>
              </div>
            </form>
          </div>
        </ButtonSection>

        {/* ========== ALERTS & NOTIFICATIONS ========== */}
        <div className="mb-12" id="alerts">
          <div className="mb-6">
            <h2 className="text-3xl font-bold text-gray-900 mb-2">Alerts & Notifications</h2>
            <p className="text-gray-600">Komponen untuk menampilkan alert dan notifikasi</p>
          </div>
        </div>

        <ButtonSection
          title="51. Alert Variants"
          description="Alert dengan berbagai tipe (success, error, warning, info)"
        >
          <div className="w-full space-y-4">
            <div className="p-4 bg-green-50 border border-green-200 rounded-lg flex items-start gap-3">
              <CheckCircle className="text-green-600 flex-shrink-0 mt-0.5" size={20} />
              <div>
                <h4 className="font-semibold text-green-900 mb-1">Success Alert</h4>
                <p className="text-sm text-green-800">Operasi berhasil dilakukan</p>
              </div>
            </div>
            <div className="p-4 bg-red-50 border border-red-200 rounded-lg flex items-start gap-3">
              <XCircle className="text-red-600 flex-shrink-0 mt-0.5" size={20} />
              <div>
                <h4 className="font-semibold text-red-900 mb-1">Error Alert</h4>
                <p className="text-sm text-red-800">Terjadi kesalahan saat memproses</p>
              </div>
            </div>
            <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg flex items-start gap-3">
              <AlertCircle className="text-yellow-600 flex-shrink-0 mt-0.5" size={20} />
              <div>
                <h4 className="font-semibold text-yellow-900 mb-1">Warning Alert</h4>
                <p className="text-sm text-yellow-800">Perhatian: Pastikan data sudah benar</p>
              </div>
            </div>
            <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg flex items-start gap-3">
              <Info className="text-blue-600 flex-shrink-0 mt-0.5" size={20} />
              <div>
                <h4 className="font-semibold text-blue-900 mb-1">Info Alert</h4>
                <p className="text-sm text-blue-800">Informasi penting untuk diketahui</p>
              </div>
            </div>
          </div>
        </ButtonSection>

        {/* ========== LOADING STATES ========== */}
        <div className="mb-12" id="loading">
          <div className="mb-6">
            <h2 className="text-3xl font-bold text-gray-900 mb-2">Loading States</h2>
            <p className="text-gray-600">Komponen untuk menampilkan loading state</p>
          </div>
        </div>

        <ButtonSection
          title="52. Loading Spinner"
          description="Spinner untuk indikasi loading"
        >
          <div className="flex items-center gap-6">
            <Loader2 className="animate-spin text-[#0384d6]" size={24} />
            <Loader2 className="animate-spin text-green-500" size={32} />
            <Loader2 className="animate-spin text-red-500" size={40} />
          </div>
        </ButtonSection>

        <ButtonSection
          title="53. Skeleton Loading"
          description="Skeleton untuk placeholder saat loading"
        >
          <div className="w-full space-y-4">
            <div className="animate-pulse">
              <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
              <div className="h-4 bg-gray-200 rounded w-1/2"></div>
            </div>
            <div className="animate-pulse">
              <div className="h-20 bg-gray-200 rounded"></div>
            </div>
          </div>
        </ButtonSection>

        {/* ========== TYPOGRAPHY ========== */}
        <div className="mb-12" id="typography">
          <div className="mb-6">
            <h2 className="text-3xl font-bold text-gray-900 mb-2">Typography</h2>
            <p className="text-gray-600">Sistem tipografi yang digunakan</p>
          </div>
        </div>

        <ButtonSection
          title="54. Heading Styles"
          description="Berbagai ukuran heading"
        >
          <div className="w-full space-y-4">
            <h1 className="text-4xl font-bold text-gray-900">Heading 1</h1>
            <h2 className="text-3xl font-bold text-gray-900">Heading 2</h2>
            <h3 className="text-2xl font-bold text-gray-900">Heading 3</h3>
            <h4 className="text-xl font-semibold text-gray-900">Heading 4</h4>
            <h5 className="text-lg font-semibold text-gray-900">Heading 5</h5>
            <h6 className="text-base font-semibold text-gray-900">Heading 6</h6>
          </div>
        </ButtonSection>

        <ButtonSection
          title="55. Text Styles"
          description="Berbagai style teks"
        >
          <div className="w-full space-y-3">
            <p className="text-base text-gray-700">Text normal - Base size</p>
            <p className="text-sm text-gray-600">Text kecil - Small size</p>
            <p className="text-xs text-gray-500">Text sangat kecil - Extra small</p>
            <p className="text-base font-medium text-gray-700">Text medium weight</p>
            <p className="text-base font-semibold text-gray-700">Text semibold</p>
            <p className="text-base font-bold text-gray-700">Text bold</p>
          </div>
        </ButtonSection>

        {/* ========== BADGES & TAGS ========== */}
        <div className="mb-12" id="badges">
          <div className="mb-6">
            <h2 className="text-3xl font-bold text-gray-900 mb-2">Badges & Tags</h2>
            <p className="text-gray-600">Komponen badge dan tag untuk label dan status</p>
          </div>
        </div>

        <ButtonSection
          title="58. Badge Variants"
          description="Badge dengan berbagai variasi warna dan ukuran"
        >
          <div className="flex flex-wrap gap-3 items-center">
            <span className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm font-medium">Primary</span>
            <span className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-sm font-medium">Success</span>
            <span className="px-3 py-1 bg-yellow-100 text-yellow-700 rounded-full text-sm font-medium">Warning</span>
            <span className="px-3 py-1 bg-red-100 text-red-700 rounded-full text-sm font-medium">Error</span>
            <span className="px-3 py-1 bg-purple-100 text-purple-700 rounded-full text-sm font-medium">Info</span>
            <span className="px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-sm font-medium">Neutral</span>
            <span className="px-2 py-0.5 bg-blue-100 text-blue-700 rounded text-xs font-medium">Small</span>
            <span className="px-4 py-1.5 bg-blue-100 text-blue-700 rounded-lg text-base font-medium">Large</span>
          </div>
        </ButtonSection>

        <ButtonSection
          title="59. Badge dengan Icon"
          description="Badge yang dilengkapi dengan icon"
        >
          <div className="flex flex-wrap gap-3 items-center">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm font-medium">
              <CheckCircle size={14} />
              Verified
            </span>
            <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-green-100 text-green-700 rounded-full text-sm font-medium">
              <Star size={14} />
              Featured
            </span>
            <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-red-100 text-red-700 rounded-full text-sm font-medium">
              <AlertCircle size={14} />
              Urgent
            </span>
            <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-yellow-100 text-yellow-700 rounded-full text-sm font-medium">
              <Clock size={14} />
              Pending
            </span>
          </div>
        </ButtonSection>

        <ButtonSection
          title="60. Badge dengan Counter"
          description="Badge yang menampilkan jumlah/counter"
        >
          <div className="flex flex-wrap gap-3 items-center">
            <span className="relative inline-flex items-center px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm font-medium">
              Notifications
              <span className="ml-2 px-1.5 py-0.5 bg-blue-600 text-white rounded-full text-xs font-bold">3</span>
            </span>
            <span className="relative inline-flex items-center px-3 py-1 bg-red-100 text-red-700 rounded-full text-sm font-medium">
              Messages
              <span className="ml-2 px-1.5 py-0.5 bg-red-600 text-white rounded-full text-xs font-bold">12</span>
            </span>
            <span className="relative inline-flex items-center px-3 py-1 bg-green-100 text-green-700 rounded-full text-sm font-medium">
              Updates
              <span className="ml-2 px-1.5 py-0.5 bg-green-600 text-white rounded-full text-xs font-bold">99+</span>
            </span>
          </div>
        </ButtonSection>

        {/* ========== TOOLTIPS ========== */}
        <div className="mb-12" id="tooltips">
          <div className="mb-6">
            <h2 className="text-3xl font-bold text-gray-900 mb-2">Tooltips</h2>
            <p className="text-gray-600">Tooltip untuk informasi tambahan saat hover</p>
          </div>
        </div>

        <ButtonSection
          title="61. Tooltip Variants"
          description="Tooltip dengan berbagai posisi dan style"
        >
          <div className="flex flex-wrap gap-6 items-center">
            <div className="relative group">
              <button className="px-4 py-2 bg-[#0384d6] text-white rounded-lg font-medium">
                Hover Me (Top)
              </button>
              <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-3 py-2 bg-gray-900 text-white text-sm rounded-lg whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-10">
                Tooltip di atas
                <div className="absolute top-full left-1/2 transform -translate-x-1/2 -mt-1 border-4 border-transparent border-t-gray-900"></div>
              </div>
            </div>
            <div className="relative group">
              <button className="px-4 py-2 bg-[#0384d6] text-white rounded-lg font-medium">
                Hover Me (Bottom)
              </button>
              <div className="absolute top-full left-1/2 transform -translate-x-1/2 mt-2 px-3 py-2 bg-gray-900 text-white text-sm rounded-lg whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-10">
                Tooltip di bawah
                <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 -mb-1 border-4 border-transparent border-b-gray-900"></div>
              </div>
            </div>
            <div className="relative group">
              <button className="px-4 py-2 bg-[#0384d6] text-white rounded-lg font-medium">
                Hover Me (Left)
              </button>
              <div className="absolute right-full top-1/2 transform -translate-y-1/2 mr-2 px-3 py-2 bg-gray-900 text-white text-sm rounded-lg whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-10">
                Tooltip di kiri
                <div className="absolute left-full top-1/2 transform -translate-y-1/2 -ml-1 border-4 border-transparent border-l-gray-900"></div>
              </div>
            </div>
            <div className="relative group">
              <button className="px-4 py-2 bg-[#0384d6] text-white rounded-lg font-medium">
                Hover Me (Right)
              </button>
              <div className="absolute left-full top-1/2 transform -translate-y-1/2 ml-2 px-3 py-2 bg-gray-900 text-white text-sm rounded-lg whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-10">
                Tooltip di kanan
                <div className="absolute right-full top-1/2 transform -translate-y-1/2 -mr-1 border-4 border-transparent border-r-gray-900"></div>
              </div>
            </div>
          </div>
        </ButtonSection>

        {/* ========== PAGINATION ========== */}
        <div className="mb-12" id="pagination">
          <div className="mb-6">
            <h2 className="text-3xl font-bold text-gray-900 mb-2">Pagination</h2>
            <p className="text-gray-600">Komponen pagination untuk navigasi halaman</p>
          </div>
        </div>

        <ButtonSection
          title="62. Pagination Standard"
          description="Pagination dengan prev/next dan nomor halaman"
        >
          <div className="flex items-center gap-2">
            <button
              onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
              disabled={currentPage === 1}
              className="px-3 py-2 border border-gray-300 rounded-lg text-sm font-medium hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <ChevronLeft size={16} />
            </button>
            {[1, 2, 3, 4, 5].map((page) => (
              <button
                key={page}
                onClick={() => setCurrentPage(page)}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  currentPage === page
                    ? "bg-[#0384d6] text-white"
                    : "border border-gray-300 hover:bg-gray-50"
                }`}
              >
                {page}
              </button>
            ))}
            <button
              onClick={() => setCurrentPage(currentPage + 1)}
              disabled={currentPage === 5}
              className="px-3 py-2 border border-gray-300 rounded-lg text-sm font-medium hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <ChevronRight size={16} />
            </button>
          </div>
        </ButtonSection>

        <ButtonSection
          title="63. Pagination Compact"
          description="Pagination dengan ellipsis untuk banyak halaman"
        >
          <div className="flex items-center gap-2">
            <button className="px-3 py-2 border border-gray-300 rounded-lg text-sm font-medium hover:bg-gray-50">
              <ChevronLeft size={16} />
            </button>
            <button className="px-4 py-2 bg-[#0384d6] text-white rounded-lg text-sm font-medium">1</button>
            <button className="px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium hover:bg-gray-50">2</button>
            <span className="px-2 text-gray-500">...</span>
            <button className="px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium hover:bg-gray-50">10</button>
            <button className="px-3 py-2 border border-gray-300 rounded-lg text-sm font-medium hover:bg-gray-50">
              <ChevronRight size={16} />
            </button>
          </div>
        </ButtonSection>

        {/* ========== TABS ========== */}
        <div className="mb-12" id="tabs">
          <div className="mb-6">
            <h2 className="text-3xl font-bold text-gray-900 mb-2">Tabs</h2>
            <p className="text-gray-600">Komponen tab untuk navigasi konten</p>
          </div>
        </div>

        <ButtonSection
          title="64. Tabs Standard"
          description="Tab dengan indikator aktif"
        >
          <div className="w-full">
            <div className="flex border-b border-gray-200">
              {["Tab 1", "Tab 2", "Tab 3"].map((tab, index) => (
                <button
                  key={index}
                  onClick={() => setActiveTab(`tab${index + 1}`)}
                  className={`px-6 py-3 text-sm font-medium border-b-2 transition-colors ${
                    activeTab === `tab${index + 1}`
                      ? "border-[#0384d6] text-[#0384d6]"
                      : "border-transparent text-gray-600 hover:text-gray-900 hover:border-gray-300"
                  }`}
                >
                  {tab}
                </button>
              ))}
            </div>
            <div className="mt-4 p-4 bg-gray-50 rounded-lg">
              <p className="text-sm text-gray-600">Konten untuk {activeTab}</p>
            </div>
          </div>
        </ButtonSection>

        <ButtonSection
          title="65. Tabs dengan Icon"
          description="Tab yang dilengkapi dengan icon"
        >
          <div className="w-full">
            <div className="flex border-b border-gray-200">
              <button className="flex items-center gap-2 px-6 py-3 text-sm font-medium border-b-2 border-[#0384d6] text-[#0384d6]">
                <Home size={16} />
                Home
              </button>
              <button className="flex items-center gap-2 px-6 py-3 text-sm font-medium border-b-2 border-transparent text-gray-600 hover:text-gray-900">
                <User size={16} />
                Profile
              </button>
              <button className="flex items-center gap-2 px-6 py-3 text-sm font-medium border-b-2 border-transparent text-gray-600 hover:text-gray-900">
                <Settings size={16} />
                Settings
              </button>
            </div>
          </div>
        </ButtonSection>

        {/* ========== BREADCRUMBS ========== */}
        <div className="mb-12" id="breadcrumbs">
          <div className="mb-6">
            <h2 className="text-3xl font-bold text-gray-900 mb-2">Breadcrumbs</h2>
            <p className="text-gray-600">Navigasi breadcrumb untuk menunjukkan lokasi</p>
          </div>
        </div>

        <ButtonSection
          title="66. Breadcrumb Standard"
          description="Breadcrumb dengan separator"
        >
          <nav className="flex items-center space-x-2 text-sm">
            <a href="#" className="text-gray-500 hover:text-gray-700 flex items-center">
              <Home size={16} />
            </a>
            <ChevronRight size={16} className="text-gray-400" />
            <a href="#" className="text-gray-500 hover:text-gray-700">Dashboard</a>
            <ChevronRight size={16} className="text-gray-400" />
            <a href="#" className="text-gray-500 hover:text-gray-700">Tables</a>
            <ChevronRight size={16} className="text-gray-400" />
            <span className="text-gray-900 font-medium">Tabel 1A1</span>
          </nav>
        </ButtonSection>

        {/* ========== PROGRESS BARS ========== */}
        <div className="mb-12" id="progress">
          <div className="mb-6">
            <h2 className="text-3xl font-bold text-gray-900 mb-2">Progress Bars</h2>
            <p className="text-gray-600">Komponen progress bar untuk menunjukkan progress</p>
          </div>
        </div>

        <ButtonSection
          title="67. Progress Bar Standard"
          description="Progress bar dengan berbagai nilai"
        >
          <div className="w-full space-y-4">
            <div>
              <div className="flex justify-between text-sm text-gray-700 mb-1">
                <span>Progress 25%</span>
                <span>25%</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div className="bg-[#0384d6] h-2 rounded-full" style={{ width: "25%" }}></div>
              </div>
            </div>
            <div>
              <div className="flex justify-between text-sm text-gray-700 mb-1">
                <span>Progress 50%</span>
                <span>50%</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div className="bg-[#0384d6] h-2 rounded-full" style={{ width: "50%" }}></div>
              </div>
            </div>
            <div>
              <div className="flex justify-between text-sm text-gray-700 mb-1">
                <span>Progress 75%</span>
                <span>75%</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div className="bg-[#0384d6] h-2 rounded-full" style={{ width: "75%" }}></div>
              </div>
            </div>
            <div>
              <div className="flex justify-between text-sm text-gray-700 mb-1">
                <span>Progress 100%</span>
                <span>100%</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div className="bg-green-500 h-2 rounded-full" style={{ width: "100%" }}></div>
              </div>
            </div>
          </div>
        </ButtonSection>

        <ButtonSection
          title="68. Progress Bar dengan Variasi Warna"
          description="Progress bar dengan warna berbeda untuk status"
        >
          <div className="w-full space-y-4">
            <div>
              <div className="text-sm text-gray-700 mb-1">Success</div>
              <div className="w-full bg-gray-200 rounded-full h-3">
                <div className="bg-green-500 h-3 rounded-full" style={{ width: "80%" }}></div>
              </div>
            </div>
            <div>
              <div className="text-sm text-gray-700 mb-1">Warning</div>
              <div className="w-full bg-gray-200 rounded-full h-3">
                <div className="bg-yellow-500 h-3 rounded-full" style={{ width: "60%" }}></div>
              </div>
            </div>
            <div>
              <div className="text-sm text-gray-700 mb-1">Error</div>
              <div className="w-full bg-gray-200 rounded-full h-3">
                <div className="bg-red-500 h-3 rounded-full" style={{ width: "30%" }}></div>
              </div>
            </div>
          </div>
        </ButtonSection>

        {/* ========== SLIDERS ========== */}
        <div className="mb-12" id="sliders">
          <div className="mb-6">
            <h2 className="text-3xl font-bold text-gray-900 mb-2">Sliders</h2>
            <p className="text-gray-600">Komponen slider untuk input nilai range</p>
          </div>
        </div>

        <ButtonSection
          title="69. Slider Standard"
          description="Slider untuk memilih nilai"
        >
          <div className="w-full space-y-6">
            <div>
              <div className="flex justify-between text-sm text-gray-700 mb-2">
                <span>Value: {sliderValue}</span>
                <span>0 - 100</span>
              </div>
              <input
                type="range"
                min="0"
                max="100"
                value={sliderValue}
                onChange={(e) => setSliderValue(e.target.value)}
                className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-[#0384d6]"
              />
            </div>
          </div>
        </ButtonSection>

        {/* ========== ACCORDION ========== */}
        <div className="mb-12" id="accordion">
          <div className="mb-6">
            <h2 className="text-3xl font-bold text-gray-900 mb-2">Accordion</h2>
            <p className="text-gray-600">Komponen accordion untuk konten yang bisa di-expand/collapse</p>
          </div>
        </div>

        <ButtonSection
          title="70. Accordion Standard"
          description="Accordion dengan expand/collapse"
        >
          <div className="w-full space-y-2">
            {[
              { title: "Section 1", content: "Konten untuk section 1" },
              { title: "Section 2", content: "Konten untuk section 2" },
              { title: "Section 3", content: "Konten untuk section 3" },
            ].map((item, index) => (
              <div key={index} className="border border-gray-200 rounded-lg overflow-hidden">
                <button
                  onClick={() => setAccordionOpen(accordionOpen === index ? null : index)}
                  className="w-full flex items-center justify-between p-4 text-left hover:bg-gray-50 transition-colors"
                >
                  <span className="font-medium text-gray-900">{item.title}</span>
                  <ChevronDown
                    size={20}
                    className={`text-gray-500 transition-transform ${
                      accordionOpen === index ? "transform rotate-180" : ""
                    }`}
                  />
                </button>
                {accordionOpen === index && (
                  <div className="p-4 bg-gray-50 border-t border-gray-200">
                    <p className="text-sm text-gray-600">{item.content}</p>
                  </div>
                )}
              </div>
            ))}
          </div>
        </ButtonSection>

        {/* ========== DROPDOWNS ========== */}
        <div className="mb-12" id="dropdowns">
          <div className="mb-6">
            <h2 className="text-3xl font-bold text-gray-900 mb-2">Dropdowns</h2>
            <p className="text-gray-600">Komponen dropdown menu untuk aksi dan pilihan</p>
          </div>
        </div>

        <ButtonSection
          title="71. Dropdown Menu"
          description="Dropdown dengan menu items"
        >
          <div className="relative" ref={dropdownRef}>
            <button
              onClick={() => setDropdownOpen(!dropdownOpen)}
              className="flex items-center gap-2 px-4 py-2 bg-white text-gray-700 border border-gray-300 rounded-lg font-medium hover:bg-gray-50 transition-colors"
            >
              <span>Actions</span>
              <ChevronDown size={16} className={`transition-transform ${dropdownOpen ? "rotate-180" : ""}`} />
            </button>
            {dropdownOpen && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="absolute top-full left-0 mt-2 w-48 bg-white border border-gray-200 rounded-lg shadow-lg z-10"
              >
                <button className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 rounded-t-lg flex items-center gap-2">
                  <Edit size={16} />
                  Edit
                </button>
                <button className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-2">
                  <Copy size={16} />
                  Duplicate
                </button>
                <button className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 rounded-b-lg flex items-center gap-2">
                  <Trash2 size={16} />
                  Delete
                </button>
              </motion.div>
            )}
          </div>
        </ButtonSection>

        {/* ========== AVATARS ========== */}
        <div className="mb-12" id="avatars">
          <div className="mb-6">
            <h2 className="text-3xl font-bold text-gray-900 mb-2">Avatars</h2>
            <p className="text-gray-600">Komponen avatar untuk menampilkan user</p>
          </div>
        </div>

        <ButtonSection
          title="72. Avatar Variants"
          description="Avatar dengan berbagai ukuran dan style"
        >
          <div className="flex flex-wrap items-center gap-6">
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[#0384d6] to-[#043975] flex items-center justify-center text-white font-bold text-xs">
              JD
            </div>
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#0384d6] to-[#043975] flex items-center justify-center text-white font-bold text-sm">
              JD
            </div>
            <div className="w-12 h-12 rounded-full bg-gradient-to-br from-[#0384d6] to-[#043975] flex items-center justify-center text-white font-bold">
              JD
            </div>
            <div className="w-16 h-16 rounded-full bg-gradient-to-br from-[#0384d6] to-[#043975] flex items-center justify-center text-white font-bold text-lg">
              JD
            </div>
            <div className="w-20 h-20 rounded-full bg-gradient-to-br from-[#0384d6] to-[#043975] flex items-center justify-center text-white font-bold text-xl">
              JD
            </div>
            <div className="relative">
              <div className="w-12 h-12 rounded-full bg-gradient-to-br from-green-500 to-green-600 flex items-center justify-center text-white font-bold">
                <User size={20} />
              </div>
              <span className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-500 border-2 border-white rounded-full"></span>
            </div>
          </div>
        </ButtonSection>

        {/* ========== ICONS ========== */}
        <div className="mb-12" id="icons">
          <div className="mb-6">
            <h2 className="text-3xl font-bold text-gray-900 mb-2">Icons</h2>
            <p className="text-gray-600">Koleksi icon yang digunakan dalam aplikasi</p>
          </div>
        </div>

        <ButtonSection
          title="73. Icon Collection"
          description="Berbagai icon dengan ukuran dan warna berbeda"
        >
          <div className="grid grid-cols-4 md:grid-cols-8 gap-6">
            {[
              { Icon: Home, name: "Home" },
              { Icon: User, name: "User" },
              { Icon: Settings, name: "Settings" },
              { Icon: Search, name: "Search" },
              { Icon: Bell, name: "Bell" },
              { Icon: Mail, name: "Mail" },
              { Icon: Edit, name: "Edit" },
              { Icon: Trash2, name: "Trash" },
              { Icon: Download, name: "Download" },
              { Icon: Upload, name: "Upload" },
              { Icon: Save, name: "Save" },
              { Icon: RefreshCw, name: "Refresh" },
              { Icon: Filter, name: "Filter" },
              { Icon: Eye, name: "Eye" },
              { Icon: EyeOff, name: "EyeOff" },
              { Icon: Calendar, name: "Calendar" },
            ].map(({ Icon, name }, index) => (
              <div key={index} className="flex flex-col items-center gap-2">
                <div className="p-3 bg-gray-100 rounded-lg">
                  <Icon size={24} className="text-gray-700" />
                </div>
                <span className="text-xs text-gray-600 text-center">{name}</span>
              </div>
            ))}
          </div>
        </ButtonSection>

        {/* ========== EMPTY STATES ========== */}
        <div className="mb-12" id="empty">
          <div className="mb-6">
            <h2 className="text-3xl font-bold text-gray-900 mb-2">Empty States</h2>
            <p className="text-gray-600">Komponen untuk menampilkan state kosong</p>
          </div>
        </div>

        <ButtonSection
          title="74. Empty State Standard"
          description="Empty state dengan icon dan pesan"
        >
          <div className="w-full bg-white border border-gray-200 rounded-xl p-12 text-center">
            <div className="w-16 h-16 mx-auto mb-4 bg-gray-100 rounded-full flex items-center justify-center">
              <FileText size={32} className="text-gray-400" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Tidak ada data</h3>
            <p className="text-sm text-gray-600 mb-4">Silakan tambah data baru atau muat ulang halaman</p>
            <button className="px-4 py-2 bg-[#0384d6] text-white rounded-lg font-medium hover:bg-[#0273b8] transition-colors">
              Tambah Data
            </button>
          </div>
        </ButtonSection>

        {/* ========== DIVIDERS ========== */}
        <div className="mb-12" id="dividers">
          <div className="mb-6">
            <h2 className="text-3xl font-bold text-gray-900 mb-2">Dividers</h2>
            <p className="text-gray-600">Komponen divider untuk memisahkan konten</p>
          </div>
        </div>

        <ButtonSection
          title="75. Divider Variants"
          description="Divider dengan berbagai style"
        >
          <div className="w-full space-y-6">
            <div>
              <p className="text-sm text-gray-600 mb-2">Divider Horizontal</p>
              <div className="border-t border-gray-200"></div>
            </div>
            <div>
              <p className="text-sm text-gray-600 mb-2">Divider dengan Text</p>
              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-gray-200"></div>
                </div>
                <div className="relative flex justify-center text-sm">
                  <span className="px-2 bg-white text-gray-500">atau</span>
                </div>
              </div>
            </div>
            <div>
              <p className="text-sm text-gray-600 mb-2">Divider Vertical</p>
              <div className="flex items-center gap-4">
                <span>Item 1</span>
                <div className="h-6 w-px bg-gray-200"></div>
                <span>Item 2</span>
                <div className="h-6 w-px bg-gray-200"></div>
                <span>Item 3</span>
              </div>
            </div>
          </div>
        </ButtonSection>

        {/* ========== SPACING ========== */}
        <div className="mb-12" id="spacing">
          <div className="mb-6">
            <h2 className="text-3xl font-bold text-gray-900 mb-2">Spacing System</h2>
            <p className="text-gray-600">Sistem spacing yang digunakan dalam design system</p>
          </div>
        </div>

        <ButtonSection
          title="76. Spacing Scale"
          description="Skala spacing dari 0.5 hingga 8"
        >
          <div className="w-full space-y-4">
            {[0.5, 1, 2, 3, 4, 5, 6, 8].map((size) => (
              <div key={size} className="flex items-center gap-4">
                <div className="w-20 text-sm font-medium text-gray-700">{size * 4}px</div>
                <div className="flex-1">
                  <div className="bg-[#0384d6] h-4" style={{ width: `${size * 4}px` }}></div>
                </div>
                <div className="text-xs text-gray-500">p-{size}</div>
              </div>
            ))}
          </div>
        </ButtonSection>

        {/* ========== SHADOWS ========== */}
        <div className="mb-12" id="shadows">
          <div className="mb-6">
            <h2 className="text-3xl font-bold text-gray-900 mb-2">Shadows</h2>
            <p className="text-gray-600">Sistem shadow untuk depth dan elevation</p>
          </div>
        </div>

        <ButtonSection
          title="77. Shadow Variants"
          description="Berbagai variasi shadow untuk depth effect"
        >
          <div className="w-full grid grid-cols-2 md:grid-cols-4 gap-6">
            {[
              { name: "None", class: "shadow-none" },
              { name: "Small", class: "shadow-sm" },
              { name: "Medium", class: "shadow-md" },
              { name: "Large", class: "shadow-lg" },
              { name: "XL", class: "shadow-xl" },
              { name: "2XL", class: "shadow-2xl" },
            ].map((shadow, index) => (
              <div key={index} className="text-center">
                <div className={`w-20 h-20 mx-auto bg-white rounded-lg border border-gray-200 ${shadow.class} mb-2`}></div>
                <p className="text-xs text-gray-600">{shadow.name}</p>
              </div>
            ))}
          </div>
        </ButtonSection>

        {/* ========== DATE PICKER ========== */}
        <div className="mb-12" id="datepicker">
          <div className="mb-6">
            <h2 className="text-3xl font-bold text-gray-900 mb-2">Date Picker</h2>
            <p className="text-gray-600">Komponen untuk memilih tanggal</p>
          </div>
        </div>

        <ButtonSection
          title="78. Date Picker Standard"
          description="Date picker dengan berbagai format"
        >
          <div className="w-full space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Date Input</label>
              <input
                type="date"
                value={dateValue}
                onChange={(e) => setDateValue(e.target.value)}
                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg text-gray-700 focus:outline-none focus:ring-2 focus:ring-[#0384d6] focus:border-[#0384d6] transition"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Date dengan Icon</label>
              <div className="relative">
                <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 pointer-events-none" size={18} />
                <input
                  type="date"
                  className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg text-gray-700 focus:outline-none focus:ring-2 focus:ring-[#0384d6] focus:border-[#0384d6] transition"
                />
              </div>
            </div>
          </div>
        </ButtonSection>

        {/* ========== TIME PICKER ========== */}
        <div className="mb-12" id="timepicker">
          <div className="mb-6">
            <h2 className="text-3xl font-bold text-gray-900 mb-2">Time Picker</h2>
            <p className="text-gray-600">Komponen untuk memilih waktu</p>
          </div>
        </div>

        <ButtonSection
          title="79. Time Picker Standard"
          description="Time picker untuk input waktu"
        >
          <div className="w-full space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Time Input</label>
              <input
                type="time"
                value={timeValue}
                onChange={(e) => setTimeValue(e.target.value)}
                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg text-gray-700 focus:outline-none focus:ring-2 focus:ring-[#0384d6] focus:border-[#0384d6] transition"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Time dengan Icon</label>
              <div className="relative">
                <Clock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 pointer-events-none" size={18} />
                <input
                  type="time"
                  className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg text-gray-700 focus:outline-none focus:ring-2 focus:ring-[#0384d6] focus:border-[#0384d6] transition"
                />
              </div>
            </div>
          </div>
        </ButtonSection>

        {/* ========== FILE UPLOAD ========== */}
        <div className="mb-12" id="fileupload">
          <div className="mb-6">
            <h2 className="text-3xl font-bold text-gray-900 mb-2">File Upload</h2>
            <p className="text-gray-600">Komponen untuk upload file</p>
          </div>
        </div>

        <ButtonSection
          title="80. File Upload Standard"
          description="File upload dengan drag & drop dan preview"
        >
          <div className="w-full space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">File Input</label>
              <input
                type="file"
                onChange={(e) => setSelectedFile(e.target.files[0])}
                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg text-gray-700 focus:outline-none focus:ring-2 focus:ring-[#0384d6] focus:border-[#0384d6] transition"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Drag & Drop Upload</label>
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center hover:border-[#0384d6] transition-colors cursor-pointer">
                <UploadIcon className="mx-auto mb-3 text-gray-400" size={32} />
                <p className="text-sm text-gray-600 mb-1">Drag and drop file di sini, atau klik untuk memilih</p>
                <p className="text-xs text-gray-500">PDF, DOC, DOCX, JPG, PNG (Max 10MB)</p>
              </div>
            </div>
            {selectedFile && (
              <div className="p-3 bg-gray-50 rounded-lg flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <FileText className="text-blue-600" size={20} />
                  <div>
                    <p className="text-sm font-medium text-gray-700">{selectedFile.name}</p>
                    <p className="text-xs text-gray-500">{(selectedFile.size / 1024).toFixed(2)} KB</p>
                  </div>
                </div>
                <button onClick={() => setSelectedFile(null)} className="text-red-600 hover:text-red-700">
                  <X size={18} />
                </button>
              </div>
            )}
          </div>
        </ButtonSection>

        {/* ========== SEARCH BARS ========== */}
        <div className="mb-12" id="search">
          <div className="mb-6">
            <h2 className="text-3xl font-bold text-gray-900 mb-2">Search Bars</h2>
            <p className="text-gray-600">Komponen search bar dengan berbagai variasi</p>
          </div>
        </div>

        <ButtonSection
          title="81. Search Bar Variants"
          description="Search bar dengan berbagai style"
        >
          <div className="w-full space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Search Standard</label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Cari..."
                  className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg text-gray-700 focus:outline-none focus:ring-2 focus:ring-[#0384d6] focus:border-[#0384d6] transition"
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Search dengan Button</label>
              <div className="flex gap-2">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
                  <input
                    type="text"
                    placeholder="Cari..."
                    className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg text-gray-700 focus:outline-none focus:ring-2 focus:ring-[#0384d6] focus:border-[#0384d6] transition"
                  />
                </div>
                <button className="px-6 py-2.5 bg-[#0384d6] text-white rounded-lg font-medium hover:bg-[#0273b8] transition-colors">
                  Cari
                </button>
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Search Rounded Full</label>
              <div className="relative">
                <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
                <input
                  type="text"
                  placeholder="Cari..."
                  className="w-full pl-12 pr-4 py-2.5 border border-gray-300 rounded-full text-gray-700 focus:outline-none focus:ring-2 focus:ring-[#0384d6] focus:border-[#0384d6] transition"
                />
              </div>
            </div>
          </div>
        </ButtonSection>

        {/* ========== NAVIGATION ========== */}
        <div className="mb-12" id="navigation">
          <div className="mb-6">
            <h2 className="text-3xl font-bold text-gray-900 mb-2">Navigation</h2>
            <p className="text-gray-600">Komponen navigasi menu</p>
          </div>
        </div>

        <ButtonSection
          title="82. Navigation Menu"
          description="Navigation menu horizontal dan vertical"
        >
          <div className="w-full space-y-6">
            <div>
              <p className="text-sm text-gray-600 mb-2">Horizontal Navigation</p>
              <nav className="flex items-center gap-1 bg-white border border-gray-200 rounded-lg p-1">
                <a href="#" className="px-4 py-2 text-sm font-medium text-[#0384d6] bg-blue-50 rounded-md">Home</a>
                <a href="#" className="px-4 py-2 text-sm font-medium text-gray-700 hover:text-gray-900 hover:bg-gray-50 rounded-md">About</a>
                <a href="#" className="px-4 py-2 text-sm font-medium text-gray-700 hover:text-gray-900 hover:bg-gray-50 rounded-md">Services</a>
                <a href="#" className="px-4 py-2 text-sm font-medium text-gray-700 hover:text-gray-900 hover:bg-gray-50 rounded-md">Contact</a>
              </nav>
            </div>
            <div>
              <p className="text-sm text-gray-600 mb-2">Vertical Navigation</p>
              <nav className="flex flex-col gap-1 bg-white border border-gray-200 rounded-lg p-2 w-48">
                <a href="#" className="px-4 py-2 text-sm font-medium text-[#0384d6] bg-blue-50 rounded-md">Dashboard</a>
                <a href="#" className="px-4 py-2 text-sm font-medium text-gray-700 hover:text-gray-900 hover:bg-gray-50 rounded-md">Profile</a>
                <a href="#" className="px-4 py-2 text-sm font-medium text-gray-700 hover:text-gray-900 hover:bg-gray-50 rounded-md">Settings</a>
                <a href="#" className="px-4 py-2 text-sm font-medium text-gray-700 hover:text-gray-900 hover:bg-gray-50 rounded-md">Logout</a>
              </nav>
            </div>
          </div>
        </ButtonSection>

        {/* ========== SIDEBAR ========== */}
        <div className="mb-12" id="sidebar">
          <div className="mb-6">
            <h2 className="text-3xl font-bold text-gray-900 mb-2">Sidebar</h2>
            <p className="text-gray-600">Komponen sidebar navigation dengan berbagai variasi</p>
          </div>
        </div>

        <ButtonSection
          title="83. Sidebar Standard"
          description="Sidebar dengan menu items dan grouping"
        >
          <div className="w-full">
            <div className="bg-white border border-gray-200 rounded-lg p-4 w-64">
              <div className="mb-4">
                <h3 className="text-sm font-semibold text-gray-900 uppercase tracking-wide mb-2">Main Menu</h3>
                <nav className="space-y-1">
                  <a href="#" className="flex items-center gap-3 px-3 py-2 text-sm font-medium text-[#0384d6] bg-blue-50 rounded-lg">
                    <Home size={18} />
                    Dashboard
                  </a>
                  <a href="#" className="flex items-center gap-3 px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 rounded-lg">
                    <User size={18} />
                    Profile
                  </a>
                  <a href="#" className="flex items-center gap-3 px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 rounded-lg">
                    <Settings size={18} />
                    Settings
                  </a>
                </nav>
              </div>
              <div className="border-t border-gray-200 pt-4">
                <h3 className="text-sm font-semibold text-gray-900 uppercase tracking-wide mb-2">Other</h3>
                <nav className="space-y-1">
                  <a href="#" className="flex items-center gap-3 px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 rounded-lg">
                    <HelpCircle size={18} />
                    Help
                  </a>
                  <a href="#" className="flex items-center gap-3 px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 rounded-lg">
                    <LogOut size={18} />
                    Logout
                  </a>
                </nav>
              </div>
            </div>
          </div>
        </ButtonSection>

        <ButtonSection
          title="84. Sidebar dengan Logo"
          description="Sidebar dengan logo di bagian atas"
        >
          <div className="w-full">
            <div className="bg-white border border-gray-200 rounded-lg w-64 overflow-hidden">
              <div className="p-4 border-b border-gray-200 bg-gradient-to-r from-[#043975] to-[#0384d6]">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-white rounded-lg flex items-center justify-center">
                    <span className="text-[#0384d6] font-bold text-lg">PM</span>
                  </div>
                  <div>
                    <h3 className="text-white font-bold text-lg">Portal Mutu</h3>
                    <p className="text-blue-100 text-xs">Management System</p>
                  </div>
                </div>
              </div>
              <nav className="p-4 space-y-1">
                <a href="#" className="flex items-center gap-3 px-3 py-2 text-sm font-medium text-[#0384d6] bg-blue-50 rounded-lg">
                  <Home size={18} />
                  Dashboard
                </a>
                <a href="#" className="flex items-center gap-3 px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 rounded-lg">
                  <FileText size={18} />
                  Tables
                </a>
                <a href="#" className="flex items-center gap-3 px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 rounded-lg">
                  <BarChart size={18} />
                  Reports
                </a>
                <a href="#" className="flex items-center gap-3 px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 rounded-lg">
                  <Settings size={18} />
                  Settings
                </a>
              </nav>
            </div>
          </div>
        </ButtonSection>

        <ButtonSection
          title="85. Sidebar dengan Search"
          description="Sidebar dengan search bar di bagian atas"
        >
          <div className="w-full">
            <div className="bg-white border border-gray-200 rounded-lg w-64 overflow-hidden">
              <div className="p-4 border-b border-gray-200">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={16} />
                  <input
                    type="text"
                    placeholder="Search menu..."
                    className="w-full pl-9 pr-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0384d6] focus:border-[#0384d6]"
                  />
                </div>
              </div>
              <nav className="p-4 space-y-1 max-h-96 overflow-y-auto">
                <a href="#" className="flex items-center gap-3 px-3 py-2 text-sm font-medium text-[#0384d6] bg-blue-50 rounded-lg">
                  <Home size={18} />
                  Dashboard
                </a>
                <a href="#" className="flex items-center gap-3 px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 rounded-lg">
                  <User size={18} />
                  Users
                </a>
                <a href="#" className="flex items-center gap-3 px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 rounded-lg">
                  <FileText size={18} />
                  Documents
                </a>
                <a href="#" className="flex items-center gap-3 px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 rounded-lg">
                  <Settings size={18} />
                  Settings
                </a>
              </nav>
            </div>
          </div>
        </ButtonSection>

        <ButtonSection
          title="86. Sidebar dengan Badge/Notification"
          description="Sidebar dengan badge untuk notifikasi atau counter"
        >
          <div className="w-full">
            <div className="bg-white border border-gray-200 rounded-lg w-64 overflow-hidden">
              <nav className="p-4 space-y-1">
                <a href="#" className="flex items-center justify-between px-3 py-2 text-sm font-medium text-[#0384d6] bg-blue-50 rounded-lg">
                  <div className="flex items-center gap-3">
                    <Home size={18} />
                    Dashboard
                  </div>
                </a>
                <a href="#" className="flex items-center justify-between px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 rounded-lg">
                  <div className="flex items-center gap-3">
                    <Bell size={18} />
                    Notifications
                  </div>
                  <span className="px-2 py-0.5 bg-red-500 text-white text-xs font-bold rounded-full">3</span>
                </a>
                <a href="#" className="flex items-center justify-between px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 rounded-lg">
                  <div className="flex items-center gap-3">
                    <Mail size={18} />
                    Messages
                  </div>
                  <span className="px-2 py-0.5 bg-blue-500 text-white text-xs font-bold rounded-full">12</span>
                </a>
                <a href="#" className="flex items-center justify-between px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 rounded-lg">
                  <div className="flex items-center gap-3">
                    <FileText size={18} />
                    Tasks
                  </div>
                  <span className="px-2 py-0.5 bg-green-500 text-white text-xs font-bold rounded-full">5</span>
                </a>
              </nav>
            </div>
          </div>
        </ButtonSection>

        <ButtonSection
          title="87. Sidebar dengan User Profile"
          description="Sidebar dengan user profile di bagian bawah"
        >
          <div className="w-full">
            <div className="bg-white border border-gray-200 rounded-lg w-64 overflow-hidden flex flex-col h-96">
              <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
                <a href="#" className="flex items-center gap-3 px-3 py-2 text-sm font-medium text-[#0384d6] bg-blue-50 rounded-lg">
                  <Home size={18} />
                  Dashboard
                </a>
                <a href="#" className="flex items-center gap-3 px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 rounded-lg">
                  <User size={18} />
                  Profile
                </a>
                <a href="#" className="flex items-center gap-3 px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 rounded-lg">
                  <Settings size={18} />
                  Settings
                </a>
              </nav>
              <div className="border-t border-gray-200 p-4 bg-gray-50">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#0384d6] to-[#043975] flex items-center justify-center text-white font-bold">
                    JD
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900 truncate">John Doe</p>
                    <p className="text-xs text-gray-500 truncate">john@example.com</p>
                  </div>
                  <button className="p-1 text-gray-500 hover:text-gray-700">
                    <LogOut size={18} />
                  </button>
                </div>
              </div>
            </div>
          </div>
        </ButtonSection>

        <ButtonSection
          title="88. Sidebar dengan Submenu"
          description="Sidebar dengan menu yang bisa di-expand untuk submenu"
        >
          <div className="w-full">
            <div className="bg-white border border-gray-200 rounded-lg w-64 overflow-hidden">
              <nav className="p-4 space-y-1">
                <a href="#" className="flex items-center gap-3 px-3 py-2 text-sm font-medium text-[#0384d6] bg-blue-50 rounded-lg">
                  <Home size={18} />
                  Dashboard
                </a>
                <div>
                  <button className="w-full flex items-center justify-between px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 rounded-lg">
                    <div className="flex items-center gap-3">
                      <FileText size={18} />
                      Tables
                    </div>
                    <ChevronDown size={16} className="text-gray-400" />
                  </button>
                  <div className="ml-6 mt-1 space-y-1">
                    <a href="#" className="block px-3 py-1.5 text-xs text-gray-600 hover:bg-gray-50 rounded">Tabel 1A1</a>
                    <a href="#" className="block px-3 py-1.5 text-xs text-gray-600 hover:bg-gray-50 rounded">Tabel 1A2</a>
                    <a href="#" className="block px-3 py-1.5 text-xs text-gray-600 hover:bg-gray-50 rounded">Tabel 1A3</a>
                  </div>
                </div>
                <a href="#" className="flex items-center gap-3 px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 rounded-lg">
                  <Settings size={18} />
                  Settings
                </a>
              </nav>
            </div>
          </div>
        </ButtonSection>

        <ButtonSection
          title="89. Sidebar Icons Only"
          description="Sidebar compact dengan icon saja"
        >
          <div className="w-full">
            <div className="bg-white border border-gray-200 rounded-lg w-16 overflow-hidden">
              <nav className="p-2 space-y-2">
                <a href="#" className="flex items-center justify-center p-3 text-[#0384d6] bg-blue-50 rounded-lg" title="Dashboard">
                  <Home size={20} />
                </a>
                <a href="#" className="flex items-center justify-center p-3 text-gray-700 hover:bg-gray-50 rounded-lg" title="Profile">
                  <User size={20} />
                </a>
                <a href="#" className="flex items-center justify-center p-3 text-gray-700 hover:bg-gray-50 rounded-lg relative" title="Notifications">
                  <Bell size={20} />
                  <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
                </a>
                <a href="#" className="flex items-center justify-center p-3 text-gray-700 hover:bg-gray-50 rounded-lg" title="Settings">
                  <Settings size={20} />
                </a>
              </nav>
            </div>
          </div>
        </ButtonSection>

        <ButtonSection
          title="90. Sidebar dengan Active Indicator"
          description="Sidebar dengan indikator aktif yang lebih jelas"
        >
          <div className="w-full">
            <div className="bg-white border border-gray-200 rounded-lg w-64 overflow-hidden">
              <nav className="p-4 space-y-1">
                <a href="#" className="relative flex items-center gap-3 px-3 py-2 text-sm font-medium text-[#0384d6] bg-blue-50 rounded-lg">
                  <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-8 bg-[#0384d6] rounded-r-full"></div>
                  <Home size={18} />
                  Dashboard
                </a>
                <a href="#" className="flex items-center gap-3 px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 rounded-lg">
                  <User size={18} />
                  Profile
                </a>
                <a href="#" className="flex items-center gap-3 px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 rounded-lg">
                  <FileText size={18} />
                  Tables
                </a>
                <a href="#" className="flex items-center gap-3 px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 rounded-lg">
                  <Settings size={18} />
                  Settings
                </a>
              </nav>
            </div>
          </div>
        </ButtonSection>

        <ButtonSection
          title="91. Sidebar dengan Divider"
          description="Sidebar dengan divider untuk memisahkan section"
        >
          <div className="w-full">
            <div className="bg-white border border-gray-200 rounded-lg w-64 overflow-hidden">
              <nav className="p-4 space-y-4">
                <div>
                  <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2 px-3">Main</h3>
                  <div className="space-y-1">
                    <a href="#" className="flex items-center gap-3 px-3 py-2 text-sm font-medium text-[#0384d6] bg-blue-50 rounded-lg">
                      <Home size={18} />
                      Dashboard
                    </a>
                    <a href="#" className="flex items-center gap-3 px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 rounded-lg">
                      <FileText size={18} />
                      Tables
                    </a>
                  </div>
                </div>
                <div className="border-t border-gray-200"></div>
                <div>
                  <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2 px-3">Settings</h3>
                  <div className="space-y-1">
                    <a href="#" className="flex items-center gap-3 px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 rounded-lg">
                      <Settings size={18} />
                      Preferences
                    </a>
                    <a href="#" className="flex items-center gap-3 px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 rounded-lg">
                      <User size={18} />
                      Account
                    </a>
                  </div>
                </div>
              </nav>
            </div>
          </div>
        </ButtonSection>

        <ButtonSection
          title="92. Sidebar dengan Tooltip (Icons Only)"
          description="Sidebar compact dengan tooltip saat hover"
        >
          <div className="w-full">
            <div className="bg-white border border-gray-200 rounded-lg w-16 overflow-hidden">
              <nav className="p-2 space-y-2">
                <div className="relative group">
                  <a href="#" className="flex items-center justify-center p-3 text-[#0384d6] bg-blue-50 rounded-lg">
                    <Home size={20} />
                  </a>
                  <div className="absolute left-full ml-2 top-1/2 -translate-y-1/2 px-2 py-1 bg-gray-900 text-white text-xs rounded whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-50">
                    Dashboard
                    <div className="absolute right-full top-1/2 -translate-y-1/2 border-4 border-transparent border-r-gray-900"></div>
                  </div>
                </div>
                <div className="relative group">
                  <a href="#" className="flex items-center justify-center p-3 text-gray-700 hover:bg-gray-50 rounded-lg">
                    <User size={20} />
                  </a>
                  <div className="absolute left-full ml-2 top-1/2 -translate-y-1/2 px-2 py-1 bg-gray-900 text-white text-xs rounded whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-50">
                    Profile
                    <div className="absolute right-full top-1/2 -translate-y-1/2 border-4 border-transparent border-r-gray-900"></div>
                  </div>
                </div>
                <div className="relative group">
                  <a href="#" className="flex items-center justify-center p-3 text-gray-700 hover:bg-gray-50 rounded-lg">
                    <Settings size={20} />
                  </a>
                  <div className="absolute left-full ml-2 top-1/2 -translate-y-1/2 px-2 py-1 bg-gray-900 text-white text-xs rounded whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-50">
                    Settings
                    <div className="absolute right-full top-1/2 -translate-y-1/2 border-4 border-transparent border-r-gray-900"></div>
                  </div>
                </div>
              </nav>
            </div>
          </div>
        </ButtonSection>

        <ButtonSection
          title="93. Sidebar dengan Collapse Button"
          description="Sidebar yang bisa di-collapse/expand"
        >
          <div className="w-full">
            <div className="bg-white border border-gray-200 rounded-lg w-64 overflow-hidden">
              <div className="p-4 border-b border-gray-200 flex items-center justify-between">
                <h3 className="font-semibold text-gray-900">Menu</h3>
                <button className="p-1 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded">
                  <ChevronLeft size={18} />
                </button>
              </div>
              <nav className="p-4 space-y-1">
                <a href="#" className="flex items-center gap-3 px-3 py-2 text-sm font-medium text-[#0384d6] bg-blue-50 rounded-lg">
                  <Home size={18} />
                  Dashboard
                </a>
                <a href="#" className="flex items-center gap-3 px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 rounded-lg">
                  <User size={18} />
                  Profile
                </a>
                <a href="#" className="flex items-center gap-3 px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 rounded-lg">
                  <Settings size={18} />
                  Settings
                </a>
              </nav>
            </div>
          </div>
        </ButtonSection>

        <ButtonSection
          title="94. Sidebar dengan Gradient Background"
          description="Sidebar dengan background gradient"
        >
          <div className="w-full">
            <div className="bg-gradient-to-b from-[#043975] to-[#0384d6] border border-gray-200 rounded-lg w-64 overflow-hidden">
              <div className="p-4 border-b border-white/20">
                <h3 className="text-white font-semibold text-lg">Portal Mutu</h3>
              </div>
              <nav className="p-4 space-y-1">
                <a href="#" className="flex items-center gap-3 px-3 py-2 text-sm font-medium text-white bg-white/20 rounded-lg">
                  <Home size={18} />
                  Dashboard
                </a>
                <a href="#" className="flex items-center gap-3 px-3 py-2 text-sm font-medium text-white/80 hover:bg-white/10 rounded-lg">
                  <User size={18} />
                  Profile
                </a>
                <a href="#" className="flex items-center gap-3 px-3 py-2 text-sm font-medium text-white/80 hover:bg-white/10 rounded-lg">
                  <FileText size={18} />
                  Tables
                </a>
                <a href="#" className="flex items-center gap-3 px-3 py-2 text-sm font-medium text-white/80 hover:bg-white/10 rounded-lg">
                  <Settings size={18} />
                  Settings
                </a>
              </nav>
            </div>
          </div>
        </ButtonSection>

        <ButtonSection
          title="95. Sidebar dengan Section Header"
          description="Sidebar dengan section header yang lebih menonjol"
        >
          <div className="w-full">
            <div className="bg-white border border-gray-200 rounded-lg w-64 overflow-hidden">
              <nav className="p-4 space-y-6">
                <div>
                  <div className="px-3 py-2 mb-2 bg-gray-100 rounded-lg">
                    <h3 className="text-xs font-bold text-gray-900 uppercase">Navigation</h3>
                  </div>
                  <div className="space-y-1">
                    <a href="#" className="flex items-center gap-3 px-3 py-2 text-sm font-medium text-[#0384d6] bg-blue-50 rounded-lg">
                      <Home size={18} />
                      Dashboard
                    </a>
                    <a href="#" className="flex items-center gap-3 px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 rounded-lg">
                      <FileText size={18} />
                      Tables
                    </a>
                  </div>
                </div>
                <div>
                  <div className="px-3 py-2 mb-2 bg-gray-100 rounded-lg">
                    <h3 className="text-xs font-bold text-gray-900 uppercase">Account</h3>
                  </div>
                  <div className="space-y-1">
                    <a href="#" className="flex items-center gap-3 px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 rounded-lg">
                      <User size={18} />
                      Profile
                    </a>
                    <a href="#" className="flex items-center gap-3 px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 rounded-lg">
                      <Settings size={18} />
                      Settings
                    </a>
                  </div>
                </div>
              </nav>
            </div>
          </div>
        </ButtonSection>

        {/* ========== POPOVER ========== */}
        <div className="mb-12" id="popover">
          <div className="mb-6">
            <h2 className="text-3xl font-bold text-gray-900 mb-2">Popover</h2>
            <p className="text-gray-600">Komponen popover untuk konten tambahan</p>
          </div>
        </div>

        <ButtonSection
          title="96. Popover Variants"
          description="Popover dengan berbagai posisi"
        >
          <div className="flex flex-wrap gap-6 items-center">
            <div className="relative group">
              <button className="px-4 py-2 bg-[#0384d6] text-white rounded-lg font-medium">
                Click Me (Top)
              </button>
              <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 w-64 p-4 bg-white border border-gray-200 rounded-lg shadow-lg opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-10">
                <h4 className="font-semibold text-gray-900 mb-1">Popover Title</h4>
                <p className="text-sm text-gray-600">Ini adalah konten popover yang muncul saat hover atau click</p>
                <div className="absolute top-full left-1/2 transform -translate-x-1/2 -mt-1 border-4 border-transparent border-t-white"></div>
              </div>
            </div>
            <div className="relative group">
              <button className="px-4 py-2 bg-[#0384d6] text-white rounded-lg font-medium">
                Click Me (Bottom)
              </button>
              <div className="absolute top-full left-1/2 transform -translate-x-1/2 mt-2 w-64 p-4 bg-white border border-gray-200 rounded-lg shadow-lg opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-10">
                <h4 className="font-semibold text-gray-900 mb-1">Popover Title</h4>
                <p className="text-sm text-gray-600">Konten popover di bawah</p>
                <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 -mb-1 border-4 border-transparent border-b-white"></div>
              </div>
            </div>
          </div>
        </ButtonSection>

        {/* ========== TOAST ========== */}
        <div className="mb-12" id="toast">
          <div className="mb-6">
            <h2 className="text-3xl font-bold text-gray-900 mb-2">Toast Notifications</h2>
            <p className="text-gray-600">Komponen toast untuk notifikasi</p>
          </div>
        </div>

        <ButtonSection
          title="97. Toast Variants"
          description="Toast dengan berbagai tipe dan posisi"
        >
          <div className="w-full space-y-4">
            <div className="flex items-start gap-3 p-4 bg-green-50 border border-green-200 rounded-lg">
              <CheckCircle className="text-green-600 flex-shrink-0 mt-0.5" size={20} />
              <div className="flex-1">
                <p className="text-sm font-medium text-green-900">Success</p>
                <p className="text-sm text-green-800">Data berhasil disimpan</p>
              </div>
              <button className="text-green-600 hover:text-green-700">
                <X size={18} />
              </button>
            </div>
            <div className="flex items-start gap-3 p-4 bg-red-50 border border-red-200 rounded-lg">
              <XCircle className="text-red-600 flex-shrink-0 mt-0.5" size={20} />
              <div className="flex-1">
                <p className="text-sm font-medium text-red-900">Error</p>
                <p className="text-sm text-red-800">Terjadi kesalahan saat memproses</p>
              </div>
              <button className="text-red-600 hover:text-red-700">
                <X size={18} />
              </button>
            </div>
            <div className="flex items-start gap-3 p-4 bg-blue-50 border border-blue-200 rounded-lg">
              <Info className="text-blue-600 flex-shrink-0 mt-0.5" size={20} />
              <div className="flex-1">
                <p className="text-sm font-medium text-blue-900">Info</p>
                <p className="text-sm text-blue-800">Informasi penting untuk diketahui</p>
              </div>
              <button className="text-blue-600 hover:text-blue-700">
                <X size={18} />
              </button>
            </div>
          </div>
        </ButtonSection>

        {/* ========== STEPPER ========== */}
        <div className="mb-12" id="stepper">
          <div className="mb-6">
            <h2 className="text-3xl font-bold text-gray-900 mb-2">Stepper</h2>
            <p className="text-gray-600">Komponen stepper untuk multi-step form</p>
          </div>
        </div>

        <ButtonSection
          title="98. Stepper Standard"
          description="Stepper dengan indikator step"
        >
          <div className="w-full">
            <div className="flex items-center justify-between mb-8">
              {[1, 2, 3, 4].map((step) => (
                <div key={step} className="flex items-center flex-1">
                  <div className="flex flex-col items-center">
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center font-semibold ${
                      step === stepperStep
                        ? "bg-[#0384d6] text-white"
                        : step < stepperStep
                        ? "bg-green-500 text-white"
                        : "bg-gray-200 text-gray-600"
                    }`}>
                      {step < stepperStep ? <Check size={20} /> : step}
                    </div>
                    <span className="mt-2 text-xs text-gray-600">Step {step}</span>
                  </div>
                  {step < 4 && (
                    <div className={`flex-1 h-1 mx-2 ${step < stepperStep ? "bg-green-500" : "bg-gray-200"}`}></div>
                  )}
                </div>
              ))}
            </div>
            <div className="flex justify-between">
              <button
                onClick={() => setStepperStep(Math.max(1, stepperStep - 1))}
                disabled={stepperStep === 1}
                className="px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Previous
              </button>
              <button
                onClick={() => setStepperStep(Math.min(4, stepperStep + 1))}
                disabled={stepperStep === 4}
                className="px-4 py-2 bg-[#0384d6] text-white rounded-lg text-sm font-medium hover:bg-[#0273b8] disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Next
              </button>
            </div>
          </div>
        </ButtonSection>

        {/* ========== RATING ========== */}
        <div className="mb-12" id="rating">
          <div className="mb-6">
            <h2 className="text-3xl font-bold text-gray-900 mb-2">Rating</h2>
            <p className="text-gray-600">Komponen rating untuk penilaian</p>
          </div>
        </div>

        <ButtonSection
          title="99. Rating Stars"
          description="Rating dengan bintang"
        >
          <div className="w-full space-y-4">
            <div>
              <p className="text-sm text-gray-600 mb-2">Interactive Rating</p>
              <div className="flex items-center gap-1">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    onClick={() => setRating(star)}
                    className="focus:outline-none"
                  >
                    <Star
                      size={24}
                      className={star <= rating ? "text-yellow-400 fill-yellow-400" : "text-gray-300"}
                    />
                  </button>
                ))}
                <span className="ml-2 text-sm text-gray-600">{rating > 0 ? `${rating}/5` : "Belum dinilai"}</span>
              </div>
            </div>
            <div>
              <p className="text-sm text-gray-600 mb-2">Read-only Rating</p>
              <div className="flex items-center gap-1">
                {[1, 2, 3, 4, 5].map((star) => (
                  <Star
                    key={star}
                    size={20}
                    className={star <= 4 ? "text-yellow-400 fill-yellow-400" : "text-gray-300"}
                  />
                ))}
                <span className="ml-2 text-sm text-gray-600">4.0</span>
              </div>
            </div>
          </div>
        </ButtonSection>

        {/* ========== SWITCH ========== */}
        <div className="mb-12" id="switch">
          <div className="mb-6">
            <h2 className="text-3xl font-bold text-gray-900 mb-2">Switch</h2>
            <p className="text-gray-600">Komponen switch untuk toggle on/off</p>
          </div>
        </div>

        <ButtonSection
          title="100. Switch Variants"
          description="Switch dengan berbagai ukuran dan style"
        >
          <div className="w-full space-y-4">
            <div className="flex items-center gap-4">
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={switchState}
                  onChange={(e) => setSwitchState(e.target.checked)}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-gray-300 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#0384d6]"></div>
                <span className="ml-3 text-sm font-medium text-gray-700">Default Switch</span>
              </label>
            </div>
            <div className="flex items-center gap-4">
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={!switchState}
                  onChange={(e) => setSwitchState(!e.target.checked)}
                  className="sr-only peer"
                />
                <div className="w-14 h-7 bg-gray-300 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[4px] after:left-[4px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-6 after:w-6 after:transition-all peer-checked:bg-green-500"></div>
                <span className="ml-3 text-sm font-medium text-gray-700">Large Switch</span>
              </label>
            </div>
          </div>
        </ButtonSection>

        {/* ========== STATISTICS ========== */}
        <div className="mb-12" id="statistics">
          <div className="mb-6">
            <h2 className="text-3xl font-bold text-gray-900 mb-2">Statistics Cards</h2>
            <p className="text-gray-600">Komponen untuk menampilkan statistik</p>
          </div>
        </div>

        <ButtonSection
          title="101. Statistics Cards"
          description="Card untuk menampilkan data statistik"
        >
          <div className="w-full grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-5">
              <div className="flex items-center justify-between mb-2">
                <p className="text-sm text-gray-500">Total Users</p>
                <Users className="text-blue-600" size={20} />
              </div>
              <p className="text-2xl font-bold text-gray-900">1,234</p>
              <p className="text-xs text-green-600 mt-1 flex items-center gap-1">
                <TrendUp size={12} />
                +12.5%
              </p>
            </div>
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-5">
              <div className="flex items-center justify-between mb-2">
                <p className="text-sm text-gray-500">Revenue</p>
                <DollarSign className="text-green-600" size={20} />
              </div>
              <p className="text-2xl font-bold text-gray-900">$45,678</p>
              <p className="text-xs text-green-600 mt-1 flex items-center gap-1">
                <TrendUp size={12} />
                +8.2%
              </p>
            </div>
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-5">
              <div className="flex items-center justify-between mb-2">
                <p className="text-sm text-gray-500">Orders</p>
                <ShoppingCart className="text-purple-600" size={20} />
              </div>
              <p className="text-2xl font-bold text-gray-900">567</p>
              <p className="text-xs text-red-600 mt-1 flex items-center gap-1">
                <TrendDown size={12} />
                -3.1%
              </p>
            </div>
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-5">
              <div className="flex items-center justify-between mb-2">
                <p className="text-sm text-gray-500">Growth</p>
                <TrendUp className="text-orange-600" size={20} />
              </div>
              <p className="text-2xl font-bold text-gray-900">23.4%</p>
              <p className="text-xs text-green-600 mt-1 flex items-center gap-1">
                <TrendUp size={12} />
                +5.7%
              </p>
            </div>
          </div>
        </ButtonSection>

        {/* ========== TIMELINE ========== */}
        <div className="mb-12" id="timeline">
          <div className="mb-6">
            <h2 className="text-3xl font-bold text-gray-900 mb-2">Timeline</h2>
            <p className="text-gray-600">Komponen timeline untuk menampilkan urutan waktu</p>
          </div>
        </div>

        <ButtonSection
          title="102. Timeline Standard"
          description="Timeline dengan berbagai style"
        >
          <div className="w-full">
            <div className="space-y-6">
              {[
                { title: "Project Started", time: "2 hours ago", icon: CheckCircle, bgColor: "bg-green-100", iconColor: "text-green-600" },
                { title: "Design Approved", time: "1 day ago", icon: CheckCircle, bgColor: "bg-blue-100", iconColor: "text-blue-600" },
                { title: "Development Started", time: "3 days ago", icon: Clock, bgColor: "bg-yellow-100", iconColor: "text-yellow-600" },
                { title: "Planning Phase", time: "1 week ago", icon: FileText, bgColor: "bg-gray-100", iconColor: "text-gray-600" },
              ].map((item, index) => {
                const Icon = item.icon;
                return (
                  <div key={index} className="flex gap-4">
                    <div className="flex flex-col items-center">
                      <div className={`w-10 h-10 rounded-full ${item.bgColor} flex items-center justify-center`}>
                        <Icon className={item.iconColor} size={20} />
                      </div>
                      {index < 3 && <div className="w-0.5 h-full bg-gray-200 mt-2"></div>}
                    </div>
                    <div className="flex-1 pb-6">
                      <h4 className="font-semibold text-gray-900">{item.title}</h4>
                      <p className="text-sm text-gray-500">{item.time}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </ButtonSection>

        {/* ========== LIST GROUP ========== */}
        <div className="mb-12" id="listgroup">
          <div className="mb-6">
            <h2 className="text-3xl font-bold text-gray-900 mb-2">List Group</h2>
            <p className="text-gray-600">Komponen list group untuk menampilkan daftar item</p>
          </div>
        </div>

        <ButtonSection
          title="103. List Group Variants"
          description="List group dengan berbagai style"
        >
          <div className="w-full space-y-4">
            <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
              <div className="px-4 py-3 bg-gray-50 border-b border-gray-200">
                <h4 className="font-semibold text-gray-900">List Group</h4>
              </div>
              <div className="divide-y divide-gray-200">
                <div className="px-4 py-3 hover:bg-gray-50 cursor-pointer">
                  <p className="font-medium text-gray-900">Item 1</p>
                  <p className="text-sm text-gray-500">Deskripsi item 1</p>
                </div>
                <div className="px-4 py-3 hover:bg-gray-50 cursor-pointer">
                  <p className="font-medium text-gray-900">Item 2</p>
                  <p className="text-sm text-gray-500">Deskripsi item 2</p>
                </div>
                <div className="px-4 py-3 hover:bg-gray-50 cursor-pointer">
                  <p className="font-medium text-gray-900">Item 3</p>
                  <p className="text-sm text-gray-500">Deskripsi item 3</p>
                </div>
              </div>
            </div>
          </div>
        </ButtonSection>

        {/* ========== HEADER ========== */}
        <div className="mb-12" id="header">
          <div className="mb-6">
            <h2 className="text-3xl font-bold text-gray-900 mb-2">Header</h2>
            <p className="text-gray-600">Komponen header untuk navigasi utama</p>
          </div>
        </div>

        <ButtonSection
          title="104. Header Navigation"
          description="Header dengan logo, menu, dan user menu"
        >
          <div className="w-full bg-white border border-gray-200 rounded-lg overflow-hidden">
            <header className="px-6 py-4 flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 bg-gradient-to-br from-[#0384d6] to-[#043975] rounded-lg flex items-center justify-center text-white font-bold">
                  PM
                </div>
                <nav className="hidden md:flex items-center gap-4">
                  <a href="#" className="text-sm font-medium text-[#0384d6]">Home</a>
                  <a href="#" className="text-sm font-medium text-gray-700 hover:text-gray-900">About</a>
                  <a href="#" className="text-sm font-medium text-gray-700 hover:text-gray-900">Services</a>
                  <a href="#" className="text-sm font-medium text-gray-700 hover:text-gray-900">Contact</a>
                </nav>
              </div>
              <div className="flex items-center gap-3">
                <button className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg">
                  <Bell size={20} />
                </button>
                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[#0384d6] to-[#043975] flex items-center justify-center text-white font-bold text-sm">
                  JD
                </div>
              </div>
            </header>
          </div>
        </ButtonSection>

        {/* ========== FOOTER ========== */}
        <div className="mb-12" id="footer">
          <div className="mb-6">
            <h2 className="text-3xl font-bold text-gray-900 mb-2">Footer</h2>
            <p className="text-gray-600">Komponen footer untuk informasi tambahan</p>
          </div>
        </div>

        <ButtonSection
          title="105. Footer Standard"
          description="Footer dengan links dan informasi"
        >
          <div className="w-full bg-gray-900 text-white rounded-lg overflow-hidden">
            <footer className="px-6 py-8">
              <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
                <div>
                  <h4 className="font-semibold mb-3">Company</h4>
                  <ul className="space-y-2 text-sm text-gray-400">
                    <li><a href="#" className="hover:text-white">About</a></li>
                    <li><a href="#" className="hover:text-white">Careers</a></li>
                    <li><a href="#" className="hover:text-white">Contact</a></li>
                  </ul>
                </div>
                <div>
                  <h4 className="font-semibold mb-3">Resources</h4>
                  <ul className="space-y-2 text-sm text-gray-400">
                    <li><a href="#" className="hover:text-white">Documentation</a></li>
                    <li><a href="#" className="hover:text-white">Support</a></li>
                    <li><a href="#" className="hover:text-white">Blog</a></li>
                  </ul>
                </div>
                <div>
                  <h4 className="font-semibold mb-3">Legal</h4>
                  <ul className="space-y-2 text-sm text-gray-400">
                    <li><a href="#" className="hover:text-white">Privacy</a></li>
                    <li><a href="#" className="hover:text-white">Terms</a></li>
                    <li><a href="#" className="hover:text-white">Cookies</a></li>
                  </ul>
                </div>
                <div>
                  <h4 className="font-semibold mb-3">Follow Us</h4>
                  <div className="flex gap-3">
                    <a href="#" className="w-8 h-8 bg-gray-800 rounded-lg flex items-center justify-center hover:bg-gray-700">
                      <GlobeIcon size={16} />
                    </a>
                    <a href="#" className="w-8 h-8 bg-gray-800 rounded-lg flex items-center justify-center hover:bg-gray-700">
                      <Mail size={16} />
                    </a>
                  </div>
                </div>
              </div>
              <div className="border-t border-gray-800 pt-6 text-center text-sm text-gray-400">
                <p>© 2024 Portal Mutu. All rights reserved.</p>
              </div>
            </footer>
          </div>
        </ButtonSection>

        {/* ========== CONTEXT MENU ========== */}
        <div className="mb-12" id="contextmenu">
          <div className="mb-6">
            <h2 className="text-3xl font-bold text-gray-900 mb-2">Context Menu</h2>
            <p className="text-gray-600">Komponen context menu untuk right-click actions</p>
          </div>
        </div>

        <ButtonSection
          title="106. Context Menu"
          description="Context menu yang muncul saat right-click"
        >
          <div className="relative inline-block">
            <div className="p-8 border-2 border-dashed border-gray-300 rounded-lg text-center cursor-pointer hover:border-[#0384d6] transition-colors">
              <p className="text-sm text-gray-600">Right-click di sini</p>
            </div>
            <div className="absolute top-4 left-4 mt-2 w-48 bg-white border border-gray-200 rounded-lg shadow-lg z-10">
              <button className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 rounded-t-lg flex items-center gap-2">
                <Edit size={16} />
                Edit
              </button>
              <button className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-2">
                <Copy size={16} />
                Copy
              </button>
              <button className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-2">
                <Share2 size={16} />
                Share
              </button>
              <div className="border-t border-gray-200 my-1"></div>
              <button className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 rounded-b-lg flex items-center gap-2">
                <Trash2 size={16} />
                Delete
              </button>
            </div>
          </div>
        </ButtonSection>

        {/* ========== COMMAND PALETTE ========== */}
        <div className="mb-12" id="command">
          <div className="mb-6">
            <h2 className="text-3xl font-bold text-gray-900 mb-2">Command Palette</h2>
            <p className="text-gray-600">Komponen command palette untuk quick actions</p>
          </div>
        </div>

        <ButtonSection
          title="107. Command Palette"
          description="Command palette dengan search dan shortcuts"
        >
          <div className="w-full max-w-md mx-auto bg-white border border-gray-200 rounded-lg shadow-lg overflow-hidden">
            <div className="p-4 border-b border-gray-200">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
                <input
                  type="text"
                  placeholder="Type a command or search..."
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#0384d6] focus:border-[#0384d6]"
                />
              </div>
            </div>
            <div className="max-h-64 overflow-y-auto">
              <div className="p-2">
                <div className="px-3 py-2 text-xs font-semibold text-gray-500 uppercase">Recent</div>
                <button className="w-full text-left px-3 py-2 text-sm text-gray-700 hover:bg-gray-100 rounded-lg flex items-center gap-2">
                  <FileText size={16} />
                  <span>Open File</span>
                  <kbd className="ml-auto px-2 py-0.5 bg-gray-100 rounded text-xs">⌘K</kbd>
                </button>
                <button className="w-full text-left px-3 py-2 text-sm text-gray-700 hover:bg-gray-100 rounded-lg flex items-center gap-2">
                  <Settings size={16} />
                  <span>Settings</span>
                  <kbd className="ml-auto px-2 py-0.5 bg-gray-100 rounded text-xs">⌘,</kbd>
                </button>
              </div>
              <div className="border-t border-gray-200 my-1"></div>
              <div className="p-2">
                <div className="px-3 py-2 text-xs font-semibold text-gray-500 uppercase">Actions</div>
                <button className="w-full text-left px-3 py-2 text-sm text-gray-700 hover:bg-gray-100 rounded-lg flex items-center gap-2">
                  <Plus size={16} />
                  <span>New File</span>
                </button>
                <button className="w-full text-left px-3 py-2 text-sm text-gray-700 hover:bg-gray-100 rounded-lg flex items-center gap-2">
                  <Folder size={16} />
                  <span>New Folder</span>
                </button>
              </div>
            </div>
          </div>
        </ButtonSection>

        {/* ========== CAROUSEL ========== */}
        <div className="mb-12" id="carousel">
          <div className="mb-6">
            <h2 className="text-3xl font-bold text-gray-900 mb-2">Carousel</h2>
            <p className="text-gray-600">Komponen carousel untuk slideshow</p>
          </div>
        </div>

        <ButtonSection
          title="108. Carousel Standard"
          description="Carousel dengan navigation controls"
        >
          <div className="w-full max-w-2xl mx-auto relative">
            <div className="relative overflow-hidden rounded-lg bg-gradient-to-r from-blue-500 to-purple-500 h-64 flex items-center justify-center">
              <div className="text-white text-center">
                <h3 className="text-2xl font-bold mb-2">Slide 1</h3>
                <p className="text-blue-100">Konten carousel di sini</p>
              </div>
            </div>
            <div className="flex justify-center gap-2 mt-4">
              <button className="w-2 h-2 rounded-full bg-[#0384d6]"></button>
              <button className="w-2 h-2 rounded-full bg-gray-300"></button>
              <button className="w-2 h-2 rounded-full bg-gray-300"></button>
            </div>
            <button className="absolute left-4 top-1/2 transform -translate-y-1/2 w-10 h-10 bg-white/80 rounded-full flex items-center justify-center hover:bg-white transition-colors">
              <ChevronLeft size={20} />
            </button>
            <button className="absolute right-4 top-1/2 transform -translate-y-1/2 w-10 h-10 bg-white/80 rounded-full flex items-center justify-center hover:bg-white transition-colors">
              <ChevronRight size={20} />
            </button>
          </div>
        </ButtonSection>

        {/* ========== IMAGE GALLERY ========== */}
        <div className="mb-12" id="gallery">
          <div className="mb-6">
            <h2 className="text-3xl font-bold text-gray-900 mb-2">Image Gallery</h2>
            <p className="text-gray-600">Komponen gallery untuk menampilkan gambar</p>
          </div>
        </div>

        <ButtonSection
          title="109. Image Gallery"
          description="Gallery dengan grid layout"
        >
          <div className="w-full grid grid-cols-3 gap-2">
            {[1, 2, 3, 4, 5, 6].map((item) => (
              <div
                key={item}
                className="aspect-square bg-gradient-to-br from-blue-400 to-purple-500 rounded-lg flex items-center justify-center text-white font-bold cursor-pointer hover:opacity-90 transition-opacity"
              >
                {item}
              </div>
            ))}
          </div>
        </ButtonSection>

        {/* ========== CHARTS ========== */}
        <div className="mb-12" id="charts">
          <div className="mb-6">
            <h2 className="text-3xl font-bold text-gray-900 mb-2">Charts</h2>
            <p className="text-gray-600">Komponen chart untuk visualisasi data</p>
          </div>
        </div>

        <ButtonSection
          title="110. Chart Types"
          description="Berbagai jenis chart untuk data visualization"
        >
          <div className="w-full space-y-6">
            <div>
              <p className="text-sm text-gray-600 mb-2">Bar Chart</p>
              <div className="h-32 bg-gray-50 rounded-lg p-4 flex items-end justify-between gap-2">
                {[40, 60, 80, 50, 70, 90].map((height, index) => (
                  <div key={index} className="flex-1 flex flex-col items-center">
                    <div
                      className="w-full bg-gradient-to-t from-[#0384d6] to-blue-400 rounded-t"
                      style={{ height: `${height}%` }}
                    ></div>
                    <span className="text-xs text-gray-500 mt-1">{index + 1}</span>
                  </div>
                ))}
              </div>
            </div>
            <div>
              <p className="text-sm text-gray-600 mb-2">Line Chart</p>
              <div className="h-32 bg-gray-50 rounded-lg p-4 flex items-center justify-center">
                <svg className="w-full h-full" viewBox="0 0 200 100">
                  <polyline
                    points="10,80 40,60 70,40 100,50 130,30 160,20 190,10"
                    fill="none"
                    stroke="#0384d6"
                    strokeWidth="2"
                  />
                </svg>
              </div>
            </div>
            <div>
              <p className="text-sm text-gray-600 mb-2">Pie Chart</p>
              <div className="h-32 bg-gray-50 rounded-lg p-4 flex items-center justify-center">
                <div className="relative w-24 h-24">
                  <div className="absolute inset-0 rounded-full border-8 border-[#0384d6] border-t-transparent transform rotate-45"></div>
                  <div className="absolute inset-0 rounded-full border-8 border-green-500 border-r-transparent border-b-transparent"></div>
                  <div className="absolute inset-0 rounded-full border-8 border-yellow-500 border-l-transparent border-t-transparent"></div>
                </div>
              </div>
            </div>
          </div>
        </ButtonSection>

        {/* ========== COLORS ========== */}
        <div className="mb-12" id="colors">
          <div className="mb-6">
            <h2 className="text-3xl font-bold text-gray-900 mb-2">Color Palette</h2>
            <p className="text-gray-600">Palet warna yang digunakan dalam design system</p>
          </div>
        </div>

        <ButtonSection
          title="111. Primary Colors"
          description="Warna utama aplikasi"
        >
          <div className="w-full grid grid-cols-2 md:grid-cols-4 gap-4">
            <div>
              <div className="h-20 bg-[#0384d6] rounded-lg mb-2"></div>
              <p className="text-sm font-medium text-gray-700">Primary Blue</p>
              <p className="text-xs text-gray-500">#0384d6</p>
            </div>
            <div>
              <div className="h-20 bg-[#043975] rounded-lg mb-2"></div>
              <p className="text-sm font-medium text-gray-700">Dark Blue</p>
              <p className="text-xs text-gray-500">#043975</p>
            </div>
            <div>
              <div className="h-20 bg-[#0273b8] rounded-lg mb-2"></div>
              <p className="text-sm font-medium text-gray-700">Hover Blue</p>
              <p className="text-xs text-gray-500">#0273b8</p>
            </div>
            <div>
              <div className="h-20 bg-gradient-to-r from-[#043975] to-[#0384d6] rounded-lg mb-2"></div>
              <p className="text-sm font-medium text-gray-700">Gradient</p>
              <p className="text-xs text-gray-500">#043975 → #0384d6</p>
            </div>
          </div>
        </ButtonSection>

        <ButtonSection
          title="112. Status Colors"
          description="Warna untuk status (success, error, warning)"
        >
          <div className="w-full grid grid-cols-2 md:grid-cols-4 gap-4">
            <div>
              <div className="h-20 bg-green-500 rounded-lg mb-2"></div>
              <p className="text-sm font-medium text-gray-700">Success</p>
              <p className="text-xs text-gray-500">green-500</p>
            </div>
            <div>
              <div className="h-20 bg-red-500 rounded-lg mb-2"></div>
              <p className="text-sm font-medium text-gray-700">Error</p>
              <p className="text-xs text-gray-500">red-500</p>
            </div>
            <div>
              <div className="h-20 bg-yellow-500 rounded-lg mb-2"></div>
              <p className="text-sm font-medium text-gray-700">Warning</p>
              <p className="text-xs text-gray-500">yellow-500</p>
            </div>
            <div>
              <div className="h-20 bg-blue-500 rounded-lg mb-2"></div>
              <p className="text-sm font-medium text-gray-700">Info</p>
              <p className="text-xs text-gray-500">blue-500</p>
            </div>
          </div>
        </ButtonSection>

          {/* Footer */}
          <div className="mt-16 text-center text-gray-600">
            <p className="text-lg font-semibold">Design System - Portal Mutu</p>
            <p className="text-sm mt-2">Gunakan komponen-komponen ini sebagai referensi untuk konsistensi desain</p>
          </div>
        </div>
      </div>
    </div>
  );
}

