/**
 * API Client pour le backend NestJS
 * Utilise fetch (pas axios) pour toutes les requêtes
 */

const API_URL = (import.meta as any).env?.VITE_API_URL || ((import.meta as any).env?.DEV ? '/api' : '/api');

class ApiClientBackend {
  private token: string | null = null;

  constructor() {
    this.token = localStorage.getItem('token');
  }

  setToken(token: string) {
    this.token = token;
    localStorage.setItem('token', token);
  }

  clearToken() {
    this.token = null;
    localStorage.removeItem('token');
    localStorage.removeItem('user');
  }

   async request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
    const token = localStorage.getItem('token');
    const userStr = localStorage.getItem('user');
    let tenantId = '';

    try {
      if (userStr) {
        const user = JSON.parse(userStr);
        if (user.role !== 'PLATFORM_ADMIN' && user.tenantId) {
          tenantId = user.tenantId;
        }
      }
    } catch (e) {
      console.warn("Erreur lecture user localStorage", e);
    }

    const headers: HeadersInit = {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...(tenantId ? { 'x-tenant-id': tenantId } : {}),
      ...(options.headers as any || {}),
    };

    if (options.body instanceof FormData) {
      delete (headers as any)['Content-Type'];
    }

    let response: Response;
    try {
      response = await fetch(`${API_URL}${endpoint}`, {
        ...options,
        headers,
      });
    } catch (networkError: any) {
      console.error('[API Client] Erreur réseau:', networkError);
      const errorMessage = networkError.message || 'Erreur de connexion';
      if (errorMessage.includes('Failed to fetch') || errorMessage.includes('ECONNREFUSED') || errorMessage.includes('NetworkError')) {
        throw new Error(JSON.stringify({
          error: 'Connection error',
          message: 'Le backend NestJS n\'est pas accessible. Vérifiez qu\'il est démarré sur le port 3000.',
          details: 'Assurez-vous que le serveur backend est démarré avec: cd backend && npm run start:dev'
        }));
      }
      throw networkError;
    }

    if (response.status === 401) {
      console.error("Session expirée");
      this.clearToken();
      window.location.href = '/login';
      throw new Error('Session expirée');
    }

    if (!response.ok) {
      const errorText = await response.text();
      try {
        const errorJson = JSON.parse(errorText);
        const message = Array.isArray(errorJson.message)
          ? errorJson.message.join(', ')
          : errorJson.message || errorJson.error || `Erreur ${response.status}`;
        throw new Error(JSON.stringify(errorJson));
      } catch {
        if (errorText.includes('Proxy error') || errorText.includes('backend NestJS')) {
          throw new Error(errorText);
        }
        throw new Error(errorText || `Erreur ${response.status}`);
      }
    }

