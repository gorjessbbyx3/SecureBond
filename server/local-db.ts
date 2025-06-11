import * as fs from 'fs/promises';
import * as path from 'path';
import { 
  CompanyConfiguration, 
  InsertCompanyConfiguration,
  StateConfiguration,
  InsertStateConfiguration,
  StatePricing,
  InsertStatePricing,
  BusinessRule,
  InsertBusinessRule,
  Notification,
  InsertNotification
} from '@shared/schema';

export class LocalFileStorage {
  private dataDir = './temp-data';
  private nextId = 1;
  private index: any = {};

  constructor() {
    this.ensureDirectoryExists();
    this.loadIndex();
  }

  private async ensureDirectoryExists() {
    try {
      await fs.access(this.dataDir);
    } catch {
      await fs.mkdir(this.dataDir, { recursive: true });
      await fs.mkdir(path.join(this.dataDir, 'notifications'), { recursive: true });
      await fs.mkdir(path.join(this.dataDir, 'backups'), { recursive: true });
    }
  }

  private async loadIndex() {
    try {
      const indexData = await fs.readFile(path.join(this.dataDir, 'index.json'), 'utf-8');
      this.index = JSON.parse(indexData);
      this.nextId = this.index.nextId || 1;
    } catch {
      this.index = { nextId: 1 };
      await this.saveIndex();
    }
  }

  private async saveIndex() {
    this.index.nextId = this.nextId;
    await fs.writeFile(path.join(this.dataDir, 'index.json'), JSON.stringify(this.index, null, 2));
  }

  private getNextId(): number {
    return this.nextId++;
  }

  private async readJsonFile<T>(filename: string, defaultValue: T[] = []): Promise<T[]> {
    try {
      const filePath = path.isAbsolute(filename) ? filename : path.join(this.dataDir, filename);
      const data = await fs.readFile(filePath, 'utf-8');
      return JSON.parse(data) as T[];
    } catch {
      return defaultValue;
    }
  }

  private async writeJsonFile<T>(filename: string, data: T[]): Promise<void> {
    const filePath = path.isAbsolute(filename) ? filename : path.join(this.dataDir, filename);
    await fs.writeFile(filePath, JSON.stringify(data, null, 2));
  }

  // Arrest monitoring operations - only authentic data sources
  async getArrestRecords(): Promise<any[]> {
    return await this.readJsonFile(path.join(this.dataDir, 'arrest-records.json'), []);
  }

  async getMonitoringConfig(): Promise<any[]> {
    const hawaiiCounties = [
      { id: 'honolulu', name: 'Honolulu County', agency: 'Honolulu Police Department' },
      { id: 'hawaii', name: 'Hawaii County', agency: 'Hawaii Police Department' },
      { id: 'maui', name: 'Maui County', agency: 'Maui Police Department' },
      { id: 'kauai', name: 'Kauai County', agency: 'Kauai Police Department' }
    ];

    return hawaiiCounties.map(county => ({
      id: `config-${county.id}`,
      county: county.id,
      agency: county.agency,
      isEnabled: true,
      lastChecked: new Date().toISOString(),
      checkInterval: 30,
      apiEndpoint: `https://api.${county.id}pd.gov/arrest-logs`,
      status: 'requires_configuration'
    }));
  }

  async scanArrestLogs(): Promise<any> {
    return {
      success: false,
      newRecords: 0,
      lastScanned: new Date().toISOString(),
      sourcesChecked: [],
      message: 'Real police department API integration required'
    };
  }

  async acknowledgeArrestRecord(recordId: string): Promise<any> {
    const arrestRecords = await this.readJsonFile(path.join(this.dataDir, 'arrest-records.json'), []);
    const record = arrestRecords.find((r: any) => r.id === recordId);
    
    if (!record) {
      throw new Error('Arrest record not found');
    }
    
    return {
      id: recordId,
      status: 'processed',
      acknowledgedAt: new Date().toISOString(),
      acknowledgedBy: 'admin'
    };
  }

  async getPublicArrestLogs(): Promise<any[]> {
    // Return only authentic arrest logs from configured data sources
    // No mock data - system requires real police department integration
    return await this.readJsonFile(path.join(this.dataDir, 'public-arrest-logs.json'), []);
  }

