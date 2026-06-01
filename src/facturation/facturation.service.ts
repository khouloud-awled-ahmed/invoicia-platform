import { Injectable, NotFoundException } from '@nestjs/common';

export interface CraLine {
  id: number; projectName: string; consultant: string;
  date: string; hours: number; rate: number; amount: number;
}

const MOCK_LINES = [
  { id: 1, projectName: 'Refonte Site Web', consultant: 'Pierre Dupont', date: '18/11/2025', hours: 7, rate: 500, amount: 3500 },
  { id: 2, projectName: 'Application Mobile CRM', consultant: 'Jean Moreau', date: '18/11/2025', hours: 8, rate: 550, amount: 4400 },
];

@Injectable()
export class FacturationService {
  async getPendingLines() { return MOCK_LINES; }
  async getStats() {
    return { totalMonth: MOCK_LINES.reduce((s,l) => s+l.amount,0), alreadyInvoiced: 0, month: 'Novembre 2025' };
  }
  async generateInvoices(craLineIds: number[]) {
    const lines = MOCK_LINES.filter(l => craLineIds.includes(l.id));
    if (lines.length !== craLineIds.length) throw new NotFoundException('CRA line not found');
    return { invoiceCount: lines.length };
  }
}