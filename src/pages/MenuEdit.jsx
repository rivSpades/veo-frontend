import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { DragDropContext, Droppable, Draggable } from '@hello-pangea/dnd';
import { useToast } from '../components/ui/Toast';
import {
  ArrowLeft,
  Save,
  Plus,
  Trash2,
  Upload,
  Type,
  QrCode,
  Eye,
  GripVertical,
  Palette,
  Utensils,
  Coffee,
  Wine,
  Cake,
  Pizza,
  Soup,
  Salad,
  Fish,
  Beef,
  IceCream,
  Cookie,
  ChefHat,
  Star,
  Heart,
  Sparkles,
  Crown,
  Flame,
  Leaf,
  GlassWater,
  Rocket,
  X,
  Languages,
} from 'lucide-react';
import { Button } from '../components/ui/Button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/Card';
import { Input } from '../components/ui/Input';
import { Textarea } from '../components/ui/Textarea';
import { Label } from '../components/ui/Label';
import { Badge } from '../components/ui/Badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/Tabs';
import { Select } from '../components/ui/Select';
import { Slider } from '../components/ui/Slider';
import { Popover, PopoverContent, PopoverTrigger } from '../components/ui/Popover';
import { Accordion, AccordionItem, AccordionTrigger, AccordionContent } from '../components/ui/Accordion';
import { DashboardLayout } from '../components/layout/DashboardLayout';
import { DemoWidget } from '../components/DemoWidget';
import { getTextWithTranslation, getRestaurantSettings } from '../utils/menuStorage';
import { getMenuById, updateMenu as updateMenuAPI } from '../data/menus';
import { getSections, createSection, updateSection, deleteSection } from '../data/sections';
import { getItems, createItem, updateItem as updateItemAPI, deleteItem, uploadItemImage } from '../data/items';
import { apiFetch, instancesAPI } from '../data/api';

// Available icons for subsections and menus
const availableIcons = [
  { name: 'Utensils', icon: Utensils, category: 'General' },
  { name: 'Coffee', icon: Coffee, category: 'Beverages' },
  { name: 'Wine', icon: Wine, category: 'Beverages' },
  { name: 'Cake', icon: Cake, category: 'Desserts' },
  { name: 'Pizza', icon: Pizza, category: 'Food' },
  { name: 'Soup', icon: Soup, category: 'Food' },
  { name: 'Salad', icon: Salad, category: 'Food' },
  { name: 'Fish', icon: Fish, category: 'Proteins' },
  { name: 'Beef', icon: Beef, category: 'Proteins' },
  { name: 'IceCream', icon: IceCream, category: 'Desserts' },
  { name: 'Cookie', icon: Cookie, category: 'Desserts' },
  { name: 'ChefHat', icon: ChefHat, category: 'General' },
  { name: 'Star', icon: Star, category: 'Special' },
  { name: 'Heart', icon: Heart, category: 'Special' },
  { name: 'Sparkles', icon: Sparkles, category: 'Special' },
  { name: 'Crown', icon: Crown, category: 'Special' },
  { name: 'Flame', icon: Flame, category: 'Tags' },
  { name: 'Leaf', icon: Leaf, category: 'Tags' },
  { name: 'GlassWater', icon: GlassWater, category: 'Tags' },
  { name: 'Rocket', icon: Rocket, category: 'Special' },
];

// Available tags with their metadata
const availableTags = [
  { id: 'vegetarian', name: 'Vegetarian', icon: Leaf, color: 'bg-green-100 text-green-800', category: 'Dietary' },
  { id: 'vegan', name: 'Vegan', icon: Leaf, color: 'bg-green-100 text-green-800', category: 'Dietary' },
  { id: 'gluten-free', name: 'Gluten Free', icon: GlassWater, color: 'bg-blue-100 text-blue-800', category: 'Dietary' },
  { id: 'dairy-free', name: 'Dairy Free', icon: GlassWater, color: 'bg-cyan-100 text-cyan-800', category: 'Dietary' },
  { id: 'spicy', name: 'Spicy', icon: Flame, color: 'bg-red-100 text-red-800', category: 'Taste' },
  { id: 'popular', name: 'Popular', icon: Star, color: 'bg-yellow-100 text-yellow-800', category: 'Special' },
  { id: 'chef-special', name: "Chef's Special", icon: ChefHat, color: 'bg-purple-100 text-purple-800', category: 'Special' },
  { id: 'new', name: 'New', icon: Sparkles, color: 'bg-pink-100 text-pink-800', category: 'Special' },
  { id: 'signature', name: 'Signature', icon: Crown, color: 'bg-amber-100 text-amber-800', category: 'Special' },
  { id: 'healthy', name: 'Healthy', icon: Heart, color: 'bg-emerald-100 text-emerald-800', category: 'Dietary' },
];

// Available allergens
const availableAllergens = [
  { id: 'gluten', name: 'Gluten', color: 'bg-orange-100 text-orange-800' },
  { id: 'dairy', name: 'Dairy', color: 'bg-blue-100 text-blue-800' },
  { id: 'nuts', name: 'Nuts', color: 'bg-yellow-100 text-yellow-800' },
  { id: 'eggs', name: 'Eggs', color: 'bg-purple-100 text-purple-800' },
  { id: 'fish', name: 'Fish', color: 'bg-cyan-100 text-cyan-800' },
  { id: 'shellfish', name: 'Shellfish', color: 'bg-red-100 text-red-800' },
  { id: 'soy', name: 'Soy', color: 'bg-green-100 text-green-800' },
  { id: 'sesame', name: 'Sesame', color: 'bg-amber-100 text-amber-800' },
  { id: 'sulfites', name: 'Sulfites', color: 'bg-pink-100 text-pink-800' },
  { id: 'pork', name: 'Pork', color: 'bg-rose-100 text-rose-800' },
];

// Font options
const fontOptions = [
  { name: 'Inter', value: 'Inter', category: 'Sans Serif' },
  { name: 'Roboto', value: 'Roboto', category: 'Sans Serif' },
  { name: 'Open Sans', value: 'Open Sans', category: 'Sans Serif' },
  { name: 'Lato', value: 'Lato', category: 'Sans Serif' },
  { name: 'Montserrat', value: 'Montserrat', category: 'Sans Serif' },
  { name: 'Poppins', value: 'Poppins', category: 'Sans Serif' },
  { name: 'Playfair Display', value: 'Playfair Display', category: 'Serif' },
  { name: 'Merriweather', value: 'Merriweather', category: 'Serif' },
  { name: 'Lora', value: 'Lora', category: 'Serif' },
  { name: 'Dancing Script', value: 'Dancing Script', category: 'Handwriting' },
  { name: 'Pacifico', value: 'Pacifico', category: 'Handwriting' },
];

