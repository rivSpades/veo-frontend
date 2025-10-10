import { useState } from "react";
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
import { Ticket, Clock, CheckCircle, Star, Plus, Paperclip, Send } from "lucide-react";

const mockTickets = [
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
];

export default function Help() {
  const [selectedTicket, setSelectedTicket] = useState(mockTickets[0]);
  const [statusFilter, setStatusFilter] = useState("All Status");
  const [replyMessage, setReplyMessage] = useState("");
  const [isNewTicketOpen, setIsNewTicketOpen] = useState(false);
  const [newTicket, setNewTicket] = useState({
    title: "",
    priority: "Medium",
    description: "",
  });

  const handleCreateTicket = () => {
    console.log("Creating new ticket:", newTicket);
    setIsNewTicketOpen(false);
    setNewTicket({ title: "", priority: "Medium", description: "" });
  };

  const handleSendReply = () => {
    if (replyMessage.trim()) {
      console.log("Sending reply:", replyMessage);
      setReplyMessage("");
    }
  };

  const getPriorityColor = (priority) => {
    switch (priority) {
      case "High":
        return "bg-red-100 text-red-700 border-red-200";
      case "Medium":
        return "bg-yellow-100 text-yellow-700 border-yellow-200";
      case "Low":
        return "bg-blue-100 text-blue-700 border-blue-200";
      default:
        return "bg-gray-100 text-gray-700 border-gray-200";
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case "Open":
        return "bg-blue-100 text-blue-700";
      case "In Progress":
        return "bg-yellow-100 text-yellow-700";
      case "Resolved":
        return "bg-green-100 text-green-700";
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
            <div className="bg-white rounded-lg p-6 w-full max-w-md">
              <h2 className="text-xl font-bold mb-4">Create New Support Ticket</h2>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="ticketTitle">Title</Label>
                  <Input
                    id="ticketTitle"
                    value={newTicket.title}
                    onChange={(e) => setNewTicket((prev) => ({ ...prev, title: e.target.value }))}
                    placeholder="Describe your issue briefly"
                    className="mt-1"
                  />
                </div>
                <div>
                  <Label htmlFor="ticketPriority">Priority</Label>
                  <Select
                    value={newTicket.priority}
                    onChange={(value) => setNewTicket((prev) => ({ ...prev, priority: value }))}
                    className="mt-1"
                  >
                    <option value="High">High</option>
                    <option value="Medium">Medium</option>
                    <option value="Low">Low</option>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="ticketDescription">Description</Label>
                  <Textarea
                    id="ticketDescription"
                    value={newTicket.description}
                    onChange={(e) => setNewTicket((prev) => ({ ...prev, description: e.target.value }))}
                    placeholder="Provide detailed information about your issue"
                    className="mt-1 min-h-[100px]"
                  />
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
              <p className="text-2xl font-bold">12</p>
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
              <p className="text-2xl font-bold">3</p>
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
              <p className="text-2xl font-bold">8</p>
              <p className="text-sm text-gray-600">Resolved</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="flex items-center gap-3 p-4">
            <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
              <Star className="w-5 h-5 text-purple-600" />
            </div>
            <div>
              <p className="text-2xl font-bold">4.8</p>
              <p className="text-sm text-gray-600">Avg Rating</p>
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
                <CardTitle>Your Tickets</CardTitle>
                <Select value={statusFilter} onChange={setStatusFilter} className="w-32">
                  <option value="All Status">All Status</option>
                  <option value="Open">Open</option>
                  <option value="In Progress">In Progress</option>
                  <option value="Resolved">Resolved</option>
                </Select>
              </div>
            </CardHeader>
            <CardContent className="p-0">
              <div className="space-y-1">
                {mockTickets.map((ticket) => (
                  <div
                    key={ticket.id}
                    className={`p-4 cursor-pointer border-l-4 hover:bg-gray-50 transition-colors ${
                      selectedTicket.id === ticket.id ? "bg-blue-50 border-l-blue-500" : "border-l-transparent"
                    }`}
                    onClick={() => setSelectedTicket(ticket)}
                  >
                    <div className="flex items-start justify-between mb-2">
                      <h3 className="font-medium text-sm">{ticket.title}</h3>
                      <Badge className={`text-xs ${getPriorityColor(ticket.priority)}`}>{ticket.priority}</Badge>
                    </div>
                    <p className="text-xs text-gray-500 mb-2">#{ticket.ticketNumber}</p>
                    <div className="flex items-center justify-between">
                      <Badge className={`text-xs ${getStatusColor(ticket.status)}`}>{ticket.status}</Badge>
                      <span className="text-xs text-gray-500">{ticket.createdAt}</span>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Ticket Detail */}
        <div className="lg:col-span-3">
          <Card className="h-full">
            <CardHeader className="border-b">
              <div className="flex items-start justify-between">
                <div>
                  <CardTitle className="text-lg">{selectedTicket.title}</CardTitle>
                  <div className="flex items-center gap-2 mt-1">
                    <span className="text-sm text-gray-500">Ticket #{selectedTicket.ticketNumber}</span>
                    <span className="text-sm text-gray-500">•</span>
                    <span className="text-sm text-gray-500">Created {selectedTicket.createdAt}</span>
                  </div>
                </div>
                <div className="flex gap-2">
                  <Badge className={`${getStatusColor(selectedTicket.status)}`}>{selectedTicket.status}</Badge>
                  <Badge className={`${getPriorityColor(selectedTicket.priority)}`}>
                    {selectedTicket.priority} Priority
                  </Badge>
                </div>
              </div>
            </CardHeader>
            <CardContent className="flex flex-col h-[500px]">
              {/* Messages */}
              <div className="flex-1 overflow-y-auto space-y-4 py-4">
                {selectedTicket.messages.map((message) => (
                  <div key={message.id} className="flex gap-3">
                    <Avatar
                      src="/placeholder.svg?height=32&width=32"
                      alt={message.author}
                      fallback={message.isStaff ? "ST" : "SJ"}
                      className={`w-8 h-8 flex-shrink-0 ${
                        message.isStaff ? "bg-purple-100 text-purple-600" : "bg-gray-100"
                      }`}
                    />
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-medium text-sm">{message.author}</span>
                        {message.isStaff && <Badge className="bg-purple-100 text-purple-600 text-xs">Staff</Badge>}
                        <span className="text-xs text-gray-500">{message.timestamp}</span>
                      </div>
                      <div
                        className={`p-3 rounded-lg ${
                          message.isStaff
                            ? "bg-purple-50 border-l-4 border-purple-500"
                            : "bg-blue-50 border-l-4 border-blue-500"
                        }`}
                      >
                        <p className="text-sm">{message.content}</p>
                        {message.attachments && (
                          <div className="mt-2">
                            {message.attachments.map((attachment, index) => (
                              <div key={index} className="flex items-center gap-2 text-xs text-gray-600">
                                <Paperclip className="w-3 h-3" />
                                <span>{attachment}</span>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Reply Section */}
              <div className="border-t pt-4">
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
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
      </div>
    </DashboardLayout>
  );
}
