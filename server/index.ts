import express, { type Request, Response, NextFunction } from "express";
import { registerRoutes } from "./routes";
import { setupVite, serveStatic, log } from "./vite";
import { courtReminderService } from "./courtReminderService";

const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

app.use((req, res, next) => {
  const start = Date.now();
  const path = req.path;
  let capturedJsonResponse: Record<string, any> | undefined = undefined;

  const originalResJson = res.json;
  res.json = function (bodyJson, ...args) {
    capturedJsonResponse = bodyJson;
    return originalResJson.apply(res, [bodyJson, ...args]);
  };

  res.on("finish", () => {
    const duration = Date.now() - start;
    if (path.startsWith("/api")) {
      let logLine = `${req.method} ${path} ${res.statusCode} in ${duration}ms`;
      if (capturedJsonResponse) {
        logLine += ` :: ${JSON.stringify(capturedJsonResponse)}`;
      }

      if (logLine.length > 80) {
        logLine = logLine.slice(0, 79) + "…";
      }

      log(logLine);
    }
  });

  next();
});

(async () => {
  const server = await registerRoutes(app);

  app.use((err: any, _req: Request, res: Response, _next: NextFunction) => {
    const status = err.status || err.statusCode || 500;
    const message = err.message || "Internal Server Error";

    res.status(status).json({ message });
    throw err;
  });

  // importantly only setup vite in development and after
  // setting up all the other routes so the catch-all route
  // doesn't interfere with the other routes
  if (app.get("env") === "development") {
    await setupVite(app, server);
  } else {
    serveStatic(app);
  }

  // ALWAYS serve the app on port 5000
  // this serves both the API and the client.
  // It is the only port that is not firewalled.
  const port = 5000;
  server.listen({
    port,
    host: "0.0.0.0",
    reusePort: true,
  }, () => {
    log(`serving on port ${port}`);

    // Start automated court reminder processing
    console.log('Starting automated court reminder scheduler...');
    courtReminderService.startReminderScheduler();

    // Set up automated arrest log cleanup (runs every 6 hours)
    console.log('Starting automated arrest log cleanup scheduler...');
    setInterval(async () => {
      try {
        const { arrestLogScraper } = await import('./services/arrestLogScraper');
        await arrestLogScraper.getPersistedRecords(); // This triggers cleanup
        console.log('Automated arrest log cleanup completed');
      } catch (error) {
        console.error('Error in automated arrest log cleanup:', error);
      }
    }, 6 * 60 * 60 * 1000); // 6 hours

    // Process reminders every 30 minutes
    setInterval(async () => {
      try {
        await courtReminderService.processPendingReminders();
      } catch (error) {
        console.error('Error processing court reminders:', error);
      }
    }, 30 * 60 * 1000); // 30 minutes

    // Initial run after 10 seconds
    setTimeout(async () => {
      try {
        log('Running initial court reminder check...');
        await courtReminderService.processPendingReminders();
      } catch (error) {
        console.error('Error in initial reminder processing:', error);
      }
    }, 10000);
  });
})();