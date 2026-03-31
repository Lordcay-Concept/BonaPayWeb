'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import toast from 'react-hot-toast'
import { getSupabaseClient } from '@/lib/supabase/client'
import { cardService, VirtualCard } from '@/lib/cards/card.service'
import { formatCurrency } from '@/lib/utils'
import DashboardLayout from '@/components/layout/dashboard-layout'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { CreditCard, Plus, Eye, EyeOff, Copy, Check, Snowflake, Flame, Trash2, Settings, Zap, Shield } from 'lucide-react'

// Card type configuration with icons and colors
const CARD_TYPES = [
  { 
    value: 'visa', 
    label: 'Visa', 
    icon: '💳', 
    color: 'from-blue-600 to-blue-400',
    description: 'Accepted worldwide, secure online payments'
  },
  { 
    value: 'mastercard', 
    label: 'Mastercard', 
    icon: '💳', 
    color: 'from-red-600 to-orange-500',
    description: 'Global acceptance, premium benefits'
  },
  { 
    value: 'verve', 
    label: 'Verve', 
    icon: '🟣', 
    color: 'from-purple-600 to-pink-500',
    description: 'Best for local transactions in Nigeria'
  },
]

export default function CardsPage() {
  const router = useRouter()
  const [cards, setCards] = useState<VirtualCard[]>([])
  const [loading, setLoading] = useState(true)
  const [showCreateDialog, setShowCreateDialog] = useState(false)
  const [selectedCard, setSelectedCard] = useState<VirtualCard | null>(null)
  const [showCardDetails, setShowCardDetails] = useState<{ [key: string]: boolean }>({})
  const [copied, setCopied] = useState<string | null>(null)
  const [newCardType, setNewCardType] = useState<'visa' | 'mastercard' | 'verve'>('visa')
  const [newCardLimit, setNewCardLimit] = useState(1000000)
  const [creating, setCreating] = useState(false)
  const [updatingLimit, setUpdatingLimit] = useState(false)
  const [newLimit, setNewLimit] = useState(0)

  useEffect(() => {
    fetchCards()
  }, [])

  const fetchCards = async () => {
    const supabase = getSupabaseClient()
    const { data: { user } } = await supabase.auth.getUser()
    
    if (!user) {
      router.push('/login')
      return
    }

    const userCards = await cardService.getUserCards(user.id)
    setCards(userCards)
    setLoading(false)
  }

  const handleCreateCard = async () => {
    const supabase = getSupabaseClient()
    const { data: { user } } = await supabase.auth.getUser()
    
    if (!user) return

    setCreating(true)
    try {
      const result = await cardService.createCard(user.id, {
        card_type: newCardType,
        card_limit: newCardLimit,
      })

      if (result.success) {
        toast.success(`${newCardType === 'verve' ? 'Verve' : newCardType === 'visa' ? 'Visa' : 'Mastercard'} card created successfully!`)
        setShowCreateDialog(false)
        fetchCards()
      } else {
        toast.error(result.error || 'Failed to create card')
      }
    } catch (error) {
      toast.error('An error occurred')
    } finally {
      setCreating(false)
    }
  }

  const handleToggleFreeze = async (card: VirtualCard) => {
    const supabase = getSupabaseClient()
    const { data: { user } } = await supabase.auth.getUser()
    
    if (!user) return

    const result = await cardService.toggleCardFreeze(card.id, user.id)
    if (result.success) {
      toast.success(card.is_frozen ? 'Card unfrozen successfully' : 'Card frozen successfully')
      fetchCards()
    } else {
      toast.error(result.error || 'Failed to update card')
    }
  }

  const handleUpdateLimit = async () => {
    const supabase = getSupabaseClient()
    const { data: { user } } = await supabase.auth.getUser()
    
    if (!user || !selectedCard) return

    setUpdatingLimit(true)
    try {
      const result = await cardService.updateCardLimit(selectedCard.id, user.id, newLimit)
      if (result.success) {
        toast.success('Card limit updated successfully')
        setSelectedCard(null)
        fetchCards()
      } else {
        toast.error(result.error || 'Failed to update limit')
      }
    } catch (error) {
      toast.error('An error occurred')
    } finally {
      setUpdatingLimit(false)
    }
  }

  const handleDeleteCard = async (card: VirtualCard) => {
    const supabase = getSupabaseClient()
    const { data: { user } } = await supabase.auth.getUser()
    
    if (!user) return

    if (confirm('Are you sure you want to delete this card? This action cannot be undone.')) {
      const result = await cardService.deleteCard(card.id, user.id)
      if (result.success) {
        toast.success('Card deleted successfully')
        fetchCards()
      } else {
        toast.error(result.error || 'Failed to delete card')
      }
    }
  }

  const copyToClipboard = (text: string, field: string) => {
    navigator.clipboard.writeText(text)
    setCopied(field)
    setTimeout(() => setCopied(null), 2000)
  }

  const toggleCardDetails = (cardId: string) => {
    setShowCardDetails(prev => ({ ...prev, [cardId]: !prev[cardId] }))
  }

  const formatCardNumber = (pan: string) => {
    if (!pan) return '**** **** **** ****'
    return pan.replace(/(\d{4})(?=\d)/g, '$1 ')
  }

  const getCardColor = (cardType: string) => {
    const type = CARD_TYPES.find(t => t.value === cardType)
    return type?.color || 'from-slate-600 to-slate-400'
  }

  const getCardLabel = (cardType: string) => {
    const type = CARD_TYPES.find(t => t.value === cardType)
    return type?.label || 'Card'
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
      <div className="space-y-6 animate-fade-in">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold">Virtual Cards</h1>
            <p className="text-slate-600 dark:text-slate-400 mt-1">
              Create and manage your virtual debit cards (Visa, Mastercard, Verve)
            </p>
          </div>
          <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                Create New Card
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-md">
              <DialogHeader>
                <DialogTitle>Create Virtual Card</DialogTitle>
                <DialogDescription>
                  Choose your card type and spending limit
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4 py-4">
                <div className="space-y-2">
                  <Label>Card Type</Label>
                  <Select value={newCardType} onValueChange={(v: any) => setNewCardType(v)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select card type" />
                    </SelectTrigger>
                    <SelectContent>
                      {CARD_TYPES.map((type) => (
                        <SelectItem key={type.value} value={type.value}>
                          <div className="flex items-center gap-2">
                            <span>{type.icon}</span>
                            <span>{type.label}</span>
                            <span className="text-xs text-slate-500 ml-2">{type.description}</span>
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Spending Limit (₦)</Label>
                  <Input
                    type="number"
                    value={newCardLimit}
                    onChange={(e) => setNewCardLimit(Number(e.target.value))}
                    placeholder="Enter spending limit"
                  />
                  <p className="text-xs text-slate-500">Minimum: ₦10,000 • Maximum: ₦10,000,000</p>
                </div>

                {/* Card Preview */}
                <div className={`mt-4 p-4 rounded-xl bg-gradient-to-r ${getCardColor(newCardType)} text-white`}>
                  <div className="flex justify-between items-start mb-6">
                    <span className="text-xs opacity-80">Virtual Card</span>
                    <span className="text-lg font-bold">
                      {newCardType === 'visa' ? 'VISA' : newCardType === 'mastercard' ? 'MASTERCARD' : 'VERVE'}
                    </span>
                  </div>
                  <div className="mb-4">
                    <p className="text-sm opacity-80 mb-1">Card Number</p>
                    <p className="font-mono text-lg tracking-wider">**** **** **** ****</p>
                  </div>
                  <div className="flex justify-between">
                    <div>
                      <p className="text-xs opacity-80 mb-1">Expires</p>
                      <p className="text-sm font-mono">**/**</p>
                    </div>
                    <div>
                      <p className="text-xs opacity-80 mb-1">CVV</p>
                      <p className="text-sm font-mono">***</p>
                    </div>
                  </div>
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setShowCreateDialog(false)}>
                  Cancel
                </Button>
                <Button onClick={handleCreateCard} disabled={creating}>
                  {creating ? 'Creating...' : 'Create Card'}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>

        {cards.length === 0 ? (
          <Card className="text-center py-12">
            <CardContent>
              <CreditCard className="h-12 w-12 mx-auto mb-3 text-slate-400" />
              <h3 className="text-lg font-semibold mb-2">No Virtual Cards</h3>
              <p className="text-slate-500 mb-4">You haven't created any virtual cards yet</p>
              <Button onClick={() => setShowCreateDialog(true)}>
                Create Your First Card
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {cards.map((card) => (
              <div key={card.id} className={`relative rounded-xl bg-gradient-to-r ${getCardColor(card.card_type)} p-5 text-white shadow-lg ${!card.is_active ? 'opacity-60' : ''}`}>
                {card.is_frozen && (
                  <div className="absolute top-4 right-4">
                    <div className="bg-white/20 backdrop-blur-sm text-white text-xs px-2 py-1 rounded-full flex items-center gap-1">
                      <Snowflake className="h-3 w-3" />
                      Frozen
                    </div>
                  </div>
                )}
                
                {/* Card Header */}
                <div className="flex justify-between items-start mb-6">
                  <div>
                    <p className="text-xs opacity-80 mb-1">Virtual Card</p>
                    <p className="text-lg font-bold tracking-wide">
                      {card.card_type === 'visa' ? 'VISA' : card.card_type === 'mastercard' ? 'MASTERCARD' : 'VERVE'}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-xs opacity-80">Expires</p>
                    <p className="text-sm font-mono">{card.card_expiry_month}/{card.card_expiry_year}</p>
                  </div>
                </div>

                {/* Card Number */}
                <div className="mb-4">
                  <p className="text-xs opacity-80 mb-1">Card Number</p>
                  <div className="flex items-center gap-2">
                    <p className="font-mono text-lg tracking-wider">
                      {showCardDetails[card.id] 
                        ? formatCardNumber(card.card_pan)
                        : '**** **** **** ' + card.card_last_four}
                    </p>
                    <button
                      onClick={() => toggleCardDetails(card.id)}
                      className="p-1 hover:bg-white/20 rounded-lg transition-colors"
                    >
                      {showCardDetails[card.id] ? (
                        <EyeOff className="h-4 w-4" />
                      ) : (
                        <Eye className="h-4 w-4" />
                      )}
                    </button>
                    {showCardDetails[card.id] && (
                      <button
                        onClick={() => copyToClipboard(card.card_pan, `pan-${card.id}`)}
                        className="p-1 hover:bg-white/20 rounded-lg transition-colors"
                      >
                        {copied === `pan-${card.id}` ? (
                          <Check className="h-4 w-4" />
                        ) : (
                          <Copy className="h-4 w-4" />
                        )}
                      </button>
                    )}
                  </div>
                </div>

                {/* CVV and Limit */}
                <div className="grid grid-cols-2 gap-4 mb-4">
                  <div>
                    <p className="text-xs opacity-80 mb-1">CVV</p>
                    <div className="flex items-center gap-2">
                      <p className="font-mono">
                        {showCardDetails[card.id] ? card.card_cvv : '***'}
                      </p>
                      {showCardDetails[card.id] && (
                        <button
                          onClick={() => copyToClipboard(card.card_cvv, `cvv-${card.id}`)}
                          className="p-1 hover:bg-white/20 rounded-lg transition-colors"
                        >
                          {copied === `cvv-${card.id}` ? (
                            <Check className="h-3 w-3" />
                          ) : (
                            <Copy className="h-3 w-3" />
                          )}
                        </button>
                      )}
                    </div>
                  </div>
                  <div>
                    <p className="text-xs opacity-80 mb-1">Spending Limit</p>
                    <p className="text-sm font-medium">{formatCurrency(card.card_limit)}</p>
                  </div>
                </div>

                {/* Spent Progress */}
                <div className="mb-4">
                  <div className="flex justify-between text-xs opacity-80 mb-1">
                    <span>Spent This Month</span>
                    <span>{formatCurrency(card.spent_monthly)} / {formatCurrency(card.card_limit)}</span>
                  </div>
                  <div className="w-full bg-white/20 rounded-full h-1.5">
                    <div
                      className="bg-white h-1.5 rounded-full"
                      style={{ width: `${(card.spent_monthly / card.card_limit) * 100}%` }}
                    />
                  </div>
                </div>

                {/* Actions */}
                <div className="flex gap-2 pt-2 border-t border-white/20">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleToggleFreeze(card)}
                    className="flex-1 text-white hover:bg-white/20 hover:text-white"
                  >
                    {card.is_frozen ? (
                      <>
                        <Flame className="h-4 w-4 mr-1" />
                        Unfreeze
                      </>
                    ) : (
                      <>
                        <Snowflake className="h-4 w-4 mr-1" />
                        Freeze
                      </>
                    )}
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => {
                      setSelectedCard(card)
                      setNewLimit(card.card_limit)
                    }}
                    className="text-white hover:bg-white/20 hover:text-white"
                  >
                    <Settings className="h-4 w-4" />
                  </Button>
                  {!card.is_active ? null : (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleDeleteCard(card)}
                      className="text-white hover:bg-white/20 hover:text-white"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Card Type Info Section */}
        <Card>
          <CardHeader>
            <CardTitle>About Virtual Cards</CardTitle>
            <CardDescription>
              Choose the card type that best suits your needs
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {CARD_TYPES.map((type) => (
                <div key={type.value} className="flex items-start gap-3 p-3 rounded-lg bg-slate-50 dark:bg-slate-800">
                  <div className={`w-10 h-10 rounded-full bg-gradient-to-r ${type.color} flex items-center justify-center text-white text-lg`}>
                    {type.icon}
                  </div>
                  <div>
                    <h4 className="font-semibold">{type.label}</h4>
                    <p className="text-xs text-slate-500 mt-1">{type.description}</p>
                    <p className="text-xs text-slate-400 mt-2">
                      {type.value === 'verve' && '✓ Best for local Nigerian transactions'}
                      {type.value === 'visa' && '✓ Global acceptance, secure online payments'}
                      {type.value === 'mastercard' && '✓ Worldwide acceptance, premium benefits'}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Update Limit Dialog */}
      <Dialog open={!!selectedCard} onOpenChange={() => setSelectedCard(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Update Spending Limit</DialogTitle>
            <DialogDescription>
              Set a new spending limit for your {selectedCard && getCardLabel(selectedCard.card_type)} card
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>New Spending Limit (₦)</Label>
              <Input
                type="number"
                value={newLimit}
                onChange={(e) => setNewLimit(Number(e.target.value))}
                placeholder="Enter new limit"
              />
              <p className="text-xs text-slate-500">Minimum: ₦10,000 • Maximum: ₦10,000,000</p>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setSelectedCard(null)}>
              Cancel
            </Button>
            <Button onClick={handleUpdateLimit} disabled={updatingLimit}>
              {updatingLimit ? 'Updating...' : 'Update Limit'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </DashboardLayout>
  )
}