  // Notification operations
  async createNotification(notificationData: InsertNotification): Promise<Notification> {
    const notification: Notification = {
      id: this.nextId++,
      userId: notificationData.userId,
      title: notificationData.title,
      message: notificationData.message,
      type: notificationData.type,
      priority: notificationData.priority || "medium",
      read: notificationData.read || false,
      confirmed: notificationData.confirmed || false,
      confirmedAt: notificationData.confirmedAt || null,
      confirmedBy: notificationData.confirmedBy || null,
      actionUrl: notificationData.actionUrl || null,
      metadata: notificationData.metadata || null,
      expiresAt: notificationData.expiresAt || null,
      createdAt: new Date(),
    };

    const notifications = await this.readJsonFile<Notification>(path.join(this.dataDir, 'notifications', 'notifications.json'));
    notifications.push(notification);
    await this.writeJsonFile(path.join(this.dataDir, 'notifications', 'notifications.json'), notifications);
    await this.saveIndex();

    return notification;
  }

  async getUserNotifications(userId: string): Promise<Notification[]> {
    const notifications = await this.readJsonFile<Notification>(path.join(this.dataDir, 'notifications', 'notifications.json'));
    return notifications
      .filter(n => n.userId === userId)
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }

  async getUnreadNotifications(userId: string): Promise<Notification[]> {
    const notifications = await this.getUserNotifications(userId);
    return notifications.filter(n => !n.read);
  }

  async markNotificationAsRead(id: number): Promise<Notification> {
    const notifications = await this.readJsonFile<Notification>(path.join(this.dataDir, 'notifications', 'notifications.json'));
    const notification = notifications.find(n => n.id === id);
    
    if (!notification) {
      throw new Error(`Notification with id ${id} not found`);
    }

    notification.read = true;
    await this.writeJsonFile(path.join(this.dataDir, 'notifications', 'notifications.json'), notifications);
    
    return notification;
  }

  async markAllNotificationsAsRead(userId: string): Promise<void> {
    const notifications = await this.readJsonFile<Notification>(path.join(this.dataDir, 'notifications', 'notifications.json'));
    const updated = notifications.map(n => 
      n.userId === userId ? { ...n, read: true } : n
    );
    await this.writeJsonFile(path.join(this.dataDir, 'notifications', 'notifications.json'), updated);
  }

  async confirmNotification(id: number, confirmedBy: string): Promise<Notification> {
    const notifications = await this.readJsonFile<Notification>(path.join(this.dataDir, 'notifications', 'notifications.json'));
    const notification = notifications.find(n => n.id === id);
    
    if (!notification) {
      throw new Error("Notification not found");
    }
    
    notification.confirmed = true;
    notification.confirmedAt = new Date();
    notification.confirmedBy = confirmedBy;
    
    await this.writeJsonFile(path.join(this.dataDir, 'notifications', 'notifications.json'), notifications);
    
    return notification;
  }

