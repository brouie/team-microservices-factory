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
        `API: ${access.api_base_url}\nToken: ${access.token_address}\nKey: ${access.api_key}`
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
      dateStyle: "short",
      timeStyle: "short"
    });

  const truncateId = (id: string) => `${id.slice(0, 8)}...`;

  const isValidWallet = walletAddress.startsWith("0x") && walletAddress.length === 42;

  return (
    <div className="grid">
      {apiStatus && !apiStatus.connected && (
        <section className="panel api-status-banner">
          <p className="error">Backend unavailable</p>
          <p className="muted">Cannot reach {apiStatus.url}</p>
          <button type="button" onClick={() => checkApi()}>
            Retry
          </button>
        </section>
      )}

      {apiStatus?.connected && (
        <section className="panel api-status-connected">
          <p className="success">Connected to API</p>
        </section>
      )}

      <section className="panel">
        <h2>Wallet</h2>
        <label htmlFor="wallet">Ethereum Address</label>
        <input
          id="wallet"
          type="text"
          value={walletAddress}
          onChange={(event) => setWalletAddress(event.target.value)}
          placeholder="0x..."
          className={isValidWallet ? "valid" : ""}
        />
        {walletAddress && !isValidWallet && (
          <p className="muted error">Invalid address format</p>
        )}
        {isValidWallet && (
          <p className="muted success">Connected</p>
        )}
      </section>

      <section className="panel">
        <h2>New Service</h2>
        <label htmlFor="idea">Describe your microservice</label>
        <textarea
          id="idea"
          rows={4}
          value={idea}
          onChange={(event) => setIdea(event.target.value)}
          placeholder="A service that summarizes meeting notes..."
        />
        <button
          type="button"
          disabled={!idea.trim() || loading}
          onClick={handleSubmit}
        >
          {loading ? "Submitting..." : "Submit Idea"}
        </button>
        {message && <p className="muted error">{message}</p>}
      </section>

      {stats && (
        <section className="panel stats-panel">
          <h2>Platform Stats</h2>
          <div className="stats-grid">
            <div className="stat-item">
              <span className="stat-value">{stats.total_services}</span>
              <span className="stat-label">Total</span>
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

      <section className="panel" style={{ gridColumn: "span 2" }}>
        <h2>Services</h2>
        <button
          type="button"
          disabled={loading}
          onClick={handleRefresh}
          style={{ marginBottom: "var(--space-md)" }}
        >
          {loading ? "Loading..." : "Refresh"}
        </button>

        {accessInfo && <pre className="code-block">{accessInfo}</pre>}

        {services.length === 0 ? (
          <p className="muted">No services yet. Submit an idea to get started.</p>
        ) : (
          services.map((service) => {
            const hasToken = Boolean(service.token_address);
            const hasApi = Boolean(service.api_base_url);
            const events = eventsByService[service.id];

            return (
              <div className="service-card" key={service.id}>
                <p>{service.idea}</p>
                <p className="muted">
                  ID: {truncateId(service.id)} | Status: <strong>{service.status}</strong>
                </p>
                <p className="muted">
                  Created: {formatDate(service.created_at)} | Updated: {formatDate(service.updated_at)}
                </p>
                {service.token_address && (
                  <p className="muted">Token: {truncateId(service.token_address)}</p>
                )}
                {service.api_base_url && (
                  <p className="muted">API: {service.api_base_url}</p>
                )}

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
                    Events
                  </button>
                </div>

                {events && events.length > 0 && (
                  <ul className="event-list">
                    {events.slice(0, 5).map((event, index) => (
                      <li key={`${event.created_at}-${index}`}>
                        <span className="muted">
                          {formatDate(event.created_at)} - {event.status}
                        </span>
                        {event.message && <span>: {event.message}</span>}
                      </li>
                    ))}
                    {events.length > 5 && (
                      <li className="muted">+ {events.length - 5} more events</li>
                    )}
                  </ul>
                )}
              </div>
            );
          })
        )}
      </section>
    </div>
  );
}
