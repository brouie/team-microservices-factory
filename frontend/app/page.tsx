"use client";

import { useEffect, useState } from "react";

import {
  createAccess,
  createToken,
  deployService,
  fetchServiceEvents,
  fetchServices,
  ServiceEvent,
  ServiceRecord,
  submitIdea
} from "../lib/api";

export default function Home() {
  const [idea, setIdea] = useState("");
  const [services, setServices] = useState<ServiceRecord[]>([]);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [accessInfo, setAccessInfo] = useState<string | null>(null);
  const [eventsByService, setEventsByService] = useState<
    Record<string, ServiceEvent[]>
  >({});

  const loadServices = async () => {
    const data = await fetchServices();
    setServices(data);
  };

  useEffect(() => {
    loadServices().catch((error) => setMessage(error.message));
  }, []);

  const handleRefresh = async () => {
    setLoading(true);
    setMessage("");
    try {
      await loadServices();
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

  return (
    <div className="grid">
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
