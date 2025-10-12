import { useState, useEffect } from "react";
import { DashboardLayout } from "../components/layout/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/Card";
import { Button } from "../components/ui/Button";
import { Input } from "../components/ui/Input";
import { Label } from "../components/ui/Label";
import { Textarea } from "../components/ui/Textarea";
import { Select } from "../components/ui/Select";
import { Badge } from "../components/ui/Badge";
import { Avatar } from "../components/ui/Avatar";
import { Dialog } from "../components/ui/Dialog";
import { useToast } from "../components/ui/Toast";
import { Ticket, Clock, CheckCircle, Star, Plus, Paperclip, Send, Upload } from "lucide-react";
import {
  getTickets,
  getTicketById,
  createTicket,
  addTicketMessage,
  getTicketStats,
  closeTicket,
} from "../data/support";

/* const mockTickets = [
  {
    id: "1",
    title: "Menu not loading on mobile",
    ticketNumber: "TICK-001",
    priority: "High",
    status: "Open",
    createdAt: "2 hours ago",
    messages: [
      {
        id: "1",
        author: "Sarah Johnson",
        isStaff: false,
        content:
          "Hi, I'm experiencing issues with my menu not loading properly on mobile devices. Customers are complaining that they can't view the menu items when scanning the QR code from their phones.",
        timestamp: "2 hours ago",
        attachments: ["screenshot-mobile.png"],
      },
      {
        id: "2",
        author: "Support Team",
        isStaff: true,
        content:
          "Hello Sarah, thank you for reaching out. I can see the screenshot you provided. This appears to be a mobile compatibility issue. Our development team is currently investigating this problem. We'll have an update for you within 24 hours.",
        timestamp: "1 hour ago",
      },
    ],
  },
  {
    id: "2",
    title: "QR code download issue",
    ticketNumber: "TICK-002",
    priority: "Medium",
    status: "In Progress",
    createdAt: "1 day ago",
    messages: [
      {
        id: "1",
        author: "Sarah Johnson",
        isStaff: false,
        content: "I'm having trouble downloading my QR code. The download button doesn't seem to work.",
        timestamp: "1 day ago",
      },
    ],
  },
  {
    id: "3",
    title: "Language translation error",
    ticketNumber: "TICK-003",
    priority: "Low",
    status: "Resolved",
    createdAt: "3 days ago",
    messages: [
      {
        id: "1",
        author: "Sarah Johnson",
        isStaff: false,
        content: "Some menu items are not translating correctly to Spanish.",
        timestamp: "3 days ago",
      },
    ],
  },
]; */