  // Company configuration operations
  async createCompanyConfiguration(configData: InsertCompanyConfiguration): Promise<CompanyConfiguration> {
    const config: CompanyConfiguration = {
      id: this.getNextId(),
      ...configData,
      isActive: configData.isActive ?? true,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    const configs = await this.readJsonFile<CompanyConfiguration>('company-configurations.json', []);
    configs.push(config);
    await this.writeJsonFile('company-configurations.json', configs);
    
    return config;
  }

  async getCompanyConfiguration(id: number): Promise<CompanyConfiguration | undefined> {
    const configs = await this.readJsonFile<CompanyConfiguration>('company-configurations.json', []);
    return configs.find(config => config.id === id);
  }

  async updateCompanyConfiguration(id: number, updates: Partial<InsertCompanyConfiguration>): Promise<CompanyConfiguration> {
    const configs = await this.readJsonFile<CompanyConfiguration>('company-configurations.json', []);
    const configIndex = configs.findIndex(config => config.id === id);
    
    if (configIndex === -1) {
      throw new Error('Company configuration not found');
    }

    configs[configIndex] = {
      ...configs[configIndex],
      ...updates,
      updatedAt: new Date(),
    };

    await this.writeJsonFile('company-configurations.json', configs);
    return configs[configIndex];
  }

  async getAllCompanyConfigurations(): Promise<CompanyConfiguration[]> {
    return await this.readJsonFile<CompanyConfiguration>('company-configurations.json', []);
  }

  // State configuration operations
  async createStateConfiguration(configData: InsertStateConfiguration): Promise<StateConfiguration> {
    const config: StateConfiguration = {
      id: this.getNextId(),
      ...configData,
      isActive: configData.isActive ?? true,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    const configs = await this.readJsonFile<StateConfiguration>('state-configurations.json', []);
    configs.push(config);
    await this.writeJsonFile('state-configurations.json', configs);
    
    return config;
  }

  async getStateConfiguration(state: string): Promise<StateConfiguration | undefined> {
    const configs = await this.readJsonFile<StateConfiguration>('state-configurations.json', []);
    return configs.find(config => config.state === state);
  }

  async updateStateConfiguration(id: number, updates: Partial<InsertStateConfiguration>): Promise<StateConfiguration> {
    const configs = await this.readJsonFile<StateConfiguration>('state-configurations.json', []);
    const configIndex = configs.findIndex(config => config.id === id);
    
    if (configIndex === -1) {
      throw new Error('State configuration not found');
    }

    configs[configIndex] = {
      ...configs[configIndex],
      ...updates,
      updatedAt: new Date(),
    };

    await this.writeJsonFile('state-configurations.json', configs);
    return configs[configIndex];
  }

  async getAllStateConfigurations(): Promise<StateConfiguration[]> {
    return await this.readJsonFile<StateConfiguration>('state-configurations.json', []);
  }

  // State pricing operations
  async createStatePricing(pricingData: InsertStatePricing): Promise<StatePricing> {
    const pricing: StatePricing = {
      id: this.getNextId(),
      ...pricingData,
      isActive: pricingData.isActive ?? true,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    const pricings = await this.readJsonFile<StatePricing>('state-pricing.json', []);
    pricings.push(pricing);
    await this.writeJsonFile('state-pricing.json', pricings);
    
    return pricing;
  }

  async getStatePricing(state: string, bondType?: string): Promise<StatePricing[]> {
    const pricings = await this.readJsonFile<StatePricing>('state-pricing.json', []);
    return pricings.filter(pricing => 
      pricing.state === state &&
      (!bondType || pricing.bondType === bondType) &&
      pricing.isActive
    );
  }

  async updateStatePricing(id: number, updates: Partial<InsertStatePricing>): Promise<StatePricing> {
    const pricings = await this.readJsonFile<StatePricing>('state-pricing.json', []);
    const pricingIndex = pricings.findIndex(pricing => pricing.id === id);
    
    if (pricingIndex === -1) {
      throw new Error('State pricing not found');
    }

    pricings[pricingIndex] = {
      ...pricings[pricingIndex],
      ...updates,
      updatedAt: new Date(),
    };

    await this.writeJsonFile('state-pricing.json', pricings);
    return pricings[pricingIndex];
  }

  async deleteStatePricing(id: number): Promise<void> {
    const pricings = await this.readJsonFile<StatePricing>('state-pricing.json', []);
    const filteredPricings = pricings.filter(pricing => pricing.id !== id);
    await this.writeJsonFile('state-pricing.json', filteredPricings);
  }

  // Business rules operations
  async createBusinessRule(ruleData: InsertBusinessRule): Promise<BusinessRule> {
    const rule: BusinessRule = {
      id: this.getNextId(),
      ...ruleData,
      priority: ruleData.priority ?? 0,
      isActive: ruleData.isActive ?? true,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    const rules = await this.readJsonFile<BusinessRule>('business-rules.json', []);
    rules.push(rule);
    await this.writeJsonFile('business-rules.json', rules);
    
    return rule;
  }

  async getBusinessRules(companyId: number, ruleType?: string): Promise<BusinessRule[]> {
    const rules = await this.readJsonFile<BusinessRule>('business-rules.json', []);
    return rules.filter(rule => 
      rule.companyId === companyId &&
      (!ruleType || rule.ruleType === ruleType) &&
      rule.isActive
    ).sort((a, b) => (b.priority || 0) - (a.priority || 0));
  }

  async updateBusinessRule(id: number, updates: Partial<InsertBusinessRule>): Promise<BusinessRule> {
    const rules = await this.readJsonFile<BusinessRule>('business-rules.json', []);
    const ruleIndex = rules.findIndex(rule => rule.id === id);
    
    if (ruleIndex === -1) {
      throw new Error('Business rule not found');
    }

    rules[ruleIndex] = {
      ...rules[ruleIndex],
      ...updates,
      updatedAt: new Date(),
    };

    await this.writeJsonFile('business-rules.json', rules);
    return rules[ruleIndex];
  }

  async deleteBusinessRule(id: number): Promise<void> {
    const rules = await this.readJsonFile<BusinessRule>('business-rules.json', []);
    const filteredRules = rules.filter(rule => rule.id !== id);
    await this.writeJsonFile('business-rules.json', filteredRules);
  }
}

export const storage = new LocalFileStorage();