// Design templates with harmonious color palettes
const designTemplates = [
  {
    name: 'Classic Elegance',
    description: 'Timeless black and white',
    preview: ['#000000', '#FFFFFF', '#F9FAFB'],
    colors: {
      backgroundColor: '#FFFFFF',
      fontColor: '#111827',
      fontFamily: 'Playfair Display',
      fontSize: 15,
      sectionBackgroundColor: '#F9FAFB',
      sectionTextColor: '#1F2937',
      subsectionBackgroundColor: '#F3F4F6',
      subsectionTextColor: '#6B7280',
      tabActiveBackgroundColor: '#111827',
      tabActiveTextColor: '#FFFFFF',
      tabInactiveBackgroundColor: '#F3F4F6',
      tabInactiveTextColor: '#6B7280',
    },
  },
  {
    name: 'Minimal White',
    description: 'Clean and modern',
    preview: ['#FFFFFF', '#F9FAFB', '#E5E7EB'],
    colors: {
      backgroundColor: '#FFFFFF',
      fontColor: '#1F2937',
      fontFamily: 'Inter',
      fontSize: 14,
      sectionBackgroundColor: '#FAFAFA',
      sectionTextColor: '#374151',
      subsectionBackgroundColor: '#F5F5F5',
      subsectionTextColor: '#6B7280',
      tabActiveBackgroundColor: '#1F2937',
      tabActiveTextColor: '#FFFFFF',
      tabInactiveBackgroundColor: '#F3F4F6',
      tabInactiveTextColor: '#9CA3AF',
    },
  },
  {
    name: 'Warm Cream',
    description: 'Soft and inviting',
    preview: ['#FEFCE8', '#FEF9C3', '#F5F5DC'],
    colors: {
      backgroundColor: '#FFFEF7',
      fontColor: '#292524',
      fontFamily: 'Lora',
      fontSize: 15,
      sectionBackgroundColor: '#FEFCE8',
      sectionTextColor: '#44403C',
      subsectionBackgroundColor: '#FEF9C3',
      subsectionTextColor: '#78716C',
      tabActiveBackgroundColor: '#44403C',
      tabActiveTextColor: '#FFFEF7',
      tabInactiveBackgroundColor: '#FEF9C3',
      tabInactiveTextColor: '#A8A29E',
    },
  },
  {
    name: 'Slate Gray',
    description: 'Professional and refined',
    preview: ['#334155', '#64748B', '#F1F5F9'],
    colors: {
      backgroundColor: '#F8FAFC',
      fontColor: '#0F172A',
      fontFamily: 'Inter',
      fontSize: 14,
      sectionBackgroundColor: '#F1F5F9',
      sectionTextColor: '#1E293B',
      subsectionBackgroundColor: '#E2E8F0',
      subsectionTextColor: '#64748B',
      tabActiveBackgroundColor: '#334155',
      tabActiveTextColor: '#F8FAFC',
      tabInactiveBackgroundColor: '#E2E8F0',
      tabInactiveTextColor: '#94A3B8',
    },
  },
  {
    name: 'Sage Green',
    description: 'Natural and calming',
    preview: ['#ECFDF5', '#D1FAE5', '#A7F3D0'],
    colors: {
      backgroundColor: '#FAFFFE',
      fontColor: '#14532D',
      fontFamily: 'Lora',
      fontSize: 15,
      sectionBackgroundColor: '#F0FDF4',
      sectionTextColor: '#166534',
      subsectionBackgroundColor: '#DCFCE7',
      subsectionTextColor: '#15803D',
      tabActiveBackgroundColor: '#166534',
      tabActiveTextColor: '#F0FDF4',
      tabInactiveBackgroundColor: '#DCFCE7',
      tabInactiveTextColor: '#4ADE80',
    },
  },
  {
    name: 'Sky Blue',
    description: 'Fresh and airy',
    preview: ['#F0F9FF', '#E0F2FE', '#BAE6FD'],
    colors: {
      backgroundColor: '#FAFEFF',
      fontColor: '#0C4A6E',
      fontFamily: 'Poppins',
      fontSize: 14,
      sectionBackgroundColor: '#F0F9FF',
      sectionTextColor: '#075985',
      subsectionBackgroundColor: '#E0F2FE',
      subsectionTextColor: '#0369A1',
      tabActiveBackgroundColor: '#0284C7',
      tabActiveTextColor: '#F0F9FF',
      tabInactiveBackgroundColor: '#E0F2FE',
      tabInactiveTextColor: '#0EA5E9',
    },
  },
  {
    name: 'Soft Lavender',
    description: 'Elegant and gentle',
    preview: ['#FAF5FF', '#F3E8FF', '#E9D5FF'],
    colors: {
      backgroundColor: '#FDFAFF',
      fontColor: '#4C1D95',
      fontFamily: 'Poppins',
      fontSize: 14,
      sectionBackgroundColor: '#FAF5FF',
      sectionTextColor: '#6B21A8',
      subsectionBackgroundColor: '#F3E8FF',
      subsectionTextColor: '#7E22CE',
      tabActiveBackgroundColor: '#7C3AED',
      tabActiveTextColor: '#FAF5FF',
      tabInactiveBackgroundColor: '#F3E8FF',
      tabInactiveTextColor: '#A78BFA',
    },
  },
  {
    name: 'Peach Blush',
    description: 'Warm and welcoming',
    preview: ['#FFF7ED', '#FFEDD5', '#FED7AA'],
    colors: {
      backgroundColor: '#FFFCF7',
      fontColor: '#7C2D12',
      fontFamily: 'Lora',
      fontSize: 15,
      sectionBackgroundColor: '#FFF7ED',
      sectionTextColor: '#9A3412',
      subsectionBackgroundColor: '#FFEDD5',
      subsectionTextColor: '#C2410C',
      tabActiveBackgroundColor: '#EA580C',
      tabActiveTextColor: '#FFF7ED',
      tabInactiveBackgroundColor: '#FFEDD5',
      tabInactiveTextColor: '#FB923C',
    },
  },
  {
    name: 'Charcoal',
    description: 'Bold and modern',
    preview: ['#18181B', '#27272A', '#3F3F46'],
    colors: {
      backgroundColor: '#FAFAFA',
      fontColor: '#18181B',
      fontFamily: 'Inter',
      fontSize: 14,
      sectionBackgroundColor: '#F4F4F5',
      sectionTextColor: '#27272A',
      subsectionBackgroundColor: '#E4E4E7',
      subsectionTextColor: '#52525B',
      tabActiveBackgroundColor: '#27272A',
      tabActiveTextColor: '#FAFAFA',
      tabInactiveBackgroundColor: '#E4E4E7',
      tabInactiveTextColor: '#71717A',
    },
  },
];

// Language options
const languageOptions = [
  { code: 'pt', name: 'Português', flag: '🇵🇹' },
  { code: 'en', name: 'English', flag: '🇬🇧' },
  { code: 'es', name: 'Español', flag: '🇪🇸' },
  { code: 'fr', name: 'Français', flag: '🇫🇷' },
  { code: 'de', name: 'Deutsch', flag: '🇩🇪' },
  { code: 'it', name: 'Italiano', flag: '🇮🇹' },
];

// Helper function to transform backend business hours to frontend format
const transformBusinessHours = (backendHours) => {
  if (!backendHours || backendHours.length === 0) return [];
  
  const dayNames = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
  
  return backendHours.map(hour => ({
    day: dayNames[hour.day_of_week] || 'Monday',
    open: hour.opening_time || '09:00',
    close: hour.closing_time || '22:00',
    closed: hour.is_closed || false,
  }));
};

