import jsPDF from 'jspdf'
import 'jspdf-autotable'

declare module 'jspdf' {
  interface jsPDF {
    autoTable: (options: any) => jsPDF
  }
}

export interface StatementData {
  user_name: string
  account_number: string
  period: {
    from: string
    to: string
  }
  transactions: Array<{
    date: string
    description: string
    reference: string
    type: 'debit' | 'credit'
    amount: number
    balance: number
  }>
  opening_balance: number
  closing_balance: number
}

export class PDFService {
  /**
   * Generate account statement PDF
   */
  async generateStatement(data: StatementData): Promise<Blob> {
    const doc = new jsPDF()
    const pageWidth = doc.internal.pageSize.getWidth()
    const pageHeight = doc.internal.pageSize.getHeight()
    
    // Add logo/header
    doc.setFillColor(59, 130, 246)
    doc.rect(0, 0, pageWidth, 40, 'F')
    
    doc.setTextColor(255, 255, 255)
    doc.setFontSize(24)
    doc.text('BonaPay', 20, 25)
    
    doc.setFontSize(10)
    doc.text('Account Statement', 20, 35)
    
    // Reset text color
    doc.setTextColor(0, 0, 0)
    
    // Account Info
    doc.setFontSize(12)
    doc.text(`Account Holder: ${data.user_name}`, 20, 55)
    doc.text(`Account Number: ${data.account_number}`, 20, 62)
    doc.text(`Period: ${data.period.from} - ${data.period.to}`, 20, 69)
    
    // Balance Summary
    doc.setFillColor(240, 240, 240)
    doc.rect(20, 80, pageWidth - 40, 30, 'F')
    
    doc.setFontSize(10)
    doc.text(`Opening Balance: ₦${data.opening_balance.toLocaleString()}`, 30, 95)
    doc.text(`Closing Balance: ₦${data.closing_balance.toLocaleString()}`, 120, 95)
    
    // Transactions Table
    const tableData = data.transactions.map(tx => [
      tx.date,
      tx.description,
      tx.reference,
      tx.type === 'credit' ? `+₦${tx.amount.toLocaleString()}` : `-₦${tx.amount.toLocaleString()}`,
      `₦${tx.balance.toLocaleString()}`,
    ])
    
    doc.autoTable({
      startY: 120,
      head: [['Date', 'Description', 'Reference', 'Amount', 'Balance']],
      body: tableData,
      theme: 'striped',
      headStyles: { fillColor: [59, 130, 246], textColor: [255, 255, 255] },
      alternateRowStyles: { fillColor: [245, 245, 245] },
    })
    
    // Footer
    const pageCount = doc.getNumberOfPages()
    const finalY = (doc as any).lastAutoTable?.finalY || pageHeight - 20
    
    for (let i = 1; i <= pageCount; i++) {
      doc.setPage(i)
      doc.setFontSize(8)
      doc.setTextColor(128, 128, 128)
      doc.text(
        `Generated on ${new Date().toLocaleDateString()} - Page ${i} of ${pageCount}`,
        pageWidth / 2,
        pageHeight - 10,
        { align: 'center' }
      )
    }
    
    return doc.output('blob')
  }

  /**
   * Generate transaction receipt PDF
   */
  async generateReceipt(data: {
    transaction_id: string
    reference: string
    date: string
    type: string
    amount: number
    description: string
    sender_name?: string
    recipient_name?: string
    recipient_account?: string
    status: string
    fee?: number
  }): Promise<Blob> {
    const doc = new jsPDF()
    const pageWidth = doc.internal.pageSize.getWidth()
    const pageHeight = doc.internal.pageSize.getHeight()
    
    // Header
    doc.setFillColor(59, 130, 246)
    doc.rect(0, 0, pageWidth, 35, 'F')
    
    doc.setTextColor(255, 255, 255)
    doc.setFontSize(20)
    doc.text('BonaPay', 20, 22)
    doc.setFontSize(10)
    doc.text('Transaction Receipt', 20, 30)
    
    doc.setTextColor(0, 0, 0)
    
    // Receipt Content
    let y = 50
    
    doc.setFontSize(14)
    doc.text('TRANSACTION DETAILS', 20, y)
    y += 10
    
    doc.setFontSize(10)
    doc.text(`Transaction ID: ${data.transaction_id}`, 20, y)
    y += 7
    doc.text(`Reference: ${data.reference}`, 20, y)
    y += 7
    doc.text(`Date: ${data.date}`, 20, y)
    y += 7
    doc.text(`Status: ${data.status.toUpperCase()}`, 20, y)
    y += 12
    
    doc.setFontSize(14)
    doc.text('AMOUNT', 20, y)
    y += 8
    doc.setFontSize(24)
    doc.setTextColor(data.type === 'credit' ? 34 : 239, data.type === 'credit' ? 197 : 68, data.type === 'credit' ? 94 : 68)
    doc.text(`${data.type === 'credit' ? '+' : '-'}₦${data.amount.toLocaleString()}`, 20, y)
    y += 15
    
    doc.setTextColor(0, 0, 0)
    doc.setFontSize(12)
    doc.text('Description:', 20, y)
    y += 6
    doc.setFontSize(10)
    doc.text(data.description, 20, y)
    y += 12
    
    if (data.sender_name) {
      doc.setFontSize(12)
      doc.text('From:', 20, y)
      y += 6
      doc.setFontSize(10)
      doc.text(data.sender_name, 20, y)
      y += 10
    }
    
    if (data.recipient_name) {
      doc.setFontSize(12)
      doc.text('To:', 20, y)
      y += 6
      doc.setFontSize(10)
      doc.text(data.recipient_name, 20, y)
      y += 7
      doc.text(`Account: ${data.recipient_account}`, 20, y)
      y += 10
    }
    
    if (data.fee && data.fee > 0) {
      doc.setFontSize(12)
      doc.text('Fee:', 20, y)
      y += 6
      doc.setFontSize(10)
      doc.text(`₦${data.fee.toLocaleString()}`, 20, y)
    }
    
    // Footer
    doc.setFontSize(8)
    doc.setTextColor(128, 128, 128)
    doc.text(
      'This is a computer-generated receipt and does not require a signature.',
      pageWidth / 2,
      pageHeight - 20,
      { align: 'center' }
    )
    
    return doc.output('blob')
  }
}

export const pdfService = new PDFService()