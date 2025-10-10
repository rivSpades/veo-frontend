import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { DashboardLayout } from '../components/layout/DashboardLayout';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { Select } from '../components/ui/Select';
import { Card, CardContent } from '../components/ui/Card';
import { Badge } from '../components/ui/Badge';
import { Switch } from '../components/ui/Switch';
import { useToast } from '../components/ui/Toast';
import {
  Search,
  Filter,
  Grid3X3,
  List,
  Plus,
  Eye,
  Edit,
  Copy,
  Trash2,
  Utensils,
  Wine,
  Coffee,
  Clock,
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
  Rocket,
} from 'lucide-react';
import { getMenus as fetchMenus, getMenuById, updateMenu as updateMenuAPI, deleteMenu as deleteMenuAPI, duplicateMenu as duplicateMenuAPI, toggleMenuStatus } from '../data/menus';
import { instancesAPI } from '../data/api';
import { MenuPreviewModal } from '../components/MenuPreviewModal';
import { ScheduleDialog } from '../components/ScheduleDialog';

// Available icons mapping
const iconComponents = {
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
  Rocket,
};

const getMenuIcon = (menu) => {
  // Use the menu's icon if available, otherwise default to Utensils
  const iconName = menu.icon || 'Utensils';
  const IconComponent = iconComponents[iconName] || Utensils;
  return { icon: IconComponent, color: 'bg-purple-500' };
};

const getTimeAgo = (dateString) => {
  const date = new Date(dateString);
  const now = new Date();
  const diffInDays = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60 * 24));

  if (diffInDays === 0) return 'Updated today';
  if (diffInDays === 1) return 'Updated 1 day ago';
  if (diffInDays < 7) return `Updated ${diffInDays} days ago`;
  if (diffInDays < 14) return 'Updated 1 week ago';
  return `Updated ${Math.floor(diffInDays / 7)} weeks ago`;
};

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