    return response.json();
  }

  // ==========================================
  // 🔐 AUTH
  // ==========================================

  async login(credentials: { email: string; password: string }) {
    const result = await this.request<{ access_token: string; user: any }>('/auth/login', {
      method: 'POST',
      body: JSON.stringify(credentials),
    });
    if (result.access_token) {
      this.setToken(result.access_token);
      localStorage.setItem('user', JSON.stringify(result.user));
    }
    return result;
  }

  async register(data: { name: string; email: string; password: string; companyName: string; selectedModules?: string[] }) {
    const result = await this.request<{ access_token: string; user: any }>('/auth/register', {
      method: 'POST',
      body: JSON.stringify(data),
    });
    if (result.access_token) {
      this.setToken(result.access_token);
      localStorage.setItem('user', JSON.stringify(result.user));
    }
    return result;
  }

  async getProfile() {
    return this.request<any>('/auth/profile');
  }

  async forgotPassword(email: string) {
    return this.request<{ message: string }>('/auth/forgot-password', {
      method: 'POST',
      body: JSON.stringify({ email }),
    });
  }

  async resetPassword(email: string, token: string, newPassword: string) {
    return this.request<{ message: string }>('/auth/reset-password', {
      method: 'POST',
      body: JSON.stringify({ email, token, newPassword }),
    });
  }

  // ==========================================
  // 🏢 TENANTS (Super Admin)
  // ==========================================

  async getTenants() {
    return this.request<any[]>('/tenants');
  }

  // ==========================================
  // 🎛️ PLATFORM ADMIN
  // ==========================================

  async getPlatformTenants() {
    return this.request<any[]>('/platform/tenants');
  }

  async getPlatformTenant(id: string) {
    return this.request<any>(`/platform/tenants/${id}`);
  }

  async createPlatformTenant(data: {
    name: string; businessName?: string; matriculeFiscal: string;
    adminEmail: string; adminName?: string; adminPassword?: string;
    modules: string[]; subscriptionStatus?: string; planType?: string;
    planId?: string; maxUsers?: number;
  }) {
    return this.request<any>('/platform/tenants', { method: 'POST', body: JSON.stringify(data) });
  }

  async updateTenantModules(id: string, modules: string[]) {
    return this.request<any>(`/platform/tenants/${id}/modules`, { method: 'PATCH', body: JSON.stringify({ modules }) });
  }

  async updateTenantSubscriptionStatus(id: string, subscriptionStatus: 'ACTIVE' | 'PENDING_PAYMENT' | 'SUSPENDED' | 'TRIAL' | 'CANCELLED') {
    return this.request<any>(`/platform/tenants/${id}/status`, { method: 'PATCH', body: JSON.stringify({ subscriptionStatus }) });
  }

  async updatePlatformTenant(id: string, data: { name?: string; email?: string; adminEmail?: string; planId?: string; subscriptionStatus?: string }) {
    return this.request<any>(`/platform/tenants/${id}`, { method: 'PATCH', body: JSON.stringify(data) });
  }

  // ==========================================
  // 📦 SUBSCRIPTION PLANS
  // ==========================================

  async getSubscriptionPlans() {
    return this.request<any[]>('/platform/plans');
  }

  async getActiveSubscriptionPlans() {
    const plans = await this.request<any[]>('/platform/plans');
    return plans.filter((plan: any) => plan.isActive);
  }

  async getSubscriptionPlan(id: string) {
    return this.request<any>(`/platform/plans/${id}`);
  }

  async createSubscriptionPlan(data: { name: string; description?: string; price: number; currency?: string; features: string[]; maxUsers?: number; isActive?: boolean }) {
    return this.request<any>('/platform/plans', { method: 'POST', body: JSON.stringify(data) });
  }

  async updateSubscriptionPlan(id: string, data: { name?: string; description?: string; price?: number; currency?: string; features?: string[]; maxUsers?: number; isActive?: boolean }) {
    return this.request<any>(`/platform/plans/${id}`, { method: 'PATCH', body: JSON.stringify(data) });
  }

  async deleteSubscriptionPlan(id: string) {
    return this.request<void>(`/platform/plans/${id}`, { method: 'DELETE' });
  }

  // ==========================================
  // ⚙️ PLATFORM SETTINGS
  // ==========================================

  async getPlatformSettings() {
    return this.request<any>('/platform/settings');
  }

  async updatePlatformSettings(data: any) {
    return this.request<any>('/platform/settings', { method: 'PUT', body: JSON.stringify(data) });
  }

  async getTenant(id: string) {
    return this.request<any>(`/tenants/${id}`);
  }

  async createTenant(data: { name: string; adminEmail: string; subscriptionPlan?: string }) {
    return this.request<any>('/tenants', { method: 'POST', body: JSON.stringify(data) });
  }

  async updateTenant(id: string, data: any) {
    return this.request<any>(`/tenants/${id}`, { method: 'PATCH', body: JSON.stringify(data) });
  }

  async deleteTenant(id: string) {
    return this.request<void>(`/tenants/${id}`, { method: 'DELETE' });
  }

  async updateTenantStatus(id: string, status: 'active' | 'inactive') {
    return this.request<any>(`/tenants/${id}`, { method: 'PATCH', body: JSON.stringify({ status }) });
  }

  async updateTenantCompanyInfo(id: string, data: any) {
    return this.request<any>(`/tenants/${id}/company-info`, { method: 'PATCH', body: JSON.stringify(data) });
  }

  async updateTenantBankAccount(id: string, data: any) {
    return this.request<any>(`/tenants/${id}/bank-account`, { method: 'PATCH', body: JSON.stringify(data) });
  }

  async updateTenantInvoiceSettings(id: string, data: any) {
    return this.request<any>(`/tenants/${id}/invoice-settings`, { method: 'PATCH', body: JSON.stringify(data) });
  }

  async updateTenantNotificationPreferences(id: string, data: any) {
    return this.request<any>(`/tenants/${id}/notification-preferences`, { method: 'PATCH', body: JSON.stringify(data) });
  }

  async updateTenantSecuritySettings(id: string, data: any) {
    return this.request<any>(`/tenants/${id}/security-settings`, { method: 'PATCH', body: JSON.stringify(data) });
  }

  // ==========================================
  // 💳 PAYMENT METHODS
  // ==========================================

  async getPaymentMethods(tenantId: string) {
    return this.request<any[]>(`/tenants/${tenantId}/payment-methods`);
  }

  async updatePaymentMethods(tenantId: string, paymentMethods: any[]) {
    return this.request<any>(`/tenants/${tenantId}/payment-methods`, { method: 'PATCH', body: JSON.stringify(paymentMethods) });
  }

  async getTenantModuleFlags(tenantId: string) {
    return this.request<Record<string, boolean>>(`/tenants/${tenantId}/modules`);
  }

  // ==========================================
  // 💰 VENTES (SALES)
  // ==========================================

  async getClients() {
    return this.request<any[]>('/billing/sales/clients');
  }

  async getClient(id: string) {
    return this.request<any>(`/billing/sales/clients/${id}`);
  }

  async createClient(data: any) {
    return this.request<any>('/billing/sales/clients', { method: 'POST', body: JSON.stringify(data) });
  }

  async updateClient(id: string, data: any) {
    return this.request<any>(`/billing/sales/clients/${id}`, { method: 'PATCH', body: JSON.stringify(data) });
  }

  async deleteClient(id: string) {
    return this.request<void>(`/billing/sales/clients/${id}`, { method: 'DELETE' });
  }

  async getInvoices(filters?: { status?: string; clientId?: string; dateFrom?: string; dateTo?: string }) {
    const queryString = filters ? '?' + new URLSearchParams(filters as any).toString() : '';
    return this.request<any[]>(`/billing/sales/invoices${queryString}`);
  }

  async getInvoice(id: string) {
    return this.request<any>(`/billing/sales/invoices/${id}`);
  }

  async createInvoice(data: any) {
    return this.request<any>('/billing/sales/invoices', { method: 'POST', body: JSON.stringify(data) });
  }

  async updateInvoice(id: string, data: any) {
    return this.request<any>(`/billing/sales/invoices/${id}`, { method: 'PATCH', body: JSON.stringify(data) });
  }

  async deleteInvoice(id: string) {
    return this.request<void>(`/billing/sales/invoices/${id}`, { method: 'DELETE' });
  }

  getInvoiceDownloadUrl(id: string): string {
    return `/api/billing/sales/invoices/${id}/download`;
  }

  async getCreditNotes() {
    return this.request<any[]>('/billing/sales/credit-notes');
  }

  async getCreditNote(id: string) {
    return this.request<any>(`/billing/sales/credit-notes/${id}`);
  }

  async createCreditNote(data: any) {
    return this.request<any>('/billing/sales/credit-notes', { method: 'POST', body: JSON.stringify(data) });
  }

  async updateCreditNote(id: string, data: any) {
    return this.request<any>(`/billing/sales/credit-notes/${id}`, { method: 'PATCH', body: JSON.stringify(data) });
  }

  async deleteCreditNote(id: string) {
    return this.request<void>(`/billing/sales/credit-notes/${id}`, { method: 'DELETE' });
  }

  // ==========================================
  // 🛒 ACHATS (PURCHASES)
  // ==========================================

  async getSuppliers() {
    return this.request<any[]>('/billing/purchases/suppliers');
  }

  async getSupplier(id: string) {
    return this.request<any>(`/billing/purchases/suppliers/${id}`);
  }

  async createSupplier(data: any) {
    return this.request<any>('/billing/purchases/suppliers', { method: 'POST', body: JSON.stringify(data) });
  }

  async getExpenses(filters?: any) {
    const queryString = filters ? '?' + new URLSearchParams(filters).toString() : '';
    return this.request<any[]>(`/billing/purchases/expenses${queryString}`);
  }

  async getExpense(id: string) {
    return this.request<any>(`/billing/purchases/expenses/${id}`);
  }

  async createExpense(data: any) {
    return this.request<any>('/billing/purchases/expenses', { method: 'POST', body: JSON.stringify(data) });
  }

  async updateExpense(id: string, data: any) {
    return this.request<any>(`/billing/purchases/expenses/${id}`, { method: 'PATCH', body: JSON.stringify(data) });
  }

  async deleteExpense(id: string) {
    return this.request<void>(`/billing/purchases/expenses/${id}`, { method: 'DELETE' });
  }

  // ==========================================
  // 📊 DASHBOARD
  // ==========================================

  async getDashboardSummary() {
    return this.request<any>('/dashboard/summary');
  }

  // ==========================================
  // 📁 PROJETS
  // ==========================================

  async getProjects() {
    return this.request<any[]>('/projects');
  }

  async getProject(id: string) {
    return this.request<any>(`/projects/${id}`);
  }

  async createProject(data: any) {
    return this.request<any>('/projects', { method: 'POST', body: JSON.stringify(data) });
  }

  async updateProject(id: string, data: any) {
    return this.request<any>(`/projects/${id}`, { method: 'PATCH', body: JSON.stringify(data) });
  }

  async deleteProject(id: string) {
    return this.request<void>(`/projects/${id}`, { method: 'DELETE' });
  }

  // ==========================================
  // 📁 GED (Gestion Électronique des Documents)
  // ==========================================

  async getGEDFolders() {
    return this.request<any[]>('/ged/folders/tree');
  }

  async getGEDFolderTree() {
    return this.request<any[]>('/ged/folders/tree');
  }

  async createGEDFolder(data: any) {
    return this.request<any>('/ged/folders', { method: 'POST', body: JSON.stringify(data) });
  }

  async updateGEDFolder(id: string, data: any) {
    return this.request<any>(`/ged/folders/${id}`, { method: 'PATCH', body: JSON.stringify(data) });
  }

  async deleteGEDFolder(id: string, force: boolean = false) {
    return this.request<void>(`/ged/folders/${id}?force=${force}`, { method: 'DELETE' });
  }

  async moveGEDFolder(id: string, newParentId: string | null) {
    return this.request<any>(`/ged/folders/${id}/move`, { method: 'PUT', body: JSON.stringify({ newParentId }) });
  }

  async initializeGEDStructure() {
    return this.request<any>('/ged/initialize', { method: 'POST', body: JSON.stringify({}) });
  }

  async getGEDDocuments(folderId?: string) {
    const query = folderId ? `?folderId=${folderId}` : '';
    return this.request<any[]>(`/ged/documents${query}`);
  }

  async uploadGEDDocument(file: File, folderId?: string, documentType?: string) {
    const formData = new FormData();
    formData.append('file', file);
    const query = folderId ? `?folderId=${folderId}` : '';
    if (documentType) formData.append('documentType', documentType);
    return this.request<any>(`/ged/documents/upload${query}`, { method: 'POST', body: formData });
  }

  async moveGEDDocument(id: string, newFolderId: string | null) {
    return this.request<any>(`/ged/documents/${id}/move`, { method: 'PUT', body: JSON.stringify({ newFolderId }) });
  }

  async deleteGEDDocument(id: string) {
    return this.request<void>(`/ged/documents/${id}`, { method: 'DELETE' });
  }

  async getGEDClassificationRules() {
    return this.request<any[]>('/ged/classification-rules');
  }

  async createGEDClassificationRule(data: any) {
    return this.request<any>('/ged/classification-rules', { method: 'POST', body: JSON.stringify(data) });
  }

  async deleteGEDClassificationRule(id: string) {
    return this.request<void>(`/ged/classification-rules/${id}`, { method: 'DELETE' });
  }
