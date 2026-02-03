"use client";

import { useEffect, useState } from "react";

import {
  checkApiStatus,
  createAccess,
  createToken,
  deployService,
  fetchServiceEvents,
  fetchServices,
  fetchStats,
  ServiceEvent,
  ServiceRecord,
  Stats,
  submitIdea
} from "../lib/api";

export default function Home() {
  const [idea, setIdea] = useState("");
  const [walletAddress, setWalletAddress] = useState("");
  const [services, setServices] = useState<ServiceRecord[]>([]);
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [accessInfo, setAccessInfo] = useState<string | null>(null);
  const [eventsByService, setEventsByService] = useState<
    Record<string, ServiceEvent[]>
  >({});
  const [apiStatus, setApiStatus] = useState<{ connected: boolean; url: string } | null>(null);

  const checkApi = async () => {
    const status = await checkApiStatus();
    setApiStatus(status);
    return status.connected;
  };

  const loadServices = async () => {
    const data = await fetchServices();
    setServices(data);
  };

  const loadStats = async () => {
    const data = await fetchStats();
    setStats(data);
  };

  useEffect(() => {
    checkApi().then((connected) => {
      if (connected) {
        loadServices().catch((error) => setMessage(error.message));
        loadStats().catch(() => {});
      }
    });
  }, []);

  const handleRefresh = async () => {
    setLoading(true);
    setMessage("");
    try {
      await loadServices();
      await loadStats();
    } catch (error) {
      setMessage((error as Error).message);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async () => {
    setLoading(true);
    setMessage("");
    setAccessInfo(null);
    try {
      await submitIdea(idea);
      setIdea("");
      await loadServices();
      await loadStats();
    } catch (error) {
      setMessage((error as Error).message);
    } finally {
      setLoading(false);
    }
  };

  const handleDeploy = async (serviceId: string) => {
    setLoading(true);
    setMessage("");
    setAccessInfo(null);
    try {
      await deployService(serviceId);
      await loadServices();
      await loadStats();
    } catch (error) {
      setMessage((error as Error).message);
    } finally {
      setLoading(false);
    }
  };

  const handleToken = async (serviceId: string) => {
    setLoading(true);
    setMessage("");
    setAccessInfo(null);
    try {
      await createToken(serviceId);
      await loadServices();
      await loadStats();
    } catch (error) {
      setMessage((error as Error).message);
    } finally {
      setLoading(false);
    }
  };

  const handleAccess = async (serviceId: string) => {
    setLoading(true);
    setMessage("");
    try {
      const access = await createAccess(serviceId);
      setAccessInfo(
        `API base: ${access.api_base_url}\nToken: ${access.token_address}\nAPI key: ${access.api_key}`
      );
    } catch (error) {
      setMessage((error as Error).message);
    } finally {
      setLoading(false);
    }
  };

  const handleLoadEvents = async (serviceId: string) => {
    setLoading(true);
    setMessage("");
    try {
      const events = await fetchServiceEvents(serviceId);
      setEventsByService((current) => ({ ...current, [serviceId]: events }));
    } catch (error) {
      setMessage((error as Error).message);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (value: string) =>
    new Date(value).toLocaleString(undefined, {
      dateStyle: "medium",
      timeStyle: "short"
    });

  const isValidWallet = walletAddress.startsWith("0x") && walletAddress.length === 42;

  return (
    <div className="grid">
      {apiStatus && !apiStatus.connected && (
        <section className="panel api-status-banner">
          <p className="error">Backend API unavailable at {apiStatus.url}</p>
          <p className="muted">Deploy the backend or configure NEXT_PUBLIC_API_BASE</p>
          <button type="button" onClick={() => checkApi()}>Retry Connection</button>
        </section>
      )}
      {apiStatus?.connected && (
        <section className="panel api-status-connected">
          <p className="success">Connected to backend API</p>
        </section>
      )}
      <section className="panel">
        <h2>Wallet Connection</h2>
        <label htmlFor="wallet">Your Wallet Address</label>
        <input
          id="wallet"
          type="text"
          value={walletAddress}
          onChange={(event) => setWalletAddress(event.target.value)}
          placeholder="0x..."
          className={isValidWallet ? "valid" : ""}
        />
        {walletAddress && !isValidWallet && (
          <p className="muted error">Enter a valid Ethereum address (0x...)</p>
        )}
        {isValidWallet && (
          <p className="muted success">Wallet connected</p>
        )}
      </section>

      <section className="panel">
        <h2>Submit Idea</h2>
        <label htmlFor="idea">Describe the microservice</label>
        <textarea
          id="idea"
          rows={6}
          value={idea}
          onChange={(event) => setIdea(event.target.value)}
          placeholder="Example: Summarize meeting notes and return action items."
        />
        <button
          type="button"
          disabled={!idea.trim() || loading}
          onClick={handleSubmit}
        >
          Submit
        </button>
        {message ? <p className="muted">{message}</p> : null}
      </section>

      {stats && (
        <section className="panel stats-panel">
          <h2>Platform Stats</h2>
          <div className="stats-grid">
            <div className="stat-item">
              <span className="stat-value">{stats.total_services}</span>
              <span className="stat-label">Total Services</span>
            </div>
            <div className="stat-item">
              <span className="stat-value">{stats.deployed_count}</span>
              <span className="stat-label">Deployed</span>
            </div>
            <div className="stat-item">
              <span className="stat-value">{stats.tokenized_count}</span>
              <span className="stat-label">Tokenized</span>
            </div>
            <div className="stat-item">
              <span className="stat-value">{stats.status_counts.queued || 0}</span>
              <span className="stat-label">Queued</span>
            </div>
          </div>
        </section>
      )}

      <section className="panel">
        <h2>Services</h2>
        <button type="button" disabled={loading} onClick={handleRefresh}>
          Refresh
        </button>
        {accessInfo ? <pre className="code-block">{accessInfo}</pre> : null}
        {services.length === 0 ? (
          <p className="muted">No services yet.</p>
        ) : (
          services.map((service) => (
            <div className="service-card" key={service.id}>
              {(() => {
                const hasToken = Boolean(service.token_address);
                const hasApi = Boolean(service.api_base_url);
                const events = eventsByService[service.id];
                return (
                  <>
                    <p>{service.idea}</p>
                    <p className="muted">Service ID: {service.id}</p>
                    <p className="muted">
                      Created: {formatDate(service.created_at)}
                    </p>
                    <p className="muted">
                      Updated: {formatDate(service.updated_at)}
                    </p>
                    <p className="muted">Status: {service.status}</p>
                    <p className="muted">
                      Token: {service.token_address ?? "Not created"}
                    </p>
                    <p className="muted">
                      API: {service.api_base_url ?? "Not deployed"}
                    </p>
                    <div className="button-group">
                      <button
                        type="button"
                        disabled={loading}
                        onClick={() => handleDeploy(service.id)}
                      >
                        Deploy
                      </button>
                      <button
                        type="button"
                        disabled={loading || !hasApi}
                        onClick={() => handleToken(service.id)}
                      >
                        Create Token
                      </button>
                      <button
                        type="button"
                        disabled={loading || !hasApi || !hasToken}
                        onClick={() => handleAccess(service.id)}
                      >
                        Get Access
                      </button>
                      <button
                        type="button"
                        disabled={loading}
                        onClick={() => handleLoadEvents(service.id)}
                      >
                        Load Events
                      </button>
                    </div>
                    {events ? (
                      <ul className="event-list">
                        {events.map((event, index) => (
                          <li key={`${event.created_at}-${index}`}>
                            <span className="muted">
                              {formatDate(event.created_at)} — {event.status}
                            </span>
                            {event.message ? `: ${event.message}` : null}
                          </li>
                        ))}
                      </ul>
                    ) : null}
                  </>
                );
              })()}
            </div>
          ))
        )}
      </section>
    </div>
  );
}