export default function Menus() {
  const [menus, setMenus] = useState([]);
  const [filteredMenus, setFilteredMenus] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [languageFilter, setLanguageFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [viewMode, setViewMode] = useState('grid');
  const [previewMenu, setPreviewMenu] = useState(null);
  const [scheduleMenu, setScheduleMenu] = useState(null);
  const [restaurant, setRestaurant] = useState(null);
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    loadMenus();
  }, []);

  useEffect(() => {
    let filtered = menus;

    // Search filter
    if (searchQuery.trim()) {
      filtered = filtered.filter(
        (menu) =>
          menu.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
          menu.description?.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    // Language filter
    if (languageFilter !== 'all') {
      filtered = filtered.filter((menu) => menu.languages && menu.languages.includes(languageFilter));
    }

    // Status filter
    if (statusFilter !== 'all') {
      filtered = filtered.filter((menu) => {
        if (statusFilter === 'active') return menu.enabled;
        if (statusFilter === 'inactive') return !menu.enabled;
        return true;
      });
    }

    setFilteredMenus(filtered);
  }, [menus, searchQuery, languageFilter, statusFilter]);

  const loadMenus = async () => {
    try {
      setLoading(true);

      // Get user's instance ID from localStorage
      const instanceId = localStorage.getItem('instance_id');

      if (!instanceId) {
        // No instance yet, redirect to onboarding
        navigate('/onboarding');
        return;
      }

      // Fetch menus from backend
      const menusResponse = await fetchMenus(instanceId);

      if (menusResponse.success) {
        setMenus(menusResponse.data.results || menusResponse.data);
      } else {
        toast({
          title: 'Error',
          description: menusResponse.error?.message || 'Failed to load menus',
          type: 'error',
        });
        setMenus([]);
      }

      // Fetch restaurant/instance data
      const instanceResponse = await instancesAPI.getInstance(instanceId);
      if (instanceResponse.success) {
        setRestaurant(instanceResponse.data);
      }

      setLoading(false);
    } catch (error) {
      console.error('Error loading menus:', error);
      toast({
        title: 'Error',
        description: 'Failed to load menus',
        type: 'error',
      });
      setLoading(false);
    }
  };

  const handleCreateMenu = () => {
    navigate('/dashboard/menus/create');
  };

  const handleToggleMenu = async (menuId, isActive) => {
    try {
      const response = await toggleMenuStatus(menuId, isActive);

      if (response.success) {
        // Update local state
        setMenus(menus.map((menu) =>
          menu.id === menuId ? { ...menu, is_active: isActive } : menu
        ));

        toast({
          title: 'Success',
          description: `Menu ${isActive ? 'activated' : 'deactivated'} successfully`,
          type: 'success',
        });
      } else {
        toast({
          title: 'Error',
          description: response.error?.message || 'Failed to update menu status',
          type: 'error',
        });
      }
    } catch (error) {
      console.error('Error toggling menu:', error);
      toast({
        title: 'Error',
        description: 'Failed to update menu status',
        type: 'error',
      });
    }
  };

  const handleDuplicateMenu = async (menuId) => {
    if (!menuId) {
      console.error('Invalid menu ID:', menuId);
      return;
    }

    try {
      const response = await duplicateMenuAPI(menuId);

      if (response.success && response.data && response.data.menu) {
        setMenus((prev) => [response.data.menu, ...prev]);
        toast({
          title: 'Success',
          description: 'Menu duplicated successfully',
          type: 'success',
        });
      } else {
        toast({
          title: 'Error',
          description: response.error?.message || 'Failed to duplicate menu',
          type: 'error',
        });
      }
    } catch (error) {
      console.error('Error duplicating menu:', error);
      toast({
        title: 'Error',
        description: 'Failed to duplicate menu',
        type: 'error',
      });
    }
  };

  const handleDeleteMenu = async (menuId) => {
    if (!menuId) {
      console.error('Invalid menu ID:', menuId);
      return;
    }

    if (window.confirm('Are you sure you want to delete this menu?')) {
      try {
        const response = await deleteMenuAPI(menuId);

        if (response.success) {
          // Filter out the deleted menu
          setMenus((prevMenus) => prevMenus.filter((menu) => menu.id !== menuId));
          toast({
            title: 'Success',
            description: 'Menu deleted successfully',
            type: 'success',
          });
        } else {
          toast({
            title: 'Error',
            description: response.error?.message || 'Failed to delete menu',
            type: 'error',
          });
        }
      } catch (error) {
        console.error('Error deleting menu:', error);
        toast({
          title: 'Error',
          description: 'Failed to delete menu',
          type: 'error',
        });
      }
    }
  };

  const handleScheduleMenu = (menuId) => {
    const menu = menus.find((m) => m.id === menuId);
    if (menu) {
      setScheduleMenu(menu);
    }
  };

  const handleSaveSchedule = async (schedule) => {
    if (scheduleMenu) {
      try {
        const response = await updateMenuAPI(scheduleMenu.id, { schedule });
        if (response.success) {
          setMenus(menus.map((menu) => (menu.id === scheduleMenu.id ? response.data : menu)));
          toast({
            title: 'Success',
            description: 'Schedule saved successfully',
            type: 'success',
          });
        } else {
          toast({
            title: 'Error',
            description: response.error?.message || 'Failed to save schedule',
            type: 'error',
          });
        }
      } catch (error) {
        console.error('Error saving schedule:', error);
        toast({
          title: 'Error',
          description: 'Failed to save schedule',
          type: 'error',
        });
      }
    }
  };

  const handlePreviewMenu = async (menuId) => {
    try {
      // Fetch fresh menu data from backend to ensure latest changes are shown
      const response = await getMenuById(menuId);
      if (response.success && response.data) {
        const loadedMenu = response.data;
        const defaultLang = loadedMenu.default_language || 'pt';
        
        // Transform backend structure to frontend structure (same as in MenuEdit)
        if (loadedMenu.sections && loadedMenu.sections.length > 0) {
          loadedMenu.sections = loadedMenu.sections.map((backendSection, index) => {
            // Transform items to extract text from multilingual objects
            const transformedItems = (backendSection.items || []).map(item => {
              // Use backend tags field if available, otherwise convert from boolean fields
              let tags = item.tags || [];
              if (tags.length === 0) {
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
                name: 'Items',
                items: transformedItems,
              }],
              icon: backendSection.icon || 'Utensils',
              sortOrder: backendSection.order || index,
              _backendId: backendSection.id,
            };
          });
        }
        
        // Transform restaurant data if available
        const transformedRestaurant = restaurant ? {
          name: restaurant.name,
          description: restaurant.description,
          address: restaurant.address,
          phone: restaurant.phone,
          wifiName: restaurant.wifi_name,
          wifiPassword: restaurant.wifi_password,
          showWifiOnMenu: restaurant.show_wifi_on_menu,
          showGoogleRating: restaurant.show_google_rating,
          googleUrl: restaurant.google_business_url,
          googleRating: restaurant.google_rating,
          googleReviewCount: restaurant.google_review_count,
          logoUrl: restaurant.logo,
          showHoursOnMenu: restaurant.show_hours_on_menu,
          workingHours: transformBusinessHours(restaurant.business_hours),
        } : null;
        
        // Transform menu name and description if they are multilingual objects
        if (typeof loadedMenu.name === 'object') {
          loadedMenu.name = loadedMenu.name[defaultLang] || Object.values(loadedMenu.name)[0] || 'Unnamed Menu';
        }
        if (typeof loadedMenu.description === 'object') {
          loadedMenu.description = loadedMenu.description[defaultLang] || Object.values(loadedMenu.description)[0] || '';
        }
        
        // Ensure menu has required fields for DemoWidget
        loadedMenu.languages = loadedMenu.available_languages || [];
        
        // Ensure design field exists with exact defaults matching landing page
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
        
        // Store both transformed menu and restaurant for preview
        setPreviewMenu({ ...loadedMenu, _restaurantData: transformedRestaurant });
      } else {
        toast({
          title: 'Failed to load menu preview',
          type: 'error',
          duration: 3000
        });
      }
    } catch (error) {
      console.error('Error loading menu for preview:', error);
      toast({
        title: 'Error loading preview',
        type: 'error',
        duration: 3000
      });
    }
  };

  if (loading) {
    return (
      <DashboardLayout title="Menus" subtitle="Manage your restaurant menus">
        <div className="p-6">
          <div className="animate-pulse space-y-6">
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {[...Array(6)].map((_, i) => (
                <div key={i} className="h-64 bg-gray-200 rounded-lg"></div>
              ))}
            </div>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout
      title="Menus"
      subtitle="Manage your restaurant menus"
      action={
        <Button onClick={handleCreateMenu} className="bg-purple-600 hover:bg-purple-700">
          <Plus className="w-4 h-4 mr-2" />
          New Menu
        </Button>
      }
    >
      <div className="p-6 space-y-6">
        {/* Search and Filters */}
        <div className="flex items-center gap-4">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <Input
              placeholder="Search menus..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 h-9"
            />
          </div>

          <Select value={languageFilter} onChange={(e) => setLanguageFilter(e.target.value)} className="w-40 h-9">
            <option value="all">All Languages</option>
            <option value="en">English</option>
            <option value="pt">Portuguese</option>
            <option value="es">Spanish</option>
            <option value="fr">French</option>
            <option value="de">German</option>
            <option value="it">Italian</option>
          </Select>

          <Select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} className="w-32 h-9">
            <option value="all">All Status</option>
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
          </Select>

          <Button variant="outline" size="icon" title="Filter" className="h-9 w-9">
            <Filter className="h-4 w-4" />
          </Button>
        </div>

        {/* Section Header */}
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-semibold">Your Menus ({filteredMenus.length})</h2>
            <p className="text-sm text-gray-600">Manage all your restaurant menus</p>
          </div>
          <div className="flex gap-1 border rounded-md">
            <Button
              variant={viewMode === 'grid' ? 'default' : 'ghost'}
              size="icon"
              onClick={() => setViewMode('grid')}
              className="rounded-r-none h-8 w-8"
            >
              <Grid3X3 className="h-4 w-4" />
            </Button>
            <Button
              variant={viewMode === 'list' ? 'default' : 'ghost'}
              size="icon"
              onClick={() => setViewMode('list')}
              className="rounded-l-none h-8 w-8"
            >
              <List className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {/* Menu Grid */}
        {filteredMenus.length === 0 ? (
          <div className="text-center py-12">
            <Utensils className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">No menus found</h3>
            <p className="text-gray-500 mb-6">
              {searchQuery ? 'Try adjusting your search.' : 'Get started by creating your first menu.'}
            </p>
            <Button onClick={handleCreateMenu} className="bg-purple-600 hover:bg-purple-700">
              <Plus className="w-4 h-4 mr-2" />
              Create Your First Menu
            </Button>
          </div>
        ) : (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
            {filteredMenus.map((menu) => {
              const { icon: IconComponent, color } = getMenuIcon(menu);
              return (
                <Card key={menu.id} className="hover:shadow-md transition-shadow">
                  <CardContent className="p-6">
                    {/* Icon and Status */}
                    <div className="flex items-center justify-between mb-4">
                      <div className={`p-3 rounded-lg ${color}`}>
                        <IconComponent className="w-6 h-6 text-white" />
                      </div>
                      {menu.enabled ? (
                        <Badge className="bg-green-100 text-green-800 border-green-200 text-xs">Active</Badge>
                      ) : (
                        <Badge className="bg-gray-100 text-gray-800 border-gray-200 text-xs">Inactive</Badge>
                      )}
                    </div>

                    {/* Menu Info */}
                    <div className="space-y-3">
                      <div>
                        <h3 className="font-semibold text-lg">{menu.name}</h3>
                        <p className="text-sm text-gray-500">{getTimeAgo(menu.lastUpdated || menu.updatedAt)}</p>
                      </div>

                      {/* Schedule Info (if present) */}
                      {menu.schedule?.enabled && (
                        <div className="flex items-center gap-1 text-sm text-blue-600">
                          <Clock className="w-4 h-4" />
                          <span>
                            {menu.schedule.startTime} - {menu.schedule.endTime}
                          </span>
                        </div>
                      )}

                      {/* Schedule Status Info */}
                      {menu.schedule?.enabled && (
                        <div className="text-xs text-gray-500">
                          Next change: {menu.schedule.startTime} - {menu.schedule.endTime}
                        </div>
                      )}

                      {/* Language Badges */}
                      <div className="flex flex-wrap gap-1">
                        {menu.languages?.map((lang) => (
                          <Badge key={lang} variant="secondary" className="text-xs">
                            {lang.toUpperCase()}
                          </Badge>
                        ))}
                      </div>

                      {/* Views */}
                      <div className="flex items-center gap-1 text-sm text-gray-600">
                        <Eye className="w-4 h-4" />
                        <span>{(menu.views || 0).toLocaleString()} views</span>
                      </div>

                      {/* Manual Toggle */}
                      <div className="flex items-center justify-between pt-2">
                        <span className="text-sm text-gray-600">Manual Override</span>
                        <Switch
                          checked={menu.enabled || false}
                          onCheckedChange={(checked) => handleToggleMenu(menu.id, checked)}
                          disabled={false}
                        />
                      </div>

                      {/* Action Buttons */}
                      <div className="grid grid-cols-2 gap-2 pt-2">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handlePreviewMenu(menu.id)}
                          className="text-xs h-8"
                        >
                          <Eye className="w-3 h-3 mr-1" />
                          Preview
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => navigate(`/dashboard/menus/${menu.id}/edit`)}
                          className="text-xs h-8"
                        >
                          <Edit className="w-3 h-3 mr-1" />
                          Edit
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleScheduleMenu(menu.id)}
                          className="text-xs h-8 text-blue-600 hover:text-blue-700 bg-transparent"
                        >
                          <Clock className="w-3 h-3 mr-1" />
                          Schedule
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleDuplicateMenu(menu.id)}
                          className="text-xs h-8 text-teal-600 hover:text-teal-700"
                        >
                          <Copy className="w-3 h-3 mr-1" />
                          Duplicate
                        </Button>
                      </div>
                      {/* Delete - full width */}
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleDeleteMenu(menu.id)}
                        className="w-full text-xs h-8 text-red-600 hover:text-red-700"
                      >
                        <Trash2 className="w-3 h-3 mr-1" />
                        Delete
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}
      </div>

      {/* Preview Modal */}
      {previewMenu && restaurant && (
        <MenuPreviewModal
          menu={previewMenu}
          restaurant={restaurant}
          isOpen={!!previewMenu}
          onClose={() => setPreviewMenu(null)}
        />
      )}

      {/* Schedule Dialog */}
      {scheduleMenu && (
        <ScheduleDialog
          menu={scheduleMenu}
          isOpen={!!scheduleMenu}
          onClose={() => setScheduleMenu(null)}
          onSave={handleSaveSchedule}
        />
      )}
    </DashboardLayout>
  );
}

Menus.loader = async () => {
  return {};
};