// ==========================================
// 🔐 ROLES & PERMISSIONS
// ==========================================

async getRoles() {
  return this.request<any[]>('/roles');
}

async createRole(data: any) {
  return this.request<any>('/roles', { method: 'POST', body: JSON.stringify(data) });
}

async updateRole(id: string, data: any) {
  return this.request<any>(`/roles/${id}`, { method: 'PATCH', body: JSON.stringify(data) });
}

async deleteRole(id: string) {
  return this.request<void>(`/roles/${id}`, { method: 'DELETE' });
}
  // ==========================================
  // 📎 ATTACHMENTS
  // ==========================================

  async getAttachments(entityType: 'invoice' | 'purchase_invoice' | 'credit_note', entityId: string) {
    return this.request<{ success: boolean; data: any[] }>(`/attachments/${entityType}/${entityId}`);
  }

  async uploadAttachment(entityType: 'invoice' | 'purchase_invoice' | 'credit_note' | 'tenant_logo', entityId: string, file: File) {
    const formData = new FormData();
    formData.append('file', file);
    return this.request<{ success: boolean; data: any }>(`/attachments/upload?entityType=${entityType}&entityId=${entityId}`, { method: 'POST', body: formData });
  }

  async uploadLogo(tenantId: string, file: File): Promise<{ success: boolean; data: { id: string } }> {
    return this.uploadAttachment('tenant_logo', tenantId, file);
  }

  async deleteAttachment(id: string) {
    return this.request<{ success: boolean; message: string }>(`/attachments/${id}`, { method: 'DELETE' });
  }

  getAttachmentDownloadUrl(id: string): string {
    return `/api/attachments/download/${id}`;
  }

  // ==========================================
  // 📧 ENVELOPES (Electronic Signature)
  // ==========================================

  async getEnvelopes(filters?: { status?: string }) {
    const queryString = filters ? '?' + new URLSearchParams(filters as any).toString() : '';
    return this.request<any[]>(`/envelopes${queryString}`);
  }

  async getEnvelope(id: string) {
    return this.request<any>(`/envelopes/${id}`);
  }

  async createEnvelope(data: any) {
    return this.request<any>('/envelopes', { method: 'POST', body: JSON.stringify(data) });
  }

  async updateEnvelope(id: string, data: any) {
    return this.request<any>(`/envelopes/${id}`, { method: 'PUT', body: JSON.stringify(data) });
  }

  async sendEnvelope(id: string) {
    return this.request<any>(`/envelopes/${id}/send`, { method: 'POST' });
  }

  async addFieldsToEnvelope(id: string, fields: any[]) {
    return this.request<any>(`/envelopes/${id}/fields`, { method: 'POST', body: JSON.stringify(fields) });
  }

  async deleteEnvelope(id: string) {
    return this.request<void>(`/envelopes/${id}`, { method: 'DELETE' });
  }

  async signEnvelope(id: string, data: any, email: string) {
    return this.request<any>(`/envelopes/${id}/sign?email=${encodeURIComponent(email)}`, { method: 'POST', body: JSON.stringify(data) });
  }

  async refuseEnvelope(id: string, data: any, email: string) {
    return this.request<any>(`/envelopes/${id}/refuse?email=${encodeURIComponent(email)}`, { method: 'POST', body: JSON.stringify(data) });
  }

  async downloadEnvelope(id: string): Promise<void> {
    const token = localStorage.getItem('token');
    const res = await fetch('http://localhost:3001/api/envelopes/' + id + '/download', { headers: { Authorization: 'Bearer ' + token } });
    const blob = await res.blob();
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url; a.download = 'document-' + id + '.pdf'; a.click();
    window.URL.revokeObjectURL(url);
  }
  async downloadCertificate(id: string): Promise<void> {
    const token = localStorage.getItem('token');
    const res = await fetch('http://localhost:3001/api/envelopes/' + id + '/download-certificate', { headers: { Authorization: 'Bearer ' + token } });
    const blob = await res.blob();
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url; a.download = 'certificate-' + id + '.pdf'; a.click();
    window.URL.revokeObjectURL(url);
  }
  getEnvelopeDownloadUrl(id: string): string {
    return `/api/envelopes/${id}/download`;
  }

  getEnvelopeCertificateUrl(id: string): string {
    return `/api/envelopes/${id}/download-certificate`;
  }

  // ==========================================
  // 📄 PLATFORM INVOICES
  // ==========================================

  async getMyInvoices() {
    return this.request<any[]>('/platform/invoices/my-invoices');
  }

  async getPlatformInvoice(id: string) {
    return this.request<any>(`/platform/invoices/${id}`);
  }

  async downloadPlatformInvoice(id: string): Promise<Blob> {
    const response = await fetch(`${API_URL}/platform/invoices/${id}/download`, {
      headers: { ...(this.token ? { Authorization: `Bearer ${this.token}` } : {}) },
    });
    if (!response.ok) throw new Error(`Erreur ${response.status}`);
    return response.blob();
  }

  async getAllPlatformInvoices(tenantId?: string) {
    const queryString = tenantId ? `?tenantId=${tenantId}` : '';
    return this.request<any[]>(`/platform/invoices${queryString}`);
  }

  // ==========================================
  // 📅 PROJECT ASSIGNMENTS
  // ==========================================

  async createProjectAssignment(data: any) {
    return this.request<any>('/projects/assignments', { method: 'POST', body: JSON.stringify(data) });
  }

  async getMyAssignments() {
    return this.request<any[]>('/projects/assignments/my-assignments');
  }

  async getProjectAssignments(projectId: string) {
    return this.request<any[]>(`/projects/assignments/project/${projectId}`);
  }

  async updateProjectAssignment(id: string, data: any) {
    return this.request<any>(`/projects/assignments/${id}`, { method: 'PATCH', body: JSON.stringify(data) });
  }

  async endProjectAssignment(id: string) {
    return this.request<any>(`/projects/assignments/${id}`, { method: 'DELETE' });
  }

  // ==========================================
  // 📊 CRA MONTHLY
  // ==========================================

  async getCurrentCRA(year?: number, month?: number) {
    const params = new URLSearchParams();
    if (year) params.append('year', year.toString());
    if (month) params.append('month', month.toString());
    const qs = params.toString();
    return this.request<any>(`/cra/monthly/current${qs ? `?${qs}` : ''}`);
  }

  async getMyCRAs() {
    return this.request<any[]>('/cra/monthly/my-cras');
  }

  async updateCRAEntry(craId: string, data: any) {
    return this.request<any>(`/cra/monthly/${craId}/entry`, { method: 'PATCH', body: JSON.stringify(data) });
  }

  async submitCRA(craId: string) {
    return this.request<any>(`/cra/monthly/${craId}/submit`, { method: 'POST' });
  }

  async getPendingCRAs() {
    return this.request<any[]>('/cra/monthly/pending-validation');
  }

  async validateCRA(craId: string) {
    return this.request<any>(`/cra/monthly/${craId}/validate`, { method: 'POST' });
  }

  async rejectCRA(craId: string, reason: string) {
    return this.request<any>(`/cra/monthly/${craId}/reject`, { method: 'POST', body: JSON.stringify({ reason }) });
  }

  // ==========================================
  // 👥 EMPLOYEES (RH)
  // ==========================================

  async getEmployees() {
    return this.request<any[]>('/employees');
  }

  async getEmployee(id: string) {
    return this.request<any>(`/employees/${id}`);
  }

  async createEmployee(data: any) {
    return this.request<any>('/employees', { method: 'POST', body: JSON.stringify(data) });
  }

  async updateEmployee(id: string, data: any) {
    return this.request<any>(`/employees/${id}`, { method: 'PATCH', body: JSON.stringify(data) });
  }

  async deleteEmployee(id: string) {
    return this.request<void>(`/employees/${id}`, { method: 'DELETE' });
  }

  async getCVs() {
    return this.request<any[]>('/employees/cvs');
  }

  async uploadCV(file: File) {
    const formData = new FormData();
    formData.append('file', file);
    const token = localStorage.getItem('token');
    const userStr = localStorage.getItem('user');
    let tenantId = '';
    try {
      if (userStr) { const user = JSON.parse(userStr); if (user.tenantId) tenantId = user.tenantId; }
    } catch { }
    const headers: HeadersInit = {
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...(tenantId ? { 'x-tenant-id': tenantId } : {}),
    };
    const response = await fetch(`${API_URL}/employees/upload-cv`, { method: 'POST', body: formData, headers });
    if (!response.ok) {
      const err = await response.json().catch(() => ({ message: response.statusText }));
      throw new Error(err.message || 'Erreur upload CV');
    }
    return response.json();
  }

  // ==========================================
  // 📊 LOGS & MONITORING
  // ==========================================

  async getLogs(filters?: any) {
    const params = new URLSearchParams();
    if (filters) {
      Object.entries(filters).forEach(([k, v]) => { if (v !== undefined) params.append(k, String(v)); });
    }
    const qs = params.toString();
    return this.request<{ logs: any[]; total: number }>(`/logs${qs ? `?${qs}` : ''}`);
  }

  async getLogStats(timeRange: '24h' | '7d' | '30d' = '24h') {
    return this.request<any>(`/logs/stats?timeRange=${timeRange}`);
  }

  async getLog(id: string) {
    return this.request<any>(`/logs/${id}`);
  }

  async resolveLog(id: string, notes: string) {
    return this.request<any>(`/logs/${id}/resolve`, { method: 'PATCH', body: JSON.stringify({ notes }) });
  }

  // ==========================================
  // 💰 PAYROLL SETTINGS
  // ==========================================

  async getPayrollSettings() {
    return this.request<any>('/payroll-settings/settings');
  }

  async updatePayrollSettings(data: any) {
    return this.request<any>('/payroll-settings/settings', { method: 'PATCH', body: JSON.stringify(data) });
  }

  async getSocialOrgs() {
    return this.request<any[]>('/payroll-settings/social-orgs');
  }

  async createSocialOrg(data: any) {
    return this.request<any>('/payroll-settings/social-orgs', { method: 'POST', body: JSON.stringify(data) });
  }

  async deleteSocialOrg(id: string) {
    return this.request<void>(`/payroll-settings/social-orgs/${id}`, { method: 'DELETE' });
  }

  async downloadTestDSN(month?: string, year?: string): Promise<Blob> {
    const token = localStorage.getItem('token');
    const userStr = localStorage.getItem('user');
    let tenantId = '';
    try {
      if (userStr) {
        const user = JSON.parse(userStr);
        if (user.role !== 'PLATFORM_ADMIN' && user.tenantId) tenantId = user.tenantId;
      }
    } catch (e) { }
    const params = new URLSearchParams();
    if (month) params.append('month', month);
    if (year) params.append('year', year);
    const qs = params.toString();
    const endpoint = `/payroll-settings/download-dsn-test${qs ? `?${qs}` : ''}`;
    const headers: HeadersInit = {
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...(tenantId ? { 'x-tenant-id': tenantId } : {}),
    };
    const response = await fetch(`${API_URL}${endpoint}`, { method: 'GET', headers });
    if (!response.ok) throw new Error(`Erreur ${response.status}`);
    return response.blob();
  }

  // ==========================================
  // 🏦 BANKING
  // ==========================================

  async generateBankConnectUrl(institutionId: string, provider: 'GOCARDLESS' | 'BRIDGE') {
    return this.request<{ url: string; state: string }>(`/banking/connect-url?institutionId=${institutionId}&provider=${provider}`);
  }

  async exchangeBankCode(code: string, state: string) {
    return this.request<any>('/banking/callback', { method: 'POST', body: JSON.stringify({ code, state }) });
  }

  async syncBankTransactions(connectionId: string) {
    return this.request<any[]>(`/banking/connections/${connectionId}/sync`);
  }

  async getBankAccounts() {
    return this.request<any[]>('/banking/accounts');
  }

  async getBankTransactions(bankAccountId?: string, status?: string) {
    const params = new URLSearchParams();
    if (bankAccountId) params.set('bankAccountId', bankAccountId);
    if (status) params.set('status', status);
    return this.request<any[]>(`/banking/transactions?${params.toString()}`);
  }

  async createBankTransactions(bankAccountId: string, transactions: any[]) {
    return this.request<any>('/banking/transactions', { method: 'POST', body: JSON.stringify({ bankAccountId, transactions }) });
  }

  async getReconciliationOpenItems() {
    return this.request<any>('/reconciliation/open-items');
  }

  async reconciliationMatch(bankTransactionId: string, targetId: string, targetType: 'INVOICE' | 'EXPENSE' | 'PAYROLL') {
    return this.request<any>('/reconciliation/match', { method: 'POST', body: JSON.stringify({ bankTransactionId, targetId, targetType }) });
  }

  async getBankConnections() {
    return this.request<any[]>('/banking/connections');
  }

  async getBankingInstitutions(country: string = 'FR') {
    return this.request<any[]>(`/banking/institutions?country=${country}`);
  }

  async getBankingConfig() {
    return this.request<any>('/banking/config');
  }

  async updateBankingConfig(data: any) {
    return this.request<any>('/banking/config', { method: 'PUT', body: JSON.stringify(data) });
  }

  async analyzeBankFile(file: File) {
    const formData = new FormData();
    formData.append('file', file);
    const token = localStorage.getItem('token');
    const userStr = localStorage.getItem('user');
    let tenantId = '';
    try {
      if (userStr) {
        const user = JSON.parse(userStr);
        if (user.role !== 'PLATFORM_ADMIN' && user.tenantId) tenantId = user.tenantId;
      }
    } catch (e) { }
    const headers: HeadersInit = {
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...(tenantId ? { 'x-tenant-id': tenantId } : {}),
    };
    const response = await fetch(`${API_URL}/banking/import/analyze`, { method: 'POST', body: formData, headers });
    if (!response.ok) throw new Error(`Erreur ${response.status}`);
    return response.json();
  }

  async getBankImportTemplates() {
    return this.request<any[]>('/banking/import/templates');
  }

  async deleteBankImportTemplate(templateId: string) {
    return this.request<any>(`/banking/import/templates/${templateId}`, { method: 'DELETE' });
  }

  async learnBankFormat(data: any) {
    return this.request<any>('/banking/import/learn', { method: 'POST', body: JSON.stringify(data) });
  }

  // ==========================================
  // 📄 DOCUMENT PARSER
  // ==========================================

  async parseDocument(file: File, type: 'BANK' | 'INVOICE' | 'CV') {
    const formData = new FormData();
    formData.append('file', file);
    const token = localStorage.getItem('token');
    const userStr = localStorage.getItem('user');
    let tenantId = '';
    try {
      if (userStr) {
        const user = JSON.parse(userStr);
        if (user.role !== 'PLATFORM_ADMIN' && user.tenantId) tenantId = user.tenantId;
      }
    } catch (e) { }
    const headers: HeadersInit = {
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...(tenantId ? { 'x-tenant-id': tenantId } : {}),
    };
    const response = await fetch(`${API_URL}/document-parser/analyze?type=${type}`, { method: 'POST', body: formData, headers });
    if (!response.ok) throw new Error(`Erreur ${response.status}`);
    return response.json();
  }

  async learnDocumentFormat(data: any) {
    return this.request<any>('/document-parser/learn', { method: 'POST', body: JSON.stringify(data) });
  }

  async getParsingTemplates(type?: 'BANK' | 'INVOICE' | 'CV') {
    const query = type ? `?type=${type}` : '';
    return this.request<any[]>(`/document-parser/templates${query}`);
  }

  async deleteParsingTemplate(templateId: string) {
    return this.request<any>(`/document-parser/templates/${templateId}`, { method: 'DELETE' });
  }
// ==========================================
// 🏖️ ABSENCES
// ==========================================

async getAbsences() {
  return this.request<any[]>('/absences');
}

async createAbsence(data: any) {
  return this.request<any>('/absences', { method: 'POST', body: JSON.stringify(data) });
}

async approveAbsence(id: string) {
  return this.request<any>(`/absences/${id}/approve`, { method: 'PATCH' });
}

async rejectAbsence(id: string) {
  return this.request<any>(`/absences/${id}/reject`, { method: 'PATCH' });
}
  // ==========================================
  // 👥 USERS
  // ==========================================

    async getWebhooks() { return this.request('/webhooks'); }
  async createWebhook(data: any) { return this.request('/webhooks', { method: 'POST', body: JSON.stringify(data) }); }
  async updateWebhook(id: string, data: any) { return this.request('/webhooks/' + id, { method: 'PUT', body: JSON.stringify(data) }); }
  async deleteWebhook(id: string) { return this.request('/webhooks/' + id, { method: 'DELETE' }); }
  async getUsers() {
    return this.request<any[]>('/users');
  }
}

export const apiClient = new ApiClientBackend();
export default apiClient;