export default function Help() {
  const { toast } = useToast();
  const [tickets, setTickets] = useState([]);
  const [selectedTicket, setSelectedTicket] = useState(null);
  const [stats, setStats] = useState({ total: 0, open: 0, in_progress: 0, resolved: 0 });
  const [statusFilter, setStatusFilter] = useState("All Status");
  const [replyMessage, setReplyMessage] = useState("");
  const [isNewTicketOpen, setIsNewTicketOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [newTicket, setNewTicket] = useState({
    title: "",
    category: "other",
    description: "",
    screenshot: null,
  });
  const [uploadingImage, setUploadingImage] = useState(false);

  useEffect(() => {
    loadTickets();
    loadStats();
  }, []);

  const loadTickets = async () => {
    setLoading(true);
    const response = await getTickets();
    
    console.log('Tickets API Response:', response);
    console.log('Response success:', response.success);
    console.log('Response data:', response.data);
    console.log('Is data array:', Array.isArray(response.data));
    
    if (response.success) {
      // Handle paginated response (DRF returns {count, results})
      const ticketsList = Array.isArray(response.data) 
        ? response.data 
        : (response.data?.results || []);
      console.log('Tickets list:', ticketsList);
      console.log('Ticket statuses:', ticketsList.map(t => ({ id: t.id, status: t.status })));
      setTickets(ticketsList);
      if (ticketsList.length > 0) {
        setSelectedTicket(ticketsList[0]);
      }
    } else {
      console.error('Failed to load tickets:', response.error);
      toast({
        title: 'Error',
        description: response.error?.message || 'Failed to load tickets',
        type: 'error',
      });
      setTickets([]); // Ensure it's always an array even on error
    }
    setLoading(false);
  };

  const loadStats = async () => {
    const response = await getTicketStats();
    console.log('Stats API Response:', response);
    if (response.success) {
      setStats(response.data || { total: 0, open: 0, in_progress: 0, resolved: 0 });
      console.log('Stats loaded:', response.data);
    } else {
      console.error('Failed to load stats:', response.error);
    }
  };

  // Filter tickets based on selected status
  const filteredTickets = Array.isArray(tickets) ? tickets.filter(ticket => {
    if (!statusFilter || statusFilter === "All Status") return true;
    
    // Normalize status for comparison
    const ticketStatus = (ticket.status || '').toString().toLowerCase().trim();
    const filterStatus = (statusFilter || '').toString().toLowerCase().trim();
    
    console.log('Filter check:', { ticketStatus, filterStatus, match: ticketStatus === filterStatus });
    
    // Handle "In Progress" -> "in_progress" conversion
    if (filterStatus === "in progress") {
      return ticketStatus === "in_progress" || ticketStatus === "in progress";
    }
    
    if (filterStatus === "resolved") {
      return ticketStatus === "resolved";
    }
    
    if (filterStatus === "closed") {
      return ticketStatus === "closed";
    }
    
    if (filterStatus === "open") {
      return ticketStatus === "open";
    }
    
    return ticketStatus === filterStatus;
  }) : [];
  
  console.log('Filtered tickets:', filteredTickets.length, 'of', tickets.length);

  const handleImageUpload = async (event) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      toast({
        title: 'File too large',
        description: 'Please select an image smaller than 5MB',
        type: 'error',
      });
      return;
    }

    setUploadingImage(true);
    setNewTicket({ ...newTicket, screenshot: file });
    setUploadingImage(false);
  };

  const handleCreateTicket = async () => {
    if (!newTicket.title || !newTicket.description || !newTicket.category) {
      toast({
        title: 'Validation Error',
        description: 'Please fill in all required fields',
        type: 'error',
      });
      return;
    }

    const instanceId = localStorage.getItem('instance_id');
    
    // Use FormData for image upload
    const formData = new FormData();
    formData.append('title', newTicket.title);
    formData.append('description', newTicket.description);
    formData.append('category', newTicket.category);
    formData.append('instance', instanceId);
    
    if (newTicket.screenshot) {
      formData.append('screenshot', newTicket.screenshot);
    }

    console.log('Creating ticket with data:', { 
      title: newTicket.title, 
      category: newTicket.category,
      hasScreenshot: !!newTicket.screenshot 
    });
    
    const response = await createTicket(formData);
    
    console.log('Create ticket response:', response);
    
    if (response.success && response.data) {
      console.log('Ticket created successfully:', response.data);
      
      toast({
        title: 'Success',
        description: `Ticket ${response.data.ticket_number} created successfully`,
        type: 'success',
      });
      
      setIsNewTicketOpen(false);
      setNewTicket({ title: "", category: "other", description: "", screenshot: null });
      
      // Load full ticket details with messages
      const fullTicketResponse = await getTicketById(response.data.id);
      const newTicketData = fullTicketResponse.success ? fullTicketResponse.data : response.data;
      
      // Add the new ticket to the list immediately
      setTickets(prevTickets => [newTicketData, ...prevTickets]);
      setSelectedTicket(newTicketData);
      
      // Also reload stats
      await loadStats();
      
      console.log('UI updated with new ticket:', newTicketData);
    } else {
      console.error('Failed to create ticket:', response.error);
      toast({
        title: 'Error',
        description: response.error?.message || 'Failed to create ticket',
        type: 'error',
      });
    }
  };

  const canUserReply = () => {
    if (!selectedTicket || !selectedTicket.messages) return false;
    
    // User can reply if:
    // 1. Ticket is not closed/resolved
    if (selectedTicket.status === 'closed' || selectedTicket.status === 'resolved') {
      return false;
    }
    
    // 2. Last message is from staff (ping-pong: staff replied, now user's turn)
    const messages = selectedTicket.messages || [];
    if (messages.length === 0) return false; // No messages yet
    
    const lastMessage = messages[messages.length - 1];
    return lastMessage.is_staff === true; // Can reply if last message is from staff
  };

  const handleCloseTicket = async () => {
    if (!selectedTicket) return;
    
    const response = await closeTicket(selectedTicket.id);
    if (response.success) {
      toast({
        title: 'Success',
        description: 'Ticket has been closed',
        type: 'success',
      });
      
      // Reload the selected ticket to show status change
      const ticketResponse = await getTicketById(selectedTicket.id);
      if (ticketResponse.success) {
        const updatedTicket = ticketResponse.data;
        setSelectedTicket(updatedTicket);
        // Update in tickets list
        setTickets(tickets.map(t => t.id === selectedTicket.id ? updatedTicket : t));
      }
      
      // Reload stats
      await loadStats();
    } else {
      toast({
        title: 'Error',
        description: 'Failed to close ticket',
        type: 'error',
      });
    }
  };

  const handleSendReply = async () => {
    if (!replyMessage.trim() || !selectedTicket) return;
    
    if (!canUserReply()) {
      toast({
        title: 'Cannot reply yet',
        description: 'Please wait for support team to respond first',
        type: 'info',
      });
      return;
    }
    
    const response = await addTicketMessage(selectedTicket.id, replyMessage);
    if (response.success) {
      toast({
        title: 'Success',
        description: 'Reply sent successfully',
        type: 'success',
      });
      setReplyMessage("");
      
      // Reload the selected ticket to show new message
      const ticketResponse = await getTicketById(selectedTicket.id);
      if (ticketResponse.success) {
        const updatedTicket = ticketResponse.data;
        setSelectedTicket(updatedTicket);
        // Update in tickets list
        setTickets(tickets.map(t => t.id === selectedTicket.id ? updatedTicket : t));
      }
    } else {
      toast({
        title: 'Error',
        description: 'Failed to send reply',
        type: 'error',
      });
    }
  };

  const categoryOptions = [
    { value: 'cannot_use_app', label: 'I cannot use the app', priority: 'Critical' },
    { value: 'payment_issue', label: 'Payment or billing issue', priority: 'High' },
    { value: 'menu_not_loading', label: 'Menu not loading properly', priority: 'High' },
    { value: 'qr_code_issue', label: 'QR code problem', priority: 'Medium' },
    { value: 'translation_error', label: 'Translation or language issue', priority: 'Medium' },
    { value: 'feature_request', label: 'Feature request or suggestion', priority: 'Low' },
    { value: 'other', label: 'Other issue', priority: 'Medium' },
  ];

  const formatDate = (dateString) => {
    if (!dateString) return 'Unknown date';
    try {
      const date = new Date(dateString);
      if (isNaN(date.getTime())) return 'Unknown date';
      return date.toLocaleDateString('en-US', { 
        year: 'numeric', 
        month: 'short', 
        day: 'numeric' 
      });
    } catch (error) {
      return 'Unknown date';
    }
  };

  const formatDateTime = (dateString) => {
    if (!dateString) return 'Unknown time';
    try {
      const date = new Date(dateString);
      if (isNaN(date.getTime())) return 'Unknown time';
      return date.toLocaleString('en-US', { 
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch (error) {
      return 'Unknown time';
    }
  };

  const getPriorityColor = (priority) => {
    switch (priority?.toLowerCase()) {
      case "critical":
        return "bg-red-100 text-red-700 border-red-200";
      case "high":
        return "bg-red-100 text-red-700 border-red-200";
      case "medium":
        return "bg-yellow-100 text-yellow-700 border-yellow-200";
      case "low":
        return "bg-blue-100 text-blue-700 border-blue-200";
      default:
        return "bg-gray-100 text-gray-700 border-gray-200";
    }
  };

  const getStatusColor = (status) => {
    const normalizedStatus = status?.toLowerCase().replace('_', ' ');
    switch (normalizedStatus) {
      case "open":
        return "bg-blue-100 text-blue-700";
      case "in progress":
        return "bg-yellow-100 text-yellow-700";
      case "resolved":
        return "bg-green-100 text-green-700";
      case "closed":
        return "bg-gray-100 text-gray-700";
      default:
        return "bg-gray-100 text-gray-700";
    }
  };

  return (
    <DashboardLayout
      title="Support Center"
      subtitle="Get help and submit support tickets"
      action={
        <button
          onClick={() => setIsNewTicketOpen(true)}
          className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-lg flex items-center gap-2"
        >
          <Plus className="w-4 h-4" />
          New Ticket
        </button>
      }
    >
      <div className="p-6">

        {/* New Ticket Dialog */}
        {isNewTicketOpen && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 w-full max-w-md max-h-[90vh] overflow-y-auto">
              <h2 className="text-xl font-bold mb-4">Create New Support Ticket</h2>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="ticketCategory">What type of issue are you experiencing? *</Label>
                  <Select
                    id="ticketCategory"
                    value={newTicket.category}
                    onChange={(value) => setNewTicket((prev) => ({ ...prev, category: value }))}
                    className="mt-1"
                  >
                    {categoryOptions.map(option => (
                      <option key={option.value} value={option.value}>
                        {option.label} ({option.priority} Priority)
                      </option>
                    ))}
                  </Select>
                  <p className="text-xs text-gray-500 mt-1">
                    Priority is automatically assigned based on issue type
                  </p>
                </div>
                
                <div>
                  <Label htmlFor="ticketTitle">Title *</Label>
                  <Input
                    id="ticketTitle"
                    value={newTicket.title}
                    onChange={(e) => setNewTicket((prev) => ({ ...prev, title: e.target.value }))}
                    placeholder="Brief summary of your issue"
                    className="mt-1"
                  />
                </div>
                
                <div>
                  <Label htmlFor="ticketDescription">Description *</Label>
                  <Textarea
                    id="ticketDescription"
                    value={newTicket.description}
                    onChange={(e) => setNewTicket((prev) => ({ ...prev, description: e.target.value }))}
                    placeholder="Provide detailed information about your issue"
                    className="mt-1 min-h-[100px]"
                  />
                </div>
                
                <div>
                  <Label htmlFor="ticketScreenshot">Screenshot (Optional)</Label>
                  <div className="mt-1 border-2 border-dashed border-gray-300 rounded-lg p-4 text-center">
                    {newTicket.screenshot ? (
                      <div className="space-y-2">
                        <img 
                          src={URL.createObjectURL(newTicket.screenshot)} 
                          alt="Preview" 
                          className="max-h-32 mx-auto rounded"
                        />
                        <p className="text-sm text-gray-600">{newTicket.screenshot.name}</p>
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => setNewTicket({ ...newTicket, screenshot: null })}
                        >
                          Remove
                        </Button>
                      </div>
                    ) : (
                      <>
                        <Upload className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                        <p className="text-sm text-gray-600 mb-2">Upload a screenshot</p>
                        <div className="relative inline-block">
                          <input
                            type="file"
                            id="ticketScreenshot"
                            accept="image/*"
                            onChange={handleImageUpload}
                            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                            disabled={uploadingImage}
                          />
                          <Button variant="outline" size="sm" disabled={uploadingImage}>
                            {uploadingImage ? 'Uploading...' : 'Choose File'}
                          </Button>
                        </div>
                        <p className="text-xs text-gray-500 mt-1">PNG, JPG up to 5MB</p>
                      </>
                    )}
                  </div>
                </div>
                
                <div className="flex justify-end gap-2">
                  <Button variant="outline" onClick={() => setIsNewTicketOpen(false)}>
                    Cancel
                  </Button>
                  <Button onClick={handleCreateTicket} className="bg-purple-600 hover:bg-purple-700">
                    Create Ticket
                  </Button>
                </div>
              </div>
            </div>
          </div>
        )}

      {/* Statistics Cards */}
      <div className="grid gap-4 md:grid-cols-4 mb-6">
        <Card>
          <CardContent className="flex items-center gap-3 p-4">
            <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
              <Ticket className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <p className="text-2xl font-bold">{stats.total}</p>
              <p className="text-sm text-gray-600">Total Tickets</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="flex items-center gap-3 p-4">
            <div className="w-10 h-10 bg-yellow-100 rounded-lg flex items-center justify-center">
              <Clock className="w-5 h-5 text-yellow-600" />
            </div>
            <div>
              <p className="text-2xl font-bold">{stats.open}</p>
              <p className="text-sm text-gray-600">Open Tickets</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="flex items-center gap-3 p-4">
            <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
              <CheckCircle className="w-5 h-5 text-green-600" />
            </div>
            <div>
              <p className="text-2xl font-bold">{stats.resolved}</p>
              <p className="text-sm text-gray-600">Resolved</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="flex items-center gap-3 p-4">
            <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
              <Clock className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <p className="text-2xl font-bold">{stats.in_progress}</p>
              <p className="text-sm text-gray-600">In Progress</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Content */}
      <div className="grid gap-6 lg:grid-cols-5">
        {/* Tickets List */}
        <div className="lg:col-span-2">
          <Card>
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Your Tickets</CardTitle>
                  <p className="text-xs text-gray-500 mt-1">
                    Showing {filteredTickets.length} of {tickets.length} tickets
                  </p>
                </div>
                <Select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} className="w-32">
                  <option value="All Status">All Status</option>
                  <option value="Open">Open</option>
                  <option value="In Progress">In Progress</option>
                  <option value="Resolved">Resolved</option>
                  <option value="Closed">Closed</option>
                </Select>
              </div>
            </CardHeader>
            <CardContent className="p-0">
              {loading ? (
                <div className="p-8 text-center text-gray-500">
                  Loading tickets...
                </div>
              ) : tickets.length === 0 ? (
                <div className="p-8 text-center text-gray-500">
                  <Ticket className="w-12 h-12 mx-auto mb-2 text-gray-300" />
                  <p>No tickets yet</p>
                  <p className="text-sm mt-1">Create your first support ticket to get help</p>
                </div>
              ) : filteredTickets.length === 0 ? (
                <div className="p-8 text-center text-gray-500">
                  <p className="text-sm">No tickets match this filter</p>
                  <p className="text-xs mt-1">Try selecting a different status</p>
                </div>
              ) : (
                <div className="space-y-1">
                  {filteredTickets.map((ticket) => (
                  <div
                    key={ticket.id}
                    className={`p-4 cursor-pointer border-l-4 hover:bg-gray-50 transition-colors ${
                      selectedTicket?.id === ticket.id ? "bg-blue-50 border-l-blue-500" : "border-l-transparent"
                    }`}
                    onClick={async () => {
                      // Load full ticket details with messages
                      console.log('Loading ticket details for:', ticket.id);
                      const fullTicket = await getTicketById(ticket.id);
                      console.log('Full ticket response:', fullTicket);
                      
                      if (fullTicket.success) {
                        console.log('Selected ticket data:', fullTicket.data);
                        setSelectedTicket(fullTicket.data);
                      } else {
                        console.log('Using list ticket data:', ticket);
                        setSelectedTicket(ticket);
                      }
                    }}
                  >
                    <div className="flex items-start justify-between mb-2">
                      <h3 className="font-medium text-sm">{ticket.title}</h3>
                      <Badge className={`text-xs ${getPriorityColor(ticket.priority)}`}>{ticket.priority}</Badge>
                    </div>
                    <p className="text-xs text-gray-500 mb-2">#{ticket.ticket_number}</p>
                    <div className="flex items-center justify-between">
                      <Badge className={`text-xs ${getStatusColor(ticket.status)}`}>{ticket.status}</Badge>
                      <span className="text-xs text-gray-500">{formatDate(ticket.created_at)}</span>
                    </div>
                  </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Ticket Detail */}
        <div className="lg:col-span-3">
          {!selectedTicket ? (
            <Card className="h-full flex items-center justify-center">
              <CardContent className="text-center text-gray-500 p-12">
                <Ticket className="w-16 h-16 mx-auto mb-4 text-gray-300" />
                <p className="text-lg">No ticket selected</p>
                <p className="text-sm mt-2">Select a ticket from the list to view details</p>
              </CardContent>
            </Card>
          ) : (
          <Card className="h-full">
            <CardHeader className="border-b">
              <div className="flex items-start justify-between">
                <div>
                  <CardTitle className="text-lg">{selectedTicket.title}</CardTitle>
                  <div className="flex items-center gap-2 mt-1">
                    <span className="text-sm text-gray-500">Ticket #{selectedTicket.ticket_number}</span>
                    {selectedTicket.created_at && (
                      <>
                        <span className="text-sm text-gray-500">•</span>
                        <span className="text-sm text-gray-500">Created {formatDate(selectedTicket.created_at)}</span>
                      </>
                    )}
                  </div>
                </div>
                <div className="flex gap-2">
                  <Badge className={`${getStatusColor(selectedTicket.status)}`}>{selectedTicket.status}</Badge>
                  <Badge className={`${getPriorityColor(selectedTicket.priority)}`}>
                    {selectedTicket.priority} Priority
                  </Badge>
                  {(selectedTicket.status === 'resolved' || selectedTicket.status === 'open' || selectedTicket.status === 'in_progress') && (
                    <Button 
                      size="sm" 
                      variant="outline"
                      onClick={handleCloseTicket}
                      className="ml-2"
                    >
                      Close Ticket
                    </Button>
                  )}
                </div>
              </div>
            </CardHeader>
            <CardContent className="flex flex-col h-[500px]">
              {/* Initial Ticket Description */}
              {selectedTicket.description && (
                <div className="border-b pb-4 mb-4">
                  <div className="flex items-start gap-2 mb-2">
                    <Badge className="bg-blue-100 text-blue-700 text-xs">Initial Request</Badge>
                  </div>
                  <div className="bg-gray-50 rounded-lg p-3">
                    <p className="text-sm font-medium mb-2">Description:</p>
                    <p className="text-sm text-gray-700 whitespace-pre-wrap">{selectedTicket.description}</p>
                    
                    {/* Show screenshot if uploaded */}
                    {selectedTicket.screenshot && (
                      <div className="mt-3">
                        <p className="text-xs font-medium text-gray-600 mb-2">Screenshot:</p>
                        <img 
                          src={selectedTicket.screenshot} 
                          alt="Ticket screenshot" 
                          className="max-w-full rounded border cursor-pointer hover:opacity-90"
                          onClick={() => window.open(selectedTicket.screenshot, '_blank')}
                        />
                      </div>
                    )}
                  </div>
                </div>
              )}
              
              {/* Messages */}
              <div className="flex-1 overflow-y-auto space-y-4 py-4">
                {selectedTicket.messages && selectedTicket.messages.length > 0 ? (
                  selectedTicket.messages.map((message) => {
                    // Render status change messages differently
                    if (message.message_type === 'status_change') {
                      return (
                        <div key={message.id} className="flex justify-center">
                          <div className="bg-gray-100 rounded-full px-4 py-2 text-xs text-gray-600 flex items-center gap-2">
                            <CheckCircle className="w-3 h-3" />
                            <span>{message.content}</span>
                            <span className="text-gray-400">•</span>
                            <span>{formatDateTime(message.created_at)}</span>
                          </div>
                        </div>
                      );
                    }
                    
                    // Regular message
                    return (
                      <div key={message.id} className="flex gap-3">
                        <Avatar
                          src="/placeholder.svg?height=32&width=32"
                          alt={message.author_name || 'User'}
                          fallback={message.is_staff ? "ST" : (message.author_name || 'U').charAt(0).toUpperCase()}
                          className={`w-8 h-8 flex-shrink-0 ${
                            message.is_staff ? "bg-purple-100 text-purple-600" : "bg-gray-100"
                          }`}
                        />
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <span className="font-medium text-sm">{message.author_name || message.author_email}</span>
                            {message.is_staff && <Badge className="bg-purple-100 text-purple-600 text-xs">Staff</Badge>}
                            <span className="text-xs text-gray-500">{formatDateTime(message.created_at)}</span>
                          </div>
                          <div
                            className={`p-3 rounded-lg ${
                              message.is_staff
                                ? "bg-purple-50 border-l-4 border-purple-500"
                                : "bg-blue-50 border-l-4 border-blue-500"
                            }`}
                          >
                            <p className="text-sm">{message.content}</p>
                            {message.attachments && message.attachments.length > 0 && (
                              <div className="mt-2">
                                {message.attachments.map((attachment) => (
                                  <div key={attachment.id} className="flex items-center gap-2 text-xs text-gray-600">
                                    <Paperclip className="w-3 h-3" />
                                    <span>{attachment.filename}</span>
                                  </div>
                                ))}
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  })
                ) : (
                  <div className="text-center text-gray-500 py-8">
                    <p className="text-sm">No replies yet</p>
                    <p className="text-xs mt-1">Support team will respond to your ticket soon</p>
                  </div>
                )}
              </div>

              {/* Reply Section */}
              <div className="border-t pt-4">
                {canUserReply() ? (
                  <>
                    <Label htmlFor="reply" className="text-sm font-medium">
                      Add a reply
                    </Label>
                    <div className="flex gap-2 mt-2">
                      <Textarea
                        id="reply"
                        value={replyMessage}
                        onChange={(e) => setReplyMessage(e.target.value)}
                        placeholder="Type your message here..."
                        className="flex-1 min-h-[80px]"
                      />
                      <div className="flex flex-col gap-2">
                        <Button size="sm" variant="outline">
                          <Paperclip className="w-4 h-4" />
                        </Button>
                        <Button size="sm" onClick={handleSendReply} className="bg-purple-600 hover:bg-purple-700">
                          <Send className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  </>
                ) : (
                  <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 text-center">
                    <Clock className="w-8 h-8 text-yellow-600 mx-auto mb-2" />
                    <p className="text-sm font-medium text-yellow-800">Waiting for support team response</p>
                    <p className="text-xs text-yellow-600 mt-1">
                      You'll be able to reply once our support team responds to your ticket
                    </p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
          )}
        </div>
      </div>
      </div>
    </DashboardLayout>
  );
}
