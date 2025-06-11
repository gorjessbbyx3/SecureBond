import { Express } from 'express';
import { requireAuth, requireRole, type AuthenticatedRequest } from '../middleware/auth';
import { storage } from '../storage';

export function registerDashboardRoutes(app: Express) {
  // Dashboard statistics endpoint
  app.get('/api/dashboard/stats', requireAuth, requireRole('admin'), async (req: AuthenticatedRequest, res) => {
    try {
      const [clients, bonds, payments, checkIns, alerts, courtDates] = await Promise.all([
        storage.getAllClients(),
        storage.getAllBonds(),
        storage.getAllPayments(),
        storage.getAllCheckIns(),
        storage.getAllUnacknowledgedAlerts(),
        storage.getAllCourtDates()
      ]);

      // Calculate statistics
      const activeClients = clients.filter(c => c.isActive).length;
      const activeBonds = bonds.filter(b => b.status === 'active').length;
      const totalRevenue = payments
        .filter(p => p.confirmed)
        .reduce((sum, p) => sum + parseFloat(p.amount || '0'), 0);
      const pendingPayments = payments
        .filter(p => !p.confirmed)
        .reduce((sum, p) => sum + parseFloat(p.amount || '0'), 0);

      // Court dates in next 7 days
      const nextWeek = new Date();
      nextWeek.setDate(nextWeek.getDate() + 7);
      const upcomingCourtDates = courtDates.filter(cd => 
        cd.courtDate && new Date(cd.courtDate) <= nextWeek
      ).length;

      // Overdue check-ins (more than 7 days)
      const oneWeekAgo = new Date();
      oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);
      const overdueCheckIns = clients.filter(c => 
        !c.lastCheckIn || new Date(c.lastCheckIn) < oneWeekAgo
      ).length;

      const stats = {
        totalClients: clients.length,
        activeClients,
        totalBonds: bonds.length,
        activeBonds,
        totalRevenue: Math.round(totalRevenue),
        pendingPayments: Math.round(pendingPayments),
        upcomingCourtDates,
        overdueCheckIns,
        recentAlerts: alerts.length
      };

      res.json(stats);
    } catch (error) {
      console.error('Error fetching dashboard stats:', error);
      res.status(500).json({ message: 'Failed to fetch dashboard statistics' });
    }
  });

  // Recent activity endpoint
  app.get('/api/dashboard/recent-activity', requireAuth, requireRole('admin'), async (req: AuthenticatedRequest, res) => {
    try {
      const [recentPayments, recentCheckIns, recentAlerts] = await Promise.all([
        storage.getAllPayments(),
        storage.getAllCheckIns(),
        storage.getAllUnacknowledgedAlerts()
      ]);

      const activities: any[] = [];

      // Recent payments
      recentPayments
        .sort((a, b) => new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime())
        .slice(0, 5)
        .forEach(payment => {
          activities.push({
            type: payment.confirmed ? 'success' : 'warning',
            message: `Payment of $${payment.amount} ${payment.confirmed ? 'confirmed' : 'pending'}`,
            timestamp: payment.createdAt
          });
        });

      // Recent check-ins
      recentCheckIns
        .sort((a, b) => new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime())
        .slice(0, 3)
        .forEach(checkIn => {
          activities.push({
            type: 'info',
            message: `Client check-in at ${checkIn.location || 'unknown location'}`,
            timestamp: checkIn.createdAt
          });
        });

      // Recent alerts
      recentAlerts.slice(0, 2).forEach(alert => {
        activities.push({
          type: 'error',
          message: alert.message || 'System alert',
          timestamp: alert.createdAt
        });
      });

      // Sort all activities by timestamp
      activities.sort((a, b) => new Date(b.timestamp || 0).getTime() - new Date(a.timestamp || 0).getTime());

      res.json(activities.slice(0, 10));
    } catch (error) {
      console.error('Error fetching recent activity:', error);
      res.status(500).json({ message: 'Failed to fetch recent activity' });
    }
  });
}