'use client'

import { useEffect, useState, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { getSupabaseClient } from '@/lib/supabase/client'
import { chatService, ChatMessage, ChatConversation } from '@/lib/chat/chat.service'
import { formatDate } from '@/lib/utils'
import DashboardLayout from '@/components/layout/dashboard-layout'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { Send, MessageCircle, User, Headphones, CheckCheck, Clock } from 'lucide-react'
import toast from 'react-hot-toast'

export default function SupportChatPage() {
  const router = useRouter()
  const [conversations, setConversations] = useState<ChatConversation[]>([])
  const [selectedConversation, setSelectedConversation] = useState<ChatConversation | null>(null)
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [newMessage, setNewMessage] = useState('')
  const [sending, setSending] = useState(false)
  const [loading, setLoading] = useState(true)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const [user, setUser] = useState<any>(null)
  const [isAdmin, setIsAdmin] = useState(false)

  useEffect(() => {
    fetchUserAndConversations()
  }, [])

  useEffect(() => {
    if (selectedConversation) {
      fetchMessages(selectedConversation.id)
      markAsRead(selectedConversation.id)
    }
  }, [selectedConversation])

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  const fetchUserAndConversations = async () => {
    const supabase = getSupabaseClient()
    const { data: { user } } = await supabase.auth.getUser()
    
    if (!user) {
      router.push('/login')
      return
    }

    setUser(user)

    // Check if user is admin
    const { data: profile } = await supabase
      .from('profiles')
      .select('is_admin')
      .eq('id', user.id)
      .single()

    const adminStatus = profile?.is_admin === true
    setIsAdmin(adminStatus)

    if (adminStatus) {
      const convos = await chatService.getAllConversations()
      setConversations(convos)
      if (convos.length > 0) {
        setSelectedConversation(convos[0])
      }
    } else {
      const convos = await chatService.getUserConversations(user.id)
      setConversations(convos)
      if (convos.length > 0) {
        setSelectedConversation(convos[0])
      }
    }

    setLoading(false)

    // Subscribe to new messages
   // Update the subscription part in fetchUserAndConversations function
const channel = supabase
  .channel('chat_messages')
  .on(
    'postgres_changes',
    {
      event: 'INSERT',
      schema: 'public',
      table: 'chat_messages',
    },
    (payload) => {
      const newMsg = payload.new as ChatMessage
      // Check if the message belongs to the selected conversation
      if (selectedConversation && newMsg.conversation_id === selectedConversation.id) {
        setMessages(prev => [...prev, newMsg])
        if ((!isAdmin && newMsg.is_admin) || (isAdmin && !newMsg.is_admin)) {
          markAsRead(selectedConversation.id)
        }
      } else {
        // Refresh conversations list
        fetchUserAndConversations()
      }
    }
  )
  .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }

  const fetchMessages = async (conversationId: string) => {
    const msgs = await chatService.getMessages(conversationId)
    setMessages(msgs)
  }

  const markAsRead = async (conversationId: string) => {
    if (!user) return
    await chatService.markAsRead(conversationId, user.id, isAdmin)
  }

  const handleSendMessage = async () => {
  if (!newMessage.trim() || !user) return

  setSending(true)
  try {
    let conversationId = selectedConversation?.id

    if (!conversationId) {
      // Start new conversation
      const result = await chatService.sendMessage(user.id, newMessage, isAdmin)
      if (result.success && result.conversationId) {
        // Refresh conversations to get the new one
        await fetchUserAndConversations()
        setNewMessage('')
        // Find and select the new conversation
        const newConvo = conversations.find(c => c.id === result.conversationId)
        if (newConvo) {
          setSelectedConversation(newConvo)
        }
      } else {
        toast.error(result.error || 'Failed to send message')
      }
    } else {
      const result = await chatService.sendMessage(user.id, newMessage, isAdmin, conversationId)
      if (result.success) {
        setNewMessage('')
      } else {
        toast.error(result.error || 'Failed to send message')
      }
    }
  } catch (error) {
    toast.error('Failed to send message')
  } finally {
    setSending(false)
  }
}

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'open':
        return <Badge className="bg-green-500">Open</Badge>
      case 'closed':
        return <Badge className="bg-red-500">Closed</Badge>
      case 'pending':
        return <Badge className="bg-yellow-500">Pending</Badge>
      default:
        return <Badge className="bg-gray-500">{status}</Badge>
    }
  }

  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-96">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        </div>
      </DashboardLayout>
    )
  }

  return (
    <DashboardLayout>
      <div className="h-[calc(100vh-120px)] flex gap-6 animate-fade-in">
        {/* Conversations Sidebar */}
        <Card className="w-80 flex-shrink-0 overflow-hidden">
          <CardHeader className="border-b">
            <CardTitle className="flex items-center gap-2">
              <MessageCircle className="h-5 w-5" />
              Conversations
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0 overflow-y-auto h-[calc(100%-73px)]">
            {conversations.length === 0 ? (
              <div className="text-center py-8 text-slate-500">
                <Headphones className="h-12 w-12 mx-auto mb-3 opacity-50" />
                <p>No conversations yet</p>
                <p className="text-sm">Start a new conversation to get support</p>
              </div>
            ) : (
              conversations.map((conv) => (
                <div
                  key={conv.id}
                  className={`p-4 border-b cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors ${
                    selectedConversation?.id === conv.id ? 'bg-slate-50 dark:bg-slate-800' : ''
                  }`}
                  onClick={() => setSelectedConversation(conv)}
                >
                  <div className="flex justify-between items-start mb-1">
                    <p className="font-medium">
                      {isAdmin ? conv.user_name : 'Support Team'}
                    </p>
                    {getStatusBadge(conv.status)}
                  </div>
                  <p className="text-sm text-slate-500 truncate">{conv.last_message}</p>
                  <p className="text-xs text-slate-400 mt-1">{formatDate(conv.last_message_at)}</p>
                </div>
              ))
            )}
            {!isAdmin && conversations.length === 0 && (
              <div className="p-4">
                <Button
                  className="w-full"
                  onClick={() => {
                    setSelectedConversation(null)
                    setNewMessage('')
                  }}
                >
                  Start New Conversation
                </Button>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Chat Area */}
        <Card className="flex-1 flex flex-col overflow-hidden">
          {selectedConversation ? (
            <>
              <CardHeader className="border-b">
                <div className="flex justify-between items-center">
                  <div>
                    <CardTitle>
                      {isAdmin ? selectedConversation.user_name : 'Support Team'}
                    </CardTitle>
                    <p className="text-sm text-slate-500">
                      {isAdmin ? selectedConversation.user_email : 'We typically respond within minutes'}
                    </p>
                  </div>
                  {getStatusBadge(selectedConversation.status)}
                </div>
              </CardHeader>
              <CardContent className="flex-1 overflow-y-auto p-4 space-y-4">
                {messages.length === 0 ? (
                  <div className="text-center py-8 text-slate-500">
                    <MessageCircle className="h-12 w-12 mx-auto mb-3 opacity-50" />
                    <p>No messages yet</p>
                    <p className="text-sm">Send a message to start the conversation</p>
                  </div>
                ) : (
                  messages.map((msg, idx) => (
                    <div
                      key={msg.id}
                      className={`flex ${msg.is_admin ? 'justify-start' : 'justify-end'}`}
                    >
                      <div
                        className={`max-w-[70%] rounded-lg p-3 ${
                          msg.is_admin
                            ? 'bg-slate-100 dark:bg-slate-800'
                            : 'bg-blue-500 text-white'
                        }`}
                      >
                        <p className="text-sm">{msg.message}</p>
                        <div className={`flex items-center gap-1 mt-1 text-xs ${
                          msg.is_admin ? 'text-slate-400' : 'text-blue-200'
                        }`}>
                          <span>{formatDate(msg.created_at)}</span>
                          {!msg.is_admin && msg.is_read && <CheckCheck className="h-3 w-3" />}
                        </div>
                      </div>
                    </div>
                  ))
                )}
                <div ref={messagesEndRef} />
              </CardContent>
              <div className="p-4 border-t">
                <div className="flex gap-2">
                  <Input
                    placeholder="Type your message..."
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                  />
                  <Button onClick={handleSendMessage} disabled={sending || !newMessage.trim()}>
                    <Send className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </>
          ) : (
            <div className="flex-1 flex items-center justify-center">
              <div className="text-center">
                <MessageCircle className="h-16 w-16 mx-auto mb-4 text-slate-300" />
                <h3 className="text-lg font-semibold mb-2">Welcome to Support</h3>
                <p className="text-slate-500">
                  {isAdmin
                    ? 'Select a conversation to start chatting'
                    : 'Start a new conversation to get help from our support team'}
                </p>
                {!isAdmin && (
                  <Button
                    className="mt-4"
                    onClick={() => {
                      setSelectedConversation(null)
                      setNewMessage('')
                    }}
                  >
                    Start New Conversation
                  </Button>
                )}
              </div>
            </div>
          )}
        </Card>
      </div>
    </DashboardLayout>
  )
}