export default function MenuEdit() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();

  // Helper function for showing toasts
  const showToast = (message, type = 'info') => {
    toast({
      title: message,
      type: type,
      duration: 3000
    });
  };

  const [menu, setMenu] = useState(null);
  const [restaurantSettings, setRestaurantSettings] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isDirty, setIsDirty] = useState(false);
  const [showMenuIconPicker, setShowMenuIconPicker] = useState(false);
  const [showIconPicker, setShowIconPicker] = useState(null);

  // Preview navigation state (store IDs, not objects, so they stay in sync)
  const [previewCurrentView, setPreviewCurrentView] = useState('main');
  const [previewSelectedSectionId, setPreviewSelectedSectionId] = useState(null);
  const [previewSelectedItemId, setPreviewSelectedItemId] = useState(null);
  const [previewActiveSubSectionId, setPreviewActiveSubSectionId] = useState(null);

  // Design state - exact defaults matching landing page
  const [designSettings, setDesignSettings] = useState({
    backgroundColor: '#FFFFFF',
    fontColor: '#1F2937',
    fontFamily: 'Inter',
    fontSize: 14,
    sectionBackgroundColor: '#F9FAFB',
    sectionTextColor: '#111827',
    sectionBorderColor: '#E5E7EB',
    subsectionBackgroundColor: '#F3F4F6',
    subsectionTextColor: '#6B7280',
    tabActiveBackgroundColor: '#111827',
    tabActiveTextColor: '#FFFFFF',
    tabInactiveBackgroundColor: '#F9FAFB',
    tabInactiveTextColor: '#111827',
  });

  // Translation state
  const [activeLang, setActiveLang] = useState('pt');

  useEffect(() => {
    loadMenu();
  }, [id]);



  const loadMenu = async () => {
    try {
      setLoading(true);

      // Fetch menu from backend
      const menuResponse = await getMenuById(id);

      if (!menuResponse.success) {
        showToast('Failed to load menu', 'error');
        navigate('/dashboard/menus');
        return;
      }

      const loadedMenu = menuResponse.data;
      
      // Fetch restaurant data from backend instead of localStorage
      let settings = null;
      if (loadedMenu.instance) {
        const instanceResponse = await instancesAPI.getInstance(loadedMenu.instance);
        if (instanceResponse.success && instanceResponse.data) {
          // Transform backend instance data to match DemoWidget expectations
          const instanceData = instanceResponse.data;
          settings = {
            name: instanceData.name,
            description: instanceData.description,
            address: instanceData.address,
            phone: instanceData.phone,
            wifiName: instanceData.wifi_name,
            wifiPassword: instanceData.wifi_password,
            showWifiOnMenu: instanceData.show_wifi_on_menu,
            showGoogleRating: instanceData.show_google_rating,
            googleUrl: instanceData.google_business_url,
            googleRating: instanceData.google_rating,
            googleReviewCount: instanceData.google_review_count,
            logoUrl: instanceData.logo,
            showHoursOnMenu: instanceData.show_hours_on_menu,
            workingHours: transformBusinessHours(instanceData.business_hours),
          };
        }
      }
      
      // Fallback to localStorage if backend fetch fails
      if (!settings) {
        settings = getRestaurantSettings();
      }

      // Transform backend structure to frontend structure
      // Backend: Menu → Section → Items
      // Frontend: Menu → Section (with subSections array containing single subsection with items)
      // Each backend section becomes a frontend section with one subsection
      if (loadedMenu.sections && loadedMenu.sections.length > 0) {
        loadedMenu.sections = loadedMenu.sections.map((backendSection, index) => {
          const defaultLang = loadedMenu.default_language || 'pt';
          
          // Transform items to extract text from multilingual objects
          const transformedItems = (backendSection.items || []).map(item => {
            // Use backend tags field if available, otherwise convert from boolean fields
            let tags = item.tags || [];
            if (tags.length === 0) {
              // Fallback: Convert backend boolean fields to frontend tags for backward compatibility
              if (item.is_vegetarian) tags.push('vegetarian');
              if (item.is_vegan) tags.push('vegan');
              if (item.is_gluten_free) tags.push('gluten-free');
              if (item.is_spicy) tags.push('spicy');
            }
            
            return {
              ...item,
              name: typeof item.name === 'object'
                ? item.name[defaultLang] || Object.values(item.name)[0] || 'Unnamed Item'
                : item.name || 'Unnamed Item',
              description: typeof item.description === 'object'
                ? item.description[defaultLang] || Object.values(item.description)[0] || ''
                : item.description || '',
              tags: tags,
              allergens: item.allergens || [],
              sortOrder: item.order || 0,
              _backendId: item.id,
            };
          });
          
          return {
            id: backendSection.id,
            name: typeof backendSection.name === 'object'
              ? backendSection.name[defaultLang] || Object.values(backendSection.name)[0]
              : backendSection.name,
            description: typeof backendSection.description === 'object'
              ? backendSection.description[defaultLang] || ''
              : backendSection.description || '',
            subSections: [{
              id: `${backendSection.id}-sub`,
              name: 'Items', // Hidden in UI
              items: transformedItems,
            }],
            icon: backendSection.icon || 'Utensils',
            sortOrder: backendSection.order || index,
            _backendId: backendSection.id,
          };
        });
      } else {
        loadedMenu.sections = [];
      }

      // Ensure design exists with exact defaults matching landing page
      if (!loadedMenu.design) {
        loadedMenu.design = {
          backgroundColor: '#FFFFFF',
          fontColor: '#1F2937',
          fontFamily: 'Inter',
          fontSize: 14,
          sectionBackgroundColor: '#F9FAFB',
          sectionTextColor: '#111827',
          sectionBorderColor: '#E5E7EB',
          subsectionBackgroundColor: '#F3F4F6',
          subsectionTextColor: '#6B7280',
          tabActiveBackgroundColor: '#111827',
          tabActiveTextColor: '#FFFFFF',
          tabInactiveBackgroundColor: '#F9FAFB',
          tabInactiveTextColor: '#111827',
        };
      }

      // Ensure languages exist
      if (!loadedMenu.languages) {
        loadedMenu.languages = [loadedMenu.default_language || 'pt'];
      }

      // Ensure translations exist
      if (!loadedMenu.translations) {
        loadedMenu.translations = {};
      }

      // Load design settings
      setDesignSettings({
        backgroundColor: loadedMenu.design.backgroundColor || '#ffffff',
        fontFamily: loadedMenu.design.fontFamily || 'Inter',
        fontSize: loadedMenu.design.fontSize || 16,
        fontColor: loadedMenu.design.fontColor || '#1f2937',
        sectionBackgroundColor: loadedMenu.design.sectionBackgroundColor || '#f3f4f6',
        sectionTextColor: loadedMenu.design.sectionTextColor || '#1f2937',
        subsectionBackgroundColor: loadedMenu.design.subsectionBackgroundColor || '#f9fafb',
        subsectionTextColor: loadedMenu.design.subsectionTextColor || '#374151',
        tabActiveBackgroundColor: loadedMenu.design.tabActiveBackgroundColor || '#000000',
        tabActiveTextColor: loadedMenu.design.tabActiveTextColor || '#ffffff',
        tabInactiveBackgroundColor: loadedMenu.design.tabInactiveBackgroundColor || '#f3f4f6',
        tabInactiveTextColor: loadedMenu.design.tabInactiveTextColor || '#6b7280',
      });

      setMenu(loadedMenu);
      setRestaurantSettings(settings);
      setLoading(false);
    } catch (error) {
      console.error('Error loading menu:', error);
      showToast('An error occurred while loading the menu', 'error');
      navigate('/dashboard/menus');
    }
  };

  const markDirty = () => setIsDirty(true);

  const saveMenu = async () => {
    if (!menu) return;

    try {
      const updatedMenu = {
        ...menu,
        design: {
          ...menu.design,
          ...designSettings,
        },
      };

      const response = await updateMenuAPI(id, updatedMenu);

      if (response.success) {
        // Don't update local state with backend response during auto-save
        // This prevents overwriting local changes with potentially stale backend data
        setIsDirty(false);
        // Auto-save toast disabled to avoid spam
        // showToast('Menu saved successfully', 'success');
      } else {
        const errorMsg = typeof response.error === 'string' ? response.error : response.error?.message || 'Failed to save menu';
        showToast(errorMsg, 'error');
      }
    } catch (error) {
      console.error('Error saving menu:', error);
      showToast('An error occurred while saving the menu', 'error');
    }
  };

  // Auto-save with debouncing
  useEffect(() => {
    if (!isDirty || !menu) return;
    
    saveMenu();
  }, [menu, designSettings, isDirty]);

  // Add new section (backend integration)
  const addSection = async () => {
    if (!menu || !menu.id) {
      showToast('Menu not loaded. Please refresh the page.', 'error');
      return;
    }

    try {
      const defaultLang = menu.default_language || menu.available_languages?.[0] || 'en';

      const sectionData = {
        menu: menu.id,
        name: { [defaultLang]: 'New Section' },
        description: { [defaultLang]: '' },
        order: menu.sections?.length || 0,
        is_active: true,
      };

      const response = await createSection(sectionData);

      if (response.success && response.data && response.data.section) {
        
        // Backend returns section data in response.data.section
        const sectionData = response.data.section;
        
        // Transform backend section to frontend section structure
        const sectionId = sectionData.id;
        const sectionName = typeof sectionData.name === 'object'
          ? sectionData.name[defaultLang] || Object.values(sectionData.name || {})[0] || 'New Section'
          : sectionData.name || 'New Section';
        
        const newSection = {
          id: sectionId,
          name: sectionName,
          description: typeof sectionData.description === 'object'
            ? sectionData.description[defaultLang] || ''
            : sectionData.description || '',
          subSections: [], // Start with no subsections - user must add them
          icon: 'Utensils',
          sortOrder: sectionData.order !== undefined ? sectionData.order : (Math.max(...(menu.sections || []).map(s => s.sortOrder || 0), -1) + 1),
          _backendId: sectionData.id,
        };

        // Add to sections array immediately for UI responsiveness
        const updatedMenu = {
          ...menu,
          sections: [...(menu.sections || []), newSection]
        };
        setMenu(updatedMenu);

        // Toast disabled to avoid spam
        // showToast('Section created successfully', 'success');
      } else {
        const errorMsg = typeof response.error === 'string' ? response.error : response.error?.message || 'Failed to create section';
        showToast(errorMsg, 'error');
      }
    } catch (error) {
      console.error('Error adding section:', error);
      showToast('An error occurred while adding the section', 'error');
    }
  };

  // Add new subsection (creates backend section)
  const addSubsection = async (sectionId) => {
    if (!menu || !menu.id) {
      showToast('Menu not loaded. Please refresh the page.', 'error');
      return;
    }

    try {
      const defaultLang = menu.default_language || menu.available_languages?.[0] || 'en';
      const sectionData = {
        menu: menu.id,
        name: { [defaultLang]: 'New Subsection' },
        description: { [defaultLang]: '' },
        order: menu.sections[0]?.subSections?.length || 0,
        is_active: true,
        icon: 'Utensils',
      };

      const response = await createSection(sectionData);

      if (response.success && response.data && response.data.section) {
        // Backend returns section data in response.data.section
        const sectionData = response.data.section;
        const defaultLang = menu.default_language || menu.available_languages?.[0] || 'en';
        
        const newSubsection = {
          id: sectionData.id,
          name: typeof sectionData.name === 'object'
            ? sectionData.name[defaultLang] || Object.values(sectionData.name || {})[0] || 'New Subsection'
            : sectionData.name || 'New Subsection',
          description: typeof sectionData.description === 'object'
            ? sectionData.description[defaultLang] || ''
            : sectionData.description || '',
          items: [],
          icon: 'Utensils',
          _backendId: sectionData.id,
        };

        const updatedMenu = {
          ...menu,
          sections: menu.sections.map((section) =>
            section.id === sectionId
              ? { ...section, subSections: [...(section.subSections || []), newSubsection] }
              : section
          ),
        };

        setMenu(updatedMenu);

        // Navigate to the section in the preview
        setPreviewCurrentView('section');
        setPreviewSelectedSectionId(sectionId);
        setPreviewActiveSubSectionId(newSubsection.id);

        showToast('Subsection created successfully', 'success');
      } else {
        showToast(typeof response.error === 'string' ? response.error : response.error?.message || 'Failed to create subsection', 'error');
      }
    } catch (error) {
      console.error('Error adding subsection:', error);
      showToast(`Error: ${error.message || 'An error occurred while adding the subsection'}`, 'error');
    }
  };

  // Add new item (backend integration)
  const addItem = async (sectionId, subsectionId) => {
    if (!menu) return;

    try {
      const itemData = {
        section: sectionId, // Use the real backend section ID, not the frontend subsection ID
        name: { [menu.default_language || 'pt']: 'New Item' },
        description: { [menu.default_language || 'pt']: 'Item description' },
        price: 0,
        currency: 'EUR',
        is_available: true,
        is_active: true,
        allergens: [],
        order: 0,
      };

      const response = await createItem(itemData);

      if (response.success && response.data && response.data.item) {
        // Backend returns item data in response.data.item
        const itemData = response.data.item;
        
        const newItem = {
          id: itemData.id,
          name: typeof itemData.name === 'object' 
            ? itemData.name[menu.default_language || 'pt'] || Object.values(itemData.name || {})[0] || 'New Item'
            : itemData.name || 'New Item',
          description: typeof itemData.description === 'object'
            ? itemData.description?.[menu.default_language || 'pt'] || ''
            : itemData.description || 'Item description',
          price: itemData.price || 0,
          image: itemData.image || '',
          tags: [],
          allergens: itemData.allergens || [],
          sortOrder: itemData.order || 0,
          _backendId: itemData.id,
        };

        const updatedMenu = {
          ...menu,
          sections: menu.sections.map((section) =>
            section.id === sectionId
              ? {
                  ...section,
                  subSections: section.subSections.map((subsection) =>
                    subsection.id === subsectionId
                      ? { ...subsection, items: [...subsection.items, newItem] }
                      : subsection
                  ),
                }
              : section
          ),
        };

        setMenu(updatedMenu);

        showToast('Item created successfully', 'success');
      } else {
        showToast(typeof response.error === 'string' ? response.error : response.error?.message || 'Failed to create item', 'error');
      }
    } catch (error) {
      console.error('Error adding item:', error);
      showToast('An error occurred while adding the item', 'error');
    }
  };

  // Update item (backend integration with debouncing)
  const updateItem = async (sectionId, subsectionId, itemId, field, value) => {
    if (!menu) return;

    // Update local state immediately for responsiveness
    const updatedMenu = {
      ...menu,
      sections: menu.sections.map((section) =>
        section.id === sectionId
          ? {
              ...section,
              subSections: section.subSections.map((subsection) =>
                subsection.id === subsectionId
                  ? {
                      ...subsection,
                      items: subsection.items.map((item) =>
                        item.id === itemId ? { ...item, [field]: value } : item
                      ),
                    }
                  : subsection
              ),
            }
          : section
      ),
    };
    setMenu(updatedMenu);

    // Debounce backend update (will be handled by auto-save)
    markDirty();
  };

  // Delete item (backend integration)
  const deleteItemFunc = async (sectionId, subsectionId, itemId) => {
    if (!menu) return;

    try {
      const response = await deleteItem(itemId);

      if (response.success) {
        const updatedMenu = {
          ...menu,
          sections: menu.sections.map((section) =>
            section.id === sectionId
              ? {
                  ...section,
                  subSections: section.subSections.map((subsection) =>
                    subsection.id === subsectionId
                      ? { ...subsection, items: subsection.items.filter((item) => item.id !== itemId) }
                      : subsection
                  ),
                }
              : section
          ),
        };
        setMenu(updatedMenu);
        showToast('Item deleted successfully', 'success');
      } else {
        showToast(typeof response.error === 'string' ? response.error : response.error?.message || 'Failed to delete item', 'error');
      }
    } catch (error) {
      console.error('Error deleting item:', error);
      showToast('An error occurred while deleting the item', 'error');
    }
  };

  // Update subsection icon
  const updateSubsectionIcon = (sectionId, subsectionId, iconName) => {
    if (!menu) return;
    const updatedMenu = {
      ...menu,
      sections: menu.sections.map((section) =>
        section.id === sectionId
          ? {
              ...section,
              subSections: section.subSections.map((subsection) =>
                subsection.id === subsectionId ? { ...subsection, icon: iconName } : subsection
              ),
            }
          : section
      ),
    };
    setMenu(updatedMenu);
    markDirty();
    setShowIconPicker(null);
  };

  // Update menu icon
  const updateMenuIcon = async (iconName) => {
    if (!menu) return;
    
    // Update local state immediately
    setMenu({ ...menu, icon: iconName });
    setShowMenuIconPicker(false);
    
    // Save to backend immediately
    try {
      const response = await updateMenuAPI(id, { icon: iconName });
      if (response.success) {
        console.log('Menu icon saved successfully');
      } else {
        showToast('Failed to save icon', 'error');
      }
    } catch (error) {
      console.error('Error saving menu icon:', error);
      showToast('Failed to save icon', 'error');
    }
  };

  // Handle image upload
  const handleImageUpload = async (sectionId, subsectionId, itemId) => {
    // Find the item to get its backend ID
    const item = menu.sections
      .find(s => s.id === sectionId)
      ?.subSections.find(ss => ss.id === subsectionId)
      ?.items.find(i => i.id === itemId);
    
    if (!item || !item._backendId) {
      showToast('Item not found or not saved to backend yet', 'error');
      return;
    }
    
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'image/*';
    input.onchange = async (e) => {
      const file = e.target.files?.[0];
      if (file) {
        try {
          // Show preview immediately
          const reader = new FileReader();
          reader.onload = (e) => {
            const imageUrl = e.target?.result;
            // Update local state immediately for preview
            updateItem(sectionId, subsectionId, itemId, 'image', imageUrl);
          };
          reader.readAsDataURL(file);
          
          // Upload to backend using PATCH with FormData
          showToast('Uploading image...', 'info');
          
          const formData = new FormData();
          formData.append('image', file);
          
          const response = await apiFetch(`/menu-items/${item._backendId}/`, {
            method: 'PATCH',
            body: formData,
            requiresInstance: true,
          });
          
          if (response && response.success && response.data) {
            // Update with the backend URL
            const backendImageUrl = response.data.image;
            if (backendImageUrl) {
              updateItem(sectionId, subsectionId, itemId, 'image', backendImageUrl);
            }
            showToast('Image uploaded successfully', 'success');
          } else {
            console.error('Image upload failed:', response);
            showToast('Failed to upload image: ' + (response?.error?.message || 'Unknown error'), 'error');
          }
        } catch (error) {
          console.error('Error uploading image:', error);
          showToast('Failed to upload image', 'error');
        }
      }
    };
    input.click();
  };

  // Add tag to item
  const addTagToItem = async (sectionId, subsectionId, itemId, tagId) => {
    if (!menu) return;
    
    // Find the item to get its current data
    const item = menu.sections
      .find(s => s.id === sectionId)
      ?.subSections.find(ss => ss.id === subsectionId)
      ?.items.find(i => i.id === itemId);
    
    if (!item) return;
    
    const updatedTags = [...(item.tags || []), tagId].filter(
      (tag, index, arr) => arr.indexOf(tag) === index
    );
    
    // Update local state immediately
    setMenu((prevMenu) => ({
      ...prevMenu,
      sections: prevMenu.sections.map((section) =>
        section.id === sectionId
          ? {
              ...section,
              subSections: section.subSections.map((subsection) =>
                subsection.id === subsectionId
                  ? {
                      ...subsection,
                      items: subsection.items.map((item) =>
                        item.id === itemId
                          ? { ...item, tags: updatedTags }
                          : item
                      ),
                    }
                  : subsection
              ),
            }
          : section
      ),
    }));
    
    // Save to backend - save both tags array and boolean fields
    try {
      if (item._backendId) {
        // Map frontend tags to backend fields (both array and booleans for compatibility)
        const backendUpdate = {
          tags: updatedTags,  // New tags JSONField (requires migration)
          is_vegetarian: updatedTags.includes('vegetarian'),
          is_vegan: updatedTags.includes('vegan'),
          is_gluten_free: updatedTags.includes('gluten-free'),
          is_spicy: updatedTags.includes('spicy'),
        };
        
        console.log('Saving tags to backend:', item._backendId, backendUpdate);
        const response = await updateItemAPI(item._backendId, backendUpdate);
        console.log('Backend response received:', response);
        
        if (!response) {
          console.error('updateItem returned undefined - check if function is imported correctly');
          showToast('Failed to save tag: No response from server', 'error');
        } else if (!response.success) {
          console.error('Backend error:', response.error);
          showToast('Failed to save tag: ' + (response.error?.message || 'Unknown error'), 'error');
        } else {
          console.log('Tags saved successfully');
        }
      } else {
        console.warn('No backend ID for item:', item);
      }
    } catch (error) {
      console.error('Error saving tags to backend:', error);
      showToast('Failed to save tag: ' + error.message, 'error');
    }
    
    markDirty();
  };

  // Remove tag from item
  const removeTagFromItem = async (sectionId, subsectionId, itemId, tagId) => {
    if (!menu) return;
    
    // Find the item to get its current data
    const item = menu.sections
      .find(s => s.id === sectionId)
      ?.subSections.find(ss => ss.id === subsectionId)
      ?.items.find(i => i.id === itemId);
    
    if (!item) return;
    
    const updatedTags = (item.tags || []).filter((tag) => tag !== tagId);
    
    // Update local state immediately
    setMenu((prevMenu) => ({
      ...prevMenu,
      sections: prevMenu.sections.map((section) =>
        section.id === sectionId
          ? {
              ...section,
              subSections: section.subSections.map((subsection) =>
                subsection.id === subsectionId
                  ? {
                      ...subsection,
                      items: subsection.items.map((item) =>
                        item.id === itemId
                          ? { ...item, tags: updatedTags }
                          : item
                      ),
                    }
                  : subsection
              ),
            }
          : section
      ),
    }));
    
    // Save to backend - save both tags array and boolean fields
    try {
      if (item._backendId) {
        // Map frontend tags to backend fields (both array and booleans for compatibility)
        const backendUpdate = {
          tags: updatedTags,  // New tags JSONField
          is_vegetarian: updatedTags.includes('vegetarian'),
          is_vegan: updatedTags.includes('vegan'),
          is_gluten_free: updatedTags.includes('gluten-free'),
          is_spicy: updatedTags.includes('spicy'),
        };
        
        const response = await updateItemAPI(item._backendId, backendUpdate);
        
        if (response && !response.success) {
          showToast('Failed to remove tag: ' + (response.error?.message || 'Unknown error'), 'error');
        }
      }
    } catch (error) {
      console.error('Error saving tags to backend:', error);
      showToast('Failed to remove tag', 'error');
    }
    
    markDirty();
  };

  // Add allergen to item
  const addAllergenToItem = async (sectionId, subsectionId, itemId, allergenId) => {
    if (!menu) return;
    
    // Find the item to get its current data
    const item = menu.sections
      .find(s => s.id === sectionId)
      ?.subSections.find(ss => ss.id === subsectionId)
      ?.items.find(i => i.id === itemId);
    
    if (!item) return;
    
    const updatedAllergens = [...(item.allergens || []), allergenId].filter(
      (allergen, index, arr) => arr.indexOf(allergen) === index
    );
    
    // Update local state immediately
    setMenu((prevMenu) => ({
      ...prevMenu,
      sections: prevMenu.sections.map((section) =>
        section.id === sectionId
          ? {
              ...section,
              subSections: section.subSections.map((subsection) =>
                subsection.id === subsectionId
                  ? {
                      ...subsection,
                      items: subsection.items.map((item) =>
                        item.id === itemId
                          ? { ...item, allergens: updatedAllergens }
                          : item
                      ),
                    }
                  : subsection
              ),
            }
          : section
      ),
    }));
    
    // Save to backend
    try {
      if (item._backendId) {
        await updateItemAPI(item._backendId, { allergens: updatedAllergens });
      }
    } catch (error) {
      console.error('Error saving allergens to backend:', error);
      showToast('Failed to save allergen', 'error');
    }
    
    markDirty();
  };

  // Translation functions
  const updateTranslation = (lang, path, value) => {
    if (!menu) return;
    const updatedMenu = {
      ...menu,
      translations: {
        ...menu.translations,
        [lang]: {
          ...menu.translations[lang],
          [path]: value,
        },
      },
    };
    setMenu(updatedMenu);
    markDirty();
  };

  const addLanguage = (langCode) => {
    if (!menu) return;
    if (menu.languages?.includes(langCode)) return;
    const updatedMenu = {
      ...menu,
      languages: [...(menu.languages || []), langCode],
      translations: {
        ...menu.translations,
        [langCode]: {},
      },
    };
    setMenu(updatedMenu);
    markDirty();
  };

  const removeLanguage = (langCode) => {
    if (!menu) return;
    if (langCode === 'pt') return; // Don't remove Portuguese (default)
    const updatedMenu = {
      ...menu,
      languages: (menu.languages || []).filter((l) => l !== langCode),
      translations: Object.fromEntries(
        Object.entries(menu.translations || {}).filter(([key]) => key !== langCode)
      ),
    };
    setMenu(updatedMenu);
    markDirty();
    if (activeLang === langCode) {
      setActiveLang('pt');
    }
  };

  // Remove allergen from item
  const removeAllergenFromItem = async (sectionId, subsectionId, itemId, allergenId) => {
    if (!menu) return;
    
    // Find the item to get its current data
    const item = menu.sections
      .find(s => s.id === sectionId)
      ?.subSections.find(ss => ss.id === subsectionId)
      ?.items.find(i => i.id === itemId);
    
    if (!item) return;
    
    const updatedAllergens = (item.allergens || []).filter(
      (allergen) => allergen !== allergenId
    );
    
    // Update local state immediately
    setMenu((prevMenu) => ({
      ...prevMenu,
      sections: prevMenu.sections.map((section) =>
        section.id === sectionId
          ? {
              ...section,
              subSections: section.subSections.map((subsection) =>
                subsection.id === subsectionId
                  ? {
                      ...subsection,
                      items: subsection.items.map((item) =>
                        item.id === itemId
                          ? { ...item, allergens: updatedAllergens }
                          : item
                      ),
                    }
                  : subsection
              ),
            }
          : section
      ),
    }));
    
    // Save to backend
    try {
      if (item._backendId) {
        await updateItemAPI(item._backendId, { allergens: updatedAllergens });
      }
    } catch (error) {
      console.error('Error saving allergens to backend:', error);
      showToast('Failed to remove allergen', 'error');
    }
    
    markDirty();
  };

  // Drag and drop handler
  const handleDragEnd = (result) => {
    if (!result.destination || !menu) return;

    const { source, destination, type } = result;

    if (type === 'section') {
      // Reorder sections
      const sections = [...menu.sections];
      const [reorderedSection] = sections.splice(source.index, 1);
      sections.splice(destination.index, 0, reorderedSection);

      // Update sort orders
      sections.forEach((section, index) => {
        section.sortOrder = index;
      });

      const updatedMenu = { ...menu, sections };
      setMenu(updatedMenu);
      
      // Save new order to backend
      sections.forEach(async (section, index) => {
        if (section._backendId) {
          await updateSection(section._backendId, { order: index });
        }
      });
      
      markDirty();
    } else if (type === 'item') {
      // Find the section and subsection (using ||| separator to avoid UUID hyphen conflicts)
      const [sectionId, subsectionId] = source.droppableId.split('|||');

      const sectionIndex = menu.sections.findIndex((s) => s && s.id && String(s.id) === sectionId);
      
      // Check if section was found
      if (sectionIndex === -1 || !menu.sections[sectionIndex]) {
        console.error('Section not found:', sectionId);
        return;
      }
      
      const subsectionIndex = menu.sections[sectionIndex]?.subSections?.findIndex(
        (sub) => sub && sub.id && String(sub.id) === subsectionId
      );
      
      // Check if subsection was found
      if (subsectionIndex === -1 || !menu.sections[sectionIndex].subSections?.[subsectionIndex]) {
        console.error('Subsection not found:', subsectionId);
        return;
      }

      const items = [...menu.sections[sectionIndex].subSections[subsectionIndex].items];
      const [reorderedItem] = items.splice(source.index, 1);
      items.splice(destination.index, 0, reorderedItem);

      // Update sort orders
      items.forEach((item, index) => {
        item.sortOrder = index;
      });

      const updatedMenu = { ...menu };
      updatedMenu.sections[sectionIndex].subSections[subsectionIndex].items = items;
      setMenu(updatedMenu);
      
      // Save new order to backend
      items.forEach(async (item, index) => {
        if (item._backendId) {
          await updateItemAPI(item._backendId, { order: index });
        }
      });
      
      markDirty();
    }
  };

  if (loading || !menu) {
    return (
      <DashboardLayout title="Loading...">
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600"></div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout
      title={`Edit Menu: ${menu.name}`}
      subtitle="Configure your menu content, design, and settings"
      action={
        <Button
          variant="outline"
          onClick={() => navigate('/dashboard/menus')}
          size="sm"
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Menus
        </Button>
      }
    >
      <div className="max-w-7xl mx-auto space-y-6 p-6">

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Left Side - Editor */}
          <div className="space-y-6">
            <Tabs defaultValue="content" className="space-y-6">
              <TabsList className="grid w-full grid-cols-3 h-12">
                <TabsTrigger value="content" className="text-sm md:text-base">
                  Content
                </TabsTrigger>
                <TabsTrigger value="design" className="text-sm md:text-base">
                  Design
                </TabsTrigger>
                <TabsTrigger value="translations" className="text-sm md:text-base">
                  Translations
                </TabsTrigger>
              </TabsList>

              {/* CONTENT TAB */}
              <TabsContent value="content" className="space-y-6">
                {/* Menu Info */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center text-purple-900">
                      <Type className="mr-2 h-5 w-5" />
                      Menu Information
                    </CardTitle>
                    <CardDescription>Configure the name, description and icon for your menu</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-2">
                      <Label>Menu Name</Label>
                      <Input
                        value={menu.name}
                        onChange={(e) => {
                          setMenu({ ...menu, name: e.target.value });
                          markDirty();
                        }}
                        className="border-purple-200 focus:border-purple-500"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Description</Label>
                      <Textarea
                        value={menu.description || ''}
                        onChange={(e) => {
                          setMenu({ ...menu, description: e.target.value });
                          markDirty();
                        }}
                        className="border-purple-200 focus:border-purple-500"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Menu Icon</Label>
                      <div className="flex items-center gap-3">
                        <Popover open={showMenuIconPicker} onOpenChange={setShowMenuIconPicker}>
                          <PopoverTrigger asChild>
                            <Button
                              variant="outline"
                              className="h-12 w-12 p-0 border-dashed border-purple-300 hover:border-purple-500 bg-transparent"
                            >
                              {React.createElement(
                                availableIcons.find((i) => i.name === menu.icon)?.icon || Utensils,
                                { className: 'h-6 w-6 text-purple-600' }
                              )}
                            </Button>
                          </PopoverTrigger>
                          <PopoverContent className="w-80 max-h-96 overflow-y-auto" side="right" align="start">
                            <div className="space-y-3">
                              <h4 className="font-medium">Choose Menu Icon</h4>
                              <div className="grid grid-cols-6 gap-2">
                                {availableIcons.map((iconData) => {
                                  const IconComponent = iconData.icon;
                                  const isSelected = menu.icon === iconData.name;
                                  return (
                                    <Button
                                      key={iconData.name}
                                      variant={isSelected ? 'default' : 'ghost'}
                                      size="sm"
                                      className={`h-10 w-10 p-0 ${
                                        isSelected ? 'bg-purple-600 text-white' : ''
                                      }`}
                                      onClick={() => updateMenuIcon(iconData.name)}
                                      title={iconData.name}
                                    >
                                      <IconComponent className="h-4 w-4" />
                                    </Button>
                                  );
                                })}
                              </div>
                            </div>
                          </PopoverContent>
                        </Popover>
                        <div>
                          <p className="text-sm font-medium">Current icon</p>
                          <p className="text-xs text-gray-500">Click to change the menu icon</p>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Sections */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center justify-between text-purple-900">
                      <div className="flex items-center">
                        <Utensils className="mr-2 h-5 w-5" />
                        Menu Sections
                      </div>
                      <Button onClick={addSection} size="sm" className="bg-purple-600 hover:bg-purple-700">
                        <Plus className="mr-2 h-4 w-4" />
                        Add Section
                      </Button>
                    </CardTitle>
                    <CardDescription>Organize your menu in sections and subsections</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <DragDropContext onDragEnd={handleDragEnd}>
                      <Droppable droppableId="sections" type="section">
                        {(provided) => (
                          <div {...provided.droppableProps} ref={provided.innerRef} className="space-y-2">
                            <Accordion type="multiple" className="w-full">
                            {(menu.sections || [])
                              .filter((section) => section && section.id)
                              .sort((a, b) => (a.sortOrder || 0) - (b.sortOrder || 0))
                              .map((section, sectionIndex) => {
                                const totalItems = (section.subSections || []).reduce((sum, sub) => sum + (sub.items?.length || 0), 0);
                                const subsectionCount = (section.subSections || []).length;
                                
                                return (
                              <Draggable key={section.id} draggableId={String(section.id)} index={sectionIndex}>
                                {(provided, snapshot) => (
                                  <AccordionItem
                                    value={`section-${section.id}`}
                                    ref={provided.innerRef}
                                    {...provided.draggableProps}
                                    className={`border border-purple-200 rounded-lg bg-white ${
                                      snapshot.isDragging ? 'shadow-lg' : ''
                                    }`}
                                  >
                        {/* Compact Section Header with Accordion */}
                        <AccordionTrigger className="px-4 hover:no-underline hover:bg-purple-50">
                          <div className="flex items-center gap-3 w-full" onClick={(e) => e.stopPropagation()}>
                            <div {...provided.dragHandleProps} className="cursor-move">
                              <GripVertical className="h-5 w-5 text-gray-400" />
                            </div>
                            <Input
                              value={section.name}
                              onChange={async (e) => {
                                e.stopPropagation();
                                const newName = e.target.value;

                                // Update local state immediately
                                const updatedMenu = {
                                  ...menu,
                                  sections: menu.sections.map((s, i) =>
                                    i === sectionIndex ? { ...s, name: newName } : s
                                  ),
                                };
                                setMenu(updatedMenu);

                                // Update backend immediately
                                (async () => {
                                  try {
                                    const defaultLang = menu.default_language || menu.available_languages?.[0] || 'en';
                                    await updateSection(section.id, {
                                      name: { [defaultLang]: newName }
                                    });
                                  } catch (error) {
                                    console.error('Error updating section name:', error);
                                  }
                                })();
                              }}
                              onClick={(e) => e.stopPropagation()}
                              className="text-base font-semibold border-0 bg-transparent focus:bg-white focus:border-purple-300"
                            />
                            <div className="flex items-center gap-2 ml-auto">
                              <Badge variant="secondary" className="bg-purple-100 text-purple-700">
                                {subsectionCount} subsection{subsectionCount !== 1 ? 's' : ''}
                              </Badge>
                              <Badge variant="secondary" className="bg-green-100 text-green-700">
                                {totalItems} item{totalItems !== 1 ? 's' : ''}
                              </Badge>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={async (e) => {
                                  e.stopPropagation();
                                  const sectionToDelete = menu.sections[sectionIndex];
                                  if (!sectionToDelete || !sectionToDelete.id) return;

                                  try {
                                    const response = await deleteSection(sectionToDelete.id);
                                    if (response.success) {
                                      const updatedMenu = {
                                        ...menu,
                                        sections: menu.sections.filter((_, i) => i !== sectionIndex),
                                      };
                                      setMenu(updatedMenu);
                                      showToast('Section deleted successfully', 'success');
                                    } else {
                                      showToast(typeof response.error === 'string' ? response.error : response.error?.message || 'Failed to delete section', 'error');
                                    }
                                  } catch (error) {
                                    console.error('Error deleting section:', error);
                                    showToast('An error occurred while deleting the section', 'error');
                                  }
                                }}
                                className="text-red-600 hover:text-red-700 hover:bg-red-50"
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </div>
                          </div>
                        </AccordionTrigger>
                        
                        <AccordionContent className="px-4 pb-4">

                        {/* Add Subsection Button */}
                        <div className="flex justify-end mb-3">
                          <Button
                            onClick={() => addSubsection(section.id)}
                            size="sm"
                            className="bg-purple-600 hover:bg-purple-700"
                          >
                            <Plus className="mr-1 h-3 w-3" />
                            Add Subsection
                          </Button>
                        </div>

                        {/* Subsections and Items */}
                        <Accordion type="multiple" className="space-y-2">
                          {(section.subSections || []).map((subsection, subsectionIndex) => {
                            const itemCount = (subsection.items || []).length;
                            
                            return (
                            <AccordionItem key={subsection.id} value={`subsection-${subsection.id}`} className="border border-gray-200 rounded-lg bg-gray-50">
                              {/* Subsection Header as Accordion Trigger */}
                              <AccordionTrigger className="px-3 py-2 hover:no-underline hover:bg-gray-100">
                              <div className="flex items-center gap-2 w-full" onClick={(e) => e.stopPropagation()}>
                                {/* Icon Picker */}
                                <Popover
                                  open={showIconPicker === `${section.id}-${subsection.id}`}
                                  onOpenChange={(open) =>
                                    setShowIconPicker(open ? `${section.id}-${subsection.id}` : null)
                                  }
                                >
                                  <PopoverTrigger asChild>
                                    <Button
                                      variant="outline"
                                      size="sm"
                                      className="p-2 h-8 w-8 border-dashed border-gray-400 hover:border-gray-600 hover:bg-gray-50 bg-transparent"
                                      title="Click to change icon"
                                    >
                                      {(() => {
                                        const iconData = availableIcons.find((i) => i.name === subsection.icon);
                                        const IconComponent = iconData?.icon || Utensils;
                                        return <IconComponent className="h-4 w-4 text-gray-600" />;
                                      })()}
                                    </Button>
                                  </PopoverTrigger>
                                  <PopoverContent className="w-80 max-h-96 overflow-y-auto" side="right" align="start">
                                    <div className="space-y-3">
                                      <h4 className="font-medium">Choose Subsection Icon</h4>
                                      <div className="grid grid-cols-6 gap-2">
                                        {availableIcons.map((iconData) => {
                                          const IconComponent = iconData.icon;
                                          const isSelected = subsection.icon === iconData.name;
                                          return (
                                            <Button
                                              key={iconData.name}
                                              variant={isSelected ? "default" : "ghost"}
                                              size="sm"
                                              className={`h-10 w-10 p-0 ${
                                                isSelected ? "bg-purple-600 text-white" : ""
                                              }`}
                                              onClick={() =>
                                                updateSubsectionIcon(section.id, subsection.id, iconData.name)
                                              }
                                              title={iconData.name}
                                            >
                                              <IconComponent className="h-4 w-4" />
                                            </Button>
                                          );
                                        })}
                                      </div>
                                    </div>
                                  </PopoverContent>
                                </Popover>

                                {/* Subsection Name Input */}
                                <Input
                                  value={subsection.name}
                                  onChange={(e) => {
                                    e.stopPropagation();
                                    const updatedMenu = {
                                      ...menu,
                                      sections: menu.sections.map((s) =>
                                        s.id === section.id
                                          ? {
                                              ...s,
                                              subSections: s.subSections.map((sub) =>
                                                sub.id === subsection.id ? { ...sub, name: e.target.value } : sub
                                              ),
                                            }
                                          : s
                                      ),
                                    };
                                    setMenu(updatedMenu);
                                    markDirty();
                                  }}
                                  onClick={(e) => e.stopPropagation()}
                                  placeholder="Subsection name"
                                  className="flex-1 font-medium text-sm border-0 bg-transparent focus:bg-white focus:border-gray-300"
                                />

                                {/* Item Count Badge */}
                                <Badge variant="secondary" className="bg-blue-100 text-blue-700 text-xs">
                                  {itemCount} item{itemCount !== 1 ? 's' : ''}
                                </Badge>

                                {/* Delete Subsection Button */}
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={async (e) => {
                                    e.stopPropagation();
                                    try {
                                      // Delete from backend if it has a backend ID
                                      if (subsection._backendId) {
                                        const response = await deleteSection(subsection._backendId);
                                        if (!response.success) {
                                          showToast('Failed to delete subsection', 'error');
                                          return;
                                        }
                                      }

                                      // Update local state
                                      const updatedMenu = {
                                        ...menu,
                                        sections: menu.sections.map((s) =>
                                          s.id === section.id
                                            ? {
                                                ...s,
                                                subSections: s.subSections.filter((sub) => sub.id !== subsection.id),
                                              }
                                            : s
                                        ),
                                      };
                                      setMenu(updatedMenu);
                                      showToast('Subsection deleted successfully', 'success');
                                    } catch (error) {
                                      console.error('Error deleting subsection:', error);
                                      showToast('An error occurred while deleting the subsection', 'error');
                                    }
                                  }}
                                  className="text-red-600 hover:text-red-700 hover:bg-red-50"
                                >
                                  <Trash2 className="h-4 w-4" />
                                </Button>
                              </div>
                              </AccordionTrigger>
                              
                              <AccordionContent className="px-3 pb-3 pt-0">
                              {/* Add Item Button */}
                              <div className="flex justify-end mb-2">
                                <Button
                                  onClick={() => addItem(section.id, subsection.id)}
                                  size="sm"
                                  className="bg-green-600 hover:bg-green-700"
                                >
                                  <Plus className="mr-1 h-3 w-3" />
                                  Add Item
                                </Button>
                              </div>

                              {/* Items */}
                              <DragDropContext onDragEnd={handleDragEnd}>
                                <Droppable droppableId={`${section.id}|||${subsection.id}`} type="item">
                                  {(provided) => (
                                    <div {...provided.droppableProps} ref={provided.innerRef} className="space-y-2">
                                      {(subsection.items || [])
                                        .filter((item) => item && item.id)
                                        .sort((a, b) => (a.sortOrder || 0) - (b.sortOrder || 0))
                                        .map((item, itemIndex) => (
                                          <Draggable key={item.id} draggableId={String(item.id)} index={itemIndex}>
                                            {(provided, snapshot) => (
                                              <div
                                                ref={provided.innerRef}
                                                {...provided.draggableProps}
                                                className={`bg-white rounded-lg p-3 border ${
                                                  snapshot.isDragging
                                                    ? 'shadow-lg border-purple-300'
                                                    : 'border-gray-200'
                                                }`}
                                              >
                                                <div className="flex items-start gap-3">
                                                  <div {...provided.dragHandleProps} className="mt-1">
                                                    <GripVertical className="h-4 w-4 text-gray-400" />
                                                  </div>

                                                  {/* Item Image */}
                                                  <div className="w-16 h-16 rounded-lg overflow-hidden bg-gray-100 flex-shrink-0">
                                                    {item.image ? (
                                                      <img
                                                        src={item.image}
                                                        alt={item.name}
                                                        className="w-full h-full object-cover cursor-pointer"
                                                        onClick={() =>
                                                          handleImageUpload(section.id, subsection.id, item.id)
                                                        }
                                                      />
                                                    ) : (
                                                      <Button
                                                        variant="ghost"
                                                        onClick={() =>
                                                          handleImageUpload(section.id, subsection.id, item.id)
                                                        }
                                                        className="w-full h-full border-2 border-dashed border-gray-300 hover:border-gray-400"
                                                      >
                                                        <Upload className="h-4 w-4 text-gray-400" />
                                                      </Button>
                                                    )}
                                                  </div>

                                                  {/* Item Details */}
                                                  <div className="flex-1 space-y-2">
                                                    <div className="flex items-center gap-2">
                                                      <Input
                                                        value={item.name}
                                                        onChange={(e) =>
                                                          updateItem(
                                                            section.id,
                                                            subsection.id,
                                                            item.id,
                                                            'name',
                                                            e.target.value
                                                          )
                                                        }
                                                        className="font-medium border-0 bg-transparent focus:bg-gray-50 focus:border-purple-300"
                                                      />
                                                      <div className="flex items-center gap-1">
                                                        <span className="text-sm text-gray-500">$</span>
                                                        <Input
                                                          type="number"
                                                          step="0.01"
                                                          min="0"
                                                          value={item.price === 0 ? '' : item.price}
                                                          placeholder="0.00"
                                                          onChange={(e) =>
                                                            updateItem(
                                                              section.id,
                                                              subsection.id,
                                                              item.id,
                                                              'price',
                                                              e.target.value === '' ? 0 : parseFloat(e.target.value)
                                                            )
                                                          }
                                                          onFocus={(e) => e.target.select()}
                                                          className="w-20 text-sm border-0 bg-transparent focus:bg-gray-50 focus:border-purple-300"
                                                        />
                                                      </div>
                                                    </div>

                                                    <Textarea
                                                      value={item.description || ''}
                                                      onChange={(e) =>
                                                        updateItem(
                                                          section.id,
                                                          subsection.id,
                                                          item.id,
                                                          'description',
                                                          e.target.value
                                                        )
                                                      }
                                                      placeholder="Item description..."
                                                      className="text-sm resize-none border-0 bg-transparent focus:bg-gray-50 focus:border-purple-300"
                                                      rows={2}
                                                    />

                                                    {/* Tags Section */}
                                                    <div className="space-y-2">
                                                      <Label className="text-xs font-medium text-gray-700">Tags</Label>
                                                      <div className="flex flex-wrap gap-1">
                                                        {(item.tags || []).map((tagId) => {
                                                          const tag = availableTags.find((t) => t.id === tagId);
                                                          if (!tag) return null;
                                                          const IconComponent = tag.icon;
                                                          return (
                                                            <Badge
                                                              key={tagId}
                                                              variant="secondary"
                                                              className={`flex items-center gap-1 ${tag.color} border-0 text-xs px-2 py-1`}
                                                            >
                                                              <IconComponent className="h-3 w-3" />
                                                              <span>{tag.name}</span>
                                                              <Button
                                                                variant="ghost"
                                                                size="sm"
                                                                onClick={() =>
                                                                  removeTagFromItem(
                                                                    section.id,
                                                                    subsection.id,
                                                                    item.id,
                                                                    tagId
                                                                  )
                                                                }
                                                                className="h-3 w-3 p-0 ml-1 hover:bg-red-200"
                                                              >
                                                                <X className="h-2 w-2" />
                                                              </Button>
                                                            </Badge>
                                                          );
                                                        })}
                                                        <Popover>
                                                          <PopoverTrigger asChild>
                                                            <Button
                                                              variant="outline"
                                                              size="sm"
                                                              className="h-6 px-2 text-xs border-dashed bg-transparent"
                                                            >
                                                              <Plus className="h-3 w-3 mr-1" />
                                                              Tag
                                                            </Button>
                                                          </PopoverTrigger>
                                                          <PopoverContent className="w-80">
                                                            <div className="space-y-3">
                                                              <h4 className="font-medium">Add Tag</h4>
                                                              <div className="space-y-2">
                                                                {['Dietary', 'Taste', 'Special'].map((category) => (
                                                                  <div key={category}>
                                                                    <h5 className="text-sm font-medium text-gray-600 mb-1">
                                                                      {category}
                                                                    </h5>
                                                                    <div className="flex flex-wrap gap-1">
                                                                      {availableTags
                                                                        .filter((tag) => tag.category === category)
                                                                        .filter(
                                                                          (tag) => !(item.tags || []).includes(tag.id)
                                                                        )
                                                                        .map((tag) => {
                                                                          const IconComponent = tag.icon;
                                                                          return (
                                                                            <Button
                                                                              key={tag.id}
                                                                              variant="outline"
                                                                              size="sm"
                                                                              onClick={() =>
                                                                                addTagToItem(
                                                                                  section.id,
                                                                                  subsection.id,
                                                                                  item.id,
                                                                                  tag.id
                                                                                )
                                                                              }
                                                                              className="h-8 px-2 text-xs"
                                                                            >
                                                                              <IconComponent className="h-3 w-3 mr-1" />
                                                                              {tag.name}
                                                                            </Button>
                                                                          );
                                                                        })}
                                                                    </div>
                                                                  </div>
                                                                ))}
                                                              </div>
                                                            </div>
                                                          </PopoverContent>
                                                        </Popover>
                                                      </div>
                                                    </div>

                                                    {/* Allergens Section */}
                                                    <div className="space-y-2">
                                                      <Label className="text-xs font-medium text-gray-700">
                                                        Allergens
                                                      </Label>
                                                      <div className="flex flex-wrap gap-1">
                                                        {(item.allergens || []).map((allergenId) => {
                                                          const allergen = availableAllergens.find(
                                                            (a) => a.id === allergenId
                                                          );
                                                          if (!allergen) return null;
                                                          return (
                                                            <Badge
                                                              key={allergenId}
                                                              variant="outline"
                                                              className={`${allergen.color} border-0 text-xs px-2 py-1`}
                                                            >
                                                              {allergen.name}
                                                              <Button
                                                                variant="ghost"
                                                                size="sm"
                                                                onClick={() =>
                                                                  removeAllergenFromItem(
                                                                    section.id,
                                                                    subsection.id,
                                                                    item.id,
                                                                    allergenId
                                                                  )
                                                                }
                                                                className="h-3 w-3 p-0 ml-1 hover:bg-red-200"
                                                              >
                                                                <X className="h-2 w-2" />
                                                              </Button>
                                                            </Badge>
                                                          );
                                                        })}
                                                        <Popover>
                                                          <PopoverTrigger asChild>
                                                            <Button
                                                              variant="outline"
                                                              size="sm"
                                                              className="h-6 px-2 text-xs border-dashed bg-transparent"
                                                            >
                                                              <Plus className="h-3 w-3 mr-1" />
                                                              Allergen
                                                            </Button>
                                                          </PopoverTrigger>
                                                          <PopoverContent className="w-60">
                                                            <div className="space-y-3">
                                                              <h4 className="font-medium">Add Allergen</h4>
                                                              <div className="flex flex-wrap gap-1">
                                                                {availableAllergens
                                                                  .filter(
                                                                    (allergen) =>
                                                                      !(item.allergens || []).includes(allergen.id)
                                                                  )
                                                                  .map((allergen) => (
                                                                    <Button
                                                                      key={allergen.id}
                                                                      variant="outline"
                                                                      size="sm"
                                                                      onClick={() =>
                                                                        addAllergenToItem(
                                                                          section.id,
                                                                          subsection.id,
                                                                          item.id,
                                                                          allergen.id
                                                                        )
                                                                      }
                                                                      className="h-8 px-2 text-xs"
                                                                    >
                                                                      {allergen.name}
                                                                    </Button>
                                                                  ))}
                                                              </div>
                                                            </div>
                                                          </PopoverContent>
                                                        </Popover>
                                                      </div>
                                                    </div>
                                                  </div>

                                                  <Button
                                                    variant="ghost"
                                                    size="sm"
                                                    onClick={() => deleteItemFunc(section.id, subsection.id, item.id)}
                                                    className="text-red-600 hover:text-red-700 hover:bg-red-50"
                                                  >
                                                    <Trash2 className="h-4 w-4" />
                                                  </Button>
                                                </div>
                                              </div>
                                            )}
                                          </Draggable>
                                        ))}
                                      {provided.placeholder}
                                    </div>
                                  )}
                                </Droppable>
                              </DragDropContext>
                              </AccordionContent>
                            </AccordionItem>
                            );
                          })}
                        </Accordion>
                        
                        </AccordionContent>
                                  </AccordionItem>
                                )}
                              </Draggable>
                                );
                              })}
                            </Accordion>
                            {provided.placeholder}
                          </div>
                        )}
                      </Droppable>
                    </DragDropContext>
                  </CardContent>
                </Card>
              </TabsContent>

              {/* DESIGN TAB */}
              <TabsContent value="design" className="space-y-4">
                {/* Color Templates */}
                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="flex items-center text-purple-900 text-lg">
                      <Palette className="mr-2 h-4 w-4" />
                      Design Templates
                    </CardTitle>
                    <CardDescription>Choose a pre-designed color scheme for your menu</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      {designTemplates.map((template) => (
                        <button
                          key={template.name}
                          onClick={() => {
                            setDesignSettings({ ...designSettings, ...template.colors });
                            markDirty();
                          }}
                          className="flex items-start gap-3 p-3 border-2 rounded-lg hover:border-purple-400 transition-colors text-left group"
                        >
                          {/* Color preview circles */}
                          <div className="flex gap-1 pt-1">
                            {template.preview.map((color, idx) => (
                              <div
                                key={idx}
                                className="w-6 h-6 rounded-full border border-gray-200"
                                style={{ backgroundColor: color }}
                              />
                            ))}
                          </div>

                          {/* Template info */}
                          <div className="flex-1">
                            <h4 className="font-semibold text-sm text-gray-900 group-hover:text-purple-700">
                              {template.name}
                            </h4>
                            <p className="text-xs text-gray-500 mt-0.5">{template.description}</p>
                          </div>

                          {/* Check if active */}
                          {designSettings.backgroundColor === template.colors.backgroundColor &&
                            designSettings.tabActiveBackgroundColor === template.colors.tabActiveBackgroundColor && (
                              <div className="pt-1">
                                <div className="w-5 h-5 rounded-full bg-purple-600 flex items-center justify-center">
                                  <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                                  </svg>
                                </div>
                              </div>
                            )}
                        </button>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              {/* TRANSLATIONS TAB */}
              <TabsContent value="translations" className="space-y-6">
                {/* Language Management */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center text-purple-900">
                      <Languages className="mr-2 h-5 w-5" />
                      Manage Languages
                    </CardTitle>
                    <CardDescription>Add or remove languages for your menu</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {/* Active Languages */}
                      <div className="space-y-2">
                        <div className="text-sm font-medium">Active Languages</div>
                        <div className="flex flex-wrap gap-2">
                          {(menu?.languages || ['pt']).map((lang) => {
                            const langInfo = languageOptions.find((l) => l.code === lang);
                            if (!langInfo) return null;
                            return (
                              <div
                                key={lang}
                                className="flex items-center gap-2 px-3 py-1.5 bg-purple-50 border border-purple-200 rounded-lg"
                              >
                                <span>{langInfo.flag}</span>
                                <span className="text-sm font-medium">{langInfo.name}</span>
                                {lang !== 'pt' && (
                                  <button
                                    onClick={() => removeLanguage(lang)}
                                    className="ml-1 text-purple-600 hover:text-purple-800"
                                  >
                                    <X className="h-3 w-3" />
                                  </button>
                                )}
                              </div>
                            );
                          })}
                        </div>
                      </div>

                      {/* Add Language */}
                      <div className="space-y-2">
                        <div className="text-sm font-medium">Add Language</div>
                        <div className="flex flex-wrap gap-2">
                          {languageOptions
                            .filter((lang) => !(menu?.languages || ['pt']).includes(lang.code))
                            .map((lang) => (
                              <button
                                key={lang.code}
                                onClick={() => addLanguage(lang.code)}
                                className="flex items-center gap-2 px-3 py-1.5 bg-gray-50 border border-gray-200 rounded-lg hover:bg-gray-100 transition-colors"
                              >
                                <span>{lang.flag}</span>
                                <span className="text-sm font-medium">{lang.name}</span>
                                <Plus className="h-3 w-3 ml-1" />
                              </button>
                            ))}
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Translation Editor */}
                {(menu?.languages || ['pt']).length > 1 && (
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center text-purple-900">
                        <Languages className="mr-2 h-5 w-5" />
                        Translations
                      </CardTitle>
                      <CardDescription>Translate your menu content</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        {/* Language selector tabs */}
                        <div className="flex gap-2 border-b pb-2">
                          {(menu?.languages || ['pt']).map((lang) => {
                            const langInfo = languageOptions.find((l) => l.code === lang);
                            if (!langInfo) return null;
                            return (
                              <button
                                key={lang}
                                onClick={() => setActiveLang(lang)}
                                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${
                                  activeLang === lang
                                    ? 'bg-purple-600 text-white'
                                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                                }`}
                              >
                                <span>{langInfo.flag}</span>
                                <span>{langInfo.name}</span>
                              </button>
                            );
                          })}
                        </div>

                        {/* Show message if Portuguese is selected */}
                        {activeLang === 'pt' && (
                          <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                            <p className="text-sm text-blue-800">
                              Portuguese is the default language. Switch to another language to add translations.
                            </p>
                          </div>
                        )}

                        {/* Translation fields for non-Portuguese languages */}
                        {activeLang !== 'pt' && (
                          <div className="space-y-6">
                            {/* Menu Name */}
                            <div className="space-y-2">
                              <label className="text-sm font-medium">Menu Name</label>
                              <div className="grid grid-cols-2 gap-3">
                                <div>
                                  <div className="text-xs text-gray-500 mb-1">Portuguese (original)</div>
                                  <Input value={menu?.name || ''} disabled className="bg-gray-50" />
                                </div>
                                <div>
                                  <div className="text-xs text-gray-500 mb-1">
                                    {languageOptions.find((l) => l.code === activeLang)?.name}
                                  </div>
                                  <Input
                                    value={menu?.translations?.[activeLang]?.['menu.name'] || ''}
                                    onChange={(e) =>
                                      updateTranslation(activeLang, 'menu.name', e.target.value)
                                    }
                                    placeholder={menu?.name || ''}
                                  />
                                </div>
                              </div>
                            </div>

                            {/* Sections */}
                            {(menu?.sections || []).map((section, sectionIndex) => (
                              <div key={section.id} className="space-y-4 pt-4 border-t">
                                <div className="font-medium text-purple-900">
                                  Section {sectionIndex + 1}
                                </div>

                                {/* Section Name */}
                                <div className="space-y-2">
                                  <label className="text-sm font-medium">Section Name</label>
                                  <div className="grid grid-cols-2 gap-3">
                                    <Input value={section.name} disabled className="bg-gray-50" />
                                    <Input
                                      value={
                                        menu?.translations?.[activeLang]?.[
                                          `section.${section.id}.name`
                                        ] || ''
                                      }
                                      onChange={(e) =>
                                        updateTranslation(
                                          activeLang,
                                          `section.${section.id}.name`,
                                          e.target.value
                                        )
                                      }
                                      placeholder={section.name}
                                    />
                                  </div>
                                </div>

                                {/* Section Description */}
                                {section.description && (
                                  <div className="space-y-2">
                                    <label className="text-sm font-medium">Section Description</label>
                                    <div className="grid grid-cols-2 gap-3">
                                      <Textarea
                                        value={section.description}
                                        disabled
                                        className="bg-gray-50"
                                      />
                                      <Textarea
                                        value={
                                          menu?.translations?.[activeLang]?.[
                                            `section.${section.id}.description`
                                          ] || ''
                                        }
                                        onChange={(e) =>
                                          updateTranslation(
                                            activeLang,
                                            `section.${section.id}.description`,
                                            e.target.value
                                          )
                                        }
                                        placeholder={section.description}
                                      />
                                    </div>
                                  </div>
                                )}

                                {/* Subsections */}
                                {(section.subSections || []).map((subsection, subIndex) => (
                                  <div key={subsection.id} className="ml-4 space-y-4 pt-3 border-l-2 border-purple-200 pl-4">
                                    <div className="font-medium text-sm text-purple-800">
                                      Subsection {subIndex + 1}: {subsection.name}
                                    </div>

                                    {/* Subsection Name */}
                                    <div className="space-y-2">
                                      <label className="text-xs font-medium">Subsection Name</label>
                                      <div className="grid grid-cols-2 gap-3">
                                        <Input
                                          value={subsection.name}
                                          disabled
                                          className="bg-gray-50 text-sm"
                                        />
                                        <Input
                                          value={
                                            menu?.translations?.[activeLang]?.[
                                              `subsection.${subsection.id}.name`
                                            ] || ''
                                          }
                                          onChange={(e) =>
                                            updateTranslation(
                                              activeLang,
                                              `subsection.${subsection.id}.name`,
                                              e.target.value
                                            )
                                          }
                                          placeholder={subsection.name}
                                          className="text-sm"
                                        />
                                      </div>
                                    </div>

                                    {/* Items */}
                                    {(subsection.items || []).map((item, itemIndex) => (
                                      <div key={item.id} className="ml-4 space-y-3 pt-2 border-l border-gray-300 pl-4">
                                        <div className="text-xs font-medium text-gray-700">
                                          Item {itemIndex + 1}: {item.name}
                                        </div>

                                        {/* Item Name */}
                                        <div className="space-y-1">
                                          <label className="text-xs text-gray-600">Item Name</label>
                                          <div className="grid grid-cols-2 gap-2">
                                            <Input
                                              value={item.name}
                                              disabled
                                              className="bg-gray-50 text-xs h-8"
                                            />
                                            <Input
                                              value={
                                                menu?.translations?.[activeLang]?.[
                                                  `item.${item.id}.name`
                                                ] || ''
                                              }
                                              onChange={(e) =>
                                                updateTranslation(
                                                  activeLang,
                                                  `item.${item.id}.name`,
                                                  e.target.value
                                                )
                                              }
                                              placeholder={item.name}
                                              className="text-xs h-8"
                                            />
                                          </div>
                                        </div>

                                        {/* Item Description */}
                                        {item.description && (
                                          <div className="space-y-1">
                                            <label className="text-xs text-gray-600">
                                              Item Description
                                            </label>
                                            <div className="grid grid-cols-2 gap-2">
                                              <Textarea
                                                value={item.description}
                                                disabled
                                                className="bg-gray-50 text-xs min-h-[60px]"
                                              />
                                              <Textarea
                                                value={
                                                  menu?.translations?.[activeLang]?.[
                                                    `item.${item.id}.description`
                                                  ] || ''
                                                }
                                                onChange={(e) =>
                                                  updateTranslation(
                                                    activeLang,
                                                    `item.${item.id}.description`,
                                                    e.target.value
                                                  )
                                                }
                                                placeholder={item.description}
                                                className="text-xs min-h-[60px]"
                                              />
                                            </div>
                                          </div>
                                        )}
                                      </div>
                                    ))}
                                  </div>
                                ))}
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                )}
              </TabsContent>
            </Tabs>
          </div>

          {/* Right Panel - Preview */}
          <div className="lg:sticky lg:top-8">
            <Card className="overflow-hidden">
              <CardHeader className="pb-2">
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="text-purple-900">Live Preview</CardTitle>
                    <CardDescription>See how your menu appears to customers</CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="p-0">
                <div className="bg-gray-100 rounded-2xl p-6 flex justify-center">
                  {/* iPhone Frame - matching landing page */}
                  <div className="w-80 h-[600px] bg-black rounded-[2.5rem] p-3 shadow-2xl">
                    {/* Device notch */}
                    <div className="absolute top-5 left-1/2 -translate-x-1/2 w-24 h-5 bg-black/80 rounded-full z-10" />

                    {/* Screen with demo functionality */}
                    <div className="bg-white rounded-[28px] overflow-hidden w-full h-full border shadow-inner scrollbar-hide">
                      <DemoWidget
                        restaurant={restaurantSettings}
                        menu={{
                          ...menu,
                          sections: menu.sections || [],
                          design: designSettings,
                        }}
                        currentView={previewCurrentView}
                        setCurrentView={setPreviewCurrentView}
                        selectedSectionId={previewSelectedSectionId}
                        setSelectedSectionId={setPreviewSelectedSectionId}
                        selectedItemId={previewSelectedItemId}
                        setSelectedItemId={setPreviewSelectedItemId}
                        activeSubSectionId={previewActiveSubSectionId}
                        setActiveSubSectionId={setPreviewActiveSubSectionId}
                      />
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
